import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Send,
  Calendar,
  Volume2,
  VolumeX,
  RotateCcw,
  Bot,
  User,
  ChevronDown,
  Square,
  Key,
  Check,
} from "lucide-react";
import { initializeVoiceNoiseFilter, NoiseFilterControls } from "./audioNoiseFilter";
import { AiraEngine } from "./airaEngine";

const ACTIVATION_DELAY_MS = 1_500;
const INACTIVITY_TIMEOUT_MS = 30_000;
const CHANNEL_NAME = "converseai-voice-assistant";
const SESSION_MSG_KEY = "aira_session_messages";
const SESSION_OPEN_KEY = "aira_session_open";
const GEMINI_KEY_STORAGE = "aira_gemini_api_key";
const POST_SPEECH_COOLDOWN_MS = 600;

type Phase = "idle" | "greeting" | "listening" | "answering" | "paused";

interface ChatMessage {
  id: string;
  sender: "user" | "aira";
  text: string;
  timestamp: string;
}

function useSingleTabLock() {
  const [allowed, setAllowed] = useState(true);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const idRef = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, id } = event.data ?? {};
      if (id === idRef.current) return;
      if (type === "active") setAllowed(false);
      if (type === "released") setAllowed(true);
    };

    return () => {
      channel.postMessage({ type: "released", id: idRef.current });
      channel.close();
    };
  }, []);

  const announceActive = useCallback(() => {
    channelRef.current?.postMessage({ type: "active", id: idRef.current });
  }, []);

  const announceReleased = useCallback(() => {
    channelRef.current?.postMessage({ type: "released", id: idRef.current });
  }, []);

  return { allowed, announceActive, announceReleased };
}

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { allowed, announceActive, announceReleased } = useSingleTabLock();

  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interimText, setInterimText] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const airaEngineRef = useRef<AiraEngine>(new AiraEngine());
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const noiseFilterRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRestartTimerRef = useRef<NodeJS.Timeout | null>(null);
  // ── Backend Voice Server (PCM streaming + CosyVoice2 audio) ──
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const backendAudioRef = useRef<HTMLAudioElement | null>(null);
  const [backendSpeaking, setBackendSpeaking] = useState(false);

  const phaseRef = useRef<Phase>("idle");
  const openRef = useRef(false);
  const isMutedRef = useRef(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    openRef.current = open;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_OPEN_KEY, open ? "true" : "false");
    }
  }, [open]);

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (isMuted && typeof window !== "undefined") {
      utteranceRef.current = null;
      window.speechSynthesis?.cancel();
    }
  }, [isMuted]);

  // Load voices asynchronously for Web Speech API
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setAvailableVoices(v);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Load saved Gemini API Key
  useEffect(() => {
    if (typeof window === "undefined") return;
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    const savedKey = sessionStorage.getItem(GEMINI_KEY_STORAGE);
    if (savedKey) {
      setGeminiKey(savedKey);
      setKeySaved(true);
    } else if (envKey && envKey !== "your_gemini_api_key_here") {
      setGeminiKey(envKey);
      setKeySaved(true);
    }
  }, []);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey.trim()) return;
    sessionStorage.setItem(GEMINI_KEY_STORAGE, geminiKey.trim());
    setKeySaved(true);
    setShowKeyInput(false);
  };



  // Restore chat from sessionStorage ONLY on soft navigation (Clear history on F5 / Hard Refresh)
  useEffect(() => {
    if (isInitializedRef.current || typeof window === "undefined") return;
    isInitializedRef.current = true;

    try {
      const navEntries = performance.getEntriesByType("navigation");
      const isReload =
        navEntries.length > 0 &&
        (navEntries[0] as PerformanceNavigationTiming).type === "reload";

      if (isReload) {
        sessionStorage.removeItem(SESSION_MSG_KEY);
        sessionStorage.removeItem(SESSION_OPEN_KEY);
      } else {
        const savedMessages = sessionStorage.getItem(SESSION_MSG_KEY);
        const savedOpen = sessionStorage.getItem(SESSION_OPEN_KEY);

          if (savedMessages) {
          const parsed: ChatMessage[] = JSON.parse(savedMessages);
          if (parsed.length > 0) {
            setMessages(parsed);
            if (savedOpen === "true") {
              setOpen(true);
              openRef.current = true;
              announceActive();
              setPhase("listening");
              // Defer startListening to next tick so refs are updated
              setTimeout(() => startListeningRef.current(), 100);
            }
          }
        }
      }
    } catch {
      // ignore
    }

    const timer = setTimeout(() => setVisible(true), ACTIVATION_DELAY_MS);
    return () => clearTimeout(timer);
  }, [announceActive]);

  const wsRef = useRef<WebSocket | null>(null);
  const [useVoiceServer, setUseVoiceServer] = useState(false);

  // Self-Hosted Python Speech-to-Speech WebSocket Pipeline Connection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const voiceServerUrl = (import.meta.env.VITE_VOICE_SERVER_URL as string) || "ws://localhost:8000/ws/voice";
    const httpHealthUrl = voiceServerUrl.replace(/^ws/, "http").replace(/\/ws\/voice$/, "/health");

    let isMounted = true;
    let ws: WebSocket | null = null;

    // Check if voice server is online first to prevent WebSocket browser console connection error
    fetch(httpHealthUrl, { method: "GET", signal: AbortSignal.timeout(500) })
      .then((res) => {
        if (res.ok && isMounted) {
          ws = new WebSocket(voiceServerUrl);
          wsRef.current = ws;

          ws.onopen = () => {
            if (isMounted) setUseVoiceServer(true);
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);

              if (data.type === "final_transcript" && data.transcript) {
                // Show user's transcribed speech in chat
                const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                setMessages((prev) => [
                  ...prev,
                  { id: Math.random().toString(36).slice(2), sender: "user", text: data.transcript, timestamp: t },
                ]);
                setInterimText("");
                setPhase("answering");

              } else if (data.type === "assistant_text" && data.text) {
                // Show Aira's reply in chat (audio_chunk will play the voice)
                const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                setMessages((prev) => [
                  ...prev,
                  { id: Math.random().toString(36).slice(2), sender: "aira", text: data.text, timestamp: t },
                ]);
                if (data.action?.route) navigate(data.action.route);

              } else if (data.type === "audio_chunk" && data.audio) {
                // Play CosyVoice2 (Qwen2.5) / Edge-TTS audio — bypass browser speechSynthesis
                window.speechSynthesis?.cancel();
                if (backendAudioRef.current) {
                  backendAudioRef.current.pause();
                  backendAudioRef.current.src = "";
                }
                const audio = new Audio(`data:${data.mime_type || "audio/wav"};base64,${data.audio}`);
                backendAudioRef.current = audio;
                setBackendSpeaking(true);
                setPhase("answering");
                audio.onended = () => {
                  backendAudioRef.current = null;
                  setBackendSpeaking(false);
                  if (openRef.current && !document.hidden) {
                    setTimeout(() => {
                      if (openRef.current && phaseRef.current !== "paused") {
                        setPhase("listening");
                        startListeningRef.current();
                      }
                    }, POST_SPEECH_COOLDOWN_MS);
                  }
                };
                audio.onerror = () => {
                  backendAudioRef.current = null;
                  setBackendSpeaking(false);
                };
                audio.play().catch(() => {});

              } else if (data.type === "speech_started") {
                setInterimText("🎙️ Listening...");
                setPhase("listening");

              } else if (data.type === "speech_stopped") {
                setInterimText("");
                setPhase("answering");

              } else if (data.type === "barge_in_triggered") {
                // Backend detected user speaking — stop current audio
                window.speechSynthesis?.cancel();
                if (backendAudioRef.current) {
                  backendAudioRef.current.pause();
                  backendAudioRef.current.src = "";
                  backendAudioRef.current = null;
                }
                setBackendSpeaking(false);

              } else if (data.type === "action" && data.action?.route) {
                navigate(data.action.route);
              }
            } catch {
              // ignore
            }
          };

          ws.onerror = () => {
            if (isMounted) setUseVoiceServer(false);
          };
          ws.onclose = () => {
            if (isMounted) setUseVoiceServer(false);
          };
        }
      })
      .catch(() => {
        if (isMounted) setUseVoiceServer(false);
      });

    return () => {
      isMounted = false;
      if (ws) ws.close();
    };
  }, [navigate]);

  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      sessionStorage.setItem(SESSION_MSG_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Tab Focus & Visibility Handler (Pause background tab mic/speech)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        if ((window as any).responsiveVoice) {
          (window as any).responsiveVoice.cancel();
        }
        window.speechSynthesis?.cancel();
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // ignore
          }
          recognitionRef.current = null;
        }
      } else {
        if (openRef.current) {
          announceActive();
          setPhase("listening");
          startListeningRef.current();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [announceActive]);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredInactivityPromptRef = useRef(false);

  // 30-Second Inactivity Auto-Engage Trigger (Fires MAX ONCE per session, skip if typing or media playing)
  useEffect(() => {
    if (!open || phase !== "listening" || hasTriggeredInactivityPromptRef.current) return;

    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    inactivityTimerRef.current = setTimeout(() => {
      // Skip trigger if user is actively typing in form inputs or playing media
      const isUserTyping = document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA";
      const isMediaPlaying = !!document.querySelector("video:not([paused]), audio:not([paused])");

      if (openRef.current && phaseRef.current === "listening" && !document.hidden && !isUserTyping && !isMediaPlaying) {
        hasTriggeredInactivityPromptRef.current = true;
        const promptMsg: ChatMessage = {
          id: Math.random().toString(36).slice(2),
          sender: "aira",
          text: "Hi! Would you like a quick explanation of this page, or have any questions about our AI solutions?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, promptMsg]);
      }
    }, INACTIVITY_TIMEOUT_MS);

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [open, phase, messages.length]);

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const getBestVoice = useCallback(() => {
    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis?.getVoices() ?? [];

    const preferredVoices = [
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Microsoft Ana Online (Natural) - English (United States)",
      "Google US English",
      "Google UK English Female",
      "Ava (Premium)",
      "Samantha (Enhanced)",
      "Samantha",
      "Victoria",
    ];

    for (const name of preferredVoices) {
      const match = voices.find((v) => v.name.includes(name) || v.name === name);
      if (match) return match;
    }

    return (
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          /natural|online|neural|female|google|aria|jenny|samantha/i.test(v.name)
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0]
    );
  }, [availableVoices]);

  const stopListening = useCallback(() => {
    // ── Stop PCM mic stream (Backend Voice Server mode) ──
    if (processorRef.current) {
      try { processorRef.current.disconnect(); } catch { /* ignore */ }
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch { /* ignore */ }
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    // ── Stop Web Audio Noise Filter ──
    if (noiseFilterRef.current) {
      try {
        noiseFilterRef.current.stop?.();
      } catch {
        // ignore
      }
      noiseFilterRef.current = null;
    }
    // ── Stop browser SpeechRecognition ──
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setInterimText("");
  }, []);

  const startListening = useCallback(() => {
    // Clear any lingering Chrome speech synthesis state when transitioning to listening
    if (phaseRef.current === "listening" && typeof window !== "undefined" && window.speechSynthesis) {
      if (utteranceRef.current === null) {
        window.speechSynthesis.cancel();
      }
    }

    const isSpeaking = typeof window !== "undefined" && (utteranceRef.current !== null || backendSpeaking);
    if (!openRef.current || document.hidden || isSpeaking || (phaseRef.current !== "listening" && phaseRef.current !== "idle")) return;

    // ══════════════════════════════════════════════════════════════════════════════
    // MODE A — Backend Voice Server: Stream raw 16kHz PCM mic → WebSocket
    //           → Faster-Whisper STT → Qwen2.5:7b LLM → CosyVoice2 TTS
    // ══════════════════════════════════════════════════════════════════════════════
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      stopListening(); // clear any existing recognition/stream
      setPhase("listening");

      navigator.mediaDevices
        .getUserMedia({
          audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
        })
        .then((stream) => {
          if (!openRef.current || wsRef.current?.readyState !== WebSocket.OPEN) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          micStreamRef.current = stream;
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtx({ sampleRate: 16000 });
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          // ScriptProcessor: 4096 frames, 1 input ch, 1 output ch — wide browser support
          const processor = ctx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (wsRef.current?.readyState !== WebSocket.OPEN) return;
            const float32 = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(float32.length);
            for (let i = 0; i < float32.length; i++) {
              int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
            }
            wsRef.current.send(int16.buffer);
          };

          source.connect(processor);
          processor.connect(ctx.destination); // needed for ScriptProcessor to fire
        })
        .catch(() => {
          // Mic permission denied → gracefully fall back to browser SpeechRecognition
          startBrowserRecognition();
        });
      return;
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // MODE B — Browser Mode: Web SpeechRecognition → AiraEngine / Gemini fallback
    // ══════════════════════════════════════════════════════════════════════════════
    startBrowserRecognition();

    function startBrowserRecognition() {
      const SpeechRecognitionCtor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionCtor) return;

      stopListening();

      // Activate Web Audio API Human Speech Bandpass & Noise Gate Filter
      initializeVoiceNoiseFilter().then((filter) => {
        if (filter) noiseFilterRef.current = filter;
      });

      const recognition: SpeechRecognition = new SpeechRecognitionCtor();
      recognition.lang = "en-IN";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognitionRef.current = recognition;

      setPhase("listening");

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // CRITICAL ECHO GUARD: Discard microphone input if Aira is speaking or phase is not 'listening'
        const isSpeaking = typeof window !== "undefined" && window.speechSynthesis?.speaking;
        if (phaseRef.current !== "listening" || isSpeaking) {
          setInterimText("");
          return;
        }

        let finalTranscript = "";
        let currentInterim = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk;
          } else {
            currentInterim += transcriptChunk;
          }
        }

        setInterimText(currentInterim);

        if (finalTranscript.trim()) {
          const query = finalTranscript.trim();
          const lowerQuery = query.toLowerCase();

          // 1. Hands-Free Voice Control: STOP / PAUSE Command
          if (/\b(stop|pause|quiet|wait|shut up|hush|hold on)\b/i.test(lowerQuery)) {
            stopListening();
            if (typeof window !== "undefined" && window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
            setPhase("paused");
            speak("Paused. Say 'continue' or 'resume' when you are ready.");
            return;
          }

          // 2. Hands-Free Voice Control: CONTINUE / RESUME Command
          if (/\b(continue|resume|start|keep going|go on)\b/i.test(lowerQuery)) {
            if (typeof window !== "undefined" && window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
            setPhase("listening");
            speak("Resuming! I am listening.", () => {
              startListening();
            });
            return;
          }

          stopListening();
          answerQuestionRef.current(query);
        }
      };

      recognition.onerror = () => {
        if (recognitionRestartTimerRef.current) {
          clearTimeout(recognitionRestartTimerRef.current);
          recognitionRestartTimerRef.current = null;
        }
        const isSpeaking = typeof window !== "undefined" && window.speechSynthesis?.speaking;
        if (openRef.current && phaseRef.current === "listening" && !document.hidden && !isSpeaking) {
          recognitionRestartTimerRef.current = setTimeout(() => {
            recognitionRestartTimerRef.current = null;
            const stillSpeaking = typeof window !== "undefined" && window.speechSynthesis?.speaking;
            if (openRef.current && phaseRef.current === "listening" && !document.hidden && !stillSpeaking) {
              startListening();
            }
          }, 500);
        }
      };

      recognition.onend = () => {
        if (recognitionRestartTimerRef.current) return;
        const isSpeaking = typeof window !== "undefined" && window.speechSynthesis?.speaking;
        if (openRef.current && !document.hidden && phaseRef.current === "listening" && !isSpeaking) {
          try {
            recognition.start();
          } catch {
            // ignore
          }
        }
      };

      try {
        recognition.start();
      } catch {
        // ignore
      }
    }
  }, [stopListening]);

  const startListeningRef = useRef(startListening);
  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  const fallbackSpeak = useCallback(
    (text: string, onDone?: () => void) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        onDone?.();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      (window as any)._currentAiraUtterance = utterance; // Prevent Chrome GC

      utterance.lang = "en-US";
      utterance.rate = 0.98;
      utterance.pitch = 1.02;

      // Select best voice or default to any available voice
      const voice = getBestVoice() || (window.speechSynthesis.getVoices() ? window.speechSynthesis.getVoices()[0] : null);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        try {
          window.speechSynthesis.resume();
        } catch {
          // ignore
        }
      };

      utterance.onend = () => {
        utteranceRef.current = null;
        (window as any)._currentAiraUtterance = null;
        onDone?.();
      };

      utterance.onerror = () => {
        utteranceRef.current = null;
        (window as any)._currentAiraUtterance = null;
        onDone?.();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        onDone?.();
      }
    },
    [getBestVoice]
  );

  const speak = useCallback(
    (text: string, onDone?: () => void) => {
      stopListening();

      if (isMutedRef.current || document.hidden || typeof window === "undefined") {
        onDone?.();
        return;
      }

      fallbackSpeak(text, onDone);
    },
    [fallbackSpeak, stopListening]
  );

  const answerQuestion = useCallback(
    async (transcript: string) => {
      const lowerT = transcript.trim().toLowerCase();
      if (/^(stop|pause|quiet|wait|shut up|hush|hold on)$/i.test(lowerT)) {
        stopListening();
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setPhase("paused");
        speak("Paused. Say 'continue' or 'resume' when you are ready.");
        return;
      }

      if (/^(continue|resume|start|keep going|go on)$/i.test(lowerT)) {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setPhase("listening");
        speak("Resuming! I am listening.", () => {
          startListening();
        });
        return;
      }

      // ── Backend Voice Server Mode: Route text → Qwen2.5:7b + CosyVoice2 pipeline ──
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        setInterimText("");
        stopListening();
        window.speechSynthesis?.cancel();
        utteranceRef.current = null;
        // Stop any currently playing backend audio before new query
        if (backendAudioRef.current) {
          backendAudioRef.current.pause();
          backendAudioRef.current.src = "";
          backendAudioRef.current = null;
        }
        setBackendSpeaking(false);
        const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setMessages((prev) => [
          ...prev,
          { id: Math.random().toString(36).slice(2), sender: "user", text: transcript, timestamp: userTime },
        ]);
        setPhase("answering");
        wsRef.current.send(JSON.stringify({ type: "text_query", text: transcript }));
        return;
      }

      // ── Browser Fallback Mode: AiraEngine / Gemini ──
      setInterimText("");
      stopListening();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      utteranceRef.current = null;

      const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const userMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        sender: "user",
        text: transcript,
        timestamp: userTime,
      };

      setMessages((prev) => [...prev, userMsg]);
      setPhase("answering");

      // Process message using Gemini 1.5 Flash Generative API (or fallback to local NLP)
      const response = await airaEngineRef.current.processMessageAsync(
        transcript,
        messages.map((m) => ({ sender: m.sender, text: m.text }))
      );

      const airaTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const airaMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        sender: "aira",
        text: response.reply,
        timestamp: airaTime,
      };

      setMessages((prev) => [...prev, airaMsg]);

      if (response.navigateTo && response.navigateTo !== location.pathname) {
        navigate(response.navigateTo);
      }

      if (response.triggerDemoPopup || response.bookingDetails) {
        window.dispatchEvent(new CustomEvent("open-demo-popup", { detail: response.bookingDetails }));
      }

      speak(response.reply, () => {
        if (phaseRef.current === "answering" || phaseRef.current === "greeting") {
          if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
          cooldownTimerRef.current = setTimeout(() => {
            if (openRef.current && !document.hidden) {
              setPhase("listening");
              startListening();
            }
          }, POST_SPEECH_COOLDOWN_MS);
        }
      });
    },
    [location.pathname, messages, navigate, speak, stopListening, startListening]
  );

  const answerQuestionRef = useRef(answerQuestion);
  useEffect(() => {
    answerQuestionRef.current = answerQuestion;
  }, [answerQuestion]);

  const handleOpen = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // ignore
      }
    }
    announceActive();
    setOpen(true);
    openRef.current = true;

    if (messages.length > 0) {
      setPhase("listening");
      startListening();
      return;
    }

    airaEngineRef.current.resetState();
    const initial = airaEngineRef.current.getGreeting();
    const initialTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setMessages([
      {
        id: "greeting",
        sender: "aira",
        text: initial.reply,
        timestamp: initialTime,
      },
    ]);
    setPhase("greeting");

    speak(initial.reply, () => {
      if (phaseRef.current === "greeting" || phaseRef.current === "answering") {
        if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = setTimeout(() => {
          if (openRef.current && !document.hidden) {
            setPhase("listening");
            startListening();
          }
        }, POST_SPEECH_COOLDOWN_MS);
      }
    });
  }, [announceActive, messages.length, speak, startListening]);

  const handleStopSpeech = () => {
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    // Clear utterance ref and callbacks BEFORE cancel to prevent onend re-triggering
    utteranceRef.current = null;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // Stop backend audio (CosyVoice2 / Edge-TTS) if playing
    if (backendAudioRef.current) {
      backendAudioRef.current.pause();
      backendAudioRef.current.src = "";
      backendAudioRef.current = null;
    }
    setBackendSpeaking(false);
    // Send barge_in signal to backend to cancel its current response
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "barge_in" }));
    }
    setPhase("listening");
    startListening();
  };

  const handleClose = useCallback(() => {
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    if (recognitionRestartTimerRef.current) clearTimeout(recognitionRestartTimerRef.current);
    stopListening();
    utteranceRef.current = null;
    window.speechSynthesis?.cancel();
    // Stop backend audio on close
    if (backendAudioRef.current) {
      backendAudioRef.current.pause();
      backendAudioRef.current.src = "";
      backendAudioRef.current = null;
    }
    setBackendSpeaking(false);
    // Notify backend
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop" }));
    }
    announceReleased();
    setOpen(false);
    openRef.current = false;
    setPhase("idle");
  }, [announceReleased, stopListening]);

  const handleResetChat = () => {
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    if (recognitionRestartTimerRef.current) clearTimeout(recognitionRestartTimerRef.current);
    stopListening();
    utteranceRef.current = null;
    window.speechSynthesis?.cancel();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SESSION_MSG_KEY);
      sessionStorage.removeItem(SESSION_OPEN_KEY);
    }
    airaEngineRef.current.resetState();
    const initial = airaEngineRef.current.getGreeting();
    const initialTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages([
      {
        id: "greeting-" + Date.now(),
        sender: "aira",
        text: initial.reply,
        timestamp: initialTime,
      },
    ]);
    setPhase("greeting");

    speak(initial.reply, () => {
      if (phaseRef.current === "greeting" || phaseRef.current === "answering") {
        if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = setTimeout(() => {
          if (openRef.current && !document.hidden) {
            setPhase("listening");
            startListening();
          }
        }, POST_SPEECH_COOLDOWN_MS);
      }
    });
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const query = textInput.trim();
    setTextInput("");
    answerQuestion(query);
  };

  const handleChipClick = (query: string) => {
    answerQuestion(query);
  };

  useEffect(() => {
    if (!allowed && open) handleClose();
  }, [allowed, open, handleClose]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      stopListening();
      if ((window as any).responsiveVoice) {
        (window as any).responsiveVoice.cancel();
      }
      window.speechSynthesis?.cancel();
    };
  }, [stopListening]);

  if (!allowed || !visible) return null;

  return createPortal(
    <AnimatePresence>
      {!open ? (
        <motion.button
          key="launcher"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={handleOpen}
          aria-label="Open Aira AI Chatbot"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-primary via-purple-600 to-indigo-600 text-primary-foreground shadow-2xl hover:scale-110 active:scale-95 transition-all group"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-background" />
            </span>
          </div>
        </motion.button>
      ) : (
        <motion.div
          key="panel"
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-6 right-6 z-50 flex h-[540px] max-h-[85vh] w-[370px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between bg-gradient-to-r from-slate-900 via-purple-950 to-primary p-4 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <Bot className="h-6 w-6 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white">Aira</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase text-emerald-300 border border-emerald-500/30">
                    {useVoiceServer ? "Qwen2.5 + CosyVoice2 Voice" : "Aira Local AI"}
                  </span>
                </div>
                <span className="text-[11px] text-white/80">AI Consultant • Converse AI</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                aria-label="Gemini API Key"
                title={keySaved ? "Gemini 1.5 Flash Active" : "Add Free Gemini API Key"}
                className={`rounded-full p-2 transition-colors ${
                  keySaved ? "text-emerald-400 bg-white/10" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Key className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? "Unmute voice" : "Mute voice"}
                title={isMuted ? "Voice muted (Click to unmute)" : "Voice active (Click to mute)"}
                className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                onClick={handleResetChat}
                aria-label="Restart chat"
                title="Restart chat"
                className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={handleClose}
                aria-label="Close chat"
                className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Gemini API Key Overlay Bar */}
          {showKeyInput && (
            <form onSubmit={handleSaveKey} className="bg-slate-900 p-3 text-white flex flex-col gap-2 border-b border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <Key className="h-3.5 w-3.5" /> Enter Free Gemini API Key
                </span>
                <span className="text-[9px] text-white/60">Free @ aistudio.google.com</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Paste API Key"
                  className="flex-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" /> Save
                </button>
              </div>
            </form>
          )}

          {/* Status Bar */}
          <div className="flex items-center justify-between bg-muted/40 px-4 py-2 border-b border-border/40 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  phase === "listening"
                    ? "animate-ping bg-rose-500"
                    : phase === "greeting" || phase === "answering"
                    ? "animate-pulse bg-primary"
                    : "bg-muted-foreground"
                }`}
              />
              <span className="text-[11px] font-medium text-muted-foreground">
                {phase === "listening" && "Listening to your voice..."}
                {(phase === "greeting" || phase === "answering") && "Aira is speaking..."}
                {phase === "paused" && "Voice paused"}
                {phase === "idle" && "Ready to chat"}
              </span>
            </div>

            {(phase === "greeting" || phase === "answering") && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStopSpeech}
                  className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500 hover:bg-rose-500/20 transition-colors"
                  title="Stop speaking"
                >
                  <Square className="h-3 w-3 fill-rose-500" /> Stop
                </button>
                <div className="flex items-center gap-0.5">
                  <span className="h-3 w-0.5 animate-pulse bg-primary [animation-delay:-0.3s]" />
                  <span className="h-4 w-0.5 animate-pulse bg-primary [animation-delay:-0.15s]" />
                  <span className="h-2 w-0.5 animate-pulse bg-primary" />
                  <span className="h-3.5 w-0.5 animate-pulse bg-primary [animation-delay:-0.2s]" />
                </div>
              </div>
            )}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[90%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-tr from-primary to-purple-600 text-white"
                  }`}
                >
                  {msg.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div className="flex flex-col">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-xs"
                        : "bg-card text-card-foreground border border-border/60 rounded-tl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span
                    className={`text-[9px] text-muted-foreground mt-1 px-1 ${
                      msg.sender === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {interimText && (
              <div className="flex gap-2.5 max-w-[90%] ml-auto flex-row-reverse opacity-70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/70 text-white text-xs font-semibold">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl px-3.5 py-2 text-xs bg-primary/20 text-foreground italic">
                  {interimText}...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 border-t border-border/40 bg-background scrollbar-none">
            <button
              onClick={() => handleChipClick("Tell me about AI Voice Agents")}
              className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              🎙️ Voice Agents
            </button>
            <button
              onClick={() => handleChipClick("Tell me about WhatsApp AI Chatbot")}
              className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              💬 WhatsApp Bot
            </button>
            <button
              onClick={() => handleChipClick("How does Custom AI Automation work?")}
              className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              ⚡ Custom AI
            </button>
            <button
              onClick={() => handleChipClick("I want to book a consultation call")}
              className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              📅 Book Call
            </button>
          </div>

          {/* Chat Footer / Input Form */}
          <div className="p-3 bg-background border-t border-border/60">
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (phase === "greeting" || phase === "answering") {
                    handleStopSpeech();
                  } else if (phase === "listening") {
                    stopListening();
                    setPhase("idle");
                  } else {
                    startListening();
                  }
                }}
                title={
                  phase === "greeting" || phase === "answering"
                    ? "Click to stop Aira speaking"
                    : phase === "listening"
                    ? "Click to pause microphone"
                    : "Click to start speaking"
                }
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                  phase === "greeting" || phase === "answering"
                    ? "bg-amber-500 text-white animate-pulse shadow-md"
                    : phase === "listening"
                    ? "bg-rose-500 text-white animate-ping shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {phase === "greeting" || phase === "answering" ? (
                  <Square className="h-4 w-4 fill-white" />
                ) : phase === "listening" ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>

              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ask Aira anything..."
                className="flex-1 rounded-xl border bg-muted/30 px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all"
              />

              <button
                type="submit"
                disabled={!textInput.trim()}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-all shadow-md"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between px-1">
              <span className="text-[9px] text-muted-foreground">
                Powered by <strong className="font-semibold text-foreground/80">Converse AI</strong>
              </span>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-demo-popup"));
                }}
                className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" /> Book Call
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default VoiceAssistant;

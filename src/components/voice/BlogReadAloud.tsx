// Podcast-style "Listen" player for blog articles only.
// Reads the article aloud with pause / resume / restart / skip / speed,
// using the browser's free SpeechSynthesis with the most natural voice.

import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, Play, Pause, RotateCcw, SkipBack, SkipForward, X } from "lucide-react";
import { pickVoice, primeVoices, cancelSpeech, isTTSSupported } from "@/lib/voice/tts";
import { extractBlogText, BLOG_CONTENT_SELECTOR } from "@/lib/voice/pageContent";
import "./BlogReadAloud.css";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

/** Improve pronunciation of common tech/company/model names. */
function normalizeForSpeech(text: string): string {
  // Read acronyms naturally (no dotted letter-spelling); only fix the brand and
  // a few forms browsers mispronounce.
  const map: Record<string, string> = {
    ConverseAI: "Converseai",
    "Converse AI": "Converseai",
    "Converse-AI": "Converseai",
    SaaS: "sass",
    ChatGPT: "Chat GPT",
    SpaceX: "Space X",
  };
  let out = text;
  for (const [k, v] of Object.entries(map)) {
    out = out.replace(new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"), v);
  }
  return out;
}

function splitChunks(text: string): string[] {
  return normalizeForSpeech(text)
    .replace(/\s+/g, " ")
    .match(/[^.!?]+[.!?]*/g)
    ?.map((s) => s.trim())
    .filter((s) => s.length > 0) ?? [];
}

export default function BlogReadAloud() {
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0); // 0..1

  const chunksRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef(1);

  // Only expose on pages that actually have article content. Blog content can
  // hydrate after first paint, so watch the DOM until it appears.
  useEffect(() => {
    if (!isTTSSupported()) return;
    primeVoices();
    const check = () => {
      const found = !!document.querySelector(BLOG_CONTENT_SELECTOR);
      if (found) setAvailable(true);
      return found;
    };
    if (check()) return;
    const obs = new MutationObserver(() => {
      if (check()) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    const stop = setTimeout(() => obs.disconnect(), 8000);
    return () => {
      obs.disconnect();
      clearTimeout(stop);
    };
  }, []);

  const load = useCallback(() => {
    const { body } = extractBlogText();
    chunksRef.current = splitChunks(body);
    indexRef.current = 0;
    setProgress(0);
  }, []);

  const speakFrom = useCallback((i: number) => {
    const chunks = chunksRef.current;
    if (i >= chunks.length) {
      playingRef.current = false;
      setPlaying(false);
      setProgress(1);
      indexRef.current = 0;
      return;
    }
    indexRef.current = i;
    setProgress(chunks.length ? i / chunks.length : 0);
    const u = new SpeechSynthesisUtterance(chunks[i]);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = speedRef.current;
    u.onend = () => {
      if (playingRef.current) speakFrom(indexRef.current + 1);
    };
    u.onerror = () => {
      /* cancelled — controlled elsewhere */
    };
    window.speechSynthesis.speak(u);
  }, []);

  const play = useCallback(() => {
    if (!chunksRef.current.length) load();
    cancelSpeech();
    playingRef.current = true;
    setPlaying(true);
    setOpen(true);
    speakFrom(indexRef.current);
  }, [load, speakFrom]);

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    cancelSpeech(); // cancel (not pause) so speed/skip stay reliable across browsers
  }, []);

  const toggle = useCallback(() => {
    if (playingRef.current) pause();
    else play();
  }, [pause, play]);

  const restart = useCallback(() => {
    indexRef.current = 0;
    setProgress(0);
    play();
  }, [play]);

  const skip = useCallback(
    (delta: number) => {
      const next = Math.max(0, Math.min(chunksRef.current.length - 1, indexRef.current + delta));
      indexRef.current = next;
      if (playingRef.current) {
        cancelSpeech();
        speakFrom(next);
      } else {
        setProgress(chunksRef.current.length ? next / chunksRef.current.length : 0);
      }
    },
    [speakFrom]
  );

  const changeSpeed = useCallback(
    (s: number) => {
      speedRef.current = s;
      setSpeed(s);
      if (playingRef.current) {
        cancelSpeech();
        speakFrom(indexRef.current); // re-speak current chunk at new rate
      }
    },
    [speakFrom]
  );

  // Let the voice agent start read-aloud via a global event.
  useEffect(() => {
    const handler = () => play();
    window.addEventListener("voice-agent:read-aloud", handler);
    return () => window.removeEventListener("voice-agent:read-aloud", handler);
  }, [play]);

  // Stop narration when leaving the page/unmounting.
  useEffect(() => {
    return () => {
      playingRef.current = false;
      cancelSpeech();
    };
  }, []);

  if (!available) return null;

  return (
    <div className="bra-root" data-voice-agent>
      {!open ? (
        <button className="bra-listen" onClick={play}>
          <Headphones size={18} />
          <span>Listen to this article</span>
        </button>
      ) : (
        <div className="bra-player" role="group" aria-label="Article read-aloud player">
          <div className="bra-progress">
            <span style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="bra-controls">
            <button onClick={() => skip(-1)} aria-label="Back" title="Previous sentence">
              <SkipBack size={18} />
            </button>
            <button className="bra-play" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={() => skip(1)} aria-label="Forward" title="Next sentence">
              <SkipForward size={18} />
            </button>
            <button onClick={restart} aria-label="Restart" title="Restart">
              <RotateCcw size={17} />
            </button>
            <div className="bra-speed" role="group" aria-label="Playback speed">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  className={s === speed ? "bra-speed--active" : ""}
                  onClick={() => changeSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
            <button
              className="bra-close"
              onClick={() => {
                pause();
                setOpen(false);
              }}
              aria-label="Close player"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

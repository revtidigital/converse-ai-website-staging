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
    ConverseAI: "Converse AI",
    "Converse-AI": "Converse AI",
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

// Common abbreviations whose trailing dot must NOT be treated as a sentence end.
const ABBREV_RE =
  /\b(?:mr|mrs|ms|dr|prof|sr|jr|st|ave|vs|etc|inc|ltd|co|corp|e\.g|i\.e|a\.m|p\.m|u\.s|u\.k|ph\.d|no|fig|approx|dept|est|govt|dec|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov)\b\.?/gi;

// Placeholder (private-use char) that stands in for a protected period while we
// split sentences, then gets restored. Never appears in real article text.
const DOT = String.fromCharCode(0xe000);
const DOT_RE = new RegExp(DOT, "g");

// Split into grammatically whole sentences instead of chopping at every period.
// Abbreviations, decimals ("3.5") and single-letter initials keep their dots so
// they aren't read as separate fragments; a sentence ends only where terminal
// punctuation is followed by whitespace and the start of a new clause.
function splitChunks(text: string): string[] {
  let out = normalizeForSpeech(text).replace(/\s+/g, " ");
  out = out.replace(/(\d)\.(\d)/g, `$1${DOT}$2`); // decimals: 3.5
  out = out.replace(ABBREV_RE, (m) => m.replace(/\./g, DOT)); // known abbreviations
  out = out.replace(/\b([A-Za-z])\.(?=\s*[A-Za-z]\.)/g, `$1${DOT}`); // initials: A. B.

  return out
    .split(/(?<=[.!?…])\s+(?=["'“‘([]?[A-Z0-9])/)
    .map((s) => s.replace(DOT_RE, ".").trim())
    .filter((s) => s.length > 0);
}

export default function BlogReadAloud() {
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0); // 0..1
  const [total, setTotal] = useState(0); // number of sentences
  const [current, setCurrent] = useState(0); // 1-based sentence being read

  const chunksRef = useRef<string[]>([]);
  const indexRef = useRef(0); // sentence currently being spoken
  const playingRef = useRef(false);
  const speedRef = useRef(1);
  // Retain EVERY queued utterance for the whole session. Chrome garbage-collects
  // SpeechSynthesisUtterance objects while they're still queued/speaking, which
  // silently drops their onend and stops the article after one sentence. Holding
  // a reference to all of them for the current queue prevents that.
  const utterRef = useRef<SpeechSynthesisUtterance[]>([]);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeat = useRef<ReturnType<typeof setInterval> | null>(null);

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
    setTotal(chunksRef.current.length);
    setCurrent(0);
    setProgress(0);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeat.current) {
      clearInterval(heartbeat.current);
      heartbeat.current = null;
    }
  }, []);

  // Queue ALL sentences from `start` into the browser's own synthesis queue at
  // once, then let Chrome's FIFO drive playback. We do NOT chain the next
  // sentence from onend — that chaining is what Chrome intermittently drops,
  // stopping narration after the first sentence. onstart only reports progress.
  const speakQueue = useCallback(
    (start: number) => {
      if (!isTTSSupported()) return;
      const chunks = chunksRef.current;
      const total = chunks.length;

      // Cancel any current speech, then queue after a short beat: speaking
      // immediately after cancel() is a known Chrome race that drops the audio.
      cancelSpeech();
      if (startTimer.current) clearTimeout(startTimer.current);
      startTimer.current = setTimeout(() => {
        if (!playingRef.current) return;
        utterRef.current = [];
        const voice = pickVoice();
        try {
          window.speechSynthesis.resume();
        } catch {
          /* ignore */
        }
        for (let i = start; i < total; i++) {
          const u = new SpeechSynthesisUtterance(chunks[i]);
          utterRef.current.push(u);
          if (voice) u.voice = voice;
          u.rate = speedRef.current;
          u.onstart = () => {
            indexRef.current = i;
            setProgress(total ? i / total : 0); // how much has been read
            setCurrent(i + 1);
          };
          if (i === total - 1) {
            u.onend = () => {
              playingRef.current = false;
              setPlaying(false);
              setProgress(1);
              setCurrent(total);
              indexRef.current = 0;
              stopHeartbeat();
            };
          }
          window.speechSynthesis.speak(u);
        }

        // Bare resume() heartbeat (no pause → no choppiness, no skips): unsticks
        // Chrome if it silently stalls the queue after ~15s. Never advances the
        // sentence itself, so it can't cause the skipping the old watchdog did.
        stopHeartbeat();
        heartbeat.current = setInterval(() => {
          if (!playingRef.current) return;
          try {
            window.speechSynthesis.resume();
          } catch {
            /* ignore */
          }
        }, 8000);
      }, 90);
    },
    [stopHeartbeat]
  );

  const play = useCallback(() => {
    if (!chunksRef.current.length) load();
    playingRef.current = true;
    setPlaying(true);
    setOpen(true);
    speakQueue(indexRef.current);
  }, [load, speakQueue]);

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    if (startTimer.current) clearTimeout(startTimer.current);
    stopHeartbeat();
    cancelSpeech(); // cancel (not pause) so speed/skip stay reliable across browsers
  }, [stopHeartbeat]);

  const toggle = useCallback(() => {
    if (playingRef.current) pause();
    else play();
  }, [pause, play]);

  const restart = useCallback(() => {
    indexRef.current = 0;
    setProgress(0);
    setCurrent(0);
    play();
  }, [play]);

  const skip = useCallback(
    (delta: number) => {
      const next = Math.max(0, Math.min(chunksRef.current.length - 1, indexRef.current + delta));
      indexRef.current = next;
      if (playingRef.current) {
        speakQueue(next);
      } else {
        const total = chunksRef.current.length;
        setProgress(total ? next / total : 0);
        setCurrent(next + 1);
      }
    },
    [speakQueue]
  );

  const changeSpeed = useCallback(
    (s: number) => {
      speedRef.current = s;
      setSpeed(s);
      if (playingRef.current) speakQueue(indexRef.current); // re-queue at new rate
    },
    [speakQueue]
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
      if (startTimer.current) clearTimeout(startTimer.current);
      stopHeartbeat();
      cancelSpeech();
    };
  }, [stopHeartbeat]);

  if (!available) return null;

  const pct = Math.round(progress * 100);

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
            <span style={{ width: `${pct}%` }} />
          </div>
          <div className="bra-status">
            <span className="bra-status-pct">{pct}% read</span>
            {total > 0 && (
              <span className="bra-status-count">
                Sentence {Math.min(current, total)} of {total}
              </span>
            )}
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

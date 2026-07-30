import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { htmlToReadingChunks, faqsToReadingChunks } from "./textChunks";

export type ReaderStatus = "idle" | "playing" | "paused";

interface Faq {
  question: string;
  answer: string;
}

export function useArticleReader(title: string, contentHtml: string, faqs?: Faq[]) {
  const supported = typeof window !== "undefined" && !!window.speechSynthesis;

  const chunks = useMemo(() => {
    if (!supported) return [] as string[];
    return [...htmlToReadingChunks("", contentHtml), ...faqsToReadingChunks(faqs || [])];
  }, [supported, title, contentHtml, faqs]);

  const [status, setStatus] = useState<ReaderStatus>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);

  const genRef = useRef(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, [supported]);

  const getBestVoice = useCallback(() => {
    const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices();
    const preferredNames = [
      "Google US English",
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Jenny Online (Natural) - English (United States)",
      "Samantha",
    ];
    for (const name of preferredNames) {
      const match = voices.find((v) => v.name === name);
      if (match) return match;
    }
    return (
      voices.find((v) => v.lang === "en-US" && /female/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0]
    );
  }, []);

  const speakChunk = useCallback(
    (index: number) => {
      if (index < 0 || index >= chunks.length) {
        setStatus("idle");
        setCurrentIndex(0);
        return;
      }
      window.speechSynthesis.cancel();
      const myGen = ++genRef.current;

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = "en-US";
      utterance.rate = 0.98;
      utterance.pitch = 1.03;
      const voice = getBestVoice();
      if (voice) utterance.voice = voice;

      // Chrome silently halts long utterances after ~15s unless kept alive.
      const keepAlive = window.setInterval(() => {
        if (!window.speechSynthesis.speaking) return;
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 10_000);

      utterance.onend = () => {
        window.clearInterval(keepAlive);
        if (genRef.current !== myGen) return;
        const next = index + 1;
        if (next < chunks.length) {
          setCurrentIndex(next);
          speakChunk(next);
        } else {
          setStatus("idle");
          setCurrentIndex(0);
        }
      };
      utterance.onerror = () => {
        window.clearInterval(keepAlive);
        if (genRef.current !== myGen) return;
        setStatus("idle");
      };

      window.speechSynthesis.speak(utterance);
    },
    [chunks, getBestVoice]
  );

  const play = useCallback(() => {
    if (!supported || chunks.length === 0) return;
    setStatus("playing");
    speakChunk(currentIndex >= chunks.length ? 0 : currentIndex);
  }, [supported, chunks.length, currentIndex, speakChunk]);

  const pause = useCallback(() => {
    genRef.current++;
    window.speechSynthesis.cancel();
    setStatus("paused");
  }, []);

  const skipNext = useCallback(() => {
    const next = Math.min(currentIndex + 1, Math.max(chunks.length - 1, 0));
    setCurrentIndex(next);
    if (status === "playing") speakChunk(next);
  }, [currentIndex, chunks.length, status, speakChunk]);

  const skipPrev = useCallback(() => {
    const prev = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prev);
    if (status === "playing") speakChunk(prev);
  }, [currentIndex, status, speakChunk]);

  const seekToRatio = useCallback(
    (ratio: number) => {
      if (chunks.length === 0) return;
      const clamped = Math.min(Math.max(ratio, 0), 1);
      const idx = Math.min(Math.round(clamped * (chunks.length - 1)), chunks.length - 1);
      setCurrentIndex(idx);
      if (status === "playing") speakChunk(idx);
    },
    [chunks.length, status, speakChunk]
  );

  const close = useCallback(() => {
    genRef.current++;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setCurrentIndex(0);
  }, []);

  useEffect(() => {
    return () => {
      genRef.current++;
      window.speechSynthesis?.cancel();
    };
  }, []);

  return {
    supported,
    status,
    currentIndex,
    totalChunks: chunks.length,
    progress: chunks.length > 0 ? currentIndex / Math.max(chunks.length - 1, 1) : 0,
    play,
    pause,
    skipNext,
    skipPrev,
    seekToRatio,
    close,
  };
}

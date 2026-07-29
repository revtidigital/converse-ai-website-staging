import { useCallback, useRef, useState } from "react";
import { Headphones, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { useArticleReader } from "./useArticleReader";

interface Faq {
  question: string;
  answer: string;
}

interface ArticleReaderProps {
  title: string;
  contentHtml: string;
  faqs?: Faq[];
}

const ArticleReader = ({ title, contentHtml, faqs }: ArticleReaderProps) => {
  const reader = useArticleReader(title, contentHtml, faqs);
  const [expanded, setExpanded] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleToggleOpen = useCallback(() => {
    setExpanded(true);
    reader.play();
  }, [reader]);

  const handleClose = useCallback(() => {
    reader.close();
    setExpanded(false);
  }, [reader]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      reader.seekToRatio(ratio);
    },
    [reader]
  );

  if (!reader.supported) return null;

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={handleToggleOpen}
        aria-label="Listen to this article"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "#f3e8ff",
          color: "#7c3aed",
          fontWeight: 700,
          fontSize: "13.5px",
          padding: "9px 16px",
          borderRadius: "999px",
          border: "1px solid #e9d5ff",
          cursor: "pointer",
          margin: "0 0 20px",
        }}
      >
        <Headphones size={16} />
        Listen to this article
      </button>
    );
  }

  const percent = Math.round(reader.progress * 100);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        background: "#faf5ff",
        border: "1px solid #e9d5ff",
        borderRadius: "16px",
        padding: "12px 18px",
        margin: "0 0 20px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#7c3aed", fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap" }}>
        <Headphones size={16} />
        Listening
      </div>

      <button
        type="button"
        onClick={reader.skipPrev}
        aria-label="Previous section"
        style={iconButtonStyle}
      >
        <SkipBack size={16} />
      </button>

      <button
        type="button"
        onClick={reader.status === "playing" ? reader.pause : reader.play}
        aria-label={reader.status === "playing" ? "Pause" : "Play"}
        style={{ ...iconButtonStyle, background: "#7c3aed", color: "#fff" }}
      >
        {reader.status === "playing" ? <Pause size={16} /> : <Play size={16} />}
      </button>

      <button
        type="button"
        onClick={reader.skipNext}
        aria-label="Next section"
        style={iconButtonStyle}
      >
        <SkipForward size={16} />
      </button>

      <div
        ref={trackRef}
        onClick={handleSeek}
        role="slider"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        style={{
          flex: "1 1 140px",
          minWidth: "100px",
          height: "6px",
          background: "#e9d5ff",
          borderRadius: "999px",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${percent}%`,
            background: "#7c3aed",
            borderRadius: "999px",
          }}
        />
      </div>

      <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 600, whiteSpace: "nowrap" }}>
        {Math.min(reader.currentIndex + 1, reader.totalChunks)} / {reader.totalChunks}
      </span>

      <button type="button" onClick={handleClose} aria-label="Close listen mode" style={iconButtonStyle}>
        <X size={16} />
      </button>
    </div>
  );
};

const iconButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  border: "1px solid #e9d5ff",
  background: "#ffffff",
  color: "#7c3aed",
  cursor: "pointer",
  flexShrink: 0,
};

export default ArticleReader;

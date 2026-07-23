import { useCallback, useEffect, useState } from "react";
import { getBlogReadingState, pauseBlogReading, registerBlogReaderBridge, restartBlogReading, resumeBlogReading, startBlogReading, stopBlogReading, unregisterBlogReaderBridge } from "@/lib/xaiVoice/blog/blogReaderBridge";
import type { BlogArticleInput, BlogReadingState } from "@/lib/xaiVoice/blog/types";
import "./BlogListenControl.css";

type Props = { article: BlogArticleInput };

export default function BlogListenControl({ article }: Props) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<BlogReadingState>(() => getBlogReadingState(article.route));
  const refresh = useCallback(() => setState(getBlogReadingState(article.route)), [article.route]);

  useEffect(() => {
    const registered = registerBlogReaderBridge(article);
    setMounted(registered);
    refresh();
    return () => { stopBlogReading(article.route); unregisterBlogReaderBridge(article.route); };
  }, [article, refresh]);

  if (!mounted) return null;

  const status = state.status;
  const label = status === "reading" ? "Pause" : status === "paused" || status === "interrupted" ? "Continue" : status === "completed" || status === "stopped" ? "Restart" : "Listen";
  const onPrimary = () => {
    if (status === "reading") pauseBlogReading(article.route);
    else if (status === "paused" || status === "interrupted") resumeBlogReading(article.route);
    else if (status === "completed" || status === "stopped") restartBlogReading(article.route);
    else startBlogReading({ startMode: "beginning" }, article.route);
    refresh();
  };

  return (
    <aside className="blog-listen-control" aria-label="Blog listening controls">
      <button type="button" className="blog-listen-control__button" onClick={onPrimary} aria-label={`${label} this blog article`}>
        {label}
      </button>
      {status === "reading" || status === "paused" || status === "interrupted" ? (
        <button type="button" className="blog-listen-control__secondary" onClick={() => { stopBlogReading(article.route); refresh(); }} aria-label="Stop blog reading">
          Stop
        </button>
      ) : null}
      <span className="blog-listen-control__status" aria-live="polite">
        {status === "reading" ? "Reading blog" : status === "paused" ? "Blog paused" : status === "completed" ? "Reading complete" : "No autoplay"}
      </span>
    </aside>
  );
}

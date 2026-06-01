import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import "./index.css";

export function render(url: string) {
  const helmetContext: { helmet?: Record<string, { toString: () => string }> } = {};
  const Router = ({ children }: { children: React.ReactNode }) => (
    <StaticRouter location={url}>{children}</StaticRouter>
  );

  const appHtml = renderToString(<App Router={Router} helmetContext={helmetContext} />);
  const helmet = helmetContext.helmet;

  return {
    appHtml,
    head: helmet
      ? [
          helmet.title?.toString(),
          helmet.priority?.toString(),
          helmet.meta?.toString(),
          helmet.link?.toString(),
          helmet.script?.toString(),
        ]
          .filter(Boolean)
          .join("\n")
      : "",
  };
}

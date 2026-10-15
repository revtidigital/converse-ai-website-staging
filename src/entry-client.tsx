import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initUTMCapture } from "./lib/utmTracker";

// Capture UTM / referrer attribution immediately at app boot (before React renders)
// so first-touch source is never lost regardless of which page the user lands on.
initUTMCapture();

createRoot(document.getElementById("root")!).render(<App />);

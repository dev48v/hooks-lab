import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// No StrictMode: this lab logs real renders + effects, and StrictMode
// intentionally double-runs them in dev, which would distort the timeline.
createRoot(document.getElementById("root")!).render(<App />);

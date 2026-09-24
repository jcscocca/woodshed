import { useEffect, useRef } from "react";
import { actionFor, clampBpm } from "./shortcuts.js";
import { toggleWatch } from "./stopwatch.js";
import { usePractice } from "./PracticeProvider.jsx";

function contextOf(target) {
  const tag = target && target.tagName;
  return {
    typing: tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || !!(target && target.isContentEditable),
    dialogOpen: !!document.querySelector('[aria-modal="true"]'),
    buttonFocused: tag === "BUTTON" || tag === "A" || tag === "SUMMARY",
  };
}

// Rendered inside PracticeProvider on desktop. It handles the practice-tool keys
// itself, so the App never subscribes to the metronome's per-beat state.
export function ShortcutBridge({ onAction }) {
  const { metro, setWatch } = usePractice();
  const run = useRef(null);
  run.current = (a) => {
    if (a.type === "metronome") metro.toggle();
    else if (a.type === "tap") metro.tap();
    else if (a.type === "bpm") metro.setBpm((b) => clampBpm(b + a.delta));
    else if (a.type === "stopwatch") setWatch(toggleWatch);
    else onAction(a);
  };
  useEffect(() => {
    const onKey = (e) => {
      const a = actionFor(e, contextOf(e.target));
      if (!a) return;
      e.preventDefault();
      run.current(a);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}

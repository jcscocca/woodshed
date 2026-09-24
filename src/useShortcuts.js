import { useEffect, useRef } from "react";
import { actionFor, clampBpm } from "./shortcuts.js";
import { toggleWatch } from "./stopwatch.js";
import { usePractice } from "./PracticeProvider.jsx";
import { useMidi } from "./midi/MidiProvider.jsx";

function contextOf(target, viaPointer) {
  const tag = target && target.tagName;
  return {
    typing: tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || !!(target && target.isContentEditable),
    dialogOpen: !!document.querySelector('[aria-modal="true"]'),
    buttonFocused: (tag === "BUTTON" || tag === "A" || tag === "SUMMARY") && !viaPointer,
  };
}

// Rendered inside PracticeProvider on desktop. It handles the practice-tool keys
// itself, so the App never subscribes to the metronome's per-beat state.
export function ShortcutBridge({ onAction }) {
  const { metro, setWatch } = usePractice();
  const midi = useMidi();
  const run = useRef(null);
  run.current = (a) => {
    if (a.type === "metronome") metro.toggle();
    else if (a.type === "tap") metro.tap();
    else if (a.type === "bpm") metro.setBpm((b) => clampBpm(b + a.delta));
    else if (a.type === "stopwatch") setWatch(toggleWatch);
    else if (a.type === "band") { if (midi && midi.status === "connected") midi.setBandOpen((o) => !o); }
    else if (a.type === "playback") { if (midi && midi.status === "connected") midi.playLastTake(); }
    else if (a.type === "coach") { if (midi && midi.status === "connected") window.dispatchEvent(new CustomEvent("woodshed:coach")); }
    else onAction(a);
  };
  useEffect(() => {
    // a clicked button keeps focus; Space only presses buttons reached from the keyboard
    let viaPointer = false;
    const onPointer = () => { viaPointer = true; };
    const onKey = (e) => {
      if (e.key === "Tab") viaPointer = false;
      const a = actionFor(e, contextOf(e.target, viaPointer));
      if (!a) return;
      e.preventDefault();
      run.current(a);
    };
    window.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}

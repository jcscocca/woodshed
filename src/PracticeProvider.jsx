import React, { createContext, useContext, useEffect, useState } from "react";
import { useMetronome } from "./useMetronome.js";
import { RESET_WATCH } from "./stopwatch.js";

const PracticeContext = createContext(null);
export const usePractice = () => useContext(PracticeContext);

// Owns the metronome and stopwatch so they outlive any one panel and a layout
// switch. The app tree arrives as `children`, so the metronome's per-beat state
// re-renders only components that call usePractice(), not the whole app.
export function PracticeProvider({ onTempo, children }) {
  const metro = useMetronome(90, 4);
  const [watch, setWatch] = useState(RESET_WATCH);
  const [coursePlaying, setCoursePlaying] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);

  // The open course lesson owns the visible tempo and transport. Stop a
  // standalone click when that ownership changes, before any lesson playback.
  useEffect(() => { if (activeLesson) metro.stop(); }, [activeLesson?.id, metro.stop]);

  // remember the tempo while the metronome is running, to prefill the log
  useEffect(() => { if (metro.playing && onTempo) onTempo(metro.bpm); }, [metro.playing, metro.bpm, onTempo]);

  return <PracticeContext.Provider value={{ metro, watch, setWatch, coursePlaying, setCoursePlaying, activeLesson, setActiveLesson }}>{children}</PracticeContext.Provider>;
}

import React, { useEffect, useRef } from "react";
import PracticeTools from "./PracticeTools.jsx";
import { ListenPanel } from "./PracticeSheet.jsx";
import { usePractice } from "./PracticeProvider.jsx";

export default function PracticeRail({ lesson, scored, tunerOpen, onOpenTuner, onCloseSlot, open = true, onToggle }) {
  const { metro, activeLesson } = usePractice();
  const toggleRef = useRef(null), refocus = useRef(false);
  // the toggle is a different button open vs collapsed; keep focus on it across its own toggle
  useEffect(() => { if (refocus.current && toggleRef.current) toggleRef.current.focus(); refocus.current = false; }, [open]);
  const toggle = (e) => { refocus.current = e.currentTarget === document.activeElement; onToggle(); };
  if (!open) return (
    <aside className="ws-rail collapsed" aria-label="Practice">
      <button className="ws-rail-toggle" ref={toggleRef} onClick={toggle} aria-expanded="false" aria-label="Show metronome and timer">‹</button>
      <PracticeTools mini />
    </aside>
  );
  return (
    <aside className="ws-rail" aria-label="Practice">
      <button className="ws-rail-toggle" ref={toggleRef} onClick={toggle} aria-expanded="true" aria-label="Hide metronome and timer">›</button>
      <section className="ws-rail-tools">
        <PracticeTools hints compact stopwatchExtra={!tunerOpen && (
          <button className="ws-listen-open" disabled={activeLesson?.disabled} onClick={() => { if (activeLesson?.disabled) return; activeLesson?.stop(); metro.stop(); onOpenTuner(); }}>
            <span className="ws-listen-dot" /> Tuner <span className="ws-beta">beta</span>
          </button>
        )} />
      </section>
      <section className="ws-rail-slot">
        {lesson || tunerOpen ? (
          <>
            <div className="ws-rail-slot-head">
              <span className="ws-rail-label">{lesson ? (scored ? "Score" : "Lesson") : "Tuner"}</span>
              <button className="ws-x" onClick={onCloseSlot} aria-label={lesson ? "Close lesson" : "Close tuner"}>✕</button>
            </div>
            {lesson || <ListenPanel />}
          </>
        ) : (
          <p className="ws-rail-hint">{activeLesson ? <>Controls for <strong>{activeLesson.title}</strong>. Tempo and playback stay in sync with the lesson.</> : "Open a lesson in Guided Practice, Chords or Scales to begin. Use these tools for extra practice."}</p>
        )}
      </section>
    </aside>
  );
}

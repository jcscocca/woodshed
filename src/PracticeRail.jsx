import React from "react";
import PracticeTools from "./PracticeTools.jsx";
import { ListenPanel } from "./PracticeSheet.jsx";
import { usePractice } from "./PracticeProvider.jsx";

// Collapsing only hides the tools and slot, so an open lesson, coach run or tuner keeps running.
export default function PracticeRail({ lesson, scored, tunerOpen, onOpenTuner, onCloseSlot, open = true, onToggle }) {
  const { metro, activeLesson } = usePractice();
  return (
    <aside className={`ws-rail${open ? "" : " collapsed"}`} aria-label="Practice">
      <button className="ws-rail-toggle" onClick={onToggle} aria-expanded={open ? "true" : "false"} aria-label={open ? "Hide metronome and timer" : "Show metronome and timer"}>{open ? "›" : "‹"}</button>
      {!open && <PracticeTools mini />}
      <section className="ws-rail-tools" hidden={!open}>
        <PracticeTools hints compact stopwatchExtra={!tunerOpen && (
          <button className="ws-listen-open" disabled={activeLesson?.disabled} onClick={() => { if (activeLesson?.disabled) return; activeLesson?.stop(); metro.stop(); onOpenTuner(); }}>
            <span className="ws-listen-dot" /> Tuner <span className="ws-beta">beta</span>
          </button>
        )} />
      </section>
      <section className="ws-rail-slot" hidden={!open}>
        {lesson || tunerOpen ? (
          <>
            <div className="ws-rail-slot-head">
              <span className="ws-rail-label">{lesson ? (scored ? "Score" : "Lesson") : "Tuner"}</span>
              <button className="ws-x" onClick={onCloseSlot} aria-label={lesson ? "Close lesson" : "Close tuner"}>✕</button>
            </div>
            {lesson || <ListenPanel />}
          </>
        ) : activeLesson && (
          <p className="ws-rail-hint">Controls for <strong>{activeLesson.title}</strong>.</p>
        )}
      </section>
    </aside>
  );
}

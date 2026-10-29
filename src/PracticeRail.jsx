import React from "react";
import PracticeTools from "./PracticeTools.jsx";
import { ListenPanel } from "./PracticeSheet.jsx";
import { usePractice } from "./PracticeProvider.jsx";

export default function PracticeRail({ lesson, scored, tunerOpen, onOpenTuner, onCloseSlot }) {
  const { metro, activeLesson } = usePractice();
  return (
    <aside className="ws-rail" aria-label="Practice">
      <section className="ws-rail-tools">
        <PracticeTools hints compact stopwatchExtra={!tunerOpen && (
          <button className="ws-listen-open" disabled={activeLesson?.disabled} onClick={() => { activeLesson?.stop(); metro.stop(); onOpenTuner(); }}>
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

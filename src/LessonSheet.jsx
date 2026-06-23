import React, { useState, useEffect, useRef } from "react";
import { getLesson } from "./lessons/index.js";
import { shapeToVoices } from "./audio/notes.js";
import { playChords, playSequence, playClick, stop } from "./lessonAudio.js";
import { ChordDiagram, Keyboard, FretboardPattern } from "./diagrams.jsx";
import { INSTRUMENTS, TYPE_LABEL } from "./seed.js";
import CoachPanel from "./CoachPanel.jsx";
import { isCoachable } from "./audio/notes.js";

function ShapeView({ shape }) {
  if (!shape) return null;
  if (shape.kind === "chords")
    return <div className="ws-dg-row">{shape.chords.map((c) => <ChordDiagram key={c.name} instrument={shape.instrument} strings={c.strings} name={c.name} fingers={c.fingers} />)}</div>;
  if (shape.kind === "fretboard")
    return <div className="ws-dg-row"><FretboardPattern instrument={shape.instrument} baseFret={shape.baseFret} dots={shape.dots} /></div>;
  if (shape.kind === "keyboard")
    return <div className="ws-dg-row"><Keyboard notes={shape.notes} fingers={shape.fingers} /></div>;
  return null;
}

export default function LessonSheet({ item, href, onClose, sessions = [], onCoachResult, onRequestLog }) {
  const lesson = getLesson(item.id);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  // Tear down audio only on unmount, not on every parent re-render — onClose's
  // identity changes each render, and stopping there would cut a demo mid-play.
  useEffect(() => () => { clearTimeout(timer.current); stop(); }, []);
  if (!lesson) return null;
  const inst = INSTRUMENTS[item.inst];

  const hear = () => {
    clearTimeout(timer.current);
    if (playing) { stop(); setPlaying(false); return; }
    const { shape, bpm } = lesson;
    let ms;
    if (shape && shape.kind === "chords") ms = playChords(shapeToVoices(shape), { bpm: bpm || 70 });
    else if (shape) ms = playSequence(shapeToVoices(shape), { bpm: bpm || 80 });
    else ms = playClick({ bpm: bpm || 80 });
    setPlaying(true);
    timer.current = setTimeout(() => setPlaying(false), ms + 80);
  };

  return (
    <div className="ws-sheet-wrap" onClick={onClose}>
      <div className="ws-sheet ws-lesson" onClick={(e) => e.stopPropagation()}>
        <div className="ws-sheet-grip" />
        <div className="ws-lesson-tags">
          <span className="ws-inst-tag" style={{ color: inst ? inst.color : "var(--gold)" }}>{inst ? inst.name : item.inst}</span>
          <span className="ws-type-tag">{TYPE_LABEL[item.type]}</span>
        </div>
        <h2 className="ws-sheet-title">{item.title}</h2>
        <p className="ws-lesson-summary">{lesson.summary}</p>

        <ShapeView shape={lesson.shape} />

        {isCoachable(item, lesson) && onCoachResult && (
          <CoachPanel
            item={item}
            lesson={lesson}
            sessions={sessions}
            onLog={(res) => { onCoachResult(item.id, res); onRequestLog(); }}
          />
        )}

        <button className={`ws-btn ${playing ? "ghost" : "primary"} sm ws-hear`} onClick={hear} aria-pressed={playing}>
          {playing ? "■ Stop" : "▶ Hear it"}
        </button>

        {lesson.prescribe && <div className="ws-lesson-prescribe mono">{lesson.prescribe}</div>}

        <div className="ws-lesson-sec">
          <div className="ws-lesson-label">How to play it</div>
          <ol className="ws-lesson-steps">{lesson.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>

        {lesson.watch.length > 0 && (
          <div className="ws-lesson-sec">
            <div className="ws-lesson-label">Watch for</div>
            <ul className="ws-lesson-watch">{lesson.watch.map((w, i) => <li key={i}>{w}</li>)}</ul>
          </div>
        )}

        {item.link && href && <a className="ws-lesson-link" href={href} target="_blank" rel="noreferrer">↗ {item.link.label}</a>}

        <div className="ws-sheet-actions">
          <button className="ws-btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { useDialog } from "./useDialog.js";
import { getLesson, hasScore } from "./lessons/index.js";
import { shapeToVoices, shapeToTargets } from "./audio/notes.js";
import { playChords, playSequence, playClick, stop } from "./lessonAudio.js";
import { ChordDiagram, Keyboard, FretboardPattern } from "./diagrams.jsx";
import { INSTRUMENTS, TYPE_LABEL } from "./seed.js";
import CoachPanel from "./CoachPanel.jsx";
import EarPanel from "./EarPanel.jsx";
import { isCoachable } from "./audio/notes.js";
import { COACH_ENABLED } from "./features.js";
import { overlay } from "./midi/overlay.js";
import { useMidi } from "./midi/MidiProvider.jsx";
import ScoreSnippet from "./score/ScoreSnippet.jsx";

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

export function LessonBody({ item, href, sessions = [], onCoachResult, onRequestLog }) {
  const lesson = getLesson(item.id);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  // Tear down audio only on unmount, not on every parent re-render — a parent
  // callback's identity changes each render, and stopping there would cut a demo mid-play.
  useEffect(() => () => { clearTimeout(timer.current); stop(); }, []);
  const midi = useMidi();
  const pianoShape = item.inst === "piano" && lesson && lesson.shape && lesson.shape.kind === "keyboard" ? lesson.shape : null;
  useEffect(() => {
    if (!pianoShape) return;
    const shapeTargets = shapeToTargets(pianoShape).targets;
    const targets = pianoShape.hands === "together"
      ? shapeTargets.flatMap((t, i) => [{ midi: t.midis[0], finger: null }, { midi: t.midis[1], finger: pianoShape.fingers ? pianoShape.fingers[i] : null }])
      : shapeTargets.map((t, i) => ({ midi: t.midi, finger: pianoShape.fingers ? pianoShape.fingers[i] : null }));
    const midis = targets.map((t) => t.midi);
    overlay.set({ targets, range: [Math.min(...midis), Math.max(...midis)], statuses: null, next: [], readout: null, busy: false, hideTargets: false });
    return () => overlay.reset();
  }, [pianoShape]);
  if (!lesson) return null;
  const inst = INSTRUMENTS[item.inst];
  // Piano on the desktop is coached over MIDI only — never the mic.
  const source = midi && item.inst === "piano" ? (midi.status === "connected" ? "midi" : null) : COACH_ENABLED ? "mic" : null;
  const connectNote = midi && item.inst === "piano" && !source && (isCoachable(item, lesson) || lesson.ear) && (midi.status === "unsupported" ? "MIDI needs Chrome or Edge."
    : `${midi.status === "disconnected" ? "Keyboard disconnected. Plug it back in" : "Connect your keyboard"} to ${lesson.ear ? "train" : "coach"} this.`);

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
    <>
      <div className="ws-lesson-tags">
        <span className="ws-inst-tag" style={{ color: inst ? inst.color : "var(--gold)" }}>{inst ? inst.name : item.inst}</span>
        <span className="ws-type-tag">{TYPE_LABEL[item.type]}</span>
      </div>
      <h2 className="ws-sheet-title">{item.title}</h2>
      <p className="ws-lesson-summary">{lesson.summary}</p>
      {lesson.snippet && <ScoreSnippet abc={lesson.snippet} />}

      {!(pianoShape && midi && midi.status === "connected" && midi.bandOpen) && <ShapeView shape={lesson.shape} />}

      {source && isCoachable(item, lesson) && onCoachResult && onRequestLog && (
        <CoachPanel
          key={source}
          source={source}
          item={item}
          lesson={lesson}
          sessions={sessions}
          onLog={(res) => { onCoachResult(item.id, res); onRequestLog(); }}
        />
      )}

      {source && lesson.ear && onCoachResult && onRequestLog && (
        <EarPanel
          key={source}
          source={source}
          item={item}
          lesson={lesson}
          sessions={sessions}
          onLog={(res) => { onCoachResult(item.id, res); onRequestLog(); }}
        />
      )}

      {connectNote && <p className="ws-midi-connect-note">{connectNote}</p>}

      {!lesson.ear && (lesson.shape || lesson.bpm) && (
        <button className={`ws-btn ${playing ? "ghost" : "primary"} sm ws-hear`} onClick={hear} aria-pressed={playing}>
          {playing ? "■ Stop" : "▶ Hear it"}
        </button>
      )}

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
    </>
  );
}

export default function LessonSheet({ onClose, ...lessonProps }) {
  const dlgRef = useDialog(onClose);
  if (!getLesson(lessonProps.item.id)) return null;
  return (
    <div className="ws-sheet-wrap" onClick={onClose}>
      <div className="ws-sheet ws-lesson" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Lesson" tabIndex={-1}>
        <div className="ws-sheet-grip" />
        <LessonBody {...lessonProps} />
        {hasScore(getLesson(lessonProps.item.id)) && <p className="ws-midi-connect-note">Open on the desktop to read the score.</p>}
        <div className="ws-sheet-actions">
          <button className="ws-btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

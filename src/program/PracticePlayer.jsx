import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { usePractice } from "../PracticeProvider.jsx";
import { keepClefs, parseScore, walkTune } from "../score/scoreModel.js";
import { createLessonPlayback, planPlayback } from "./playback.js";
import PracticeRecorder from "./PracticeRecorder.jsx";
import KnowledgeChecks from "./KnowledgeChecks.jsx";
import { knowledgeForExercise } from "./knowledge.js";
import "./player.css";

const HANDS = [["R", "Right hand"], ["L", "Left hand"], ["both", "Both hands"]];
const initialMinutes = (exercise, minutes) => minutes ?? exercise.minutes ?? 5;

export default function PracticePlayer({ exercise, onLog, onClose, defaultMinutes, defaultRange, goal, previousAttempt }) {
  const id = useId();
  const practice = usePractice(), setCoursePlaying = practice?.setCoursePlaying;
  const [parsed, setParsed] = useState(null), [scoreError, setScoreError] = useState(null);
  const [audioError, setAudioError] = useState(null), [frame, setFrame] = useState(null), [mode, setMode] = useState(null);
  const [bpm, setBpm] = useState(exercise.bpm || 60), [hands, setHands] = useState(exercise.hands || "both");
  const [loop, setLoop] = useState(false), [referenceAlong, setReferenceAlong] = useState(false), [countIn, setCountIn] = useState(true);
  const [checked, setChecked] = useState([]), [assessment, setAssessment] = useState("practising");
  const [minutes, setMinutes] = useState(initialMinutes(exercise, defaultMinutes)), [note, setNote] = useState("");
  const [saving, setSaving] = useState(false), [saved, setSaved] = useState(false), [saveError, setSaveError] = useState(null);
  const [width, setWidth] = useState(600), [drawing, setDrawing] = useState(null);
  const [range, setRange] = useState(defaultRange || { from: 1, to: Infinity });
  const [recordingActive, setRecordingActive] = useState(false);
  const [knowledgeResults, setKnowledgeResults] = useState([]);
  const lessonRef = useRef(null), paperRef = useRef(null), playerRef = useRef(null), playRevision = useRef(0), mounted = useRef(true);

  useEffect(() => {
    // A saved block opens a new lesson. Bring its instructions into view rather
    // than leaving the learner scrolled down at the preceding review form.
    const frame = requestAnimationFrame(() => {
      lessonRef.current?.scrollIntoView({ block: "start" });
      lessonRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [exercise.id]);
  const saveGate = useRef({ busy: false, saved: false }), shortcutHandler = useRef(null), currentExercise = useRef(exercise.id);
  currentExercise.current = exercise.id;
  const edited = () => { saveGate.current.saved = false; setSaved(false); };

  const stop = () => {
    playRevision.current++;
    playerRef.current?.stop();
    setMode(null); setFrame(null);
  };

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; playRevision.current++; playerRef.current?.close(); playerRef.current = null; };
  }, []);

  useEffect(() => {
    setCoursePlaying?.(mode !== null || recordingActive);
    return () => setCoursePlaying?.(false);
  }, [mode, recordingActive, setCoursePlaying]);

  useEffect(() => {
    const handle = (event) => shortcutHandler.current?.(event);
    window.addEventListener("woodshed:program-shortcut", handle);
    return () => window.removeEventListener("woodshed:program-shortcut", handle);
  }, []);

  useEffect(() => {
    stop(); setParsed(null); setDrawing(null); setScoreError(null); setAudioError(null);
    setBpm(exercise.bpm || 60); setHands(exercise.hands || "both"); setChecked([]); setAssessment("practising");
    setMinutes(initialMinutes(exercise, defaultMinutes)); setNote(""); setSaved(false); setSaveError(null); setKnowledgeResults([]); setRange(defaultRange || { from: 1, to: Infinity });
    saveGate.current = { busy: false, saved: false };
    let live = true;
    if (exercise.abc) import("abcjs").then((mod) => {
      if (!live) return;
      try {
        const abcjs = mod.default ?? mod, score = parseScore(exercise.abc, abcjs);
        score.endBeat = walkTune(abcjs.parseOnly(exercise.abc)[0], () => {});
        setParsed({ abcjs, score });
      } catch { setScoreError("This score could not be loaded. You can still use the written practice steps and log your session."); }
    }).catch(() => { if (live) setScoreError("The score could not load. Check your connection and reopen the lesson."); });
    return () => { live = false; playRevision.current++; playerRef.current?.stop(); };
  }, [exercise.id, exercise.abc]);

  useLayoutEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(240, el.clientWidth));
    measure();
    if (typeof ResizeObserver === "undefined") { window.addEventListener("resize", measure); return () => window.removeEventListener("resize", measure); }
    const observer = new ResizeObserver(measure); observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;
    paper.replaceChildren();
    if (!parsed) return;
    try {
      // The accessible HTML heading already names the work. ABC's centered
      // title does not wrap, and long arrangement titles clip on phone widths.
      const displayAbc = exercise.abc.replace(/^T:[^\n]*(?:\n|$)/gm, "");
      const [tune] = parsed.abcjs.renderAbc(paper, displayAbc, {
        responsive: "resize", add_classes: true, selectTypes: false, afterParsing: keepClefs,
        staffwidth: Math.max(230, width - 25), paddingtop: 12, paddingbottom: 12,
        foregroundColor: "#f3eee5", wrap: { preferredMeasuresPerLine: width < 600 ? 2 : 4, minSpacing: 1.5, maxSpacing: 2.8 },
      });
      const marks = [], voiceHands = {};
      walkTune(tune, ({ el, beat, hand, voice, bar }) => {
        voiceHands[voice] = hand;
        if (el.abselem) marks.push({ beat, hand, bar, rest: !!el.rest, els: el.abselem.elemset || [] });
      });
      const decorations = [...paper.querySelectorAll('[class*="abcjs-v"]')].map((el) => ({ el, hand: voiceHands[Number(el.getAttribute("class").match(/abcjs-v(\d+)/)?.[1])] }));
      for (const svg of paper.querySelectorAll("svg")) { svg.setAttribute("role", "img"); svg.setAttribute("aria-label", `Written score for ${exercise.title}`); }
      setDrawing({ marks, decorations });
    } catch { setScoreError("The score could not be drawn. The written practice steps are available below."); }
  }, [parsed, exercise.abc, width]);

  useLayoutEffect(() => {
    if (!drawing) return;
    for (const { el, hand } of drawing.decorations) el.classList.toggle("ws-player-dim", !!hand && hands !== "both" && hand !== hands);
    for (const mark of drawing.marks) for (const el of mark.els) {
      el.classList.toggle("ws-player-dim", (hands !== "both" && mark.hand !== hands) || mark.bar < range.from || mark.bar > range.to);
      el.classList.toggle("ws-player-current", frame?.phase === "playing" && !mark.rest && frame.activeKeys.includes(`${mark.hand}:${mark.beat}`) && (hands === "both" || mark.hand === hands));
    }
  }, [drawing, hands, range, frame?.activeSignature, frame?.phase]);

  const play = async (nextMode, atBpm) => {
    if (recordingActive || saving) return;
    stop(); setAudioError(null);
    if (!parsed) return;
    practice?.metro?.stop();
    const token = playRevision.current;
    try {
      const plan = planPlayback(parsed.score, { bpm: atBpm, hands, countIn, ...range, soundNotes: nextMode !== "along" || referenceAlong, metronome: nextMode === "along" });
      if (!playerRef.current) playerRef.current = createLessonPlayback();
      setMode(nextMode);
      await playerRef.current.start(plan, {
        loop,
        onFrame: (next) => { if (mounted.current && token === playRevision.current) setFrame((prev) => !prev || prev.phase !== next.phase || prev.activeSignature !== next.activeSignature || prev.onsetBeat !== next.onsetBeat || prev.count !== next.count || prev.pass !== next.pass || Math.abs(prev.progress - next.progress) >= 0.01 ? next : prev); },
        onEnd: () => { if (mounted.current && token === playRevision.current) { setMode(null); setFrame(null); } },
      });
    } catch (error) { if (mounted.current && token === playRevision.current) { setAudioError(error.message || "Audio could not start. Try again."); setMode(null); } }
  };

  const save = async (event) => {
    event.preventDefault();
    if (recordingActive || saveGate.current.busy || saveGate.current.saved || !onLog) return;
    const gate = saveGate.current, exerciseId = exercise.id;
    gate.busy = true;
    stop(); setSaveError(null); setSaving(true);
    try {
      await onLog({ exerciseId: exercise.id, skillIds: exercise.skillIds || [], assessment, minutes: Number(minutes), bpm: Number(bpm), hands, note: note.trim(), section: exercise.section,
        fromBar: range.from, toBar: Math.min(range.to, parsed?.score.bars.length || range.from), checks: checked.map((index) => exercise.checks[index]), goal, knowledgeResults });
      gate.saved = true;
      if (mounted.current && currentExercise.current === exerciseId) setSaved(true);
    } catch { if (mounted.current && currentExercise.current === exerciseId) setSaveError("Your practice could not be saved. Please try again."); }
    finally { gate.busy = false; if (mounted.current && currentExercise.current === exerciseId) setSaving(false); }
  };
  const changeHands = (value) => { stop(); setHands(value); edited(); };
  const target = exercise.targetBpm || exercise.bpm || 60;
  const slow = Math.max(20, Math.min(Number(bpm), Math.round(target * 0.65)));
  const ready = !!parsed && !scoreError;
  const availableHands = new Set(parsed?.score.notes.map((n) => n.hand) || []);
  const barLabel = (n) => exercise.pickup ? n === 1 ? "Pickup" : `Bar ${n - 1}` : `Bar ${n}`;
  const chooseRange = (value) => { stop(); setRange(value); edited(); };
  const hearQuestion = async (question) => {
    if (recordingActive || saving || !question.audio) return;
    stop(); setAudioError(null); practice?.metro?.stop();
    const token = playRevision.current;
    try {
      const plan = planPlayback({ beatsPerBar: 4, meter: [4, 4], bars: [{ n: 1, beat: 0 }], endBeat: question.audioBeats || 3, notes: question.audio }, { bpm: 60, countIn: false });
      if (!playerRef.current) playerRef.current = createLessonPlayback();
      setMode("listening");
      await playerRef.current.start(plan, { onEnd: () => { if (mounted.current && token === playRevision.current) setMode(null); } });
    } catch (error) { if (mounted.current && token === playRevision.current) { setAudioError(error.message || "The listening example could not start."); setMode(null); } }
  };
  // The app dispatches its shortcuts here before the legacy practice tools. A
  // ref keeps one stable listener while each event sees the current lesson/run.
  shortcutHandler.current = (event) => {
    const action = event.detail?.action || event.detail?.type;
    if (!["metronome", "coach", "bpm", "hands", "close", "tap"].includes(action)) return;
    event.preventDefault();
    if (action === "metronome" || action === "coach") { if (mode) stop(); else if (ready) play("along", Number(bpm)); }
    else if (action === "bpm") {
      stop(); setBpm((value) => Math.max(20, Math.min(160, Number(value) + (Number(event.detail?.delta) || 5)))); edited();
    } else if (action === "hands") {
      const choices = HANDS.map(([value]) => value).filter((value) => value === "both" || !parsed || availableHands.has(value));
      changeHands(choices[(choices.indexOf(hands) + 1) % choices.length]);
    } else if (action === "close") { stop(); onClose?.(); }
  };

  return (
    <article className="ws-practice-player" aria-labelledby={`${id}-title`} ref={lessonRef} tabIndex={-1}>
      <header className="ws-player-heading">
        <div><span className="ws-player-eyebrow">Guided piano practice{exercise.key ? ` · ${exercise.key}` : ""}</span><h2 id={`${id}-title`}>{exercise.title}</h2></div>
        {onClose && <button type="button" className="ws-player-button quiet" onClick={() => { stop(); onClose(); }}>Close lesson</button>}
      </header>
      <p className="ws-player-summary">{exercise.summary}</p>
      {goal && <p className="ws-player-goal"><strong>This visit:</strong> {goal}</p>}
      {previousAttempt && <details className="ws-player-previous"><summary>Your previous visit · {previousAttempt.date || "saved practice"}</summary><p>{previousAttempt.minutes} minutes{previousAttempt.bpm ? ` at ♩ = ${previousAttempt.bpm}` : ""} · {previousAttempt.hands === "R" ? "right hand" : previousAttempt.hands === "L" ? "left hand" : "both hands"} · {previousAttempt.assessment === "ready" ? "felt ready" : previousAttempt.assessment === "unsure" ? "felt unsure" : "still practising"}.</p>{previousAttempt.note && <p><strong>Your next step:</strong> {previousAttempt.note}</p>}<p>Try one uninterrupted return before the demo, then choose the specific join to repair today.</p></details>}
      <section className="ws-player-score-section" aria-label="Score and playback">
        <div className="ws-player-hand-controls" role="group" aria-label="Choose hands">
          {HANDS.map(([value, label]) => <button key={value} type="button" aria-pressed={hands === value} disabled={!!parsed && value !== "both" && !availableHands.has(value)} onClick={() => changeHands(value)}>{label}</button>)}
        </div>
        {parsed && <div className="ws-player-range" role="group" aria-label="Choose a passage">
          <label>From <select aria-label="First bar" value={range.from} onChange={(e) => chooseRange({ from: Number(e.target.value), to: Math.max(Number(e.target.value), Math.min(range.to, parsed.score.bars.length)) })}>{parsed.score.bars.map((bar) => <option key={bar.n} value={bar.n}>{barLabel(bar.n)}</option>)}</select></label>
          <label>Through <select aria-label="Last bar" value={Math.min(range.to, parsed.score.bars.length)} onChange={(e) => chooseRange({ from: Math.min(range.from, Number(e.target.value)), to: Number(e.target.value) })}>{parsed.score.bars.map((bar) => <option key={bar.n} value={bar.n}>{barLabel(bar.n)}</option>)}</select></label>
          <button type="button" className="ws-player-button quiet" onClick={() => chooseRange({ from: 1, to: Infinity })}>Whole score</button>
          {(exercise.passages || []).map((passage) => <button type="button" className="ws-player-button quiet" key={passage.label} onClick={() => chooseRange({ from: passage.from, to: passage.to })}>{passage.label}</button>)}
        </div>}
        {exercise.abc && !parsed && !scoreError && <p role="status">Loading the written score…</p>}
        {!exercise.abc && <p className="ws-player-caption">This is an away-from-the-keys exercise. Follow the steps below.</p>}
        {scoreError && <p role="alert" className="ws-player-error">{scoreError}</p>}
        <div className="ws-player-paper" ref={paperRef} />
        {ready && <>
          <div className="ws-player-tempo">
            <label htmlFor={`${id}-tempo`}>Practice tempo <span>♩ = {bpm}</span></label>
            <input id={`${id}-tempo`} type="range" min="20" max="160" value={bpm} onChange={(e) => { stop(); setBpm(Number(e.target.value)); edited(); }} />
            <span className="ws-player-caption">Suggested reference ♩ = {target}; begin wherever you can keep a steady pulse. The synthesized reference demonstrates notes and timing. Shape the dynamics and phrasing from the score and listening goals.</span>
          </div>
          <div className="ws-player-transport">
            <button type="button" className="ws-player-button" disabled={recordingActive || saving} onClick={() => play("slow", slow)}>Hear slowly · {slow}</button>
            <button type="button" className="ws-player-button" disabled={recordingActive || saving} onClick={() => play("reference", target)}>Hear reference · {target}</button>
            <button type="button" className="ws-player-button primary" disabled={recordingActive || saving} onClick={() => play("along", Number(bpm))}>Play along · {bpm}</button>
            <button type="button" className="ws-player-button" onClick={stop} disabled={!mode}>■ Stop</button>
          </div>
          <div className="ws-player-options">
            <label><input type="checkbox" checked={countIn} onChange={(e) => { stop(); setCountIn(e.target.checked); }} />{exercise.pickup && range.from === 1 ? "Count in to the pickup" : "One-bar count-in"}</label>
            <label><input type="checkbox" checked={loop} onChange={(e) => { stop(); setLoop(e.target.checked); }} />Repeat the excerpt</label>
            <label><input type="checkbox" checked={referenceAlong} onChange={(e) => { stop(); setReferenceAlong(e.target.checked); }} />Include reference while I play</label>
          </div>
          <div className="ws-player-position" aria-live="polite" aria-atomic="true">
            {mode === "listening" ? "Listening example · the lesson score is paused" : frame?.phase === "countin" ? `Count in: ${frame.count} of ${frame.countTotal}` : mode ? `${mode === "along" ? "Play along" : "Reference"} · ${barLabel(frame?.bar || range.from)}${loop ? ` · pass ${frame?.pass || 1}` : ""}` : "Ready to listen or play"}
            <span>Ungraded · no keyboard connection needed</span>
          </div>
          <div className="ws-player-progress" aria-hidden="true"><span style={{ width: `${(frame?.progress || 0) * 100}%` }} /></div>
        </>}
        {audioError && <p role="alert" className="ws-player-error">{audioError}</p>}
      </section>

      {exercise.fingering && <section className="ws-player-fingering"><h3>Where your hands go</h3><p>{exercise.fingering}</p></section>}
      <section className="ws-player-steps"><h3>Work through it</h3><ol>{(exercise.steps || []).map((step, i) => <li key={i}>{step}</li>)}</ol></section>
      {exercise.listenFor?.length > 0 && <section className="ws-player-listen"><h3>Listen for</h3><ul>{exercise.listenFor.map((item, i) => <li key={i}>{item}</li>)}</ul></section>}
      <KnowledgeChecks questions={knowledgeForExercise(exercise)} onResultsChange={setKnowledgeResults} onEdited={edited} onHear={hearQuestion} disabled={recordingActive || saving} />

      <PracticeRecorder fileName={`woodshed-${exercise.id}`} disabled={mode !== null || saving} onActivityChange={setRecordingActive} onBeforeRecord={() => { stop(); practice?.metro?.stop(); }} />

      <form onSubmit={save} className="ws-player-review">
        <h3>Review your practice</h3>
        <p className="ws-player-caption">Your own assessment. The moving score shows position; it does not listen to or score your playing.</p>
        {exercise.checks?.length > 0 && <fieldset><legend>What did you notice?</legend>{exercise.checks.map((check, i) => <label className="ws-player-check" key={i}><input type="checkbox" checked={checked.includes(i)} onChange={(e) => { setChecked((prev) => e.target.checked ? [...prev, i] : prev.filter((n) => n !== i)); edited(); }} />{check}</label>)}</fieldset>}
        <fieldset><legend>How does this goal feel?</legend><div className="ws-player-assessments">
          {[["practising", "Still practising"], ["ready", "Ready for a fresh check"], ["unsure", "Not sure yet"]].map(([value, label]) => <label key={value}><input type="radio" name={`${id}-assessment`} value={value} checked={assessment === value} onChange={() => { setAssessment(value); edited(); }} />{label}</label>)}
        </div></fieldset>
        <label className="ws-player-minutes" htmlFor={`${id}-minutes`}>Minutes practised <input id={`${id}-minutes`} type="number" min="1" max="240" step="1" required value={minutes} onChange={(e) => { setMinutes(e.target.value); edited(); }} /></label>
        <label className="ws-player-notes" htmlFor={`${id}-notes`}>One thing to try next time <textarea id={`${id}-notes`} rows="2" value={note} maxLength="2000" placeholder="For example: keep the left-hand note held through beat 4." onChange={(e) => { setNote(e.target.value); edited(); }} /></label>
        <button type="submit" className="ws-player-button primary" disabled={recordingActive || saving || saved || !onLog}>{saving ? "Saving…" : saved ? "Practice saved ✓" : "Save practice"}</button>
        {recordingActive && <p className="ws-player-caption">Finish or cancel the recording before saving this block.</p>}
        {saved && <p role="status" className="ws-player-saved">Saved as a self-assessed session.</p>}
        {saveError && <p role="alert" className="ws-player-error">{saveError}</p>}
      </form>
      {exercise.source && <section className="ws-player-source"><h3>About this music</h3><p>{exercise.source.url ? <a href={exercise.source.url} target="_blank" rel="noreferrer">{exercise.source.label}</a> : exercise.source.label}.</p>{exercise.source.scope && <p>{exercise.source.scope}</p>}{exercise.source.changes && <><p>Edition notes:</p>{Array.isArray(exercise.source.changes) ? <ul>{exercise.source.changes.map((change) => <li key={change}>{change}</li>)}</ul> : <p>{exercise.source.changes}</p>}</>}{exercise.why && <p>Why this piece: {exercise.why}</p>}</section>}
    </article>
  );
}

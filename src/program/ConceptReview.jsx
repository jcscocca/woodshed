import React, { useEffect, useId, useRef, useState } from "react";
import { usePractice } from "../PracticeProvider.jsx";
import { stop as stopLegacyAudio } from "../lessonAudio.js";
import KnowledgeChecks from "./KnowledgeChecks.jsx";
import { normalizeKnowledge } from "./knowledge.js";
import { readPracticeDraft, writePracticeDraft, clearPracticeDraft } from "./drafts.js";
import { createLessonPlayback, planPlayback } from "./playback.js";

// A changed question/version cannot inherit another question's answers or
// checked result. The inner component's identity also owns its local audio.
export default function ConceptReview(props) {
  const source = JSON.stringify(props.question);
  return <ConceptReviewTask key={`${props.exercise.id}:${source}`} {...props} source={source} />;
}

function ConceptReviewTask({ question, exercise, source, onLog, onClose }) {
  const id = useId(), practice = usePractice(), panel = useRef(null), player = useRef(null), revision = useRef(0), mounted = useRef(true);
  const identity = `${exercise.id}:knowledge:${question.id}`;
  const restored = useRef(readPracticeDraft(identity, source)).current;
  const [answers, setAnswers] = useState(restored?.answers || {});
  const validResults = (value) => normalizeKnowledge(value).filter((result) => result.questionId === question.id && result.version === question.version);
  const [results, setResults] = useState(() => validResults(restored?.results || []));
  const result = useRef(results[0] || null), dirty = useRef(!!restored), gate = useRef({ busy: false, saved: false });
  const [saving, setSaving] = useState(false), [saved, setSaved] = useState(false), [error, setError] = useState("");
  const [playing, setPlaying] = useState(false), [audioError, setAudioError] = useState("");
  const controls = useRef(null), close = useRef(onClose);
  close.current = onClose;

  const stop = () => { revision.current++; player.current?.stop(); if (mounted.current) setPlaying(false); };
  controls.current = { stop };
  const edited = () => { dirty.current = true; gate.current.saved = false; setSaved(false); };
  const receiveResults = (value) => { const next = validResults(value); result.current = next[0] || null; setResults(next); };

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; revision.current++; player.current?.close(); };
  }, []);
  useEffect(() => {
    if (dirty.current && !gate.current.saved) writePracticeDraft(identity, source, { answers, results });
  }, [identity, source, answers, results, saved]);
  useEffect(() => {
    const frame = globalThis.requestAnimationFrame?.(() => { panel.current?.scrollIntoView({ block: "start" }); panel.current?.focus({ preventScroll: true }); });
    return () => { if (frame !== undefined) globalThis.cancelAnimationFrame?.(frame); };
  }, []);

  const setActiveLesson = practice?.setActiveLesson, setCoursePlaying = practice?.setCoursePlaying;
  useEffect(() => {
    setActiveLesson?.({ id, title: "Understanding check", bpm: 60, beatsPer: 4, meterLabel: "Listening example", beat: -1, playing, disabled: true,
      setBpm() {}, tap() {}, start() {}, stop: () => controls.current?.stop() });
    return () => setActiveLesson?.((current) => current?.id === id ? null : current);
  }, [setActiveLesson, id, playing]);
  useEffect(() => { setCoursePlaying?.(playing); return () => setCoursePlaying?.(false); }, [setCoursePlaying, playing]);
  useEffect(() => {
    const handle = (event) => {
      const action = event.detail?.action || event.detail?.type;
      if (!["metronome", "coach", "bpm", "tap", "hands", "close"].includes(action)) return;
      event.preventDefault();
      if (["metronome", "coach", "close"].includes(action)) controls.current?.stop();
      if (action === "close") close.current?.();
    };
    globalThis.window?.addEventListener("woodshed:program-shortcut", handle);
    return () => globalThis.window?.removeEventListener("woodshed:program-shortcut", handle);
  }, []);

  const hear = async () => {
    if (gate.current.busy || !question.audio?.length) return;
    stop(); setAudioError(""); practice?.metro?.stop(); stopLegacyAudio();
    const token = revision.current;
    try {
      const plan = planPlayback({ beatsPerBar: 4, meter: [4, 4], bars: [{ n: 1, beat: 0 }], endBeat: question.audioBeats || 3, notes: question.audio }, { bpm: 60, countIn: false });
      player.current ||= createLessonPlayback();
      setPlaying(true);
      await player.current.start(plan, { onEnd: () => { if (mounted.current && revision.current === token) setPlaying(false); } });
    } catch {
      if (mounted.current && revision.current === token) { setAudioError("The listening example could not start. Try again, or continue with the written choices."); setPlaying(false); }
    }
  };
  const save = async () => {
    if (gate.current.busy || gate.current.saved || !result.current || !onLog) return;
    gate.current.busy = true; setSaving(true); setError(""); stop();
    try {
      await onLog({ exerciseId: exercise.id, section: "knowledge", minutes: 0, assessment: "unsure", knowledgeResults: [{ ...result.current }] });
      gate.current.saved = true; dirty.current = false; clearPracticeDraft(identity);
      if (mounted.current) setSaved(true);
    } catch { if (mounted.current) setError("Your understanding check could not be saved. Your answers are kept in this tab; try again."); }
    finally { gate.current.busy = false; if (mounted.current) setSaving(false); }
  };

  return <article className="ws-practice-player" ref={panel} tabIndex={-1} aria-labelledby={`${id}-title`}>
    <header className="ws-player-heading"><div><span className="ws-player-eyebrow">Understanding check</span><h2 id={`${id}-title`}>Revisit one musical idea</h2></div>
      <button type="button" className="ws-player-button quiet" onClick={() => { stop(); onClose?.(); }}>Close understanding check</button>
    </header>
    <p className="ws-player-summary">From {exercise.title}. This check records your understanding separately from your piano report. It adds no practice minutes or guided-block completion.</p>
    {restored && <p className="ws-player-caption" role="status">Your unfinished answers have been restored.</p>}
    <KnowledgeChecks questions={[question]} initialAnswers={restored?.answers} initialResults={restored?.results} onAnswersChange={setAnswers} onResultsChange={receiveResults} onEdited={edited} onHear={hear} disabled={saving} />
    {playing && <button type="button" className="ws-player-button" onClick={stop}>■ Stop listening example</button>}
    {audioError && <p className="ws-player-error" role="alert">{audioError}</p>}
    <div className="ws-player-review"><button type="button" className="ws-player-button primary" disabled={saving || saved || !results.length || !onLog} onClick={save}>{saving ? "Saving…" : saved ? "Understanding check saved ✓" : "Save understanding check"}</button>
      {!results.length && <p className="ws-player-caption">Choose an answer and check it above before saving.</p>}
      {saved && <p role="status" className="ws-player-saved">Understanding check saved separately from your piano practice.</p>}
      {error && <p className="ws-player-error" role="alert">{error}</p>}
    </div>
  </article>;
}

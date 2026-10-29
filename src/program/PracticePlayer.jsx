import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { usePractice } from "../PracticeProvider.jsx";
import { keepClefs, parseScore, walkTune } from "../score/scoreModel.js";
import { createLessonPlayback, planPlayback } from "./playback.js";
import PracticeRecorder from "./PracticeRecorder.jsx";
import KnowledgeChecks from "./KnowledgeChecks.jsx";
import { knowledgeForExercise } from "./knowledge.js";
import { stop as stopLegacyAudio } from "../lessonAudio.js";
import { readPracticeDraft, writePracticeDraft, clearPracticeDraft } from "./drafts.js";
import "./player.css";

const HANDS = [["R", "Right hand"], ["L", "Left hand"], ["both", "Both hands"]];
const initialMinutes = (exercise, minutes) => minutes ?? exercise.minutes ?? 5;
const initialBpm = (exercise, previousAttempt, reviewMode) => reviewMode && Number.isFinite(previousAttempt?.bpm) && previousAttempt.bpm > 0
  ? Math.max(20, Math.min(160, previousAttempt.bpm)) : exercise.bpm || 60;
const initialHands = (exercise, previousAttempt, reviewMode) => reviewMode && HANDS.some(([value]) => value === previousAttempt?.hands)
  ? previousAttempt.hands : exercise.hands || "both";
const RETURN_LABELS = { ready: "Felt steady", practising: "Needs more work", unsure: "Not sure yet" };
const initialFollowScore = () => !globalThis.window?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const initialScoreScale = (value) => [1, 1.25, 1.5].includes(value) ? value : 1;
const boundedRange = (value, bars) => {
  const end = Math.max(1, bars), from = Number.isInteger(value?.from) && value.from > 0 ? Math.min(value.from, end) : 1;
  return { from, to: Math.max(from, Number.isInteger(value?.to) && value.to > 0 ? Math.min(value.to, end) : end) };
};

export default function PracticePlayer({ exercise, onLog, onClose, defaultMinutes, defaultRange, goal, previousAttempt, reviewMode = false, transferMode = false, reviewNote, draftKey }) {
  const id = useId();
  const practice = usePractice(), setCoursePlaying = practice?.setCoursePlaying, setActiveLesson = practice?.setActiveLesson;
  const identity = draftKey || `${exercise.id}:${exercise.transferId || (reviewMode ? "review" : "direct")}`;
  const draftSource = useRef(null);
  if (draftSource.current?.identity !== identity || draftSource.current?.abc !== exercise.abc) draftSource.current = { identity, abc: exercise.abc, value: readPracticeDraft(identity, exercise.abc) };
  const draft = draftSource.current.value;
  const [parsed, setParsed] = useState(null), [scoreError, setScoreError] = useState(null);
  const [audioError, setAudioError] = useState(null), [frame, setFrame] = useState(null), [mode, setMode] = useState(null);
  const [bpm, setBpm] = useState(draft?.bpm ?? initialBpm(exercise, previousAttempt, reviewMode && !transferMode)), [hands, setHands] = useState(draft?.hands ?? initialHands(exercise, previousAttempt, reviewMode && !transferMode));
  const [loop, setLoop] = useState(draft?.loop ?? false), [referenceAlong, setReferenceAlong] = useState(draft?.referenceAlong ?? false), [countIn, setCountIn] = useState(draft?.countIn ?? true);
  const [followScore, setFollowScore] = useState(draft?.followScore ?? initialFollowScore());
  const [scoreScale, setScoreScale] = useState(initialScoreScale(draft?.scoreScale));
  const [checked, setChecked] = useState(draft?.checked ?? []), [assessment, setAssessment] = useState(draft?.assessment ?? "practising");
  const [minutes, setMinutes] = useState(draft?.minutes ?? initialMinutes(exercise, defaultMinutes)), [note, setNote] = useState(draft?.note ?? "");
  const [saving, setSaving] = useState(false), [saved, setSaved] = useState(false), [saveError, setSaveError] = useState(null);
  const [width, setWidth] = useState(600), [drawing, setDrawing] = useState(null);
  const [range, setRange] = useState(draft?.range || defaultRange || { from: 1, to: Infinity });
  const [recordingActive, setRecordingActive] = useState(false);
  const [knowledgeResults, setKnowledgeResults] = useState(draft?.knowledgeResults ?? []);
  const [knowledgeAnswers, setKnowledgeAnswers] = useState(draft?.knowledgeAnswers ?? {});
  const [reviewCheck, setReviewCheck] = useState(draft?.reviewCheck ?? null);
  const [restoredDraft, setRestoredDraft] = useState(!!draft);
  const firstCheck = useRef(draft?.reviewCheck ?? null), playbackRequested = useRef(draft?.playbackRequested ?? false);
  const dirtyDraft = useRef(!!draft), loadedDraft = useRef(draftSource.current), lessonControls = useRef(null);
  const lessonRef = useRef(null), paperRef = useRef(null), scoreViewportRef = useRef(null), playerRef = useRef(null), playRevision = useRef(0), mounted = useRef(true);
  const taps = useRef([]);

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
  const edited = () => { dirtyDraft.current = true; saveGate.current.saved = false; setSaved(false); };

  useEffect(() => {
    if (!dirtyDraft.current || saveGate.current.saved || loadedDraft.current !== draftSource.current) return;
    writePracticeDraft(identity, exercise.abc, { bpm, hands, loop, referenceAlong, countIn, followScore, scoreScale, checked, assessment, minutes, note, range, knowledgeResults, knowledgeAnswers, reviewCheck, playbackRequested: playbackRequested.current });
  }, [identity, exercise.abc, bpm, hands, loop, referenceAlong, countIn, followScore, scoreScale, checked, assessment, minutes, note, range, knowledgeResults, knowledgeAnswers, reviewCheck, mode, audioError]);

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
    const restored = draftSource.current.value;
    loadedDraft.current = draftSource.current; dirtyDraft.current = !!restored; setRestoredDraft(!!restored);
    setBpm(restored?.bpm ?? initialBpm(exercise, previousAttempt, reviewMode && !transferMode)); setHands(restored?.hands ?? initialHands(exercise, previousAttempt, reviewMode && !transferMode)); setChecked(restored?.checked ?? []); setAssessment(restored?.assessment ?? "practising");
    setMinutes(restored?.minutes ?? initialMinutes(exercise, defaultMinutes)); setNote(restored?.note ?? ""); setSaved(false); setSaveError(null); setKnowledgeResults(restored?.knowledgeResults ?? []); setKnowledgeAnswers(restored?.knowledgeAnswers ?? {}); setRange(restored?.range || defaultRange || { from: 1, to: Infinity });
    setLoop(restored?.loop ?? false); setReferenceAlong(restored?.referenceAlong ?? false); setCountIn(restored?.countIn ?? true); setFollowScore(restored?.followScore ?? initialFollowScore()); setScoreScale(initialScoreScale(restored?.scoreScale));
    setReviewCheck(restored?.reviewCheck ?? null); firstCheck.current = restored?.reviewCheck ?? null; playbackRequested.current = restored?.playbackRequested ?? false;
    saveGate.current = { busy: false, saved: false };
    let live = true;
    if (exercise.abc) import("abcjs").then((mod) => {
      if (!live) return;
      try {
        const abcjs = mod.default ?? mod, score = parseScore(exercise.abc, abcjs);
        score.endBeat = walkTune(abcjs.parseOnly(exercise.abc)[0], () => {});
        setRange(boundedRange(restored?.range || defaultRange, score.bars.length));
        const wanted = restored?.hands ?? initialHands(exercise, previousAttempt, reviewMode && !transferMode), available = new Set(score.notes.map((note) => note.hand));
        if (wanted !== "both" && !available.has(wanted)) setHands(available.has(exercise.hands) ? exercise.hands : "both");
        setParsed({ abcjs, score });
      } catch { setScoreError("This score could not be loaded. You can still use the written practice steps and log your session."); }
    }).catch(() => { if (live) setScoreError("The score could not load. Check your connection and reopen the lesson."); });
    return () => { live = false; playRevision.current++; playerRef.current?.stop(); };
  }, [exercise.id, exercise.abc, reviewMode, transferMode, identity]);

  useLayoutEffect(() => {
    const el = scoreViewportRef.current;
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

  useEffect(() => {
    if (!drawing || !followScore || !mode || mode === "listening") return;
    // Keep the current grand-staff system visible, including during a passage's
    // count-in. Scroll only at bar changes and only when its system is obscured.
    const bar = frame?.phase === "playing" ? frame.bar : range.from;
    const mark = drawing.marks.find((item) => item.bar === bar && (hands === "both" || item.hand === hands));
    const element = mark?.els.find((el) => el.closest?.(".abcjs-staff-wrapper"));
    const system = element?.closest(".abcjs-staff-wrapper");
    if (!system) return;
    const rect = system.getBoundingClientRect();
    const container = paperRef.current?.closest(".ws-desk-main");
    const bounds = container?.getBoundingClientRect();
    const top = (bounds?.top || 0) + 210, bottom = (bounds?.bottom || window.innerHeight) - 105;
    if (rect.top < top || rect.bottom > bottom) {
      // Immediate motion keeps notation steady once the count-in has begun.
      (container || window).scrollBy({ top: rect.top - top, behavior: "instant" });
    }
  }, [drawing, followScore, mode, frame?.phase, frame?.bar, range.from, hands]);

  const play = async (nextMode, atBpm) => {
    if (recordingActive || saving) return;
    playbackRequested.current = true; dirtyDraft.current = true;
    stop(); setAudioError(null);
    if (!parsed) return;
    practice?.metro?.stop();
    stopLegacyAudio();
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
        fromBar: range.from, toBar: Math.min(range.to, parsed?.score.bars.length || range.from), checks: checked.map((index) => exercise.checks[index]), goal, knowledgeResults,
        ...(reviewMode && firstCheck.current ? { [transferMode ? "transferCheck" : "reviewCheck"]: firstCheck.current } : {}),
        ...(transferMode && exercise.transferId ? { transferId: exercise.transferId } : {}) });
      gate.saved = true;
      clearPracticeDraft(identity); dirtyDraft.current = false;
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
    playbackRequested.current = true; dirtyDraft.current = true;
    stop(); setAudioError(null); practice?.metro?.stop(); stopLegacyAudio();
    const token = playRevision.current;
    try {
      const plan = planPlayback({ beatsPerBar: 4, meter: [4, 4], bars: [{ n: 1, beat: 0 }], endBeat: question.audioBeats || 3, notes: question.audio }, { bpm: 60, countIn: false });
      if (!playerRef.current) playerRef.current = createLessonPlayback();
      setMode("listening");
      await playerRef.current.start(plan, { onEnd: () => { if (mounted.current && token === playRevision.current) setMode(null); } });
    } catch (error) { if (mounted.current && token === playRevision.current) { setAudioError(error.message || "The listening example could not start."); setMode(null); } }
  };
  const recordFirstCheck = (value) => {
    if (!reviewMode || firstCheck.current || recordingActive || saving || mode || !parsed || scoreError) return;
    const passage = boundedRange(range, parsed.score.bars.length);
    const result = { assessment: value, beforeDemo: !playbackRequested.current, bpm: Number(bpm), hands, fromBar: passage.from, toBar: passage.to };
    firstCheck.current = result; setReviewCheck(result); setAssessment(value); edited();
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
    } else if (action === "tap") {
      if (recordingActive || saving) return;
      stop();
      const now = performance.now(), previous = taps.current.at(-1);
      taps.current = previous === undefined || now - previous > 4000 ? [now] : [...taps.current, now].slice(-8);
      if (taps.current.length > 1) {
        const average = (now - taps.current[0]) / (taps.current.length - 1);
        setBpm(Math.max(20, Math.min(160, Math.round(60000 / average)))); edited();
      }
    } else if (action === "hands") {
      const choices = HANDS.map(([value]) => value).filter((value) => value === "both" || !parsed || availableHands.has(value));
      changeHands(choices[(choices.indexOf(hands) + 1) % choices.length]);
    } else if (action === "close") { stop(); onClose?.(); }
  };

  // The rail and keyboard shortcuts use the same lesson transport. Read the
  // current callbacks through a ref so registering a controller cannot loop
  // when the provider updates its consumers.
  lessonControls.current = {
    setBpm: (value) => { if (recordingActive || saving) return; stop(); setBpm(Math.max(20, Math.min(160, Number(value)))); edited(); },
    tap: () => shortcutHandler.current?.({ detail: { action: "tap" }, preventDefault() {} }),
    start: () => play("along", Number(bpm)), stop,
  };
  const [meterTop, meterBottom] = parsed?.score.meter || [4, 4];
  const lessonPulse = meterBottom === 8 && meterTop > 3 && meterTop % 3 === 0 ? 1.5 : 4 / meterBottom;
  const lessonBeats = Math.max(1, Math.ceil((parsed?.score.beatsPerBar || 4) / lessonPulse));
  const currentBar = parsed?.score.bars.find((bar) => bar.n === frame?.bar);
  const firstBarLength = parsed ? (parsed.score.bars[1]?.beat ?? parsed.score.endBeat) - (parsed.score.bars[0]?.beat || 0) : 0;
  const pickupOffset = frame?.bar === 1 ? Math.max(0, (parsed?.score.beatsPerBar || 4) - firstBarLength) : 0;
  const lessonBeat = !mode || mode === "listening" || !frame ? -1 : frame.phase === "countin" ? (frame.count - 1) % lessonBeats : Math.floor(Math.max(0, frame.beat - (currentBar?.beat || 0) + pickupOffset) / lessonPulse) % lessonBeats;
  useEffect(() => {
    if (!setActiveLesson) return;
    setActiveLesson({ id, title: exercise.title, bpm: Number(bpm), beatsPer: lessonBeats, meterLabel: `${meterTop}/${meterBottom}`, beat: lessonBeat, playing: !!mode,
      disabled: recordingActive || saving || !ready,
      setBpm: (value) => lessonControls.current?.setBpm(value), tap: () => lessonControls.current?.tap(),
      start: () => lessonControls.current?.start(), stop: () => lessonControls.current?.stop() });
    return () => setActiveLesson((current) => current?.id === id ? null : current);
  }, [setActiveLesson, id, exercise.title, bpm, lessonBeats, meterTop, meterBottom, lessonBeat, mode, recordingActive, saving, ready]);

  return (
    <article className="ws-practice-player" aria-labelledby={`${id}-title`} ref={lessonRef} tabIndex={-1}>
      <header className="ws-player-heading">
        <div><span className="ws-player-eyebrow">Guided piano practice{exercise.key ? ` · ${exercise.key}` : ""}</span><h2 id={`${id}-title`}>{exercise.title}</h2></div>
        {onClose && <button type="button" className="ws-player-button quiet" onClick={() => { stop(); onClose(); }}>Close lesson</button>}
      </header>
      {restoredDraft && <p role="status" className="ws-player-caption">Unfinished practice restored. Your changes are kept in this tab until you save practice.</p>}
      {!reviewMode && <p className="ws-player-summary">{exercise.summary}</p>}
      {goal && <p className="ws-player-goal"><strong>This visit:</strong> {goal}</p>}
      {reviewMode && <section className="ws-player-return" aria-labelledby={`${id}-return-title`}>
        <div className="ws-player-eyebrow">{transferMode ? "Fresh example" : "Cumulative review"} · about 3 minutes</div>
        <h3 id={`${id}-return-title`}>{transferMode ? "Try the new example before playback" : "Try one return before playback"}</h3>
        <p>{transferMode ? "This is new music for a skill you have already practised. Preview the notes and count, try once before playback, then report the first attempt. Later tries are practice of this example, rather than another fresh reading." : "Use the written score and your last practice setup. Try this passage once, then report how that first attempt felt. You can listen and repair it afterward."}</p>
        {(reviewNote || previousAttempt?.note) && <p className="ws-player-return-note"><strong>Your next step:</strong> {reviewNote || previousAttempt.note}</p>}
        {reviewCheck ? <div className="ws-player-return-result" role="status">
          <strong>{transferMode ? "First fresh attempt" : "First return"}: {RETURN_LABELS[reviewCheck.assessment].toLowerCase()}.</strong>
          <span>{reviewCheck.hands === "R" ? "Right hand" : reviewCheck.hands === "L" ? "Left hand" : "Both hands"} · ♩ = {reviewCheck.bpm} · {barLabel(reviewCheck.fromBar)}{reviewCheck.toBar !== reviewCheck.fromBar ? `–${barLabel(reviewCheck.toBar)}` : ""}</span>
          <span>{reviewCheck.beforeDemo ? "Reported before playback." : "Reported after playback."} This first result will stay separate from how the rest of your practice goes.</span>
          <span>Save practice below to keep this self-assessment.</span>
        </div> : <>
          <div className="ws-player-return-choices" role="group" aria-label="How did your first return feel?">
            {Object.entries(RETURN_LABELS).map(([value, label]) => <button key={value} type="button" className="ws-player-button" disabled={!!mode || recordingActive || saving || !parsed || !!scoreError} onClick={() => recordFirstCheck(value)}>{label}</button>)}
          </div>
          <p className="ws-player-caption">Your report is optional. Playback stays available, and saving without a first report records practice only.</p>
        </>}
      </section>}
      {reviewMode && <p className="ws-player-summary"><strong>After your first attempt:</strong> {exercise.summary}</p>}
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
        {mode && mode !== "listening" && <div className="ws-player-follow-bar">
          <span>{frame?.phase === "countin" ? `Count in: ${frame.count} of ${frame.countTotal}` : `${mode === "along" ? "Play along" : "Reference"} · ${barLabel(frame?.bar || range.from)}`}</span>
          <button type="button" className="ws-player-button" onClick={stop}>■ Stop playback</button>
        </div>}
        {ready && <div className="ws-player-score-size"><label htmlFor={`${id}-score-size`}>Score size <select id={`${id}-score-size`} aria-label="Score size" value={scoreScale} onChange={(event) => { setScoreScale(Number(event.target.value)); edited(); }}><option value={1}>Fit width</option><option value={1.25}>125%</option><option value={1.5}>150%</option></select></label><p className="ws-player-caption" id={`${id}-score-help`}>Enlarge the notation if it feels small. At larger sizes, focus the score and use the arrow keys to scroll.</p></div>}
        <div className="ws-player-score-scroll" ref={scoreViewportRef} role={scoreScale > 1 ? "region" : undefined} aria-label={scoreScale > 1 ? "Enlarged written score" : undefined} aria-describedby={scoreScale > 1 ? `${id}-score-help` : undefined} tabIndex={scoreScale > 1 ? 0 : undefined}
          onKeyDown={(event) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown", " "].includes(event.key)) event.stopPropagation(); }}>
          <div className="ws-player-paper" ref={paperRef} style={{ width: `${scoreScale * 100}%` }} />
        </div>
        {ready && <>
          <div className="ws-player-tempo">
            <label htmlFor={`${id}-tempo`}>Practice tempo <span>♩ = {bpm}</span></label>
            <input id={`${id}-tempo`} type="range" min="20" max="160" value={bpm} aria-valuetext={`${bpm} quarter-note beats per minute`} aria-describedby={`${id}-tempo-help`} onChange={(e) => { stop(); setBpm(Number(e.target.value)); edited(); }} />
            <span className="ws-player-caption" id={`${id}-tempo-help`}>Suggested reference ♩ = {target}; begin wherever you can keep a steady pulse. The synthesized reference demonstrates notes and timing. Shape the dynamics and phrasing from the score and listening goals.</span>
          </div>
          <div className="ws-player-transport">
            <button type="button" className="ws-player-button" disabled={recordingActive || saving} onClick={() => play("slow", slow)}>Hear slowly · {slow}</button>
            <button type="button" className="ws-player-button" disabled={recordingActive || saving} onClick={() => play("reference", target)}>Hear reference · {target}</button>
            <button type="button" className="ws-player-button primary" disabled={recordingActive || saving} onClick={() => play("along", Number(bpm))}>Play along · {bpm}</button>
            <button type="button" className="ws-player-button" onClick={stop} disabled={!mode}>■ Stop</button>
          </div>
          <div className="ws-player-options">
            <label><input type="checkbox" checked={countIn} onChange={(e) => { stop(); setCountIn(e.target.checked); edited(); }} />{exercise.pickup && range.from === 1 ? "Count in to the pickup" : "One-bar count-in"}</label>
            <label><input type="checkbox" checked={loop} onChange={(e) => { stop(); setLoop(e.target.checked); edited(); }} />Repeat the excerpt</label>
            <label><input type="checkbox" checked={referenceAlong} onChange={(e) => { stop(); setReferenceAlong(e.target.checked); edited(); }} />Include reference while I play</label>
            <label><input type="checkbox" checked={followScore} onChange={(e) => { setFollowScore(e.target.checked); edited(); }} />Follow score while playing</label>
          </div>
          <p className="ws-sr-only" role="status" aria-live="polite" aria-atomic="true">{mode === "listening" ? "Listening example started." : mode === "along" ? "Play along started." : mode ? "Reference playback started." : "Playback stopped. Ready to listen or play."}</p>
          <div className="ws-player-position">
            {mode === "listening" ? "Listening example · the lesson score is paused" : frame?.phase === "countin" ? `Count in: ${frame.count} of ${frame.countTotal}` : mode ? `${mode === "along" ? "Play along" : "Reference"} · ${barLabel(frame?.bar || range.from)}${loop ? ` · pass ${frame?.pass || 1}` : ""}` : "Ready to listen or play"}
            <span>Ungraded · no keyboard connection needed</span>
          </div>
          <div className="ws-player-progress" aria-hidden="true"><span style={{ width: `${(frame?.progress || 0) * 100}%` }} /></div>
        </>}
        {audioError && <p role="alert" className="ws-player-error">{audioError}</p>}
      </section>

      {exercise.fingering && <section className="ws-player-fingering"><h3>Where your hands go</h3><p>{exercise.fingering}</p></section>}
      <section className="ws-player-steps"><h3>{reviewMode ? "After your first attempt: work through it" : "Work through it"}</h3>{reviewMode && <p className="ws-player-caption">Try the score once and report above before using these listening and repair steps.</p>}<ol>{(exercise.steps || []).map((step, i) => <li key={i}>{step}</li>)}</ol></section>
      {exercise.listenFor?.length > 0 && <section className="ws-player-listen"><h3>Listen for</h3><ul>{exercise.listenFor.map((item, i) => <li key={i}>{item}</li>)}</ul></section>}
      {!transferMode && <KnowledgeChecks key={identity} questions={knowledgeForExercise(exercise)} initialAnswers={draft?.knowledgeAnswers} initialResults={draft?.knowledgeResults} onAnswersChange={setKnowledgeAnswers} onResultsChange={setKnowledgeResults} onEdited={edited} onHear={hearQuestion} disabled={recordingActive || saving} />}

      <PracticeRecorder fileName={`woodshed-${exercise.id}`} disabled={mode !== null || saving} onActivityChange={setRecordingActive} onBeforeRecord={() => { stop(); practice?.metro?.stop(); stopLegacyAudio(); }} />

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

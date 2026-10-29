import React, { useRef, useState } from "react";
import { COURSE, UNITS, SESSIONS, ALL_SESSIONS, EXERCISES, HISTORY_EXERCISES, PLACEMENT, CATALOGUE, sessionsForUnit } from "./curriculum.js";
import { normalizeProgress, recordAttempt, exerciseProgress, sessionProgress, nextSession, editAttempt, removeAttempt } from "./progress.js";
import PracticePlayer from "./PracticePlayer.jsx";
import { guideForUnit } from "./guides.js";
import { QUESTION_BY_ID } from "./knowledge.js";
import { reviewQueue } from "./review.js";
import { guidedSessionPlan } from "./sessionPlan.js";
import { transferForExercise, TRANSFER_VARIANT_COUNT } from "./transfer.js";
import { todayStr, daysSince } from "../dateUtils.js";
import ScalePath from "./ScalePath.jsx";
import { SCALE_TRACK, SCALE_EXERCISES } from "./scales.js";
import { findPracticeDraftForSession } from "./drafts.js";
import ConceptReview from "./ConceptReview.jsx";
import { conceptReviewQueue } from "./conceptReview.js";
import { reviewWorkload, makeReviewVisit, reviewVisitProgress, readReviewVisit, saveReviewVisit, clearReviewVisit } from "./reviewVisits.js";
import { representativeReviewQueue, consolidationPolicy } from "./reviewSchedule.js";
import "./program.css";

const BY_ID = () => Object.fromEntries(HISTORY_EXERCISES.map((e) => [e.id, e]));
const runnableSession = (id) => ALL_SESSIONS.find((session) => session.id === id && Array.isArray(session.blocks));
const LABELS = { new: "New", ready: "Self-reported ready", practising: "Still practising", unsure: "Revisit with the demo" };
const TECHNIQUE_SCOPE = { chunk: "crossing or short chunk", ascent: "complete ascent", "round-trip": "complete up-and-down route" };
const SAFE_URL = (url) => /^https?:\/\//i.test(url || "") ? url : undefined;
const PLACEMENT_SUPPORT = { "place-pulse": "rhythm-long-short", "place-reading": "read-family-c", "place-coordination": "coord-held-bass" };
const scalePreference = (name, fallback) => {
  try { return sessionStorage.getItem(`woodshed:scales:${name}:v1`) || fallback; } catch { return fallback; }
};
const rememberScalePreference = (name, value) => {
  try { sessionStorage.setItem(`woodshed:scales:${name}:v1`, value); } catch { /* The current selection still works when storage is unavailable. */ }
};
// This stable ref runs when a finished lesson returns to the program home.
// Focus without scrolling first, then reveal the notice in whichever container
// owns the scroll (the desktop main panel or the mobile page).
const revealCompletion = (node) => {
  if (!node) return;
  node.focus({ preventScroll: true });
  node.scrollIntoView({ block: "start" });
};
const passageLabel = (attempt, exercise) => !attempt.fromBar ? "" : exercise?.pickup
  ? attempt.fromBar === 1 ? attempt.toBar === 1 ? "pickup" : `pickup–bar ${attempt.toBar - 1}` : `bars ${attempt.fromBar - 1}–${attempt.toBar - 1}`
  : `bars ${attempt.fromBar}–${attempt.toBar}`;

function UnitPicker({ unitId, onChange }) {
  return <label className="pg-unit-picker">Piano unit
    <select aria-label="Piano unit" value={unitId} onChange={(event) => onChange(event.target.value)}>
      {UNITS.map((unit) => <option key={unit.id} value={unit.id}>{`Unit ${unit.number} · ${unit.key}`}</option>)}
    </select>
  </label>;
}

function ExerciseCard({ exercise, progress, onOpen, minutes }) {
  const p = exerciseProgress(progress, exercise.id);
  return <article className="pg-card">
    <div className="pg-eyebrow">{exercise.section} · {minutes ?? exercise.minutes} min</div>
    <h3>{exercise.title}</h3><p>{exercise.summary}</p>
    <div className="pg-card-footer"><span className={`pg-status ${p.status}`}>{LABELS[p.status]}{p.practiceCount ? ` · ${p.practiceCount} visit${p.practiceCount === 1 ? "" : "s"}` : ""}</span>
      <button className="ws-btn ghost sm" onClick={onOpen}>Open lesson</button></div>
  </article>;
}

function UnitGuide({ unit, byId, onOpen }) {
  const guide = guideForUnit(unit);
  return <details className="pg-unit-guide"><summary>Music, preparation and return checks</summary>
    <p>{guide.materialNote}</p>
    {guide.prerequisites?.length > 0 && <><h3>Before this unit</h3><ul>{guide.prerequisites.map((item) => <li key={item}>{item}</li>)}</ul></>}
    {guide.moveOn?.length > 0 && <><h3>Before moving on</h3><p className="pg-muted">Try these on another visit, before listening to the demo. These are self-checks; all units remain open.</p><ul>{guide.moveOn.map((item) => <li key={item}>{item}</li>)}</ul></>}
    {guide.support?.length > 0 && <><h3>When it needs more time</h3><ul>{guide.support.map((item) => <li key={item}>{item}</li>)}</ul></>}
    {guide.musicIds?.length > 0 && <div className="pg-guide-music">{guide.musicIds.filter((id) => byId[id]).map((id) => <article key={id}><h3>{byId[id].title}</h3><p>{byId[id].why || byId[id].summary}</p><p className="pg-muted">{byId[id].source?.scope || byId[id].source?.label}</p><button className="ws-btn ghost sm" onClick={() => onOpen(id)}>Preview musical goal</button></article>)}</div>}
  </details>;
}

export function ProgramProgress({ progress, onChangeProgress }) {
  const p = normalizeProgress(progress), byId = BY_ID();
  const [visibleCount, setVisibleCount] = useState(15), [editing, setEditing] = useState(null), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const update = async (value) => {
    setBusy(true); setError("");
    try { await onChangeProgress(value); setEditing(null); }
    catch { setError("Your correction could not be saved. Try again."); }
    finally { setBusy(false); }
  };
  const history = p.attempts.filter((a) => a.section !== "placement");
  const practice = history.filter((a) => a.section !== "knowledge");
  const recent = practice.filter((a) => a.date && daysSince(a.date, todayStr()) >= 0 && daysSince(a.date, todayStr()) < 7);
  const minutes = recent.reduce((n, a) => n + a.minutes, 0);
  const resolvedSessions = UNITS.flatMap((unit) => sessionsForUnit(unit.id, p));
  const done = resolvedSessions.filter((session) => sessionProgress(p, session).done).length;
  return <section className="pg-progress" aria-label="Piano course progress">
    <div className="pg-eyebrow">Shared piano progress</div><h2>Your practice, across all sections</h2>
    <p className="pg-muted">Learner assessments record how the work felt. A completed session records practice, rather than a measured performance score.</p>
    <div className="pg-stats">
      <div><strong>{minutes}</strong><span>minutes in the last 7 days · goal 200</span></div>
      <div><strong>{new Set(recent.map((a) => a.date)).size}</strong><span>practice days · goal 5</span></div>
      <div><strong>{done}/{SESSIONS.length}</strong><span>course sessions completed</span></div>
    </div>
    <div className="pg-unit-progress">{UNITS.map((unit) => {
      const sessions = sessionsForUnit(unit.id, p), completed = sessions.filter((session) => sessionProgress(p, session).done).length;
      return <article key={unit.id}><div className="pg-eyebrow">Unit {unit.number}</div><h3>{unit.key}</h3><p>{completed} of {sessions.length} sessions completed</p><progress aria-label={`${unit.key} sessions completed`} value={completed} max={sessions.length} /></article>;
    })}</div>
    {history.length === 0 ? <p className="pg-muted">Start a lesson in Guided Practice, Chords or Scales. Your work will appear here.</p> : <ol className="pg-history">
      {p.attempts.map((a, index) => ({ ...a, index })).filter((a) => a.section !== "placement").reverse().slice(0, visibleCount).map((a) => <li key={a.index}>
        <div><strong>{a.section === "knowledge" ? "Understanding check: " : a.section === "transfer" ? "Fresh example: " : ""}{byId[a.exerciseId]?.title || a.exerciseId}</strong><span>{byId[a.exerciseId]?.key ? `${byId[a.exerciseId].key} · ` : ""}{a.date}{a.section === "knowledge" ? " · concept answers, separate from piano practice" : <> · {a.minutes} min · {a.hands === "R" ? "RH" : a.hands === "L" ? "LH" : a.hands === "separate" ? "Hands separately" : "Both hands"}{a.bpm ? ` · ${a.bpm} bpm` : ""}{a.fromBar ? ` · ${passageLabel(a, a.section === "transfer" ? null : byId[a.exerciseId])}` : ""}</>}</span>{byId[a.exerciseId]?.archived && <p className="pg-muted">Earlier practice · kept in your history.</p>}{a.goal && <p>Goal: {a.goal}</p>}{a.note && <p>{a.note}</p>}
          {a.techniqueScope && <p className="pg-technique-scope">Reported technique scope: {TECHNIQUE_SCOPE[a.techniqueScope]}.</p>}
          {a.checks?.length > 0 && <details><summary>Self-checks you observed ({a.checks.length})</summary><ul>{a.checks.map((check) => <li key={check}>{check}</li>)}</ul></details>}
          {a.section === "review" && <p className="pg-return-evidence">{a.reviewCheck
            ? `First return ${a.reviewCheck.beforeDemo ? "before playback" : "with playback"}: ${a.reviewCheck.assessment === "ready" ? "felt steady" : a.reviewCheck.assessment === "unsure" ? "not sure yet" : "needed more work"}. Self-reported, separately from the final practice assessment.`
            : "Cumulative review practice · no first-attempt check recorded."}
            {a.reviewCheck && <span>{a.reviewCheck.hands ? `First check: ${a.reviewCheck.hands === "R" ? "RH" : a.reviewCheck.hands === "L" ? "LH" : a.reviewCheck.hands === "separate" ? "hands separately" : "both hands"}` : "First check"}{a.reviewCheck.bpm ? ` · ${a.reviewCheck.bpm} bpm` : ""}{a.reviewCheck.fromBar ? ` · ${passageLabel(a.reviewCheck, byId[a.exerciseId])}` : ""}{a.reviewCheck.techniqueScope ? ` · ${TECHNIQUE_SCOPE[a.reviewCheck.techniqueScope]}` : ""}</span>}
          </p>}
          {a.section === "transfer" && <p className="pg-return-evidence">{a.transferCheck
            ? `First try of the fresh example ${a.transferCheck.beforeDemo ? "before playback" : "with playback"}: ${a.transferCheck.assessment === "ready" ? "felt steady" : a.transferCheck.assessment === "unsure" ? "not sure yet" : "needed more work"}. Self-reported transfer evidence, separate from the original passage.`
            : "Fresh-example practice · no first-attempt transfer check recorded."}
            {a.transferCheck && <span>First check{a.transferCheck.hands ? `: ${a.transferCheck.hands === "R" ? "RH" : a.transferCheck.hands === "L" ? "LH" : "both hands"}` : ""}{a.transferCheck.bpm ? ` · ${a.transferCheck.bpm} bpm` : ""}{a.transferCheck.fromBar ? ` · ${passageLabel(a.transferCheck)}` : ""}</span>}
          </p>}
          {a.reviewForSession && <p>Included in guided session {ALL_SESSIONS.find((session) => session.id === a.reviewForSession)?.title || a.reviewForSession}.</p>}
          {a.reviewVisitId && <p>Saved in a consolidation visit · check {a.reviewVisitIndex + 1}.</p>}
          {a.knowledgeResults?.length > 0 && <details><summary>Understanding checks · {a.knowledgeResults.filter((result) => result.correct).length}/{a.knowledgeResults.length} correct</summary><ul>{a.knowledgeResults.map((result) => <li key={result.questionId}>{result.correct ? "✓ " : "Revisit: "}{QUESTION_BY_ID[result.questionId]?.prompt}</li>)}</ul><p>Written/listening answers are separate from your piano self-assessment.</p></details>}
          {onChangeProgress && (a.section === "knowledge" ? <button className="ws-btn ghost sm" disabled={busy} onClick={() => update(removeAttempt(p, a.index))}>Remove this understanding check</button> : <button className="ws-btn ghost sm" disabled={busy} onClick={() => { setError(""); setEditing({ ...a }); }}>Correct this practice</button>)}
          {editing?.index === a.index && <form className="pg-history-edit" onSubmit={(event) => { event.preventDefault(); try { update(editAttempt(p, a.index, { minutes: Number(editing.minutes), assessment: editing.assessment, note: editing.note || "", date: editing.date })); } catch (err) { setError(err.message); } }}>
            <label>Minutes <input aria-label="Correct minutes" required type="number" min="1" max="240" value={editing.minutes} onChange={(event) => setEditing({ ...editing, minutes: event.target.value })} /></label>
            <label>Date <input aria-label="Correct date" required type="date" value={editing.date || ""} onChange={(event) => setEditing({ ...editing, date: event.target.value })} /></label>
            <label>Assessment <select value={editing.assessment} onChange={(event) => setEditing({ ...editing, assessment: event.target.value })}>{["practising", "ready", "unsure"].map((value) => <option key={value} value={value}>{LABELS[value]}</option>)}</select></label>
            <label>Next step <textarea maxLength="2000" value={editing.note || ""} onChange={(event) => setEditing({ ...editing, note: event.target.value })} /></label>
            <div className="pg-actions"><button className="ws-btn primary sm" disabled={busy}>Save correction</button><button type="button" className="ws-btn ghost sm" disabled={busy} onClick={() => setEditing(null)}>Cancel</button><button type="button" className="ws-btn ghost sm" disabled={busy} onClick={() => update(removeAttempt(p, a.index))}>Remove this log</button></div>
            <p className="pg-muted">Removing the last log for a guided block makes that block available again.</p>
          </form>}
        </div><span className={`pg-status ${a.assessment}`}>{a.section === "knowledge" ? "Understanding recorded" : LABELS[a.assessment]}</span>
      </li>)}
    </ol>}
    {history.length > visibleCount && <button className="ws-btn ghost sm" onClick={() => setVisibleCount((count) => count + 30)}>Show earlier practice</button>}
    {error && <p role="alert" className="ws-player-error">{error}</p>}
  </section>;
}

export default function Program({ section, progress, onAttempt, onLegacyView, unitId = COURSE.id, onUnitChange, onChangeProgress }) {
  const p = normalizeProgress(progress), byId = BY_ID();
  const unit = UNITS.find((candidate) => candidate.id === unitId) || COURSE;
  const unitSessions = sessionsForUnit(unit.id, p);
  const retainedSessions = unitSessions.flatMap((session) => session.retainedPlan ? [session] : session.retainedEarlierPlan ? [session.retainedEarlierPlan] : []);
  const selectedSession = (id) => unitSessions.find((session) => session.id === id)
    || retainedSessions.find((session) => session.id === id) || runnableSession(id);
  const followingUnit = UNITS[UNITS.findIndex((candidate) => candidate.id === unit.id) + 1];
  const unitExerciseIds = new Set(unitSessions.flatMap((session) => session.blocks.map((block) => block.exerciseId)));
  const [active, setActive] = useState(null);
  const interactionRevision = useRef(0);
  const closeActive = () => { interactionRevision.current++; setActive(null); };
  const [saved, setSaved] = useState("");
  const [scaleView, setScaleView] = useState(() => scalePreference("collection", "unit") === "reference" ? "reference" : "unit");
  const [scaleStageId, setScaleStageId] = useState(() => scalePreference("pattern", "major:1"));
  const [scaleKey, setScaleKey] = useState(() => scalePreference("key", "first"));
  const changeScaleStage = (id) => { setScaleStageId(id); rememberScalePreference("pattern", id); };
  const changeScaleKey = (key) => { setScaleKey(key); rememberScalePreference("key", key); };
  const changeScaleView = (view) => { setScaleView(view); rememberScalePreference("collection", view); setSaved(""); };
  const next = nextSession(p, unitSessions);
  const placed = PLACEMENT.filter((id) => p.placement[id]).length;
  const needsSupport = PLACEMENT.filter((id) => p.placement[id] && p.placement[id] !== "ready");
  const transfers = p.attempts.filter((a) => a.section === "transfer" && a.transferId && a.minutes > 0 && a.date && a.date <= todayStr());
  const seenTransfers = new Set(transfers.map((a) => a.transferId));
  const rawDue = reviewQueue(p, EXERCISES, { limit: EXERCISES.length });
  const allDue = representativeReviewQueue(p, EXERCISES, { limit: EXERCISES.length, candidates: rawDue });
  const workload = reviewWorkload(allDue);
  const consolidation = consolidationPolicy(p);
  const recommendConsolidation = workload.consolidationRecommended && consolidation.recommendedAvailable;
  const storedVisit = readReviewVisit(EXERCISES);
  const pendingVisit = storedVisit && !reviewVisitProgress(p, storedVisit).done ? storedVisit : null;
  const concepts = conceptReviewQueue(p, EXERCISES, { includeUpcoming: true });
  const dueConcepts = concepts.filter((item) => item.dueDate <= todayStr());
  const review = allDue.slice(0, 3).map((item) => {
    let transferExercise = null;
    if (item.checksSinceTransfer >= 2) {
      for (let variant = 0; variant < TRANSFER_VARIANT_COUNT; variant++) {
        const candidate = transferForExercise(item.exercise, variant);
        if (candidate && !seenTransfers.has(candidate.transferId)) { transferExercise = candidate; break; }
      }
    }
    const previousTransfer = transfers.filter((a) => a.exerciseId === item.exercise.id).sort((a, b) => a.date.localeCompare(b.date)).at(-1);
    const transferRepairNote = previousTransfer && previousTransfer.date >= item.previousAttempt.date
      && (previousTransfer.assessment !== "ready" || previousTransfer.transferCheck?.assessment !== "ready") ? previousTransfer.note : null;
    return { ...item, transferExercise, transferRepairNote };
  });
  const scaleReviews = section === "scales" ? reviewQueue(p, SCALE_EXERCISES) : [];
  const resumedReview = (session) => {
    const draft = findPracticeDraftForSession(session);
    if (draft?.kind !== "review") return null;
    const exercise = byId[draft.exerciseId];
    if (!exercise || exercise.archived) return null;
    let transferExercise = null;
    if (draft.transferId) {
      for (let variant = 0; variant < TRANSFER_VARIANT_COUNT; variant++) {
        const candidate = transferForExercise(exercise, variant);
        if (candidate?.transferId === draft.transferId && candidate.abc === draft.abc) { transferExercise = candidate; break; }
      }
      if (!transferExercise) return null;
    }
    if ((transferExercise || exercise).abc !== draft.abc) return null;
    return { exercise, transferExercise, previousAttempt: exerciseProgress(p, exercise.id).lastAttempt };
  };
  const planFor = (session, reviews = [], resume = true) => guidedSessionPlan(p, session, reviews,
    { resumeReview: resume ? resumedReview(session) : null });
  const nextPlan = next && planFor(next, review);
  const hasReviewHistory = p.attempts.some((a) => a.section !== "placement" && a.section !== "knowledge" && byId[a.exerciseId]?.section !== "placement" && byId[a.exerciseId] && a.date && a.date <= todayStr());
  const open = (exerciseId, context = {}) => { if (!byId[exerciseId] || byId[exerciseId].archived) return; interactionRevision.current++; setSaved(""); setActive({ exerciseId, ...context }); };
  const openReview = (item, context = {}, useTransfer = true) => open(item.exercise.id, {
    reviewMode: true, previousAttempt: item.previousAttempt,
    transferExercise: useTransfer ? item.transferExercise : null, reviewNote: item.transferRepairNote ? `From your fresh example: ${item.transferRepairNote}` : null, ...context,
  });
  const openVisitCheck = (visit, index, currentProgress = p) => {
    const exercise = byId[visit.exerciseIds[index]];
    if (!exercise || exercise.archived) return;
    openReview({ exercise, previousAttempt: exerciseProgress(currentProgress, exercise.id).lastAttempt },
      { reviewVisitPlan: visit, reviewVisitIndex: index }, false);
  };
  const startReviewVisit = () => {
    const visit = pendingVisit || makeReviewVisit(allDue);
    if (!visit) return;
    saveReviewVisit(visit);
    const state = reviewVisitProgress(p, visit);
    if (state.nextIndex >= 0) openVisitCheck(visit, state.nextIndex);
  };
  const changeUnit = (id) => { closeActive(); setSaved(""); onUnitChange?.(id); };
  const startSession = (session, { skipReview = false } = {}) => {
    const state = sessionProgress(p, session), draft = findPracticeDraftForSession(session);
    const draftIndex = draft?.kind === "lesson" ? draft.blockIndex : session.retainedDraftBlockIndex;
    const index = !state.done && Number.isInteger(draftIndex) && !state.completedBlocks.includes(draftIndex) ? draftIndex : state.nextBlock ?? 0;
    const plan = planFor(session, skipReview ? [] : review, !skipReview);
    if (plan.review) {
      openReview(plan.review, { reviewForSession: session.id });
      return;
    }
    // A deliberate whole-session revisit is a fresh visit through every block.
    // Its remaining work must not be inferred from lifetime completion marks.
    open(session.blocks[index].exerciseId, { sessionId: session.id, blockIndex: index,
      ...(state.done ? { reviewBlocks: session.blocks.map((_, i) => i) } : {}) });
  };
  const startPlacement = () => {
    const index = PLACEMENT.findIndex((id) => !p.placement[id]);
    const i = index < 0 ? 0 : index;
    open(PLACEMENT[i], { placementIndex: i });
  };
  const save = async (entry) => {
    const revision = interactionRevision.current;
    if (active.sessionId && !runnableSession(active.sessionId) || active.reviewForSession && !runnableSession(active.reviewForSession)) throw new Error("This earlier lesson plan is no longer active. Reopen a current lesson before saving.");
    const exercise = active.transferExercise || byId[active.exerciseId];
    const isPlacement = active.placementIndex !== undefined;
    const logged = { ...entry, exerciseId: active.exerciseId, skillIds: exercise.skillIds,
      section: isPlacement ? "placement" : active.transferExercise ? "transfer" : active.reviewMode ? "review" : section,
      ...(active.transferExercise ? { transferId: exercise.transferId } : {}),
      ...(active.reviewForSession ? { reviewForSession: active.reviewForSession } : {}),
      ...(active.reviewVisitPlan ? { reviewVisitId: active.reviewVisitPlan.id, reviewVisitIndex: active.reviewVisitIndex } : {}),
      ...(active.sessionId ? { sessionId: active.sessionId, blockIndex: active.blockIndex } : {}) };
    const durable = await onAttempt(logged);
    const updated = durable?.attempts ? normalizeProgress(durable) : recordAttempt(p, logged);
    if (revision !== interactionRevision.current) return;
    if (active.reviewVisitPlan) {
      const state = reviewVisitProgress(updated, active.reviewVisitPlan);
      if (state.nextIndex >= 0) {
        openVisitCheck(active.reviewVisitPlan, state.nextIndex, updated);
        setSaved("Return saved. Continue with the next check in this consolidation visit.");
      } else {
        clearReviewVisit(); closeActive();
        setSaved("Consolidation visit saved. Your individual return reports are kept; no new course session was completed.");
      }
    } else if (active.reviewForSession) {
      const session = selectedSession(active.reviewForSession);
      const index = sessionProgress(updated, session).nextBlock;
      if (index !== null) {
        open(session.blocks[index].exerciseId, { sessionId: session.id, blockIndex: index });
        setSaved(`${active.transferExercise ? "Fresh check" : "Review"} saved within this session’s 20 minutes. Continue with the lesson blocks below.`);
      } else closeActive();
    } else if (isPlacement && active.placementIndex + 1 < PLACEMENT.length) {
      open(PLACEMENT[active.placementIndex + 1], { placementIndex: active.placementIndex + 1 });
    } else if (active.sessionId) {
      const session = selectedSession(active.sessionId);
      const completed = sessionProgress(updated, session).completedBlocks;
      const reviewBlocks = active.reviewBlocks?.filter((index) => index !== active.blockIndex);
      const i = reviewBlocks ? reviewBlocks[0] ?? -1 : session.blocks.findIndex((b, index) => index !== active.blockIndex && !completed.includes(index));
      if (i >= 0) {
        open(session.blocks[i].exerciseId, { sessionId: session.id, blockIndex: i, ...(reviewBlocks ? { reviewBlocks } : {}) });
        setSaved(`Saved: ${exercise.title}. Next block in this session:`);
      } else {
        closeActive();
        setSaved(`Session ${session.slot} saved. Return when you are ready for the next visit, or revisit any lesson below.`);
      }
    } else {
      closeActive();
      setSaved(isPlacement ? "Placement saved. Your first unit is open; use your check results to choose a comfortable starting point." : active.reviewMode
        ? `${active.transferExercise ? "Fresh check" : "Review"} saved: ${exercise.title}. Return to your guided session whenever you are ready.`
        : `Saved: ${exercise.title}. Your progress is shared across the piano program.`);
    }
  };

  if (active?.conceptQuestionId && byId[active.exerciseId] && QUESTION_BY_ID[active.conceptQuestionId] && !QUESTION_BY_ID[active.conceptQuestionId].archived) {
    return <div className="pg-root"><ConceptReview key={active.conceptQuestionId} question={QUESTION_BY_ID[active.conceptQuestionId]} exercise={byId[active.exerciseId]}
      onClose={closeActive} onLog={async (entry) => {
        const revision = interactionRevision.current;
        await onAttempt({ ...entry, section: "knowledge", minutes: 0 });
        if (revision !== interactionRevision.current) return;
        closeActive(); setSaved("Understanding check saved. A corrected idea will return on a later day before it is considered repaired.");
      }} /></div>;
  }

  if (active && byId[active.exerciseId] && !byId[active.exerciseId].archived
      && (!active.sessionId || runnableSession(active.sessionId)) && (!active.reviewForSession || runnableSession(active.reviewForSession))) {
    const session = selectedSession(active.sessionId);
    const reviewSession = selectedSession(active.reviewForSession);
    const sessionPlan = session && planFor(session, [], false);
    const exercise = active.transferExercise || byId[active.exerciseId];
    const previousAttempt = active.transferExercise ? null : active.reviewMode ? active.previousAttempt : exerciseProgress(p, active.exerciseId).lastAttempt;
    const defaultRange = active.reviewMode && !active.transferExercise && previousAttempt?.fromBar
      ? { from: previousAttempt.fromBar, to: previousAttempt.toBar }
      : session?.blocks[active.blockIndex]?.fromBar ? { from: session.blocks[active.blockIndex].fromBar, to: session.blocks[active.blockIndex].toBar }
        : exercise.trackId === SCALE_TRACK.id && previousAttempt?.fromBar ? { from: previousAttempt.fromBar, to: previousAttempt.toBar } : undefined;
    return <div className="pg-root">
      {saved && <p className="pg-notice" role="status">{saved}</p>}
      {session?.retainedPlan && <p className="pg-plan-note">Your earlier lesson plan is retained for this visit, including its saved block order and time allocation.</p>}
      {reviewSession && <div className="pg-session-bar"><span>{UNITS.find((candidate) => candidate.id === reviewSession.unitId)?.key} · Day {reviewSession.day} · Session {reviewSession.slot} · {active.transferExercise ? "Fresh check" : "Cumulative review"} · 3 of 20 min</span><strong>{reviewSession.title}</strong><p className="pg-muted">Seventeen minutes are reserved for this session’s lessons after the check.</p></div>}
      {session && <div className="pg-session-bar"><span>{UNITS.find((candidate) => candidate.id === session.unitId)?.key} · Day {session.day} · Session {session.slot} · Block {active.blockIndex + 1} of {session.blocks.length}</span><strong>{session.title}</strong></div>}
      {active.reviewVisitPlan && <div className="pg-session-bar"><span>Consolidation visit · check {active.reviewVisitIndex + 1} of {active.reviewVisitPlan.exerciseIds.length} · {active.reviewVisitPlan.minutes[active.reviewVisitIndex]} of 20 min</span><strong>Keep earlier music available</strong><p className="pg-muted">Return to each actual passage before playback, then repair one detail. This visit uses existing material and leaves course completion unchanged.</p></div>}
      {active.placementIndex !== undefined && <p className="pg-muted">Placement check {active.placementIndex + 1} of {PLACEMENT.length} · You can leave and resume later.</p>}
      {exercise.trackId === SCALE_TRACK.id && <p className="pg-muted">{session ? "This preparation is part of your selected music lesson. Its history is also available in the all-key reference." : "Optional scale reference · saved practice joins your shared history and return checks."}</p>}
      <PracticePlayer key={`${active.exerciseId}-${active.transferExercise?.transferId || (active.reviewMode ? "review" : active.sessionId || "direct")}-${active.reviewVisitPlan?.id || ""}-${active.reviewVisitIndex ?? active.blockIndex ?? ""}`} exercise={exercise} onLog={save} onClose={closeActive} defaultMinutes={active.reviewMode ? active.reviewVisitPlan?.minutes[active.reviewVisitIndex] || 3 : sessionPlan?.blocks[active.blockIndex]?.minutes}
        draftKey={`${active.exerciseId}:${active.transferExercise?.transferId || (active.placementIndex !== undefined ? "placement" : active.reviewMode ? "review" : "lesson")}:${active.reviewVisitPlan?.id || active.reviewForSession || active.sessionId || "direct"}:${active.reviewVisitIndex ?? active.blockIndex ?? ""}`}
        reviewMode={!!active.reviewMode} transferMode={!!active.transferExercise} reviewNote={active.reviewNote} goal={active.transferExercise ? "Try this new example of a familiar skill before playback. Keep this first result separate from later repairs." : active.reviewMode ? "Return to your previous passage, then choose one detail to repair." : session?.blocks[active.blockIndex]?.goal} previousAttempt={previousAttempt} defaultRange={defaultRange} reusePreviousScope={exercise.trackId === SCALE_TRACK.id} />
    </div>;
  }

  if (section === "progress") return <div className="pg-root"><ProgramProgress progress={p} onChangeProgress={onChangeProgress} /></div>;

  return <div className="pg-root">
    {saved && <div className="pg-notice" role="status" tabIndex={-1} ref={revealCompletion}><p>{saved}</p>{section === "guided" && next && <button className="ws-btn ghost sm" onClick={() => startSession(next)}>Continue to Day {next.day} · Session {next.slot}</button>}</div>}
    {section === "scales" && <>
      <header className="pg-hero"><div className="pg-eyebrow">Preparation for your music</div><h1>Scales, in musical context</h1><p>Recall the patterns used in your current unit. The all-key reference is available when you want another key, form or range.</p></header>
      <div className="pg-actions pg-scale-views" role="group" aria-label="Scale collections"><button className={`ws-btn ${scaleView === "unit" ? "primary" : "ghost"} sm`} aria-pressed={scaleView === "unit"} onClick={() => changeScaleView("unit")}>Unit scales</button><button className={`ws-btn ${scaleView === "reference" ? "primary" : "ghost"} sm`} aria-pressed={scaleView === "reference"} onClick={() => changeScaleView("reference")}>All-key reference</button></div>
    </>}
    {(section !== "scales" || scaleView === "unit") && <UnitPicker unitId={unit.id} onChange={changeUnit} />}
    {section === "guided" && <>
      <header className="pg-hero"><div className="pg-eyebrow">Your piano program · {`Unit ${unit.number}`}</div><h1>{unit.title}</h1><p>{unit.description}</p>
        <div className="pg-pills"><span>{unit.key}</span><span>{unit.daysPerWeek} days · 2 × 20 min</span><span>Works without MIDI</span></div>
      </header>
      <UnitGuide unit={unit} byId={byId} onOpen={open} />
      {concepts.length > 0 && <section className="pg-plan-note" aria-label="Understanding follow-up"><h2>Revisit an idea</h2><p>{dueConcepts.length ? `${dueConcepts.length} understanding ${dueConcepts.length === 1 ? "check needs" : "checks need"} another look. These answers have their own follow-up, separate from your piano assessment.` : "Your corrected answers are saved. Check them again on a later day to see what stayed available."}</p>
        {dueConcepts.slice(0, 3).map((item) => <div key={item.question.id}><h3>{item.question.prompt}</h3><p className="pg-muted">From {item.exercise.title} · last uncertain answer {item.lastWrongDate}</p><button className="ws-btn ghost sm" onClick={() => open(item.exercise.id, { conceptQuestionId: item.question.id })}>Revisit this idea</button></div>)}
      </section>}
      {retainedSessions.length > 0 && <section className="pg-plan-note" aria-label="Saved lesson plans"><p>Your earlier practice is kept on its original lesson plan. Saved completion and unfinished work are preserved; new visits use the current preparation for the music.</p><details><summary>Preview updated preparation</summary><p>Opening an updated visit records new practice without replacing your earlier completion.</p><div className="pg-actions">{retainedSessions.map((savedSession) => {
        const current = SESSIONS.find((candidate) => candidate.id === savedSession.currentSessionId);
        const updatedSelected = unitSessions.some((session) => session.id === current?.id);
        return current && <div key={current.id}>{updatedSelected && <><p>The updated Day {current.day} · Session {current.slot} is complete and counts once toward your course. Your earlier plan remains available.</p><button className="ws-btn ghost sm" onClick={() => startSession(savedSession)}>Resume earlier Day {savedSession.day} · Session {savedSession.slot}</button></>}<button className="ws-btn ghost sm" onClick={() => startSession(current)}>Open updated Day {current.day} · Session {current.slot}</button></div>;
      })}</div></details></section>}
      {unit.id === COURSE.id && <section className="pg-placement"><div><h2>{placed === PLACEMENT.length ? "Your starting-point checks are saved" : "Find a comfortable starting point"}</h2><p>A short check of rhythm, coordination and reading. Try each check, compare with its demonstration, then tell us how it felt. All lessons remain available.</p></div>
        <button className="ws-btn ghost" onClick={startPlacement}>{placed === PLACEMENT.length ? "Revisit placement" : placed ? `Resume placement · ${placed}/${PLACEMENT.length}` : "Start placement · 5–10 min"}</button>
      </section>}
      {unit.id === COURSE.id && placed > 0 && <section className="pg-placement-results" aria-label="Your placement results"><h2>Your starting-point notes</h2>
        <p className="pg-muted">{needsSupport.length ? "Begin with Day 1 A at a comfortable tempo. The lessons below target the areas you wanted to revisit." : placed === PLACEMENT.length ? "Your starting checks felt comfortable. Preview a later day or begin with Day 1 B's music; the full unit stays open." : "Finish the remaining checks when you are ready. Your reports are saved separately from practice time."}</p>
        <ul className="pg-placement-list">{PLACEMENT.filter((id) => p.placement[id]).map((id) => <li key={id}><div><strong>{byId[id].title.replace(/^Placement: /, "")}</strong><span className={`pg-status ${p.placement[id]}`}>{LABELS[p.placement[id]]}</span></div>
          <button className="ws-btn ghost sm" onClick={() => open(PLACEMENT_SUPPORT[id])}>Open supporting lesson</button></li>)}</ul>
      </section>}
      {hasReviewHistory && <section className="pg-cumulative-review" aria-label="Cumulative review">
        <div className="pg-eyebrow">Across your piano program</div><h2>Keep earlier skills alive</h2>
        {rawDue.length > 0 && <p className="pg-review-workload">{workload.dueCount} skill checks due · {rawDue.length} passages available for return · about {workload.estimatedMinutes} minutes of short checks · oldest passage {reviewWorkload(rawDue).oldestDaysOverdue} days overdue</p>}
        {(pendingVisit || recommendConsolidation) && <div className="pg-plan-note"><h3>{pendingVisit ? "Your consolidation visit is ready to resume" : "Make room for earlier music"}</h3><p>{pendingVisit ? "Your saved checks and the unfinished passage stay together in this visit." : "Use this twenty-minute visit for up to five due passages before adding more new work. At most one new consolidation visit is recommended each day, leaving the next regular lesson available. Returning to earlier music can extend the number of practice days."}</p><button className="ws-btn primary" onClick={startReviewVisit}>{pendingVisit ? "Resume consolidation visit" : "Start 20-minute consolidation visit"}</button></div>}
        {!pendingVisit && !recommendConsolidation && workload.consolidationRecommended && <p className="pg-muted">You have already made room for consolidation today. Continue with a regular lesson, repeat a comfortable passage, or use an individual return check below.</p>}
        {review.length > 0 ? <>
          <p className="pg-muted">Your next new guided session includes one three-minute check within its twenty minutes. Supported skills offer a fresh example after two steady returns; other passages return in their original form. You can also open any check here on its own.</p>
          <ul className="pg-review-list">{review.map((item) => <li key={item.exercise.id}>
            <div><span className="pg-eyebrow">{item.exercise.key || UNITS.find((candidate) => candidate.id === item.exercise.unitId)?.key} · 3 min</span>
              <h3>{item.transferExercise?.title || item.exercise.title}</h3><p>{item.transferExercise ? `New music for a familiar skill: ${item.exercise.title}` : item.reason}</p>
              <span className="pg-status">Last practised {item.previousAttempt.date}{item.previousAttempt.fromBar ? ` · ${passageLabel(item.previousAttempt, item.exercise)}` : ""}{item.previousAttempt.bpm ? ` · ${item.previousAttempt.bpm} bpm` : ""}</span>{item.familySize > 1 && <p className="pg-muted">A rotating example from {item.familySize} related preparations. Each passage keeps its own practice history.</p>}<p className="pg-muted">{transferForExercise(item.exercise, 0) ? "Fresh examples available for this skill after steady returns." : "Return to this written passage; this lesson has no generated fresh-example bank."}</p>
              {item.previousAttempt.note && <p className="pg-review-note">Your next step: {item.previousAttempt.note}</p>}
              {item.transferRepairNote && <p className="pg-review-note">Fresh-example repair: {item.transferRepairNote}</p>}
            </div><div className="pg-actions"><button className="ws-btn ghost sm" onClick={() => openReview(item)}>{item.transferExercise ? "Start fresh check" : "Start return check"}</button>{item.transferExercise && <button className="ws-btn ghost sm" onClick={() => openReview(item, {}, false)}>Revisit previous passage</button>}</div>
          </li>)}</ul>
        </> : <p className="pg-muted">{rawDue.length ? "Related work was checked recently. Rotating returns will be scheduled again; you can still reopen any individual lesson." : "No return checks are due today. Earlier work will come back here across all units as you continue practising."}</p>}
      </section>}
      {next ? <section className="pg-next"><div className="pg-eyebrow">Up next · {unit.key} · Day {next.day} / Session {next.slot}</div><h2>{next.title}</h2><p>{next.focus}</p>
        {nextPlan.review && <p className="pg-session-budget">3 min {nextPlan.review.transferExercise ? "fresh example" : "cumulative review"} + 17 min lesson practice · 20 min total</p>}
        {nextPlan.reviewDone && <p className="pg-session-budget">Review saved · lesson practice uses the remaining 17-minute allocation</p>}
        <div className="pg-actions"><button className={`ws-btn ${pendingVisit || recommendConsolidation ? "ghost" : "primary"}`} onClick={() => startSession(next)}>{(sessionProgress(p, next).started || findPracticeDraftForSession(next)) ? "Resume session" : "Start 20-minute session"}</button>{nextPlan.review && <button className="ws-btn ghost" onClick={() => startSession(next, { skipReview: true })}>Start without review</button>}</div></section>
        : <section className="pg-next"><h2>Your {unit.key} sessions are complete</h2><p>Revisit a lesson for a fresh check or choose another unit above.</p>{followingUnit && <button className="ws-btn primary" onClick={() => changeUnit(followingUnit.id)}>Continue to {followingUnit.key}</button>}</section>}
      <p className="pg-muted">Session A builds foundations. Session B applies them to music. Use two 20-minute visits on each of {unit.daysPerWeek} practice days, repeating a day whenever useful. These are rolling visits, rather than a deadline for mastering the material. Preview another unit whenever it helps.</p>
      <p className="pg-muted">Open a lesson directly for its listed practice time, or start a session to include due review within twenty minutes.</p>
      <div className="pg-days">{Array.from({ length: unit.daysPerWeek }, (_, i) => i + 1).map((day) => <section key={day} className="pg-day"><h2>Day {day}</h2><div className="pg-session-grid">{unitSessions.filter((s) => s.day === day).map((s) => {
        const state = sessionProgress(p, s);
        const plan = planFor(s);
        return <article className="pg-card" key={s.id}><div className="pg-eyebrow">Session {s.slot} · 20 min{state.done ? " · Completed" : ""}{s.retainedPlan ? " · Saved plan" : ""}</div><h3>{s.title}</h3><p>{s.focus}</p>
          {plan.reviewMinutes > 0 && <p className="pg-session-budget">{plan.reviewDone ? "✓ Review saved" : `3m ${plan.review?.transferExercise ? "fresh example" : "cumulative review"}`} · 17m lesson practice</p>}
          <ol className="pg-blocks">{plan.blocks.map((b, i) => <li key={i}><button onClick={() => open(b.exerciseId, { sessionId: s.id, blockIndex: i })}><span>{state.completedBlocks.includes(i) ? "✓ " : ""}{byId[b.exerciseId]?.title || b.exerciseId}{b.goal && <small className="pg-block-goal">{b.goal}</small>}</span><small>{b.minutes}m</small></button></li>)}</ol>
          <button className="ws-btn ghost sm" onClick={() => startSession(s)}>{state.done ? "Revisit session" : (state.started || findPracticeDraftForSession(s)) ? `Resume · ${state.completed}/${state.total} blocks` : "Open session"}</button>
        </article>;
      })}</div></section>)}</div>
    </>}
    {section === "chords" && <>
      <header className="pg-hero"><div className="pg-eyebrow">{unit.key} · Shared with Guided Practice</div><h1>Chords, in musical context</h1><p>{unit.key === "Across keys" ? "Recall familiar chords and inversions, then transfer them to another key and a complete musical phrase." : `Build related chords in ${unit.key}, connect them with small movements, and turn them into accompaniment.`}</p></header>
      <p className="pg-muted">Practice here counts toward a matching block in this key’s current guided session. Later reviews remain available.</p>
      <div className="pg-exercises">{EXERCISES.filter((e) => e.unitId === unit.id && e.section === section).map((e) => <ExerciseCard key={e.id} exercise={e} progress={p} onOpen={() => open(e.id)} />)}</div>
    </>}
    {section === "scales" && (scaleView === "reference"
      ? <ScalePath progress={p} stageId={scaleStageId} onStageChange={changeScaleStage} keyFilter={scaleKey} onKeyChange={changeScaleKey} preferredKey={unit.key} onOpen={open} reviews={scaleReviews} onOpenReview={(item) => openReview(item, {}, false)} />
      : <section aria-label="Unit scales"><div className="pg-eyebrow">Shared with Guided Practice</div><h2>{unit.key} scales</h2><p className="pg-muted">Recall the scale patterns that prepare this unit’s music. Each lesson includes fingering and listening goals; your practice stays in the same shared history.</p><div className="pg-exercises">{EXERCISES.filter((exercise) => (exercise.unitId === unit.id || unitExerciseIds.has(exercise.id)) && exercise.section === "scales").map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} progress={p} onOpen={() => open(exercise.id)} />)}</div></section>)}
    {section === "catalogue" && <>
      <header className="pg-hero"><div className="pg-eyebrow">Explore beyond the daily plan</div><h1>Your music catalogue</h1><p>Optional music and outside resources. The core lessons already contain their own score, demonstrations and instructions.</p></header>
      <div className="pg-exercises">{CATALOGUE.filter((c) => (c.kind === "external" && !c.unitId) || (c.unitId || byId[c.exerciseId]?.unitId) === unit.id).map((c) => {
        const ex = byId[c.exerciseId];
        const state = next && sessionProgress(p, next);
        const substitute = next?.blocks.findIndex((b, i) => !state.completedBlocks.includes(i) && c.substitutesFor?.includes(b.exerciseId));
        return <article className="pg-card" key={c.id}><div className="pg-eyebrow">{c.kind === "external" ? "External resource" : "Built-in music"}</div><h3>{c.title}</h3><p>{c.description}</p>
          {ex && <button className="ws-btn ghost sm" onClick={() => open(ex.id)}>Practise this music</button>}
          {ex && substitute >= 0 && <button className="ws-btn ghost sm" onClick={() => open(ex.id, { sessionId: next.id, blockIndex: substitute })}>Use in current guided session</button>}
          {SAFE_URL(c.url) && <a className="pg-link" href={SAFE_URL(c.url)} target="_blank" rel="noreferrer">Visit resource ↗</a>}
        </article>;
      })}</div>
      <section className="pg-placement"><div><h2>Existing piano repertoire and tools</h2><p>Explore the written classical pieces, pop charts, sight-reading generator and Your song editor from the earlier library.</p></div><div className="pg-actions"><button className="ws-btn ghost sm" onClick={() => onLegacyView("tracks")}>Browse repertoire tracks</button><button className="ws-btn ghost sm" onClick={() => onLegacyView("library")}>Open exercise library</button></div></section>
      <p className="pg-muted">The earlier scored tools use MIDI for grading. The new course lessons above work without a connected keyboard.</p>
    </>}
  </div>;
}

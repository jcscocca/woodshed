// Shared learner-reported progress for Chords, Scales and Guided Practice.
// A completed block means it was practised, not that a score proved mastery.
// Keep this model independent of course content so the same exercise id works
// from any section, and a session can be resumed after a save/reload.
import { todayStr } from "../dateUtils.js";
import { normalizeKnowledge } from "./knowledge.js";

export const ASSESSMENTS = ["ready", "practising", "unsure"];
export const TECHNIQUE_SCOPES = ["chunk", "ascent", "round-trip"];
const TECHNIQUE_SCOPE_SET = new Set(TECHNIQUE_SCOPES);
const ASSESSMENT_SET = new Set(ASSESSMENTS);
const HANDS = new Set(["both", "R", "L", "RH", "LH", "separate"]);
const object = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const id = (x) => typeof x === "string" && /^[a-z\d][a-z\d._:/-]{0,159}$/i.test(x) && !["__proto__", "constructor", "prototype"].includes(x) ? x : null;
const text = (x, max) => typeof x === "string" && x.trim() ? x.trim().slice(0, max) : null;
const nonnegative = (x, max) => typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= max ? x : 0;
const blockIndex = (x) => Number.isInteger(x) && x >= 0 && x < 1000 ? x : null;
const own = (x, key) => Object.prototype.hasOwnProperty.call(x, key);

function date(x) {
  if (typeof x !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return null;
  const d = new Date(`${x}T12:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === x ? x : null;
}

function firstCheck(raw) {
  if (!object(raw) || !ASSESSMENT_SET.has(raw.assessment) || typeof raw.beforeDemo !== "boolean") return null;
  const out = { assessment: raw.assessment, beforeDemo: raw.beforeDemo };
  if (TECHNIQUE_SCOPE_SET.has(raw.techniqueScope)) out.techniqueScope = raw.techniqueScope;
  if (typeof raw.bpm === "number" && Number.isFinite(raw.bpm) && raw.bpm > 0 && raw.bpm <= 400) out.bpm = raw.bpm;
  if (HANDS.has(raw.hands)) out.hands = raw.hands === "RH" ? "R" : raw.hands === "LH" ? "L" : raw.hands;
  if (Number.isInteger(raw.fromBar) && Number.isInteger(raw.toBar) && raw.fromBar > 0 && raw.toBar >= raw.fromBar && raw.toBar < 10000) {
    out.fromBar = raw.fromBar; out.toBar = raw.toBar;
  }
  return out;
}

function attempt(raw) {
  if (!object(raw) || !id(raw.exerciseId) || !ASSESSMENT_SET.has(raw.assessment)) return null;
  const out = {
    exerciseId: raw.exerciseId,
    skillIds: [...new Set((Array.isArray(raw.skillIds) ? raw.skillIds : []).filter(id))].slice(0, 30),
    assessment: raw.assessment,
    minutes: nonnegative(raw.minutes, 1440),
  };
  const section = text(raw.section, 80), note = text(raw.note, 2000), day = date(raw.date), goal = text(raw.goal, 500);
  if (section) out.section = section;
  if (TECHNIQUE_SCOPE_SET.has(raw.techniqueScope)) out.techniqueScope = raw.techniqueScope;
  if (note) out.note = note;
  if (goal) out.goal = goal;
  if (day) out.date = day;
  if (Number.isInteger(raw.fromBar) && Number.isInteger(raw.toBar) && raw.fromBar > 0 && raw.toBar >= raw.fromBar && raw.toBar < 10000) {
    out.fromBar = raw.fromBar; out.toBar = raw.toBar;
  }
  if (Array.isArray(raw.checks)) out.checks = [...new Set(raw.checks.map((value) => text(value, 500)).filter(Boolean))].slice(0, 20);
  if (Array.isArray(raw.knowledgeResults)) out.knowledgeResults = normalizeKnowledge(raw.knowledgeResults);
  if (typeof raw.bpm === "number" && Number.isFinite(raw.bpm) && raw.bpm > 0 && raw.bpm <= 400) out.bpm = raw.bpm;
  if (HANDS.has(raw.hands)) out.hands = raw.hands === "RH" ? "R" : raw.hands === "LH" ? "L" : raw.hands;
  // A return check records the first attempt separately from any repair that
  // follows. Old practice reports never acquire invented retention evidence.
  if (section === "review" || section === "transfer") {
    const field = section === "review" ? "reviewCheck" : "transferCheck", check = firstCheck(raw[field]);
    if (check) out[field] = check;
    if (id(raw.reviewForSession)) out.reviewForSession = raw.reviewForSession;
    if (section === "transfer" && id(raw.transferId)) out.transferId = raw.transferId;
    if (id(raw.reviewVisitId) && blockIndex(raw.reviewVisitIndex) !== null) {
      out.reviewVisitId = raw.reviewVisitId; out.reviewVisitIndex = raw.reviewVisitIndex;
    }
  }
  // An index without a session (or a session without its block) is not a
  // completion claim. Cumulative review is independent of the guided plan,
  // even when an imported report includes a session and block.
  if (section !== "review" && section !== "transfer" && section !== "knowledge" && id(raw.sessionId) && blockIndex(raw.blockIndex) !== null) {
    out.sessionId = raw.sessionId;
    out.blockIndex = raw.blockIndex;
  }
  return out;
}

function markBlock(completedBlocks, sessionId, index) {
  const blocks = own(completedBlocks, sessionId) ? completedBlocks[sessionId] : [];
  completedBlocks[sessionId] = [...new Set([...blocks, index])].sort((a, b) => a - b);
}

// Invalid optional data cannot turn into measured accuracy or readiness.
// The optional completionOnlyBlocks provenance preserves imported completion
// marks when a later review report is removed; it cannot create new marks.
export function normalizeProgress(raw) {
  const source = object(raw) ? raw : {};
  // Preserve every valid log: practice totals must not shrink as the learner
  // adds sessions. The persistence layer reports storage limits to the user.
  const attempts = (Array.isArray(source.attempts) ? source.attempts : []).map(attempt).filter(Boolean);
  const completedBlocks = {}, placement = {};
  if (object(source.completedBlocks)) {
    for (const [sessionId, values] of Object.entries(source.completedBlocks)) {
      if (!id(sessionId) || !Array.isArray(values)) continue;
      const blocks = [...new Set(values.filter((x) => blockIndex(x) !== null))].sort((a, b) => a - b);
      if (blocks.length) completedBlocks[sessionId] = blocks;
    }
  }
  if (object(source.placement)) {
    for (const [exerciseId, assessment] of Object.entries(source.placement)) {
      if (id(exerciseId) && ASSESSMENT_SET.has(assessment)) placement[exerciseId] = assessment;
    }
  }
  for (const a of attempts) {
    if (a.section === "placement") placement[a.exerciseId] = a.assessment;
    else if (a.sessionId) markBlock(completedBlocks, a.sessionId, a.blockIndex);
  }
  const completionOnlyBlocks = {};
  if (object(source.completionOnlyBlocks)) {
    for (const [sessionId, values] of Object.entries(source.completionOnlyBlocks)) {
      if (!id(sessionId) || !Array.isArray(values) || !own(completedBlocks, sessionId)) continue;
      const blocks = [...new Set(values.filter((value) => blockIndex(value) !== null && completedBlocks[sessionId].includes(value)))].sort((a, b) => a - b);
      if (blocks.length) completionOnlyBlocks[sessionId] = blocks;
    }
  }
  return { attempts, completedBlocks, placement, ...(Object.keys(completionOnlyBlocks).length ? { completionOnlyBlocks } : {}) };
}

// Appending is immutable. The UI confirms a learner's assessment; this function
// never infers it from elapsed minutes or automatically locks/unlocks content.
export function recordAttempt(progress, raw) {
  const entry = attempt(raw);
  if (!entry) throw new TypeError("A progress attempt needs an exerciseId and a valid learner assessment.");
  if (!entry.date) entry.date = todayStr();
  const next = normalizeProgress(progress);
  if (entry.section !== "placement" && entry.sessionId && own(next.completedBlocks, entry.sessionId) && next.completedBlocks[entry.sessionId].includes(entry.blockIndex)
      && !next.attempts.some((a) => a.section !== "placement" && a.sessionId === entry.sessionId && a.blockIndex === entry.blockIndex)) {
    // The old save knows this block was completed, but has no report to remove.
    // Keep that independent evidence before appending the new review report.
    next.completionOnlyBlocks ||= {};
    markBlock(next.completionOnlyBlocks, entry.sessionId, entry.blockIndex);
  }
  next.attempts = [...next.attempts, entry];
  if (entry.section === "placement") next.placement[entry.exerciseId] = entry.assessment;
  else if (entry.sessionId) markBlock(next.completedBlocks, entry.sessionId, entry.blockIndex);
  return next;
}

// Corrections change a report, never its exercise or guided-session identity.
export function editAttempt(progress, index, patch) {
  const next = normalizeProgress(progress);
  if (!Number.isInteger(index) || !next.attempts[index]) throw new RangeError("Choose a saved practice to edit.");
  const { minutes, assessment, note, date: day } = patch || {};
  const changes = Object.fromEntries(Object.entries({ minutes, assessment, note, date: day }).filter(([, value]) => value !== undefined));
  const entry = attempt({ ...next.attempts[index], ...changes });
  if (!entry || (minutes !== undefined && (!Number.isFinite(minutes) || minutes < 1 || minutes > 240)) || (day !== undefined && !date(day))) throw new TypeError("Use valid minutes, date and assessment.");
  next.attempts[index] = entry;
  return normalizeProgress(next);
}

export function removeAttempt(progress, index) {
  const next = normalizeProgress(progress);
  if (!Number.isInteger(index) || !next.attempts[index]) throw new RangeError("Choose a saved practice to remove.");
  const [entry] = next.attempts.splice(index, 1);
  // Remove only the completion associated with the removed report; remaining
  // reports for that block restore it during normalization. Other saved blocks
  // (including older imported completion-only records) retain their identity.
  const retained = next.completionOnlyBlocks && own(next.completionOnlyBlocks, entry.sessionId) && next.completionOnlyBlocks[entry.sessionId].includes(entry.blockIndex);
  if (entry.section !== "placement" && entry.sessionId && !retained) {
    next.completedBlocks[entry.sessionId] = (next.completedBlocks[entry.sessionId] || []).filter((value) => value !== entry.blockIndex);
  }
  if (entry.section === "placement") delete next.placement[entry.exerciseId];
  return normalizeProgress(next);
}

function summary(attempts, placement = null) {
  const practice = attempts.filter((a) => a.section !== "placement" && a.section !== "knowledge");
  // A fresh transfer example is practice of a related skill, not a new
  // readiness or passage claim about the original lesson.
  const sourceAttempts = attempts.filter((a) => a.section !== "transfer" && a.section !== "knowledge");
  const sourcePractice = practice.filter((a) => a.section !== "transfer");
  const placements = attempts.filter((a) => a.section === "placement");
  const lastAttempt = sourceAttempts[sourceAttempts.length - 1] || null;
  const lastPractice = sourcePractice[sourcePractice.length - 1] || null;
  const latestWith = (key) => [...sourcePractice].reverse().find((a) => a[key] !== undefined)?.[key] ?? null;
  return {
    attempts,
    count: attempts.length,
    practiceCount: practice.length,
    placementCount: placements.length,
    reviewCount: Math.max(0, practice.length - 1),
    minutes: practice.reduce((n, a) => n + a.minutes, 0),
    placementMinutes: placements.reduce((n, a) => n + a.minutes, 0),
    status: lastAttempt?.assessment || placement || "new",
    lastAttempt,
    lastPractised: lastPractice?.date || null,
    bpm: latestWith("bpm"),
    hands: latestWith("hands"),
  };
}

export function exerciseProgress(progress, exerciseId) {
  const p = normalizeProgress(progress);
  return summary(p.attempts.filter((a) => a.exerciseId === exerciseId), own(p.placement, exerciseId) ? p.placement[exerciseId] : null);
}

export function skillProgress(progress, skillId) {
  const p = normalizeProgress(progress);
  return summary(p.attempts.filter((a) => a.skillIds.includes(skillId)));
}

// Completion is explicit session evidence, not an exercise's latest readiness.
// Practising a chord directly still improves its shared exercise/skill summary,
// but does not silently skip that block of a guided session.
export function sessionProgress(progress, session, { today = todayStr() } = {}) {
  const p = normalizeProgress(progress);
  const total = Array.isArray(session?.blocks) ? session.blocks.length : 0;
  const sessionId = id(session?.id);
  const completedBlocks = sessionId && own(p.completedBlocks, sessionId) ? p.completedBlocks[sessionId].filter((i) => i < total) : [];
  const attempts = sessionId ? p.attempts.filter((a) => a.sessionId === sessionId && a.section !== "placement" && a.blockIndex < total) : [];
  const reviewAttempts = sessionId && total && date(today) ? p.attempts.filter((a) => a.reviewForSession === sessionId
    && (a.section === "review" || a.section === "transfer") && a.minutes > 0 && a.date && a.date <= today) : [];
  const nextBlock = Array.from({ length: total }, (_, i) => i).find((i) => !completedBlocks.includes(i)) ?? null;
  const uniqueBlocks = new Set(attempts.map((a) => a.blockIndex));
  return {
    completedBlocks,
    nextBlock,
    completed: completedBlocks.length,
    total,
    done: total > 0 && completedBlocks.length === total,
    started: completedBlocks.length > 0 || attempts.length > 0 || reviewAttempts.length > 0,
    attempts,
    ...(reviewAttempts.length ? { reviewAttempts } : {}),
    minutes: [...attempts, ...reviewAttempts].reduce((n, a) => n + a.minutes, 0),
    reviewCount: Math.max(0, attempts.length - uniqueBlocks.size),
  };
}

export function nextSession(progress, sessions) {
  if (!Array.isArray(sessions)) return null;
  return sessions.find((s) => id(s?.id) && Array.isArray(s.blocks) && s.blocks.length && !sessionProgress(progress, s).done) || null;
}

// Direct practice may satisfy its next occurrence in the current guided plan.
// It never scans ahead into later sessions or clears every repetition at once.
// Callers merge explicit guided context after this inferred default.
export function contextForExercise(progress, sessions, exerciseId) {
  const session = nextSession(progress, sessions);
  if (!session || !id(exerciseId)) return {};
  const completed = new Set(sessionProgress(progress, session).completedBlocks);
  const index = session.blocks.findIndex((block, i) => block?.exerciseId === exerciseId && !completed.has(i));
  return index < 0 ? {} : { sessionId: session.id, blockIndex: index };
}

import { normalizeProgress } from "./progress.js";
import { todayStr } from "../dateUtils.js";

const calendarDay = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
};

// The canonical technique scores are validated two-voice ABC. Count the first
// voice's written bars once, without loading the notation renderer on every
// card. An unknown/unvalidated score cannot establish a full-range checkpoint.
const barCache = new Map();
export function techniqueBarCount(exercise) {
  if (!exercise?.technique || typeof exercise.abc !== "string") return 0;
  if (!barCache.has(exercise.abc)) {
    const lines = exercise.abc.split("\n").filter((line) => line.startsWith("[V:1]"));
    barCache.set(exercise.abc, lines.reduce((sum, line) => sum + (line.match(/\|/g)?.length || 0), 0));
  }
  return barCache.get(exercise.abc);
}

const handCovers = (actual, expected) => actual === expected || actual === "both";
const fullScope = (attempt, exercise, bars) => bars > 0 && attempt?.techniqueScope === "round-trip" && attempt.fromBar === 1 && attempt.toBar === bars
  && handCovers(attempt.hands, exercise.hands);
const comparable = (check, previous) => Number.isFinite(check.bpm) && check.bpm > 0
  && Number.isFinite(previous.bpm) && previous.bpm > 0 && check.bpm >= previous.bpm
  && handCovers(check.hands, previous.hands)
  && check.fromBar <= previous.fromBar && check.toBar >= previous.toBar;

export function techniqueCheckpoint(progress, exercise, { today = todayStr() } = {}) {
  const requiredBars = techniqueBarCount(exercise), requiredHands = exercise?.hands;
  const attempts = calendarDay(today) ? normalizeProgress(progress).attempts.filter((attempt) => attempt.exerciseId === exercise?.id
    && attempt.section !== "placement" && attempt.section !== "transfer" && attempt.section !== "knowledge" && attempt.minutes > 0 && calendarDay(attempt.date) && attempt.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date)) : [];
  const days = new Map();
  for (const attempt of attempts) {
    if (!days.has(attempt.date)) days.set(attempt.date, []);
    days.get(attempt.date).push(attempt);
  }
  let fullRangeReported = false, steadyFullRangeReported = false, delayedSteadyReported = false, previousAttempt = null;
  for (const visits of days.values()) {
    const setback = visits.some((attempt) => attempt.assessment !== "ready" || attempt.reviewCheck && attempt.reviewCheck.assessment !== "ready");
    fullRangeReported ||= visits.some((attempt) => fullScope(attempt, exercise, requiredBars));
    if (setback) {
      steadyFullRangeReported = false;
      delayedSteadyReported = false;
    } else {
      steadyFullRangeReported ||= visits.some((attempt) => fullScope(attempt, exercise, requiredBars) && attempt.assessment === "ready");
      const first = visits[0], check = first.reviewCheck;
      if (previousAttempt && previousAttempt.date < first.date && first.section === "review" && first.assessment === "ready"
          && check?.beforeDemo === true && check.assessment === "ready" && fullScope(check, exercise, requiredBars)
          && fullScope(previousAttempt, exercise, requiredBars) && comparable(check, previousAttempt)) delayedSteadyReported = true;
    }
    previousAttempt = visits.at(-1);
  }
  const kind = !attempts.length ? "new" : delayedSteadyReported ? "delayed-steady" : fullRangeReported ? "full-range" : "chunk";
  const label = { new: "Not yet practised", chunk: "Full scope not yet reported", "full-range": "Full range reported", "delayed-steady": "Steady full return reported" }[kind];
  return { kind, label, requiredBars, requiredHands, lastAttempt: attempts.at(-1) || null,
    fullRangeReported, steadyFullRangeReported, delayedSteadyReported };
}

// Preparation is advice, never an unlock. A different hand, minor form or
// easier range cannot silently supply evidence for the requested setup.
export function techniquePreparation(progress, exercise, exercises, { today = todayStr() } = {}) {
  const t = exercise?.technique;
  if (!t) return null;
  const find = (pattern, octaves, hands = exercise.hands) => exercises.find((candidate) => candidate.id !== exercise.id
    && candidate.technique?.tonic === t.tonic && candidate.technique.pattern === pattern
    && candidate.technique.octaves === octaves && candidate.hands === hands
    && (pattern !== "arpeggio" || candidate.technique.quality === t.quality));
  const required = [];
  if (t.octaves === 2) required.push({ exercise: find(t.pattern, 1), delayed: true, reason: "Retrieve this one-octave setup on another day before extending its range." });
  if (exercise.hands === "both" && t.pattern !== "contrary") for (const hand of ["R", "L"]) required.push({ exercise: find(t.pattern, t.octaves, hand), delayed: false, reason: "Recall this hand's complete written range before coordinating both hands." });
  if (t.octaves === 1 && ["harmonic-minor", "melodic-minor"].includes(t.pattern)) required.push({ exercise: find("natural-minor", 1), delayed: false, reason: "Recall the natural-minor notes before comparing the altered form." });
  if (t.octaves === 1 && t.pattern === "melodic-minor") required.push({ exercise: find("harmonic-minor", 1), delayed: false, reason: "Recall the raised seventh before adding melodic minor's different ascent and descent." });
  if (t.octaves === 1 && t.pattern === "arpeggio") required.push({ exercise: find(t.quality === "minor" ? "natural-minor" : "major", 1), delayed: false, reason: "Recall this key's notes, then identify root, third and fifth before travelling through the arpeggio." });
  if (t.pattern === "contrary") for (const hand of ["R", "L"]) required.push({ exercise: find("major", t.octaves, hand), delayed: false, reason: "Recall each hand's full scale before joining opposite directions." });
  for (const item of required) {
    if (!item.exercise) continue;
    const checkpoint = techniqueCheckpoint(progress, item.exercise, { today });
    if (!(item.delayed ? checkpoint.delayedSteadyReported : checkpoint.steadyFullRangeReported)) return { ...item, checkpoint };
  }
  return null;
}

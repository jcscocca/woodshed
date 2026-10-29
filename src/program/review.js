import { todayStr } from "../dateUtils.js";
import { normalizeProgress } from "./progress.js";

// These are transparent product defaults, not a validated model of mastery.
// Only a learner-reported, before-demo check on a later day earns more space.
const INTERVALS = [3, 7, 14, 30];
const DAY_MS = 86400000;
const calendarDay = (day) => {
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const value = Date.parse(`${day}T12:00:00Z`);
  return Number.isFinite(value) && new Date(value).toISOString().slice(0, 10) === day ? value : null;
};
const afterDays = (day, days) => new Date(calendarDay(day) + days * DAY_MS).toISOString().slice(0, 10);

function coversPreviousScope(check, previous) {
  // A steady check of one easy bar or one hand cannot lengthen the interval
  // for the more demanding passage practised on the preceding day. Old logs
  // without scope still work; a missing new snapshot cannot cover known scope.
  if (previous.bpm && !(check.bpm >= previous.bpm)) return false;
  if (previous.hands && check.hands !== previous.hands && check.hands !== "both") return false;
  if (previous.fromBar && !(check.fromBar <= previous.fromBar && check.toBar >= previous.toBar)) return false;
  const scopes = { chunk: 0, ascent: 1, "round-trip": 2 };
  if (previous.techniqueScope && !(scopes[check.techniqueScope] >= scopes[previous.techniqueScope])) return false;
  return true;
}

function reviewState(attempts) {
  const days = new Map();
  for (const entry of attempts) {
    if (!days.has(entry.date)) days.set(entry.date, []);
    days.get(entry.date).push(entry);
  }
  let stage = 0, delayedCheckCount = 0, previousDay = null, previousAttempt = null;
  let successDates = [];
  let reason = "A first return before the demo", intervalDays = INTERVALS[0];
  for (const day of [...days.keys()].sort()) {
    const visits = days.get(day);
    // A repair later in the day cannot erase the difficulty of the first
    // attempt. Grouping by date also prevents same-day repetition inflation.
    const setback = visits.some((entry) => entry.assessment !== "ready"
      || (entry.reviewCheck && entry.reviewCheck.assessment !== "ready"));
    const first = visits[0];
    const successfulCheck = previousDay !== null && first.section === "review"
      && first.reviewCheck?.beforeDemo === true && first.reviewCheck.assessment === "ready"
      && first.assessment === "ready" && coversPreviousScope(first.reviewCheck, previousAttempt);
    if (setback) {
      stage = -1;
      successDates = [];
      intervalDays = 1;
      reason = "Another short visit after a difficult attempt";
    } else if (successfulCheck) {
      stage = Math.min(stage + 1, INTERVALS.length - 1);
      intervalDays = INTERVALS[stage];
      delayedCheckCount++;
      successDates.push(day);
      reason = "Return after a steady before-demo check";
    } else {
      intervalDays = stage < 0 ? 1 : INTERVALS[stage];
      reason = stage < 0 ? "Return after focused repair" : delayedCheckCount ? "Keep an earlier skill available" : "A first return before the demo";
    }
    previousDay = day;
    previousAttempt = visits[visits.length - 1];
  }
  return { previousAttempt, dueDate: afterDays(previousDay, intervalDays), intervalDays, reason, delayedCheckCount, successDates };
}

export function reviewQueue(progress, exercises, { today = todayStr(), limit = 3 } = {}) {
  if (calendarDay(today) === null || !Array.isArray(exercises)) return [];
  const count = Number.isInteger(limit) && limit >= 0 ? limit : 3;
  if (!count) return [];
  const byId = new Map(exercises.filter((exercise) => exercise?.id && exercise.section !== "placement").map((exercise) => [exercise.id, exercise]));
  const history = new Map(), transferredToday = new Set(), lastTransfer = new Map();
  for (const entry of normalizeProgress(progress).attempts) {
    // A placement, missing date, future correction or malformed zero-minute
    // report cannot silently establish that a lesson has been practised.
    if (entry.section === "placement" || entry.section === "knowledge" || !byId.has(entry.exerciseId) || !entry.minutes
        || calendarDay(entry.date) === null || entry.date > today) continue;
    // A new example supplies different evidence. It neither earns nor resets
    // the original passage's spacing, but occupies that skill's turn today.
    if (entry.section === "transfer") {
      if (entry.date === today) transferredToday.add(entry.exerciseId);
      if (entry.date > (lastTransfer.get(entry.exerciseId) || "")) lastTransfer.set(entry.exerciseId, entry.date);
      continue;
    }
    if (!history.has(entry.exerciseId)) history.set(entry.exerciseId, []);
    history.get(entry.exerciseId).push(entry);
  }
  const candidates = [];
  for (const [exerciseId, attempts] of history) {
    const { successDates, ...state } = reviewState(attempts);
    const checksSinceTransfer = successDates.filter((day) => day > (lastTransfer.get(exerciseId) || "")).length;
    if (state.dueDate <= today && !transferredToday.has(exerciseId)) candidates.push({ exercise: byId.get(exerciseId), ...state, checksSinceTransfer });
  }
  candidates.sort((a, b) => a.dueDate.localeCompare(b.dueDate)
    || a.previousAttempt.date.localeCompare(b.previousAttempt.date)
    || a.exercise.id.localeCompare(b.exercise.id));

  // Give similarly due keys a turn without letting variety displace much
  // older work. The queue remains global when the learner changes units.
  const selected = [], units = new Set();
  while (candidates.length && selected.length < count) {
    const oldest = calendarDay(candidates[0].dueDate);
    const varied = candidates.findIndex((candidate) => calendarDay(candidate.dueDate) - oldest <= 3 * DAY_MS
      && !units.has(candidate.exercise.unitId || candidate.exercise.key || candidate.exercise.id));
    const [candidate] = candidates.splice(varied < 0 ? 0 : varied, 1);
    selected.push(candidate);
    units.add(candidate.exercise.unitId || candidate.exercise.key || candidate.exercise.id);
  }
  return selected;
}

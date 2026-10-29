import { todayStr, addDays, daysSince } from "../dateUtils.js";
import { normalizeProgress } from "./progress.js";
import { reviewQueue } from "./review.js";

// This is a choice of what to practise next, not an assessment of any other
// passage. The raw per-exercise queue, saved scopes and spacing stay intact.
// Deliberately small explicit groups avoid treating a shared tag such as
// "pulse" as proof that unrelated repertoire or a new rhythm is equivalent.
const DRILL_GROUPS = [
  ["middle-c-register-reading", ["read-family-c", "read-ledger-transfer"]],
  ["f-sharp-staff-reading", ["g-read-f-sharp", "g-read-registers", "g-read-fresh"]],
  ["b-flat-register-reading", ["f3-read-signature", "f3-read-register", "f3-read-fresh"]],
  ["interleaved-chord-relay", ["a4-relay-am", "a4-relay-e"]],
  ["canon-bass-destinations", ["d-canon-source-bass", "d-canon-bass-map"]],
  ["released-bass-answer-preparation", ["d-bass-single-answer", "d-bass-chord-prep"]],
  ["two-sharp-first-reading", ["d-first-read-a", "d-first-read-b"]],
  ["three-sharp-compound-first-reading", ["a6-first-read-a", "a6-first-read-b"]],
];
// These are named musical projects and the particular preparations explicitly
// linked to them in musicIntegration.js. Different textures of the same music
// can rotate, while an uncertain texture still requires its own repair below.
const PROJECT_GROUPS = [
  ["after-the-rain", ["chord-pop-loop", "coord-broken-chords", "music-after-rain"]],
  ["dawn-drive", ["coord-offbeat-melody", "music-dawn-drive"]],
  ["little-promenade", ["g-chords-gcd7", "g-music-little-promenade"]],
  ["first-train", ["g-coord-broken-under", "g-music-first-train"]],
  ["homeward", ["g-chords-four-loop", "g-coord-offbeats", "g-music-homeward"]],
  ["paper-boats", ["f3-chord-pop-loop", "f3-chord-ballad", "f3-music-paper-boats"]],
  ["fur-elise-opening-relays", ["a4-relay-am", "a4-relay-e", "a4-fur-elise-opening"]],
  ["canon-bass-and-harmony", ["d-chords-home", "d-chords-minor", "d-canon-source-bass", "d-canon-bass-map", "d-canon-blocks", "d-bass-single-answer", "d-bass-chord-prep", "d-canon-minor-lh-prep", "d-canon-bass-chords"]],
  ["mozart-first-strain", ["a6-chords-primary", "a6-mozart-key-shape", "a6-mozart-melody", "a6-mozart-held", "a6-mozart-two-pulse"]],
  ["two-rooms", ["a6-chords-relative", "a6-coord-left-melody", "a6-two-rooms"]],
  ["morning-mood-phrase", ["e7-morning-melody", "e7-morning-arrangement"]],
  ["switchyard-chorus", ["e7-blue-colors", "e7-blues-riff", "e7-blues-bass", "e7-blues-sevenths", "e7-switchyard-blues"]],
  ["two-part-conversation", ["m8-cadence-transfer", "m8-bass-led-reading", "m8-form-ab"]],
];
const DOMAIN = new Map([...DRILL_GROUPS, ...PROJECT_GROUPS].flatMap(([domain, ids]) => ids.map(id => [id, domain])));
const PROJECT_IDS = new Set(PROJECT_GROUPS.flatMap(([, ids]) => ids));
const COOLDOWN_DAYS = 3;
const validDay = day => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && Number.isFinite(Date.parse(`${day}T12:00:00Z`)) && new Date(`${day}T12:00:00Z`).toISOString().slice(0, 10) === day;
const pianoReport = (attempt, today) => attempt.section !== "placement" && attempt.section !== "knowledge"
  && attempt.minutes > 0 && validDay(attempt.date) && attempt.date <= today;
const setback = attempt => attempt.assessment !== "ready"
  || attempt.reviewCheck && attempt.reviewCheck.assessment !== "ready"
  || attempt.transferCheck && attempt.transferCheck.assessment !== "ready";
const comparableReturn = (report, reports) => {
  const check = report.reviewCheck;
  if (report.section !== "review" || report.assessment !== "ready" || check?.assessment !== "ready" || check.beforeDemo !== true) return false;
  const source = reports.filter(item => item.section !== "transfer");
  if (source.find(item => item.date === report.date) !== report) return false;
  const earlier = source.filter(item => item.date < report.date).sort((a, b) => a.date.localeCompare(b.date));
  const previous = earlier.at(-1);
  if (!previous) return false;
  if (previous.bpm && !(check.bpm >= previous.bpm)) return false;
  if (previous.hands && check.hands !== previous.hands && check.hands !== "both") return false;
  if (previous.fromBar && !(check.fromBar <= previous.fromBar && check.toBar >= previous.toBar)) return false;
  const scopes = { chunk: 0, ascent: 1, "round-trip": 2 };
  return !previous.techniqueScope || scopes[check.techniqueScope] >= scopes[previous.techniqueScope];
};

export function reviewFamilyFor(exercise) {
  if (!exercise?.id) return null;
  const scope = [exercise.unitId || "unassigned", exercise.key || "", PROJECT_IDS.has(exercise.id) ? "project" : exercise.hands || "both"];
  // A scale's key, form, range and hand are independent tasks. Even equivalent
  // reference/lesson scores keep separate identities and actual passage work.
  if (exercise.technique || exercise.section === "scales" && !PROJECT_IDS.has(exercise.id)) {
    const t = exercise.technique || {};
    return JSON.stringify([...scope, "technique", t.tonic || "", t.pattern || "", t.quality || "", t.octaves || "", exercise.id]);
  }
  return JSON.stringify([...scope, DOMAIN.get(exercise.id) || `passage:${exercise.id}`]);
}

export function representativeReviewQueue(progress, exercises, { today = todayStr(), limit = 3, candidates } = {}) {
  if (!validDay(today) || !Array.isArray(exercises) || !Number.isInteger(limit) || limit < 1) return [];
  const p = normalizeProgress(progress);
  const byId = new Map(exercises.filter(e => e?.id && !e.archived && e.section !== "placement").map(e => [e.id, e]));
  const history = new Map(), families = new Map();
  for (const e of byId.values()) {
    const family = reviewFamilyFor(e);
    if (!families.has(family)) families.set(family, []);
    families.get(family).push(e.id);
  }
  for (const attempt of p.attempts) {
    if (!byId.has(attempt.exerciseId) || !pianoReport(attempt, today)) continue;
    if (!history.has(attempt.exerciseId)) history.set(attempt.exerciseId, []);
    history.get(attempt.exerciseId).push(attempt);
  }
  const raw = (Array.isArray(candidates) ? candidates : reviewQueue(p, exercises, { today, limit: exercises.length }))
    .filter(item => byId.has(item?.exercise?.id) && history.has(item.exercise.id) && validDay(item.dueDate) && item.dueDate <= today
      && validDay(item.previousAttempt?.date));
  const groups = new Map(), repairs = [];
  const latestDay = reports => reports.reduce((day, report) => report.date > day ? report.date : day, "");
  const lastReturn = id => (history.get(id) || []).filter(report => report.section === "review")
    .reduce((day, report) => report.date > day ? report.date : day, "");
  for (const item of raw) {
    const exercise = byId.get(item.exercise.id), reports = history.get(exercise.id), date = latestDay(reports);
    const familyId = reviewFamilyFor(exercise);
    const repair = item.intervalDays === 1 || reports.some(report => report.date === date && setback(report));
    if (repair) {
      repairs.push({ ...item, exercise, familyId: `${familyId}:repair:${exercise.id}`, familySize: 1,
        representedExerciseIds: [exercise.id], repair: true, schedulingDueDate: item.dueDate,
        representativeReason: "This passage still needs its own reported repair; another example cannot clear it." });
      continue;
    }
    if (!groups.has(familyId)) groups.set(familyId, []);
    groups.get(familyId).push({ ...item, exercise });
  }
  const scheduled = [...repairs];
  for (const [familyId, items] of groups) {
    const exercise = items[0].exercise;
    const related = DOMAIN.has(exercise.id) && (families.get(familyId)?.length || 0) > 1;
    let nextFamilyCheck = "";
    if (related) {
      let mostRecentSteadyDay = "";
      for (const id of families.get(familyId)) {
        const reports = history.get(id) || [], days = new Map();
        for (const report of reports) {
          if (!days.has(report.date)) days.set(report.date, []);
          days.get(report.date).push(report);
        }
        for (const [date, visits] of days) if (visits.every(report => !setback(report))
          && visits.some(report => comparableReturn(report, reports)) && date > mostRecentSteadyDay) mostRecentSteadyDay = date;
      }
      if (mostRecentSteadyDay) nextFamilyCheck = addDays(mostRecentSteadyDay, COOLDOWN_DAYS);
    }
    // Even a genuinely steady sibling check cannot keep an independently
    // overdue passage hidden forever. After seven overdue days that passage
    // gets an opportunity regardless of the representative-family cooldown.
    const longOverdue = items.filter(item => daysSince(item.dueDate, today) >= 7);
    if (nextFamilyCheck > today && !longOverdue.length) continue;
    const pool = longOverdue.length ? longOverdue : items;
    // Rotate to an eligible passage with the least recent actual return. A
    // never-returned passage comes first; no synthetic review is recorded.
    pool.sort((a, b) => lastReturn(a.exercise.id).localeCompare(lastReturn(b.exercise.id))
      || a.previousAttempt.date.localeCompare(b.previousAttempt.date)
      || a.dueDate.localeCompare(b.dueDate) || a.exercise.id.localeCompare(b.exercise.id));
    const selected = pool[0];
    scheduled.push({ ...selected, familyId, familySize: items.length,
      representedExerciseIds: items.map(item => item.exercise.id), repair: false,
      schedulingDueDate: !longOverdue.length && nextFamilyCheck > selected.dueDate ? nextFamilyCheck : selected.dueDate,
      representativeReason: related ? "A rotating related preparation; the other passages keep their own history and may still need practice." : "A return to this particular passage and its saved scope." });
  }
  scheduled.sort((a, b) => a.schedulingDueDate.localeCompare(b.schedulingDueDate)
    || Number(b.repair) - Number(a.repair) || a.previousAttempt.date.localeCompare(b.previousAttempt.date)
    || a.exercise.id.localeCompare(b.exercise.id));
  const selected = [], keys = new Set();
  while (scheduled.length && selected.length < limit) {
    const oldest = scheduled[0].schedulingDueDate;
    const varied = scheduled.findIndex(item => daysSince(oldest, item.schedulingDueDate) <= 3
      && !keys.has(JSON.stringify([item.exercise.unitId, item.exercise.key])));
    const [item] = scheduled.splice(varied < 0 ? 0 : varied, 1);
    selected.push(item); keys.add(JSON.stringify([item.exercise.unitId, item.exercise.key]));
  }
  return selected;
}

export function consolidationPolicy(progress, { today = todayStr() } = {}) {
  if (!validDay(today)) return { recommendedAvailable: false, startedVisitIds: [], maxRecommendedPerDay: 1 };
  const startedVisitIds = [...new Set(normalizeProgress(progress).attempts.filter(attempt => attempt.section === "review"
    && attempt.date === today && attempt.minutes > 0 && typeof attempt.reviewVisitId === "string"
    && attempt.reviewVisitId.startsWith("review-visit:")).map(attempt => attempt.reviewVisitId))].sort();
  // Resume of an existing unfinished visit is a separate UI action. This caps
  // only a new recommendation, so persistent difficulty cannot consume both
  // daily twenty-minute slots or block access to the next ordinary lesson.
  return { recommendedAvailable: startedVisitIds.length === 0, startedVisitIds, maxRecommendedPerDay: 1 };
}

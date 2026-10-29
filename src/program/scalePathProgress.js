import { normalizeProgress } from "./progress.js";
import { todayStr } from "../dateUtils.js";
import { techniqueCheckpoint, techniquePreparation } from "./techniqueProgress.js";

const visitsFor = (progress, exercises, today) => {
  const ids = new Set(exercises.map((exercise) => exercise.id));
  return normalizeProgress(progress).attempts.filter((attempt) => ids.has(attempt.exerciseId)
    && attempt.section !== "placement" && attempt.section !== "knowledge" && attempt.minutes > 0 && attempt.date && attempt.date <= today);
};

// These describe practice activity, never attainment or an automatic unlock.
export function scaleTrackStats(progress, exercises, { today = todayStr() } = {}) {
  const visits = visitsFor(progress, exercises, today);
  const ids = new Set(visits.map((attempt) => attempt.exerciseId));
  return {
    visits: visits.length,
    minutes: visits.reduce((sum, attempt) => sum + attempt.minutes, 0),
    lessons: ids.size,
    keys: new Set(exercises.filter((exercise) => ids.has(exercise.id)).map((exercise) => exercise.key)).size,
  };
}

export function scaleSuggestion(progress, exercises, dueReviews = [], { today = todayStr(), allExercises = exercises } = {}) {
  const ids = new Set(exercises.map((exercise) => exercise.id));
  const due = dueReviews.find((item) => ids.has(item.exercise.id));
  if (due) return { kind: "review", exercise: due.exercise, review: due };
  const visits = visitsFor(progress, exercises, today);
  const latest = new Map();
  // Date corrections can change chronological order without moving the log.
  for (const attempt of [...visits].sort((a, b) => a.date.localeCompare(b.date))) latest.set(attempt.exerciseId, attempt);
  const repair = exercises.find((exercise) => {
    const attempt = latest.get(exercise.id);
    return attempt && visits.some((visit) => visit.exerciseId === exercise.id && visit.date === attempt.date
      && (visit.assessment !== "ready" || visit.reviewCheck && visit.reviewCheck.assessment !== "ready"));
  });
  if (repair) return { kind: "repair", exercise: repair };
  const partial = exercises.find((exercise) => exercise.technique && latest.has(exercise.id)
    && techniqueCheckpoint(progress, exercise, { today }).kind === "chunk");
  if (partial) return { kind: "extend", exercise: partial };
  const next = exercises.find((exercise) => !latest.has(exercise.id));
  if (next) {
    const preparation = techniquePreparation(progress, next, allExercises, { today });
    return preparation ? { kind: "prepare", exercise: preparation.exercise, targetExercise: next, reason: preparation.reason }
      : { kind: "new", exercise: next };
  }
  const recall = exercises.find((exercise) => exercise.technique && !techniqueCheckpoint(progress, exercise, { today }).delayedSteadyReported);
  if (recall) return { kind: "recall", exercise: recall };
  return exercises.length ? { kind: "return-later", exercise: exercises[0] } : null;
}

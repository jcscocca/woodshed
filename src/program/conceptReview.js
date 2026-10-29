import { todayStr, addDays } from "../dateUtils.js";
import { normalizeProgress } from "./progress.js";
import { QUESTION_BY_ID } from "./knowledge.js";

const validDay = (day) => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && Number.isFinite(Date.parse(`${day}T12:00:00Z`)) && new Date(`${day}T12:00:00Z`).toISOString().slice(0, 10) === day;

// Conceptual answers have their own repair loop. They never change a piano
// assessment, complete a guided block, or lengthen a passage's spacing.
export function conceptReviewQueue(progress, exercises, { today = todayStr(), includeUpcoming = false } = {}) {
  if (!validDay(today)) return [];
  const byId = new Map((exercises || []).filter((e) => !e.archived).map((e) => [e.id, e]));
  const histories = new Map();
  normalizeProgress(progress).attempts.forEach((attempt, index) => {
    if (!validDay(attempt.date) || attempt.date > today || !byId.has(attempt.exerciseId)) return;
    for (const result of attempt.knowledgeResults || []) {
      const question = QUESTION_BY_ID[result.questionId];
      if (!question || question.archived) continue;
      if (!histories.has(question.id)) histories.set(question.id, []);
      histories.get(question.id).push({ result, attempt, index });
    }
  });
  const pending = [];
  for (const [questionId, events] of histories) {
    events.sort((a, b) => a.attempt.date.localeCompare(b.attempt.date) || a.index - b.index);
    let unresolved = false, lastWrong = null, latest = null;
    for (const event of events) {
      latest = event;
      if (!event.result.correct) { unresolved = true; lastWrong = event; }
      else if (unresolved && event.attempt.date > lastWrong.attempt.date) unresolved = false;
    }
    if (!unresolved) continue;
    const dueDate = latest.result.correct ? addDays(latest.attempt.date, 1) : latest.attempt.date;
    if (includeUpcoming || dueDate <= today) pending.push({
      question: QUESTION_BY_ID[questionId], exercise: byId.get(lastWrong.attempt.exerciseId),
      dueDate, lastWrongDate: lastWrong.attempt.date, repairedToday: latest.result.correct,
    });
  }
  return pending.sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.question.id.localeCompare(b.question.id));
}

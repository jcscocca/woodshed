import { todayStr, daysSince } from "../dateUtils.js";
import { normalizeProgress } from "./progress.js";
import { readPracticeDraft, writePracticeDraft, clearPracticeDraft } from "./drafts.js";

const DRAFT_KEY = "consolidation-visit";
const DRAFT_VERSION = "review-visit-v1";
const validDay = (day) => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day)
  && Number.isFinite(Date.parse(`${day}T12:00:00Z`)) && new Date(`${day}T12:00:00Z`).toISOString().slice(0, 10) === day;
const validVisit = (visit) => typeof visit?.id === "string" && /^review-visit:[a-z\d:.-]{1,140}$/i.test(visit.id)
  && Array.isArray(visit.exerciseIds) && visit.exerciseIds.length > 0 && visit.exerciseIds.length <= 5
  && new Set(visit.exerciseIds).size === visit.exerciseIds.length
  && visit.exerciseIds.every((id) => typeof id === "string" && /^[a-z\d][a-z\d._:/-]{0,159}$/i.test(id))
  && Array.isArray(visit.minutes) && visit.minutes.length === visit.exerciseIds.length
  && visit.minutes.every((value) => Number.isInteger(value) && value > 0) && visit.minutes.reduce((a, b) => a + b, 0) === 20;

export function reviewWorkload(due, { today = todayStr() } = {}) {
  const items = validDay(today) && Array.isArray(due) ? due.filter((item) => validDay(item?.dueDate) && item.dueDate <= today) : [];
  const oldestDaysOverdue = items.reduce((max, item) => Math.max(max, daysSince(item.dueDate, today) || 0), 0);
  return { dueCount: items.length, estimatedMinutes: items.length * 3, oldestDaysOverdue,
    consolidationRecommended: items.length >= 5 || items.length >= 3 && oldestDaysOverdue >= 7 };
}

export function makeReviewVisit(due, { today = todayStr(), id = `review-visit:${today}:${Math.random().toString(36).slice(2, 10)}` } = {}) {
  if (!validDay(today)) return null;
  const exerciseIds = [...new Set((Array.isArray(due) ? due : []).map((item) => item?.exercise?.id).filter((id) => typeof id === "string" && /^[a-z\d][a-z\d._:/-]{0,159}$/i.test(id)))].slice(0, 5);
  if (!exerciseIds.length) return null;
  const base = Math.floor(20 / exerciseIds.length), remainder = 20 % exerciseIds.length;
  return { id, exerciseIds, minutes: exerciseIds.map((_, index) => base + (index < remainder ? 1 : 0)) };
}

export function reviewVisitProgress(progress, visit, { today = todayStr() } = {}) {
  if (!validVisit(visit) || !validDay(today)) return { completed: [], nextIndex: -1, done: false };
  const attempts = normalizeProgress(progress).attempts.filter((attempt) => attempt.section === "review"
    && attempt.reviewVisitId === visit.id && attempt.minutes > 0 && validDay(attempt.date) && attempt.date <= today
    && visit.exerciseIds[attempt.reviewVisitIndex] === attempt.exerciseId);
  const completed = [...new Set(attempts.map((attempt) => attempt.reviewVisitIndex))];
  const nextIndex = visit.exerciseIds.findIndex((_, index) => !completed.includes(index));
  return { completed, nextIndex, done: nextIndex < 0 };
}

export function readReviewVisit(exercises) {
  const visit = readPracticeDraft(DRAFT_KEY, DRAFT_VERSION), ids = new Set((exercises || []).filter((e) => !e.archived).map((e) => e.id));
  return validVisit(visit) && visit.exerciseIds.every((id) => ids.has(id)) ? visit : null;
}
export const saveReviewVisit = (visit) => writePracticeDraft(DRAFT_KEY, DRAFT_VERSION, visit);
export const clearReviewVisit = () => clearPracticeDraft(DRAFT_KEY);

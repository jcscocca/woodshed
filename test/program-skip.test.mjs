import assert from "node:assert/strict";
import { test } from "node:test";
import { reviewQueue } from "../src/program/review.js";
import { normalizeProgress, recordAttempt, exerciseProgress, sessionProgress, skipLesson, unskipLesson } from "../src/program/progress.js";
import { reviewVisitProgress } from "../src/program/reviewVisits.js";

const exercises = [
  { id: "c-pulse", unitId: "c", key: "C major", section: "guided", skillIds: ["pulse"] },
  { id: "c-reading", unitId: "c", key: "C major", section: "guided", skillIds: ["reading"] },
];
const [pulse, reading] = exercises;
const session = { id: "c-day-1-a", blocks: [{ exerciseId: "c-pulse", minutes: 4 }, { exerciseId: "c-reading", minutes: 4 }] };
const report = (date, patch = {}) => ({ exerciseId: "c-pulse", skillIds: ["pulse"], section: "guided", minutes: 3, assessment: "ready", date, ...patch });
const queue = (p, today = "2026-11-30") => reviewQueue(p, exercises, { today, limit: 20 }).map((item) => item.exercise.id);

test("a skip completes its block without practice minutes", () => {
  const p = skipLesson(normalizeProgress({}), pulse, { sessionId: session.id, blockIndex: 0, date: "2026-11-01" });
  assert.deepEqual(p.attempts[0], { exerciseId: "c-pulse", skillIds: ["pulse"], assessment: "ready", minutes: 0, section: "guided", date: "2026-11-01", skipped: true, sessionId: session.id, blockIndex: 0 });
  const state = sessionProgress(p, session);
  assert.deepEqual([state.completedBlocks, state.nextBlock, state.minutes], [[0], 1, 0]);
  const summary = exerciseProgress(p, "c-pulse");
  assert.deepEqual([summary.skipped, summary.practiceCount, summary.minutes], [true, 0, 0]);
});

test("a skipped lesson never enters review", () => {
  const p = skipLesson(normalizeProgress({}), pulse, { date: "2026-10-01" });
  assert.deepEqual(queue(p), []);
});

test("skipping a practised lesson retires it from review until it is practised again", () => {
  let p = normalizeProgress({ attempts: [report("2026-10-01"), report("2026-10-01", { exerciseId: "c-reading", skillIds: ["reading"] })] });
  assert.deepEqual(queue(p), ["c-pulse", "c-reading"]);
  p = skipLesson(p, pulse, { date: "2026-10-05" });
  assert.deepEqual(queue(p), ["c-reading"]);
  p = recordAttempt(p, report("2026-10-10"));
  assert.deepEqual(queue(p), ["c-reading", "c-pulse"]);
  assert.equal(exerciseProgress(p, "c-pulse").skipped, false);
});

test("unskip removes the skip and reopens its block", () => {
  let p = skipLesson(normalizeProgress({ attempts: [report("2026-10-01")] }), pulse, { sessionId: session.id, blockIndex: 0, date: "2026-10-05" });
  p = skipLesson(p, reading, { sessionId: session.id, blockIndex: 1, date: "2026-10-05" });
  assert.equal(sessionProgress(p, session).done, true);
  p = unskipLesson(p, "c-pulse");
  assert.deepEqual(sessionProgress(p, session).completedBlocks, [1]);
  assert.equal(p.attempts.filter((a) => a.exerciseId === "c-pulse").length, 1, "earlier practice stays");
  assert.deepEqual(queue(p), ["c-pulse"]);
});

test("unskip undoes only the latest skip", () => {
  let p = skipLesson(normalizeProgress({}), pulse, { sessionId: session.id, blockIndex: 0, date: "2026-10-01" });
  p = recordAttempt(p, report("2026-10-02"));
  p = skipLesson(p, pulse, { date: "2026-10-05" });
  p = unskipLesson(p, "c-pulse");
  assert.deepEqual(sessionProgress(p, session).completedBlocks, [0], "the earlier block skip stays");
  assert.equal(exerciseProgress(p, "c-pulse").skipped, false);
  assert.deepEqual(queue(p), ["c-pulse"], "the retirement is undone");
});

test("the skip marker only survives on a zero-minute report", () => {
  const p = normalizeProgress({ attempts: [report("2026-10-01", { skipped: true }), report("2026-10-02", { minutes: 0, skipped: "yes" })] });
  assert.deepEqual(p.attempts.map((a) => a.skipped), [undefined, undefined]);
});

test("a skipped check completes its place in a consolidation visit", () => {
  const visit = { id: "review-visit:2026-11-30:abc", date: "2026-11-30", exerciseIds: ["c-pulse", "c-reading"], minutes: [10, 10] };
  const p = recordAttempt(normalizeProgress({}), { ...report("2026-11-30", { section: "review", minutes: 0, skipped: true }), reviewVisitId: visit.id, reviewVisitIndex: 0 });
  assert.deepEqual(reviewVisitProgress(p, visit, { today: "2026-11-30" }), { completed: [0], nextIndex: 1, done: false });
});

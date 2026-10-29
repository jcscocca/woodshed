import assert from "node:assert/strict";
import { test } from "node:test";
import { SESSIONS } from "../src/program/curriculum.js";
import { normalizeProgress, recordAttempt, removeAttempt, sessionProgress } from "../src/program/progress.js";
import { guidedSessionPlan } from "../src/program/sessionPlan.js";
import { clearAllPracticeDrafts, findPracticeDraftForSession, readPracticeDraft, writePracticeDraft } from "../src/program/drafts.js";

const today = "2026-10-28";
const session = SESSIONS[0];
const due = { exercise: { id: "old-pulse", unitId: "earlier-unit", section: "guided" }, dueDate: "2026-10-27", reason: "Return before playback" };
const plan = (progress = {}, target = session, reviews = [due], options = {}) => guidedSessionPlan(progress, target, reviews, { today, ...options });
const integrated = (patch = {}) => ({ exerciseId: "old-pulse", skillIds: ["pulse"], section: "review", reviewForSession: session.id,
  assessment: "ready", minutes: 3, date: today, reviewCheck: { assessment: "ready", beforeDemo: true }, ...patch });
const core = (patch = {}) => ({ exerciseId: session.blocks[0].exerciseId, section: "guided", sessionId: session.id, blockIndex: 0,
  assessment: "practising", minutes: 3, date: today, ...patch });
const minuteTotal = value => value.reviewMinutes + value.blocks.reduce((sum, block) => sum + block.minutes, 0);

test("all eighty sessions reserve one short review within twenty minutes and preserve every learning goal", () => {
  const before = JSON.stringify(SESSIONS), reviewBefore = JSON.stringify(due);
  for (const target of SESSIONS) {
    const result = plan({}, target, [due, { ...due, exercise: { ...due.exercise, id: "another" } }]);
    assert.equal(result.review, due, target.id);
    assert.equal(result.reviewDone, false);
    assert.equal(result.reviewMinutes, 3);
    assert.equal(result.totalMinutes, 20);
    assert.equal(minuteTotal(result), 20);
    assert.ok(result.blocks.every(block => Number.isInteger(block.minutes) && block.minutes >= 1));
    assert.deepEqual(result.blocks.map(block => block.exerciseId), target.blocks.map(block => block.exerciseId));
    assert.deepEqual(result.blocks.map(block => block.blockIndex), target.blocks.map((_, i) => i));
    for (let i = 0; i < result.blocks.length; i++) {
      const { minutes: _minutes, blockIndex: _index, ...actual } = result.blocks[i];
      const { minutes: _originalMinutes, ...expected } = target.blocks[i];
      assert.deepEqual(actual, expected, "goals, passage bounds and other authored block properties survive");
    }
  }
  assert.equal(JSON.stringify(SESSIONS), before);
  assert.equal(JSON.stringify(due), reviewBefore);
});

test("largest-remainder allocation follows original proportions and resolves equal fractions in original order", () => {
  const result = plan();
  assert.deepEqual(result.blocks.map(block => block.minutes), [3, 2, 7, 5]);
  assert.equal(minuteTotal(result), 20);
  const equal = { id: "equal", blocks: [1, 2, 3, 4].map(i => ({ exerciseId: `goal-${i}`, minutes: 5 })) };
  assert.deepEqual(plan({}, equal).blocks.map(block => block.minutes), [5, 4, 4, 4]);
});

test("no due review leaves the original twenty-minute plan unchanged", () => {
  const result = plan({}, session, []);
  assert.equal(result.review, null);
  assert.equal(result.reviewMinutes, 0);
  assert.equal(result.reviewDone, false);
  assert.deepEqual(result.blocks.map(({ blockIndex, ...block }) => block), session.blocks);
  assert.equal(minuteTotal(result), 20);
});

test("legacy partial sessions and direct block work keep their original allocations", () => {
  const reports = recordAttempt({}, core());
  const completionOnly = normalizeProgress({ completedBlocks: { [session.id]: [0, 2] } });
  for (const progress of [reports, completionOnly]) {
    const before = JSON.stringify(progress), result = plan(progress);
    assert.equal(result.review, null);
    assert.equal(result.reviewMinutes, 0);
    assert.deepEqual(result.blocks.map(({ blockIndex, ...block }) => block), session.blocks);
    assert.equal(JSON.stringify(progress), before, "planning never resets completed positions");
  }
});

test("a saved integrated return resumes with seventeen core minutes after a reload or queue change", () => {
  let progress = recordAttempt({}, integrated());
  assert.equal(progress.attempts[0].reviewForSession, session.id, "progress schema preserves the separate session association");
  for (const section of ["review", "transfer"]) {
    progress = normalizeProgress(JSON.parse(JSON.stringify({ attempts: [integrated({ section })] })));
    const result = plan(progress, session, []);
    assert.equal(result.review, null);
    assert.equal(result.reviewDone, true);
    assert.equal(result.reviewMinutes, 3);
    assert.equal(minuteTotal(result), 20);
    assert.equal(result.blocks.reduce((sum, block) => sum + block.minutes, 0), 17);
    assert.deepEqual(plan(progress).blocks, result.blocks, "a newly due candidate cannot add another review to this session");
  }
});

test("integrated review remains separate from core completion while partial core work preserves its budget", () => {
  let progress = recordAttempt({}, integrated());
  assert.deepEqual(progress.completedBlocks, {});
  assert.equal(sessionProgress(progress, session).completed, 0);
  assert.equal(sessionProgress(progress, session).done, false);
  progress = recordAttempt(progress, core());
  const result = plan(progress);
  assert.equal(result.reviewDone, true);
  assert.equal(result.reviewMinutes, 3);
  assert.deepEqual(progress.completedBlocks, { [session.id]: [0] });
  assert.equal(result.blocks[0].blockIndex, 0);
  assert.equal(minuteTotal(result), 20);
});

test("standalone, wrong-session, malformed, zero-minute and future reports cannot consume a review slot", () => {
  const candidates = [
    integrated({ reviewForSession: undefined }), integrated({ reviewForSession: "another-session" }),
    integrated({ section: "guided" }), integrated({ section: "placement" }), integrated({ assessment: "mastered" }),
    integrated({ date: undefined }), integrated({ date: "2026-02-30" }), integrated({ date: "2026-10-29" }),
    integrated({ minutes: 0 }), integrated({ minutes: NaN }),
  ];
  for (const attempt of candidates) {
    const result = plan({ attempts: [attempt] });
    assert.equal(result.reviewDone, false, JSON.stringify(attempt));
    assert.equal(result.review, due);
    assert.equal(minuteTotal(result), 20);
  }
});

test("removing the only integrated report restores the review choice before core work begins", () => {
  let progress = recordAttempt({}, integrated());
  assert.equal(plan(progress).reviewDone, true);
  progress = removeAttempt(progress, 0);
  const result = plan(progress);
  assert.equal(result.reviewDone, false);
  assert.equal(result.review, due);
  assert.deepEqual(progress.completedBlocks, {});
});

test("whole-session revisits of completed sessions receive their original twenty minutes", () => {
  const progress = normalizeProgress({ attempts: [integrated()], completedBlocks: { [session.id]: session.blocks.map((_, i) => i) } });
  const result = plan(progress);
  assert.equal(sessionProgress(progress, session).done, true);
  assert.equal(result.review, null);
  assert.equal(result.reviewDone, false);
  assert.equal(result.reviewMinutes, 0);
  assert.equal(minuteTotal(result), 20);
  assert.deepEqual(result.blocks.map(({ blockIndex, ...block }) => block), session.blocks);
});

test("small and nonstandard budgets stay positive and never grow to fit review", () => {
  const small = { id: "small", blocks: [{ exerciseId: "a", minutes: 1 }, { exerciseId: "b", minutes: 1 }] };
  assert.equal(plan({}, small).reviewMinutes, 0);
  assert.equal(minuteTotal(plan({}, small)), 2);
  const short = { id: "short", blocks: [{ exerciseId: "a", minutes: 1 }, { exerciseId: "b", minutes: 9 }] };
  const result = plan({}, short);
  assert.equal(result.reviewMinutes, 3);
  assert.deepEqual(result.blocks.map(block => block.minutes), [1, 6]);
  assert.equal(minuteTotal(result), 10);
  assert.deepEqual(plan({}, { id: "empty", blocks: [] }).blocks, []);
});

test("future review candidates and invalid planning dates do not introduce review", () => {
  assert.equal(plan({}, session, [{ ...due, dueDate: "2026-10-29" }]).reviewMinutes, 0);
  assert.equal(plan({}, session, [{ ...due, dueDate: "bad" }]).reviewMinutes, 0);
  assert.equal(plan({}, session, [due], { today: "bad" }).reviewMinutes, 0);
  assert.equal(plan({}, session, null).reviewMinutes, 0);
});

test("an unfinished return resumes its exact source after the due queue changes or empties", () => {
  clearAllPracticeDrafts();
  try {
    const abc = "X:1\nK:C\nC4|]", draftKey = `earlier-study:review:${session.id}:`;
    const draft = { note: "Keep my first check and chosen passage", range: { from: 1, to: 1 }, reviewCheck: { assessment: "unsure", beforeDemo: true } };
    writePracticeDraft(draftKey, abc, draft);
    const descriptor = findPracticeDraftForSession(session);
    assert.equal(descriptor.exerciseId, "earlier-study");
    assert.equal(descriptor.draftKey, draftKey);
    const resumeReview = { exercise: { id: "earlier-study", section: "guided", abc }, previousAttempt: { date: "2026-10-01", minutes: 3 } };
    for (const reviews of [[], [due]]) {
      const result = plan({}, session, reviews, { resumeReview });
      assert.equal(result.review, resumeReview);
      assert.equal(result.reviewMinutes, 3);
      assert.equal(minuteTotal(result), 20);
    }
    assert.deepEqual(readPracticeDraft(draftKey, abc), draft);
    assert.equal(plan({}, session, [due], { resumeReview: { ...resumeReview, exercise: { ...resumeReview.exercise, abc: "changed score" } } }).review, due, "a changed score cannot silently claim the saved draft");
    assert.equal(plan(recordAttempt({}, core()), session, [due], { resumeReview }).review, null, "core work already begun keeps its existing plan");
  } finally { clearAllPracticeDrafts(); }
});

test("an unfinished fresh check resumes only the exact transfer identity and score", () => {
  clearAllPracticeDrafts();
  try {
    const transferId = "transfer-v1:pulse:c:0", abc = "X:1\nK:C\nD4|]";
    writePracticeDraft(`earlier-study:${transferId}:${session.id}:`, abc, { reviewCheck: { assessment: "practising", beforeDemo: true } });
    const descriptor = findPracticeDraftForSession(session);
    assert.equal(descriptor.transferId, transferId);
    const resumeReview = { exercise: { id: "earlier-study", section: "guided" }, transferExercise: { transferId, abc } };
    assert.equal(plan({}, session, [], { resumeReview }).review, resumeReview);
    for (const transferExercise of [{ transferId: "another", abc }, { transferId, abc: "changed" }]) {
      assert.equal(plan({}, session, [due], { resumeReview: { ...resumeReview, transferExercise } }).review, due);
    }
    const saved = recordAttempt({}, integrated());
    assert.equal(plan(saved, session, [due], { resumeReview }).review, null, "a durably saved return cannot be replaced by an old draft");
  } finally { clearAllPracticeDrafts(); }
});

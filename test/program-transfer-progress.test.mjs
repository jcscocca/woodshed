import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeProgress, recordAttempt, exerciseProgress, sessionProgress, editAttempt, removeAttempt } from "../src/program/progress.js";
import { reviewQueue } from "../src/program/review.js";

const exercises = [
  { id: "c-pulse", unitId: "c", key: "C major", section: "guided" },
  { id: "g-reading", unitId: "g", key: "G major", section: "guided" },
];
const session = { id: "c1-d1-a", blocks: [{ exerciseId: "c-pulse" }, { exerciseId: "g-reading" }] };
const snapshot = { assessment: "ready", beforeDemo: true, bpm: 60, hands: "R", fromBar: 1, toBar: 4 };
const report = (date, patch = {}) => ({ exerciseId: "c-pulse", skillIds: ["pulse"], section: "guided", assessment: "ready", minutes: 3,
  bpm: 60, hands: "R", fromBar: 1, toBar: 4, date, ...patch });
const review = (date, patch = {}) => report(date, { section: "review", reviewCheck: { ...snapshot }, ...patch });
const transfer = (date, patch = {}) => report(date, { section: "transfer", transferId: "transfer-pulse-v1-c-0", transferCheck: { ...snapshot }, ...patch });
const progress = (...attempts) => normalizeProgress({ attempts });
const queue = (p, today = "2026-10-26") => reviewQueue(p, exercises, { today, limit: 10 });
const mature = () => progress(report("2026-10-01"), review("2026-10-04"), review("2026-10-11"));

test("transfer and integrated-review metadata stays separate from core completion and source return evidence", () => {
  const raw = transfer("2026-10-25", { reviewForSession: session.id, sessionId: session.id, blockIndex: 0,
    reviewCheck: snapshot, transferCheck: { ...snapshot, hands: "LH", accuracy: 100 }, accuracy: 100 });
  const p = recordAttempt({}, raw), entry = p.attempts[0];
  assert.equal(entry.reviewForSession, session.id);
  assert.equal(entry.transferId, "transfer-pulse-v1-c-0");
  assert.deepEqual(entry.transferCheck, { ...snapshot, hands: "L" });
  assert.equal(entry.reviewCheck, undefined);
  assert.equal(entry.sessionId, undefined); assert.equal(entry.blockIndex, undefined);
  assert.equal(entry.accuracy, undefined);
  assert.deepEqual(p.completedBlocks, {});
  assert.deepEqual(normalizeProgress(JSON.parse(JSON.stringify(p))), p);
});

test("misplaced or invalid transfer metadata cannot manufacture an integration or a check", () => {
  const fields = { reviewForSession: session.id, transferId: "transfer-pulse-v1-c-0", reviewCheck: snapshot, transferCheck: snapshot };
  const ordinary = progress(report("2026-10-01", fields)).attempts[0];
  for (const field of Object.keys(fields)) assert.equal(ordinary[field], undefined, field);
  const original = progress(review("2026-10-04", fields)).attempts[0];
  assert.deepEqual(original.reviewCheck, snapshot);
  assert.equal(original.transferId, undefined); assert.equal(original.transferCheck, undefined);
  for (const value of [null, {}, [], "__proto__", "constructor", "", "has space", "x".repeat(161)]) {
    const entry = progress(transfer("2026-10-01", { reviewForSession: value, transferId: value })).attempts[0];
    assert.equal(entry.reviewForSession, undefined); assert.equal(entry.transferId, undefined);
  }
  for (const transferCheck of [null, [], {}, { assessment: "mastered", beforeDemo: true }, { ...snapshot, beforeDemo: "true" }]) {
    assert.equal(progress(transfer("2026-10-01", { transferCheck })).attempts[0].transferCheck, undefined);
  }
  const malformed = progress(transfer("2026-10-01", { transferCheck: { ...snapshot, bpm: Infinity, hands: "any", fromBar: 4, toBar: 2 } })).attempts[0];
  assert.deepEqual(malformed.transferCheck, { assessment: "ready", beforeDemo: true });
  assert.ok(progress(report("2026-10-01")).attempts.every((entry) => !entry.transferCheck && !entry.transferId && !entry.reviewForSession));
});

test("transfer practice adds time and visits while preserving the source lesson's scope and readiness", () => {
  const source = report("2026-10-01", { assessment: "unsure", note: "Join bars 2 and 3." });
  const fresh = transfer("2026-10-04", { assessment: "ready", bpm: 84, hands: "both", fromBar: 1, toBar: 2 });
  const summary = exerciseProgress(progress(source, fresh), "c-pulse");
  assert.equal(summary.practiceCount, 2); assert.equal(summary.minutes, 6); assert.equal(summary.count, 2);
  assert.equal(summary.status, "unsure"); assert.equal(summary.lastPractised, "2026-10-01");
  assert.equal(summary.bpm, 60); assert.equal(summary.hands, "R");
  assert.equal(summary.lastAttempt.note, source.note); assert.equal(summary.lastAttempt.toBar, 4);
  const transferOnly = exerciseProgress(progress(fresh), "c-pulse");
  assert.equal(transferOnly.practiceCount, 1); assert.equal(transferOnly.minutes, 3);
  assert.equal(transferOnly.status, "new"); assert.equal(transferOnly.lastAttempt, null);
  assert.equal(transferOnly.lastPractised, null); assert.equal(transferOnly.bpm, null);
});

test("an integrated return or transfer starts a session and counts time without completing a block", () => {
  for (const entry of [review("2026-10-25"), transfer("2026-10-25")]) {
    const p = progress({ ...entry, reviewForSession: session.id, sessionId: session.id, blockIndex: 0 });
    const state = sessionProgress(p, session, { today: "2026-10-26" });
    assert.equal(state.started, true); assert.equal(state.minutes, 3);
    assert.equal(state.completed, 0); assert.equal(state.done, false); assert.equal(state.nextBlock, 0);
    assert.deepEqual(state.attempts, []); assert.deepEqual(state.completedBlocks, []);
    assert.equal(state.reviewAttempts.length, 1);
  }
});

test("invalid, missing, future or empty integrated practice cannot consume the session review slot", () => {
  for (const patch of [{ date: undefined }, { date: "2026-02-30" }, { date: "2026-11-01" }, { minutes: 0 }, { minutes: NaN }]) {
    const p = progress(transfer("2026-10-25", { reviewForSession: session.id, ...patch }));
    const state = sessionProgress(p, session, { today: "2026-10-26" });
    assert.equal(state.started, false); assert.equal(state.minutes, 0); assert.equal(state.reviewAttempts, undefined);
  }
  const p = progress(transfer("2026-10-25", { reviewForSession: session.id }));
  assert.equal(sessionProgress(p, { id: session.id, blocks: [] }, { today: "2026-10-26" }).started, false);
  assert.equal(sessionProgress(p, session, { today: "invalid" }).started, false);
});

test("core completion remains distinct when integrated practice is corrected or removed", () => {
  let p = recordAttempt({}, review("2026-10-25", { reviewForSession: session.id }));
  p = recordAttempt(p, report("2026-10-25", { sessionId: session.id, blockIndex: 0, minutes: 4 }));
  let state = sessionProgress(p, session, { today: "2026-10-26" });
  assert.equal(state.minutes, 7); assert.equal(state.attempts.length, 1); assert.equal(state.reviewAttempts.length, 1);
  assert.deepEqual(state.completedBlocks, [0]); assert.equal(state.reviewCount, 0);
  const corrected = editAttempt(p, 0, { minutes: 2, assessment: "unsure", date: "2026-10-24" });
  assert.equal(corrected.attempts[0].reviewForSession, session.id);
  assert.deepEqual(corrected.attempts[0].reviewCheck, snapshot);
  assert.equal(sessionProgress(corrected, session, { today: "2026-10-26" }).minutes, 6);
  state = sessionProgress(removeAttempt(p, 0), session, { today: "2026-10-26" });
  assert.deepEqual(state.completedBlocks, [0]); assert.equal(state.minutes, 4); assert.equal(state.reviewAttempts, undefined);
  state = sessionProgress(removeAttempt(p, 1), session, { today: "2026-10-26" });
  assert.deepEqual(state.completedBlocks, []); assert.equal(state.started, true); assert.equal(state.nextBlock, 0);
});

test("a transfer never grows or resets the original passage's review interval", () => {
  const original = queue(mature())[0];
  assert.equal(original.intervalDays, 14); assert.equal(original.dueDate, "2026-10-25");
  for (const assessment of ["ready", "practising", "unsure"]) {
    const p = recordAttempt(mature(), transfer("2026-10-25", { assessment, transferCheck: { ...snapshot, assessment } }));
    const item = queue(p)[0];
    assert.equal(item.intervalDays, 14); assert.equal(item.dueDate, "2026-10-25");
    assert.equal(item.delayedCheckCount, 2); assert.equal(item.previousAttempt.date, "2026-10-11");
  }
  assert.deepEqual(queue(progress(transfer("2026-10-01"))), [], "transfer alone cannot establish original practice");
});

test("a transfer occupies only that source's turn today without suppressing other due work", () => {
  let p = recordAttempt(mature(), report("2026-10-01", { exerciseId: "g-reading" }));
  p = recordAttempt(p, transfer("2026-10-25"));
  assert.deepEqual(queue(p, "2026-10-25").map((item) => item.exercise.id), ["g-reading"]);
  assert.deepEqual(new Set(queue(p, "2026-10-26").map((item) => item.exercise.id)), new Set(["c-pulse", "g-reading"]));
  for (const patch of [{ minutes: 0 }, { date: undefined }, { date: "2027-01-01" }]) {
    assert.equal(queue(progress(...mature().attempts, transfer("2026-10-25", patch)), "2026-10-25")[0].exercise.id, "c-pulse");
  }
});

test("fresh-task eligibility counts qualified returns since the last transfer and clears on a source setback", () => {
  assert.equal(queue(mature())[0].checksSinceTransfer, 2);
  let p = recordAttempt(mature(), transfer("2026-10-25"));
  assert.equal(queue(p)[0].checksSinceTransfer, 0);
  p = recordAttempt(p, review("2026-10-26"));
  assert.equal(queue(p, "2026-11-25")[0].checksSinceTransfer, 1);
  p = recordAttempt(p, review("2026-11-25"));
  assert.equal(queue(p, "2026-12-25")[0].checksSinceTransfer, 2);
  p = recordAttempt(p, report("2026-11-30", { assessment: "practising" }));
  assert.equal(queue(p, "2026-12-01")[0].checksSinceTransfer, 0);
  p = recordAttempt(p, review("2026-12-01"));
  assert.equal(queue(p, "2026-12-04")[0].checksSinceTransfer, 1);
});

test("assisted, same-day and narrower checks cannot inflate fresh-task eligibility", () => {
  const p = progress(report("2026-10-01"), review("2026-10-04"), review("2026-10-04"),
    review("2026-10-11", { reviewCheck: { ...snapshot, beforeDemo: false } }),
    review("2026-10-18", { reviewCheck: { ...snapshot, toBar: 2 } }));
  assert.equal(queue(p)[0].checksSinceTransfer, 1);
  const warmed = progress(report("2026-10-01"), report("2026-10-04"), review("2026-10-04"));
  assert.equal(queue(warmed)[0].checksSinceTransfer, 0);
  const repaired = progress(...mature().attempts, review("2026-10-25", { reviewCheck: { ...snapshot, assessment: "practising" } }));
  assert.equal(queue(repaired)[0].checksSinceTransfer, 0);
});

test("transfer corrections and removals recompute eligibility without changing source evidence", () => {
  const p = recordAttempt(mature(), transfer("2026-10-25", { reviewForSession: session.id }));
  assert.equal(queue(p)[0].checksSinceTransfer, 0);
  const corrected = editAttempt(p, 3, { date: "2026-10-05", assessment: "unsure" });
  assert.equal(queue(corrected)[0].checksSinceTransfer, 1);
  assert.equal(corrected.attempts[3].reviewForSession, session.id);
  assert.equal(corrected.attempts[3].transferId, "transfer-pulse-v1-c-0");
  assert.deepEqual(corrected.attempts[3].transferCheck, snapshot);
  const removed = removeAttempt(p, 3);
  assert.equal(queue(removed)[0].checksSinceTransfer, 2);
  assert.equal(queue(removed)[0].intervalDays, 14);
  assert.equal(queue(p)[0].intervalDays, 14, "correction/removal leaves original progress immutable");
});

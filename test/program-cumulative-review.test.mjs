import assert from "node:assert/strict";
import { test } from "node:test";
import { reviewQueue } from "../src/program/review.js";
import { normalizeProgress, recordAttempt, editAttempt, removeAttempt, sessionProgress } from "../src/program/progress.js";

const exercises = [
  { id: "c-pulse", unitId: "c", key: "C major", section: "guided" },
  { id: "c-reading", unitId: "c", key: "C major", section: "guided" },
  { id: "g-chord", unitId: "g", key: "G major", section: "chords" },
  { id: "f-scale", unitId: "f", key: "F major", section: "scales" },
  { id: "place-pulse", unitId: "c", section: "placement" },
];
const report = (date, patch = {}) => ({ exerciseId: "c-pulse", skillIds: ["pulse"], section: "guided", minutes: 3, assessment: "ready", date, ...patch });
const check = (date, patch = {}) => report(date, { section: "review", reviewCheck: { assessment: "ready", beforeDemo: true }, ...patch });
const progress = (...attempts) => normalizeProgress({ attempts });
const queue = (p, today = "2026-11-30", options = {}) => reviewQueue(p, exercises, { today, limit: 20, ...options });
const first = (p, today) => queue(p, today)[0];

test("cumulative review draws practiced lessons from every unit and keeps original exercise identities", () => {
  const p = progress(report("2026-10-01"), report("2026-10-02", { exerciseId: "g-chord" }), report("2026-10-03", { exerciseId: "f-scale" }));
  const before = JSON.stringify(p);
  assert.deepEqual(queue(p).map((item) => item.exercise.unitId), ["c", "g", "f"]);
  assert.equal(first(p).exercise, exercises[0]);
  assert.equal(JSON.stringify(p), before, "selection does not mutate saved progress");
});

test("fresh saves, placement, unpracticed, unknown, missing or invalid dates and zero-minute reports create no review", () => {
  assert.deepEqual(queue({}), []);
  const p = progress(
    report("2026-10-01", { exerciseId: "place-pulse", section: "placement" }),
    report("2026-10-01", { exerciseId: "unknown" }),
    report(undefined), report("2026-02-30"), report("2026-10-01", { minutes: NaN }),
    report("2026-10-01", { exerciseId: "g-chord", section: "placement" }),
  );
  assert.deepEqual(queue(p), []);
  assert.deepEqual(reviewQueue(p, exercises, { today: "invalid" }), []);
  assert.deepEqual(reviewQueue(p, null), []);
});

test("ordinary readiness schedules three days and difficulty schedules the next calendar day", () => {
  const ready = progress(report("2026-10-01"));
  assert.deepEqual(queue(ready, "2026-10-03"), []);
  assert.equal(first(ready, "2026-10-04").dueDate, "2026-10-04");
  assert.equal(first(ready).intervalDays, 3);
  for (const assessment of ["practising", "unsure"]) {
    const p = progress(report("2026-10-01", { assessment }));
    assert.equal(first(p, "2026-10-02").intervalDays, 1);
  }
});

test("distinct later before-demo checks grow spacing through seven, fourteen and thirty days", () => {
  let p = progress(report("2026-10-01"));
  for (const [date, dueDate, intervalDays, count] of [
    ["2026-10-04", "2026-10-11", 7, 1],
    ["2026-10-11", "2026-10-25", 14, 2],
    ["2026-10-25", "2026-11-24", 30, 3],
    ["2026-11-24", "2026-12-24", 30, 4],
  ]) {
    p = recordAttempt(p, check(date));
    assert.deepEqual(queue(p, date), [], "a saved visit leaves today's queue");
    const next = first(p, dueDate);
    assert.equal(next.dueDate, dueDate);
    assert.equal(next.intervalDays, intervalDays);
    assert.equal(next.delayedCheckCount, count);
  }
});

test("same-day repeats and a check after ordinary practice never earn a delayed success", () => {
  const p = progress(report("2026-10-01"), check("2026-10-01"), check("2026-10-01"));
  assert.equal(first(p).intervalDays, 3);
  assert.equal(first(p).delayedCheckCount, 0);
  const warmed = progress(report("2026-10-01"), report("2026-10-04"), check("2026-10-04"));
  assert.equal(first(warmed).intervalDays, 3);
  assert.equal(first(warmed).delayedCheckCount, 0);
  const repeated = progress(report("2026-10-01"), check("2026-10-04"), check("2026-10-04"));
  assert.equal(first(repeated).intervalDays, 7);
  assert.equal(first(repeated).delayedCheckCount, 1);
});

test("supported ready practice retains earned spacing and never creates an independent check", () => {
  const p = progress(report("2026-10-01"), check("2026-10-04"),
    check("2026-10-11", { reviewCheck: { assessment: "ready", beforeDemo: false } }), report("2026-10-12"));
  assert.equal(first(p).intervalDays, 7);
  assert.equal(first(p).dueDate, "2026-10-19");
  assert.equal(first(p).delayedCheckCount, 1);
});

test("a slower, narrower or single-hand check cannot lengthen a larger previous task", () => {
  const previous = report("2026-10-01", { bpm: 60, hands: "both", fromBar: 2, toBar: 5 });
  const snapshot = { assessment: "ready", beforeDemo: true, bpm: 60, hands: "both", fromBar: 2, toBar: 5 };
  for (const patch of [{ bpm: 52 }, { hands: "R" }, { fromBar: 3 }, { toBar: 4 }, { bpm: undefined }, { hands: undefined }, { fromBar: undefined, toBar: undefined }]) {
    const p = progress(previous, check("2026-10-04", { reviewCheck: { ...snapshot, ...patch } }));
    assert.equal(first(p).intervalDays, 3, JSON.stringify(patch));
    assert.equal(first(p).delayedCheckCount, 0);
  }
  const full = progress(previous, check("2026-10-04", { reviewCheck: { ...snapshot, bpm: 64, fromBar: 1, toBar: 6 } }));
  assert.equal(first(full).intervalDays, 7);
  assert.equal(first(full).delayedCheckCount, 1);
  const joined = progress(report("2026-10-01", { hands: "L", bpm: 60 }), check("2026-10-04", { reviewCheck: snapshot }));
  assert.equal(first(joined).intervalDays, 7, "both hands may include a prior single-hand task");
});

test("a failed first check survives repair, resets spacing and rebuilds after a later steady check", () => {
  let p = progress(report("2026-10-01"), check("2026-10-04"), check("2026-10-11", {
    assessment: "ready", reviewCheck: { assessment: "practising", beforeDemo: true },
  }), report("2026-10-11"));
  assert.equal(first(p, "2026-10-12").intervalDays, 1);
  assert.equal(first(p, "2026-10-12").dueDate, "2026-10-12");
  assert.equal(first(p).previousAttempt.assessment, "ready", "practice and initial evidence remain distinct");
  p = recordAttempt(p, check("2026-10-12"));
  assert.equal(first(p).intervalDays, 3);
  assert.equal(first(p).dueDate, "2026-10-15");
});

test("a later same-day setback prevents a ready first check from inflating the interval", () => {
  const p = progress(report("2026-10-01"), check("2026-10-04"), report("2026-10-04", { assessment: "unsure" }));
  assert.equal(first(p).intervalDays, 1);
  assert.equal(first(p).delayedCheckCount, 0);
});

test("future-dated reports do not suppress an earlier due item or bootstrap a new one", () => {
  const p = progress(report("2026-10-01"), report("2027-01-01"), report("2027-01-01", { exerciseId: "g-chord" }));
  assert.deepEqual(queue(p, "2026-10-10").map((item) => item.exercise.id), ["c-pulse"]);
  assert.equal(first(p, "2026-10-10").previousAttempt.date, "2026-10-01");
});

test("backdated edits are replayed chronologically and removal recalculates evidence", () => {
  const p = progress(check("2026-10-04"), report("2026-10-01"));
  assert.equal(first(p).intervalDays, 7, "the appended earlier report is considered before the check");
  const changed = editAttempt(p, 0, { assessment: "unsure", date: "2026-10-06" });
  assert.equal(first(changed).dueDate, "2026-10-07");
  assert.equal(first(changed).intervalDays, 1);
  const removed = removeAttempt(p, 0);
  assert.equal(first(removed).dueDate, "2026-10-04");
  assert.equal(first(removed).delayedCheckCount, 0);
});

test("calendar-day scheduling remains stable across daylight-saving boundaries", () => {
  assert.equal(first(progress(report("2026-10-31")), "2026-11-03").dueDate, "2026-11-03");
  assert.equal(first(progress(report("2026-03-07")), "2026-03-10").dueDate, "2026-03-10");
  assert.equal(first(progress(report("2028-02-27")), "2028-03-01").dueDate, "2028-03-01");
});

test("equally due work alternates keys while much older work retains priority", () => {
  const p = progress(report("2026-10-01"), report("2026-10-01", { exerciseId: "c-reading" }), report("2026-10-01", { exerciseId: "g-chord" }));
  assert.deepEqual(queue(p, "2026-10-10", { limit: 3 }).map((item) => item.exercise.id), ["c-pulse", "g-chord", "c-reading"]);
  const older = progress(report("2026-09-01"), report("2026-09-01", { exerciseId: "c-reading" }), report("2026-10-01", { exerciseId: "g-chord" }));
  assert.deepEqual(queue(older, "2026-10-10", { limit: 2 }).map((item) => item.exercise.id), ["c-pulse", "c-reading"]);
  assert.deepEqual(queue(p, "2026-10-10", { limit: 0 }), []);
});

test("return evidence is normalized without accepting imported completion or measured-accuracy claims", () => {
  const raw = { ...check("2026-10-04"), sessionId: "day-1-a", blockIndex: 0, accuracy: 100,
    reviewCheck: { assessment: "ready", beforeDemo: true, measured: true } };
  const p = recordAttempt({}, raw);
  assert.deepEqual(p.attempts[0].reviewCheck, { assessment: "ready", beforeDemo: true });
  assert.equal(p.attempts[0].sessionId, undefined);
  assert.equal(p.attempts[0].blockIndex, undefined);
  assert.equal(p.attempts[0].accuracy, undefined);
  assert.deepEqual(p.completedBlocks, {});
  assert.equal(sessionProgress(p, { id: "day-1-a", blocks: [{ exerciseId: "c-pulse" }] }).started, false);
  assert.deepEqual(normalizeProgress(JSON.parse(JSON.stringify(p))), p);
  const imported = normalizeProgress({ attempts: [raw] });
  assert.deepEqual(imported.completedBlocks, {});
  assert.equal(imported.attempts[0].sessionId, undefined);
});

test("malformed and misplaced check metadata is dropped and old logs acquire no retention claims", () => {
  const malformed = [null, [], {}, { assessment: "mastered", beforeDemo: true }, { assessment: "ready", beforeDemo: "true" }];
  for (const reviewCheck of malformed) assert.equal(progress(check("2026-10-01", { reviewCheck })).attempts[0].reviewCheck, undefined);
  assert.equal(progress(report("2026-10-01", { reviewCheck: { assessment: "ready", beforeDemo: true } })).attempts[0].reviewCheck, undefined);
  const old = progress(report("2026-10-01"), report("2026-10-04"), report("2026-10-07"));
  assert.equal(first(old).intervalDays, 3);
  assert.equal(first(old).delayedCheckCount, 0);
  assert.ok(old.attempts.every((entry) => !entry.reviewCheck));
});

test("initial-check scope is normalized separately from subsequent practice settings", () => {
  const p = progress(check("2026-10-04", { bpm: 80, hands: "both", fromBar: 1, toBar: 8,
    reviewCheck: { assessment: "practising", beforeDemo: true, bpm: 52, hands: "LH", fromBar: 2, toBar: 4 } }));
  assert.deepEqual(p.attempts[0].reviewCheck, { assessment: "practising", beforeDemo: true, bpm: 52, hands: "L", fromBar: 2, toBar: 4 });
  assert.equal(p.attempts[0].bpm, 80);
  assert.equal(p.attempts[0].hands, "both");
  const invalid = progress(check("2026-10-04", { reviewCheck: { assessment: "ready", beforeDemo: true,
    bpm: Infinity, hands: "any", fromBar: 4, toBar: 2 } }));
  assert.deepEqual(invalid.attempts[0].reviewCheck, { assessment: "ready", beforeDemo: true });
});

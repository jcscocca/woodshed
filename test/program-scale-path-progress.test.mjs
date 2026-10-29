import assert from "node:assert/strict";
import { scaleTrackStats, scaleSuggestion } from "../src/program/scalePathProgress.js";
import { recordAttempt } from "../src/program/progress.js";

const today = "2026-10-29", options = { today };
const abc = "X:1\nM:4/4\nL:1/4\nK:C\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n[V:1] C4 | D4 | E4 | C4 |]\n[V:2] z4 | z4 | z4 | z4 |]";
const exercises = [
  { id: "sc-test-c-r", key: "C major", hands:"R", abc, technique:{pattern:"major",tonic:"C",octaves:1} },
  { id: "sc-test-c-l", key: "C major", hands:"L", abc, technique:{pattern:"major",tonic:"C",octaves:1} },
  { id: "sc-test-dm-r", key: "D minor", hands:"R", abc, technique:{pattern:"natural-minor",tonic:"D",octaves:1} },
];
const visit = (patch = {}) => ({ exerciseId: exercises[0].id, section: "scales", assessment: "ready", minutes: 3, date: today, fromBar:1,toBar:4,hands:"R",techniqueScope:"round-trip",...patch });
const progress = (...attempts) => ({ attempts });
let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (error) { failures++; console.error(`FAIL ${name}\n${error.stack}`); } };

test("empty path recommends a single first lesson without locking the rest", () => {
  assert.deepEqual(scaleSuggestion(null, exercises, [], options), { kind: "new", exercise: exercises[0] });
  assert.equal(scaleSuggestion(null, [], [], options), null);
});
test("due return has priority over new work and an immediate repair", () => {
  const due = { exercise: exercises[2], previousAttempt: visit({ exerciseId: exercises[2].id, date: "2026-10-22" }) };
  const unrelated = { exercise: { id: "outside-this-selection" } };
  const suggestion = scaleSuggestion(progress(visit({ assessment: "practising" })), exercises, [unrelated, due], options);
  assert.equal(suggestion.kind, "review"); assert.equal(suggestion.exercise.id, exercises[2].id); assert.equal(suggestion.review, due);
});
test("a difficult first return stays a repair after a same-day successful final report", () => {
  const attempt = visit({ section: "review", assessment: "ready", reviewCheck: { assessment: "practising", beforeDemo: true, hands: "R", bpm: 40, fromBar: 1, toBar: 2 } });
  const suggestion = scaleSuggestion(progress(attempt), exercises, [], options);
  assert.equal(suggestion.kind, "repair"); assert.equal(suggestion.exercise.id, exercises[0].id);
  assert.deepEqual(attempt.reviewCheck, { assessment: "practising", beforeDemo: true, hands: "R", bpm: 40, fromBar: 1, toBar: 2 });
});
test("the chronologically latest report governs repair after a date correction", () => {
  const p = progress(visit({ date: today, assessment: "practising" }), visit({ date: "2026-10-20", assessment: "ready" }));
  assert.equal(scaleSuggestion(p, exercises, [], options).kind, "repair");
  assert.equal(scaleSuggestion(progress(visit({ date: "2026-10-20", assessment: "practising" }), visit()), exercises, [], options).exercise.id, exercises[1].id);
});
test("future, invalid, zero-minute, placement and unrelated visits cannot advance the path", () => {
  const p = progress(visit({ date: "2026-10-30" }), visit({ date: "2026-02-30" }), visit({ minutes: 0 }), visit({ section: "placement" }), visit({ exerciseId: "unrelated", minutes: 30 }));
  assert.deepEqual(scaleTrackStats(p, exercises, options), { visits: 0, minutes: 0, lessons: 0, keys: 0 });
  assert.equal(scaleSuggestion(p, exercises, [], options).exercise.id, exercises[0].id);
});
test("partial ready passages establish visits rather than full-scale mastery", () => {
  const attempts = exercises.map((exercise) => visit({ exerciseId: exercise.id, fromBar: 1, toBar: 1, hands: "R", checks: ["One chunk felt steady"] }));
  const p = progress(...attempts), snapshot = JSON.stringify(p);
  assert.deepEqual(scaleTrackStats(p, exercises, options), { visits: 3, minutes: 9, lessons: 3, keys: 2 });
  assert.deepEqual(scaleSuggestion(p, exercises, [], options), { kind: "extend", exercise: exercises[0] });
  assert.equal(JSON.stringify(p), snapshot); assert.equal("mastered" in scaleTrackStats(p, exercises, options), false);
});
test("returns count in activity and never mark a guided block", () => {
  let p = recordAttempt(null, visit());
  p = recordAttempt(p, visit({ section: "review", date: "2026-10-28", minutes: 2, sessionId: "c1-d1-a", blockIndex: 0, reviewCheck: { assessment: "ready", beforeDemo: true } }));
  assert.deepEqual(scaleTrackStats(p, exercises, options), { visits: 2, minutes: 5, lessons: 1, keys: 1 });
  assert.deepEqual(p.completedBlocks, {});
});

if (failures) process.exitCode = 1;

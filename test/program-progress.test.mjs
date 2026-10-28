import assert from "node:assert/strict";
import { normalizeProgress, recordAttempt, exerciseProgress, skillProgress, sessionProgress, nextSession, contextForExercise, editAttempt, removeAttempt } from "../src/program/progress.js";
import { COURSE, UNITS, EXERCISES, SESSIONS, sessionsForUnit } from "../src/program/curriculum.js";

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.stack}`); } };
const base = { exerciseId: "chord-c-primary", skillIds: ["key-c", "steady-pulse"], assessment: "practising", minutes: 3, date: "2026-10-27" };
const log = (p, patch = {}) => recordAttempt(p, { ...base, ...patch });
const session = { id: "day-1-a", blocks: [{ exerciseId: "chord-c-primary" }, { exerciseId: "scale-c" }, { exerciseId: "reading-c" }] };

test("empty and malformed progress have safe additive defaults", () => {
  for (const raw of [undefined, null, [], "old save", 4, { attempts: {}, completedBlocks: [], placement: [] }]) {
    assert.deepEqual(normalizeProgress(raw), { attempts: [], completedBlocks: {}, placement: {} });
  }
  assert.equal(exerciseProgress({}, base.exerciseId).status, "new");
  assert.equal(skillProgress({}, "key-c").minutes, 0);
});

test("import drops invalid claims and sanitizes optional fields without inventing a score", () => {
  const p = normalizeProgress({ attempts: [null, {}, { ...base, assessment: "100%" }, {
    ...base, skillIds: ["key-c", "key-c", {}, "__proto__"], minutes: -3,
    bpm: Infinity, hands: "tentacles", date: "2026-02-30", note: {}, section: [],
    sessionId: "day-1-a", blockIndex: -1, accuracy: 100,
  }], completedBlocks: { "day-1-a": [0, 0, -1, 1.2, "2", 99999], bad: "all" }, placement: { "scale-c": "ready", unknown: "mastered" } });
  assert.equal(p.attempts.length, 1);
  assert.deepEqual(p.attempts[0], { exerciseId: base.exerciseId, skillIds: ["key-c"], assessment: "practising", minutes: 0 });
  assert.deepEqual(p.completedBlocks, { "day-1-a": [0] });
  assert.deepEqual(p.placement, { "scale-c": "ready" });
  assert.equal(exerciseProgress(p, "scale-c").status, "ready");
});

test("recording is immutable, valid metadata survives a normalized JSON save", () => {
  const original = normalizeProgress();
  const frozen = JSON.stringify(original);
  const p = log(original, { bpm: 64, hands: "RH", section: "chords", note: "  Keep the pulse  " });
  assert.equal(JSON.stringify(original), frozen);
  assert.equal(p.attempts[0].hands, "R");
  assert.equal(p.attempts[0].note, "Keep the pulse");
  assert.deepEqual(normalizeProgress(JSON.parse(JSON.stringify(p))), p);
  assert.throws(() => recordAttempt(p, { exerciseId: "scale-c", assessment: "mastered" }), TypeError);
});

test("the same exercise shares evidence across Chords, Scales and Guided Practice", () => {
  let p = log({}, { section: "chords", assessment: "ready", bpm: 60, hands: "both" });
  p = log(p, { section: "scales", minutes: 2, assessment: "unsure" });
  p = log(p, { section: "guided", sessionId: session.id, blockIndex: 0, minutes: 4, assessment: "practising", bpm: 64 });
  const ex = exerciseProgress(p, base.exerciseId), skill = skillProgress(p, "steady-pulse");
  assert.equal(ex.count, 3); assert.equal(ex.practiceCount, 3); assert.equal(ex.reviewCount, 2);
  assert.equal(ex.minutes, 9); assert.equal(skill.minutes, 9);
  assert.equal(ex.status, "practising"); assert.equal(skill.status, "practising");
  assert.equal(ex.bpm, 64); assert.equal(ex.hands, "both"); assert.equal(ex.lastPractised, "2026-10-27");
  assert.ok(!("accuracy" in ex));
});

test("readiness follows the learner's latest assessment, never elapsed minutes", () => {
  let p = log({}, { minutes: 20, assessment: "unsure" });
  assert.equal(exerciseProgress(p, base.exerciseId).status, "unsure");
  p = log(p, { minutes: 0, assessment: "ready" });
  assert.equal(exerciseProgress(p, base.exerciseId).status, "ready");
  p = log(p, { minutes: 2, assessment: "unsure" });
  assert.equal(exerciseProgress(p, base.exerciseId).status, "unsure");
  assert.equal(skillProgress(p, "key-c").status, "unsure");
});

test("placement records readiness and skills separately from practice and session completion", () => {
  const p = log({}, { section: "placement", assessment: "ready", minutes: 2, sessionId: session.id, blockIndex: 0 });
  const ex = exerciseProgress(p, base.exerciseId);
  assert.equal(p.placement[base.exerciseId], "ready");
  assert.equal(ex.status, "ready"); assert.equal(ex.placementCount, 1); assert.equal(ex.placementMinutes, 2);
  assert.equal(ex.practiceCount, 0); assert.equal(ex.minutes, 0); assert.equal(ex.reviewCount, 0);
  assert.equal(ex.lastPractised, null); assert.equal(skillProgress(p, "key-c").status, "ready");
  assert.equal(sessionProgress(p, session).started, false);
  assert.deepEqual(p.completedBlocks, {});
  const practiced = log(p, { assessment: "unsure" });
  assert.equal(practiced.placement[base.exerciseId], "ready", "placement remains the initial checkpoint record");
  assert.equal(exerciseProgress(practiced, base.exerciseId).status, "unsure");
});

test("partial sessions resume at the first unlogged block after save/reload", () => {
  let p = log({}, { section: "chords", assessment: "ready" });
  assert.equal(sessionProgress(p, session).nextBlock, 0, "direct practice must not silently skip a guided block");
  p = log(p, { sessionId: session.id, blockIndex: 0 });
  p = log(p, { sessionId: session.id, blockIndex: 2, exerciseId: "reading-c", assessment: "unsure" });
  const resumed = sessionProgress(normalizeProgress(JSON.parse(JSON.stringify(p))), session);
  assert.deepEqual(resumed.completedBlocks, [0, 2]); assert.equal(resumed.nextBlock, 1);
  assert.equal(resumed.completed, 2); assert.equal(resumed.total, 3); assert.equal(resumed.done, false);
  assert.equal(resumed.minutes, 6); assert.equal(resumed.reviewCount, 0);
  assert.equal(resumed.started, true);
});

test("reviewing a block counts another practice without duplicating completion", () => {
  let p = log({}, { sessionId: session.id, blockIndex: 0 });
  p = log(p, { sessionId: session.id, blockIndex: 0, assessment: "ready" });
  const s = sessionProgress(p, session);
  assert.deepEqual(s.completedBlocks, [0]); assert.equal(s.reviewCount, 1); assert.equal(s.minutes, 6);
  assert.equal(s.nextBlock, 1);
});

test("completion is not mastery and next-session selection never locks a stage", () => {
  const other = { id: "day-1-b", blocks: [{ exerciseId: "scale-c" }] };
  let p = {};
  for (let i = 0; i < 3; i++) p = log(p, { sessionId: session.id, blockIndex: i, assessment: "unsure" });
  const s = sessionProgress(p, session);
  assert.equal(s.done, true); assert.equal(s.nextBlock, null);
  assert.equal(exerciseProgress(p, base.exerciseId).status, "unsure");
  assert.equal(nextSession(p, [session, other]), other);
  p = log(p, { sessionId: other.id, blockIndex: 0, exerciseId: "scale-c" });
  assert.equal(nextSession(p, [session, other]), null);
  assert.equal(nextSession(p, null), null);
});

test("history beyond 500 attempts preserves earlier evidence, minutes and completed blocks", () => {
  let p = log({}, { sessionId: session.id, blockIndex: 0 });
  p = log(p, { section: "placement", exerciseId: "placed-g", assessment: "ready" });
  for (let i = 0; i < 505; i++) p = log(p, { exerciseId: "scale-f" });
  assert.equal(p.attempts.length, 507);
  p = normalizeProgress(JSON.parse(JSON.stringify(p)));
  assert.equal(p.attempts.length, 507);
  assert.equal(exerciseProgress(p, base.exerciseId).minutes, 3);
  assert.equal(exerciseProgress(p, "scale-f").minutes, 1515);
  assert.equal(skillProgress(p, "steady-pulse").minutes, 1518);
  assert.equal(exerciseProgress(p, "placed-g").placementCount, 1);
  assert.deepEqual(sessionProgress(p, session).completedBlocks, [0]);
  assert.equal(exerciseProgress(p, "placed-g").status, "ready");
});

test("invalid session metadata and empty session definitions do not create completion", () => {
  const p = log({}, { sessionId: session.id, blockIndex: "0" });
  assert.deepEqual(p.completedBlocks, {});
  assert.equal(sessionProgress(p, { id: session.id, blocks: [] }).done, false);
  assert.equal(sessionProgress(p, null).nextBlock, null);
  const hostile = JSON.parse('{"completedBlocks":{"__proto__":[0],"constructor":[1]},"placement":{"__proto__":"ready"}}');
  assert.deepEqual(normalizeProgress(hostile), { attempts: [], completedBlocks: {}, placement: {} });
  assert.equal({}.polluted, undefined);
});

test("direct practice context completes one occurrence only in the first incomplete plan", () => {
  const first = { id: "day-1-a", blocks: [{ exerciseId: base.exerciseId }, { exerciseId: "scale-c" }, { exerciseId: base.exerciseId }] };
  const future = { id: "day-1-b", blocks: [{ exerciseId: base.exerciseId }, { exerciseId: "future-only" }] };
  const sessions = [first, future];
  assert.deepEqual(contextForExercise({}, sessions, base.exerciseId), { sessionId: first.id, blockIndex: 0 });
  assert.deepEqual(contextForExercise({}, sessions, "future-only"), {}, "a later session is never inferred");
  let p = log({}, { section: "chords", ...contextForExercise({}, sessions, base.exerciseId) });
  assert.deepEqual(sessionProgress(p, first).completedBlocks, [0]);
  assert.deepEqual(sessionProgress(p, future).completedBlocks, []);
  assert.deepEqual(contextForExercise(p, sessions, base.exerciseId), { sessionId: first.id, blockIndex: 2 });
  p = log(p, { section: "chords", ...contextForExercise(p, sessions, base.exerciseId) });
  assert.deepEqual(sessionProgress(p, first).completedBlocks, [0, 2]);
  assert.deepEqual(contextForExercise(p, sessions, base.exerciseId), {}, "repeated practice does not jump to the next plan while this one is incomplete");
  p = log(p, { exerciseId: "scale-c", ...contextForExercise(p, sessions, "scale-c") });
  assert.deepEqual(contextForExercise(p, sessions, base.exerciseId), { sessionId: future.id, blockIndex: 0 });
  assert.deepEqual(contextForExercise(p, sessions, "unknown"), {});
});

test("inferred direct context is a default and explicit guided context remains authoritative", () => {
  const sessions = [session, { id: "day-2-a", blocks: [{ exerciseId: base.exerciseId }] }];
  const p = log({}, { ...contextForExercise({}, sessions, base.exerciseId), sessionId: "day-2-a", blockIndex: 0, section: "guided" });
  assert.deepEqual(sessionProgress(p, session).completedBlocks, []);
  assert.deepEqual(sessionProgress(p, sessions[1]).completedBlocks, [0]);
  assert.deepEqual(contextForExercise(p, sessions, base.exerciseId), { sessionId: session.id, blockIndex: 0 });
});

test("an old C-only save resumes the same block after G and F are added", () => {
  const old = {
    attempts: [{ exerciseId: "rhythm-long-short", skillIds: ["pulse"], assessment: "unsure", minutes: 3, date: "2026-10-27", sessionId: "c1-d1-a", blockIndex: 0 }],
    completedBlocks: { "c1-d1-a": [0, 2] },
    placement: { "place-pulse": "practising" },
  };
  const p = normalizeProgress(JSON.parse(JSON.stringify(old)));
  assert.deepEqual(p, old, "new units must not rewrite original progress identities");
  const current = nextSession(p, SESSIONS);
  assert.equal(current.id, "c1-d1-a");
  assert.equal(sessionProgress(p, current).nextBlock, 1);
  assert.equal(current.blocks[1].exerciseId, "read-family-c");
  assert.equal(exerciseProgress(p, "rhythm-long-short").minutes, 3);
  assert.equal(exerciseProgress(p, "rhythm-long-short").status, "unsure");
  assert.deepEqual(p.placement, { "place-pulse": "practising" });
});

test("global next-session order crosses every unit without clearing future reviews", () => {
  const completedBlocks = {};
  const completeUnit = (unitId) => {
    for (const s of sessionsForUnit(unitId)) completedBlocks[s.id] = s.blocks.map((_, i) => i);
    return normalizeProgress({ completedBlocks });
  };
  assert.equal(nextSession({}, SESSIONS).unitId, COURSE.id);
  let p;
  for (let i = 0; i < UNITS.length; i++) {
    p = completeUnit(UNITS[i].id);
    if (i + 1 < UNITS.length) {
      assert.equal(nextSession(p, SESSIONS).id, sessionsForUnit(UNITS[i + 1].id)[0].id);
      assert.ok(sessionsForUnit(UNITS[i + 1].id).every((s) => !sessionProgress(p, s).done));
    }
  }
  assert.equal(nextSession(p, SESSIONS), null);
});

test("explicit unit filtering lets direct practice count only toward its current unit plan", () => {
  const byId = new Map(EXERCISES.map((e) => [e.id, e]));
  const gSessions = sessionsForUnit(UNITS[1].id);
  const target = gSessions.find((s) => s.blocks.some((b) => ["chords", "scales"].includes(byId.get(b.exerciseId)?.section)));
  const index = target.blocks.findIndex((b) => ["chords", "scales"].includes(byId.get(b.exerciseId)?.section));
  const ex = byId.get(target.blocks[index].exerciseId);
  const completedBlocks = Object.fromEntries(gSessions.slice(0, gSessions.indexOf(target)).map((s) => [s.id, s.blocks.map((_, i) => i)]));
  let p = normalizeProgress({ completedBlocks });
  assert.equal(nextSession(p, SESSIONS).unitId, UNITS[0].id, "C remains incomplete globally");
  assert.equal(nextSession(p, gSessions).id, target.id, "the explicitly selected unit can be practised independently");
  assert.deepEqual(contextForExercise(p, SESSIONS, ex.id), {}, "unfiltered inference must not jump over incomplete C");
  const context = contextForExercise(p, gSessions, ex.id);
  assert.deepEqual(context, { sessionId: target.id, blockIndex: index });
  p = recordAttempt(p, { exerciseId: ex.id, skillIds: ex.skillIds, assessment: "practising", minutes: 4, section: ex.section, date: "2026-10-27", ...context });
  assert.equal(exerciseProgress(p, ex.id).practiceCount, 1);
  assert.equal(exerciseProgress(p, ex.id).minutes, 4);
  assert.deepEqual(sessionProgress(p, target).completedBlocks, [index]);
  assert.ok(sessionsForUnit(UNITS[0].id).every((s) => !sessionProgress(p, s).started));
  assert.ok(sessionsForUnit(UNITS[2].id).every((s) => !sessionProgress(p, s).started));
  assert.ok(gSessions.slice(gSessions.indexOf(target) + 1).every((s) => !sessionProgress(p, s).started), "later repetitions in G remain uncompleted");
});

test("passage, visit goal and observed criteria survive a normalized save without implying mastery", () => {
  const p = log(null, { fromBar: 2, toBar: 4, goal: "Join the bass change", checks: ["The bass stays held", "The bass stays held", null] });
  const saved = normalizeProgress(JSON.parse(JSON.stringify(p))).attempts[0];
  assert.equal(saved.fromBar, 2); assert.equal(saved.toBar, 4);
  assert.equal(saved.goal, "Join the bass change"); assert.deepEqual(saved.checks, ["The bass stays held"]);
  assert.equal(saved.assessment, "practising");
  const invalid = log(null, { fromBar: 4, toBar: 2, checks: [false, " "] }).attempts[0];
  assert.equal(invalid.fromBar, undefined); assert.deepEqual(invalid.checks, []);
});

test("correcting a log preserves its exercise and completion while updating the learner's report", () => {
  const p = log(null, { sessionId: session.id, blockIndex: 0, note: "Old note" });
  const corrected = editAttempt(p, 0, { minutes: 8, assessment: "ready", note: "", exerciseId: "wrong-identity" });
  assert.equal(corrected.attempts[0].exerciseId, base.exerciseId);
  assert.equal(corrected.attempts[0].note, undefined); assert.equal(corrected.attempts[0].minutes, 8);
  assert.equal(corrected.attempts[0].assessment, "ready");
  assert.deepEqual(corrected.completedBlocks[session.id], [0]);
  assert.equal(p.attempts[0].minutes, 3, "original progress is unchanged");
  assert.throws(() => editAttempt(p, 0, { minutes: -2 }), /valid/);
  assert.throws(() => editAttempt(p, 0, { date: "2026-02-30" }), /valid/);
});

test("removing the last report reopens only its block, retaining another report and imported completion", () => {
  let p = log({ completedBlocks: { imported: [2] } }, { sessionId: session.id, blockIndex: 0 });
  p = log(p, { sessionId: session.id, blockIndex: 0 });
  p = log(p, { sessionId: session.id, blockIndex: 1 });
  p = removeAttempt(p, 0);
  assert.deepEqual(p.completedBlocks[session.id], [0, 1], "another report still credits block zero");
  p = removeAttempt(p, 0);
  assert.deepEqual(p.completedBlocks[session.id], [1]);
  assert.deepEqual(p.completedBlocks.imported, [2]);
  assert.equal(sessionProgress(p, session).nextBlock, 0);
  assert.throws(() => removeAttempt(p, 90), /saved practice/);
});

test("removing a new review preserves the same block's imported completion through save, edit and reload", () => {
  const old = normalizeProgress({ completedBlocks: { [session.id]: [0] } });
  assert.deepEqual(Object.keys(old).sort(), ["attempts", "completedBlocks", "placement"]);
  let p = log(old, { sessionId: session.id, blockIndex: 0 });
  assert.deepEqual(p.completionOnlyBlocks, { [session.id]: [0] });
  p = normalizeProgress(JSON.parse(JSON.stringify(p)));
  p = editAttempt(p, 0, { minutes: 5 });
  p = removeAttempt(p, 0);
  assert.deepEqual(p.completedBlocks, old.completedBlocks);
  assert.equal(sessionProgress(p, session).completed, 1);
  assert.deepEqual(old, normalizeProgress({ completedBlocks: { [session.id]: [0] } }), "original remains unchanged");
});

test("new first-ever completions still reopen after every report is removed", () => {
  let p = log({}, { sessionId: session.id, blockIndex: 0 });
  p = log(p, { sessionId: session.id, blockIndex: 0 });
  assert.equal(p.completionOnlyBlocks, undefined, "a logged block is not imported evidence");
  p = removeAttempt(p, 1);
  assert.deepEqual(sessionProgress(p, session).completedBlocks, [0]);
  p = removeAttempt(p, 0);
  assert.deepEqual(sessionProgress(p, session).completedBlocks, []);
});

test("completion-only provenance is sanitized and cannot manufacture a new completion", () => {
  const p = normalizeProgress({ completedBlocks: { [session.id]: [0, 2] }, completionOnlyBlocks: {
    [session.id]: [0, 0, 1, -1, "2", 99999], missing: [0], toString: [0], bad: "all",
  } });
  assert.deepEqual(p.completionOnlyBlocks, { [session.id]: [0] });
  assert.deepEqual(p.completedBlocks, { [session.id]: [0, 2] });
  const safe = log({}, { sessionId: "toString", blockIndex: 0 });
  assert.deepEqual(safe.completedBlocks.toString, [0]);
  assert.deepEqual(removeAttempt(safe, 0).completedBlocks, {});
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exitCode = 1; } else console.log("\nall green"); });

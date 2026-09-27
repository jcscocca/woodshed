import assert from "node:assert/strict";
import abcjs from "abcjs";
const { parseScore, inSection, forHands } = await import("../src/score/scoreModel.js");

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

const MINI = `X:1
M:3/4
L:1/8
K:G
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 |
[V:2] [G,B,D]4 A,2 | B,6 | C6 | B,6 |`;

test("parseScore: metre, key, bars", () => {
  const s = parseScore(MINI, abcjs);
  assert.deepEqual(s.meter, [3, 4]); assert.equal(s.beatsPerBar, 3); assert.equal(s.key, "G");
  assert.deepEqual(s.bars.map((b) => b.beat), [0, 3, 6, 9]);
});
test("parseScore: right-hand pitches, beats and the key signature's F#", () => {
  const rh = parseScore(MINI, abcjs).notes.filter((n) => n.hand === "R" && n.bar <= 3);
  assert.deepEqual(rh.map((n) => n.midi), [74, 67, 69, 71, 72, 74, 67, 67, 76, 72, 74, 76, 78]);
  assert.deepEqual(rh.slice(0, 5).map((n) => n.beat), [0, 1, 1.5, 2, 2.5]);
});
test("parseScore: a left-hand chord is one onset", () => {
  const s = parseScore(MINI, abcjs);
  const first = s.notes.filter((n) => n.beat === 0);
  assert.deepEqual(first.map((n) => `${n.hand}${n.midi}`), ["L55", "L59", "L62", "R74"]);
  assert.ok(first.every((n) => n.onset === 0));
});
test("parseScore: durations in beats and bar numbers", () => {
  const lh = parseScore(MINI, abcjs).notes.filter((n) => n.hand === "L");
  assert.deepEqual(lh.map((n) => [n.midi, n.beat, n.dur, n.bar]), [[55, 0, 2, 1], [59, 0, 2, 1], [62, 0, 2, 1], [57, 2, 1, 1], [59, 3, 3, 2], [60, 6, 3, 3], [59, 9, 3, 4]]);
});
test("parseScore: a one-voice bass-clef score is the left hand", () => {
  const s = parseScore("X:1\nM:4/4\nL:1/4\nK:C clef=bass\nC, D, E, F,|G,4|", abcjs);
  assert.ok(s.notes.every((n) => n.hand === "L")); assert.equal(s.notes[0].midi, 48);
});
test("inSection and forHands filter notes", () => {
  const s = parseScore(MINI, abcjs);
  assert.ok(inSection(s.notes, 2, 3).every((n) => n.bar >= 2 && n.bar <= 3));
  assert.ok(forHands(s.notes, "L").every((n) => n.hand === "L"));
  assert.equal(forHands(s.notes, "both").length, s.notes.length);
});

const { gradeTimed, ON_MS, WINDOW_MS } = await import("../src/score/timedGrade.js");
const { createWaitRun } = await import("../src/score/waitGrade.js");
const T = (midi, beat, bar = 1) => ({ midi, beat, bar });
const E = (midi, tStart) => ({ midi, tStart });
// 60 bpm: one beat = 1000 ms; t0 = 10000
const opts = (now = Infinity) => ({ t0: 10000, bpm: 60, beatsPerBar: 4, now });

test("gradeTimed: on, early, late at the 60 and 180 ms edges", () => {
  const targets = [T(60, 0), T(62, 1), T(64, 2), T(65, 3)];
  const r = gradeTimed(targets, [E(60, 10060), E(62, 10939), E(64, 12180), E(65, 13181)], opts());
  assert.deepEqual(r.statuses, ["on", "early", "late", "missed"]);
  assert.equal(ON_MS, 60); assert.equal(WINDOW_MS, 180);
});
test("gradeTimed: pending before a window closes, missed after", () => {
  const targets = [T(60, 0), T(62, 1)];
  assert.deepEqual(gradeTimed(targets, [], opts(11100)).statuses, ["missed", "pending"]);
  assert.equal(gradeTimed(targets, [], opts(11100)).done, false);
  assert.equal(gradeTimed(targets, [], opts(11181)).done, true);
});
test("gradeTimed: a slip doesn't shift later notes", () => {
  const targets = [T(60, 0), T(62, 1), T(64, 2), T(65, 3)];
  const r = gradeTimed(targets, [E(61, 10000), E(62, 11000), E(64, 12000), E(65, 13000)], opts());
  assert.deepEqual(r.statuses, ["missed", "on", "on", "on"]);
  assert.deepEqual(r.extras, [{ midi: 61, bar: 1 }]);
});
test("gradeTimed: repeated notes and chords each match their own press", () => {
  const targets = [T(60, 0), T(64, 0), T(67, 0), T(60, 1), T(60, 2)];
  const r = gradeTimed(targets, [E(67, 10010), E(60, 10020), E(64, 10030), E(60, 11010), E(60, 12100)], opts());
  assert.deepEqual(r.statuses, ["on", "on", "on", "on", "late"]);
});
test("gradeTimed: notes % and rhythm %, clean pass, revisit bars", () => {
  const targets = [T(60, 0, 1), T(62, 1, 1), T(64, 4, 2), T(65, 5, 2), T(67, 8, 3)];
  const r = gradeTimed(targets, [E(60, 10000), E(62, 11100), E(64, 14000), E(65, 15000)], opts());
  assert.equal(r.notesPct, 80); assert.equal(r.rhythmPct, 75); assert.equal(r.clean, false);
  assert.deepEqual(r.revisitBars, [1, 3]);
  const clean = gradeTimed(targets, targets.map((t) => E(t.midi, 10000 + t.beat * 1000)), opts());
  assert.equal(clean.notesPct, 100); assert.equal(clean.rhythmPct, 100); assert.equal(clean.clean, true);
});
test("gradeTimed: the section's first beat lands at t0", () => {
  const targets = [T(60, 9, 4), T(62, 10, 4)];
  assert.deepEqual(gradeTimed(targets, [E(60, 10000), E(62, 11000)], opts()).statuses, ["on", "on"]);
});
test("gradeTimed: cursor is the first pending target in time", () => {
  const targets = [T(60, 0), T(62, 1), T(64, 2)];
  assert.equal(gradeTimed(targets, [E(60, 10000)], opts(10500)).cursor, 1);
  assert.equal(gradeTimed(targets, targets.map((t) => E(t.midi, 10000 + t.beat * 1000)), opts()).cursor, -1);
});
test("createWaitRun: a chord advances only when all its notes are pressed, rolled is fine", () => {
  const run = createWaitRun([T(60, 0), T(64, 0), T(67, 0), T(62, 1)]);
  assert.equal(run.press(64), "held"); assert.equal(run.press(60), "held"); assert.equal(run.cursor, 0);
  assert.equal(run.press(67), "advance"); assert.equal(run.cursor, 1);
  assert.equal(run.press(62), "done"); assert.equal(run.done, true);
});
test("createWaitRun: a wrong press flashes but never advances", () => {
  const run = createWaitRun([T(60, 0, 1), T(62, 1, 1), T(64, 4, 2)]);
  assert.equal(run.press(61), "wrong"); assert.equal(run.cursor, 0);
  run.press(60); run.press(62); run.press(65);
  assert.deepEqual(run.result(), { found: 2, total: 3, wrong: 2, wrongBars: [1, 2] });
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

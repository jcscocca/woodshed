import assert from "node:assert/strict";
import abcjs from "abcjs";
import { EXERCISES, SESSIONS } from "../src/program/curriculum.js";
import { parseScore } from "../src/score/scoreModel.js";

const test = (name, fn) => { fn(); console.log(`ok   ${name}`); };
const byId = new Map(EXERCISES.map((e) => [e.id, e]));
const parse = (id) => parseScore(byId.get(id).abc, abcjs);

// Independently transcribed from Mutopia 931, pickup and first ending on page 1.
// Each entry is [MIDI pitch, offset within the written bar, quarter-note duration].
const opening = [[76, 0, 0.25], [75, 0.25, 0.25], [76, 0.5, 0.25], [71, 0.75, 0.25], [74, 1, 0.25], [72, 1.25, 0.25]];
const aRelay = [[69, 0, 0.5], [60, 0.75, 0.25], [64, 1, 0.25], [69, 1.25, 0.25]];
const eRelay = [[71, 0, 0.5], [64, 0.75, 0.25], [68, 1, 0.25], [71, 1.25, 0.25]];
const aBass = [[45, 0, 0.25], [52, 0.25, 0.25], [57, 0.5, 0.25]];
const eBass = [[40, 0, 0.25], [52, 0.25, 0.25], [56, 0.5, 0.25]];
const right = [
  [[76, 0, 0.25], [75, 0.25, 0.25]], opening, aRelay, eRelay,
  [[72, 0, 0.5], [64, 0.75, 0.25], [76, 1, 0.25], [75, 1.25, 0.25]],
  opening, aRelay, [[71, 0, 0.5], [64, 0.75, 0.25], [72, 1, 0.25], [71, 1.25, 0.25]], [[69, 0, 1]],
];
const left = [[], [], aBass, eBass, aBass, [], aBass, eBass, aBass];

test("Für Elise preserves both source hands, silent spaces, accidentals, pickup and short first ending", () => {
  const score = parse("a4-fur-elise-opening");
  assert.deepEqual(score.meter, [3, 8]);
  assert.deepEqual(score.bars.map((b) => b.beat), [0, 0.5, 2, 3.5, 5, 6.5, 8, 9.5, 11]);
  assert.equal(score.endBeat, 12);
  for (const [hand, expected] of [["R", right], ["L", left]]) for (let i = 0; i < expected.length; i++) {
    const actual = score.notes.filter((n) => n.hand === hand && n.bar === i + 1).map((n) => [n.midi, n.beat - score.bars[i].beat, n.dur]);
    assert.deepEqual(actual, expected[i], `${hand}, written bar ${i + 1}`);
  }
  const exercise = byId.get("a4-fur-elise-opening");
  assert.match(exercise.source.url, /id=931$/);
  assert.ok(exercise.source.scope && exercise.source.changes && exercise.why);
});

test("A-minor scales distinguish natural G from raised G while preserving each hand's register", () => {
  for (const [kind, intervals] of [["natural", [0, 2, 3, 5, 7, 8, 10, 12]], ["harmonic", [0, 2, 3, 5, 7, 8, 11, 12]]]) {
    for (const [hand, tonic, suffix] of [["R", 57, "r"], ["L", 45, "l"]]) {
      const score = parse(`a4-scale-${kind}-${suffix}`);
      const expected = [...intervals, ...intervals.slice(0, -1).reverse()].map((n) => tonic + n);
      assert.deepEqual(score.notes.filter((n) => n.hand === hand).map((n) => n.midi), expected);
    }
  }
});

test("Canon's student arrangement preserves the inspected bass route and discloses the added realization", () => {
  const score = parse("d-canon-blocks");
  const bass = score.notes.filter((n) => n.hand === "L");
  // The inspected source cello part writes this eight-quarter route over two
  // 4/4 bars. Our edition intentionally stretches each root to a full bar.
  assert.deepEqual(bass.map((n) => n.midi), [50, 45, 47, 42, 43, 38, 43, 45, 50]);
  assert.ok(bass.every((n) => n.dur === 4));
  assert.deepEqual(score.meter, [4, 4]); assert.equal(score.bars.length, 9);
  const exercise = byId.get("d-canon-blocks");
  assert.match(exercise.source.url, /id=2047$/);
  assert.match(exercise.source.label, /CC BY 4\.0/);
  assert.match(exercise.source.changes, /quarter notes|two 4\/4/);
  assert.ok(exercise.why);
});

test("new musical goals return with distinct passage goals; sixteenths precede the first Beethoven attempt", () => {
  const aSessions = SESSIONS.filter((s) => s.unitId === "a-minor-foundations-4");
  assert.equal(aSessions.filter((s) => s.slot === "B" && s.blocks.some((b) => b.exerciseId === "a4-fur-elise-opening" && b.goal && b.fromBar && b.toBar)).length, 5);
  const flat = aSessions.flatMap((s) => s.blocks.map((b) => b.exerciseId));
  assert.ok(flat.indexOf("a4-rhythm-sixteenths") < flat.indexOf("a4-fur-elise-opening"));
  const dSessions = SESSIONS.filter((s) => s.unitId === "d-major-foundations-5" && s.slot === "B");
  assert.equal(dSessions.filter((s) => s.blocks.some((b) => /^d-canon-(blocks|bass-chords)$/.test(b.exerciseId) && b.goal)).length, 5);
});

console.log("\nall source and sequencing checks green");

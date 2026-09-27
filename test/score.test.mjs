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

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

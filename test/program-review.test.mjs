import assert from "node:assert/strict";
import abcjs from "abcjs";
import { parseScore, walkTune } from "../src/score/scoreModel.js";
import { planPlayback, playbackPosition } from "../src/program/playback.js";

const test = (name, fn) => { fn(); console.log(`ok   ${name}`); };
// The second written C continues the first sound; the opposite hand starts a
// new held bass in bar 2. A third, silent bar checks that neither keeps glowing.
const abc = `X:1
M:4/4
L:1/4
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] C4- | C2 D2 | z4 |]
[V:2] z4 | C,4 | z4 |]`;
const score = parseScore(abc, abcjs);

test("a written tie has one sounding attack but separate visual segments", () => {
  const plan = planPlayback(score, { bpm: 60, countIn: false });
  assert.deepEqual(plan.events.filter((e) => e.type === "note" && e.midi === 60).map((e) => [e.at, e.duration]), [[0, 6]]);
  assert.deepEqual(score.visualNotes.filter((n) => n.hand === "R").map((n) => [n.bar, n.beat, n.dur]), [[1, 0, 4], [2, 4, 2], [2, 6, 2]]);
  const drawn = [];
  walkTune(abcjs.parseOnly(abc)[0], ({ el, bar, beat, duration, hand }) => {
    if (!el.rest && hand === "R") drawn.push([bar, beat, duration]);
  });
  assert.deepEqual(drawn, [[1, 0, 4], [2, 4, 2], [2, 6, 2]], "the parser and drawing use the same written spans");
});

test("the cursor follows the tied-to written note and releases into silence", () => {
  const plan = planPlayback(score, { bpm: 60, countIn: false });
  assert.deepEqual(playbackPosition(plan, 3.5).activeKeys, ["R:0"]);
  const continuation = playbackPosition(plan, 4.5);
  assert.equal(continuation.bar, 2);
  assert.deepEqual(continuation.activeKeys, ["L:4", "R:4"], "bar 1's C must stop glowing when its tied continuation is reached");
  assert.deepEqual(playbackPosition(plan, 6.5).activeKeys, ["L:4", "R:6"]);
  assert.deepEqual(playbackPosition(plan, 8.5).activeKeys, []);
});

test("a passage beginning on a tied continuation sounds and paints only that passage", () => {
  const plan = planPlayback(score, { from: 2, to: 2, bpm: 60, countIn: false });
  assert.equal(plan.startBeat, 4); assert.equal(plan.endBeat, 8);
  assert.equal(plan.musicDuration, 4);
  assert.deepEqual(plan.events.filter((e) => e.type === "note" && e.hand === "R").map((e) => [e.midi, e.at, e.duration]), [[60, 0, 2], [62, 2, 2]]);
  assert.deepEqual(playbackPosition(plan, 0.5).activeKeys, ["L:4", "R:4"]);
  assert.deepEqual(playbackPosition(plan, 2.5).activeKeys, ["L:4", "R:6"]);
  const repeated = playbackPosition(plan, 4.5, { loop: true });
  assert.equal(repeated.pass, 2); assert.equal(repeated.bar, 2);
  assert.deepEqual(repeated.activeKeys, ["L:4", "R:4"]);
});

console.log("\nall independent tie/passage review checks green");

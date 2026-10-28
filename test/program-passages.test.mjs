import assert from "node:assert/strict";
import abcjs from "abcjs";
import { parseScore, walkTune } from "../src/score/scoreModel.js";
import { planPlayback, playbackPosition } from "../src/program/playback.js";

const test = (name, fn) => { fn(); console.log(`ok   ${name}`); };
// An anacrusis followed by two full 3/8 bars and a shortened closing bar.
const abc = `X:1
M:3/8
L:1/16
K:Am
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] e ^d | e ^d e B =d c | A2 z E A c | B4 |]
[V:2] z2 | z6 | A,, E, A, z3 | E,, E, ^G, z |]`;
const score = parseScore(abc, abcjs);

test("written barlines keep pickup music aligned in both hands and across lines", () => {
  assert.deepEqual(score.bars.map((bar) => bar.beat), [0, 0.5, 2, 3.5]);
  assert.equal(score.endBeat, 4.5);
  assert.equal(score.notes.find((n) => n.midi === 45).bar, 3);
  const drawn = [];
  walkTune(abcjs.parseOnly(abc)[0], ({ el, beat, bar, hand }) => { if (!el.rest) drawn.push([beat, bar, hand]); });
  for (const n of score.notes) assert.ok(drawn.some(([beat, bar, hand]) => n.beat === beat && n.bar === bar && n.hand === hand));
});

test("pickup count-in fills missing time and the first complete bar gets the downbeat", () => {
  const plan = planPlayback(score, { bpm: 60, metronome: true });
  assert.equal(plan.pickup, true);
  assert.equal(plan.countInDuration, 1);
  assert.deepEqual(plan.events.filter((e) => e.count).map((e) => e.at), [0, 0.5]);
  assert.equal(plan.events.find((e) => e.midi === 76).at, 1);
  assert.equal(plan.events.find((e) => e.type === "click" && e.at === 1).accent, false);
  assert.equal(plan.events.find((e) => e.type === "click" && e.at === 1.5).accent, true);
  assert.equal(playbackPosition(plan, 1.6).bar, 2);
});

test("a selected passage preserves original score positions while audio starts at its first bar", () => {
  const plan = planPlayback(score, { from: 3, to: 3, bpm: 60, countIn: false });
  assert.equal(plan.musicDuration, 1.5);
  assert.equal(plan.events[0].at, 0);
  assert.deepEqual(new Set(plan.events.filter((e) => e.type === "note").map((e) => e.midi)), new Set([69, 64, 72, 45, 52, 57]));
  const position = playbackPosition(plan, 0.2);
  assert.equal(position.bar, 3);
  assert.equal(position.beat, 2.2);
  assert.ok(position.activeKeys.includes("R:2"));
  const again = playbackPosition(plan, 1.7, { loop: true });
  assert.equal(again.pass, 2);
  assert.equal(again.bar, 3);
  assert.ok(Math.abs(again.beat - 2.2) < 1e-8);
});

test("selection includes tied-in sound but clips it at the passage boundary", () => {
  const held = { meter: [4, 4], beatsPerBar: 4, endBeat: 12, bars: [{ n: 1, beat: 0 }, { n: 2, beat: 4 }, { n: 3, beat: 8 }], notes: [{ midi: 60, hand: "R", beat: 3, dur: 7 }] };
  const plan = planPlayback(held, { from: 2, to: 2, countIn: false, bpm: 60 });
  assert.deepEqual(plan.events.map((e) => [e.at, e.duration]), [[0, 4]]);
  assert.throws(() => planPlayback(held, { from: 9, to: 10 }), /written bar/);
});

console.log("\nall passage playback checks green");

import assert from "node:assert/strict";
import { planPlayback, playbackPosition, createLessonPlayback } from "../src/program/playback.js";

const score = {
  beatsPerBar: 4, meter: [4, 4], endBeat: 12,
  notes: [
    { midi: 60, beat: 1, dur: 2, hand: "R" },
    { midi: 64, beat: 1, dur: 2, hand: "R" },
    { midi: 48, beat: 0, dur: 4, hand: "L" },
    { midi: 67, beat: 6, dur: 1, hand: "R" },
  ],
};
const test = (name, fn) => { fn(); console.log(`ok   ${name}`); };

test("reference preserves simultaneous chord pitches, leading silence and full durations", () => {
  const plan = planPlayback(score, { bpm: 60, hands: "R", countIn: false });
  const notes = plan.events.filter((e) => e.type === "note");
  assert.deepEqual(notes.map((n) => [n.midi, n.at, n.duration]), [[60, 1, 2], [64, 1, 2], [67, 6, 1]]);
  assert.equal(notes[0].at, notes[1].at);
  assert.equal(plan.duration, 12, "trailing rests belong to the phrase");
  assert.deepEqual(plan.onsets, [1, 6]);
});

test("hand selection does not shorten the shared score timeline", () => {
  const plan = planPlayback(score, { bpm: 120, hands: "L", countIn: false });
  assert.deepEqual(plan.events.map((n) => [n.midi, n.at, n.duration]), [[48, 0, 2]]);
  assert.equal(plan.duration, 6);
});

test("count-in, music and click share quarter-note BPM", () => {
  const plan = planPlayback(score, { bpm: 120, hands: "both", countIn: true, metronome: true });
  assert.equal(plan.countInDuration, 2);
  assert.equal(plan.duration, 8);
  assert.deepEqual(plan.events.filter((n) => n.count).map((n) => n.at), [0, 0.5, 1, 1.5]);
  assert.equal(plan.events.find((n) => n.midi === 60).at, 2.5);
  assert.deepEqual(plan.onsets, [0, 1, 6]);
});

test("ungraded play along can be click-only without synthesizing player notes", () => {
  const plan = planPlayback(score, { soundNotes: false, metronome: true, countIn: true });
  assert.ok(plan.events.every((n) => n.type === "click"));
  assert.deepEqual(plan.onsets, [0, 1, 6], "the visual cursor remains available");
});

test("compound metre count-in uses its two dotted-quarter pulses", () => {
  const plan = planPlayback({ ...score, meter: [6, 8], beatsPerBar: 3, endBeat: 12 }, { bpm: 60, soundNotes: false });
  assert.equal(plan.countInDuration, 3);
  assert.deepEqual(plan.events.map((e) => e.at), [0, 1.5]);
});

test("unsupported tempo and empty score fail clearly", () => {
  assert.throws(() => planPlayback(score, { bpm: NaN }), /tempo/);
  assert.throws(() => planPlayback(score, { bpm: 0 }), /tempo/);
  assert.throws(() => planPlayback({ notes: [], endBeat: 0 }), /no timed music/);
});

test("cursor releases notes during rests and preserves a held opposite hand", () => {
  const plan = planPlayback(score, { bpm: 60, countIn: false });
  assert.deepEqual(playbackPosition(plan, 0.5).activeKeys, ["L:0"]);
  assert.deepEqual(playbackPosition(plan, 1.5).activeKeys, ["L:0", "R:1"]);
  assert.deepEqual(playbackPosition(plan, 3.5).activeKeys, ["L:0"]);
  assert.deepEqual(playbackPosition(plan, 5).activeKeys, [], "middle rest releases every note");
  assert.deepEqual(playbackPosition(plan, 6.5).activeKeys, ["R:6"]);
  assert.deepEqual(playbackPosition(plan, 8).activeKeys, [], "trailing silence has no glowing note");
});

test("loop position returns to music without replaying the count-in", () => {
  const plan = planPlayback(score, { bpm: 60, countIn: true });
  assert.equal(playbackPosition(plan, 2).phase, "countin");
  assert.deepEqual(playbackPosition(plan, 2).activeKeys, []);
  const position = playbackPosition(plan, plan.duration + 0.5, { loop: true });
  assert.equal(position.phase, "playing"); assert.equal(position.pass, 2);
  assert.equal(position.beat, 0.5); assert.deepEqual(position.activeKeys, ["L:0"]);
});

// Starting audio is asynchronous in browsers. Stopping while resume is pending
// must invalidate that start, preventing a late sound after Close/StrictMode.
let resume;
class FakeContext {
  state = "suspended";
  resume() { return new Promise((done) => { resume = done; }); }
  close() { this.state = "closed"; return Promise.resolve(); }
  createOscillator() { throw new Error("Cancelled playback must never schedule audio"); }
}
const player = createLessonPlayback({ AudioContextClass: FakeContext });
const starting = player.start(planPlayback(score));
player.stop(); resume(); await starting;
player.close();
console.log("ok   stop during AudioContext resume cancels a pending start");
console.log("\nall program playback checks green");

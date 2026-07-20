import assert from "node:assert/strict";
import { spectralCentroid } from "../src/audio/dsp.js";
import { midiFromFreq, makeFrame } from "../src/loom/features.js";
import { estimateOffset, CALIBRATION, loadOffset, saveOffset } from "../src/loom/latency.js";

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

test("spectralCentroid: energy in one bin returns that bin's frequency", () => {
  const bins = new Uint8Array(8);
  bins[3] = 200;
  assert.equal(spectralCentroid(bins, 48000, 16), 9000);
});

test("spectralCentroid: a flat spectrum returns its midpoint", () => {
  assert.equal(spectralCentroid(new Uint8Array([1, 1, 1, 1, 1]), 800, 8), 200);
});

test("spectralCentroid: silence returns zero", () => {
  assert.equal(spectralCentroid(new Uint8Array(8), 48000, 16), 0);
});

test("midiFromFreq: A4 is MIDI note 69", () => {
  assert.ok(Math.abs(midiFromFreq(440) - 69) < 0.0001);
});

test("makeFrame: detected pitch becomes a MIDI float", () => {
  const frame = makeFrame(125, { freq: 440, clarity: 0.72 }, 0.18, 1300);
  assert.ok(Math.abs(frame.midi - 69) < 0.0001);
  assert.deepEqual({ ...frame, midi: 69 }, { t: 125, midi: 69, clarity: 0.72, level: 0.18, centroid: 1300, onset: false });
});

test("makeFrame: no detection has null pitch and zero clarity", () => {
  assert.deepEqual(makeFrame(250, null, 0.02, 600), { t: 250, midi: null, clarity: 0, level: 0.02, centroid: 600, onset: false });
});

test("estimateOffset: returns the median round-trip delay with jitter", () => {
  const clicks = Array.from({ length: 8 }, (_, i) => i * 500);
  const jitter = [42, 45, 49, 44, 46, 41, 48, 45];
  const onsets = clicks.map((t, i) => t + jitter[i]);
  assert.ok(Math.abs(estimateOffset(clicks, onsets) - 45) <= 5);
});

test("estimateOffset: tolerates two missing click responses", () => {
  const clicks = Array.from({ length: 8 }, (_, i) => i * 500);
  const onsets = clicks.filter((_, i) => i !== 2 && i !== 6).map((t) => t + 47);
  assert.equal(estimateOffset(clicks, onsets), 47);
});

test("estimateOffset: fewer than five pairs returns null", () => {
  assert.equal(estimateOffset([0, 500, 1000], [45, 545, 1045]), null);
});

test("estimateOffset: empty input returns null", () => {
  assert.equal(estimateOffset([], []), null);
});

test("latency storage helpers persist the offset when storage exists", () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.deepEqual(CALIBRATION, { clicks: 8, intervalMs: 500 });
  assert.equal(loadOffset(), null);
  saveOffset(46);
  assert.equal(loadOffset(), 46);
  delete globalThis.localStorage;
  assert.equal(loadOffset(), null);
  assert.doesNotThrow(() => saveOffset(50));
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

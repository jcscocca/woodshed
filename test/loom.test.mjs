import assert from "node:assert/strict";
import { spectralCentroid } from "../src/audio/dsp.js";
import { midiFromFreq, makeFrame } from "../src/loom/features.js";
import { estimateOffset, CALIBRATION, loadOffset, saveOffset } from "../src/loom/latency.js";
import {
  CANVAS_H,
  CANVAS_W,
  TUNING,
  centroidRegister,
  makeBrush,
  xFromT,
  yFromMidi,
} from "../src/loom/brushes.js";
import { drawMarks } from "../src/loom/renderer.js";
import { COLOR_HEX } from "../src/seed.js";

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

const brushFrame = (t, { midi = 60, clarity = 1, level = 0, centroid = 1_200, onset = false } = {}) => ({
  t, midi, clarity, level, centroid, onset,
});

const runBrush = (instrument, frames) => {
  const brush = makeBrush(instrument);
  let state = brush.state;
  const marks = [];
  for (const current of frames) {
    const result = brush.step(state, current);
    state = result.state;
    marks.push(...result.marks);
  }
  return { state, marks };
};

test("brush coordinates map a 40-second poster column and MIDI range", () => {
  assert.equal(xFromT(2), 60);
  assert.equal(xFromT(42), 60);
  assert.equal(yFromMidi(96), 0);
  assert.equal(yFromMidi(36), CANVAS_H);
  assert.equal(CANVAS_W / CANVAS_H, 1.5);
});

test("piano blocks stamp exactly once for each clean onset", () => {
  const frames = Array.from({ length: 31 }, (_, index) => brushFrame(index * 0.05, {
    midi: [0, 10, 20].includes(index) ? 60 + index / 10 : null,
    clarity: [0, 10, 20].includes(index) ? 0.9 : 0,
    level: [0, 10, 20].includes(index) ? 0.45 : 0,
  }));
  const { marks } = runBrush("piano", frames);
  assert.equal(marks.length, 3);
  assert.ok(marks.every(({ type }) => type === "block"));
});

test("piano blocks do not repeat for a steady sustained note", () => {
  const frames = Array.from({ length: 30 }, (_, index) => brushFrame(index / 60, {
    midi: 64, clarity: 0.9, level: 0.4,
  }));
  assert.equal(runBrush("piano", frames).marks.length, 1);
});

test("guitar ribbons collect a continuous phrase", () => {
  const sounding = Array.from({ length: 60 }, (_, index) => brushFrame(index / 60, {
    midi: 64 + Math.sin(index / 12) * 2, clarity: 0.9, level: 0.35,
  }));
  const { marks } = runBrush("guitar", [...sounding, brushFrame(1.2)]);
  assert.equal(marks.length, 1);
  assert.equal(marks[0].type, "ribbon");
  assert.equal(marks[0].points.length, sounding.length);
  assert.equal(marks[0].widths.length, sounding.length);
});

test("guitar ribbons split around a gap longer than 180ms", () => {
  const first = Array.from({ length: 12 }, (_, index) => brushFrame(index * 0.02, { level: 0.3 }));
  const second = Array.from({ length: 12 }, (_, index) => brushFrame(0.45 + index * 0.02, {
    midi: 67, clarity: 0.9, level: 0.4,
  }));
  assert.equal(runBrush("guitar", [...first, ...second, brushFrame(0.9)]).marks.length, 2);
});

test("bass terrain raises nearby columns and decays while silent", () => {
  const frames = Array.from({ length: 30 }, (_, index) => brushFrame(0.5 + index / 1_000, {
    midi: 42, clarity: 0.9, level: 0.6, centroid: 320,
  }));
  const raised = runBrush("bass", frames);
  const peak = Math.max(...raised.state.heights);
  const peakIndex = raised.state.heights.indexOf(peak);
  const expectedIndex = Math.round(xFromT(frames.at(-1).t) / (CANVAS_W / 240));
  assert.ok(Math.abs(peakIndex - expectedIndex) <= 3);
  assert.ok(raised.state.heights[peakIndex] > raised.state.heights[Math.max(0, peakIndex - 4)]);
  const afterState = makeBrush("bass").step(raised.state, brushFrame(0.8)).state;
  const before = raised.state.heights.reduce((sum, height) => sum + height, 0);
  const after = afterState.heights.reduce((sum, height) => sum + height, 0);
  assert.ok(after < before);
});

test("accordion bands emit after a swell and ignore a short blip", () => {
  const swell = Array.from({ length: 26 }, (_, index) => brushFrame(index * 0.02, {
    midi: 60, clarity: 0.9, level: 0.25 + index / 100, centroid: 900 + index * 20,
  }));
  const release = Array.from({ length: 11 }, (_, index) => brushFrame(0.52 + index * 0.02));
  const { marks } = runBrush("accordion", [...swell, ...release]);
  assert.equal(marks.length, 1);
  assert.equal(marks[0].type, "band");
  assert.ok(marks[0].alpha >= 0.12 && marks[0].alpha <= 0.47);

  const blip = Array.from({ length: 5 }, (_, index) => brushFrame(index * 0.02, { level: 0.4 }));
  assert.equal(runBrush("accordion", [...blip, brushFrame(0.3)]).marks.length, 0);
});

test("brush grammars are deterministic", () => {
  for (const instrument of ["piano", "guitar", "bass", "accordion"]) {
    const stream = Array.from({ length: 80 }, (_, index) => brushFrame(index * 0.02, {
      midi: index < 55 ? 55 + Math.sin(index / 8) * 4 : null,
      clarity: index < 55 ? 0.8 : 0,
      level: index < 55 ? 0.28 + (index % 9) / 100 : 0,
      centroid: 700 + index * 9,
    }));
    assert.deepEqual(runBrush(instrument, stream).marks, runBrush(instrument, stream).marks);
  }
});

test("low-clarity placement follows a smoothed centroid register", () => {
  assert.equal(TUNING.clarityMin, 0.5);
  assert.equal(TUNING.centroidRegister, centroidRegister);
  const frames = Array.from({ length: 40 }, (_, index) => brushFrame(index * 0.04, {
    midi: index % 2 ? 36 : 96,
    clarity: 0.2,
    level: 0.32,
    centroid: 900 + (index % 2 ? 35 : -35),
  }));
  const { state } = runBrush("guitar", frames);
  const ys = state.current.points.map(({ y }) => y);
  assert.ok(Math.max(...ys) - Math.min(...ys) < 25);
  assert.ok(Math.abs(ys.at(-1) - centroidRegister(frames.at(-1).centroid)) < 20);
});

test("mixed-confidence streams never emit NaN geometry", () => {
  const stream = Array.from({ length: 90 }, (_, index) => brushFrame(index * 0.025, {
    midi: index % 5 === 0 ? null : 48 + Math.sin(index) * 18,
    clarity: index % 3 === 0 ? 0.2 : 0.85,
    level: index < 75 ? 0.2 + (index % 7) / 20 : 0,
    centroid: index % 11 === 0 ? 0 : 300 + index * 45,
  }));
  const numberValues = (value) => {
    if (typeof value === "number") return [value];
    if (ArrayBuffer.isView(value) || Array.isArray(value)) return [...value].flatMap(numberValues);
    if (value && typeof value === "object") return Object.values(value).flatMap(numberValues);
    return [];
  };
  for (const instrument of ["piano", "guitar", "bass", "accordion"]) {
    const { state, marks } = runBrush(instrument, stream);
    assert.ok(numberValues({ state, marks }).every(Number.isFinite), `${instrument} emitted non-finite geometry`);
  }
});

test("synthetic frames travel through a brush and the canvas renderer", () => {
  const { marks } = runBrush("piano", [
    brushFrame(0, { midi: 60, clarity: 0.9, level: 0.42, onset: true }),
  ]);
  const calls = [];
  const ctx = {
    save: () => calls.push(["save"]),
    restore: () => calls.push(["restore"]),
    fillRect: (...args) => calls.push(["fillRect", ...args]),
    beginPath: () => calls.push(["beginPath"]),
    moveTo: (...args) => calls.push(["moveTo", ...args]),
    lineTo: (...args) => calls.push(["lineTo", ...args]),
    closePath: () => calls.push(["closePath"]),
    fill: () => calls.push(["fill"]),
    stroke: () => calls.push(["stroke"]),
  };
  drawMarks(ctx, marks, "piano");
  assert.ok(calls.some(([name]) => name === "fillRect"));
  assert.equal(ctx.fillStyle, COLOR_HEX.piano);
  assert.equal(ctx.globalAlpha, 1);
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

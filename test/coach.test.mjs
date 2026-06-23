import assert from "node:assert/strict";
import { shapeToTargets, isCoachable } from "../src/audio/notes.js";

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

test("fretboard -> a line of single targets in dot order", () => {
  const { mode, targets } = shapeToTargets({ kind: "fretboard", instrument: "bass", baseFret: 2, dots: [{ string: 0, fret: 3 }, { string: 1, fret: 0 }] });
  assert.equal(mode, "line");
  assert.equal(targets.length, 2);
  assert.equal(targets[0].midi, 31); // bass E1(28) + 3
  assert.equal(targets[0].name, "G");
  assert.equal(targets[1].midi, 33); // bass A1(33) open
});

test("keyboard -> a line, octave preserved", () => {
  const { mode, targets } = shapeToTargets({ kind: "keyboard", notes: [{ name: "C", octave: 4 }, { name: "E", octave: 4 }] });
  assert.equal(mode, "line");
  assert.deepEqual(targets.map((t) => t.midi), [60, 64]);
});

test("chords -> an arpeggio with muted markers, in low->high order", () => {
  const { mode, targets } = shapeToTargets({ kind: "chords", instrument: "guitar", chords: [{ name: "C", strings: ["x", 3, 2, 0, 1, 0] }] });
  assert.equal(mode, "arpeggio");
  assert.equal(targets.length, 6);
  assert.equal(targets[0].muted, true);
  assert.equal(targets[0].openMidi, 40); // low E open
  assert.equal(targets[1].midi, 48); // A(45)+3 = C3
  assert.equal(targets[1].chordName, "C");
});

test("keyboard with play:block -> arpeggio", () => {
  const { mode } = shapeToTargets({ kind: "keyboard", play: "block", notes: [{ name: "C", octave: 3 }, { name: "E", octave: 3 }] });
  assert.equal(mode, "arpeggio");
});

test("isCoachable: shape yes, accordion no, prose-only no", () => {
  assert.equal(isCoachable({ inst: "bass" }, { shape: { kind: "fretboard" } }), true);
  assert.equal(isCoachable({ inst: "accordion" }, { shape: { kind: "keyboard" } }), false);
  assert.equal(isCoachable({ inst: "guitar" }, { shape: null }), false);
  assert.equal(isCoachable({ inst: "guitar" }, null), false);
});

import { runNoteStream } from "../src/coach.js";

// helper: a run of frames at one frequency. dt=16ms ~ one rAF tick.
const NOTE = { A4: 440, C5: 523.25, E4: 329.63 };
const frames = (specs) => {
  const out = []; let t = 0;
  for (const [hz, ms] of specs) { for (let e = 0; e < ms; e += 16) { out.push({ freq: hz, clarity: hz ? 0.7 : 0, level: hz ? 0.2 : 0, t }); t += 16; } }
  return out;
};

test("noteStream: a held note emits exactly one event after the hold window", () => {
  const ev = runNoteStream(frames([[NOTE.A4, 300]]));
  assert.equal(ev.length, 1);
  assert.equal(ev[0].name, "A");
  assert.equal(ev[0].octave, 4);
});

test("noteStream: a too-short blip never confirms", () => {
  const ev = runNoteStream(frames([[NOTE.A4, 48]])); // < 90ms hold
  assert.equal(ev.length, 0);
});

test("noteStream: two notes with a silent gap emit two events in order", () => {
  const ev = runNoteStream(frames([[NOTE.A4, 200], [0, 120], [NOTE.C5, 200]]));
  assert.deepEqual(ev.map((e) => e.name), ["A", "C"]);
});

test("noteStream: a repeated note re-attacked after a gap emits twice", () => {
  const ev = runNoteStream(frames([[NOTE.E4, 200], [0, 120], [NOTE.E4, 200]]));
  assert.equal(ev.length, 2);
  assert.ok(ev.every((e) => e.name === "E"));
});

import { gradeLine } from "../src/coach.js";

const ev = (midi) => ({ midi, name: "", octave: 0 });
const lineTargets = [{ midi: 57, label: "A" }, { midi: 60, label: "C" }, { midi: 62, label: "D" }]; // A3 C4 D4

test("gradeLine: a clean run scores 100", () => {
  const r = gradeLine(lineTargets, [ev(57), ev(60), ev(62)], { octaveStrict: false });
  assert.equal(r.accuracy, 100);
  assert.deepEqual(r.results.map((x) => x.status), ["caught", "caught", "caught"]);
});

test("gradeLine: a wrong middle note doesn't desync (lookahead)", () => {
  const r = gradeLine(lineTargets, [ev(57), ev(99), ev(62)], { octaveStrict: false });
  assert.deepEqual(r.results.map((x) => x.status), ["caught", "missed", "caught"]);
  assert.deepEqual(r.missed, ["C"]);
});

test("gradeLine: octave-forgiving accepts the right pitch class an octave off", () => {
  const r = gradeLine([{ midi: 57, label: "A" }], [ev(69)], { octaveStrict: false });
  assert.equal(r.accuracy, 100);
});

test("gradeLine: octave-strict (piano) rejects the wrong octave", () => {
  const r = gradeLine([{ midi: 60, label: "C" }], [ev(72)], { octaveStrict: true });
  assert.equal(r.accuracy, 0);
  assert.equal(r.results[0].status, "missed");
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

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

import { gradeArpeggio } from "../src/coach.js";

const cMaj = shapeToTargets({ kind: "chords", instrument: "guitar", chords: [{ name: "C", strings: ["x", 3, 2, 0, 1, 0] }] }).targets;
// pitched midis low->high: A(48) D->E(52) G(55) B->C(60) e->E(64); string 0 muted (openMidi 40)
const aev = (midi) => ({ midi, name: "", octave: 0 });

test("gradeArpeggio: clean arpeggio (muted stays silent) scores 100", () => {
  const r = gradeArpeggio(cMaj, [aev(48), aev(52), aev(55), aev(60), aev(64)]);
  assert.equal(r.accuracy, 100);
  assert.equal(r.results[0].status, "muted-ok");
});

test("gradeArpeggio: a ringing muted string is flagged but not counted against accuracy", () => {
  const r = gradeArpeggio(cMaj, [aev(40), aev(48), aev(52), aev(55), aev(60), aev(64)]);
  assert.equal(r.results[0].status, "rang");
  assert.equal(r.accuracy, 100); // 5/5 pitched still clean
});

test("gradeArpeggio: a dead string (no event) is missed", () => {
  const r = gradeArpeggio(cMaj, [aev(48), aev(52), aev(60), aev(64)]); // G string (55) never rang
  assert.equal(r.accuracy, 80);
  assert.ok(r.missed.includes("G"));
});

import { accuracyReady, progressionProposals } from "../src/engine.js";

const sess = (itemId, rating, extra = {}) => ({ itemId, inst: "guitar", date: "2026-06-01", rating, minutes: 10, bpm: null, ...extra });

test("accuracyReady: no coached data => ready (cold-start pass-through)", () => {
  assert.equal(accuracyReady([sess("x", "easy"), sess("x", "easy")]), true);
});
test("accuracyReady: recent high coached accuracy => ready", () => {
  assert.equal(accuracyReady([sess("x", "easy", { coached: true, accuracy: 95 }), sess("x", "easy", { coached: true, accuracy: 88 })]), true);
});
test("accuracyReady: recent low coached accuracy => not ready", () => {
  assert.equal(accuracyReady([sess("x", "easy", { coached: true, accuracy: 50 }), sess("x", "easy", { coached: true, accuracy: 55 })]), false);
});

test("progressionProposals: low coached accuracy withholds the level-up", () => {
  const items = [{ id: "gtr-pent", inst: "guitar", title: "Pent", type: "technique", diff: 2, hidden: false }];
  const easyLow = [sess("gtr-pent", "easy", { coached: true, accuracy: 40 }), sess("gtr-pent", "easy", { coached: true, accuracy: 45 })];
  assert.equal(progressionProposals(items, easyLow).filter((p) => p.kind === "level-up").length, 0);
  const easyNone = [sess("gtr-pent", "easy"), sess("gtr-pent", "easy")];
  assert.equal(progressionProposals(items, easyNone).filter((p) => p.kind === "level-up").length, 1);
});

import { fft, detectPitchSpectral, noteFromFrequency } from "../src/audio/dsp.js";

test("fft: a pure cosine peaks at its bin", () => {
  const N = 64, k = 8;
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let n = 0; n < N; n++) re[n] = Math.cos(2 * Math.PI * k * n / N);
  fft(re, im);
  let maxBin = 0, maxMag = 0;
  for (let b = 0; b < N / 2; b++) { const m = Math.hypot(re[b], im[b]); if (m > maxMag) { maxMag = m; maxBin = b; } }
  assert.equal(maxBin, k);
});

const SRX = 44100;
const sineBuf = (f, n = 2048, a = 0.5) => { const b = new Float32Array(n); for (let i = 0; i < n; i++) b[i] = a * Math.sin(2 * Math.PI * f * i / SRX); return b; };
// musette: 3 reeds detuned in cents around `f`, each = fundamental + 2 harmonics.
const musetteBuf = (f, cents = [0, 12, -9], n = 2048) => {
  const b = new Float32Array(n);
  const reeds = cents.map((c) => f * Math.pow(2, c / 1200));
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (const rf of reeds) s += Math.sin(2 * Math.PI * rf * i / SRX) + 0.4 * Math.sin(2 * Math.PI * 2 * rf * i / SRX) + 0.2 * Math.sin(2 * Math.PI * 3 * rf * i / SRX);
    b[i] = 0.15 * s;
  }
  return b;
};

test("detectPitchSpectral: clean sine resolves to the right note", () => {
  const d = detectPitchSpectral(sineBuf(440), SRX);
  const nn = noteFromFrequency(d.freq);
  assert.equal(`${nn.name}${nn.octave}`, "A4");
});
test("detectPitchSpectral: musette (3 detuned reeds) reads the center note A4", () => {
  const d = detectPitchSpectral(musetteBuf(440), SRX);
  const nn = noteFromFrequency(d.freq);
  assert.equal(`${nn.name}${nn.octave}`, "A4");
  assert.ok(d.clarity >= 0.5, `clarity ${d.clarity} should clear the note-stream floor`);
});
test("detectPitchSpectral: musette around C4 reads C4", () => {
  const d = detectPitchSpectral(musetteBuf(261.63), SRX);
  const nn = noteFromFrequency(d.freq);
  assert.equal(`${nn.name}${nn.octave}`, "C4");
});
test("detectPitchSpectral: silence returns -1", () => {
  assert.equal(detectPitchSpectral(new Float32Array(2048), SRX).freq, -1);
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

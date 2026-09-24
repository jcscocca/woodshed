import assert from "node:assert/strict";
import { shapeToTargets, isCoachable } from "../src/audio/notes.js";

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

test("fretboard -> a line of single targets in dot order", () => {
  const { mode, targets } = shapeToTargets({ kind: "fretboard", instrument: "guitar", baseFret: 2, dots: [{ string: 0, fret: 3 }, { string: 1, fret: 0 }] });
  assert.equal(mode, "line");
  assert.equal(targets.length, 2);
  assert.equal(targets[0].midi, 43); // guitar E2(40) + 3
  assert.equal(targets[0].name, "G");
  assert.equal(targets[1].midi, 45); // guitar A2(45) open
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

test("isCoachable: any shaped instrument; prose-only no", () => {
  assert.equal(isCoachable({ inst: "guitar" }, { shape: { kind: "fretboard" } }), true);
  assert.equal(isCoachable({ inst: "piano" }, { shape: { kind: "keyboard" } }), true);
  assert.equal(isCoachable({ inst: "guitar" }, { shape: null }), false);
  assert.equal(isCoachable({ inst: "guitar" }, null), false);
});

import { runNoteStream } from "../src/coach.js";

// helper: a run of frames at one frequency. dt=16ms ~ one rAF tick.
const NOTE = { A4: 440, C4: 261.63, C5: 523.25, E4: 329.63 };
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

test("noteStream: a held note with a one-frame octave flicker emits once", () => {
  const ev = runNoteStream(frames([[NOTE.C4, 200], [NOTE.C5, 16], [NOTE.C4, 200]]));
  assert.equal(ev.length, 1);
  assert.equal(ev[0].octave, 4);
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

const cgdEm = shapeToTargets({ kind: "chords", instrument: "guitar", chords: [
  { name: "C", strings: ["x", 3, 2, 0, 1, 0] }, { name: "G", strings: [3, 2, 0, 0, 0, 3] },
  { name: "D", strings: ["x", "x", 0, 2, 3, 2] }, { name: "Em", strings: [0, 2, 2, 0, 0, 0] },
] }).targets;
const cgdEmPlayed = () => cgdEm.filter((t) => !t.muted).map((t) => aev(t.midi)); // 21 pitched strings, clean
const missedAt = (r) => r.results.map((x, i) => (x.status === "missed" ? i : -1)).filter((i) => i >= 0);

test("gradeArpeggio: an octave slip in a progression costs one string, not a cascade", () => {
  const played = cgdEmPlayed();
  played[1] = aev(64); // C's D string (E3) played as E4 — also C's high-e note, and in G/Em
  const r = gradeArpeggio(cgdEm, played);
  assert.equal(r.accuracy, 95); // 20/21
  assert.deepEqual(missedAt(r), [2]);
  assert.equal(r.done, true);
});

test("gradeArpeggio: a stray note matching a later chord costs one string, not a cascade", () => {
  const played = cgdEmPlayed();
  played[2] = aev(66); // C's G string replaced by F#4 — D chord's high e
  const r = gradeArpeggio(cgdEm, played);
  assert.equal(r.accuracy, 95);
  assert.deepEqual(missedAt(r), [3]);
});

test("gradeArpeggio: dead strings at a chord change still resync into the next chord", () => {
  const played = cgdEmPlayed().filter((_, i) => i !== 4 && i !== 5); // C's high e and G's low E both dead
  const r = gradeArpeggio(cgdEm, played);
  assert.equal(r.accuracy, 90); // 19/21
  assert.deepEqual(missedAt(r), [5, 6]);
  assert.equal(r.done, true);
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

test("progressionProposals: low coached accuracy withholds the advance", () => {
  const items = [{ id: "trk-gtr-1", inst: "guitar", title: "Open chords", type: "technique", diff: 1, hidden: false, trackId: "trk-gtr-chords", trackName: "Chord Foundations", order: 0 }];
  const easyLow = [sess("trk-gtr-1", "easy", { coached: true, accuracy: 40 }), sess("trk-gtr-1", "easy", { coached: true, accuracy: 45 })];
  assert.equal(progressionProposals(items, easyLow).filter((p) => p.kind === "advance").length, 0);
  const easyNone = [sess("trk-gtr-1", "easy"), sess("trk-gtr-1", "easy")];
  assert.equal(progressionProposals(items, easyNone).filter((p) => p.kind === "advance").length, 1);
});

import { evenness } from "../src/coach.js";

const tsEvents = (ts) => ts.map((t) => ({ tStart: t }));

test("evenness: regular spacing => even", () => {
  assert.equal(evenness(tsEvents([0, 200, 400, 600, 800])).band, "even");
});
test("evenness: jittery spacing => uneven", () => {
  assert.equal(evenness(tsEvents([0, 90, 500, 560, 1300])).band, "uneven");
});
test("evenness: fewer than 3 gaps => null", () => {
  assert.equal(evenness(tsEvents([0, 200, 400])), null);
});

import { gradeChords, touchEvenness } from "../src/coach.js";

test("gradeChords: exact sets are caught", () => {
  const r = gradeChords([{ midis: [48, 60], label: "C" }, { midis: [50, 62], label: "D" }], [{ midis: [48, 60] }, { midis: [50, 62] }]);
  assert.deepEqual(r.results.map((x) => x.status), ["caught", "caught"]); assert.equal(r.accuracy, 100); assert.equal(r.done, true);
});
test("gradeChords: a missing and an extra note are reported", () => {
  const r = gradeChords([{ midis: [60, 64, 67], label: "C" }], [{ midis: [60, 64, 68] }]);
  assert.equal(r.results[0].status, "missed"); assert.deepEqual(r.results[0].missing, [67]); assert.deepEqual(r.results[0].extra, [68]);
  assert.deepEqual(r.missed, ["C"]);
});
test("gradeChords: skipping a target catches the next", () => {
  const r = gradeChords([{ midis: [48, 60], label: "C" }, { midis: [50, 62], label: "D" }, { midis: [52, 64], label: "E" }], [{ midis: [50, 62] }]);
  assert.deepEqual(r.results.map((x) => x.status), ["missed", "caught", "pending"]); assert.equal(r.cursor, 2);
});
test("hands together: right-hand notes pair with the octave below", () => {
  const { mode, targets } = shapeToTargets({ kind: "keyboard", hands: "together", notes: [{ name: "C", octave: 4 }, { name: "D", octave: 4 }] });
  assert.equal(mode, "chords"); assert.deepEqual(targets.map((t) => t.midis), [[48, 60], [50, 62]]);
});
test("touchEvenness: steady velocities are even, a spike is not", () => {
  const ev = (ps) => ps.map((peak, i) => ({ peak, tStart: i * 250 }));
  assert.equal(touchEvenness(ev([0.6, 0.62, 0.58, 0.6, 0.61])).band, "even");
  assert.equal(touchEvenness(ev([0.6, 0.6, 1.0, 0.3, 0.6])).band, "uneven");
  assert.equal(touchEvenness(ev([0.6, 0.6, 0.6])), null);
});
test("MIDI-shaped events grade through gradeLine unchanged", () => {
  const targets = shapeToTargets({ kind: "keyboard", notes: [{ name: "C", octave: 4 }, { name: "D", octave: 4 }] }).targets;
  const events = [{ midi: 60, name: "C", octave: 4, tStart: 0, peak: 0.7 }, { midi: 62, name: "D", octave: 4, tStart: 300, peak: 0.7 }];
  assert.equal(gradeLine(targets, events, { octaveStrict: true }).accuracy, 100);
});
const cdefg = shapeToTargets({ kind: "keyboard", hands: "together", notes: ["C", "D", "E", "F", "G"].map((name) => ({ name, octave: 4 })) }).targets;
test("gradeChords: a late hand completes its pair and the run stays in step", () => {
  const r = gradeChords(cdefg, [{ midis: [60] }, { midis: [48] }, { midis: [50, 62] }, { midis: [52, 64] }, { midis: [53, 65] }, { midis: [55, 67] }]);
  assert.deepEqual(r.results.map((x) => x.status), ["caught", "caught", "caught", "caught", "caught"]); assert.equal(r.accuracy, 100);
});
test("gradeChords: a wrong note inside a pair is missed with its diff", () => {
  const r = gradeChords(cdefg, [{ midis: [48, 61] }]);
  assert.equal(r.results[0].status, "missed"); assert.deepEqual(r.results[0].missing, [60]); assert.deepEqual(r.results[0].extra, [61]); assert.equal(r.cursor, 1);
});
test("gradeChords: a lone stray outside the pair is missed at once", () => {
  const r = gradeChords(cdefg, [{ midis: [49] }]);
  assert.equal(r.results[0].status, "missed"); assert.equal(r.cursor, 1);
});
test("gradeChords: one hand of a pair leaves it pending", () => {
  const r = gradeChords(cdefg, [{ midis: [60] }]);
  assert.equal(r.results[0].status, "pending"); assert.equal(r.cursor, 0); assert.equal(r.done, false);
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

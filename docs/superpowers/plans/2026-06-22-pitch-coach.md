# Pitch Coach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote Woodshed's beta mic tuner into an exercise-aware coach that gives restrained live feedback and an honest post-attempt accuracy summary for single-note lines and arpeggiated chords, then feeds that score into stats and the suggestion engine.

**Architecture:** A frame-by-frame pipeline reusing the existing DSP. New pure functions (`src/coach.js`) turn jumpy per-frame pitch readings into confirmed notes (stabilizer), then grade them against the lesson's known target notes (matcher/scorer). A `useCoach` hook wires the mic to the pipeline; a `CoachPanel` renders inside the existing lesson sheet. Accuracy persists via a session-log field and gates "advance" suggestions, with a cold-start fallback so un-coached practice behaves exactly as today.

**Tech Stack:** React 18, Vite, Web Audio API, pure ES modules tested headlessly with `node` (matching `test/lessons.test.mjs`).

---

## Spec

`docs/superpowers/specs/2026-06-22-pitch-coach-design.md` — read it first.

## File structure

| File | Responsibility |
|---|---|
| `src/audio/dsp.js` (edit) | Add `detectPitchDetailed` exposing the AMDF clarity/confidence; `detectPitch` becomes a thin wrapper (unchanged behavior). |
| `src/audio/notes.js` (edit) | Add `midiToNote`, `shapeToTargets` (shape → ordered grading targets), `isCoachable`. Pure pitch math, beside `shapeToVoices`. |
| `src/coach.js` (new) | The coaching core, pure & testable: `createNoteStream` (stabilizer/segmentation), `gradeLine`, `gradeArpeggio`. |
| `src/useCoach.js` (new) | React hook: mic stream → pipeline → live results + final score. Mirrors `useListener`. |
| `src/CoachPanel.jsx` (new) | Live diagram + summary UI, mounted inside the lesson sheet. |
| `src/LessonSheet.jsx` (edit) | Mount `CoachPanel` for coachable exercises (the "Coach me" affordance). |
| `src/App.jsx` (edit) | Hold coach results; log handoff; persist accuracy in `commitLog`; show accuracy in `LogSheet`; `AccuracyTrends` in Progress. |
| `src/engine.js` (edit) | `trailingAccuracy`/`accuracyReady`; gate advance/level-up/graduate; bump `SCHEMA_VERSION` to 4. |
| `src/storage.js` (edit) | v3→v4 note in `migrate` (additive optional fields, no backfill). |
| `src/lessons/piano.js` (edit) | Tag the `trk-pno-5` voicing `play: "block"` so it grades as an arpeggio, not a melody. |
| `src/styles.css` (edit) | Coach panel + summary styling. |
| `test/coach.test.mjs` (new) | Unit tests: targets, note stream, line grader, arpeggio grader, engine gate. |
| `package.json` (edit) | Add `test:coach`; include it in `test`. |
| `test/audio/generate-fixtures.py` (edit) | Add a rendered scale fixture for the optional end-to-end test. |
| `test/audio/dsp.realaudio.test.mjs` (edit) | Optional end-to-end: a clean scale through the whole pipeline scores ~full. |
| `README.md` (edit) | "How the coach works" + honest limits; "Make it yours" row; "What's next". |

---

## Task 1: Expose pitch-detection confidence

**Files:**
- Modify: `src/audio/dsp.js:73-115`
- Modify: `test/audio/dsp.smoke.test.mjs`

- [ ] **Step 1: Add a clarity assertion to the smoke test (failing)**

In `test/audio/dsp.smoke.test.mjs`, change the import line and append a clarity check before the `process.exit` line:

```js
import { detectPitch, detectPitchDetailed, noteFromFrequency } from "../../src/audio/dsp.js";
```

```js
const det = detectPitchDetailed(sine(440, 2048), SR);
const clarityOk = det.freq > 0 && det.clarity > 0.35;
if (!clarityOk) failed++;
console.log(`  detail 440Hz -> clarity ${det.clarity.toFixed(2)} ${clarityOk ? "ok" : "FAIL"}`);
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:smoke`
Expected: FAIL — `detectPitchDetailed is not a function` (or import error).

- [ ] **Step 3: Implement `detectPitchDetailed` and re-wrap `detectPitch`**

In `src/audio/dsp.js`, replace the whole `detectPitch` function (lines 73-115) with:

```js
// AMDF detector that also returns its periodicity "clarity" (how far the dip
// sits below the mean — a 0..~1 confidence). detectPitch keeps its old contract
// (just the frequency) by reading .freq off this.
export function detectPitchDetailed(buf, sampleRate, { minF = 40, maxF = 1500, sensitivity = 0.1, clarity = 0.35 } = {}) {
  let pk = 0;
  for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > pk) pk = a; }
  if (pk < 0.004) return { freq: -1, clarity: 0 }; // genuine silence
  const b = Float32Array.from(buf, (v) => v / pk); // normalize to unit peak

  const n = b.length;
  const minLag = Math.max(2, Math.floor(sampleRate / maxF));
  const maxLag = Math.min(n - 1, Math.floor(sampleRate / minF));
  if (maxLag <= minLag) return { freq: -1, clarity: 0 };

  let lo = Infinity, hi = -Infinity, mean = 0, cnt = 0;
  const d = new Float64Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i + lag < n; i++) sum += Math.abs(b[i] - b[i + lag]);
    sum /= (n - lag);
    d[lag] = sum; mean += sum; cnt++;
    if (sum < lo) lo = sum;
    if (sum > hi) hi = sum;
  }
  mean /= cnt;
  if (hi <= lo) return { freq: -1, clarity: 0 };

  const thresh = lo + sensitivity * (hi - lo);
  let lag = minLag;
  while (lag <= maxLag && d[lag] > thresh) lag++;
  if (lag > maxLag) return { freq: -1, clarity: 0 };
  while (lag + 1 <= maxLag && d[lag + 1] < d[lag]) lag++;

  const clarityVal = (mean - d[lag]) / mean;
  if (clarityVal < clarity) return { freq: -1, clarity: clarityVal }; // not periodic enough

  let T = lag; // parabolic interpolation for sub-sample accuracy
  if (lag > minLag && lag < maxLag) {
    const a = d[lag - 1], bb = d[lag], c = d[lag + 1];
    const denom = a - 2 * bb + c;
    if (denom) T = lag + 0.5 * (a - c) / denom;
  }
  return { freq: T > 0 ? sampleRate / T : -1, clarity: clarityVal };
}

// Frequency in Hz, or -1 when silent/unpitched. Thin wrapper over the detailed form.
export function detectPitch(buf, sampleRate, opts) {
  return detectPitchDetailed(buf, sampleRate, opts).freq;
}
```

- [ ] **Step 4: Run the smoke test to verify it passes**

Run: `npm run test:smoke`
Expected: PASS — all sines resolve, white noise rejected, `detail 440Hz -> clarity 0.xx ok`.

- [ ] **Step 5: Run the full + audio suites to confirm no regression**

Run: `npm test`
Expected: PASS (`all green`). (`npm run test:audio` only if fixtures are present.)

- [ ] **Step 6: Commit**

```bash
git add src/audio/dsp.js test/audio/dsp.smoke.test.mjs
git commit -m "dsp: expose AMDF clarity via detectPitchDetailed"
```

---

## Task 2: Shape → grading targets

**Files:**
- Modify: `src/audio/notes.js`
- Modify: `src/lessons/piano.js` (tag the one block voicing)
- Test: `test/coach.test.mjs` (new)
- Modify: `package.json`

- [ ] **Step 1: Create the test file with target cases (failing)**

Create `test/coach.test.mjs`:

```js
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

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });
```

- [ ] **Step 2: Add the `test:coach` script and run it (failing)**

In `package.json`, update the `scripts` block:

```json
"test": "npm run test:smoke && npm run test:lessons && npm run test:coach",
"test:coach": "node test/coach.test.mjs",
```

Run: `npm run test:coach`
Expected: FAIL — `shapeToTargets is not a function`.

- [ ] **Step 3: Implement `midiToNote`, `shapeToTargets`, `isCoachable`**

Append to `src/audio/notes.js`:

```js
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const STRING_NAMES = { guitar: ["E", "A", "D", "G", "B", "E"], bass: ["E", "A", "D", "G"] };
export const midiToNote = (m) => ({ midi: m, name: NAMES[((m % 12) + 12) % 12], octave: Math.floor(m / 12) - 1 });

// shape -> ordered coaching targets. A "line" is one single-note target per note
// (scales, melodies). An "arpeggio" walks a chord's strings low->high, keeping
// muted strings as silent checkpoints. Chords, and keyboard shapes explicitly
// flagged play:"block", are arpeggios; everything else is a line.
export const shapeToTargets = (shape) => {
  if (!shape) return { mode: "line", targets: [] };
  if (shape.kind === "chords") {
    const tuning = TUNING[shape.instrument];
    const targets = [];
    for (const c of shape.chords) {
      c.strings.forEach((fret, i) => {
        const stringName = STRING_NAMES[shape.instrument][i];
        if (fret === "x") targets.push({ muted: true, string: i, stringName, openMidi: tuning[i], chordName: c.name, label: "×" });
        else { const n = midiToNote(tuning[i] + fret); targets.push({ ...n, string: i, stringName, fret, chordName: c.name, label: n.name }); }
      });
    }
    return { mode: "arpeggio", instrument: shape.instrument, targets };
  }
  if (shape.kind === "fretboard") {
    const tuning = TUNING[shape.instrument];
    return { mode: "line", instrument: shape.instrument, targets: shape.dots.map((d) => { const n = midiToNote(tuning[d.string] + d.fret); return { ...n, string: d.string, fret: d.fret, label: n.name }; }) };
  }
  if (shape.kind === "keyboard") {
    const targets = shape.notes.map((nn) => { const n = midiToNote(noteToMidi(nn)); return { ...n, label: n.name }; });
    return { mode: shape.play === "block" ? "arpeggio" : "line", targets };
  }
  throw new Error(`Unknown shape kind: ${shape.kind}`);
};

// Can a coach grade this exercise? Needs a shape and a single-note-capable
// instrument. Accordion is out (reeds detect poorly); chords are in via arpeggio.
export const isCoachable = (item, lesson) => !!(lesson && lesson.shape && item && item.inst !== "accordion");
```

- [ ] **Step 4: Run the coach test to verify it passes**

Run: `npm run test:coach`
Expected: PASS (`all green`).

- [ ] **Step 5: Tag the keyboard voicing as a block, and confirm lessons still pass**

In `src/lessons/piano.js`, find the `trk-pno-5` shape (the `C–E–G–C` voicing) and add `play: "block"`:

```js
    shape: { kind: "keyboard", play: "block", notes: [{ name: "C", octave: 3 }, { name: "E", octave: 3 }, { name: "G", octave: 3 }, { name: "C", octave: 4 }], fingers: [5, 3, 2, 1] },
```

Run: `npm run test:lessons`
Expected: PASS — the schema validator ignores unknown keys; voices still render.

- [ ] **Step 6: Commit**

```bash
git add src/audio/notes.js src/lessons/piano.js test/coach.test.mjs package.json
git commit -m "coach: shape->targets, isCoachable, block-voicing flag"
```

---

## Task 3: Note stream (stabilizer + segmentation)

**Files:**
- Create: `src/coach.js`
- Modify: `test/coach.test.mjs`

- [ ] **Step 1: Add note-stream tests (failing)**

Append to `test/coach.test.mjs` (above the `process.on("exit"...)` line):

```js
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:coach`
Expected: FAIL — `Cannot find module '../src/coach.js'`.

- [ ] **Step 3: Implement the note stream**

Create `src/coach.js`:

```js
// ============================================================
// Coaching core — pure, no React, no Web Audio. The useCoach hook
// feeds it live mic frames; the tests feed it synthetic frames and
// note events. Three stages: confirm jumpy frames into stable notes
// (createNoteStream), then grade those notes against the lesson's
// known targets (gradeLine / gradeArpeggio).
// ============================================================
import { noteFromFrequency } from "./audio/dsp.js";

// Stabilizer + segmentation. A frame is { freq, clarity, level, t(ms) }. A note
// is only "confirmed" once the same pitch holds for holdMs with enough clarity
// and loudness — so a single stray frame can never produce a judgment, and a
// note that won't sustain (a dead/choked string) never confirms. Segmentation
// is primarily by pitch *change* (robust to legato, where there's no new
// attack); a re-struck same note is caught by the silent-gap reset.
export function createNoteStream({ holdMs = 90, clarityFloor = 0.5, levelFloor = 0.02, gapMs = 70 } = {}) {
  let cand = null, candStart = 0, candPeak = 0, confirmed = false, lastValidT = -Infinity;
  return {
    push({ freq, clarity, level, t }) {
      const valid = freq > 0 && clarity >= clarityFloor && level >= levelFloor;
      if (valid) {
        const midi = noteFromFrequency(freq).midi;
        const sameNote = cand != null && midi === cand && (t - lastValidT) <= gapMs;
        if (!sameNote) { cand = midi; candStart = t; candPeak = level; confirmed = false; }
        else if (level > candPeak) candPeak = level;
        lastValidT = t;
        if (!confirmed && t - candStart >= holdMs) {
          confirmed = true;
          const n = noteFromFrequency(freq);
          return { midi: n.midi, name: n.name, octave: n.octave, tStart: candStart, peak: candPeak };
        }
      } else if (cand != null && t - lastValidT > gapMs) {
        cand = null; confirmed = false; // note-off
      }
      return null;
    },
  };
}

// Run a whole frame array through a fresh stream (for tests / offline grading).
export function runNoteStream(frames, opts) {
  const s = createNoteStream(opts);
  const out = [];
  for (const f of frames) { const e = s.push(f); if (e) out.push(e); }
  return out;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:coach`
Expected: PASS (`all green`).

- [ ] **Step 5: Commit**

```bash
git add src/coach.js test/coach.test.mjs
git commit -m "coach: stabilizer/segmentation note stream"
```

---

## Task 4: Line grader

**Files:**
- Modify: `src/coach.js`
- Modify: `test/coach.test.mjs`

- [ ] **Step 1: Add line-grader tests (failing)**

Append to `test/coach.test.mjs` (above `process.on("exit"...)`):

```js
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:coach`
Expected: FAIL — `gradeLine is not a function`.

- [ ] **Step 3: Implement `gradeLine`**

Append to `src/coach.js`:

```js
const samePitch = (aMidi, bMidi, octaveStrict) => octaveStrict ? aMidi === bMidi : ((aMidi % 12) + 12) % 12 === ((bMidi % 12) + 12) % 12;

// Walk targets against confirmed events with a one-step lookahead so a single
// wrong note marks that target "missed" and moves on instead of desyncing the
// whole line. Pending targets (not yet reached when the player stops) stay
// pending and count against accuracy.
export function gradeLine(targets, events, { octaveStrict = false } = {}) {
  const results = targets.map((t) => ({ target: t, status: "pending" }));
  let cur = 0, lastHeard = null;
  for (const e of events) {
    if (cur >= targets.length) break;
    if (samePitch(e.midi, targets[cur].midi, octaveStrict)) { results[cur].status = "caught"; cur++; lastHeard = null; }
    else if (cur + 1 < targets.length && samePitch(e.midi, targets[cur + 1].midi, octaveStrict)) {
      results[cur].status = "missed"; results[cur + 1].status = "caught"; cur += 2; lastHeard = null;
    } else { lastHeard = e; } // stray — stay put, surface as a hint
  }
  // Attempt ended: a stray heard on the current target that was never corrected
  // is a genuine miss (e.g. a wrong octave under octaveStrict), not "pending".
  if (lastHeard !== null && cur < targets.length) results[cur].status = "missed";
  const caught = results.filter((r) => r.status === "caught").length;
  return {
    results,
    cursor: cur,
    lastHeard,
    done: cur >= targets.length,
    accuracy: targets.length ? Math.round((100 * caught) / targets.length) : 0,
    missed: results.filter((r) => r.status === "missed" || r.status === "pending").map((r) => r.target.label),
  };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:coach`
Expected: PASS (`all green`).

- [ ] **Step 5: Commit**

```bash
git add src/coach.js test/coach.test.mjs
git commit -m "coach: line grader with lookahead + octave policy"
```

---

## Task 5: Arpeggio grader

**Files:**
- Modify: `src/coach.js`
- Modify: `test/coach.test.mjs`

- [ ] **Step 1: Add arpeggio-grader tests (failing)**

Append to `test/coach.test.mjs` (above `process.on("exit"...)`):

```js
import { gradeArpeggio } from "../src/coach.js";
// (shapeToTargets is already imported at the top of test/coach.test.mjs)

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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:coach`
Expected: FAIL — `gradeArpeggio is not a function`.

- [ ] **Step 3: Implement `gradeArpeggio`**

Append to `src/coach.js`:

```js
// Step-gated, octave-aware grading for an arpeggiated chord. Events arrive in
// play order (low->high), as the live stream produces them. A pitched string is
// "caught" when its exact note rings; a string whose note never rings while a
// LATER string does is "missed" (dead/skipped); strings not yet reached stay
// "pending" (so live display dims them rather than flashing red). Muted strings
// should stay silent — an event at the open pitch is flagged "rang" (advisory,
// never scored). Stray events that match no upcoming string are skipped.
export function gradeArpeggio(targets, events) {
  const results = targets.map((t) => ({ target: t, status: "pending" }));
  let ei = 0;
  for (let ci = 0; ci < targets.length; ci++) {
    const t = targets[ci];
    if (t.muted) {
      if (ei < events.length && events[ei].midi === t.openMidi) { results[ci].status = "rang"; ei++; }
      else results[ci].status = "muted-ok";
      continue;
    }
    const later = new Set(targets.slice(ci + 1).filter((x) => !x.muted).map((x) => x.midi));
    while (ei < events.length && events[ei].midi !== t.midi && !later.has(events[ei].midi)) ei++; // skip strays
    if (ei < events.length && events[ei].midi === t.midi) { results[ci].status = "caught"; ei++; }
    else if (ei < events.length && later.has(events[ei].midi)) results[ci].status = "missed"; // a later string rang -> this one was skipped
    else break; // events exhausted -> the rest simply aren't played yet (pending)
  }
  const pitched = results.filter((r) => !r.target.muted);
  const caught = pitched.filter((r) => r.status === "caught").length;
  return {
    results,
    cursor: results.findIndex((r) => r.status === "pending"),
    done: !results.some((r) => r.status === "pending"),
    accuracy: pitched.length ? Math.round((100 * caught) / pitched.length) : 0,
    missed: pitched.filter((r) => r.status === "missed").map((r) => r.target.stringName || r.target.label),
  };
}
```

(`missed` uses the **string** name for arpeggios — "E A D G B e" — so per-string memory in Task 12 can surface "your D string keeps missing.")

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:coach`
Expected: PASS (`all green`).

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: PASS (`all green`) across smoke, lessons, coach.

- [ ] **Step 6: Commit**

```bash
git add src/coach.js test/coach.test.mjs
git commit -m "coach: arpeggio grader with muted-string advisory"
```

---

## Task 6: useCoach hook

**Files:**
- Create: `src/useCoach.js`

No automated test (DOM/Web Audio aren't in the node harness — matching the repo's untested hooks); verified live in Task 8. Keep the logic thin so the tested pure functions do the work.

- [ ] **Step 1: Implement the hook**

Create `src/useCoach.js`:

```js
import { useRef, useState, useCallback, useEffect } from "react";
import { detectPitchDetailed, rms } from "./audio/dsp.js";
import { midiToFreq } from "./audio/notes.js";
import { createNoteStream, gradeLine, gradeArpeggio } from "./coach.js";

// Mic listener for coaching: a thin shell (getUserMedia + rAF) around the pure
// coach core. Given an exercise's { mode, targets } and octave policy, it grades
// live and exposes the running result. Same honest scope as the tuner: one clear
// note at a time. Detection is clamped to the exercise's pitch span (cheap, and
// it keeps out-of-range octave artifacts from registering).
export function useCoach({ mode, targets, octaveStrict }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { results, cursor, accuracy, done, missed, lastHeard }

  const ac = useRef(null), analyser = useRef(null), stream = useRef(null), raf = useRef(null), buf = useRef(null);
  const streamer = useRef(null), events = useRef([]);

  const pitched = targets.filter((t) => !t.muted).map((t) => t.midi);
  const minF = midiToFreq(Math.min(...pitched) - 3);
  const maxF = midiToFreq(Math.max(...pitched) + 3);

  const grade = () => (mode === "arpeggio" ? gradeArpeggio(targets, events.current) : gradeLine(targets, events.current, { octaveStrict }));

  const loop = () => {
    const a = analyser.current;
    if (!a || !ac.current) return;
    a.getFloatTimeDomainData(buf.current);
    const { freq, clarity } = detectPitchDetailed(buf.current, ac.current.sampleRate, { minF, maxF });
    const ev = streamer.current.push({ freq, clarity, level: rms(buf.current), t: performance.now() });
    if (ev) { events.current = [...events.current, ev]; setResult(grade()); }
    raf.current = requestAnimationFrame(loop);
  };

  const start = useCallback(async () => {
    setError(null); events.current = []; setResult(grade());
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setError("This browser doesn't support microphone access."); return; }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      ac.current = new (window.AudioContext || window.webkitAudioContext)();
      const src = ac.current.createMediaStreamSource(stream.current);
      analyser.current = ac.current.createAnalyser();
      analyser.current.fftSize = 2048;
      buf.current = new Float32Array(analyser.current.fftSize);
      src.connect(analyser.current);
      streamer.current = createNoteStream();
      setListening(true);
      raf.current = requestAnimationFrame(loop);
    } catch (e) {
      setError(e && e.name === "NotAllowedError" ? "Microphone permission was denied." : "Couldn't access the microphone.");
    }
  }, [mode, octaveStrict, targets]);

  const teardown = () => {
    cancelAnimationFrame(raf.current);
    if (stream.current) stream.current.getTracks().forEach((t) => t.stop());
    if (ac.current && ac.current.state !== "closed") ac.current.close();
    analyser.current = null; ac.current = null; stream.current = null;
  };
  const stop = useCallback(() => { teardown(); setListening(false); }, []);
  const reset = useCallback(() => { events.current = []; setResult(grade()); }, [mode, targets, octaveStrict]);

  useEffect(() => () => teardown(), []);

  return { listening, error, result: result || grade(), start, stop, reset };
}
```

- [ ] **Step 2: Verify it builds (no runtime test yet)**

Run: `npm run build`
Expected: PASS — Vite builds with no import/syntax errors.

- [ ] **Step 3: Commit**

```bash
git add src/useCoach.js
git commit -m "coach: useCoach hook wiring mic -> pipeline -> live result"
```

---

## Task 7: CoachPanel UI + styles

**Files:**
- Create: `src/CoachPanel.jsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement the panel**

Create `src/CoachPanel.jsx`:

```jsx
import React, { useMemo, useState } from "react";
import { shapeToTargets } from "./audio/notes.js";
import { useCoach } from "./useCoach.js";

const STATUS_CLASS = { caught: "ok", missed: "bad", rang: "warn", "muted-ok": "mute", pending: "" };

// The coaching surface inside the lesson sheet. "Coach me" opens it; the target
// chips light up as you play; a calm summary follows. Restraint by design: the
// only live cue is the pulsing current target and a single hint line.
export default function CoachPanel({ item, lesson, onLog }) {
  const [open, setOpen] = useState(false);
  const { mode, targets } = useMemo(() => shapeToTargets(lesson.shape), [lesson.shape]);
  const octaveStrict = mode === "arpeggio" || item.inst === "piano";
  const coach = useCoach({ mode, targets, octaveStrict });
  const r = coach.result;

  if (!open) {
    return (
      <button className="ws-btn ghost sm ws-coach-open" onClick={() => setOpen(true)}>
        ◉ Coach me
      </button>
    );
  }

  const ended = !coach.listening && r.results.some((x) => x.status !== "pending");
  const band = r.accuracy >= 90 ? "Clean run" : r.accuracy >= 60 ? "Solid run — a couple to clean up" : "Keep at it — this one needs reps";
  const cur = r.cursor;

  return (
    <div className="ws-coach" aria-live="polite">
      <div className="ws-coach-seq" role="img" aria-label={`Coaching ${item.title}`}>
        {r.results.map((x, i) => (
          <span key={i} className={`ws-coach-chip ${STATUS_CLASS[x.status]} ${coach.listening && i === cur ? "now" : ""}`}>
            {x.target.muted ? "×" : x.target.label}
            {x.target.string != null && !x.target.muted && <small>{x.target.fret === 0 ? "0" : x.target.fret}</small>}
          </span>
        ))}
      </div>

      {coach.error ? (
        <div className="ws-listen-err">{coach.error}</div>
      ) : coach.listening ? (
        <>
          <div className="ws-coach-hint mono">
            {r.lastHeard ? `hearing ${r.lastHeard.name} · looking for ${targets[cur]?.label ?? "—"}` : r.done ? "done — nice" : "play along…"}
          </div>
          <button className="ws-btn ghost sm full" onClick={coach.stop}>■ Stop</button>
        </>
      ) : ended ? (
        <div className="ws-coach-summary">
          <div className="ws-coach-band">{band}</div>
          <div className="ws-coach-score mono"><b>{r.results.filter((x) => x.status === "caught").length}</b> / {targets.filter((t) => !t.muted).length} clean</div>
          {r.missed.length > 0 && <div className="ws-coach-missed">to revisit: {r.missed.join(", ")}</div>}
          <div className="ws-coach-actions">
            <button className="ws-btn ghost sm" onClick={() => { coach.reset(); coach.start(); }}>↻ Try again</button>
            <button className="ws-btn primary sm" onClick={() => onLog({ accuracy: r.accuracy, missed: r.missed })}>Log it →</button>
          </div>
        </div>
      ) : (
        <button className="ws-btn primary sm full" onClick={coach.start}>● Start</button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add styles**

Append to `src/styles.css`:

```css
/* ----- pitch coach ----- */
.ws-coach-open { margin-top: 8px; }
.ws-coach { margin-top: 10px; padding: 12px; border: 1px solid var(--line2); border-radius: var(--r); background: var(--bg); }
.ws-coach-seq { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
.ws-coach-chip { min-width: 30px; height: 34px; padding: 0 6px; border-radius: 9px; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; background: var(--bg3); color: var(--muted); line-height: 1; }
.ws-coach-chip small { font-size: 8px; font-weight: 400; color: var(--muted2); }
.ws-coach-chip.ok { background: rgba(95, 168, 160, .24); color: #7fc4bc; }
.ws-coach-chip.bad { background: rgba(224, 120, 86, .22); color: #e8916f; }
.ws-coach-chip.warn { background: rgba(227, 169, 72, .2); color: var(--gold); }
.ws-coach-chip.mute { opacity: .55; }
.ws-coach-chip.now { color: var(--gold); box-shadow: 0 0 0 2px var(--gold); animation: ws-coach-pulse 1.4s ease-in-out infinite; }
@keyframes ws-coach-pulse { 0%, 100% { box-shadow: 0 0 0 2px rgba(227, 169, 72, .5); } 50% { box-shadow: 0 0 0 5px rgba(227, 169, 72, .12); } }
.ws-coach-hint { text-align: center; color: var(--muted); font-size: 12px; margin: 10px 0; min-height: 16px; }
.ws-coach-summary { margin-top: 10px; text-align: center; }
.ws-coach-band { color: #7fc4bc; font-weight: 700; font-size: 13px; }
.ws-coach-score { font-size: 22px; margin: 4px 0; }
.ws-coach-score b { font-size: 28px; color: var(--text); }
.ws-coach-missed { font-size: 12px; color: #e8916f; margin-bottom: 10px; }
.ws-coach-actions { display: flex; gap: 8px; }
.ws-coach-actions .ws-btn { flex: 1; }
.ws-btn.full { width: 100%; }
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/CoachPanel.jsx src/styles.css
git commit -m "coach: CoachPanel live diagram + summary UI"
```

---

## Task 8: Wire the coach into the lesson sheet + log handoff

**Files:**
- Modify: `src/LessonSheet.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Mount CoachPanel in the lesson sheet**

In `src/LessonSheet.jsx`, add imports near the top:

```jsx
import CoachPanel from "./CoachPanel.jsx";
import { isCoachable } from "./audio/notes.js";
```

Change the component signature (line 19) to accept the new props:

```jsx
export default function LessonSheet({ item, href, onClose, onCoachResult, onRequestLog }) {
```

Immediately after the `<ShapeView shape={lesson.shape} />` line (line 57), add:

```jsx
        {isCoachable(item, lesson) && onCoachResult && (
          <CoachPanel
            item={item}
            lesson={lesson}
            onLog={(res) => { onCoachResult(item.id, res); onRequestLog(); }}
          />
        )}
```

- [ ] **Step 2: Hold coach results and pass the handoff in App**

In `src/App.jsx`, add state beside the other `useState` hooks (after line 46, `const [lastTempo...]`):

```jsx
  const [coachResults, setCoachResults] = useState({}); // itemId -> { accuracy, missed }
```

Add a setter near the other actions (after `commitLog`, ~line 126):

```jsx
  const recordCoachResult = (itemId, res) => setCoachResults((m) => ({ ...m, [itemId]: res }));
```

Update the `LessonSheet` mount (lines 269-271) to pass the handoff:

```jsx
      {lessonFor && (
        <LessonSheet
          item={lessonFor} href={safeHref(lessonFor.link?.url)}
          onClose={() => setLessonFor(null)}
          onCoachResult={recordCoachResult}
          onRequestLog={() => { setLessonFor(null); setLogging(true); }}
        />
      )}
```

- [ ] **Step 3: Verify it builds**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Manual smoke (no mic assertion — just that it mounts)**

Run: `npm run dev`, open the app, go to Today, tap **◐ Learn** on a single-note exercise (e.g. a bass scale or `gtr-pent`). Confirm: a **◉ Coach me** button appears below the diagram; tapping it shows target chips and a **● Start** button. On a chord exercise (e.g. `gtr-open`) the chips show per-string with `×` for muted strings. On an accordion exercise, **no** Coach me button appears. (Mic grading itself is verified in the device checklist.)

- [ ] **Step 5: Commit**

```bash
git add src/LessonSheet.jsx src/App.jsx
git commit -m "coach: mount CoachPanel in lesson sheet + log handoff"
```

---

## Task 9: Persist accuracy

**Files:**
- Modify: `src/engine.js` (version bump)
- Modify: `src/storage.js` (migrate note)
- Modify: `src/App.jsx` (`commitLog`, `LogSheet`)

- [ ] **Step 1: Bump the schema version**

In `src/engine.js:290`:

```js
export const SCHEMA_VERSION = 4;
```

- [ ] **Step 2: Note the additive migration**

In `src/storage.js`, inside `migrate`, just before `s.version = SCHEMA_VERSION;` (line 43), add:

```js
  // v3 -> v4: session entries gained optional coach fields (accuracy, coached,
  // missed). They're additive and read with safe defaults, so old sessions need
  // no backfill — only the stamped version changes.
```

- [ ] **Step 3: Carry accuracy through `commitLog`**

In `src/App.jsx`, update the session push inside `commitLog` (lines 117-121) to include the coach fields and clear the consumed result:

```jsx
      for (const e of entries) {
        if (!e.done) continue;
        const it = d.items.find((x) => x.id === e.itemId);
        sessions.push({
          id: `${today}-${e.itemId}-${Math.random().toString(36).slice(2, 7)}`,
          date: today, itemId: e.itemId, inst: it ? it.inst : "piano",
          minutes: e.minutes, rating: e.rating, bpm: e.bpm ?? null, note: note || "",
          accuracy: e.accuracy ?? null, coached: e.accuracy != null, missed: e.missed ?? [],
        });
      }
```

Still inside `commitLog`, after the loop, clear consumed coach results — change the `setData` return and `setLogging` tail to:

```jsx
      return { ...d, sessions, currentSession: { ...d.currentSession, completed: true } };
    });
    setCoachResults((m) => {
      const next = { ...m };
      for (const e of entries) if (e.done) delete next[e.itemId];
      return next;
    });
    setLogging(false);
```

- [ ] **Step 4: Show accuracy in the LogSheet (read-only) and include it on commit**

In `src/App.jsx`, pass `coachResults` to the LogSheet mount (line 239):

```jsx
      {logging && <LogSheet session={session} itemById={itemById} lastTempo={lastTempo} coachResults={coachResults} onCancel={() => setLogging(false)} onCommit={commitLog} />}
```

Change the `LogSheet` signature (line 519) and seed accuracy into each entry from the map:

```jsx
function LogSheet({ session, itemById, lastTempo, coachResults = {}, onCancel, onCommit }) {
  const init = session.items.map((x) => {
    const it = itemById(x.itemId);
    const c = coachResults[x.itemId];
    return { itemId: x.itemId, title: it?.title || "", inst: it?.inst || "piano", done: true, minutes: x.minutes, rating: "good", bpm: it?.lastBpm ?? null, accuracy: c?.accuracy ?? null, missed: c?.missed ?? [] };
  });
```

Inside the `e.done` controls block, after the `ws-bpm-log` div (line 571, before its closing `</div>` of `ws-log-controls`), add the read-only accuracy line:

```jsx
                  {e.accuracy != null && (
                    <div className="ws-log-acc mono" title="Measured by the coach">◉ {e.accuracy}% clean{e.missed.length ? ` · revisit ${e.missed.join(", ")}` : ""}</div>
                  )}
```

Add a style for it — append to `src/styles.css`:

```css
.ws-log-acc { font-size: 11px; color: #7fc4bc; margin-top: 4px; }
```

- [ ] **Step 5: Verify build + tests**

Run: `npm run build && npm test`
Expected: PASS (build clean; `all green`).

- [ ] **Step 6: Commit**

```bash
git add src/engine.js src/storage.js src/App.jsx src/styles.css
git commit -m "coach: persist accuracy on the session log (schema v4)"
```

---

## Task 10: Gate suggestions on accuracy (with cold-start fallback)

**Files:**
- Modify: `src/engine.js`
- Modify: `test/coach.test.mjs`

- [ ] **Step 1: Add gate tests (failing)**

Append to `test/coach.test.mjs` (above `process.on("exit"...)`):

```js
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:coach`
Expected: FAIL — `accuracyReady is not a function`.

- [ ] **Step 3: Implement the gate**

In `src/engine.js`, add after `hasRecent` (line 90):

```js
// Coaching gate: average of the last few *coached* accuracy scores. With no
// coached data we return null and callers treat that as "ready" — so practice
// without the coach behaves exactly as before (never withheld for missing data).
export function accuracyReady(mine, threshold = 80, k = 2) {
  const c = mine.filter((s) => s.coached && s.accuracy != null);
  if (!c.length) return true;
  const recent = c.slice(-k);
  return recent.reduce((t, s) => t + s.accuracy, 0) / recent.length >= threshold;
}
```

In `progressionProposals`, gate the "moving up/out" proposals. Wrap the **advance** push condition (line 110) and the two **level-up** pushes and the **graduate** push so they also require `accuracyReady(mine)`:

- Line 110, change `if ((easy >= 2) || (it.times >= 5 && !hasRecent(mine, "hard", 3))) {` to:

```js
      if (((easy >= 2) || (it.times >= 5 && !hasRecent(mine, "hard", 3))) && accuracyReady(mine)) {
```

- Line 119, change `if (it.diff >= 5 && it.times >= 4 && easy >= 2) {` to:

```js
    if (it.diff >= 5 && it.times >= 4 && easy >= 2 && accuracyReady(mine)) {
```

- Line 122, change `} else if (easy >= 2 && it.diff < 5) {` to:

```js
    } else if (easy >= 2 && it.diff < 5 && accuracyReady(mine)) {
```

- Line 128, change `} else if (it.times >= 6 && it.diff < 5 && !hasRecent(mine, "hard", 3)) {` to:

```js
    } else if (it.times >= 6 && it.diff < 5 && !hasRecent(mine, "hard", 3) && accuracyReady(mine)) {
```

(Leave the `ease` branch ungated — struggling should always be allowed to ease.)

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:coach`
Expected: PASS (`all green`).

- [ ] **Step 5: Commit**

```bash
git add src/engine.js test/coach.test.mjs
git commit -m "engine: gate advance/level-up on coached accuracy (cold-start safe)"
```

---

## Task 11: Accuracy trend in Progress

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add an `AccuracyTrends` block, mirroring `TempoTrends`**

In `src/App.jsx`, in the `Progress` component's returned JSX, add after `<TempoTrends ... />` (line 805):

```jsx
      <AccuracyTrends sessions={data.sessions} items={live.items} />
```

- [ ] **Step 2: Implement the component**

In `src/App.jsx`, immediately after the `TempoTrends` function (line 889), add:

```jsx
/* accuracy trends — coached % over time per exercise */
function AccuracyTrends({ sessions, items }) {
  const byItem = {};
  for (const s of sessions) if (s.coached && s.accuracy != null) (byItem[s.itemId] = byItem[s.itemId] || []).push(s.accuracy);
  const rows = Object.keys(byItem)
    .filter((id) => byItem[id].length >= 2)
    .map((id) => ({ id, title: items.find((i) => i.id === id)?.title || "Deleted exercise", series: byItem[id] }))
    .sort((a, b) => b.series.length - a.series.length)
    .slice(0, 6);
  if (!rows.length) return null;
  return (
    <div className="ws-block">
      <div className="ws-block-label">Accuracy progress</div>
      {rows.map((r) => {
        const last = r.series[r.series.length - 1];
        const delta = last - r.series[0];
        return (
          <div key={r.id} className="ws-tempo-row">
            <div className="ws-tempo-info">
              <div className="ws-tempo-title">{r.title}</div>
              <div className="ws-tempo-meta mono">{last}%{delta !== 0 && <span className={delta > 0 ? "ws-up" : "ws-down"}> {delta > 0 ? "+" : ""}{delta}</span>}</div>
            </div>
            <Sparkline series={r.series} />
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "progress: accuracy trend per exercise"
```

---

## Task 12: Arpeggio down-pass + per-string memory

Completes the "comprehensive" arpeggio scope (first milestone, built last): an optional reverse pass, and surfacing the strings you repeatedly miss across sessions. No automated test (UI); verified in the device checklist.

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/LessonSheet.jsx`
- Modify: `src/CoachPanel.jsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Pass each exercise's past sessions down to the panel**

In `src/App.jsx`, replace the `LessonSheet` mount with one that passes the item's sessions:

```jsx
      {lessonFor && (
        <LessonSheet
          item={lessonFor} href={safeHref(lessonFor.link?.url)}
          sessions={data.sessions.filter((s) => s.itemId === lessonFor.id)}
          onClose={() => setLessonFor(null)}
          onCoachResult={recordCoachResult}
          onRequestLog={() => { setLessonFor(null); setLogging(true); }}
        />
      )}
```

In `src/LessonSheet.jsx`, accept `sessions` (default `[]`) in the signature:

```jsx
export default function LessonSheet({ item, href, onClose, sessions = [], onCoachResult, onRequestLog }) {
```

…and forward it to the panel:

```jsx
        {isCoachable(item, lesson) && onCoachResult && (
          <CoachPanel
            item={item}
            lesson={lesson}
            sessions={sessions}
            onLog={(res) => { onCoachResult(item.id, res); onRequestLog(); }}
          />
        )}
```

- [ ] **Step 2: Direction + trouble-spots in CoachPanel**

In `src/CoachPanel.jsx`, add `useEffect` to the React import:

```jsx
import React, { useEffect, useMemo, useState } from "react";
```

Replace the component opening (from `export default function CoachPanel(` through `const r = coach.result;`) with:

```jsx
export default function CoachPanel({ item, lesson, sessions = [], onLog }) {
  const [open, setOpen] = useState(false);
  const [dir, setDir] = useState("up");
  const [runToken, setRunToken] = useState(0);
  const base = useMemo(() => shapeToTargets(lesson.shape), [lesson.shape]);
  const mode = base.mode;
  const targets = useMemo(() => (mode === "arpeggio" && dir === "down" ? [...base.targets].reverse() : base.targets), [base, mode, dir]);
  const octaveStrict = mode === "arpeggio" || item.inst === "piano";
  const coach = useCoach({ mode, targets, octaveStrict });
  const r = coach.result;

  // Launch a run only after `dir` (hence `targets`) has settled, so a reversed
  // down-pass never starts against the old order.
  useEffect(() => {
    if (runToken === 0) return;
    coach.reset();
    coach.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runToken]);
  const launch = (d) => { setDir(d); setRunToken((n) => n + 1); };

  // per-string / per-note memory: what this exercise's past coached sessions
  // most often flagged, surfaced as "trouble spots" before you start.
  const trouble = useMemo(() => {
    const counts = {};
    for (const s of sessions) if (s.coached && Array.isArray(s.missed)) for (const m of s.missed) counts[m] = (counts[m] || 0) + 1;
    return Object.entries(counts).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([m]) => m);
  }, [sessions]);
```

Replace the "Start" branch (the final `) : ( <button ...>● Start</button> )}`) with a trouble-spots-aware start:

```jsx
      ) : (
        <div className="ws-coach-start">
          {trouble.length > 0 && <div className="ws-coach-trouble">Trouble spots last time: {trouble.join(", ")}</div>}
          <button className="ws-btn primary sm full" onClick={() => launch("up")}>● Start</button>
        </div>
      )}
```

Replace the summary's `ws-coach-actions` div with one that offers the optional down-pass after a completed arpeggio up-pass:

```jsx
          <div className="ws-coach-actions">
            <button className="ws-btn ghost sm" onClick={() => launch("up")}>↻ Try again</button>
            {mode === "arpeggio" && dir === "up" && r.done && (
              <button className="ws-btn ghost sm" onClick={() => launch("down")}>↓ once more</button>
            )}
            <button className="ws-btn primary sm" onClick={() => onLog({ accuracy: r.accuracy, missed: r.missed })}>Log it →</button>
          </div>
```

- [ ] **Step 3: Styles**

Append to `src/styles.css`:

```css
.ws-coach-start { text-align: center; }
.ws-coach-trouble { font-size: 11px; color: var(--muted); margin-bottom: 8px; text-align: center; }
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Manual check**

Run `npm run dev`. On a guitar chord lesson, after the low→high pass finishes, an **↓ once more** button appears and re-runs high→low. After two logged coached sessions that miss the same string, reopening the lesson shows "Trouble spots last time: …".

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/LessonSheet.jsx src/CoachPanel.jsx src/styles.css
git commit -m "coach: optional arpeggio down-pass + per-string memory"
```

---

## Task 13: Optional end-to-end fixture test

**Files:**
- Modify: `test/audio/generate-fixtures.py`
- Modify: `test/audio/dsp.realaudio.test.mjs`

This is fixture-gated (needs timidity); it does not run in the default `npm test`. It proves the whole pipeline — detection → note stream → grader — on rendered audio.

- [ ] **Step 1: Add a scale fixture generator**

In `test/audio/generate-fixtures.py`, after the `note_midi`/`drum_midi` definitions (line 22), add:

```python
def scale_midi(name, program, notes, beat_ticks=240):
    m = mido.MidiFile(ticks_per_beat=480); t = mido.MidiTrack(); m.tracks.append(t)
    t.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(100)))
    t.append(mido.Message("program_change", program=program, time=0))
    for nt in notes:
        t.append(mido.Message("note_on", note=nt, velocity=100, time=0))
        t.append(mido.Message("note_off", note=nt, velocity=0, time=beat_ticks))
    m.save(os.path.join(OUT, name + ".mid"))
```

And before the final `print(...)` (line 30), add:

```python
# C major scale, one octave, acoustic guitar — C4..C5 (MIDI 60..72 naturals)
scale_midi("scale_cmaj_guitar", 25, [60, 62, 64, 65, 67, 69, 71, 72])
```

- [ ] **Step 2: Add the end-to-end test**

`test/audio/dsp.realaudio.test.mjs` already imports `fs`/`path`/`rms` and defines `load(file) → { sr, ch }`, `frame(ch, p, n)`, `FIX`, and a `failed` counter, ending with `process.exit(failed ? 1 : 0)`. So insert the block *before* that final exit, reusing those helpers.

First extend the dsp import (line 10) to add `detectPitchDetailed`, and add a coach import right below it:

```js
import { detectPitch, detectPitchDetailed, noteFromFrequency, createOnsetTracker, bpmFromOnsets, rms } from "../../src/audio/dsp.js";
import { createNoteStream, gradeLine } from "../../src/coach.js";
```

Then, immediately before the final summary line (`console.log(failed ? ...)`), add:

```js
console.log("\nCOACH — clean scale through the full pipeline");
if (fs.existsSync(path.join(FIX, "scale_cmaj_guitar.wav"))) {
  const { sr, ch } = load("scale_cmaj_guitar.wav");
  const stream = createNoteStream();
  const events = [];
  for (let p = 0; p + 2048 <= ch.length; p += 512) {
    const win = frame(ch, p, 2048);
    const { freq, clarity } = detectPitchDetailed(win, sr);
    const ev = stream.push({ freq, clarity, level: rms(win), t: (p / sr) * 1000 });
    if (ev) events.push(ev);
  }
  const targets = [60, 62, 64, 65, 67, 69, 71, 72].map((midi) => ({ midi, label: "" }));
  const g = gradeLine(targets, events, { octaveStrict: false });
  const ok = g.accuracy >= 80; if (!ok) failed++;
  console.log(`  scale_cmaj_guitar  grade ${g.accuracy}% (${events.length} notes) ${ok ? "PASS" : "FAIL"}`);
} else {
  console.log("  (no scale fixture — skipped)");
}
```

- [ ] **Step 3: Run it (only if fixtures are generated)**

Run: `npm run fixtures && npm run test:audio`
Expected: `scale_cmaj_guitar  grade 100% (8 notes) PASS` (or ≥80%). If timidity isn't installed, skip — this task is optional and not part of `npm test`.

- [ ] **Step 4: Commit**

```bash
git add test/audio/generate-fixtures.py test/audio/dsp.realaudio.test.mjs
git commit -m "test: optional end-to-end scale grading on a rendered fixture"
```

---

## Task 14: Documentation

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add the file-table row**

In `README.md`, in the "Make it yours" table (the `| File | What's in it |` table), add a row after the `src/useListener.js` row:

```md
| `src/coach.js` + `src/useCoach.js` + `src/CoachPanel.jsx` | The **pitch coach** — pure grading core (stabilizer + line/arpeggio matchers), the mic hook, and the lesson-sheet UI. Grades single-note lines and arpeggiated chords against the lesson's known notes. |
```

- [ ] **Step 2: Add a coach section with honest limits**

In `README.md`, after the "Listener notes" content (the section describing the tuner's scope), add:

```md
### The pitch coach

Tap **Coach me** in a lesson (single-note exercises, or chords played as an
arpeggio) and Woodshed grades what it hears against the notes the lesson already
knows. It's deliberately gentle: live, the diagram just lights up as you nail
each note; the honest detail — how many you played clean, which to revisit —
waits for the summary. That score logs alongside the session, shows up as an
accuracy trend in **Progress**, and lets "ready to advance" rest on evidence,
not just a self-rating.

What it **can** grade: one clearly-sounding note at a time — scales, melodic
lines, and chords checked one string at a time. Octave matters on piano (it'll
tell you "right note, wrong octave"); on guitar and bass it's octave-forgiving.

What it **can't**, by design: chords as strummed (it asks you to arpeggiate
instead), accordion (the reeds don't detect cleanly), and timing — v1 grades the
notes, not the tempo. Like the tuner, it's best verified on a real device.
```

- [ ] **Step 3: Update "What's next"**

In `README.md`, in the "What's next" section, add a line noting the coach shipped and what's deferred:

```md
- **The pitch coach is in.** Deferred extensions, in rough order: a soft timing
  read (the onset detector is too coarse for fast lines today), accordion
  support, and moving the per-frame DSP to a Web Worker if a phone ever lags
  (it stays on the main thread now via an exercise-aware narrowed pitch search).
```

- [ ] **Step 4: Verify the docs read cleanly**

Run: `npm run build` (sanity) and re-read the three edits in `README.md` for tone match with the surrounding sections.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: document the pitch coach and its honest limits"
```

---

## Final verification

- [ ] **Step 1: Full automated suite**

Run: `npm test`
Expected: PASS (`all green`) — smoke, lessons, coach.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: PASS, no warnings about missing imports.

- [ ] **Step 3: Manual device checklist (can't be automated)**

On desktop (Chrome) and, if available, an Android device via the Capacitor build:
- Mic permission prompts and, once granted, the coach starts.
- A bass or piano scale: notes light green roughly as you play them; the summary count is believable.
- Piano octave check: playing the right note an octave off reads as wrong/“wrong octave”, not clean.
- A guitar open chord in arpeggio: strings grade low→high; a muted string left ringing shows the advisory; a muted string kept silent passes. **↓ once more** then runs high→low, and repeated misses surface as "trouble spots" on reopen.
- "Log it →" carries the accuracy (read-only) into the log sheet; saving shows it in Progress → Accuracy progress after two coached sessions.
- CPU: the readout keeps up (no lag). If it lags on a phone, that's the documented cue to move the AMDF scan to a Web Worker.

---

## Notes & known v1 limitations

- Coaching an exercise that isn't in today's set stores the score in memory and attaches it whenever that item is next logged; the primary path (coach from Today, then "Log it") attaches immediately. Persisting a standalone coached entry is a deferred nicety.
- "Clean ring" is approximated by the stabilizer's hold window (a note that won't sustain ~90 ms never confirms) rather than spectral buzz analysis — advisory, as designed.
- The optional fixture test (Task 13) needs timidity; it is intentionally outside `npm test`.

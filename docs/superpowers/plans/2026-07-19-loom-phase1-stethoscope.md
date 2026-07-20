# Loom Phase 1 — mic reality check (Stethoscope)

> **Executor:** headless codex session in the woodshed repo. Read `docs/superpowers/specs/2026-07-19-loom-canvas-mode-design.md` first. This is a mature, shipped app: **additive changes only** — existing behavior, files, and tests must not change except where a task explicitly says "modify". Match the codebase's style (light comments, pure engines + thin hooks, node assert tests). Reference files before coding: `src/audio/dsp.js`, `src/useListener.js`, `src/useMetronome.js`, the ♩ practice-tools sheet in `src/App.jsx` (~lines 395–500), `src/styles.css` sheet classes (`ws-sheet`, `ws-practice`). Tests are plain node scripts with `assert` (see `test/coach.test.mjs` for the pattern) — NOT vitest. Your sandbox blocks git commits; skip committing. Before finishing: `npm test`, `npm run test:smoke`, and `npm run build` all green.

**Goal:** the Loom Stethoscope — a diagnostic screen proving what the mic actually delivers per instrument, plus latency calibration. No painting yet.

---

### Task 1.1 — `spectralCentroid` in dsp.js (TDD)

**Files:** modify `src/audio/dsp.js` (append only), create `test/loom.test.mjs`, modify `package.json` (add `"test:loom": "node test/loom.test.mjs"` and append ` && npm run test:loom` to the `test` script)

```js
export function spectralCentroid(freqData, sampleRate, fftSize)
// freqData: array-like of per-bin magnitudes (works with Uint8Array from
// AnalyserNode.getByteFrequencyData). Returns the amplitude-weighted mean
// frequency in Hz, or 0 when total energy is 0.
```

- [ ] Tests first in `test/loom.test.mjs`: energy in a single bin k → k * sampleRate / fftSize; symmetric flat spectrum → mid frequency; all zeros → 0. Run (fails), implement, run (passes).

### Task 1.2 — frame assembly (TDD)

**Files:** create `src/loom/features.js`; extend `test/loom.test.mjs`

```js
export function midiFromFreq(freq)      // 440 -> 69 (float)
export function makeFrame(t, detected, level, centroid)
// detected: return of detectPitchDetailed/detectPitchSpectral or null
// -> { t, midi: float|null, clarity: 0..1, level, centroid, onset: false }
// (onset is stamped by the input hook, not here)
```

- [ ] Tests: 440 Hz detected → midi ≈ 69; null detected → midi null, clarity 0; fields pass through. Inspect `detectPitchDetailed`'s actual return shape in dsp.js first and destructure accordingly.

### Task 1.3 — latency calibration core (TDD)

**Files:** create `src/loom/latency.js`; extend `test/loom.test.mjs`

```js
export function estimateOffset(clickTimesMs, onsetTimesMs)
// pair each click with the nearest onset in (click, click+250ms];
// need >= 5 pairs, else return null; return the median difference (ms, rounded)
export const CALIBRATION = { clicks: 8, intervalMs: 500 };
export function loadOffset()  // localStorage "loom.latencyMs" -> number|null
export function saveOffset(ms)
```

- [ ] Tests for `estimateOffset`: clicks every 500ms with onsets +45ms (±4ms jitter) → 45±5; two clicks missing onsets still ok; only 3 pairs → null; empty → null. localStorage helpers: guard `typeof localStorage === "undefined"` so node tests can import the module.

### Task 1.4 — mic input hook

**Files:** create `src/loom/useLoomInput.js`

- [ ] Model on `src/useListener.js` (read it first). `useLoomInput({ enabled, instrument })` → `{ frame, running, error }`. getUserMedia `{ audio: { echoCancellation: false, autoGainControl: false, noiseSuppression: false } }`, AnalyserNode fftSize 2048. Per rAF: `getFloatTimeDomainData` → `instrument === "accordion" ? detectPitchSpectral : detectPitchDetailed`, `rms`, `getByteFrequencyData` → `spectralCentroid`; onset via `createOnsetTracker` (stamp `onset: true` on that frame); `t` from `performance.now()`. Full teardown on disable/unmount (stop tracks, close context, cancel rAF). Permission denied → `error` string.

### Task 1.5 — beat times from the metronome

**Files:** modify `src/useMetronome.js` (additive)

- [ ] In the scheduler, when a click is queued at AudioContext time T, also record its performance-clock time: `performance.now() + (T - ctx.currentTime) * 1000`. Keep the last 32 in a ref. Add `beatTimesRef` to the returned object. Nothing else changes; existing return fields untouched.

### Task 1.6 — Stethoscope screen + entry

**Files:** create `src/loom/Stethoscope.jsx`; modify `src/App.jsx` (the ♩ practice-tools sheet); modify `src/styles.css` (append `ws-loom-*` styles)

- [ ] A "Loom stethoscope (beta)" row in the ♩ sheet (styled like the existing "Tuner & listener" row) opens it as a full-screen sheet following the app's dialog conventions (`role="dialog"`, `aria-modal`, Escape closes — see the tuner sheet).
- [ ] Contents, top to bottom:
  - Instrument chips (Piano/Guitar/Bass/Accordion in their identity colors, `aria-pressed`); preselect the first instrument of today's set if reachable from props, else "piano". Selecting re-arms the hook with the right detector.
  - Live readouts: detected note name + octave (via `noteFromFrequency`) with midi float to 1 decimal; a clarity bar 0–1; a level meter; centroid in Hz; an onset dot that flashes 120ms per onset.
  - Two rolling 10s sparklines (small canvases, ~640×60): level, and clarity (gaps where pitch is null).
  - Calibration block: current stored offset ("not calibrated" if null); a "Calibrate" button that plays `CALIBRATION.clicks` short beeps (1kHz osc, 30ms, via a local AudioContext) at `intervalMs`, collects onset frame times during the run, calls `estimateOffset`, saves and displays the result; status line during ("listening… 5/8").
  - Beat offset block: visible only while the metronome is playing (`beatTimesRef` fresh); shows the median of (onset − nearest beat − storedOffset) over the last 16 onsets, labeled "you vs the click" with early/late sign. If not calibrated, show the raw value labeled "(uncalibrated — includes mic delay)".
- [ ] `npm test` (all suites incl. new test:loom), `npm run test:smoke`, `npm run build` all green.

---

**Done criteria:** Stethoscope opens from the ♩ sheet, live readouts move (verifiable in a browser by the reviewer via synthesized audio only to the extent possible — real verification is Jacob playing), calibration routine runs end-to-end and persists, all tests green, zero changes to existing test results. Final message: summary + deviations (or none).

# Coach Follow-ups + Modal A11y Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a soft evenness read to the coach summary, robust musette accordion detection via a new FFT/HPS spectral detector, and dialog/focus-trap accessibility to every sheet.

**Architecture:** A pure radix-2 FFT in `dsp.js` underpins a new `detectPitchSpectral` (HPS to find the fundamental, cluster-centroid to read the detuned-reed center); `useCoach` routes accordion to it and everything else to the existing AMDF. A pure `evenness()` in `coach.js` reads note spacing for a summary-only line. A `useDialog` hook adds role/aria-modal/focus-trap/focus-restore to the sheets.

**Tech Stack:** React 18, Vite, Web Audio, pure ES modules tested headlessly with `node` (matching `test/coach.test.mjs`).

## Spec

`docs/superpowers/specs/2026-06-23-coach-followups-design.md` — read it first.

## File structure

| File | Responsibility |
|---|---|
| `src/audio/dsp.js` (edit) | `fft` (radix-2) + `detectPitchSpectral` (HPS + cluster-centroid). |
| `src/audio/notes.js` (edit) | `isCoachable` drops the accordion exclusion. |
| `src/coach.js` (edit) | `evenness(events)` — CV of note spacing → band. |
| `src/useCoach.js` (edit) | per-instrument detector routing; include `timing` (evenness) in the result. |
| `src/CoachPanel.jsx` (edit) | summary "timing: … · rough" line. |
| `src/useDialog.js` (new) | dialog/focus-trap/focus-restore hook. |
| `src/App.jsx` + `src/LessonSheet.jsx` (edit) | adopt `useDialog` on every sheet; add `aria-label`s. |
| `src/styles.css` (edit) | `.ws-coach-timing`. |
| `test/coach.test.mjs` (edit) | fft, spectral-musette, evenness tests; update the isCoachable test. |
| `README.md` (edit) | accordion now supported (honest, on-device caveat); evenness; Web Worker still open. |

---

## Task 1: FFT

**Files:**
- Modify: `src/audio/dsp.js`
- Modify: `test/coach.test.mjs`

- [ ] **Step 1: Add an FFT correctness test (failing)**

Append to `test/coach.test.mjs` (above `process.on("exit"...)`):

```js
import { fft } from "../src/audio/dsp.js";

test("fft: a pure cosine peaks at its bin", () => {
  const N = 64, k = 8;
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let n = 0; n < N; n++) re[n] = Math.cos(2 * Math.PI * k * n / N);
  fft(re, im);
  let maxBin = 0, maxMag = 0;
  for (let b = 0; b < N / 2; b++) { const m = Math.hypot(re[b], im[b]); if (m > maxMag) { maxMag = m; maxBin = b; } }
  assert.equal(maxBin, k);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:coach`
Expected: FAIL — `fft is not a function`.

- [ ] **Step 3: Implement `fft`**

In `src/audio/dsp.js`, add (e.g. after `rms`):

```js
// In-place iterative radix-2 FFT (Cooley–Tukey). re/im are Float64Array of equal
// length, a power of two; transformed in place. Pure — same input, same output,
// so the spectral detector below is testable headlessly.
export function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { const tr = re[i]; re[i] = re[j]; re[j] = tr; const ti = im[i]; im[i] = im[j]; im[j] = ti; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang), half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < half; k++) {
        const ar = re[i + k], ai = im[i + k];
        const br = re[i + k + half], bi = im[i + k + half];
        const vr = br * cr - bi * ci, vi = br * ci + bi * cr;
        re[i + k] = ar + vr; im[i + k] = ai + vi;
        re[i + k + half] = ar - vr; im[i + k + half] = ai - vi;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:coach`
Expected: PASS (`all green`).

- [ ] **Step 5: Commit**

```bash
git add src/audio/dsp.js test/coach.test.mjs
git commit -m "dsp: add pure radix-2 FFT"
```

---

## Task 2: Spectral (musette) detector

**Files:**
- Modify: `src/audio/dsp.js`
- Modify: `test/coach.test.mjs`

- [ ] **Step 1: Add spectral-detector tests (failing)**

Append to `test/coach.test.mjs` (above `process.on("exit"...)`):

```js
import { detectPitchSpectral } from "../src/audio/dsp.js";

const SRX = 44100;
const sineBuf = (f, n = 2048, a = 0.5) => { const b = new Float32Array(n); for (let i = 0; i < n; i++) b[i] = a * Math.sin(2 * Math.PI * f * i / SRX); return b; };
// musette: 3 reeds detuned in cents around `f`, each with two harmonics.
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:coach`
Expected: FAIL — `detectPitchSpectral is not a function`.

- [ ] **Step 3: Implement `detectPitchSpectral`**

In `src/audio/dsp.js`, add after `fft`:

```js
// Spectral pitch detector for multi-reed (musette accordion) sound, where the
// time-domain AMDF fails: 2–3 detuned reeds per note beat with no single period.
// Hann-window + zero-padded FFT, Harmonic Product Spectrum to find the
// fundamental (and kill octave errors), then the magnitude-weighted centroid of
// the detuned cluster (±50 cents) as the center pitch. Same { freq, clarity }
// contract as detectPitchDetailed. clarity is normalized so a clear note clears
// the note-stream floor (0.5).
export function detectPitchSpectral(buf, sampleRate, { minF = 40, maxF = 1500 } = {}) {
  let pk = 0;
  for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > pk) pk = a; }
  if (pk < 0.004) return { freq: -1, clarity: 0 };

  const N = 8192, half = N >> 1;
  const re = new Float64Array(N), im = new Float64Array(N);
  const M = Math.min(buf.length, N);
  for (let i = 0; i < M; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (M - 1)); re[i] = buf[i] * w; }
  fft(re, im);

  const mag = new Float64Array(half);
  let magMean = 0;
  for (let b = 0; b < half; b++) { mag[b] = Math.hypot(re[b], im[b]); magMean += mag[b]; }
  magMean /= half;
  if (magMean <= 0) return { freq: -1, clarity: 0 };

  const binToFreq = (b) => (b * sampleRate) / N;
  const minBin = Math.max(1, Math.floor((minF * N) / sampleRate));
  const maxBin = Math.min(half - 1, Math.ceil((maxF * N) / sampleRate));

  // Harmonic Product Spectrum over up to 4 harmonics.
  let bestBin = -1, bestHps = 0;
  for (let b = minBin; b <= maxBin; b++) {
    let p = mag[b];
    for (let h = 2; h <= 4; h++) { const hb = b * h; if (hb >= half) break; p *= mag[hb]; }
    if (p > bestHps) { bestHps = p; bestBin = b; }
  }
  if (bestBin < 0) return { freq: -1, clarity: 0 };

  // Parabolic interpolation for sub-bin accuracy.
  let peak = bestBin;
  if (bestBin > 0 && bestBin < half - 1) {
    const a = mag[bestBin - 1], b0 = mag[bestBin], c = mag[bestBin + 1], denom = a - 2 * b0 + c;
    if (denom) peak = bestBin + (0.5 * (a - c)) / denom;
  }
  const f0 = binToFreq(peak);

  // Cluster-centroid: weighted mean of bins within ±50 cents of f0.
  const loB = Math.max(1, Math.floor((f0 * Math.pow(2, -50 / 1200) * N) / sampleRate));
  const hiB = Math.min(half - 1, Math.ceil((f0 * Math.pow(2, 50 / 1200) * N) / sampleRate));
  let wsum = 0, fsum = 0;
  for (let b = loB; b <= hiB; b++) { wsum += mag[b]; fsum += mag[b] * binToFreq(b); }
  const freq = wsum > 0 ? fsum / wsum : f0;

  // clarity: prominence of the fundamental over the mean spectrum, squashed to 0..1.
  const clarity = Math.max(0, Math.min(1, (mag[bestBin] / magMean - 1) / 8));
  return { freq, clarity };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:coach`
Expected: PASS (`all green`). If a musette test misses by a hair, the tunable knobs are the HPS harmonic count (4) and the cluster window (±50 cents); the clarity divisor (8) only affects the `clarity >= 0.5` assertion. Adjust minimally to pass — do not weaken the assertions.

- [ ] **Step 5: Commit**

```bash
git add src/audio/dsp.js test/coach.test.mjs
git commit -m "dsp: spectral musette detector (FFT + HPS + cluster-centroid)"
```

---

## Task 3: Route accordion to the spectral detector

**Files:**
- Modify: `src/audio/notes.js`
- Modify: `src/useCoach.js`
- Modify: `test/coach.test.mjs`

- [ ] **Step 1: Update the isCoachable test (failing)**

In `test/coach.test.mjs`, replace the existing test:

```js
test("isCoachable: shape yes, accordion no, prose-only no", () => {
  assert.equal(isCoachable({ inst: "bass" }, { shape: { kind: "fretboard" } }), true);
  assert.equal(isCoachable({ inst: "accordion" }, { shape: { kind: "keyboard" } }), false);
  assert.equal(isCoachable({ inst: "guitar" }, { shape: null }), false);
  assert.equal(isCoachable({ inst: "guitar" }, null), false);
});
```

with:

```js
test("isCoachable: any shaped instrument (incl. accordion); prose-only no", () => {
  assert.equal(isCoachable({ inst: "bass" }, { shape: { kind: "fretboard" } }), true);
  assert.equal(isCoachable({ inst: "accordion" }, { shape: { kind: "keyboard" } }), true);
  assert.equal(isCoachable({ inst: "guitar" }, { shape: null }), false);
  assert.equal(isCoachable({ inst: "guitar" }, null), false);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:coach`
Expected: FAIL — accordion currently returns `false`.

- [ ] **Step 3: Drop the accordion exclusion**

In `src/audio/notes.js`, change:

```js
export const isCoachable = (item, lesson) => !!(lesson && lesson.shape && item && item.inst !== "accordion");
```

to:

```js
// Coachable = has a shape (single-note line or chord→arpeggio). Accordion is in
// now too — useCoach routes it to the spectral detector (see useCoach.js).
export const isCoachable = (item, lesson) => !!(lesson && lesson.shape && item);
```

- [ ] **Step 4: Route the detector by instrument in `useCoach`**

`useCoach` doesn't currently receive the instrument, so we thread it in as `inst`.

In `src/useCoach.js`:

(a) Change the dsp import:

```js
import { detectPitchDetailed, detectPitchSpectral, rms } from "./audio/dsp.js";
```

(b) Add `inst` to the destructured params — change `export function useCoach({ mode, targets, octaveStrict }) {` to:

```js
export function useCoach({ mode, targets, octaveStrict, inst }) {
```

(c) Add a detector pick right after the `minF`/`maxF` lines:

```js
  const detect = inst === "accordion" ? detectPitchSpectral : detectPitchDetailed;
```

(d) In `loop`, replace `detectPitchDetailed(buf.current, ac.current.sampleRate, { minF, maxF })` with `detect(buf.current, ac.current.sampleRate, { minF, maxF })`.

In `src/CoachPanel.jsx`, pass the instrument — change `const coach = useCoach({ mode, targets, octaveStrict });` to:

```jsx
  const coach = useCoach({ mode, targets, octaveStrict, inst: item.inst });
```

- [ ] **Step 5: Verify tests + build**

Run: `npm run test:coach && npm run build`
Expected: PASS (`all green`; build clean).

- [ ] **Step 6: Commit**

```bash
git add src/audio/notes.js src/useCoach.js src/CoachPanel.jsx test/coach.test.mjs
git commit -m "coach: route accordion to the spectral detector; coach accordion"
```

---

## Task 4: Evenness read

**Files:**
- Modify: `src/coach.js`
- Modify: `test/coach.test.mjs`
- Modify: `src/useCoach.js`
- Modify: `src/CoachPanel.jsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add evenness tests (failing)**

Append to `test/coach.test.mjs` (above `process.on("exit"...)`):

```js
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:coach`
Expected: FAIL — `evenness is not a function`.

- [ ] **Step 3: Implement `evenness`**

Append to `src/coach.js`:

```js
// Soft, tempo-independent timing read: the coefficient of variation of the gaps
// between confirmed notes. Needs >= 3 gaps (4 notes). Deliberately forgiving —
// a nudge in the summary, never scored. Returns { band, cv } or null.
export function evenness(events) {
  if (events.length < 4) return null;
  const iois = [];
  for (let i = 1; i < events.length; i++) iois.push(events[i].tStart - events[i - 1].tStart);
  const mean = iois.reduce((a, b) => a + b, 0) / iois.length;
  if (mean <= 0) return null;
  const variance = iois.reduce((a, b) => a + (b - mean) ** 2, 0) / iois.length;
  const cv = Math.sqrt(variance) / mean;
  return { band: cv <= 0.2 ? "even" : "uneven", cv };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:coach`
Expected: PASS (`all green`).

- [ ] **Step 5: Include the evenness read in the live result**

In `src/useCoach.js`, add `evenness` to the coach import:

```js
import { createNoteStream, gradeLine, gradeArpeggio, evenness } from "./coach.js";
```

Add a `compute` helper right after the existing `grade` definition:

```js
  const compute = () => ({ ...grade(), timing: evenness(events.current) });
```

Then replace every `setResult(grade())` with `setResult(compute())` (three sites: in `loop`, in `start`, in `reset`), and change the return's fallback from `result: result || grade()` to `result: result || compute()`.

- [ ] **Step 6: Show it in the summary**

In `src/CoachPanel.jsx`, inside the `ws-coach-summary` block, add a timing line after the `ws-coach-missed` line:

```jsx
          {r.timing && <div className="ws-coach-timing mono">timing: {r.timing.band} · rough</div>}
```

Append to `src/styles.css`:

```css
.ws-coach-timing { font-size: 11px; color: var(--muted2); margin-bottom: 8px; }
```

- [ ] **Step 7: Verify build + tests**

Run: `npm run build && npm test`
Expected: PASS (build clean; `all green`).

- [ ] **Step 8: Commit**

```bash
git add src/coach.js src/useCoach.js src/CoachPanel.jsx src/styles.css test/coach.test.mjs
git commit -m "coach: soft evenness read in the summary"
```

---

## Task 5: Dialog semantics + focus-trap on the sheets

**Files:**
- Create: `src/useDialog.js`
- Modify: `src/App.jsx`, `src/LessonSheet.jsx`

No automated test (no jsdom in the repo); verified by `npm run build` + the manual keyboard checklist.

- [ ] **Step 1: Create the hook**

Create `src/useDialog.js`:

```js
import { useEffect, useRef } from "react";

// Dialog a11y for a sheet: returns a ref for the sheet panel. On mount it moves
// focus into the panel and remembers what was focused; while open it traps
// Tab/Shift+Tab inside and closes on Escape; on unmount it restores focus.
// onClose is read through a ref so the effect runs once (focus isn't yanked on
// every parent re-render).
export function useDialog(onClose) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const node = ref.current;
    const prev = document.activeElement;
    if (node) node.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== "Tab" || !node) return;
      const f = node.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("keydown", onKey, true); if (prev && prev.focus) prev.focus(); };
  }, []);
  return ref;
}
```

- [ ] **Step 2: Adopt it in `LessonSheet`**

In `src/LessonSheet.jsx`: add `import { useDialog } from "./useDialog.js";`. Remove the existing inline Escape `useEffect` (the one adding a `keydown` listener for `"Escape"`). Add `const dlgRef = useDialog(onClose);` in the component body. On the panel div `<div className="ws-sheet ws-lesson" onClick={(e) => e.stopPropagation()}>`, add `ref={dlgRef} role="dialog" aria-modal="true" aria-label="Lesson" tabIndex={-1}`.

- [ ] **Step 3: Adopt it across the App sheets**

In `src/App.jsx`: add `import { useDialog } from "./useDialog.js";`. For each sheet component below, (a) replace its `useEscape(<arg>)` call with `const dlgRef = useDialog(<arg>);`, and (b) add `ref={dlgRef} role="dialog" aria-modal="true" aria-label="<label>" tabIndex={-1}` to its panel `<div>` (the inner one with `onClick={(e) => e.stopPropagation()}`). The `useEscape` helper can remain in the file if still referenced elsewhere; if no references remain after these edits, delete its definition.

| Component | `useEscape` arg | aria-label |
|---|---|---|
| `PracticeSheet` | `close` | `Practice tools` |
| `ListenSheet` | `close` | `Tuner and listener` |
| `LogSheet` | `onCancel` | `Log your session` |
| `ProposalSheet` | `onClose` | `Practice suggestions` |
| `Settings` | `onClose` | `Settings` |
| `ItemForm` | `onClose` | `Exercise editor` |
| `SessionEdit` | `onClose` | `Edit session` |

(`PracticeSheet`/`ListenSheet` panels use `className="ws-sheet ws-practice"`; the rest use `className="ws-sheet"`. Add the new attributes to that inner panel div in each.)

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Manual keyboard check**

Run `npm run dev`. Open a sheet (e.g. ♩ practice tools): focus lands in the sheet; Tab/Shift+Tab cycle within it and never reach the page behind; Escape closes it; focus returns to the button that opened it.

- [ ] **Step 6: Commit**

```bash
git add src/useDialog.js src/App.jsx src/LessonSheet.jsx
git commit -m "a11y: dialog role + focus-trap + focus-restore on all sheets"
```

---

## Task 6: Documentation

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the coach section's can/can't**

In `README.md`, in the "### The pitch coach" section: move accordion from "can't" to "can" with an honest caveat, and add the evenness note. Replace the paragraph that begins "What it **can't**, by design:" with:

```md
It now also reads **timing evenness** (a soft "even / a little uneven" note in the
summary — never scored) and coaches **accordion**: a spectral (FFT) detector finds
the center pitch of musette's detuned multi-reed sound where the plain tuner can't.
Accordion is the newest, least battle-tested path — validated on synthetic
multi-reed signals and best confirmed on your own instrument.

What it **can't**, by design: chords as strummed (it asks you to arpeggiate
instead) and absolute tempo (it grades the notes and their evenness, not BPM).
Like the tuner, it's best verified on a real device.
```

- [ ] **Step 2: Update "What's next"**

In `README.md`, in the "What's next" coach paragraph, replace the "Deferred extensions…" sentence with:

```md
Deferred now: moving the per-frame DSP to a Web Worker if a phone ever lags (it
stays on the main thread today via an exercise-aware narrowed pitch search).
Timing evenness and accordion (musette) detection are now in.
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: evenness + accordion (musette) coach support; worker still open"
```

---

## Final verification

- [ ] `npm test` → all green (smoke, lessons, coach incl. fft/spectral/evenness).
- [ ] `npm run build` → clean.
- [ ] Manual device checklist: a real accordion (musette + single-reed) through the coach; the keyboard focus-trap on every sheet.

## Notes & known limitations

- "Robust" musette is validated on **synthetic** multi-reed here; real reeds/bellows are the on-device gate (per spec).
- A11y has no automated coverage (no jsdom); the keyboard checklist is the gate.
- Web Worker offload remains deferred.

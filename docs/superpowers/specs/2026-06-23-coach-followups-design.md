# Coach Follow-ups + Modal A11y — Design

**Date:** 2026-06-23
**Status:** Approved design, pending implementation plan

## Problem

Three deferred items from the pitch-coach README's "What's next", now in scope:

1. **Timing** — the coach grades *what* you played, never *how evenly*. The v1 cut
   was right (absolute-tempo comparison is unreliable self-paced), but a gentle
   evenness read is achievable and useful.
2. **Accordion** — the coach is hidden on accordion because the time-domain AMDF
   detector can't handle musette (multi-reed) voicing: 2–3 reeds per note,
   detuned ~5–20 cents, sum to a *beating* signal with no single clean period.
3. **Modal a11y** — the bottom-sheet dialogs have Escape-to-close but lack
   `role="dialog"`, focus movement into the sheet, focus-trapping, and
   focus-restore. Screen-reader and keyboard users can tab out of an open sheet
   into the page behind it.

(The fourth README item, a **Web Worker DSP offload**, is explicitly **deferred** —
no measured lag today, and the win can't be verified without a device that lags.)

## Goal

- A soft, honest **evenness** read in the coach summary.
- **Robust musette detection** via a new FFT-based spectral detector, so the coach
  works on accordion — validated on synthetic multi-reed signals here, with real
  instruments as the on-device check.
- Proper **dialog semantics + focus-trap** on every sheet.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Timing | **Evenness only** (coefficient of variation of note spacing). Summary-only, labeled "rough", never live, never scored, never gating, not persisted. |
| Timing — metronome-relative | **No** (deferred; shakier, needs the metronome running). |
| Accordion | **Robust musette**, not an "experimental" caveat. New FFT detector. |
| Detector method | **FFT + Harmonic Product Spectrum**, then **cluster-centroid** of the detuned reeds. |
| Detector routing | **Per-instrument**: accordion → spectral; guitar/bass/piano → existing AMDF (unchanged — it's good there). |
| Web Worker offload | **Deferred** — non-goal here. |
| Modal a11y | A shared **`useDialog` hook** (role/aria-modal/focus-trap/focus-restore + Escape) spread onto each sheet, over a full `<Sheet>` rewrite. |

## Delivery boundary

**In scope:** evenness metric + summary line; the spectral detector + per-instrument
routing + dropping the accordion exclusion; the `useDialog` hook applied to all
sheets; synthetic-musette and FFT/evenness unit tests; honest README updates.

**Deferred / non-goals:** Web Worker / AudioWorklet offload; metronome-relative
timing; a guarantee of robust detection on every real accordion/registration
without on-device tuning; jsdom/RTL test infrastructure (the repo has none — a11y
is build + manual-checklist verified, matching house practice).

## Architecture

### 1. Timing evenness

A pure `evenness(events)` in `src/coach.js`. The note stream already stamps each
confirmed note with `tStart`; from the sequence of `tStart`s it computes
inter-onset intervals (IOIs) and their **coefficient of variation** (CV =
stddev / mean). Returns `{ band, cv }` where `band` is `"even"` (CV ≤ ~0.2) or
`"uneven"`, or `null` when there are fewer than 3 IOIs (too little to judge).
Deliberately forgiving (high threshold) — the point is a nudge, not a verdict.

`CoachPanel` shows it in the **summary only**, as one muted line clearly tagged
rough, e.g. *"timing: even · rough"*. It never appears live, never enters
`accuracy`, the `missed` list, the session log, or the suggestion gate.

### 2. Robust musette detection

**New pure DSP in `src/audio/dsp.js`:**

- `fft(re, im)` — a small in-place iterative radix-2 Cooley–Tukey FFT (pure,
  unit-tested against known signals). The base for spectral analysis; the project
  tests DSP headlessly, so we need our own FFT, not just the AnalyserNode.
- `detectPitchSpectral(buf, sampleRate, { minF, maxF })` → `{ freq, clarity }`,
  the same contract as `detectPitchDetailed` so the note-stream and graders are
  unchanged:
  1. **Window** the buffer (Hann) and **zero-pad** to 8192 for finer bin
     resolution (~5.4 Hz/bin at 44.1 kHz), FFT, take the magnitude spectrum.
  2. **Harmonic Product Spectrum** (multiply 3–4 downsampled copies) to pick the
     true fundamental region within `[minF, maxF]` and suppress octave errors.
  3. **Parabolic-interpolate** the chosen peak for sub-bin accuracy.
  4. **Cluster-centroid**: in the original spectrum, take the magnitude-weighted
     centroid of peaks within ~±50 cents of that fundamental — the center pitch of
     the detuned reed cluster. This is what makes musette read as one stable note.
  5. **clarity**: a normalized peak-prominence (HPS peak vs spectrum median),
     calibrated on the synthetic tests so a clear (musette) note clears the
     note-stream's `clarityFloor` (0.5). The stabilizer/grader logic is untouched.

**Routing (`src/useCoach.js`):** pick the detector by instrument —
`item.inst === "accordion" ? detectPitchSpectral : detectPitchDetailed` — passing
the same `minF`/`maxF`. AMDF stays the path for guitar/bass/piano (no regression
risk there).

**`isCoachable` (`src/audio/notes.js`):** drop the `inst !== "accordion"`
exclusion; accordion exercises with a shape become coachable.

### 3. Modal a11y

A `useDialog(onClose, label)` hook (shared, in `src/useDialog.js`) returning a
ref and props to spread onto the sheet's panel:

- `role="dialog"`, `aria-modal="true"`, `aria-label={label}`, `tabIndex={-1}`.
- On open: remember `document.activeElement`, move focus into the sheet.
- While open: a `keydown` handler traps Tab/Shift+Tab within the sheet's
  focusable elements and closes on Escape (superseding the current per-sheet
  Escape handlers / `useEscape`).
- On close/unmount: restore focus to the remembered element.

Applied to every sheet panel: `LessonSheet`, `PracticeSheet`, `ListenSheet`,
`LogSheet`, `ProposalSheet`, `Settings`, `ItemForm`, `SessionEdit`. Each passes a
short `aria-label` (e.g. "Lesson", "Practice tools", "Log your session").

## Non-goals

- Web Worker / AudioWorklet offload.
- Metronome-relative / absolute-tempo timing grading.
- Persisting the evenness read, or letting it affect accuracy or suggestions.
- Changing the AMDF detector for non-accordion instruments.
- A `<Sheet>`-wrapper refactor of the sheet markup (the hook avoids it).

## Testing

- **Web (automated, must stay green):** extend `test/coach.test.mjs`:
  - `evenness`: evenly-spaced vs jittery synthetic `tStart` arrays → correct band;
    `null` under 3 IOIs.
  - `fft`: a pure sine → magnitude peak at the expected bin (correctness anchor).
  - `detectPitchSpectral`: **synthesized musette** buffers (sum of 2–3 sines at
    `f` and `f·2^(±cents/1200)` plus a couple of harmonics) → returns the center
    pitch within ~25 cents, and `clarity` ≥ the note-stream floor; also a clean
    single sine still resolves. Pure and deterministic — no fixtures/timidity.
- **Native (manual checklist — can't run here):**
  - A real accordion (musette and single-reed) through the coach on a device — the
    only true validation of "robust"; synthetic ≠ real reeds/bellows.
  - Keyboard: Tab cycles within an open sheet, never escapes to the page; focus
    returns to the trigger on close; a screen reader announces the dialog role.

## Risks / notes

- **"Robust" is bounded by what we can test here.** The detector is built on the
  method that handles multi-reed and is validated on synthetic musette; real
  accordions vary (registration, bellows noise, reed richness). On-device
  validation is required before claiming it in earnest — the README will say so.
- **Clarity-scale calibration** between AMDF and spectral matters: if the spectral
  clarity runs systematically lower, clear notes would fail the stabilizer floor.
  The synthetic tests pin a clear musette note above the floor; if calibration is
  awkward, the fallback is a per-detector `clarityFloor` passed into
  `createNoteStream` from `useCoach` (kept out of scope unless needed).
- **FFT is the riskiest new code** — it gets its own correctness test before the
  detector is built on it (TDD).
- **A11y has no automated coverage** (no jsdom in the repo); the manual keyboard
  checklist is the gate. Low logic risk; the hook is small and self-contained.

## Files

**New:**

- `src/useDialog.js` — dialog/focus-trap hook.

**Edited:**

- `src/audio/dsp.js` — `fft`; `detectPitchSpectral` (HPS + cluster-centroid).
- `src/audio/notes.js` — `isCoachable` drops the accordion exclusion.
- `src/coach.js` — `evenness(events)`.
- `src/useCoach.js` — per-instrument detector routing.
- `src/CoachPanel.jsx` — evenness line in the summary.
- `src/App.jsx` + `src/LessonSheet.jsx` — adopt `useDialog` in all sheets (replacing `useEscape`/inline Escape), add `aria-label`s.
- `test/coach.test.mjs` — evenness, fft, spectral-musette tests.
- `README.md` — evenness + accordion (honest, on-device caveat) in the coach section; remove "accordion unsupported" wording; note the Web Worker remains the open item.

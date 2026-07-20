# Loom — a live visual canvas for practice

*2026-07-19. Designed with Claude; implementation planned for headless codex phases with review gates, per the Timbre pipeline (see ~/Repos/timbre). Sibling project: Timbre's Quartet Ink étude is the visual ancestor — its brush grammars port here.*

## What it is

**Loom** is a full-screen canvas mode inside woodshed you open while practicing. Your playing — heard through the microphone — paints a persistent picture in your instrument's identity color. When the metronome is running, the canvas carries its pulse as a subtle vertical **weave**, and your marks land where you actually played: locked-in playing visibly organizes the cloth; rushing or dragging shears it. No scores, no grades, no red X — the groove is simply visible.

With the metronome off, there is no weave and Loom is pure ambience: playing paints, nothing else. One behavior, two states.

**Not** in scope: lesson-aware target tones (overlaps the pitch coach; backlog), chord transcription, anything requiring the visitor-facing modes Timbre needed (demo streams, keyboard painting) — Loom is for the person holding the instrument.

## Why the mic path is trusted

Brushes trust features in proportion to measured reliability:

| Feature | Source | Reliability | Used for |
|---|---|---|---|
| Onsets | `createOnsetTracker` (exists) | robust, polyphonic-safe | mark existence, weave alignment |
| Level (RMS) | `rms` (exists) | robust | mark size/opacity |
| Brightness | spectral centroid (new, from existing `fft`) | robust | mark texture |
| Pitch + clarity | `detectPitchDetailed` (exists, real-audio-tested); `detectPitchSpectral` for accordion (exists) | good monophonic; jittery polyphonic | vertical placement **only when clarity is high**; else register drifts toward a smoothed centroid proxy |

Timing meaning comes from onset times vs the **metronome's own scheduled beat times** (shared AudioContext clock) — never from audio tempo guessing. Mic input latency is measured once by a calibration step (Loom plays a click through the speaker, the onset tracker hears it, offset = round trip) and subtracted; the offset is persisted and re-runnable from Loom's settings.

## Architecture (additive only — no changes to existing behavior)

```
src/loom/
  features.js       frame assembly: {t, midi, clarity, level, centroid, onset} per rAF,
                    built on src/audio/dsp.js (+ new spectralCentroid there, with tests)
  brushes.js        four grammars ported from Timbre ink (blocks/ribbons/terrain/bands),
                    adapted to clarity-aware placement; pure; TUNING object on top
  weave.js          pure: beat schedule + calibrated onsets -> weave geometry + shear
  latency.js        calibration round-trip logic (pure core + thin audio shell)
  useLoomInput.js   mic plumbing hook (getUserMedia, analyser, rAF loop) — mirrors
                    useListener.js patterns; accordion uses the spectral detector
  LoomScreen.jsx    full-screen canvas, instrument chips, take/stop, save/export
  Stethoscope.jsx   the mic reality-check diagnostic (phase 1; reachable from Loom)
```

- **Entry point**: the ♩ practice-tools sheet gains a "Loom" button next to metronome/stopwatch/tuner. Loom opens full-screen (Escape closes, per woodshed sheet conventions). Instrument chips preselect the first instrument in today's generated set (falling back to the most recently logged instrument); one tap to change.
- **Metronome**: Loom reads the running metronome's beat schedule (shared clock). It never starts/stops the metronome itself.
- **Persistence**: stopping a take offers Save — stores a thumbnail (dataURL, ~300px) keyed by date+instrument via `storage.js` (with a `migrate()` step); feature streams are deliberately NOT stored (localStorage is per-device practice history — keep it light; revisit if replay ever matters). Progress → Recent sessions shows the thumbnail when one exists. Keep last 12 paintings; PNG export at 2× anytime.
- **Accessibility**: chips and controls follow woodshed's ARIA/focus conventions; Escape closes; the canvas is `role="img"` with a live-region-free text alternative ("Loom painting in progress").

## Phases (codex-executable, review gates between)

1. **Mic reality check** — add `spectralCentroid` to dsp.js (+ tests vs synthetic spectra), `features.js` frame assembly (+ tests), latency calibration, and the Stethoscope screen: live pitch/clarity/level/centroid readouts, onset flashes, a beat-offset readout when the metronome runs. **Gate: Jacob plays ~60s per instrument and reports what's solid vs chaotic.** Brush tuning decisions flow from this.
2. **Ambient canvas** — port brushes from Timbre (with their tests, adapted to clarity-aware placement), LoomScreen with instrument chips, take/stop, PNG export. No weave yet. Gate: paints sensibly from real playing.
3. **The weave** — weave.js, shear rendering, calibration applied, session save + Progress thumbnails. Gate: locked-in vs rushed playing look visibly different at the calibrated offset.

Backlog (explicitly later): lesson-aware targets, painting gallery view, coach-integration experiments, Android/Capacitor implications.

## Risks

- **Room/metronome bleed**: the metronome click reaches the mic and fires onsets. Mitigation: suppress onsets within ±30ms of a scheduled click *at the calibrated offset* (they're indistinguishable from perfect hits anyway); Stethoscope shows bleed explicitly in phase 1.
- **Polyphonic pitch jitter**: mitigated by clarity gating (the table above); phase 1 measures how often clarity is actually high per instrument.
- **Performance on phone**: per-frame AMDF + FFT already runs in woodshed's tuner; Loom adds canvas painting. Same first-optimization note as the tuner: narrow the lag search, then a Worker if needed. Phase 1's Stethoscope doubles as the perf probe.
- **Storage growth**: feature streams are capped (last 12) and thumbnails are small; migrate() guards old data.

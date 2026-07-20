# Loom Phase 3 — the weave

> **Executor:** headless codex session in the woodshed repo. Prereq: Phases 1–2 merged. Read the spec first. Additive only; node assert tests; sandbox blocks commits — skip them. The weave's meaning rests on onsets vs the metronome's scheduled beats on the performance clock (`beatTimesRef` from Phase 1), corrected by the stored calibration offset (`loadOffset()`).

**Goal:** with the metronome running, the canvas carries its pulse; marks land where you played; sustained rushing/dragging visibly shears the cloth. Sessions can save a painting to the practice log.

---

### Task 3.1 — weave engine (TDD)

**Files:** create `src/loom/weave.js`; extend `test/loom.test.mjs`

```js
export const WEAVE_TUNING = { bleedWindowMs: 30, bleedLevelMax: 0.06, shearWindow: 8, shearMaxMs: 90 };
export function isBleed(onsetTimeMs, level, beatTimesMs, offsetMs)
// true when within ±bleedWindowMs of (beat + offsetMs) AND level < bleedLevelMax
export function alignment(onsetTimeMs, beatTimesMs, offsetMs)
// -> { deltaMs, beatIndex } vs the nearest corrected beat (null if no beats within 400ms)
export function shearState(prev, deltaMs)
// rolling mean of the last shearWindow deltas -> { meanMs, shear: clamp(meanMs/shearMaxMs, -1, 1) }
export function weaveColumns(beatTimesMs, nowMs, viewSpanMs)
// -> [{ xRatio, ageMs }] vertical thread positions for beats inside the view window
```

- [ ] Tests: bleed detection (quiet onset on the corrected beat → true; loud onset there → false; quiet onset off-beat → false); alignment picks the nearest corrected beat with signed delta; shear converges toward a sustained +60ms drag and recovers toward 0; columns map beat times into 0..1 ratios. All pure, deterministic.

### Task 3.2 — weave rendering + wiring

**Files:** modify `src/loom/LoomScreen.jsx`, `src/loom/brushes.js` (only if a mark needs a `deltaMs` field), `src/styles.css`

- [ ] Metronome state reaches LoomScreen (the ♩ sheet already owns `useMetronome`; pass `beatTimesRef` + `playing` + `bpm` down). While playing: draw weave threads (1px, instrument-color at 0.12 alpha, opacity breathing ±0.04 on the beat) at `weaveColumns` positions; the whole thread field skews horizontally by `shear * 4px` — order when locked in, visible lean when rushing (negative = early lean left).
- [ ] Onset flow: bleed-suppressed onsets neither paint nor feed shear; all others stamp `deltaMs` via `alignment` and nudge their mark ±(deltaMs/shearMaxMs) * 6px horizontally off their beat column, so hit placement is honest at mark scale too.
- [ ] Metronome off → no weave, no alignment, exactly Phase-2 behavior (guard everything on `playing`).

### Task 3.3 — save to the practice log

**Files:** modify `src/storage.js` (migrate step), `src/loom/LoomScreen.jsx`, `src/App.jsx` (Progress → recent sessions thumbnail)

- [ ] `migrate()` gains `loomPaintings: []` (cap 12, FIFO): `{ id, dateISO, inst, thumb }` where `thumb` is a ~300px JPEG dataURL. Stop & layer offers "Save to log"; saving composites the current poster to a thumbnail and prepends. No feature streams stored (revisit later; keep localStorage light).
- [ ] Progress → Recent sessions: when a painting exists with the same date+instrument as a logged session row, show its thumbnail (32px, rounded) at the row's end; tapping opens a simple full-size overlay (Escape closes).
- [ ] Migration test in `test/loom.test.mjs`: old state without `loomPaintings` migrates cleanly; cap enforced.
- [ ] `npm test` + `npm run build` green; existing suites untouched.

---

**Done criteria:** weave appears only with the metronome, engine tests prove bleed/alignment/shear math, paintings save to and surface in Progress, all tests green. Final message: summary + deviations.

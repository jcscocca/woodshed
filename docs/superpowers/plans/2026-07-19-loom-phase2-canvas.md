# Loom Phase 2 — ambient canvas

> **Executor:** headless codex session in the woodshed repo. Prereq: Phase 1 merged (`src/loom/features.js`, `useLoomInput.js`, `latency.js`, Stethoscope). Read the spec first. Additive only; node assert tests in `test/loom.test.mjs`; sandbox blocks git commits — skip committing. **Port source:** `~/Repos/timbre/src/experiments/ink/brushes.js` and `~/Repos/timbre/test/ink/brushes.test.js` are readable at that absolute path — port, don't reinvent. All tuning constants live in one exported `TUNING` object; values are provisional until Jacob's Phase-1 listening gate and must be trivially editable.

**Goal:** the Loom canvas — playing paints in the instrument's color, layers accumulate, posters export. No weave yet (metronome-off behavior only).

---

### Task 2.1 — brush grammars (TDD, ported)

**Files:** create `src/loom/brushes.js`; extend `test/loom.test.mjs`

- [ ] Port timbre's four grammars (piano blocks / guitar ribbons / bass terrain / accordion bands) and their `makeBrush(instrument)` reducer shape, converting tests from vitest to node assert. Canvas space: 1200×800 abstract units; export `xFromT` (wraps every 40s — the painting scrolls into columns rather than running off), `yFromMidi` (midi 96 top → 36 bottom).
- [ ] **Adaptation — clarity-aware placement** (this is the Phase-1 lesson baked in): vertical position uses `frame.midi` only when `frame.clarity >= TUNING.clarityMin` (default 0.5); otherwise y comes from `TUNING.centroidRegister(centroid)` — a smoothed log-mapping of centroid Hz into the same y range, exported for tests. Ribbons interpolate through low-clarity gaps rather than jumping.
- [ ] Tests: the ported timbre cases (onset counts, ribbon splits, terrain decay, band lifecycles, determinism) plus two new ones: a low-clarity stream places marks by centroid register (no y jitter beyond a bound); a mixed stream never emits NaN geometry.

### Task 2.2 — LoomScreen

**Files:** create `src/loom/LoomScreen.jsx`; modify `src/App.jsx` (♩ sheet row becomes "Loom (beta)" opening LoomScreen; Stethoscope reachable via a "diagnostics" link inside LoomScreen); modify `src/styles.css` (append)

- [ ] Full-screen sheet (dialog conventions, Escape closes). Poster canvas 3:2 centered, DPR-aware; instrument chips (preselect as in Stethoscope); Take / Stop & layer button; Undo layer; Clear; Export PNG (2×, filename `woodshed-loom-YYYY-MM-DD.png`).
- [ ] Wiring: `useLoomInput` frames → active brush `step` → marks appended to the live layer (offscreen canvas per take); committed layers composite beneath. Renderer draws mark types in `INSTRUMENTS`' colors from `src/seed.js` (import the existing `COLOR_HEX`, do not redefine).
- [ ] While a take is live, controls fade to near-invisible (opacity 0.15, full on hover/focus) — the room should be the canvas, not the chrome. Take auto-stops after 20 minutes as a safety.
- [ ] `npm test` + `npm run build` green; existing suites untouched.

---

**Done criteria:** with a mic, playing paints (reviewer verifies plumbing headlessly by feeding synthetic frames through the brush + renderer path in tests; live feel is Jacob's gate); layers/undo/clear/export work; all tests green. Final message: summary + deviations.

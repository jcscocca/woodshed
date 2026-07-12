# Ear Training Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Call-and-response ear exercises — the app plays a generated phrase, the player echoes it, the existing coach grades it — as ordinary library items that log coached accuracy.

**Architecture:** A new pure module `src/ear.js` (seeded phrase generator + session state machine) drives the existing, untouched coach stack: `gradeLine`/`useCoach` grade each round's echo, `playSequence` plays each prompt. A new `EarPanel.jsx` runs the loop inside the lesson sheet. New seed items reach existing installs through the engine's existing `mergeContent` — no storage or engine changes.

**Tech Stack:** React 18 + Vite, Web Audio (existing wrappers only), plain-node test scripts (`assert/strict`, no framework).

**Spec:** `docs/superpowers/specs/2026-07-12-ear-training-design.md`

---

## Context for the implementer (read first)

- **Never open the mic while the synth plays.** The coach would grade the prompt. `playSequence` returns its duration in ms; the panel waits it out (+250 ms) before starting the mic.
- **Targets change only while the mic is stopped.** `useCoach`'s rAF loop captures targets at `start()`; CoachPanel's `runToken` pattern (see `src/CoachPanel.jsx:23-29`) is reused verbatim.
- **Hidden targets.** During an attempt the UI shows status-only pips, never note names, and never the CoachPanel "looking for X" hint — that would name the answer.
- **Grading is octave-forgiving always** (`octaveStrict: false`). The ladder tightens via replays and the "starts on" hint, never via octave.
- Existing pieces you will call but not modify: `gradeLine` (`src/coach.js:54`), `useCoach` (`src/useCoach.js`), `playSequence` / `stop` (`src/lessonAudio.js`), `midiToFreq` / `midiToNote` (`src/audio/notes.js`), `mergeContent` (`src/engine.js:46`).
- Tests are plain node scripts: a local `test(name, fn)` helper, `assert/strict`, and a `process.on("exit")` failure gate. Copy the pattern from `test/coach.test.mjs`.

---

### Task 1: Pure core scaffold — PRNG + interval labels + test wiring

**Files:**
- Create: `src/ear.js`
- Create: `test/ear.test.mjs`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Write the failing test**

Create `test/ear.test.mjs`:

```js
import assert from "node:assert/strict";
import { mulberry32, intervalLabel } from "../src/ear.js";

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

test("mulberry32: deterministic for a seed, values in [0,1)", () => {
  const a = mulberry32(42), b = mulberry32(42);
  const seqA = [a(), a(), a()], seqB = [b(), b(), b()];
  assert.deepEqual(seqA, seqB);
  for (const v of seqA) assert.ok(v >= 0 && v < 1);
});

test("mulberry32: different seeds diverge", () => {
  assert.notEqual(mulberry32(1)(), mulberry32(2)());
});

test("intervalLabel: names and directions", () => {
  assert.equal(intervalLabel(60, 63), "↑m3");
  assert.equal(intervalLabel(63, 60), "↓m3");
  assert.equal(intervalLabel(60, 72), "↑P8");
  assert.equal(intervalLabel(60, 67), "↑P5");
  assert.equal(intervalLabel(60, 60), "P1");
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node test/ear.test.mjs`
Expected: FAIL — `Cannot find module '../src/ear.js'`

- [ ] **Step 3: Write the minimal implementation**

Create `src/ear.js`:

```js
// ============================================================
// Ear training core — pure, no React, no Web Audio. A phrase
// generator (generateRound) plus a session state machine
// (createEarSession). EarPanel drives both; the existing coach
// (gradeLine via useCoach) does all grading, untouched.
// ============================================================
import { midiToFreq, midiToNote } from "./audio/notes.js";

// Tiny deterministic PRNG so tests can pin every draw; the app seeds per session.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const INTERVAL_NAMES = ["P1", "m2", "M2", "m3", "M3", "P4", "TT", "P5", "m6", "M6", "m7", "M7", "P8"];

// "↑m3", "↓P5" — used for missed labels, so trouble-spot memory reads musically.
export function intervalLabel(prevMidi, curMidi) {
  const d = curMidi - prevMidi;
  const name = INTERVAL_NAMES[Math.min(Math.abs(d), 12)];
  return d === 0 ? name : (d > 0 ? "↑" : "↓") + name;
}
```

(`midiToFreq`/`midiToNote` are unused until Task 2 — that's fine, they're real imports the next task needs.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `node test/ear.test.mjs`
Expected: PASS — `ok` × 3, `all green`

- [ ] **Step 5: Wire `test:ear` into the suite**

In `package.json`, change the scripts block:

```json
    "test": "npm run test:smoke && npm run test:lessons && npm run test:coach && npm run test:ear",
```

and add below `"test:coach"`:

```json
    "test:ear": "node test/ear.test.mjs"
```

Run: `npm test`
Expected: all four suites green.

- [ ] **Step 6: Commit**

```bash
git add src/ear.js test/ear.test.mjs package.json
git commit -m "ear: pure core scaffold — seeded PRNG + interval labels

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `generateRound` — interval rounds (diff 1–2)

**Files:**
- Modify: `src/ear.js`
- Modify: `test/ear.test.mjs`

- [ ] **Step 1: Write the failing tests**

Append to `test/ear.test.mjs` (above the `process.on("exit")` line; also extend the top import):

```js
import { mulberry32, intervalLabel, generateRound } from "../src/ear.js";
import { midiToFreq } from "../src/audio/notes.js";
```

```js
const EAR = { range: [60, 79], keys: ["C", "G", "F"], bpm: 80, rounds: 5 };

test("generateRound: same seed, same round", () => {
  const a = generateRound({ diff: 1, ear: EAR, rng: mulberry32(7) });
  const b = generateRound({ diff: 1, ear: EAR, rng: mulberry32(7) });
  assert.deepEqual(a, b);
});

test("generateRound diff 1: two notes, small-interval set, in range", () => {
  for (let s = 0; s < 200; s++) {
    const r = generateRound({ diff: 1, ear: EAR, rng: mulberry32(s) });
    assert.equal(r.targets.length, 2);
    const gap = Math.abs(r.targets[1].midi - r.targets[0].midi);
    assert.ok([2, 3, 4, 5, 7].includes(gap), `seed ${s}: gap ${gap}`);
    for (const t of r.targets) assert.ok(t.midi >= 60 && t.midi <= 79, `seed ${s}: midi ${t.midi}`);
  }
});

test("generateRound diff 2: any interval up to an octave, both directions drawn", () => {
  const gaps = new Set();
  let down = 0;
  for (let s = 0; s < 300; s++) {
    const r = generateRound({ diff: 2, ear: EAR, rng: mulberry32(s) });
    const d = r.targets[1].midi - r.targets[0].midi;
    assert.ok(Math.abs(d) >= 1 && Math.abs(d) <= 12);
    gaps.add(Math.abs(d));
    if (d < 0) down++;
  }
  assert.ok(gaps.size >= 8, `variety expected, saw ${gaps.size} distinct intervals`);
  assert.ok(down > 50, "descending intervals should be common");
});

test("generateRound: targets, prompt, bpm, labels agree", () => {
  const r = generateRound({ diff: 1, ear: EAR, rng: mulberry32(3) });
  assert.equal(r.promptVoices.length, r.targets.length);
  assert.ok(Math.abs(r.promptVoices[0][0] - midiToFreq(r.targets[0].midi)) < 1e-9);
  assert.equal(r.bpm, 80);
  for (const t of r.targets) assert.match(t.label, /^[A-G]#?\d$/);
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node test/ear.test.mjs`
Expected: FAIL — `generateRound` is not exported.

- [ ] **Step 3: Implement interval rounds**

Append to `src/ear.js`:

```js
const SMALL_INTERVALS = [2, 3, 4, 5, 7];                    // M2 m3 M3 P4 P5
const ALL_INTERVALS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const noteLabel = (m) => { const n = midiToNote(m); return `${n.name}${n.octave}`; };
const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

// Two notes: draw an interval, a direction, then a start that keeps both ends
// in range. Configs are schema-checked to span >= 12 semitones, so max never
// dips below min.
function intervalMidis(diff, lo, hi, rng) {
  const step = pick(diff <= 1 ? SMALL_INTERVALS : ALL_INTERVALS, rng);
  const up = rng() < 0.5;
  const min = up ? lo : lo + step;
  const max = up ? hi - step : hi;
  const start = min + Math.floor(rng() * (max - min + 1));
  return [start, up ? start + step : start - step];
}

// One round: targets in gradeLine's shape, the prompt in playSequence's shape.
// `diff` is the item's *current* difficulty, so the engine's level-up
// suggestions walk this ladder with no ear-specific code.
export function generateRound({ diff, ear, rng }) {
  const [lo, hi] = ear.range;
  const midis = intervalMidis(diff, lo, hi, rng); // phrases (diff >= 3) arrive in the next task
  return {
    targets: midis.map((m) => ({ midi: m, label: noteLabel(m) })),
    promptVoices: midis.map((m) => [midiToFreq(m)]),
    bpm: ear.bpm || 80,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node test/ear.test.mjs`
Expected: PASS, `all green`

- [ ] **Step 5: Commit**

```bash
git add src/ear.js test/ear.test.mjs
git commit -m "ear: interval rounds (diff 1-2) in generateRound

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: `generateRound` — in-key phrase rounds (diff 3–5)

**Files:**
- Modify: `src/ear.js`
- Modify: `test/ear.test.mjs`

- [ ] **Step 1: Write the failing tests**

Append to `test/ear.test.mjs`:

```js
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
const ROOTS = { C: 0, G: 7, F: 5 };
const inKey = (midi, root) => MAJOR_STEPS.includes((((midi - root) % 12) + 12) % 12);
const gaps = (r) => r.targets.slice(1).map((t, i) => Math.abs(t.midi - r.targets[i].midi));

test("generateRound diff 3: three diatonic notes, steps and thirds, no repeats", () => {
  for (let s = 0; s < 200; s++) {
    const r = generateRound({ diff: 3, ear: EAR, rng: mulberry32(s) });
    assert.equal(r.targets.length, 3, `seed ${s}`);
    assert.ok(r.targets.every((t) => t.midi >= 60 && t.midi <= 79), `seed ${s}: out of range`);
    assert.ok(Object.values(ROOTS).some((root) => r.targets.every((t) => inKey(t.midi, root))), `seed ${s}: not in any configured key`);
    for (const g of gaps(r)) assert.ok(g >= 1 && g <= 4, `seed ${s}: gap ${g} beyond steps/thirds`);
  }
});

test("generateRound diff 4: four-to-five notes, leaps to a sixth", () => {
  const lens = new Set();
  for (let s = 0; s < 200; s++) {
    const r = generateRound({ diff: 4, ear: EAR, rng: mulberry32(s) });
    lens.add(r.targets.length);
    assert.ok(r.targets.length >= 4 && r.targets.length <= 5, `seed ${s}`);
    for (const g of gaps(r)) assert.ok(g >= 1 && g <= 9, `seed ${s}: gap ${g} beyond a sixth`);
    assert.ok(Object.values(ROOTS).some((root) => r.targets.every((t) => inKey(t.midi, root))), `seed ${s}: diff 4 stays diatonic`);
  }
  assert.deepEqual([...lens].sort(), [4, 5], "both lengths should occur");
});

test("generateRound diff 5: five-to-six notes, leaps to an octave, chromatics allowed", () => {
  for (let s = 0; s < 200; s++) {
    const r = generateRound({ diff: 5, ear: EAR, rng: mulberry32(s) });
    assert.ok(r.targets.length >= 5 && r.targets.length <= 6, `seed ${s}`);
    assert.ok(r.targets.every((t) => t.midi >= 60 && t.midi <= 79), `seed ${s}: out of range`);
    for (const g of gaps(r)) assert.ok(g >= 1 && g <= 12, `seed ${s}: gap ${g} beyond an octave`);
  }
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node test/ear.test.mjs`
Expected: diff-3/4/5 tests FAIL (interval generator returns 2 notes).

- [ ] **Step 3: Implement phrase rounds**

In `src/ear.js`, add above `generateRound`:

```js
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
export const KEY_ROOT = { C: 0, G: 7, D: 2, A: 9, E: 4, F: 5, Bb: 10, Eb: 3 };
const PHRASE_LEN = { 3: [3, 3], 4: [4, 5], 5: [5, 6] };
const PHRASE_REACH = { 3: 2, 4: 5, 5: 7 }; // max scale-steps per move (2≈third, 5≈sixth, 7≈octave)

function scaleNotes(key, lo, hi) {
  const root = KEY_ROOT[key];
  const out = [];
  for (let m = lo; m <= hi; m++) if (MAJOR.includes((((m - root) % 12) + 12) % 12)) out.push(m);
  return out;
}

// Random walk over the scale. No repeated adjacent notes — a legato re-strike
// of the same pitch never re-confirms in the note stream (see coach.js gapMs),
// so repeats would be ungradeable, not just hard.
function phraseMidis(diff, keys, lo, hi, rng) {
  const d = Math.min(diff, 5);
  const scale = scaleNotes(pick(keys, rng), lo, hi);
  const [a, b] = PHRASE_LEN[d];
  const len = a + Math.floor(rng() * (b - a + 1));
  let i = Math.floor(rng() * scale.length);
  const midis = [scale[i]];
  while (midis.length < len) {
    const reach = 1 + Math.floor(rng() * PHRASE_REACH[d]);
    const dir = rng() < 0.5 ? -1 : 1;
    let j = i + dir * reach;
    if (j < 0 || j >= scale.length) j = i - dir * reach; // bounce off the range edge
    j = Math.max(0, Math.min(scale.length - 1, j));
    let m = scale[j];
    const prev = midis[midis.length - 1];
    if (d >= 5 && rng() < 0.15) {
      const c = m + (rng() < 0.5 ? 1 : -1); // chromatic neighbor, color only
      if (c >= lo && c <= hi && Math.abs(c - prev) <= 12 && c !== prev) m = c;
    }
    if (m === prev) continue;
    midis.push(m);
    i = j;
  }
  return midis;
}
```

and change the one line in `generateRound`:

```js
  const midis = diff <= 2 ? intervalMidis(diff, lo, hi, rng) : phraseMidis(diff, ear.keys, lo, hi, rng);
```

(also delete the `// phrases (diff >= 3) arrive in the next task` comment).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node test/ear.test.mjs`
Expected: PASS, `all green`

- [ ] **Step 5: Commit**

```bash
git add src/ear.js test/ear.test.mjs
git commit -m "ear: in-key phrase rounds (diff 3-5) with seeded random walk

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: `createEarSession` — the round state machine

**Files:**
- Modify: `src/ear.js`
- Modify: `test/ear.test.mjs`

- [ ] **Step 1: Write the failing tests**

Extend the import in `test/ear.test.mjs`:

```js
import { mulberry32, intervalLabel, generateRound, createEarSession, REPLAYS } from "../src/ear.js";
```

Append:

```js
// gradeLine-shaped stub: only .accuracy and .results[].status are read.
const graded = (accuracy, statuses) => ({ accuracy, results: statuses.map((st) => ({ status: st })) });

test("session: idle -> prompt -> listen -> reveal -> ... -> done", () => {
  const s = createEarSession({ diff: 1, ear: { ...EAR, rounds: 2 } });
  assert.equal(s.state.phase, "idle");
  s.begin(mulberry32(1));
  assert.equal(s.state.phase, "prompt");
  assert.equal(s.state.round, 1);
  assert.equal(s.state.total, 2);
  assert.equal(s.state.current.targets.length, 2);
  s.promptEnded();
  assert.equal(s.state.phase, "listen");
  s.roundGraded(graded(100, ["caught", "caught"]));
  assert.equal(s.state.phase, "reveal");
  s.next(mulberry32(2));
  assert.equal(s.state.phase, "prompt");
  assert.equal(s.state.round, 2);
  s.promptEnded();
  s.roundGraded(graded(50, ["caught", "missed"]));
  s.next(mulberry32(3));
  assert.equal(s.state.phase, "done");
});

test("session: out-of-phase calls are ignored", () => {
  const s = createEarSession({ diff: 1, ear: EAR });
  s.promptEnded(); s.roundGraded(graded(0, [])); s.next(mulberry32(1));
  assert.equal(s.state.phase, "idle");
  s.begin(mulberry32(1));
  s.roundGraded(graded(0, [])); // not listening yet
  assert.equal(s.state.phase, "prompt");
});

test("session: replay budget — unlimited at diff 1, one at diff 5, resets per round", () => {
  assert.equal(REPLAYS[1], Infinity);
  const s5 = createEarSession({ diff: 5, ear: { ...EAR, rounds: 2 } });
  s5.begin(mulberry32(1)); s5.promptEnded();
  assert.equal(s5.replay(), true);   // back to prompt, budget spent
  s5.promptEnded();
  assert.equal(s5.replay(), false);  // exhausted
  s5.roundGraded(graded(0, ["missed", "missed", "missed", "missed", "missed"]));
  s5.next(mulberry32(2)); s5.promptEnded();
  assert.equal(s5.replay(), true);   // fresh budget in round 2

  const s1 = createEarSession({ diff: 1, ear: EAR });
  s1.begin(mulberry32(1)); s1.promptEnded();
  for (let i = 0; i < 10; i++) { assert.equal(s1.replay(), true); s1.promptEnded(); }
});

test("session: summary averages rounds; missed become interval labels", () => {
  const s = createEarSession({ diff: 1, ear: { ...EAR, rounds: 2 } });
  s.begin(mulberry32(1)); s.promptEnded();
  s.roundGraded(graded(100, ["caught", "caught"]));
  s.next(mulberry32(2)); s.promptEnded();
  s.roundGraded(graded(0, ["missed", "pending"]));
  s.next(mulberry32(3));
  assert.equal(s.state.phase, "done");
  const sum = s.summary();
  assert.equal(sum.accuracy, 50);
  assert.equal(sum.rounds.length, 2);
  assert.ok(sum.missed.includes("first note"));
  assert.ok(sum.missed.some((m) => /^[↑↓](m|M|P|TT)/.test(m)), `interval label expected, got ${JSON.stringify(sum.missed)}`);
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `node test/ear.test.mjs`
Expected: FAIL — `createEarSession` is not exported.

- [ ] **Step 3: Implement the machine**

Append to `src/ear.js`:

```js
// Replay budget per round, by item difficulty. The help ladder tightens here
// and in the "starts on" hint (EarPanel shows it at diff <= 2) — never via octave.
export const REPLAYS = { 1: Infinity, 2: Infinity, 3: 2, 4: 1, 5: 1 };

// Session state machine: idle -> prompt -> listen -> reveal -> (prompt … | done).
// Pure and timer-free: EarPanel drives transitions (it knows the prompt's
// duration and owns the mic); tests drive them synchronously. Out-of-phase
// calls are no-ops, so a stray timer can never corrupt a session.
export function createEarSession({ diff, ear }) {
  const total = (ear && ear.rounds) || 5;
  const budget = REPLAYS[diff] ?? 1;
  const s = { phase: "idle", round: 0, total, replaysLeft: budget, current: null, rounds: [] };
  // Missed targets become interval labels ("↓m3") so trouble-spot memory reads
  // musically; a missed opener has no previous note, hence "first note".
  const missedLabels = (result) =>
    result.results
      .map((r, k) => ({ r, k }))
      .filter(({ r }) => r.status !== "caught")
      .map(({ k }) => (k === 0 ? "first note" : intervalLabel(s.current.targets[k - 1].midi, s.current.targets[k].midi)));
  return {
    get state() { return { ...s }; },
    begin(rng) {
      if (s.phase !== "idle") return;
      s.phase = "prompt"; s.round = 1; s.replaysLeft = budget; s.current = generateRound({ diff, ear, rng });
    },
    promptEnded() { if (s.phase === "prompt") s.phase = "listen"; },
    replay() {
      if (s.phase !== "listen" || s.replaysLeft <= 0) return false;
      s.replaysLeft -= 1; s.phase = "prompt"; return true;
    },
    roundGraded(result) {
      if (s.phase !== "listen") return;
      s.rounds.push({ accuracy: result.accuracy, missed: missedLabels(result) });
      s.phase = "reveal";
    },
    next(rng) {
      if (s.phase !== "reveal") return;
      if (s.round >= s.total) { s.phase = "done"; return; }
      s.round += 1; s.replaysLeft = budget; s.current = generateRound({ diff, ear, rng }); s.phase = "prompt";
    },
    summary() {
      const n = s.rounds.length;
      return {
        accuracy: n ? Math.round(s.rounds.reduce((a, r) => a + r.accuracy, 0) / n) : 0,
        missed: [...new Set(s.rounds.flatMap((r) => r.missed))],
        rounds: s.rounds.slice(),
      };
    },
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node test/ear.test.mjs`
Expected: PASS, `all green`. Then run `npm test` — all suites green.

- [ ] **Step 5: Commit**

```bash
git add src/ear.js test/ear.test.mjs
git commit -m "ear: session round machine with per-diff replay budget

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Content — seed items, lesson entries, schema test

**Files:**
- Modify: `test/lessons.test.mjs`
- Modify: `src/seed.js`
- Create: `src/lessons/ear.js`
- Modify: `src/lessons/index.js`

- [ ] **Step 1: Write the failing schema test**

In `test/lessons.test.mjs`, append before the `process.on("exit")` line:

```js
// --- ear lessons: generator config schema ---

import { KEY_ROOT } from "../src/ear.js";

test("ear lessons exist for all four instruments and carry a valid generator config", () => {
  const earLessons = Object.entries(LESSONS).filter(([, L]) => L.ear);
  assert.equal(earLessons.length, 8, `expected 2 ear lessons x 4 instruments, got ${earLessons.length}`);
  for (const [id, L] of earLessons) {
    const { range, keys, bpm, rounds } = L.ear;
    assert.ok(Array.isArray(range) && range.length === 2, `${id}: ear.range must be [lo, hi]`);
    const [lo, hi] = range;
    assert.ok(Number.isInteger(lo) && Number.isInteger(hi) && hi - lo >= 12, `${id}: range must span >= an octave so P8 prompts fit`);
    assert.ok(Array.isArray(keys) && keys.length >= 1 && keys.every((k) => k in KEY_ROOT), `${id}: keys must be roots the generator knows`);
    assert.ok(Number.isInteger(rounds) && rounds >= 1, `${id}: bad rounds`);
    assert.ok(Number.isInteger(bpm) && bpm >= 40 && bpm <= 200, `${id}: bpm out of range`);
    assert.ok(!L.shape, `${id}: ear lessons are shapeless — the phrase is generated`);
    assert.ok(L.prescribe, `${id}: needs a prescribe line (schema requires shape or prescription)`);
  }
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node test/lessons.test.mjs`
Expected: FAIL — `expected 2 ear lessons x 4 instruments, got 0`.

- [ ] **Step 3: Add the seed items**

In `src/seed.js`, append inside the `SEED` array, after the accordion section:

```js
  // ---------- EAR TRAINING (echo rounds — graded; see src/ear.js) ----------
  { id: "pno-ear-int", inst: "piano",     title: "Echo: intervals",     type: "ear", diff: 1, min: 6, desc: "The app plays two notes; find them and play them back. Your ear learns the distances first." },
  { id: "pno-ear-phr", inst: "piano",     title: "Echo: short phrases", type: "ear", diff: 3, min: 8, desc: "Hear a short melody and play it back by ear. Phrases grow as you level up." },
  { id: "gtr-ear-int", inst: "guitar",    title: "Echo: intervals",     type: "ear", diff: 1, min: 6, desc: "Two notes from the app; echo them on one string or across strings — any octave counts." },
  { id: "gtr-ear-phr", inst: "guitar",    title: "Echo: short phrases", type: "ear", diff: 3, min: 8, desc: "Play back a short melodic phrase by ear. Sing it first if it helps — it does." },
  { id: "bs-ear-int",  inst: "bass",      title: "Echo: intervals",     type: "ear", diff: 1, min: 6, desc: "Echo two notes by ear. Interval recognition is half of learning lines off records." },
  { id: "bs-ear-phr",  inst: "bass",      title: "Echo: short phrases", type: "ear", diff: 3, min: 8, desc: "Short phrases to catch and play back — the transcription muscle, one lick at a time." },
  { id: "acc-ear-int", inst: "accordion", title: "Echo: intervals",     type: "ear", diff: 1, min: 6, desc: "Two notes on the right hand; play them back. Any octave counts." },
  { id: "acc-ear-phr", inst: "accordion", title: "Echo: short phrases", type: "ear", diff: 3, min: 8, desc: "Echo short right-hand phrases by ear, one round at a time." },
```

(No other change: `mergeContent` in `src/engine.js` already delivers new SEED items to existing installs, and `freshData` already spreads SEED.)

- [ ] **Step 4: Add the lesson entries**

Create `src/lessons/ear.js`:

```js
// Ear-training lessons. No shape — each round's phrase is generated at
// practice time (src/ear.js); the `ear` block configures the generator.
// `prescribe` satisfies the lesson schema (shape or prescription) and reads
// as the drill line in the sheet. Two factories keep the eight entries DRY;
// the per-instrument line and range are the only real differences.

const intervals = (instLine, range) => ({
  summary: "The app plays two notes; you play them back. Interval by interval, your ear learns the distances melodies are made of.",
  prescribe: "5 rounds · listen, then echo · any octave counts",
  steps: [
    "Tap Train your ear, then Start. You'll hear two notes — the pips show how many, never which.",
    instLine,
    "Play them back in order. Pips light up as notes land; wrong guesses don't derail the round.",
    "Stuck? Replay the prompt — free at this level. After each round the notes are revealed.",
  ],
  watch: [
    "Sing or hum the notes before you hunt for them — the voice finds intervals faster than fingers.",
    "Hear the distance before you play the second note; don't fish note by note.",
  ],
  ear: { range, keys: ["C", "G", "F"], bpm: 80, rounds: 5 },
});

const phrases = (instLine, range) => ({
  summary: "Hear a short melody, play it back by ear. The phrases lengthen and leap wider as you level up.",
  prescribe: "5 rounds · short phrases in a key · replays are limited",
  steps: [
    "Tap Train your ear, then Start. A short phrase plays — count the pips.",
    instLine,
    "Echo the phrase in order. Reveal shows what it was; Next brings a fresh one.",
    "Replays are limited here — hold the whole phrase in your head before you play.",
  ],
  watch: [
    "Catch the contour first (up-up-down beats exact notes), then pin the intervals.",
    "If you lose the middle, replay and sing just that fragment before playing it.",
  ],
  ear: { range, keys: ["C", "G", "F"], bpm: 80, rounds: 5 },
});

export default {
  "pno-ear-int": intervals("Find them anywhere on the keyboard — prompts live around middle C.", [60, 79]),
  "pno-ear-phr": phrases("Phrases sit around middle C and stay in one key.", [60, 79]),
  "gtr-ear-int": intervals("One string or across strings — whatever your hands find first.", [52, 71]),
  "gtr-ear-phr": phrases("Phrases sit mid-neck; stay in position and let your ear steer.", [52, 71]),
  "bs-ear-int":  intervals("Anywhere on the neck — low positions are fine.", [40, 59]),
  "bs-ear-phr":  phrases("Phrases sit in the octave above open E — classic line territory.", [40, 59]),
  "acc-ear-int": intervals("Right hand only; keep the bellows gentle and steady.", [57, 81]),
  "acc-ear-phr": phrases("Right hand only, one key at a time. Steady bellows keeps detection clean.", [57, 81]),
};
```

In `src/lessons/index.js`:

```js
import guitar from "./guitar.js";
import piano from "./piano.js";
import bass from "./bass.js";
import accordion from "./accordion.js";
import ear from "./ear.js";

// Lessons are static content keyed by exercise/stage id. They are looked up at
// render time and never written to storage, so updates reach existing users.
export const LESSONS = { ...guitar, ...piano, ...bass, ...accordion, ...ear };
export const getLesson = (id) => LESSONS[id] || null;
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: all green — including the pre-existing lessons-schema tests (ear entries pass `shape || prescribe` via `prescribe`) and the new ear-config test.

- [ ] **Step 6: Commit**

```bash
git add src/seed.js src/lessons/ear.js src/lessons/index.js test/lessons.test.mjs
git commit -m "ear: seed items + lessons for all four instruments

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: `EarPanel.jsx` — the call-and-response surface

No node-testable logic here (the repo has no jsdom/RTL — UI is build- and
manually-verified, matching house practice). The panel is a thin driver over
`ear.js` + `useCoach`.

**Files:**
- Create: `src/EarPanel.jsx`

- [ ] **Step 1: Write the component**

Create `src/EarPanel.jsx`:

```jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCoach } from "./useCoach.js";
import { createEarSession, mulberry32 } from "./ear.js";
import { playSequence, stop as stopAudio } from "./lessonAudio.js";

const STATUS_CLASS = { caught: "ok", missed: "bad", pending: "" };

// Call-and-response surface in the lesson sheet. The session machine (ear.js)
// owns the flow; this component drives it: play the prompt with the mic OFF
// (the coach must never grade the synth), then listen, then reveal. Targets
// stay hidden until reveal — pips show status only, and there is deliberately
// no "looking for X" hint (it would name the answer).
export default function EarPanel({ item, lesson, sessions = [], onLog }) {
  const [open, setOpen] = useState(false);
  const [runToken, setRunToken] = useState(0);
  const [, setTick] = useState(0);
  const rerender = () => setTick((n) => n + 1);
  const session = useRef(null);
  const rng = useRef(null);
  const timer = useRef(null);

  const st = session.current ? session.current.state : { phase: "idle" };
  const targets = st.current ? st.current.targets : [];
  const coach = useCoach({ mode: "line", targets, octaveStrict: false, inst: item.inst });
  const r = coach.result;

  // Start the mic only after the prompt has finished and targets have settled
  // (same runToken discipline as CoachPanel).
  useEffect(() => {
    if (runToken === 0) return;
    coach.reset();
    coach.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runToken]);

  const playPrompt = () => {
    const cur = session.current.state.current;
    coach.stop();
    const ms = playSequence(cur.promptVoices, { bpm: cur.bpm });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      session.current.promptEnded();
      setRunToken((n) => n + 1);
      rerender();
    }, ms + 250);
    rerender();
  };

  const begin = () => {
    rng.current = mulberry32(Date.now() >>> 0);
    session.current = createEarSession({ diff: item.diff, ear: lesson.ear });
    session.current.begin(rng.current);
    playPrompt();
  };

  const finishRound = () => {
    coach.stop();
    session.current.roundGraded(coach.result);
    rerender();
  };

  // A round grades itself the moment the line completes.
  useEffect(() => {
    if (coach.listening && session.current && session.current.state.phase === "listen" && r.done) finishRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r.done, coach.listening]);

  const replay = () => { if (session.current.replay()) playPrompt(); };
  const next = () => {
    session.current.next(rng.current);
    if (session.current.state.phase === "prompt") playPrompt();
    else rerender();
  };

  useEffect(() => () => { clearTimeout(timer.current); stopAudio(); }, []);

  // Same trouble-spot memory as CoachPanel — here the labels are intervals.
  const trouble = useMemo(() => {
    const counts = {};
    for (const s of sessions) if (s.coached && Array.isArray(s.missed)) for (const m of s.missed) counts[m] = (counts[m] || 0) + 1;
    return Object.entries(counts).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([m]) => m);
  }, [sessions]);

  if (!open) {
    return (
      <button className="ws-btn ghost sm ws-coach-open" onClick={() => setOpen(true)}>
        ◉ Train your ear
      </button>
    );
  }

  const listen = st.phase === "listen";
  const reveal = st.phase === "reveal";
  const done = st.phase === "done";
  // During prompt, r may still hold the previous round (reset happens at mic
  // start) — render neutral pips from the new targets instead.
  const pips = listen || reveal ? r.results : targets.map((t) => ({ status: "pending", target: t }));
  const lastRound = st.rounds && st.rounds.length ? st.rounds[st.rounds.length - 1] : null;
  const sum = done ? session.current.summary() : null;

  return (
    <div className="ws-coach" aria-live="polite">
      {st.phase !== "idle" && !done && (
        <>
          <div className="ws-coach-hint mono">
            round {st.round} of {st.total}
            {item.diff <= 2 && targets.length ? ` · starts on ${targets[0].label}` : ""}
          </div>
          <div className="ws-coach-seq" role="img" aria-label={`Ear round ${st.round}: ${pips.filter((x) => x.status === "caught").length} of ${targets.length} caught`}>
            {pips.map((x, i) => (
              <span key={i} className={`ws-coach-chip ${STATUS_CLASS[x.status] || ""} ${listen && i === r.cursor ? "now" : ""}`}>
                {reveal ? x.target.label : "●"}
              </span>
            ))}
          </div>
        </>
      )}

      {coach.error ? (
        <div className="ws-listen-err">{coach.error}</div>
      ) : st.phase === "idle" ? (
        <div className="ws-coach-start">
          {trouble.length > 0 && <div className="ws-coach-trouble">Trouble spots last time: {trouble.join(", ")}</div>}
          <button className="ws-btn primary sm full" onClick={begin}>● Start</button>
        </div>
      ) : st.phase === "prompt" ? (
        <div className="ws-coach-hint mono">listen…</div>
      ) : listen ? (
        <>
          <div className="ws-coach-hint mono">
            {r.lastHeard ? `hearing ${r.lastHeard.name}${r.lastHeard.octave}` : "play it back…"}
          </div>
          <div className="ws-coach-actions">
            <button className="ws-btn ghost sm" onClick={replay} disabled={st.replaysLeft <= 0}>
              ↻ Replay{Number.isFinite(st.replaysLeft) ? ` (${st.replaysLeft})` : ""}
            </button>
            <button className="ws-btn ghost sm" onClick={finishRound}>Reveal</button>
          </div>
        </>
      ) : reveal ? (
        <div className="ws-coach-summary">
          <div className="ws-coach-score mono"><b>{lastRound.accuracy}</b>% this round</div>
          <div className="ws-coach-actions">
            <button className="ws-btn primary sm" onClick={next}>{st.round >= st.total ? "Finish" : "Next →"}</button>
          </div>
        </div>
      ) : done ? (
        <div className="ws-coach-summary">
          <div className="ws-coach-band">
            {sum.accuracy >= 90 ? "Sharp ears" : sum.accuracy >= 60 ? "Getting there — a few slipped past" : "Keep at it — ears take reps"}
          </div>
          <div className="ws-coach-score mono"><b>{sum.accuracy}</b>% over {sum.rounds.length} rounds</div>
          {sum.missed.length > 0 && <div className="ws-coach-missed">to revisit: {sum.missed.join(", ")}</div>}
          <div className="ws-coach-actions">
            <button className="ws-btn ghost sm" onClick={() => { session.current = null; rerender(); begin(); }}>↻ Try again</button>
            <button className="ws-btn primary sm" onClick={() => onLog({ accuracy: sum.accuracy, missed: sum.missed })}>Log it →</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: clean build (the component is not yet mounted anywhere; Vite still type-parses it — actually Vite only builds reachable modules, so also run a syntax pass):

Run: `node --input-type=module -e "await import('./src/ear.js'); console.log('ear.js ok')"`
Expected: `ear.js ok` (the JSX file is exercised by the build in Task 7).

- [ ] **Step 3: Commit**

```bash
git add src/EarPanel.jsx
git commit -m "ear: EarPanel call-and-response UI (hidden-target pips)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Mount in the lesson sheet

**Files:**
- Modify: `src/LessonSheet.jsx`

- [ ] **Step 1: Mount EarPanel and hide the generic Hear button for ear lessons**

In `src/LessonSheet.jsx`, add the import:

```jsx
import EarPanel from "./EarPanel.jsx";
```

After the existing CoachPanel block (the `{isCoachable(item, lesson) && ...}` expression), add:

```jsx
        {lesson.ear && onCoachResult && onRequestLog && (
          <EarPanel
            item={item}
            lesson={lesson}
            sessions={sessions}
            onLog={(res) => { onCoachResult(item.id, res); onRequestLog(); }}
          />
        )}
```

(CoachPanel needs no gate change: `isCoachable` requires `lesson.shape`, and ear lessons are shapeless.)

Wrap the Hear button so ear lessons skip it (the shapeless fallback would just play a click; the prompt lives inside the round flow):

```jsx
        {!lesson.ear && (
          <button className={`ws-btn ${playing ? "ghost" : "primary"} sm ws-hear`} onClick={hear} aria-pressed={playing}>
            {playing ? "■ Stop" : "▶ Hear it"}
          </button>
        )}
```

- [ ] **Step 2: Verify build and tests**

Run: `npm run build && npm test`
Expected: clean build, all suites green.

- [ ] **Step 3: Commit**

```bash
git add src/LessonSheet.jsx
git commit -m "ear: mount EarPanel in the lesson sheet; hide Hear for ear lessons

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add the ear-training paragraph to the coach section**

In `README.md`, find the paragraph in "### The pitch coach" that begins
`It now also reads **timing evenness**` and add a new paragraph after it:

```markdown
It now also **trains your ear**: the *Echo* exercises (all four instruments)
play a short prompt — two notes at first, longer in-key phrases as you level
up — and coach you as you play it back. The targets stay hidden until each
round's reveal; a "starts on" hint and free replays taper off at higher
difficulty, and grading is always octave-forgiving (echo in whatever octave
your instrument likes). Accuracy logs like any coached run and feeds the same
progression suggestions.
```

- [ ] **Step 2: Soften the seed-editing caveat**

Find the note that begins `> Note: editing \`SEED\` changes the library for a **fresh** install.` and append to that block:

```markdown
> Newly **added** default items are different: the app merges missing default
> content into an existing library on load (that's how new track stages — and
> the ear-training exercises — reach you without a reset). The reset caveat
> applies to *edits* of items you already have.
```

- [ ] **Step 3: Update the "What's next" line about ear/LM if stale**

In "## What's next", after the sentence noting "Timing evenness and accordion (musette) detection are now in.", extend it to:

```markdown
Timing evenness and accordion (musette) detection are now in, and the `ear`
exercise type is no longer aspirational — the Echo exercises grade
call-and-response rounds through the same coach.
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: ear training (Echo exercises) in README

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Full suite + build**

Run: `npm test && npm run build`
Expected: every suite green, clean build.

- [ ] **Step 2: Manual on-device checklist (dev server + a real mic)**

Run: `npm run dev` and open an *Echo: intervals* exercise (any instrument you can sound near the mic — even humming works for a smoke check):

1. **Learn** opens the lesson; there is **no** "▶ Hear it" button and **no** "Coach me" — only "◉ Train your ear".
2. Start → two notes play; **no pip lights during the prompt** (mic is off).
3. Hum/play the two notes back → pips fill left to right; "hearing X" updates; round auto-reveals on completion, showing note names.
4. "starts on …" hint is visible (diff 1) and Replay shows no count (unlimited).
5. Play a *wrong* second note, then the right one → first reveal shows a missed pip; accuracy < 100.
6. Complete 5 rounds → summary with % and "to revisit" interval labels → **Log it** → the log sheet opens; after saving, Progress shows the accuracy on that exercise.
7. Reopen the exercise → "Trouble spots last time" lists interval labels (after ≥ 2 sessions missing the same interval).
8. Tap Reveal mid-round with notes unplayed → they count as not caught (accuracy reflects it).
9. Quick pass on an *Echo: short phrases* exercise: replays capped at 2, no "starts on" hint.

Record any deviation as a bug before proceeding; do not adjust the checklist to match behavior.

- [ ] **Step 3: Wrap up**

Use the superpowers:finishing-a-development-branch skill (merge/PR decision belongs to the user).
```

---

## Self-review notes (already applied)

- **Spec coverage:** §1 → Tasks 2–3; §2 → Task 4; §3 → Task 6; §4 → Task 7; §5 → Task 5; §6 → Task 5 step 3 (no-op by design); §7 → no task (no engine change, verified by Task 9 suite); §8 → Task 6 (error branch) + Task 9 step 2.8; Testing → Tasks 1–5; README → Task 8.
- **Type consistency:** `generateRound` returns `{ targets, promptVoices, bpm }` — consumed with those names in Task 4 (`s.current.targets`) and Task 6 (`cur.promptVoices`, `cur.bpm`, `targets[0].label`). `createEarSession` exposes `state/begin/promptEnded/replay/roundGraded/next/summary` — the exact set EarPanel calls. `REPLAYS` exported (Task 4) and imported only by tests; EarPanel reads the budget via `st.replaysLeft`.
- **Known intermediate state:** Task 2's `generateRound` handles only diff ≤ 2 (a comment marks it); Task 3 completes it. Tests for diff ≥ 3 land in Task 3, so the suite is green at every commit.

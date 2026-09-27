# Notation and Pieces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A piano notation engine for Woodshed's desktop layout: pieces as a grand staff with section loops, hands separately, wait mode and a graded play-along (notes + rhythm vs the metronome) with a tempo ladder, plus generated, leveled sight-reading drills.

**Architecture:** Scores are ABC text. Pure node-tested modules in `src/score/` parse ABC (via abcjs, passed in), grade timed and untimed runs, and generate drills. A subscribable `runStore` carries run state to the stage (main pane) and the rail panel without re-rendering App. abcjs is lazy-loaded for rendering only; the metronome exposes a count-in and a timeline on the `performance.now()` clock so beats and MIDI timestamps line up.

**Tech Stack:** React 18, Vite 5, abcjs 6.7.x, Web MIDI (existing `src/midi/`), plain-node test scripts.

**Spec:** `docs/superpowers/specs/2026-09-26-notation-pieces-design.md` — read it first; it is binding.

## Global Constraints

- Piano only; desktop layout only (≥1024px). Guitar untouched. The phone layout is unchanged except scored lessons show "Open on the desktop to read the score".
- App must never subscribe to `runStore`, the MIDI context or the practice context.
- abcjs `^6.7.1` is a dependency; the browser loads it with a dynamic `import("abcjs")` (separate chunk); pure modules receive it as a parameter; node tests `import abcjs from "abcjs"`.
- ABC convention: one source line = one 4-bar system; voice 1 = right hand, voice 2 = left hand; a one-voice score's hand comes from its clef (treble = R, bass = L). Metres with a quarter-note beat only (x/4); no pickup bars.
- Timing windows: `on` ≤ 60 ms, early/late ≤ 180 ms, beyond → missed. Clean pass = notes ≥ 90% and rhythm ≥ 80%. Tempo ladder +4 bpm per clean pass, capped at the score's `target`.
- Colours: on `#7fc4bc`, early/late `var(--gold)`, wrong/missed `#e8916f`; current system marker 2px `var(--gold-dim)`.
- Tests are plain node scripts (copy the harness from `test/desktop.test.mjs`), wired into `package.json` `"test"`. Every commit passes `npm test` and `npm run build`.
- Modules imported by node tests must not import React or touch `import.meta.env`.
- Code style (owner is strict): smallest diff that works; match surrounding idiom and low comment density; no comments restating code; no abstractions beyond this plan.
- Don't push. Branch: `notation-engine`.

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/score/scoreModel.js` | new | `parseScore`, `inSection`, `forHands` |
| `src/score/timedGrade.js` | new | `gradeTimed` (play-along) |
| `src/score/waitGrade.js` | new | `createWaitRun` (wait mode) |
| `src/score/sightread.js` | new | `generateDrill`, `drillBpm`, `LEVELS` |
| `src/score/runStore.js` | new | run state store |
| `src/score/useRun.js` | new | `useRun()` hook over runStore |
| `src/score/ScoreStage.jsx` | new | main-pane score (render, window, colours, sections) |
| `src/score/ScoreSnippet.jsx` | new | static rail snippet |
| `src/score/ScorePanel.jsx` | new | rail controls, runs, ladder, summary, sight-reading |
| `src/useMetronome.js` | modify | `start({ countIn })`, `timeline()` |
| `src/engine.js`, `src/storage.js` | modify | schema 7: `ladder`, `sightLevel` |
| `src/seed.js`, `src/lessons/piano.js`, `src/lessons/index.js` | modify | Minuet item, sight-reading lesson, snippets, `hasScore` |
| `src/App.jsx`, `src/Sidebar.jsx`, `src/LessonSheet.jsx` | modify | routing, Score entry, snippet, phone note, log fields |
| `src/shortcuts.js`, `src/useShortcuts.js` | modify | W H N [ ] 5 ↑↓; run rules |
| `src/styles.css` | modify | `.ws-score-*` |
| `test/score.test.mjs` | new | score modules |

---

### Task 1: abcjs and the score model

**Files:** Modify `package.json`; create `src/score/scoreModel.js`, `test/score.test.mjs`.

**Interfaces (produces):**
- `parseScore(abc, abcjs)` → `{ meter: [num, den], beatsPerBar, key, bars: [{ n, beat }], notes: [{ midi, beat, dur, bar, hand: "R"|"L", onset }] }` — beats are quarter notes from the piece start; notes sorted by beat then pitch; `onset` counts distinct beats from 0.
- `inSection(notes, from, to)` → notes with `from ≤ bar ≤ to`.
- `forHands(notes, hands)` with `hands` ∈ `"both" | "R" | "L"`.

- [ ] **Step 1: Install** — `npm install abcjs@^6.7.1`.

- [ ] **Step 2: Failing tests** — create `test/score.test.mjs` (harness from `test/desktop.test.mjs`):

```js
import assert from "node:assert/strict";
import abcjs from "abcjs";
const { parseScore, inSection, forHands } = await import("../src/score/scoreModel.js");

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

const MINI = `X:1
M:3/4
L:1/8
K:G
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 |
[V:2] [G,B,D]4 A,2 | B,6 | C6 | B,6 |`;

test("parseScore: metre, key, bars", () => {
  const s = parseScore(MINI, abcjs);
  assert.deepEqual(s.meter, [3, 4]); assert.equal(s.beatsPerBar, 3); assert.equal(s.key, "G");
  assert.deepEqual(s.bars.map((b) => b.beat), [0, 3, 6, 9]);
});
test("parseScore: right-hand pitches, beats and the key signature's F#", () => {
  const rh = parseScore(MINI, abcjs).notes.filter((n) => n.hand === "R" && n.bar <= 3);
  assert.deepEqual(rh.map((n) => n.midi), [74, 67, 69, 71, 72, 74, 67, 67, 76, 72, 74, 76, 78]);
  assert.deepEqual(rh.slice(0, 5).map((n) => n.beat), [0, 1, 1.5, 2, 2.5]);
});
test("parseScore: a left-hand chord is one onset", () => {
  const s = parseScore(MINI, abcjs);
  const first = s.notes.filter((n) => n.beat === 0);
  assert.deepEqual(first.map((n) => `${n.hand}${n.midi}`), ["L55", "L59", "L62", "R74"]);
  assert.ok(first.every((n) => n.onset === 0));
});
test("parseScore: durations in beats and bar numbers", () => {
  const lh = parseScore(MINI, abcjs).notes.filter((n) => n.hand === "L");
  assert.deepEqual(lh.map((n) => [n.midi, n.beat, n.dur, n.bar]), [[55, 0, 2, 1], [59, 0, 2, 1], [62, 0, 2, 1], [57, 2, 1, 1], [59, 3, 3, 2], [60, 6, 3, 3], [59, 9, 3, 4]]);
});
test("parseScore: a one-voice bass-clef score is the left hand", () => {
  const s = parseScore("X:1\nM:4/4\nL:1/4\nK:C clef=bass\nC, D, E, F,|G,4|", abcjs);
  assert.ok(s.notes.every((n) => n.hand === "L")); assert.equal(s.notes[0].midi, 48);
});
test("inSection and forHands filter notes", () => {
  const s = parseScore(MINI, abcjs);
  assert.ok(inSection(s.notes, 2, 3).every((n) => n.bar >= 2 && n.bar <= 3));
  assert.ok(forHands(s.notes, "L").every((n) => n.hand === "L"));
  assert.equal(forHands(s.notes, "both").length, s.notes.length);
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });
```

- [ ] **Step 3: Wire and run** — add `"test:score": "node test/score.test.mjs"` to `package.json` and append ` && npm run test:score` to `"test"`. Run `node test/score.test.mjs` → fails (module not found).

- [ ] **Step 4: Implement** `src/score/scoreModel.js`:

```js
// Written music, pure: an ABC score -> notes with beats (quarter notes), bars and
// hands. abcjs is passed in so the browser can lazy-load it and tests can import it.
const round = (x) => Math.round(x * 1000) / 1000;

export function parseScore(abc, abcjs) {
  const [tune] = abcjs.parseOnly(abc);
  const { num, den } = tune.getMeterFraction();
  const k = tune.getKeySignature();
  const beatsPerBar = (num * 4) / den;
  const clef = (tune.lines.find((l) => l.staff) || { staff: [{ clef: { type: "treble" } }] }).staff[0].clef.type;
  const tracks = tune.setUpAudio({}).tracks;
  const hand = (i) => (tracks.length > 1 ? (i === 0 ? "R" : "L") : clef === "bass" ? "L" : "R");
  const notes = [];
  tracks.forEach((tr, i) => {
    for (const e of tr) {
      if (e.cmd !== "note") continue;
      const beat = round(e.start * 4);
      notes.push({ midi: e.pitch, beat, dur: round(e.duration * 4), bar: Math.floor(beat / beatsPerBar + 1e-9) + 1, hand: hand(i) });
    }
  });
  notes.sort((a, b) => a.beat - b.beat || a.midi - b.midi);
  let onset = -1, last = null;
  for (const n of notes) { if (n.beat !== last) { onset++; last = n.beat; } n.onset = onset; }
  const end = notes.reduce((m, n) => Math.max(m, n.beat + n.dur), 0);
  const bars = Array.from({ length: Math.ceil(end / beatsPerBar - 1e-9) }, (_, i) => ({ n: i + 1, beat: i * beatsPerBar }));
  return { meter: [num, den], beatsPerBar, key: `${k.root}${k.acc}${k.mode || ""}`, bars, notes };
}

export const inSection = (notes, from, to) => notes.filter((n) => n.bar >= from && n.bar <= to);
export const forHands = (notes, hands) => (hands === "both" ? notes : notes.filter((n) => n.hand === hands));
```

If an assertion fails because abcjs reports something differently than assumed (e.g. the key string for a minor key, tied notes), inspect abcjs's output, adjust the implementation (not the test's musical facts), and note it in the report.

- [ ] **Step 5: Run** → `all green`; `npm test` exit 0; `npm run build` succeeds.
- [ ] **Step 6: Commit** — `feat(score): parse ABC scores into beats, bars and hands`.

---

### Task 2: Timed and wait-mode grading

**Files:** Create `src/score/timedGrade.js`, `src/score/waitGrade.js`; modify `test/score.test.mjs`.

**Interfaces (produces):**
- `ON_MS = 60`, `WINDOW_MS = 180`.
- `gradeTimed(targets, events, { t0, bpm, beatsPerBar = 4, now = Infinity })` → `{ statuses: ("on"|"early"|"late"|"missed"|"pending")[] (aligned with targets), offsets: (number|null)[], extras: [{ midi, bar }], notesPct, rhythmPct, revisitBars: number[], clean, done, cursor }`. `targets` are parsed notes (`{ midi, beat, bar, … }`), `events` are note events `{ midi, tStart }` on the same clock as `t0`. The section's first beat (min target beat) lands at `t0`.
- `createWaitRun(targets)` → `{ press(midi) → "wrong"|"held"|"advance"|"done", cursor, groups: [{ beat, bar, notes }], done, result() → { found, total, wrong, wrongBars } }`.

- [ ] **Step 1: Failing tests** — append to `test/score.test.mjs` (before the exit line):

```js
const { gradeTimed, ON_MS, WINDOW_MS } = await import("../src/score/timedGrade.js");
const { createWaitRun } = await import("../src/score/waitGrade.js");
const T = (midi, beat, bar = 1) => ({ midi, beat, bar });
const E = (midi, tStart) => ({ midi, tStart });
// 60 bpm: one beat = 1000 ms; t0 = 10000
const opts = (now = Infinity) => ({ t0: 10000, bpm: 60, beatsPerBar: 4, now });

test("gradeTimed: on, early, late at the 60 and 180 ms edges", () => {
  const targets = [T(60, 0), T(62, 1), T(64, 2), T(65, 3)];
  const r = gradeTimed(targets, [E(60, 10060), E(62, 10939), E(64, 12180), E(65, 13181)], opts());
  assert.deepEqual(r.statuses, ["on", "early", "late", "missed"]);
  assert.equal(ON_MS, 60); assert.equal(WINDOW_MS, 180);
});
test("gradeTimed: pending before a window closes, missed after", () => {
  const targets = [T(60, 0), T(62, 1)];
  assert.deepEqual(gradeTimed(targets, [], opts(11100)).statuses, ["missed", "pending"]);
  assert.equal(gradeTimed(targets, [], opts(11100)).done, false);
  assert.equal(gradeTimed(targets, [], opts(11181)).done, true);
});
test("gradeTimed: a slip doesn't shift later notes", () => {
  const targets = [T(60, 0), T(62, 1), T(64, 2), T(65, 3)];
  const r = gradeTimed(targets, [E(61, 10000), E(62, 11000), E(64, 12000), E(65, 13000)], opts());
  assert.deepEqual(r.statuses, ["missed", "on", "on", "on"]);
  assert.deepEqual(r.extras, [{ midi: 61, bar: 1 }]);
});
test("gradeTimed: repeated notes and chords each match their own press", () => {
  const targets = [T(60, 0), T(64, 0), T(67, 0), T(60, 1), T(60, 2)];
  const r = gradeTimed(targets, [E(67, 10010), E(60, 10020), E(64, 10030), E(60, 11010), E(60, 12100)], opts());
  assert.deepEqual(r.statuses, ["on", "on", "on", "on", "late"]);
});
test("gradeTimed: notes % and rhythm %, clean pass, revisit bars", () => {
  const targets = [T(60, 0, 1), T(62, 1, 1), T(64, 4, 2), T(65, 5, 2), T(67, 8, 3)];
  const r = gradeTimed(targets, [E(60, 10000), E(62, 11100), E(64, 14000), E(65, 15000)], opts());
  assert.equal(r.notesPct, 80); assert.equal(r.rhythmPct, 75); assert.equal(r.clean, false);
  assert.deepEqual(r.revisitBars, [1, 3]);
  const clean = gradeTimed(targets, targets.map((t) => E(t.midi, 10000 + t.beat * 1000)), opts());
  assert.equal(clean.notesPct, 100); assert.equal(clean.rhythmPct, 100); assert.equal(clean.clean, true);
});
test("gradeTimed: the section's first beat lands at t0", () => {
  const targets = [T(60, 9, 4), T(62, 10, 4)];
  assert.deepEqual(gradeTimed(targets, [E(60, 10000), E(62, 11000)], opts()).statuses, ["on", "on"]);
});
test("gradeTimed: cursor is the first pending target in time", () => {
  const targets = [T(60, 0), T(62, 1), T(64, 2)];
  assert.equal(gradeTimed(targets, [E(60, 10000)], opts(10500)).cursor, 1);
  assert.equal(gradeTimed(targets, targets.map((t) => E(t.midi, 10000 + t.beat * 1000)), opts()).cursor, -1);
});
test("createWaitRun: a chord advances only when all its notes are pressed, rolled is fine", () => {
  const run = createWaitRun([T(60, 0), T(64, 0), T(67, 0), T(62, 1)]);
  assert.equal(run.press(64), "held"); assert.equal(run.press(60), "held"); assert.equal(run.cursor, 0);
  assert.equal(run.press(67), "advance"); assert.equal(run.cursor, 1);
  assert.equal(run.press(62), "done"); assert.equal(run.done, true);
});
test("createWaitRun: a wrong press flashes but never advances", () => {
  const run = createWaitRun([T(60, 0, 1), T(62, 1, 1), T(64, 4, 2)]);
  assert.equal(run.press(61), "wrong"); assert.equal(run.cursor, 0);
  run.press(60); run.press(62); run.press(65);
  assert.deepEqual(run.result(), { found: 2, total: 3, wrong: 2, wrongBars: [1, 2] });
});
```

- [ ] **Step 2:** Run → fails (modules not found).

- [ ] **Step 3: Implement** `src/score/timedGrade.js`:

```js
// Written music against the clock, pure. Each target's expected time is t0 plus
// its beat from the section start; the nearest same-pitch press within 180 ms
// matches it — within 60 ms "on", else "early"/"late". Every target has its own
// window, so a slip never shifts the notes after it.
export const ON_MS = 60, WINDOW_MS = 180;

export function gradeTimed(targets, events, { t0, bpm, beatsPerBar = 4, now = Infinity }) {
  const ms = 60000 / bpm;
  const start = targets.length ? Math.min(...targets.map((t) => t.beat)) : 0;
  const expected = targets.map((t) => t0 + (t.beat - start) * ms);
  const order = targets.map((_, i) => i).sort((a, b) => expected[a] - expected[b]);
  const statuses = targets.map(() => "pending"), offsets = targets.map(() => null), used = new Set();
  for (const i of order) {
    let best = -1, d = Infinity;
    events.forEach((e, j) => {
      const x = e.tStart - expected[i];
      if (!used.has(j) && e.midi === targets[i].midi && Math.abs(x) <= WINDOW_MS && Math.abs(x) < Math.abs(d)) { best = j; d = x; }
    });
    if (best >= 0) { used.add(best); offsets[i] = d; statuses[i] = Math.abs(d) <= ON_MS ? "on" : d < 0 ? "early" : "late"; }
    else if (now > expected[i] + WINDOW_MS) statuses[i] = "missed";
  }
  const barAt = (t) => Math.floor(((t - t0) / ms + start) / beatsPerBar + 1e-9) + 1;
  const extras = events.filter((_, j) => !used.has(j)).map((e) => ({ midi: e.midi, bar: barAt(e.tStart) }));
  const hits = statuses.filter((s) => s === "on" || s === "early" || s === "late").length;
  const on = statuses.filter((s) => s === "on").length;
  const notesPct = targets.length ? Math.round((100 * hits) / targets.length) : 0;
  const rhythmPct = hits ? Math.round((100 * on) / hits) : 0;
  const revisitBars = [...new Set([...targets.filter((_, i) => statuses[i] !== "on" && statuses[i] !== "pending").map((t) => t.bar), ...extras.map((x) => x.bar)])].sort((a, b) => a - b);
  const cursor = order.find((i) => statuses[i] === "pending") ?? -1;
  return {
    statuses, offsets, extras, notesPct, rhythmPct, revisitBars,
    clean: notesPct >= 90 && rhythmPct >= 80,
    done: !targets.length || now > Math.max(...expected) + WINDOW_MS,
    cursor,
  };
}
```

Note: in the "notes % and rhythm %" test, bar 3's target is missed and bar 1's second note is late, so `revisitBars` is `[1, 3]` — a late note puts its bar on the list. If the implementation disagrees with a test's musical facts, fix the implementation; if you believe a test is wrong, stop and report.

`src/score/waitGrade.js`:

```js
// Wait mode, pure: no clock. The current onset (every note starting together in
// the played hands) advances once each of its notes has been pressed since it
// became current, so rolled chords work; any other key is a wrong note that
// flashes but never advances.
export function createWaitRun(targets) {
  const groups = [];
  for (const t of [...targets].sort((a, b) => a.beat - b.beat)) {
    const g = groups[groups.length - 1];
    if (g && g.beat === t.beat) g.notes.push(t);
    else groups.push({ beat: t.beat, bar: t.bar, notes: [t] });
  }
  let cur = 0, pressed = new Set();
  const wrong = [];
  return {
    press(midi) {
      if (cur >= groups.length) return "done";
      const g = groups[cur];
      if (!g.notes.some((n) => n.midi === midi)) { wrong.push(g.bar); return "wrong"; }
      pressed.add(midi);
      if (!g.notes.every((n) => pressed.has(n.midi))) return "held";
      cur++; pressed = new Set();
      return cur >= groups.length ? "done" : "advance";
    },
    get cursor() { return cur; },
    get done() { return cur >= groups.length; },
    groups,
    result: () => ({
      found: groups.slice(0, cur).reduce((n, g) => n + g.notes.length, 0),
      total: targets.length,
      wrong: wrong.length,
      wrongBars: [...new Set(wrong)].sort((a, b) => a - b),
    }),
  };
}
```

- [ ] **Step 4:** Run → `all green`; `npm test`; `npm run build`.
- [ ] **Step 5: Commit** — `feat(score): timed and wait-mode grading`.

---

### Task 3: Sight-reading drill generator

**Files:** Create `src/score/sightread.js`; modify `test/score.test.mjs`.

**Interfaces (produces):** `LEVELS` (array of 10 level configs, index 0 = level 1), `drillBpm(level)` (60 at level 1 rising to 72 at level 10, integer), `generateDrill(level, seed)` → ABC string obeying the ABC convention (header `X:1`, `M:`, `L:1/8`, `K:`; `%%staves {1 2}` + `V:1 clef=treble` / `V:2 clef=bass` whenever the level uses both hands; a one-voice drill uses `K:<key> clef=bass` for the left hand). Uses `mulberry32` from `src/ear.js`.

**The ladder (spec §3, binding):**

| Level | Hands | Range / key | Rhythms | Bars | Metre |
|---|---|---|---|---|---|
| 1 | RH | C4–G4, C major | quarters, halves | 2 | 4/4 |
| 2 | LH | C3–G3, C major | quarters, halves | 2 | 4/4 |
| 3 | RH and LH alternate by bar (the other voice rests) | both C positions | + wholes, skips of a 3rd | 2 | 4/4 |
| 4 | RH tune; LH one root (C, F or G) on each downbeat, held the bar | C major | quarters, halves | 2 | 4/4 |
| 5 | as 4 | RH C4–C5 | + eighth pairs | 2 | 4/4 |
| 6 | as 4 | as 5 | + dotted halves | 2 | 3/4 |
| 7 | as 4 | G major (F#), RH G4–D5, LH roots G, C, D | as 6 | 2 | 3/4 or 4/4 |
| 8 | as 4 | F major (Bb), RH F4–C5, LH roots F, Bb, C | + dotted quarter–eighth | 2 | 3/4 or 4/4 |
| 9 | LH root–fifth in quarters | C, G or F major | as 8 | 4 | 4/4 |
| 10 | as 9 | up to D or Bb major | + chromatic neighbour notes (a non-scale note a semitone from the scale note it resolves to next) | 4 | 4/4 |

Melodies move mostly by step (≥ 60% of RH intervals are a 2nd or a repeat), use skips up to a 3rd at levels 1–4 and up to a 5th above, and the right hand's last note is the tonic. Bars always fill exactly.

- [ ] **Step 1: Failing tests** — append:

```js
const { generateDrill, drillBpm, LEVELS } = await import("../src/score/sightread.js");
const SCALE = { C: [0, 2, 4, 5, 7, 9, 11], G: [7, 9, 11, 0, 2, 4, 6], F: [5, 7, 9, 10, 0, 2, 4], D: [2, 4, 6, 7, 9, 11, 1], Bb: [10, 0, 2, 3, 5, 7, 9] };
const TONIC = { C: 0, G: 7, F: 5, D: 2, Bb: 10 };
const drillCache = {};
const drills = (level, n = 150) => (drillCache[`${level}:${n}`] ??= Array.from({ length: n }, (_, seed) => { const abc = generateDrill(level, seed); return { seed, abc, s: parseScore(abc, abcjs) }; }));
const perBarFull = (s) => [..."RL"].every((h) => {
  const ns = s.notes.filter((x) => x.hand === h);
  if (!ns.length) return true;
  return ns.every((x) => Math.floor(x.beat / s.beatsPerBar + 1e-9) === Math.floor((x.beat + x.dur - 1e-6) / s.beatsPerBar));
});

test("sightread: 10 levels; tempo 60 rising to 72", () => {
  assert.equal(LEVELS.length, 10); assert.equal(drillBpm(1), 60); assert.equal(drillBpm(10), 72);
  for (let l = 2; l <= 10; l++) assert.ok(drillBpm(l) >= drillBpm(l - 1));
});
test("sightread: deterministic per seed, varied across seeds", () => {
  for (let l = 1; l <= 10; l++) {
    assert.equal(generateDrill(l, 7), generateDrill(l, 7));
    assert.ok(new Set(Array.from({ length: 40 }, (_, s) => generateDrill(l, s))).size >= 20, `level ${l} varies`);
  }
});
test("sightread: every drill parses, has the right bar count, no note crosses a barline, the melody ends on the tonic", () => {
  for (let l = 1; l <= 10; l++) for (const { s } of drills(l)) {
    assert.equal(s.bars.length, l >= 9 ? 4 : 2, `level ${l} bars`);
    assert.ok(perBarFull(s), `level ${l} barlines`);
    // levels 1-3: the last note of all (one hand, or the hands taking turns); 4+: the right hand's last note
    const mel = l >= 4 ? s.notes.filter((n) => n.hand === "R") : s.notes;
    assert.equal(((mel[mel.length - 1].midi % 12) + 12) % 12, TONIC[s.key], `level ${l} ends on tonic`);
  }
});
test("sightread: ranges, hands and keys per level", () => {
  for (const { s } of drills(1)) { assert.ok(s.notes.every((n) => n.hand === "R" && n.midi >= 60 && n.midi <= 67)); assert.equal(s.key, "C"); }
  for (const { s } of drills(2)) assert.ok(s.notes.every((n) => n.hand === "L" && n.midi >= 48 && n.midi <= 55));
  for (const { s } of drills(3)) {
    const beatsR = new Set(s.notes.filter((n) => n.hand === "R").map((n) => n.bar)), beatsL = new Set(s.notes.filter((n) => n.hand === "L").map((n) => n.bar));
    assert.ok(beatsR.size && beatsL.size && [...beatsR].every((b) => !beatsL.has(b)), "level 3 alternates by bar");
  }
  for (const l of [4, 5, 6, 7, 8]) for (const { s } of drills(l)) {
    const lh = s.notes.filter((n) => n.hand === "L");
    assert.ok(lh.length && lh.every((n) => n.beat % s.beatsPerBar === 0), `level ${l} LH on downbeats`);
  }
  for (const { s } of drills(6)) assert.deepEqual(s.meter, [3, 4]);
  for (const { s } of drills(7)) assert.equal(s.key, "G");
  for (const { s } of drills(8)) assert.equal(s.key, "F");
  for (const l of [1, 2, 3, 4, 5, 6, 7, 8, 9]) for (const { s } of drills(l)) {
    const sc = SCALE[s.key]; assert.ok(s.notes.every((n) => sc.includes(((n.midi % 12) + 12) % 12)), `level ${l} stays in key`);
  }
});
test("sightread: rhythm features appear where the ladder adds them", () => {
  const has = (l, pred) => drills(l).some(({ s }) => s.notes.some(pred));
  assert.ok(!has(4, (n) => n.hand === "R" && n.dur === 0.5), "no eighths before level 5");
  assert.ok(has(5, (n) => n.hand === "R" && n.dur === 0.5), "eighths at level 5");
  assert.ok(has(6, (n) => n.dur === 3), "dotted halves at level 6");
  assert.ok(has(8, (n) => n.dur === 1.5), "dotted quarters at level 8");
  assert.ok(drills(9).every(({ s }) => s.notes.filter((n) => n.hand === "L").every((n) => n.dur === 1)), "level 9 LH quarters");
  assert.ok(drills(10).some(({ s }) => s.notes.some((n) => !SCALE[s.key].includes(((n.midi % 12) + 12) % 12))), "level 10 accidentals");
});
test("sightread: melodies move mostly by step", () => {
  for (let l = 1; l <= 10; l++) for (const { s } of drills(l, 60)) {
    const top = s.notes.filter((n) => n.hand === (l === 2 ? "L" : "R"));
    const steps = top.slice(1).filter((n, i) => Math.abs(n.midi - top[i].midi) <= 2).length;
    assert.ok(top.length < 3 || steps / (top.length - 1) >= 0.6, `level ${l} stepwise`);
  }
});
```

- [ ] **Step 2:** Run → fails.
- [ ] **Step 3: Implement** `src/score/sightread.js` to the ladder and rules above: a small data table per level, a seeded walk over the key's scale degrees within the range (weighted toward steps, occasional skips within the level's limit, final note forced to the tonic by steering the last few steps), a rhythm picker that fills each bar exactly from the level's allowed durations, left-hand writer per level (rest bars for level 3; one held root per bar for 4–8 chosen from the key's I/IV/V; root–fifth quarters for 9–10), and an ABC writer (`L:1/8`; ABC note names with octave marks; rests `z`). Keep it one file, data-driven, readable. If a test's musical fact seems wrong, stop and report rather than editing the test.
- [ ] **Step 4:** Run → `all green` (the suite runs 150 seeds × 10 levels; keep it under ~10 s); `npm test`; `npm run build`.
- [ ] **Step 5: Commit** — `feat(score): leveled sight-reading drill generator`.

---

### Task 4: Metronome count-in and timeline; run store; saved state

**Files:** Modify `src/useMetronome.js`, `src/engine.js`, `src/storage.js`, `test/score.test.mjs`; create `src/score/runStore.js`, `src/score/useRun.js`.

**Interfaces (produces):**
- `useMetronome` → adds `start({ countIn = 0 } = {})` (existing callers pass nothing; behaviour unchanged) and `timeline()` → `{ t0, bpm, beatsPer }` where `t0` is the `performance.now()`-clock time of the first beat **after** the count-in (the first click when `countIn` is 0).
- `runStore` → `{ get, set(patch), reset(), subscribe(fn) → off }`; state `{ section: null | { from, to }, hands: "both", mode: "play" | "wait", run: { state: "idle" | "countin" | "running" | "done", statuses: null | string[], cursor: -1, result: null }, window: 0 }`.
- `useRun()` → the store's state via `useSyncExternalStore`.
- `SCHEMA_VERSION` = 7; `freshData()` gains `ladder: {}`, `sightLevel: {}`; `migrate()` defaults both to `{}` when missing or not objects.

- [ ] **Step 1: Failing tests** — append:

```js
const { migrate } = await import("../src/storage.js");
const { freshData, SCHEMA_VERSION } = await import("../src/engine.js");
test("schema 7: ladder and sightLevel default to {}", () => {
  assert.equal(SCHEMA_VERSION, 7);
  const f = freshData(); assert.deepEqual(f.ladder, {}); assert.deepEqual(f.sightLevel, {});
  const m = migrate({ version: 6, items: [], sessions: [], settings: {} });
  assert.deepEqual(m.ladder, {}); assert.deepEqual(m.sightLevel, {}); assert.equal(m.version, 7);
  const kept = migrate({ version: 7, items: [], sessions: [], settings: {}, ladder: { "pno-minuet": { A: 80 } }, sightLevel: { "pno-sight": 3 } });
  assert.deepEqual(kept.ladder, { "pno-minuet": { A: 80 } }); assert.deepEqual(kept.sightLevel, { "pno-sight": 3 });
});
```

(If `storage.js` can't be imported in node because of a browser global, move the assertion into whichever existing node test already imports `migrate` and report it.)

- [ ] **Step 2:** Run → fails.
- [ ] **Step 3: Implement.**
  - `engine.js`: `SCHEMA_VERSION = 7`; `freshData()` adds `ladder: {}, sightLevel: {}`.
  - `storage.js` `migrate()`: after the `progress` defaults add
    ```js
    // v6 -> v7: the score engine remembers tempo-ladder bpm per section and the sight-reading level.
    for (const k of ["ladder", "sightLevel"]) if (!s[k] || typeof s[k] !== "object") s[k] = {};
    ```
  - `src/score/runStore.js`: same shape as `src/midi/overlay.js` with the state above (`reset()` restores the initial state).
  - `src/score/useRun.js`: `export const useRun = () => useSyncExternalStore(runStore.subscribe, runStore.get);`
  - `useMetronome.js`: `start` takes `{ countIn = 0 } = {}`; record the AudioContext time of the first click (`nextNote.current` before scheduling) in a ref and compute the run's first beat as `first + countIn * 60 / bpmRef.current`; `timeline()` converts that AudioContext time to the performance clock: if `ac.current.getOutputTimestamp` exists, `const { contextTime, performanceTime } = ac.current.getOutputTimestamp(); t0 = performanceTime + (audioT − contextTime) * 1000`, else `t0 = performance.now() + (audioT − ac.current.currentTime) * 1000`. Return `{ t0, bpm: bpmRef.current, beatsPer: beatsRef.current }` (or `null` when not playing). Keep `toggle`'s call `start()` working.
- [ ] **Step 4:** Run → `all green`; `npm test`; `npm run build`; smoke the metronome in the browser (Space starts/stops as before).
- [ ] **Step 5: Commit** — `feat(score): metronome count-in and timeline; run store; schema 7`.

---

### Task 5: Starter content — Minuet, sight-reading lesson, scale snippet

**Files:** Modify `src/seed.js`, `src/lessons/piano.js`, `src/lessons/index.js`, `test/lessons.test.mjs`.

**Interfaces (produces):**
- Lesson fields: `score: { abc, bpm, target, sections: [{ name, from, to }] }`, `sightread: { defaultLevel }`, `snippet: abc`.
- `hasScore(lesson)` exported from `src/lessons/index.js` → `!!(lesson && (lesson.score || lesson.sightread))`.
- New library item `pno-minuet`.

- [ ] **Step 1: Content.**
  - `seed.js` LIBRARY (piano), after `pno-piece`:
    `{ id: "pno-minuet", inst: "piano", title: "Minuet in G (Petzold)", type: "song", diff: 3, min: 12, desc: "Bars 1–16 of the Minuet in G from the Anna Magdalena notebook — learn it a section at a time, hands separately, then with the click." }`
  - `lessons/piano.js`, lesson `pno-minuet`:
    - `summary`: "Bars 1–16 of the Minuet in G major (Christian Petzold, from the Anna Magdalena Bach notebook), with a simplified left hand. Two sections: A (bars 1–8) and B (9–16)."
    - `steps`: ["Pick section A. Wait mode, right hand only: find each note before you worry about time.", "Then the left hand alone, then both hands in wait mode.", "Switch to play-along with the click at 72. Each clean pass nudges the tempo up toward 100."]
    - `watch`: ["The F in bars 3 and 7 is F sharp — the key signature says so once, at the start."]
    - `score`:
      ```js
      {
        bpm: 72, target: 100,
        sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }],
        abc: `X:1
      T:Minuet in G
      C:Christian Petzold (arr. simplified)
      M:3/4
      L:1/8
      K:G
      %%staves {1 2}
      V:1 clef=treble
      V:2 clef=bass
      [V:1] d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 |
      [V:2] G,,6 | B,,6 | C,6 | B,,6 |
      [V:1] c2 dcBA | B2 cBAG | F2 GABG | A6 |
      [V:2] A,,6 | G,,6 | D,6 | D,6 |
      [V:1] d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 |
      [V:2] G,,6 | B,,6 | C,6 | B,,6 |
      [V:1] c2 dcBA | B2 cBAG | A2 BAGF | G6 |
      [V:2] A,,6 | G,,6 | D,6 | G,,6 |`,
      }
      ```
      (no leading indentation inside the template literal — ABC is line-sensitive).
  - `pno-sight` lesson: keep its `summary`/`steps`/`watch` short and replace the placeholder with drill guidance — summary "Short drills written fresh each time, at your level: read them once, with the click, and play." steps ["Look over the drill before the count-in: the key, the time signature, where the hands move.", "Keep going through mistakes — the click doesn't wait, and neither does real reading.", "Three clean drills in a row and the app offers the next level."], watch ["Reading ahead matters more than every note: eyes on the next beat, not the one you're playing."]; add `sightread: { defaultLevel: 1 }`; remove its `prescribe`/`bpm` if present.
  - `pno-scales` and `trk-pno-3` lessons: add
    ```js
    snippet: `X:1
    M:4/4
    L:1/8
    K:C
    %%staves {1 2}
    V:1 clef=treble
    V:2 clef=bass
    [V:1] CDEF GABc | cBAG FEDC |
    [V:2] C,D,E,F, G,A,B,C | CB,A,G, F,E,D,C, |`
    ```
    (no leading indentation inside the literal).
  - `lessons/index.js`: `export const hasScore = (lesson) => !!(lesson && (lesson.score || lesson.sightread));`
- [ ] **Step 2: Tests** — in `test/lessons.test.mjs` add (importing `abcjs` and `parseScore`):
  - the Minuet parses: 16 bars, key "G", meter [3,4]; section A covers bars 1–8 and B 9–16; every RH note's pitch class is in G major; bar 8's last RH note is A4 (69) and bar 16's is G4 (67).
  - the snippet parses to 2 bars with RH C4–C5 and LH C3–C4.
  - every lesson with `score`/`snippet` parses without throwing; `hasScore` is true for `pno-minuet` and `pno-sight`, false for `pno-hanon`.
  - existing lesson invariants still pass (extend the shape-schema check to allow the new fields if it rejects unknown keys).
- [ ] **Step 3:** `npm test`; `npm run build`.
- [ ] **Step 4: Commit** — `feat(score): Minuet in G, sight-reading lesson, scale snippet`.

---

### Task 6: The score stage, routing and snippets

**Files:** Create `src/score/ScoreStage.jsx`, `src/score/ScoreSnippet.jsx`; modify `src/App.jsx`, `src/Sidebar.jsx`, `src/LessonSheet.jsx`, `src/styles.css`.

**Interfaces:**
- Consumes: `parseScore`, `inSection`, `forHands` (Task 1); `runStore`, `useRun` (Task 4); `hasScore` (Task 5); `getLesson`.
- Produces: `ScoreStage({ item, lesson, abc })` default export (main pane; `abc` given for drills, else `lesson.score.abc`); `ScoreSnippet({ abc })` default export; App state `showScore` (bool); Sidebar prop `scoreOpen` and `onScore`.
- The stage publishes, via `runStore`, nothing but `section` (bar clicks) and `window` (the top system index); it reads `run.statuses`, `run.cursor`, `section`, `hands` to draw.

**Requirements (spec §1, §2, §4.6–4.8):**
- **Lazy abcjs:** `import("abcjs")` on mount (`mod.default ?? mod`); until loaded, three 200px `.ws-score-slab` skeletons.
- **Render:** `abcjs.renderAbc(container, abc, { oneSvgPerLine: true, add_classes: true, scale: 1.25, staffwidth: <measured>, foregroundColor: <resolved --text colour>, clickListener })`, one SVG per 4-bar source line. Stage width = min(main − 72, 1000) centred; `overflow: hidden`; the stage owns its height (it fills `.ws-desk-main` minus a 36px header "title · key · metre · bars x–y"). Measure the rendered SVG widths rather than computing from `staffwidth` (the abcjs scale quirk).
- **Window:** S = floor(stageHeight / 205) systems visible starting at `runStore.window`. During a run, when the cursor's system is the last visible one, advance `window` so that system becomes the top (replace-above; the current line itself never moves between frames except at that refill). Idle: ↑/↓ and PgUp/PgDn (handled via the shortcut bridge in Task 8 — here expose `window` in the store) and the wheel move by one system. The current system has a 2px `var(--gold-dim)` left marker.
- **Note ↔ element map:** walk the rendered tune (`tune.lines[l].staff[s].voices[v]` → elements with `el_type === "note"`, skipping bars, advancing a per-voice beat by `duration × 4`, rests advance time) and key each element by `hand` (voice index as in parseScore) + beat. A chord is one element: colour it by the worst status among its notes (missed/wrong > early/late > on).
- **Colours:** statuses from `runStore.run.statuses` (aligned with the targets the panel graded — the panel also stores the targets list in `run.targets`; add that field) → classes `ws-score-on` / `ws-score-off` (early/late) / `ws-score-miss`; the cursor target's element gets `ws-score-cur` (gold). Reduced motion: no transitions.
- **Sections:** notes outside `section` (and the other hand's notes when `hands` ≠ "both") get `ws-score-dim` (opacity .35). Clicking a note sets the section start to its bar (`clickListener` analysis → line × 4 + measure + 1); shift-click sets the end. `%%barnumbers 1` is injected into the header so bar numbers show.
- **Narrow windows (1024–1279px):** pass `wrap: { preferredMeasuresPerLine: 2, minSpacing: 1.8, maxSpacing: 2.7 }` (with `staffwidth`) so systems hold 2 bars; the window maths is per system either way.
- **Clocks:** use abcjs only to render and to map notes to elements — never `TimingCallbacks` or `CursorControl` (their own `setTimeout` clock).
- **Accessibility:** each system SVG gets `role="img"` and `aria-label="bars a–b"`; the stage root `tabIndex={-1}`.
- **ScoreSnippet:** lazy abcjs, `scale: 0.9`, static (no listeners), for `lesson.snippet`; rendered in `LessonBody` (desktop and phone) under the summary, even when the band hides the keyboard diagram.
- **App routing:** `isScored = desktop && lessonFor && hasScore(getLesson(lessonFor.id))`. Opening a scored item sets `showScore = true`; views 1–4 set `showScore = false`; closing the lesson clears both. Desktop main pane: `showScore && isScored ? <ScoreStage key={lessonFor.id} item={lessonFor} lesson={getLesson(lessonFor.id)} /> : views`. Sidebar gains a "Score" entry (icon ♪, `<kbd>5</kbd>`, `aria-current` when shown) only while `isScored`. The rail slot renders `ScorePanel` (Task 7) for scored items — in this task render a placeholder `LessonBody` as today so the stage can be verified alone.
- **Phone:** `LessonSheet` for a scored lesson shows the text lesson plus `<p className="ws-midi-connect-note">Open on the desktop to read the score.</p>`.
- **Browser verification** (dev, `?fakemidi`, 1440×900): open the Minuet from Library → 3 systems, header, "Score" in the sidebar; set section 9–12 by clicking notes → other bars dim; press 1 → Library shows, "Score" still listed, clicking it returns; the C-scale snippet shows in "Major scales" (rail) and on the phone lesson sheet; phone preset: the Minuet shows the fallback note; `npm run build` emits a separate abcjs chunk (check `dist/assets`). No console errors.
- **Commit** — `feat(score): the score stage, routing and snippets`.

---

### Task 7: The score panel — wait mode, play-along, tempo ladder, logging

**Files:** Create `src/score/ScorePanel.jsx`; modify `src/App.jsx` (rail routing + log fields), `src/midi/MidiBand.jsx` only if needed for the readout, `src/styles.css`.

**Interfaces:**
- Consumes: `parseScore`, `inSection`, `forHands`; `gradeTimed`; `createWaitRun`; `runStore`/`useRun`; `usePractice()` (`metro.start({ countIn })`, `metro.timeline()`, `metro.setBeatsPer`, `metro.setBpm`, `metro.stop`, `metro.playing`); `useMidi()` (`status`, `subscribe`); `overlay` (band targets/next/readout/busy); `toNoteEvent`.
- Produces: `ScorePanel({ item, lesson, ladder, onLadder(section, bpm), onResult(result), onRequestLog })`; the `woodshed:coach` window event starts/stops a run (C); App passes `data.ladder[item.id]` and persists `onLadder` into `data.ladder`.

**Requirements (spec §1.7, §1.10, §2, §4):**
- **Controls:** title; section presets (the score's named sections + "all") and from–to number inputs (typing guard; blur on Enter); hands [Both][RH][LH]; mode [Wait][Play-along]; tempo line "84 → 100 · last clean 80" (current metronome bpm → target); Start (label "● Start" / "■ Stop", `<kbd>C</kbd>` hint); a short "Notes" block with the lesson's steps. Changing section/hands/mode writes `runStore`. Opening a section restores its ladder bpm (`ladder[sectionKey]`, key = preset name or "from-to") via `metro.setBpm`; opening a scored item sets `metro.setBeatsPer(beatsPerBar)`.
- **No keyboard:** Start disabled with the band's connect note text ("Connect your keyboard to practise this." / "Keyboard disconnected…").
- **Targets:** `forHands(inSection(score.notes, from, to), hands)`; stored in `runStore.run.targets`.
- **Wait mode:** `createWaitRun(targets)`; subscribe MIDI; on each `on` message `press(midi)`; statuses for the stage: notes of passed groups "on", the current group's notes "pending" with `cursor` = the index of its first note; a "wrong" press sets a 300 ms flash (`run.flash = true`) that the stage shows as `ws-score-miss` on the current group's elements. Band: `overlay.set({ targets: currentGroup.notes.map(n => ({ midi: n.midi, finger: null })), range: null, statuses: null, next: currentGroup.notes.map((_, i) => i), readout: { head: "<note names>", line: "bar b · g of G" }, busy: true, hideTargets: false })`. Never touches the metronome. Done → summary "found N of N · W wrong presses (bars …)"; not logged as accuracy (Log it logs minutes only).
- **Play-along:** Start → `run.state = "countin"`; if the metronome is playing, stop it; `metro.start({ countIn: beatsPerBar })`; read `t0` from `metro.timeline()` right after starting (re-read on the next frame if null); subscribe MIDI collecting `toNoteEvent(msg)` for `on` messages; every animation frame compute `gradeTimed(targets, events, { t0, bpm, beatsPerBar, now: performance.now() })` and publish `statuses`/`cursor` to `runStore` (state `"running"` once `now ≥ t0`); band: `overlay.set({ targets: [], statuses: null, next: [], readout: { head: countIn ? "1 2 3" style count : "bar b", line: "pass p · bpm" }, busy: true })` — no hit/miss on the band. When `done`: unsubscribe, stop the metronome (the run started it), `run.state = "done"`, `run.result = result`; if `result.clean`, `onLadder(sectionKey, min(target, bpm + 4))` and set the metronome to it.
- **Stop/interrupts:** C or Stop ends a run early (summary of what was graded so far; unfinished targets count as missed); unplugging stops with "Keyboard disconnected."; unmount cleans up (unsubscribe, cancel the frame loop, stop the metronome if the run started it, `overlay.reset()` of the fields it set).
- **Summary (rail):** "Clean run" / "Solid" / "Keep at it" band as the coach does; `notes N% · rhythm R%`; `N extra notes` when any; "to revisit: bars 10, 12" as buttons that set the section to that bar; [↻ again] [↑ <next bpm>] (sets the tempo and restarts) [Log it →]. Colours persist on the stage until the next run.
- **Log it:** `onResult({ accuracy: notesPct, rhythm: rhythmPct, section: sectionKey, bpm, missed: revisitBars.map(b => `bar ${b}`) })` then `onRequestLog()`. In App, `recordCoachResult` stores these; `LogSheet`'s entry prefill carries `rhythm`/`section` and uses `bpm` for the tempo field; `commitLog` writes `rhythm: e.rhythm ?? null, section: e.section ?? null` on the session (alongside the existing `accuracy`, `coached`, `missed`).
- **Announcements:** the panel has a visually hidden `aria-live="polite"` region that announces the count-in start, section changes and the result line — never notes or bars at tempo.
- **App rail routing:** for a scored item the rail slot renders `<ScorePanel key={lessonFor.id} …/>` instead of `LessonBody` (desktop).
- **Browser verification** (dev `?fakemidi`, 1440×900; drive notes with `window.__fakeMidi.press/release` and timed `setTimeout` chains computed from `metro.timeline()` if you expose it for debugging only in the console, or from the count-in start): Minuet section A, RH, wait mode → next notes highlight on the staff and outline on the band; a wrong key flashes and doesn't advance; finish → summary. Play-along at 72: count-in, then play bar 1–8 RH on time except one late note and one wrong note → staff colours, summary notes/rhythm %, extras; a clean run → tempo 76, reopen section A → 76 restored; Log it → the log sheet shows accuracy and tempo and the saved session has `rhythm` and `section`. The window refills above during a both-sections run. No console errors.
- **Commit** — `feat(score): practise pieces — wait mode, play-along, tempo ladder, logging`.

---

### Task 8: Sight-reading and shortcuts

**Files:** Modify `src/score/ScorePanel.jsx`, `src/score/ScoreStage.jsx` (drill abc), `src/App.jsx` (sightLevel persistence), `src/shortcuts.js`, `src/useShortcuts.js`, `test/desktop.test.mjs`, `src/styles.css`.

**Interfaces:**
- Consumes: `generateDrill`, `drillBpm`, `LEVELS` (Task 3); ScorePanel/ScoreStage (Tasks 6–7).
- Produces: sight-reading mode in ScorePanel when `lesson.sightread`; App passes `sightLevel = data.sightLevel[item.id] ?? lesson.sightread.defaultLevel` and `onSightLevel(level)`; new actions from `actionFor`.

**Requirements:**
- **Sight-reading panel:** level picker (1–10, with each level's short name from `LESSONS`/`LEVELS`), **New drill** (`<kbd>N</kbd>`), Start (always play-along, count-in), tempo = `drillBpm(level)` on level change (the rail metronome can still change it). A drill = `generateDrill(level, seed)` with a fresh random seed; the stage renders it as one system (2-bar drills at half width). New drill replaces it in place. After **3 clean drills in a row** at the current level, the summary offers **"Level up →"** (sets the level; never automatic); a non-clean drill resets the streak. The level persists via `onSightLevel`.
- **Shortcuts** — in `actionFor` (after the existing keys; same guards): `w` → `{ type: "mode" }`, `h` → `{ type: "hands" }`, `n` → `{ type: "drill" }`, `[` → `{ type: "section", delta: -1 }`, `]` → `{ type: "section", delta: 1 }`, `5` → `{ type: "score" }`, `ArrowUp`/`ArrowDown` → `{ type: "scroll", delta: -1 | 1 }`. `KEY_HELP` gains ["W", "Score: wait mode / play-along"], ["H", "Score: hands — both / right / left"], ["N", "Sight-reading: new drill"], ["[ ]", "Score: previous / next section"], ["5", "Back to the open score"], ["↑ ↓", "Score: move the page"].
- **Bridge routing** (`useShortcuts.js`): "score" → App (`setShowScore(true)` when a scored item is open); "mode"/"hands"/"drill"/"section"/"scroll" → `window.dispatchEvent(new CustomEvent("woodshed:score", { detail: action }))`, consumed by ScorePanel (mode/hands/drill/section) and ScoreStage (scroll, only when idle). **During a play-along run** (`runStore.get().run.state` is `countin` or `running`): Space dispatches the `coach` action (stop the run) instead of toggling the metronome; ←/→ are ignored; Esc stops the run (dispatch `coach`) instead of closing — a second Esc closes as today.
- **Tests** (`test/desktop.test.mjs`): each new key maps to its action; guards (typing, dialog, modifiers, repeat) apply; `KEY_HELP.length` updated to 17.
- **Browser verification:** Sight-reading lesson → level 1 drill (2 bars, treble only); play it clean 3 times → "Level up →"; level 7 drill shows the G-major key signature; N gives a new drill; W/H/[/]/5/↑/↓ act on the Minuet; during a play-along run Space stops the run and ←/→ don't change the tempo; Esc stops then closes. No console errors.
- **Commit** — `feat(score): sight-reading drills and score shortcuts`.

---

### Task 9: Docs

**Files:** Modify `README.md`, `docs/DIRECTION.md`.
- README: a "Reading music" subsection under the piano-over-MIDI section: pieces open as a grand staff in the middle; sections (presets, clicking bars), hands, wait mode vs play-along (notes and rhythm against the click, count-in), the tempo ladder, the summary and logging; sight-reading drills (10 levels, level up after 3 clean in a row); new shortcuts (W H N [ ] 5 ↑↓, and Space/Esc during a run); the Minuet as the first piece; desktop and piano only. Add the `src/score/` files to the file table (one line each). Keep the README's voice.
- DIRECTION.md: under "Order of work" step 5, note that the notation engine (project 1) is done and piano content (project 2) is next; list "Hear this section" and "the app plays the other hand" as parked until the metronome and synth share one AudioContext.
- Commit — `docs: reading music — notation, pieces and sight-reading`.

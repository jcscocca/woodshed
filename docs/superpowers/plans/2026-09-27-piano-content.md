# Piano Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 22 scored piano track stages (Pieces, Pop from chords, Two-hand technique) plus a "Your song" chord chart, on top of the notation engine.

**Architecture:** A pure chord-chart generator (`chords.js` → `patterns.js` → `chartToAbc.js`) writes chords + a named accompaniment pattern out as two-voice ABC, and a small resolver (`scoreFor`) hands every scored lesson's ABC to the existing stage and panel, which stay otherwise unchanged. Pieces are transcribed into ABC from public-domain editions and checked against note fixtures derived from reference MIDI. Schema 8 adds `songs` and `targetClean`, and a one-time migration re-homes kept items and retires placeholders.

**Tech Stack:** React 18 + Vite 5, abcjs 6.7.1, plain `node` test scripts (`node:assert/strict`), localStorage.

**Spec:** `docs/superpowers/specs/2026-09-27-piano-content-design.md` (and its parent, `docs/superpowers/specs/2026-09-26-notation-pieces-design.md`, whose *ABC authoring conventions* bind every score).

## Global Constraints

- Every score obeys the notation spec's *ABC authoring conventions*: voice 1 = right hand, voice 2 = left hand, one voice per staff (`%%staves {1 2}`, `V:1 clef=treble`, `V:2 clef=bass`); one 4-bar system per source line; repeats written out or dropped; the first bar is full (pad pickups with rests); 2/4, 3/4 or 4/4 set once in the header; `bpm`/`target` are quarter-note beats; a `score` needs `abc`, `bpm`, `target ≥ bpm`, `sections` inside the piece; a scored lesson carries no `shape`.
- Plain repeat signs are dropped (each section once; the lesson text says the original repeats); D.C./D.S. returns are written out.
- No copyrighted melody or lyric is stored anywhere; pop songs are named by title only as examples of a progression.
- Chord grading is exact — the generated pattern is the target, note for note.
- Reference files (LilyPond, MIDI, PDF) are downloaded to scratch space outside the repo and never committed or shipped; only derived fixtures (`test/fixtures/pieces/<id>.json`) are committed.
- Piano + desktop only; nothing touches guitar code paths. App never subscribes to `runStore`.
- Lesson text per stage: a summary, 3–4 steps, 1–2 watch points, named sections, a start `bpm` ≈ 60–70% of `target`. Match the existing lessons' voice (plain, second person, short sentences).
- Match the surrounding code's idiom and low comment density; smallest diff; no refactors of unrelated code.
- `npm test` and `npm run build` pass after every task.

---

### Task 1: Chord symbols

**Files:**
- Create: `src/score/chords.js`, `test/charts.test.mjs`
- Modify: `package.json` (add `test:charts`, chain it into `test`)

**Interfaces:**
- Produces: `parseChord(token) → { name, quality, root, tones: [{ letter, acc, pc }], bass: { letter, acc, pc } | null } | null`; `parseChordLine(line, beatsPerBar) → { bars: [[{ chord, beats }]] } | { error: { bar, token?, message } }`; `above(note, semis, steps) → { letter, acc, pc }`. `acc` is −2…2 (flats negative), `pc` 0–11.

- [ ] **Step 1: Write the failing tests** — create `test/charts.test.mjs`:

```js
import assert from "node:assert/strict";
const { parseChord, parseChordLine } = await import("../src/score/chords.js");

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };
const spelled = (c) => c.tones.map((t) => t.letter + (t.acc > 0 ? "#".repeat(t.acc) : "b".repeat(-t.acc))).join(" ");

test("parseChord spells every quality from its root's letter", () => {
  assert.equal(spelled(parseChord("C")), "C E G");
  assert.equal(spelled(parseChord("Am")), "A C E");
  assert.equal(spelled(parseChord("F#m")), "F# A C#");
  assert.equal(spelled(parseChord("Bb")), "Bb D F");
  assert.equal(spelled(parseChord("C7")), "C E G Bb");
  assert.equal(spelled(parseChord("Fmaj7")), "F A C E");
  assert.equal(spelled(parseChord("Dm7")), "D F A C");
  assert.equal(spelled(parseChord("Gsus4")), "G C D");
  assert.equal(spelled(parseChord("Dsus2")), "D E A");
  assert.equal(spelled(parseChord("Bdim")), "B D F");
  assert.equal(spelled(parseChord("Ebdim")), "Eb Gb Bbb");
  const s = parseChord("C/E");
  assert.equal(s.bass.letter, "E"); assert.equal(s.bass.pc, 4); assert.equal(s.name, "C/E");
  for (const t of ["H", "Cm9", "c", "C/H", ""]) assert.equal(parseChord(t), null, t);
});

test("parseChordLine splits bars, halves 4/4 bars, and names the bad bar", () => {
  const r = parseChordLine("C | G | Am F | G7", 4);
  assert.equal(r.bars.length, 4);
  assert.deepEqual(r.bars[2].map((x) => [x.chord.name, x.beats]), [["Am", 2], ["F", 2]]);
  assert.deepEqual(r.bars[0].map((x) => x.beats), [4]);
  assert.equal(parseChordLine("| C | G |", 4).bars.length, 2);
  assert.equal(parseChordLine("C | G", 3).bars[1][0].beats, 3);
  const bad = parseChordLine("C | Hm | G", 4).error;
  assert.equal(bad.bar, 2); assert.equal(bad.token, "Hm");
  assert.equal(bad.message, "bar 2: 'Hm' isn't a chord I know");
  assert.equal(parseChordLine("C | | G", 4).error.message, "bar 2 is empty");
  assert.equal(parseChordLine("C G | F", 3).error.message, "bar 1: one chord a bar in 3/4");
  assert.equal(parseChordLine("C G F", 4).error.message, "bar 1: up to two chords a bar in 4/4");
  assert.ok(parseChordLine("   ", 4).error);
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });
```

Add to `package.json` scripts: `"test:charts": "node test/charts.test.mjs"`, and append ` && npm run test:charts` to `"test"`.

- [ ] **Step 2: Run to verify it fails** — `node test/charts.test.mjs` → fails (module not found).

- [ ] **Step 3: Implement** — create `src/score/chords.js`:

```js
// Chord symbols, pure: "Am7", "F#m", "C/E" -> spelled chord tones (root first) and a bass.
const LETTERS = "CDEFGAB";
const NAT = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
// [semitones, letter steps] above the root
const SHAPES = {
  "": [[0, 0], [4, 2], [7, 4]], m: [[0, 0], [3, 2], [7, 4]], dim: [[0, 0], [3, 2], [6, 4]],
  sus2: [[0, 0], [2, 1], [7, 4]], sus4: [[0, 0], [5, 3], [7, 4]],
  7: [[0, 0], [4, 2], [7, 4], [10, 6]], maj7: [[0, 0], [4, 2], [7, 4], [11, 6]], m7: [[0, 0], [3, 2], [7, 4], [10, 6]],
};
const RE = /^([A-G])([#b]?)(maj7|m7|sus2|sus4|dim|m|7)?(?:\/([A-G])([#b]?))?$/;
const accOf = (s) => (s === "#" ? 1 : s === "b" ? -1 : 0);
const pcOf = (letter, acc) => (((NAT[letter] + acc) % 12) + 12) % 12;
const note = (letter, acc) => ({ letter, acc, pc: pcOf(letter, acc) });

// The note `steps` letters and `semis` semitones above a spelled note (B♭ above F, never A♯).
export function above(root, semis, steps) {
  const letter = LETTERS[(LETTERS.indexOf(root.letter) + steps) % 7];
  const pc = (root.pc + semis) % 12;
  let acc = pc - NAT[letter];
  if (acc > 6) acc -= 12;
  if (acc < -6) acc += 12;
  return { letter, acc, pc };
}

export function parseChord(token) {
  const m = RE.exec(token);
  if (!m) return null;
  const root = note(m[1], accOf(m[2])), quality = m[3] || "";
  return {
    name: token, quality, root,
    tones: SHAPES[quality].map(([semis, steps]) => above(root, semis, steps)),
    bass: m[4] ? note(m[4], accOf(m[5])) : null,
  };
}

// "C | G | Am F | G7" -> bars of { chord, beats }; one chord a bar, or two (half a bar each) in 4/4.
export function parseChordLine(line, beatsPerBar) {
  const cells = line.split("|").map((c) => c.trim());
  while (cells.length && !cells[cells.length - 1]) cells.pop();
  while (cells.length && !cells[0]) cells.shift();
  if (!cells.length) return { error: { bar: 1, message: "Type some chords, with bars split by |" } };
  const most = beatsPerBar === 4 ? 2 : 1, bars = [];
  for (let i = 0; i < cells.length; i++) {
    const n = i + 1, tokens = cells[i].split(/\s+/).filter(Boolean);
    if (!tokens.length) return { error: { bar: n, message: `bar ${n} is empty` } };
    if (tokens.length > most) return { error: { bar: n, message: `bar ${n}: ${most === 1 ? "one chord a bar" : "up to two chords a bar"} in ${beatsPerBar}/4` } };
    const bar = [];
    for (const t of tokens) {
      const chord = parseChord(t);
      if (!chord) return { error: { bar: n, token: t, message: `bar ${n}: '${t}' isn't a chord I know` } };
      bar.push({ chord, beats: beatsPerBar / tokens.length });
    }
    bars.push(bar);
  }
  return { bars };
}
```

- [ ] **Step 4: Run** — `node test/charts.test.mjs` → all green; `npm test` → all green.
- [ ] **Step 5: Commit** — `git add src/score/chords.js test/charts.test.mjs package.json && git commit -m "feat(charts): chord symbols — parse, spell and split into bars"`

---

### Task 2: Patterns and `chartToAbc`

**Files:**
- Create: `src/score/patterns.js`, `src/score/chartToAbc.js`
- Test: `test/charts.test.mjs` (append before the `process.on("exit")` line)

**Interfaces:**
- Consumes: `parseChordLine`, `above` (Task 1); `parseScore(abc, abcjs)` from `src/score/scoreModel.js`.
- Produces: `PATTERNS` — `{ [name]: { name, metres: [3|4], rootPosition?, rh(e), lh(e), leadLh?(e) } }` for `block`, `voiceled`, `ballad`, `pulse`, `arpeggio`, `boogie`, `waltz`; `closeVoicings(tones, lo, hi)`; `pickVoicing(cands, prev, { rootPosition, anchor })`; `keySignature(key)`; `chartToAbc({ key, meter, chords, pattern, melody?, title? }) → string` (throws `Error` on an unknown pattern, a pattern that doesn't fit the metre, a chord-line error, or a melody whose line count ≠ ceil(bars / 4)).

- [ ] **Step 1: Write the failing tests** — append to `test/charts.test.mjs` (add `import abcjs from "abcjs";` at the top and the imports shown):

```js
const { parseScore } = await import("../src/score/scoreModel.js");
const { PATTERNS } = await import("../src/score/patterns.js");
const { chartToAbc } = await import("../src/score/chartToAbc.js");
const rhByBar = (abc) => { const s = parseScore(abc, abcjs), out = {}; for (const n of s.notes) if (n.hand === "R") (out[n.bar] ??= []).push(n.midi); return out; };

test("every pattern writes only chord tones, in range, in every key", () => {
  for (const [name, p] of Object.entries(PATTERNS)) for (const m of p.metres) for (const key of ["C", "F", "G", "Bb", "Am", "Em", "Dm", "E"]) {
    const chords = m === 4 ? "C | G7 | Am F | Dm7 G | E7 C | Bb/D | Fmaj7 | Csus4 C" : "C | G7 | Am | F | E7 | Bb | Fmaj7 | Csus2";
    const bars = chords.split("|").map((b) => b.trim().split(/\s+/));
    const s = parseScore(chartToAbc({ key, meter: `${m}/4`, chords, pattern: name }), abcjs);
    assert.equal(s.bars.length, 8, `${name} ${m}/4 ${key}`);
    for (const n of s.notes) {
      const i = n.bar - 1, half = bars[i].length === 2 && n.beat - i * m >= 2 ? 1 : 0, c = parseChord(bars[i][half]);
      const pcs = new Set([...c.tones.map((t) => t.pc), ...(c.bass ? [c.bass.pc] : []), ...(name === "boogie" ? [(c.root.pc + 9) % 12] : [])]);
      assert.ok(pcs.has(n.midi % 12), `${name} ${key} bar ${n.bar}: ${n.midi} not in ${bars[i][half]}`);
      if (n.hand === "R") assert.ok(n.midi >= 55 && n.midi <= 79, `${name} RH ${n.midi}`);
      else assert.ok(n.midi >= 36 && n.midi <= 60, `${name} LH ${n.midi}`);
    }
  }
});

test("voiceled moves to the closest inversion; block stays in root position", () => {
  assert.deepEqual(Object.values(rhByBar(chartToAbc({ key: "C", chords: "C | G | Am | F", pattern: "voiceled" }))), [[60, 64, 67], [59, 62, 67], [60, 64, 69], [60, 65, 69]]);
  assert.deepEqual(Object.values(rhByBar(chartToAbc({ key: "C", chords: "C | G | Am | F", pattern: "block" }))), [[60, 64, 67], [55, 59, 62], [57, 60, 64], [65, 69, 72]]);
});

test("spelling follows the key, and an accidental carries to the bar line", () => {
  assert.ok(chartToAbc({ key: "F", chords: "Bb", pattern: "block" }).includes("[B,DF]"));
  assert.ok(chartToAbc({ key: "Eb", chords: "Ab", pattern: "block" }).includes("[A,CE]"));
  const abc = chartToAbc({ key: "Am", chords: "E7 C | Am", pattern: "voiceled" });
  assert.ok(abc.includes("^G") && abc.includes("=G"), abc);
  const bar1 = parseScore(abc, abcjs).notes.filter((n) => n.hand === "R" && n.bar === 1);
  assert.deepEqual(bar1.filter((n) => n.beat === 0).map((n) => n.midi), [59, 62, 68]);
  assert.deepEqual(bar1.filter((n) => n.beat === 2).map((n) => n.midi), [60, 64, 67]);
});

test("slash chords put the named bass in the left hand; symbols ride the right hand", () => {
  const abc = chartToAbc({ key: "C", chords: "C/E | Am", pattern: "block" });
  assert.equal(parseScore(abc, abcjs).notes.find((n) => n.hand === "L").midi, 40);
  assert.ok(/\[V:1\] "C\/E"/.test(abc) && abc.includes('"Am"'));
});

test("a lead sheet keeps its melody, puts symbols on the left hand, and must match the chords", () => {
  const melody = "E2E2F2G2 | G2F2E2D2 | C2C2D2E2 | E3D D4 |]";
  const abc = chartToAbc({ key: "C", chords: "C | G | C | G", pattern: "ballad", melody });
  const s = parseScore(abc, abcjs);
  assert.deepEqual(s.notes.filter((n) => n.hand === "R").map((n) => n.midi), [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62]);
  assert.ok(/\[V:2\] "C"/.test(abc));
  assert.throws(() => chartToAbc({ key: "C", chords: "C | G | C | G | C", pattern: "ballad", melody }), /melody has 1 lines for 5 bars/);
  const waltz = chartToAbc({ key: "G", meter: "3/4", chords: "G | D", pattern: "waltz", melody: "z4D2 | d6 |]" });
  assert.deepEqual(parseScore(waltz, abcjs).notes.filter((n) => n.hand === "L" && n.bar === 1).map((n) => [n.beat, n.midi]), [[0, 43], [1, 47], [1, 50], [1, 55], [2, 47], [2, 50], [2, 55]]);
});

test("patterns refuse a metre they don't fit", () => {
  assert.throws(() => chartToAbc({ key: "C", meter: "3/4", chords: "C", pattern: "ballad" }), /doesn't fit 3\/4/);
  assert.throws(() => chartToAbc({ key: "C", meter: "4/4", chords: "C", pattern: "waltz" }), /doesn't fit 4\/4/);
  assert.throws(() => chartToAbc({ key: "C", chords: "C", pattern: "polka" }), /unknown pattern/);
  assert.throws(() => chartToAbc({ key: "C", chords: "C | Hm", pattern: "block" }), /'Hm' isn't a chord I know/);
});
```

- [ ] **Step 2: Run** — `node test/charts.test.mjs` → the new tests fail (modules missing).

- [ ] **Step 3: Implement** — create `src/score/patterns.js`:

```js
// Accompaniment patterns, pure. A figure is a list of [slot, eighths] for one chord's
// span (e = 8 for a 4/4 bar, 4 for half of one, 6 for a 3/4 bar). Slots: "chord" (the
// right-hand voicing), 0/1/2 (one of its notes), "root"/"fifth"/"octave"/"sixth" (left
// hand), "lhchord" (a close left-hand triad), "rest".
const cycle = (seq, e) => Array.from({ length: e }, (_, i) => [seq[i % seq.length], 1]);

export const PATTERNS = {
  block: { name: "Block chords", metres: [3, 4], rootPosition: true, rh: (e) => [["chord", e]], lh: (e) => [["root", e]] },
  voiceled: { name: "Voice-led chords", metres: [3, 4], rh: (e) => [["chord", e]], lh: (e) => [["root", e]] },
  ballad: { name: "Pop ballad", metres: [4], rh: (e) => [["chord", e]], lh: (e) => cycle(["root", "fifth", "octave", "fifth"], e) },
  pulse: { name: "Pulse", metres: [4], rh: (e) => (e === 8 ? [["chord", 2], ["rest", 1], ["chord", 3], ["chord", 2]] : [["chord", 2], ["rest", 1], ["chord", 1]]), lh: (e) => [["root", e]] },
  arpeggio: { name: "Arpeggio", metres: [3, 4], rh: (e) => cycle([0, 1, 2, 1], e), lh: (e) => [["root", e]] },
  boogie: { name: "Boogie", metres: [4], rh: (e) => [["chord", e]], lh: (e) => cycle(["root", "fifth", "sixth", "fifth"], e) },
  waltz: { name: "Waltz", metres: [3], rh: () => [["rest", 2], ["chord", 2], ["chord", 2]], lh: (e) => [["root", e]], leadLh: () => [["root", 2], ["lhchord", 2], ["lhchord", 2]] },
};

// Every close-position voicing of `tones` (spelled, with pc) whose notes lie in lo..hi.
// r is the rotation: 0 = the first tone at the bottom.
export function closeVoicings(tones, lo, hi) {
  const out = [];
  tones.forEach((_, r) => {
    const order = [...tones.slice(r), ...tones.slice(0, r)];
    for (let m = lo; m <= hi; m++) {
      if (m % 12 !== order[0].pc) continue;
      const midis = [m];
      for (const t of order.slice(1)) { let x = midis[midis.length - 1] + 1; while (x % 12 !== t.pc) x++; midis.push(x); }
      if (midis[midis.length - 1] <= hi) out.push({ r, notes: order.map((t, i) => ({ ...t, midi: midis[i] })) });
    }
  });
  return out;
}

const low = (v) => v.notes[0].midi;
const moved = (a, b) => a.notes.reduce((s, n, i) => s + Math.abs(n.midi - b.notes[i].midi), 0);

// The voicing that moves least from `prev` (ties to the lower); with no prev, or in root
// position, the one whose lowest note is nearest `anchor`.
export function pickVoicing(cands, prev, { rootPosition = false, anchor = 60 } = {}) {
  const pool = rootPosition ? cands.filter((c) => c.r === 0) : cands;
  const cost = (c) => (prev && !rootPosition ? moved(c, prev) : Math.abs(low(c) - anchor));
  return pool.reduce((best, c) => (cost(c) < cost(best) || (cost(c) === cost(best) && low(c) < low(best)) ? c : best));
}
```

Create `src/score/chartToAbc.js`:

```js
// A chord chart written out as two-voice ABC, pure: chords + a pattern (and, for a lead
// sheet, a melody in place of the right hand) -> a score the engine grades like any other.
import { parseChordLine, above } from "./chords.js";
import { PATTERNS, closeVoicings, pickVoicing } from "./patterns.js";

const NAT = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const ORDER = { 1: "FCGDAEB", "-1": "BEADGCF" };
const FIFTHS = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, "F#": 6, "C#": 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7 };
const RELATIVE = { Am: "C", Em: "G", Bm: "D", "F#m": "A", "C#m": "E", "G#m": "B", Dm: "F", Gm: "Bb", Cm: "Eb", Fm: "Ab", Bbm: "Db", Ebm: "Gb" };
const ACC = { "-2": "__", "-1": "_", 0: "=", 1: "^", 2: "^^" };

// letter -> +1 / -1 for the key's sharps or flats
export function keySignature(key) {
  const n = FIFTHS[RELATIVE[key] || key];
  if (n === undefined) throw new Error(`unknown key: ${key}`);
  const sig = {};
  for (let i = 0; i < Math.abs(n); i++) sig[ORDER[Math.sign(n)][i]] = Math.sign(n);
  return sig;
}

// One pitch in ABC. An accidental is written when the key signature would give another
// pitch, and for every later note of that letter in the bar once one has been written.
function pitch(n, sig, bar) {
  const explicit = n.acc !== (sig[n.letter] || 0) || bar.has(n.letter);
  if (explicit) bar.add(n.letter);
  const oct = (n.midi - NAT[n.letter] - n.acc) / 12 - 1;
  const name = oct >= 5 ? n.letter.toLowerCase() + "'".repeat(oct - 5) : n.letter + ",".repeat(4 - oct);
  return (explicit ? ACC[n.acc] : "") + name;
}

const dur = (e) => (e === 1 ? "" : String(e));

function token(slot, e, v) {
  if (slot === "rest") return `z${dur(e)}`;
  const notes = slot === "chord" ? v.rh.notes : slot === "lhchord" ? v.lhChord.notes : typeof slot === "number" ? [v.rh.notes[slot]] : [v.lh[slot]];
  const text = notes.map((n) => pitch(n, v.sig, v.bar)).join("");
  return (notes.length > 1 ? `[${text}]` : text) + dur(e);
}

// Left-hand single notes: the root (or slash bass) between C2 and B2, and the chord's
// fifth, the octave and the root's sixth above it.
function lhNotes(chord) {
  const b = chord.bass || chord.root, root = { ...b, midi: 36 + b.pc };
  const up = (t) => { let m = root.midi + 1; while (m % 12 !== t.pc) m++; return { ...t, midi: m }; };
  return { root, fifth: up(chord.tones[2]), octave: { ...b, midi: root.midi + 12 }, sixth: up(above(chord.root, 9, 5)) };
}

// eighths joined into beats, a space at each beat and around longer notes
function join(tokens) {
  let pos = 0, s = "";
  for (const t of tokens) { if (s && (pos % 2 === 0 || t.len > 1)) s += " "; s += t.text; pos += t.len; }
  return s;
}

export function chartToAbc({ key, meter = "4/4", chords, pattern, melody, title }) {
  const beats = Number(meter.split("/")[0]), p = PATTERNS[pattern];
  if (!p) throw new Error(`unknown pattern: ${pattern}`);
  if (!p.metres.includes(beats)) throw new Error(`${pattern} doesn't fit ${meter}`);
  const parsed = parseChordLine(chords, beats);
  if (parsed.error) throw new Error(parsed.error.message);
  const sig = keySignature(key), lead = !!melody, symbols = lead ? "lh" : "rh";
  const bars = { rh: [], lh: [] };
  let prevRh = null, prevLh = null;
  for (const bar of parsed.bars) {
    const out = { rh: [], lh: [] }, mem = { rh: new Set(), lh: new Set() };
    for (const { chord, beats: b } of bar) {
      const e = b * 2;
      prevRh = pickVoicing(closeVoicings(chord.tones.length > 3 ? chord.tones.slice(1) : chord.tones, 55, 79), prevRh, { rootPosition: !!p.rootPosition });
      prevLh = pickVoicing(closeVoicings(chord.tones.slice(0, 3), 43, 60), prevLh, { anchor: 48 });
      const parts = { rh: lead ? [] : p.rh(e), lh: (lead && p.leadLh ? p.leadLh : p.lh)(e) };
      for (const v of ["rh", "lh"]) parts[v].forEach(([slot, len], i) => {
        const text = token(slot, len, { rh: prevRh, lhChord: prevLh, lh: lhNotes(chord), sig, bar: mem[v] });
        out[v].push({ text: (i === 0 && v === symbols ? `"${chord.name}"` : "") + text, len });
      });
    }
    bars.rh.push(join(out.rh));
    bars.lh.push(join(out.lh));
  }
  const tune = lead ? melody.trim().split("\n").map((l) => l.trim()) : null;
  if (lead && tune.length !== Math.ceil(bars.lh.length / 4)) throw new Error(`the melody has ${tune.length} lines for ${bars.lh.length} bars of chords`);
  const lines = [];
  for (let i = 0; i < bars.lh.length; i += 4) {
    const end = i + 4 >= bars.lh.length ? " |]" : " |";
    lines.push(`[V:1] ${lead ? tune[i / 4] : bars.rh.slice(i, i + 4).join(" | ") + end}`, `[V:2] ${bars.lh.slice(i, i + 4).join(" | ")}${end}`);
  }
  return ["X:1", ...(title ? [`T:${title}`] : []), `M:${meter}`, "L:1/8", `K:${key}`, "%%staves {1 2}", "V:1 clef=treble", "V:2 clef=bass", ...lines].join("\n");
}
```

(This code was run by the plan author against `parseScore` over all 7 patterns × 8 keys with 7th, slash, sus and dim chords: every note a chord tone, every note in range, 8 bars each.)

- [ ] **Step 4: Run** — `node test/charts.test.mjs` → all green; `npm test` → all green.
- [ ] **Step 5: Commit** — `git add src/score/patterns.js src/score/chartToAbc.js test/charts.test.mjs && git commit -m "feat(charts): accompaniment patterns written out as ABC"`

---

### Task 3: Charts play on the stage; the first pop stage

**Files:**
- Create: `src/score/scoreFor.js`
- Modify: `src/score/runStore.js`, `src/score/ScorePanel.jsx`, `src/score/ScoreStage.jsx`, `src/lessons/index.js`, `src/lessons/piano.js`, `src/seed.js`, `test/lessons.test.mjs`, `test/score.test.mjs` (only if it references `drill` in runStore), `README.md` file table (one line for each new `src/score/` file from Tasks 1–3)

**Interfaces:**
- Consumes: `chartToAbc` (Task 2).
- Produces: `scoreFor(lesson) → { abc, bpm, target, sections, ...chart }` (memoised per lesson object; `{ abc: null, bpm: null, target: null, sections: [] }` for panel-driven lessons); `hasScore` true for `score | chart | sightread | song`; runStore field **`abc`** (renamed from `drill`): the panel-supplied ABC — a sight-reading drill now, Your song in Task 5; track `trk-pno-pop` ("Pop from chords") with stage `pop-four-chords`.

- [ ] **Step 1: Failing tests** — in `test/lessons.test.mjs`:
  - import `scoreFor`: `const { scoreFor } = await import("../src/score/scoreFor.js");`
  - schema test: change the "needs a shape…" assertion to `assert.ok(L.shape || L.prescribe || L.score || L.chart || L.sightread || L.song, …)`.
  - lint test: `for (const abc of [(L.score || L.chart) && scoreFor(L).abc, L.snippet].filter(Boolean))`.
  - shape/sections test: `if (L.score || L.chart || L.sightread || L.song) assert.ok(!L.shape, …)`; replace `if (!L.score) continue; const { abc, bpm, target, sections } = L.score` with `if (!L.score && !L.chart) continue; const { abc, bpm, target, sections } = scoreFor(L)`.
  - hasScore test: add `assert.equal(hasScore(LESSONS["pop-four-chords"]), true);`
  - new test:

```js
test("a chart lesson writes out to a two-hand score with its chord symbols", () => {
  const S = scoreFor(LESSONS["pop-four-chords"]), s = parseScore(S.abc, abcjs);
  assert.equal(s.bars.length, 8);
  assert.ok(S.abc.includes('"Am"'));
  assert.ok(s.notes.some((n) => n.hand === "L") && s.notes.some((n) => n.hand === "R"));
  assert.equal(scoreFor(LESSONS["pop-four-chords"]), S);
});
```
  Run `node test/lessons.test.mjs` → fails.

- [ ] **Step 2: Implement `scoreFor`** — `src/score/scoreFor.js`:

```js
import { chartToAbc } from "./chartToAbc.js";

// What a scored lesson plays: its ABC and practice settings (bpm, target, sections). A
// sight-reading drill or Your song gets its ABC from the panel instead (runStore.abc).
const written = new WeakMap();
export function scoreFor(lesson) {
  if (lesson.score) return lesson.score;
  if (lesson.chart) {
    if (!written.has(lesson)) written.set(lesson, { ...lesson.chart, abc: chartToAbc(lesson.chart) });
    return written.get(lesson);
  }
  return { abc: null, bpm: null, target: null, sections: [] };
}
```

`src/lessons/index.js`: `export const hasScore = (lesson) => !!(lesson && (lesson.score || lesson.chart || lesson.sightread || lesson.song));`

- [ ] **Step 3: Rename `drill` → `abc` in runStore** — `src/score/runStore.js` initial state: replace `drill: null` with `abc: null` and its comment with `// the panel-supplied ABC: a sight-reading drill or Your song`. In `ScorePanel.jsx` replace every `st.drill` / `runStore.get().drill` / `runStore.set({ drill: … })` with `abc`. In `ScoreStage.jsx` replace `st.drill` with `st.abc`. `grep -rn "drill:" src test` must show no runStore `drill` left (the sight-reading `drill` action type and `generateDrill` stay).

- [ ] **Step 4: Panel and stage read `scoreFor`** —
  - `ScorePanel.jsx`: `import { scoreFor } from "./scoreFor.js";` and replace `const spec = lesson.score || {};` with `const spec = scoreFor(lesson);`. `src` stays `sight ? st.abc : spec.abc`.
  - `ScoreStage.jsx`: `import { scoreFor } from "./scoreFor.js";`, and replace the source line with:

```js
  const drill = !!lesson.sightread, fromPanel = drill || !!lesson.song;
  const src = abc || (fromPanel ? st.abc : scoreFor(lesson).abc);
```

- [ ] **Step 5: The first pop stage** — `src/seed.js` `TRACKS`, after `trk-pno-hands`:

```js
  {
    id: "trk-pno-pop", inst: "piano", name: "Pop from chords",
    blurb: "Play songs from chord charts: the four chords everyone uses, then accompaniment patterns, then real melodies over your own left hand.",
    stages: [
      { id: "pop-four-chords", title: "The four chords", type: "song", diff: 2, min: 10, desc: "I–V–vi–IV in C as block chords — the progression under a huge share of pop songs." },
    ],
  },
```

`src/lessons/piano.js`, a new entry:

```js
  "pop-four-chords": {
    summary: "I–V–vi–IV in C — C, G, Am, F — as block chords: the left hand plays each root, the right hand the whole chord.",
    steps: [
      "Right hand alone, wait mode: find each chord shape — C-E-G, G-B-D, A-C-E, F-A-C, all in root position.",
      "Left hand alone: the roots C, G, A, F, low and held for the whole bar.",
      "Both hands in wait mode, then play-along with the click. Change on the downbeat, not a moment after.",
      "Songs built on this loop: \"Let It Be\", \"Don't Stop Believin'\", \"Someone Like You\". Try one from memory over it.",
    ],
    watch: ["The G shape sits lower than the C — let the hand drop without looking."],
    chart: {
      key: "C", meter: "4/4", chords: "C | G | Am | F | C | G | Am | F", pattern: "block",
      bpm: 56, target: 84,
      sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 8 }],
    },
  },
```

- [ ] **Step 6: Run** — `npm test` → all green; `npm run build` → passes.
- [ ] **Step 7: Browser check** (dev `npx vite --port 5401 --strictPort`, `?fakemidi`, 1440×900; shim `requestAnimationFrame` with `setTimeout` in the console if the pane is hidden, and say so): Library/Tracks shows "Pop from chords" → "The four chords" opens as a grand staff with C G Am F symbols above the treble staff; wait mode walks the chords; play-along grades; the sight-reading lesson still generates and renders drills (the rename didn't break it); the Minuet unchanged. No console errors. Kill the server; reset the viewport.
- [ ] **Step 8: Commit** — `git add -A src/score src/lessons src/seed.js test README.md && git commit -m "feat(charts): chord-chart lessons play on the score stage; the four chords"`

---

### Task 4: Schema 8, retiring placeholders, and advancing on a clean target pass

**Files:**
- Modify: `src/engine.js`, `src/storage.js`, `src/seed.js`, `src/lessons/piano.js`, `src/App.jsx`, `src/score/ScorePanel.jsx`, `test/engine.test.mjs`, `test/lessons.test.mjs`

**Interfaces:**
- Consumes: `hasScore`, `getLesson`.
- Produces: `SCHEMA_VERSION = 8`; `freshData()` has `songs: []`, `targetClean: {}`; `progressionProposals(items, sessions, acked = {}, { targetClean = {}, isScored = () => false } = {})`; ScorePanel prop `onTargetClean()`; track `trk-pno-pieces` ("Pieces") with stage `pno-minuet`; constants `RETIRED` and `REHOMED` exported from `src/storage.js` for tests.

- [ ] **Step 1: Failing tests** — `test/engine.test.mjs` (import `migrate` from `../src/storage.js` if not already):

```js
test("a scored stage is ready once it runs clean at its target tempo; unscored keep the ratings rule", () => {
  const items = [{ id: "a", inst: "piano", trackId: "t", trackName: "T", order: 0, hidden: false }, { id: "b", inst: "piano", trackId: "t", trackName: "T", order: 1, hidden: false }];
  const opts = (tc) => ({ targetClean: tc, isScored: (id) => id === "a" });
  assert.equal(progressionProposals(items, [], {}, opts({})).length, 0);
  const p = progressionProposals(items, [], {}, opts({ a: "2026-09-27" }));
  assert.equal(p.length, 1); assert.equal(p[0].itemId, "a"); assert.match(p[0].reason, /target tempo/);
  assert.equal(progressionProposals(items, [], { a: 0 }, opts({ a: "2026-09-27" })).length, 0);
  const easy = [1, 2].map((i) => ({ id: `s${i}`, itemId: "a", inst: "piano", date: `2026-09-2${i}`, minutes: 10, rating: "easy" }));
  assert.equal(progressionProposals(items, easy, {}, opts({})).length, 0, "ratings never advance a scored stage");
  assert.equal(progressionProposals(items, easy, {}).length, 1, "unscored stages keep the ratings rule");
});

test("schema 8: songs and targetClean, placeholders retired, kept items re-homed", () => {
  const s = migrate({ version: 7, settings: {}, ladder: { "pno-minuet": { A: 80 } }, items: [
    { id: "pno-minuet", inst: "piano", title: "old", hidden: false },
    { id: "trk-pno-1", inst: "piano", title: "old", trackId: "trk-pno-hands", order: 0, mastered: true, hidden: true },
    { id: "pno-piece", inst: "piano", title: "Your current piece", hidden: false },
    { id: "pno-hanon", inst: "piano", title: "Hanon", hidden: false },
    { id: "trk-pno-4", inst: "piano", title: "Melody over block chords", trackId: "trk-pno-hands", order: 3, hidden: false },
  ], sessions: [{ id: "x", itemId: "pno-hanon", inst: "piano", date: "2026-09-20", minutes: 5 }] });
  assert.deepEqual(s.songs, []); assert.deepEqual(s.targetClean, {}); assert.equal(s.version, 8);
  const by = Object.fromEntries(s.items.map((it) => [it.id, it]));
  assert.equal(by["pno-minuet"].trackId, "trk-pno-pieces"); assert.equal(by["pno-minuet"].order, 0);
  assert.equal(by["trk-pno-1"].mastered, true); assert.notEqual(by["trk-pno-1"].title, "old");
  assert.ok(!by["pno-piece"] && !by["trk-pno-4"], "unpractised placeholders are removed");
  assert.equal(by["pno-hanon"].hidden, true); assert.equal(by["pno-hanon"].trackId, undefined);
  assert.deepEqual(s.ladder, { "pno-minuet": { A: 80 } });
  assert.deepEqual(migrate({ version: 8, items: [], sessions: [], settings: {}, songs: {}, targetClean: [] }).songs, []);
});
```

`test/lessons.test.mjs`: the hasScore test uses `LESSONS["pno-ear"]` for the `false` case (pno-hanon is retired). Run → fails.

- [ ] **Step 2: Engine** — `src/engine.js`: `SCHEMA_VERSION = 8`; `freshData()` adds `songs: [], targetClean: {}` beside `ladder`/`sightLevel`. Replace the loop head of `progressionProposals`:

```js
export function progressionProposals(items, sessions, acked = {}, { targetClean = {}, isScored = () => false } = {}) {
  const live = withDerivedStats(items, sessions);
  const status = trackStatus(live);
  const isCurrentEdge = new Set();
  for (const tid of Object.keys(status))
    for (const st of status[tid]) if (st.status === "current") isCurrentEdge.add(st.id);

  const out = [];
  for (const it of live) {
    if (it.hidden || it.mastered || !isCurrentEdge.has(it.id)) continue;
    // A scored stage is ready once it has run clean over the whole piece at its target tempo.
    if (isScored(it.id)) {
      if (targetClean[it.id] && !(it.id in acked && acked[it.id] >= it.times))
        out.push({ itemId: it.id, inst: it.inst, title: it.title, kind: "advance", trackName: it.trackName,
          reason: `Clean at the target tempo — ready for the next stage of ${it.trackName}.` });
      continue;
    }
    if (it.times < 2) continue;
    if ((acked[it.id] || 0) >= it.times) continue; // already handled at this level of practice
    const mine = sessions.filter((s) => s.itemId === it.id);
    const easy = trailingCount(mine, "easy");
    if (((easy >= 2) || (it.times >= 5 && !hasRecent(mine, "hard", 3))) && accuracyReady(mine)) {
      out.push({ itemId: it.id, inst: it.inst, title: it.title, kind: "advance", trackName: it.trackName,
        reason: easy >= 2
          ? `The last ${easy} felt easy — ready for the next stage of ${it.trackName}.`
          : `${it.times} sessions in — ready to move on in ${it.trackName}?` });
    }
  }
  return out;
}
```

(Keep whatever the existing function does after the loop; only the loop head and the scored branch change. Existing engine tests must stay green.)

- [ ] **Step 3: Seed and lessons** — `src/seed.js`:
  - Remove `pno-piece`, `pno-voicings`, `pno-hanon` and `pno-minuet` from `SEED`.
  - Reword `pno-improv`'s desc: `"Loop one of the Pop track's progressions and improvise a right-hand melody over it. Leave space."`
  - In `trk-pno-hands`, delete stages `trk-pno-4` and `trk-pno-5`.
  - Add the Pieces track as the first piano track:

```js
  {
    id: "trk-pno-pieces", inst: "piano", name: "Pieces",
    blurb: "Written pieces, easiest first — from the Anna Magdalena notebook to Clementi and Burgmüller — learned a section at a time.",
    stages: [
      { id: "pno-minuet", title: "Minuet in G (Petzold)", type: "song", diff: 2, min: 12, desc: "The Minuet in G from the Anna Magdalena notebook — a section at a time, hands separately, then with the click." },
    ],
  },
```

`src/lessons/piano.js`: delete the `pno-piece`, `pno-voicings`, `pno-hanon`, `trk-pno-4`, `trk-pno-5` lessons (and any constant only they used); update `pno-improv`'s summary/steps to loop a Pop-track progression (e.g. I–V–vi–IV in C) and improvise over it, unscored, `prescribe` kept.

- [ ] **Step 4: Migration** — `src/storage.js`: import `SEED, trackItems` from `./seed.js` and add:

```js
// v7 -> v8: placeholders retired (kept hidden, off their track, when they have history);
// items that kept their id but changed meaning take their new content fields.
export const RETIRED = ["pno-piece", "pno-voicings", "pno-hanon", "trk-pno-4", "trk-pno-5"];
export const REHOMED = ["pno-minuet", "trk-pno-1", "trk-pno-2", "trk-pno-3", "pno-improv"];
const CONTENT = ["title", "desc", "type", "diff", "min", "link", "trackId", "trackName", "order"];
```

and inside `migrate`, before `s.version = SCHEMA_VERSION`:

```js
  for (const k of ["ladder", "sightLevel", "targetClean"]) if (!s[k] || typeof s[k] !== "object" || Array.isArray(s[k])) s[k] = {};
  if (!Array.isArray(s.songs)) s.songs = [];
  if ((s.version || 0) < 8) {
    const defaults = Object.fromEntries([...SEED, ...trackItems()].map((d) => [d.id, d]));
    const practised = new Set(s.sessions.map((x) => x.itemId));
    s.items = s.items.flatMap((it) => {
      if (RETIRED.includes(it.id)) {
        if (!practised.has(it.id)) return [];
        const { trackId, trackName, order, ...rest } = it;
        return [{ ...rest, hidden: true }];
      }
      if (REHOMED.includes(it.id) && defaults[it.id]) {
        const d = defaults[it.id], fresh = {};
        for (const f of CONTENT) if (f in d) fresh[f] = d[f];
        return [{ ...it, ...fresh }];
      }
      return [it];
    });
  }
```

(Replace the existing `for (const k of ["ladder", "sightLevel"])` line with the three-key version above.)

- [ ] **Step 5: Record a clean target pass** — `ScorePanel.jsx`: add the prop `onTargetClean`, and in `finish` inside `else if (complete && g.clean) { … }` after `setLastClean(…)`: `if (k === "all" && bpm >= spec.target) onTargetClean?.();`. `App.jsx`:

```js
  const saveTargetClean = (itemId) => setData((d) => (d.targetClean[itemId] ? d : { ...d, targetClean: { ...d.targetClean, [itemId]: todayStr() } }));
```

pass `onTargetClean={() => saveTargetClean(lessonFor.id)}` to `<ScorePanel>`, and call `progressionProposals(data.items, data.sessions, (data.progress && data.progress.acked) || {}, { targetClean: data.targetClean, isScored: (id) => hasScore(getLesson(id)) })`.

- [ ] **Step 6: Run** — `npm test`, `npm run build` → green. In the browser (dev, `?fakemidi`): a v7 save in localStorage with `pno-piece` and a mastered `trk-pno-1` loads — Library no longer lists the placeholders, Tracks shows Pieces (Minuet), Pop from chords, Two-Hand Coordination (3 stages), `trk-pno-1` still mastered. Restore localStorage afterwards.
- [ ] **Step 7: Commit** — `git add -A src test && git commit -m "feat(content): schema 8 — retire placeholders, three piano tracks, advance on a clean target pass"`

---

### Task 5: Your song

**Files:**
- Create: `src/score/songs.js`, `src/score/SongEditor.jsx`
- Modify: `src/score/ScorePanel.jsx`, `src/App.jsx`, `src/seed.js`, `src/lessons/piano.js`, `src/styles.css`, `test/charts.test.mjs`

**Interfaces:**
- Consumes: `parseChordLine` (Task 1), `PATTERNS`, `chartToAbc` (Task 2), runStore `abc` (Task 3), `data.songs` (Task 4).
- Produces: `SONG_KEYS`; `newSong(id)`; `songError(song) → { bar, token?, message } | null`; `songScore(song) → { abc, bpm, target, sections } | null`; `lineSections(bars)`; `SongEditor({ songs, songId, onSelect, onSongs, disabled })`; ScorePanel props `songs`, `onSongs`; library item `pno-song` with lesson `{ song: true, … }`. Tempo-ladder entries for songs live under `data.ladder["pno-song"]`, keyed `"<songId>:<section>"`.

- [ ] **Step 1: Failing tests** — append to `test/charts.test.mjs`:

```js
const { newSong, songError, songScore, lineSections, SONG_KEYS } = await import("../src/score/songs.js");

test("a song becomes a score: sections per 4-bar line, errors named by bar", () => {
  const s = { ...newSong("s1"), chords: "C | G | Am | F | C | G | F C | G" };
  assert.equal(songError(s), null);
  const S = songScore(s);
  assert.equal(parseScore(S.abc, abcjs).bars.length, 9);
  assert.deepEqual(S.sections.map((x) => [x.name, x.from, x.to]), [["1–4", 1, 4], ["5–8", 5, 8], ["9", 9, 9]]);
  assert.equal(S.bpm, 70); assert.equal(S.target, 120);
  assert.equal(songError({ ...s, chords: "C | Hm" }).message, "bar 2: 'Hm' isn't a chord I know");
  assert.equal(songScore({ ...s, chords: "C | Hm" }), null);
  assert.deepEqual(lineSections(4).map((x) => x.name), ["1–4"]);
  assert.ok(SONG_KEYS.includes("Bb") && SONG_KEYS.includes("F#m"));
});
```

- [ ] **Step 2: Implement `songs.js`**:

```js
import { parseChordLine } from "./chords.js";
import { chartToAbc } from "./chartToAbc.js";

// Your song: a chord chart the owner types, written out with the chosen pattern.
export const SONG_KEYS = ["C", "G", "D", "A", "E", "F", "Bb", "Eb", "Ab", "Am", "Em", "Bm", "F#m", "C#m", "Dm", "Gm", "Cm", "Fm"];
export const newSong = (id) => ({ id, title: "New song", key: "C", meter: "4/4", chords: "C | G | Am | F", pattern: "block", bpm: 70 });
const beatsOf = (s) => Number(s.meter.split("/")[0]);
export const songError = (s) => parseChordLine(s.chords, beatsOf(s)).error || null;
// one section per 4-bar line ("all" is the panel's own)
export const lineSections = (n) => Array.from({ length: Math.ceil(n / 4) }, (_, i) => {
  const from = i * 4 + 1, to = Math.min(n, from + 3);
  return { name: from === to ? `${from}` : `${from}–${to}`, from, to };
});
export function songScore(s) {
  const r = parseChordLine(s.chords, beatsOf(s));
  if (r.error) return null;
  const abc = chartToAbc({ key: s.key, meter: s.meter, chords: s.chords, pattern: s.pattern, title: s.title });
  return { abc, bpm: s.bpm, target: Math.max(s.bpm, 120), sections: lineSections(r.bars.length) };
}
```

- [ ] **Step 3: SongEditor** — `src/score/SongEditor.jsx`, a controlled form (use the rail's existing classes: `ws-score-row`, `ws-lesson-label`, `ws-sig`/`ws-sig-btn`, `ws-btn ghost sm`; add only the CSS the textarea and error line need):

```jsx
import React from "react";
import { PATTERNS } from "./patterns.js";
import { SONG_KEYS, newSong, songError } from "./songs.js";

// Pick or add a song, and edit its chart. Every edit is saved; the stage redraws once the chords parse.
export default function SongEditor({ songs, songId, onSelect, onSongs, disabled }) {
  const song = songs.find((s) => s.id === songId);
  const edit = (patch) => onSongs(songs.map((s) => (s.id === songId ? { ...s, ...patch } : s)));
  const add = () => { const s = newSong(`s${Date.now()}`); onSongs([...songs, s]); onSelect(s.id); };
  const remove = () => {
    if (!window.confirm(`Delete “${song.title}”?`)) return;
    const rest = songs.filter((s) => s.id !== songId);
    onSongs(rest); onSelect(rest[0]?.id ?? null);
  };
  const beats = song ? Number(song.meter.split("/")[0]) : 4;
  const err = song && songError(song);
  const fits = Object.entries(PATTERNS).filter(([, p]) => p.metres.includes(beats));
  return (
    <div className="ws-song">
      <div className="ws-score-row">
        <span className="ws-lesson-label">Song</span>
        <select aria-label="Song" value={songId ?? ""} disabled={disabled} onChange={(e) => onSelect(e.target.value)}>
          {songs.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <button className="ws-btn ghost sm" disabled={disabled} onClick={add}>New song</button>
      </div>
      {song && (
        <>
          <input className="ws-song-title" aria-label="Title" value={song.title} disabled={disabled} onChange={(e) => edit({ title: e.target.value })} />
          <div className="ws-score-row">
            <select aria-label="Key" value={song.key} disabled={disabled} onChange={(e) => edit({ key: e.target.value })}>{SONG_KEYS.map((k) => <option key={k}>{k}</option>)}</select>
            <select aria-label="Metre" value={song.meter} disabled={disabled}
              onChange={(e) => { const m = e.target.value, b = Number(m[0]); edit({ meter: m, ...(!PATTERNS[song.pattern].metres.includes(b) && { pattern: "block" }) }); }}>
              <option>4/4</option><option>3/4</option>
            </select>
            <select aria-label="Pattern" value={song.pattern} disabled={disabled} onChange={(e) => edit({ pattern: e.target.value })}>
              {fits.map(([k, p]) => <option key={k} value={k}>{p.name}</option>)}
            </select>
            <input className="ws-score-num mono" type="number" min={30} max={200} aria-label="Tempo" value={song.bpm} disabled={disabled}
              onChange={(e) => { const v = Math.round(Number(e.target.value)); if (v >= 30 && v <= 200) edit({ bpm: v }); }} />
          </div>
          <textarea className="ws-song-chords mono" aria-label="Chords, bars split by |" rows={3} value={song.chords} disabled={disabled}
            spellCheck={false} onChange={(e) => edit({ chords: e.target.value })} />
          {err && <p className="ws-song-err" role="status">{err.message}</p>}
          <button className="ws-btn ghost sm" disabled={disabled} onClick={remove}>Delete song</button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Panel, seed and App** —
  - `src/seed.js` `SEED`: `{ id: "pno-song", inst: "piano", title: "Your song", type: "song", diff: 3, min: 10, desc: "Type the chords of a song you love, pick a pattern, and play it written out — graded like any piece." }`
  - `src/lessons/piano.js`: `"pno-song": { summary: "Any song you know the chords to, written out in the pattern you pick.", song: true, steps: ["Type the chords bar by bar, split by | — two chords in a 4/4 bar split it in half.", "Pick a pattern from the Pop track you've already learned.", "Wait mode first, then play-along; the tempo climbs as you play it clean."], watch: ["Chord symbols it knows: C, Cm, C7, Cmaj7, Cm7, Csus2, Csus4, Cdim, and a slash bass like C/E."] }`
  - `ScorePanel.jsx`: new props `songs = [], onSongs`. Add:

```js
  const songMode = !!lesson.song;
  const [songId, setSongId] = useState(songs[0]?.id ?? null);
  const song = songMode ? songs.find((s) => s.id === songId) : null;
  const songSpec = useMemo(() => (song ? songScore(song) : null), [song?.key, song?.meter, song?.chords, song?.pattern, song?.bpm, song?.title]);
```

    and change `spec`/`src` to `const spec = songMode ? songSpec || { abc: null, bpm: null, target: null, sections: [] } : scoreFor(lesson);` and `const src = sight || songMode ? st.abc : spec.abc;`. Publish the song's ABC for the stage, debounced:

```js
  useEffect(() => {
    if (!songMode) return;
    const t = setTimeout(() => { if (!live.current) runStore.set({ abc: songSpec ? songSpec.abc : null, run: IDLE }); }, 250);
    return () => clearTimeout(t);
  }, [songSpec?.abc]);
```

    extend the unmount cleanup: `if (sight || songMode) runStore.set({ abc: null });`. Ladder keys: `const lk = songMode ? \`${songId}:${key}\` : key;` — use `ladder[lk]` where the panel restores the tempo (`metro.setBpm(ladder[lk] ?? spec.bpm)`, add `songId` to that effect's deps), and in `startPlay` capture `lk` beside `k` and call `onLadder(lk, up)` in `finish`. Never call `onTargetClean` in song mode. Render `<SongEditor songs={songs} songId={songId} onSelect={setSongId} onSongs={onSongs} disabled={running} />` directly under the title when `songMode`; with no songs yet, the panel shows only the editor (a "New song" button) and a disabled Start.
  - `App.jsx`: pass `songs={data.songs}` and `onSongs={(songs) => setData((d) => ({ ...d, songs }))}` to `<ScorePanel>`.

- [ ] **Step 5: Run** — `npm test`, `npm run build` → green.
- [ ] **Step 6: Browser check** (dev, `?fakemidi`, 1440×900; rAF shim if hidden): Library → Your song → New song shows C G Am F as block chords on the stage; typing `C | Hm` shows "bar 2: 'Hm' isn't a chord I know" and the stage keeps the last good chart; switch to 3/4 → ballad/pulse/boogie leave the pattern list and a ballad song falls back to block chords; a clean play-along pass raises that song's tempo, a second song keeps its own; reload → songs persist. No console errors. Restore localStorage; kill the server.
- [ ] **Step 7: Commit** — `git add -A src test && git commit -m "feat(charts): Your song — type the chords, pick a pattern, play it"`

---

### Task 6: Pop stages 10–14

**Files:** Modify `src/seed.js` (append stages to `trk-pno-pop`), `src/lessons/piano.js`, `test/lessons.test.mjs`.

**Interfaces:** Consumes the `chart` lesson shape (Task 3). Produces stages `pop-voice-leading`, `pop-ballad`, `pop-pulse`, `pop-fifties`, `pop-blues`.

- [ ] **Step 1: Failing test** — `test/lessons.test.mjs`:

```js
test("the Pop track runs in order and every stage is a chart", () => {
  const pop = TRACKS.find((t) => t.id === "trk-pno-pop").stages.map((s) => s.id);
  assert.deepEqual(pop.slice(0, 6), ["pop-four-chords", "pop-voice-leading", "pop-ballad", "pop-pulse", "pop-fifties", "pop-blues"]);
  for (const id of pop.slice(0, 6)) assert.ok(LESSONS[id].chart, id);
});
```

(import `TRACKS` from `../src/seed.js` if the file doesn't already.)

- [ ] **Step 2: Add the stages** — seed stages (type `song`, diff 2–3, min 10) and lesson charts exactly:

| id | title | chart |
|---|---|---|
| `pop-voice-leading` | Voice leading | `{ key: "C", meter: "4/4", chords: "C | G | Am | F | C | G | Am | F", pattern: "voiceled", bpm: 56, target: 88, sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 8 }] }` |
| `pop-ballad` | Pop-ballad left hand | `{ key: "C", meter: "4/4", chords: "C | G | Am | F | Am | F | C | G", pattern: "ballad", bpm: 52, target: 76, sections: [{ name: "I–V–vi–IV", from: 1, to: 4 }, { name: "vi–IV–I–V", from: 5, to: 8 }] }` |
| `pop-pulse` | Pulse the right hand | `{ key: "G", meter: "4/4", chords: "G | D | Em | C | G | D | Em | C", pattern: "pulse", bpm: 60, target: 88, sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 8 }] }` |
| `pop-fifties` | The '50s progression | `{ key: "G", meter: "4/4", chords: "G | Em | C | D | G | Em | C | D", pattern: "arpeggio", bpm: 52, target: 80, sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 8 }] }` |
| `pop-blues` | 12-bar blues | `{ key: "C", meter: "4/4", chords: "C7 | C7 | C7 | C7 | F7 | F7 | C7 | C7 | G7 | F7 | C7 | G7", pattern: "boogie", bpm: 60, target: 96, sections: [{ name: "1–4", from: 1, to: 4 }, { name: "5–8", from: 5, to: 8 }, { name: "9–12", from: 9, to: 12 }] }` |

Lesson text per the Global Constraints, in the voice of `pop-four-chords`. Required content: voice leading — keep common tones, move the others by step, the hand barely travels; ballad — the root–fifth–octave–fifth left-hand figure in even eighths, examples "Zombie", "Despacito" for vi–IV–I–V; pulse — hits on 1, the "and" of 2, and 4, count "1 2 & 3 4" aloud; fifties — examples "Stand By Me", "Every Breath You Take", the arpeggio goes 1-3-5-3; blues — the 12-bar form (4 on I, 2 on IV, 2 on I, V–IV–I–V), straight eighths (swing comes later), examples "Johnny B. Goode", "Hound Dog". Song titles only — no lyrics or melodies.

- [ ] **Step 3: Run** — `npm test` → green (the lint and section checks cover the new charts).
- [ ] **Step 4: Browser spot-check** — each of the five opens and renders (blues: three systems, C7/F7/G7 symbols; pulse: rests between hits). No console errors.
- [ ] **Step 5: Commit** — `git add src/seed.js src/lessons/piano.js test/lessons.test.mjs && git commit -m "feat(content): pop stages — voice leading to the 12-bar blues"`

---

### Task 7: Lead sheets — "Ode to Joy" and "Amazing Grace"

**Files:** Modify `src/seed.js`, `src/lessons/piano.js`, `test/lessons.test.mjs`.

**Interfaces:** Consumes `chart.melody` (Task 2). Produces stages `pop-ode-to-joy`, `pop-amazing-grace` (appended to `trk-pno-pop`).

- [ ] **Step 1: Failing test**:

```js
test("lead sheets: the melody is the right hand, over a generated left hand", () => {
  const ode = parseScore(scoreFor(LESSONS["pop-ode-to-joy"]).abc, abcjs), grace = parseScore(scoreFor(LESSONS["pop-amazing-grace"]).abc, abcjs);
  assert.equal(ode.bars.length, 16); assert.equal(grace.bars.length, 16);
  assert.deepEqual(ode.notes.filter((n) => n.hand === "R").slice(0, 8).map((n) => n.midi), [64, 64, 65, 67, 67, 65, 64, 62]);
  assert.deepEqual(grace.notes.filter((n) => n.hand === "R").slice(0, 5).map((n) => n.midi), [62, 67, 71, 67, 71]);
  assert.deepEqual(grace.meter, [3, 4]);
});
```

- [ ] **Step 2: Add the stages** — the melodies (public domain; voice 1, `L:1/8`) and charts exactly:

```js
const ODE_MELODY = `E2E2F2G2 | G2F2E2D2 | C2C2D2E2 | E3D D4 |
E2E2F2G2 | G2F2E2D2 | C2C2D2E2 | D3C C4 |
D2D2E2C2 | D2EF E2C2 | D2EF E2D2 | C2D2 G,4 |
E2E2F2G2 | G2F2E2D2 | C2C2D2E2 | D3C C4 |]`;

const GRACE_MELODY = `z4D2 | G4BG | B4A2 | G4E2 |
D4D2 | G4BG | B4A2 | d6- |
d4B2 | d4BG | B4A2 | G4E2 |
D4D2 | G4BG | B4A2 | G6 |]`;
```

  - `pop-ode-to-joy` "Lead sheet: Ode to Joy": `chart: { key: "C", meter: "4/4", chords: "C | G | C | G | C | G | C | G C | G | C | G | C G | C | G | C | G C", pattern: "ballad", melody: ODE_MELODY, bpm: 60, target: 92, sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 12 }, { name: "A'", from: 13, to: 16 }] }`
  - `pop-amazing-grace` "Lead sheet: Amazing Grace": `chart: { key: "G", meter: "3/4", chords: "G | G | G | C | G | G | G | D | G | G | G | C | G | G | D | G", pattern: "waltz", melody: GRACE_MELODY, bpm: 60, target: 90, sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }] }`

  Lesson text: melody alone first (RH, wait mode), then the left hand alone, then together; "Amazing Grace" notes that the pickup note is written into a full first bar and the left hand's first bar is an intro; name the tunes' public-domain origin (Beethoven, 1824; "New Britain", 1829) in the summary.
- [ ] **Step 3: Run** — `npm test` → green. Browser: both render with chord symbols between the staves; the Amazing Grace tie across bars 8–9 draws. No console errors.
- [ ] **Step 4: Commit** — `git add src/seed.js src/lessons/piano.js test/lessons.test.mjs && git commit -m "feat(content): lead sheets — Ode to Joy and Amazing Grace"`

---

### Task 8: The technique track, scored

**Files:** Modify `src/seed.js` (retitle `trk-pno-1`–`3`, append `tec-hanon-1`, `tec-cadences`, `tec-arpeggios`), `src/lessons/piano.js`, `test/lessons.test.mjs`.

**Interfaces:** Produces six scored stages in `trk-pno-hands`; `trk-pno-1` and `trk-pno-3` lose their `shape` (the notation spec: a scored lesson carries no shape); `trk-pno-3` keeps `snippet: SCALE_SNIPPET`.

- [ ] **Step 1: Failing test**:

```js
test("the technique track is six scored stages", () => {
  const ids = TRACKS.find((t) => t.id === "trk-pno-hands").stages.map((s) => s.id);
  assert.deepEqual(ids, ["trk-pno-1", "trk-pno-2", "trk-pno-3", "tec-hanon-1", "tec-cadences", "tec-arpeggios"]);
  for (const id of ids) assert.ok(LESSONS[id].score && !LESSONS[id].shape, id);
  assert.equal(parseScore(LESSONS["tec-hanon-1"].score.abc, abcjs).bars.length, 15);
});
```

- [ ] **Step 2: Scores** — add these ABC constants to `src/lessons/piano.js` (column 0) and a `score` to each lesson:

```js
const FIVE_FINGER_ABC = `X:1
M:4/4
L:1/4
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] C D E F | G F E D | C D E F | E D C2 |
[V:2] z4 | z4 | z4 | z4 |
[V:1] z4 | z4 | z4 | z4 |
[V:2] C, D, E, F, | G, F, E, D, | C, D, E, F, | E, D, C,2 |
[V:1] G A B c | d c B A | G A B c | B A G2 |
[V:2] z4 | z4 | z4 | z4 |
[V:1] z4 | z4 | z4 | z4 |
[V:2] G,, A,, B,, C, | D, C, B,, A,, | G,, A,, B,, C, | B,, A,, G,,2 |]`;

const CONTRARY_ABC = `X:1
M:4/4
L:1/4
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] C D E F | G F E D | C D E F | G F E D |
[V:2] C B, A, G, | F, G, A, B, | C B, A, G, | F, G, A, B, |
[V:1] C D E F | G F E D | C E D F | E D C2 |
[V:2] C B, A, G, | F, G, A, B, | C A, B, G, | A, B, C2 |]`;

const SCALES_ABC = `X:1
M:4/4
L:1/8
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] CDEF GABc | cBAG FEDC | GABc de^fg | g^fed cBAG |
[V:2] C,D,E,F, G,A,B,C | CB,A,G, F,E,D,C, | G,A,B,C DE^FG | G^FED CB,A,G, |
[V:1] FGA_B cdef | fedc _BAGF | CDEF GABc | cBAG FEDC |
[V:2] F,G,A,_B, CDEF | FEDC _B,A,G,F, | C,D,E,F, G,A,B,C | CB,A,G, F,E,D,C, |]`;

const HANON_ABC = `X:1
M:2/4
L:1/16
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] CEFG AGFE | DFGA BAGF | EGAB cBAG | FABc dcBA |
[V:2] C,E,F,G, A,G,F,E, | D,F,G,A, B,A,G,F, | E,G,A,B, CB,A,G, | F,A,B,C DCB,A, |
[V:1] GBcd edcB | Acde fedc | Bdef gfed | gedc Bcde |
[V:2] G,B,CD EDCB, | A,CDE FEDC | B,DEF GFED | GEDC B,CDE |
[V:1] fdcB ABcd | ecBA GABc | dBAG FGAB | cAGF EFGA |
[V:2] FDCB, A,B,CD | ECB,A, G,A,B,C | DB,A,G, F,G,A,B, | CA,G,F, E,F,G,A, |
[V:1] BGFE DEFG | AFED CDEF | C8 |]
[V:2] B,G,F,E, D,E,F,G, | A,F,E,D, C,D,E,F, | C,8 |]`;

const CADENCES_ABC = `X:1
M:4/4
L:1/4
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] "C"[CEG]4 | "F"[CFA]4 | "G"[B,DG]4 | "C"[CEG]4 |
[V:2] C,4 | F,,4 | G,,4 | C,4 |
[V:1] "G"[G,B,D]4 | "C"[G,CE]4 | "D"[^F,A,D]4 | "G"[G,B,D]4 |
[V:2] G,,4 | C,4 | D,4 | G,,4 |
[V:1] "F"[A,CF]4 | "Bb"[_B,DF]4 | "C"[G,CE]4 | "F"[A,CF]4 |
[V:2] F,,4 | _B,,4 | C,4 | F,,4 |]`;

const ARPEGGIOS_ABC = `X:1
M:4/4
L:1/4
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] C E G c | G E C2 | G B d g | d B G2 |
[V:2] C, E, G, C | G, E, C,2 | G,, B,, D, G, | D, B,, G,,2 |
[V:1] F A c f | c A F2 | A c e a | e c A2 |
[V:2] F,, A,, C, F, | C, A,, F,,2 | A,, C, E, A, | E, C, A,,2 |
[V:1] E G B e | B G E2 | D F A d | A F D2 |]
[V:2] E,, G,, B,, E, | B,, G,, E,,2 | D, F, A, D | A, F, D,2 |]`;
```

  Scores: `trk-pno-1` `{ bpm: 72, target: 100, sections: [RH in C 1–4, LH in C 5–8, RH in G 9–12, LH in G 13–16], abc: FIVE_FINGER_ABC }`; `trk-pno-2` `{ bpm: 60, target: 96, sections: [A 1–4, B 5–8], abc: CONTRARY_ABC }`; `trk-pno-3` `{ bpm: 56, target: 88, sections: [C and G 1–4, F and C 5–8], abc: SCALES_ABC }`; `tec-hanon-1` `{ bpm: 50, target: 80, sections: [up 1–7, down 8–15], abc: HANON_ABC }`; `tec-cadences` `{ bpm: 60, target: 90, sections: [C 1–4, G 5–8, F 9–12], abc: CADENCES_ABC }`; `tec-arpeggios` `{ bpm: 56, target: 96, sections: [major 1–6, minor 7–12], abc: ARPEGGIOS_ABC }` (sections as `{ name, from, to }`).

  Titles: `trk-pno-1` "Five-finger patterns, hands separate", `trk-pno-2` "Hands together: contrary motion", `trk-pno-3` "Major scales, one octave — C, G, F", `tec-hanon-1` "Hanon No. 1", `tec-cadences` "Primary chords and cadences", `tec-arpeggios` "Arpeggios, one octave". Update the seed descs to match. Lesson text: keep each existing lesson's good lines (the thumb-under, the mirrored fingering), add fingering for the new stages (Hanon: RH 1-2-3-4-5-4-3-2, LH 5-4-3-2-1-2-3-4; arpeggios: RH 1-2-3-5, LH 5-3-2-1), and say cadences are I–IV–V–I in C, G, F (the spec's "I–IV–I–V–I" is simplified to one 4-bar line per key — note this in the commit body).

- [ ] **Step 3: Run** — `npm test` → green (lint, sections, no shapes). Browser: each renders; the scales show F♯ in bars 3–4 and B♭ in bars 5–6. No console errors.
- [ ] **Step 4: Commit** — `git add src/seed.js src/lessons/piano.js test/lessons.test.mjs && git commit -m "feat(content): the technique track, scored — five-finger to arpeggios"`

---

### Task 9: Piece fixtures, and the full Minuet

**Files:**
- Create: `scripts/midi-fixture.mjs`, `test/fixtures/pieces/pno-minuet.json`, `test/pieces.test.mjs`, `src/lessons/pieces/minuet-g.js`
- Modify: `src/lessons/piano.js` (Minuet: full 32 bars, original left hand, `source`), `src/seed.js` (Minuet desc), `package.json` (`test:pieces` chained into `test`)

**Interfaces:**
- Produces: `node scripts/midi-fixture.mjs <file.mid> <lessonId> [--keep a-b,c-d] [--shift n] [--source "<label>|<url>"]` → writes `test/fixtures/pieces/<lessonId>.json`: `{ id, source: { label, url }, onsets: [[beat, midi], …], deviations: [] }` (beats in quarter notes from 0, rounded to 1/1000, sorted by beat then midi; `--keep` takes beat ranges of the MIDI to keep and concatenates them — how dropped repeats are handled; `--shift` adds beats — how a padded pickup is handled). A lesson with a fixture has `source: { label, url }`. A piece with no MIDI reference has a fixture `{ id, source, verified: "manual", note }` and no onsets.

- [ ] **Step 1: The fixture script** — a dependency-free Standard MIDI File reader: parse `MThd` (format, track count, division = ticks per quarter), then each `MTrk`: variable-length delta times, running status, meta events (`FF type len data`), sysex (`F0`/`F7 len data`), channel messages (2 data bytes except `Cx`/`Dx` = 1); record `[tick / division, note]` for every note-on with velocity > 0, across all tracks and channels. Apply `--keep` (each range `a-b` keeps onsets with `a ≤ beat < b`, re-based so kept ranges follow each other) then `--shift`; round; sort; write the JSON. Keep it under ~70 lines.
- [ ] **Step 2: The pieces test** — `test/pieces.test.mjs`: for every file in `test/fixtures/pieces/`: the lesson exists, has `score` and `source.url` equal to the fixture's; if `verified === "manual"`, assert a non-empty `note` and stop; else compare `parseScore(lesson.score.abc)` onsets (`[round(beat), midi]`) to the fixture as multisets, after removing the fixture's `deviations` (`{ beat, midi, kind: "missing" | "extra", reason }` — `missing` = in the reference but intentionally not in our ABC; `extra` = the reverse; each needs a non-empty `reason`). On mismatch, print the first 10 differences as `bar N beat b: expected/got midi`. Add `"test:pieces": "node test/pieces.test.mjs"` to `package.json` and chain it into `test`.
- [ ] **Step 3: Source the Minuet** — find BWV Anh. 114 on the Mutopia Project (mutopiaproject.org; browse by composer "Petzold" or "Bach"; prefer a public-domain-dedicated entry). Download its `.ly` and `.mid` to the session scratchpad (outside the repo). If Mutopia lacks it or only offers a share-alike edition, use an IMSLP public-domain scan instead and follow the manual path.
- [ ] **Step 4: Transcribe** — write `src/lessons/pieces/minuet-g.js` (`export default \`…\`` ABC, column 0) from the `.ly`: 32 bars, both hands as written in the edition (the original left hand, not today's simplified one), `M:3/4`, `L:1/8`, `K:G`, the two-voice header, 4 bars per line, each half once (drop the repeat signs). Ornaments (e.g. a mordent) are written as their main note; list each as a fixture deviation if the MIDI realises it.
- [ ] **Step 5: Fixture and verify** — `node scripts/midi-fixture.mjs <scratch>/minuet.mid pno-minuet --keep <ranges that drop the repeated halves> --source "Mutopia Project — <piece title> (<edition>)|<piece page url>"`, then `node test/pieces.test.mjs` until it passes, adding reasoned deviations only for ornaments or editorial differences — never to paper over a transcription mistake.
- [ ] **Step 6: Lesson** — `pno-minuet`: `score.abc` = the import; `score.sections` = `[{ name: "A1", from: 1, to: 8 }, { name: "A2", from: 9, to: 16 }, { name: "B1", from: 17, to: 24 }, { name: "B2", from: 25, to: 32 }]`; `bpm: 72, target: 100` unchanged; `source` set; summary/steps/watch updated for the full piece (the original repeats each half; the left hand is now the real one — two voices in dialogue). Seed desc: `"The Minuet in G from the Anna Magdalena notebook, all 32 bars — a section at a time, hands separately, then with the click."`
- [ ] **Step 7: Run** — `npm test`, `npm run build` → green. Browser: the Minuet shows 8 systems' worth of bars through the window, sections A1–B2. The ladder entry for the old section "A" is simply unused (sections were renamed).
- [ ] **Step 8: Commit** — `git add scripts/midi-fixture.mjs test/pieces.test.mjs test/fixtures src/lessons package.json src/seed.js && git commit -m "feat(pieces): reference fixtures, and the full Minuet in G"`

---

### Task 10: Pieces 2–5

**Files:** Create `src/lessons/pieces/{minuet-g-minor,musette,schumann-melody,soldiers-march}.js`, `test/fixtures/pieces/<id>.json` ×4; modify `src/lessons/piano.js`, `src/seed.js` (append to `trk-pno-pieces` in this order).

**Interfaces:** Consumes the fixture script and pieces test (Task 9). Produces stages `pcs-minuet-gmin`, `pcs-musette`, `pcs-schumann-melody`, `pcs-soldiers-march`.

For each piece, the Task 9 procedure (source on Mutopia → download to scratch → transcribe to ABC → fixture → `node test/pieces.test.mjs` green → lesson + seed stage):

| id | piece | metre, key | notes |
|---|---|---|---|
| `pcs-minuet-gmin` | Minuet in G minor, BWV Anh. 115 (Petzold) | 3/4, `K:Gm` | each half once |
| `pcs-musette` | Musette in D, BWV Anh. 126 | 2/4, `K:D` | left-hand octave leaps; any D.C. written out |
| `pcs-schumann-melody` | Schumann, "Melody", Op. 68 No. 1 | 4/4, `K:C` | the flowing left-hand eighths are voice 2 as written |
| `pcs-soldiers-march` | Schumann, "Soldier's March", Op. 68 No. 2 | 2/4, `K:G` | dotted rhythms; staccato marks kept (display only); pad any pickup |

Sections by phrase (usually 4 or 8 bars, named A, B, A′ …). Tempos: start ≈ 60–70% of a target that is an honest early-intermediate tempo (not the concert tempo): Minuet in G minor target 100, Musette 88, Melody 80, Soldier's March 100. Seed stages: type `song`, diff 2–3, min 12, one-line desc naming what the piece teaches (spec §1 table). If a piece can't satisfy the ABC conventions without changing the music (e.g. an unavoidable second voice on one staff), stop and report it rather than simplifying silently.

- [ ] Steps per piece: source → transcribe → fixture → test green → lesson → seed → `npm test` → commit `feat(pieces): <title>` (one commit per piece).
- [ ] Browser: each piece opens, renders all bars, sections dim correctly. No console errors.

---

### Task 11: Pieces 6–8

**Files:** Create `src/lessons/pieces/{la-candeur,clementi-36-1,arabesque}.js`, fixtures ×3; modify `src/lessons/piano.js`, `src/seed.js`.

**Interfaces:** As Task 10. Produces stages `pcs-la-candeur`, `pcs-clementi-36-1`, `pcs-arabesque`.

| id | piece | metre, key | notes |
|---|---|---|---|
| `pcs-la-candeur` | Burgmüller, "La Candeur", Op. 100 No. 1 | 4/4, `K:C` | target 88 |
| `pcs-clementi-36-1` | Clementi, Sonatina Op. 36 No. 1, I. Spiritoso | 4/4, `K:C` | exposition once; Alberti bass; target 104 |
| `pcs-arabesque` | Burgmüller, "Arabesque", Op. 100 No. 2 | 2/4, `K:Am` | the return written out; target 96 |

Same procedure, sections, tempo rule and stop-and-report rule as Task 10; one commit per piece.

---

### Task 12: Docs and the lesson-text review list

**Files:** Modify `README.md`, `docs/DIRECTION.md`; create (outside the repo, in the session scratchpad) `lesson-review.md`.

- [ ] **README** — under "Reading music": the three piano tracks and what each teaches; chord charts (patterns, lead sheets) and Your song (the chord syntax it knows); pieces cite public-domain sources; the file table gains `chords.js`, `patterns.js`, `chartToAbc.js`, `scoreFor.js`, `songs.js`, `SongEditor.jsx`, `src/lessons/pieces/`, `scripts/midi-fixture.mjs` (one line each; skip any Task 3 already added). Keep the README's voice.
- [ ] **DIRECTION.md** — step 5: piano content (project 2) done — 22 stages across Pieces, Pop from chords and Two-hand technique, plus Your song; next: guitar content (its own spec), and the parked items (any-voicing grading, swing, compound metres, "Hear this section").
- [ ] **Review list** — `lesson-review.md` in the scratchpad: every one of the 22 stages plus Your song and the reworded `pno-improv`, numbered in track order; item `a` = summary + steps, item `b` = watch points; each headed by its title and id. (The controller sends this to the owner.)
- [ ] `npm test` → green. Commit — `git add README.md docs/DIRECTION.md && git commit -m "docs: piano content — three tracks, chord charts, Your song"`

---

## Self-review

- Spec coverage: §1 inventory → Tasks 3 (pop 9), 6 (10–14), 7 (15–16), 8 (17–22), 9–11 (1–8), 4 (library/retire), 5 (Your song); §2 chart shape, vocabulary, patterns, generator rules → Tasks 1–2; §3 → Task 5; §4 architecture → Tasks 1–5; §5 migration → Task 4; §6 transcription → Tasks 9–11; §7 lesson text → every content task + Task 12's review list; §8 testing → each task's tests; acceptance 1–7 → Tasks 4, 3/9–11, 2–3, 5, 9–11, 4, all.
- Deviations from the spec, decided here: cadences are I–IV–V–I, one 4-bar line per key (spec: I–IV–I–V–I); song tempo ladders live under `ladder["pno-song"]` keyed `<songId>:<section>` (spec: keyed `song:<id>`); lead-sheet chord symbols sit on the left-hand staff (the melody is authored text; spec: above voice 1); the arpeggio pattern is 1-3-5-3 (spec: "up then down"). The spec was amended to match before execution.
- Type consistency: `scoreFor`, `chartToAbc`, `parseChordLine`, `PATTERNS`, runStore `abc`, `onTargetClean`, `songScore` are named identically across tasks.

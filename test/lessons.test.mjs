import assert from "node:assert/strict";
import { stringsToMidi, noteToMidi, midiToFreq, shapeToVoices } from "../src/audio/notes.js";

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

test("G major guitar shape -> correct MIDI (G2 B2 D3 G3 B3 G4)", () => {
  assert.deepEqual(stringsToMidi([3, 2, 0, 0, 0, 3], "guitar"), [43, 47, 50, 55, 59, 67]);
});
test("muted strings are dropped", () => {
  assert.deepEqual(stringsToMidi(["x", 3, 2, 0, 1, 0], "guitar"), [48, 52, 55, 60, 64]); // C major
});
test("noteToMidi: middle C is 60", () => {
  assert.equal(noteToMidi({ name: "C", octave: 4 }), 60);
});
test("midiToFreq: A4 is 440", () => {
  assert.ok(Math.abs(midiToFreq(69) - 440) < 1e-9);
});
test("shapeToVoices: keyboard yields one voice per note", () => {
  const v = shapeToVoices({ kind: "keyboard", notes: [{ name: "C", octave: 4 }, { name: "E", octave: 4 }] });
  assert.equal(v.length, 2);
  assert.equal(v[0].length, 1);
});

// --- schema section appended in Task 2 ---

import { LESSONS } from "../src/lessons/index.js";
import { SEED, ECHO_SEED, trackItems } from "../src/seed.js";

const validIds = new Set([...SEED.map((s) => s.id), ...ECHO_SEED.map((s) => s.id), ...trackItems().map((s) => s.id)]);
const STRINGS = { guitar: 6 };
const WHITE = new Set(["C", "D", "E", "F", "G", "A", "B"]);
// Renderer windows (src/diagrams.jsx): ChordDiagram draws nut + 4 frets;
// FretboardPattern spans baseFret..baseFret+4; Keyboard only maps naturals.
const CHORD_MAX_FRET = 4;
const FRETBOARD_SPAN = 4; // relative fret 0..4 inclusive

const validateShape = (shape) => {
  if (shape == null) return;
  assert.ok(["chords", "fretboard", "keyboard"].includes(shape.kind), `bad shape.kind ${shape.kind}`);
  if (shape.kind === "chords") {
    assert.ok(STRINGS[shape.instrument], `bad chords instrument ${shape.instrument}`);
    for (const c of shape.chords) {
      assert.ok(typeof c.name === "string" && c.name.length, "chord needs a name");
      assert.equal(c.strings.length, STRINGS[shape.instrument], `${c.name}: wrong string count`);
      for (const f of c.strings) assert.ok(f === "x" || (Number.isInteger(f) && f >= 0 && f <= CHORD_MAX_FRET), `${c.name}: fret ${f} outside the ${CHORD_MAX_FRET}-fret diagram`);
      if (c.fingers) assert.equal(c.fingers.length, c.strings.length, `${c.name}: fingers/strings length mismatch`);
    }
  }
  if (shape.kind === "fretboard") {
    assert.ok(STRINGS[shape.instrument], `bad fretboard instrument ${shape.instrument}`);
    for (const d of shape.dots) {
      assert.ok(d.string >= 0 && d.string < STRINGS[shape.instrument], "bad dot string");
      const rel = d.fret - shape.baseFret;
      assert.ok(rel >= 0 && rel <= FRETBOARD_SPAN, `dot at fret ${d.fret} outside baseFret ${shape.baseFret}..+${FRETBOARD_SPAN}`);
    }
  }
  if (shape.kind === "keyboard") {
    for (const n of shape.notes) {
      assert.ok(typeof n.name === "string" && Number.isInteger(n.octave), "bad keyboard note");
      assert.ok(WHITE.has(n.name), `keyboard note ${n.name} is not a natural — the Keyboard renderer only maps white keys`);
    }
    if (shape.fingers) assert.equal(shape.fingers.length, shape.notes.length, "keyboard fingers/notes length mismatch");
    if (shape.hands != null) assert.equal(shape.hands, "together", `bad shape.hands ${shape.hands}`);
  }
};

test("every lesson id maps to a real exercise", () => {
  for (const id of Object.keys(LESSONS)) assert.ok(validIds.has(id), `orphan lesson id: ${id}`);
});
test("every lesson conforms to the schema", () => {
  for (const [id, L] of Object.entries(LESSONS)) {
    assert.ok(typeof L.summary === "string" && L.summary.length, `${id}: missing summary`);
    assert.ok(Array.isArray(L.steps) && L.steps.length >= 1, `${id}: needs >= 1 step`);
    assert.ok(Array.isArray(L.watch), `${id}: watch must be an array`);
    assert.ok(L.shape || L.prescribe || L.score || L.chart || L.sightread || L.song, `${id}: needs a shape, a prescription, a score, a chart, sightread or song`);
    validateShape(L.shape ?? null);
  }
});
test("every shaped lesson produces audible voices", () => {
  for (const [id, L] of Object.entries(LESSONS)) {
    if (!L.shape) continue;
    const voices = shapeToVoices(L.shape);
    assert.ok(Array.isArray(voices) && voices.length > 0, `${id}: shape produced no voices`);
    for (const v of voices) assert.ok(Array.isArray(v) && v.length > 0, `${id}: a voice has no notes (silent demo)`);
  }
});

// --- ear lessons: generator config schema ---

import { KEY_ROOT } from "../src/ear.js";

test("ear lessons exist for both instruments and carry a valid generator config", () => {
  const earLessons = Object.entries(LESSONS).filter(([, L]) => L.ear);
  assert.equal(earLessons.length, 4, `expected 2 ear lessons x 2 instruments, got ${earLessons.length}`);
  for (const [id, L] of earLessons) {
    const { mode, range, keys, bpm, rounds } = L.ear;
    assert.equal(mode, id.endsWith("-int") ? "intervals" : "phrases", `${id}: ear.mode must match the item (intervals vs phrases)`);
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

import { shapeToTargets } from "../src/audio/notes.js";

test("flat chords spell their notes as flats (Bb chord -> Bb F Bb D F)", () => {
  const { targets } = shapeToTargets(LESSONS["trk-gtr-5"].shape);
  const bb = targets.filter((t) => t.chordName === "Bb" && !t.muted).map((t) => `${t.label}${t.octave}`);
  assert.deepEqual(bb, ["Bb2", "F3", "Bb3", "D4", "F4"]);
});

// A legato repeat of the same pitch never re-confirms in the coach's note
// stream (see src/ear.js), so an up-and-down line must not repeat its top note.
test("line shapes never repeat a note back to back", () => {
  for (const [id, L] of Object.entries(LESSONS)) {
    if (!L.shape) continue;
    const { mode, targets } = shapeToTargets(L.shape);
    if (mode !== "line") continue;
    for (let i = 1; i < targets.length; i++) assert.notEqual(targets[i].midi, targets[i - 1].midi, `${id}: repeated ${targets[i].label}${targets[i].octave} at ${i}`);
  }
});

import { fillInstrument, freshData, swapInSession } from "../src/engine.js";

test("twins point at a track stage on the same instrument, and a set never holds both", () => {
  const stages = new Map(trackItems().map((s) => [s.id, s]));
  const twins = SEED.filter((s) => s.twin);
  assert.ok(twins.length >= 1, "expected the library/track twin pairs to be marked");
  for (const s of twins) assert.equal(stages.get(s.twin)?.inst, s.inst, `${s.id}: twin ${s.twin} must be a ${s.inst} track stage`);
  const pairs = twins.map((s) => [s.id, s.twin]);
  // Clear guitar stages 1-3 so trk-gtr-4 (gtr-barre's twin) is the current, unlocked stage.
  const cleared = new Set(["trk-gtr-1", "trk-gtr-2", "trk-gtr-3"]);
  const data = { ...freshData(), items: freshData().items.map((it) => ({ ...it, last: null, times: 0, mastered: cleared.has(it.id) })) };
  for (const inst of ["piano", "guitar"]) {
    for (let run = 0; run < 30; run++) {
      const ids = new Set(fillInstrument(inst, 500, data, "2026-01-01", true).map((it) => it.id));
      for (const [a, b] of pairs) assert.ok(!(ids.has(a) && ids.has(b)), `${inst}: set holds both ${a} and ${b}`);
    }
  }
  const session = { items: [{ itemId: "trk-gtr-4" }, { itemId: "gtr-open" }] };
  for (let run = 0; run < 30; run++) assert.notEqual(swapInSession(session, "gtr-open", data).items[1].itemId, "gtr-barre", "swap brought in trk-gtr-4's twin");
});

test("lesson copy is plain text — no markdown asterisks", () => {
  for (const [id, L] of Object.entries(LESSONS))
    for (const s of [L.summary, ...L.steps, ...L.watch]) assert.ok(!s.includes("*"), `${id}: "*" renders literally in "${s}"`);
});

// --- score fields: score, sightread, snippet ---

import abcjs from "abcjs";
import { parseScore } from "../src/score/scoreModel.js";
import { hasScore } from "../src/lessons/index.js";
const { scoreFor } = await import("../src/score/scoreFor.js");

test("the Minuet parses: 16 bars, key G, meter 3/4, sections, RH stays in G major", () => {
  const { abc, sections } = LESSONS["pno-minuet"].score;
  const s = parseScore(abc, abcjs);
  assert.deepEqual(s.meter, [3, 4]);
  assert.equal(s.key, "G");
  assert.equal(s.bars.length, 16);
  const a = sections.find((sec) => sec.name === "A");
  const b = sections.find((sec) => sec.name === "B");
  assert.deepEqual([a.from, a.to], [1, 8]);
  assert.deepEqual([b.from, b.to], [9, 16]);
  const G_MAJOR = new Set([7, 9, 11, 0, 2, 4, 6]); // G A B C D E F#
  const rh = s.notes.filter((n) => n.hand === "R");
  for (const n of rh) assert.ok(G_MAJOR.has(n.midi % 12), `midi ${n.midi} (pc ${n.midi % 12}) not in G major`);
  const lastInBar = (n) => rh.filter((x) => x.bar === n).at(-1);
  assert.equal(lastInBar(8).midi, 69); // A4
  assert.equal(lastInBar(16).midi, 67); // G4
});

test("the scale snippet parses to 2 bars, RH C4-C5, LH C3-C4", () => {
  for (const id of ["pno-scales", "trk-pno-3"]) {
    const s = parseScore(LESSONS[id].snippet, abcjs);
    assert.equal(s.bars.length, 2, `${id}: expected 2 bars`);
    const rh = s.notes.filter((n) => n.hand === "R").map((n) => n.midi);
    const lh = s.notes.filter((n) => n.hand === "L").map((n) => n.midi);
    assert.deepEqual(rh, [60, 62, 64, 65, 67, 69, 71, 72, 72, 71, 69, 67, 65, 64, 62, 60], `${id}: RH`);
    assert.deepEqual(lh, [48, 50, 52, 53, 55, 57, 59, 60, 60, 59, 57, 55, 53, 52, 50, 48], `${id}: LH`);
  }
});

test("every lesson with score/snippet parses without throwing", () => {
  for (const [id, L] of Object.entries(LESSONS)) {
    if (L.score) assert.doesNotThrow(() => parseScore(L.score.abc, abcjs), `${id}: score.abc failed to parse`);
    if (L.snippet) assert.doesNotThrow(() => parseScore(L.snippet, abcjs), `${id}: snippet failed to parse`);
  }
});

// What the engine can grade (the spec's ABC authoring conventions): at most two voices, one per
// staff; a full first bar; repeats written out; no inline metre change; 2/4, 3/4 or 4/4.
const ungradable = (abc) => {
  const [tune] = abcjs.parseOnly(abc), { num, den } = tune.getMeterFraction(), metre = JSON.stringify(tune.getMeter()), out = [];
  if (den !== 4 || ![2, 3, 4].includes(num)) out.push(`metre ${num}/${den}`);
  if (tune.getPickupLength()) out.push("pickup");
  for (const line of tune.lines.filter((l) => l.staff)) {
    if (line.staff.length > 2 || line.staff.some((s) => s.voices.length !== 1)) out.push("voices");
    // a body M: line lands on the staff, not in the voice
    if (line.staff.some((s) => s.meter && JSON.stringify(s.meter) !== metre)) out.push("metre change");
    for (const el of line.staff.flatMap((s) => s.voices.flat())) {
      if (el.el_type === "bar" && (/repeat/.test(el.type) || el.startEnding)) out.push("repeat");
      if (el.el_type === "meter") out.push("metre change");
    }
  }
  return [...new Set(out)];
};

test("the score lint catches repeats, endings, overlays, extra voices, metre changes, pickups and odd metres", () => {
  const H = "X:1\nM:4/4\nL:1/8\nK:C\n";
  const bad = [["|: C8 :| D8 |]", "repeat"], ["C8 :: D8 :|", "repeat"], ["C8 [1 D8 :| [2 E8 |]", "repeat"], ["C8 |1 D8 :|2 E8 |]", "repeat"],
    ["C8 & E8 | D8 |]", "voices"], ["C8 | [M:3/4] D6 |]", "metre change"], ["C2 | D8 |]", "pickup"],
    ["%%staves {1 2 3}\nV:1\nV:2\nV:3\n[V:1] C8 |]\n[V:2] E8 |]\n[V:3] G8 |]", "voices"]];
  for (const [body, why] of bad) assert.ok(ungradable(H + body).includes(why), `${why}: ${body}`);
  assert.deepEqual(ungradable("X:1\nM:6/8\nL:1/8\nK:C\nC6 | D6 |]"), ["metre 6/8"]);
  assert.deepEqual(ungradable(`${H}C8 | D8 |\nM:3/4\nE6 | F6 |]`), ["metre change"]);
  assert.deepEqual(ungradable(`${H}"C"(3CDE {g}F2 G2- G2 y | c8 |]`), []);
});

test("every score and snippet is one the engine can grade", () => {
  for (const [id, L] of Object.entries(LESSONS))
    for (const abc of [(L.score || L.chart) && scoreFor(L).abc, L.snippet].filter(Boolean)) assert.deepEqual(ungradable(abc), [], id);
});

test("a score has bpm, target >= bpm and sections inside the piece; scored lessons carry no shape", () => {
  for (const [id, L] of Object.entries(LESSONS)) {
    if (L.score || L.chart || L.sightread || L.song) assert.ok(!L.shape, `${id}: a scored lesson has no shape`);
    if (!L.score && !L.chart) continue;
    const { abc, bpm, target, sections } = scoreFor(L), n = parseScore(abc, abcjs).bars.length;
    assert.ok(Number.isInteger(bpm) && bpm > 0, `${id}: bpm`);
    assert.ok(target >= bpm, `${id}: target ${target} below bpm ${bpm}`);
    assert.ok(Array.isArray(sections) && sections.length, `${id}: sections`);
    for (const s of sections) assert.ok(s.from >= 1 && s.from <= s.to && s.to <= n, `${id}: section ${s.name} ${s.from}–${s.to} of ${n} bars`);
  }
});

test("hasScore is true for score/chart/sightread lessons, false otherwise", () => {
  assert.equal(hasScore(LESSONS["pno-minuet"]), true);
  assert.equal(hasScore(LESSONS["pno-sight"]), true);
  assert.equal(hasScore(LESSONS["pop-four-chords"]), true);
  assert.equal(hasScore(LESSONS["pno-ear"]), false);
});

test("a chart lesson writes out to a two-hand score with its chord symbols", () => {
  const S = scoreFor(LESSONS["pop-four-chords"]), s = parseScore(S.abc, abcjs);
  assert.equal(s.bars.length, 8);
  assert.ok(S.abc.includes('"Am"'));
  assert.ok(s.notes.some((n) => n.hand === "L") && s.notes.some((n) => n.hand === "R"));
  assert.equal(scoreFor(LESSONS["pop-four-chords"]), S);
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

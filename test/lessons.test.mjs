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
test("bass open E is MIDI 28", () => {
  assert.deepEqual(stringsToMidi([0, "x", "x", "x"], "bass"), [28]);
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
import { SEED, trackItems } from "../src/seed.js";

const validIds = new Set([...SEED.map((s) => s.id), ...trackItems().map((s) => s.id)]);
const STRINGS = { guitar: 6, bass: 4 };

const validateShape = (shape) => {
  if (shape == null) return;
  assert.ok(["chords", "fretboard", "keyboard"].includes(shape.kind), `bad shape.kind ${shape.kind}`);
  if (shape.kind === "chords") {
    assert.ok(STRINGS[shape.instrument], `bad chords instrument ${shape.instrument}`);
    for (const c of shape.chords) {
      assert.ok(typeof c.name === "string" && c.name.length, "chord needs a name");
      assert.equal(c.strings.length, STRINGS[shape.instrument], `${c.name}: wrong string count`);
      for (const f of c.strings) assert.ok(f === "x" || (Number.isInteger(f) && f >= 0), `${c.name}: bad fret ${f}`);
    }
  }
  if (shape.kind === "fretboard") {
    assert.ok(STRINGS[shape.instrument], `bad fretboard instrument ${shape.instrument}`);
    for (const d of shape.dots) assert.ok(d.string >= 0 && d.string < STRINGS[shape.instrument] && d.fret >= 0, "bad dot");
  }
  if (shape.kind === "keyboard") for (const n of shape.notes) assert.ok(typeof n.name === "string" && Number.isInteger(n.octave), "bad keyboard note");
};

test("every lesson id maps to a real exercise", () => {
  for (const id of Object.keys(LESSONS)) assert.ok(validIds.has(id), `orphan lesson id: ${id}`);
});
test("every lesson conforms to the schema", () => {
  for (const [id, L] of Object.entries(LESSONS)) {
    assert.ok(typeof L.summary === "string" && L.summary.length, `${id}: missing summary`);
    assert.ok(Array.isArray(L.steps) && L.steps.length >= 1, `${id}: needs >= 1 step`);
    assert.ok(Array.isArray(L.watch), `${id}: watch must be an array`);
    assert.ok(L.shape || L.prescribe, `${id}: needs a shape or a prescription`);
    validateShape(L.shape ?? null);
  }
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

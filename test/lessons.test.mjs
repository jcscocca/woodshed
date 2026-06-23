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

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

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

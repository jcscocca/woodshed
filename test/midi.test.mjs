import assert from "node:assert/strict";
const { parseMidi, createKeyState, toNoteEvent, groupChords, createTakeBuffer } = await import("../src/midi/midiModel.js");

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };
const on = (note, velocity, t, inputId = "a") => parseMidi([0x90, note, velocity], t, inputId);
const off = (note, t, inputId = "a") => parseMidi([0x80, note, 0], t, inputId);
const pedal = (down, t) => parseMidi([0xb0, 64, down ? 127 : 0], t, "a");

test("parse: note-on, note-off, velocity-0 off, any channel", () => {
  assert.deepEqual(parseMidi([0x90, 60, 100], 5, "a"), { type: "on", note: 60, velocity: 100, t: 5, inputId: "a" });
  assert.deepEqual(parseMidi([0x80, 60, 40], 6, "a"), { type: "off", note: 60, t: 6, inputId: "a" });
  assert.deepEqual(parseMidi([0x90, 60, 0], 7, "a"), { type: "off", note: 60, t: 7, inputId: "a" });
  assert.equal(parseMidi([0x93, 62, 90], 8, "a").type, "on");
});
test("parse: sustain pedal down/up; other messages ignored", () => {
  assert.deepEqual(parseMidi([0xb0, 64, 127], 1, "a"), { type: "pedal", down: true, t: 1, inputId: "a" });
  assert.equal(parseMidi([0xb0, 64, 10], 1, "a").down, false);
  assert.equal(parseMidi([0xb0, 7, 100], 1, "a"), null);   // volume CC
  assert.equal(parseMidi([0xe0, 0, 64], 1, "a"), null);    // pitch bend
  assert.equal(parseMidi([0xfe], 1, "a"), null);           // active sensing
});
test("keys: held keys with velocity; pedal never counts as held", () => {
  const k = createKeyState();
  k.apply(on(64, 80, 0)); k.apply(on(60, 100, 1)); k.apply(pedal(true, 2)); k.apply(off(64, 3));
  assert.deepEqual(k.held(), [{ note: 60, velocity: 100 }]);
  assert.equal(k.pedal, true);
});
test("keys: note-off matches per input", () => {
  const k = createKeyState();
  k.apply(on(60, 90, 0, "a")); k.apply(on(60, 70, 0, "b")); k.apply(off(60, 1, "a"));
  assert.deepEqual(k.held(), [{ note: 60, velocity: 70 }]);
});
test("note event matches the coach's event shape", () => {
  assert.deepEqual(toNoteEvent(on(61, 127, 12.5)), { midi: 61, name: "C#", octave: 4, tStart: 12.5, peak: 1 });
});
test("chords: onsets within 60ms group; 61ms starts a new chord", () => {
  const ev = [on(60, 90, 0), on(64, 90, 30), on(67, 90, 60), on(72, 90, 121)].map(toNoteEvent);
  const g = groupChords(ev);
  assert.deepEqual(g.map((c) => c.midis), [[60, 64, 67], [72]]);
  assert.equal(g[0].tStart, 0);
});
test("take: last take starts after the last >=3s gap with no keys held", () => {
  const b = createTakeBuffer();
  for (const m of [on(60, 90, 0), off(60, 500), on(62, 80, 4000), off(62, 4400), on(64, 70, 4500), off(64, 5000)]) b.push(m);
  assert.deepEqual(b.lastTake(), [{ midi: 62, t0: 0, dur: 400, velocity: 80 }, { midi: 64, t0: 500, dur: 500, velocity: 70 }]);
});
test("take: the pedal extends durations but a held pedal isn't a held key", () => {
  const b = createTakeBuffer();
  for (const m of [pedal(true, 0), on(60, 90, 0), off(60, 200), pedal(false, 1000)]) b.push(m);
  assert.deepEqual(b.lastTake(), [{ midi: 60, t0: 0, dur: 1000, velocity: 90 }]);
});
test("take: events older than the window drop out", () => {
  const b = createTakeBuffer({ windowMs: 60000 });
  b.push(on(60, 90, 0)); b.push(off(60, 100));
  b.push(on(62, 90, 70000)); b.push(off(62, 70100));
  assert.deepEqual(b.lastTake().map((n) => n.midi), [62]);
});
test("take: empty buffer gives an empty take", () => assert.deepEqual(createTakeBuffer().lastTake(), []));

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

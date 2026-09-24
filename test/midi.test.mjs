import assert from "node:assert/strict";
const { parseMidi, createKeyState, toNoteEvent, groupChords, createTakeBuffer } = await import("../src/midi/midiModel.js");
const { nameChord } = await import("../src/midi/chords.js");
const { createMidiConnection } = await import("../src/midi/connection.js");

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
test("take: pedal held across the window boundary still extends a note", () => {
  const b = createTakeBuffer();
  for (const m of [pedal(true, 0), on(60, 90, 100), off(60, 200), on(62, 80, 59000), off(62, 59200), pedal(false, 65000)]) b.push(m);
  assert.deepEqual(b.lastTake(), [{ midi: 62, t0: 0, dur: 6000, velocity: 80 }]);
});
test("take: a note-off whose note-on aged out is ignored", () => {
  const b = createTakeBuffer({ windowMs: 60000 });
  b.push(on(60, 90, 0));
  b.push(off(60, 70000));
  assert.deepEqual(b.lastTake(), []);
});
test("take: events older than the window drop out", () => {
  const b = createTakeBuffer({ windowMs: 60000 });
  b.push(on(60, 90, 0)); b.push(off(60, 100));
  b.push(on(62, 90, 70000)); b.push(off(62, 70100));
  assert.deepEqual(b.lastTake().map((n) => n.midi), [62]);
});
test("take: empty buffer gives an empty take", () => assert.deepEqual(createTakeBuffer().lastTake(), []));

const CHORDS = [
  [[60, 64, 67], "C"], [[64, 67, 72], "C/E"], [[55, 60, 64], "C/G"], [[57, 60, 64], "Am"],
  [[59, 62, 65], "Bdim"], [[60, 64, 68], "Caug"], [[60, 62, 67], "Csus2"], [[55, 60, 62], "Gsus4"],
  [[60, 64, 67, 69], "C6"], [[57, 60, 64, 67], "Am7"], [[62, 65, 69, 71], "Dm6"], [[55, 59, 62, 65], "G7"],
  [[60, 64, 67, 71], "Cmaj7"], [[62, 65, 69, 72], "Dm7"], [[59, 62, 65, 69], "Bm7b5"], [[59, 62, 65, 68], "Bdim7"],
  [[60, 63, 67, 71], "Cm(maj7)"], [[62, 65, 72], "Dm7 shell"], [[55, 65, 71], "G7 shell"], [[60, 64, 71], "Cmaj7 shell"],
  [[63, 67, 70], "Eb"], [[66, 69, 73], "F#m"], [[58, 62, 65, 68], "Bb7"], [[56, 60, 63, 67], "Abmaj7"],
  [[61, 65, 68], "Db"], [[36, 64, 79], "C"], [[48, 60, 64, 67, 72], "C"], [[59, 62, 65, 67], "G7/B"],
  [[65, 69, 72, 74], "F6"], [[60], null], [[60, 67], null], [[60, 61, 62], null], [[], null],
];
test("nameChord: the table", () => {
  for (const [midis, want] of CHORDS) assert.equal(nameChord(midis), want, `${midis.join(",")}`);
});

const fakeInput = (id, name) => ({ id, name, state: "connected", onmidimessage: null });
const fakeAccess = (inputs) => ({ inputs: new Map(inputs.map((i) => [i.id, i])), onstatechange: null });
const flush = () => new Promise((r) => setTimeout(r, 0));

test("connection: unsupported without Web MIDI", () => {
  assert.equal(createMidiConnection({ requestAccess: null }).status, "unsupported");
});
await (async () => {
  const input = fakeInput("p", "Yamaha P-125"), access = fakeAccess([input]);
  const c = createMidiConnection({ requestAccess: async () => access, queryPermission: async () => "prompt" });
  const seen = [], statuses = [];
  c.onMessage((data, t, id) => seen.push([data[1], t, id]));
  c.onStatus((s) => statuses.push(s.status));
  await c.autoConnect(); await flush();
  test("connection: autoConnect waits for a granted permission", () => assert.equal(c.status, "idle"));
  await c.connect();
  test("connection: connect reports the device", () => { assert.equal(c.status, "connected"); assert.equal(c.deviceName, "Yamaha P-125"); });
  input.onmidimessage({ data: Uint8Array.from([0x90, 60, 100]), timeStamp: 42, target: input });
  test("connection: messages carry data, timestamp and input id", () => assert.deepEqual(seen, [[60, 42, "p"]]));
  input.state = "disconnected"; access.onstatechange({});
  test("connection: unplug -> disconnected", () => assert.equal(c.status, "disconnected"));
  input.state = "connected"; access.onstatechange({});
  test("connection: replug -> connected", () => assert.equal(c.status, "connected"));
  c.close();
  test("connection: close detaches handlers", () => { assert.equal(input.onmidimessage, null); assert.equal(access.onstatechange, null); });
})();
await (async () => {
  const c = createMidiConnection({ requestAccess: async () => fakeAccess([fakeInput("p", "P")]), queryPermission: async () => "granted" });
  await c.autoConnect();
  test("connection: autoConnect connects silently when granted", () => assert.equal(c.status, "connected"));
  const d = createMidiConnection({ requestAccess: async () => { throw new Error("no"); } });
  await d.connect();
  test("connection: a refused request -> denied", () => assert.equal(d.status, "denied"));
})();
await (async () => {
  const input = fakeInput("p", "P"), access = fakeAccess([input]);
  let resolveFirst, calls = 0;
  const requestAccess = () => { calls++; return calls === 1 ? new Promise((r) => { resolveFirst = r; }) : Promise.resolve(access); };
  const c = createMidiConnection({ requestAccess, queryPermission: async () => "granted" });
  const seen = [];
  c.onMessage((data) => seen.push(data[1]));
  const pending = c.autoConnect();
  await flush();
  c.close();
  resolveFirst(access);
  await pending;
  test("connection: close cancels a pending autoConnect", () => { assert.equal(input.onmidimessage, null); assert.notEqual(c.status, "connected"); });
  await c.autoConnect();
  test("connection: a later autoConnect still works after close", () => assert.equal(c.status, "connected"));
  input.onmidimessage({ data: Uint8Array.from([0x90, 60, 100]), timeStamp: 1, target: input });
  test("connection: messages arrive exactly once per note", () => assert.deepEqual(seen, [60]));
})();
await (async () => {
  const input = fakeInput("p2", "P2"), access = fakeAccess([input]);
  let resolveFirst, calls = 0;
  const requestAccess = () => { calls++; return calls === 1 ? new Promise((r) => { resolveFirst = r; }) : Promise.resolve(access); };
  const d = createMidiConnection({ requestAccess });
  const pending = d.connect();
  await flush();
  d.close();
  resolveFirst(access);
  await pending;
  test("connection: close cancels a pending connect", () => { assert.equal(input.onmidimessage, null); assert.notEqual(d.status, "connected"); });
  await d.connect();
  test("connection: a later connect still works after close", () => assert.equal(d.status, "connected"));
})();

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

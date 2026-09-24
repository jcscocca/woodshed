# Piano over MIDI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A piano-only USB-MIDI input path for Woodshed's desktop layout: an 88-key band with chord naming and play-back (phase 1), then exact lesson grading and Echo over MIDI (phase 2).

**Architecture:** Pure modules in `src/midi/` (message model, chord naming, take buffer, connection manager) are node-tested; a thin `MidiProvider` owns the one browser MIDI connection and exposes only rarely-changing values; the band/readout subscribe for held keys; a tiny overlay store carries lesson targets and coach state to the band without touching App. Phase 2 feeds MIDI note events into the existing pure graders plus a new `gradeChords`.

**Tech Stack:** React 18, Vite 5, Web MIDI API (Chrome/Edge), plain-node test scripts.

**Spec:** `docs/superpowers/specs/2026-09-24-piano-midi-design.md` — read it first; it is binding. Direction: `docs/DIRECTION.md`.

## Global Constraints

- Piano only. Do not modify guitar code paths. `COACH_ENABLED` in `src/features.js` (the mic coach) stays `false`.
- Desktop layout only (≥1024px): the MIDI provider is mounted with `enabled = desktop && data.settings.enabled.piano`; the phone layout must look and behave exactly as before.
- App must never consume the MIDI context or the practice context (per-event re-renders stay in the band/readout/panels).
- The app never sounds live MIDI input. App audio = lesson demos and play-back only.
- Class names: `.ws-midi-band`, `.ws-midi-keys`, `.ws-midi-readout` (and `.ws-midi-*` children). `.ws-strip` and `.ws-keys` are taken.
- Chord and note spelling in names: ASCII `b`/`#` like existing chord names ("Bb", "m7b5"); roots spelled C Db D Eb E F F# G Ab A Bb B.
- Every commit passes `npm test` and `npm run build`. Tests are plain node scripts in the repo style (`ok   name` / `FAIL name`, `all green`, non-zero exit on failure — copy the harness from `test/desktop.test.mjs`); new test files are wired into `package.json` `"test"`.
- Modules imported by node tests must not import React or touch `import.meta.env`.
- Code style (owner is strict): smallest diff that works; match surrounding idiom and low comment density; no comments restating code; no abstractions beyond this plan.
- Don't push. Branch: `piano-midi`.

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/midi/midiModel.js` | new | parseMidi, key state, note events, groupChords, take buffer |
| `src/midi/chords.js` | new | nameChord |
| `src/midi/connection.js` | new | MIDIAccess connection manager |
| `src/midi/fakeMidi.js` | new | dev-only fake MIDIAccess (`?fakemidi`) |
| `src/midi/overlay.js` | new | tiny store: lesson targets + coach state for the band |
| `src/midi/MidiProvider.jsx` | new | provider + `useMidi`, `useOverlay` |
| `src/midi/MidiBand.jsx` | new | the 88-key band + readout |
| `src/lessonAudio.js` | modify | `playTake(notes)` |
| `src/App.jsx` | modify | mount provider + band |
| `src/PracticeTools.jsx`, `src/PracticeRail.jsx` | modify | compact stopwatch row on desktop |
| `src/LessonSheet.jsx` | modify | publish lesson targets; hide keyboard diagram when band open; (P2) coach source |
| `src/shortcuts.js`, `src/useShortcuts.js` | modify | K, P, (P2) C |
| `src/coach.js`, `src/audio/notes.js` | modify (P2) | gradeChords, touchEvenness, hands-together targets |
| `src/midi/useMidiCoach.js` | new (P2) | MIDI input hook with useCoach's API |
| `src/CoachPanel.jsx`, `src/EarPanel.jsx` | modify (P2) | MIDI source for piano |
| `src/seed.js`, `src/storage.js`, `src/lessons/piano.js` | modify (P2) | piano Echo back; hands-together shapes |
| `src/styles.css` | modify | band, readout, compact stopwatch |
| `test/midi.test.mjs` | new | model, chords, connection |

---

# Phase 1

### Task 1: MIDI message model and take buffer

**Files:** Create `src/midi/midiModel.js`, `test/midi.test.mjs`; modify `package.json`.

**Interfaces (produces):**
- `parseMidi(data, t, inputId = "")` → `{ type: "on", note, velocity, t, inputId } | { type: "off", note, t, inputId } | { type: "pedal", down, t, inputId } | null`
- `createKeyState()` → `{ apply(msg), held() → [{ note, velocity }] sorted by note, pedal (getter), clear() }`
- `toNoteEvent(msg)` → `{ midi, name, octave, tStart, peak }` (peak = velocity/127) for an `on` message
- `groupChords(events, windowMs = 60)` → `[{ midis (sorted unique), tStart, peaks }]`
- `createTakeBuffer({ windowMs = 60000, gapMs = 3000 })` → `{ push(msg, now = msg.t), lastTake() → [{ midi, t0, dur, velocity }] }` — `t0` in ms from the take's first note

- [ ] **Step 1: Write the failing tests** — `test/midi.test.mjs` (harness copied from `test/desktop.test.mjs`):

```js
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
```

- [ ] **Step 2: Wire and run** — add `"test:midi": "node test/midi.test.mjs"` to `package.json` and append ` && npm run test:midi` to `"test"`. Run `node test/midi.test.mjs` → fails (module not found).

- [ ] **Step 3: Implement** `src/midi/midiModel.js`:

```js
// Piano MIDI, pure: raw messages -> note events, held keys, chords and takes.
import { midiToNote } from "../audio/notes.js";

export function parseMidi(data, t, inputId = "") {
  const status = data[0] & 0xf0, d1 = data[1], d2 = data[2];
  if (status === 0x90 && d2 > 0) return { type: "on", note: d1, velocity: d2, t, inputId };
  if (status === 0x80 || status === 0x90) return { type: "off", note: d1, t, inputId };
  if (status === 0xb0 && d1 === 64) return { type: "pedal", down: d2 >= 64, t, inputId };
  return null;
}

export function createKeyState() {
  const keys = new Map(); // "input:note" -> { note, velocity }
  let pedal = false;
  return {
    apply(m) {
      if (!m) return;
      if (m.type === "on") keys.set(`${m.inputId}:${m.note}`, { note: m.note, velocity: m.velocity });
      else if (m.type === "off") keys.delete(`${m.inputId}:${m.note}`);
      else pedal = m.down;
    },
    held() {
      const byNote = new Map();
      for (const k of keys.values()) byNote.set(k.note, Math.max(byNote.get(k.note) || 0, k.velocity));
      return [...byNote].sort((a, b) => a[0] - b[0]).map(([note, velocity]) => ({ note, velocity }));
    },
    get pedal() { return pedal; },
    clear() { keys.clear(); pedal = false; },
  };
}

export const toNoteEvent = (m) => ({ ...midiToNote(m.note), tStart: m.t, peak: m.velocity / 127 });

export function groupChords(events, windowMs = 60) {
  const out = [];
  for (const e of events) {
    const last = out[out.length - 1];
    if (last && e.tStart - last.tStart <= windowMs) { if (!last.midis.includes(e.midi)) last.midis.push(e.midi); last.peaks.push(e.peak); }
    else out.push({ midis: [e.midi], tStart: e.tStart, peaks: [e.peak] });
  }
  for (const c of out) c.midis.sort((a, b) => a - b);
  return out;
}

// Always-on recorder: raw messages for the last windowMs; lastTake() replays
// them into notes (durations extended by the sustain pedal) and keeps only the
// notes after the last gap of >= gapMs with no key physically held.
export function createTakeBuffer({ windowMs = 60000, gapMs = 3000 } = {}) {
  const log = [];
  return {
    push(m, now = m && m.t) {
      if (!m) return;
      log.push(m);
      while (log.length && log[0].t < now - windowMs) log.shift();
    },
    lastTake() {
      const notes = [], open = new Map(), sustained = [];
      let pedal = false;
      const end = (n, t) => { n.dur = t - n.t0; };
      for (const m of log) {
        const k = `${m.inputId}:${m.note}`;
        if (m.type === "on") { const n = { midi: m.note, t0: m.t, dur: 0, velocity: m.velocity, up: Infinity }; notes.push(n); open.set(k, n); }
        else if (m.type === "off") { const n = open.get(k); if (!n) continue; open.delete(k); n.up = m.t; if (pedal) sustained.push(n); else end(n, m.t); }
        else { pedal = m.down; if (!pedal) { for (const n of sustained) end(n, m.t); sustained.length = 0; } }
      }
      const last = log.length ? log[log.length - 1].t : 0;
      for (const n of [...open.values(), ...sustained]) end(n, Math.max(last, n.up === Infinity ? last : n.up));
      let start = 0, heldUntil = -Infinity;
      notes.forEach((n, i) => { if (n.t0 - heldUntil >= gapMs) start = i; heldUntil = Math.max(heldUntil, n.up === Infinity ? last : n.up); });
      const take = notes.slice(start);
      const t0 = take.length ? take[0].t0 : 0;
      return take.map((n) => ({ midi: n.midi, t0: n.t0 - t0, dur: n.dur, velocity: n.velocity }));
    },
  };
}
```

- [ ] **Step 4: Run** `node test/midi.test.mjs` → all `ok`, `all green`; `npm test` exit 0; `npm run build` succeeds.

- [ ] **Step 5: Commit** — `git add src/midi/midiModel.js test/midi.test.mjs package.json && git commit -m "feat(midi): message model, held keys, chord grouping, take buffer"`

---

### Task 2: Chord naming

**Files:** Create `src/midi/chords.js`; modify `test/midi.test.mjs`.

**Interfaces (produces):** `nameChord(midis: number[]) → string | null`.

**Rules (from the spec):** fewer than 3 distinct pitch classes → `null`. For each pitch class present as a candidate root, compute the interval set and match exactly against the templates below (order = preference). Among matches, prefer the root that equals the lowest note's pitch class; otherwise the first match in template order. Name = root spelling + suffix, plus `/<bass>` when the chosen root isn't the lowest note. No match → `null`.

Templates (suffix: intervals): `"": 0 4 7` · `m: 0 3 7` · `dim: 0 3 6` · `aug: 0 4 8` · `sus2: 0 2 7` · `sus4: 0 5 7` · `6: 0 4 7 9` · `m6: 0 3 7 9` · `7: 0 4 7 10` · `maj7: 0 4 7 11` · `m7: 0 3 7 10` · `m7b5: 0 3 6 10` · `dim7: 0 3 6 9` · `m(maj7): 0 3 7 11` · `maj7 shell: 0 4 11` · `7 shell: 0 4 10` · `m7 shell: 0 3 10`. Root spellings: `C Db D Eb E F F# G Ab A Bb B`. A shell suffix is written with a space: `Cmaj7 shell`.

- [ ] **Step 1: Failing tests** — append to `test/midi.test.mjs` (before the `process.on("exit"…)` line), and add `nameChord` to the imports (`const { nameChord } = await import("../src/midi/chords.js");`):

```js
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
```

- [ ] **Step 2: Run** → fails (module not found).

- [ ] **Step 3: Implement** `src/midi/chords.js`:

```js
// Names the chord you're holding. Exact pitch-class match against templates;
// ties go to the reading whose root is the lowest note, else template order.
const ROOTS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const TEMPLATES = [
  ["", [0, 4, 7]], ["m", [0, 3, 7]], ["dim", [0, 3, 6]], ["aug", [0, 4, 8]], ["sus2", [0, 2, 7]], ["sus4", [0, 5, 7]],
  ["6", [0, 4, 7, 9]], ["m6", [0, 3, 7, 9]], ["7", [0, 4, 7, 10]], ["maj7", [0, 4, 7, 11]], ["m7", [0, 3, 7, 10]],
  ["m7b5", [0, 3, 6, 10]], ["dim7", [0, 3, 6, 9]], ["m(maj7)", [0, 3, 7, 11]],
  ["maj7 shell", [0, 4, 11]], ["7 shell", [0, 4, 10]], ["m7 shell", [0, 3, 10]],
];

export function nameChord(midis) {
  const pcs = [...new Set(midis.map((m) => ((m % 12) + 12) % 12))];
  if (pcs.length < 3) return null;
  const bass = ((Math.min(...midis) % 12) + 12) % 12;
  let best = null;
  for (const [ti, [suffix, ivs]] of TEMPLATES.entries()) {
    for (const root of pcs) {
      const set = pcs.map((p) => (p - root + 12) % 12).sort((a, b) => a - b);
      if (set.length !== ivs.length || set.some((v, i) => v !== ivs[i])) continue;
      const rank = (root === bass ? 0 : 1000) + ti;
      if (!best || rank < best.rank) best = { rank, root, suffix };
    }
  }
  if (!best) return null;
  const name = `${ROOTS[best.root]}${best.suffix}`;
  return best.root === bass ? name : `${name}/${ROOTS[bass]}`;
}
```

- [ ] **Step 4: Run** → `all green`; `npm test` exit 0; `npm run build` succeeds.

- [ ] **Step 5: Commit** — `git commit -am "feat(midi): name the held chord"` (after `git add src/midi/chords.js`).

---

### Task 3: Connection manager and dev simulator

**Files:** Create `src/midi/connection.js`, `src/midi/fakeMidi.js`; modify `test/midi.test.mjs`.

**Interfaces (produces):**
- `createMidiConnection({ requestAccess, queryPermission })` → `{ status (getter), deviceName (getter), connect(), autoConnect(), onMessage(fn(data, t, inputId)) → off, onStatus(fn({ status, deviceName })) → off, close() }`. Status: `"unsupported"` when `requestAccess` is null; else `"idle"` → `"connected"` / `"disconnected"` (access granted, no input) / `"denied"`.
- `installFakeMidi()` → a fake MIDIAccess; sets `window.__fakeMidi = { press(note, velocity = 90), release(note), pedal(down), unplug(), plug() }`.

- [ ] **Step 1: Failing tests** — add before the `process.on("exit"…)` line (import `createMidiConnection` from `../src/midi/connection.js`):

```js
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
```

- [ ] **Step 2: Run** → fails.

- [ ] **Step 3: Implement** `src/midi/connection.js`:

```js
// The one MIDI connection, pure: works against any MIDIAccess-shaped object
// (the browser's, or a fake in tests and dev). Listens on every input.
export function createMidiConnection({ requestAccess, queryPermission }) {
  let access = null, status = requestAccess ? "idle" : "unsupported", deviceName = "";
  const msgFns = new Set(), statusFns = new Set();
  const set = (s) => { status = s; for (const f of statusFns) f({ status, deviceName }); };
  const onMidi = (e) => { for (const f of msgFns) f(e.data, e.timeStamp, e.target && e.target.id); };
  const refresh = () => {
    const inputs = [...access.inputs.values()].filter((i) => i.state !== "disconnected");
    for (const i of inputs) i.onmidimessage = onMidi;
    deviceName = inputs.map((i) => i.name).filter(Boolean).join(" + ");
    set(inputs.length ? "connected" : "disconnected");
  };
  const attach = (a) => { access = a; access.onstatechange = refresh; refresh(); };
  return {
    get status() { return status; },
    get deviceName() { return deviceName; },
    async connect() {
      if (!requestAccess) return;
      try { attach(await requestAccess()); } catch { set("denied"); }
    },
    async autoConnect() {
      if (!requestAccess || !queryPermission) return;
      try { if ((await queryPermission()) === "granted") attach(await requestAccess()); } catch { /* stay idle: the button still works */ }
    },
    onMessage(fn) { msgFns.add(fn); return () => msgFns.delete(fn); },
    onStatus(fn) { statusFns.add(fn); return () => statusFns.delete(fn); },
    close() {
      if (!access) return;
      for (const i of access.inputs.values()) i.onmidimessage = null;
      access.onstatechange = null;
      access = null;
    },
  };
}
```

`src/midi/fakeMidi.js`:

```js
// Dev only (?fakemidi): a fake MIDIAccess you can play from the console or
// browser automation, e.g. window.__fakeMidi.press(60, 90).
export function installFakeMidi() {
  const input = { id: "fake", name: "Fake keyboard", state: "connected", onmidimessage: null };
  const access = { inputs: new Map([["fake", input]]), onstatechange: null };
  const send = (data) => input.onmidimessage && input.onmidimessage({ data: Uint8Array.from(data), timeStamp: performance.now(), target: input });
  window.__fakeMidi = {
    press: (note, velocity = 90) => send([0x90, note, velocity]),
    release: (note) => send([0x80, note, 0]),
    pedal: (down) => send([0xb0, 64, down ? 127 : 0]),
    unplug: () => { input.state = "disconnected"; access.onstatechange && access.onstatechange({}); },
    plug: () => { input.state = "connected"; access.onstatechange && access.onstatechange({}); },
  };
  return access;
}
```

- [ ] **Step 4: Run** → `all green`; `npm test` exit 0; build succeeds.
- [ ] **Step 5: Commit** — `feat(midi): connection manager and a dev-only fake keyboard`.

---

### Task 4: Provider, overlay store, play-back, App mount

**Files:** Create `src/midi/overlay.js`, `src/midi/MidiProvider.jsx`; modify `src/lessonAudio.js`, `src/App.jsx`.

**Interfaces (produces):**
- `overlay` (from `src/midi/overlay.js`): `{ get(), set(patch), reset(), subscribe(fn) → off }`; state `{ targets: [{ midi, finger }], range: [lo, hi] | null, statuses: string[] | null, next: number, readout: { head, line } | null, busy: boolean, hideTargets: boolean }`.
- `MidiProvider({ enabled, children })`; `useMidi()` → `null` when not mounted/disabled, else `{ status, deviceName, connect, subscribe(fn(msg)) → off, playLastTake, bandOpen, setBandOpen }` (`msg` is a parsed message from `parseMidi`); `useOverlay()` → overlay state.
- `playTake(notes)` in `src/lessonAudio.js` → ms until the take ends (0 for none).

- [ ] **Step 1: `src/midi/overlay.js`**

```js
// What the open piano lesson and its coach run want drawn on the band. A tiny
// store so lesson/coach state reaches the band without going through App.
const EMPTY = { targets: [], range: null, statuses: null, next: -1, readout: null, busy: false, hideTargets: false };
let state = EMPTY;
const subs = new Set();

export const overlay = {
  get: () => state,
  set(patch) { state = { ...state, ...patch }; for (const f of subs) f(state); },
  reset() { state = EMPTY; for (const f of subs) f(state); },
  subscribe(f) { subs.add(f); return () => subs.delete(f); },
};
```

- [ ] **Step 2: `playTake` in `src/lessonAudio.js`** — add `import { midiToFreq } from "./audio/notes.js";` at the top and, after `playSequence`:

```js
// A recorded take: [{ midi, t0 (ms from start), dur (ms), velocity }].
export function playTake(notes) {
  stop();
  if (!notes.length) return 0;
  const ac = getCtx(); if (ac.state === "suspended") ac.resume();
  const t = ac.currentTime + 0.06;
  let end = 0;
  for (const n of notes) {
    pluck(ac, midiToFreq(n.midi), t + n.t0 / 1000, Math.max(0.12, n.dur / 1000), 0.05 + 0.2 * (n.velocity / 127));
    end = Math.max(end, n.t0 + n.dur);
  }
  return end + 60;
}
```

- [ ] **Step 3: `src/midi/MidiProvider.jsx`**

```jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createMidiConnection } from "./connection.js";
import { parseMidi, createTakeBuffer } from "./midiModel.js";
import { overlay } from "./overlay.js";
import { playTake } from "../lessonAudio.js";

const MidiContext = createContext(null);
export const useMidi = () => useContext(MidiContext);
export const useOverlay = () => useSyncExternalStore(overlay.subscribe, overlay.get);

function browserAccess() {
  if (import.meta.env.DEV && new URLSearchParams(location.search).has("fakemidi"))
    return { requestAccess: async () => (await import("./fakeMidi.js")).installFakeMidi(), queryPermission: async () => "granted" };
  return {
    requestAccess: navigator.requestMIDIAccess ? () => navigator.requestMIDIAccess() : null,
    queryPermission: navigator.permissions ? async () => (await navigator.permissions.query({ name: "midi" })).state : null,
  };
}

// The one MIDI connection (piano, desktop). The context value changes only with
// the connection status or band state; played notes reach subscribers directly.
export function MidiProvider({ enabled, children }) {
  const conn = useMemo(() => (enabled ? createMidiConnection(browserAccess()) : null), [enabled]);
  const [state, setState] = useState({ status: conn ? conn.status : "off", deviceName: "" });
  const [bandOpen, setBandOpen] = useState(true);
  const subs = useRef(new Set());
  const take = useRef(createTakeBuffer());

  useEffect(() => {
    if (!conn) return;
    setState({ status: conn.status, deviceName: conn.deviceName });
    const offStatus = conn.onStatus(setState);
    const offMsg = conn.onMessage((data, t, id) => {
      const m = parseMidi(data, t, id);
      if (!m) return;
      take.current.push(m);
      for (const f of subs.current) f(m);
    });
    conn.autoConnect();
    return () => { offStatus(); offMsg(); conn.close(); };
  }, [conn]);

  const value = useMemo(() => conn && {
    ...state,
    connect: () => conn.connect(),
    subscribe: (f) => { subs.current.add(f); return () => subs.current.delete(f); },
    playLastTake: () => { if (!overlay.get().busy) playTake(take.current.lastTake()); },
    bandOpen, setBandOpen,
  }, [conn, state, bandOpen]);

  return <MidiContext.Provider value={value}>{children}</MidiContext.Provider>;
}
```

- [ ] **Step 4: Mount in `src/App.jsx`** — import `{ MidiProvider }` from `./midi/MidiProvider.jsx` and wrap the layout ternary *and* `{dialogs}` inside `<PracticeProvider>` with `<MidiProvider enabled={desktop && !!data.settings.enabled.piano}> … </MidiProvider>`. App must not call `useMidi`/`useOverlay`.

- [ ] **Step 5: Verify** — `npm test` exit 0; `npm run build` succeeds; `grep -n "useMidi\|useOverlay" src/App.jsx` → nothing. Browser (dev server on 5299): the app renders at 1440×900 and at phone width with no console errors (nothing visible changes yet).
- [ ] **Step 6: Commit** — `feat(midi): provider, overlay store and play-back`.

---

### Task 5: The keyboard band and readout

**Files:** Create `src/midi/MidiBand.jsx`; modify `src/App.jsx`, `src/styles.css`.

**Interfaces:** Consumes `useMidi`, `useOverlay`, `createKeyState`, `nameChord`, `midiToNote`. Produces default export `MidiBand()` rendered as the last child of `div.ws-desk` (after `ShortcutBridge`).

**Requirements (spec §1; exact values):**
- Render nothing when `useMidi()` is `null` or `status === "unsupported"`.
- `.ws-desk` gains `grid-template-rows: minmax(0,1fr) auto`; `.ws-midi-band` has `grid-column: 1 / -1`, `display: grid; grid-template-columns: minmax(0,1fr) 380px`, `background: var(--bg2)`, `border-top: 1px solid var(--line)`, height **128px** open / **32px** collapsed.
- **Open** only when `status === "connected" && bandOpen`. Otherwise the collapsed bar: `idle`/`denied` → `[Connect keyboard]` button (calls `connect()`; for `denied` add "— allow MIDI in the site settings"); `disconnected` → `○ Keyboard disconnected`; `connected` but collapsed → one line `● <deviceName> · <chord or notes> · [▶] [⌃]`.
- **Keys cell** (`.ws-midi-keys`, `role="img"`, `aria-label` summarizing held notes, e.g. "Keyboard: C4 E4 G4 held" or "Keyboard: nothing held"): 88 keys A0 (21) – C8 (108), 52 white keys laid out by percentage (white width `100/52 %`, black width 60% of a white, centered on the boundary to its left white key's right edge); white 96px / black 58px tall; colors `#d8d0c0` / `#211e1a`; C labels (`C1`…`C8`) mono 10px at the bottom of each C key, C4 in `var(--gold-dim)`.
  - Held key background: `color-mix(in srgb, var(--gold) X%, <key color>)` with `X = 45 + 55 * velocity / 127` (rounded).
  - Overlay targets (when `!hideTargets`): 2px inset `var(--gold-dim)` outline and the finger numeral (mono 11px) where given; `next` target gets class `next` (pulsing outline, reuse the `ws-coach-pulse` timing); statuses `caught` → background overlay `rgba(95,168,160,.35)`, `missed` → `rgba(224,120,86,.3)`.
  - Overlay range: a non-interactive tint `rgba(227,169,72,.06)` over the keys from `range[0]` to `range[1]`.
- **Readout cell** (`.ws-midi-readout`, 380px): headline Bricolage 700 **40px**: `overlay.readout.head` if set, else `nameChord(held)` if non-null, else held note names (e.g. "C4 E4"), else "—"; line mono 12.5px: `overlay.readout.line` or the held note names without octaves ("C E G B"); `▶ Play back` button (calls `playLastTake()`), `● <deviceName>`, a collapse chevron (toggles `setBandOpen`). A visually hidden `aria-live="polite"` region contains only the chord name (so chords are announced, single notes never).
- Held keys: `useEffect` subscribes with a `createKeyState()` and sets state from `held()` on on/off messages (pedal messages don't re-render). Cleared (`[]`) when status leaves `connected`.

- [ ] **Step 1:** Build `MidiBand.jsx` to the requirements above; add the CSS block (all rules scoped to `.ws-midi-*` or `.ws-desk`).
- [ ] **Step 2:** Render `<MidiBand />` at the end of the desktop `div.ws-desk` in `App.jsx`.
- [ ] **Step 3: Verify** — `npm test` + `npm run build`. Browser, dev server on 5299 with `?fakemidi` at 1440×900: band open with 88 keys; `window.__fakeMidi.press(60,40); press(64,120); press(67,90)` → three keys lit, C4's the dimmest, E4's the brightest; readout shows "C" and "C E G"; add `press(71,90)` → "Cmaj7"; release all → "—"; `pedal(true)`, press+release 60, `pedal(false)`; Play back plays (label/no error; you can't hear it); collapse chevron → 32px line; `unplug()` → "○ Keyboard disconnected"; `plug()` → band back. Without `?fakemidi`: collapsed bar with Connect keyboard (don't click through the real permission prompt). Settings → turn piano off → no band. Phone preset → no band. No console errors. Stop the server; reset viewport.
- [ ] **Step 4: Commit** — `feat(midi): 88-key band with chord naming and play-back`.

---

### Task 6: Rail changes and the lesson on the band

**Files:** Modify `src/PracticeTools.jsx`, `src/PracticeRail.jsx`, `src/LessonSheet.jsx`, `src/styles.css`.

**Requirements (spec §1 "Rail changes", §2 overlay):**
- `PracticeTools({ hints = false, compact = false, stopwatchExtra = null })`: when `compact`, the stopwatch renders as one row `⏱ mm:ss [Start/Pause/Resume] [Reset] {stopwatchExtra}` with no note line. The phone sheet keeps calling `<PracticeTools />` (unchanged).
- `PracticeRail` passes `compact` and moves its Tuner button into `stopwatchExtra` (same markup, class and `metro.stop()` behavior; hidden while the tuner is open, as now).
- `LessonBody`: for piano lessons whose shape is `kind: "keyboard"`, publish on mount `overlay.set({ targets, range, statuses: null, next: -1, readout: null, busy: false, hideTargets: false })` where `targets = shapeToTargets(shape).targets.map((t, i) => ({ midi: t.midi, finger: shape.fingers ? shape.fingers[i] : null }))` and `range = [min, max]` of those midis; `overlay.reset()` on unmount. Non-piano or non-keyboard lessons don't touch the overlay.
- `LessonBody` hides `ShapeView` for a keyboard shape when `useMidi()` reports `status === "connected" && bandOpen` (the band shows the notes). Everything else renders as before; the phone sheet is unaffected (`useMidi()` is `null` there).
- [ ] **Step 1:** Implement; add CSS for the compact stopwatch row (scoped to a class only the compact variant uses).
- [ ] **Step 2: Verify** — `npm test` + build. Browser 1440×900 `?fakemidi`: the rail's stopwatch is one row with Tuner beside it; measure the lesson slot's top (it should move up ≈150px vs before); open "Major scales" → band shows 15 outlined keys C4–C6 with finger numbers and the range tint, and the rail hides the small keyboard diagram; collapse the band → the diagram returns; close the lesson → the band's outlines clear; a guitar lesson doesn't touch the band. Phone preset: practice sheet stopwatch unchanged (with its note line). No console errors.
- [ ] **Step 3: Commit** — `feat(midi): compact rail stopwatch; lesson notes on the band`.

---

### Task 7: Shortcuts K and P

**Files:** Modify `src/shortcuts.js`, `src/useShortcuts.js`, `test/desktop.test.mjs`.

- [ ] **Step 1: Failing tests** — in `test/desktop.test.mjs`: change the KEY_HELP length assertion to `10`, and add:

```js
test("K toggles the band, P plays back", () => {
  assert.deepEqual(actionFor(key("k")), { type: "band" });
  assert.deepEqual(actionFor(key("P", { shiftKey: true })), { type: "playback" });
  assert.equal(actionFor(key("p"), { typing: true }), null);
  assert.equal(actionFor(key("k"), { dialogOpen: true }), null);
  assert.equal(actionFor(key("p", { repeat: true })), null);
});
```

- [ ] **Step 2:** Run `node test/desktop.test.mjs` → fails.
- [ ] **Step 3: Implement** — in `actionFor`, after the `l` line: `if (k === "k") return { type: "band" };` and `if (k === "p") return { type: "playback" };`. In `KEY_HELP`, before `["Esc", …]`: `["K", "Keyboard band: show / hide"], ["P", "Play back what you just played"]`. In `ShortcutBridge`: `const midi = useMidi();` (import from `./midi/MidiProvider.jsx`) and in `run.current`: `else if (a.type === "band") { if (midi && midi.status === "connected") midi.setBandOpen((o) => !o); } else if (a.type === "playback") { if (midi && midi.status === "connected") midi.playLastTake(); }` — before the final `else onAction(a)`.
- [ ] **Step 4: Verify** — `npm test` + build; browser `?fakemidi`: K collapses/expands, P plays the last take, both do nothing with piano disabled; `?` list shows 10 entries.
- [ ] **Step 5: Commit** — `feat(midi): K toggles the keyboard band, P plays back`.

---

### Task 8: Phase 1 docs

**Files:** Modify `README.md`.
- [ ] Add a short "Piano over MIDI" subsection under "On the desktop": connect (Chrome/Edge, one-time prompt, reconnects), the band (lights by velocity, chord name, Play back replays your last phrase — nothing is saved), K/P shortcuts, piano-only and desktop-only. Add the `src/midi/` files to the file table (one line each). Keep the README's voice.
- [ ] Commit — `docs: README — piano over MIDI (band, chords, play-back)`.

---

# Phase 2

### Task 9: Chord grading, touch evenness, hands-together targets

**Files:** Modify `src/coach.js`, `src/audio/notes.js`, `test/coach.test.mjs`.

**Interfaces (produces):**
- `gradeChords(targets, chordEvents)` where `targets = [{ midis: number[], label }]`, `chordEvents = [{ midis }]` (from `groupChords`) → `{ results: [{ target, status: "caught"|"missed"|"pending", missing?: number[], extra?: number[] }], cursor, done, accuracy, missed: string[] }` (labels of missed/pending targets, like `gradeLine`).
  Rule: walk events in order against the current target. Exact set match → caught, advance. Else if the event matches the *next* target exactly → current missed (no diff), next caught, advance two. Else → current missed with `missing` (target notes not played) and `extra` (played notes not in the target), advance one.
- `touchEvenness(events)` → `null` for fewer than 4 events; else `{ band: cv <= 0.15 ? "even" : "uneven", cv }` over `peak` values (cv = population std / mean).
- `shapeToTargets` for a keyboard shape with `hands: "together"` → `{ mode: "chords", targets }` where each target is `{ midis: [rh - 12, rh], midi: rh, name, octave, label }` for each right-hand note `rh`. A keyboard shape with `play: "block"` keeps returning `mode: "arpeggio"` (the mic path); `useMidiCoach` converts it (Task 10).

- [ ] **Step 1: Failing tests** in `test/coach.test.mjs` (import the new functions):

```js
test("gradeChords: exact sets are caught", () => {
  const r = gradeChords([{ midis: [48, 60], label: "C" }, { midis: [50, 62], label: "D" }], [{ midis: [48, 60] }, { midis: [50, 62] }]);
  assert.deepEqual(r.results.map((x) => x.status), ["caught", "caught"]); assert.equal(r.accuracy, 100); assert.equal(r.done, true);
});
test("gradeChords: a missing and an extra note are reported", () => {
  const r = gradeChords([{ midis: [60, 64, 67], label: "C" }], [{ midis: [60, 64, 68] }]);
  assert.equal(r.results[0].status, "missed"); assert.deepEqual(r.results[0].missing, [67]); assert.deepEqual(r.results[0].extra, [68]);
  assert.deepEqual(r.missed, ["C"]);
});
test("gradeChords: skipping a target catches the next", () => {
  const r = gradeChords([{ midis: [48, 60], label: "C" }, { midis: [50, 62], label: "D" }, { midis: [52, 64], label: "E" }], [{ midis: [50, 62] }]);
  assert.deepEqual(r.results.map((x) => x.status), ["missed", "caught", "pending"]); assert.equal(r.cursor, 2);
});
test("hands together: right-hand notes pair with the octave below", () => {
  const { mode, targets } = shapeToTargets({ kind: "keyboard", hands: "together", notes: [{ name: "C", octave: 4 }, { name: "D", octave: 4 }] });
  assert.equal(mode, "chords"); assert.deepEqual(targets.map((t) => t.midis), [[48, 60], [50, 62]]);
});
test("touchEvenness: steady velocities are even, a spike is not", () => {
  const ev = (ps) => ps.map((peak, i) => ({ peak, tStart: i * 250 }));
  assert.equal(touchEvenness(ev([0.6, 0.62, 0.58, 0.6, 0.61])).band, "even");
  assert.equal(touchEvenness(ev([0.6, 0.6, 1.0, 0.3, 0.6])).band, "uneven");
  assert.equal(touchEvenness(ev([0.6, 0.6, 0.6])), null);
});
test("MIDI-shaped events grade through gradeLine unchanged", () => {
  const targets = shapeToTargets({ kind: "keyboard", notes: [{ name: "C", octave: 4 }, { name: "D", octave: 4 }] }).targets;
  const events = [{ midi: 60, name: "C", octave: 4, tStart: 0, peak: 0.7 }, { midi: 62, name: "D", octave: 4, tStart: 300, peak: 0.7 }];
  assert.equal(gradeLine(targets, events, { octaveStrict: true }).accuracy, 100);
});
```
(`shapeToTargets` comes from `../src/audio/notes.js`; check how `test/coach.test.mjs` already imports.)
- [ ] **Step 2:** Run `node test/coach.test.mjs` → fails.
- [ ] **Step 3:** Implement the three functions to the rules above, in the style of the surrounding code.
- [ ] **Step 4:** `npm test` exit 0 (existing coach/ear/lessons tests still green); build.
- [ ] **Step 5: Commit** — `feat(coach): grade chords as played, touch evenness, hands-together targets`.

---

### Task 10: `useMidiCoach`

**Files:** Create `src/midi/useMidiCoach.js`.

**Interface:** `useMidiCoach({ mode, targets, octaveStrict })` → `{ listening, error, result, start, stop, reset }` — same shape as `useCoach` (read `src/useCoach.js` and mirror its `result` fields: the grader result plus `timing: evenness(events)`, and add `touch: touchEvenness(events)`).
- Source: `useMidi().subscribe`. While listening, each `on` message → `toNoteEvent(msg)` appended to events; recompute the result on every event.
- Grading: `mode === "chords"` → `gradeChords(targets, groupChords(events))`; `mode === "arpeggio"` and every target lacks a `string` (a keyboard `play: "block"` shape) → treat the whole target list as one chord target `{ midis: targets.map(t => t.midi), label }` via `gradeChords`; `mode === "arpeggio"` otherwise → `gradeArpeggio`; `"line"` → `gradeLine(targets, events, { octaveStrict })`.
- `start()` when not connected sets `error: "Connect your keyboard to coach this."`; unplug while listening → stop and `error: "Keyboard disconnected."`; unmount → unsubscribe.
- [ ] Implement; `npm test` + build; commit `feat(midi): useMidiCoach — the coach's API fed by MIDI`.

---

### Task 11: Coach and Echo panels over MIDI

**Files:** Modify `src/LessonSheet.jsx`, `src/CoachPanel.jsx`, `src/EarPanel.jsx`, `src/shortcuts.js`, `src/useShortcuts.js`, `test/desktop.test.mjs`, `src/styles.css`.

**Requirements (spec §3–§4):**
- `LessonBody`: compute `source = item.inst === "piano" && midi && midi.status === "connected" ? "midi" : COACH_ENABLED ? "mic" : null`. Render `CoachPanel`/`EarPanel` with `key={source}` and a `source` prop when `source` is set. For piano lessons with notes (or Echo) when `midi` exists but isn't connected: show `<p className="ws-midi-connect-note">Connect your keyboard to coach this.</p>` (for Echo: "…to train this."); when `midi.status === "unsupported"`: "MIDI needs Chrome or Edge." On phone (`midi` null) render exactly as today.
- `CoachPanel`/`EarPanel` take `source` and call `useMidiCoach` when `source === "midi"`, `useCoach` otherwise (the `key` remount keeps the hook order stable). Piano stays `octaveStrict` in CoachPanel; Echo stays octave-forgiving.
- Coach me and Hear it share one row in the rail (desktop).
- While a MIDI run listens, publish to the overlay: `statuses` (per target), `next` (cursor), `busy: true`, `readout`: line mode `{ head: "<name> · <finger>", line: "<caught+missed> / <total>" }` (finger omitted when unknown); chord mode `{ head: <nameChord(target midis) or label>, line: held notes }`. On stop/finish: `busy: false`, keep statuses for the summary; on unmount the lesson's reset applies.
- Starting a MIDI run expands a collapsed band (`midi.setBandOpen(true)`); when a run finishes, `scrollIntoView({ block: "nearest" })` the summary.
- Summary adds a touch line next to timing: `touch: even` / `touch: a little uneven` (for `band === "uneven"`), same style as the existing timing line.
- Echo over MIDI: during the prompt and listen phases set `hideTargets: true` and `busy: true`; on reveal set the round's targets with `hideTargets: false`; readout shows `listen…`, `play it back · <n>/<rounds>`, and the round score.
- Shortcut **C**: `actionFor` → `{ type: "coach" }` for `c`; `KEY_HELP` gains `["C", "Start / stop coaching the open lesson"]` (length 11; update the test and add a `c` case like Task 7's). `ShortcutBridge` dispatches `window.dispatchEvent(new CustomEvent("woodshed:coach"))` when a keyboard is connected; `CoachPanel` (MIDI source) listens for it and toggles start/stop.
- [ ] Implement; `npm test` + build.
- [ ] **Verify** in the browser (`?fakemidi`, 1440×900): open "Major scales, hands together" is Task 12's — here use **Five-finger position** (trk-pno-1) and **Hanon**: Coach me; play the targets with `__fakeMidi.press/release` (≈300ms apart) including one wrong note → band pulses the next key, hits/misses colored, readout `F · 4` style head and `n / total`, summary with timing + touch, Log it records accuracy (check the log sheet's accuracy field). C toggles a run. P does nothing mid-run. Unplug mid-run → "Keyboard disconnected." Close the lesson mid-run → no errors, band clears. Echo (Task 12 re-enables the items; verify Echo there).
- [ ] Commit — `feat(midi): coach piano lessons over MIDI`.

---

### Task 12: Piano Echo back; hands-together lessons

**Files:** Modify `src/seed.js`, `src/storage.js`, `src/lessons/piano.js`, `test/ear.test.mjs`, `test/lessons.test.mjs` if its invariants need the new shape field.

- `seed.js`: `export const SEED = COACH_ENABLED ? [...LIBRARY, ...ECHO_SEED] : [...LIBRARY, ...ECHO_SEED.filter((s) => s.inst === "piano")];`
- `storage.js` `migrate()`: while `!COACH_ENABLED`, drop only the non-piano Echo ids.
- `lessons/piano.js`: `pno-scales` shape `{ ...cMajorTwoOctaves, hands: "together" }`; `trk-pno-3` shape `{ ...cMajorScale, hands: "together" }`. The lesson diagram still shows the right-hand notes (it renders `notes`).
- Tests: `test/ear.test.mjs` — piano Echo items (`pno-ear-int`, `pno-ear-phr`) are in `SEED`; guitar ones (`gtr-ear-int`, `gtr-ear-phr`) are not. `test/lessons.test.mjs` stays green (extend any shape-schema check to allow `hands`).
- [ ] Implement; `npm test` + build.
- [ ] **Verify** (`?fakemidi`): pno-scales Coach me grades pairs (press 48+60 together, then 50+62, …; one wrong pair → missed with missing/extra); an Echo round on piano: the band stays dark during prompt/listen, reveal lights the targets, the score shows; guitar lessons unchanged (no Coach me, no connect note).
- [ ] Commit — `feat(midi): piano Echo returns; hands-together scale lessons`.

---

### Task 13: Phase 2 docs

- [ ] README: under the MIDI subsection add coaching (exact grading, chords as played, hands together, timing and touch notes), Echo on piano, the C shortcut, and that guitar coaching stays off. Update `docs/DIRECTION.md`'s "Open: pitch coach rethink" with what was decided for piano (MIDI, exact; mic stays off) — leave the guitar questions open. Commit — `docs: piano coaching and Echo over MIDI`.

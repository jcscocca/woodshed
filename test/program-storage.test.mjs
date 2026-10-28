import assert from "node:assert/strict";
import { test } from "node:test";
import { freshData } from "../src/engine.js";
import { migrate, saveState, loadState } from "../src/storage.js";
import { normalizeProgress, recordAttempt, exerciseProgress, sessionProgress } from "../src/program/progress.js";

const FIELD = "programProgress";
const SESSION = { id: "day-1-a", blocks: [{ exerciseId: "scale-c" }, { exerciseId: "chord-c" }] };
const entry = { exerciseId: "scale-c", skillIds: ["key-c", "steady-pulse"], assessment: "practising", minutes: 3, bpm: 60, hands: "both", section: "scales", date: "2026-10-27" };
const clone = (x) => JSON.parse(JSON.stringify(x));

async function withStorage(fn) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  try { await fn(storage, values); }
  finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  }
}

test("fresh data and existing saves gain empty program progress without fabricated results", () => {
  const fresh = freshData();
  assert.deepEqual(fresh[FIELD], normalizeProgress());
  const old = clone(fresh);
  delete old[FIELD];
  old.sessions = [{ id: "old-log", itemId: "pno-scales", inst: "piano", date: "2026-10-26", minutes: 12, rating: "good", coached: true, accuracy: 91 }];
  old.settings.target = 27;
  old.settings.enabled = { piano: true, guitar: false };
  const before = clone(old);
  const loaded = migrate(old);
  assert.deepEqual(loaded[FIELD], { attempts: [], completedBlocks: {}, placement: {} });
  assert.deepEqual(loaded.sessions, before.sessions);
  assert.deepEqual(loaded.settings, before.settings);
  assert.deepEqual(loaded.items, before.items);
  assert.deepEqual(old, before, "migration does not change the supplied save");
});

test("program progress survives save/load with session resume, readiness and notes intact", async () => {
  await withStorage(async (_storage, values) => {
    const state = freshData();
    state[FIELD] = recordAttempt(state[FIELD], { ...entry, section: "placement", assessment: "ready", minutes: 1 });
    state[FIELD] = recordAttempt(state[FIELD], { ...entry, sessionId: SESSION.id, blockIndex: 0, assessment: "unsure", note: "Keep the pulse at the thumb crossing." });
    state.sessions = [{ id: "self-log", inst: "piano", itemId: "pno-scales", date: "2026-10-27", minutes: 3, rating: "hard" }];
    state.settings.target = 20;
    state.songs = [{ id: "saved-song", title: "My progression", chords: "C | G | Am | F", key: "C", meter: "4/4", pattern: "block", bpm: 60 }];
    const before = clone(state);
    assert.equal(await saveState(state), true);
    assert.equal(values.size, 1, "progress travels with the existing single backup/save state");
    const loaded = await loadState();
    assert.deepEqual(loaded[FIELD], before[FIELD]);
    assert.deepEqual(loaded.sessions, before.sessions);
    assert.deepEqual(loaded.settings, before.settings);
    assert.deepEqual(loaded.songs, before.songs);
    const ex = exerciseProgress(loaded[FIELD], "scale-c");
    assert.equal(ex.minutes, 3); assert.equal(ex.placementMinutes, 1); assert.equal(ex.status, "unsure");
    assert.equal(sessionProgress(loaded[FIELD], SESSION).nextBlock, 1);
    assert.deepEqual(sessionProgress(loaded[FIELD], SESSION).completedBlocks, [0]);
    assert.ok(loaded[FIELD].attempts.every((a) => !("accuracy" in a) && !("coached" in a) && !("rhythm" in a)));
    assert.ok(!("accuracy" in loaded.sessions[0]), "self-assessed practice does not become measured accuracy");
  });
});

test("migration normalizes malformed imported progress and preserves unrelated history", () => {
  const state = freshData();
  state.sessions = [{ id: "existing", inst: "piano", itemId: "pno-sight", minutes: 5, rating: "good", date: "2026-10-26" }];
  state[FIELD] = {
    attempts: [null, { ...entry, assessment: "mastered", accuracy: 100 }, { ...entry, minutes: NaN, accuracy: 100, coached: true }],
    completedBlocks: { "day-1-a": ["0", -1, 1.5] },
    placement: { "scale-c": "perfect", "chord-c": "ready" },
  };
  const migrated = migrate(state);
  assert.equal(migrated[FIELD].attempts.length, 1);
  assert.equal(migrated[FIELD].attempts[0].minutes, 0);
  assert.equal(migrated[FIELD].attempts[0].assessment, "practising");
  assert.ok(!("accuracy" in migrated[FIELD].attempts[0]));
  assert.ok(!("coached" in migrated[FIELD].attempts[0]));
  assert.deepEqual(migrated[FIELD].completedBlocks, {});
  assert.deepEqual(migrated[FIELD].placement, { "chord-c": "ready" });
  assert.deepEqual(migrated.sessions, state.sessions);
});

test("save/load preserves more than 500 attempts and accumulated minutes", async () => {
  await withStorage(async () => {
    const state = freshData();
    const attempts = Array.from({ length: 650 }, (_, i) => ({ ...entry, note: `Practice ${i + 1}` }));
    state[FIELD] = normalizeProgress({ attempts });
    assert.equal(await saveState(state), true);
    const loaded = await loadState();
    assert.equal(loaded[FIELD].attempts.length, 650);
    assert.equal(loaded[FIELD].attempts[0].note, "Practice 1");
    assert.equal(loaded[FIELD].attempts[649].note, "Practice 650");
    assert.equal(exerciseProgress(loaded[FIELD], "scale-c").minutes, 1950);
  });
});

test("storage quota errors remain explicit and leave the previous durable log intact", async () => {
  await withStorage(async (storage) => {
    const state = freshData();
    state[FIELD] = recordAttempt(state[FIELD], entry);
    assert.equal(await saveState(state), true);
    const next = { ...state, [FIELD]: recordAttempt(state[FIELD], { ...entry, assessment: "ready" }) };
    const warn = console.warn;
    storage.setItem = () => { throw new Error("QuotaExceededError"); };
    console.warn = () => {};
    try { assert.equal(await saveState(next), false); }
    finally { console.warn = warn; }
    const durable = await loadState();
    assert.equal(durable[FIELD].attempts.length, 1);
    assert.equal(exerciseProgress(durable[FIELD], "scale-c").status, "practising");
  });
});

test("selected G and F units survive save/load without resetting existing C progress", async () => {
  await withStorage(async () => {
    for (const unitId of ["g-major-foundations-2", "f-major-foundations-3"]) {
      const state = freshData();
      state.programUnitId = unitId;
      state[FIELD] = recordAttempt(state[FIELD], {
        exerciseId: "rhythm-long-short", skillIds: ["pulse"], assessment: "practising", minutes: 3,
        section: "guided", date: "2026-10-27", sessionId: "c1-d1-a", blockIndex: 0,
      });
      state[FIELD] = recordAttempt(state[FIELD], {
        exerciseId: "place-reading", skillIds: ["staff-reading"], assessment: "unsure", minutes: 2,
        section: "placement", date: "2026-10-27",
      });
      const expected = clone(state[FIELD]);
      assert.equal(await saveState(state), true);
      const loaded = await loadState();
      assert.equal(loaded.programUnitId, unitId);
      assert.deepEqual(loaded[FIELD], expected);
      assert.deepEqual(loaded[FIELD].completedBlocks, { "c1-d1-a": [0] });
      assert.equal(loaded[FIELD].placement["place-reading"], "unsure");
      assert.equal(exerciseProgress(loaded[FIELD], "rhythm-long-short").minutes, 3);
    }
  });
});

test("old saves and invalid unit selections default to C without changing their logs", () => {
  assert.equal(freshData().programUnitId, "c-major-foundations-1");
  for (const selection of [undefined, null, "", "future-unit", [], {}, 2]) {
    const state = freshData();
    if (selection === undefined) delete state.programUnitId;
    else state.programUnitId = selection;
    state[FIELD] = recordAttempt(state[FIELD], entry);
    const before = clone(state[FIELD]);
    const loaded = migrate(state);
    assert.equal(loaded.programUnitId, "c-major-foundations-1");
    assert.deepEqual(loaded[FIELD], before);
  }
});

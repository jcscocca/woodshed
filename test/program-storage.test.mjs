import assert from "node:assert/strict";
import { test } from "node:test";
import { freshData } from "../src/engine.js";
import { migrate, saveState, loadState, mutateState, replaceState, stateRevision, stateGeneration, SavedStateError } from "../src/storage.js";
import { installWebLocks } from "./web-locks-harness.mjs";
import { normalizeProgress, recordAttempt, exerciseProgress, sessionProgress } from "../src/program/progress.js";
import { todayStr } from "../src/dateUtils.js";

const FIELD = "programProgress";
const SESSION = { id: "day-1-a", blocks: [{ exerciseId: "scale-c" }, { exerciseId: "chord-c" }] };
const entry = { exerciseId: "scale-c", skillIds: ["key-c", "steady-pulse"], assessment: "practising", minutes: 3, bpm: 60, hands: "both", section: "scales", date: "2026-10-27" };
const clone = (x) => JSON.parse(JSON.stringify(x));

async function withStorage(fn) {
  const restoreLocks = installWebLocks();
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
    restoreLocks();
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  }
}

test("a missing save is distinct from unreadable, malformed and unsupported saved data", async () => {
  await withStorage(async (storage, values) => {
    assert.equal(await loadState(), null);
    for (const [raw, code] of [["", "parse"], ["{incomplete", "parse"], ["null", "migration"], ["[]", "migration"], [JSON.stringify({ items: "invalid" }), "migration"]]) {
      values.set("woodshed-state-v1", raw);
      await assert.rejects(loadState(), error => error instanceof SavedStateError && error.code === code && error.raw === raw);
      assert.equal(values.get("woodshed-state-v1"), raw, "a failed read never changes the original saved bytes");
    }
    storage.getItem = () => { throw new Error("Storage access denied"); };
    await assert.rejects(loadState(), error => error instanceof SavedStateError && error.code === "read" && error.raw === null);
  });
});

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
      assert.equal((await replaceState(await loadState(), state)).ok, true);
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

test("review checks survive save, load and import independently of later repairs and guided completion", async () => {
  await withStorage(async () => {
    const state = freshData();
    state[FIELD] = recordAttempt(state[FIELD], { ...entry, section: "review", assessment: "ready", bpm: 72, hands: "both", fromBar: 1, toBar: 6,
      sessionId: SESSION.id, blockIndex: 0,
      reviewCheck: { assessment: "practising", beforeDemo: true, bpm: 60, hands: "R", fromBar: 2, toBar: 4 } });
    const expected = clone(state[FIELD]);
    assert.equal(await saveState(state), true);
    const loaded = await loadState();
    assert.deepEqual(loaded[FIELD], expected);
    assert.deepEqual(migrate(clone(loaded))[FIELD], expected);
    assert.deepEqual(loaded[FIELD].completedBlocks, {});
    assert.equal(sessionProgress(loaded[FIELD], SESSION).started, false);
    assert.equal(loaded[FIELD].attempts[0].assessment, "ready");
    assert.equal(loaded[FIELD].attempts[0].reviewCheck.assessment, "practising");
  });
});

test("integrated return and transfer evidence survives reload and backup without completing core blocks", async () => {
  await withStorage(async () => {
    const state = freshData(), day = todayStr();
    state[FIELD] = recordAttempt(state[FIELD], { ...entry, date: day, section: "review", assessment: "unsure", reviewForSession: SESSION.id,
      reviewCheck: { assessment: "practising", beforeDemo: true, bpm: 60, hands: "both", fromBar: 2, toBar: 4 } });
    state[FIELD] = recordAttempt(state[FIELD], { ...entry, date: day, section: "transfer", assessment: "ready", reviewForSession: SESSION.id,
      transferId: "transfer-pulse-v1-c-2", bpm: 84, hands: "R", fromBar: 1, toBar: 2,
      transferCheck: { assessment: "unsure", beforeDemo: false, bpm: 48, hands: "L", fromBar: 1, toBar: 2 },
      sessionId: SESSION.id, blockIndex: 0, reviewCheck: { assessment: "ready", beforeDemo: true } });
    const expected = clone(state[FIELD]);
    assert.equal(await saveState(state), true);
    const loaded = await loadState();
    assert.deepEqual(loaded[FIELD], expected);
    assert.deepEqual(migrate(clone(loaded))[FIELD], expected, "backup import retains distinct evidence");
    const session = sessionProgress(loaded[FIELD], SESSION, { today: day });
    assert.equal(session.started, true); assert.equal(session.minutes, 6); assert.equal(session.nextBlock, 0);
    assert.equal(session.done, false); assert.deepEqual(session.completedBlocks, []); assert.deepEqual(session.attempts, []);
    assert.equal(session.reviewAttempts.length, 2);
    const source = exerciseProgress(loaded[FIELD], entry.exerciseId);
    assert.equal(source.practiceCount, 2); assert.equal(source.minutes, 6);
    assert.equal(source.status, "unsure"); assert.equal(source.hands, "both"); assert.equal(source.bpm, 60);
    const fresh = loaded[FIELD].attempts[1];
    assert.equal(fresh.transferId, "transfer-pulse-v1-c-2");
    assert.equal(fresh.transferCheck.assessment, "unsure"); assert.equal(fresh.reviewCheck, undefined);
    assert.equal(fresh.sessionId, undefined); assert.equal(fresh.blockIndex, undefined);
  });
});

test("serialized mutations from two stale snapshots retain both reports and unrelated selection changes", async () => withStorage(async () => {
  const initial=freshData();assert.equal(await saveState(initial),true);
  const a=await loadState(),b=await loadState();
  const append=(note)=>(current)=>({...current,programProgress:recordAttempt(current.programProgress,{...entry,note})});
  const results=await Promise.all([mutateState(a,append("Tab A")),mutateState(b,append("Tab B"))]);
  assert.ok(results.every(result=>result.ok));
  assert.equal((await mutateState(b,current=>({...current,programUnitId:"g-major-foundations-2"}))).ok,true);
  const saved=await loadState();
  assert.deepEqual(saved.programProgress.attempts.map(a=>a.note),["Tab A","Tab B"]);
  assert.equal(saved.programUnitId,"g-major-foundations-2");
  assert.equal(stateGeneration(saved),stateGeneration(initial));
  assert.equal(stateRevision(saved),stateRevision(initial)+3);
}));

test("a stale complete-snapshot save cannot overwrite a newer durable revision", async () => withStorage(async () => {
  const initial=freshData();assert.equal(await saveState(initial),true);
  const a=await loadState(),b=await loadState();
  assert.equal((await mutateState(a,current=>({...current,programProgress:recordAttempt(current.programProgress,entry)}))).ok,true);
  b.programUnitId="g-major-foundations-2";
  const warn=console.warn;console.warn=()=>{};
  try{assert.equal(await saveState(b),false);}finally{console.warn=warn;}
  assert.equal((await loadState()).programProgress.attempts.length,1);
}));

test("intentional deletion is retained and reset/import reject earlier-generation actions", async () => withStorage(async () => {
  const initial=freshData();initial.programProgress=recordAttempt({},entry);assert.equal(await saveState(initial),true);
  const a=await loadState(),stale=await loadState();
  assert.equal((await mutateState(a,current=>({...current,programProgress:normalizeProgress()}))).ok,true);
  assert.equal((await mutateState(stale,current=>({...current,settings:{...current.settings,target:30}}))).ok,true);
  assert.deepEqual((await loadState()).programProgress.attempts,[],"a stale settings action must not resurrect deleted reports");
  assert.equal((await replaceState(stale,freshData())).ok,false,"stale destructive replacement cannot discard intervening changes");
  const beforeReset=await loadState(),reset=await replaceState(beforeReset,freshData());
  assert.equal(reset.ok,true);assert.notEqual(stateGeneration(reset.state),stateGeneration(beforeReset));
  const replay=await mutateState(beforeReset,current=>({...current,programProgress:recordAttempt(current.programProgress,entry)}));
  assert.equal(replay.ok,false);assert.equal(replay.error.code,"replaced");
  assert.deepEqual((await loadState()).programProgress.attempts,[]);
  const imported=freshData();imported.programProgress=recordAttempt({}, {...entry,note:"Backup history"});
  const restored=await replaceState(reset.state,imported);assert.equal(restored.ok,true);
  assert.equal((await mutateState(reset.state,current=>({...current,programUnitId:"g-major-foundations-2"}))).ok,false);
  assert.equal((await loadState()).programProgress.attempts[0].note,"Backup history");
}));

test("transaction quota failure leaves the prior bytes and revision intact", async () => withStorage(async (storage,values) => {
  const state=freshData();assert.equal(await saveState(state),true);
  const raw=values.get("woodshed-state-v1");
  storage.setItem=()=>{throw new Error("QuotaExceededError");};
  const result=await mutateState(state,current=>({...current,programProgress:recordAttempt(current.programProgress,entry)}));
  assert.equal(result.ok,false);assert.equal(values.get("woodshed-state-v1"),raw);
  assert.equal(stateRevision(await loadState()),stateRevision(state));
}));

test("unsupported locking refuses writes while keeping existing history readable", async () => withStorage(async (_storage,values) => {
  const state=freshData();assert.equal(await saveState(state),true);
  const raw=values.get("woodshed-state-v1");
  navigator.locks=undefined;
  const result=await mutateState(state,current=>({...current,programUnitId:"g-major-foundations-2"}));
  assert.equal(result.ok,false);assert.equal(result.error.code,"locking-unavailable");
  assert.equal(values.get("woodshed-state-v1"),raw);assert.equal((await loadState()).programUnitId,state.programUnitId);
}));

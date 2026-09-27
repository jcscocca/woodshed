// Pin a DST-observing zone before any Date use so the October clock change is exercised.
process.env.TZ = "Europe/London";

import assert from "node:assert/strict";
const { streakInfo, generateSession, freshData, withDerivedStats, progressionProposals } = await import("../src/engine.js");
const { todayStr, addDays } = await import("../src/dateUtils.js");
const { migrate } = await import("../src/storage.js");

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

const today = todayStr();
const on = (date, extra = {}) => ({ date, itemId: "x", inst: "piano", minutes: 10, rating: "good", ...extra });

test("streak: one rest day yesterday keeps the streak alive", () => {
  const s = streakInfo([on(addDays(today, -4)), on(addDays(today, -2))]);
  assert.equal(s.current, 2);
});

test("streak: two missed days break it", () => {
  assert.equal(streakInfo([on(addDays(today, -3))]).current, 0);
});

test("streak: a rest day across the UK October DST change doesn't break the run", () => {
  assert.equal(streakInfo([on("2025-10-25"), on("2025-10-27")]).longest, 2);
});

test("generateSession: skips an overdue instrument with nothing eligible", () => {
  const d = freshData();
  d.settings.target = 15;
  d.settings.enabled = { piano: true, guitar: true };
  d.items = d.items.map((it) => (it.inst === "piano" ? { ...it, hidden: true } : it));
  d.sessions = [on(addDays(today, -1), { inst: "guitar" })];
  for (let i = 0; i < 20; i++) {
    const s = generateSession({ ...d, items: withDerivedStats(d.items, d.sessions) });
    assert.ok(s.items.length > 0, "set should not be empty");
    assert.ok(s.items.every((x) => d.items.find((it) => it.id === x.itemId).inst === "guitar"));
  }
});

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

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

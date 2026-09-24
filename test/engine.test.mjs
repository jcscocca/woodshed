// Pin a DST-observing zone before any Date use so the October clock change is exercised.
process.env.TZ = "Europe/London";

import assert from "node:assert/strict";
const { streakInfo, generateSession, freshData, withDerivedStats } = await import("../src/engine.js");
const { todayStr, addDays } = await import("../src/dateUtils.js");

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
  d.settings.enabled = { piano: true, guitar: true, bass: false, accordion: false };
  d.items = d.items.map((it) => (it.inst === "piano" ? { ...it, hidden: true } : it));
  d.sessions = [on(addDays(today, -1), { inst: "guitar" })];
  for (let i = 0; i < 20; i++) {
    const s = generateSession({ ...d, items: withDerivedStats(d.items, d.sessions) });
    assert.ok(s.items.length > 0, "set should not be empty");
    assert.ok(s.items.every((x) => d.items.find((it) => it.id === x.itemId).inst === "guitar"));
  }
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

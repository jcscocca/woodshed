// Pin a DST-observing zone before any Date use so the October clock change is exercised.
process.env.TZ = "Europe/London";

import assert from "node:assert/strict";
const { streakInfo, levelFor, generateSession, freshData, withDerivedStats } = await import("../src/engine.js");
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

test("levelFor: 'tough' pulls the level back down after a long run of 'too easy'", () => {
  const easy = Array.from({ length: 20 }, () => on(today, { rating: "easy" }));
  const hard = Array.from({ length: 4 }, () => on(today, { rating: "hard" }));
  assert.equal(levelFor("piano", easy), 5);
  assert.equal(levelFor("piano", [...easy, ...hard]), 3);
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

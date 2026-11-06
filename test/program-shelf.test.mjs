import assert from "node:assert/strict";
import { UNITS, EXERCISES } from "../src/program/curriculum.js";
import { SHELF, SHELF_GROUPS, LEVELS, unitHeading } from "../src/program/shelf.js";
import { getLesson, hasScore } from "../src/lessons/index.js";
import { trackItems } from "../src/seed.js";

const test = (name, fn) => { fn(); console.log(`ok   ${name}`); };
const byId = new Map(EXERCISES.map((e) => [e.id, e]));
const group = (id) => SHELF.filter((entry) => entry.group === id);

test("the shelf holds only music: 27 course pieces, 13 repertoire, 3 outside", () => {
  assert.deepEqual(SHELF_GROUPS.map((g) => g.id), ["course", "repertoire", "outside"]);
  assert.deepEqual(SHELF_GROUPS.map((g) => group(g.id).length), [27, 13, 3]);
  assert.equal(new Set(SHELF.map((e) => e.id)).size, SHELF.length);
  for (const level of LEVELS) assert.ok(SHELF.some((e) => e.level === level), `no pieces at ${level}`);
  for (const entry of SHELF) {
    assert.ok(entry.title && entry.who, entry.id);
    assert.ok(LEVELS.includes(entry.level), `${entry.id}: level`);
  }
});

test("course pieces are guided music in course order, never drills", () => {
  const order = group("course").map((entry) => UNITS.findIndex((u) => u.id === byId.get(entry.exerciseId)?.unitId));
  for (const entry of group("course")) {
    const e = byId.get(entry.exerciseId);
    assert.ok(e && e.section === "guided" && e.abc && !e.archived, entry.id);
  }
  assert.ok(order.every((n, i) => n >= 0 && (i === 0 || n >= order[i - 1])), "units out of course order");
  assert.deepEqual([...new Set(order)], UNITS.map((_, i) => i), "every unit has a piece");
});

test("repertoire opens a scored lesson from the older tracks", () => {
  const stages = new Set(trackItems().map((item) => item.id));
  for (const entry of group("repertoire")) {
    assert.ok(stages.has(entry.lessonId), entry.id);
    assert.ok(hasScore(getLesson(entry.lessonId)), `${entry.id}: no score`);
  }
});

test("outside pieces are https links", () => {
  for (const entry of group("outside")) assert.match(entry.url, /^https:\/\//, entry.id);
});

test("unit headings name the key, and Musicianship for the capstone", () => {
  assert.equal(unitHeading(UNITS[1], false), "G major · Unit 2");
  assert.equal(unitHeading(UNITS[1], true), "G major · Unit 2 · you're here");
  assert.equal(unitHeading(UNITS[7], false), "Musicianship · Unit 8");
});

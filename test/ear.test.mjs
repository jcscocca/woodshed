import assert from "node:assert/strict";
import { mulberry32, intervalLabel } from "../src/ear.js";

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

test("mulberry32: deterministic for a seed, values in [0,1)", () => {
  const a = mulberry32(42), b = mulberry32(42);
  const seqA = [a(), a(), a()], seqB = [b(), b(), b()];
  assert.deepEqual(seqA, seqB);
  for (const v of seqA) assert.ok(v >= 0 && v < 1);
});

test("mulberry32: different seeds diverge", () => {
  assert.notEqual(mulberry32(1)(), mulberry32(2)());
});

test("intervalLabel: names and directions", () => {
  assert.equal(intervalLabel(60, 63), "↑m3");
  assert.equal(intervalLabel(63, 60), "↓m3");
  assert.equal(intervalLabel(60, 72), "↑P8");
  assert.equal(intervalLabel(60, 67), "↑P5");
  assert.equal(intervalLabel(60, 60), "P1");
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

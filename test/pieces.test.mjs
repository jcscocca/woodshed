import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import abcjs from "abcjs";
const { parseScore } = await import("../src/score/scoreModel.js");
const { LESSONS } = await import("../src/lessons/index.js");
const { default: PIECES } = await import("../src/lessons/pieces/index.js");

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };

// Every piece against its reference (test/fixtures/pieces, written by scripts/midi-fixture.mjs):
// the same [beat, midi] onsets as a multiset, less the fixture's reasoned deviations.
const dir = new URL("./fixtures/pieces/", import.meta.url);
const round = (x) => Math.round(x * 1000) / 1000;
const key = ([beat, midi]) => `${beat} ${midi}`;
const count = (onsets) => onsets.reduce((m, o) => m.set(key(o), (m.get(key(o)) || 0) + 1), new Map());

test("every piece has a fixture", () => {
  const without = Object.keys(PIECES).filter((id) => !existsSync(new URL(`${id}.json`, dir)));
  assert.ok(!without.length, `no test/fixtures/pieces/<id>.json for ${without.join(", ")}`);
});

for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const fx = JSON.parse(readFileSync(new URL(file, dir), "utf8")), id = file.slice(0, -".json".length);
  test(`${id}: the score matches its reference`, () => {
    assert.equal(fx.id, id, "the fixture's id differs from its filename");
    const L = LESSONS[fx.id];
    assert.ok(L && L.score, `no scored lesson ${fx.id}`);
    assert.ok(fx.source && fx.source.url, "the fixture has no source url");
    assert.equal(L.source && L.source.url, fx.source.url, "the lesson's source.url differs from the fixture's");
    if (fx.verified === "manual") {
      assert.ok(!fx.onsets, "a manual check carries no onsets — drop them or drop verified");
      return assert.ok(typeof fx.note === "string" && fx.note.trim(), "a manual check needs a note");
    }
    const s = parseScore(L.score.abc, abcjs);
    const expected = count(fx.onsets), got = count(s.notes.map((n) => [round(n.beat), n.midi]));
    for (const d of fx.deviations) {
      assert.ok(["missing", "extra"].includes(d.kind) && typeof d.reason === "string" && d.reason.trim(), `deviation ${JSON.stringify(d)} needs a kind and a reason`);
      const m = d.kind === "missing" ? expected : got, k = key([d.beat, d.midi]);
      assert.ok(m.get(k), `${d.kind} deviation at beat ${d.beat}, midi ${d.midi} matches no ${d.kind === "missing" ? "reference" : "score"} note`);
      m.set(k, m.get(k) - 1);
    }
    const diffs = [];
    for (const k of new Set([...expected.keys(), ...got.keys()])) {
      const [beat, midi] = k.split(" ").map(Number), n = (expected.get(k) || 0) - (got.get(k) || 0);
      for (let i = 0; i < Math.abs(n); i++) diffs.push({ beat, midi, what: n > 0 ? "expected" : "got" });
    }
    diffs.sort((a, b) => a.beat - b.beat || a.midi - b.midi);
    const at = ({ beat, midi, what }) => {
      const bar = Math.floor(beat / s.beatsPerBar + 1e-9) + 1;
      return `bar ${bar} beat ${round(beat - (bar - 1) * s.beatsPerBar + 1)}: ${what} ${midi}`;
    };
    if (diffs.length) assert.fail(`${diffs.length} differences from the reference:\n     ${diffs.slice(0, 10).map(at).join("\n     ")}`);
  });
}

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

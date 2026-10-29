import assert from "node:assert/strict";
import { test } from "node:test";
import abcjs from "abcjs";
import { EXERCISES, UNITS } from "../src/program/curriculum.js";
import { parseScore } from "../src/score/scoreModel.js";
import { transferForExercise, supportsTransfer, TRANSFER_VARIANT_COUNT } from "../src/program/transfer.js";

const supported = EXERCISES.filter(supportsTransfer);
const byId = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));
const variants = supported.flatMap((exercise) => Array.from({ length: TRANSFER_VARIANT_COUNT }, (_, variant) => ({ exercise, task: transferForExercise(exercise, variant) })));
const scoreOf = (exercise) => parseScore(exercise.abc, abcjs);
const signature = (score) => score.notes.map(({ midi, hand, beat, dur }) => [midi, hand, beat, dur]);
const uniqueMidi = (notes) => [...new Set(notes.map((note) => note.midi))].sort((a, b) => a - b);

test("transfer uses compatible known sources across all eight units without fabricating generic fallbacks", () => {
  assert.equal(UNITS.length, 8);
  for (const unit of UNITS) assert.ok(supported.some((exercise) => exercise.unitId === unit.id), unit.id);
  assert.deepEqual([...new Set(variants.map(({ task }) => task.transferFamily))].sort(), ["blues-sevenths", "cadence", "canon-travel", "held-bass", "landmarks", "mozart-position", "pulse", "subdivision", "two-to-one"]);
  for (const exercise of [null, {}, { id: "unknown" }, { id: "constructor" }, { id: "__proto__" }, byId.get("place-pulse"), byId.get("a4-fur-elise-opening"), byId.get("e7-switchyard-blues")]) {
    assert.equal(supportsTransfer(exercise), false);
    assert.equal(transferForExercise(exercise), null);
  }
});

test("each source has eight distinct new musical examples with stable identities and complete guidance", () => {
  for (const exercise of supported) {
    const before = JSON.stringify(exercise), original = signature(scoreOf(exercise)), ids = new Set(), music = new Set();
    for (let variant = 0; variant < TRANSFER_VARIANT_COUNT; variant++) {
      const task = transferForExercise(exercise, variant);
      assert.equal(task.id, exercise.id);
      assert.equal(task.unitId, exercise.unitId);
      assert.equal(task.section, "transfer");
      assert.equal(task.minutes, 3);
      assert.match(task.title, /^Fresh /);
      assert.match(task.transferId, /^transfer-v1:/);
      assert.equal(task.transferVariant, variant);
      assert.equal(task.bpm, task.targetBpm);
      assert.ok(task.bpm >= 20 && task.bpm <= 72);
      assert.ok(["R", "L", "both"].includes(task.hands));
      for (const field of ["title", "summary", "fingering", "key"]) assert.ok(task[field]?.trim(), `${exercise.id}: ${field}`);
      for (const field of ["steps", "listenFor", "checks", "skillIds"]) assert.ok(task[field]?.length >= 2 && task[field].every((value) => typeof value === "string" && value.trim()), `${exercise.id}: ${field}`);
      assert.equal(task.steps.length, 3);
      assert.equal(task.source.label, "Original Woodshed transfer material");
      const notes = signature(scoreOf(task));
      assert.notDeepEqual(notes, original, `${exercise.id}: variant ${variant} repeats the original music`);
      ids.add(task.transferId); music.add(JSON.stringify(notes));
      assert.deepEqual(transferForExercise(exercise, variant), task, "generation is deterministic");
    }
    assert.equal(ids.size, TRANSFER_VARIANT_COUNT, exercise.id);
    assert.equal(music.size, TRANSFER_VARIANT_COUNT, `${exercise.id}: variants differ only in labels`);
    assert.equal(JSON.stringify(exercise), before, "the source and its curriculum are immutable");
    assert.equal(transferForExercise(exercise, TRANSFER_VARIANT_COUNT), null, "exhausted examples are not relabeled fresh");
    for (const invalid of [-1, Infinity, NaN, "1", null, undefined]) assert.deepEqual(transferForExercise(exercise, invalid), transferForExercise(exercise, 0));
  }
});

test("all transfer scores have four complete bars in both voices and no ambiguous cross-hand keys", () => {
  for (const { exercise, task } of variants) {
    const [tune] = abcjs.parseOnly(task.abc), elapsed = [], bars = [];
    assert.ok(!tune.warnings?.length, `${task.transferId}: ${tune.warnings}`);
    for (const line of tune.lines) {
      let voiceIndex = 0;
      for (const staff of line.staff || []) for (const voice of staff.voices) {
        let beats = elapsed[voiceIndex] || 0;
        for (const element of voice) {
          if (element.el_type === "note" && element.duration && element.rest?.type !== "spacer") beats += element.duration * 4;
          if (element.el_type === "bar" && beats > 0) {
            assert.equal(beats, 4, `${exercise.id}/${task.transferId}: incomplete voice ${voiceIndex}`);
            bars[voiceIndex] = (bars[voiceIndex] || 0) + 1; beats = 0;
          }
        }
        elapsed[voiceIndex++] = beats;
      }
    }
    assert.deepEqual(bars, [4, 4], task.transferId);
    assert.ok(elapsed.every((value) => value === 0));
    const score = scoreOf(task);
    assert.equal(score.bars.length, 4);
    assert.ok(score.notes.length > 0 && score.notes.every((note) => note.midi >= 21 && note.midi <= 108));
    if (task.hands !== "both") assert.ok(score.notes.every((note) => note.hand === task.hands));
    for (const a of score.notes) for (const b of score.notes) {
      if (a.hand === b.hand || a.midi !== b.midi) continue;
      const overlap = Math.min(a.beat + a.dur, b.beat + b.dur) - Math.max(a.beat, b.beat);
      assert.ok(overlap <= 1e-8, `${task.transferId}: hands compete for MIDI ${a.midi}`);
    }
  }
});

test("rhythm families isolate a familiar key and introduce no untaught syncopation or duration", () => {
  for (const { task } of variants.filter(({ task }) => ["pulse", "subdivision"].includes(task.transferFamily))) {
    const score = scoreOf(task), allowed = task.transferFamily === "pulse" ? [1, 2, 4] : [0.5, 1, 2];
    assert.equal(uniqueMidi(score.notes).length, 1, task.transferId);
    assert.ok(score.notes.every((note) => allowed.includes(note.dur)), task.transferId);
    if (task.transferFamily === "subdivision") {
      const eighths = score.notes.filter((note) => note.dur === 0.5);
      assert.ok(eighths.length > 0);
      for (const note of eighths) assert.ok(score.notes.some((other) => other.beat === (note.beat % 1 === 0 ? note.beat + 0.5 : note.beat - 0.5) && other.dur === 0.5), `${task.transferId}: a lone eighth creates an untaught offbeat hold`);
    }
  }
});

test("landmark examples keep the taught registers, altered notes and separate hand turns", () => {
  const expected = {
    "read-bass-neighbors": { L: [57, 59, 60, 64] },
    "read-treble-neighbors": { R: [57, 59, 60, 64] },
    "read-ledger-transfer": { R: [57, 59, 60, 64], L: [57, 59, 60, 64] },
    "a4-read-home": { R: [57, 59, 60, 64] },
    "g-read-f-sharp": { R: [64, 66, 67, 69], L: [50, 52, 54, 55] },
    "f3-read-signature": { R: [65, 69, 70, 72], L: [53, 57, 58, 60] },
    "a6-read-ledgers": { R: [76, 78, 80, 81], L: [56, 57, 59, 61] },
  };
  for (const { exercise, task } of variants.filter(({ task }) => task.transferFamily === "landmarks")) {
    const score = scoreOf(task);
    for (const [hand, midi] of Object.entries(expected[exercise.id])) assert.deepEqual(uniqueMidi(score.notes.filter((note) => note.hand === hand)), midi, exercise.id);
    assert.ok(score.notes.every((note) => note.dur === 2));
    if (task.hands === "both") {
      assert.ok(score.notes.filter((note) => note.hand === "R").every((note) => note.beat < 8));
      assert.ok(score.notes.filter((note) => note.hand === "L").every((note) => note.beat >= 8));
    }
  }
});

test("coordination transfer preserves held-bass and two-to-one attack relationships in learned positions", () => {
  const positions = { C: [60, 62, 64, 65, 67], G: [64, 66, 67, 69, 71], F: [65, 67, 69, 70, 72] };
  for (const { task } of variants.filter(({ task }) => ["held-bass", "two-to-one"].includes(task.transferFamily))) {
    const score = scoreOf(task), key = task.abc.match(/^K:(\w+)$/m)[1];
    const right = score.notes.filter((note) => note.hand === "R"), left = score.notes.filter((note) => note.hand === "L");
    assert.ok(right.every((note) => positions[key].includes(note.midi)), task.transferId);
    assert.ok(left.every((note) => note.midi < Math.min(...positions[key])), task.transferId);
    if (task.transferFamily === "held-bass") {
      assert.equal(left.length, 4); assert.ok(left.every((note) => note.dur === 4));
      assert.ok(right.some((note) => note.dur === 1));
    } else {
      for (const bar of [1, 2, 3]) {
        assert.equal(right.filter((note) => note.bar === bar).length, 8);
        assert.equal(left.filter((note) => note.bar === bar).length, 4);
        assert.ok(right.filter((note) => note.bar === bar).every((note) => note.dur === 0.5));
        assert.ok(left.filter((note) => note.bar === bar).every((note) => note.dur === 1));
      }
    }
  }
});

test("fresh chord routes reuse actual source voicings and complete dominant sevenths", () => {
  for (const { exercise, task } of variants.filter(({ task }) => task.transferFamily === "cadence")) {
    const original = scoreOf(exercise), score = scoreOf(task);
    const originalNotes = new Set(original.notes.map((note) => `${note.hand}:${note.midi}`));
    assert.ok(score.notes.every((note) => originalNotes.has(`${note.hand}:${note.midi}`)), `${exercise.id}: a new route introduced an untaught voicing or register`);
    const groups = new Map();
    for (const note of score.notes) { if (!groups.has(note.beat)) groups.set(note.beat, []); groups.get(note.beat).push(note); }
    const originalGroups = new Map();
    for (const note of original.notes) { if (!originalGroups.has(note.beat)) originalGroups.set(note.beat, []); originalGroups.get(note.beat).push(note); }
    const voicings = new Set([...originalGroups.values()].map((notes) => uniqueMidi(notes).join(",")));
    for (const notes of groups.values()) assert.ok(voicings.has(uniqueMidi(notes).join(",")), `${exercise.id}: chord lost a sounding source tone`);
    const tonic = uniqueMidi(originalGroups.get(0));
    assert.deepEqual(uniqueMidi([...groups.values()].at(-1)), tonic, `${exercise.id}: final chord does not return home`);
    assert.ok([...groups.values()].some((notes) => notes[0].dur === 2));
    if (exercise.id === "a4-chord-cadence") assert.ok(score.notes.some((note) => note.midi === 68), "E7 must retain G#4");
    if (exercise.id === "e7-chords-primary") assert.ok([...groups.values()].some((notes) => JSON.stringify(uniqueMidi(notes)) === JSON.stringify([47, 54, 63, 69, 71])), "B7 must retain LH B2/F#3 and upper D#4/A4/B4");
  }
});

test("passage-specific transfer is offered only for its three matched source preparations", () => {
  const ids=["d-canon-minor-lh-prep","a6-mozart-key-shape","e7-blues-sevenths"];
  for(const id of ids){
    assert.equal(supportsTransfer(byId.get(id)),true,id);
    assert.equal(supportsTransfer({...byId.get(id),section:"placement"}),false,id);
    assert.equal(supportsTransfer({...byId.get(id),archived:true}),false,id);
    assert.equal(supportsTransfer({...byId.get(id),id:`${id}-other`}),false,id);
  }
  for(const id of ["d-canon-bass-chords","a6-mozart-melody","e7-switchyard-blues","sc-major-a-1-r"])assert.equal(supportsTransfer(byId.get(id)),false,id);
});

test("fresh Canon routes retain both actual released minor-chord placements and quarter-note attacks", () => {
  const source=scoreOf(byId.get("d-canon-minor-lh-prep")),sourceNotes=new Set(source.notes.map(n=>`${n.hand}:${n.midi}`));
  for(const {task} of variants.filter(({task})=>task.transferFamily==="canon-travel")){
    const score=scoreOf(task),shapes=new Set();
    assert.equal(task.hands,"L");
    assert.ok(score.notes.every(n=>n.hand==="L"&&n.dur===1&&sourceNotes.has(`${n.hand}:${n.midi}`)));
    for(let bar=1;bar<=4;bar++){
      const notes=score.notes.filter(n=>n.bar===bar),start=(bar-1)*4;
      const root=notes.find(n=>n.beat===start).midi;
      const upper=root===47?[50,54,59]:root===42?[45,49,54]:null;
      assert.ok(upper,`${task.transferId}: wrong bass root`);shapes.add(root);
      for(const offset of [0,2])assert.deepEqual(notes.filter(n=>n.beat===start+offset).map(n=>n.midi),[root]);
      for(const offset of [1,3])assert.deepEqual(notes.filter(n=>n.beat===start+offset).map(n=>n.midi),upper);
    }
    assert.deepEqual([...shapes].sort((a,b)=>a-b),[42,47]);
    assert.match(task.fingering,/B2 uses 5.*D3–F#3–B3 uses 5–3–1.*F#2 uses 5.*A2–C#3–F#3 uses 5–3–1.*Release/);
  }
});

const printedFingers=(task,hand)=>{
  const out=[];
  for(const line of abcjs.parseOnly(task.abc)[0].lines)for(const [i,staff] of (line.staff||[]).entries()){
    if((i===0?"R":"L")!==hand)continue;
    for(const voice of staff.voices)for(const event of voice)if(event.el_type==="note"&&event.pitches?.length)out.push(Number(event.decoration?.find(v=>/^[1-5]$/.test(v))));
  }
  return out;
};

test("fresh Mozart melodies stay within A4–E5 with the same fixed fingers on every printed note", () => {
  const fingers={69:1,71:2,73:3,74:4,76:5};
  for(const {task} of variants.filter(({task})=>task.transferFamily==="mozart-position")){
    const notes=scoreOf(task).notes;
    assert.equal(task.hands,"R");assert.equal(notes.length,16);
    assert.ok(notes.every(n=>n.hand==="R"&&n.dur===1&&Object.hasOwn(fingers,n.midi)));
    assert.deepEqual(uniqueMidi(notes),[69,71,73,74,76]);
    assert.deepEqual(printedFingers(task,"R"),notes.map(n=>fingers[n.midi]));
    assert.equal(notes.at(-1).midi,69);
  }
});

test("fresh blues routes retain E7/A7/B7 tones, familiar RH fingers and separate held roots", () => {
  const expected=[
    {root:40,right:[64,68,71,74],fingers:[1,2,3,5],pcs:[2,4,8,11]},
    {root:45,right:[69,73,76,67],fingers:[1,3,5,1],pcs:[1,4,7,9]},
    {root:47,right:[66,69,75,71],fingers:[1,2,5,3],pcs:[3,6,9,11]},
    {root:40,right:[68,71,74,64],fingers:[2,3,5,1],pcs:[2,4,8,11]},
  ];
  for(const {task} of variants.filter(({task})=>task.transferFamily==="blues-sevenths")){
    const score=scoreOf(task),fingers=printedFingers(task,"R"),used=new Set();
    for(let bar=1;bar<=4;bar++){
      const left=score.notes.filter(n=>n.bar===bar&&n.hand==="L"),right=score.notes.filter(n=>n.bar===bar&&n.hand==="R");
      assert.equal(left.length,1);assert.equal(left[0].dur,4);assert.equal(left[0].beat,(bar-1)*4);
      assert.equal(right.length,4);assert.ok(right.every(n=>n.dur===1));
      const cell=expected.find(c=>c.root===left[0].midi&&JSON.stringify(c.right)===JSON.stringify(right.map(n=>n.midi)));
      assert.ok(cell,`${task.transferId}: changed known chord-tone line or register`);used.add(expected.indexOf(cell));
      assert.deepEqual(fingers.slice((bar-1)*4,bar*4),cell.fingers);
      assert.deepEqual([...new Set([...right,left[0]].map(n=>n.midi%12))].sort((a,b)=>a-b),cell.pcs);
    }
    assert.equal(used.size,4,"each new route reorders all four known cells");
    assert.match(task.fingering,/release and move down to G4.*No four-note RH chord or wide span has to be held/);
  }
});

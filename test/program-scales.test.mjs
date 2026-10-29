import assert from "node:assert/strict";
import { test } from "node:test";
import abcjs from "abcjs";
import { SCALE_TRACK, SCALE_STAGES, SCALE_EXERCISES } from "../src/program/scales.js";
import { EXERCISES, SESSIONS } from "../src/program/curriculum.js";
import { parseScore } from "../src/score/scoreModel.js";
import { normalizeProgress, recordAttempt, sessionProgress } from "../src/program/progress.js";
import { contextForExercise } from "../src/program/progress.js";
import { reviewQueue } from "../src/program/review.js";

// These expectations use pitch-class arithmetic independently of the content's
// spelling/ABC builder. In particular, melodic descent must not repeat ascent.
const pitchClass = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const intervals = {
  major: [0, 2, 4, 5, 7, 9, 11],
  "natural-minor": [0, 2, 3, 5, 7, 8, 10],
  "harmonic-minor": [0, 2, 3, 5, 7, 8, 11],
  "melodic-minor": [0, 2, 3, 5, 7, 9, 11],
};
const ascent = (steps, octaves) => Array.from({ length: octaves }, (_, octave) => steps.map(n => n + octave * 12)).flat().concat(octaves * 12);
const scores = new Map(SCALE_EXERCISES.map(e => [e.id, parseScore(e.abc, abcjs)]));
const handsFor = e => e.hands === "both" ? ["R", "L"] : [e.hands];

test("the continuing route covers all twelve majors at both ranges and every hand scope", () => {
  assert.equal(SCALE_TRACK.id, "continuing-scales");
  assert.equal(SESSIONS.length, 80, "the original guided course retains its saved block identities");
  const majors = SCALE_EXERCISES.filter(e => e.technique.pattern === "major");
  assert.deepEqual([...new Set(majors.map(e => pitchClass[e.technique.tonic]))].sort((a,b)=>a-b), Array.from({length:12}, (_,i)=>i));
  for (const tonic of new Set(majors.map(e => e.technique.tonic))) for (const octaves of [1,2]) for (const hands of ["R","L","both"]) {
    assert.equal(majors.filter(e => e.technique.tonic === tonic && e.technique.octaves === octaves && e.hands === hands).length, 1, `${tonic}: ${octaves} octave ${hands}`);
  }
});

test("every new lesson is reachable once in a paced stage and participates in the shared catalogue", () => {
  const routed = SCALE_STAGES.flatMap(s => s.exerciseIds);
  assert.equal(new Set(routed).size, routed.length, "duplicate lesson routes");
  assert.deepEqual([...routed].sort(), SCALE_EXERCISES.map(e=>e.id).sort());
  for (const s of SCALE_STAGES) {
    assert.ok(s.title && s.description && s.prerequisites.length, s.id);
    for (const id of s.exerciseIds) assert.equal(SCALE_EXERCISES.find(e=>e.id===id)?.stageId, s.id, id);
  }
  for (const e of SCALE_EXERCISES) {
    assert.equal(e.trackId, SCALE_TRACK.id, e.id);
    assert.equal(e.unitId, SCALE_TRACK.id, e.id);
    assert.ok(EXERCISES.includes(e), e.id);
  }
});

test("major/minor scales sound the complete written range, including classical melodic descent", () => {
  for (const e of SCALE_EXERCISES.filter(e=>intervals[e.technique.pattern])) {
    const t = e.technique;
    const up = ascent(intervals[t.pattern], t.octaves);
    const down = ascent(intervals[t.pattern === "melodic-minor" ? "natural-minor" : t.pattern], t.octaves).reverse();
    for (const hand of handsFor(e)) {
      assert.equal(t.tonicMidi[hand] % 12, pitchClass[t.tonic], `${e.id} ${hand} register`);
      const notes = scores.get(e.id).notes.filter(n=>n.hand===hand).map(n=>n.midi);
      assert.deepEqual(notes, [...up, ...down.slice(1)].map(n=>n+t.tonicMidi[hand]), `${e.id}: ${hand}`);
      const fingers = t.fingerings[hand];
      assert.equal(fingers.up.length, up.length, `${e.id} ${hand} ascending fingering length`);
      assert.equal(fingers.down.length, down.length, `${e.id} ${hand} descending fingering length`);
      for (const n of [...fingers.up, ...fingers.down]) assert.ok(Number.isInteger(n) && n>=1 && n<=5, `${e.id}: finger ${n}`);
      // The selected published scale fingerings put thumbs on white keys.
      // This catches both a naive C-major transposition and carrying harmonic
      // G-sharp minor's LH fingering into its different natural-minor shape.
      for (const [line, fs] of [[up,fingers.up],[down,fingers.down]]) for (let i=0;i<line.length;i++) {
        if (fs[i] === 1) assert.ok(![1,3,6,8,10].includes((line[i]+t.tonicMidi[hand])%12), `${e.id}: ${hand} thumb on black key at index ${i}`);
      }
      if (t.octaves === 2) assert.notEqual(fingers.up[7], 5, `${e.id}: internal tonic must continue, not use endpoint finger 5`);
    }
  }
});

test("minor forms extend all twelve tonics, with D/E/G available beyond A", () => {
  for (const pattern of ["natural-minor","harmonic-minor","melodic-minor"]) {
    const group = SCALE_EXERCISES.filter(e=>e.technique.pattern===pattern);
    assert.deepEqual([...new Set(group.map(e=>pitchClass[e.technique.tonic]))].sort((a,b)=>a-b), Array.from({length:12},(_,i)=>i), pattern);
    for (const tonic of ["A","D","E","G"]) for (const octaves of [1,2]) for (const hands of ["R","L","both"]) {
      assert.ok(group.some(e=>e.technique.tonic===tonic && e.technique.octaves===octaves && e.hands===hands), `${tonic} ${pattern} ${octaves} ${hands}`);
    }
  }
});

test("published major fingering families retain their distinct starts and endpoints", () => {
  // EIU Scale and Arpeggio Fingering Charts, p.1, inspected independently of
  // the generator. Especially protect B's LH and the black-tonic families.
  const expected = {
    C:["12312345","54321321"],G:["12312345","54321321"],F:["12341234","54321321"],
    D:["12312345","54321321"],A:["12312345","54321321"],E:["12312345","54321321"],
    Bb:["41231234","32143213"],Eb:["31234123","32143213"],B:["12312345","43214321"],
    Ab:["34123123","32143213"],Db:["23123412","32143213"],Gb:["23412312","43213214"],
  };
  for (const [tonic, pair] of Object.entries(expected)) {
    const e = SCALE_EXERCISES.find(e=>e.technique.pattern === "major" && e.technique.tonic === tonic && e.technique.octaves === 1 && e.hands === "both");
    for (const [i,hand] of ["R","L"].entries()) assert.equal(e.technique.fingerings[hand].up.join(""),pair[i],`${tonic} ${hand}`);
  }
});

test("minor form changes retain the hands' distinct ascent and descent fingers", () => {
  const get = (tonic,pattern) => SCALE_EXERCISES.find(e=>e.technique.tonic===tonic && e.technique.pattern===pattern && e.technique.octaves===1 && e.hands==="both").technique.fingerings;
  assert.equal(get("G#","natural-minor").L.up.join(""),"32132143");
  assert.equal(get("G#","harmonic-minor").L.up.join(""),"32143213");
  assert.equal(get("G#","melodic-minor").L.up.join(""),"32143213");
  assert.equal(get("G#","melodic-minor").L.down.join(""),"34123123");
  for (const tonic of ["C#","F#"]) {
    const f=get(tonic,"melodic-minor").R;
    assert.equal(f.up[0],2,tonic); assert.equal(f.up.at(-1),3,tonic);
    assert.equal(f.down[0],3,tonic); assert.equal(f.down.at(-1),3,tonic);
    assert.notDeepEqual(f.down,[...f.up].reverse(),`${tonic}: natural descent needs its own fingers`);
  }
});

test("finger numbers printed above every sounding note agree with the written hand's setup", () => {
  for (const e of SCALE_EXERCISES) {
    const printed={R:[],L:[]}, tune=abcjs.parseOnly(e.abc)[0];
    for(const line of tune.lines) for(const [i,staff] of (line.staff||[]).entries()) for(const voice of staff.voices) for(const event of voice) {
      if(event.el_type!=="note" || !event.pitches?.length) continue;
      printed[i===0?"R":"L"].push(Number(event.decoration?.find(value=>/^[1-5]$/.test(value))));
    }
    for(const hand of handsFor(e)) {
      const f=e.technique.fingerings[hand];
      const [outward,inward]=e.technique.outwardDirections?.[hand]===-1 ? [f.down,f.up] : [f.up,f.down];
      assert.deepEqual(printed[hand],[...outward,...inward.slice(1)],`${e.id}: ${hand}`);
    }
  }
});

test("arpeggios use root, third and fifth through their complete range", () => {
  for (const quality of ["major","minor"]) {
    const group = SCALE_EXERCISES.filter(e=>e.technique.pattern === "arpeggio" && e.technique.quality === quality);
    assert.deepEqual([...new Set(group.map(e=>pitchClass[e.technique.tonic]))].sort((a,b)=>a-b), Array.from({length:12},(_,i)=>i), quality);
    for (const e of group) {
      const t=e.technique, up=ascent([0, quality === "major" ? 4 : 3, 7],t.octaves);
      for (const hand of handsFor(e)) {
        assert.deepEqual(scores.get(e.id).notes.filter(n=>n.hand===hand).map(n=>n.midi), [...up,...up.slice(0,-1).reverse()].map(n=>n+t.tonicMidi[hand]), `${e.id}: ${hand}`);
        assert.equal(t.fingerings[hand].up.length, up.length, e.id);
        assert.equal(t.fingerings[hand].down.length, up.length, e.id);
      }
    }
  }
});

test("chromatic work includes every semitone and contrary motion really opposes the hands", () => {
  const chromatic = SCALE_EXERCISES.filter(e=>e.technique.pattern === "chromatic");
  for (const hand of ["R","L","both"]) assert.ok(chromatic.some(e=>e.hands===hand));
  for (const e of chromatic) for (const hand of handsFor(e)) {
    const notes=scores.get(e.id).notes.filter(n=>n.hand===hand).map(n=>n.midi);
    const peak=e.technique.octaves*12;
    assert.deepEqual(notes, [...Array.from({length:peak+1},(_,i)=>i),...Array.from({length:peak},(_,i)=>peak-i-1)].map(n=>n+e.technique.tonicMidi[hand]), e.id);
  }
  const contrary=SCALE_EXERCISES.filter(e=>e.technique.pattern === "contrary");
  assert.ok(contrary.length);
  for (const e of contrary) {
    const score=scores.get(e.id), r=score.notes.filter(n=>n.hand==="R"), l=score.notes.filter(n=>n.hand==="L");
    assert.equal(r.length,l.length,e.id); assert.ok(r.length>=15,e.id);
    const up=ascent(intervals.major,e.technique.octaves), down=[...up].reverse();
    assert.deepEqual(r.map(n=>n.midi),[...up,...up.slice(0,-1).reverse()].map(n=>n+e.technique.tonicMidi.R),e.id);
    assert.deepEqual(l.map(n=>n.midi),[...down,...up.slice(1)].map(n=>n+e.technique.tonicMidi.L-e.technique.octaves*12),e.id);
    for(let i=1;i<r.length;i++) assert.equal(Math.sign(r[i].midi-r[i-1].midi), -Math.sign(l[i].midi-l[i-1].midi), e.id);
    assert.equal(r[0].midi,r.at(-1).midi,e.id); assert.equal(l[0].midi,l.at(-1).midi,e.id);
  }
});

test("saved track practice returns through cumulative review without completing a core block", () => {
  const e=SCALE_EXERCISES.find(e=>e.technique.tonic==="Bb" && e.technique.pattern==="major");
  const entry={exerciseId:e.id,section:"scales",minutes:5,assessment:"ready",date:"2026-10-01",bpm:e.bpm,hands:e.hands,fromBar:1,toBar:2,note:"Recall the black-key starting finger."};
  assert.deepEqual(contextForExercise({}, SESSIONS, e.id),{});
  const saved=normalizeProgress(JSON.parse(JSON.stringify(recordAttempt({},entry))));
  assert.deepEqual(saved.completedBlocks,{});
  assert.ok(SESSIONS.every(s=>!sessionProgress(saved,s).started));
  const due=reviewQueue(saved,EXERCISES,{today:"2026-10-04",limit:10});
  assert.equal(due[0].exercise,e);
  assert.equal(due[0].previousAttempt.note,entry.note);
  assert.equal(due[0].previousAttempt.toBar,2);
});

// ============================================================
// Ear training core — pure, no React, no Web Audio. A phrase
// generator (generateRound) plus a session state machine
// (createEarSession). EarPanel drives both; the existing coach
// (gradeLine via useCoach) does all grading, untouched.
// ============================================================
import { midiToFreq, midiToNote } from "./audio/notes.js";

// Tiny deterministic PRNG so tests can pin every draw; the app seeds per session.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const INTERVAL_NAMES = ["P1", "m2", "M2", "m3", "M3", "P4", "TT", "P5", "m6", "M6", "m7", "M7", "P8"];

// "↑m3", "↓P5" — used for missed labels, so trouble-spot memory reads musically.
export function intervalLabel(prevMidi, curMidi) {
  const d = curMidi - prevMidi;
  const name = INTERVAL_NAMES[Math.min(Math.abs(d), 12)];
  return d === 0 ? name : (d > 0 ? "↑" : "↓") + name;
}

const SMALL_INTERVALS = [2, 3, 4, 5, 7];                    // M2 m3 M3 P4 P5
const ALL_INTERVALS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const noteLabel = (m) => { const n = midiToNote(m); return `${n.name}${n.octave}`; };
const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

// Two notes: draw an interval, a direction, then a start that keeps both ends
// in range. Configs are schema-checked to span >= 12 semitones, so max never
// dips below min.
function intervalMidis(diff, lo, hi, rng) {
  const step = pick(diff <= 1 ? SMALL_INTERVALS : ALL_INTERVALS, rng);
  const up = rng() < 0.5;
  const min = up ? lo : lo + step;
  const max = up ? hi - step : hi;
  const start = min + Math.floor(rng() * (max - min + 1));
  return [start, up ? start + step : start - step];
}

// One round: targets in gradeLine's shape, the prompt in playSequence's shape.
// `diff` is the item's *current* difficulty, so the engine's level-up
// suggestions walk this ladder with no ear-specific code.
export function generateRound({ diff, ear, rng }) {
  const [lo, hi] = ear.range;
  const midis = intervalMidis(diff, lo, hi, rng); // phrases (diff >= 3) arrive in the next task
  return {
    targets: midis.map((m) => ({ midi: m, label: noteLabel(m) })),
    promptVoices: midis.map((m) => [midiToFreq(m)]),
    bpm: ear.bpm || 80,
  };
}

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

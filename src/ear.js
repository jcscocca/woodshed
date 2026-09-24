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

const FLAT_KEYS = new Set(["F", "Bb", "Eb"]);
const noteLabel = (m, flats) => { const n = midiToNote(m, flats); return `${n.name}${n.octave}`; };
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

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
export const KEY_ROOT = { C: 0, G: 7, D: 2, A: 9, E: 4, F: 5, Bb: 10, Eb: 3 };
const PHRASE_LEN = { 3: [3, 3], 4: [4, 5], 5: [5, 6] };
const PHRASE_REACH = { 3: 2, 4: 5, 5: 7 }; // max scale-steps per move (2≈third, 5≈sixth, 7≈octave)

function scaleNotes(key, lo, hi) {
  const root = KEY_ROOT[key];
  const out = [];
  for (let m = lo; m <= hi; m++) if (MAJOR.includes((((m - root) % 12) + 12) % 12)) out.push(m);
  return out;
}

// Random walk over the scale. No repeated adjacent notes — a legato re-strike
// of the same pitch never re-confirms in the note stream (see coach.js gapMs),
// so repeats would be ungradeable, not just hard.
function phraseMidis(diff, key, lo, hi, rng) {
  const d = Math.min(diff, 5);
  const scale = scaleNotes(key, lo, hi);
  const [a, b] = PHRASE_LEN[d];
  const len = a + Math.floor(rng() * (b - a + 1));
  let i = Math.floor(rng() * scale.length);
  const midis = [scale[i]];
  while (midis.length < len) {
    const reach = 1 + Math.floor(rng() * PHRASE_REACH[d]);
    const dir = rng() < 0.5 ? -1 : 1;
    let j = i + dir * reach;
    if (j < 0 || j >= scale.length) j = i - dir * reach; // bounce off the range edge
    j = Math.max(0, Math.min(scale.length - 1, j));
    let m = scale[j];
    const prev = midis[midis.length - 1];
    if (d >= 5 && rng() < 0.15) {
      const c = m + (rng() < 0.5 ? 1 : -1); // chromatic neighbor, color only
      if (c >= lo && c <= hi && Math.abs(c - prev) <= 12 && c !== prev) m = c;
    }
    // A chromatically-shifted prev can push this diatonic-anchored m one
    // semitone past the octave cap; redraw rather than let it slip through.
    if (m === prev || Math.abs(m - prev) > 12) continue;
    midis.push(m);
    i = j;
  }
  return midis;
}

// One round: targets in gradeLine's shape, the prompt in playSequence's shape.
// `diff` is the item's *current* difficulty, so the engine's level-up
// suggestions walk this ladder with no ear-specific code.
export function generateRound({ diff, ear, rng }) {
  const [lo, hi] = ear.range;
  const key = diff <= 2 ? null : pick(ear.keys, rng);
  const midis = key ? phraseMidis(diff, key, lo, hi, rng) : intervalMidis(diff, lo, hi, rng);
  return {
    targets: midis.map((m) => ({ midi: m, label: noteLabel(m, FLAT_KEYS.has(key)) })),
    promptVoices: midis.map((m) => [midiToFreq(m)]),
    bpm: ear.bpm || 80,
  };
}

// Replay budget per round, by item difficulty. The help ladder tightens here
// and in the "starts on" hint (EarPanel shows it at diff <= 2) — never via octave.
export const REPLAYS = { 1: Infinity, 2: Infinity, 3: 2, 4: 1, 5: 1 };

// Session state machine: idle -> prompt -> listen -> reveal -> (prompt … | done).
// Pure and timer-free: EarPanel drives transitions (it knows the prompt's
// duration and owns the mic); tests drive them synchronously. Out-of-phase
// calls are no-ops, so a stray timer can never corrupt a session.
export function createEarSession({ diff, ear }) {
  const total = (ear && ear.rounds) || 5;
  const budget = REPLAYS[diff] ?? 1;
  const s = { phase: "idle", round: 0, total, replaysLeft: budget, current: null, rounds: [] };
  // Missed targets become interval labels ("↓m3") so trouble-spot memory reads
  // musically; a missed opener has no previous note, hence "first note".
  const missedLabels = (result) =>
    result.results
      .map((r, k) => ({ r, k }))
      .filter(({ r }) => r.status !== "caught")
      .map(({ k }) => (k === 0 ? "first note" : intervalLabel(s.current.targets[k - 1].midi, s.current.targets[k].midi)));
  return {
    get state() { return { ...s }; },
    begin(rng) {
      if (s.phase !== "idle") return;
      s.phase = "prompt"; s.round = 1; s.replaysLeft = budget; s.current = generateRound({ diff, ear, rng });
    },
    promptEnded() { if (s.phase === "prompt") s.phase = "listen"; },
    replay() {
      if (s.phase !== "listen" || s.replaysLeft <= 0) return false;
      s.replaysLeft -= 1; s.phase = "prompt"; return true;
    },
    roundGraded(result) {
      if (s.phase !== "listen") return;
      s.rounds.push({ accuracy: result.accuracy, missed: missedLabels(result) });
      s.phase = "reveal";
    },
    next(rng) {
      if (s.phase !== "reveal") return;
      if (s.round >= s.total) { s.phase = "done"; return; }
      s.round += 1; s.replaysLeft = budget; s.current = generateRound({ diff, ear, rng }); s.phase = "prompt";
    },
    summary() {
      const n = s.rounds.length;
      return {
        accuracy: n ? Math.round(s.rounds.reduce((a, r) => a + r.accuracy, 0) / n) : 0,
        missed: [...new Set(s.rounds.flatMap((r) => r.missed))],
        rounds: s.rounds.slice(),
      };
    },
  };
}

// Sight-reading drills, pure: generateDrill(level, seed) -> a short ABC tune. The
// melody is a seeded walk over the key's scale, drawn backwards from the tonic so it
// always ends there.
import { mulberry32 } from "../ear.js";

// The major scale in semitones, which is also where the white keys sit from C.
const LETTERS = "CDEFGAB", MAJOR = [0, 2, 4, 5, 7, 9, 11];
// Each hand's five-finger position starts on the tonic in these octaves.
const KEYS = {
  C: { tonic: "C", rh: 4, lh: 3, sig: {} },
  G: { tonic: "G", rh: 4, lh: 2, sig: { F: 1 } },
  F: { tonic: "F", rh: 4, lh: 2, sig: { B: -1 } },
  D: { tonic: "D", rh: 4, lh: 3, sig: { F: 1, C: 1 } },
  Bb: { tonic: "B", rh: 3, lh: 2, sig: { B: -1, E: -1 } },
};

// Rhythm cells in eighths. span: how many scale steps above the tonic the melody may
// reach; leap: its widest move in scale steps (1 a step, 2 a third, 4 a fifth).
const Q = [2], H = [4], W = [8], EE = [1, 1], DH = [6], DQE = [3, 1];
export const LEVELS = [
  { name: "Reading one hand", melody: "R", keys: ["C"], span: 4, leap: 1, rhythms: [Q, H], metres: [4], bars: 2 },
  { name: "Bass clef", melody: "L", keys: ["C"], span: 4, leap: 1, rhythms: [Q, H], metres: [4], bars: 2 },
  { name: "Switching hands", melody: "turns", keys: ["C"], span: 4, leap: 2, rhythms: [Q, H, W], metres: [4], bars: 2 },
  { name: "Hands together", melody: "R", bass: "roots", keys: ["C"], span: 4, leap: 2, rhythms: [Q, H], metres: [4], bars: 2 },
  { name: "Moving faster", melody: "R", bass: "roots", keys: ["C"], span: 7, leap: 4, rhythms: [Q, H, EE], metres: [4], bars: 2 },
  { name: "Three beats", melody: "R", bass: "roots", keys: ["C"], span: 7, leap: 4, rhythms: [Q, H, EE, DH], metres: [3], bars: 2 },
  { name: "First sharp key", melody: "R", bass: "roots", keys: ["G"], span: 4, leap: 4, rhythms: [Q, H, EE, DH], metres: [3, 4], bars: 2 },
  { name: "First flat key", melody: "R", bass: "roots", keys: ["F"], span: 4, leap: 4, rhythms: [Q, H, EE, DH, DQE], metres: [3, 4], bars: 2 },
  { name: "Longer, moving bass", melody: "R", bass: "fifths", keys: ["C", "G", "F"], span: 7, leap: 4, rhythms: [Q, H, EE, DH, DQE], metres: [4], bars: 4 },
  { name: "Accidentals", melody: "R", bass: "fifths", keys: ["C", "G", "F", "D", "Bb"], span: 7, leap: 4, rhythms: [Q, H, EE, DH, DQE], metres: [4], bars: 4, chromatic: true },
];

export const drillBpm = (level) => Math.round(60 + ((level - 1) * 4) / 3);

const pick = (rng, xs) => xs[Math.floor(rng() * xs.length)];
const size = (cell) => cell.reduce((a, b) => a + b);
const natural = (s) => 12 * (Math.floor(s / 7) + 1) + MAJOR[s % 7];
const name = (s) => { const o = Math.floor(s / 7), L = LETTERS[s % 7]; return o >= 5 ? L.toLowerCase() + "'".repeat(o - 5) : L + ",".repeat(4 - o); };

// The drill's last bar closes on a single note, never an eighth.
function fill(rng, cells, len, closing) {
  const bar = [];
  for (let left = len; left > 0; ) {
    const cell = pick(rng, cells.filter((c) => size(c) <= left && (!closing || bar.length || c.length === 1)));
    bar.unshift(cell);
    left -= size(cell);
  }
  return bar;
}

// 15% repeat, 60% step, 25% skip (a step when leap is 1); redrawn if it leaves the range
// or is a tritone (fa-ti, ti-fa).
const semis = (d) => 12 * Math.floor(d / 7) + MAJOR[d % 7];
function move(rng, d, span, leap) {
  for (;;) {
    const r = rng(), by = r < 0.15 ? 0 : r < 0.75 || leap === 1 ? 1 : 2 + Math.floor(rng() * (leap - 1));
    const to = rng() < 0.5 ? d + by : d - by;
    if (to >= 0 && to <= span && Math.abs(semis(to) - semis(d)) !== 6) return to;
  }
}

// Scale degrees for phrases of the given lengths. At most 40% of a phrase's moves skip,
// so each hand's line is at least 60% steps and repeats; the move between phrases (a
// change of hands) is free.
function melody(rng, phrases, span, leap) {
  const degs = [];
  let d = span >= 7 && rng() < 0.5 ? 7 : 0;
  for (const len of [...phrases].reverse()) {
    let skips = Math.floor(0.4 * (len - 1));
    for (let i = 0; i < len; i++) {
      if (degs.length) {
        const to = move(rng, d, span, i && !skips ? 1 : leap);
        if (i && Math.abs(to - d) > 1) skips--;
        d = to;
      }
      degs.unshift(d);
    }
  }
  return degs;
}

// A repeated note becomes a chromatic neighbour of the note it repeats: a semitone away
// on the side the melody came from, where the scale has a whole step. Never around the
// key's own sharps and flats, which would need E#, B#, Cb or Fb, nor a tritone from the
// note before.
function neighbours(rng, notes, sig, scale) {
  for (let j = 0; j + 1 < notes.length; j++) {
    const x = notes[j + 1], p = notes[j - 1];
    if (notes[j].s !== x.s || sig[LETTERS[x.s % 7]]) continue;
    const dir = p && p.s !== x.s ? Math.sign(p.s - x.s) : rng() < 0.5 ? 1 : -1;
    if (scale(x.s + dir) === x.midi + dir || (p && Math.abs(p.midi - x.midi - dir) === 6)) continue;
    Object.assign(notes[j], { s: x.s + dir, midi: x.midi + dir });
    j++;
  }
}

// A melody note of a quarter or longer a semitone (m2 or M7, any octave) from a bass note
// sounding with it.
function clashes(mel, bass) {
  const timed = (bar) => { let t = 0; return bar.flat().map((n) => ({ midi: n.midi, dur: n.dur, from: t, to: (t += n.dur) })); };
  const lh = timed(bass);
  return timed(mel).some((n) => n.dur >= 2 && lh.some((b) => b.from < n.to && n.from < b.to && [1, 11].includes((n.midi - b.midi + 120) % 12)));
}

// An accidental lasts to the barline, so a later note on the same letter restates its own.
function abcBar(bar, sig) {
  const shown = {};
  return bar.map((cell) => cell.map(({ s, midi, dur }) => {
    const L = LETTERS[s % 7], alt = midi - natural(s), was = shown[L] ?? sig[L] ?? 0;
    shown[L] = alt;
    return (alt === was ? "" : "_=^"[alt + 1]) + name(s) + (dur > 1 ? dur : "");
  }).join("")).join(" ");
}

export function generateDrill(level, seed) {
  const lv = LEVELS[level - 1], rng = mulberry32(seed * 16 + level);
  const key = pick(rng, lv.keys), k = KEYS[key], beats = pick(rng, lv.metres), len = beats * 2;
  const scale = (s) => natural(s) + (k.sig[LETTERS[s % 7]] || 0);
  const home = (hand) => LETTERS.indexOf(k.tonic) + 7 * (hand === "R" ? k.rh : k.lh);
  const note = (hand, deg, dur) => ({ s: home(hand) + deg, midi: scale(home(hand) + deg), dur, deg });
  const lhBar = (r) => { const f = (r + 4) % 7; return lv.bass === "roots" ? [[note("L", r, len)]] : [r, f, r, f].map((x) => [note("L", x, 2)]); };

  for (;;) {
    const rhythm = Array.from({ length: lv.bars }, (_, b) => fill(rng, lv.rhythms, len, b === lv.bars - 1));
    const counts = rhythm.map((bar) => bar.flat().length);
    const turns = rng() < 0.5 ? "RL" : "LR";
    const hands = rhythm.map((_, b) => (lv.melody === "turns" ? turns[b % 2] : lv.melody));
    const degs = melody(rng, lv.melody === "turns" ? counts : [counts.reduce((a, b) => a + b)], lv.span, lv.leap);
    let i = 0;
    const tune = rhythm.map((bar, b) => bar.map((cell) => cell.map((dur) => note(hands[b], degs[i++], dur))));
    if (lv.chromatic) neighbours(rng, tune.flat(2), k.sig, scale);

    // The left hand plays I, IV or V: one that doesn't clash with the bar, preferably
    // holding the downbeat's note. The last bar is I; if it can't be, the drill is redrawn.
    const bass = lv.bass && tune.map((bar, b) => {
      const ok = [0, 3, 4].filter((r) => !clashes(bar, lhBar(r))), d = bar[0][0].deg;
      const fit = ok.filter((r) => [0, 2, 4].includes((d - r + 7) % 7));
      const r = b === lv.bars - 1 ? (ok.includes(0) ? 0 : undefined) : pick(rng, fit.length ? fit : ok);
      return r === undefined ? null : lhBar(r);
    });
    if (bass && bass.includes(null)) continue;

    const voice = (hand) => tune.map((bar, b) => (hands[b] === hand ? abcBar(bar, k.sig) : `z${len}`));
    const right = voice("R"), left = bass ? bass.map((bar) => abcBar(bar, k.sig)) : voice("L");
    const head = `X:1\nM:${beats}/4\nL:1/8\nK:${key}`, line = (bars) => `${bars.join(" | ")} |]`;
    if (lv.melody === "R" && !bass) return `${head}\n${line(right)}`;
    if (lv.melody === "L") return `${head} clef=bass\n${line(left)}`;
    return `${head}\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n[V:1] ${line(right)}\n[V:2] ${line(left)}`;
  }
}

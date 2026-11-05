// The keys a passage uses, for the keyboard map under the score. Finger numbers
// come from the score's written fingering (!1!..!5!) or from CHORD_FINGERS.
import { CHORD_FINGERS } from "./chordFingers.js";

const tokensFor = (fingers, hand) => fingers?.[hand]?.trim().split(/\s+/) || [];

// One attack per hand per onset; a chord is one attack with several pitches.
function attacksOf(score, fingers) {
  const byOnset = new Map();
  for (const n of score.notes) {
    const id = `${n.hand}:${n.beat}`;
    if (!byOnset.has(id)) byOnset.set(id, { hand: n.hand, beat: n.beat, bar: n.bar, chord: n.chord, notes: [] });
    const attack = byOnset.get(id);
    attack.notes.push({ midi: n.midi, finger: n.finger });
    attack.chord ||= n.chord;
  }
  const attacks = [...byOnset.values()].sort((a, b) => a.beat - b.beat || (a.hand === "R" ? -1 : 1));
  const chordAt = new Map(attacks.filter((a) => a.chord).map((a) => [a.beat, a.chord]));
  for (const a of attacks) a.chord ||= chordAt.get(a.beat);
  for (const hand of ["R", "L"]) {
    const tokens = tokensFor(fingers, hand);
    attacks.filter((a) => a.hand === hand).forEach((a, i) => {
      a.notes.sort((x, y) => x.midi - y.midi);
      if (tokens[i] && tokens[i] !== "-") a.notes.forEach((n, j) => { n.finger = Number(tokens[i][j]); });
    });
  }
  return attacks;
}

// Every token must match its attack's pitch count, so a score edit cannot leave
// fingers on the wrong notes.
export function fingerErrors(score, fingers) {
  const attacks = attacksOf(score, null), errors = [];
  for (const hand of ["R", "L"]) {
    const tokens = tokensFor(fingers, hand), own = attacks.filter((a) => a.hand === hand);
    if (fingers?.[hand] && tokens.length !== own.length) errors.push(`${hand}: ${tokens.length} tokens for ${own.length} attacks`);
    own.forEach((a, i) => {
      const t = tokens[i];
      if (t && t !== "-" && (!/^[1-5]+$/.test(t) || t.length !== a.notes.length)) errors.push(`${hand} attack ${i + 1} (bar ${a.bar}): "${t}" for ${a.notes.length} pitches`);
    });
  }
  return errors;
}

function keysOf(attacks) {
  const keys = new Map();
  for (const a of attacks) for (const n of a.notes) {
    const id = `${a.hand}:${n.midi}`;
    if (!keys.has(id)) keys.set(id, { midi: n.midi, hand: a.hand, fingers: [] });
    if (n.finger && !keys.get(id).fingers.includes(n.finger)) keys.get(id).fingers.push(n.finger);
  }
  return [...keys.values()].sort((a, b) => a.midi - b.midi || (a.hand === "L" ? -1 : 1));
}

const clashes = (attacks, attack) => attack.notes.some((n) => n.finger && attacks.some((b) => b.hand === attack.hand && b.notes.some((m) => m.midi === n.midi && m.finger && m.finger !== n.finger)));
const signature = (keys) => keys.map((k) => `${k.hand}${k.midi}:${k.fingers.join("")}`).join(" ");

// Melodies and scales are one map. Harmony is one map per bar, split where the
// chord symbol changes or a key changes finger, with repeated bars merged.
export function handShapes(score, { hands = "both", from = 1, to = Infinity, exerciseId } = {}) {
  const passage = attacksOf(score, CHORD_FINGERS[exerciseId]).filter((a) => a.bar >= from && a.bar <= to);
  const attacks = passage.filter((a) => hands === "both" || a.hand === hands);
  if (!attacks.length) return { low: null, high: null, steps: [] };
  const midis = attacks.flatMap((a) => a.notes.map((n) => n.midi));
  const range = { low: Math.min(...midis), high: Math.max(...midis) };
  if (!passage.some((a) => a.notes.length > 1 || a.chord)) return { ...range, steps: [{ beat: attacks[0].beat, label: null, keys: keysOf(attacks) }] };
  const groups = [];
  for (const a of attacks) {
    const cur = groups.at(-1);
    const fresh = !cur || a.bar !== cur.bar || (a.chord && cur.chord && a.chord !== cur.chord) || clashes(cur.attacks, a);
    if (fresh) groups.push({ beat: a.beat, bar: a.bar, chord: a.chord, split: !!cur && a.bar === cur.bar, attacks: [a] });
    else { cur.attacks.push(a); cur.chord ||= a.chord; }
  }
  const barStart = new Map(score.bars.map((b) => [b.n, b.beat]));
  const steps = [];
  for (const g of groups) {
    const keys = keysOf(g.attacks), prev = steps.at(-1);
    if (prev && signature(prev.keys) === signature(keys) && prev.chord === g.chord) continue;
    const label = g.chord || (g.split ? `Bar ${g.bar}, beat ${Math.round(g.beat - (barStart.get(g.bar) ?? g.beat)) + 1}` : `Bar ${g.bar}`);
    steps.push({ beat: g.beat, chord: g.chord, label, keys });
  }
  return { ...range, steps };
}

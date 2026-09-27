// Accompaniment patterns, pure. A figure is a list of [slot, eighths] for one chord's
// span (e = 8 for a 4/4 bar, 4 for half of one, 6 for a 3/4 bar). Slots: "chord" (the
// right-hand voicing), 0/1/2 (one of its notes), "root"/"fifth"/"octave"/"sixth" (left
// hand), "lhchord" (a close left-hand triad), "rest".
const cycle = (seq, e) => Array.from({ length: e }, (_, i) => [seq[i % seq.length], 1]);

export const PATTERNS = {
  block: { name: "Block chords", metres: [3, 4], rootPosition: true, rh: (e) => [["chord", e]], lh: (e) => [["root", e]] },
  voiceled: { name: "Voice-led chords", metres: [3, 4], rh: (e) => [["chord", e]], lh: (e) => [["root", e]] },
  ballad: { name: "Pop ballad", metres: [4], rh: (e) => [["chord", e]], lh: (e) => cycle(["root", "fifth", "octave", "fifth"], e) },
  pulse: { name: "Pulse", metres: [4], rh: (e) => (e === 8 ? [["chord", 2], ["rest", 1], ["chord", 3], ["chord", 2]] : [["chord", 2], ["rest", 1], ["chord", 1]]), lh: (e) => [["root", e]] },
  arpeggio: { name: "Arpeggio", metres: [3, 4], rh: (e) => cycle([0, 1, 2, 1], e), lh: (e) => [["root", e]] },
  boogie: { name: "Boogie", metres: [4], rh: (e) => [["chord", e]], lh: (e) => cycle(["root", "fifth", "sixth", "fifth"], e) },
  waltz: { name: "Waltz", metres: [3], rh: () => [["rest", 2], ["chord", 2], ["chord", 2]], lh: (e) => [["root", e]], leadLh: () => [["root", 2], ["lhchord", 2], ["lhchord", 2]] },
};

// Every close-position voicing of `tones` (spelled, with pc) whose notes lie in lo..hi.
// r is the rotation: 0 = the first tone at the bottom.
export function closeVoicings(tones, lo, hi) {
  const out = [];
  tones.forEach((_, r) => {
    const order = [...tones.slice(r), ...tones.slice(0, r)];
    for (let m = lo; m <= hi; m++) {
      if (m % 12 !== order[0].pc) continue;
      const midis = [m];
      for (const t of order.slice(1)) { let x = midis[midis.length - 1] + 1; while (x % 12 !== t.pc) x++; midis.push(x); }
      if (midis[midis.length - 1] <= hi) out.push({ r, notes: order.map((t, i) => ({ ...t, midi: midis[i] })) });
    }
  });
  return out;
}

const low = (v) => v.notes[0].midi;
const moved = (a, b) => a.notes.reduce((s, n, i) => s + Math.abs(n.midi - b.notes[i].midi), 0);

// The voicing that moves least from `prev` (ties to the lower); with no prev, or in root
// position, the one whose lowest note is nearest `anchor`.
export function pickVoicing(cands, prev, { rootPosition = false, anchor = 60 } = {}) {
  const pool = rootPosition ? cands.filter((c) => c.r === 0) : cands;
  const cost = (c) => (prev && !rootPosition ? moved(c, prev) : Math.abs(low(c) - anchor));
  return pool.reduce((best, c) => (cost(c) < cost(best) || (cost(c) === cost(best) && low(c) < low(best)) ? c : best));
}

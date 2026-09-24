// Names the chord you're holding. Exact pitch-class match against templates;
// ties go to the reading whose root is the lowest note, else template order.
export const ROOTS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const TEMPLATES = [
  ["", [0, 4, 7]], ["m", [0, 3, 7]], ["dim", [0, 3, 6]], ["aug", [0, 4, 8]], ["sus2", [0, 2, 7]], ["sus4", [0, 5, 7]],
  ["6", [0, 4, 7, 9]], ["m6", [0, 3, 7, 9]], ["7", [0, 4, 7, 10]], ["maj7", [0, 4, 7, 11]], ["m7", [0, 3, 7, 10]],
  ["m7b5", [0, 3, 6, 10]], ["dim7", [0, 3, 6, 9]], ["m(maj7)", [0, 3, 7, 11]],
  ["maj7 shell", [0, 4, 11]], ["7 shell", [0, 4, 10]], ["m7 shell", [0, 3, 10]],
];

export function nameChord(midis) {
  const pcs = [...new Set(midis.map((m) => ((m % 12) + 12) % 12))];
  if (pcs.length < 3) return null;
  const bass = ((Math.min(...midis) % 12) + 12) % 12;
  let best = null;
  for (const [ti, [suffix, ivs]] of TEMPLATES.entries()) {
    for (const root of pcs) {
      const set = pcs.map((p) => (p - root + 12) % 12).sort((a, b) => a - b);
      if (set.length !== ivs.length || set.some((v, i) => v !== ivs[i])) continue;
      const rank = (root === bass ? 0 : 1000) + ti;
      if (!best || rank < best.rank) best = { rank, root, suffix };
    }
  }
  if (!best) return null;
  const name = `${ROOTS[best.root]}${best.suffix}`;
  return best.root === bass ? name : `${name}/${ROOTS[bass]}`;
}

// Names the chord you're holding. Exact pitch-class match against templates;
// ties go to the reading whose root is the lowest note, else template order.
export const ROOTS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
// [suffix, intervals, letter degrees above the root, parallel to the intervals]
const TRI = [0, 2, 4], SIX = [0, 2, 4, 5], SEV = [0, 2, 4, 6], SHELL = [0, 2, 6];
const TEMPLATES = [
  ["", [0, 4, 7], TRI], ["m", [0, 3, 7], TRI], ["dim", [0, 3, 6], TRI], ["aug", [0, 4, 8], TRI], ["sus2", [0, 2, 7], [0, 1, 4]], ["sus4", [0, 5, 7], [0, 3, 4]],
  ["6", [0, 4, 7, 9], SIX], ["m6", [0, 3, 7, 9], SIX], ["7", [0, 4, 7, 10], SEV], ["maj7", [0, 4, 7, 11], SEV], ["m7", [0, 3, 7, 10], SEV],
  ["m7b5", [0, 3, 6, 10], SEV], ["dim7", [0, 3, 6, 9], SEV], ["m(maj7)", [0, 3, 7, 11], SEV],
  ["maj7 shell", [0, 4, 11], SHELL], ["7 shell", [0, 4, 10], SHELL], ["m7 shell", [0, 3, 10], SHELL],
];
const LETTERS = "CDEFGAB", NATURAL = [0, 2, 4, 5, 7, 9, 11];
const ACCIDENTAL = { 0: "", 1: "#", 11: "b", 2: "##", 10: "bb" };
const pc = (m) => ((m % 12) + 12) % 12;

function match(midis) {
  const pcs = [...new Set(midis.map(pc))];
  if (pcs.length < 3) return null;
  const bass = pc(Math.min(...midis));
  let best = null;
  for (const [ti, [suffix, ivs, degrees]] of TEMPLATES.entries()) {
    for (const root of pcs) {
      const set = pcs.map((p) => (p - root + 12) % 12).sort((a, b) => a - b);
      if (set.length !== ivs.length || set.some((v, i) => v !== ivs[i])) continue;
      const rank = (root === bass ? 0 : 1000) + ti;
      if (!best || rank < best.rank) best = { rank, root, suffix, ivs, degrees, bass };
    }
  }
  return best;
}

export function nameChord(midis) {
  const best = match(midis);
  if (!best) return null;
  const name = `${ROOTS[best.root]}${best.suffix}`;
  return best.root === best.bass ? name : `${name}/${ROOTS[best.bass]}`;
}

// The held notes, low to high, spelled as tones of that chord (E major: E G# B).
export function spellChord(midis) {
  const c = match(midis);
  if (!c) return null;
  const rootLetter = LETTERS.indexOf(ROOTS[c.root][0]);
  return [...midis].sort((a, b) => a - b).map((m) => {
    const letter = (rootLetter + c.degrees[c.ivs.indexOf((pc(m) - c.root + 12) % 12)]) % 7;
    return LETTERS[letter] + ACCIDENTAL[(pc(m) - NATURAL[letter] + 12) % 12];
  });
}

// Chord symbols, pure: "Am7", "F#m", "C/E" -> spelled chord tones (root first) and a bass.
const LETTERS = "CDEFGAB";
const NAT = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
// [semitones, letter steps] above the root
const SHAPES = {
  "": [[0, 0], [4, 2], [7, 4]], m: [[0, 0], [3, 2], [7, 4]], dim: [[0, 0], [3, 2], [6, 4]],
  sus2: [[0, 0], [2, 1], [7, 4]], sus4: [[0, 0], [5, 3], [7, 4]],
  7: [[0, 0], [4, 2], [7, 4], [10, 6]], maj7: [[0, 0], [4, 2], [7, 4], [11, 6]], m7: [[0, 0], [3, 2], [7, 4], [10, 6]],
};
const RE = /^([A-G])([#b]?)(maj7|m7|sus2|sus4|dim|m|7)?(?:\/([A-G])([#b]?))?$/;
const accOf = (s) => (s === "#" ? 1 : s === "b" ? -1 : 0);
const pcOf = (letter, acc) => (((NAT[letter] + acc) % 12) + 12) % 12;
const note = (letter, acc) => ({ letter, acc, pc: pcOf(letter, acc) });

// The note `steps` letters and `semis` semitones above a spelled note (B♭ above F, never A♯).
export function above(root, semis, steps) {
  const letter = LETTERS[(LETTERS.indexOf(root.letter) + steps) % 7];
  const pc = (root.pc + semis) % 12;
  let acc = pc - NAT[letter];
  if (acc > 6) acc -= 12;
  if (acc < -6) acc += 12;
  return { letter, acc, pc };
}

export function parseChord(token) {
  const m = RE.exec(token);
  if (!m) return null;
  const root = note(m[1], accOf(m[2])), quality = m[3] || "";
  return {
    name: token, quality, root,
    tones: SHAPES[quality].map(([semis, steps]) => above(root, semis, steps)),
    bass: m[4] ? note(m[4], accOf(m[5])) : null,
  };
}

// "C | G | Am F | G7" -> bars of { chord, beats }; one chord a bar, or two (half a bar each) in 4/4.
export function parseChordLine(line, beatsPerBar) {
  const cells = line.split("|").map((c) => c.trim());
  while (cells.length && !cells[cells.length - 1]) cells.pop();
  while (cells.length && !cells[0]) cells.shift();
  if (!cells.length) return { error: { bar: 1, message: "Type some chords, with bars split by |" } };
  const most = beatsPerBar === 4 ? 2 : 1, bars = [];
  for (let i = 0; i < cells.length; i++) {
    const n = i + 1, tokens = cells[i].split(/\s+/).filter(Boolean);
    if (!tokens.length) return { error: { bar: n, message: `bar ${n} is empty` } };
    if (tokens.length > most) return { error: { bar: n, message: `bar ${n}: ${most === 1 ? "one chord a bar" : "up to two chords a bar"} in ${beatsPerBar}/4` } };
    const bar = [];
    for (const t of tokens) {
      const chord = parseChord(t);
      if (!chord) return { error: { bar: n, token: t, message: `bar ${n}: '${t}' isn't a chord I know` } };
      bar.push({ chord, beats: beatsPerBar / tokens.length });
    }
    bars.push(bar);
  }
  return { bars };
}

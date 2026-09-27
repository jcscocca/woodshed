import { parseChordLine } from "./chords.js";
import { chartToAbc } from "./chartToAbc.js";

// Your song: a chord chart the owner types, written out with the chosen pattern.
export const SONG_KEYS = ["C", "G", "D", "A", "E", "F", "Bb", "Eb", "Ab", "Am", "Em", "Bm", "F#m", "C#m", "Dm", "Gm", "Cm", "Fm"];
export const newSong = (id) => ({ id, title: "New song", key: "C", meter: "4/4", chords: "C | G | Am | F", pattern: "block", bpm: 70 });
const beatsOf = (s) => Number(s.meter.split("/")[0]);
export const songError = (s) => parseChordLine(s.chords, beatsOf(s)).error || null;
// one section per 4-bar line ("all" is the panel's own)
export const lineSections = (n) => Array.from({ length: Math.ceil(n / 4) }, (_, i) => {
  const from = i * 4 + 1, to = Math.min(n, from + 3);
  return { name: from === to ? `${from}` : `${from}–${to}`, from, to };
});
export function songScore(s) {
  const r = parseChordLine(s.chords, beatsOf(s));
  if (r.error) return null;
  const abc = chartToAbc({ key: s.key, meter: s.meter, chords: s.chords, pattern: s.pattern, title: s.title });
  return { abc, bpm: s.bpm, target: Math.max(s.bpm, 120), sections: lineSections(r.bars.length) };
}

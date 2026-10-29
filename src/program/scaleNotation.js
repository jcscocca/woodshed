// Shared notation helpers for the continuing technical path. These generate
// written pitches, not MIDI-only transpositions: Gb major must retain Cb.
const LETTERS = "CDEFGAB";
const NATURAL = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const noteName = (note) => `${note.letter}${note.accidental > 0 ? "#".repeat(note.accidental) : "b".repeat(-note.accidental)}${note.octave}`;
export const midiForNote = (note) => 12 * (note.octave + 1) + NATURAL[note.letter] + note.accidental;
export const displayKey = (key) => key.replaceAll("b", "♭").replaceAll("#", "♯");
export const fromName = (name, octave) => {
  const [, letter, marks = ""] = /^([A-G])([#b]*)$/.exec(name) || [];
  if (!letter) throw new TypeError(`Unknown note ${name}`);
  return { letter, accidental: [...marks].reduce((sum, mark) => sum + (mark === "#" ? 1 : -1), 0), octave };
};

export function diatonicLine(tonic, octave, offsets) {
  const root = fromName(tonic, octave), start = LETTERS.indexOf(root.letter), midi = midiForNote(root);
  return offsets.map((semitones, index) => {
    const letter = LETTERS[(start + index) % 7], noteOctave = octave + Math.floor((start + index) / 7);
    return { letter, octave: noteOctave, accidental: midi + semitones - (12 * (noteOctave + 1) + NATURAL[letter]) };
  });
}

export function keyAccidentals(tonic, intervals = [0, 2, 4, 5, 7, 9, 11, 12]) {
  return Object.fromEntries(diatonicLine(tonic, 4, intervals).slice(0, 7).map((note) => [note.letter, note.accidental]));
}

function abcPitch(note, signature, explicit) {
  const accidental = explicit || (signature[note.letter] || 0) !== note.accidental
    ? note.accidental > 0 ? "^".repeat(note.accidental) : note.accidental < 0 ? "_".repeat(-note.accidental) : "=" : "";
  const letter = note.octave >= 5 ? note.letter.toLowerCase() : note.letter;
  const octave = note.octave >= 5 ? "'".repeat(note.octave - 5) : ",".repeat(Math.max(0, 4 - note.octave));
  return `${accidental}${letter}${octave}`;
}

// Each attack is a quarter note. A held final tonic completes the last bar;
// an inactive hand rests through exactly the same bars. Explicit accidental
// mode is used for chromatic patterns so a previous accidental cannot leak.
export function scoreForLines(title, key, right, left, { signature = {}, explicit = false, fingers = {} } = {}) {
  const attacks = Math.max(right?.length || 0, left?.length || 0);
  if (!attacks || (right?.length && right.length !== attacks) || (left?.length && left.length !== attacks)) throw new RangeError(`Unmatched scale hands: ${title}`);
  const finalLength = 4 - ((attacks - 1) % 4), bars = Math.ceil(attacks / 4);
  const voice = (notes, hand) => {
    if (!notes?.length) return Array(bars).fill("z4");
    const tokens = notes.map((note, index) => `${fingers[hand]?.[index] ? `!${fingers[hand][index]}!` : ""}${abcPitch(note, signature, explicit)}${index === attacks - 1 && finalLength > 1 ? finalLength : ""}`);
    return Array.from({ length: bars }, (_, index) => tokens.slice(index * 4, index * 4 + 4).join(" "));
  };
  const r = voice(right, "R"), l = voice(left, "L"), body = [];
  for (let index = 0; index < bars; index += 4) {
    const end = index + 4 >= bars ? " |]" : " |";
    body.push(`[V:1] ${r.slice(index, index + 4).join(" | ")}${end}`);
    body.push(`[V:2] ${l.slice(index, index + 4).join(" | ")}${end}`);
  }
  return `X:1\nT:${title}\nM:4/4\nL:1/4\nK:${key}\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n${body.join("\n")}`;
}

export const reverse = (line) => [...line].reverse();
export const returnLine = (up) => [...up, ...up.slice(0, -1).reverse()];
export const fingersForReturn = ({ up, down }) => [...up, ...down.slice(1)];
export const fingerText = (numbers) => numbers.join("–");

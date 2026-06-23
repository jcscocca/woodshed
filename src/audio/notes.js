// Pure pitch helpers: turn a lesson "shape" into frequencies so the audio demo
// needs no separately authored sound. No Web Audio here — just math.

const NOTE_INDEX = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };

// Open-string MIDI numbers, low string -> high string.
export const TUNING = {
  guitar: [40, 45, 50, 55, 59, 64], // E2 A2 D3 G3 B3 E4
  bass: [28, 33, 38, 43],           // E1 A1 D2 G2
};

export const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

// MIDI numbering: C-1 = 0, so C4 (middle C) = 60.
export const noteToMidi = ({ name, octave }) => {
  const idx = NOTE_INDEX[name];
  if (idx == null) throw new Error(`Unknown note name: ${name}`);
  return 12 * (octave + 1) + idx;
};

// strings: low->high array of fret number, 0 (open) or "x" (muted) -> ascending MIDI.
export const stringsToMidi = (strings, instrument) => {
  const tuning = TUNING[instrument];
  if (!tuning) throw new Error(`Unknown fretted instrument: ${instrument}`);
  if (strings.length !== tuning.length) throw new Error(`${instrument} needs ${tuning.length} strings, got ${strings.length}`);
  return strings.map((fret, i) => (fret === "x" ? null : tuning[i] + fret)).filter((m) => m != null);
};

// shape -> "voices": each voice is an array of frequencies sounded together.
// A strummed chord is one voice of many freqs; a scale is many voices of one.
export const shapeToVoices = (shape) => {
  if (!shape) return [];
  if (shape.kind === "chords") return shape.chords.map((c) => stringsToMidi(c.strings, shape.instrument).map(midiToFreq));
  if (shape.kind === "fretboard") return shape.dots.map((d) => [midiToFreq(TUNING[shape.instrument][d.string] + d.fret)]);
  if (shape.kind === "keyboard") return shape.notes.map((n) => [midiToFreq(noteToMidi(n))]);
  throw new Error(`Unknown shape kind: ${shape.kind}`);
};

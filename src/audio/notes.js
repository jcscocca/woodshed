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

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const STRING_NAMES = { guitar: ["E", "A", "D", "G", "B", "E"], bass: ["E", "A", "D", "G"] };
export const midiToNote = (m) => ({ midi: m, name: NAMES[((m % 12) + 12) % 12], octave: Math.floor(m / 12) - 1 });

// shape -> ordered coaching targets. A "line" is one single-note target per note
// (scales, melodies). An "arpeggio" walks a chord's strings low->high, keeping
// muted strings as silent checkpoints. Chords, and keyboard shapes explicitly
// flagged play:"block", are arpeggios; everything else is a line.
export const shapeToTargets = (shape) => {
  if (!shape) return { mode: "line", targets: [] };
  if (shape.kind === "chords") {
    const tuning = TUNING[shape.instrument];
    const targets = [];
    for (const c of shape.chords) {
      c.strings.forEach((fret, i) => {
        const stringName = STRING_NAMES[shape.instrument][i];
        if (fret === "x") targets.push({ muted: true, string: i, stringName, openMidi: tuning[i], chordName: c.name, label: "×" });
        else { const n = midiToNote(tuning[i] + fret); targets.push({ ...n, string: i, stringName, fret, chordName: c.name, label: n.name }); }
      });
    }
    return { mode: "arpeggio", instrument: shape.instrument, targets };
  }
  if (shape.kind === "fretboard") {
    const tuning = TUNING[shape.instrument];
    return { mode: "line", instrument: shape.instrument, targets: shape.dots.map((d) => { const n = midiToNote(tuning[d.string] + d.fret); return { ...n, string: d.string, fret: d.fret, label: n.name }; }) };
  }
  if (shape.kind === "keyboard") {
    const targets = shape.notes.map((nn) => { const n = midiToNote(noteToMidi(nn)); return { ...n, label: n.name }; });
    return { mode: shape.play === "block" ? "arpeggio" : "line", targets };
  }
  throw new Error(`Unknown shape kind: ${shape.kind}`);
};

// Can a coach grade this exercise? Needs a shape and a single-note-capable
// instrument. Accordion is out (reeds detect poorly); chords are in via arpeggio.
export const isCoachable = (item, lesson) => !!(lesson && lesson.shape && item && item.inst !== "accordion");

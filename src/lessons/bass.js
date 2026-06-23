// Bass lessons. fretboard strings low->high [E A D G]; string index 0..3.
const cMajorOneOctave = { kind: "fretboard", instrument: "bass", baseFret: 2, dots: [
  { string: 1, fret: 3 }, { string: 1, fret: 5 }, { string: 2, fret: 2 }, { string: 2, fret: 3 },
  { string: 2, fret: 5 }, { string: 3, fret: 2 }, { string: 3, fret: 4 }, { string: 3, fret: 5 },
] };

export default {
  "bs-pluck": {
    summary: "Alternating index and middle on one note — the foundation of a clean plucking hand.",
    shape: null, prescribe: "One note · alternate index–middle · even volume, relaxed hand", bpm: 80,
    steps: [
      "Rest the thumb on a pickup or the E string. Pluck one note: index, middle, index, middle.",
      "Make every pluck the same volume — close your eyes and listen for unevenness.",
      "Keep the hand loose; the fingers do the work, not the arm.",
    ],
    watch: ["If one finger is louder, slow down until both match."],
  },
  "bs-roots": {
    summary: "Play the root of each chord in a progression, locked dead-on to the metronome.",
    shape: null, prescribe: "Simple progression · play each chord's root · one note per beat, on the click", bpm: 70,
    steps: [
      "Pick a few chords. On each, play only the root note.",
      "Land every root exactly on the beat with the click.",
      "Hold the note its full length — no early lifts.",
    ],
    watch: ["Right on the click is the job here. Resist adding extra notes."],
  },
  "bs-major": {
    summary: "A one-octave C major scale on the neck — up and down, one note per click.",
    shape: cMajorOneOctave, bpm: 70,
    steps: [
      "Start on C (A string, 3rd fret). Play the scale up to the next C and back.",
      "One finger per fret; one note per click.",
      "Fret cleanly with minimal buzz — press just behind the fret.",
    ],
    watch: ["Keep fingers close to the board so the next note is always ready."],
  },
  "bs-pent": {
    summary: "The A minor pentatonic box at the 5th fret — your go-to shape for bass fills.",
    shape: { kind: "fretboard", instrument: "bass", baseFret: 5, dots: [
      { string: 0, fret: 5 }, { string: 0, fret: 8 }, { string: 1, fret: 5 }, { string: 1, fret: 7 },
      { string: 2, fret: 5 }, { string: 2, fret: 7 }, { string: 3, fret: 5 }, { string: 3, fret: 7 },
    ] },
    bpm: 70,
    steps: [
      "Index at the 5th fret, pinky reaching the 7th–8th. Run the box up and down.",
      "Alternate index–middle on the plucking hand throughout.",
      "Keep it even; buzz-free beats fast.",
    ],
    watch: ["Don't collapse the pinky — keep it arched for the 7th/8th-fret notes."],
  },
  "bs-oct": {
    summary: "The octave shape — root and its octave, the backbone of disco and pop grooves (A shown).",
    shape: { kind: "fretboard", instrument: "bass", baseFret: 5, dots: [
      { string: 0, fret: 5 }, { string: 2, fret: 7 },
    ] },
    bpm: 90,
    steps: [
      "Root on the E string (A, 5th fret); the octave sits two strings over and two frets up (D string, 7th).",
      "Bounce root-octave-root-octave in a steady eighth-note feel.",
      "Move the same shape to follow the chords of a progression.",
    ],
    watch: ["Mute the string between root and octave with a finger so it stays clean."],
  },
  "bs-lock": {
    summary: "Lock quarter notes to the click, then explore sitting a hair behind the beat — the pocket.",
    shape: null, prescribe: "70 BPM · root of A · one note per click · 2 min on the beat, then 2 min just behind it", bpm: 70,
    steps: [
      "Quarter notes, dead-on with the metronome — your note should hide the click.",
      "After two minutes, lay back a hair so you sit just *behind* the beat.",
      "Feel the difference: on-top is urgent, behind is laid-back. Both are tools.",
    ],
    watch: ["'Behind' means a few milliseconds, not lazy. Stay locked, just relaxed."],
  },
  "bs-walk": {
    summary: "Walk a line over a I–IV–V using roots, fifths and passing tones, one note per beat.",
    shape: null, prescribe: "I–IV–V · roots, fifths, passing tones · one note per beat, smooth voice leading", bpm: 90,
    steps: [
      "Start each bar on the chord's root. Aim to land on the next chord's root on beat 1.",
      "Fill the beats between with the fifth and chromatic passing tones.",
      "Keep it smooth — small steps between notes beat big jumps.",
    ],
    watch: ["The target is always the next root. Walk toward it."],
  },
  "bs-line": {
    summary: "Learn a bassline you love — phrase by phrase, rhythm before notes.",
    shape: null, prescribe: "A groove you love · learn it phrase by phrase · nail the rhythm first", bpm: null,
    steps: [
      "Pick a groove. Learn just the first phrase, slowly.",
      "Get the *rhythm* locked before worrying about exact notes.",
      "Add phrases one at a time, playing along with the record.",
    ],
    watch: ["A right-note, wrong-rhythm bassline doesn't groove. Rhythm first."],
  },

  "trk-bs-1": {
    summary: "Alternate index and middle on a single note — even volume, loose hand.",
    shape: null, prescribe: "Single note · strict index–middle alternation · even and relaxed", bpm: 80,
    steps: [
      "Pluck one note alternating index, middle, index, middle.",
      "Match the volume of both fingers exactly.",
      "Stay relaxed — speed comes later, evenness comes now.",
    ],
    watch: ["No raking the same finger twice; strict alternation builds the engine."],
  },
  "trk-bs-2": {
    summary: "Lock chord roots to the click, then try sitting slightly behind the beat.",
    shape: null, prescribe: "Simple progression · roots on the click · then drift just behind", bpm: 70,
    steps: [
      "Play each chord's root dead-on with the metronome.",
      "Once locked, try landing a hair behind the beat.",
      "Notice how 'behind' feels heavier and more relaxed.",
    ],
    watch: ["Don't rush back on top by accident — stay aware of where you sit."],
  },
  "trk-bs-3": {
    summary: "A one-octave major scale shape while naming each note — building a fretboard map.",
    shape: cMajorOneOctave, bpm: 70,
    steps: [
      "Play the C major scale shape and say each note name out loud as you go.",
      "Up and back, one note per click.",
      "You're learning the map, not just the shape — the names are the point.",
    ],
    watch: ["If you can't name the note, you don't know it yet. Say it every time."],
  },
  "trk-bs-4": {
    summary: "Outline each chord with root, fifth and octave in a steady eighth-note feel (A shown).",
    shape: { kind: "fretboard", instrument: "bass", baseFret: 5, dots: [
      { string: 0, fret: 5 }, { string: 1, fret: 7 }, { string: 2, fret: 7 },
    ] },
    bpm: 80,
    steps: [
      "Root (A, E string 5th), fifth (E, A string 7th), octave (A, D string 7th).",
      "Play root-fifth-octave across each chord in a steady eighth-note groove.",
      "Move the shape to follow the progression.",
    ],
    watch: ["Keep the three-note shape compact; it transposes anywhere on the neck."],
  },
  "trk-bs-5": {
    summary: "Walking bass: roots, fifths and passing tones over a I–IV–V, one note per beat.",
    shape: null, prescribe: "I–IV–V · roots, fifths, passing tones · land on the next root", bpm: 90,
    steps: [
      "Begin each bar on the root, aim to arrive at the next chord's root on beat 1.",
      "Fill with fifths and chromatic approach notes.",
      "Smooth voice leading — step, don't leap, where you can.",
    ],
    watch: ["The walk should feel inevitable, like it's pulling to the next chord."],
  },
};

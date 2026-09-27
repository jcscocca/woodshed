// Piano lessons. keyboard notes are {name, octave}; middle C = octave 4.
const cMajorScale = { kind: "keyboard",
  notes: [{ name: "C", octave: 4 }, { name: "D", octave: 4 }, { name: "E", octave: 4 }, { name: "F", octave: 4 }, { name: "G", octave: 4 }, { name: "A", octave: 4 }, { name: "B", octave: 4 }, { name: "C", octave: 5 }],
  fingers: [1, 2, 3, 1, 2, 3, 4, 5] };
const cMajorTwoOctaves = { kind: "keyboard",
  notes: [{ name: "C", octave: 4 }, { name: "D", octave: 4 }, { name: "E", octave: 4 }, { name: "F", octave: 4 }, { name: "G", octave: 4 }, { name: "A", octave: 4 }, { name: "B", octave: 4 },
    { name: "C", octave: 5 }, { name: "D", octave: 5 }, { name: "E", octave: 5 }, { name: "F", octave: 5 }, { name: "G", octave: 5 }, { name: "A", octave: 5 }, { name: "B", octave: 5 }, { name: "C", octave: 6 }],
  fingers: [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5] };
const fiveFinger = { kind: "keyboard",
  notes: [{ name: "C", octave: 4 }, { name: "D", octave: 4 }, { name: "E", octave: 4 }, { name: "F", octave: 4 }, { name: "G", octave: 4 },
    { name: "F", octave: 4 }, { name: "E", octave: 4 }, { name: "D", octave: 4 }, { name: "C", octave: 4 }],
  fingers: [1, 2, 3, 4, 5, 4, 3, 2, 1] };

// ABC source is line-sensitive, so these live at column 0.
const MINUET_ABC = `X:1
T:Minuet in G
C:Christian Petzold (arr. simplified)
M:3/4
L:1/8
K:G
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 |
[V:2] G,,6 | B,,6 | C,6 | B,,6 |
[V:1] c2 dcBA | B2 cBAG | F2 GABG | A6 |
[V:2] A,,6 | G,,6 | D,6 | D,6 |
[V:1] d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 |
[V:2] G,,6 | B,,6 | C,6 | B,,6 |
[V:1] c2 dcBA | B2 cBAG | A2 BAGF | G6 |
[V:2] A,,6 | G,,6 | D,6 | G,,6 |`;

const SCALE_SNIPPET = `X:1
M:4/4
L:1/8
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] CDEF GABc | cBAG FEDC |
[V:2] C,D,E,F, G,A,B,C | CB,A,G, F,E,D,C, |`;

export default {
  "pno-scales": {
    summary: "Major scales hands together, two octaves — the C major scale and its thumb-under move shown here.",
    shape: { ...cMajorTwoOctaves, hands: "together" }, bpm: 80,
    steps: [
      "Right hand, two octaves up: 1-2-3, tuck the thumb under to F, 2-3-4, thumb under to C, 2-3, thumb under to F, then 2-3-4-5 to the top C.",
      "Hands together, two octaves, one note per click. Once C is smooth, G, D, A and E use the same fingering.",
      "Listen for even tone — no note louder than its neighbors.",
    ],
    watch: ["Keep the wrist level and relaxed; the thumb-under should be silent and smooth."],
    snippet: SCALE_SNIPPET,
  },
  "pno-sight": {
    summary: "Short drills written fresh each time, at your level: read them once, with the click, and play.",
    steps: [
      "Look over the drill before the count-in: the key, the time signature, where the hands move.",
      "Keep going through mistakes — the click doesn't wait, and neither does real reading.",
      "Three clean drills in a row and the app offers the next level.",
    ],
    watch: ["Reading ahead matters more than every note: eyes on the next beat, not the one you're playing."],
    sightread: { defaultLevel: 1 },
  },
  "pno-hanon": {
    summary: "Hanon No. 1 — a finger-independence pattern that climbs the scale, slow and dead even.",
    shape: { kind: "keyboard",
      notes: [{ name: "C", octave: 4 }, { name: "E", octave: 4 }, { name: "F", octave: 4 }, { name: "G", octave: 4 }, { name: "A", octave: 4 }, { name: "G", octave: 4 }, { name: "F", octave: 4 }, { name: "E", octave: 4 }],
      fingers: [1, 2, 3, 4, 5, 4, 3, 2] },
    bpm: 80,
    steps: [
      "Play C-E-F-G-A-G-F-E with fingers 1-2-3-4-5-4-3-2, one note per click, then start one note higher (D-F-G-A-B-A-G-F) and climb the octave.",
      "The goal is identical tone and timing from every finger — especially the weak 4 and 5.",
      "Keep the hand quiet but never locked — a frozen hand is where tension starts.",
    ],
    watch: ["Relaxed wrist. If your forearm tenses, slow down."],
  },
  "pno-piece": {
    summary: "Work the hardest section of your current piece — hands separate first, slower than feels necessary.",
    shape: null, prescribe: "Hardest section only · hands separate, then together · slower than comfortable", bpm: null,
    steps: [
      "Find the bar that trips you up and loop just that, each hand on its own.",
      "Join the hands at half speed, then nudge the tempo up only when it's clean.",
      "End by playing the section in context, from a bar before to a bar after.",
    ],
    watch: ["Practicing the whole piece top-to-bottom hides the hard bar. Isolate it."],
  },
  "pno-minuet": {
    summary: "Bars 1–16 of the Minuet in G major (Christian Petzold, from the Anna Magdalena Bach notebook), with a simplified left hand. Two sections: A (bars 1–8) and B (9–16).",
    steps: [
      "Pick section A. Wait mode, right hand only: find each note before you worry about time.",
      "Then the left hand alone, then both hands in wait mode.",
      "Switch to play-along with the click at 72. Each clean pass nudges the tempo up toward 100.",
    ],
    watch: ["The F in bars 3 and 7 is F sharp — the key signature says so once, at the start."],
    score: {
      bpm: 72, target: 100,
      sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }],
      abc: MINUET_ABC,
    },
  },
  "pno-voicings": {
    summary: "Comp (accompany) a lead sheet with shell voicings instead of plain block triads.",
    shape: null, prescribe: "Lead sheet · shell voicings (root–3rd–7th) · comp the changes in time", bpm: null,
    steps: [
      "Take a tune's chord symbols. For each, play just the root, 3rd and 7th — the shell.",
      "ii–V–I in C: Dm7 D–F–C, G7 G–F–B, Cmaj7 C–E–B — thirds and sevenths hold or move a half step.",
      "Keep the voicings close; let the top notes move smoothly chord to chord.",
      "Comp in rhythm against a metronome or backing track.",
    ],
    watch: ["You don't need every chord tone — the 3rd and 7th carry the sound."],
  },
  "pno-improv": {
    summary: "Improvise a right-hand melody over a looped progression, leaving space.",
    shape: null, prescribe: "Loop a ii–V–I or I–V–vi–IV · improvise RH melody · leave space", bpm: 90,
    steps: [
      "Loop the progression with your left hand or a backing track.",
      "Improvise with just the notes of the key, starting with only two or three.",
      "Leave gaps — silence makes the phrases sound intentional.",
    ],
    watch: ["More notes is not better. Aim for singable lines."],
  },
  "pno-ear": {
    summary: "Figure out a short melody entirely by ear — no sheet music.",
    shape: null, prescribe: "Short melody · find it by ear · no notation", bpm: null,
    steps: [
      "Pick a simple tune you can sing. Find its first note on the keyboard.",
      "Move note by note, matching what you hear — up or down, big jump or small.",
      "Play it back start to finish without hunting.",
    ],
    watch: ["Sing the next note before you search for it; your ear leads, the hand follows."],
  },

  "trk-pno-1": {
    summary: "Five-finger patterns in C position, each hand on its own.",
    shape: fiveFinger, bpm: 80,
    steps: [
      "Right hand: C-D-E-F-G with fingers 1-2-3-4-5 and back, even tone.",
      "Left hand: C-D-E-F-G an octave lower, fingers 5-4-3-2-1 — the numbers run backwards.",
      "Relax the wrist; take your eyes off the keys when you can.",
    ],
    watch: ["No note louder than the others — listen for the weak fingers.", "Forearms level with the keys, elbows just in front of the body, fingers curved, shoulders loose."],
  },
  "trk-pno-2": {
    summary: "Contrary motion: both thumbs on middle C, hands moving outward and back together.",
    shape: null, prescribe: "Both thumbs on middle C · move outward and back · slow and symmetrical", bpm: 70,
    steps: [
      "Put both thumbs on middle C. Step the hands outward one note at a time, mirror-image.",
      "Bring them back to middle C together.",
      "Because the fingering mirrors, your brain only tracks one shape — use that.",
    ],
    watch: ["Keep both hands exactly in sync; if one lags, slow down."],
  },
  "trk-pno-3": {
    summary: "One-octave C major scale hands together, watching the thumb-under.",
    shape: { ...cMajorScale, hands: "together" }, bpm: 80,
    steps: [
      "Right hand up: 1-2-3, thumb under to F (1), then 2-3-4-5.",
      "Left hand up: 5-4-3-2-1, then 3 crosses over the thumb onto A, 2-1 to finish.",
      "Hands together, the right thumb goes under at F while the left 3 crosses at A — slow that bar down.",
      "One note per click, even and unhurried.",
    ],
    watch: ["The thumb-under is where it gets bumpy — practice just that move."],
    snippet: SCALE_SNIPPET,
  },
  "trk-pno-4": {
    summary: "Right-hand melody over left-hand block chords — keep the tune singing above.",
    shape: null, prescribe: "RH simple melody · LH block chords on the changes · melody stays on top", bpm: null,
    steps: [
      "Left hand holds a block chord for each change.",
      "Right hand plays a simple melody over it.",
      "Voice it so the melody is a touch louder than the chords underneath.",
    ],
    watch: ["Don't let the left-hand chords drown the tune — they're support."],
  },
  "trk-pno-5": {
    summary: "Break the left-hand chords into rolling arpeggios under the melody (C–E–G–C shown).",
    shape: { kind: "keyboard", play: "block", notes: [{ name: "C", octave: 3 }, { name: "E", octave: 3 }, { name: "G", octave: 3 }, { name: "C", octave: 4 }], fingers: [5, 3, 2, 1] },
    bpm: 80,
    steps: [
      "Instead of a block chord, roll the notes: C-E-G-C, evenly, like a wave.",
      "Keep the arpeggio quiet and steady so the right-hand melody floats over it.",
      "Aim for a flowing, even accompaniment with no lumps.",
    ],
    watch: ["Even spacing between the rolled notes matters more than speed."],
  },
};

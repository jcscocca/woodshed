// Piano lessons. keyboard notes are {name, octave}; middle C = octave 4.
const cMajorScale = { kind: "keyboard",
  notes: [{ name: "C", octave: 4 }, { name: "D", octave: 4 }, { name: "E", octave: 4 }, { name: "F", octave: 4 }, { name: "G", octave: 4 }, { name: "A", octave: 4 }, { name: "B", octave: 4 }, { name: "C", octave: 5 }],
  fingers: [1, 2, 3, 1, 2, 3, 4, 5] };
const fiveFinger = { kind: "keyboard",
  notes: [{ name: "C", octave: 4 }, { name: "D", octave: 4 }, { name: "E", octave: 4 }, { name: "F", octave: 4 }, { name: "G", octave: 4 }],
  fingers: [1, 2, 3, 4, 5] };

export default {
  "pno-scales": {
    summary: "Major scales hands together, two octaves — the C major scale and its thumb-under move shown here.",
    shape: cMajorScale, bpm: 80,
    steps: [
      "Right hand going up: play 1-2-3, then tuck the thumb under to reach F with finger 1, then 2-3-4-5.",
      "Hands together, two octaves, one note per click. Pick two keys for today.",
      "Listen for even tone — no note louder than its neighbours.",
    ],
    watch: ["Keep the wrist level and relaxed; the thumb-under should be silent and smooth."],
  },
  "pno-sight": {
    summary: "Read a piece you've never played — slowly, hands together, keeping the pulse no matter what.",
    shape: null, prescribe: "New piece · slow tempo · hands together · keep going past mistakes", bpm: 60,
    steps: [
      "Scan the page first: key signature, time signature, the highest and lowest notes.",
      "Set a tempo slow enough that you never have to stop. Then start and don't stop.",
      "When you fumble a note, keep the pulse — sight-reading is about flow, not corrections.",
    ],
    watch: ["Eyes on the page, not your hands. Trust your fingers to find the keys."],
  },
  "pno-hanon": {
    summary: "A five-finger independence pattern through all fingers, slow and dead even.",
    shape: fiveFinger, bpm: 80,
    steps: [
      "Play C-D-E-F-G with fingers 1-2-3-4-5, then back down, one note per click.",
      "The goal is identical tone and timing from every finger — especially the weak 4 and 5.",
      "Keep the hand still; only the fingers move.",
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
    watch: ["Practising the whole piece top-to-bottom hides the hard bar. Isolate it."],
  },
  "pno-voicings": {
    summary: "Comp a lead sheet with shell or rootless voicings instead of plain block triads.",
    shape: null, prescribe: "Lead sheet · shell voicings (root–3rd–7th) · comp the changes in time", bpm: null,
    steps: [
      "Take a tune's chord symbols. For each, play just the root, 3rd and 7th — the shell.",
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
      "Then the left hand on its own, same idea.",
      "Relax the wrist; take your eyes off the keys when you can.",
    ],
    watch: ["No note louder than the others — listen for the weak fingers."],
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
    shape: cMajorScale, bpm: 80,
    steps: [
      "Right hand up: 1-2-3, thumb under to F (1), then 2-3-4-5.",
      "Add the left hand. Pick one key and make it smooth before adding another.",
      "One note per click, even and unhurried.",
    ],
    watch: ["The thumb-under is where it gets bumpy — practise just that move."],
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
    shape: { kind: "keyboard", notes: [{ name: "C", octave: 3 }, { name: "E", octave: 3 }, { name: "G", octave: 3 }, { name: "C", octave: 4 }] },
    bpm: 80,
    steps: [
      "Instead of a block chord, roll the notes: C-E-G-C, evenly, like a wave.",
      "Keep the arpeggio quiet and steady so the right-hand melody floats over it.",
      "Aim for a flowing, even accompaniment with no lumps.",
    ],
    watch: ["Even spacing between the rolled notes matters more than speed."],
  },
};

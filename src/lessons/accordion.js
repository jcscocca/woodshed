// Accordion lessons. Right-hand uses keyboard shapes; bass-button work is prose.
const fiveFinger = { kind: "keyboard",
  notes: [{ name: "C", octave: 4 }, { name: "D", octave: 4 }, { name: "E", octave: 4 }, { name: "F", octave: 4 }, { name: "G", octave: 4 }],
  fingers: [1, 2, 3, 4, 5] };
const cScale = { kind: "keyboard",
  notes: [{ name: "C", octave: 4 }, { name: "D", octave: 4 }, { name: "E", octave: 4 }, { name: "F", octave: 4 }, { name: "G", octave: 4 }, { name: "A", octave: 4 }, { name: "B", octave: 4 }, { name: "C", octave: 5 }],
  fingers: [1, 2, 3, 1, 2, 3, 4, 5] };

export default {
  "acc-bellows": {
    summary: "Bellows control: long, even tones with smooth direction changes — the foundation of everything.",
    shape: null, prescribe: "Hold one note · long even tones · change bellows direction with no bump", bpm: null,
    steps: [
      "Hold one note and draw the bellows out slowly, keeping the volume dead flat.",
      "Reverse to a push without any surge or dip in volume at the turnaround.",
      "The turnaround is the skill — make it inaudible.",
    ],
    watch: ["Support the bellows with the whole forearm, not a jerk from the wrist."],
  },
  "acc-melody": {
    summary: "A simple right-hand melody on the keyboard side, slow and even (C five-finger shown).",
    shape: fiveFinger, bpm: 70,
    steps: [
      "Play a simple tune on the treble keyboard with even fingers.",
      "Keep the bellows moving steadily underneath — air is your sustain.",
      "Slow enough that every note speaks cleanly.",
    ],
    watch: ["Don't let the melody dictate jerky bellows; the air stays smooth regardless."],
  },
  "acc-strad": {
    summary: "Stradella bass: find a bass note and its major chord button, alternating steadily.",
    shape: null, prescribe: "Left hand alone · bass note then major-chord button · bass-chord-bass-chord", bpm: 80,
    steps: [
      "Find a bass note (e.g. C) and the major-chord button next to it.",
      "Alternate bass, chord, bass, chord at a steady slow pulse.",
      "Stay in the left hand alone until it's automatic.",
    ],
    watch: ["The counterbass and chord rows feel identical — learn them by the marker dimples, not by looking."],
  },
  "acc-oompah": {
    summary: "The oom-pah: bass on the strong beat, chord on the off-beat, in a waltz or march.",
    shape: null, prescribe: "Left hand · bass (oom) on beat 1, chord (pah) on the off-beats · slow waltz/march", bpm: 100,
    steps: [
      "March feel: oom (bass) on 1, pah (chord) on 2, repeat.",
      "Waltz feel: oom on 1, pah on 2, pah on 3.",
      "Keep it light and bouncy, not heavy.",
    ],
    watch: ["The 'pah' is shorter and softer than the 'oom' — that's what makes it dance."],
  },
  "acc-both": {
    summary: "Coordinate both hands: right-hand melody over a left-hand oom-pah.",
    shape: null, prescribe: "RH melody + LH oom-pah · hands separately first, then together slowly", bpm: 90,
    steps: [
      "Get the right-hand melody solid on its own.",
      "Get the left-hand oom-pah solid on its own.",
      "Combine at half speed; the hands fighting each other is normal at first.",
    ],
    watch: ["When they tangle, drop back to hands-separate for a minute, then retry."],
  },
  "acc-scales": {
    summary: "A right-hand C major scale on the keyboard side, bellows even the whole way.",
    shape: cScale, bpm: 80,
    steps: [
      "Play C major up and down, fingers 1-2-3 then thumb-under to 1-2-3-4-5.",
      "Keep the bellows perfectly even from bottom to top of the scale.",
      "One note per click, smooth and unhurried.",
    ],
    watch: ["A scale is a great bellows test — any volume wobble shows up instantly."],
  },
  "acc-folk": {
    summary: "Learn a short folk melody with a simple left-hand accompaniment, phrase by phrase.",
    shape: null, prescribe: "Short folk tune · melody RH + simple LH · phrase by phrase", bpm: null,
    steps: [
      "Learn the melody one phrase at a time on the right hand.",
      "Add a simple oom-pah or held bass under it.",
      "Stitch the phrases together slowly.",
    ],
    watch: ["Pick a tune you can already hum — your ear will catch wrong notes for you."],
  },

  "trk-acc-1": {
    summary: "Bellows control: long even tones with smooth direction changes.",
    shape: null, prescribe: "One note · long even tones · seamless bellows turnarounds", bpm: null,
    steps: [
      "Draw and push one note, holding the volume flat.",
      "Make the direction change inaudible.",
      "This underpins everything else, so spend real time here.",
    ],
    watch: ["No bump at the turnaround — that's the whole exercise."],
  },
  "trk-acc-2": {
    summary: "Right-hand five-finger position: a simple tune over steady bellows.",
    shape: fiveFinger, bpm: 70,
    steps: [
      "Five-finger position on the treble side, C-D-E-F-G.",
      "Keep the bellows steady underneath.",
      "Slow and even — tone first.",
    ],
    watch: ["Relaxed hand; let the keys come up fully between notes."],
  },
  "trk-acc-3": {
    summary: "Bass + chord buttons: alternate bass and major chord in the left hand alone.",
    shape: null, prescribe: "Left hand alone · bass note + its major chord button · bass-chord-bass-chord, steady", bpm: 80,
    steps: [
      "Locate a bass note and its major chord button.",
      "Alternate bass-chord-bass-chord at a slow, steady pulse.",
      "Build the muscle memory before adding the right hand.",
    ],
    watch: ["Find the buttons by feel — your eyes can't see the bass side while you play."],
  },
  "trk-acc-4": {
    summary: "Both hands on a simple tune: melody right, oom-pah left.",
    shape: null, prescribe: "RH melody + LH oom-pah · separate first, then together slowly", bpm: 90,
    steps: [
      "Solidify each hand alone.",
      "Bring them together at half speed.",
      "Speed up only when the coordination holds.",
    ],
    watch: ["Tangled hands? Back to hands-separate, then retry slower."],
  },
  "trk-acc-5": {
    summary: "Expression: shape phrases with bellows pressure and try a basic bellows shake.",
    shape: null, prescribe: "Bellows dynamics · swell and soften phrases · basic bellows shake for accents", bpm: null,
    steps: [
      "Play a phrase and shape it: swell with more bellows pressure, soften with less.",
      "Try a small, fast in-out 'shake' for rhythmic accents.",
      "Keep the notes steady while only the pressure changes.",
    ],
    watch: ["Dynamics come from bellows pressure, not from hitting the keys harder."],
  },
};

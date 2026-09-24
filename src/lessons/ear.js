// Ear-training lessons. No shape — each round's phrase is generated at
// practice time (src/ear.js); the `ear` block configures the generator.
// `prescribe` satisfies the lesson schema (shape or prescription) and reads
// as the drill line in the sheet. Two factories keep the four entries DRY;
// the per-instrument line and range are the only real differences.

const intervals = (instLine, range) => ({
  summary: "The app plays two notes and you play them back. Interval by interval, your ear learns the distances melodies are made of.",
  prescribe: "5 rounds · listen, then echo · reveal after each round",
  steps: [
    "Tap Train your ear, then Start. You'll hear the prompt — the pips show how many notes, never which.",
    instLine,
    "Play them back in order. Pips light up as notes land; wrong guesses don't derail the round.",
    "Stuck? Replay the prompt — free at low difficulty, rationed as you level up. After each round the notes are revealed.",
  ],
  watch: [
    "Sing or hum the notes before you hunt for them — the voice finds intervals faster than fingers.",
    "Hear the distance before you play the next note; don't fish note by note.",
  ],
  ear: { mode: "intervals", range, keys: ["C", "G", "F"], bpm: 80, rounds: 5 },
});

const phrases = (instLine, range) => ({
  summary: "Hear a short melody, play it back by ear. The phrases lengthen and leap wider as you level up.",
  prescribe: "5 rounds · short phrases in a key · reveal after each round",
  steps: [
    "Tap Train your ear, then Start. A short phrase plays — count the pips.",
    instLine,
    "Echo the phrase in order. Reveal shows what it was; Next brings a fresh one.",
    "Replays thin out as difficulty climbs — hold the whole phrase in your head before you play.",
  ],
  watch: [
    "Catch the contour first (up-up-down beats exact notes), then pin the intervals.",
    "If you lose the middle, replay and sing just that fragment before playing it.",
  ],
  ear: { mode: "phrases", range, keys: ["C", "G", "F"], bpm: 80, rounds: 5 },
});

export default {
  "pno-ear-int": intervals("Find them anywhere on the keyboard — prompts start at middle C and go up.", [60, 79]),
  "pno-ear-phr": phrases("Phrases start at middle C and go up, staying in one key.", [60, 79]),
  "gtr-ear-int": intervals("One string or across strings — whatever your hands find first.", [52, 71]),
  "gtr-ear-phr": phrases("Phrases sit between open position and the 7th fret; stay in position and let your ear steer.", [52, 71]),
};

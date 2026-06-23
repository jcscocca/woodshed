// Guitar lessons. strings/fingers: low->high [E A D G B e]; fret number, 0 open,
// "x" muted. fingers: 1=index 2=middle 3=ring 4=pinky (0 on open/muted strings).
const G  = { name: "G",  strings: [3, 2, 0, 0, 0, 3],           fingers: [2, 1, 0, 0, 0, 3] };
const D  = { name: "D",  strings: ["x", "x", 0, 2, 3, 2],       fingers: [0, 0, 0, 1, 3, 2] };
const Em = { name: "Em", strings: [0, 2, 2, 0, 0, 0],           fingers: [0, 2, 3, 0, 0, 0] };
const C  = { name: "C",  strings: ["x", 3, 2, 0, 1, 0],         fingers: [0, 3, 2, 0, 1, 0] };
const E  = { name: "E",  strings: [0, 2, 2, 1, 0, 0],           fingers: [0, 2, 3, 1, 0, 0] };
const A  = { name: "A",  strings: ["x", 0, 2, 2, 2, 0],         fingers: [0, 0, 1, 2, 3, 0] };
const F  = { name: "F",  strings: [1, 3, 3, 2, 1, 1],           fingers: [1, 3, 4, 2, 1, 1] };
const Bb = { name: "Bb", strings: ["x", 1, 3, 3, 3, 1],         fingers: [0, 1, 2, 3, 4, 1] };
const E5 = { name: "E5", strings: [0, 2, "x", "x", "x", "x"],   fingers: [0, 1, 0, 0, 0, 0] };
const A5 = { name: "A5", strings: ["x", 0, 2, "x", "x", "x"],   fingers: [0, 0, 1, 0, 0, 0] };

export default {
  "gtr-open": {
    summary: "The five open chords nearly every beginner song is built from: E, A, D, G, C.",
    shape: { kind: "chords", instrument: "guitar", chords: [E, A, D, G, C] },
    bpm: 60,
    steps: [
      "Fret one chord. Press just behind the fret wire, on your fingertips, so you don't deaden the next string.",
      "Pick each string in turn — every one should ring. A buzz or thud means a finger is leaning on that string.",
      "Lift off, shake out, and rebuild the shape from nothing. That rebuild is the skill you're actually training.",
    ],
    watch: ["Thumb behind the neck, not wrapped over — it gives your fingers room to arch.", "Keep fretting-hand nails short or the tips can't stand on the string."],
  },
  "gtr-trans": {
    summary: "Switching cleanly between C, G, D and Em — what turns separate shapes into a song.",
    shape: { kind: "chords", instrument: "guitar", chords: [C, G, D, Em] },
    bpm: 60,
    steps: [
      "Slow click. On each click, change to the next chord and strum once.",
      "Hunt for shared fingers: C→G the ring finger pivots; C→Em two fingers barely move.",
      "Miss a change? Slow down until every change lands on the click — never speed up through mistakes.",
    ],
    watch: ["Move the whole shape as one unit, not a finger at a time.", "Speed is a by-product of clean changes, not a target."],
  },
  "gtr-strum": {
    summary: "Build a steady strumming hand on one chord (G) before adding chord changes on top.",
    shape: { kind: "chords", instrument: "guitar", chords: [G] },
    bpm: 70,
    steps: [
      "Hold G and strum all downstrokes in time: down, down, down, down.",
      "Now keep the hand swinging down-up the whole time but only *hit* on: down, down-up, down.",
      "The hand never stops moving — the misses on the up-swing are what keep your time honest.",
    ],
    watch: ["Strum from the wrist, not the elbow.", "Relax your grip on the pick; a death-grip kills the groove."],
  },
  "gtr-riff": {
    summary: "Learn a single-note riff the reliable way — one phrase at a time, slow before fast.",
    shape: null,
    prescribe: "One riff · loop the hardest bar at half speed · join phrases only once each is clean",
    bpm: 70,
    steps: [
      "Break the riff into one- or two-bar phrases. Learn just the first.",
      "Loop the trickiest bar on its own, slowly, until your fingers find it without looking.",
      "Stitch phrases together one join at a time, keeping the pulse steady.",
    ],
    watch: ["Use the metronome — riffs live or die on their rhythm, not just the notes."],
  },
  "gtr-pent": {
    summary: "Box 1 of the A minor pentatonic at the 5th fret — the shape most lead guitar starts from.",
    shape: { kind: "fretboard", instrument: "guitar", baseFret: 5, dots: [
      { string: 0, fret: 5 }, { string: 0, fret: 8 }, { string: 1, fret: 5 }, { string: 1, fret: 7 },
      { string: 2, fret: 5 }, { string: 2, fret: 7 }, { string: 3, fret: 5 }, { string: 3, fret: 7 },
      { string: 4, fret: 5 }, { string: 4, fret: 8 }, { string: 5, fret: 5 }, { string: 5, fret: 8 },
    ] },
    bpm: 70,
    steps: [
      "Index on the 5th fret, ring/pinky on the 7th–8th. Play it up and down, one note per click.",
      "Use strict alternate picking — down, up, down, up — even when changing strings.",
      "Even timing beats speed. A slow, dead-even run sounds better than a fast lumpy one.",
    ],
    watch: ["Keep your fingers hovering close to the frets between notes — no big lifts."],
  },
  "gtr-power": {
    summary: "Movable power chords (E5, A5) with a tight palm mute — the engine of rock rhythm.",
    shape: { kind: "chords", instrument: "guitar", chords: [E5, A5] },
    bpm: 90,
    steps: [
      "Rest the edge of your strumming palm lightly on the strings by the bridge — that's the mute.",
      "Play steady downstroke eighth-notes. The sound should be 'chunk', not ringing.",
      "Slide the same two-finger shape to other frets without lifting the mute.",
    ],
    watch: ["Mute too hard and it's a click; too soft and it rings — find the chunk in between."],
  },
  "gtr-barre": {
    summary: "The F barre chord — your index becomes a movable nut across all six strings.",
    shape: { kind: "chords", instrument: "guitar", chords: [F] },
    bpm: 60,
    steps: [
      "Lay the index flat across all strings at fret 1, then roll it slightly onto its bony outer edge.",
      "Add the other fingers, then pick each string — find which ones buzz and lean the barre toward them.",
      "Squeeze, check, release. Build it fresh each time rather than holding a cramp.",
    ],
    watch: ["Pull the guitar neck back toward you with the fretting arm — leverage, not raw squeeze.", "It will sound bad for a week. That's normal; keep the reps short and frequent."],
  },
  "gtr-song": {
    summary: "The I–V–vi–IV in G — G, D, Em, C — the four chords behind a huge slice of pop songs.",
    shape: { kind: "chords", instrument: "guitar", chords: [G, D, Em, C] },
    bpm: 70,
    steps: [
      "Loop the four chords in order, four slow strums each: G → D → Em → C.",
      "Count '1-2-3-4' out loud so the change lands on beat 1 of the next bar, not whenever your hand is ready.",
      "Once it flows, sing or hum a melody over the top — that's a song.",
    ],
    watch: ["The G→C jump is the hardest; anchor your ring finger, it barely moves between them.", "Don't freeze the strumming hand to change — keep it moving and let the next chord arrive."],
  },
  "gtr-finger": {
    summary: "Travis picking on C and G: a steady alternating thumb under fingers picking the melody.",
    shape: { kind: "chords", instrument: "guitar", chords: [C, G] },
    bpm: 60,
    steps: [
      "Hold C. Thumb alternates bass strings — A string, then D string — like a slow metronome.",
      "Keep that thumb going and add index/middle on the higher strings between thumb beats.",
      "Start painfully slow. The thumb must stay even no matter what the fingers do.",
    ],
    watch: ["If the thumb stutters when the fingers come in, slow down until it doesn't."],
  },

  "trk-gtr-1": {
    summary: "Your first three open chords: Em (easiest), then C and G.",
    shape: { kind: "chords", instrument: "guitar", chords: [Em, C, G] },
    bpm: 60,
    steps: [
      "Start with Em — two fingers, hard to get wrong. Pick each string; all six should ring.",
      "Add C, then G. Press just behind the fret on your fingertips.",
      "Spend a minute on each, rebuilding the shape from scratch each time.",
    ],
    watch: ["Arch your fingers so the pads don't mute the open strings next door."],
  },
  "trk-gtr-2": {
    summary: "The one-minute change drill: count clean changes between two chords in 60 seconds.",
    shape: { kind: "chords", instrument: "guitar", chords: [G, C] },
    bpm: 60,
    steps: [
      "Pick two chords (start G and C). Change back and forth, counting each clean change for one minute.",
      "Write the number down. Tomorrow, try to beat it.",
      "Repeat with other pairs — D and A, Em and C — so every change gets reps.",
    ],
    watch: ["Accuracy first: a buzzed change doesn't count. Speed follows clean reps."],
  },
  "trk-gtr-3": {
    summary: "Lock a strumming pattern to the click on one chord before mixing in changes.",
    shape: { kind: "chords", instrument: "guitar", chords: [G] },
    bpm: 70,
    steps: [
      "Hold one chord. Keep the hand moving continuously: down-down-up-up-down-up.",
      "Set a slow metronome and make the downbeats land exactly on the click.",
      "Only speed up once the pattern is even and locked.",
    ],
    watch: ["The constant down-up motion of the hand is the metronome — don't stop it to think."],
  },
  "trk-gtr-4": {
    summary: "Build the F barre chord slowly — the gateway to every movable shape.",
    shape: { kind: "chords", instrument: "guitar", chords: [F] },
    bpm: 60,
    steps: [
      "Roll the index slightly onto its side and bar all six strings at the 1st fret.",
      "Place the remaining fingers, then test every string for a clean note.",
      "Get all six sounding before you ever strum it in time.",
    ],
    watch: ["Leverage from the arm pulling the neck back beats squeezing harder."],
  },
  "trk-gtr-5": {
    summary: "Move barre shapes around: the E-shape (F here) and the A-shape (Bb here).",
    shape: { kind: "chords", instrument: "guitar", chords: [F, Bb] },
    bpm: 60,
    steps: [
      "Play the E-shape barre at fret 1 (F), then the A-shape barre at fret 1 (Bb).",
      "Change between them slowly over a progression, keeping every string clean.",
      "Then slide each shape up the neck — same fingering, new key.",
    ],
    watch: ["The A-shape barre only needs strings 2–5 ringing; let the high e be soft if it fights you."],
  },
};

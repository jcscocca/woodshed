// ============================================================
// Bass and accordion content, archived out of the build (see
// docs/DIRECTION.md and archive/README.md). Plain data cut verbatim
// from src/seed.js; nothing imports it. To restore, put each block
// back in the matching list in src/seed.js.
// ============================================================

export const INSTRUMENTS = {
  bass:      { name: "Bass",      color: "var(--bass)" },
  accordion: { name: "Accordion", color: "var(--accordion)" },
};

// CSS variables in src/styles.css :root were --bass:#8b7bd8; --accordion:#d05a6e.
export const COLOR_HEX = {
  bass: "#8b7bd8", accordion: "#d05a6e",
};

// src/seed.js LIBRARY
export const LIBRARY = [
  // ---------- BASS ----------
  { id: "bs-pluck",  inst: "bass", title: "Plucking technique",      type: "technique", diff: 1, min: 5,  desc: "Alternate index and middle on one note. Even volume, relaxed hand.", twin: "trk-bs-1" },
  { id: "bs-roots",  inst: "bass", title: "Root notes over chords",  type: "technique", diff: 1, min: 6,  desc: "Play the root of each chord in a simple progression, locked to a metronome." },
  { id: "bs-major",  inst: "bass", title: "Major scale, one octave", type: "technique", diff: 2, min: 5,  desc: "One-octave major scale up and down, one note per click." },
  { id: "bs-pent",   inst: "bass", title: "Minor pentatonic",        type: "technique", diff: 2, min: 6,  desc: "Run the minor pentatonic up and down, fretting cleanly with minimal buzz." },
  { id: "bs-oct",    inst: "bass", title: "Octave groove patterns",  type: "technique", diff: 2, min: 6,  desc: "Root-octave patterns across a progression with a steady eighth-note feel." },
  { id: "bs-lock",   inst: "bass", title: "Lock with the click",     type: "technique", diff: 2, min: 6,  desc: "Quarter notes dead-on with a metronome, then try landing slightly behind the beat." },
  { id: "bs-walk",   inst: "bass", title: "Walking bass basics",     type: "technique", diff: 4, min: 10, desc: "Walk a line over I-IV-V using roots, fifths and passing tones, one note per beat.", twin: "trk-bs-5" },
  { id: "bs-line",   inst: "bass", title: "Learn a bassline",        type: "song",      diff: 3, min: 10, desc: "Pick a groove you love and learn it phrase by phrase. Nail the rhythm before the notes." },

  // ---------- ACCORDION ----------
  { id: "acc-bellows", inst: "accordion", title: "Bellows control",            type: "technique", diff: 1, min: 5,  desc: "Long, even tones; change bellows direction smoothly with no bump in volume.", twin: "trk-acc-1" },
  { id: "acc-melody",  inst: "accordion", title: "Right-hand melody",          type: "technique", diff: 1, min: 6,  desc: "Play a simple tune on the keyboard side, slowly, with even fingers." },
  { id: "acc-strad",   inst: "accordion", title: "Bass + chords (Stradella)",  type: "technique", diff: 2, min: 6,  desc: "Find the bass note and major-chord buttons; alternate bass-chord-bass-chord steadily.", twin: "trk-acc-3" },
  { id: "acc-oompah",  inst: "accordion", title: "Oom-pah pattern",            type: "technique", diff: 2, min: 6,  desc: "Bass-chord 'oom-pah' in the left hand at a slow waltz or march tempo." },
  { id: "acc-both",    inst: "accordion", title: "Coordinate both hands",      type: "song",      diff: 3, min: 10, desc: "Simple song: melody right, oom-pah left. Hands separate first, then together.", twin: "trk-acc-4" },
  { id: "acc-scales",  inst: "accordion", title: "Right-hand scales",          type: "technique", diff: 2, min: 5,  desc: "A major scale on the keyboard side; keep the bellows even the whole way." },
  { id: "acc-folk",    inst: "accordion", title: "Learn a folk tune",          type: "song",      diff: 3, min: 10, desc: "A short folk melody with simple left-hand accompaniment, phrase by phrase." },
];

// src/seed.js ECHO_SEED
export const ECHO_SEED = [
  { id: "bs-ear-int",  inst: "bass",      title: "Echo: intervals",     type: "ear", diff: 1, min: 6, desc: "Echo the app's prompt by ear. Interval recognition is half of learning lines off records." },
  { id: "bs-ear-phr",  inst: "bass",      title: "Echo: short phrases", type: "ear", diff: 3, min: 8, desc: "Short phrases to catch and play back — the transcription muscle, one lick at a time." },
  { id: "acc-ear-int", inst: "accordion", title: "Echo: intervals",     type: "ear", diff: 1, min: 6, desc: "A short prompt on the right hand; play it back." },
  { id: "acc-ear-phr", inst: "accordion", title: "Echo: short phrases", type: "ear", diff: 3, min: 8, desc: "Echo short right-hand phrases by ear, one round at a time." },
];

// src/seed.js TRACKS
export const TRACKS = [
  {
    id: "trk-bs-groove", inst: "bass", name: "Groove & Fretboard",
    blurb: "Lock in with the beat and learn your way around the neck, building toward walking lines.",
    stages: [
      { id: "trk-bs-1", title: "Right-hand alternation", type: "technique", diff: 1, min: 6, desc: "Alternate index and middle fingers on a single note. Keep the volume even and the hand loose.", link: { label: "Scott's Bass Lessons", url: "https://scottsbasslessons.com" } },
      { id: "trk-bs-2", title: "Lock roots to the click", type: "technique", diff: 2, min: 7, desc: "Play the root of each chord in a simple progression, dead-on with a metronome. Then try sitting slightly behind the beat." },
      { id: "trk-bs-3", title: "Major scale & note names", type: "technique", diff: 2, min: 7, desc: "One-octave major scale shape, saying the note names as you go. Build a map of the fretboard, not just a shape." },
      { id: "trk-bs-4", title: "Root–fifth–octave patterns", type: "technique", diff: 3, min: 8, desc: "Outline each chord with root, fifth, and octave in a steady eighth-note feel across a progression." },
      { id: "trk-bs-5", title: "Walking bass basics", type: "technique", diff: 4, min: 10, desc: "Walk a line over a I–IV–V using roots, fifths, and passing tones — one note per beat, smooth voice leading." },
    ],
  },
  {
    id: "trk-acc-basics", inst: "accordion", name: "Bellows & Buttons",
    blurb: "The accordion-specific fundamentals: bellows control, the bass side, and both hands together.",
    stages: [
      { id: "trk-acc-1", title: "Bellows control", type: "technique", diff: 1, min: 6, desc: "Long, even tones. Change bellows direction smoothly with no bump in volume — this is the foundation of everything else.", link: { label: "Beginner accordion lessons (YouTube)", url: "https://www.youtube.com/results?search_query=beginner+accordion+lessons" } },
      { id: "trk-acc-2", title: "Right-hand five-finger position", type: "technique", diff: 1, min: 6, desc: "A simple five-finger tune on the keyboard side, keeping the bellows steady underneath. Slow and even." },
      { id: "trk-acc-3", title: "Bass + chord buttons", type: "technique", diff: 2, min: 7, desc: "Find the bass note and its major chord button. Alternate bass-chord-bass-chord steadily in the left hand alone." },
      { id: "trk-acc-4", title: "Both hands on a simple tune", type: "technique", diff: 3, min: 10, desc: "Melody in the right hand, oom-pah in the left. Practice hands separately, then bring them together slowly." },
      { id: "trk-acc-5", title: "Bellows shake & dynamics", type: "technique", diff: 4, min: 8, desc: "Add expression: shape phrases with bellows pressure and try a basic bellows shake for rhythmic accents." },
    ],
  },
];

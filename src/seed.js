// ============================================================
// Instruments, identity colors, and the starter exercise library.
// To add your own exercises permanently, append to SEED below
// (or use the in-app "+ Add" button, which stores them in your
// browser). Each item:
//   inst:  piano | guitar | bass | accordion
//   type:  technique (drill) | song (repertoire) | sight | ear | creative
//   diff:  1 (beginner) .. 5 (advanced)
//   min:   estimated minutes
// ============================================================

export const INSTRUMENTS = {
  piano:     { name: "Piano",     color: "var(--piano)",     base: 3 },
  guitar:    { name: "Guitar",    color: "var(--guitar)",    base: 1 },
  bass:      { name: "Bass",      color: "var(--bass)",      base: 1 },
  accordion: { name: "Accordion", color: "var(--accordion)", base: 1 },
};

// Hex equivalents of the CSS vars, in case you need them in JS/canvas later.
export const COLOR_HEX = {
  piano: "#5fa8a0", guitar: "#e07856", bass: "#8b7bd8", accordion: "#d05a6e",
};

export const TYPE_LABEL = {
  technique: "Drill", song: "Song", sight: "Reading", ear: "Ear", creative: "Create",
};

export const FELT = [
  { key: "easy", label: "Too easy" },
  { key: "good", label: "Felt right" },
  { key: "hard", label: "Tough" },
];

export const SEED = [
  // ---------- PIANO ----------
  { id: "pno-scales",   inst: "piano", title: "Scales & arpeggios, hands together", type: "technique", diff: 3, min: 8,  desc: "Run major scales hands together, 2 octaves. Pick 2 keys today; aim for even tone and a steady metronome." },
  { id: "pno-sight",    inst: "piano", title: "Sight-reading",                       type: "sight",     diff: 3, min: 8,  desc: "Read through a piece you've never played, slowly, hands together. Don't stop to fix mistakes — keep the pulse." },
  { id: "pno-hanon",    inst: "piano", title: "Finger independence (Hanon)",         type: "technique", diff: 3, min: 6,  desc: "One Hanon exercise or 5-finger pattern through all positions, slow and even. Relaxed wrists." },
  { id: "pno-piece",    inst: "piano", title: "Your current piece",                  type: "song",      diff: 4, min: 12, desc: "Work the hardest section. Hands separate first, then together, slower than feels necessary." },
  { id: "pno-voicings", inst: "piano", title: "Comping from a lead sheet",           type: "technique", diff: 3, min: 10, desc: "Take a pop or jazz lead sheet and comp the changes with shell or rootless voicings." },
  { id: "pno-improv",   inst: "piano", title: "Improvise over a progression",        type: "creative",  diff: 4, min: 8,  desc: "Loop a ii-V-I or I-V-vi-IV and improvise a right-hand melody. Leave space." },
  { id: "pno-ear",      inst: "piano", title: "Transcribe by ear",                   type: "ear",       diff: 3, min: 8,  desc: "Pick a short melody and figure it out by ear - no sheet music." },

  // ---------- GUITAR ----------
  { id: "gtr-open",    inst: "guitar", title: "Open chords",              type: "technique", diff: 1, min: 6,  desc: "Cycle E, A, D, G, C. Press just behind the fret; check every string rings clean." },
  { id: "gtr-trans",   inst: "guitar", title: "Chord transitions",       type: "technique", diff: 2, min: 6,  desc: "Switch C-G-D-Em on a slow metronome. One clean change per click; speed up only when clean." },
  { id: "gtr-strum",   inst: "guitar", title: "Strumming patterns",      type: "technique", diff: 1, min: 5,  desc: "Down, down-down-up-down on one chord. Keep the strumming hand moving the whole time." },
  { id: "gtr-riff",    inst: "guitar", title: "A single-note riff",      type: "song",      diff: 3, min: 8,  desc: "Learn a riff one phrase at a time. Loop the tricky bar slowly before joining it up." },
  { id: "gtr-pent",    inst: "guitar", title: "Minor pentatonic, box 1", type: "technique", diff: 2, min: 6,  desc: "Run box 1 up and down with alternate picking. Even timing beats speed." },
  { id: "gtr-power",   inst: "guitar", title: "Power chords + palm mute", type: "technique", diff: 2, min: 6,  desc: "Move a power-chord shape around the neck with steady palm-muted downstrokes." },
  { id: "gtr-barre",   inst: "guitar", title: "Barre chords",            type: "technique", diff: 3, min: 6,  desc: "Work the F barre. Roll the index slightly; get every string sounding before strumming." },
  { id: "gtr-song",    inst: "guitar", title: "A four-chord song",       type: "song",      diff: 2, min: 10, desc: "Play through a 4-chord song, counting or singing along to hold the time." },
  { id: "gtr-finger",  inst: "guitar", title: "Fingerpicking (Travis)",  type: "technique", diff: 3, min: 7,  desc: "Alternate thumb on bass strings, fingers on top. Start painfully slow." },

  // ---------- BASS ----------
  { id: "bs-pluck",  inst: "bass", title: "Plucking technique",      type: "technique", diff: 1, min: 5,  desc: "Alternate index and middle on one note. Even volume, relaxed hand." },
  { id: "bs-roots",  inst: "bass", title: "Root notes over chords",  type: "technique", diff: 1, min: 6,  desc: "Play the root of each chord in a simple progression, locked to a metronome." },
  { id: "bs-major",  inst: "bass", title: "Major scale, one octave", type: "technique", diff: 2, min: 5,  desc: "One-octave major scale up and down, one note per click." },
  { id: "bs-pent",   inst: "bass", title: "Minor pentatonic",        type: "technique", diff: 2, min: 6,  desc: "Run the minor pentatonic up and down, fretting cleanly with minimal buzz." },
  { id: "bs-oct",    inst: "bass", title: "Octave groove patterns",  type: "technique", diff: 2, min: 6,  desc: "Root-octave patterns across a progression with a steady eighth-note feel." },
  { id: "bs-lock",   inst: "bass", title: "Lock with the click",     type: "technique", diff: 2, min: 6,  desc: "Quarter notes dead-on with a metronome, then try landing slightly behind the beat." },
  { id: "bs-walk",   inst: "bass", title: "Walking bass basics",     type: "technique", diff: 3, min: 8,  desc: "Walk a line over I-IV-V using roots, fifths and passing tones, one note per beat." },
  { id: "bs-line",   inst: "bass", title: "Learn a bassline",        type: "song",      diff: 3, min: 10, desc: "Pick a groove you love and learn it phrase by phrase. Nail the rhythm before the notes." },

  // ---------- ACCORDION ----------
  { id: "acc-bellows", inst: "accordion", title: "Bellows control",            type: "technique", diff: 1, min: 5,  desc: "Long, even tones; change bellows direction smoothly with no bump in volume." },
  { id: "acc-melody",  inst: "accordion", title: "Right-hand melody",          type: "technique", diff: 1, min: 6,  desc: "Play a simple tune on the keyboard side, slowly, with even fingers." },
  { id: "acc-strad",   inst: "accordion", title: "Bass + chords (Stradella)",  type: "technique", diff: 2, min: 6,  desc: "Find the bass note and major-chord buttons; alternate bass-chord-bass-chord steadily." },
  { id: "acc-oompah",  inst: "accordion", title: "Oom-pah pattern",            type: "technique", diff: 2, min: 6,  desc: "Bass-chord 'oom-pah' in the left hand at a slow waltz or march tempo." },
  { id: "acc-both",    inst: "accordion", title: "Coordinate both hands",      type: "song",      diff: 3, min: 10, desc: "Simple song: melody right, oom-pah left. Hands separate first, then together." },
  { id: "acc-scales",  inst: "accordion", title: "Right-hand scales",          type: "technique", diff: 2, min: 5,  desc: "A major scale on the keyboard side; keep the bellows even the whole way." },
  { id: "acc-folk",    inst: "accordion", title: "Learn a folk tune",          type: "song",      diff: 3, min: 10, desc: "A short folk melody with simple left-hand accompaniment, phrase by phrase." },
];

// ============================================================
// SKILL TRACKS — ordered progressions. Unlike the free-practice
// library above, a track unlocks one stage at a time: you only see
// (and rotate through) your current edge until you advance past it.
// Each stage is a normal exercise plus an order; `link` is an optional
// { label, url } pointing at real outside instruction.
// ============================================================
export const TRACKS = [
  {
    id: "trk-gtr-chords", inst: "guitar", name: "Chord Foundations",
    blurb: "From your first open chords to confident changes and barre shapes.",
    stages: [
      { id: "trk-gtr-1", title: "Open chords: Em, C, G", type: "technique", diff: 1, min: 8, desc: "Learn Em, C, and G one at a time. Fret right behind the fret wire, press just hard enough, and pick each string to check it rings clean.", link: { label: "JustinGuitar — beginner chords", url: "https://www.justinguitar.com" } },
      { id: "trk-gtr-2", title: "One-minute chord changes", type: "technique", diff: 2, min: 8, desc: "Pick two chords and count how many clean changes you make in a minute. Repeat with different pairs. Accuracy first, speed follows." },
      { id: "trk-gtr-3", title: "Strumming in time", type: "technique", diff: 2, min: 7, desc: "Hold one chord and keep the strumming hand moving continuously: down-down-up-up-down-up. Lock it to a metronome at a slow tempo." },
      { id: "trk-gtr-4", title: "The F barre chord", type: "technique", diff: 3, min: 8, desc: "Build the F barre slowly. Roll the index finger slightly onto its side, and get all six strings sounding before you strum it in time." },
      { id: "trk-gtr-5", title: "Barre chords around the neck", type: "technique", diff: 4, min: 8, desc: "Move E-shape and A-shape barre chords to different frets. Practice changing between them cleanly over a slow progression." },
    ],
  },
  {
    id: "trk-pno-hands", inst: "piano", name: "Two-Hand Coordination",
    blurb: "Build independence between the hands, from five-finger shapes to arpeggiated accompaniment.",
    stages: [
      { id: "trk-pno-1", title: "Five-finger patterns, hands separate", type: "technique", diff: 1, min: 8, desc: "C-position five-finger patterns, each hand on its own. Even tone, relaxed wrist, eyes off the keys when you can.", link: { label: "musictheory.net — basics", url: "https://www.musictheory.net" } },
      { id: "trk-pno-2", title: "Hands together: contrary motion", type: "technique", diff: 2, min: 8, desc: "Start with both thumbs on middle C and move the hands outward and back together. Slow and symmetrical." },
      { id: "trk-pno-3", title: "Major scales, one octave", type: "technique", diff: 2, min: 8, desc: "One-octave major scale hands together, watching the thumb-under. Pick one key and make it smooth before adding another." },
      { id: "trk-pno-4", title: "Melody over block chords", type: "technique", diff: 3, min: 10, desc: "Right hand plays a simple melody while the left holds block chords on the changes. Keep the melody singing above the chords." },
      { id: "trk-pno-5", title: "Arpeggiated accompaniment", type: "technique", diff: 4, min: 10, desc: "Break the left-hand chords into rolling arpeggios under the melody. Aim for an even, flowing accompaniment." },
    ],
  },
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

// Flatten every track stage into library-item form (adds inst, trackId,
// trackName, and order). Used to seed fresh installs and to merge new
// track content into existing saved data.
export function trackItems() {
  return TRACKS.flatMap((t) =>
    t.stages.map((st, i) => ({ ...st, inst: t.inst, trackId: t.id, trackName: t.name, order: i, hidden: false }))
  );
}

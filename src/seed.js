// ============================================================
// Instruments, identity colors, and the starter exercise library.
// To add your own exercises permanently, append to LIBRARY below
// (or use the in-app "+ Add" button, which stores them in your
// browser). Each item:
//   inst:  piano | guitar
//   type:  technique (drill) | song (repertoire) | sight | ear | creative
//   diff:  1 (beginner) .. 5 (advanced)
//   min:   estimated minutes
//   twin:  optional track-stage id with the same content; a daily set
//          never holds both (see fillInstrument in engine.js)
// ============================================================

import { COACH_ENABLED } from "./features.js";

export const INSTRUMENTS = {
  piano:     { name: "Piano",     color: "var(--piano)" },
  guitar:    { name: "Guitar",    color: "var(--guitar)" },
};

// Hex equivalents of the CSS vars, in case you need them in JS/canvas later.
export const COLOR_HEX = {
  piano: "#5fa8a0", guitar: "#e07856",
};

export const TYPE_LABEL = {
  technique: "Drill", song: "Song", sight: "Reading", ear: "Ear", creative: "Create",
};

export const FELT = [
  { key: "easy", label: "Too easy" },
  { key: "good", label: "Felt right" },
  { key: "hard", label: "Tough" },
];

const LIBRARY = [
  // ---------- PIANO ----------
  { id: "pno-scales",   inst: "piano", title: "Major scales, hands together",        type: "technique", diff: 3, min: 8,  desc: "Run major scales hands together, two octaves, starting in C. Aim for even tone and a steady metronome." },
  { id: "pno-sight",    inst: "piano", title: "Sight-reading",                       type: "sight",     diff: 3, min: 8,  desc: "Read through a piece you've never played, slowly, hands together. Don't stop to fix mistakes — keep the pulse." },
  { id: "pno-improv",   inst: "piano", title: "Improvise over a progression",        type: "creative",  diff: 4, min: 8,  desc: "Loop one of the Pop track's progressions and improvise a right-hand melody over it. Leave space." },
  { id: "pno-ear",      inst: "piano", title: "Transcribe by ear",                   type: "ear",       diff: 3, min: 8,  desc: "Pick a short melody and figure it out by ear — no sheet music." },
  { id: "pno-song",     inst: "piano", title: "Your song",                           type: "song",      diff: 3, min: 10, desc: "Type the chords of a song you love, pick a pattern, and play it written out — graded like any piece." },

  // ---------- GUITAR ----------
  { id: "gtr-open",    inst: "guitar", title: "Open chords",              type: "technique", diff: 1, min: 6,  desc: "Cycle E, A, D, G, C. Press just behind the fret; check every string rings clean." },
  { id: "gtr-trans",   inst: "guitar", title: "Chord transitions",       type: "technique", diff: 2, min: 6,  desc: "Switch C–G–D–Em on a slow metronome: four strums per chord, change on beat 1; then two; then one. Speed up only when clean." },
  { id: "gtr-strum",   inst: "guitar", title: "Strumming patterns",      type: "technique", diff: 1, min: 5,  desc: "One chord, one bar of 4/4: D on 1, D-U on 2&, D on 3, D-U on 4&. Keep the strumming hand moving the whole time." },
  { id: "gtr-riff",    inst: "guitar", title: "A single-note riff",      type: "song",      diff: 3, min: 8,  desc: "Learn a riff one phrase at a time. Loop the tricky bar slowly before joining it up." },
  { id: "gtr-pent",    inst: "guitar", title: "Minor pentatonic, box 1", type: "technique", diff: 2, min: 6,  desc: "Run box 1 up and down with alternate picking. Even timing beats speed." },
  { id: "gtr-power",   inst: "guitar", title: "Power chords + palm mute", type: "technique", diff: 2, min: 6,  desc: "Move the two-finger power-chord shape around the neck with steady palm-muted downstrokes." },
  { id: "gtr-barre",   inst: "guitar", title: "Barre chords",            type: "technique", diff: 3, min: 6,  desc: "Work the F barre. Roll the index slightly; get every string sounding before strumming.", twin: "trk-gtr-4" },
  { id: "gtr-song",    inst: "guitar", title: "A four-chord song",       type: "song",      diff: 2, min: 10, desc: "Play through a 4-chord song, counting or singing along to hold the time." },
  { id: "gtr-finger",  inst: "guitar", title: "Fingerpicking (Travis)",  type: "technique", diff: 3, min: 7,  desc: "Alternate thumb on bass strings, fingers on top. Start painfully slow." },
];

// ---------- EAR TRAINING (echo rounds — graded; see src/ear.js) ----------
// Off with the pitch coach (src/features.js): fresh installs and merges skip them.
export const ECHO_SEED = [
  { id: "pno-ear-int", inst: "piano",     title: "Echo: intervals",     type: "ear", diff: 1, min: 6, desc: "The app plays a short prompt; find it and play it back. Your ear learns the distances first." },
  { id: "pno-ear-phr", inst: "piano",     title: "Echo: short phrases", type: "ear", diff: 3, min: 8, desc: "Hear a short melody and play it back by ear. Phrases grow as you level up." },
  { id: "gtr-ear-int", inst: "guitar",    title: "Echo: intervals",     type: "ear", diff: 1, min: 6, desc: "Echo the app's prompt on one string or across strings — wherever your hands find it." },
  { id: "gtr-ear-phr", inst: "guitar",    title: "Echo: short phrases", type: "ear", diff: 3, min: 8, desc: "Play back a short melodic phrase by ear. Sing it first if it helps — it does." },
];

export const SEED = COACH_ENABLED ? [...LIBRARY, ...ECHO_SEED] : [...LIBRARY, ...ECHO_SEED.filter((s) => s.inst === "piano")];

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
      { id: "trk-gtr-3", title: "Strumming in time", type: "technique", diff: 2, min: 7, desc: "Hold one chord and keep the strumming hand moving continuously: D on 1, D-U on 2&, miss 3, U on 3&, D-U on 4&. Lock it to a metronome at a slow tempo." },
      { id: "trk-gtr-4", title: "The F barre chord", type: "technique", diff: 3, min: 8, desc: "Build the F barre slowly. Roll the index finger slightly onto its side, and get all six strings sounding before you strum it in time." },
      { id: "trk-gtr-5", title: "Barre chords around the neck", type: "technique", diff: 4, min: 8, desc: "Move E-shape and A-shape barre chords to different frets. Practice changing between them cleanly over a slow progression." },
    ],
  },
  {
    id: "trk-pno-pieces", inst: "piano", name: "Pieces",
    blurb: "Written pieces, easiest first — from the Anna Magdalena notebook to Clementi and Burgmüller — learned a section at a time.",
    stages: [
      { id: "pno-minuet", title: "Minuet in G (Petzold)", type: "song", diff: 2, min: 12, desc: "The Minuet in G from the Anna Magdalena notebook — a section at a time, hands separately, then with the click." },
    ],
  },
  {
    id: "trk-pno-hands", inst: "piano", name: "Two-Hand Coordination",
    blurb: "Build independence between the hands, from five-finger shapes to full hands-together scales.",
    stages: [
      { id: "trk-pno-1", title: "Five-finger patterns, hands separate", type: "technique", diff: 1, min: 8, desc: "C-position five-finger patterns, then the same shape in G, each hand on its own. Even tone, relaxed wrist, eyes off the keys when you can.", link: { label: "musictheory.net — basics", url: "https://www.musictheory.net" } },
      { id: "trk-pno-2", title: "Hands together: contrary motion", type: "technique", diff: 2, min: 8, desc: "Start with both thumbs on middle C and move the hands outward and back together. Slow and symmetrical." },
      { id: "trk-pno-3", title: "Major scales, one octave — C, G, F", type: "technique", diff: 2, min: 8, desc: "One-octave major scales hands together, watching the thumb-under — C and G, then F and back to C." },
      { id: "tec-hanon-1", title: "Hanon No. 1", type: "technique", diff: 3, min: 8, desc: "A five-finger pattern climbing by step through two octaves and back, hands together throughout." },
      { id: "tec-cadences", title: "Primary chords and cadences", type: "technique", diff: 2, min: 8, desc: "I–IV–V–I as block chords, once each in C, G, and F." },
      { id: "tec-arpeggios", title: "Arpeggios, one octave", type: "technique", diff: 3, min: 8, desc: "One-octave arpeggios, root position, through three major keys then three minor." },
    ],
  },
  {
    id: "trk-pno-pop", inst: "piano", name: "Pop from chords",
    blurb: "Play songs from chord charts: the four chords everyone uses, then accompaniment patterns, then real melodies over your own left hand.",
    stages: [
      { id: "pop-four-chords", title: "The four chords", type: "song", diff: 2, min: 10, desc: "I–V–vi–IV in C as block chords — the progression under a huge share of pop songs." },
      { id: "pop-voice-leading", title: "Voice leading", type: "song", diff: 3, min: 10, desc: "The same four chords, voiced so each change moves as little as possible." },
      { id: "pop-ballad", title: "Pop-ballad left hand", type: "song", diff: 2, min: 10, desc: "A root-fifth-octave-fifth left-hand pattern in even eighths, under I–V–vi–IV and its vi–IV–I–V twin." },
      { id: "pop-pulse", title: "Pulse the right hand", type: "song", diff: 3, min: 10, desc: "A right-hand rhythm pattern — hits on 1, the & of 2, and 4 — over a four-chord loop in G." },
      { id: "pop-fifties", title: "The '50s progression", type: "song", diff: 2, min: 10, desc: "I–vi–IV–V in G with a right-hand arpeggio — the doo-wop progression." },
      { id: "pop-blues", title: "12-bar blues", type: "song", diff: 3, min: 10, desc: "The 12-bar blues form in C with a boogie-woogie left hand." },
      { id: "pop-ode-to-joy", title: "Lead sheet: Ode to Joy", type: "song", diff: 3, min: 12, desc: "Beethoven's Ode to Joy melody over a written-out left hand, learned a hand at a time." },
      { id: "pop-amazing-grace", title: "Lead sheet: Amazing Grace", type: "song", diff: 3, min: 12, desc: "The \"New Britain\" melody in 3/4 over a written-out left hand, learned a hand at a time." },
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

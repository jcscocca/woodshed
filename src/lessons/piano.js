// Piano lessons. keyboard notes are {name, octave}; middle C = octave 4.
import PIECES from "./pieces/index.js";
const cMajorTwoOctaves = { kind: "keyboard",
  notes: [{ name: "C", octave: 4 }, { name: "D", octave: 4 }, { name: "E", octave: 4 }, { name: "F", octave: 4 }, { name: "G", octave: 4 }, { name: "A", octave: 4 }, { name: "B", octave: 4 },
    { name: "C", octave: 5 }, { name: "D", octave: 5 }, { name: "E", octave: 5 }, { name: "F", octave: 5 }, { name: "G", octave: 5 }, { name: "A", octave: 5 }, { name: "B", octave: 5 }, { name: "C", octave: 6 }],
  fingers: [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5] };

// ABC source is line-sensitive, so these live at column 0.
const SCALE_SNIPPET = `X:1
M:4/4
L:1/8
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] CDEF GABc | cBAG FEDC |
[V:2] C,D,E,F, G,A,B,C | CB,A,G, F,E,D,C, |`;

// Lead-sheet melodies (public domain), voice 1, L:1/8 — one line per 4 bars of the chart.
const ODE_MELODY = `E2E2F2G2 | G2F2E2D2 | C2C2D2E2 | E3D D4 |
E2E2F2G2 | G2F2E2D2 | C2C2D2E2 | D3C C4 |
D2D2E2C2 | D2EF E2C2 | D2EF E2D2 | C2D2 G,4 |
E2E2F2G2 | G2F2E2D2 | C2C2D2E2 | D3C C4 |]`;

const GRACE_MELODY = `z4D2 | G4BG | B4A2 | G4E2 |
D4D2 | G4BG | B4A2 | d6- |
d4B2 | d4BG | B4A2 | G4E2 |
D4D2 | G4BG | B4A2 | G6 |]`;

const FIVE_FINGER_ABC = `X:1
M:4/4
L:1/4
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] C D E F | G F E D | C D E F | E D C2 |
[V:2] z4 | z4 | z4 | z4 |
[V:1] z4 | z4 | z4 | z4 |
[V:2] C, D, E, F, | G, F, E, D, | C, D, E, F, | E, D, C,2 |
[V:1] G A B c | d c B A | G A B c | B A G2 |
[V:2] z4 | z4 | z4 | z4 |
[V:1] z4 | z4 | z4 | z4 |
[V:2] G,, A,, B,, C, | D, C, B,, A,, | G,, A,, B,, C, | B,, A,, G,,2 |]`;

const CONTRARY_ABC = `X:1
M:4/4
L:1/4
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] C D E F | G F E D | C D E F | G F E D |
[V:2] C B, A, G, | F, G, A, B, | C B, A, G, | F, G, A, B, |
[V:1] C D E F | G F E D | C E D F | E D C2 |
[V:2] C B, A, G, | F, G, A, B, | C A, B, G, | A, B, C2 |]`;

const SCALES_ABC = `X:1
M:4/4
L:1/8
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] CDEF GABc | cBAG FEDC | GABc de^fg | g^fed cBAG |
[V:2] C,D,E,F, G,A,B,C | CB,A,G, F,E,D,C, | G,A,B,C DE^FG | G^FED CB,A,G, |
[V:1] FGA_B cdef | fedc _BAGF | CDEF GABc | cBAG FEDC |
[V:2] F,G,A,_B, CDEF | FEDC _B,A,G,F, | C,D,E,F, G,A,B,C | CB,A,G, F,E,D,C, |]`;

const HANON_ABC = `X:1
M:2/4
L:1/16
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] CEFG AGFE | DFGA BAGF | EGAB cBAG | FABc dcBA |
[V:2] C,E,F,G, A,G,F,E, | D,F,G,A, B,A,G,F, | E,G,A,B, CB,A,G, | F,A,B,C DCB,A, |
[V:1] GBcd edcB | Acde fedc | Bdef gfed | gedc Bcde |
[V:2] G,B,CD EDCB, | A,CDE FEDC | B,DEF GFED | GEDC B,CDE |
[V:1] fdcB ABcd | ecBA GABc | dBAG FGAB | cAGF EFGA |
[V:2] FDCB, A,B,CD | ECB,A, G,A,B,C | DB,A,G, F,G,A,B, | CA,G,F, E,F,G,A, |
[V:1] BGFE DEFG | AFED CDEF | C8 |]
[V:2] B,G,F,E, D,E,F,G, | A,F,E,D, C,D,E,F, | C,8 |]`;

const CADENCES_ABC = `X:1
M:4/4
L:1/4
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] "C"[CEG]4 | "F"[CFA]4 | "G"[B,DG]4 | "C"[CEG]4 |
[V:2] C,4 | F,,4 | G,,4 | C,4 |
[V:1] "G"[G,B,D]4 | "C"[G,CE]4 | "D"[^F,A,D]4 | "G"[G,B,D]4 |
[V:2] G,,4 | C,4 | D,4 | G,,4 |
[V:1] "F"[A,CF]4 | "Bb"[_B,DF]4 | "C"[G,CE]4 | "F"[A,CF]4 |
[V:2] F,,4 | _B,,4 | C,4 | F,,4 |]`;

const ARPEGGIOS_ABC = `X:1
M:4/4
L:1/4
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] C E G c | G E C2 | G B d g | d B G2 |
[V:2] C, E, G, C | G, E, C,2 | G,, B,, D, G, | D, B,, G,,2 |
[V:1] F A c f | c A F2 | A c e a | e c A2 |
[V:2] F,, A,, C, F, | C, A,, F,,2 | A,, C, E, A, | E, C, A,,2 |
[V:1] E G B e | B G E2 | D F A d | A F D2 |]
[V:2] E,, G,, B,, E, | B,, G,, E,,2 | D, F, A, D | A, F, D,2 |]`;

export default {
  ...PIECES,
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
  "pno-improv": {
    summary: "Improvise a right-hand melody over one of the Pop track's progressions, leaving space.",
    shape: null, prescribe: "Loop a Pop-track progression (e.g. I–V–vi–IV in C) · improvise RH melody · leave space", bpm: 90,
    steps: [
      "Loop a progression from the Pop from chords track — I–V–vi–IV in C is a good one to start with — with your left hand or a backing track.",
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
  "pno-song": {
    summary: "Any song you know the chords to, written out in the pattern you pick.",
    song: true,
    steps: [
      "Type the chords bar by bar, split by | — two chords in a 4/4 bar split it in half.",
      "Pick a pattern from the Pop track you've already learned.",
      "Wait mode first, then play-along; the tempo climbs as you play it clean.",
    ],
    watch: ["Chord symbols it knows: C, Cm, C7, Cmaj7, Cm7, Csus2, Csus4, Cdim, and a slash bass like C/E."],
  },

  "trk-pno-1": {
    summary: "Five-finger patterns in C position, then G — each hand written out on its own. Four sections: RH in C (1–4), LH in C (5–8), RH in G (9–12), LH in G (13–16).",
    steps: [
      "Section 1, right hand: C-D-E-F-G with fingers 1-2-3-4-5 and back, even tone. Wait mode first.",
      "Section 2, left hand: C-D-E-F-G an octave lower, fingers 5-4-3-2-1 — the numbers run backwards.",
      "Sections 3–4 repeat the same shape a fifth higher, in G.",
      "Once a section reads clean in wait mode, switch to play-along with the click; the tempo climbs toward 100 as you play it clean.",
    ],
    watch: ["No note louder than the others — listen for the weak fingers.", "Forearms level with the keys, elbows just in front of the body, fingers curved, shoulders loose."],
    score: {
      bpm: 72, target: 100,
      sections: [{ name: "RH in C", from: 1, to: 4 }, { name: "LH in C", from: 5, to: 8 }, { name: "RH in G", from: 9, to: 12 }, { name: "LH in G", from: 13, to: 16 }],
      abc: FIVE_FINGER_ABC,
    },
  },
  "trk-pno-2": {
    summary: "Contrary motion: both thumbs on middle C, hands stepping outward and back together. Two sections: A (1–4) and B (5–8).",
    steps: [
      "Section A, hands together in wait mode: step outward from middle C one note at a time, mirror-image.",
      "Section B: back to middle C together, then a short turn away and back once more.",
      "Because the fingering mirrors, your brain only tracks one shape — use that.",
      "Play-along with the click once both sections read clean, slow and symmetrical.",
    ],
    watch: ["Keep both hands exactly in sync; if one lags, slow down."],
    score: {
      bpm: 60, target: 96,
      sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 8 }],
      abc: CONTRARY_ABC,
    },
  },
  "trk-pno-3": {
    summary: "One-octave major scales hands together, watching the thumb-under — C and G first, then F and back to C. Two sections: C and G (1–4), F and C (5–8).",
    steps: [
      "Right hand up: 1-2-3, thumb under to F (1), then 2-3-4-5. Left hand up: 5-4-3-2-1, then 3 crosses over the thumb onto A, 2-1 to finish.",
      "Section 1 (bars 1–4): C major, then G major — G's F is sharp, written in as an accidental.",
      "Section 2 (bars 5–8): F major, then back to C — F's B is flat.",
      "Hands together, the right thumb goes under at F while the left 3 crosses at A — slow that bar down. One note per click, even and unhurried.",
    ],
    watch: ["The thumb-under is where it gets bumpy — practice just that move."],
    score: {
      bpm: 56, target: 88,
      sections: [{ name: "C and G", from: 1, to: 4 }, { name: "F and C", from: 5, to: 8 }],
      abc: SCALES_ABC,
    },
    snippet: SCALE_SNIPPET,
  },
  "pop-four-chords": {
    summary: "I–V–vi–IV in C — C, G, Am, F — as block chords: the left hand plays each root, the right hand the whole chord.",
    steps: [
      "Right hand alone, wait mode: find each chord shape — C-E-G, G-B-D, A-C-E, F-A-C, all in root position.",
      "Left hand alone: the roots C, G, A, F, low and held for the whole bar.",
      "Both hands in wait mode, then play-along with the click. Change on the downbeat, not a moment after.",
      "Songs built on this loop: \"Let It Be\", \"Don't Stop Believin'\", \"Someone Like You\". Try one from memory over it.",
    ],
    watch: ["The G shape sits lower than the C — let the hand drop without looking."],
    chart: {
      key: "C", meter: "4/4", chords: "C | G | Am | F | C | G | Am | F", pattern: "block",
      bpm: 56, target: 84,
      sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 8 }],
    },
  },
  "pop-voice-leading": {
    summary: "The same I–V–vi–IV progression, voice-led: each chord holds the notes it shares with the last and moves only what has to change.",
    steps: [
      "Play C, then find G without jumping — G is the common tone, held on top; C and E each step down, to B and D.",
      "G to Am shares no common tone — all three voices simply step up together. Am to F holds C and A; only the middle voice steps up, to F.",
      "Hands together in wait mode, then with the click. Watch the right hand — in a close voicing, it barely travels between chords.",
      "Compare it to the block-chord version: same chords, far less hand motion.",
    ],
    watch: ["A close voicing sounds smoother than root-position jumps — resist the urge to reach far for a familiar shape."],
    chart: {
      key: "C", meter: "4/4", chords: "C | G | Am | F | C | G | Am | F", pattern: "voiceled",
      bpm: 56, target: 88,
      sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 8 }],
    },
  },
  "pop-ballad": {
    summary: "A pop-ballad left hand: root, fifth, octave, fifth in even eighth notes, under the same chords played two ways — I–V–vi–IV, then its vi–IV–I–V twin.",
    steps: [
      "Left hand alone: root-fifth-octave-fifth, even eighth notes, one pattern per chord.",
      "Right hand alone: the voice-led shapes from the last stage.",
      "Hands together, wait mode, then with the click.",
      "The second half swaps the order to vi–IV–I–V — the progression under \"Zombie\" and the verse of \"Despacito\".",
    ],
    watch: ["Keep the eighths perfectly even — a ballad pattern that rushes or drags stands out immediately."],
    chart: {
      key: "C", meter: "4/4", chords: "C | G | Am | F | Am | F | C | G", pattern: "ballad",
      bpm: 52, target: 76,
      sections: [{ name: "I–V–vi–IV", from: 1, to: 4 }, { name: "vi–IV–I–V", from: 5, to: 8 }],
    },
  },
  "pop-pulse": {
    summary: "A rhythmic right-hand pulse under the same four-chord shapes, now in G: hits land on 1, the \"and\" of 2, and 4.",
    steps: [
      "Right hand alone: three hits a bar — beat 1, the & of 2, and beat 4 — with rests in between.",
      "Count \"1 2 & 3 4\" aloud as you play; the hits land on the words \"1\", \"&\", and \"4\".",
      "Left hand holds the root for the whole bar underneath.",
      "Hands together, wait mode, then with the click.",
    ],
    watch: ["The rests are part of the pattern — don't fill them in."],
    chart: {
      key: "G", meter: "4/4", chords: "G | D | Em | C | G | D | Em | C", pattern: "pulse",
      bpm: 60, target: 88,
      sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 8 }],
    },
  },
  "pop-fifties": {
    summary: "The '50s progression — I–vi–IV–V — played as a right-hand arpeggio: low–middle–top–middle through each chord.",
    steps: [
      "Right hand alone: the lowest note of the shape, then the middle, the top, and back to the middle — one pattern per bar.",
      "Left hand holds the root underneath.",
      "Hands together, wait mode, then with the click.",
      "This is the loop under \"Stand By Me\" and the verse of \"Every Breath You Take\".",
    ],
    watch: ["Keep the arpeggio's four notes evenly spaced — don't rush the turnaround back down to the middle."],
    chart: {
      key: "G", meter: "4/4", chords: "G | Em | C | D | G | Em | C | D", pattern: "arpeggio",
      bpm: 52, target: 80,
      sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 8 }],
    },
  },
  "pop-blues": {
    summary: "The 12-bar blues in C: four bars of I, two of IV, two of I, then V–IV–I–V, under a boogie-woogie left hand.",
    steps: [
      "Learn the form first, away from the keyboard: 4 bars of C7, 2 of F7, 2 of C7, then G7-F7-C7-G7.",
      "Left hand: root-fifth-sixth-fifth in even eighths under each chord — the boogie pattern.",
      "Right hand alone: the 7th-chord shells — third, fifth and seventh; the root is in your left hand — then hands together in wait mode.",
      "Straight eighths for now — the shuffle swing feel comes later.",
    ],
    watch: ["This form is under \"Johnny B. Goode\" and \"Hound Dog\" — recognizing it by ear is half the job."],
    chart: {
      key: "C", meter: "4/4", chords: "C7 | C7 | C7 | C7 | F7 | F7 | C7 | C7 | G7 | F7 | C7 | G7", pattern: "boogie",
      bpm: 60, target: 96,
      sections: [{ name: "1–4", from: 1, to: 4 }, { name: "5–8", from: 5, to: 8 }, { name: "9–12", from: 9, to: 12 }],
    },
  },
  "pop-ode-to-joy": {
    summary: "The main theme of Beethoven's \"Ode to Joy\" (1824), public domain, as a lead sheet: the melody in the right hand over a written-out left hand. Three sections: A (1–8), B (9–12), A' (13–16).",
    steps: [
      "Right hand alone, wait mode, section A: find the melody's shape before worrying about time.",
      "Left hand alone: the chart's chords in a ballad pattern underneath.",
      "Hands together in wait mode, then play-along with the click once it's secure.",
      "Section B leans on the dominant before A' repeats the opening — work it the same way, section by section.",
    ],
    watch: ["This is a lead sheet: the melody is written out for you, and the chord symbols above the staff are just the harmony underneath it."],
    chart: {
      key: "C", meter: "4/4", chords: "C | G | C | G | C | G | C | G C | G | C | G | C G | C | G | C | G C", pattern: "ballad",
      melody: ODE_MELODY, bpm: 60, target: 92,
      sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 12 }, { name: "A'", from: 13, to: 16 }],
    },
  },
  "pop-amazing-grace": {
    summary: "The tune known as \"New Britain\" (1829), sung to \"Amazing Grace\", public domain, as a lead sheet in 3/4: the melody in the right hand over a written-out waltz left hand. Two sections: A (1–8), B (9–16).",
    steps: [
      "Right hand alone, wait mode: the pickup note is written into a full first bar, so count the rest before it rather than starting free.",
      "Left hand alone: bar 1 is a one-bar intro before the melody enters, then a waltz pattern under each chord.",
      "Hands together in wait mode, then play-along with the click.",
      "The tie across bars 8–9 holds the note through the barline — don't replay it.",
    ],
    watch: ["The pickup is written into a full bar and the left hand's first bar is an intro — both hands start together even though the melody waits."],
    chart: {
      key: "G", meter: "3/4", chords: "G | G | G | C | G | G | G | D | G | G | G | C | G | G | D | G", pattern: "waltz",
      melody: GRACE_MELODY, bpm: 60, target: 90,
      sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }],
    },
  },
  "tec-hanon-1": {
    summary: "Hanon No. 1: a five-finger pattern that climbs by step, the first half of Hanon No. 1, an octave and a half up and back, hands together the whole way. Two sections: up (1–7) and down (8–15).",
    steps: [
      "Right hand: 1-2-3-4-5-4-3-2, repeating one step higher each bar as it climbs.",
      "Left hand: 5-4-3-2-1-2-3-4, mirroring the right hand's shape below it.",
      "Wait mode first, both hands together — the pattern only shifts by one note each bar, so once bar 1 is secure the rest is repetition.",
      "Play-along with the click once it's clean; the sixteenth notes want to rush — hold the tempo down until they don't.",
    ],
    watch: ["Bar 15 is a single held note — don't rush the landing."],
    score: {
      bpm: 50, target: 80,
      sections: [{ name: "up", from: 1, to: 7 }, { name: "down", from: 8, to: 15 }],
      abc: HANON_ABC,
    },
  },
  "tec-cadences": {
    summary: "Primary chords and cadences: I–IV–V–I as whole-note blocks, once in C, once in G, once in F. Three sections: C (1–4), G (5–8), F (9–12).",
    steps: [
      "Each section is the same four-chord move — I, IV, V, I — in a new key. Find the chord shape before you worry about the click.",
      "Hands together, wait mode: right hand plays the chord, left hand holds the root below it.",
      "Learn C first, then carry the same shape-and-motion to G, then F — the fingers change, the pattern doesn't.",
      "Play-along with the click once a section is secure; hold each chord the full bar.",
    ],
    watch: ["G's cadence needs a sharp (the V chord's third) and F's needs a flat (the IV chord) — the accidental is written in, not implied by a key change."],
    score: {
      bpm: 60, target: 90,
      sections: [{ name: "C", from: 1, to: 4 }, { name: "G", from: 5, to: 8 }, { name: "F", from: 9, to: 12 }],
      abc: CADENCES_ABC,
    },
  },
  "tec-arpeggios": {
    summary: "One-octave arpeggios, root position: three major keys (C, G, F) then three minor (Am, Em, Dm), each up and back down. Two sections: major (1–6) and minor (7–12).",
    steps: [
      "Right hand: 1-2-3-5 up through the triad and octave, then back down. Wait mode first.",
      "Left hand: 5-3-2-1, the same shape from the other end.",
      "The major section moves C, G, F; the minor section moves A minor, E minor, D minor — same motion, new starting note each time.",
      "Hands together, then play-along with the click once a key is secure.",
    ],
    watch: ["The stretch between fingers 3 and 5 is the hard part — keep the hand relaxed, don't force the reach."],
    score: {
      bpm: 56, target: 96,
      sections: [{ name: "major", from: 1, to: 6 }, { name: "minor", from: 7, to: 12 }],
      abc: ARPEGGIOS_ABC,
    },
  },
};

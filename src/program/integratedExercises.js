// Three small preparations fill gaps in the existing music. They do not form
// another course: each is assigned immediately before its named application.
const source = {
  label: "Original Woodshed preparation for the existing course music",
  scope: "A short teaching setting isolates the actual register, hand movement or harmony needed by the named lesson. The destination scores and their source disclosures remain unchanged.",
};
const grand = (title, key, right, left) => `X:1\nT:${title}\nM:4/4\nL:1/4\nK:${key}\n%%staves {1 2}\nV:1 clef=treble\nV:2 clef=bass\n[V:1] ${right.join(" | ")} |]\n[V:2] ${left.join(" | ")} |]`;
const base = (value) => ({ section: "guided", minutes: 5, bpm: 40, targetBpm: 60, source, ...value });

export const INTEGRATED_EXERCISES = [
  base({
    id: "d-canon-minor-lh-prep", unitId: "d-major-foundations-5", key: "D major", section: "chords", hands: "L",
    title: "Canon bars 3–4: travel from the minor bass to its chord",
    summary: "Prepare the exact B-minor and F-sharp-minor LH placements before adding the Canon arrangement's melody.",
    abc: grand("Canon minor bass-and-chord placements", "D", ["z4", "z4", "z4", "z4"], [
      '"Bm"B,, [D,F,B,] B,, [D,F,B,]', '"Bm"B,, [D,F,B,] B,, [D,F,B,]',
      '"F#m"F,, [A,,C,F,] F,, [A,,C,F,]', '"F#m"F,, [A,,C,F,] F,, [A,,C,F,]',
    ]),
    fingering: "LH B2 bass uses 5; release and move to D3–F#3–B3 with 5–3–1. For F#m, F#2 bass uses 5; release and move to A2–C#3–F#3 with 5–3–1. These are two separate hand placements, not a held octave span. The RH rests throughout this preparation.",
    steps: [
      "Find the actual two bass roots, B2 and F#2. Spell Bm as B–D–F# and F#m as F#–A–C#, then find the written upper chord in each register.",
      "Play the bass on beat 1, release, then carry the hand to its upper chord on beat 2. Add beats 3–4 only while that released move remains comfortable; do not hold the low root while reaching up.",
      "Practise one Bm bar, then one F#m bar. The second written bar of each shape is another visit to the same movement; keep every attack one quarter-note beat apart.",
      "Go directly to bars 3–4 of the existing Canon bass-and-chord arrangement. Keep this LH movement while the RH plays F#4–B4, then A4–F#4. Retain the held-harmony version if the new motion disrupts its melody.",
    ],
    listenFor: ["Bass and chord each have one counted beat; the hand move does not add time.", "The F# remains part of both minor chords while their other tones and bass roots change."],
    checks: ["I can locate B2/D3–F#3–B3 and F#2/A2–C#3–F#3 without holding an uncomfortable span.", "I can carry one prepared LH bar into Canon bars 3–4 and name the movement still needing repair."],
    skillIds: ["canon-minor-harmony", "bass-chord-travel", "released-movement"],
    knowledgeIds: ["canon-minor-travel"],
    musicConnections: [{ exerciseId: "d-canon-bass-chords", fromBar: 3, toBar: 4, reason: "These are the arrangement's actual LH bass-and-chord placements." }],
  }),
  base({
    id: "a6-mozart-key-shape", unitId: "a-major-foundations-6", key: "A major", section: "scales", hands: "R",
    title: "Mozart's opening uses five notes without a thumb crossing",
    summary: "Find A4–E5 with fingers 1–5; this stationary shape supports the actual K.331 melody more directly than a full-octave scale.",
    abc: grand("Five-note A-major shape for Mozart", "A", ["A B c d", "e2 c2", "B c d2", "c B A2"], ["z4", "z4", "z4", "z4"]),
    fingering: "RH A4–B4–C#5–D5–E5 uses 1–2–3–4–5 throughout. In bar 2 E5–C#5 uses 5–3; bar 3 B4–C#5–D5 uses 2–3–4; bar 4 C#5–B4–A4 uses 3–2–1. There is no scale crossing in this shape or in the assigned Mozart melody.",
    steps: [
      "Locate A4 and E5, then name the five notes between them. C#5 comes from the key signature; the finger 4 on D5 belongs to this fixed musical position.",
      "Play the written quarter-note shape at a comfortable pulse, keeping the thumb on A4 and the little finger over E5. Count each half note for two beats.",
      "Select C#5–D5–C#5–E5 with fingers 3–4–3–5. Keep those fingers while tapping the dotted rhythm already prepared in the rhythm lesson; this pitch map is not a replacement for that rhythm.",
      "Open the existing Mozart melody, bars 1–2, and use this same hand position. Its later bars also stay within A4–E5. The full A-major scale has a different crossing fingering and remains a separate reference task.",
    ],
    listenFor: ["The hand stays comfortable across its five-note position.", "Finding D5 or E5 does not make the dotted gesture hurry."],
    checks: ["I can locate the actual Mozart register and name C#5 without the model.", "I can use 3–4–3–5 for the opening pitch gesture without inserting a scale-style thumb crossing."],
    skillIds: ["a-major-five-note-shape", "mozart-preparation", "register"],
    knowledgeIds: ["mozart-opening-position"],
    musicConnections: [{ exerciseId: "a6-mozart-melody", fromBar: 1, toBar: 2, reason: "The first two melody bars use this A4–E5 position and these actual fingers." }],
  }),
  base({
    id: "e7-blues-sevenths", unitId: "e-major-foundations-7", key: "E major", section: "chords", hands: "both",
    title: "Switchyard uses E7 and A7 as well as B7",
    summary: "Hear the actual seventh-chord tones in the twelve-bar blues, separately from its natural-G blues colour and the quiet Grieg phrase.",
    abc: grand("Seventh-chord tones for Switchyard", "E", ['"E7"E G B =d', '"A7"A c e =G', '"B7"F A d B', '"E7"G B =d E'], ["E,,4", "A,,4", "B,,4", "E,,4"]),
    fingering: "RH bar 1 E4–G#4–B4–D5 uses 1–2–3–5. Bar 2 A4–C#5–E5 uses 1–3–5, then release and move down to G4 with 1. Bar 3 F#4–A4–D#5–B4 uses 1–2–5–3. Bar 4 G#4–B4–D5–E4 uses 2–3–5–1 after released travel. LH holds E2/A2/B2/E2 roots with a comfortable finger; no wide RH chord has to be held.",
    steps: [
      "Spell E7 as E–G#–B–D, A7 as A–C#–E–G, and B7 as B–D#–F#–A. The written RH line and LH root together sound each harmony's actual tones.",
      "Play the RH a bar at a time before adding the held root. Release and move for the downward G4 in the A7 bar; the line is not a requirement to stretch and hold all four tones.",
      "Compare E7's G# with the G natural in the earlier blue-colour lesson. A blues melody may use the lowered third over E7; follow the actual natural and sharp signs rather than making every G the same.",
      "Apply bars 1, 2 and 3 of this preparation to Switchyard's E7 call (bars 1–4), A7 answer (bars 5–6), and B7 turn (bar 9). Keep the piece's written rhythm, bass fifths and exact register; this chord-tone line is only its harmonic preparation.",
    ],
    listenFor: ["D natural belongs to E7, G natural to A7, and D# to B7.", "The chord-tone line and its held root keep an even quarter-note pulse while the RH travels."],
    checks: ["I can identify the actual seventh of E7, A7 and B7 in the written notes.", "I can find one of those tones in its Switchyard passage without replacing the melody by the preparation exercise."],
    skillIds: ["dominant-sevenths", "blues-harmony", "released-movement"],
    knowledgeIds: ["switchyard-sevenths", "switchyard-tone-listening"],
    musicConnections: [{ exerciseId: "e7-switchyard-blues", fromBar: 1, toBar: 12, reason: "The chorus uses E7, A7 and B7 rather than only major triads." }],
  }),
];

// Minuet in B flat, BWV Anh. 118, from the Anna Magdalena Bach notebook (1725), in the Mutopia edition of the
// Bach-Gesellschaft text (public domain). Each half is played once, going straight to its second ending, so the
// score has 24 bars against the edition's 26: bar 8 here is printed bar 9, and bars 9–24 are printed 10–24 and 26.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Minuet in B flat
C:Anonymous (Anna Magdalena Bach notebook)
M:3/4
L:1/16
K:Bb
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] B4 B4 F3G | {F}E8 D4 | C4 c6 de | {B}A8 B4 |
[V:2] B,,2C,2 D,2C,2 D,2B,,2 | C,2B,,2 C,2F,,2 B,,4 | E,,2G,2 F,2E,2 D,2C,2 | F,2C,2 E,2D,2 C,2B,,2 |
[V:1] c4 F4 e4 | d2c2 B2A2 B4 | efg2 f2e2 d2e2 | c12 ||
[V:2] A,,2C,2 B,,2A,,2 G,,2F,,2 | B,,4 C,4 D,4 | G,,4 A,,4 B,,4 | F,,4 A,,4 C,4 ||
[V:1] A4 A3B !trill!B3A/B/ | c4 B2A2 G2F2 | B4 A2G2 A2F2 | G2F2 =E2D2 E2C2 |
[V:2] F,2E,2 D,2C,2 D,2B,,2 | F,2F,,2 G,,2A,,2 B,,2C,2 | D,4 =E,4 F,4 | C,4 C4 B,4 |
[V:1] C2D2 =E2F2 G2A2 | B4 =e4 ef g2 | c4 B2A2 G2A2 | F12 |
[V:2] A,4 G,4 F,4 | =E,2D,2 C,2B,,2 A,,2G,,2 | A,,4 B,,4 C,4 | F,,2C,2 F,2D,2 E,2C,2 |
[V:1] F4 B4 Bc d2 | F4 c4 cd e2 | d2f2 e2d2 c2B2 | A4 G2A2 F4 |
[V:2] D,2F,2 E,2D,2 C,2B,,2 | A,,2C,2 B,,2A,,2 G,,2F,,2 | B,,4 G,,4 E,,4 | F,,2F,2 E,2D,2 E,2C,2 |
[V:1] B4 B4 A4 | G4 F2E2 D4 | e4 d4 c4 | B12 |]
[V:2] D,2C,2 D,2B,,2 C,2D,2 | E,2F,2 G,2A,2 B,2A,2 | G,4 E,4 F,4 | B,,12 |]`;

export default {
  summary: "Minuet in B flat major, BWV Anh. 118, from the 1725 notebook of Anna Magdalena Bach, 24 bars in 3/4. The right hand has the tune; the left hand answers in a steady line of eighths and quarters. Two halves: A (bars 1–8) ends in F, B (bars 9–24) passes through F major and comes home. Six sections: A1 (bars 1–4), A2 (5–8), B1 (9–12), B2 (13–16), B3 (17–20) and B4 (21–24). The original repeats each half with first and second endings; here you play each half once and go straight to the second ending, so bar 8 is printed bar 9 and the last bar is printed bar 26.",
  steps: [
    "Right hand alone in A1, in wait mode. Bar 1 ends with a dotted eighth and a sixteenth, F and G; bar 3 holds C for a beat and a half before the quick D and E flat. Count sixteenths through those beats.",
    "Left hand alone in A1 and A2. It moves in eighths in bars 1–5, often in steps, then slows to quarters in bars 6–8. Keep the eighths even and play the quarters full length.",
    "Hands together in B1 and B2. Bars 11–14 have E natural: the left hand in bars 11 and 14, the right hand in bars 12–14. In bar 13 the right hand climbs C–D–E–F–G–A while the left hand comes down in quarters.",
    "Play-along with the click at 60. Each clean pass nudges the tempo up toward 96.",
  ],
  watch: [
    "B flat and E flat are in the key signature. E natural is written in bars 11–14, where the music passes through F major; the left hand has E flat again in bar 16.",
    "Two grace notes, before bars 2 and 4, and a trill in bar 9 are shown but not graded. Play the main notes first and add them once the notes are secure.",
  ],
  source: { label: "Mutopia Project — Bach, Minuet in B-flat, BWV Anh. 118 (Bach-Gesellschaft Ausgabe, Band 43, 1894)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1014" },
  score: {
    bpm: 60, target: 96,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "B1", from: 9, to: 12 }, { name: "B2", from: 13, to: 16 }, { name: "B3", from: 17, to: 20 }, { name: "B4", from: 21, to: 24 }],
    abc: ABC,
  },
};

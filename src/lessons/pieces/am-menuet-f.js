// Menuet in F, BWV Anh. 113, from the Anna Magdalena Bach notebook (1725), in the Mutopia edition of the
// Bach-Gesellschaft text (public domain), 32 bars. Each half is played once, as the reference MIDI plays it.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Menuet in F
C:Anonymous (Anna Magdalena Bach notebook)
M:3/4
L:1/8
K:F
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] c2 d/e/f e2 | (3fed c4 | (3d_ed (3cdc (3BcB | {B}A4 G2 |
[V:2] F,2 A,2 G,2 | A,2 F,G, A,F, | B,2 C2 C,2 | F,2 C,D, E,C, |
[V:1] AcFc Gc | AcBc Gc | AcFc Gc | AcBc Gc |
[V:2] F,2 A,,2 G,,2 | F,,2 G,,2 E,,2 | F,,2 A,,2 G,,2 | F,,2 G,,2 E,,2 |
[V:1] Acde fd | c=BAG c/d/c/=B/ | cf e2 Td/c/d | c6 ||
[V:2] F,,2 F,2 D,2 | G,2 E,2 A,2 | F,2 G,2 G,,2 | C,6 ||
[V:1] g2 fe fd | eg b2 z2 | a2 gf ed | {d}^c6 |
[V:2] C,2 G,2 G,,2 | C,2 E,D, E,C, | F,2 B,2 G,2 | A,2 E,2 ^C,2 |
[V:1] ^cde ^cde | A2 A2 A2 | ^cde ^cde | G2 G2 G2 |
[V:2] A,,2 A,2 E,2 | ^C,D,E, ^C,D,E, | A,,2 A,,2 A,,2 | ^C,D,E, ^C,D,E, |
[V:1] ^cde ^cde | Adc BAG | F2 G2 E2 | D6 |
[V:2] G,,2 G,,2 G,,2 | F,,2 F,2 G,2 | A,4 A,,2 | D,D CB, A,G, |
[V:1] cfef _ef | afdf cf | dg^fg =fg | bgeg cB |
[V:2] A,4 G,2 | F,2 B,2 A,2 | B,4 A,2 | G,2 C2 E,2 |
[V:1] Afga gf | Bgab ag | cc'ba ga | {g}f6 |]
[V:2] F,2 z4 | G,2 z4 | A,2 B,2 C2 | F,6 |]`;

export default {
  summary: "Menuet in F major, BWV Anh. 113, a minuet from the 1725 notebook of Anna Magdalena Bach, all 32 bars in 3/4. Two halves: A (bars 1–12) begins in F and closes in C; B (bars 13–32) moves to D minor and comes home. Five sections: A1 (bars 1–4), A2 (5–12), B1 (13–16), B2 (17–24) and B3 (25–32). The original repeats each half; here you play each half once.",
  steps: [
    "Right hand alone in A1, in wait mode. Bar 1 has two sixteenths, bars 2 and 3 have triplets: three even eighths to a beat, nine notes in bar 3. Keep the three notes of each triplet even, not dotted.",
    "Right hand in A2. Bars 5–8 are broken chords that keep coming back to C: the top C stays put while the lower note moves (A, F, G in bars 5 and 7; A, B flat, G in bars 6 and 8). Keep the C light and let the moving note lead.",
    "Left hand alone in B2. Bars 18 and 20 take over the right hand's C sharp–D–E figure, while the right hand holds A or G in quarters. Practise those bars hands together slowly until the handover is even.",
    "Play-along with the click at 66. Each clean pass nudges the tempo up toward 104.",
  ],
  watch: [
    "B flat is in the key signature. In bar 3 the E is flat, in bar 10 the Bs are natural, and from bar 16 to bar 21 every C is C sharp; bar 22 goes back to C natural. In bar 27 F sharp is followed by F natural in the same bar.",
    "Three grace notes (before bars 4, 16 and 32) and a trill in bar 11 are shown but not graded; play the main notes first and add them once the notes are secure.",
  ],
  source: { label: "Mutopia Project — Bach, Menuet in F, BWV Anh. 113 (Bach-Gesellschaft)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=74" },
  score: {
    bpm: 66, target: 104,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 12 }, { name: "B1", from: 13, to: 16 }, { name: "B2", from: 17, to: 24 }, { name: "B3", from: 25, to: 32 }],
    abc: ABC,
  },
};

// Polonaise in F, BWV Anh. 117a, from the Anna Magdalena Bach notebook (1725), in the Mutopia edition of the
// Bach-Gesellschaft text (public domain), 16 bars. Each half is played once, as the reference MIDI plays it.
// The right hand's held F under bar 3 is folded into chords; the left hand's held notes are a third voice.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Polonaise in F
C:Anonymous (Anna Magdalena Bach notebook)
M:3/4
L:1/16
K:F
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] !mordent!f2 fg {g}a2 ga bagf | !mordent!g2 ga {g}f2 ed !mordent!e2 c2 | {B}[FA]4 [Fd]4 [Fc]4 | B2 !mordent!cd {c}B2 AG !mordent!A2 F2 |
[V:2] A,2 B,2 C4 C4 | C4 =B,4 C4 | D,_E,D,C, B,,2 B,2 A,2 A,,2 | G,,2 F,2 E,2 C,2 F,C,B,,C, |
[V:3] F,4 F,4 F,4 | E,4 D,4 C,4 | x12 | x12 |
[V:1] A2 !mordent!Bc d2 de {d}c4 | {c}B2 !pralltriller!cd {c}B2 AG A2 F2 | f2 fe d2 c2 B2 A2 | GBAG {G}F8 ||
[V:2] F,4 F,4 F,4 | F,4 G,4 F,E,F,G, | A,2 F,2 B,2 C2 D2 B,2 | C2 C,2 F,2 C,A,, F,,4 ||
[V:3] F,,4 B,,4 A,,4 | D,4 E,4 x4 | x12 | x12 ||
[V:1] !mordent!a2 ag {g}a2 ga bagf | !mordent!g2 gf {f}g2 fg agfe | a2 ag f2 e2 d2 c2 | =Bcd=B !mordent!c4 !trill!_B4 |
[V:2] C4 C4 C4 | C4 C4 C4 | C4 C4 A,4 | G,2 G,,2 C,2 C,,2 D,,2 E,,2 |
[V:3] F,4 F,4 F,4 | E,4 [C,E,G,]4 E,4 | F,4 A,4 F,4 | x12 |
[V:1] A2 c2 !pralltriller!c2 Bc {c}d4 | G2 B2 !pralltriller!B2 AB {B}c4 | f2 fe d2 c2 B2 A2 | GBAG {G}F8 |]
[V:2] F,,2 F,G, A,2 F,2 B,2 B,,2 | C,2 D,2 C,2 B,,2 A,,2 G,,2 | A,,2 F,,2 B,,2 C,2 D,2 B,,2 | C,2 C,,2 F,,2 A,,C, F,4 |]
[V:3] x12 | x12 | x12 | x12 |]`;

export default {
  summary: "Polonaise in F major, BWV Anh. 117a, from the 1725 notebook of Anna Magdalena Bach, all 16 bars in 3/4. A polonaise is a slow, stately dance in three, often with a sixteenth-note figure on the first beat. Two halves of eight bars, each in two sections: A1 (bars 1–4), A2 (5–8), B1 (9–12) and B2 (13–16). The original repeats each half; here you play each half once.",
  steps: [
    "Right hand alone in A1, in wait mode, without the ornaments. Bars 1 and 2 are an eighth followed by sixteenths: count four sixteenths to every beat and place each one on its count.",
    "Left hand alone, A1 and B1. In bars 1, 2, 5, 6 and 9–11 the left hand plays two notes at once, one of them often held while the other moves; in bars 3, 4 and 12 it is a single line of eighths and sixteenths with wide leaps, such as B flat to B flat in bar 3.",
    "Hands together, a section at a time. In bar 3 the right hand strikes F again under each of A, D and C: three two-note chords, the thumb repeating the F.",
    "Play-along with the click at 50. Each clean pass nudges the tempo up toward 80. Add the mordents and grace notes last.",
  ],
  watch: [
    "B flat is in the key signature. In bar 12 the right hand has B natural twice, then B flat on beat 3; in bar 3 the left hand has E flat.",
    "Thirteen grace notes and the mordents and trills are shown but not graded. Play the main notes on the beat first, then add each grace note just before its main note.",
  ],
  source: { label: "Mutopia Project — Bach, Polonaise in F, BWV Anh. 117a (Bach-Gesellschaft Ausgabe, Band 43, 1894)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1013" },
  score: {
    bpm: 50, target: 80,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "B1", from: 9, to: 12 }, { name: "B2", from: 13, to: 16 }],
    abc: ABC,
  },
};

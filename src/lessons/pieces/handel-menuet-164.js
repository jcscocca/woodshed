// Handel, Menuet II (Trio) in F minor from the Aylesford Pieces, from the Mutopia edition of the Schott 1930
// print. The repeat of the first half is written out, and the right hand's two voices share one staff; the
// left hand keeps its two voices where the edition has them.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Menuet II (Trio)
C:George Frideric Handel
M:3/4
L:1/8
K:Fm
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] A2c2a2 | g2c2f2 | [DF]2[CF]2[B,G]2 | [A,C]2F2[G,=E]2 |
[V:2] C4C2 | C4A,2 | B,2A,2G,2 | F,2F,,2C,2 |
[V:3] F,2A,2F,2 | =E,2C,2F,2 | x6 | x6 |
[V:1] [CF]2A2c2 | [DF]2[B,B]2[CA]2 | [Ac]2[Fd]c[GB][FA] | [=EG]6 |
[V:2] A,,2F,,2A,,2 | B,,2D,2F,2 | F,,2A,,2B,,2 | C,2=E,2C,2 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] A2c2a2 | g2c2f2 | [DF]2[CF]2[B,G]2 | [A,C]2F2[G,=E]2 |
[V:2] C4C2 | C4A,2 | B,2A,2G,2 | F,2F,,2C,2 |
[V:3] F,2A,2F,2 | =E,2C,2F,2 | x6 | x6 |
[V:1] [CF]2A2c2 | [DF]2[B,B]2[CA]2 | [Ac]2[Fd]c[GB][FA] | [=EG]6 |
[V:2] A,,2F,,2A,,2 | B,,2D,2F,2 | F,,2A,,2B,,2 | C,2=E,2C,2 |
[V:3] x6 | x6 | x6 | x6 |
[V:1] F2c2=A2 | F2=A2[DB]2 | [_Ge]2[=Gd]2[=Ac]G | [Ff]2ed[Ec]B |
[V:2] C4C2 | D2C2B,2 | C2B,2=A,2 | B,4B,2 |
[V:3] =A,2F,2F,2 | B,2F,2_G,2 | E,2=E,2F,2 | D,2B,,2G,2 |
[V:1] e2E2[Ed]2 | [Ec]3B[CA]2 | [DG]2[CA]2[B,B]2 | [C=E]6 |
[V:2] C2A,2F,G, | A,4A,2 | B,,2C,2D,2 | C,2C2B,2 |
[V:3] A,2C,2E,2 | A,,2E,2F,2 | x6 | x6 |
[V:1] [Fc]2def2 | FG=ABcd | [_Ge]d[=Gd]c[=Ac]G | [Ff]2ed[Fc]B |
[V:2] C4C2 | D2C2B,2 | C2B,2=A,2 | B,4D2 |
[V:3] =A,2F,2=A,2 | B,2F,2_G,2 | E,2=E,2F,2 | D,2B,,2B,2 |
[V:1] [Gg]2[Ac]2[Aa]3/2B/2 | [cg]2[GB]2[FA]2 | [DB]A[CA]2[C=EG]3/2F/2 | [A,CF]6 |]
[V:2] C4C2 | =E,2C4 | G,2F,2[C,,C,]2 | [F,,,F,,]6 |]
[V:3] =E,2F,2F,2 | C,2=E,2F,2 | B,,2C,2x2 | x6 |]`;

export default {
  summary: "Menuet II, the trio in F minor that follows Menuet I in Handel's Aylesford Pieces, all 32 bars in 3/4. Both hands move in quarter notes, often in two voices each. Four sections: A (bars 1–8), A again (9–16), B1 (17–24) and B2 (25–32). The original repeats the first half, written out here; B2 varies B1's opening in both hands, with the right hand filled in with eighths, and closes in F minor.",
  steps: [
    "Right hand alone in A, in wait mode. Bars 1–2 are a single line that leaps up; from bar 3 the hand plays two voices, so read each pair of notes as one shape.",
    "Left hand alone. In bars 1–2 it holds a C on top while the lower voice moves underneath; from bar 3 it is one line. In B the two voices return, often moving together in quarters.",
    "Hands together in B1, a bar at a time. Bars 19 and 27 have the most accidentals: G flat then G natural in the right hand, E natural in the left, and A natural in both.",
    "Play-along with the click at 66. Each clean pass nudges the tempo up toward 100.",
  ],
  watch: [
    "F minor has four flats: B, E, A and D. A natural and E natural come back often, as in bars 4, 8 and 17.",
    "In bar 26 the right hand runs up in eighths from F to D flat, through A natural; keep them even. The two voices return in bar 27.",
  ],
  source: { label: "Mutopia Project — Handel, Menuet II (Trio) (Aylesford Pieces, Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=164" },
  score: {
    bpm: 66, target: 100,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "A again", from: 9, to: 16 }, { name: "B1", from: 17, to: 24 }, { name: "B2", from: 25, to: 32 }],
    abc: ABC,
  },
};

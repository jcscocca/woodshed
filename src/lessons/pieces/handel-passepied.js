// Handel, Passepied (et Menuet), from the Aylesford Pieces, Mutopia edition of the Schott 1930 print
// (public domain). The original is in 3/8 with an eighth-note pickup; here pairs of 3/8 bars make one
// 3/4 bar, the pickup sits at the end of a padded first bar, and each half is played once.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Passepied (et Menuet)
C:George Frideric Handel
M:3/4
L:1/16
K:A
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z8 z2 e2 | dcBA [Af]2 [Ae]4 [Gd]2 | [A-c]2 [AB]A [FB]2 E4 [EA]2 | [D-G][D-A][D-B][DG] [EA]2 [E-B][E-c][E-d][EB] [Ec]2 |
[V:2] z8 z2 [G,E]2 | [A,E]4 D2 C2 B,A, B,2 | A,4 D,2 [E,G,-]2 [D,G,-]2 [C,G,]2 | B,,4 C,2 G,,4 A,,2 |
[V:1] [A-f]2 [Ae]2 (5:4:5[F-^d]/2[F-e]/2[F-^d]/2[F-c]/2[F^d]/2 [Ge]4 B2 | AGFE e2 [Ad]4 [Be]2 | [E-c]2 [E-B][EA] [Ec]2 [GB]4 [^Ac]2 | [B-d][B-e][B-f][Bd] [Ae]2 [A-f][A-g][A-a][Af] [dg]2 |
[V:2] F,,4 B,,2 E,4 [^D,B,]2 | [E,B,]4 [A,C]2 F,2 E,D, G,2 | A,4 A,,2 E,2 D,2 C,2 | B,,4 C,2 D,4 B,,2 |
[V:1] [ea]2 [Ac]2 [GB]2 [CA]4 z2 |]
[V:2] C,2 D,2 E,2 A,,4 z2 |]`;

export default {
  summary: "Handel's Passepied (et Menuet) in A major, from the Aylesford Pieces, in 9 bars of 3/4. The original is in 3/8, two halves of eight short bars; here each pair of 3/8 bars is one 3/4 bar, so every bar holds two of the original's. Bar 1 holds only the opening pickup E. Two sections: A (bars 1–5), which ends on E with the pickup B into the second half, and B (6–9), which ends on A. The original repeats each half; here you play each half once.",
  steps: [
    "Right hand alone in A, in wait mode. Most beats pair a moving top line with a held lower note a third or sixth below; strike both together, then keep the top line moving while the lower note holds.",
    "Then the left hand alone. It is a plain bass line in eighths and quarters; in the second half of bar 3 the G sharp is held above E, D and C sharp, so press it once and keep it down.",
    "Hands together in B, a half-bar at a time. Bar 8 has rising groups separated by drops of a third, and its high A returns at the start of bar 9; play bar 9's three eighths evenly before the last chord.",
    "Play-along with the click at 50. Each clean pass nudges the tempo up toward 80.",
  ],
  watch: [
    "Bar 5 has a quick turn of five notes on D sharp, E, D sharp, C sharp, D sharp in the space of one eighth, on the way to the cadence on E. Learn it slowly as an even group, then fit it into the beat.",
    "Bar 7 has an A sharp under the C sharp on its last eighth; the next bar is back to A natural.",
  ],
  source: { label: "Mutopia Project — Handel, Passepied (et Menuet) (Aylesford Pieces, Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=167" },
  score: {
    bpm: 50, target: 80,
    sections: [{ name: "A", from: 1, to: 5 }, { name: "B", from: 6, to: 9 }],
    abc: ABC,
  },
};

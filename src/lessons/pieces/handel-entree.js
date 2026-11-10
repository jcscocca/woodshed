// Handel, Entrée, from the Aylesford Pieces, from the Mutopia edition of the Schott 1930 print (public domain),
// 20 bars. The eighth-note pickup is written into a full first bar, so every bar number here is one more than the
// printed one. The left hand stays in the bass clef where the edition moves it to the treble (bars 15–16).
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Entrée
C:George Frideric Handel
M:4/4
L:1/16
K:Gm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z8 z4 z2d2 | B2G2 d2[Bg]2 [A^f]2=e2 dgfg | edcB [^F-A][F-d][F-c][Fd] B2G2 [Bd]2[Ad]2 | [G-d]2[G-c][GB] [df]2[cf]2 [B-f]2[B-e][Bd] b3a |
[V:2] z16 | G,2A,2 B,2C2 D2C2 B,2G,2 | C2A,2 D2D,2 G,4 G,2A,2 | B,4 B,2C2 D6D2 |
[V:1] gagf edcB AFGA Bcde | f2[Bg]2 [Bd]2[Ac]B B3c d2[Be]2 | c2[Ad]2 [G-B]3[GA] [^FA]4 [G-d]2[G-=e][Gf] | [G=e]2[d-^f][dg] [cf]2[Bg]2 [dfa]6a2 |
[V:2] E3D C2E,2 F,6E,2 | D,2E,2 F,2F,,2 B,,F,G,A, B,2G,2 | A,2^F,2 G,2C,2 D,2C,2 B,,2G,,2 | C,2B,,2 A,,2G,,2 D,6z2 |
[V:1] ^f2=ed g2g2 _e2dc =f2f2 | dedc BcBA G4 efed | cdcB ABAG FBAB GcBc | Adcd Bede cfef dFGA |
[V:2] z2D2 B,2G,2 C2C2 A,2G,F, | B,3A, G,3F, E,F,E,D, C,4 | A,3G, F,3E, D,4 E,4 | F,4 G,4 A,4 B,3A, |
[V:1] BABc [Gd]2[Ac]B B4 z2[Bd]2 | [Ac]4 z2[cf]2 [ce]4 z2[ce]2 | [Bd]4 z2g2 ^f2d2 a3a | b2e2 d2g2 e2c2 f3e |
[V:2] G,2D,2 E,2F,2 B,2DC B,CDE | F2A,G, F,G,A,B, CDED CDEF | G2B,A, G,A,B,C DCD=E ^FEFD | G2G,A, B,A,B,G, C2CB, A,G,A,F, |
[V:1] d2[Bg]2 =e2[ca]2 ^f2d2 b3a | [c-g][c^f][e-g][ea] [dgb]2[fa]g g4- g=fed | edcB cBAG ^F2G2 [DA]2[DB]2 | [C-G][C^F][E-G][EA] [DGB]2[F-A][FG] [B,DG]6z2 |]
[V:2] B,2G,2 C2A,2 D2^F,2 G,2D2 | E2C2 D2D,2 G,2G,A, B,2G,2 | C,2D,2 E,2C,2 D,4 ^F,2G,2 | E,2C,2 D,2D,,2 G,,6z2 |]`;

export default {
  summary: "Handel's Entrée in G minor, from the Aylesford Pieces, in 4/4, all 20 bars. A dance in two halves: the right hand moves in eighths and sixteenths, sometimes with a held lower note under the tune, over a walking left hand. Five sections: A1 (bars 1–4), A2 (5–8), B1 (9–12), B2 (13–16) and B3 (17–20). The original repeats each half; here you play each half once. Bar 1 holds the pickup, so bar numbers here run one ahead of the printed ones.",
  steps: [
    "Left hand alone in A1 and A2, in wait mode. It walks in even eighths, G–A–B flat–C–D in bar 2, and drops an octave in bars 3 and 6; keep the eighths detached and even.",
    "Right hand alone in bars 3–4. Each bar starts with two notes together where the lower one holds, F sharp under A in bar 3 and G under D in bar 4; hold the lower note with one finger while the others move.",
    "Bars 10–12 are sixteenth-note runs in the right hand over dotted left-hand steps. Practise them hands separately in wait mode, then together a bar at a time.",
    "Play-along with the click at 48. Each clean pass nudges the tempo up toward 80.",
  ],
  watch: [
    "B flat and E flat are in the key signature. F sharp and E natural are written in, in bars 2–3, 7–9, 15 and 17–20.",
    "In bars 13–15 the right hand rests between short chords while the left hand moves into sixteenths and climbs to F sharp above middle C in bar 15. Count the rests and let the left hand carry the line.",
  ],
  source: { label: "Mutopia Project — Handel, Entrée (Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=150" },
  score: {
    bpm: 48, target: 80,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "B1", from: 9, to: 12 }, { name: "B2", from: 13, to: 16 }, { name: "B3", from: 17, to: 20 }],
    abc: ABC,
  },
};

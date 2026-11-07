// Handel, Concerto, from the Aylesford Pieces, from the Mutopia edition of the Schott 1930 print (public domain),
// 38 bars. Where the edition moves the left hand to the treble clef (bars 30–32 and 34–36), its notes are written
// in voice 2, in the upper staff, since the key has a sharp. The mordents (bars 10, 31–32 and 34–36) are marked
// as in the edition; the reference MIDI plays their main notes only.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Concerto
C:George Frideric Handel
M:4/4
L:1/16
K:G
%%staves {(1 2) 3}
V:1 clef=treble
V:2 clef=treble
V:3 clef=bass
[V:1] G2B2 d2[Bg]2 [Af]2d2 [Gg]2B2 | c2E2 F2d2 B2G2 z2b2 | a2f2 d2f2 g2E2 z2g2 | f2d2 B2d2 e2C2 z2e2 |
[V:2] x16 | x16 | x16 | x16 |
[V:3] G,4 B,2G,2 D2C2 B,2G,2 | A,2C,2 D,2F,2 G,2B,2 D2G2 | F4 z2D,2 E,2G,2 B,2E2 | D4 z2B,,2 C,2E,2 G,2C2 |
[V:1] d2B2 G2b2 c'aga bgfg | afef gede fed2 z2a2 | bagf ed^cB c2A2 c2e2 | agfe d^cBA Bdcd Adcd |
[V:2] x16 | x16 | x16 | x16 |
[V:3] B,4 z2G,2 A,2F2 G,2E2 | F,2D2 E,2^C2 D2D,2 F,2D,2 | G,2G,,2 z2G,2 A,2A,,2 A,2A,2 | F,2D2 z2F,2 G,2G,,2 F,,2F,2 |
[V:1] Ggfg egdg ^c2[cb]2 [da]2[eg]2 | [df]3e P[^ce]3d [FAd]4 z4 | d2f2 a2[fd']2 [e^c']2a2 [dd']2f2 | g2B2 ^c2a2 f2d2 z2a2 |
[V:2] x16 | x16 | x16 | x16 |
[V:3] E,2D,2 ^C,2B,,2 A,,2G,2 F,2G,2 | A,2G,2 A,2A,,2 D,2E,F, G,A,B,^C | D2D,2 F,2D,2 A,2G,2 F,2D,2 | E,2G,2 A,2A,,2 D,2F,2 A,2D2 |
[V:1] f2d2 ded2 g2d2 (6:4:6eded^cd | a2d2 (6:4:6eded^cd b2[Bd]2 [Bd][=ce][df]2 | [Bd][ce][df]2 [Bd][ce][df]2 [Bd][ce][df]2 [Bd][ce][df]2 | [Bd][ce][df]2 [Ac]2[GB]2 A2a2 f2d2 |
[V:2] x16 | x16 | x16 | x16 |
[V:3] [CD]4 z4 [B,D]4 z4 | [F,D]4 z4 [G,D]4 z2D2 | G2D2 B,2D2 G2D2 B,2D2 | G2B,2 C2G,2 [DF]4 z2F,2 |
[V:1] b2g2 c'4 z2f2 b4 | zefg agfe ^dbab fbab | gb^db ebfb gb=db ebfb | gb^db ebfb gbab eaga |
[V:2] x16 | x16 | x16 | x16 |
[V:3] G,2E,2 A,2C,2 D,4 z2G,2 | C4 z2A,2 B,4 z2^D2 | E2B,2 ^C2^D2 E2B,2 C2D2 | E2B,2 ^C2^D2 E2E,2 z2C2 |
[V:1] fa^ca daea faca daea | fa^ca daea faga dd'c'd' | bdfd gdad bdfd gdad | bdfd gdac Bdef g2d2 |
[V:2] x16 | x16 | x16 | x16 |
[V:3] D2A,2 B,2^C2 D2A,2 B,2C2 | D2A,2 B,2^C2 D2D,2 z2F2 | G2D2 E2F2 G2D2 E2F2 | G2D2 E2F2 G2G,2 z2B,2 |
[V:1] ecBA aedc dBAG gdcB | cBcA BABG [FA]2D2 z4 | G2B2 d2[Bg]2 [Af]2d2 [Gg]2B2 | c2E2 F2d2 B2G2 z2d2 |
[V:2] x16 | x16 | x16 | x16 |
[V:3] C2C,2 z2A,2 B,2B,,2 z2G,2 | A,2F,2 G,2G,,2 D,G,F,E, D,C,B,,A,, | B,,2G,,2 B,2G,2 D2C2 B,2G,2 | A,2C,2 D,2F,2 G,2G,,2 B,,2G,,2 |
[V:1] e2c/2d/2e (6:4:6fefede f2d/2e/2f (6:4:6gfgfef | g2e/2f/2g (6:4:6agagfg a2d2 z2a2 | Pb2ab c'2ba Pb2ab c'2ba | Pb2ab c'2ba b2d2 g2B2 |
[V:2] x16 | x8 x4 x2f2 | g2fg a2gf g2fg a2gf | g2fg a2gf g2x2 x4 |
[V:3] C,2A,2 z2C,2 D,2D2 z2C2 | B,2A,2 B,2G,2 [DF]4 z2x2 | x16 | x8 x2z2 z2G,2 |
[V:1] e2G2 c2E2 D2[Fd]2 [GB]2A2 | G3A P[FA]3G [B,DG]4 z2A2 | PB2AB c2BA PB2AB c2BA | PB2AB c2BA B2d2 [Bg]2B2 |
[V:2] x16 | x8 x4 x2F2 | G2FG A2GF G2FG A2GF | G2FG A2GF G2x2 x4 |
[V:3] C2B,2 A,2G,2 F,2D,2 E,2C,2 | D,4 D,,4 G,,4 z2x2 | x16 | x8 x2z2 z2[G,,G,]2 |
[V:1] [Ge]2G2 c2E2 D2[Fd]2 [DGB]2[EA]2 | [DGA]4 [CF]2G2 [B,DG]8 |]
[V:2] x16 | x16 |]
[V:3] [C,C]2[B,,B,]2 [A,,A,]2[G,,G,]2 [F,,F,]2[D,,D,]2 [G,,G,]2[C,,C,]2 | [D,,D,]4 [D,,,D,,]4 [G,,,G,,]8 |]`;

export default {
  summary: "Handel's Concerto in G major, from the Aylesford Pieces, in 4/4, all 38 bars. A movement built on a broken-chord theme (bar 1) that returns in D major in bar 11 and in G in bar 27, with sixteenth-note runs, six-note figures and passages in thirds between. Nine sections: A1 (bars 1–4), A2 (5–8), A3 (9–12), B1 (13–16), B2 (17–20), B3 (21–24), A4 (25–28), C1 (29–32) and Close (33–38).",
  steps: [
    "Right hand alone in A2, in wait mode. Bars 5–8 move into sixteenth-note runs that mostly step downward; bar 8 ends with D repeated between moving notes, B–D–C–D–A–D–C–D. The same idea fills bars 18–24, where every other note is B, then A, then D.",
    "Bars 13–14 have six notes in a beat, E–D–E–D–C sharp–D: play them as one even ripple, faster than sixteenths. Then bars 14–16 repeat a rising figure in thirds, B–D, C–E, D–F sharp, six times; keep the hand loose and the eighth on D–F sharp short.",
    "Bars 31–32 and 35–36 put both hands on the same figure, the right hand on B–A–B–C and the left hand a third lower on G–F sharp–G–A. Practise them hands together slowly in wait mode, and leave the mordents out until the notes are secure.",
    "Play-along with the click at 50. Each clean pass nudges the tempo up toward 92.",
  ],
  watch: [
    "F sharp is in the key signature. C sharp is written in through bars 6–14 and 20–22, and D sharp in bars 18–20.",
    "In bars 30–32 and 34–36 the left hand's notes move into the upper staff, below the right hand's, and the lower staff falls silent. The edition switches the left hand to the treble clef there.",
  ],
  source: { label: "Mutopia Project — Handel, Concerto (Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=155" },
  score: {
    bpm: 50, target: 92,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "A3", from: 9, to: 12 }, { name: "B1", from: 13, to: 16 }, { name: "B2", from: 17, to: 20 }, { name: "B3", from: 21, to: 24 }, { name: "A4", from: 25, to: 28 }, { name: "C1", from: 29, to: 32 }, { name: "Close", from: 33, to: 38 }],
    abc: ABC,
  },
};

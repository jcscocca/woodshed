// Burgmüller, "Ballade", Op. 100 No. 15, from the Mutopia edition of the Collection Litolff print (public
// domain). The edition is in 3/8; here each pair of its bars is one 3/4 bar, so its 96 bars are 48. The repeat of
// the first half of the C major section is dropped, and the left hand's move to the treble clef in the last bars
// is kept. ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Ballade
C:Friedrich Burgmüller
M:3/4
L:1/16
K:Cm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] .[CEG]2 .[CEG]2 [CEG]2 .[CEG]2 .[CEG]2 [CEG]2 | .[CEG]2 .[CEG]2 [CEG]2 .[CEG]2 .[CEG]2 [CEG]2 | .[CEG]2 .[CEG]2 [CEG]2 .[CEG]2 .[CEG]2 [CEG]2 | .[CEG]2 .[CEG]2 [CEG]2 .[CE^F]2 .[CE^F]2 .[CE^F]2 |
[V:2] z12 | C,=B,,C,G,,=A,,=B,, C,B,,C,G,,A,,B,, | .C,2 z2 .E,2 .G,2 z2 .C,2 | =A,6-A,4 .C,2 |
[V:1] .[CEG]2 .[CEG]2 [CEG]2 .[CE^F]2 .[CE^F]2 .[CE^F]2 | .[CEG]2 .[CEG]2 [CEG]2 .[CEG]2 .[CEG]2 [CEG]2 | .[CEG]2 .[CEG]2 [CEG]2 .[CEG]2 .[CEG]2 [CEG]2 | .[CEG]2 .[CEG]2 [CEG]2 .[CE^F]2 .[CE^F]2 .[CE^F]2 |
[V:2] =A,6-A,4 z2 | C,=B,,C,G,,=A,,=B,, C,B,,C,G,,A,,B,, | .C,2 z2 E,2 .G,2 z2 .C,2 | =A,6-A,4 .C,2 |
[V:1] .[CEG]2 .[CEG]2 [CEG]2 .[CE^F]2 .[CE^F]2 .[CE^F]2 | .[CEG]2 .[CEG]2 z2 .[Gc]2 .[Gc]2 z2 | .[G=B]2 .[GB]2 z2 .[Gf]2 .[Gf]2 z2 | .[Ge]2 .[Ge]2 z2 .g2 .e2 .c2 |
[V:2] =A,6-A,4 z2 | G,2 G,2 z2 [E,G,]2 [E,G,]2 z2 | [D,G,]2 [D,G,]2 z2 [=B,,G,]2 [B,,G,]2 z2 | [C,G,]2 [C,G,]2 z2 z6 |
[V:1] .G2 .E2 .C2 z6 | z6 [EG]4 z2 | G,4 z2 [DG]4 !fermata!z2 |
[V:2] z6 .G,2 .E,2 .C,2 | G,,4 z2 [G,C]4 z2 | G,,4 z2 [G,=B,]4 !fermata!z2 |
[V:1] [K:C clef=treble] G6 c6 | B6 g6 | G6 c6 | B6 a4 g2 |
[V:2] [K:C clef=bass] z2 [E,G,C]2 [E,G,C]2 z2 [E,G,C]2 [E,G,C]2 | z2 [F,G,D]2 [F,G,D]2 z2 [F,G,D]2 [F,G,D]2 | z2 [E,G,C]2 [E,G,C]2 z2 [E,G,C]2 [E,G,C]2 | z2 [F,G,D]2 [F,G,D]2 z2 [F,G,D]2 [F,G,D]2 |
[V:1] g6 f4 e2 | g4 f2 e4 d2 | c6 e4 d2 | .c2 .c2 .B2 ._B2 .A2 ._A2 | _A4 G2 _A4 G2 |
[V:2] z2 [E,G,C]2 [E,G,C]2 z2 [A,^C]2 [A,^C]2 | z2 [D,F,A,]2 [D,F,A,]2 z2 [F,A,D]2 [F,A,D]2 | z2 [G,CE]2 [G,CE]2 z2 [G,B,F]2 [G,B,F]2 | [CE]2 z4 z6 | z2 [G,B,D]2 [G,B,D]2 z2 [G,B,D]2 [G,B,D]2 |
[V:1] G2 c2 .B2 ._B2 .A2 ._A2 | _A4 G2 _A4 G2 | _A6 F6 | D6 G6 |
[V:2] [CE]2 z4 z6 | z2 [G,B,D]2 [G,B,D]2 z2 [G,B,D]2 [G,B,D]2 | _A,6 F,6 | D,6 G,6 |
[V:1] [K:Cm clef=treble] .[CEG]2 .[CEG]2 [CEG]2 .[CEG]2 .[CEG]2 [CEG]2 | .[CEG]2 .[CEG]2 [CEG]2 .[CEG]2 .[CEG]2 [CEG]2 | .[CEG]2 .[CEG]2 [CEG]2 .[CEG]2 .[CEG]2 [CEG]2 | .[CEG]2 .[CEG]2 [CEG]2 .[CE^F]2 .[CE^F]2 .[CE^F]2 |
[V:2] [K:Cm clef=bass] C,4 z2 z6 | C,=B,,C,G,,=A,,=B,, C,B,,C,G,,A,,B,, | .C,2 z2 .E,2 .G,2 z2 .C,2 | =A,6-A,4 .C,2 |
[V:1] .[CEG]2 .[CEG]2 [CEG]2 .[CE^F]2 .[CE^F]2 .[CE^F]2 | .[CEG]2 .[CEG]2 [CEG]2 .[CEG]2 .[CEG]2 [CEG]2 | .[CEG]2 .[CEG]2 [CEG]2 .[CEG]2 .[CEG]2 [CEG]2 | .[CEG]2 .[CEG]2 [CEG]2 .[CE^F]2 .[CE^F]2 .[CE^F]2 |
[V:2] =A,6-A,4 z2 | C,=B,,C,G,,=A,,=B,, C,B,,C,G,,A,,B,, | .C,2 z2 E,2 .G,2 z2 .C,2 | =A,6-A,4 .C,2 |
[V:1] .[CEG]2 .[CEG]2 [CEG]2 .[CE^F]2 .[CE^F]2 .[CE^F]2 | .[CEG]2 .[CEG]2 z2 .[Gc]2 .[Gc]2 z2 | .[G=B]2 .[GB]2 z2 .[Gf]2 .[Gf]2 z2 | .[Ge]2 .[Ge]2 z2 .g2 .e2 .c2 |
[V:2] =A,6-A,4 z2 | G,2 G,2 z2 [E,G,]2 [E,G,]2 z2 | [D,G,]2 [D,G,]2 z2 [=B,,G,]2 [B,,G,]2 z2 | [C,G,]2 [C,G,]2 z2 z6 |
[V:1] .G2 .E2 .C2 z6 | z6 [EG]4 z2 | G,4 z2 [DG]4 z2 | C=B,CG,=A,=B, CB,CG,A,B, |
[V:2] z6 .G,2 .E,2 .C,2 | G,,4 z2 [G,C]4 z2 | G,,4 z2 [G,=B,]4 z2 | C,=B,,C,G,,=A,,=B,, C,B,,C,G,,A,,B,, |
[V:1] C=B,CG,=A,=B, CB,CG,A,B, | C4 z2 .[Gc]2 .[Gc]2 z2 | .[gc']2 .[gc']2 z2 .[g'c'']2 .[g'c'']2 z2 | [CE]6-[CE]4 z2 |]
[V:2] C,=B,,C,G,,=A,,=B,, C,B,,C,G,,A,,B,, | C,4 z2 [K:clef=treble] .[CE]2 .[CE]2 z2 | .[ce]2 .[ce]2 z2 .[c'e']2 .[c'e']2 z2 | [K:clef=bass] [C,G,]6-[C,G,]4 z2 |]`;

export default {
  summary: "Burgmüller's \"Ballade\", No. 15 of his 25 easy studies, Op. 100, in C minor. The edition is in 3/8; here each pair of its bars makes one 3/4 bar, so the 96 printed bars become 48, with the notes and their timing unchanged. Four sections: A (bars 1–15), B (16–28, in C major), A again (29–43) and Coda (44–48). The original repeats bars 16–23; here you play them once.",
  steps: [
    "Right hand alone in A, in wait mode. In bars 1–9 it plays one chord, C–E flat–G, in eighths, with the first two of each three short. In the second half of bars 4, 5, 8 and 9 G becomes F sharp and all three are short. Keep the hand still over the chord and play quietly.",
    "Left hand alone in A. Bars 2 and 6 are the sixteenth-note figure C–B–C–G–A–B, with B and A natural. Bars 3 and 7 are single eighths between rests, C, E flat, G, C, and in bars 4–5 and 8–9 the A natural is held for five eighths.",
    "B (bars 16–28) is in C major and smooth: a slurred melody, mostly in dotted quarters, in the right hand over left-hand chords on the off-beats. In bars 23 and 25 the right hand slides down by half steps, B, B flat, A, A flat, in short eighths.",
    "Play-along with the click at 92. Each clean pass nudges the tempo up toward 156.",
  ],
  watch: [
    "Each 3/4 bar here is two of the edition's 3/8 bars, so the music is felt in two: a light accent on beat 1 and halfway through beat 2, where the printed bar lines fall.",
    "C minor has three flats, B, E and A. The B and A naturals, in the left hand's sixteenth figure, its held A and the chords of bars 11 and 15, are written in.",
    "In the Coda both hands play the sixteenth figure in octaves, then short chords climb two octaves in bars 46–47, with the left hand in the treble clef, before the low closing chord held for five eighths.",
  ],
  source: { label: "Mutopia Project — Burgmüller, Ballade, Op. 100 No. 15 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=227" },
  score: {
    bpm: 92, target: 156,
    sections: [{ name: "A", from: 1, to: 15 }, { name: "B", from: 16, to: 28 }, { name: "A again", from: 29, to: 43 }, { name: "Coda", from: 44, to: 48 }],
    abc: ABC,
  },
};

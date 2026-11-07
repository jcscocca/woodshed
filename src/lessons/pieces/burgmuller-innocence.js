// Burgmüller, "Innocence", Op. 100 No. 5, from the Collection Litolff edition. The edition's 8va in
// bars 11–13 is written out at sounding pitch.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Innocence
C:Friedrich Burgmüller
M:3/4
L:1/16
K:F
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] agfe fedc dcBA | c2B2 B4 z4 | gfed cdef gabc' | b2a2 a4 z4 |
[V:2] [F,A,C]12 | [F,G,D]4 [F,G,D]4 [F,G,D]4 | [E,B,C]12 | [F,A,C]4 [F,A,C]4 [F,A,^C]4 |
[V:1] agfe fed^c d4 | gfed edc=B c=BAG | _A2G2 =A2G2 e2d2 | .c2 c2=B2 c2d2c2 |
[V:2] [F,A,D]8 [F,A,D]4 | [G,CE]8 [G,CE]4 | [G,=B,F]4 [G,=B,F]4 [G,=B,F]4 | [CE]2 z2 z8 |
[V:1] .c2cd .e2ef g4 | .f2fg .a2ab c'4 | .c'2c'd' .e'2e'f' g'4 | .f'2f'g' .a'2a'b' c''4 |
[V:2] B,2C2 B,2C2 B,2C2 | A,2C2 A,2C2 A,2C2 | B,2C2 B,2C2 B,2C2 | A,2C2 A,2C2 A,2C2 |
[V:1] c''b'a'g' f'e'd'c' bagf | .d'2d'c' .b2ba .g2gf | edcd efga bc'd'e' | .f'2 z2 [A,F]4 z4 |]
[V:2] [F,A,]12 | [B,D]2 z2 z8 | [C,B,]12 | [F,A,]2 z2 F,,4 z4 |]`;

export default {
  summary: "Burgmüller's \"Innocence\", No. 5 of his 25 easy studies, Op. 100, all 16 bars, in F major and 3/4. A right-hand melody in sixteenths over left-hand chords, then a climbing figure over a rocking left hand. Four sections: A1 (bars 1–4), A2 (5–8), B1 (9–12) and B2 (13–16). The original repeats bars 1–7 with first and second endings, and repeats the second half; here you play each half once, going straight from bar 7 to the second ending, bar 8.",
  steps: [
    "Right hand alone in A1, in wait mode. Bars 1 and 3 are four-note groups of sixteenths, falling in bar 1 and turning round to rise in bar 3; keep them even and let each group lead to the next.",
    "Left hand alone in A. It holds or repeats one chord a bar; in bar 4 the top note moves from C to C sharp, and in bar 7 B natural replaces B flat.",
    "Right hand alone in B1. Bars 9–12 repeat one pattern, an eighth, two sixteenths, an eighth, two sixteenths and a quarter, each bar starting higher, on C, F, the next C and the next F, up to the top C at the end of bar 12. The left hand rocks between B flat or A and C in eighths underneath.",
    "Hands together, a section at a time, then play-along with the click at 50. Each clean pass nudges the tempo up toward 92.",
  ],
  watch: [
    "Bar 7 has A flat, then A natural, in the right hand, over a left-hand chord with B natural; bars 6 and 8 have B natural in the right hand too.",
    "Bars 11–13 lie high: the edition prints them an octave lower under an 8va sign, and here they are written at the pitch you play, up to the C three octaves above middle C.",
  ],
  source: { label: "Mutopia Project — Burgmüller, Innocence, Op. 100 No. 5 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=214" },
  score: {
    bpm: 50, target: 92,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "B1", from: 9, to: 12 }, { name: "B2", from: 13, to: 16 }],
    abc: ABC,
  },
};

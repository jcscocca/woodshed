// Burgmüller, "Progrès", Op. 100 No. 6, from the Collection Litolff edition. The D.C. al Fine is written
// out: bars 17–24 are bars 1–8 again.
// ABC source is line-sensitive, so it lives at column 0.
const A = `[V:1] E2FG ABcd e2B2 c2A2 | G2AB cdef g2^f2 g2e2 | .f2.d'2 .d2.b2 .B2g2 f2d2 | [ce]16 |
[V:2] C,2D,E, F,G,A,B, C2^G,2 A,2F,2 | E,2F,G, A,B,CD E2^D2 E2C2 | [G,D]16 | .C2.E2.A,2.C2 .G,2.C2.E,2.C2 |
[V:1] E2FG ABcd e2B2 c2A2 | G2AB cdef g2^f2 g2e2 | .f2.d'2 .d2.b2 .B2g2 f2d2 | c2de fgab c'4 z4 |
[V:2] C,2D,E, F,G,A,B, C2^G,2 A,2F,2 | E,2F,G, A,B,CD E2^D2 E2C2 | [G,D]12 [G,B,]4 | C2B,A, G,F,E,D, C,4 z4 |`;
const ABC = `X:1
T:Progrès
C:Friedrich Burgmüller
M:4/4
L:1/16
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
${A}
[V:1] z2c'2 e'2a2 c'2e2 a2c2 | [df]16 | z2b2 d'2g2 b2d2 g2B2 | [ce]16 |
[V:2] [A,C]16 | z2D2 F2A,2 D2F,2 A,2D,2 | [G,B,]16 | z2C2 E2G,2 C2E,2 G,2C,2 |
[V:1] z2E2 F2E2 ^F2E2 ^G2E2 | A2E2 B2E2 c2E2 A2E2 | ^G2e2 B2e2 c2e2 A2e2 | z2e4 e4 e4 e2 |
[V:2] E,8 z4 D4 | C4 ^G,4 A,4 C4 | B,4 ^G,4 A,4 C4 | E4 E4 E4 E4 |
${A.replace(/ \|$/, " |]")}`;

export default {
  summary: "Burgmüller's \"Progrès\" (Progress), No. 6 of his 25 easy studies, Op. 100, all of it, 24 bars in C major and 4/4. Scales in sixteenths, the hands in parallel tenths, then broken chords handed between the hands. Three sections: A (bars 1–8), B (9–16) and A again (17–24). The original repeats bars 1–8 and ends with a da capo back to the start, stopping at bar 8; here A is played once, then B, then A again written out.",
  steps: [
    "Hands separately in bars 1–2, in wait mode. Each hand plays the same rising scale a tenth apart, an eighth and six sixteenths, then four eighths. Get each hand even on its own before putting them together, then play the bars hands together slowly.",
    "Right hand alone in bar 3: staccato eighths that leap between octaves, F to high D, D to high B, then low B up to G. Keep the hand loose and look ahead to each landing.",
    "B, bars 9–12: the right hand plays broken chords falling in eighths from the top, while the left hand holds a chord; in bars 10 and 12 the hands swap, the left hand falling while the right holds. Then bars 13–15 have a repeated E in the right hand between moving notes.",
    "Hands together, a section at a time, then play-along with the click at 56. Each clean pass nudges the tempo up toward 116.",
  ],
  watch: [
    "In bars 1 and 2 the left hand has G sharp and D sharp and the right hand F sharp, chromatic neighbours that are easy to miss at speed.",
    "Bars 13–15 have G sharp in both hands, and bar 13 has F sharp too; bar 16 is four repeated E's in each hand, the right hand off the beat, leading back to A.",
  ],
  source: { label: "Mutopia Project — Burgmüller, Progrès, Op. 100 No. 6 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=215" },
  score: {
    bpm: 56, target: 116,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }, { name: "A again", from: 17, to: 24 }],
    abc: ABC,
  },
};

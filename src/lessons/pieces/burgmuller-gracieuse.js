// Burgmüller, "La Gracieuse", Op. 100 No. 8, from the Collection Litolff edition. The edition's 8va in
// bar 8 is written out at sounding pitch, and the D.C. al Fine is written out: bars 17–24 are bars 1–8
// again. The edition writes each turn as four 32nds after an eighth; so does this score.
// ABC source is line-sensitive, so it lives at column 0.
const A = `[V:1] c4 dc=Bc f4 gfef a4 z4 | c4 dc=Bc g4 ag^fg b4 z4 | e4 fe^de g4 ag^fg c'4 z4 | c'4 d'e'f'g' a'4 g'f'e'd' c'4 z4 |
[V:2] [F,A,C]16 [F,A,C]4 [F,A,C]4 | [E,B,C]16 [E,B,C]4 [E,B,C]4 | [G,B,C]16 [G,B,C]4 [G,B,C]4 | [F,A,C]16 [F,A,C]4 [F,A,C]4 |
[V:1] c'4 d'c'=bc' a4 _ba^ga d4 z4 | b4 c'bab g4 ag^fg d4 z4 | e4 fe^de g4 ag^fg c'4 d'c'=bc' | f'4 g'f'e'f' c''4 d''c''=b'c'' f''4 z4 |
[V:2] [D,^F,C]16 [D,^F,C]4 [D,^F,C]4 | [G,B,]16 [G,B,]4 [G,B,]4 | [C,G,B,]4 z4 [C,G,B,]4 z4 [C,G,B,]4 z4 | [F,A,]16 F,,4 z4 |`;
const ABC = `X:1
T:La Gracieuse
C:Friedrich Burgmüller
M:3/4
L:1/32
K:F
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
${A}
[V:1] [Gce]12 .[Gce]4 .[G=Bd]4 .[Gce]4 | [G=Bf]12 .[G=Bf]4 .[G=Bf]4 .[G=Be]4 | .[G=Be]4 .[G=Bd]4 .[G=Be]4 .[G=Bd]4 .[G=Be]4 .[G=Bd]4 | [Gc]4 dc=Bc e4 fe^de g4 z4 |
[V:2] C4 DC=B,C G,16 | D4 ED^CD G,16 | [G,F]4 [G,F]4 [G,F]4 [G,F]4 [G,F]4 [G,F]4 | [CE]16- [CE]4 .G,4 |
[V:1] [Gce]12 .[Gce]4 .[G=Bd]4 .[Gce]4 | [G=Bf]12 .[G=Bf]4 .[G=Bf]4 .[G=Be]4 | .[G=Be]4 .[G=Bd]4 .[G=Be]4 .[G=Bd]4 .[G=Be]4 .[G=Bd]4 | .[Gc]4 c8 c8 c4 |
[V:2] C4 DC=B,C G,16 | D4 ED^CD G,16 | [G,F]4 [G,F]4 [G,F]4 [G,F]4 [G,F]4 [G,F]4 | [CE]4 .C4 .[=B,C]4 .[_B,C]4 .[A,C]4 .[G,C]4 |
${A.replace(/ \|$/, " |]")}`;

export default {
  summary: "Burgmüller's \"La Gracieuse\" (Grace), No. 8 of his 25 easy studies, Op. 100, all of it, 24 bars in F major and 3/4. The right-hand tune is built from turns, an eighth note followed by four quick 32nds circling it, over left-hand chords. Three sections: A (bars 1–8), B (9–16) and A again (17–24). In B the right hand takes the chords and the left hand the turns. The original repeats bars 1–8 and ends with a da capo back to the start, stopping at bar 8; here A is played once, then B, then A again written out.",
  steps: [
    "Right hand alone in bar 1, in wait mode. Each turn is the main note, the note above, the main note, the note below and the main note again, the last four as 32nds; play them close to the key and land evenly on the next eighth. Then bars 2–3, where the turns move to G and E.",
    "Left hand alone in A. It holds a chord for two beats and repeats it twice in eighths; in bar 7 it strikes C–G–B flat on each beat with a rest between.",
    "B, bars 9–12: the right hand plays G-based chords, a dotted quarter then staccato eighths, while the left hand has the turns on C and D in bars 9 and 10, each followed by a held G. In bar 12 the turns go back to the right hand.",
    "Hands together, a section at a time, then play-along with the click at 44. Each clean pass nudges the tempo up toward 80.",
  ],
  watch: [
    "Every turn round C uses B natural, and the turns round E, G and A use D sharp, F sharp and G sharp; the key signature's B flat still holds for the B flats in bars 2, 5 and 6.",
    "Bar 8 climbs to the F two octaves above the treble staff's top line; the edition prints it under an 8va sign, and here it is written at the pitch you play.",
  ],
  source: { label: "Mutopia Project — Burgmüller, La Gracieuse, Op. 100 No. 8 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=217" },
  score: {
    bpm: 44, target: 80,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }, { name: "A again", from: 17, to: 24 }],
    abc: ABC,
  },
};

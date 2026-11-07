// Burgmüller, "La Petite Réunion", Op. 100 No. 4, from the Collection Litolff edition. The left hand
// moves to the treble clef for the A flat to G in bars 19–20, as in the edition.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:La Petite Réunion
C:Friedrich Burgmüller
M:4/4
L:1/8
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z8 | .[df].[ce].[Bd].[Ac] .[GB].[FA].[EG].[DF] | [CE]2 z2 z4 | .[df].[ce].[Bd].[Ac] .[GB].[FA].[EG].[DF] |
[V:2] G,2 A,B, C2 E,F, | G,8 | G,2 A,B, CE, B,A, | G,8 |
[V:1] [CE]2 z2 .[Ec]2 z2 | .[CD]2 z2 .[B,G]2 z2 | [c'e']2 [bd'][ac'] [ac']2 [gb][fa] | [eg]2 [ce][df] [eg]2 [df][ce] |
[V:2] C,2 z2 .A,2 z2 | .F,2 z2 .G,2 z2 | C,4 F,2 A,2 | C4 C,4 |
[V:1] [ce]2 [Bd][ce] [df]2 [df][ce] | .[Bd].[ce].[df].[eg] .[fa].[gb].[ac'].[bd'] | [c'e']2 [bd'][ac'] [ac']2 [gb][fa] | [eg]2 [ce][df] [eg]2 [df][ce] |
[V:2] A,4 D,4 | G,8 | C,4 F,2 A,2 | C4 C,4 |
[V:1] [Af]2 [Ge][Fd] [Fd]2 [Ec][DB] | [Ec]2 ED C2 z2 | z8 | [GB]2 [Ac][Bd] [Bd]2 [ce][df] |
[V:2] F,4 G,4 | C,2 G,F, [C,E,]2 z2 | [G,B,]2 [A,C][B,D] [B,D]2 [CE][DF] | [DF]4 z4 |
[V:1] [df]4 z4 | [GB]2 [Ac][Bd] [Bd]2 [ce][df] | [df]2 [Bd][ce] [df]4- | [df]2 [Bd][ce] [df]4- |
[V:2] [G,B,]2 [A,C][B,D] [B,D]2 [CE][DF] | [DF]2 [CE][B,D] [B,D]2 [A,C][G,B,] | [G,B,]2 z2 z2 [K:clef=treble] _A2 | G2 z2 z2 [K:clef=bass] _A,2 |
[V:1] [df]2 [Bd][ce] [df]2 [Bd][ce] | .[df]2 .[df].[eg] .[fa].[gb].[ac'].[bd'] | [c'e']2 [bd'][ac'] [ac']2 [gb][fa] | [eg]2 [ce][df] [eg]2 [df][ce] |
[V:2] G,2 z2 z4 | z8 | C,4 F,2 A,2 | C4 C,4 |
[V:1] [ce]2 [Bd][ce] [df]2 [df][ce] | .[Bd].[ce].[df].[eg] .[fa].[gb].[ac'].[bd'] | [c'e']2 [bd'][ac'] [ac']2 [gb][fa] | [eg]2 [ce][df] [eg]2 [df][ce] |
[V:2] A,4 D,4 | G,8 | C,4 F,2 A,2 | C4 C,4 |
[V:1] [Af]2 [Ge][Fd] [Fd]2 [Ec][DB] | [Ec]2 ED C2 z2 |]
[V:2] F,4 G,4 | C,2 G,F, [C,E,]2 z2 |]`;

export default {
  summary: "Burgmüller's \"La Petite Réunion\" (The Little Gathering), No. 4 of his 25 easy studies, Op. 100, all 30 bars, in C major and 4/4. The right hand plays in thirds almost throughout. Four sections: Intro (bars 1–6), A (7–14), B (15–22) and A′ (23–30). The original repeats bars 7–14 and bars 15–30; here you play each once.",
  steps: [
    "Right hand alone in the Intro, in wait mode. Bars 2 and 4 are a staccato scale in thirds falling from D–F to D–F an octave lower; keep the two notes of each third exactly together and the eighths even.",
    "Right hand alone in A. Bars 7–9 each move in thirds as a quarter, two eighths, a quarter and two eighths. Bar 10 climbs in staccato thirds from B–D to B–D an octave higher, back to the opening figure of bar 7 in bar 11.",
    "Left hand alone in B (bars 15–18). Here the left hand takes the thirds, G–B up to D–F, answered by the right hand an octave higher; then bars 19–20 move the left hand up to A flat and G in the treble clef.",
    "Hands together, a section at a time, then play-along with the click at 60. Each clean pass nudges the tempo up toward 120.",
  ],
  watch: [
    "Bars 19 and 20 end with the right hand's D–F third tied over the bar line; hold it and don't strike it again on the next downbeat.",
    "In bars 19–20 the left hand's lower staff is in the treble clef from the A flat in bar 19 until the A flat in bar 20, which is back in the bass clef an octave lower.",
  ],
  source: { label: "Mutopia Project — Burgmüller, La Petite Réunion, Op. 100 No. 4 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=219" },
  score: {
    bpm: 60, target: 120,
    sections: [{ name: "Intro", from: 1, to: 6 }, { name: "A", from: 7, to: 14 }, { name: "B", from: 15, to: 22 }, { name: "A′", from: 23, to: 30 }],
    abc: ABC,
  },
};

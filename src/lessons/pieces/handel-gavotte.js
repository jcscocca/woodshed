// Handel, Gavotte in G from the Aylesford Pieces, from the Mutopia edition of the Schott 1930 print (public
// domain), 21 bars. The quarter-note pickup is written into a full first bar, so every bar number here is one
// more than the printed one. Each half is played once, as the reference MIDI plays it.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Gavotte
C:George Frideric Handel
M:4/4
L:1/8
K:G
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] z6 GA | B2 AG [Bd]2 [Ae]f | [Bg]6 [dg]f | fe [Ge]d [Fd]c [Gc]B |
[V:2] z8 | .G,2 .G,,2 .G,2 .F,2 | .E,2 .E,,2 .E,2 .B,,2 | .C,2 .B,,2 .A,,2 .G,,2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] [FA]6 GA | B2 AG [Bd]2 [Ae]f | [Bg]6 [ea]g | [Adf]2 [Be]d [Adf]2 [A^ce]d |
[V:2] .D,2 .A,,2 .D,,2 z2 | .G,2 .G,,2 .G,2 .F,2 | .E,2 .E,,2 .E,2 .^C,2 | .D,2 .G,2 .A,2 .A,,2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] [FAd]6 [df]g | a2 gf gf ga | [db]6 [Bb]^d | e^d [ce]f [Bg]2 [A^df]e |
[V:2] .D,2 .A,,2 .D,,2 D,2 | F,2 .D,2 .E,2 .F,2 | .G,2 .G,,2 .G,2 .B,2 | .C2 .A,2 .B,2 .B,,2 |
[V:3] x6 D2- | D8 | x8 | x8 |
[V:1] [GBe]6 [dg]f | [Gf]e [Ge]d [Fd]c [Gc]B | [Ec]6 [Be]d | [Fd]c [Gc]B [DB]A [^CA]G |
[V:2] .E,2 .E,,2 .E,2 .B,,2 | .C,2 .B,,2 .A,,2 .G,,2 | .A,,2 .E,2 .A,2 .G,2 | .A,2 .G,2 .F,2 .E,2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] [DF]6 [F,G]D | [CE]2 [A,A]E [DF]2 [B,B]F | [B,G]2 [Cc]G [DA]2 [Dd]A | [GB]F [EA]G [DGB]2 [CFA]G |
[V:2] .D,2 .D,,2 .D,2 .B,,2 | .C,2 .C,,2 .D,2 .D,,2 | .E,2 .E,,2 .F,2 .F,,2 | .G,2 .C,2 .D,2 .D,,2 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] [B,DG]6 z2 |]
[V:2] .G,2 .D,2 .G,,2 z2 |]
[V:3] x8 |]`;

export default {
  summary: "Handel's Gavotte in G major from the Aylesford Pieces, all 21 bars in 4/4. The right hand plays the tune with a second, lower line folded in as chords; the left hand walks in detached quarter notes, often leaping an octave. Five sections: A1 (bars 1–5), A2 (6–9), B1 (10–13), B2 (14–17) and B3 (18–21). Bar 1 holds the pickup, so bar numbers here run one ahead of the printed ones. The original repeats each half; here you play each half once.",
  steps: [
    "Left hand alone in A1, in wait mode. Most bars are one note, its octave below, then back up: G–G–G–F sharp in bar 2. Keep every quarter detached and even.",
    "Right hand alone in A1 and A2. Bars 4 and 14 are a falling line of eighths with a lower note added on each beat from the second; let the top line lead.",
    "In bar 9 the left hand takes a second voice: a D held through bar 10 over a moving line, D–F sharp–D–E–F sharp. Practise those two bars hands separately before joining them.",
    "Play-along with the click at 60. Each clean pass nudges the tempo up toward 92.",
  ],
  watch: [
    "B1 turns toward E minor, with D sharps in bars 11 and 12. An accidental lasts one bar only, which is why bar 12 marks the sharp again.",
    "In bars 18–20 the right hand plays two notes against each other, a quarter below and eighths above; the lower notes go down to F sharp, A and B below middle C.",
  ],
  source: { label: "Mutopia Project — Handel, Gavotte (Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=151" },
  score: {
    bpm: 60, target: 92,
    sections: [{ name: "A1", from: 1, to: 5 }, { name: "A2", from: 6, to: 9 }, { name: "B1", from: 10, to: 13 }, { name: "B2", from: 14, to: 17 }, { name: "B3", from: 18, to: 21 }],
    abc: ABC,
  },
};

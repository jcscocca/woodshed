// Burgmüller, "La Chasse", Op. 100 No. 9, from the Collection Litolff edition. The original is in 6/8 with
// an eighth-note pickup; here it is written in 3/4 with the same eighths, and the pickup is padded into a
// full first bar. The left hand moves to the treble clef for bars 14–16 and 30–35, as in the edition.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:La Chasse
C:Friedrich Burgmüller
M:3/4
L:1/8
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z6 | z6 | z6 | z6 |
[V:2] z4z[C,E,G,] | [C,E,G,]2[C,E,G,] [C,E,G,]2[C,E,G,] | [C,E,G,]2[E,G,C] [E,G,C]2[G,CE] | [G,CE]2[E,G,C] [E,G,C]2[G,B,D] |
[V:1] z6 | gGG gGG | gGG gGG | gGG gGG |
[V:2] [G,B,D]6 | [E,C]3 [G,D]3 | [DF]3 [CE]3 | [E,C]3 [CE]3 |
[V:1] gfd BAG | gGG gGG | gGG gGG | gGG gGG |
[V:2] [G,D]6 | [E,C]3 [G,D]3 | [DF]3 [CE]3 | [E,C]3 [G,D]3 |
[V:1] gec c'2z | [Bd]3 [Bd]3 | [df]3 [c_e]3 | [_eg]3 [ce]3 |
[V:2] [E,C]3 C,2z | [K:clef=treble] z^FG zFG | z^FG zFG | z^FG zFG |
[V:1] [Bd]6 | [Bd]3 [Bd]3 | [df]3 [c_e]3 | [_eg]3 [ce]3 |
[V:2] [K:clef=bass] zG,B, DB,G, | z^F,G, zF,G, | z^F,G, zF,G, | z^F,G, zF,G, |
[V:1] [Bd]4 z2 | gGG gGG | gGG gGG | gGG gGG |
[V:2] z^F,G, G,, z2 | [E,C]3 [G,D]3 | [DF]3 [CE]3 | [E,C]3 [CE]3 |
[V:1] gfd BAG | gGG gGG | gGG gGG | gGG gGG |
[V:2] [G,D]6 | [E,C]3 [G,D]3 | [DF]3 [CE]3 | [E,C]3 [G,D]3 |
[V:1] gec c'2z | e3 A3 | c3 B3 | A3 ^G3 |
[V:2] [E,C]3 C,2z | [K:clef=treble] A,CE A,CE | A,DF A,DF | A,DF A,DF |
[V:1] B3 A3 | e3 a3 | gfe dcB | Afe Bdc |
[V:2] [K:clef=treble] A,CE A,CE | A,^CG A,CG | [DF]2z z3 | [K:clef=bass] [E,A,C]2z [E,^G,D]2z |
[V:1] Ace a2z | gGG gGG | gGG gGG | gGG gGG |
[V:2] [A,C]2z A,,2z | [E,C]3 [G,D]3 | [DF]3 [CE]3 | [E,C]3 [CE]3 |
[V:1] gfd BAG | gGG gGG | gGG gGG | gGG gGG |
[V:2] [G,D]6 | [E,C]3 [G,D]3 | [DF]3 [CE]3 | [E,C]3 [G,D]3 |
[V:1] gec c' z2 | z6 | z6 | z6 |
[V:2] [E,C]4z[C,E,G,] | [C,E,G,]2[C,E,G,] [C,E,G,]2[C,E,G,] | [C,E,G,]2[E,G,C] [E,G,C]2[G,CE] | [G,CE]2[E,G,C] [E,G,C]2[G,B,D] |
[V:1] gGG g z2 | z6 | z6 | z6 |
[V:2] [G,B,D]4z[C,E,G,] | [C,E,G,]2[C,E,G,] [C,E,G,]2[C,E,G,] | [C,E,G,]2[E,G,C] [E,G,C]2[G,CE] | [G,CE]2[E,G,C] [E,G,C]2[G,B,D] |
[V:1] gGG g z2 | gGG g z2 | gGG gz[CE] | [CE]2[CE] [CE]2[CE] |
[V:2] [G,-B,-D-]4[G,B,D][G,D] | [E,-C-]4[E,C][G,D] | [E,C]4z[C,G,] | [C,G,]2[C,G,] [C,G,]2[C,G,] |
[V:1] [CE]6 |]
[V:2] [C,G,]6 |]`;

export default {
  summary: "Burgmüller's \"La Chasse\" (The Hunt), No. 9 of his 25 easy studies, Op. 100, all 57 bars, in C major. The original is in 6/8; here it is written in 3/4 with the same eighth notes, so each bar is two groups of three. The right hand plays horn calls, a high G answered by the G an octave below, over left-hand chords. Seven sections: Intro (bars 1–5, left hand alone), A (6–13), B (14–21), A again (22–29), C (30–37, in A minor), A′ (38–45) and Coda (46–57). Bar 1 holds the eighth-note pickup, so bar numbers here run one ahead of the printed ones. The original repeats C; here you play it once.",
  steps: [
    "Right hand alone in A, in wait mode. Each half bar is a horn call: the high G with the fifth finger, then the low G twice with fingers 2 and 1. Keep the hand spread over the octave instead of jumping, and keep all three notes short.",
    "Left hand alone in B. Each bar is an eighth rest, then F sharp slurred to G, twice: in the treble clef in bars 14–16, an octave lower in bars 18–21. Start each pair after the rest. Bar 17 is a broken G chord, and bar 21 ends on the low G.",
    "C (bars 30–37) is the one legato section: long right-hand notes, then a run of eighths in bars 35–37, over left-hand broken chords in the treble clef. Take it hands separately in wait mode before putting it together.",
    "Switch to play-along with the click at 80. Each clean pass nudges the tempo up toward 160.",
  ],
  watch: [
    "B has E flat in the right hand's thirds in bars 15–16 and 19–20; the flat lasts to the end of the bar, so the C–E in bars 16 and 20 is C–E flat. C has G sharp in bars 32 and 36 and a left-hand C sharp in bar 34.",
    "In the Coda the left hand repeats the Intro's chords and the right hand only answers now and then. Count through the rests in bars 46–48 and 50–52 so the horn calls in bars 49 and 53 come in on time.",
  ],
  source: { label: "Mutopia Project — Burgmüller, La Chasse, Op. 100 No. 9 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=220" },
  score: {
    bpm: 80, target: 160,
    sections: [{ name: "Intro", from: 1, to: 5 }, { name: "A", from: 6, to: 13 }, { name: "B", from: 14, to: 21 }, { name: "A again", from: 22, to: 29 }, { name: "C", from: 30, to: 37 }, { name: "A′", from: 38, to: 45 }, { name: "Coda", from: 46, to: 57 }],
    abc: ABC,
  },
};

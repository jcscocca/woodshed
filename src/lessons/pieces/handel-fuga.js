// Handel, Fuga, from the Aylesford Pieces, from the Mutopia edition of the Schott 1930 print (public domain), 19 bars.
// Where the edition writes two voices in one staff (bars 8 and 18–19), the right hand's notes are folded into chords.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Fuga
C:George Frideric Handel
M:4/4
L:1/16
K:G
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] G6B2 A2D2 d2c2 | B2G2 g8 f4 | g2d2 e2B2 ^c2A2 d2F2 | G2B2 A2G2 F2A2 d4- |
[V:2] G,,4 G,8 F,4 | G,6B,2 A,2D,2 D2C2 | B,4 G,8 F,2B,2 | E,4 ^C4 D6D,2 |
[V:1] d4 c8 B4 | A8 G4 g4- | g4 =f8 e4 | [Ad]4 B4 [Ec]6e2 |
[V:2] E,2D,2 E,2F,2 G,2D,2 G,2B,,2 | C,2A,,2 D,2C,2 B,,2G,,2 z2E,2 | A,2G,2 A,2B,2 C2G,2 A,2E,2 | =F,2D,2 G,2G,,2 C,4 C4- |
[V:1] d2G2 g2=f2 e2d2 c4- | c4 B4 A4 d4- | d4 c4 B6e2 | ^c2A2 d8 c4 |
[V:2] C4 B,4 C4 z2E,2 | F,2D,2 G,8 F,2B,2 | ^G,2E,2 A,8 =G,4- | G,4 F,4 E,2F,G, A,2G,2 |
[V:1] d4 A2B2 c2e2 d2c2 | B2d2 g2f2 e2d2 c2B2 | A4 d8 c4- | c4 B4 A8 |
[V:2] F,2D,2 F,2G,2 A,4 F,4 | G,4 B,4 C2B,2 A,2G,2 | F,2E,2 F,2D,2 E,2D,2 E,2F,2 | G,2D,2 E,2B,,2 C,2A,,2 D,2C,2 |
[V:1] G4 g2f2 e2d2 c2B2 | A2f2 g2B2 [DGA]4 F2G2 | [B,DG]16 |]
[V:2] B,,2A,,2 G,,4 C,2B,,2 A,,4 | D,2C,2 B,,2C,2 D,4 D,,4 | G,,16 |]`;

export default {
  summary: "Handel's little Fuga in G major, from the Aylesford Pieces, in 4/4, all 19 bars. Two lines, one in each hand, share a single subject: the right hand states it in bar 1 (G, then B–A–D–D–C, then B–G and a held high G), and the left hand answers with it an octave lower in bar 2. Five sections: A1 (bars 1–4), A2 (5–8), B1 (9–12), B2 (13–16) and Close (17–19).",
  steps: [
    "Learn the subject first: right hand, bars 1–2, in wait mode. Then find it in the left hand in bars 2–3, where it starts on the G below middle C.",
    "Left hand alone in A2. Bars 5–7 are a chain of steady eighths; keep them even and joined, since they are the second voice of the fugue, not an accompaniment.",
    "Hands together a section at a time in wait mode. The two hands seldom move in the same rhythm: in bars 5–7 and 9–11 one hand holds long notes while the other moves in eighths, and the tied notes across bars 4–5, 6–7, 9–10 and 10–11 must not be struck again.",
    "Play-along with the click at 52. Each clean pass nudges the tempo up toward 84.",
  ],
  watch: [
    "F sharp is in the key signature. F natural comes in bars 7–9, C sharp in bars 3, 4 and 12, and G sharp in the left hand in bar 11.",
    "Bar 8 and the last two bars put two notes in the right hand at once: D over A, then C over E, in bar 8, and a three-note chord with a moving F sharp–G in bar 18. Hold the long notes while the others move.",
  ],
  source: { label: "Mutopia Project — Handel, Fuga (Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=153" },
  score: {
    bpm: 52, target: 84,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "B1", from: 9, to: 12 }, { name: "B2", from: 13, to: 16 }, { name: "Close", from: 17, to: 19 }],
    abc: ABC,
  },
};

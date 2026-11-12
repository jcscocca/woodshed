// Polonaise in G minor, BWV Anh. 119 (Anna Magdalena Bach notebook, composer unknown), from the Mutopia
// edition of the Bach-Gesellschaft print, 16 bars.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Polonaise in G minor
C:Anonymous (Anna Magdalena Bach notebook)
M:3/4
L:1/16
K:Gm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] G3A B4 c4 | A2AB c8 | B2Bc d2g2 c2g2 | B2AB G8 |
[V:2] G,4 G,4 G,4 | G,4 ^F,2=E,2 F,2D,2 | G,4 G,,4 C,4 | D,4 G,2G,,2 B,,2D,2 |
[V:1] B3c d4 f4 | d2cB ABcA F4 | f2d2 B2f2 gfed | e2c2 A2e2 fedc |
[V:2] G,3A, B,4 A,4 | B,4 F,4 F,2E,2 | D,4 F,4 E,4 | C,4 F,4 D,4 |
[V:1] d2cd e2d2 c2B2 | ABcA B4 B,4 | .d4 .e4 .G4 | ^F2FG A2D2 F2A2 |
[V:2] B,,4 G,4 E,4 | F,2E,2 D,2E,2 D,2C,2 | B,,4 C,4 E,4 | D,4 D,4 C,4 |
[V:1] .d4 .e4 .G4 | ^F2FG A2D2 F2A2 | d2de d2de d2g2 | B2AB G4 G,4 |]
[V:2] B,,4 C,4 E,4 | D,8 C,4 | B,,4 G,,4 B,,4 | D,4 G,,8 |]`;

export default {
  summary: "The Polonaise in G minor from the Anna Magdalena Bach notebook (BWV Anh. 119, composer unknown), all 16 bars, in 3/4. A polonaise is a stately Polish dance; its mark is a dotted eighth followed by a sixteenth, or an eighth followed by two sixteenths, on the first beat. Three sections: A (bars 1–4), B (5–10, turning to B flat major) and C (11–16, back to G minor). The original repeats each half; here you play each half once.",
  steps: [
    "Right hand alone in A, in wait mode. Bars 1 and 5 open with a dotted eighth and a sixteenth; bars 2, 3 and 4 with an eighth and two sixteenths. Keep the sixteenths short and leaning into the next beat.",
    "Left hand alone. It walks mostly in quarters. Bars 2, 4 and 10 move in eighths (bar 2 is F sharp, E, F sharp, D), and bar 5 copies the right hand's dotted rhythm.",
    "Hands together in B, a bar at a time. Bars 7 and 8 are the same shape a step apart: four leaping eighths, then four sixteenths falling.",
    "Play-along with the click at 60. Each clean pass nudges the tempo up toward 92.",
  ],
  watch: [
    "B flat and E flat are in the key signature. F sharp is written in bars 2, 12 and 14, and the E in bar 2's left hand is E natural.",
    "Bars 11–14 are one two-bar phrase played twice: three detached quarters (D, E flat, G), then the F sharp bar. In bar 14 the left hand holds its D for two beats instead of striking it again.",
  ],
  source: { label: "Mutopia Project — Bach, Polonaise in G minor, BWV Anh. 119 (Bach-Gesellschaft Ausgabe, Band 43, 1894)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1016" },
  score: {
    bpm: 60, target: 92,
    sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 10 }, { name: "C", from: 11, to: 16 }],
    abc: ABC,
  },
};

// Handel, "Impertinence" in G minor from the Aylesford Pieces, from the Mutopia edition of the Schott 1930
// print (public domain), 21 bars. The quarter-note pickup is written into a full first bar, so every bar number
// here is one more than the printed one. Each half is played once, as the reference MIDI plays it.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Impertinence
C:George Frideric Handel
M:4/4
L:1/16
K:Gm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z12 .D4 | G4 B4 A4 G2^F2 | G8 D8 | A2B2 .c4 .B4 .A4 |
[V:2] z16 | z12 .D,4 | G,4 A,4 B,4 A,2G,2 | ^F,8 D,8 |
[V:1] B8 G8 | B2c2 .d4 .c4 .B4 | [Ac]8 .F4 .d4 | [Ge]8 (3[Gc]2d2c2 dcBc |
[V:2] .G,4 G,,2A,,2 .B,,4 .C,4 | .D,4 .B,,4 .A,,4 .G,,4 | .F,,4 .F,4 .E,4 .D,4 | C,8 [E,G,]8 |
[V:1] [^Fd]12 .d4 | d2e2 .f4 .e4 .d4 | e8 c8 | c2d2 .e4 .d4 .c4 |
[V:2] [D,A,]12 z4 | z12 .B,4 | C4 D4 .E4 .C4 | A,8 F,8 |
[V:1] d8 B8 | B2c2 .d4 .c4 .B4 | A2B2 .c4 .B4 .A4 | .B4 A2B2 .G4 .g4 |
[V:2] B,4 C4 .D4 .B,4 | G,8 E8 | ^F,8 D8 | G,8 E,8 |
[V:1] [Ad^f]8 [Gd]8 | g4 a4 b2a2 g2^f2 | g8 d8 | e2d2 c2B2 (6:4:6ABABAB A2 z G |
[V:2] .D,4 C,2D,2 .B,,4 .G,,4 | .E,4 .C,4 .D,4 .D4 | .E4 D2C2 .B,4 .G,4 | .C4 .A,4 .[D^F]4 .D,4 |
[V:1] G12 z4 |]
[V:2] G,12 z4 |]`;

export default {
  summary: "Handel's \"Impertinence\" in G minor from the Aylesford Pieces, all 21 bars in 4/4. A bourrée-like dance in two parts: one line in each hand, the left hand answering the right. Five sections: A1 (bars 1–5), A2 (6–9), B1 (10–13), B2 (14–17) and B3 (18–21). Bar 1 holds the pickup, so bar numbers here run one ahead of the printed ones. The original repeats each half; here you play each half once.",
  steps: [
    "Right hand alone in A1, in wait mode. The tune opens with leaps from the pickup D to G and B flat, then descends by step; bars 4 and 6 open with two eighths, then three detached quarters.",
    "Left hand alone in A1 and A2. In bar 3 it imitates the right hand's opening; in bar 6 it descends in quarters, D–B flat–A–G, reaching low F at the start of bar 7.",
    "Bar 8 has an eighth-note triplet then four sixteenths over a held G, and bar 20 has six quick notes, A and B flat, in the time of one beat. Take each slowly in wait mode until the rhythm is even.",
    "Play-along with the click at 66. Each clean pass nudges the tempo up toward 104.",
  ],
  watch: [
    "B flat and E flat are in the key signature. F sharp is written in, in bars 2, 4, 9, 15, 17, 18 and 20.",
    "Bar 20's six notes are a written-out trill on A: start it on A, keep it light, and land on the short G that leads into the last bar.",
  ],
  source: { label: "Mutopia Project — Handel, Impertinence (Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=154" },
  score: {
    bpm: 66, target: 104,
    sections: [{ name: "A1", from: 1, to: 5 }, { name: "A2", from: 6, to: 9 }, { name: "B1", from: 10, to: 13 }, { name: "B2", from: 14, to: 17 }, { name: "B3", from: 18, to: 21 }],
    abc: ABC,
  },
};

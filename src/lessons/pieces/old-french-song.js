// Tchaikovsky, "Old French Song", Op. 39 No. 16 (Album for the Young), from the Mutopia edition of the
// Schirmer 1904 print (public domain), 32 bars. The eighth-note pickup is written into a full first bar,
// so every bar number here is one more than the printed one.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Old French Song
C:Pyotr Ilyich Tchaikovsky
M:2/4
L:1/16
K:Gm
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] z6 D2 | G2A2 B2c2 | d6 d2 | c2d2 e2c2 |
[V:2] x8 | B,2C2 D2C2 | B,8 | E4 C4 |
[V:3] z8 | G,8- | G,4 G,4- | G,8- |
[V:1] d6 d2 | c2d2 e2c2 | d2ed c2B2 | A7G |
[V:2] B,4 G,4 | E4 C4 | B,4 G,4 | C8 |
[V:3] G,4 G,4- | G,8- | G,4 G,4 | ^F,4 D,4 |
[V:1] G6 D2 | G2A2 B2c2 | d6 d2 | c2d2 e2c2 |
[V:2] B,4 x4 | B,2C2 D2C2 | B,8 | E4 C4 |
[V:3] G,4 .G,,4 | G,8- | G,4 G,4- | G,8- |
[V:1] d6 d2 | c2d2 e2c2 | d2ed c2B2 | A7G |
[V:2] B,4 G,4 | E4 C4 | B,4 G,4 | C8 |
[V:3] G,4 G,4- | G,8- | G,4 G,4 | ^F,4 D,4 |
[V:1] G8 | G4 G2A2 | B6 B2 | c4 c4 |
[V:2] B,8 | .C,2.G,2.C2.E2 | .G,,2.G,2.C2.E2 | .C,2.G,2.C2.E2 |
[V:3] G,8 | x8 | x8 | x8 |
[V:1] A6 A2 | d6 d2 | e2fe d2c2 | B4 A2G2 |
[V:2] .D,2.A,2.C2.^F2 | [G,B,]2D2 G2z2 | [CEG]8 | [DG]4 z4 |
[V:3] x8 | x8 | x8 | x8 |
[V:1] [^FA]6 D2 | G2A2 B2c2 | d6 d2 | c2d2 e2c2 |
[V:2] D4 D,4 | B,2C2 D2C2 | B,8 | E4 C4 |
[V:3] x8 | G,8- | G,4 G,4- | G,8- |
[V:1] d6 d2 | c2d2 e2c2 | d2ed c2B2 | [EA-]4 [DA]3G |
[V:2] B,4 G,4 | E4 C4 | B,4 G,4 | G,4 ^F,4 |
[V:3] G,4 G,4- | G,8- | G,4 G,4 | C,4 D,4 |
[V:1] [B,G]8 |]
[V:2] D,8 |]
[V:3] G,,8 |]`;

export default {
  summary: "Old French Song, No. 16 of Tchaikovsky's Album for the Young, Op. 39 (1878), all 32 bars. A singing right-hand tune in G minor over two left-hand voices: a moving line above a held G. Four sections, AABA: A (bars 1–9), A again (10–17), B (18–25) and A′ (26–33). Bar 1 holds the pickup, so bar numbers here run one ahead of the printed ones.",
  steps: [
    "Left hand alone in A, in wait mode. The top voice moves while the low G holds underneath, tied across the bar. Don't strike a tied note again.",
    "Right hand alone. Bar 7 has a quick D–E flat–D; bar 8 a double-dotted A, held long, then a short G.",
    "In B the left hand has one voice, detached eighths. Keep them light under the tune.",
    "Play-along with the click at 50. Each clean pass nudges the tempo up toward 72.",
  ],
  watch: [
    "B flat and E flat are in the key signature. F sharp is written in, in bars 8, 16, 21, 25 and 32.",
    "In the last two bars the right hand adds a lower note under the tune: E flat, then D, held under the short G, then B flat.",
  ],
  source: { label: "Mutopia Project — Tchaikovsky, Old French Song, Op. 39 No. 16 (Schirmer, 1904)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2080" },
  score: {
    bpm: 50, target: 72,
    sections: [{ name: "A", from: 1, to: 9 }, { name: "A again", from: 10, to: 17 }, { name: "B", from: 18, to: 25 }, { name: "A′", from: 26, to: 33 }],
    abc: ABC,
  },
};

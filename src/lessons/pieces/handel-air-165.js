// Handel, Air with two variations in F from the Aylesford Pieces, from the Mutopia edition of the Schott 1930
// print. The half-bar pickup is padded into a full first bar, every repeat is written out, and the right hand's
// two voices share one staff. The second ending's half-note chord is written as a whole note to fill the last bar.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Air with Variations
C:George Frideric Handel
M:4/4
L:1/16
K:F
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z8 [Ac]4[Af]4 | [Ge]fed[Ac]4 [dg]4[ce]4 | [Aa]4[df]4 [eb]4[ca]2b2 | [dg]4[cf]4 [Be]3f(6:4:6[Ag]fgfef |
[V:2] z8 F,4F,,4 | C,4A,,4 B,,4C,4 | F,4B,2A,2 G,4F,4 | B,4A,4 G,4F,4 |
[V:1] [ceg]8 [Ac]4[Af]4 | [Ge]fed[Ac]4 [dg]4[ce]4 | [Aa]4[df]4 [eb]4[ca]2b2 | [dg]4[cf]4 [Be]3f(6:4:6[Ag]fgfef |
[V:2] C4C,4 F,4F,,4 | C,4A,,4 B,,4C,4 | F,4B,2A,2 G,4F,4 | B,4A,4 G,4F,4 |
[V:1] [ceg]8 c4[gc']4 | [ca]4f4 [Gd]4[Bg]4 | [Ge]fed[Ac]4 [Ff]4[Be]2d2 | [A^c]4[Ad]3e E4(6:4:6[Ed]^cd^c=B^c |
[V:2] C4C,4 E,4C,4 | F,4A,4 B,4G,4 | C4A,4 D4G,4 | A,4F,4 G,4A,4 |
[V:1] [Fd]8 [Gd]4[Bg]4 | [Ge]fed[Ac]4 [dg]4[ca]3b | [fa]bab[cg]4 [fg]ab2[fg]3b | [dg]4[cf]3g [EG]4[Ge]4 |
[V:2] D,4D4 B,4G,4 | C4A,4 B,4E4 | F4E4 D4C4 | B,4A,3B, C4C,4 |
[V:1] [Af]8 c4[gc']4 | [ca]4f4 [Gd]4[Bg]4 | [Ge]fed[Ac]4 [Ff]4[Be]2d2 | [A^c]4[Ad]3e E4(6:4:6[Ed]^cd^c=B^c |
[V:2] F,8 E,4C,4 | F,4A,4 B,4G,4 | C4A,4 D4G,4 | A,4F,4 G,4A,4 |
[V:1] [Fd]8 [Gd]4[Bg]4 | [Ge]fed[Ac]4 [dg]4[ca]3b | [fa]bab[cg]4 [fg]ab2[fg]3b | [dg]4[cf]3g [EG]4[Ge]4 |
[V:2] D,4D4 B,4G,4 | C4A,4 B,4E4 | F4E4 D4C4 | B,4A,3B, C4C,4 |
[V:1] [Af]8 c2A2F2f2 | e2c2f2A2 G2g2(5:4:5efedc | a2f2c2a2 b2f2e2a2 | g2d2c2f2 e2B2A2f2 |
[V:2] F,8 F,4A,4 | C4D4 B,4C4 | F,4E4 D4C4 | B,4A,4 G,4F,4 |
[V:1] g2e2f2g2 c2A2F2f2 | e2c2f2A2 G2g2(5:4:5efedc | a2f2c2a2 b2f2e2a2 | g2d2c2f2 e2B2A2f2 |
[V:2] C4E,4 F,4A,4 | C4D4 B,4C4 | F,4E4 D4C4 | B,4A,4 G,4F,4 |
[V:1] g2e2f2g2 c2e2g2c'2 | a2f2c2f2 d2B2G2g2 | e2c2A2e2 f2d2b2d2 | ^c2A2d2G2 F2d2E2^c2 |
[V:2] C4E,4 C,4E,4 | F,4A,4 B,4=B,4 | C4^C4 D4G,4 | A,4B,4 A,4A,,4 |
[V:1] d2D2F2A2 d2g2f2g2 | e2c2f2c2 g2c'2b2c'2 | a2c2g2c2 f2b2e2a2 | d2g2c2f2 G2f2c2e2 |
[V:2] D,4D4 B,4G,4 | C4A,4 E,4C,4 | F,4E,4 D,4C,4 | B,,4A,,4 B,,4C,4 |
[V:1] f2F2A2B2 c2e2g2c'2 | a2f2c2f2 d2B2G2g2 | e2c2A2e2 f2d2b2d2 | ^c2A2d2G2 F2d2E2^c2 |
[V:2] [F,,F,]8 C,4E,4 | F,4A,4 B,4=B,4 | C4^C4 D4G,4 | A,4B,4 A,4A,,4 |
[V:1] d2D2F2A2 d2g2f2g2 | e2c2f2c2 g2c'2b2c'2 | a2c2g2c2 f2b2e2a2 | d2g2c2f2 G2f2c2e2 |
[V:2] D,4D4 B,4G,4 | C4A,4 E,4C,4 | F,4E,4 D,4C,4 | B,,4A,,4 B,,4C,4 |
[V:1] f2F2A2B2 [Ac]4[Ff]4 | [ce]4f4 [dg]4[c-e]4 | [ca]4[df]4 b4[ca]4 | [dg]4f4 [Ge]4(6:4:6[cg]fgfef |
[V:2] [F,,F,]8 F,2G,2A,2B,2 | C2B,2A,2F,2 B,2G,2C2C,2 | F,2A,2B,2A,2 G,2E2F2A,2 | B,2C2D2B,2 C2G,2A,2F,2 |
[V:1] [ceg]8 [Ac]4[Ff]4 | [ce]4f4 [dg]4[c-e]4 | [ca]4[df]4 b4[ca]4 | [dg]4f4 [Ge]4(6:4:6[cg]fgfef |
[V:2] C2E,2F,2G,2 F,2G,2A,2B,2 | C2B,2A,2F,2 B,2G,2C2C,2 | F,2A,2B,2A,2 G,2E2F2A,2 | B,2C2D2B,2 C2G,2A,2F,2 |
[V:1] [ceg]8 [Gc]4[cc']4 | [ca]babf4 [Gd]4[dg]4 | [Ge]fed[Ac]4 [Af]4[Be]2d2 | [E^c]4[Ad]4 [B,E]4[EA^c]4 |
[V:2] C2E,2F,2G,2 E,2D,2E,2C,2 | F,2G,2A,2F,2 B,2A,2B,2G,2 | C2C,2F,2E,2 D,2F,2G,2B,2 | A,2G,2F,2D,2 G,2E,2A,2G,2 |
[V:1] [FAd]8 [Gd]4[dg]4 | [Ge]fedc4 [cg]4[gc']4 | [ca]babg4 [fb]4[ea]4 | [dg]4[cf]4 [DG]4[Gce]4 |
[V:2] F,2E,2D,2C,2 B,,2A,,2B,,2G,,2 | C,2D,2E,2F,2 E,2D,2E,2C,2 | F,2F2E2C2 D2D,2C2C,2 | B,2B,,2A,2A,,2 B,,2G,,2C,2C,,2 |
[V:1] [Acf]8 [Gc]4[cc']4 | [ca]babf4 [Gd]4[dg]4 | [Ge]fed[Ac]4 [Af]4[Be]2d2 | [E^c]4[Ad]4 [B,E]4[EA^c]4 |
[V:2] F,,2A,,2C,2F,2 E,2D,2E,2C,2 | F,2G,2A,2F,2 B,2A,2B,2G,2 | C2C,2F,2E,2 D,2F,2G,2B,2 | A,2G,2F,2D,2 G,2E,2A,2G,2 |
[V:1] [FAd]8 [Gd]4[dg]4 | [Ge]fedc4 [cg]4[gc']4 | [ca]babg4 [fb]4[ea]4 | [dg]4[cf]4 [DG]4[Gce]4 |
[V:2] F,2E,2D,2C,2 B,,2A,,2B,,2G,,2 | C,2D,2E,2F,2 E,2D,2E,2C,2 | F,2F2E2C2 D2D,2C2C,2 | B,2B,,2A,2A,,2 B,,2G,,2C,2C,,2 |
[V:1] [Acf]16 |]
[V:2] F,16 |]`;

export default {
  summary: "An Air in F major with two variations, from Handel's Aylesford Pieces, all 73 bars in 4/4 with every repeat written out. Bar 1 holds the half-bar pickup, padded with rests, so each half of the tune starts on beat 3. Twelve sections: the Theme, Variation I and Variation II each have an A half (4 bars, played twice) and a B half (8 bars, played twice). Theme: bars 1–25. Variation I, steady eighths in the right hand: bars 26–49. Variation II, the tune back in quarters over eighths in the left hand: bars 50–73.",
  steps: [
    "Theme A alone, right hand in wait mode. It is two voices, the tune above and a second line in quarters below, so most beats are two notes. Bar 4 ends with six quick notes in the time of one beat, G–F–G–F–E–F: a written-out turn.",
    "Theme B, then the left hand alone in quarters. Bars 12 and 20 have C sharp and B natural in the right hand as the music turns to D minor.",
    "Variation I right hand alone: even eighths that outline the tune. Bar 26 ends with five sixteenths in one beat, E–F–E–D–C; let them fall evenly into bar 27.",
    "Variation II has the left hand in eighths under the theme's two voices. Learn it hands separately, then play-along with the click at 56. Each clean pass nudges the tempo up toward 92.",
  ],
  watch: [
    "In Variation II the right hand's lower C is tied from bar 50 into bar 51: hold it, don't strike it again.",
    "B flat is in the key signature. In Variation I's B half the left hand goes B flat then B natural in bar 34, and C then C sharp in bar 35.",
  ],
  source: { label: "Mutopia Project — Handel, Air with variations (Aylesford Pieces, Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=165" },
  score: {
    bpm: 56, target: 92,
    sections: [
      { name: "Theme A", from: 1, to: 5 }, { name: "Theme A again", from: 6, to: 9 }, { name: "Theme B", from: 10, to: 17 }, { name: "Theme B again", from: 18, to: 25 },
      { name: "Var. I A", from: 26, to: 29 }, { name: "Var. I A again", from: 30, to: 33 }, { name: "Var. I B", from: 34, to: 41 }, { name: "Var. I B again", from: 42, to: 49 },
      { name: "Var. II A", from: 50, to: 53 }, { name: "Var. II A again", from: 54, to: 57 }, { name: "Var. II B", from: 58, to: 65 }, { name: "Var. II B again", from: 66, to: 73 },
    ],
    abc: ABC,
  },
};

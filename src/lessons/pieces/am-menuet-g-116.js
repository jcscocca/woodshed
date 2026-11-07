// Menuet in G, BWV Anh. 116, from the Anna Magdalena Bach notebook (1725), in the Mutopia edition of the
// Bach-Gesellschaft text (public domain), 40 bars. Each half is played once, as the reference MIDI plays it.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Menuet in G
C:Anonymous (Anna Magdalena Bach notebook)
M:3/4
L:1/8
K:G
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] GBdg Af | g2 G2 G2 | GBdg Af | g2 G2 G2 |
[V:2] G,4 D,2 | G,,B,,D, G,D,B,, | G,,4 D,2 | G,,B,,D, G,D,B,, |
[V:1] e2 e2 eg | d2 d2 dg | c2 dc Bc | A6 |
[V:2] C,2 G,2 C,2 | B,,2 G,2 B,,2 | A,,2 F,2 G,2 | D,E,F, D,E,F, |
[V:1] GBdg Af | g2 G2 G2 | GBdg Af | g2 G2 G2 |
[V:2] G,4 D,2 | G,,B,,D, G,D,B,, | G,,4 D,2 | G,,B,,D, G,D,B,, |
[V:1] e2 dc BA | d2 cB AG | (3ABc D2 F2 | G6 ||
[V:2] C,2 E,2 G,2 | B,,2 D,2 G,2 | C,2 C,2 D,2 | G,2 D,2 G,,2 ||
[V:1] GABA GF | G2 E2 E2 | gfeg fe | f2 B2 B2 |
[V:2] E,2 ^D,2 B,,2 | E,2 B,,2 E,,2 | E,2 G,2 B,2 | B,,^D,F, B,F,^D, |
[V:1] gfeg fe | f2 B2 e2 | (3fga B2 ^d2 | e2 ^de f2 |
[V:2] E,2 G,2 B,2 | B,,2 A,2 G,2 | A,2 B,2 B,,2 | E,6 |
[V:1] g2 gf ed | e2 ed cB | c2 cB AG | F2 EF D2 |
[V:2] B,,2 D,2 G,2 | C,2 D,2 E,2 | A,,2 B,,2 C,2 | D,2 A,,2 D,,2 |
[V:1] A2 D2 D2 | B2 D2 D2 | c2 dc Bc | A6 |
[V:2] F,D, F,D, F,D, | G,D, G,D, G,D, | F,2 D,2 G,2 | D,E,F, D,E,F, |
[V:1] GBdg Af | g2 G2 G2 | GBdg Af | g2 G2 G2 |
[V:2] G,4 D,2 | G,,B,,D, G,D,B,, | G,,4 D,2 | G,,B,,D, G,D,B,, |
[V:1] e2 dc BA | d2 cB AG | AB D2 F2 | G6 |]
[V:2] C,2 E,2 G,2 | B,,2 D,2 G,2 | C,4 D,2 | G,2 D,2 G,,2 |]`;

export default {
  summary: "Menuet in G major, BWV Anh. 116, from the 1725 notebook of Anna Magdalena Bach, all 40 bars in 3/4. Five sections: A1 (bars 1–8) ends on the dominant, A2 (9–16) ends home in G; B1 (17–24) turns to E minor, B2 (25–32) leads back through D, and A3 (33–40) brings back A2. The original repeats each half; here you play each half once.",
  steps: [
    "Right hand alone in A1, in wait mode. Bars 1 and 3 climb a G major chord and then jump down from G to A and up to F sharp; bars 2 and 4 drop an octave from G to G. Look at the leaps before you play them.",
    "Left hand alone in A1. Bars 2 and 4 are broken G chords in eighths, G–B–D–G–D–B; bar 8 is D–E–F sharp twice. Keep the eighths even under the right hand's quarters.",
    "B1 and B2 a section at a time, hands together in wait mode. Bar 20 has D sharp in the left hand's broken chord, and bars 23 and 24 have D sharp in the right hand; in bars 29 and 30 the left hand rocks between two notes in eighths.",
    "Play-along with the click at 72. Each clean pass nudges the tempo up toward 112.",
  ],
  watch: [
    "F sharp is in the key signature. D sharp is written in bars 17, 20, 23 and 24, where the music is in E minor.",
    "Bars 15 and 23 start with a triplet: three even notes in the first beat. Bar 39, the same cadence as bar 15, has two plain eighths instead.",
  ],
  source: { label: "Mutopia Project — Bach, Menuet in G, BWV Anh. 116 (Bach-Gesellschaft)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=77" },
  score: {
    bpm: 72, target: 112,
    sections: [{ name: "A1", from: 1, to: 8 }, { name: "A2", from: 9, to: 16 }, { name: "B1", from: 17, to: 24 }, { name: "B2", from: 25, to: 32 }, { name: "A3", from: 33, to: 40 }],
    abc: ABC,
  },
};

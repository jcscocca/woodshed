// Handel, Menuet I in F from the Aylesford Pieces, from the Mutopia edition of the Schott 1930 print. The
// edition's 3/8 is written as 3/4, two printed bars to a bar; the eighth-note pickup is padded into a full
// first bar, the repeat of the first half is written out, and the right hand's two voices share one staff.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Menuet I
C:George Frideric Handel
M:3/4
L:1/16
K:F
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z10 [Ac]2 | [FA]3/2B/2[Ac]2[Ac]2 [FA]3/2B/2[Ac]2[Ac]2 | [Fd]2[Bf]2[Ge]2 [cf]2[Ae]d[Gc]2 | [Ad]2[Fc]=BAG [cg]2[Gf]e[Ed]c |
[V:2] z10 F,2 | F,,2F,2F,2 F,,2F,2F,2 | B,2G,2C2 A,2F,2E,2 | F,2D,2G,2 E,2G,2A,2 |
[V:1] [Ac]2[Ge]d[Dc]d [Ec]4[Ac]2 | [FA]3/2B/2[Ac]2[Ac]2 [FA]3/2B/2[Ac]2[Ac]2 | [Fd]2[Bf]2[Ge]2 [cf]2[Ae]d[Gc]2 | [Ad]2[Fc]=BAG [cg]2[Gf]e[Ed]c |
[V:2] F,2G,2G,,2 C,2C2F,2 | F,,2F,2F,2 F,,2F,2F,2 | B,2G,2C2 A,2F,2E,2 | F,2D,2G,2 E,2G,2A,2 |
[V:1] [Ac]2[Ge]d[Dc]d [Ec]4[Ec]2 | [Ff]2[Gf]e[Af]d [Gcg]2[Gc]2B2 | [FA]2[CB]AGF [Ec]2[df]e[cf]2 | [Fd]2[Dc]B[EA]G [DF]E[B,F]2[CB]2 |
[V:2] F,2G,2G,,2 C,2C2B,2 | A,2G,2F,2 E,2C,D,E,C, | F,2E,2D,2 [C,C]2[B,,B,]2[A,,A,]2 | [B,,B,]2B,,2C,2 D,2D,2E,2 |
[V:1] [FA]G[FG]2EF [A,F]4[Ec]2 | [Ff]2[Gf]e[Af]d [Gcg]2[Gc]2B2 | [FA]2[CB]AGF [Ec]2[df]e[cf]2 | [Fd]2[Dc]B[EA]G [DF]E[B,F]2[CB]2 |
[V:2] F,2C,2C,,2 F,,4[B,,B,]2 | [A,,A,]2[G,,G,]2[F,,F,]2 [E,,E,]2C,D,E,C, | F,2E,2D,2 C,2[B,,B,]2[A,,A,]2 | [B,,B,]2[B,,,B,,]2[C,,C,]2 [D,,D,]2[D,,D,]2[E,,E,]2 |
[V:1] [FA]G[FG]2EF [A,F]6 |]
[V:2] [F,,F,]2[C,,C,]2C,,2 [F,,,F,,]6 |]`;

export default {
  summary: "Menuet I in F major from Handel's Aylesford Pieces, all 17 bars, played before Menuet II. The edition is in 3/8; here two printed bars make one 3/4 bar. Bar 1 holds the eighth-note pickup, padded with rests. Four sections: A (bars 1–5), A again (6–9), B (10–13) and B′ (14–17). The original repeats the first half, written out here; the second half is printed twice, the second time with the left hand in octaves.",
  steps: [
    "Right hand alone in A, in wait mode. It plays two voices: the upper one carries the tune and the lower one moves in thirds and sixths under it. In bar 2 the short A–B flat before each C is a dotted sixteenth and a thirty-second, quick and light.",
    "Left hand alone. In A and B it is one line of eighths; in B′ (bars 14–17) the same line is mostly in octaves, so shape each octave before you play it.",
    "Hands together in B, a half bar at a time. Bar 11 ends with three left-hand octaves stepping down, C, B flat, A.",
    "Play-along with the click at 60. Each clean pass nudges the tempo up toward 100.",
  ],
  watch: [
    "B flat is in the key signature. The B in bars 4 and 8, just after the C, is B natural.",
    "The right hand's lower voice sometimes holds while the upper voice moves, as on the F under the C–B–A–G in bar 4; the score writes both voices as chords on one staff, so keep the held note down.",
  ],
  source: { label: "Mutopia Project — Handel, Menuet I (Aylesford Pieces, Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=163" },
  score: {
    bpm: 60, target: 100,
    sections: [{ name: "A", from: 1, to: 5 }, { name: "A again", from: 6, to: 9 }, { name: "B", from: 10, to: 13 }, { name: "B′", from: 14, to: 17 }],
    abc: ABC,
  },
};

// Handel, Menuet (Trio), from the Aylesford Pieces, Mutopia edition of the Schott 1930 print (public
// domain), 24 bars. The original repeats each half; here each half is played once.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Menuet (Trio)
C:George Frideric Handel
M:3/4
L:1/8
K:Am
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] e2 A2 ^G2 | Ac [EB]4 | [Ec]2 dc [FB]A | [E^G]2 ^F^G [^G,E]2 |
[V:2] [A,-C]4 [A,B,]2 | [A,C]2 ^G,2 E,2 | A,4 D,2 | E,2 B,,2 E,,2 |
[V:1] [ce]2 [Ad]c [EB]A | [^Gd]2 [Ec]B A^G | [CA]B [Ac]2 [^GB]A | A6 |
[V:2] A,,2 C,2 E,2 | B,,2 D,2 E,2 | F,2 D,2 E,2 | A,2 E,2 A,,2 |
[V:1] [CG]2 [Dc]B [Ec]2 | [DG]2 [Gd]c [Bd]2 | [EG]2 [df]2 [ce]f | [Bd-]2 [Ad-]2 [Gd]2 |
[V:2] E,2 D,2 C,2 | B,,2 A,,2 G,,2 | C,2 B,,2 C,2 | G,,2 A,,2 B,,2 |
[V:1] [G-e][G-f] [G-d][Ge] [E-c][E-d] | [E-B][Ec] [C-A][C-B] [CG]2 | [A,F]E [CD-]2 [B,D]C | [E,G,C]6 |
[V:2] C,2 B,,2 A,,2 | G,,2 F,,2 E,,2 | F,,2 G,,4 | C,2 G,,2 C,,2 |
[V:1] cd e2 ^G2 | [CA]c [EB]4 | [Ec]2 dc [FB]A | [E^G]2 ^F^G [^G,E]2 |
[V:2] [A,-E]2 [A,-C]2 [A,B,]2 | A,2 ^G,2 E,2 | A,4 D,2 | E,2 B,,2 E,,2 |
[V:1] [CE]2 [A,A]^G [CA]2 | [B,D]2 [B,A]^G [DA]2 | C2 [A,D]C [^G,B,]C | A,6 |]
[V:2] A,,2 C,2 E,2 | B,,2 D,2 E,2 | A,2 D,2 E,2 | A,,6 |]`;

export default {
  summary: "Handel's Menuet (Trio) in A minor, from the Aylesford Pieces, all 24 bars of 3/4. A two-part right hand, a tune with a lower line of thirds and sixths, over a left hand in plain quarter notes. Three sections: A (bars 1–8), which ends in A minor; B (9–16), in C major; and A′ (17–24), which brings back the opening and closes in A minor. The original repeats bars 1–8 and bars 9–24; here you play each part once.",
  steps: [
    "Left hand alone, all the way through, in wait mode. It moves mostly in quarter notes, one a beat, with a low A held through bars 1 and 17 under the notes above it.",
    "Right hand alone in A. Where the tune and a lower note start together, strike them as one, then let the tune move on in eighths; keep the eighths even, D–C in bar 3, and D–C then B–A in bar 5.",
    "B moves to C major and has no sharps. In bar 12 the right hand holds D on top while B, A and G step down underneath; in bars 13–14 the tune falls in eighths over held lower notes.",
    "Play-along with the click at 60. Each clean pass nudges the tempo up toward 92.",
  ],
  watch: [
    "G sharp is written in throughout A and A′, including the low G sharp in the right hand in bars 4, 20 and 23. In B the G is natural.",
    "In bars 13 and 14 the right hand's lower notes, G, E and C, are tied under the moving eighths; keep each one down until the next.",
  ],
  source: { label: "Mutopia Project — Handel, Menuet (Trio) (Aylesford Pieces, Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=168" },
  score: {
    bpm: 60, target: 92,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }, { name: "A′", from: 17, to: 24 }],
    abc: ABC,
  },
};

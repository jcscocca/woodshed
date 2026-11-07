// Handel, Allemande in A minor from the Aylesford Pieces, from the Mutopia edition of the Schott 1930 print.
// The sixteenth-note pickup is padded into a full first bar, and both repeats are written out.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Allemande
C:George Frideric Handel
M:4/4
L:1/16
K:Am
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z8z4z2zA | [A-CE]4[A]ABc B4-Bede | zcde f^GAB ^G6ed | eAGA EGFE F4-FABc |
[V:2] z16 | A,2E,2A,,4 ^G,2^F,2^G,2E,2 | A,2G,2F,2D,2 E,2E,,2E,2D,2 | ^C,2E,2A,2A,,2 D,F,A,F, D,2=C,2 |
[V:1] dGFG DGED E4-Ecde | dgfg cfBe Adcd BGAB | ABcd B3c [EGc]6cB | AG^FE ^DB,^C^D E^FG^F [^D^F]/2G/2^F/2G/2^Fz/2E/2 |
[V:2] B,,2D,2G,2G,,2 C,E,G,E, C,4 | B,,2B,2A,2G,2 F,2^F,2G,2E,2 | F,2D,2G,2G,,2 C,G,CB, CB,A,G, | A,2C2B,zA,2 G,2A,2B,2B,,2 |
[V:1] EB,G,3E^F,^D [G,B,E]4z3A | [A-CE]4[A]ABc B4-Bede | zcde f^GAB ^G6ed | eAGA EGFE F4-FABc |
[V:2] E,,3B,, E,2B,,2 E,2E,,2 z3z | A,2E,2A,,4 ^G,2^F,2^G,2E,2 | A,2G,2F,2D,2 E,2E,,2E,2D,2 | ^C,2E,2A,2A,,2 D,F,A,F, D,2=C,2 |
[V:1] dGFG DGED E4-Ecde | dgfg cfBe Adcd BGAB | ABcd B3c [EGc]6cB | AG^FE ^DB,^C^D E^FG^F [^D^F]/2G/2^F/2G/2^Fz/2E/2 |
[V:2] B,,2D,2G,2G,,2 C,E,G,E, C,4 | B,,2B,2A,2G,2 F,2^F,2G,2E,2 | F,2D,2G,2G,,2 C,G,CB, CB,A,G, | A,2C2B,zA,2 G,2A,2B,2B,,2 |
[V:1] EB,G,3E^F,^D [G,B,E]4z3B | B^GE3dcB cAE3ed^c | dede (6:4:6fefede fdA3AB^c | defe dcBA BcBA G3F |
[V:2] E,,3B,, E,2B,,2 E,2E,,2 z3z | E,3^F, ^G,2E,2 A,3E, A,,2=G,2 | F,2D,2^C,2A,,2 D,3A,, D,,4 | D,2E,2F,2D,2 G,A,G,F, E,F,E,D, |
[V:1] EGcE DcDB cGE3E^FG | ^FAd3^F^GA ^G6ed | cd/2e/2AcBeEB cd/2e/2AcBeEB | cd/2e/2A3dAc Bc/2d/2G3cG_B |
[V:2] C,2E,F, G,2G,,2 C,3G, C2C,2 | D,3A, D2D,2 E,B,ED EDCB, | A,4 ^G,2E,2 A,2A,,2 ^G,2E,2 | A,3G, ^F,2D,2 G,3=F, E,2C,2 |
[V:1] A^GA3cBA ^GEAeEcEd | cBA^G Eedc BAB/2c/2^G/2A/2^G/2A/2 ^G2z/2A/2 | AEC3AB,^G AEC2z3B | B^GE3dcB cAE3ed^c |
[V:2] F,3E, D,2^D,2 E,2C,2 ^G,,2A,,2 | D,2F,2E,2^G,2 A,2D,2E,2E,,2 | A,,3E,, A,,2E,,2 A,,3E,, A,,,2zz | E,3^F, ^G,2E,2 A,3E, A,,2=G,2 |
[V:1] dede (6:4:6fefede fdA3AB^c | defe dcBA BcBA G3F | EGcE DcDB cGE3E^FG | ^FAd3^F^GA ^G6ed |
[V:2] F,2D,2^C,2A,,2 D,3A,, D,,4 | D,2E,2F,2D,2 G,A,G,F, E,F,E,D, | C,2E,F, G,2G,,2 C,3G, C2C,2 | D,3A, D2D,2 E,B,ED EDCB, |
[V:1] cd/2e/2AcBeEB cd/2e/2AcBeEB | cd/2e/2A3dAc Bc/2d/2G3cG_B | A^GA3cBA ^GEAeEcEd | cBA^G Eedc BAB/2c/2^G/2A/2^G/2A/2 ^G2z/2A/2 |
[V:2] A,4 ^G,2E,2 A,2A,,2 ^G,2E,2 | A,3G, ^F,2D,2 G,3=F, E,2C,2 | F,3E, D,2^D,2 E,2C,2 ^G,,2A,,2 | D,2F,2E,2^G,2 A,2D,2E,2E,,2 |
[V:1] AEC3AB,^G AEC2z3z |]
[V:2] A,,3E,, A,,2E,,2 A,,3E,, A,,,2zz |]`;

export default {
  summary: "An Allemande in A minor from Handel's Aylesford Pieces, all 37 bars in 4/4: a running sixteenth-note line in the right hand over a left hand in eighths. Bar 1 holds the sixteenth-note pickup, padded with rests, so each half starts on the last sixteenth of a bar. Four sections: A (bars 1–9), A again (10–17), B (18–27) and B again (28–37). The original repeats both halves; both repeats are written out here.",
  steps: [
    "Right hand alone in A, in wait mode. In bars 2, 4 and 5 a long note is tied to a sixteenth; hold through the tie and come in on the next sixteenth.",
    "Left hand alone in A. It is mostly even eighths; in bars 4 and 5 it has a group of four sixteenths, and in bar 7 a run of eight. Bar 9 is the cadence on E: a dotted eighth, then a sixteenth B, then E and B.",
    "B a bar at a time. Bar 19 has six notes in one beat, F–E–F–E–D–E; in bar 23 two thirty-seconds follow the C that starts each half bar, and in bar 24 they follow the first C and the B. Count each pair as one quick turn into the next note.",
    "Play-along with the click at 48. Each clean pass nudges the tempo up toward 76.",
  ],
  watch: [
    "G sharp is the leading note of A minor and is written in each time, as are F sharp, D sharp and C sharp when the music turns to E minor in bar 8. Bar 24 has a B flat on its last sixteenth.",
    "The edition marks a short trill on the dotted B in bars 7 and 15; the score writes the main note alone. Add it once the notes are secure.",
  ],
  source: { label: "Mutopia Project — Handel, Allemande (Aylesford Pieces, Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=166" },
  score: {
    bpm: 48, target: 76,
    sections: [{ name: "A", from: 1, to: 9 }, { name: "A again", from: 10, to: 17 }, { name: "B", from: 18, to: 27 }, { name: "B again", from: 28, to: 37 }],
    abc: ABC,
  },
};

// Handel, Air in B flat from the Aylesford Pieces, from the Mutopia edition of the Schott 1930 print. The
// edition's 3/8 is written as 3/4, two printed bars to a bar, and both repeats are written out.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Air
C:George Frideric Handel
M:3/4
L:1/16
K:Bb
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] b2agfe d4e2 | f2edcB A4B2 | cBcdec d4d2 | g2d=efd =e4g2 |
[V:2] B,,6 B,2A,G,F,E, | D,4E,2 F,2E,D,C,B,, | A,,4F,2 B,2DCB,A, | G,4G,2 C2G,A,B,G, |
[V:1] c'2gabg a2c2f2 | [dg]a[G=e]3f [Af]6 | b2agfe d4e2 | f2edcB A4B2 |
[V:2] A,2B,2C2 F2=E2D2 | B,2C2C,2 F,2A,2F,2 | B,,6 B,2A,G,F,E, | D,4E,2 F,2E,D,C,B,, |
[V:1] cBcdec d4d2 | g2d=efd =e4g2 | c'2gabg a2c2f2 | [dg]a[G=e]3f [Af]6 |
[V:2] A,,4F,2 B,2DCB,A, | G,4G,2 C2G,A,B,G, | A,2B,2C2 F2=E2D2 | B,2C2C,2 F,2A,2F,2 |
[V:1] f2=edcB A4B2 | cBcdec d6 | b2ag^f=e d2g2[^Fc]2 | [G-B][GA][^FA]3G G6 |
[V:2] F,,6 F,2=E,D,C,B,, | A,,4F,2 B,2DCB,A, | G,4C2 B,4A,2 | G,2D2D,2 G,2B,A,G,F, |
[V:1] gfedcB A4c2 | f2defd g4a2 | bagfed gfedcB | [Gc]2[CA]3B [DB]6 |
[V:2] E,2C,2E,2 F,2A,G,F,E, | D,2B,,2D,2 E,2EDC2 | D2B,2D,2 E,2F,2G,2 | E,2F,2F,,2 B,,,2D,,2F,,2 |
[V:1] f2=edcB A4B2 | cBcdec d6 | b2ag^f=e d2g2[^Fc]2 | [G-B][GA][^FA]3G G6 |
[V:2] F,,6 F,2=E,D,C,B,, | A,,4F,2 B,2DCB,A, | G,4C2 B,4A,2 | G,2D2D,2 G,2B,A,G,F, |
[V:1] gfedcB A4c2 | f2defd g4a2 | bagfed gfedcB | [Gc]2[CA]3B [DB]6 |]
[V:2] E,2C,2E,2 F,2A,G,F,E, | D,2B,,2D,2 E,2EDC2 | D2B,2D,2 E,2F,2G,2 | E,2F,2F,,2 [B,,,B,,]6 |]`;

export default {
  summary: "An Air in B flat major from Handel's Aylesford Pieces, a two-part piece in which the left hand answers the right in imitation, all 28 bars. The edition is in 3/8; here two printed bars make one 3/4 bar, so each bar holds two short phrases. Four sections: A (bars 1–6), A again (7–12), B (13–20) and B again (21–28). Both halves repeat in the original and are written out here; bar 20 is the first ending and bar 28 the second.",
  steps: [
    "Right hand alone in A, in wait mode. Bars 1 and 2 each start with a strong note, fall by step in sixteenths and land on a held note; bar 1 opens on high B flat and lands on D.",
    "Left hand alone in A. In bar 1 it plays the right hand's opening figure half a bar late and two octaves lower, after a held B flat, then the falling sixteenths. Listen for the same shape passing between the hands.",
    "Hands together in B, a half bar at a time. Bars 15–16 turn toward G minor with F sharps; in bar 16 the right hand holds G under B flat and A, then F sharp under A.",
    "Play-along with the click at 60. Each clean pass nudges the tempo up toward 100.",
  ],
  watch: [
    "B flat and E flat are in the key signature, but the A section turns to F major: the right hand's Es in bars 4–6 are E natural, and so is the left hand's in bar 5. Bar 13 starts on F in both hands and uses E natural in their descending lines; E flat returns in the right hand in bar 14 and the left in bar 17.",
    "The edition marks short trills on the E in bars 6 and 12 and on the A in bars 20 and 28; the score writes the main notes alone. Add the trills once the notes are secure.",
  ],
  source: { label: "Mutopia Project — Handel, Air (Aylesford Pieces, Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=162" },
  score: {
    bpm: 60, target: 100,
    sections: [{ name: "A", from: 1, to: 6 }, { name: "A again", from: 7, to: 12 }, { name: "B", from: 13, to: 20 }, { name: "B again", from: 21, to: 28 }],
    abc: ABC,
  },
};

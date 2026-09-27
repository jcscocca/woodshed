// Minuet in G minor, BWV Anh. 115 (Christian Petzold), from the Bach-Gesellschaft edition.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Minuet in G minor
C:Christian Petzold
M:3/4
L:1/8
K:Gm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] b2 a2 g2 | a2 d2 d2 | g2 GABc | d6 |
[V:2] G,6 | F,6 | E,6 | D,2 DC B,A, |
[V:1] e2 fedc | d2 edcB | c2 dcBc | A6 |
[V:2] [G,B,]4 A,2 | B,4 G,2 | A,2 ^F,2 G,2 | D,2 DC B,A, |
[V:1] b2 a2 g2 | a2 d2 d2 | g2 GABc | d6 |
[V:2] G,6 | F,6 | E,6 | D,2 DC =B,A, |
[V:1] f2 gfed | e2 fedc | d2 g2 c2 | [DFB]6 ||
[V:2] [=B,D]4 G,2 | C2 A,2 F,2 | B,2 E,2 [F,A,]2 | B,2 B,,4 ||
[V:1] d2 Bcd=e | f2 g2 a2 | b2 gabg | a2 ga f2 |
[V:2] B,6 | A,2 G,2 F,2 | G,2 =E,2 C,2 | F,4 z2 |
[V:1] FGABcd | e2 d2 c2 | f2 B2 A2 | B6 |
[V:2] A,2 G,2 F,2 | G,2 F,2 E,2 | D,2 E,2 F,2 | B,,2 D2 C2 |
[V:1] G2 dc d2 | G2 ed e2 | Gd^Fc GB | A4 z2 |
[V:2] [=B,D]6 | C6 | B,2 A,2 G,2 | D2 A,G, ^F,=E, |
[V:1] D=E^FGAB | c2 B2 A2 | Bc/d/ G2 ^F2 | [B,DG]6 |]
[V:2] D,4 z2 | E,2 D,2 C,2 | B,,2 C,2 D,2 | G,2 G,,4 |]`;

export default {
  summary: "The Minuet in G minor (Christian Petzold, from the Anna Magdalena Bach notebook), the G major Minuet's partner, all 32 bars with its original left hand. Four sections: A1 (bars 1–8), A2 (9–16), B1 (17–24) and B2 (25–32). The original repeats each half; here you play each half once.",
  steps: [
    "Pick section A1. Wait mode, right hand only: the tune starts high on B flat and drops an octave in bar 3 — find each note before you worry about time.",
    "Then the left hand alone. In the first half it mostly holds a note for the whole bar; in the second half it walks in quarter notes under the tune.",
    "Both hands in wait mode, a section at a time. A2 opens like A1 but ends on a B flat chord; B1 and B2 are new, so give them more passes.",
    "Switch to play-along with the click at 66. Each clean pass nudges the tempo up toward 100.",
  ],
  watch: [
    "The key signature has two flats, B flat and E flat, but the F sharp that G minor needs isn't in it — it's written in each time (bars 7, 27–29 and 31). The second half also has E naturals (bars 17, 19, 28, 29), and the left hand has B naturals in bars 12, 13 and 25.",
    "The edition's ornaments — trills and mordents in bars 8, 9, 13, 15, 22 and 31 — are left off the score. Add them once the notes are secure.",
  ],
  source: { label: "Mutopia Project — Menuet in G minor, BWV Anh. 115 (Bach-Gesellschaft)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=76" },
  score: {
    bpm: 66, target: 100,
    sections: [{ name: "A1", from: 1, to: 8 }, { name: "A2", from: 9, to: 16 }, { name: "B1", from: 17, to: 24 }, { name: "B2", from: 25, to: 32 }],
    abc: ABC,
  },
};

// Minuet in G, BWV Anh. 114 (Christian Petzold), from the Bach-Gesellschaft edition.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Minuet in G
C:Christian Petzold
M:3/4
L:1/8
K:G
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 |
[V:2] [G,B,D]4 A,2 | B,6 | C6 | B,6 |
[V:1] c2 dcBA | B2 cBAG | F2 GABG | A6 |
[V:2] A,6 | G,6 | D2 B,2 G,2 | D2 D,CB,A, |
[V:1] d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 |
[V:2] B,4 A,2 | G,2 B,2 G,2 | C6 | B,2 CB,A,G, |
[V:1] c2 dcBA | B2 cBAG | A2 BAGF | G6 ||
[V:2] A,4 F,2 | G,4 B,2 | C2 D2 D,2 | G,4 G,,2 ||
[V:1] b2 gabg | a2 defd | g2 efgd | ^c2 Bc A2 |
[V:2] G,6 | F,6 | E,2 G,2 E,2 | A,4 A,,2 |
[V:1] AB^cdef | g2 f2 e2 | f2 A2 ^c2 | d6 |
[V:2] A,6 | B,2 D2 ^C2 | D2 F,2 A,2 | D2 D,2 =C2 |
[V:1] d2 GF G2 | e2 GF G2 | d2 c2 B2 | AGFG A2 |
[V:2] B,2 D2 B,2 | C2 E2 C2 | B,2 A,2 G,2 | D4 z2 |
[V:1] DEFGAB | c2 B2 A2 | Bd G2 F2 | [B,DG]6 |]
[V:2] D,4 F,2 | E,2 G,2 F,2 | G,2 B,,2 D,2 | G,2 D,2 G,,2 |]`;

export default {
  summary: "The Minuet in G major (Christian Petzold, from the Anna Magdalena Bach notebook), all 32 bars with its original left hand. Four sections: A1 (bars 1–8), A2 (9–16), B1 (17–24) and B2 (25–32). The original repeats each half; here you play each half once.",
  steps: [
    "Pick section A1. Wait mode, right hand only: find each note before you worry about time.",
    "Then the left hand alone. It's a second voice, not a bass of held chords: it moves when the right hand holds, and the two answer each other.",
    "Both hands in wait mode, a section at a time. A2's tune opens like A1's but ends home on G; B1 and B2 are new, so give them more passes.",
    "Switch to play-along with the click at 72. Each clean pass nudges the tempo up toward 100.",
  ],
  watch: [
    "Every F is F sharp — the key signature says so once, at the start. In B1 the music turns toward D major, and the Cs in bars 20–23 are C sharp too.",
    "The edition's ornaments — a few mordents, and a grace note into bar 8 — are left off the score. Add them once the notes are secure.",
  ],
  source: { label: "Mutopia Project — Menuet in G, BWV Anh. 114 (Bach-Gesellschaft)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=75" },
  score: {
    bpm: 72, target: 100,
    sections: [{ name: "A1", from: 1, to: 8 }, { name: "A2", from: 9, to: 16 }, { name: "B1", from: 17, to: 24 }, { name: "B2", from: 25, to: 32 }],
    abc: ABC,
  },
};

// Burgmüller, "Le Courant Limpide", Op. 100 No. 7, from the Collection Litolff edition. In bars 1–8 the
// edition writes the right hand's tune as quarter notes on the first note of each triplet; here it is
// folded into the triplets, which strike every one of those notes. The D.C. al Fine is written out:
// bars 17–24 are bars 1–8 again.
// ABC source is line-sensitive, so it lives at column 0.
const A = `[V:1] (3B,GD (3B,GD (3CAD (3A,FD | (3B,GD (3B,GD (3DBG (3GdB | (3Bgd (3Bgd (3cad (3Afd | (3Bgd (3Bed (3GcB (3DAG |
[V:2] G,,2 D,2 G,,2 D,2 | G,,2 D,2 G,,2 D,2 | G,,2 D,2 G,,2 D,2 | G,,2 D,2 G,,2 D,2 |
[V:1] (3B,GD (3B,GD (3CAD (3A,FD | (3B,GD (3B,GD (3DBG (3GdB | (3Bgd (3Bgd (3cad (3Afd | (3Bdg (3gbd' g'2 z2 |
[V:2] G,,2 D,2 G,,2 D,2 | G,,2 D,2 G,,2 D,2 | G,,2 D,2 G,,2 D,2 | G,,2 D,2 G,,2 z2 |`;
const ABC = `X:1
T:Le Courant Limpide
C:Friedrich Burgmüller
M:4/4
L:1/8
K:G
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
${A}
[V:1] (3zfA (3zfA (3zfA (3zfA | (3zgA (3zeA (3z^cA (3zdA | (3zeA (3zfA (3zgA (3zeA | (3zfA (3zeA (3zdA (3zeA |
[V:2] D2 A,2 ^C2 D2 | E2 ^C2 A,2 B,2 | ^C2 D2 E2 ^C2 | D2 G2 F2 E2 |
[V:1] (3zfA (3zfA (3zeA (3zfA | (3zgA (3zeA (3z^cA (3zdA | (3zeA (3zfA (3zgA (3z^cA | (3ded (3cBA (3GFE (3D^C=C |
[V:2] D2 A,2 ^C2 D2 | E2 ^C2 A,2 B,2 | ^C2 D2 E2 G2 | F2 z2 z4 |
${A.replace(/ \|$/, " |]")}`;

export default {
  summary: "Burgmüller's \"Le Courant Limpide\" (The Clear Stream), No. 7 of his 25 easy studies, Op. 100, all of it, 24 bars in G major and 4/4, nearly every beat a triplet of eighths. Three sections: A (bars 1–8), B (9–16) and A again (17–24). In A the right hand ripples in triplets over a left hand rocking between low G and D; in B the left hand has the tune and the right hand answers off the beat. The original repeats bars 1–8 and ends with a da capo back to the start, stopping at bar 8; here A is played once, then B, then A again written out.",
  steps: [
    "Right hand alone in bars 1–2, in wait mode. Each triplet starts on a tune note, B, B, C, A, then leaps up to the top note and falls back to D; give the first note of each group a little more weight and keep the other two light and even.",
    "Right hand alone in bars 3–4: the same figure an octave higher. The last two triplets of bar 2 climb to get there, so let the hand travel up with them rather than jumping at the bar line.",
    "B, left hand alone (bars 9–16): a tune in quarter notes, D–A–C sharp–D. Then the right hand alone: each beat is a rest on the triplet's first eighth, then a note and A below it. Hands together, the right hand's rest falls exactly on the left hand's note.",
    "Hands together, a section at a time, then play-along with the click at 60. Each clean pass nudges the tempo up toward 132.",
  ],
  watch: [
    "Every beat is a triplet; count three even eighths to a beat, not two plus one, and keep the left hand's quarters on the first note of each triplet.",
    "Bar 16 is a falling scale from D to C natural, with C sharp just before it; the C natural leads back to G major at bar 17.",
  ],
  source: { label: "Mutopia Project — Burgmüller, Le Courant Limpide, Op. 100 No. 7 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=216" },
  score: {
    bpm: 60, target: 132,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }, { name: "A again", from: 17, to: 24 }],
    abc: ABC,
  },
};

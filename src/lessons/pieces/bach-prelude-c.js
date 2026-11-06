// Bach, Prelude in C, BWV 846 (Well-Tempered Clavier, Book 1), from the Mutopia edition (public domain,
// printed source not named), 35 bars. The left hand's two held voices share the bass staff, as in the
// edition, and the right hand moves to the bass clef for bar 33.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Prelude in C
C:Johann Sebastian Bach
M:4/4
L:1/16
K:C
%%staves {1 (2 3)}
V:1 clef=treble stem=up
V:2 clef=bass
V:3 clef=bass
[V:1] z2 Gc eGce z2 Gc eGce | z2 Ad fAdf z2 Ad fAdf | z2 Gd fGdf z2 Gd fGdf | z2 Gc eGce z2 Gc eGce |
[V:2] zE3- E4 zE3- E4 | zD3- D4 zD3- D4 | zD3- D4 zD3- D4 | zE3- E4 zE3- E4 |
[V:3] C8 C8 | C8 C8 | B,8 B,8 | C8 C8 |
[V:1] z2 Ae aAea z2 Ae aAea | z2 ^FA dFAd z2 FA dFAd | z2 Gd gGdg z2 Gd gGdg | z2 EG cEGc z2 EG cEGc |
[V:2] zE3- E4 zE3- E4 | zD3- D4 zD3- D4 | zD3- D4 zD3- D4 | zC3- C4 zC3- C4 |
[V:3] C8 C8 | C8 C8 | B,8 B,8 | B,8 B,8 |
[V:1] z2 EG cEGc z2 EG cEGc | z2 D^F cDFc z2 DF cDFc | z2 DG BDGB z2 DG BDGB | z2 EG ^cEGc z2 EG cEGc |
[V:2] zC3- C4 zC3- C4 | zA,3- A,4 zA,3- A,4 | zB,3- B,4 zB,3- B,4 | z_B,3- B,4 zB,3- B,4 |
[V:3] A,8 A,8 | D,8 D,8 | G,8 G,8 | G,8 G,8 |
[V:1] z2 DA dDAd z2 DA dDAd | z2 DF BDFB z2 DF BDFB | z2 CG cCGc z2 CG cCGc | z2 A,C FA,CF z2 A,C FA,CF |
[V:2] zA,3- A,4 zA,3- A,4 | z_A,3- A,4 zA,3- A,4 | zG,3- G,4 zG,3- G,4 | zF,3- F,4 zF,3- F,4 |
[V:3] F,8 F,8 | F,8 F,8 | E,8 E,8 | E,8 E,8 |
[V:1] z2 A,C FA,CF z2 A,C FA,CF | z2 G,B, FG,B,F z2 G,B, FG,B,F | z2 G,C EG,CE z2 G,C EG,CE | z2 _B,C EB,CE z2 B,C EB,CE |
[V:2] zF,3- F,4 zF,3- F,4 | zD,3- D,4 zD,3- D,4 | zE,3- E,4 zE,3- E,4 | zG,3- G,4 zG,3- G,4 |
[V:3] D,8 D,8 | G,,8 G,,8 | C,8 C,8 | C,8 C,8 |
[V:1] z2 A,C EA,CE z2 A,C EA,CE | z2 A,C _EA,CE z2 A,C EA,CE | z2 B,C DB,CD z2 B,C DB,CD | z2 G,B, DG,B,D z2 G,B, DG,B,D |
[V:2] zF,3- F,4 zF,3- F,4 | zC,3- C,4 zC,3- C,4 | zF,3- F,4 zF,3- F,4 | zF,3- F,4 zF,3- F,4 |
[V:3] F,,8 F,,8 | ^F,,8 F,,8 | _A,,8 A,,8 | G,,8 G,,8 |
[V:1] z2 G,C EG,CE z2 G,C EG,CE | z2 G,C FG,CF z2 G,C FG,CF | z2 G,B, FG,B,F z2 G,B, FG,B,F | z2 A,C ^FA,CF z2 A,C FA,CF |
[V:2] zE,3- E,4 zE,3- E,4 | zD,3- D,4 zD,3- D,4 | zD,3- D,4 zD,3- D,4 | z_E,3- E,4 zE,3- E,4 |
[V:3] G,,8 G,,8 | G,,8 G,,8 | G,,8 G,,8 | G,,8 G,,8 |
[V:1] z2 G,C GG,CG z2 G,C GG,CG | z2 G,C FG,CF z2 G,C FG,CF | z2 G,B, FG,B,F z2 G,B, FG,B,F |
[V:2] z=E,3- E,4 zE,3- E,4 | zD,3- D,4 zD,3- D,4 | zD,3- D,4 zD,3- D,4 |
[V:3] G,,8 G,,8 | G,,8 G,,8 | G,,8 G,,8 |
[V:1] z2 G,_B, EG,B,E z2 G,B, EG,B,E | [K:clef=bass] z2 F,A, CFCA, CA,F,A, F,D,F,D, | [K:clef=treble] z2 GB dfdB dBGB DFED | !fermata!!arpeggio![EGc]16 |]
[V:2] zC,3- C,4 zC,3- C,4 | zC,3- C,4- C,8 | zB,,3- B,,4- B,,8 | C,16 |]
[V:3] C,,8 C,,8 | C,,16 | C,,16 | !fermata!C,,16 |]`;

export default {
  summary: "The C major Prelude that opens Bach's Well-Tempered Clavier, Book 1, all 35 bars. Each bar is one chord, broken the same way in both halves: the left hand holds two notes while the right hand plays three, twice. Six sections: Opening (bars 1–4), To G (5–11), Back to C (12–19), Chromatic (20–23), Low G (24–31) and Coda (32–35).",
  steps: [
    "Play each bar as a block chord first, the left hand's two notes with the right hand's three. Learn the chords before the pattern.",
    "Then the pattern, hands together, in wait mode. The left hand's second note comes a sixteenth after its first, and both hold to the half bar.",
    "Bars 24–31 sit over a low G, struck again every half bar; bars 32–35 over a low C.",
    "Play-along with the click at 40. Each clean pass nudges the tempo up toward 66.",
  ],
  watch: [
    "Bar 33 puts the right hand in the bass clef, as the edition does. It's back in the treble at bar 34.",
    "The last chord is rolled, bottom note first (the wavy line). Playback strikes it all at once.",
  ],
  source: { label: "Mutopia Project — Bach, Das Wohltemperierte Clavier I, Praeludium I, BWV 846", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=5" },
  score: {
    bpm: 40, target: 66,
    sections: [{ name: "Opening", from: 1, to: 4 }, { name: "To G", from: 5, to: 11 }, { name: "Back to C", from: 12, to: 19 }, { name: "Chromatic", from: 20, to: 23 }, { name: "Low G", from: 24, to: 31 }, { name: "Coda", from: 32, to: 35 }],
    abc: ABC,
  },
};

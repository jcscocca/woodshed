// Bach, Invention No. 13 in A minor, BWV 784, from the Mutopia edition of the Bach-Gesellschaft print (public
// domain), 25 bars. One voice in each hand, as in the edition, which keeps the right hand in the treble clef
// even where it dips below middle C.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Invention No. 13 in A minor
C:Johann Sebastian Bach
M:4/4
L:1/16
K:Am
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] zEAc BEBd c2e2 ^G2e2 | AEAc BEBd c2A2 z4 |
[V:2] A,,2A,4^G,2 A,E,A,C B,E,B,D | C2A,2 ^G,2E,2 A,E,A,C B,E,B,D |
[V:1] zece AcEG F2A2 d2f2- | fdBd GBDF E2G2 c2e2- | ecAc F2d3BGB E2c2- | cAFA D2B2 c2z2 z4 |
[V:2] C2A,2 C2A,2 DA,F,A, D,F,A,,C, | B,,2D,2 G,2B,3G,E,G, C,E,G,,B,, | A,,2C,2 D,F,B,,D, G,,2B,,2 C,E,A,,C, | F,,2D,,2 G,,G,F,G, C,G,CE DG,DF |
[V:1] zGce dGdf e2g2 B2g2 | cGce dGdf e2c2 g2e2 | c'aea ceAc d2^f2 a2c'2 | bgdg BdGB c2e2 g2b2 |
[V:2] E2C2 B,2G,2 CG,CE DG,DF | E2C2 z4 zGEG CEG,B, | A,2C2 E2G2 ^FADF A,D^F,A, | G,2B,2 D2^F2 EGCE G,CE,G, |
[V:1] a^f^df Bd^FA G2g3ece | A2^f3dBd G2e3cAc | ^Fg^fe ^dfBd e2z2 z4 | zg_bg eg^ce gece Azz2 |
[V:2] ^F,2A,2 B,2^D2 zECE A,CEG | ^FDB,D G,B,DF ECA,C ^F,A,C2- | CB,CA, B,2B,,2 E,EB,G, E,B,,G,,B,, | E,,2E,2 G,2_B,2 ^C,2z2 zGFE |
[V:1] zfaf dfBd fdBd Gzz2 | zege ceAc ^dcAc ^Fzz2 | zdfd Bd^GB dBGB Ezz2 | zEAc BEBd c2A2 ^G2E2 |
[V:2] D2D,2 F,2_A,2 B,,2z2 zFED | C2C,2 E,2^F,2 A,,2z2 zE^D^C | B,2B,,2 D,2F,2 ^G,,2z2 zDCB, | C2A,2 ^G,2E,2 A,E,A,C B,E,B,D |
[V:1] Acec Ac^FA cAFA ^DcBA | ^GBdB GBDF GFDF B,FED | CEAE CEA,C ^DCA,C ^F,CB,A, | ^G,2B2 ^G2E2 zEAc BEBd |
[V:2] CEAE CEA,C ^F,A,CA, F,A,^D,F, | E,2^G,2 B,2G,2 E,2B,,2 ^G,,2E,,2 | A,,2C,2 E,2C,2 A,,2C,2 ^D,,2z2 | zB,^G,E, D,B,G,D, C,2E,2 ^G,,2E,2 |
[V:1] cAce dBdf eceg fedc | Bcde fd^gd bdca fdBd | ^GBcA EABG AECE !fermata!A,4 |]
[V:2] A,,2^F,2 B,,2^G,2 C,2A,2 D,2_B,2 | ^G,2F,2 D,2B,,2 ^G,,2A,,2 D,,2E,,2 | F,,2^D,,2 E,,2E,2 !fermata!A,,8 |]`;

export default {
  summary: "Bach's Invention No. 13 in A minor, BWV 784, all 25 bars in 4/4, in two voices, one in each hand. Both hands play broken chords, and they trade sixteenths and eighths: while one runs, the other moves in eighths. Four sections: A (bars 1–6), from A minor to C major; B (7–13), on to E minor; C (14–17), a falling chain of diminished-seventh chords; and D (18–25), where the opening returns in A minor.",
  steps: [
    "Right hand alone in A, in wait mode. Bars 1–2 state the theme: broken-chord sixteenths, then eighths. Bars 3–4 run down in sixteenths and climb back in eighths, and bars 3–5 each end on a note tied over the bar line: hold it through the next downbeat.",
    "Left hand alone. It opens with A, the A an octave higher and G sharp, then plays the theme's sixteenths in the second half of bar 1, an octave below the right hand. In bars such as 2–3 and 9–10 it plays eighths in the first half and sixteenths in the second.",
    "Hands together a section at a time. In C (bars 14–17) the right hand stops after the first sixteenth of beat 4 and the left hand finishes the bar with three sixteenths; let one hand hand over to the other without a gap.",
    "Play-along with the click at 46. Each clean pass nudges the tempo up toward 76.",
  ],
  watch: [
    "Besides G sharp, the leading note of A minor, bars 9–13 bring F sharp and D sharp. C is a chain of diminished-seventh chords: B flat and C sharp in bar 14, A flat in bar 15, F sharp, D sharp and C sharp in bar 16.",
    "The right hand ranges widely, up to the C two octaves above middle C in bar 9 and down to the F sharp below middle C in bar 21. Read the ledger lines before you play those bars.",
  ],
  source: { label: "Mutopia Project — Bach, Invention No. 13 in A minor, BWV 784 (Bach-Gesellschaft)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=59" },
  score: {
    bpm: 46, target: 76,
    sections: [{ name: "A", from: 1, to: 6 }, { name: "B", from: 7, to: 13 }, { name: "C", from: 14, to: 17 }, { name: "D", from: 18, to: 25 }],
    abc: ABC,
  },
};

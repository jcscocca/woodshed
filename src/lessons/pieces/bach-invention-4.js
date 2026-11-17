// Bach, Invention No. 4 in D minor, BWV 775, from the Mutopia edition of the Bach-Gesellschaft print (public
// domain). The edition is in 3/8; here each pair of 3/8 bars is one 3/4 bar, so its 52 bars are 26, and a note
// held across the edition's bar line inside a 3/4 bar is written as two tied notes. One voice in each hand, as
// in the edition. The edition's prall sign on the long held notes is kept as a pralltriller.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Invention No. 4 in D minor
C:Johann Sebastian Bach
M:3/4
L:1/16
K:Dm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] DEFGAB ^CBAGFE | F2A2d2 G2^c2e2 | defgab ^cbagfe | fdefga Bagfed |
[V:2] z6 z6 | D,E,F,G,A,B, ^C,B,A,G,F,E, | F,2A,2D2 E,2G,2^C2 | D,2D2F,2 G,2A,2B,2 |
[V:1] ecdefg Agfedc | defdef G2z2z2 | cdecde F2z2B2- | B2A2G2 cBAGFE |
[V:2] C,2C2E,2 F,2G,2A,2 | B,G,A,B,CD E,DCB,A,G, | A,F,G,A,B,C D,CB,A,G,F, | E,C,D,E,F,G, A,,G,F,E,D,C, |
[V:1] FGG3F F2c2c2 | !pralltriller!c6- c6- | c6- cBAGFE | cDE^FGA BAG=FED |
[V:2] D,B,,C,2C,,2 F,,G,,A,,B,,C,D, | E,,D,C,B,,A,,G,, A,,B,,C,D,E,F, | G,,F,E,D,C,B,, A,,B,,C,A,,B,,C, | ^F,,2z2z2 G,,A,,B,,G,,A,,B,, |
[V:1] BCDEFG A=Bcdef | ^Gfedc=B cBdcBA | ^GAG^FED CDEFGA | Dc=BA^G^F EFGABc | ^Fedc=BA ^GABcde |
[V:2] E,,2z2z2 F,,2F,2D,2 | =B,,2^G,,2E,,2 A,,G,,A,,B,,C,D, | !pralltriller!E,6- E,6- | E,6- E,6- | E,6- E,2E2D2 |
[V:1] Afedc=B a^g^fea2- | ad=B3A A3A_Bc | D2^F2A2 BGABcd | EdcBAG A2fef2 |
[V:2] C2=B,2A,2 D2E2F2 | D2E2E,2 A,A,,_B,,C,D,_E, | ^F,,_E,D,C,B,,A,, G,,3G,,A,,B,, | C,,2G,,2C,2 F,G,A,=B,^CD |
[V:1] G2e2z2 defgab | ^cbagfe f2d2G2- | Gd^ceAc d=Bc3d | d=c_BAGF B^CDEFG |
[V:2] E,D^C=B,A,G, F,2A,2D2 | E,2G,2^C2 D,E,F,G,A,B, | ^C,B,A,G,F,E, F,G,A,2A,,2 | B,,3C,B,,A,, G,,B,A,G,F,E, |
[V:1] AdF2ED !fermata!D6 |]
[V:2] F,G,A,2A,,2 !fermata!D,,6 |]`;

export default {
  summary: "Bach's Invention No. 4 in D minor, BWV 775, in two voices, one in each hand. The edition is in 3/8; here each pair of its bars makes one 3/4 bar, so its 52 bars become 26, with the notes and their timing unchanged. Three sections: A (bars 1–9), where the theme passes between the hands and the music moves to F major; B (10–19), with a long held note in each hand in turn, moving to A minor; and C (20–26), back in D minor, with the theme returning in bar 22.",
  steps: [
    "Right hand alone in A, in wait mode. The theme in bar 1 runs up in sixteenths from D to B flat, drops to the C sharp below, leaps back to B flat and runs down to E. Bar 3 is the same an octave higher. Keep the thumb passing smooth.",
    "Left hand alone. It enters in bar 2 with the theme an octave below the right hand's, and holds a long E from bar 15 into bar 17 while the right hand runs above it.",
    "Hands together a section at a time. Mostly one hand runs in sixteenths while the other plays eighths. In bars 10–11 the right hand holds a C over a left-hand run; in bars 15–17 the roles swap.",
    "Play-along with the click at 72. Each clean pass nudges the tempo up toward 120.",
  ],
  watch: [
    "Each 3/4 bar here is two of the edition's 3/8 bars. Feel the bar in two halves of three eighths, with a light accent at the start of each half, where the printed bar lines fall.",
    "The long C in bar 10 and the long E in bar 15 carry a trill sign. Learn them as plain held notes first; the grading counts only the note itself.",
    "C sharp, the leading note, comes back throughout. Bars 12–19 move toward A minor, with G sharp, F sharp and B natural; bars 19–20 bring E flat.",
  ],
  source: { label: "Mutopia Project — Bach, Invention No. 4 in D minor, BWV 775 (Bach-Gesellschaft)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=67" },
  score: {
    bpm: 72, target: 120,
    sections: [{ name: "A", from: 1, to: 9 }, { name: "B", from: 10, to: 19 }, { name: "C", from: 20, to: 26 }],
    abc: ABC,
  },
};

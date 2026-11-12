// Minuet in A minor, BWV Anh. 120, from the Anna Magdalena Bach notebook (1725), in the Mutopia edition of the
// Bach-Gesellschaft text (public domain), 29 bars. The quarter-note pickup is written into a full first bar, so
// every bar number here is one more than the printed one, and the second half's pickup G joins bar 13.
// Each half is played once, as the reference MIDI plays it.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Minuet in A minor
C:Anonymous (Anna Magdalena Bach notebook)
M:3/4
L:1/8
K:Am
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z4 E2 | A3/2B/ c2 B2 | c2 A2 e2- | e2 ed cB |
[V:2] z6 | z4 E,2 | A,3/2B,/ C2 B,2 | C2 A,2 E2- |
[V:1] c2 A2 f2- | f2 e2 ^d2 | e2 B2 e2- | e2 d2 ^c2 |
[V:2] E2 ED CB, | A,2 A,2 A,2 | ^G,2 ^G,2 ^G,2 | =G,2 G,2 G,2 |
[V:1] d2 A2 d2- | d2 c2 B2 | c2 G2 c2 | BcdB fA |
[V:2] ^F,2 ^F,2 ^F,2 | =F,2 F,2 F,2 | E,2 E,2 E,2 | D,2 D,2 D,2 |
[V:1] ^G4 =G2 || c3/2d/ e2 d2 | e2 c2 g2- | g2 gf ed |
[V:2] E,2 E,,2 z2 || z4 G,2 | C3/2D/ E2 D2 | E2 C2 G2- |
[V:1] e2 c2 a2- | a2 g2 ^f2 | g2 d2 e2 | f2 d4 |
[V:2] G2 GF ED | C2 C2 C2 | B,2 G,2 C2 | A,2 F,2 G,2 |
[V:1] c4 e2 | f2 !trill!^f3 e/^f/ | g2 d2 ^f2 | g2 !trill!^g3 ^f/^g/ |
[V:2] C,2 C,,2 z2 | z4 A,,2 | _B,,2 !trill!=B,,3/2A,,/4B,,/4 C,2 | B,,2 E,,2 B,,2 |
[V:1] a2 e2 a2 | f2 e2 d2 | e2 E2 A2 | d2 !trill!B4 |
[V:2] C,2 !trill!^C,3/2B,,/4^C,/4 A,,2 | D,2 E,2 F,2 | C,4 F,2 | D,2 E,2 E,,2 |
[V:1] A4 x2 |]
[V:2] A,,4 x2 |]`;

export default {
  summary: "Minuet in A minor, BWV Anh. 120, from the 1725 notebook of Anna Magdalena Bach, 29 bars in 3/4. The left hand imitates the right a bar later at the start of each half, and in the first half it walks down by semitones under the tune. Four sections: A1 (bars 1–5), A2 (6–13), B1 (14–21) and B2 (22–29). Bar 1 holds the quarter-note pickup, so bar numbers here run one ahead of the printed ones; the second half's pickup G is the last beat of bar 13. The original repeats each half; here you play each half once.",
  steps: [
    "Right hand alone in A1, in wait mode. The pickup E leads to a dotted eighth and a sixteenth, A and B, in bar 2; bars 3 and 5 end with a note tied over the bar line. Hold the tied note and don't play it again.",
    "Left hand alone in A1 and A2. Bars 2–5 copy the right hand's opening an octave lower, one bar behind. Then bars 6–12 are three quarters a bar on one note, stepping down by semitones from A through G sharp, G, F sharp and F to E, then by a whole tone to D.",
    "Hands together in B2. Bars 22–25 have short trills in both hands, each ending with two quick notes. Play them as the plain written notes first, and add the trills once the rhythm is steady.",
    "Play-along with the click at 60. Each clean pass nudges the tempo up toward 96.",
  ],
  watch: [
    "There is no key signature. In A2 the accidentals change bar by bar: D sharp in bar 6, G sharp in bar 7 (left hand), C sharp in bar 8, F sharp in bar 9 (left hand). In B2 the left hand has B flat then B natural in bar 23, and C then C sharp in bar 25.",
    "Bar 13 ends the first half on G sharp and starts the second half with G natural on beat 3.",
  ],
  source: { label: "Mutopia Project — Bach, Minuet in A minor, BWV Anh. 120 (Bach-Gesellschaft Ausgabe, Band 43, 1894)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1612" },
  score: {
    bpm: 60, target: 96,
    sections: [{ name: "A1", from: 1, to: 5 }, { name: "A2", from: 6, to: 13 }, { name: "B1", from: 14, to: 21 }, { name: "B2", from: 22, to: 29 }],
    abc: ABC,
  },
};

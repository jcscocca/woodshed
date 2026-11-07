// Minuet in C minor, BWV Anh. 121 (Anna Magdalena Bach notebook, composer unknown), from the Mutopia
// edition of the Bach-Gesellschaft print, 24 bars. The left hand's held notes in bars 9 and 13 are folded
// into tied chords.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Minuet in C minor
C:Anonymous (Anna Magdalena Bach notebook)
M:3/4
L:1/8
K:Cm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] c2 c2 d2 | e2 e2 f2 | g2 g2 a2 | !trill!^f4 g2- |
[V:2] C,4 z2 | C,2 C,2 D,2 | E,2 E,2 C,2 | D,2 C,2 =B,,2 |
[V:1] ga f=e f2- | fg ed e2 | c=B c2 d2 | G6 |
[V:2] B,,4 =A,,2 | A,,4 G,,2 | A,,4 F,,2 | G,,2 G,F, E,D, |
[V:1] G2 G2 A2 | BA GA B2 | C2 =E2 (3GAB | AG F4 |
[V:2] C,2- [C,-=E,]2 [C,F,]2 | G,2 =E,2 C,2 | =E,2 C,2 E,2 | F,3G, F,E, |
[V:1] F2 F2 G2 | AG FG A2 | B,2 D2 (3FGA | GF E4 |
[V:2] D,2- [B,,-D,]2 [B,,E,]2 | F,2 D,2 C,2 | D,2 B,,2 D,2 | E,3F, E,D, |
[V:1] G2 A2 =A2 | B2 =B2 c2 | =B2 c2 d2 | e2 =e2 f2 |
[V:2] C,2 F,2 E,2 | D,2 G,2 E,2 | D,2 C,2 =B,,2 | C,2 B,,2 =A,,2 |
[V:1] d2 e2 =e2 | f2 ^f2 g2 | G2 fe de | c6 |]
[V:2] =B,,2 C,2 _B,,2 | =A,,2 _A,,2 G,,2 | E,2 F,2 G,2 | C,6 |]`;

export default {
  summary: "The Minuet in C minor from the Anna Magdalena Bach notebook (BWV Anh. 121, composer unknown), all 24 bars, in 3/4. Three sections: A (bars 1–8), a rising line in quarter notes that closes on G; B (9–16), the same two-bar figure twice, a step apart, with a triplet in bars 11 and 15; and C (17–24), where the right hand climbs by half steps over a stepping bass. The original repeats each half; here you play each half once.",
  steps: [
    "Right hand alone in A, in wait mode. Bars 1–3 climb in pairs of repeated quarters; the trilled F sharp in bar 4 is tied over to the G in bar 5, and the tied notes in bars 5 and 6 are not struck again.",
    "Left hand alone in B. Bars 9 and 13 have two voices in the left hand. In bar 9 the low C holds the whole bar under E and F; in bar 13 D holds two beats, B flat comes in under it on beat 2 and holds to the bar line, and E flat sounds on beat 3. Don't lift the held notes early.",
    "Right hand alone in C, slowly. From bar 17 the tune rises a half step at a time (G, A flat, A natural, B flat, B natural, C), while the left hand mostly steps down against it, half steps included (C, B flat, A natural in bar 20).",
    "Play-along with the click at 72. Each clean pass nudges the tempo up toward 108.",
  ],
  watch: [
    "B flat, E flat and A flat are in the key signature, so naturals matter here: E natural in bars 5, 9–11, 20 and 21, B natural in bars 4, 7, 18, 19 and 21, and A natural in bars 5, 17, 20 and 22.",
    "The triplets in bars 11 and 15 fit three eighths into one beat. Count them against the left hand's quarter so they don't rush.",
  ],
  source: { label: "Mutopia Project — Bach, Minuet in C minor, BWV Anh. 121 (Bach-Gesellschaft Ausgabe, Band 43, 1894)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1613" },
  score: {
    bpm: 72, target: 108,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }, { name: "C", from: 17, to: 24 }],
    abc: ABC,
  },
};

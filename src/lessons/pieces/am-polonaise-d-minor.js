// Polonaise in D minor, BWV Anh. 128 (Anna Magdalena Bach notebook, composer unknown), from the Mutopia
// edition of the Bach-Gesellschaft print, 18 bars. The mordents, trills and appoggiaturas are marked; the
// reference plays the appoggiaturas just ahead of their main notes and the others as plain notes.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Polonaise in D minor
C:Anonymous (Anna Magdalena Bach notebook)
M:3/4
L:1/16
K:Dm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] d2d^c !mordent!d4 d/e/f3 | {f}ede2 A8 | e2ed !mordent!e4 e/f/g3 | f2fe f2fe !mordent!d4 |
[V:2] D,4 F,4 D,4 | A,,4 A,4 E,4 | ^C,4 A,,4 C,4 | D,4 A,,4 D,,4 |
[V:1] f2(3fga g2e2 {d}c4 | g2ga b2a2 b4 | a2gf !mordent!g4 !trill!e4 | f2fe !mordent!f4 F4 |
[V:2] D,4 E,4 E,4 | C,4 C,4 E,4 | F,4 B,,4 C,4 | F,,12 |
[V:1] a2ag !mordent!a4 a/b/c'3 | a2ag a2ag !mordent!f4 | c2BA d2c2 !trill!B2A2 | G2g2 {f}!trill!e8 |
[V:2] F,,4 F,4 E,4 | F,4 C,4 F,,4 | A,4 B,4 G,4 | B,4 C4 C,4 |
[V:1] Gcec Gcec Gced | c2(3efg !mordent!B8 | {c}BABG !mordent!A8 | A3d {d}!trill!^c8 |
[V:2] C,4 C,4 C,4 | C,4 E,4 D,4 | C,4 F,4 E,4 | D,4 A,4 G,4 |
[V:1] d3e f2a2 d'2a2 | gfef !mordent!d4 D4 |]
[V:2] F,4 D,4 F,4 | A,4 D,8 |]`;

export default {
  summary: "The Polonaise in D minor from the Anna Magdalena Bach notebook (BWV Anh. 128, composer unknown), all 18 bars, in 3/4. The right hand carries a polonaise rhythm, an eighth and two sixteenths, decorated with mordents, trills and appoggiaturas, over a left hand in plain quarters. Four sections: A (bars 1–4), A′ (5–8, closing in F major), B (9–12, closing on C) and C (13–18, back to D minor). The original repeats each half; here you play each half once.",
  steps: [
    "Right hand alone in A, in wait mode, without the ornaments. Bars 1, 3 and 4 start with the same figure, an eighth and two sixteenths; bars 1 and 3 end with two quick thirty-seconds that run into a dotted eighth.",
    "Left hand alone. It is quarter notes throughout except the held F in bar 8 and the half note D at the end. Bar 13 is three Cs under the right hand's broken C major chord.",
    "Hands together, a section at a time. The sixteenth-note triplets in bars 5 and 14 fill one beat; count them against the left hand's quarter.",
    "Once the notes are secure, add the ornaments: each mordent is the main note, the note below and the main note again, played quickly on the beat. Then play-along with the click at 56, nudging up toward 80.",
  ],
  watch: [
    "B flat is in the key signature. C sharp is written in bars 1, 3 and 16; the other Cs are natural.",
    "The appoggiaturas, small notes at the start of bars 2 and 15 and inside bars 5, 12 and 16, lean on the beat and take time from the main note. The grading counts only the main note.",
  ],
  source: { label: "Mutopia Project — Bach, Polonaise in D minor, BWV Anh. 128 (Bach-Gesellschaft Ausgabe, Band 43, 1894)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1615" },
  score: {
    bpm: 56, target: 80,
    sections: [{ name: "A", from: 1, to: 4 }, { name: "A′", from: 5, to: 8 }, { name: "B", from: 9, to: 12 }, { name: "C", from: 13, to: 18 }],
    abc: ABC,
  },
};

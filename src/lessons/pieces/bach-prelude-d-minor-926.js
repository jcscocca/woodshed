// Bach, Little Prelude in D minor, BWV 926, from the Mutopia edition of the Bach-Gesellschaft print (public
// domain), 48 bars. The right hand's second voice in bars 21 and 44 (a held A, then a held C sharp) is folded
// into chords with ties, so every note keeps its length. Ornaments the edition puts on one note of a chord
// (bars 11, 12, 21, 44 and 48) are drawn on the chord.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Little Prelude in D minor
C:Johann Sebastian Bach
M:3/4
L:1/16
K:Dm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] D2A2 F2D2 A2F2 | D2A2 F2D2 A2F2 | D2B2 G2D2 B2G2 | D2B2 G2D2 B2G2 |
[V:2] !mordent!D,4 z4 z4 | D,,4 z4 z4 | !mordent!D,4 z4 z4 | D,,4 z4 z4 |
[V:1] ^C2G2 E2C2 G2E2 | ^C2B2 G2E2 A2G2 | F2D2 F2A2 F2A2 | d2A2 d2f2 d2f2 |
[V:2] !mordent!D,4 z4 z4 | D,,4 z4 z4 | D,2A,,2 D,2F,2 D,2F,2 | A,2F,2 A,2D2 A,2D2 |
[V:1] =b2f2 e2d2 c2=B2 | A2^G2 ^F2E2 d2=B2 | !mordent![Ac]4 z4 z4 | !mordent![Ac]4 z4 z4 |
[V:2] ^G,4 z4 z4 | E,4 ^G,4 E,4 | A,2E2 C2A,2 E2C2 | =G,2_E2 C2G,2 E2C2 |
[V:1] a2_e2 d2c2 B2A2 | G2^F2 E2D2 c2A2 | !mordent!B2d2 B2G2 g4 | z2d2 c2B2 !pralltriller!A2G2 |
[V:2] ^F,4 z4 z4 | D,4 ^F,4 D,4 | !mordent!G,4 z4 z2=F,2 | !pralltriller!E,4 z4 z4 |
[V:1] A2c2 A2F2 f4 | z2c2 B2A2 !pralltriller!G2F2 | G2B2 A2G2 F2E2 | F2D2 F2A2 d2G2 |
[V:2] !mordent!F,4 z4 z2E,2 | !pralltriller!D,4 z2F,2 E,2D,2 | E,2D,2 ^C,2E,2 D,2C,2 | D,4 =C,4 B,,4 |
[V:1] !mordent![A-^c]2[Ae]2 c2A2 e2c2 | A2e2 ^c2A2 B2A2 | G2e2 ^c2G2 e2c2 | G2e2 ^c2G2 A2G2 |
[V:2] A,,4 A,4 A,,4 | A,,4 A,4 A,,4 | A,,4 A,4 A,,4 | A,,4 A,4 A,,4 |
[V:1] F2d2 B2F2 d2B2 | F2d2 B2F2 d2B2 | ^F2c2 A2F2 c2A2 | ^F2c2 A2F2 c2A2 |
[V:2] B,,4 z4 z4 | B,,4 B,4 B,,4 | A,,4 z4 z4 | A,,4 D,4 D,,4 |
[V:1] B2G2 ^F2G2 D2G2 | B2G2 D2B2 G2D2 | _E2G2 ^F2G2 B2G2 | _E2B2 G2E2 B2G2 |
[V:2] G,,4 z4 z4 | G,,4 G,4 G,,4 | G,,4 z4 z4 | G,,4 G,4 G,,4 |
[V:1] ^C2B2 G2C2 B2G2 | ^C2B2 G2C2 A2G2 | F2A2 F2D2 A2F2 | D2A2 F2D2 ^C2D2 |
[V:2] A,,4 z4 z4 | A,,4 A,4 A,,4 | A,,4 z4 z4 | A,,4 A,4 A,,4 |
[V:1] E2G2 E2B,2 G2E2 | B,2G2 E2^C2 A,2G2 | FD=CB, z4 z4 | z4 z4 z4 |
[V:2] ^C,,4 z4 z4 | ^C,,4 ^C,4 C,4 | D,4 A,G,F,E, F,A,D,F, | A,,D,C,B,, A,,G,,F,,E,, D,,F,,A,,D, |
[V:1] z4 zDFA DFAd | fafd fd=Bd ^GBAG | !arpeggio![Aeg]6a2 [f-Ad]4 | [f]2e2 !pralltriller![^c-e]6[cd]2 |
[V:2] F,A,D,F, A,zz2 z4 | z4 z4 z4 | ^C,2E,2 C,2A,,2 D,2=B,,2 | G,,2G,2 A,2G,2 A,2G,,2 |
[V:1] d2=c2 A2d2 B2G2 | c2A2 ^F2B2 G2E2 | A2^F2 D2G2 E2^C2 | !mordent![A,D^F]12 |]
[V:2] D,4 D4 D,4 | D,4 z4 z4 | D,,4 D,4 D,,4 | D,,12 |]`;

export default {
  summary: "Bach's Little Prelude in D minor, BWV 926, all 48 bars in 3/4. The right hand plays broken chords in steady eighths over single left-hand notes, with falling scale lines in between and a short free passage near the end. Six sections: Opening (bars 1–8), where the left hand keeps to D and its chord; Scales (9–14), falling lines toward A minor and G minor; Ornaments (15–20); Broken chords (21–38), over a slow-moving bass; Cadenza (39–44), where the hands take turns with sixteenth runs; and Close (45–48), which ends on a D major chord.",
  steps: [
    "Right hand alone in Opening, in wait mode. Each bar is one chord broken into eighths; keep them even and move the hand as a unit when the chord changes, as in bars 3, 5 and 7.",
    "Left hand alone. Most bars have one note on the downbeat, or three quarters that leap up an octave and back, as in bars 21–24. Bars 7–8, 11–12 and 19 move in eighths, and in bars 39–41 a sixteenth run falls to the low D and climbs back.",
    "Hands together a section at a time. Take Cadenza slowly: the left hand runs alone in bars 39–41, the right hand answers in bars 41–42, and bar 43 opens with a rolled chord, played from the bottom up.",
    "Play-along with the click at 72. Each clean pass nudges the tempo up toward 120.",
  ],
  watch: [
    "Mordents (the main note, the note below, the main note) come in bars 1, 3, 5, 11–12, 15, 17, 21 and 48; prall trills (the main note, the note above, the main note) in bars 16, 18 and 44. Learn the bars plain first: the grading counts only the main note.",
    "C sharp is the leading note and comes back throughout. B natural and G sharp appear in bars 9–10 and again in bar 42, with B natural once more in bar 43, E flat in bars 12–13 and 31–32, and F sharp in bars 13–14, 27–31 and 46–48, where the last chord is D major.",
  ],
  source: { label: "Mutopia Project — Bach, Little Prelude in D minor, BWV 926 (Bach-Gesellschaft)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=69" },
  score: {
    bpm: 72, target: 120,
    sections: [{ name: "Opening", from: 1, to: 8 }, { name: "Scales", from: 9, to: 14 }, { name: "Ornaments", from: 15, to: 20 }, { name: "Broken chords", from: 21, to: 38 }, { name: "Cadenza", from: 39, to: 44 }, { name: "Close", from: 45, to: 48 }],
    abc: ABC,
  },
};

// Musette in D, BWV Anh. 126, from the Bach-Gesellschaft edition; the da capo is written out as bars 21–28.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Musette in D
C:Anonymous
M:2/4
L:1/16
K:D
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] a4 gfed | a4 gfed | FGA2 G2F2 | E2A2 F2D2 |
[V:2] D,,2D,2 D,,2D,2 | D,,2D,2 D,,2D,2 | F,G,A,2 G,2F,2 | E,2A,2 F,2D,2 |
[V:1] a4 gfed | a4 gfed | FGA2 G2F2 | E2A2 D4 ||
[V:2] D,,2D,2 D,,2D,2 | D,,2D,2 D,,2D,2 | F,G,A,2 G,2F,2 | E,2A,2 D,4 ||
[V:1] cde2 cde2 | a2e2 e4 | a2e2 a2e2 | dcBA B2E2 |
[V:2] A,,2A,2 A,,2A,2 | A,,2A,2 A,,2A,2 | A,,2A,2 A,,2A,2 | A,,2A,2 E,,2E,2 |
[V:1] e2^d2 E2=d2- | d2c2 a2^g2 | e2^d2 E2=d2- | d2c2 a2^g2 |
[V:2] E,,2E,2 E,,2E,2 | E,,2E,2 E,,2E,2 | E,,2E,2 E,,2E,2 | E,,2E,2 E,,2E,2 |
[V:1] e^dcd edcd | e2^G2 A2=d2 | cde2 A2D2 | CDE2 A,4 ||
[V:2] E,,2E,2 E,,2E,2 | E,,2D,2 C,2D,2 | E,4 A,,2D,2 | C,D,E,2 A,,4 ||
[V:1] a4 gfed | a4 gfed | FGA2 G2F2 | E2A2 F2D2 |
[V:2] D,,2D,2 D,,2D,2 | D,,2D,2 D,,2D,2 | F,G,A,2 G,2F,2 | E,2A,2 F,2D,2 |
[V:1] a4 gfed | a4 gfed | FGA2 G2F2 | E2A2 !fermata!D4 |]
[V:2] D,,2D,2 D,,2D,2 | D,,2D,2 D,,2D,2 | F,G,A,2 G,2F,2 | E,2A,2 !fermata!D,4 |]`;

export default {
  summary: "The Musette in D major from the Anna Magdalena Bach notebook (composer unknown), 28 bars. A musette copies a bagpipe: the left hand leaps between octaves like a drone while the right hand dances above. Four sections: A (bars 1–8), B1 (9–12), B2 (13–20) and A′ (21–28). The original repeats each half, then goes back to the start (da capo) and ends at bar 8's pause; here the repeats are dropped and the return is written out as A′.",
  steps: [
    "Start with the left hand alone in section A. Bars 1–2 are one octave leap, D to D, over and over: keep the hand open at the octave and let the wrist rock between the notes, rather than reaching for each one.",
    "Then the right hand alone in A: a held A, then a quick run down from G. In bars 3–4 and 7–8 both hands play the same line an octave apart, so learn them together.",
    "B1 and B2 move to A major, and the left hand's octaves move to A and then E. B2 is the hard part — D sharps and G sharps over the E drone — so give it wait mode, hands separately, before you put it together.",
    "Switch to play-along with the click at 56, a section at a time, then the whole piece. Each clean pass nudges the tempo up toward 88.",
  ],
  watch: [
    "The key signature has F sharp and C sharp. In bars 13–18 the right hand adds D sharps and G sharps; a D with a natural sign (bars 13, 15 and 18) is a plain D again.",
    "The D at the end of bars 13 and 15 is tied over the bar line: hold it into the next bar instead of playing it again.",
  ],
  source: { label: "Mutopia Project — Musette in D, BWV Anh. 126 (Bach-Gesellschaft)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=79" },
  score: {
    bpm: 56, target: 88,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "B1", from: 9, to: 12 }, { name: "B2", from: 13, to: 20 }, { name: "A′", from: 21, to: 28 }],
    abc: ABC,
  },
};

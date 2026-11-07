// Handel, Toccata, from the Aylesford Pieces, from the Mutopia edition of the Schott 1930 print (public domain),
// 21 bars. The mordent in bar 10 is marked as in the edition; the reference MIDI plays its main note only.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Toccata
C:George Frideric Handel
M:4/4
L:1/16
K:Gm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] g4 G8 zbag | ^f4 z2d2 Bdcd Adcd | B3/2A/2G2 z2e2 c3/2B/2A2 z2f2 | d3/2c/2B2 z2g2 egfg dgfg |
[V:2] G,2B,2 A,2C2 B,2D2 C2E2 | D2A,2 D,2^F,2 G,4 F,4 | G,2B,2 E2G,2 A,2C2 F2A,2 | B,2D2 G2=B,2 C4 B,4 |
[V:1] e2G2 ^F2d2 G2ed cBAG | ^F4 z2A2 BcdB cdec | defd efge f2gf edcB | A4 z2fA B2e3/2d/2 c2f3/2e/2 |
[V:2] C2C,2 D,4 E,2G,2 A,2C,2 | D,2=E,2 ^F,2D,2 G,2B,2 A,2C2 | B,2D2 C2C,2 D,2B,2 G,2E,2 | F,2G,2 A,2F,2 G,4 A,4 |
[V:1] d4 z2bd dcac cBgB | BAfA AGeG FcdB PA3B | B4 z2f2 dfef cfef | d3/2c/2B2 z2d2 bagf gf=ed |
[V:2] B,2B,C D2D,2 =E,2^F,2 G,2B,2 | C2D2 B,2C2 A,2B,2 F,2F,,2 | B,,2B,2 A,2F,2 B,4 A,4 | B,2B,C D2B,2 G,2A,2 B,2G,2 |
[V:1] ^c4 z2a2 faga =eaga | faga =eaga f2[GBe]d [=EA^c]3d | [FAd]4 z2d2 gfg_a gfed | e2c2 z2c2 fefg fedc |
[V:2] A,2=B,2 ^C2A,2 D4 C4 | D4 ^C4 D2G,2 A,2A,,2 | D,2=E,2 F,2D,2 =B,,4 z2G,2 | C2CD E2C2 A,4 z2F,2 |
[V:1] d2B2 z2b2 cbag acBA | B2d2 gfed edcB A3G | G4 z2d2 Bdcd Adcd | B2D2 GFED EDCB, A,3G, |
[V:2] B,,2B,A, B,2G,2 [=E,C]4 [^F,D]4 | [G,D]4 [B,,G,]4 [C,G,]4 [D,^F,]4 | G,,2G,2 ^F,2D,2 G,4 F,4 | G,4 B,,4 C,4 D,2D,,2 |
[V:1] G,16 |]
[V:2] G,,16 |]`;

export default {
  summary: "Handel's Toccata in G minor, from the Aylesford Pieces, in 4/4, all 21 bars. The right hand plays sixteenth-note figures and short dotted flourishes over a left hand that moves mostly in eighths. Five sections: A1 (bars 1–4), A2 (5–8), B1 (9–12), B2 (13–16) and Close (17–21). The music moves from G minor to B flat major by bar 9 and to D minor in bars 13–15, and comes home to G minor at the end.",
  steps: [
    "Right hand alone in bars 2 and 4, in wait mode. Every other sixteenth is the same note, D in bar 2 and G in bar 4, while the notes between move. Keep the repeated note light and let the moving notes carry the line. The same figure comes back in bars 11, 13–14 and 19.",
    "Bars 3, 4 and 12 open with a quick dotted figure: a dotted sixteenth, a thirty-second, then an eighth; bar 8 turns it round, an eighth and then the dotted pair. Count them in wait mode first; the short note leads straight into the next one.",
    "Left hand alone in A1 and A2. It moves in eighths that outline the harmony, and closes some bars with a pair of quarter notes: G–F sharp in bar 2, C–B natural in bar 4, G–A in bar 8. Then hands together a section at a time.",
    "Play-along with the click at 46. Each clean pass nudges the tempo up toward 76.",
  ],
  watch: [
    "B flat and E flat are in the key signature. Bars 13–14 bring C sharp and E natural for D minor, bar 15 an A flat, and the left hand has B natural in bars 4 and 15.",
    "Bar 10 ends with a mordent on the dotted A: a quick A–B flat–A on the beat, then the B flat. Learn the bar without it first, then add it.",
  ],
  source: { label: "Mutopia Project — Handel, Toccata (Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=152" },
  score: {
    bpm: 46, target: 76,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "B1", from: 9, to: 12 }, { name: "B2", from: 13, to: 16 }, { name: "Close", from: 17, to: 21 }],
    abc: ABC,
  },
};

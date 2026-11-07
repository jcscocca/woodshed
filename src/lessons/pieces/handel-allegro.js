// Handel, Allegro in D minor, from the Aylesford Pieces, Mutopia edition of the Schott 1930 print
// (public domain), 38 bars.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Allegro
C:George Frideric Handel
M:4/4
L:1/16
K:Dm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] dAde defd eAef efge | f2A2 d6^cd cdec | dAde fgaf bdbd bdbd | eGAB cdec acac acac |
[V:2] z16 | DA,DE DEFD EA,EF EFGE | F2D2 z2D2 G,2A,2 B,2G,2 | C2C,2 z2C2 F,2G,2 A,2F,2 |
[V:1] dFGA Bcdf gabg efge | ^cegb adgc fcdG FdEc | [FAd]4 z2[DA]2 [DGA]2^C2 z2[CE]2 | ADA=B ABcA BEBc BcdB |
[V:2] B,2B,,2 z2B,2 E,2F,2 G,2E,2 | A,2G2 F2E2 D2G,2 A,2A,,2 | D,A,,D,E, D,E,F,D, E,A,,E,F, E,F,G,E, | [F,A,]2D,2 [A,C]4 =B,4 [^G,E]4 |
[V:1] [Ec]2A2 c2a2 [da]2^g2 z2[=Bg]2 | aece Aaeg [Adf]4 z2f2 | gd=Bd Ggdf [Gce]4 zeAe | fAfA fAfA =BDEF GABG |
[V:2] A,E,A,=B, A,B,CA, B,E,B,C B,CDB, | C4 z2C2 DA,F,A, D,DA,C | =B,4 z2B,2 CG,E,G, C,2C2 | D,2E,2 F,2D,2 G,2G,,2 z2G,2 |
[V:1] eGeG eGeG ACDE FGAF | defd =BcdB ^GBdf eAdG | c^GAD CA=B,G ACDE zEAc | ^FAc_e dGcF BDEF GABG |
[V:2] C,2D,2 E,2C,2 F,2F,,2 z2F,2 | =B,,2C,2 D,2B,,2 E,2D2 C2=B,2 | A,2D,2 E,2E,,2 A,,4 A,4 | D,2C2 B,2A,2 G,2G,,2 z2G,2 |
[V:1] EGBd cFBE A2c2 f2c2 | B2f2 e2G2 fcAc FAGF | cGcd cdec dAde defd | eGA=B cdec acac acac |
[V:2] C,2B,2 A,2G,2 F,C,F,G, F,G,A,F, | G,C,G,A, G,A,B,G, A,2F,2 A,2B,2 | [CE]2G,2 [A,C]2E,2 F,2D,2 [G,=B,]4 | C2G,2 E,2C,2 F,2G,2 A,2F,2 |
[V:1] Baga bagf gBgB gBgB | Agfg agfe fAfA fAfA | Gfef gfed efge cdec | ABcA FGAF Ddcd BcdB |
[V:2] D,2B,2 z2D,2 E,2F,2 G,2E,2 | C,2A,2 z2C,2 D,2E,2 F,2D,2 | B,,2G,2 z2B,,2 C,2D,2 E,2C,2 | F,2F,,2 A,,2F,,2 B,,B,A,B, G,A,B,G, |
[V:1] Gede cdec Afef defd | Bgfg efge caga Bbag | caga Bbag aefA GfeB | fcAc FAGF [EG]4 z4 |
[V:2] E,CB,C A,B,CA, F,DCD B,CDB, | G,EDE CDEC A,FEF G,GFE | A,FEF G,GFE F2D2 B,2C2 | F,4 z4 CG,E,G, C,E,D,C, |
[V:1] gdBd GBAG [FA]4 z4 | ae^ce Agfe f2A2 d2a2 | g4 ^c2e2 aA=Bc defd | bdbd bdbd eGAB cdec |
[V:2] G,,4 z4 DA,F,A, D,F,E,D, | A,,4 z4 DA,DE DEFD | EA,EF EFGE F2D2 z2D2 | G,2A,2 B,2G,2 C2C,2 z2C2 |
[V:1] acac acac dFGA Bcdf | gabg efge ^cegb adgc | fABg eGAf dcBA GFED | ^CEGB ADGC FCDG, F,DE,C |
[V:2] F,2G,2 A,2F,2 B,2B,,2 z2B,2 | E,2F,2 G,2E,2 A,2G,2 F,2E,2 | D,2D2 C2C,2 B,,2D,2 E,2G,,2 | A,,2E,2 F,2E,2 D,2G,,2 A,,2A,,,2 |
[V:1] DA,B,^F, G,FED [EG^c]4 [DFAd]3E | [A,DF]4 [^CE]2G,2 [F,A,D]8 |]
[V:2] [D,,D,]4 z2B,,2 [A,,E,G,]4 [A,,D,F,]3G,, | A,,4 A,,,4 [D,,D,]8 |]`;

export default {
  summary: "Handel's Allegro in D minor, from the Aylesford Pieces, all 38 bars of 4/4: a two-part piece built on one sixteenth-note subject that passes between the hands. Five sections: Opening (bars 1–6), where the left hand answers the right a bar later; To A minor (7–15), with the subject in each hand in turn and a close in A minor; Middle (16–20), through G minor, F major and C major; Sequence (21–29), a falling pattern that closes in F major in bar 29; and Return (30–38), back in D minor, with an Adagio close from the middle of bar 37.",
  steps: [
    "Opening, hands separately in wait mode. The subject is bar 1's sixteenths, D–A–D–E, D–E–F–D; in bar 2 the left hand plays it while the right hand holds a tied D.",
    "Bars 3–4: the right hand alternates two notes in sixteenths, B flat and D in bar 3, A and C in bar 4, over detached eighths in the left hand. Keep the alternating notes light and even, and let the left hand's rests be heard.",
    "To A minor, hands together one bar at a time. The subject enters in the left hand in bar 7, the right hand in bar 8 and the left hand again in bar 9; the hand without it plays chords or eighths.",
    "Play-along with the click at 60, a section at a time. Each clean pass nudges the tempo up toward 104.",
  ],
  watch: [
    "The accidentals follow the keys: B natural and G sharp in the A minor bars (8–15), F sharp and E flat in bar 16, and C sharp wherever the music is in D minor. Each one is written in.",
    "From the end of bar 36 the right hand goes low, down to the F and F sharp below middle C, where the edition switches it to the bass clef; the score keeps it in the treble staff, on ledger lines. The edition marks Adagio halfway through bar 37; slow down there to the end.",
  ],
  source: { label: "Mutopia Project — Handel, Allegro (Aylesford Pieces, Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=160" },
  score: {
    bpm: 60, target: 104,
    sections: [{ name: "Opening", from: 1, to: 6 }, { name: "To A minor", from: 7, to: 15 }, { name: "Middle", from: 16, to: 20 }, { name: "Sequence", from: 21, to: 29 }, { name: "Return", from: 30, to: 38 }],
    abc: ABC,
  },
};

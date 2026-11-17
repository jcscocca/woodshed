// Bach, Invention No. 8 in F, BWV 779, from the Mutopia edition of the Bach-Gesellschaft print (public domain),
// 34 bars. One voice in each hand, as in the edition; the left hand moves to the treble clef for bars 5–7.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Invention No. 8 in F
C:Johann Sebastian Bach
M:3/4
L:1/16
K:F
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z2F2 A2F2 c2F2 | f2ed cdcB ABAG | F2A2 c2A2 f2c2 | ac'bc' ac'bc' ac'bc' |
[V:2] z4 z4 z4 | z2F,2 A,2F,2 C2F,2 | F2ED CDCB, A,B,A,G, | F,2A,2 C2A,2 F2C2 |
[V:1] faga faga faga | dfef dfef dfef | =B2G2 d2B2 f2d2 | gagf efed cdc_B |
[V:2] [K:clef=treble]AcBc AcBc AcBc | FAGA FAGA FAGA | DFEF DFEF DFEF | [K:clef=bass]=B,2G,2 C2G,2 E2C2 |
[V:1] A2dc =BcBA GAGF | EFED C2c=B c2E2 | F2c2 E2c2 D2=B2 | c4 z4 z4 |
[V:2] FGFE DEDC =B,CB,A, | G,2C=B, A,B,A,G, F,G,F,E, | D,E,D,C, G,F,E,F, G,2G,,2 | z2C,2 E,2C,2 G,2C,2 |
[V:1] z2c2 e2c2 g2c2 | c'2=ba gagf efed | c_Bca caBa caAa | B2G2 B2G2 d2G2 |
[V:2] C2=B,A, G,A,G,F, E,F,E,D, | C,2E,2 G,2E,2 C2G,2 | _E2^F,2 E2F,2 E2F,2 | G,2=F,_E, D,E,D,C, B,,C,B,,A,, |
[V:1] g2f_e dedc BcBA | G2B2 d2B2 g2d2 | b2^c2 b2c2 b2c2 | d2A2 f2d2 a2f2 |
[V:2] G,,2G,2 B,2G,2 D2G,2 | G2F_E DEDC B,CB,A, | G,F,G,=E G,EF,E G,EE,E | F,E,F,D F,DE,D F,DD,D |
[V:1] gfgb cbdb ebcb | fefa =Ba^ca daBa | edeg Ag=Bg ^cgAg | f2d2 _B2d2 G2f2 |
[V:2] B,2G,2 E,2G,2 C,2E,2 | A,2F,2 D,2F,2 =B,,2D,2 | G,2E,2 ^C,2E,2 A,,2C,2 | D,,D,=C,D, G,,D,A,,D, B,,D,G,,D, |
[V:1] e2c2 A2c2 F2_e2 | df_ef dfef dfef | Bdcd Bdcd Bdcd | GBAB GBAB GBAB |
[V:2] C,,C,B,,C, F,,C,G,,C, A,,C,F,,C, | B,,2D,2 F,2D,2 B,2F,2 | DF_EF DFEF DFEF | B,DCD B,DCD B,DCD |
[V:1] E2C2 G2E2 B2G2 | cdcB ABAG FGF_E | D2GF EFED CDCB, | A,B,A,G, F,2FE F2A,2 |
[V:2] G,B,A,B, G,B,A,B, G,B,A,B, | E,2C,2 F,2C,2 A,2F,2 | B,CB,A, G,A,G,F, E,F,E,D, | C,2F,E, D,E,D,C, B,,C,B,,A,, |
[V:1] B,2F2 A,2F2 G,2E2 | [A,CF]4 z4 z4 |]
[V:2] G,,A,,G,,F,, C,B,,A,,B,, C,2C,,2 | F,,4 z4 z4 |]`;

export default {
  summary: "Bach's Invention No. 8 in F major, BWV 779, all 34 bars in 3/4. It is in two voices, one in each hand, and the left hand begins as a canon, playing the right hand's part a bar later. Four sections: A (bars 1–12), which moves to C major; B (13–18), toward G minor; C (19–25), from D minor back toward F; and D (26–34), home in F.",
  steps: [
    "Right hand alone in A, in wait mode. The theme climbs the F major chord in eighths, from F to the F above, then runs down in sixteenths. In bars 4–6 each bar repeats one four-note figure three times; keep the hand still and let the fingers do the work.",
    "Left hand alone. From bar 2 to bar 7 it plays the right hand's part a bar later and an octave lower, in the treble clef for bars 5–7. In bars 19–20 and 24–25 it alternates a moving bass with a repeated upper note, in sixteenths.",
    "Hands together a section at a time. Where both hands run in sixteenths, as in bars 5–6 and 9, keep them exactly together, and slow down rather than let one hand rush.",
    "Play-along with the click at 60. Each clean pass nudges the tempo up toward 100.",
  ],
  watch: [
    "The middle of the piece passes through other keys: B natural in bars 7–14 and 22–23, E flat in bars 15–18 with F sharp in bar 15, C sharp in bars 19 and 22–23, and E flat again in bars 25–27 and 30 on the way home.",
    "In bars 15 and 19 the right hand leaps back and forth across a wide gap, C to the high A, then B flat over C sharp. Keep the hand over the whole span instead of jumping.",
  ],
  source: { label: "Mutopia Project — Bach, Invention No. 8 in F, BWV 779 (Bach-Gesellschaft)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=61" },
  score: {
    bpm: 60, target: 100,
    sections: [{ name: "A", from: 1, to: 12 }, { name: "B", from: 13, to: 18 }, { name: "C", from: 19, to: 25 }, { name: "D", from: 26, to: 34 }],
    abc: ABC,
  },
};

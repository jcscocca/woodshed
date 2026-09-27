// Clementi, Sonatina in C, Op. 36 No. 1, I. Spiritoso, from the Schirmer Sonatina Album (1893). The edition's
// 2/2 is written as 4/4: the same bar, counted in quarters.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Sonatina in C, Op. 36 No. 1
C:Muzio Clementi
M:4/4
L:1/8
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] c2 ec G2 G2 | c2 ec G2 g2 | fedc BcBc | dcBA G2 z2 |
[V:2] C,2 z2 z4 | C,2 z2 z4 | C,2 z2 C,2 z2 | G,,2 z2 G,F,E,D, |
[V:1] c2 ec G2 G2 | e2 ge c2 ec | dBcA BGA^F | GABc de^fg |
[V:2] C,2 z2 z4 | C2 z2 z2 ^F,2 | G,2 C,2 D,2 D,,2 | G,,2 z2 z4 |
[V:1] A2 a2 a2 a2 | Bcde ^fgab | c2 c'2 c'2 c'2 | dgbd' c'bag |
[V:2] ^F,DA,D F,DA,D | G,2 z2 z4 | A,DCD A,DCD | B,2 z2 z4 |
[V:1] ^fegf agfe | edcB dcBA | G4 z4 || B2 dB G2 G2 |
[V:2] C2 z2 C,2 z2 | D,2 z2 D,,2 z2 | G,,B,,D,G, G,,2 z2 || F8 |
[V:1] c2 _ec G2 g2 | f2 d2 _e2 c2 | BcdB G2 G2 | gGgG gGgG |
[V:2] _E8 | B,4 C4 | G,4 z4 | F2 G,2 D2 G,2 |
[V:1] gGgG gGgG | d_efd fedc | [Bg]2 z2 z4 | C2 EC G,2 G,2 |
[V:2] _E2 G,2 C2 G,2 | B,2 z2 C2 z2 | G,2 G,,2 G,F,E,D, | C,2 z2 z4 |
[V:1] C2 EC G,2 G2 | FEDC B,CB,C | DCB,A, G,2 z2 | C2 G,C E2 E2 |
[V:2] C,2 z2 z4 | C,2 z2 C,2 z2 | G,,2 z2 G,,F,,E,,D,, | C,,2 z2 z4 |
[V:1] E2 CE G2 c2 | [EG]2 [DF]2 [CE]2 [B,D]2 | CDEF GABc | D2 d2 d2 d2 |
[V:2] C,2 z2 z4 | G,2 z2 G,,2 z2 | C,2 z2 z4 | B,,G,D,G, B,,G,D,G, |
[V:1] EFGA Bcde | F2 f2 f2 f2 | Gceg fedc | agfe dcBA |
[V:2] C,2 z2 z4 | D,G,F,G, D,G,F,G, | E,2 z2 z4 | F,2 z2 F,2 z2 |
[V:1] GAFG EFDE | C2 z2 z4 |]
[V:2] G,2 z2 G,,2 z2 | C,,E,,G,,C, C,,2 z2 |]`;

export default {
  summary: "The first movement (Spiritoso) of Clementi's Sonatina in C, Op. 36 No. 1, all 38 bars — a sonata form in miniature, in an edition written in 2/2 (alla breve) though the click counts four here. The exposition (bars 1–15) sets out a bold C major theme and moves to G major; the development (16–23) darkens it with E flats and waits on G; the recapitulation (24–38) brings both ideas back in C. Five sections: Exposition 1 (bars 1–8), Exposition 2 (9–15), Development (16–23), Recap 1 (24–31) and Recap 2 (32–38). The original repeats the exposition, then bars 16–38; here you play each once.",
  steps: [
    "Right hand alone through the exposition, in wait mode. Bars 8, 10 and 12 are runs of even eighths up a scale or a chord; keep every note the same length, and let the quarter notes in bars 9 and 11 jump cleanly up the octave.",
    "Left hand alone. Mostly it marks the beat with single notes between rests, but in bars 9 and 11, and again in 32 and 34, it plays an Alberti figure — low, high, middle, high. Keep the hand still over the notes and let the fingers do the work.",
    "Hands together a section at a time. The recap starts an octave lower than the opening (bar 24) and climbs back up by bar 31, so read the ledger lines below the treble staff carefully.",
    "Switch to play-along with the click at 68. Each clean pass nudges the tempo up toward 104.",
  ],
  watch: [
    "The sharps and flats are all written in, not in the key signature: F sharps in bars 6–13, where the music moves to G major, and E flats in bars 17–18 and 21–22.",
    "In bars 20–21 the right hand rocks between two Gs an octave apart for two whole bars. Keep the hand open at the octave, rock from the wrist, and let the lower G be the quieter one.",
  ],
  source: { label: "Mutopia Project — Clementi, Sonatina in C, Op. 36 No. 1 (Sonatina Album, G. Schirmer, 1893)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=804" },
  score: {
    bpm: 68, target: 104,
    sections: [{ name: "Exposition 1", from: 1, to: 8 }, { name: "Exposition 2", from: 9, to: 15 }, { name: "Development", from: 16, to: 23 }, { name: "Recap 1", from: 24, to: 31 }, { name: "Recap 2", from: 32, to: 38 }],
    abc: ABC,
  },
};

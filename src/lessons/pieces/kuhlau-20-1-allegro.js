// Kuhlau, Sonatina in C, Op. 20 No. 1, I. Allegro, from the Mutopia edition of the B. Schott's Söhnen print
// (public domain), 80 bars. The exposition repeat is not written out, as in the Mutopia MIDI. The left hand starts
// in the treble clef; each line restates its clef, since abcjs starts every line in the declared one.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Sonatina in C, Op. 20 No. 1: I. Allegro
C:Friedrich Kuhlau
M:4/4
L:1/16
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] c8 e8 | g8- g2g2 g2g2 | g4 c'4 e'6c'2 | c'8 b4 z2b2 |
[V:2] [K:clef=treble] C2G2 E2G2 C2G2 E2G2 | C2G2 E2G2 C2G2 E2G2 | C2G2 E2G2 C2G2 E2G2 | D2G2 F2G2 D2G2 F2G2 |
[V:1] d'8 f4 z2f2 | e8 g4 z2e2 | ^c2d2 f2e2 d2a2 f2d2 | c2B2 d2B2 G4 z4 |
[V:2] [K:clef=treble] B,2G2 D2G2 B,2G2 D2G2 | C2G2 E2G2 C2G2 E2G2 | [FA]16 | G4 z4 z2 [K:clef=bass] G,,2 A,,2B,,2 |
[V:1] z2G2 [ce]2G2 [ce]2G2 [ce]2G2 | z2G2 [ce]2G2 [ce]2G2 [ce]2G2 | z2G2 [df]2G2 [df]2G2 [df]2G2 | z2G2 [df]2G2 [df]2G2 [df]2G2 |
[V:2] C,8 E,8 | G,16 | B,,8 D,8 | G,16 |
[V:1] (3z2G2c2 (3_e2c2G2 (3_e2c2G2 (3_e2c2G2 | (3z2G2c2 (3_e2c2G2 (3_e2c2G2 (3_e2c2G2 | (3z2A2c2 (3d2c2A2 (3d2c2A2 (3d2c2A2 | (3z2A2c2 (3d2c2A2 (3d2c2A2 (3d2c2A2 |
[V:2] [C,,C,]8 [_E,,_E,]8 | [G,,G,]16 | [^F,,^F,]8 [A,,A,]8 | [D,D]16 |
[V:1] B4 b8 a2g2 | ^f2e2 ^d2e2 e4 =d2c2 | B2A2 ^G2A2 A2c2 e2d2 | d8 B4 z4 |
[V:2] G,2D2 B,2D2 G,2D2 B,2D2 | G,2E2 C2E2 G,2E2 C2E2 | ^F,2D2 C2D2 ^F,2D2 C2D2 | G,2D2 B,2D2 G,2D2 B,2D2 |
[V:1] z2b2 d'2c'2 b2a2 g2^f2 | ^d2e2 a2g2 ^f2e2 =d2c2 | ^A2B2 e2d2 ^c2d2 =c2=A2 | G2AB cde^f gaba g^fed |
[V:2] G,16 | C16 | D8 D,8 | G,4 z4 z8 |
[V:1] ^cded =cBAG ^F2^F2 ^F2^F2 | G2AB cde^f gaba g^fed | ^cded =cBAG ^F2^F2 ^F2^F2 | G2AB cde^f gBcd e^fga |
[V:2] z8 z2[D,A,C]2 [D,A,C]2[D,A,C]2 | [G,B,]4 z4 z8 | z8 z2[D,A,C]2 [D,A,C]2[D,A,C]2 | [G,B,]4 z4 z8 |
[V:1] bde^f gabc' d'gab c'd'e'^f' | g'2^f'2 =f'2e'2 d'2c'2 b2a2 | g2^g2 b2a2 =g2f2 e2d2 | c4 B4 z4 B4 |
[V:2] [G,B,D]4 z4 [G,B,D]4 z4 | [G,B,D]4 z4 z8 | z16 | G,2F2 D2F2 G,2F2 D2F2 |
[V:1] d4 c4 z4 c4 | e4 d4 z4 g4 | f4 e4 z2G2 G2G2 | c4 B4 z2B2 B2B2 |
[V:2] G,2E2 C2E2 G,2E2 C2E2 | G,2D2 B,2D2 G,2D2 B,2D2 | G,2E2 C2E2 G,2E2 C2E2 | G,2F2 D2F2 G,2F2 D2F2 |
[V:1] d4 c4 z2c2 c2c2 | e2d2 ^c2d2 g6f2 | _e2[c_e]2 [c_e]2[c_e]2 [c_e]2[c_e]2 [c_e]2[c_e]2 | [c_e]2[c_e]2 [c_e]2[c_e]2 [c_e]2[c_e]2 [c_e]2[c_e]2 |
[V:2] G,2E2 C2E2 G,2E2 C2E2 | G,2D2 B,2D2 G,2D2 B,2D2 | [_A,C]8 [_A,,_A,]8 | [G,,G,]8 [^F,,^F,]8 |
[V:1] [Bd]8- [Bd]2[Bd]2 [Bd]2[Bd]2 | [c_e]8- [c_e]2[c_e]2 [c_e]2[c_e]2 | [Bd]8- [Bd]2[Bd]2 [Bd]2[Bd]2 | [c_e]8- [c_e]2[c_e]2 [c_e]2[c_e]2 |
[V:2] G,,2A,,B,, C,D,E,^F, G,4 z4 | C,2D,_E, F,G,A,B, C4 z4 | G,2A,B, CDE^F G4 z4 | C,2D,_E, F,G,A,B, C4 z4 |
[V:1] [Bd]4 [c_e]4 [Bd]4 [c_e]4 | d4 GABc d4 Bcde | f4 gabc' d'4 bc'd'e' | f'e'd'c' bc'd'e' f'e'd'c' bc'd'e' |
[V:2] G,4 C,D,_E,F, G,4 C,D,_E,F, | G,4 z4 [G,B,D]4 z4 | [G,B,D]4 z4 [G,B,D]4 z4 | [G,B,D]16- |
[V:1] f'e'd'c' bc'd'c' bagf edcB | c8 e8 | g8- g2g2 g2g2 | g4 c'4 e'6c'2 |
[V:2] [G,B,D]4 z4 z8 | [K:clef=treble] C2G2 E2G2 C2G2 E2G2 | C2G2 E2G2 C2G2 E2G2 | C2G2 E2G2 C2G2 E2G2 |
[V:1] c'8 b4 z2b2 | d'8 f4 z2f2 | e8 g4 z2e2 | ^c2d2 f2e2 d2a2 f2d2 |
[V:2] [K:clef=treble] D2G2 F2G2 D2G2 F2G2 | B,2G2 D2G2 B,2G2 D2G2 | C2G2 E2G2 C2G2 E2G2 | [FA]16 |
[V:1] c2B2 d2B2 G4 z4 | z2G2 [ce]2G2 [ce]2G2 [ce]2G2 | z2G2 [ce]2G2 [ce]2G2 [ce]2G2 | z2G2 [df]2G2 [df]2G2 [df]2G2 |
[V:2] [K:clef=treble] G4 z4 z2 [K:clef=bass] G,,2 A,,2B,,2 | C,8 E,8 | G,16 | B,,8 D,8 |
[V:1] z2G2 [df]2G2 [df]2G2 [df]2G2 | (3z2G2c2 (3_e2c2G2 (3_e2c2G2 (3_e2c2G2 | (3z2G2c2 (3_e2c2G2 (3_e2c2G2 (3_e2c2G2 | (3z2G2d2 (3f2d2G2 (3f2d2G2 (3f2d2G2 |
[V:2] G,16 | [C,,C,]8 [_E,,_E,]8 | [G,,G,]16 | [B,,,B,,]8 [D,,D,]8 |
[V:1] (3z2G2d2 (3f2d2G2 (3f2d2G2 (3f2d2G2 | e4 e'8 d'2c'2 | b2a2 ^g2a2 a4 =g2f2 | e2d2 ^c2d2 d2f2 a2g2 |
[V:2] [G,,G,]16 | [K:clef=treble] C2G2 E2G2 C2G2 E2G2 | C2A2 F2A2 C2A2 F2A2 | B,2G2 F2G2 B,2G2 F2G2 |
[V:1] g8 e4 z4 | z2e'2 g'2f'2 e'2d'2 c'2b2 | ^g2a2 d'2c'2 b2a2 =g2f2 | ^d2e2 a2g2 ^f2g2 =f2=d2 |
[V:2] [K:clef=treble] C2G2 E2G2 C2G2 E2G2 | C16 | F16 | G8 [K:clef=bass] G,8 |
[V:1] c2de fgab c'd'e'd' c'bag | ^fgag =fedc B2B2 B2B2 | c2de fgab c'd'e'd' c'bag | ^fgag =fedc B2B2 B2B2 |
[V:2] C4 z4 z8 | z8 z2[G,DF]2 [G,DF]2[G,DF]2 | [CE]4 z4 z8 | z8 z2[G,DF]2 [G,DF]2[G,DF]2 |
[V:1] c2de fgab c'efg abc'd' | e'gab c'd'e'f' g'c'd'e' f'g'a'b' | c''4 z4 [EGc]4 z4 | [E,G,C]4 z4 z8 |]
[V:2] [CE]4 z4 z8 | [K:clef=treble] [CEG]4 z4 [CEG]4 z4 | [CEG]4 z4 [K:clef=bass] [C,C]4 z4 | [C,,C,]4 z4 z8 |]`;

export default {
  summary: "The first movement (Allegro) of Kuhlau's Sonatina in C, Op. 20 No. 1, all 80 bars, in 4/4 and C major. It is a sonata form: an exposition (bars 1–31) with a first theme over an Alberti bass, a bridge of broken chords and triplets, and a second theme in G major that ends in sixteenth-note runs; a development (32–49) over a left-hand figure that keeps returning to G, turning to C minor; and a recapitulation (50–80) with the second theme back in C. Seven sections: First theme (bars 1–8), Bridge (9–16), Second theme (17–31), Development (32–49), First theme again (50–57), Bridge again (58–65) and Second theme in C (66–80). The original repeats the exposition; here you play it once, as the reference recording does.",
  steps: [
    "Right hand alone through the first theme, bars 1–8, in wait mode. Bar 2 holds a G, tied over to an eighth, then strikes it three more times; bar 7 is the first run of eighths, starting on C sharp.",
    "Left hand alone in bars 1–8 and 17–20: an Alberti figure, low–high–middle–high, eight eighths to the bar. Keep the hand still over each chord and move only at the bar line. In bar 8 it drops into the bass clef with G–A–B rising to the low C of bar 9.",
    "The sixteenth runs, bars 24–29 and 73–78, right hand alone and slowly. Bars 25 and 27 turn on C sharp and then C natural before the repeated F sharp eighths; decide where the thumb passes under in each run and keep it the same every time.",
    "Switch to play-along with the click at 60. Each clean pass nudges the tempo up toward 120.",
  ],
  watch: [
    "Bars 13–16 and 62–65 are eighth-note triplets, twelve to the bar, each group of three starting with a rest. Count the triplets against the left hand's half notes, and play the E flats in bars 13–14 and 62–63.",
    "Bars 39–45 turn to C minor: repeated E flat–C thirds in the right hand, an A flat in the left hand in bar 39, and E flat in the left-hand scales of bars 42 and 44, where bars 41 and 43 have E natural and F sharp.",
  ],
  source: { label: "Mutopia Project — Kuhlau, Sonatina in C, Op. 20 No. 1, I. Allegro (B. Schott's Söhnen)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=232" },
  score: {
    bpm: 60, target: 120,
    sections: [{ name: "First theme", from: 1, to: 8 }, { name: "Bridge", from: 9, to: 16 }, { name: "Second theme", from: 17, to: 31 }, { name: "Development", from: 32, to: 49 }, { name: "First theme again", from: 50, to: 57 }, { name: "Bridge again", from: 58, to: 65 }, { name: "Second theme in C", from: 66, to: 80 }],
    abc: ABC,
  },
};

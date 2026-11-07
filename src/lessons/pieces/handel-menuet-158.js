// Handel, Menuet II (Trio) in D from the Aylesford Pieces, from the Mutopia edition of the Schott 1930 print
// (public domain), 26 bars. The right hand's two voices are folded into one, with the lower voice as chord
// notes. Each half is played once, as the reference MIDI plays it.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Menuet II (Trio)
C:George Frideric Handel
M:3/4
L:1/8
K:D
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] [Adf]2 [Gcg]2 [Adf]2 | [Bf]e [Ff]c [Fd]c | [Bd]e [Adf]2 [Ace]2 | [Adf]2 [Ace]f [Fd]e |
[V:2] .D,2 .E,2 .F,2 | .G,2 .A,2 .B,2 | .G,2 .A,2 .A,,2 | .D,2 .A,,2 .D,,2 |
[V:1] [Adf]2 [Gcg]2 [Adf]2 | [Be]2 [Ff]c [Fd]2 | [Be]2 [Adf]2 [Ace]2 | [FAd]6 |
[V:2] .[D,,D,]2 .[E,,E,]2 .[F,,F,]2 | .[G,,G,]2 .[A,,A,]2 .[B,,B,]2 | .[G,,G,]2 .[A,,A,]2 .A,,2 | .[D,,D,]2 .A,,2 .D,,2 |
[V:1] [Af]g [da]2 .[dfa]2 | .[dfa]2 ba gf | ef [Bg]2 .[Beg]2 | .[Aeg]2 ag fe |
[V:2] .D,2 .F,2 .A,2 | .D6 | .E,2 .E2 .D2 | .C2 .B,2 .A,2 |
[V:1] .[Af]2 gf ed | .[Ae]2 fe dc | B2 [dfa]2 [Be^g]2 | [cea]2 ^gf ed |
[V:2] .D2 .D,2 .D2 | .C2 .B,2 .A,2 | .D2 .B,2 .E2 | A,6 |
[V:1] [Ac]2 [Ac]d [ce]2 | [DA]2 DE C2 | [FA]2 [Gcg]2 [Adf]2 | [Be]2 [Ff]c [Fd]c |
[V:2] .A,,2 .A,2 .G,2 | .F,2 F,G, A,2 | .D,2 .E,2 .F,2 | .G,2 .A,2 .B,2 |
[V:1] [Bd]e .[Adf]2 [Ace]2 | [Adf]2 [Ace]f [Fd]e | [Adf]2 [Gcg]2 [Adf]2 | [Be]2 [Ff]c [Fd]2 |
[V:2] .G,2 .A,2 .A,,2 | .D,2 .A,2 .B,2 | .[D,,D,]2 .[E,,E,]2 .[F,,F,]2 | .[G,,G,]2 .[A,,A,]2 .[B,,B,]2 |
[V:1] [Be]2 [Adf]2 [Ace]d | [FAd]6 |]
[V:2] .[G,,G,]2 .[A,,A,]2 .[A,,,A,,]2 | [D,,D,]6 |]`;

export default {
  summary: "Handel's Menuet II in D major, the trio to Menuet I, from the Aylesford Pieces, all 26 bars in 3/4. The right hand plays the tune with a second voice beneath it, written here as chord notes; the left hand walks in detached quarters, later in octaves. Five sections: A1 (bars 1–4), A2 (5–8), B1 (9–12), B2 (13–18) and A′ (19–26), where the opening returns. The original repeats each half; here you play each half once.",
  steps: [
    "Left hand alone in A1, then A2, in wait mode. A2 repeats A1's rising line in octaves: keep the hand in the octave shape and move it as one unit.",
    "Right hand alone in A1. The top line moves in quarters and eighths while the lower voice strikes once a beat; in bar 2 it plays B, F sharp, F sharp under the eighths.",
    "In B1 and B2 the tune climbs to A and B above the staff and comes down in eighths. Bars 15 and 16 bring G sharps as the music turns to A major.",
    "Play-along with the click at 56. Each clean pass nudges the tempo up toward 80.",
  ],
  watch: [
    "F sharp and C sharp are in the key signature. G sharp is written in, in bars 15 and 16.",
    "In bar 18 the right hand's lower voice drops to D, E and C sharp just above middle C, close to the left hand's F sharp, G and A. Keep the hands from colliding.",
  ],
  source: { label: "Mutopia Project — Handel, Menuet II (Trio) (Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=158" },
  score: {
    bpm: 56, target: 80,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "A2", from: 5, to: 8 }, { name: "B1", from: 9, to: 12 }, { name: "B2", from: 13, to: 18 }, { name: "A′", from: 19, to: 26 }],
    abc: ABC,
  },
};

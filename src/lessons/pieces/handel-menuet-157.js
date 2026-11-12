// Handel, Menuet I in D minor from the Aylesford Pieces, from the Mutopia edition of the Schott 1930 print
// (public domain). The edition is in 3/8; here each pair of 3/8 bars is one 3/4 bar, so its 16 bars are 8.
// Each half is played once, going straight to the second ending, as the reference MIDI does with the first
// ending dropped.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Menuet I
C:George Frideric Handel
M:3/4
L:1/16
K:Dm
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] [Fd]2 A2 .[Af]2 [Ae]2 A2 .[Ag]2 | .[Af]2 [Bg]f [Ge]d [A^c]d e2 .A2 | AB .[Fc]2 .[EB]2 [FA]2 .[Gc]2 [Af]2 | .[FA]2 [D-B][DA] [E-G][EA] F6 |
[V:2] .D,2 .F,2 .D,2 .^C,2 .^C2 .A,2 | .D2 .G,2 .B,2 .A,2 .A,,2 .G,2 | .F,2 .A,2 .G,2 .F,2 .E,2 .D,2 | .C,2 .B,,2 .C,2 .F,,2 .F,2 .E,2 |
[V:1] [Af]2 c2 .[ca]2 [cg]2 c2 .[cb]2 | .[ca]2 ba gf ef .g2 .[Gc]2 | [Ad]e .[df]2 .[ce]2 [Fd]2 [dg]2 .[Adf]2 | .[GBe]2 .[FAd]2 .[EA^c]2 [FAd]6 |]
[V:2] .F,2 .A,2 .F,2 .E,2 .E2 .C2 | .F2 .E2 .D2 .C2 .C,2 .E,2 | .F,2 .D,2 .A,2 .B,2 .B,,2 .F,2 | .G,2 .A,2 .A,,2 D,6 |]`;

export default {
  summary: "Handel's Menuet I in D minor from the Aylesford Pieces, Andantino. The edition is in 3/8; here each pair of its bars makes one 3/4 bar, so the 16 printed bars become 8, and the notes and their timing are unchanged. Two sections: A (bars 1–4), which moves to F major, and B (5–8), which returns to D minor. The original repeats each half and gives the second half two endings; here you play each half once and go straight to the second ending.",
  steps: [
    "Left hand alone, in wait mode. It plays detached eighths, often jumping an octave, as in bar 1 (C sharp, then the C sharp above), and ends on a held dotted-quarter D.",
    "Right hand alone in A. Most beats are a two-note chord; bars 2 and 4 add sixteenths. In bar 4 the top line moves in sixteenths over lower eighths, F, D, E.",
    "Hands together, one section at a time. In B the right hand climbs to a high B flat in bar 5, then falls in sixteenths in bar 6.",
    "Play-along with the click at 50. Each clean pass nudges the tempo up toward 76.",
  ],
  watch: [
    "Each 3/4 bar here is two of the edition's 3/8 bars. Feel a light accent on beat 1 and on the second half of beat 2, where the printed bar lines fall.",
    "B flat is in the key signature. C sharp is written in, in bars 1, 2 and 8; the C in bar 3 is natural.",
  ],
  source: { label: "Mutopia Project — Handel, Menuet I (Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=157" },
  score: {
    bpm: 50, target: 76,
    sections: [{ name: "A", from: 1, to: 4 }, { name: "B", from: 5, to: 8 }],
    abc: ABC,
  },
};

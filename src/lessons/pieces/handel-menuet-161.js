// Handel, Menuet in D from the Aylesford Pieces, from the Mutopia edition of the Schott 1930 print (public
// domain), 29 bars. The quarter-note pickup is written into a full first bar, so every bar number here is one
// more than the printed one. The right hand's two voices are folded into one, with the lower voice as chord
// notes. Each half is played once, as the reference MIDI plays it.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Menuet
C:George Frideric Handel
M:3/4
L:1/16
K:D
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z8 [FA]4 | [Fd]4 [Ae]4 [df]2g2 | [ce]4 [Bd]4 [Ada]4 | [Bde]4 f4 [Acg]4 |
[V:2] z8 .D,4 | D4 .C4 .D4 | .A,4 .B,4 .F,4 | G,4 .E,4 .A,4 |
[V:1] [Adf]4 [ce]2f2 [Fd]2e2 | [Gc]2d2 [Ae]ded edcd | [Ace]4 A2B2 c2A2 | [Ad]4 e4 f4 |
[V:2] .D4 .A,4 .B,4 | .E,4 .F,4 .D,4 | A,8 G,4 | F,4 .E,4 .D,4 |
[V:1] [Ae]4 [Fd]4 [Ada]4 | [Be]4 f4 [Acg]4 | [Adf]4 [Ace]2f2 [FBd]4 | [Bg]2c2 [df]gfg (3f2g2f2 |
[V:2] .C4 .D4 .F,4 | G,4 .F,4 .E,4 | .D,4 .A,4 .B,4 | .E,4 .F,4 .D,4 |
[V:1] [Ace]8 [Ece]4 | [Ece]4 [Ac]4 A4 | [Ada]8 [df]4 | [df]4 [Fe]2d2 c2B2 |
[V:2] A,,8 .A,,4 | A,,8 G,4 | F,4 .E,4 .D,4 | B,8 A,4 |
[V:1] [Beg]8 [Beg]4 | [Acg]4 f4 [Ace]4 | [Ada]4 [cg]2f2 [Fe]2d2 | [Be]4 [FA]4 [EAc]4 |
[V:2] G,4 .F,4 .E,4 | A,8 G,4 | .F,4 .A,4 .B,4 | G,4 .A,4 A,,4 |
[V:1] [FAd]8 [ce]4 | [ce]4 A4 [ce]4 | [Adf]8 [df]4 | [df]4 [ce]4 [Bd]4 |
[V:2] .D,4 .F,4 .A,4 | A,8 .A,,4 | D,4 .F,4 .D,4 | B,4 .C4 .D4 |
[V:1] [Bg]8 [Bg]4 | [cg]4 f4 [Ae]4 | [Adf]4 [Adg]2f2 [FBe]2d2 | [GBe]4 [EAc]d cd .c2 z d |
[V:2] E,4 .F,4 .G,4 | A,8 .C4 | .D4 .[F,,F,]4 .[B,,B,]4 | .[G,,G,]4 .[A,,A,]4 [A,,,A,,]4 |
[V:1] [FAd]8 z4 |]
[V:2] [D,,D,]8 z4 |]`;

export default {
  summary: "Handel's Menuet in D major from the Aylesford Pieces, Andantino, all 29 bars in 3/4. The right hand plays the tune over a second voice, written here as chord notes; the left hand moves in quarters and halves. Four sections: A1 (bars 1–5), A2 (6–13), B1 (14–21) and B2 (22–29). Bar 1 holds the pickup, so bar numbers here run one ahead of the printed ones. The original repeats each half; here you play each half once.",
  steps: [
    "Left hand alone in A1 and A2, in wait mode. It is a bass line in quarters and halves; keep the quarters detached and even.",
    "Right hand alone in A2. Bar 6 has a run of sixteenths, E and D, which is a written-out trill; bar 12 has another on F sharp and G, ending in a triplet. Play them slowly and evenly first.",
    "Both halves of B open with a broken A major chord in the right hand: E–C sharp–A falling in bar 14, E–A–E in bar 22. Practise those bars hands separately before joining them.",
    "Play-along with the click at 56. Each clean pass nudges the tempo up toward 84.",
  ],
  watch: [
    "Most beats in the right hand are two or three notes at once. Hold the top note for its full value and let the lower notes sound with it.",
    "The last bars end with a short trill on C sharp in bar 28 and the left hand in octaves; land on the final D chord together.",
  ],
  source: { label: "Mutopia Project — Handel, Menuet (Edition Schott 1930)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=161" },
  score: {
    bpm: 56, target: 84,
    sections: [{ name: "A1", from: 1, to: 5 }, { name: "A2", from: 6, to: 13 }, { name: "B1", from: 14, to: 21 }, { name: "B2", from: 22, to: 29 }],
    abc: ABC,
  },
};

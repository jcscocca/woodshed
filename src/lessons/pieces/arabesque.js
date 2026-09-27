// Burgmüller, "Arabesque", Op. 100 No. 2, from the Collection Litolff edition, which writes the return (bars
// 19–26) out. The left hand moves to the treble clef for bars 16–18, as in the edition; abcjs starts each
// line in the voice's own clef, so the bars 17–20 line restates it.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Arabesque
C:Friedrich Burgmüller
M:2/4
L:1/16
K:Am
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z8 | z8 | ABcB A2z2 | ABcd e2z2 |
[V:2] [A,CE]4 [A,CE]4 | [A,CE]4 [A,CE]4 | [A,CE]4 [A,CE]4 | [A,CE]4 [A,CE]4 |
[V:1] defg a2z2 | abc'd' e'2z2 | z2e2 e2f2 | d2z2 d4- |
[V:2] [A,DF]4 [A,DF]4 | [A,CE]4 [A,CE]4 | [G,CE]4 [G,CE]4 | [G,B,F]4 [G,B,F]4 |
[V:1] d2g2 d2e2 | c4 c'2z2 || e6 B2 | c6 A2 |
[V:2] [G,B,F]4 [G,B,F]4 | [CE]6 z2 || ^G,A,B,A, G,2z2 | A,B,CD E2z2 |
[V:1] e6 B2 | c6 A2 | a6 e2 | f6 e2 |
[V:2] ^G,A,B,A, G,2z2 | A,B,CD E2z2 | ^CDED C2z2 | [K:clef=treble] DEFG A2G2 |
[V:1] d2c2 B2A2 | ^G4 e4 || ABcB A2z2 | ABcd e2z2 |
[V:2] [K:clef=treble] F2E2 D2^D2 | E2=D2 C2B,2 || [K:clef=bass] [A,CE]4 [A,CE]4 | [A,CE]4 [A,CE]4 |
[V:1] defg a2z2 | abc'd' e'2z2 | z2B2 B2c2 | A4 e4- |
[V:2] [A,DF]4 [A,DF]4 | [A,CE]4 [A,CE]4 | [A,DE]4 [A,DE]4 | [A,CE]4 [A,CE]4 |
[V:1] e2B2 B2c2 | ABcB A2z2 || defg a2z2 | abc'b a2z2 |
[V:2] [A,DE]4 [A,DE]4 | [A,CE]4 [A,CE]4 || [A,DF]4 [A,DF]4 | [A,CE]4 [A,CE]4 |
[V:1] d'e'f'g' a'2z2 | EDCB, A,2z2 | [ca]8 |]
[V:2] [A,DF]4 [A,DF]4 | E,D,C,B,, A,,2z2 | [A,E]8 |]`;

export default {
  summary: "Burgmüller's \"Arabesque\", the second of his 25 easy studies, Op. 100, all 31 bars. Quick figures of four sixteenths and an eighth pass between the hands: the right hand has them first, over steady left-hand chords; in B the left hand takes them under a right-hand tune; then they come back to the right hand. Four sections: A (bars 1–10, starting with two bars of left-hand chords), B (11–18), A′ (19–26) and Coda (27–31). The original repeats bars 3–9 and bars 11–25, each with a first ending; here you play each part once and take the second endings (bars 10 and 26).",
  steps: [
    "Right hand alone in A, in wait mode. Every figure has the same shape, four quick notes and a short one — A B C B A, or a run up to the next note — so learn the shape once and you'll meet it all through the piece. Let the hand come off the key after each eighth.",
    "Left hand alone in B. Now it has the sixteenth figures, under a right-hand tune of long and short notes. Each figure fits under five fingers, so move the hand only in the gaps between figures.",
    "Hands together a section at a time. In A and A′ the left hand plays two chords a bar: keep them short and light so the right hand's figures stay clear.",
    "Switch to play-along with the click at 60. Each clean pass nudges the tempo up toward 96.",
  ],
  watch: [
    "The sharps are written in, not in the key signature: G sharp, the leading note of A minor, in bars 11, 13 and 18, with C sharp in bar 15 and D sharp in bar 17. In bars 16–18 the left hand moves up into the treble clef, and it's back in the bass clef at bar 19.",
    "Two ties: the D in bar 8 holds into bar 9, and the E in bar 24 holds into bar 25. Don't strike them again — the next note comes on the half beat.",
  ],
  source: { label: "Mutopia Project — Burgmüller, L'Arabesque, Op. 100 No. 2 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=203" },
  score: {
    bpm: 60, target: 96,
    sections: [{ name: "A", from: 1, to: 10 }, { name: "B", from: 11, to: 18 }, { name: "A′", from: 19, to: 26 }, { name: "Coda", from: 27, to: 31 }],
    abc: ABC,
  },
};

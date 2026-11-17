// Burgmüller, "Inquiétude", Op. 100 No. 18, from the Mutopia edition of the Collection Litolff print (public
// domain). The repeat of bars 9–23 is dropped and the first ending left out, so from bar 24 (the second ending)
// bar numbers run one behind the printed ones. The left hand's move to the treble clef in bars 15–16 is kept.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Inquiétude
C:Friedrich Burgmüller
M:2/4
L:1/16
K:Em
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] zgfe zedc | zB^AB zBcB | zgfe zedc | zB^AB zBcB |
[V:2] .[E,G,B,]2 z2 .[E,A,C]2 z2 | .[E,G,B,]2 z2 [E,G,B,]2 z2 | [E,G,B,]2 z2 [E,A,C]2 z2 | [E,G,B,]2 z2 [E,G,B,]2 z2 |
[V:1] zBgf zBgf | zBfe zBfe | zded z^cd^c | zB^AB !wedge!b2 z2 |
[V:2] [^D,A,B,]2 z2 [^D,A,B,]2 z2 | [E,G,B,]2 z2 [E,G,B,]2 z2 | [F,B,]2 z2 [F,^A,E]4 | [B,D]2 z2 !wedge!B,,2 z2 |
[V:1] zbag zgfe | zd^cd zded | zbag zgfe | zd^cd zded |
[V:2] [G,B,D]2 z2 [G,^A,^C]2 z2 | [G,B,D]2 z2 [G,B,D]2 z2 | [G,B,D]2 z2 [G,^A,^C]2 z2 | [G,B,D]2 z2 [G,B,D]2 z2 |
[V:1] zcba zcba | zBag zBag | zBgf zBgf | zBfe zBfe |
[V:2] [F,CD]2 z2 [F,CD]2 z2 | [G,B,D]2 z2 [G,B,D]2 z2 | [K:clef=treble] [B,^DA]2 z2 [B,^DA]2 z2 | [EG]2 z2 [EG]2 z2 |
[V:1] zgfe zedc | zB^AB zBcB | zgfe zedc | zB^AB zBcB |
[V:2] [K:clef=bass] [E,G,B,]2 z2 [E,A,C]2 z2 | [E,G,B,]2 z2 [E,G,B,]2 z2 | [E,G,B,]2 z2 [E,A,C]2 z2 | [E,G,B,]2 z2 [E,G,B,]2 z2 |
[V:1] zBgf zBgf | zBfe zBfe | zBcB zFGF | zEFE zCDC |
[V:2] [^D,A,B,]2 z2 [^D,A,B,]2 z2 | [E,G,B,]2 z2 [E,G,B,]2 z2 | [B,,^D,A,]2 z2 [B,,^D,A,]2 z2 | [E,G,]2 z2 C,4 |
[V:1] zA,B,A, zB,CB, | zEFE zCDC | zA,B,A, zB,CB, | E4 zBcB |
[V:2] A,,4 B,,4 | E,4 C,4 | A,,4 B,,4 | E,4 z4 |
[V:1] !wedge!e2 z2 zbc'b | !wedge!e'2 z2 z4 |]
[V:2] !wedge![E,G,B,]2 z2 z4 | !wedge!E,,2 z2 z4 |]`;

export default {
  summary: "Burgmüller's \"Inquiétude\" (Restlessness), No. 18 of his 25 easy studies, Op. 100, in E minor and 2/4, 30 bars. On nearly every beat the right hand plays a sixteenth rest and three slurred sixteenths, mostly over short left-hand chords. Four sections: A (bars 1–8), B (9–16), A again (17–23) and Coda (24–30). The original repeats bars 9–23 with two endings; here you play them once and go straight to the second ending, so from bar 24 the bar numbers run one behind the printed ones.",
  steps: [
    "Right hand alone in A, in wait mode. Nearly every beat is a sixteenth rest and three slurred sixteenths, so start each group just after the click. In bars 1 and 3 the groups fall, G–F sharp–E and E–D–C; in bars 2 and 4 they turn around B, with A sharp below and C above.",
    "Right hand in bars 5–6 and 13–16: each group leaps up from a low B (a C in bar 13) by up to a seventh and steps back down. Keep the thumb on the low note and let the hand open rather than jump.",
    "Left hand alone: a short chord on each beat with a rest between, mostly E–G–B in A and G–B–D in B, in the treble clef for bars 15–16. In bars 24–28 it changes to quarter notes, A–B–E–C, while the right hand's groups drop to around middle C. Then hands together, a section at a time.",
    "Play-along with the click at 80. Each clean pass nudges the tempo up toward 138.",
  ],
  watch: [
    "Besides the F sharp in the key, three sharps are written in often: A sharp under B in the right hand's turns, as in bars 2 and 4; C sharp in bars 7 and 9–12; and D sharp in the left hand's chords in bars 5, 15, 21 and 23.",
    "The wedges mark very short, accented notes: the high B and the left hand's low B in bar 8, and in bars 29–30 the right hand's E's and the left hand's E minor chord and low E.",
  ],
  source: { label: "Mutopia Project — Burgmüller, Inquiétude, Op. 100 No. 18 (Collection Litolff)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=230" },
  score: {
    bpm: 80, target: 138,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "B", from: 9, to: 16 }, { name: "A again", from: 17, to: 23 }, { name: "Coda", from: 24, to: 30 }],
    abc: ABC,
  },
};

// Satie, Gymnopédie No. 2 (1888), from the Mutopia edition of the Dover reprint (public domain), all 65 bars
// with nothing cut or written out: there is no pickup and no repeat. The left hand's chords sit in the treble
// staff, as in the edition, in a voice of their own; its bass notes are on the bass staff.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Gymnopédie No. 2
C:Erik Satie
M:3/4
L:1/4
K:Am
%%staves {(1 2) 3}
V:1 clef=treble
V:2 clef=treble
V:3 clef=bass
[V:1] z3 | z3 | z3 | z3 |
[V:2] z [B,EG]2 | z [A,CFA]2 | z [B,EG]2 | z [A,CFA]2 |
[V:3] G,,3 | D,,3 | G,,3 | D,,3 |
[V:1] g3 | a g f | e f g | d3 |
[V:2] z [B,EG]2 | z [A,CFA]2 | z [B,EG]2 | z [A,CFA]2 |
[V:3] G,,3 | D,,3 | G,,3 | D,,3 |
[V:1] g3 | a g f | e f g | d c2 |
[V:2] z [B,EG]2 | z [A,CFA]2 | z [B,EG]2 | z [A,CFA]2 |
[V:3] G,,3 | D,,3 | G,,3 | D,,3 |
[V:1] z3 | z3 | c'3 | f g a |
[V:2] z [B,EG]2 | z [A,CFA]2 | z [CEAc]2 | z [A,CFA]2 |
[V:3] G,,3 | D,,3 | C,,3 | C,,3 |
[V:1] g3 | c3 | f3- | f _e d |
[V:2] z [_B,_EG]2 | z [G,_B,_EG]2 | z [A,DF]2 | z [G,_B,_EF]2 |
[V:3] C,,3 | F,,3 | F,,3 | F,,3 |
[V:1] f3- | f g _b | a g f | g3 |
[V:2] z [A,DF]2 | z [_B,DFG]2 | z [C_EA]2 | z [_B,DG]2 |
[V:3] F,,3 | F,,3 | F,,3 | _B,,,3 |
[V:1] f3 | z3 | z3 | c'3 |
[V:2] z [A,CFA]2 | z [_B,DG]2 | z [A,CFA]2 | z [_EGc]2 |
[V:3] D,,3 | G,,3 | D,,3 | C,,3 |
[V:1] _a g f | g3 | f3- | f _e d |
[V:2] z [CF_Ac]2 | z [_B,DG_B]2 | z [=A,DF]2 | z [G,_B,_EF]2 |
[V:3] C,,3 | C,,3 | F,,3 | F,,3 |
[V:1] f3 | d3- | d _e _a | _b3 |
[V:2] z [A,DF]2 | z [_B,DFG]2 | z [C_E_A]2 | z [_B,DG]2 |
[V:3] F,,3 | F,,3 | F,,3 | _B,,,3 |
[V:1] f3 | z3 | z3 | g3 |
[V:2] z [=A,CF=A]2 | z [=B,=EG]2 | z [A,CFA]2 | z [B,EG]2 |
[V:3] D,,3 | G,,3 | D,,3 | G,,3 |
[V:1] f g a | e f g | d3 | g3 |
[V:2] z [A,CFA]2 | z [B,EG]2 | z [A,CFA]2 | z [B,EG]2 |
[V:3] D,,3 | G,,3 | D,,3 | G,,3 |
[V:1] f g a | e f g | f c2 | z3 |
[V:2] z [A,CFA]2 | z [B,EG]2 | z [A,CFA]2 | z [B,EG]2 |
[V:3] D,,3 | G,,3 | D,,3 | G,,3 |
[V:1] z3 | c'3 | f g a | g3 |
[V:2] z [A,CFA]2 | z [CEAc]2 | z [A,CFA]2 | z [_B,_EG]2 |
[V:3] D,,3 | C,,3 | C,,3 | C,,3 |
[V:1] c3 | f3 | g3 | d3- |
[V:2] z [G,_B,_EG]2 | z [A,DF]2 | z [G,_B,_EG]2 | z [A,DF]2 |
[V:3] F,,3 | F,,3 | F,,3 | F,,3 |
[V:1] d3- | d3- | d2 f | _b3 |
[V:2] z [G,_B,DF]2 | z [G,_B,_EF]2 | z [A,DF]2 | z [_B,DG]2 |
[V:3] F,,3 | F,,3 | F,,3 | _B,,,3 |
[V:1] a f2 | z3 | z3 | z3 |
[V:2] z [A,CFA]2 | z [_B,DG]2 | z [A,CFA]2 | z [_B,DG]2 |
[V:3] D,,3 | G,,3 | D,,3 | G,,3 |
[V:1] z3 |]
[V:2] z [CEG]2 |]
[V:3] C,,3 |]
`;

export default {
  summary: "Satie's second Gymnopédie (1888), all 65 bars, slow and sad in 3/4 (Lent et triste). As in the first, the left hand plays a low bass note on beat 1 and a chord on beats 2 and 3, under a slow right-hand line. Six sections: Intro (bars 1–4), A (5–14), B (15–27), B′ (28–39), A′ (40–49) and B″ (50–65). Each section after the Intro ends with the left hand alone. Nothing is changed from the edition; the chords are drawn in the treble staff, as in the edition, but they belong to the left hand.",
  steps: [
    "Left hand alone in the Intro, in wait mode. Low bass note on beat 1, then up to the chord on beat 2, held through beat 3. Find the chord before you leave the bass.",
    "Right hand alone through A and B. The tune moves mostly in quarters and dotted halves; count all three beats of each long note, and hold the tied F in bars 19–20 and 21–22 into the next bar.",
    "Hands together a section at a time. In B″ the right hand holds one D from bar 56 until the F on beat 3 of bar 59 while the left hand keeps its pattern; keep counting under it.",
    "Play-along with the click at 44. Each clean pass nudges the tempo up toward 72.",
  ],
  watch: [
    "There is no key signature, but from bar 17 the chords bring in B flat and E flat, and A flat in bars 29 and 35. The tune takes them too: E flat in bars 20, 32 and 35, B flat in bars 22, 36 and 60, A flat in bars 29 and 35.",
    "Bars 15, 28 and 50 open on the high C, an octave above the C at the end of bar 12. Move the hand up during the left hand's bars before it.",
    "The left-hand chords reach an octave at the most, as in bars 2 and 18. If that is past your reach, roll the chord from the bottom up.",
    "The bass note is written for the whole bar, but the left hand leaves it to play the chord; hold it with the pedal and change the pedal with each new bass note.",
  ],
  source: { label: "Mutopia Project — Satie, Gymnopédie No. 2 (Dover edition)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=38" },
  score: {
    bpm: 44, target: 72,
    sections: [{ name: "Intro", from: 1, to: 4 }, { name: "A", from: 5, to: 14 }, { name: "B", from: 15, to: 27 }, { name: "B′", from: 28, to: 39 }, { name: "A′", from: 40, to: 49 }, { name: "B″", from: 50, to: 65 }],
    abc: ABC,
  },
};

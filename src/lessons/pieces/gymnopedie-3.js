// Satie, Gymnopédie No. 3 (1888), from the Mutopia edition of the Dover reprint (public domain), all 60 bars
// with nothing cut or written out: there is no pickup and no repeat. The left hand's chords sit in the treble
// staff (voice 2) and move to the bass staff (voice 4) for bars 9–20, 34–39 and 41–48, as in the edition. In
// bars 11 and 13 the right hand adds a two-note chord under its held D.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Gymnopédie No. 3
C:Erik Satie
M:3/4
L:1/4
K:Am
%%staves {(1 2) (4 3)}
V:1 clef=treble
V:2 clef=treble
V:3 clef=bass
V:4 clef=bass
[V:1] z3 | z3 | z3 | z3 |
[V:2] z [CEA]2 | z [B,EG]2 | z [CEA]2 | z [B,EG]2 |
[V:3] A,,3 | D,,3 | A,,3 | D,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] a3 | g f e | d e f | e d c |
[V:2] z [CEA]2 | z [CEA]2 | z [_B,DG]2 | z [A,DF]2 |
[V:3] A,,3 | C,3 | G,,3 | D,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] e3 | g2 g | [d-][d-FA]2 | [d]3 |
[V:2] x3 | x3 | x3 | x3 |
[V:3] A,,3 | E,,3 | G,,3 | D,,3 |
[V:4] z [A,CE]2 | z [G,B,E]2 | z [D,G,B,]2 | z [A,CF]2 |
[V:1] [d-][dFA]2 | z c f | g2 a | d e f |
[V:2] x3 | x3 | x3 | x3 |
[V:3] G,,3 | D,,3 | G,,,3 | G,,,3 |
[V:4] z [D,G,B,]2 | z [A,CF]2 | z [B,EG]2 | z [A,CF]2 |
[V:1] B A G | A3 | D3- | D3 |
[V:2] x3 | x3 | x3 | x3 |
[V:3] G,,,3 | D,,3 | G,,,3 | G,,,3 |
[V:4] z [A,CE]2 | z [A,CF]2 | z [A,CF]2 | z [B,EG]2 |
[V:1] e3 | f g f | e d e- | e3- |
[V:2] z [CEA]2 | z [B,EG]2 | z [CEA]2 | z [B,EG]2 |
[V:3] C,,3 | E,,3 | C,,3 | E,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] e d c | B c B | A3 | z3 |
[V:2] z [CEA]2 | z [B,EG]2 | z [A,CF]2 | z [B,EG]2 |
[V:3] C,,3 | E,,3 | A,,3 | D,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] z3 | z3 | a3 | g f e |
[V:2] z [CEA]2 | z [B,EG]2 | z [CEA]2 | z [CEA]2 |
[V:3] A,,3 | D,,3 | A,,3 | C,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] d e f | e d c | e3 | g2 g |
[V:2] z [_B,DG]2 | x3 | x3 | x3 |
[V:3] G,,3 | D,,3 | A,,3 | E,,3 |
[V:4] x3 | z [A,DF]2 | z [A,CE]2 | z [G,B,E]2 |
[V:1] c B A | B2 c | d3 | e3 |
[V:2] x3 | x3 | x3 | z [CEA]2 |
[V:3] E,,3 | E,,3 | D,,3 | D,,3 |
[V:4] z [A,CF]2 | z [G,B,E]2 | z [A,CF]2 | x3 |
[V:1] z3 | z3 | g2 a | d e f |
[V:2] x3 | x3 | x3 | x3 |
[V:3] D,,3 | D,,3 | G,,,3 | G,,,3 |
[V:4] z [A,CE]2 | z [A,CF]2 | z [B,EG]2 | z [A,CF]2 |
[V:1] B A G | A3 | D3- | D3 |
[V:2] x3 | x3 | x3 | x3 |
[V:3] G,,,3 | D,,3 | G,,,3 | G,,,3 |
[V:4] z [A,CE]2 | z [A,CF]2 | z [A,CF]2 | z [B,EG]2 |
[V:1] e3 | f g f | e d e- | e3- |
[V:2] z [CEA]2 | z [B,EG]2 | z [CEA]2 | z [B,EG]2 |
[V:3] C,,3 | E,,3 | C,,3 | E,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] e d c | B c B | A3 | z3 |
[V:2] z [CEA]2 | z [B,EG]2 | z [A,CF]2 | z [B,EG]2 |
[V:3] C,,3 | E,,3 | A,,3 | D,,3 |
[V:4] x3 | x3 | x3 | x3 |
[V:1] z3 | z3 | [C-E-A-c-]3 | [CEAc]3 |]
[V:2] z [CEA]2 | z [B,EG]2 | x3 | x3 |]
[V:3] A,,3 | D,,3 | [A,,,-E,,-A,,-]3 | [A,,,E,,A,,]3 |]
[V:4] x3 | x3 | x3 | x3 |]
`;

export default {
  summary: "Satie's third Gymnopédie (1888), all 60 bars, slow and grave in 3/4 (Lent et grave). As in the other two, the left hand plays a low bass note on beat 1 and a chord on beats 2 and 3, under a slow right-hand line. Six sections: Intro (bars 1–4), A (5–13), B (14–27), A′ (28–40), B′ (41–55) and Coda (56–60). Nothing is changed from the edition. The left hand's chords are drawn in the treble staff and move down to the bass staff in bars 9–20, 34–39 and 41–48, as in the edition.",
  steps: [
    "Left hand alone in the Intro and A, in wait mode. Bass note on beat 1, then up to the chord on beat 2, held through beat 3. From bar 9 the chords are drawn in the bass staff; they're still the left hand's.",
    "Right hand alone in A and B. In bars 11 and 13 it holds the D and adds F and A below it on beat 2; keep the D down through them. The D in bar 11 is tied into bar 12; the one in bar 13 is struck again.",
    "Hands together a section at a time. In bars 19–20 and 47–48 the right hand holds a low D for two bars, then leaps up a ninth to the E that opens the next bar.",
    "Play-along with the click at 42. Each clean pass nudges the tempo up toward 66.",
  ],
  watch: [
    "The only accidental is the B flat in the left-hand chord in bars 7 and 33. Everything else is on the white keys.",
    "The E in bars 23–25 is held across two bar lines: struck on beat 3 of bar 23 and held through beat 1 of bar 25. Bars 51–53 do the same.",
    "The last two bars are one chord in each hand, tied over: A, E and A in the left, C, E, A and C in the right. Hold them for all six beats.",
    "The bass note is written for the whole bar, but the left hand leaves it to play the chord; hold it with the pedal and change the pedal with each new bass note.",
  ],
  source: { label: "Mutopia Project — Satie, Gymnopédie No. 3 (Dover edition)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=39" },
  score: {
    bpm: 42, target: 66,
    sections: [{ name: "Intro", from: 1, to: 4 }, { name: "A", from: 5, to: 13 }, { name: "B", from: 14, to: 27 }, { name: "A′", from: 28, to: 40 }, { name: "B′", from: 41, to: 55 }, { name: "Coda", from: 56, to: 60 }],
    abc: ABC,
  },
};

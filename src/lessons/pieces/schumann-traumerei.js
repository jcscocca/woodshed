// Schumann, Träumerei, Kinderszenen Op. 15 No. 7, from the Mutopia edition of the Leichte Stücke print (1900,
// public domain), 24 bars. The quarter-note pickup is padded into a full first bar, so bar numbers run one
// ahead of the printed ones. The repeat of printed bars 1–8 is played once. The right hand's melody and inner voice
// share voice 1 as chords, with held notes tied; the left hand keeps the edition's two voices. The eighth-note
// lines the edition writes across the staves in printed bars 10–16 go to the hand whose staff each note is on.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Träumerei
C:Robert Schumann
M:4/4
L:1/8
K:F
%%staves {1 (2 3)}
V:1 clef=treble
V:2 clef=bass
V:3 clef=bass
[V:1] z6 C2 | F2- [FF,-C-]3 [EF,-C-] [FF,-C-] [AF,C] |
[V:2] z8 | F,,8- |
[V:3] z8 | F,,2 [C,A,]6- |
[V:1] c f [F-f]4 [F-e] [F-d] | [F-c] [Ff] [E-G] [E-A] [E-B] [Ed] [C-F] [C-EG] | [C-FA] [Cc] [CEG]4 C2 |
[V:2] F,,2 D4 C B, | A,2 B, A, G,2 F, G, | A,2 G,4 z2 |
[V:3] [C,A,]2 {B,,F,}F,6 | C,2 C,4 A,, C, | F,2 C, D, C, B,, G,, A,, |
[V:1] F2- [FF,-C-]3 [EF,-C-] [FF,-C-] [AF,C] | c a [A-G-a]3 [A-G-g] [A-G-f] [A-Ge] | [A-f] [A-a] [Ad] [_Af] [e-G] [e-c] [eE] [^F_e] |
[V:2] F,,8- | F,,2 E6 | D3 z4 C |
[V:3] F,,2 [C,A,]6- | [C,A,]2 {^C,A,}A,6- | [A,D,]3 [C-F,] [CG,]3 A, |
[V:1] [F-d]2 [Fe]2 {c}[Ec]2 z C | F2- [FF,-C-]3 [EF,-C-] [FF,-C-] [AF,C] | c [B_e] [A_e]3- [A_e^F] [A-d] [Ac] |
[V:2] =B, G A, =B, C z3 | F,,8 | z G, ^F, A, D4- |
[V:3] G,4 C, D, B,, G,, | F,,2 [C,A,]6 | z C, D,2- D,3 ^F, |
[V:1] [G-B] [Gd] G [_EA] [B-D] [B-G] [BB,] [CA] | G3 [D-C] [DB,]2 z F | B2- [BB,-F-]3 [AB,-F-] [BB,-F-] [dB,F] |
[V:2] D3 z z4 | B, D G, A,2 G, G,, A,, | z8 |
[V:3] G,3 [C,^F,] [D,G,]3 _E, | D,3 D,2 G, G,, A,, | B,,,2 [F,D]6 |
[V:1] f- [fb] [eb]3- [eb^c] [e-a] [eg] | [d-f] [da] d [Be] [f-A] [f-d] [fF] [Ge] | [d-F] [d-A] [d] [A-G] [AF]2 [EG]2 | {C}F2- [FF,-C-]3 [EF,-C-] [FF,-C-] [AF,C] |
[V:2] z D ^C E A4- | A3 z z4 | z2 D [^CE] D2 =C z | F,,8- |
[V:3] z G, A,2- A,3 ^C | D3 [G,^C] [A,D]3 B, | A,2- A,3 B,2 C, | F,,2 [C,A,]6- |
[V:1] c f [F-f]4 [F-e] [F-d] | [F-c] [Ff] [E-G] [E-A] [E-B] [Ed] [C-F] [C-EG] | [C-FA] [Cc] [CEG]4 C2 |
[V:2] F,,2 D4 C B, | A,2 B, A, G,2 F, G, | A,2 G,4 z2 |
[V:3] [C,A,]2 {B,,F,}F,6 | C,2 C,4 A,, C, | F,2 C, D, C, B,, G,, A,, |
[V:1] F2- [FF,-C-]3 [EF,-C-] [FF,-C-] [AF,C] | c a !fermata![F-G-d-a]3 [F-G-d-g] [F-G-df] [F-Gd] | [F-c] [Ff] [E-G] [E-A] [E-B] [Ed] [D-G] [D-^FA] | [D-GB] [Dd] [B,-D] [B,C-E] !fermata![A,CF]4 |]
[V:2] F,,8- | F,,2 z6 | z2 B, A, G,2 z2 | z2 [C,-G,]2 !fermata![C,F,,]4 |]
[V:3] F,,2 [C,A,]6- | [C,A,]2 !fermata![G,,=B,,=B,]6 | [C,A,C]2 C,4 [B,,G,] [D,A,] | [G,B,]2 C, C,, z4 |]
`;

export default {
  summary: "Schumann's Träumerei (Dreaming), No. 7 of Kinderszenen, Op. 15, all 24 bars in 4/4, in F major. A slow singing melody in the right hand over held inner voices in both hands. Three sections: A (bars 1–9), B (10–17) and A′ (18–25), which follows A until bar 22 and then turns to the close. Bar 1 holds the quarter-note pickup, so bar numbers here run one ahead of the printed ones. The original repeats A; here you play it once. The right hand's melody and inner voice are written together as chords, with ties showing every held note.",
  steps: [
    "Right hand alone in A, in wait mode. The melody is the top note; under it the hand holds an inner voice, as in bar 2, where F and C come in on beat 2 under the held F. Follow the ties and keep those notes down until they end.",
    "Left hand alone in A. Bars 2 and 6 start on a low F held through the bar, with C and A above it on beat 2; bars 3–5 move in two voices, mostly quarters and eighths, with a half note or longer in each bar.",
    "B (bars 10–17) passes notes between the hands: in bars 11 and 15 an eighth-note line rises from the left hand into the right, and in bar 17 it comes back down. Take it hands together, a bar at a time.",
    "Play-along with the click at 36. Each clean pass nudges the tempo up toward 60.",
  ],
  watch: [
    "The low F in bars 2, 6, 10, 18 and 22 is written as held while the left hand plays C and A a tenth above it. The edition pedals these bars; if your hand can't hold the F, let the pedal hold it.",
    "Grace notes come just ahead of the beat and only the main note is graded: B flat and F before beat 2 of bars 3 and 19 and C sharp and A before beat 2 of bar 7 (left hand), C before beat 3 of bar 9 and before bar 18 (right hand).",
    "Accidentals gather in bars 8–17: A flat, E flat and F sharp in bar 8, B natural in the left hand in bar 9, E flat and F sharp in bars 11–12, C sharp in bars 15–17. The close has B natural again in bar 23 and F sharp in bar 24. In bar 23 the right hand strikes F, G, D and the high A together, a tenth; roll it from the bottom if that's past your reach.",
  ],
  source: { label: "Mutopia Project — Schumann, Träumerei, Kinderszenen Op. 15 No. 7 (Leichte Stücke, 1900)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=504" },
  score: {
    bpm: 36, target: 60,
    sections: [{ name: "A", from: 1, to: 9 }, { name: "B", from: 10, to: 17 }, { name: "A′", from: 18, to: 25 }],
    abc: ABC,
  },
};

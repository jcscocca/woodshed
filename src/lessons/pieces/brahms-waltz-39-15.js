// Brahms, Waltz in A flat, Op. 39 No. 15 (the original version), from the Mutopia edition of the Joseffy print
// (public domain), 44 bars. The edition writes everything out, so there are no repeats to expand. Where the
// right hand has two voices (bars 3, 7, 22, 29 and their returns, and bars 39–43) they are folded into chords,
// with ties keeping the held notes their full length.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Waltz in A flat, Op. 39 No. 15
C:Johannes Brahms
M:3/4
L:1/8
K:Ab
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] [Ec]3 [CA] [CA][Ec] | [Ec]3 [CA] [CA][Ec] | [F-A-d][F-A-e]/[FAd]/ [EAc]2 [DAB]2 | [EAc]3 A A[ce] |
[V:2] A,,2 [E,A,C]2 [C,E,A,]2 | A,,,2 [E,A,C]2 [C,E,A,]2 | A,,2 [D,F,D]2 [F,A,]2 | A,,,2 [E,A,C]2 [C,E,A,]2 |
[V:1] [Acf]3 [Ac] [Ac]e | [Acf]3 [Ac] [Ac]e | [G-c-g][Gcf] [Gce]2 [F=B=d]2 | [Gce]3 [EG] [EG]c |
[V:2] F,,2 [F,A,CF]2 [A,,E,C]2 | F,,2 [F,A,CF]2 [A,,E,C]2 | E,,2 [E,G,C]2 [G,,F,=B,]2 | C,,2 [E,G,C]2 [C,E,]2 |
[V:1] [Ec]3 [CA] [CA][Ec] | [Ec]3 [CA] [CA][Ec] | [F-A-d][F-A-e]/[FAd]/ [EAc]2 [DAB]2 | [EAc]3 A A[ce] |
[V:2] A,,2 [E,A,C]2 [C,E,A,]2 | A,,,2 [E,A,C]2 [C,E,A,]2 | A,,2 [D,F,D]2 [F,A,]2 | A,,,2 [E,A,C]2 [C,E,A,]2 |
[V:1] [Acf]3 [Ac] [Ac]e | [Acf]3 [Ac] [Ac]e | [G-c-g][Gcf] [Gce]2 [F=B=d]2 | [Gce]3 [EGc] [EGc]e |
[V:2] F,,2 [F,A,CF]2 [A,,E,C]2 | F,,2 [F,A,CF]2 [A,,E,C]2 | E,,2 [E,G,C]2 [G,,F,=B,]2 | C,,2 [E,G,C]2 [C,E,G,]2 |
[V:1] [EGBde]3 [EGB] [EGB][de] | [EAce]3 [Ac] [Ac]e | [Ace_ga]3 [Ace] [Ace][_ga] | [Adfa]3 [Adf] [Adf]a |
[V:2] E,,2 [E,G,D]2 [E,G,]2 | A,,2 [E,A,C]2 [E,A,]2 | A,,,2 [A,C_G]2 [A,C]2 | D,,2 [A,DF]2 [A,D]2 |
[V:1] [AB=dfb]3 [B=df] [B=df]a | [B-d-a][Bdg] [Adf]2 [Gde]2 | [Ec]3 [CA] [CA][Ec] | [Ec]3 [CA] [CA][Ec] |
[V:2] [B,,,B,,]2 [A,B,=DF]2 [F,B,=D]2 | E,,2 [E,B,D]2 [E,B,E]2 | A,,2 [E,A,C]2 [C,E,A,]2 | A,,,2 [E,A,C]2 [C,E,A,]2 |
[V:1] [F-A-d][F-A-e]/[FAd]/ [EAc]2 [DAB]2 | [EAc]3 A A[ce] | [Acf]3 [Ac] [Ac]e | [Acf]3 [Ac] [Ac]e |
[V:2] A,,2 [D,F,D]2 [F,A,]2 | A,,,2 [E,A,C]2 [C,E,A,]2 | F,,2 [F,A,CF]2 [A,,E,C]2 | F,,2 [F,A,CF]2 [A,,E,C]2 |
[V:1] [A-a][Ae] [Gd]2 [DEB]2 | [CEA]2 z[EAc] [EAc]e | [EGBde]3 [EGB] [EGB][de] | [EAce]3 [Ac] [Ac]e |
[V:2] C,,2 E,,2 [E,G,]2 | A,,2 [E,A,]2 [E,A,C]2 | E,,2 [E,G,D]2 [E,G,]2 | A,,2 [E,A,C]2 [E,A,]2 |
[V:1] [Ace_ga]3 [Ace] [Ace][_ga] | [Adfa]3 [Adf] [Adf]a | [AB=dfb]3 [B=df] [B=df]a | [B-d-a][Bdg] [Adf]2 [Gde]2 |
[V:2] A,,,2 [A,C_G]2 [A,C]2 | D,,2 [A,DF]2 [A,D]2 | [B,,,B,,]2 [A,B,=DF]2 [F,B,=D]2 | E,,2 [E,B,D]2 [E,B,E]2 |
[V:1] [ec']2 (3z[CA][Ec] (3[ca][ec'][ca] | [ec']2 (3z[CA][Ec] (3[ca][ec'][ca] | [f-a-d'][f-a-e']/[fad']/ [eac']2 [dab]2 |
[V:2] A,,,2 [E,A,C]2 [C,E,A,]2 | A,,,2 [E,A,C]2 [C,E,A,]2 | D,,2 [D,A,]2 [F,A,]2 |
[V:1] [eac']2 (3z[CA][Ec] (3[ca][ec'][f-c'-] | [fc'af']2 (3z[CA][Ec] (3[ca][ec'][f-c'-] | [fc'af']2 (3z[CA][Ec] (3[ca][ec'][a-c'-] | [a-c'-a'][ac'e'] [dgd']2 [Bdb]2 | [Aca]2 z2 z2 |]
[V:2] A,,,2 [E,A,C]2 [C,E,A,]2 | F,,2 [F,A,C]2 [A,,E,A,]2 | F,,2 [F,A,C]2 [A,,E,A,]2 | C,,2 E,,2 [E,G,D]2 | A,,,2 [E,A,C]2 z2 |]`;

export default {
  summary: "Brahms's Waltz in A flat, Op. 39 No. 15, in its original version (he also published a simplified one), all 44 bars in 3/4. The right hand sings the tune in chords over a left hand that plays a bass note and two chords in nearly every bar. Six sections: A (bars 1–8), A again (9–16), B (17–22), A return (23–30), B again (31–36) and A in triplets (37–44), where the tune comes back an octave higher, broken up by triplet chords. The edition writes every repeat out, so nothing is changed.",
  steps: [
    "Left hand alone, in wait mode. Nearly every bar is a bass note on beat 1 and two chords on beats 2 and 3. The bass note often sits far below the chords, as in bar 2: the low A flat, then the chord E flat–A flat–C well over an octave above it. Keep your eyes on the chords and find the bass by feel.",
    "Right hand alone in A. Most bars are a dotted-quarter chord and three eighths, with the tune on top. In bars 3 and 7 the top line moves while the lower notes hold for a quarter: D flat, E flat, D flat in bar 3, G, F in bar 7.",
    "Hands together, one section at a time. In B (bars 17–22) the right-hand chords grow to four and five notes. In bars 37–42, except bar 39, the right hand breaks into triplets after beat 1: an eighth rest, then chords that leap up an octave. Count three to each beat.",
    "Play-along with the click at 72. Each clean pass nudges the tempo up toward 120.",
  ],
  watch: [
    "Read the accidentals: B natural in both hands and D natural in the right hand in bars 7 and 15, G flat in both hands in bars 19 and 33, D natural in both hands in bars 21 and 35.",
    "The left hand's chord on beat 3 of bars 5–6, 13–14 and 27–28 spans a tenth, A flat to C. If it is too wide, roll it quickly from the bottom.",
    "In bars 40–42 the last triplet chord is tied over the bar line, so the next bar's first chord strikes only its new notes while the tied ones hold. Bar 43 then starts on a high A flat.",
  ],
  source: { label: "Mutopia Project — Brahms, Waltz in A flat, Op. 39 No. 15 (Joseffy edition)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=794" },
  score: {
    bpm: 72, target: 120,
    sections: [{ name: "A", from: 1, to: 8 }, { name: "A again", from: 9, to: 16 }, { name: "B", from: 17, to: 22 }, { name: "A return", from: 23, to: 30 }, { name: "B again", from: 31, to: 36 }, { name: "A in triplets", from: 37, to: 44 }],
    abc: ABC,
  },
};

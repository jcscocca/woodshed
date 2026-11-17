// Chopin, Prelude in A major, Op. 28 No. 7, from the Mutopia edition of the Peters print (public domain), 16
// bars. The quarter-note pickup is padded into a full first bar, so bar numbers run one ahead of the printed
// ones. The right hand's two voices share one staff, with the held notes tied (bars 6–7, 9–10, 12 and 16–17).
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Prelude in A, Op. 28 No. 7
C:Frédéric Chopin
M:3/4
L:1/16
K:A
%%staves {1 2}
V:1 clef=treble
V:2 clef=bass
[V:1] z8 E4 | c3d [DGB]4 [DGB]4 | [DGB]8 [df]4 | [^B^d]3[ce] [ca]4 [ca]4 |
[V:2] z12 | E,,4 [E,E]4 [E,E]4 | [E,E]8 z4 | A,,4 [A,E]4 [A,E]4 |
[V:1] [ca]8 [Ec]4 | [C^A]3[D-B] [D-Fd]4 [D-Fd]4 | [DFd]8 [DG]4 | [DG]3[CA] [Cc]4 [Cc]4 |
[V:2] [A,E]8 z4 | E,,4 [E,B,]4 [E,B,]4 | [E,B,]8 z4 | A,,,4 [E,A,E]4 [E,A,E]4 |
[V:1] [Cc]8 E4- | [E-G-c]3[EGd] [DGB]4 [DGB]4 | [DGB]8 [df]4 | [^B^d]3[c-e-] [c-e-ac']4 [ceac']4 |
[V:2] [E,A,E]8 z4 | E,,4 [E,E]4 [E,E]4 | [E,E]8 z4 | A,,4 [A,EA]4 [A,EA]4 |
[V:1] [^Ace^ac']8 [^Ac]4 | [^Ac]3[Bd] [Bf]4 [=Af]4 | [Gf]8 [DG]4 | [DB]3[CA] {A}[A-ca]4 [A-ca]4 | [Aca]8 z4 |]
[V:2] [F,CEF]8 z4 | B,,,4 [F,D]4 [F,B,D]4 | [E,B,D]8 z4 | A,,,4 [E,A,E]4 [A,E]4 | [A,E]8 z4 |]`;

export default {
  summary: "Chopin's Prelude in A major, Op. 28 No. 7, a short mazurka, all 16 bars in 3/4. It is eight two-bar phrases in one rhythm: a quarter-note pickup, a dotted eighth and sixteenth, two quarter-note chords, then a chord held for a half note. Two sections: First half (bars 1–9) and Second half (10–17). Bar 1 holds the pickup, so bar numbers here run one ahead of the printed ones. The right hand's two voices are written as chords, with the held notes tied.",
  steps: [
    "Right hand alone in wait mode. Every phrase has the same shape: the pickup, a dotted eighth and a quick sixteenth, two quarter-note chords on beats 2 and 3, then a half note. Keep the sixteenth light and on time, not snapped.",
    "Left hand alone. Each phrase is a low bass note on beat 1, chords on beats 2 and 3, then a chord held for a half note and a quarter rest. Through bar 11 it is one chord per phrase; from bar 12 the chord changes. The leap up from the bass note is an octave or more, so look ahead to the chord. The edition pedals each phrase, mostly from the bass note to the rest.",
    "Hands together by section, in wait mode. The second half starts like the first, then climbs to the high chords in bars 12–13.",
    "Play-along with the click at 40. Each clean pass nudges the tempo up toward 66.",
  ],
  watch: [
    "Some right-hand notes hold under the chords: the low D from bar 6 into bar 7, the pickup E into bar 10, C sharp and E through bar 12, and the A in bars 16–17, which comes after a quick grace note on the same A.",
    "B sharp and D sharp open bars 4 and 12. A sharp comes in bars 6, 13 and 14, and the A on beat 3 of bar 14 is A natural again.",
    "Bar 13's right-hand chord spans a tenth, A sharp up to the C sharp above the octave, over the left hand's F sharp chord. The edition brackets it to sound together; if that is past your reach, roll it quickly from the bottom up.",
  ],
  source: { label: "Mutopia Project — Chopin, Prelude in A, Op. 28 No. 7 (Edition Peters)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=470" },
  score: {
    bpm: 40, target: 66,
    sections: [{ name: "First half", from: 1, to: 9 }, { name: "Second half", from: 10, to: 17 }],
    abc: ABC,
  },
};

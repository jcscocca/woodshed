// Schumann, "Melody", Op. 68 No. 1 (Album for the Young); pitches and rhythms checked against the Mutopia
// edition (CC BY-SA 2.5). Both hands are in the treble clef, as Schumann wrote it.
// ABC source is line-sensitive, so it lives at column 0.
const ABC = `X:1
T:Melody
C:Robert Schumann
M:4/4
L:1/8
K:C
%%staves {1 2}
V:1 clef=treble
V:2 clef=treble
[V:1] e2 d2 c2 B2 | AcBd c2 G2 | g2 f2 e2 c2 | B2 [^FA]2 G2 z2 ||
[V:2] CGFG EGCE | FDGF EFED | EGDG CGEG | DGCD B,DG,2 ||
[V:1] d2 c2 B2 z2 | f2 e2 d2 z2 | a2 g2 f2 e2 | dfeg [Af]cBd |
[V:2] FGEG DG^FG | DGCG B,G^FG | FGEG DGCG | B,GC^C D2G2 |
[V:1] [ce]2 d2 c2 B2 | AcBd c2 G2 | a2 g2 [Bf]2 [ce]2 | dfBd c2 z2 |
[V:2] CGFG EGCE | FDGF EFEC | FcEc DGCG | FAGF EGCE |
[V:1] d2 c2 B2 z2 | f2 e2 d2 z2 | a2 g2 f2 e2 | dfeg [Af]cBd |
[V:2] FGEG DG^FG | DGCG B,G^FG | FGEG DGCG | B,GC^C D2G2 |
[V:1] [ce]2 d2 c2 B2 | AcBd c2 G2 | a2 g2 [Bf]2 [ce]2 | dfBd c2 z2 |]
[V:2] CGFG EGCE | FDGF EFEC | FcEc DGCG | FAGF EGC2 |]`;

export default {
  summary: "Schumann's \"Melody\", the first piece in his Album for the Young (1848), all 20 bars. The right hand sings a slow tune, mostly one note to a beat, while the left hand flows underneath in even eighth notes. Five sections: A1 (bars 1–4), B1 (5–8), A2 (9–12), B2 (13–16) and A3 (17–20). The original repeats the first four bars; here you play them once.",
  steps: [
    "Start with the left hand alone in A1, in wait mode. It's eighth notes all the way through; in the B sections nearly every other note is the same G, so keep that G light and let the other notes carry the line.",
    "Then the right hand alone. Join each note to the next with no gap, so the tune sounds like one long breath rather than separate keys.",
    "Hands together in wait mode, a section at a time. B2 and A3 are the same as B1 and A2 (only the left hand's very last beat differs), so once bars 5–12 are secure the rest follows.",
    "Switch to play-along with the click at 52, the tune a little louder than the eighths. Each clean pass nudges the tempo up toward 80.",
  ],
  watch: [
    "Both staves are in the treble clef, as Schumann wrote it — the left hand sits around middle C and just above. Read the lower staff as bass clef and every note comes out a third wrong.",
    "In bars 8 and 16 the right hand holds its F for three eighths while it plays A, C, B and D underneath. The score writes the F short so the hand fits on one line, but keep it held.",
  ],
  source: { label: "Mutopia Project — Schumann, Melodie, Op. 68 No. 1 (typeset by Philippe Hézaine, CC BY-SA 2.5)", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=647" },
  score: {
    bpm: 52, target: 80,
    sections: [{ name: "A1", from: 1, to: 4 }, { name: "B1", from: 5, to: 8 }, { name: "A2", from: 9, to: 12 }, { name: "B2", from: 13, to: 16 }, { name: "A3", from: 17, to: 20 }],
    abc: ABC,
  },
};

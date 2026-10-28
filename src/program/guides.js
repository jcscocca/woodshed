// These are teaching choices for this learner, not claims of a published grade
// equivalence. Sources and editorial changes live with the individual scores.
const FOUNDATIONS = {
  "c-major-foundations-1": {
    materialNote: "Short original drills and miniatures, plus a four-bar Ode to Joy melody with our simple bass. Use this unit to repair pulse, coordination and reading around middle C; preview later units if these foundations already feel comfortable.",
    prerequisites: ["Find middle C and follow the basic treble and bass staves. Use the starting-point checks to find the repairs you need."],
    moveOn: ["Count through a rest and a held bass without adding a thinking pause; try again on a later visit.", "Find A3, C4 and E4 from the clef and read the intervals around them, rather than remembering one ordering.", "Join a short melody to its bass, then identify one audible thing to repair. Scale and chord work should keep the same comfortable pulse."],
    support: ["If joining the hands breaks the count, use one beat or one bar before extending the passage. A slower tempo is a tool, rather than a failing grade."],
    musicIds: ["music-ode-opening", "music-after-rain"],
  },
  "g-major-foundations-2": {
    materialNote: "Original four- and eight-bar studies apply F-sharp, G/C/D7/Em and moving bass patterns. Their mood titles describe intended character; they are practice studies rather than arrangements of film, anime or pop songs.",
    prerequisites: ["A short C-major melody over a held bass feels manageable at your own tempo. You can count quarters and paired eighths aloud."],
    moveOn: ["Find F-sharp from the key signature and contrast it with an explicitly natural F.", "Play G-major scale crossings separately, then coordinate a small two-hand chunk without losing the beat.", "Connect G/C/D7 or the pop loop using small voicing changes. Return to a study before hearing the demo and check its bass releases and ending."],
    support: ["Separate a new hand position from a new rhythm: locate the next bass silently, then join only the change into that bar."],
    musicIds: ["g-music-little-promenade", "g-music-homeward"],
  },
  "f-major-foundations-3": {
    materialNote: "Original studies teach B-flat and F's different right-hand scale crossing. The 3/4 waltz adds a contrasting pulse; the broken-bass study is a longer coordination goal, not a task that must be finished in one visit.",
    prerequisites: ["Read a new key signature deliberately, keep a held note sounding under a moving hand, and locate a changed bass before combining hands."],
    moveOn: ["Use B-flat consistently and play F-major's right-hand 1–2–3–4–1 crossing without an extra rhythmic gap.", "Keep three beats in the waltz and compare that grouping with the four-beat studies.", "Return to a chosen passage, start from an internal bar, and hear whether the melody stays clear above the accompaniment."],
    support: ["For the travelling bass, first play only each bar's root, then root–fifth, then the written pattern. Retain the simpler version until its rhythm is comfortable."],
    musicIds: ["f3-music-shore-waltz", "f3-music-paper-boats"],
  },
};

export const guideForUnit = (unit) => ({ ...(FOUNDATIONS[unit.id] || {}), ...unit });

// Optional external material stays outside the self-contained assigned lessons.
// Publisher-listed difficulty is identified as such; it is not an endorsement
// of every arrangement or an assertion that we inspected the complete books.
export const EXTERNAL_MUSIC = [
  { id: "external-bach-prelude-c", kind: "external", title: "Bach: Prelude in C, opening harmonic cycle", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=5", description: "Score examined: bars 1–4 use a repeating sixteenth pattern over separately held LH notes, returning through C, Dm7/C and G7/B to C. A possible next project after the A-minor subdivision work, with a new held-voice challenge. This is an external score, not an assigned Woodshed lesson; the selected opening is not the full prelude.", skills: ["sixteenth-subdivision", "held-voices", "harmony"] },
  { id: "external-old-french-song", kind: "external", title: "Tchaikovsky: Old French Song, a later lyrical option", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2080", description: "Score examined: the opening in G minor has two flats, a singing melody, a moving LH inner voice under a held note, sixteenths and a double-dotted figure. Prepare those voices and rhythms before choosing its first statement. An external future project, rather than an immediate easy replacement.", skills: ["g-minor-reading", "held-voices", "dotted-rhythm"] },
  { id: "external-satie-gymnopedie", kind: "external", title: "Satie: Gymnopédie No. 1, a later stretch", url: "https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=37", description: "Score examined: bars 5–12 require bass-to-chord travel, high A5 ledger reading and a long tied melody in 3/4. Its slow pace hides substantial coordination and pedal demands. Keep it as an aspiration or a separately arranged project after those skills are prepared; no self-contained lesson is assigned yet.", skills: ["bass-chord-travel", "treble-ledger-reading", "ties"] },
  { id: "external-star-wars-beginning", kind: "external", title: "Star Wars: a possible Cantina Band project", url: "https://www.halleonard.com/product/110287/star-wars-for-beginning-piano-solo", description: "Inspected the publisher's Cantina Band sample, page 7: a simple held-note bass under a melody with ties, rests, detached notes and chromatic accidentals. This could follow the F-major rhythm work, beginning with one slow phrase. The collection's other nine arrangements are listed by the publisher but have not been evaluated here. Optional external music.", skills: ["repertoire-reading", "ties", "rests", "chromatic-reading"] },
  { id: "external-disney-simple", kind: "external", title: "Disney: inspect the arrangement, not just the label", url: "https://www.halleonard.com/product/355319/simple-disney-songs", description: "Inspected Almost There, sample page 3 of Simple Disney Songs: swing eighths, offbeat entries, accidentals and changing left-hand intervals. Despite the book's easy-piano label, this sample adds several rhythm demands at once. Keep it as a later swing project; the other listed songs, including Reflection and Married Life, need their own score review.", skills: ["repertoire-reading", "coordination", "swing"] },
  { id: "external-ghibli-entry", kind: "external", title: "Studio Ghibli Favorites for Beginners 2", url: "https://sheetmusic.jp.yamaha.com/products/4947817303060", description: "Yamaha's entry-level collection offers familiar Ghibli music with English, Japanese and Chinese titles. The publisher's listing was checked; the full scores have not been reviewed for this course. Optional exploration, rather than a matched lesson replacement.", skills: ["repertoire-reading"] },
];

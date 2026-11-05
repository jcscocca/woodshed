# Practising from a tablet on a music stand

These changes came from real practice with a tablet in landscape on a music
stand, hands at the piano, no keyboard or mouse. At that distance a paragraph
cannot be read mid-phrase, so the screen has to show a shape rather than
describe one. Tablet landscape (1024–1194px) is the primary target; desktop is
secondary. Below 1024px the existing phone layout is unchanged.

## Keys and fingers under the score

Every guided-course lesson now draws a keyboard under its score
(`src/program/HandMap.jsx`). The right hand is gold and the left hand teal, and
finger numbers sit on the keys.

- **Shapes, not blobs.** A scale or melody is one keyboard for the selected
  passage. Anything with chords or chord symbols becomes one keyboard per bar.
  A bar splits where the chord symbol changes, or where a key would change
  finger mid-bar (`m8-inversion-transfer` plays C/E/G and then E/G/C in one
  bar). Identical consecutive bars merge, so `chord-c` shows two shapes, not
  four. Steps are labelled by chord symbol where the score has one, otherwise
  "Bar n" or "Bar n, beat b".
- **It follows playback.** While the reference or play-along runs, the
  keyboard shows the shape under the cursor. When stopped, tap a step. The
  hand buttons and the From/Through bar selectors narrow it.
- **One keyboard drawing.** `PianoKeys` in `src/diagrams.jsx` extends the
  existing white-keys-only `Keyboard` with black keys, both hands and octave
  labels, using the MIDI band's key geometry. The legacy lesson sheet's
  `Keyboard` now draws through it.

### Where the finger numbers come from

Keys always come from the parsed score (`parseScore` now also carries written
`!1!`–`!5!` fingering and chord symbols on each note). Finger numbers come from
two places:

1. **The score's own fingering.** The 441 scale-path setups already write
   finger numbers into their ABC.
2. **`src/program/chordFingers.js`.** The 33 chord lessons state fingering only
   in prose, so their fingering is transcribed there. There is one token per
   attack in each hand, digits low to high for a chord, and `-` where the
   prose names no finger. `test/program-hand-map.test.mjs` checks every token
   against its score's attack and pitch count. Every chord lesson must have an
   entry, and every right-hand attack must have a finger.

Decisions behind that:

- **Not parsed from prose.** The prose mixes ranges ("A3–E4: fingers
  5–4–3–2–1"), lists and sentence order. 116 of the 196 core exercises have no
  pattern a parser could read safely, and a wrong finger is worse than none.
- **Not written into the ABC.** Practice drafts are keyed to the exact ABC
  string (`src/program/drafts.js`). Editing 33 scores would silently discard
  unfinished drafts.
- **Unstated means blank.** Where a lesson says only "LH roots C3, F2, G2", the
  keys light without numbers rather than guessing 5.
- **Withheld before a first attempt.** Review and fresh-example visits ask for
  a first attempt before help, as they already do for the summary. The
  keyboard appears once that first report is made. Fresh examples keep their
  source lesson's id with different music, so they never use the id-keyed
  fingers.

Known limits:

- The other 163 core exercises show lit keys without finger numbers.
  Transcribing their prose fingering is follow-up work.
- A shape split mid-bar does not carry the other hand's held note into the new
  step.

## The practice rail collapses

The desktop grid was `200px | score | 380px`, so at 1024px the score got about
440px and a four-bar chord score wrapped two bars per line. The rail now
starts collapsed to a 64px strip with the tempo, a play/stop button and an
expand control (`src/PracticeRail.jsx`, `PracticeTools mini`). The strip uses
the same tempo and transport locks as the full rail.

- Opening a Catalogue lesson or the tuner, which live in the rail's slot,
  expands it. Collapsing it again is always available.
- Focus stays on the toggle across its own swap, following the MIDI band's
  chevron.
- The state is not remembered across reloads: the score gets the width by
  default.
- The MIDI keyboard band keeps its 380px readout column. Its readout cannot fit
  in 64px, and the band is its own row.

Measured at 1280×900, the main column goes from about 700px to 1016px. At both
1024 and 1280 the four-bar chord score fits on one line.

## Too easy: skip, stop reviewing, Done

Early lessons can sit well below a returning player's level, and the review
form asked for decisions they didn't need.

- **Too easy — skip** in a lesson's header completes the lesson (and its
  session block) and moves on. **Too easy — skip session** on a session card
  does the same for every unfinished block.
- **Too easy — stop reviewing** on a review card, or in a review visit, retires
  a lesson already practised. Its past practice stays in history.
- **Unskip** appears on a skipped lesson's card and in its header. Progress
  history lists the skip with **Remove this skip**.
- **Done** saves the lesson as ready with its planned minutes in one tap. The
  full form (notes, checks, assessment, minutes) is under **Add details**. It
  opens on its own when an unfinished draft is restored. Done records exactly
  what the filled-in form would: review spacing gets the same evidence as
  before, and nothing is inferred.

The course has no gating; every unit and lesson stays open. So a skip only has
to do three things: complete its block, stay out of review, and not count as
practice. It is stored as a normal attempt with `assessment: "ready"`,
`minutes: 0` and `skipped: true` (`skipLesson`, `unskipLesson` in
`src/program/progress.js`).

- **Review.** Every path that reads attempts as evidence (the review queue,
  scale and technique progress, fresh examples, consolidation visits) already
  ignores zero-minute reports. An older cached copy of the app therefore never
  schedules a skip either.
- **Retiring practised lessons.** `reviewQueue` drops any lesson whose latest
  report is a skip. Practising it again brings it back.
- **Review slots.** A skipped review check fills its slot in a session or
  consolidation visit (`sessionPlan.js`, `sessionVersions.js`,
  `reviewVisits.js`, `sessionProgress`). Without that, the visit would reopen
  the same check.
- **Totals.** Skips add no minutes, no practice day and no streak day. The
  lesson card shows "Skipped" instead of "Ready · 1 visit".

## Less text

A pass over the interface copy removed 115 strings, each one approved
individually. The rule: keep what says what to play, where you are, whether
you played it right, and anything that warns about losing data.

Removed:

- Reassurance ("Ungraded", "This is your own report; the app does not measure
  your performance").
- Explanations of how history and review are tracked ("These answers have
  their own follow-up, separate from your piano assessment").
- Encouragement ("Keep at it — this one needs reps" became "Needs more reps").
- Captions that repeat what a control, heading or the keyboard already shows.

Section heroes became plain names: Chords, Scales, Catalogue, Progress,
Review. The status chip "Self-reported ready" is now "Ready".

Out of scope, by decision:

- Lesson content (summary, steps, fingering prose, listen-for, checks).
- Unit framing prose, such as the Guided Practice hero paragraph.
- Error and recovery messages.
- Screen-reader announcements.
- The unreachable legacy Today and Suggestions screens.

Four strings are hidden visually but kept for screen readers rather than
deleted:

- The score-size help and the tempo target (now "Target ♩ = 68"). Controls
  point to these with `aria-describedby`.
- The lesson and understanding-check save confirmations. These are live
  status messages.

## Tests

- `test/program-hand-map.test.mjs`: shape grouping, hands and bar ranges,
  written fingering, and the chord-fingering data checked against every score.
- `test/program-skip.test.mjs`: block completion, review exclusion and
  retirement, unskip, the zero-minute rule and consolidation visits.
- `test/practice-rail-controls.test.mjs`: the collapsed strip's transport and
  locks.
- `test/browser/tablet.spec.js`: at 1024×768, 1180×820 and 1280×900 in
  Chromium and WebKit, checks the collapsed rail and score width, toggle
  focus, a chord lesson's keyboard and finger numbers, skip/unskip, and Done.

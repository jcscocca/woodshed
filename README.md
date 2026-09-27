# Woodshed

A practice app for piano and guitar. It builds you a short daily set, gives
each item a lesson, lets you log how it went, and shows your progress — and it
shapes the next day from what you logged, favoring whichever instrument is most
overdue and whatever you haven't played in a while.

Built with React + Vite. No account, no server — your history lives in your
browser.

---

## What it does

- **A daily set.** A short, time-boxed rotation that biases toward whichever instrument is most overdue, sometimes pairing piano and guitar in one set. Within an instrument it rotates through what you haven't played lately, pairs a drill with a song, and brings back items you rated "tough" sooner than ones you rated "too easy."
- **Skill tracks.** Ordered progressions per instrument (the **Tracks** tab). Only your *current* stage rotates into daily practice; clear it to unlock the next. When your logs say a stage is done — a couple of "too easy" ratings, or steady volume without a "tough" — a banner on **Today** offers to **Advance** it. Nothing changes until you confirm, and a dismissed suggestion won't reappear until you've practiced that stage more.
- **Library.** Every exercise and track stage, grouped by instrument. Add your own; edit or hide any of them, and delete the ones you added.
- **Lessons.** Every built-in exercise opens a self-contained lesson — step-by-step how-to and "watch for" notes, and on most, the concrete shapes (chord, scale and keyboard diagrams) with a **Hear it** audio demo (an oscillator synth derived from the shapes; no audio files). Tap **Learn** on a card. Lessons are hand-authored and looked up by exercise id — so they appear with no migration and never touch your saved data.
- **Metronome, stopwatch & tuner.** The **♩** icon opens a Web Audio metronome and a session stopwatch. From there, a **tuner (beta)** uses your microphone to show the note you're playing and how far it is from pitch.
- **Logging with tempo.** Log minutes and how it felt for each item, plus an optional BPM (it prefills from the metronome).
- **Progress.** Streak, minutes, a 14-day strip, minutes by instrument, a consistency heatmap, per-exercise tempo trends, and recent sessions you can fix or remove.
- **A streak that forgives a rest day.** Your streak survives a single missed day and only breaks after two in a row; it also tracks your best. Set a **weekly goal** (days/week) and watch it fill on the Progress screen.
- **Curated links.** Exercises and track stages can carry a link out to real instruction; you can add or edit links on any exercise.
- **Built to be usable.** Keyboard focus rings, ARIA on the custom toggles and controls, Escape to close any sheet, and screen-reader labels on the tuner and streak.
- **Yours.** No account or server — history lives in your browser, with JSON export/import to move it between devices.

> The audio tools (metronome and the mic tuner) are best verified on a real device with working audio in/out. Pitch detection is reliable for single, clearly-sounding notes, not chords. See **Tuner notes** below.

---

## On the desktop

At 1024px and wider Woodshed switches to a three-pane layout: the views in a
sidebar, today's set (or Tracks, Library, Progress) in the middle, and a
practice rail on the right — metronome and stopwatch always there, with the
open lesson or the tuner beneath them. Narrower windows get the phone layout.

**Install it:** open https://jcscocca.github.io/woodshed/ in Chrome or Edge and
choose *Install app* (address bar icon or the ⋮ menu). It gets its own window,
works offline, and updates itself when a new version is pushed.

**Keyboard** (desktop layout only): **Space** starts/stops the metronome —
unless you've Tabbed to a button, in which case Space presses that button
instead. **T** taps tempo. **←/→** nudge tempo ±1 (**Shift** ±10). **S**
starts/pauses the stopwatch. **1–4** switch views. **L** logs today's set.
**Esc** closes the lesson or tuner in the rail. **?** shows the full list.
Nothing fires while you're typing in a field or while a dialog is open.

### Piano over MIDI

With piano in your rotation, the band along the bottom of the window shows a
**Connect keyboard** button until you connect a USB-MIDI keyboard — Chrome or
Edge only, with a one-time permission prompt. Later launches reconnect on their
own, and plugging or unplugging the keyboard updates the band live.

Connected, the band lights all 88 keys — brighter the harder you play — and
its readout names the chord you're holding and spells its notes, or lists the
note names when it doesn't recognize a chord. **Play back** replays your last
phrase (everything since a 3-second pause) from an always-on 60-second
in-memory buffer; nothing is saved. The chevron collapses the band to a thin
bar.

Open a piano lesson and the band outlines its notes with their finger numbers,
standing in for the lesson's small keyboard diagram while the band is open.

With the keyboard connected, any piano lesson that has notes offers **Coach
me**, graded exactly against what you played: single-note lines note by note,
the rolled-chord lesson in the order you strike it, and the two scale lessons
(Major scales, and the track's one-octave scale stage) hands together, each
right-hand note paired with its left-hand octave. The band outlines the
targets and pulses the next one, coloring hits and misses as you go; the
readout shows the next note and how many are done; a run ends on its own once
every note is graded. The summary adds a timing note and a touch note (how
evenly hard you played — per hand, for the hands-together lessons), neither
scored. Accuracy logs as always and feeds the accuracy trend and the "ready
for the next stage" check. Without a keyboard, piano lessons show **Connect
your keyboard to coach this** (or **Keyboard disconnected…** after an
unplug) where Coach me would be — piano coaching never falls back to the mic.

**Echo** ear training (intervals and short phrases) is back for piano over
MIDI the same way — the band stays dark while a prompt plays, so it can't
give the answer away, then lights up on reveal.

**K** shows/hides the band, **P** plays back, **C** starts/stops coaching the
open lesson — all three do nothing until a keyboard is connected.

Piano only — guitar coaching and Echo stay off, unchanged — desktop layout
only. The app never plays your live notes through the speakers — the piano
already makes its own sound; app audio stays limited to lesson demos and Play
back.

### Reading music

Open a piece, a pop stage, or the sight-reading drill, and it takes over the
middle pane as a **grand staff**, four bars to a system, with a **Score**
entry in the sidebar (key **5**) while it's open.

Work a **section** — the piece's own presets (**A**, **B**, **all**) or click
any note in a bar (shift-click sets the far end) — and the rest of the staff dims
without reflowing. **Hands** narrows to right or left alone, dimming and
ignoring the other staff. **Wait mode** holds at each note (or chord) until
you play it, lighting it on the staff and outlining what's next on the band;
wrong presses flash and never advance. **Play-along** opens with a one-bar
count-in on the click, then grades every note's pitch and timing against it —
on time, early, late, missed or wrong, colored on the staff — and ends with a
summary: notes % and rhythm % (a clean pass is 90%+ notes, 80%+ rhythm), any
extra notes, and which bars to revisit. A clean pass climbs that section's
own tempo ladder by 4 bpm toward the piece's target, remembered per section;
**Log it** records minutes plus accuracy, rhythm, section and tempo.

Three **piano tracks** (the **Tracks** tab) carry this. **Pieces** (8
stages, easiest first) is written classical repertoire — two Petzold
minuets and a musette from the Anna Magdalena notebook, two Schumann pieces
from the Album for the Young, two Burgmüller studies, and the first
movement of a Clementi sonatina — each a section at a time, hands
separately then together then with the click. Six pieces are transcribed
from Mutopia Project public-domain editions; the two Schumann pieces take
their pitches and rhythms from Mutopia's CC BY-SA 2.5 editions (the
compositions themselves are public domain), and every piece cites its
source in its lesson. **Pop from chords** (8 stages) teaches pop piano from
chord charts instead of copyrighted melodies — block chords, voice leading,
a ballad left hand, a syncopated pulse, a doo-wop arpeggio and a 12-bar
blues, then two public-domain lead sheets ("Ode to Joy", "Amazing Grace")
with the melody in the right hand over a written-out left hand. **Two-Hand
Coordination** (6 stages) is scored technique — five-finger patterns,
contrary motion, one-octave scales, Hanon No. 1, cadences and arpeggios —
graded the same way as any piece.

A **chord chart** (a lesson with `chart` instead of `score`) writes a key,
meter, a line of chords and a named accompaniment pattern — block,
voice-led, ballad, pulse, arpeggio, boogie or waltz — out as a two-voice
score with chord symbols, and grades exactly like a piece, note for note.
**Your song**, in the Library, is the same machinery for any song you know
the chords to: type a chord line (`C | G | Am | F`; a line break is also a
bar line), pick a key, meter and pattern, and it plays and grades like any
chart. Chord symbols it knows: `C`, `Cm`, `C7`, `Cmaj7`, `Cm7`, `Csus2`,
`Csus4`, `Cdim`, and a slash bass like `C/E`. Save as many songs as you
like — each remembers its own tempo.

**Sight-reading** drills are generated fresh each time — never the same
twice — across **10 levels**, from one hand in C major up to both hands
together, sharp and flat keys, and chromatic neighbor notes. Play it with the
click; three clean drills in a row and the app offers **Level up →** — it
only advances if you take the offer.

New shortcuts: **W** wait mode / play-along, **H** cycles hands, **N** a new
drill, **[ / ]** previous/next section, **5** back to the open score, **↑/↓**
move the page. Mid-run, **Space** or **C** stops it, and ←/→ and the rail's
tempo controls lock for the run; **Esc** stops a run on the first press and
closes the score on the second.

Desktop and piano only, like the rest of this section.

---

## Run it

You'll need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install      # once
npm run dev      # start the dev server -> http://localhost:5173
npm test         # the test suites
```

To try it on your phone on the same Wi-Fi, expose the dev server on your
network:

```bash
npm run dev -- --host
# then open http://<your-computer-ip>:5173 on the phone
```

## Build & host

```bash
npm run build    # outputs a static site to dist/
npm run preview  # serve the built site locally to check it
```

`dist/` is plain static files. Host it however you like:

- **Static hosts** — drag `dist/` onto Netlify / Vercel / Cloudflare Pages, or
  push to GitHub Pages. (`base: "./"` in `vite.config.js` means it works from a
  subpath too.)
- **GitHub Pages, automatically** — `.github/workflows/pages.yml` builds and
  deploys on every push to `main`, gated on `npm test` passing first. Install
  URL: https://jcscocca.github.io/woodshed/
- **Your own machine** — serve `dist/` from nginx, Caddy, or even
  `npx serve dist`. Running it on an always-on box on your LAN means every
  device can reach the same URL (though each browser still keeps its own data —
  see below).

---

## Where your data lives

Practice history is stored in your browser's `localStorage`, which means it's
**per device** — your laptop and your phone keep separate streaks. To move data
between machines, use **Settings → Your data → Export / Import** (a small JSON
file).

Earlier versions also covered bass and accordion. Loading this version over that
data drops the bass and accordion exercises and sessions, so export a backup
first if that history matters.

When you want true cross-device sync, it's a contained change: everything that
touches storage lives in `src/storage.js`. Swap the bodies of `loadState` and
`saveState` for `fetch()` calls to a small backend you run, and nothing else
moves. Until then, Export / Import moves your data by hand.

---

## Make it yours

The code is split so the parts you'll want to change are easy to find:

| File | What's in it |
|------|--------------|
| `src/seed.js` | Instruments, their colors, the exercise library (`LIBRARY`), and the **skill tracks** (`TRACKS`). **Add exercises or track stages here.** (Or use the in-app **+ Add** button, which saves to your browser.) |
| `src/lessons/` | Hand-authored lesson content (`piano.js`, `guitar.js`), keyed by exercise id. `src/diagrams.jsx` draws the shapes; `src/lessonAudio.js` + `src/audio/notes.js` play them; `src/LessonSheet.jsx` is the sheet. |
| `src/lessons/pieces/` | One module per piece — its ABC, lesson text and public-domain `source` — collected by `index.js` and spread into `piano.js`'s lesson map. |
| `src/engine.js` | The session-building algorithm, the "ready for the next stage" suggestion, the **track** lock/unlock logic, and the stats. All pure functions. Practice stats (last played, count, latest rating, last tempo) are *derived* from the session log, so editing or deleting a session keeps everything consistent. |
| `src/storage.js` | The only file that knows where data is saved. Swap for a backend here. Includes a `migrate()` step so old saved data upgrades cleanly when the shape changes. |
| `src/features.js` | Feature flags. `COACH_ENABLED` switches the **mic**-based pitch coach and guitar Echo on or off (off for now — see *Direction*). Piano coaching and Echo run over MIDI regardless, in `src/midi/`. |
| `src/useMetronome.js` | The Web Audio metronome (accurate lookahead scheduler, tap tempo, accent on beat 1). |
| `src/stopwatch.js` | Pure stopwatch state (`{ startedAt, acc }`) — reads elapsed time from the clock, so it survives hidden tabs and unmounts. |
| `src/PracticeProvider.jsx` | Owns the metronome and stopwatch above the layout switch, so they keep running across view changes and a resize; exposes them via `usePractice()`. |
| `src/PracticeTools.jsx` | The metronome + stopwatch UI (beat dots, BPM, tap, start/stop/reset), shared by the phone sheet and the desktop rail. |
| `src/PracticeSheet.jsx` | The phone bottom sheets: practice tools and the tuner (`ListenPanel`, the tuner body the rail also renders). |
| `src/PracticeRail.jsx` | The desktop rail — `PracticeTools` plus a slot for the open lesson or tuner. |
| `src/Sidebar.jsx` | The desktop sidebar — brand, streak, view nav, Settings. |
| `src/useIsDesktop.js` | `matchMedia("(min-width: 1024px)")` hook that picks phone vs. desktop layout live. |
| `src/shortcuts.js` + `src/useShortcuts.js` | Desktop keyboard shortcuts — a pure `actionFor(event, ctx)` and the `keydown` listener that dispatches it. |
| `src/ShortcutHelp.jsx` | The `?` dialog listing every shortcut. |
| `src/useListener.js` + `src/audio/dsp.js` | The microphone **tuner (beta)** — a thin browser shell over pure, headlessly-tested pitch detection. |
| `src/coach.js`, `src/useCoach.js`, `src/CoachPanel.jsx`, `src/ear.js`, `src/EarPanel.jsx`, `src/lessons/ear.js` | The **pitch coach** and **Echo** ear training — grading, sessions and the shared panels. Live for piano over MIDI (`src/midi/useMidiCoach.js` feeds them from the keyboard); the mic path (`useCoach.js`) stays behind `COACH_ENABLED`, off for guitar. |
| `src/midi/midiModel.js` | Pure MIDI parsing (node-tested) — raw bytes to note on/off/pedal, held-key state (pedal never counts as held), chord grouping, and the take buffer behind Play back. |
| `src/midi/chords.js` | Names the chord you're holding — triads, sixths, sevenths, shell voicings and slash chords — from the pitch classes alone. |
| `src/midi/connection.js` | The one MIDI connection, pure: works against the browser's MIDIAccess or a fake, first-connect plus silent reconnect, follows plug/unplug. |
| `src/midi/fakeMidi.js` | Dev-only fake MIDI device (`?fakemidi` on the dev server) so you can drive the band without hardware. Stripped from production builds. |
| `src/midi/overlay.js` | Small subscribable store a piano lesson uses to put its targets and progress on the band, without routing through `App`. |
| `src/midi/MidiProvider.jsx` | Mounts the MIDI connection on desktop when piano is enabled; exposes status, `connect()`, `subscribe()` and Play back via `useMidi()`. |
| `src/midi/MidiBand.jsx` | The 88-key band and its readout — keys lit by velocity, chord/note readout, Play back, collapse to a thin bar. |
| `src/score/scoreModel.js` | Parses a piece's ABC notation into notes, bars and beats (pure, node-tested) — `parseScore`, plus the `inSection`/`forHands` helpers. |
| `src/score/timedGrade.js` | Grades a play-along run's pitch and timing against the metronome — on / early / late / missed / wrong, notes % and rhythm % (pure). |
| `src/score/waitGrade.js` | Grades wait mode — an onset (a note or chord) advances only once every note in it has been pressed; wrong presses flash but never advance (pure). |
| `src/score/sightread.js` | Generates the sight-reading drills — 10 leveled, seeded patterns as ABC, never the same twice (pure). |
| `src/score/chords.js` | Chord symbols — parses a symbol (`Am7`, `F#m`, `C/E`) or a whole chart line into bars, and spells each chord's tones from its root (pure). |
| `src/score/patterns.js` | The accompaniment patterns (block, voice-led, ballad, pulse, arpeggio, boogie, waltz) as per-chord figures, plus the close-voicing helpers that pick each chord's inversion (pure). |
| `src/score/chartToAbc.js` | Writes a chord chart (key, metre, chords, pattern, optional melody) out as two-voice ABC with chord symbols, so a chart plays and grades like any piece (pure). |
| `src/score/scoreFor.js` | What a scored lesson plays — its ABC, bpm, target and sections, from `score` or a chart written out once; drills and Your song take their ABC from the panel instead. |
| `src/score/songs.js` | Your song's model — `newSong`, `songError`, `lineSections`, `songScore` (a typed chord line to a played, graded score, via `chartToAbc`) (pure). |
| `src/score/runStore.js` + `src/score/useRun.js` | A small subscribable store for the live score run (section, hands, mode, run state, the current drill, the visible window), like `src/midi/overlay.js`; `ScoreStage` and `ScorePanel` read it via the `useRun()` hook, and the shortcuts and rail metronome check whether a run is live. |
| `src/score/ScoreStage.jsx` | The grand staff itself, in the main pane — renders the open piece or drill with lazy-loaded abcjs, colors notes by grading, dims sections, takes bar clicks, scrolls the system window. |
| `src/score/ScorePanel.jsx` | The rail controls for a scored item — section / hands / mode, Start, the tempo ladder and summary, and the sight-reading level picker. |
| `src/score/SongEditor.jsx` | The Your song editor — title, key, meter, chord line and pattern picker, and tempo — rendered by `ScorePanel` for `pno-song`. |
| `src/score/ScoreSnippet.jsx` | A small static staff snippet for the rail (e.g. the C-major-scale lesson) — no cursor, no grading. |
| `src/styles.css` | All styling and the color palette (CSS variables at the top). |
| `src/App.jsx` | The views (Today / Tracks / Library / Progress), the dialogs, and the switch between the phone and desktop layouts. |
| `test/` | The suites `npm test` runs (DSP smoke, lessons schema, coach, ear, engine, desktop, MIDI, score, charts, pieces), plus the real-audio suite in `test/audio/`. |
| `scripts/midi-fixture.mjs` | Reads a reference MIDI file and writes a piece's expected onsets to `test/fixtures/pieces/<id>.json` — the authoring tool that checks each transcribed piece against its source recording; not part of the shipped app. |
| `archive/` | Bass and accordion content and the accordion pitch detector, out of the build. See `archive/README.md`. |
| `docs/DIRECTION.md` | The current product direction. |

### In-app editing

Tap any exercise in **Library** to rename it, change its difficulty label or length, add a resource link, hide it from rotation, or (for ones you added) delete it — that's how you point "Your current piece" at whatever you're actually learning. The edit sheet also shows that exercise's **recent activity** (last sessions, with tempo). In **Progress**, tap any row under **Recent sessions** to fix the minutes/rating or remove a mis-log.

In **Tracks**, each progression shows your place in it: completed stages, your current stage (with its notes and any link), and locked stages ahead. Use **Mark complete** to advance and unlock the next stage — or let the suggestion come to you.

When you log, each exercise takes an optional **♩ tempo** — it prefills from the metronome (or the last tempo you logged) and feeds the tempo trends in Progress.

### Tuner notes

The tuner (`src/useListener.js`) is a thin shell over the pure DSP in
`src/audio/dsp.js`. Pitch detection uses a normalized **AMDF** detector that
gates on *periodicity* rather than loudness — so a quietly-played or
far-from-the-mic note is still detected, while room noise can't produce a
phantom reading. It's reliable for **single, clearly-sounding notes** (tuning a
string, a monophonic line) and is **not** built for chords.

The DSP is covered by a real-audio test suite (`test/audio/`, run with
`npm run test:audio`; it needs fixtures, see `test/audio/README.md`): it runs
these exact detectors against real recorded instrument audio, checked against
ground truth with `pitchfinder` as an independent oracle. An earlier
autocorrelation version dropped quiet real notes (acoustic-guitar E2/E4, piano
C4); the suite catches that class of regression.

What the suite does **not** cover is the live microphone path — real mic,
auto-gain, room noise, latency, the animation-frame cadence. Verify that on a
real device (microphone permission flow, and CPU cost: the AMDF scan runs per
animation frame, which is fine for a tuner but is the first place to optimize —
cap the lag search or move it to a worker — if the readout lags).

### Adding an exercise in code

Append an object to the `LIBRARY` array in `src/seed.js`:

```js
{
  id: "gtr-dropd",          // any unique string
  inst: "guitar",           // piano | guitar
  title: "Drop-D riffing",
  type: "technique",        // technique | song | sight | ear | creative
  diff: 3,                  // 1 (beginner) .. 5 (advanced) — a label you set
  min: 8,                   // estimated minutes
  desc: "What to actually do in this exercise."
}
```

Songs (`type: "song"` or `"creative"`) and drills are balanced within a set —
the builder tries to pair one of each.

> Note: editing `LIBRARY` changes the library for a **fresh** install. If you've
> already used the app, your library is saved in your browser. Use
> Settings → Reset to rebuild from the updated seed (this erases your logs), or
> add the new items through the in-app **+ Add** button.
>
> Newly **added** default items are different: the app merges missing default
> content into an existing library on load (that's how new track stages reach
> you without a reset). The reset caveat applies to *edits* of items you already
> have.

---

## Direction

[docs/DIRECTION.md](docs/DIRECTION.md) is the current plan. In short:

- **The desktop layout is done** (see *On the desktop* above). **Piano over
  USB-MIDI is done too** (see *Piano over MIDI* above) — including coaching and
  Echo, piano-only. **Next: deeper piano and guitar content.**
- **Pitch coach and Echo** are back for piano, exact, over MIDI. On guitar
  they're still disabled pending a rethink — what's worth keeping on the mic.
  The mic path and guitar Echo stay behind `COACH_ENABLED` in
  `src/features.js`.
- **Bass and accordion** are archived in `archive/`; the last four-instrument
  version is at git tag `four-instruments`.
- **Parked:** the Android/Capacitor app, local-model exercise generation,
  push-backed reminders and cross-device sync. Their specs stay in `docs/`.

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
| `src/engine.js` | The session-building algorithm, the "ready for the next stage" suggestion, the **track** lock/unlock logic, and the stats. All pure functions. Practice stats (last played, count, latest rating, last tempo) are *derived* from the session log, so editing or deleting a session keeps everything consistent. |
| `src/storage.js` | The only file that knows where data is saved. Swap for a backend here. Includes a `migrate()` step so old saved data upgrades cleanly when the shape changes. |
| `src/features.js` | Feature flags. `COACH_ENABLED` switches the pitch coach and Echo ear training on or off (off for now — see *Direction*). |
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
| `src/coach.js`, `src/useCoach.js`, `src/CoachPanel.jsx`, `src/ear.js`, `src/EarPanel.jsx`, `src/lessons/ear.js` | The **pitch coach** and **Echo** ear training. Disabled behind `COACH_ENABLED`; the code and its tests are kept. |
| `src/styles.css` | All styling and the color palette (CSS variables at the top). |
| `src/App.jsx` | The views (Today / Tracks / Library / Progress), the dialogs, and the switch between the phone and desktop layouts. |
| `test/` | The suites `npm test` runs (DSP smoke, lessons schema, coach, ear, engine), plus the real-audio suite in `test/audio/`. |
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

- **The desktop layout is done** (see *On the desktop* above). **Next: piano
  over USB-MIDI** (piano only), then deeper piano and guitar content.
- **Pitch coach and Echo** are disabled pending a rethink — whether they come
  back piano-first over MIDI, and what's worth keeping on guitar. The code stays
  behind `COACH_ENABLED` in `src/features.js`.
- **Bass and accordion** are archived in `archive/`; the last four-instrument
  version is at git tag `four-instruments`.
- **Parked:** the Android/Capacitor app, local-model exercise generation,
  push-backed reminders and cross-device sync. Their specs stay in `docs/`.

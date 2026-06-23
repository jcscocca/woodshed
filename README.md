# Woodshed

Adaptive multi-instrument practice. It builds you a short daily set across
your instruments, tracks what you play, and tunes the next day from what you
logged — favoring whichever instrument is most overdue, nudging difficulty
from your "too easy / tough" ratings, and spacing out songs so they resurface.

Built with React + Vite. No account, no server — your history lives in your
browser.

---

## What it does

- **A daily set across your instruments.** A short, time-boxed rotation that biases toward whichever instrument is most overdue, sometimes pairing two so progress doesn't stay diffuse.
- **Skill tracks.** Ordered progressions per instrument (the **Tracks** tab). Only your *current* stage rotates into daily practice; clear it to unlock the next. Free-practice exercises sit alongside the tracks.
- **Lessons.** Most exercises open a self-contained lesson — the concrete shapes (chord/keyboard diagrams), step-by-step how-to, "watch for" notes, and a built-in audio demo (an oscillator synth derived from the shapes; no audio files). Tap **Learn** on a card. Lessons are hand-authored, offline, and looked up by exercise id — so they appear with no migration and never touch your saved data.
- **Suggestions from your practice.** The app reads what you log — repeated "too easy," consistent "tough," or just steady volume — and *proposes* leveling up, easing off, advancing a track stage, or rotating something out. Nothing changes until you confirm, and a handled suggestion won't reappear until you've practiced that item more.
- **Metronome, stopwatch & tuner.** The **♩** icon opens a Web Audio metronome and a session timer. From there, a **tuner & listener (beta)** uses your microphone to show pitch and estimate tempo.
- **Tempo tracking & analytics.** Log an optional BPM per exercise (it prefills from the metronome). **Progress** shows a consistency heatmap, per-exercise tempo trends, and recent-activity history.
- **A streak that forgives a rest day.** Your streak survives a single missed day and only breaks after two in a row; it also tracks your best. Set a **weekly goal** (days/week) and watch it fill on the Progress screen.
- **Optional daily reminder.** Pick a time and Woodshed will nudge you if you haven't practiced — see the caveat under **Reminders** below.
- **Curated links.** Exercises and track stages can carry a link out to real instruction; you can add or edit links on any exercise.
- **Built to be usable.** Keyboard focus rings, ARIA on the custom toggles and controls, Escape to close any sheet, and screen-reader labels on the tuner and streak.
- **Yours, offline.** No account or server — history lives in your browser, with JSON export/import to move it between devices.

> The audio tools (metronome and the mic tuner/listener) are best verified on a real device with working audio in/out. Pitch detection is reliable for single, clearly-sounding notes; chords and accordion reeds are not. See **Listener notes** below.

---

## Run it

You'll need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install      # once
npm run dev      # start the dev server -> http://localhost:5173
```

To try it on your phone on the same Wi-Fi (handy for propping it by an
instrument), expose the dev server on your network:

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
- **Your own machine** — serve `dist/` from nginx, Caddy, or even
  `npx serve dist`. Running it on an always-on box on your LAN means every
  device can reach the same URL (though each browser still keeps its own data —
  see below).

On a phone, open the hosted URL and use "Add to Home Screen" to get a
full-screen, app-like launch.

---

## Where your data lives

Practice history is stored in your browser's `localStorage`, which means it's
**per device** — your laptop and your phone keep separate streaks. To move data
between machines, use **Settings → Your data → Export / Import** (a small JSON
file).

When you want true cross-device sync, it's a contained change: everything that
touches storage lives in `src/storage.js`. Swap the bodies of `loadState` and
`saveState` for `fetch()` calls to a small backend you run, and nothing else
moves. Anything with a basic read/write API works — for a personal project,
something self-hosted (a single-binary backend on an always-on machine) or a
serverless free tier is plenty. Until then, Export / Import moves your data by
hand.

---

## Make it yours

The code is split so the parts you'll want to change are easy to find:

| File | What's in it |
|------|--------------|
| `src/seed.js` | Instruments, their colors, the exercise library, and the **skill tracks** (`TRACKS`). **Add exercises or track stages here.** (Or use the in-app **+ Add** button, which saves to your browser.) |
| `src/lessons/` | Hand-authored lesson content, one file per instrument, keyed by exercise id. `src/diagrams.jsx` draws the shapes; `src/lessonAudio.js` + `src/audio/notes.js` play them; `src/LessonSheet.jsx` is the sheet. |
| `src/engine.js` | The session-building algorithm, the activity-aware **progression** suggestions, the **track** lock/unlock logic, and the stats. All pure functions — tweak the scoring, change how difficulty adapts, etc. Practice stats (last played, count, latest rating, last tempo) are *derived* from the session log, so editing or deleting a session keeps everything consistent. |
| `src/storage.js` | The only file that knows where data is saved. Swap for a backend here. Includes a `migrate()` step so old saved data upgrades cleanly when the shape changes. |
| `src/useMetronome.js` | The Web Audio metronome (accurate lookahead scheduler, tap tempo, accent on beat 1). |
| `src/useListener.js` | The microphone **tuner/listener (beta)** — autocorrelation pitch detection for the tuner, plus a rough tempo estimate from note onsets. |
| `src/coach.js` + `src/useCoach.js` + `src/CoachPanel.jsx` | The **pitch coach** — pure grading core (stabilizer + line/arpeggio matchers), the mic hook, and the lesson-sheet UI. Grades single-note lines and arpeggiated chords against the lesson's known notes. |
| `src/styles.css` | All styling and the color palette (CSS variables at the top). |
| `src/App.jsx` | The UI — Today / Tracks / Library / Progress, the practice tools (metronome, stopwatch, tuner/listener), the analytics dashboards, and all the editing sheets. |

### In-app editing

Tap any exercise in **Library** to rename it, change its difficulty/length, add a resource link, hide it from rotation, or (for ones you added) delete it — that's how you point "Your current piece" at whatever you're actually learning. The edit sheet also shows that exercise's **recent activity** (last sessions, with tempo). In **Progress**, tap any row under **Recent sessions** to fix the minutes/rating or remove a mis-log.

In **Tracks**, each progression shows your place in it: completed stages, your current stage (with its notes and any link), and locked stages ahead. Use **Mark complete** to advance and unlock the next stage — or let the suggestion come to you. On **Today**, when your logs imply a change, a banner offers suggestions you can **Apply** or dismiss.

When you log, each exercise takes an optional **♩ tempo** — it prefills from the metronome (or the last tempo you logged) and feeds the tempo trends in Progress.

The **♩** icon (top right) opens the metronome and a session stopwatch, and from there the **tuner & listener (beta)**.

### Listener notes

The tuner/listener (`src/useListener.js`) is a thin shell over the pure DSP in
`src/audio/dsp.js`. Pitch detection uses a normalized **AMDF** detector that
gates on *periodicity* rather than loudness — so a quietly-played or
far-from-the-mic note is still detected, while room noise can't produce a
phantom reading. It's reliable for **single, clearly-sounding notes** (tuning a
string, a monophonic line) and is **not** built for chords or the multi-reed
sound of an accordion. Tempo is estimated from the spacing of note attacks, so it
wants a steady, clearly-articulated pulse.

The DSP is covered by a real-audio test suite (`test/audio/`, run with
`npm run test:audio`): it runs these exact detectors against real recorded
instrument audio, checked against ground truth with `pitchfinder` as an
independent oracle. An earlier autocorrelation version dropped quiet real notes
(acoustic-guitar E2/E4, piano C4); the suite catches that class of regression.

What the suite does **not** cover is the live microphone path — real mic,
auto-gain, room noise, latency, the animation-frame cadence. Verify that on a
real device (microphone permission flow, and CPU cost: the AMDF scan runs per
animation frame, which is fine for a tuner but is the first place to optimize —
cap the lag search or move it to a worker — if the readout lags).

### The pitch coach

Tap **Coach me** in a lesson (single-note exercises, or chords played as an
arpeggio) and Woodshed grades what it hears against the notes the lesson already
knows. It's deliberately gentle: live, the diagram just lights up as you nail
each note; the honest detail — how many you played clean, which to revisit —
waits for the summary. That score logs alongside the session, shows up as an
accuracy trend in **Progress**, and lets "ready to advance" rest on evidence,
not just a self-rating.

What it **can** grade: one clearly-sounding note at a time — scales, melodic
lines, and chords checked one string at a time. Octave matters on piano (it'll
tell you "right note, wrong octave"); on guitar and bass it's octave-forgiving.

What it **can't**, by design: chords as strummed (it asks you to arpeggiate
instead), accordion (the reeds don't detect cleanly), and timing — v1 grades the
notes, not the tempo. Like the tuner, it's best verified on a real device.

### Reminders

**Settings → Daily reminder** lets you pick a time and get a browser notification if you haven't practiced. The honest limit: a web app can only fire a notification while it's actually running — open in a tab, or installed and running in the background. A reminder that reaches you when the app is **fully closed** needs a push backend (a service worker plus a server sending the push), which this local-only version deliberately doesn't have. So treat it as a nudge for when Woodshed is already open somewhere; the surest prompt is opening the app, where today's set is waiting.


### Adding an exercise in code

Append an object to the `SEED` array in `src/seed.js`:

```js
{
  id: "gtr-dropd",          // any unique string
  inst: "guitar",           // piano | guitar | bass | accordion
  title: "Drop-D riffing",
  type: "technique",        // technique | song | sight | ear | creative
  diff: 3,                  // 1 (beginner) .. 5 (advanced)
  min: 8,                   // estimated minutes
  desc: "What to actually do in this exercise."
}
```

Songs (`type: "song"` or `"creative"`) get spaced repetition — they come back a
few days after you last played them, with the gap widening each time. Everything
else is treated as a drill.

> Note: editing `SEED` changes the library for a **fresh** install. If you've
> already used the app, your library is saved in your browser. Use
> Settings → Reset to rebuild from the updated seed (this erases your logs), or
> add the new items through the in-app **+ Add** button.

---

## What's next

A few items from the original design audit are now built: the forgiving streak with a weekly goal, the daily reminder (with the open-app caveat above), and an accessibility pass (focus rings, ARIA on the custom controls, screen-reader labels on the tuner, and Escape-to-close on every sheet). The one accessibility refinement still open is full `role="dialog"` semantics and focus-trapping on the modal sheets.

The **pitch coach** is now in, too: tap *Coach me* in a lesson to grade single-note lines and arpeggiated chords against the notes the lesson already knows (see *The pitch coach* above). Deferred extensions, in rough order: a soft timing read (the onset detector is too coarse for fast lines today), accordion support, and moving the per-frame DSP to a Web Worker if a phone ever lags — it stays on the main thread now via an exercise-aware narrowed pitch search.

The bigger piece still open is a **local-model upgrade**: instead of drawing from a fixed library, point the app at an LM Studio endpoint to generate fresh exercises on demand and read your session notes for feedback. `generateSession` in `src/engine.js` is the swap point; the rules engine stays as the offline fallback.

If you ever want reminders that reach a fully closed app, that's the other natural extension — it means adding a small push backend, at which point the same backend could also carry cross-device sync (see *Where your data lives*).

An **Android app** is also designed and ready to build when you are: wrap this
same web build in [Capacitor](https://capacitorjs.com) (one codebase, assets
bundled for full offline use) as `app.woodshed`. The full design — including a
`src/platform/` abstraction, native daily reminders (which *do* reach a closed
app, no push backend needed), the mic permission, and self-hosted fonts — is in
[docs/superpowers/specs/2026-06-22-android-capacitor-design.md](docs/superpowers/specs/2026-06-22-android-capacitor-design.md).
It's deliberately unscaffolded: the `android/` project is best generated fresh
against current Capacitor/SDK versions when you have Android Studio in hand.

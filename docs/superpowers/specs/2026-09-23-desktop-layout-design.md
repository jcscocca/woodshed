# Woodshed on the desktop — Design

**Date:** 2026-09-23
**Status:** Approved design, pending implementation plan
**Direction:** [docs/DIRECTION.md](../../DIRECTION.md) — piano + guitar, desktop-first.
**Builds on:** the cuts in DIRECTION.md (no Loom, no reminder, no tuner tempo
estimate, coach + Echo behind `COACH_ENABLED = false`, two instruments). This
spec describes the app after those cuts.

## Problem

Woodshed is laid out for a phone: one 468px column, bottom tabs, and every
panel a bottom sheet. On a monitor it's a narrow strip in a wide window, the
metronome lives inside a sheet that stops it when closed, and a lesson covers
today's set instead of sitting beside it. The owner now practices at the
computer.

## Goal

At ≥1024px, a three-pane desktop layout — sidebar, main view, persistent
practice rail — installable from Chrome/Edge as its own window, working
offline, hosted on GitHub Pages, with keyboard shortcuts for the practice
tools. Below 1024px the phone app is unchanged.

## Decisions

| Decision | Choice |
|---|---|
| Approach | One responsive app; three panes at ≥1024px (not a separate desktop tree, not CSS-only) |
| Breakpoint | `(min-width: 1024px)`, live (resizing the window switches layouts) |
| Phone layout | Unchanged, including "closing the practice sheet stops the metronome" |
| Hosting | GitHub Pages via a GitHub Action on push to `main` (repo is public) |
| Offline | `vite-plugin-pwa` service worker + self-hosted fonts (`@fontsource`) |
| Data | Browser `localStorage` as today; fresh start on desktop, no migration |

## Non-goals

MIDI input (its own spec), re-enabling the pitch coach or Echo, sync, reminders,
Android, any change to the four views' content beyond layout.

## 1. Layout (≥1024px)

```
┌────────────┬──────────────────────────────┬─────────────────┐
│ Woodshed   │  Today            [Shuffle]  │ ♩ 92  ▶  tap    │
│ ▮▮▮▯ 4 days│  ┌──────────┐ ┌──────────┐   │ ⏱ 12:40  ⏸ ↺    │
│            │  │ card     │ │ card     │   ├─────────────────┤
│ ▸ Today    │  └──────────┘ └──────────┘   │ Lesson: C major │
│   Tracks   │  ┌──────────┐ ┌──────────┐   │ [diagram]       │
│   Library  │  │ card     │ │ card     │   │ ▶ Hear it       │
│   Progress │  └──────────┘ └──────────┘   │ steps…          │
│            │  [ Log today's set ]         │                 │
│ ⚙ Settings │                              │ (or Tuner)      │
└────────────┴──────────────────────────────┴─────────────────┘
```

- **Grid:** `sidebar 200px | main 1fr | rail 380px`, full viewport height. Main
  and rail scroll independently; the sidebar doesn't scroll.
- **Sidebar:** brand, the streak, the four views as a vertical nav
  (`aria-current` on the active one), Settings pinned at the bottom. Replaces the
  phone header and bottom tabs, which are **not rendered** on desktop (not just
  hidden), so there's one nav for keyboard and screen-reader users.
- **Main:** the existing views. Today's cards in a grid
  (`repeat(auto-fill, minmax(300px, 1fr))`); the suggestion banner stays at the
  top of Today. Progress puts the heatmap and stat tiles side by side and the
  trend charts in two columns. Tracks and Library use the width as-is. Content
  width caps at ~960px.
- **Rail, always visible:**
  - **Top:** `PracticeTools` — metronome (beat dots, BPM, ±, start/stop, tap,
    beats-per-bar) and stopwatch (time, start/pause, reset).
  - **Below:** one slot, in priority order: the open **lesson** →
    the **tuner** (only when opened with its button; it asks for the mic on
    Start as today) → a short hint ("Pick a card's *Learn* to open its lesson
    here").
- **Lessons in the rail:** *Learn* on any card (Today, Tracks, Library) opens
  that lesson in the slot and marks the card as selected. Another *Learn*
  replaces it. A ✕ (and Esc) closes it. Opening a lesson replaces the tuner and
  vice versa; the one leaving unmounts, which releases the mic.
- **Dialogs:** Log, Settings, Suggestions, Edit exercise, Edit session keep
  their JSX. A ≥1024px media query turns `.ws-sheet-wrap`/`.ws-sheet` into a
  centered, fully rounded dialog (max-width 560px, fade in, no grip) instead of
  a bottom sheet.

## 2. Architecture

Each piece of UI is written once; the two layouts only arrange it.

- **`src/PracticeProvider.jsx` (new):** owns `useMetronome` and the stopwatch
  (`{ startedAt, acc }`, moved up from App) and exposes them through context.
  App renders `<PracticeProvider>` around its tree; because the tree is passed
  as `children`, the metronome's per-beat state updates re-render only context
  consumers (the tools UI), not the App. It also reports the tempo to App when
  the metronome plays or its BPM changes, as `onTempo` does today (feeds the
  log's "+ tempo").
- **`src/PracticeTools.jsx` (new):** the metronome + stopwatch UI, extracted from
  `PracticeSheet`, reading the context. Rendered by the phone sheet and the rail.
- **`src/PracticeSheet.jsx` (new file, moved out of App.jsx):** `PracticeSheet`
  (phone bottom sheet wrapping `PracticeTools`; closing it stops the metronome,
  as today) and `ListenSheet` (phone wrapper around `ListenPanel`).
  `ListenPanel` is the tuner body, extracted so the rail can render it.
- **`src/LessonSheet.jsx`:** split into `LessonBody` (everything inside the
  sheet: header, diagram, Hear it, steps, watch, link, audio teardown on unmount,
  and the coach/Echo panels when `COACH_ENABLED`) and `LessonSheet` (the phone
  sheet wrapper with `useDialog`). The rail renders `LessonBody` directly.
- **`src/PracticeRail.jsx` (new):** `PracticeTools` + the slot. The slot reads
  App's existing `lessonFor` (the open lesson, shared by both layouts) and a new
  `tunerOpen` boolean; opening one clears the other.
- **`src/Sidebar.jsx` (new):** brand, `Streak`, nav, Settings button.
- **`src/useIsDesktop.js` (new):** `matchMedia("(min-width: 1024px)")` with a
  change listener.
- **App.jsx:** picks the layout with `useIsDesktop()`. On desktop: renders
  Sidebar + main + PracticeRail (which shows `lessonFor` in its slot), and
  doesn't render the header ♩ button, bottom tabs, `PracticeSheet`,
  `ListenSheet` or `LessonSheet`. On phone: exactly today's
  tree. The four views stay in App.jsx; they gain only a `selectedId` prop (for
  the selected-card style) and CSS classes.
- **Switching layouts live** (window resized across 1024px) keeps the metronome
  and stopwatch running (they live in the provider); an open lesson moves
  between the rail and the phone's lesson sheet because both read `lessonFor`.

## 3. Install, offline, hosting

- **Fonts:** replace the Google Fonts `<link>`s in `index.html` with
  `@fontsource` packages imported in `main.jsx`: Bricolage Grotesque
  (600/700; the variable package if needed for the `opsz` axis), Hanken
  Grotesk (400/500/600/700), JetBrains Mono (400/500).
- **Service worker:** `vite-plugin-pwa` with `registerType: "autoUpdate"`,
  precaching the built JS/CSS/HTML/fonts/icons. Keep the existing
  `public/manifest.webmanifest` and `<link rel="manifest">` (plugin
  `manifest: false`). `base: "./"` stays, so the app works at
  `/woodshed/` on Pages and at `/` locally.
- **Manifest:** remove `"orientation": "portrait"`; add `"id": "./"`; mark the
  current icons `"purpose": "any"` and add a properly padded **maskable** 512px
  icon (generated once from `icon-512.png` with a ~20% safe-zone margin,
  committed as a PNG). A manifest can't set a minimum window size; below
  1024px the app simply uses the phone layout.
- **Hosting:** `.github/workflows/pages.yml` — on push to `main`: `npm ci`,
  `npm test`, `npm run build`, upload `dist/`, deploy with
  `actions/deploy-pages`. Pages' source must be set to "GitHub Actions" once
  (repo settings or `gh api`), done with the owner's go-ahead at first push.
  Install URL: `https://jcscocca.github.io/woodshed/`.

## 4. Keyboard shortcuts (desktop layout only)

| Key | Action |
|---|---|
| Space | Metronome start/stop |
| T | Tap tempo |
| ← / → | BPM −1 / +1 (Shift: ±10), clamped 40–240 |
| S | Stopwatch start/pause |
| 1–4 | Today / Tracks / Library / Progress |
| L | Log today's set (if not already logged) |
| Esc | Close the rail lesson or tuner (dialogs already close on Esc) |
| ? | Shortcut list (a small dialog) |

- **`src/shortcuts.js` (new):** a pure `actionFor(event, ctx)` → action name or
  `null`, where `ctx = { typing, dialogOpen, buttonFocused }`. Ignores
  everything while typing (input, textarea, select, contenteditable) and while
  a dialog is open (`[aria-modal="true"]` present) — Esc/Tab stay with the
  dialog. Space is ignored when a button has focus (it presses the button).
  Modifier combos (Ctrl/Alt/Meta) are ignored so browser shortcuts still work.
- **`useShortcuts`** (same file) attaches one `keydown` listener and dispatches
  actions; mounted only in the desktop layout.
- **Hints:** `PracticeTools` shows faint key hints beside its controls on
  desktop (e.g. `Space` under Start, `T` by Tap).

## 5. Testing

- **Unit (node, existing style):** `actionFor` — each key, each guard (typing,
  dialog open, button focused, modifiers), Shift-arrows, clamping.
- **Browser (built-in preview):** screenshots at 1440×900, at exactly 1024 and
  1023px, and phone 390×844 (compare against the phone layout before the
  change); a lesson open in the rail beside Today with its card selected; the
  metronome keeps playing while switching views and across a resize through
  1024px; each shortcut; dialogs centered on desktop and bottom sheets on phone;
  no console errors.
- **Offline:** `npm run build && npm run preview`, load once, stop the server,
  reload — the app opens from the service worker cache.
- **Install:** manifest and service worker served with correct scope; Chrome
  offers "Install app"; the installed window opens in the desktop layout.
- **Gate:** `npm test` and `npm run build` pass on every commit.

## Acceptance criteria

1. At ≥1024px: sidebar + main + rail; no bottom tabs or header ♩ rendered.
2. The metronome and stopwatch keep running across view changes, lesson
   open/close, and layout switches.
3. *Learn* opens the lesson in the rail beside the view; the card shows as
   selected; Esc/✕ closes it.
4. Dialogs are centered on desktop, bottom sheets on phone.
5. Below 1024px the app looks and behaves as it did before this change.
6. Every shortcut in §4 works and none fires while typing or in a dialog.
7. The built app loads offline after one online visit, and Chrome offers to
   install it.
8. Pushing to `main` deploys to GitHub Pages after tests pass.

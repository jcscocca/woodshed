# Desktop Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** At ≥1024px Woodshed becomes a three-pane desktop app (sidebar, main view, persistent practice rail) with keyboard shortcuts, installable and offline, deployed to GitHub Pages; below 1024px the phone app is unchanged.

**Architecture:** One responsive React app. A `PracticeProvider` owns the metronome and stopwatch so both layouts (and a layout switch) share one instance without re-rendering the app on every beat. Panel *contents* (`PracticeTools`, `ListenPanel`, `LessonBody`) are split from their phone *sheets*, and a new `PracticeRail` renders them on desktop. `App.jsx` picks the layout with `useIsDesktop()`.

**Tech Stack:** React 18, Vite 5, `vite-plugin-pwa` 1.3.x, `@fontsource/*` 5.x, plain-node test scripts (`test/*.test.mjs`), GitHub Actions + Pages.

**Spec:** `docs/superpowers/specs/2026-09-23-desktop-layout-design.md` (read it first). Direction: `docs/DIRECTION.md`.

## Global Constraints

- Breakpoint: `(min-width: 1024px)`, live. Below it the app must look and behave exactly as before, including "closing the practice sheet stops the metronome".
- Branch: `piano-guitar-desktop`. Every commit passes `npm test` and `npm run build`.
- Code style (owner is strict): smallest diff that works; match surrounding idiom and its low comment density; no comments restating code; don't refactor or rename unrelated code; no abstractions beyond this plan.
- Tests are plain node scripts in the repo's style: `ok   name` / `FAIL name` lines, `all green` on success, non-zero exit on failure (see `test/engine.test.mjs`). New test files are wired into `package.json` `"test"`.
- Modules imported by node tests must not import React (pure modules live apart from hooks, as `coach.js`/`useCoach.js` do).
- `base: "./"` in `vite.config.js` stays (the app must work at `/woodshed/` on Pages and `/` locally).
- Fonts: `@fontsource` latin subsets only. CI Node: 22.
- Don't push. Don't enable GitHub Pages (the owner confirms that at first push).

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/shortcuts.js` | new | Pure keymap: `actionFor`, `clampBpm`, `KEY_HELP` |
| `src/stopwatch.js` | new | Pure stopwatch state helpers |
| `test/desktop.test.mjs` | new | Tests for the two pure modules |
| `src/PracticeProvider.jsx` | new | Context owning metronome + stopwatch; `usePractice` |
| `src/PracticeTools.jsx` | new | Metronome + stopwatch UI (both layouts) |
| `src/PracticeSheet.jsx` | new (moved from App.jsx) | Phone `PracticeSheet`, `ListenPanel`, phone `ListenSheet` |
| `src/LessonSheet.jsx` | modify | Split into `LessonBody` + `LessonSheet` wrapper |
| `src/useIsDesktop.js` | new | The live media-query hook |
| `src/Sidebar.jsx` | new | Desktop sidebar + shared `VIEWS` list |
| `src/PracticeRail.jsx` | new | Desktop rail: tools + lesson/tuner slot |
| `src/useShortcuts.js` | new | `ShortcutBridge`: keydown → actions |
| `src/ShortcutHelp.jsx` | new | The `?` dialog |
| `src/App.jsx` | modify | Layout switch; views get `selectedId`; Progress wrapper |
| `src/styles.css` | modify | Desktop grid, rail, dialogs, selected state, kbd hints |
| `src/main.jsx`, `index.html`, `package.json` | modify | Fonts, description |
| `vite.config.js`, `public/manifest.webmanifest`, `public/icon-maskable-512.png` | modify/new | PWA |
| `.github/workflows/pages.yml` | new | Deploy to Pages |
| `README.md` | modify | Desktop, install, shortcuts |

---

### Task 1: Pure keymap and stopwatch helpers

**Files:**
- Create: `src/shortcuts.js`, `src/stopwatch.js`, `test/desktop.test.mjs`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `actionFor(event, ctx) → Action | null` where `event` has `key, shiftKey, ctrlKey, metaKey, altKey, repeat` and `ctx = { typing, dialogOpen, buttonFocused }` (all default `false`). `Action` is one of `{type:"metronome"}`, `{type:"tap"}`, `{type:"bpm", delta:number}`, `{type:"stopwatch"}`, `{type:"view", view:"today"|"tracks"|"library"|"progress"}`, `{type:"log"}`, `{type:"close"}`, `{type:"help"}`.
- Produces: `clampBpm(n) → number` (40–240, rounded). `KEY_HELP: [key, description][]`.
- Produces: `toggleWatch(w, now = Date.now())`, `elapsedSec(w, now = Date.now())`, `RESET_WATCH` for stopwatch state `{ startedAt: number|null, acc: number }` (ms).

- [ ] **Step 1: Write the failing test** — create `test/desktop.test.mjs`:

```js
import assert from "node:assert/strict";
const { actionFor, clampBpm, KEY_HELP } = await import("../src/shortcuts.js");
const { toggleWatch, elapsedSec, RESET_WATCH } = await import("../src/stopwatch.js");

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };
const key = (k, extra = {}) => ({ key: k, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, repeat: false, ...extra });

test("Space toggles the metronome", () => assert.deepEqual(actionFor(key(" ")), { type: "metronome" }));
test("T taps tempo, either case", () => {
  assert.deepEqual(actionFor(key("t")), { type: "tap" });
  assert.deepEqual(actionFor(key("T", { shiftKey: true })), { type: "tap" });
});
test("arrows nudge the tempo by 1, Shift by 10", () => {
  assert.deepEqual(actionFor(key("ArrowLeft")), { type: "bpm", delta: -1 });
  assert.deepEqual(actionFor(key("ArrowRight")), { type: "bpm", delta: 1 });
  assert.deepEqual(actionFor(key("ArrowRight", { shiftKey: true })), { type: "bpm", delta: 10 });
  assert.deepEqual(actionFor(key("ArrowLeft", { shiftKey: true })), { type: "bpm", delta: -10 });
});
test("S toggles the stopwatch", () => assert.deepEqual(actionFor(key("s")), { type: "stopwatch" }));
test("1-4 switch views", () => {
  assert.deepEqual(actionFor(key("1")), { type: "view", view: "today" });
  assert.deepEqual(actionFor(key("2")), { type: "view", view: "tracks" });
  assert.deepEqual(actionFor(key("3")), { type: "view", view: "library" });
  assert.deepEqual(actionFor(key("4")), { type: "view", view: "progress" });
});
test("L logs, Escape closes, ? opens help", () => {
  assert.deepEqual(actionFor(key("l")), { type: "log" });
  assert.deepEqual(actionFor(key("Escape")), { type: "close" });
  assert.deepEqual(actionFor(key("?", { shiftKey: true })), { type: "help" });
});
test("nothing fires while typing", () => {
  for (const k of [" ", "t", "ArrowLeft", "1", "l", "Escape", "?"]) assert.equal(actionFor(key(k), { typing: true }), null);
});
test("nothing fires while a dialog is open", () => {
  for (const k of [" ", "t", "ArrowRight", "4", "Escape"]) assert.equal(actionFor(key(k), { dialogOpen: true }), null);
});
test("Space is left to a focused button; other keys still work", () => {
  assert.equal(actionFor(key(" "), { buttonFocused: true }), null);
  assert.deepEqual(actionFor(key("t"), { buttonFocused: true }), { type: "tap" });
});
test("browser shortcuts pass through", () => {
  assert.equal(actionFor(key("l", { ctrlKey: true })), null);
  assert.equal(actionFor(key("t", { metaKey: true })), null);
  assert.equal(actionFor(key("1", { altKey: true })), null);
});
test("held keys repeat only for the tempo arrows", () => {
  assert.deepEqual(actionFor(key("ArrowRight", { repeat: true })), { type: "bpm", delta: 1 });
  assert.equal(actionFor(key(" ", { repeat: true })), null);
  assert.equal(actionFor(key("t", { repeat: true })), null);
});
test("unmapped keys do nothing", () => assert.equal(actionFor(key("x")), null));
test("clampBpm keeps 40-240", () => {
  assert.equal(clampBpm(35), 40);
  assert.equal(clampBpm(250), 240);
  assert.equal(clampBpm(92), 92);
});
test("KEY_HELP lists every shortcut", () => assert.equal(KEY_HELP.length, 8));
test("stopwatch accumulates across pause and resume", () => {
  let w = toggleWatch(RESET_WATCH, 1000);              // start at t=1s
  assert.equal(elapsedSec(w, 6500), 5);
  w = toggleWatch(w, 6500);                           // pause at 5.5s elapsed
  assert.equal(elapsedSec(w, 99999), 5);              // paused: time doesn't move
  w = toggleWatch(w, 10000);                          // resume
  assert.equal(elapsedSec(w, 12000), 7);              // 5.5 + 2
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });
```

- [ ] **Step 2: Wire it in and run it to see it fail**

In `package.json` add `"test:desktop": "node test/desktop.test.mjs"` and append ` && npm run test:desktop` to the `"test"` script.

Run: `node test/desktop.test.mjs`
Expected: fails with `Cannot find module '.../src/shortcuts.js'`.

- [ ] **Step 3: Implement** — create `src/shortcuts.js`:

```js
// Desktop keyboard shortcuts. actionFor is pure so it can be tested in node;
// useShortcuts.js wires it to a keydown listener.
const VIEW_KEYS = { 1: "today", 2: "tracks", 3: "library", 4: "progress" };

export const clampBpm = (n) => Math.max(40, Math.min(240, Math.round(n)));

export const KEY_HELP = [
  ["Space", "Metronome start / stop"],
  ["T", "Tap tempo"],
  ["← →", "Tempo −1 / +1 (Shift: ±10)"],
  ["S", "Stopwatch start / pause"],
  ["1–4", "Today · Tracks · Library · Progress"],
  ["L", "Log today's set"],
  ["Esc", "Close the lesson or tuner"],
  ["?", "This list"],
];

export function actionFor(e, { typing = false, dialogOpen = false, buttonFocused = false } = {}) {
  if (e.ctrlKey || e.metaKey || e.altKey || typing || dialogOpen) return null;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === "ArrowLeft" || k === "ArrowRight") return { type: "bpm", delta: (k === "ArrowLeft" ? -1 : 1) * (e.shiftKey ? 10 : 1) };
  if (e.repeat) return null;
  if (k === " ") return buttonFocused ? null : { type: "metronome" };
  if (k === "t") return { type: "tap" };
  if (k === "s") return { type: "stopwatch" };
  if (VIEW_KEYS[k]) return { type: "view", view: VIEW_KEYS[k] };
  if (k === "l") return { type: "log" };
  if (k === "Escape") return { type: "close" };
  if (k === "?") return { type: "help" };
  return null;
}
```

Create `src/stopwatch.js`:

```js
// Wall-clock stopwatch state { startedAt: ms | null, acc: ms }: survives hidden
// tabs and unmounts because time is read from the clock, not counted.
export const RESET_WATCH = { startedAt: null, acc: 0 };

export const toggleWatch = (w, now = Date.now()) =>
  w.startedAt != null ? { startedAt: null, acc: w.acc + now - w.startedAt } : { startedAt: now, acc: w.acc };

export const elapsedSec = (w, now = Date.now()) =>
  Math.floor((w.acc + (w.startedAt != null ? now - w.startedAt : 0)) / 1000);
```

- [ ] **Step 4: Run the tests**

Run: `node test/desktop.test.mjs` → every line `ok`, then `all green`.
Run: `npm test` → exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/shortcuts.js src/stopwatch.js test/desktop.test.mjs package.json
git commit -m "feat: pure keymap and stopwatch helpers for the desktop layout"
```

---

### Task 2: Self-hosted fonts

**Files:**
- Modify: `package.json` (dependencies), `src/main.jsx`, `index.html`

**Interfaces:** none (CSS already names the families `'Hanken Grotesk'`, `'Bricolage Grotesque'`, `'JetBrains Mono'`; the static @fontsource packages register those exact names).

- [ ] **Step 1: Install**

Run: `npm install @fontsource/hanken-grotesk@^5 @fontsource/bricolage-grotesque@^5 @fontsource/jetbrains-mono@^5`

Confirm the subset files exist:
Run: `ls node_modules/@fontsource/hanken-grotesk/latin-400.css node_modules/@fontsource/bricolage-grotesque/latin-700.css node_modules/@fontsource/jetbrains-mono/latin-500.css`
Expected: all three listed. (If a package names subset files differently, use its `latin-<weight>.css` equivalent from `ls node_modules/@fontsource/<pkg>/`.)

- [ ] **Step 2: Import them** — in `src/main.jsx`, after `import App from "./App.jsx";` add:

```js
import "@fontsource/hanken-grotesk/latin-400.css";
import "@fontsource/hanken-grotesk/latin-500.css";
import "@fontsource/hanken-grotesk/latin-600.css";
import "@fontsource/hanken-grotesk/latin-700.css";
import "@fontsource/bricolage-grotesque/latin-600.css";
import "@fontsource/bricolage-grotesque/latin-700.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
```

- [ ] **Step 3: Drop the Google Fonts links** — in `index.html` delete the two `<link rel="preconnect" …>` lines and the `<link href="https://fonts.googleapis.com/css2?…" rel="stylesheet" />` element (5 lines). While there, change the description meta to `content="Woodshed — piano and guitar practice."`. In `package.json` change `"description"` to `"Piano and guitar practice app"`.

- [ ] **Step 4: Verify**

Run: `npm run build && ls dist/assets | grep -c woff2`
Expected: build succeeds; count ≥ 8.
Run: `grep -c googleapis dist/index.html` → `0`.
Run: `npm test` → exit 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/main.jsx index.html
git commit -m "feat: self-host fonts (latin subsets) instead of Google Fonts"
```

---

### Task 3: Service worker and manifest

**Files:**
- Modify: `package.json` (devDependencies), `vite.config.js`, `public/manifest.webmanifest`
- Create: `public/icon-maskable-512.png`

- [ ] **Step 1: Install the plugin**

Run: `npm install -D vite-plugin-pwa@^1.3.0`

- [ ] **Step 2: Configure it** — replace `vite.config.js` with:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// base: "./" makes the built dist/ use relative asset paths, so it works
// whether you serve it from a domain root, a subfolder, or open it behind
// any static host without extra config.
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    // Offline + installable: precache the built app; public/manifest.webmanifest is used as-is.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: false,
      workbox: { globPatterns: ["**/*.{js,css,html,png,woff2,webmanifest}"] },
    }),
  ],
});
```

- [ ] **Step 3: Maskable icon** — generate once (Python + Pillow are available):

Run: `python -c "from PIL import Image; src=Image.open('public/icon-512.png').convert('RGBA'); bg=Image.new('RGBA',(512,512),(27,25,22,255)); bg.alpha_composite(src.resize((300,300),Image.LANCZOS),(106,106)); bg.save('public/icon-maskable-512.png')"`

Open `public/icon-maskable-512.png` and confirm the mark sits centered on the dark background with wide margins (the maskable safe zone is the central 80% circle).

- [ ] **Step 4: Manifest** — replace `public/manifest.webmanifest` with:

```json
{
  "id": "./",
  "name": "Woodshed",
  "short_name": "Woodshed",
  "description": "Piano and guitar practice",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#1b1916",
  "theme_color": "#1b1916",
  "icons": [
    { "src": "./icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "./icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "./icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 5: Verify the build emits a service worker**

Run: `npm run build && ls dist/sw.js dist/registerSW.js && grep -c registerSW dist/index.html`
Expected: both files listed; count `1`.
Run: `grep -o '"url":"[^"]*woff2"' dist/sw.js | head -3` → precache entries include the fonts.
Run: `npm test` → exit 0.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js public/manifest.webmanifest public/icon-maskable-512.png
git commit -m "feat: installable and offline — service worker, manifest, maskable icon"
```

---

### Task 4: GitHub Pages deploy workflow

**Files:**
- Create: `.github/workflows/pages.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Check it parses**

Run: `python -c "import yaml,sys; d=yaml.safe_load(open('.github/workflows/pages.yml')); print(sorted(d['jobs']))"`
Expected: `['build', 'deploy']`. (If PyYAML isn't installed: `npx --yes js-yaml .github/workflows/pages.yml > /dev/null && echo ok`.)

The real check is the first push to `main`, after the owner enables Pages with source "GitHub Actions". Do not do that here.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/pages.yml
git commit -m "ci: deploy to GitHub Pages on push to main (tests gate the deploy)"
```

---

### Task 5: PracticeProvider, PracticeTools, and the phone sheets moved out of App.jsx

Phone behavior must be identical afterwards.

**Files:**
- Create: `src/PracticeProvider.jsx`, `src/PracticeTools.jsx`, `src/PracticeSheet.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `toggleWatch`, `elapsedSec`, `RESET_WATCH` (Task 1); `useMetronome(90, 4)` → `{ bpm, setBpm, beatsPer, setBeatsPer, playing, beat, start, stop, toggle, tap }` (existing, `src/useMetronome.js`); `useListener()` → `{ listening, error, note, freq, start, stop }` (existing; cleans up on unmount).
- Produces: `PracticeProvider({ onTempo, children })`; `usePractice() → { metro, watch, setWatch }`; default export `PracticeTools()` (Task 9 adds a `hints` prop); named exports `PracticeSheet({ onClose, onOpenListen })`, `ListenPanel()`, `ListenSheet({ onClose })`.

- [ ] **Step 1: `src/PracticeProvider.jsx`**

```jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useMetronome } from "./useMetronome.js";
import { RESET_WATCH } from "./stopwatch.js";

const PracticeContext = createContext(null);
export const usePractice = () => useContext(PracticeContext);

// Owns the metronome and stopwatch so they outlive any one panel and a layout
// switch. The app tree arrives as `children`, so the metronome's per-beat state
// re-renders only components that call usePractice(), not the whole app.
export function PracticeProvider({ onTempo, children }) {
  const metro = useMetronome(90, 4);
  const [watch, setWatch] = useState(RESET_WATCH);

  // remember the tempo while the metronome is running, to prefill the log
  useEffect(() => { if (metro.playing && onTempo) onTempo(metro.bpm); }, [metro.playing, metro.bpm, onTempo]);

  return <PracticeContext.Provider value={{ metro, watch, setWatch }}>{children}</PracticeContext.Provider>;
}
```

- [ ] **Step 2: `src/PracticeTools.jsx`** — the metronome and stopwatch markup moved verbatim from `PracticeSheet` in `src/App.jsx` (the `<div className="ws-metro">…</div>` and `<div className="ws-stop">…</div>` blocks), reading the context:

```jsx
import React, { useEffect, useState } from "react";
import { usePractice } from "./PracticeProvider.jsx";
import { toggleWatch, elapsedSec, RESET_WATCH } from "./stopwatch.js";

export default function PracticeTools() {
  const { metro: m, watch, setWatch } = usePractice();
  const [, tick] = useState(0);
  const running = watch.startedAt != null;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [running]);

  const sec = elapsedSec(watch);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <>
      <div className="ws-metro">
        <div className="ws-beatdots">
          {Array.from({ length: m.beatsPer }).map((_, i) => (
            <span key={i} className={`ws-beatdot ${i === 0 ? "accent" : ""} ${m.beat === i ? "on" : ""}`} />
          ))}
        </div>
        <div className="ws-bpm"><span className="mono ws-bpm-num">{m.bpm}</span><span className="ws-bpm-label">bpm</span></div>
        <input className="ws-bpm-range" type="range" min="40" max="240" value={m.bpm}
          onChange={(e) => m.setBpm(Number(e.target.value))} aria-label="Tempo" />
        <div className="ws-metro-row">
          <button className="ws-round" onClick={() => m.setBpm(Math.max(40, m.bpm - 1))} aria-label="Slower">−</button>
          <button className={`ws-btn ${m.playing ? "ghost" : "primary"} ws-metro-go`} onClick={m.playing ? m.stop : m.start}>
            {m.playing ? "Stop" : "Start"}
          </button>
          <button className="ws-round" onClick={() => m.setBpm(Math.min(240, m.bpm + 1))} aria-label="Faster">+</button>
        </div>
        <div className="ws-metro-row2">
          <button className="ws-chip" onClick={m.tap}>Tap tempo</button>
          <div className="ws-sig">
            {[2, 3, 4].map((n) => (
              <button key={n} className={`ws-sig-btn ${m.beatsPer === n ? "on" : ""}`} aria-pressed={m.beatsPer === n} aria-label={`${n} beats per bar`} onClick={() => m.setBeatsPer(n)}>{n}/4</button>
            ))}
          </div>
        </div>
      </div>

      <div className="ws-stop">
        <div className="ws-stop-time mono">{mm}:{ss}</div>
        <div className="ws-stop-row">
          <button className="ws-btn ghost sm" onClick={() => setWatch(toggleWatch)}>{running ? "Pause" : sec > 0 ? "Resume" : "Start"}</button>
          <button className="ws-btn ghost sm" onClick={() => setWatch(RESET_WATCH)}>Reset</button>
        </div>
        <p className="ws-stop-note">Time your session here, then enter the minutes when you log.</p>
      </div>
    </>
  );
}
```

(`setWatch(toggleWatch)` passes the previous state as `toggleWatch`'s first argument; `now` defaults to `Date.now()`.)

- [ ] **Step 3: `src/PracticeSheet.jsx`** — the phone sheets, moved from `App.jsx`. The tuner body becomes `ListenPanel`; `useListener` already stops the mic on unmount, so the sheet no longer calls `l.stop()` on close. Since the tempo estimate is gone, "Tuner & listener" becomes "Tuner".

```jsx
import React from "react";
import { useDialog } from "./useDialog.js";
import { useListener } from "./useListener.js";
import { usePractice } from "./PracticeProvider.jsx";
import PracticeTools from "./PracticeTools.jsx";

/* ----------------------- practice tools (metronome + timer) ----------------------- */
export function PracticeSheet({ onClose, onOpenListen }) {
  const { metro } = usePractice();
  const close = () => { metro.stop(); onClose(); };
  const dlgRef = useDialog(close);

  return (
    <div className="ws-sheet-wrap ws-practice-wrap">
      <div className="ws-sheet ws-practice" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Practice tools" tabIndex={-1}>
        <div className="ws-sheet-grip" />
        <div className="ws-practice-head">
          <h2 className="ws-sheet-title" style={{ margin: 0 }}>Practice</h2>
          <button className="ws-x" onClick={close} aria-label="Close">✕</button>
        </div>
        <PracticeTools />
        <button className="ws-listen-open" onClick={() => { metro.stop(); onOpenListen(); }}>
          <span className="ws-listen-dot" /> Tuner <span className="ws-beta">beta</span>
        </button>
      </div>
    </div>
  );
}

/* ----------------------- tuner (beta) ----------------------- */
export function ListenPanel() {
  const l = useListener();
  const cents = l.note?.cents ?? 0;
  const clamped = Math.max(-50, Math.min(50, cents));
  const inTune = l.note && Math.abs(cents) <= 5;

  if (l.error) return <div className="ws-listen-err">{l.error}</div>;
  if (!l.listening)
    return (
      <div className="ws-listen-intro">
        <p>Uses your microphone to show pitch. It works best on single, clearly-sounding notes — tuning a string, or a monophonic line. Chords are unreliable here.</p>
        <button className="ws-btn primary" onClick={l.start}>Start listening</button>
      </div>
    );
  return (
    <>
      <div className="ws-tuner">
        <div className={`ws-tuner-note ${inTune ? "in" : ""}`} aria-live="polite" aria-label={l.note ? `${l.note.name}${l.note.octave}, ${cents > 0 ? "+" : ""}${cents} cents${inTune ? ", in tune" : ""}` : "no note detected"}>
          {l.note ? <>{l.note.name}<span className="ws-tuner-oct">{l.note.octave}</span></> : <span className="ws-tuner-idle">—</span>}
        </div>
        <div className="ws-tuner-meter" role="img" aria-label={l.note ? (inTune ? "In tune" : cents > 0 ? "Sharp" : "Flat") : "Tuning meter"}>
          <div className="ws-tuner-center" />
          {l.note && <div className={`ws-tuner-needle ${inTune ? "in" : ""}`} style={{ left: `${50 + clamped}%` }} />}
        </div>
        <div className="ws-tuner-cents mono">{l.note ? `${cents > 0 ? "+" : ""}${cents}¢ · ${Math.round(l.freq)} Hz` : "play a note…"}</div>
      </div>
      <button className="ws-btn ghost full" onClick={l.stop}>Stop listening</button>
    </>
  );
}

export function ListenSheet({ onClose }) {
  const dlgRef = useDialog(onClose);
  return (
    <div className="ws-sheet-wrap ws-practice-wrap">
      <div className="ws-sheet ws-practice" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Tuner" tabIndex={-1}>
        <div className="ws-sheet-grip" />
        <div className="ws-practice-head">
          <h2 className="ws-sheet-title" style={{ margin: 0 }}>Tuner <span className="ws-beta">beta</span></h2>
          <button className="ws-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <ListenPanel />
      </div>
    </div>
  );
}
```

Before writing this file, diff the JSX above against the current `PracticeSheet`/`ListenSheet` in `src/App.jsx` (≈ lines 394–511) and keep any markup that differs from what's shown here — the plan's copy must not silently drop something the cuts left in.

- [ ] **Step 4: Rewire `src/App.jsx`**
  1. Imports: delete `import { useMetronome } from "./useMetronome.js";` and `import { useListener } from "./useListener.js";`. Add:
     ```js
     import { PracticeProvider } from "./PracticeProvider.jsx";
     import { PracticeSheet, ListenSheet } from "./PracticeSheet.jsx";
     ```
  2. Delete the `watch` state line (`const [watch, setWatch] = useState({ startedAt: null, acc: 0 }); …`).
  3. Wrap the main `return ( <Shell> … </Shell> );` as `return ( <PracticeProvider onTempo={setLastTempo}> <Shell> … </Shell> </PracticeProvider> );` (the loading-state `return <Shell>…` stays unwrapped).
  4. Replace the `{practiceOpen && <PracticeSheet …/>}` line with:
     ```jsx
     {practiceOpen && <PracticeSheet onClose={() => setPracticeOpen(false)} onOpenListen={() => { setPracticeOpen(false); setListenOpen(true); }} />}
     ```
  5. Delete the `PracticeSheet` and `ListenSheet` function definitions (and their two section comments) from `App.jsx`.
  6. Fix the stale banner comment near the top: `WOODSHED — adaptive multi-instrument practice` → `WOODSHED — piano and guitar practice`.

- [ ] **Step 5: Verify**

Run: `npm test` → exit 0. Run: `npm run build` → succeeds.
Run: `grep -n "useMetronome\|useListener\|function PracticeSheet\|function ListenSheet" src/App.jsx` → no output.
Browser (phone width, `npx vite --port 5199`, window < 1024px): ♩ opens the Practice sheet; Start plays clicks; stopwatch Start/Pause/Reset work; close the sheet → metronome stops, reopen → stopwatch kept its time; "Tuner" opens the tuner sheet; close releases the mic (the browser's mic indicator goes off). No console errors.

- [ ] **Step 6: Commit**

```bash
git add src/PracticeProvider.jsx src/PracticeTools.jsx src/PracticeSheet.jsx src/App.jsx
git commit -m "refactor: metronome + stopwatch in a PracticeProvider; practice and tuner sheets move out of App.jsx"
```

---

### Task 6: Split `LessonBody` out of `LessonSheet`

**Files:**
- Modify: `src/LessonSheet.jsx`

**Interfaces:**
- Produces: named export `LessonBody({ item, href, sessions = [], onCoachResult, onRequestLog })` — lesson content only, no sheet chrome, stops lesson audio on unmount; default export `LessonSheet({ onClose, ...lessonProps })` — unchanged API for callers.

- [ ] **Step 1: Restructure** — keep `ShapeView` and the imports as they are, replace the `LessonSheet` function with these two:

```jsx
export function LessonBody({ item, href, sessions = [], onCoachResult, onRequestLog }) {
  const lesson = getLesson(item.id);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  // Tear down audio only on unmount, not on every parent re-render — a parent
  // callback's identity changes each render, and stopping there would cut a demo mid-play.
  useEffect(() => () => { clearTimeout(timer.current); stop(); }, []);
  if (!lesson) return null;
  const inst = INSTRUMENTS[item.inst];

  const hear = () => {
    clearTimeout(timer.current);
    if (playing) { stop(); setPlaying(false); return; }
    const { shape, bpm } = lesson;
    let ms;
    if (shape && shape.kind === "chords") ms = playChords(shapeToVoices(shape), { bpm: bpm || 70 });
    else if (shape) ms = playSequence(shapeToVoices(shape), { bpm: bpm || 80 });
    else ms = playClick({ bpm: bpm || 80 });
    setPlaying(true);
    timer.current = setTimeout(() => setPlaying(false), ms + 80);
  };

  return (
    <>
      <div className="ws-lesson-tags">
        <span className="ws-inst-tag" style={{ color: inst ? inst.color : "var(--gold)" }}>{inst ? inst.name : item.inst}</span>
        <span className="ws-type-tag">{TYPE_LABEL[item.type]}</span>
      </div>
      <h2 className="ws-sheet-title">{item.title}</h2>
      <p className="ws-lesson-summary">{lesson.summary}</p>

      <ShapeView shape={lesson.shape} />

      {COACH_ENABLED && isCoachable(item, lesson) && onCoachResult && onRequestLog && (
        <CoachPanel
          item={item}
          lesson={lesson}
          sessions={sessions}
          onLog={(res) => { onCoachResult(item.id, res); onRequestLog(); }}
        />
      )}

      {COACH_ENABLED && lesson.ear && onCoachResult && onRequestLog && (
        <EarPanel
          item={item}
          lesson={lesson}
          sessions={sessions}
          onLog={(res) => { onCoachResult(item.id, res); onRequestLog(); }}
        />
      )}

      {!lesson.ear && (lesson.shape || lesson.bpm) && (
        <button className={`ws-btn ${playing ? "ghost" : "primary"} sm ws-hear`} onClick={hear} aria-pressed={playing}>
          {playing ? "■ Stop" : "▶ Hear it"}
        </button>
      )}

      {lesson.prescribe && <div className="ws-lesson-prescribe mono">{lesson.prescribe}</div>}

      <div className="ws-lesson-sec">
        <div className="ws-lesson-label">How to play it</div>
        <ol className="ws-lesson-steps">{lesson.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </div>

      {lesson.watch.length > 0 && (
        <div className="ws-lesson-sec">
          <div className="ws-lesson-label">Watch for</div>
          <ul className="ws-lesson-watch">{lesson.watch.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </div>
      )}

      {item.link && href && <a className="ws-lesson-link" href={href} target="_blank" rel="noreferrer">↗ {item.link.label}</a>}
    </>
  );
}

export default function LessonSheet({ onClose, ...lessonProps }) {
  const dlgRef = useDialog(onClose);
  if (!getLesson(lessonProps.item.id)) return null;
  return (
    <div className="ws-sheet-wrap" onClick={onClose}>
      <div className="ws-sheet ws-lesson" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Lesson" tabIndex={-1}>
        <div className="ws-sheet-grip" />
        <LessonBody {...lessonProps} />
        <div className="ws-sheet-actions">
          <button className="ws-btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
```

`LessonBody`'s JSX is the old sheet's content moved verbatim (from `<div className="ws-lesson-tags">` through the link line). Diff it against the current file before replacing, and keep anything the current file has that differs.

- [ ] **Step 2: Verify**

Run: `npm test` → exit 0; `npm run build` → succeeds.
Browser (phone width): Learn on a Today card opens the lesson sheet exactly as before; Hear it plays and Stop stops; closing mid-demo silences it; Escape closes.

- [ ] **Step 3: Commit**

```bash
git add src/LessonSheet.jsx
git commit -m "refactor: LessonBody (content) split from LessonSheet (phone sheet)"
```

---

### Task 7: Desktop layout — sidebar, main, practice rail

**Files:**
- Create: `src/useIsDesktop.js`, `src/Sidebar.jsx`, `src/PracticeRail.jsx`
- Modify: `src/App.jsx`, `src/styles.css`

**Interfaces:**
- Consumes: `LessonBody`, `LessonSheet` (Task 6); `PracticeTools`, `usePractice` (Task 5); `ListenPanel`, `PracticeSheet`, `ListenSheet` (Task 5).
- Produces: `useIsDesktop() → boolean`; `Sidebar({ view, onView, onSettings, children })` and `VIEWS: [key, label, icon][]`; `PracticeRail({ lesson, tunerOpen, onOpenTuner, onCloseSlot })` where `lesson` is a React element or `null`. App gains state `tunerOpen` and helper `openLesson(item)`; views take `selectedId`.

- [ ] **Step 1: `src/useIsDesktop.js`**

```js
import { useEffect, useState } from "react";

const QUERY = "(min-width: 1024px)";

export function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => window.matchMedia(QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return desktop;
}
```

- [ ] **Step 2: `src/Sidebar.jsx`**

```jsx
import React from "react";

export const VIEWS = [["today", "Today", "◐"], ["tracks", "Tracks", "◆"], ["library", "Library", "▤"], ["progress", "Progress", "◈"]];

export default function Sidebar({ view, onView, onSettings, children }) {
  return (
    <aside className="ws-side">
      <div className="ws-brand"><span className="ws-logo">◐</span> Woodshed</div>
      {children}
      <nav className="ws-side-nav" aria-label="Views">
        {VIEWS.map(([k, label, icon]) => (
          <button key={k} className={`ws-side-tab ${view === k ? "on" : ""}`} aria-current={view === k ? "page" : undefined} onClick={() => onView(k)}>
            <span className="ws-tab-icon" aria-hidden="true">{icon}</span>{label}
          </button>
        ))}
      </nav>
      <button className="ws-side-tab ws-side-settings" onClick={onSettings}>
        <span className="ws-tab-icon" aria-hidden="true">⚙</span>Settings
      </button>
    </aside>
  );
}
```

- [ ] **Step 3: `src/PracticeRail.jsx`** (opening the tuner stops the metronome, as the phone sheet does, so the mic doesn't hear the clicks)

```jsx
import React from "react";
import PracticeTools from "./PracticeTools.jsx";
import { ListenPanel } from "./PracticeSheet.jsx";
import { usePractice } from "./PracticeProvider.jsx";

export default function PracticeRail({ lesson, tunerOpen, onOpenTuner, onCloseSlot }) {
  const { metro } = usePractice();
  return (
    <aside className="ws-rail" aria-label="Practice">
      <section className="ws-rail-tools">
        <PracticeTools />
        {!tunerOpen && (
          <button className="ws-listen-open" onClick={() => { metro.stop(); onOpenTuner(); }}>
            <span className="ws-listen-dot" /> Tuner <span className="ws-beta">beta</span>
          </button>
        )}
      </section>
      <section className="ws-rail-slot">
        {lesson || tunerOpen ? (
          <>
            <div className="ws-rail-slot-head">
              <span className="ws-rail-label">{lesson ? "Lesson" : "Tuner"}</span>
              <button className="ws-x" onClick={onCloseSlot} aria-label={lesson ? "Close lesson" : "Close tuner"}>✕</button>
            </div>
            {lesson || <ListenPanel />}
          </>
        ) : (
          <p className="ws-rail-hint">Pick <b>Learn</b> on any card to open its lesson here, beside your set.</p>
        )}
      </section>
    </aside>
  );
}
```

- [ ] **Step 4: `src/App.jsx` — imports and state**
  1. Change `import LessonSheet from "./LessonSheet.jsx";` to `import LessonSheet, { LessonBody } from "./LessonSheet.jsx";` and add:
     ```js
     import { useIsDesktop } from "./useIsDesktop.js";
     import Sidebar, { VIEWS } from "./Sidebar.jsx";
     import PracticeRail from "./PracticeRail.jsx";
     ```
  2. With the other `useState` hooks (above the `if (!data) return …` early return), add:
     ```js
     const [tunerOpen, setTunerOpen] = useState(false);
     const desktop = useIsDesktop();
     ```

- [ ] **Step 5: `src/App.jsx` — the render.** Replace everything from `const streak = streakInfo(data.sessions);` through the end of the main `return (…);` with:

```jsx
  const streak = streakInfo(data.sessions);
  const openLesson = (it) => { setTunerOpen(false); setLessonFor(it); };
  const requestLog = () => {
    const inSet = !session.completed && session.items.some((x) => x.itemId === lessonFor.id);
    setLessonFor(null);
    setLogging(inSet ? true : { items: [{ itemId: lessonFor.id, minutes: lessonFor.min }] });
  };
  const lessonProps = lessonFor && {
    item: lessonFor, href: safeHref(lessonFor.link?.url),
    sessions: data.sessions.filter((s) => s.itemId === lessonFor.id),
    onCoachResult: recordCoachResult, onRequestLog: requestLog,
  };
  const selectedId = desktop && lessonFor ? lessonFor.id : null;

  const saveErr = saveError && <div className="ws-saveerr">Couldn't save your latest change to this browser — your history may not persist.</div>;
  const views = (
    <main className="ws-main">
      {view === "today" && proposals.length > 0 && (
        <button className="ws-prop-banner" onClick={() => setShowProposals(true)}>
          <span className="ws-prop-spark">✦</span>
          <span className="ws-prop-banner-text">{proposals.length} suggestion{proposals.length > 1 ? "s" : ""} from your practice</span>
          <span className="ws-prop-chev">›</span>
        </button>
      )}
      {view === "today" && (
        <Today
          session={session} itemById={itemById} onSwap={swap} onRegenerate={regenerate}
          onStartLog={() => setLogging(true)} onAddAnother={addAnother}
          settings={data.settings} sessions={data.sessions} onLearn={openLesson} selectedId={selectedId}
        />
      )}
      {view === "tracks" && <Tracks live={live} onComplete={completeStage} onReopen={reopenStage} onLearn={openLesson} selectedId={selectedId} />}
      {view === "library" && (
        <Library items={live.items} onOpen={(it) => setItemForm({ item: it })} onAdd={() => setItemForm({ item: null })} onLearn={openLesson} selectedId={selectedId} />
      )}
      {view === "progress" && <Progress data={data} live={live} streak={streak} onEditSession={setEditSession} />}
    </main>
  );
  const dialogs = (
    <>
      {logging && <LogSheet session={logging === true ? session : logging} itemById={itemById} lastTempo={lastTempo} coachResults={coachResults} onCancel={() => setLogging(false)} onCommit={commitLog} />}
      {showProposals && (
        <ProposalSheet proposals={proposals} onAccept={applyProposal} onDismiss={dismissProposal} onClose={() => setShowProposals(false)} />
      )}
      {showSettings && (
        <Settings
          settings={data.settings} onChange={updateSettings} onToggle={toggleInstrument}
          onReset={resetAll} onClose={() => setShowSettings(false)} onExport={exportData} onImport={importData}
        />
      )}
      {itemForm && (
        <ItemForm
          initial={itemForm.item}
          sessions={data.sessions}
          hidden={itemForm.item ? !!data.items.find((i) => i.id === itemForm.item.id)?.hidden : false}
          onSave={(fields) => (itemForm.item ? saveItem(itemForm.item.id, fields) : addCustom(fields))}
          onDelete={itemForm.item && itemForm.item.custom ? () => { deleteItem(itemForm.item.id); setItemForm(null); } : null}
          onToggleHidden={itemForm.item ? () => toggleHidden(itemForm.item.id) : null}
          onClose={() => setItemForm(null)}
          onLearn={(it) => { setItemForm(null); openLesson(it); }}
        />
      )}
      {editSession && (
        <SessionEdit
          session={editSession} itemById={itemById}
          onSave={editSessionSave} onDelete={deleteSession} onClose={() => setEditSession(null)}
        />
      )}
    </>
  );

  return (
    <PracticeProvider onTempo={setLastTempo}>
      {desktop ? (
        <div className="ws-desk">
          <Sidebar view={view} onView={setView} onSettings={() => setShowSettings(true)}><Streak streak={streak} /></Sidebar>
          <div className="ws-desk-main">{saveErr}{views}</div>
          <PracticeRail
            lesson={lessonProps && <LessonBody key={lessonFor.id} {...lessonProps} />}
            tunerOpen={tunerOpen}
            onOpenTuner={() => { setLessonFor(null); setTunerOpen(true); }}
            onCloseSlot={() => { setLessonFor(null); setTunerOpen(false); }}
          />
          {dialogs}
        </div>
      ) : (
        <Shell>
          {saveErr}
          <header className="ws-head">
            <div className="ws-head-row">
              <div className="ws-brand"><span className="ws-logo">◐</span> Woodshed</div>
              <div className="ws-head-actions">
                <button className="ws-gear" onClick={() => setPracticeOpen(true)} aria-label="Metronome and timer" title="Metronome & timer">♩</button>
                <button className="ws-gear" onClick={() => setShowSettings(true)} aria-label="Settings">⚙</button>
              </div>
            </div>
            <Streak streak={streak} />
          </header>
          {views}
          <nav className="ws-nav">
            {VIEWS.map(([k, label, icon]) => (
              <button key={k} className={`ws-tab ${view === k ? "on" : ""}`} aria-current={view === k ? "page" : undefined} onClick={() => setView(k)}>
                <span className="ws-tab-icon" aria-hidden="true">{icon}</span>{label}
              </button>
            ))}
          </nav>
          {dialogs}
          {practiceOpen && <PracticeSheet onClose={() => setPracticeOpen(false)} onOpenListen={() => { setPracticeOpen(false); setListenOpen(true); }} />}
          {listenOpen && <ListenSheet onClose={() => setListenOpen(false)} />}
          {lessonProps && <LessonSheet {...lessonProps} onClose={() => setLessonFor(null)} />}
        </Shell>
      )}
    </PracticeProvider>
  );
}
```

Before replacing, diff this against the current render and carry over anything the current code has that this block lacks (it was written against commit `7322931`).

- [ ] **Step 6: `src/App.jsx` — selected state in the views**
  - `Today`: add `selectedId` to its props; in its `items.map`, pass `selected={it.id === selectedId}` to `SessionItem`.
  - `SessionItem`: add `selected` to its props; change `<div className="ws-card" …>` to `<div className={`ws-card ${selected ? "sel" : ""}`} …>`.
  - `Tracks`: add `selectedId` to its props; change `className={`ws-stage ${st.status}`}` to `className={`ws-stage ${st.status} ${st.id === selectedId ? "sel" : ""}`}`.
  - `Library`: add `selectedId` to its props; change `className={`ws-lib-item ${it.hidden ? "is-hidden" : ""}`}` to `className={`ws-lib-item ${it.hidden ? "is-hidden" : ""} ${it.id === selectedId ? "sel" : ""}`}`.

- [ ] **Step 7: `src/styles.css` — append:**

```css
/* ---------- desktop (≥1024px): sidebar | main | practice rail ---------- */
.ws-desk{ display:grid; grid-template-columns:200px minmax(0,1fr) 380px; height:100vh; background:var(--bg); color:var(--text); }
.ws-side{ display:flex; flex-direction:column; gap:22px; padding:26px 16px 20px; border-right:1px solid var(--line); min-height:0; }
.ws-side .ws-streak{ margin-top:0; flex-direction:column; align-items:flex-start; gap:8px; }
.ws-side-nav{ display:flex; flex-direction:column; gap:2px; }
.ws-side-tab{ display:flex; align-items:center; gap:10px; width:100%; background:none; border:none; border-radius:9px; padding:9px 10px; color:var(--muted); font-family:inherit; font-size:14px; font-weight:600; text-align:left; cursor:pointer; }
.ws-side-tab:hover{ background:var(--bg2); color:var(--text); }
.ws-side-tab.on{ background:var(--bg2); color:var(--gold); }
.ws-side-settings{ margin-top:auto; }
.ws-desk-main{ overflow-y:auto; padding:26px 36px 48px; min-height:0; }
.ws-desk-main > .ws-main{ max-width:960px; margin:0 auto; }
.ws-rail{ overflow-y:auto; min-height:0; border-left:1px solid var(--line); background:var(--bg2); padding:22px 20px 32px; display:flex; flex-direction:column; gap:20px; }
.ws-rail-slot{ border-top:1px solid var(--line); padding-top:16px; }
.ws-rail-slot-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.ws-rail-label{ font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted2); font-weight:600; }
.ws-rail-hint{ color:var(--muted); font-size:13.5px; line-height:1.6; margin:0; }
.ws-desk .ws-cards{ display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); }
.ws-card.sel{ border-color:var(--gold); }
.ws-stage.sel .ws-stage-title, .ws-lib-item.sel .ws-lib-title{ color:var(--gold); }
```

- [ ] **Step 8: Verify**

Run: `npm test` → exit 0; `npm run build` → succeeds.
Browser at 1440×900: sidebar + main + rail; no bottom tabs, no ♩ header button (check with the accessibility tree / `find` for "Metronome and timer" → absent). Learn on a Today card → lesson in the rail, that card outlined gold; Learn on another → rail swaps; ✕ closes. Start the metronome in the rail, switch through all four views → it keeps clicking. Tuner button → tuner in the slot; opening a lesson replaces it. Resize to 1000px wide → phone layout, the metronome still running, an open lesson now shows as the phone sheet. Back to 1440 → rail again. No console errors.

- [ ] **Step 9: Commit**

```bash
git add src/useIsDesktop.js src/Sidebar.jsx src/PracticeRail.jsx src/App.jsx src/styles.css
git commit -m "feat: desktop layout — sidebar, main view, persistent practice rail"
```

---

### Task 8: Desktop dialogs and Progress in two columns

**Files:**
- Modify: `src/styles.css`, `src/App.jsx` (Progress wrapper only)

- [ ] **Step 1: Progress wrapper** — in `Progress` (`src/App.jsx`), change the JSX root from `<>` … `</>` (the fragment right after `return (` that starts with `<h2 className="ws-h2">Progress</h2>`) to `<div className="ws-progress">` … `</div>`. Nothing else in Progress changes.

- [ ] **Step 2: CSS — append to `src/styles.css`:**

```css
.ws-desk .ws-progress{ display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); column-gap:28px; align-items:start; }
.ws-desk .ws-progress > :not(.ws-block){ grid-column:1 / -1; }
@media (min-width:1024px){
  .ws-sheet-wrap{ align-items:center; }
  .ws-sheet{ max-width:560px; max-height:86vh; border-radius:20px; border-bottom:1px solid var(--line2); padding-bottom:26px; animation:fade .2s ease; }
  .ws-sheet-grip{ display:none; }
}
```

(The Progress title, stat row and weekly goal aren't `.ws-block`, so they span both columns; the charts and the recent-sessions list pair up.)

- [ ] **Step 3: Verify**

Run: `npm run build` → succeeds.
Browser at 1440×900 with a few logged sessions: Progress shows the stats full-width and the blocks in two columns with nothing clipped (the heatmap fits its column). Log sheet, Settings, Suggestions, Edit exercise, Edit session each open as a centered rounded dialog with no grip; Escape and the backdrop still close them. At 390×844 they're bottom sheets exactly as before.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/styles.css
git commit -m "feat: centered dialogs and a two-column Progress on desktop"
```

---

### Task 9: Keyboard shortcuts on desktop

**Files:**
- Create: `src/useShortcuts.js`, `src/ShortcutHelp.jsx`
- Modify: `src/App.jsx`, `src/PracticeTools.jsx`, `src/Sidebar.jsx`, `src/styles.css`

**Interfaces:**
- Consumes: `actionFor`, `clampBpm`, `KEY_HELP` (Task 1); `toggleWatch` (Task 1); `usePractice` (Task 5).
- Produces: `ShortcutBridge({ onAction })` — a component that renders nothing, handles `metronome`/`tap`/`bpm`/`stopwatch` itself and passes `view`/`log`/`close`/`help` to `onAction`. `ShortcutHelp({ onClose })`. `PracticeTools({ hints })`.

- [ ] **Step 1: `src/useShortcuts.js`**

```js
import { useEffect, useRef } from "react";
import { actionFor, clampBpm } from "./shortcuts.js";
import { toggleWatch } from "./stopwatch.js";
import { usePractice } from "./PracticeProvider.jsx";

function contextOf(target) {
  const tag = target && target.tagName;
  return {
    typing: tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || !!(target && target.isContentEditable),
    dialogOpen: !!document.querySelector('[aria-modal="true"]'),
    buttonFocused: tag === "BUTTON" || tag === "A" || tag === "SUMMARY",
  };
}

// Rendered inside PracticeProvider on desktop. It handles the practice-tool keys
// itself, so the App never subscribes to the metronome's per-beat state.
export function ShortcutBridge({ onAction }) {
  const { metro, setWatch } = usePractice();
  const run = useRef(null);
  run.current = (a) => {
    if (a.type === "metronome") metro.toggle();
    else if (a.type === "tap") metro.tap();
    else if (a.type === "bpm") metro.setBpm((b) => clampBpm(b + a.delta));
    else if (a.type === "stopwatch") setWatch(toggleWatch);
    else onAction(a);
  };
  useEffect(() => {
    const onKey = (e) => {
      const a = actionFor(e, contextOf(e.target));
      if (!a) return;
      e.preventDefault();
      run.current(a);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
```

- [ ] **Step 2: `src/ShortcutHelp.jsx`**

```jsx
import React from "react";
import { useDialog } from "./useDialog.js";
import { KEY_HELP } from "./shortcuts.js";

export default function ShortcutHelp({ onClose }) {
  const dlgRef = useDialog(onClose);
  return (
    <div className="ws-sheet-wrap" onClick={onClose}>
      <div className="ws-sheet" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" tabIndex={-1}>
        <h2 className="ws-sheet-title">Keyboard shortcuts</h2>
        <dl className="ws-keys">
          {KEY_HELP.map(([k, what]) => (
            <React.Fragment key={k}><dt><kbd className="ws-kbd">{k}</kbd></dt><dd>{what}</dd></React.Fragment>
          ))}
        </dl>
        <div className="ws-sheet-actions">
          <button className="ws-btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire into `src/App.jsx`**
  1. Imports: `import { ShortcutBridge } from "./useShortcuts.js";` and `import ShortcutHelp from "./ShortcutHelp.jsx";`.
  2. State (with the other hooks): `const [showKeys, setShowKeys] = useState(false);`
  3. Next to `openLesson`, add:
     ```js
     const onShortcut = (a) => {
       if (a.type === "view") setView(a.view);
       else if (a.type === "log") { if (!session.completed && session.items.length) setLogging(true); }
       else if (a.type === "close") { setLessonFor(null); setTunerOpen(false); }
       else if (a.type === "help") setShowKeys(true);
     };
     ```
  4. In the desktop branch, right after `{dialogs}`, add:
     ```jsx
     {showKeys && <ShortcutHelp onClose={() => setShowKeys(false)} />}
     <ShortcutBridge onAction={onShortcut} />
     ```
  5. Pass hints to the rail's tools: in `src/PracticeRail.jsx` change `<PracticeTools />` to `<PracticeTools hints />`.

- [ ] **Step 4: Hints in `src/PracticeTools.jsx`** — change the signature to `export default function PracticeTools({ hints = false })` and add, each right after the control it names:
  - after the `−`/Start/`+` row (`</div>` of `ws-metro-row`): `{hints && <div className="ws-hint-keys"><kbd className="ws-kbd">Space</kbd> start / stop · <kbd className="ws-kbd">← →</kbd> tempo</div>}`
  - inside the Tap button: `Tap tempo{hints && <kbd className="ws-kbd">T</kbd>}`
  - inside the stopwatch Start/Pause button, after its label: `{hints && <kbd className="ws-kbd">S</kbd>}`

  In `src/Sidebar.jsx`, render the view number after each label: change the `VIEWS.map(([k, label, icon]) => …` callback to take the index `(…, i)` and add `<kbd className="ws-kbd">{i + 1}</kbd>` after `{label}`; after the Settings button add `<button className="ws-side-keys" onClick={onHelp}>Keyboard shortcuts <kbd className="ws-kbd">?</kbd></button>` and add `onHelp` to Sidebar's props. In App pass `onHelp={() => setShowKeys(true)}` to `<Sidebar>`.

- [ ] **Step 5: CSS — append to `src/styles.css`:**

```css
.ws-kbd{ font-family:'JetBrains Mono',monospace; font-size:10.5px; font-weight:500; color:var(--muted2); border:1px solid var(--line2); border-radius:5px; padding:1px 5px; margin-left:6px; line-height:1.4; }
.ws-side-tab .ws-kbd{ margin-left:auto; }
.ws-hint-keys{ font-size:11.5px; color:var(--muted2); text-align:center; margin-top:8px; }
.ws-side-keys{ background:none; border:none; color:var(--muted2); font-family:inherit; font-size:12px; text-align:left; padding:4px 10px; cursor:pointer; }
.ws-side-keys:hover{ color:var(--text); }
.ws-keys{ display:grid; grid-template-columns:auto 1fr; gap:10px 16px; margin:6px 0 18px; font-size:14px; }
.ws-keys dt{ text-align:right; }
.ws-keys dd{ margin:0; color:var(--muted); }
```

- [ ] **Step 6: Verify**

Run: `npm test` → exit 0; `npm run build` → succeeds.
Browser at 1440×900, focus on the page body: Space starts/stops the metronome; T twice ~0.5s apart sets ≈120 bpm; → / Shift+→ / ← change the BPM (never past 40–240); S starts/pauses the stopwatch; 1–4 switch views; L opens the log sheet (not when today's set is already logged); with a lesson open, Esc closes it; ? opens the shortcut list and Esc closes that dialog. Guards: with the log sheet open, Space/T/1 do nothing; typing in Library's "+ Add" title field types normally; Tab to a card's Learn button then Space presses the button (opens the lesson) instead of the metronome. Ctrl+L still focuses the browser's address bar. At phone width no shortcut fires.

- [ ] **Step 7: Commit**

```bash
git add src/useShortcuts.js src/ShortcutHelp.jsx src/App.jsx src/PracticeTools.jsx src/PracticeRail.jsx src/Sidebar.jsx src/styles.css
git commit -m "feat: desktop keyboard shortcuts with on-screen hints and a ? list"
```

---

### Task 10: End-to-end verification and docs

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README** — add a `## On the desktop` section after "What it does":

```markdown
## On the desktop

At 1024px and wider Woodshed switches to a three-pane layout: the views in a
sidebar, today's set (or Tracks, Library, Progress) in the middle, and a
practice rail on the right — metronome and stopwatch always there, with the
open lesson or the tuner beneath them. Narrower windows get the phone layout.

**Install it:** open https://jcscocca.github.io/woodshed/ in Chrome or Edge and
choose *Install app* (address bar icon or the ⋮ menu). It gets its own window,
works offline, and updates itself when a new version is pushed.

**Keyboard:** Space metronome · T tap tempo · ←/→ tempo (Shift ±10) ·
S stopwatch · 1–4 views · L log · Esc close · ? the full list.
```

Also add `src/PracticeProvider.jsx`, `src/PracticeRail.jsx`, `src/Sidebar.jsx`, `src/shortcuts.js` + `src/useShortcuts.js` to the README's file table with one-line descriptions, and under "Build & host" mention the Pages workflow (`.github/workflows/pages.yml`, deploys on push to `main` after `npm test`).

- [ ] **Step 2: Full check against the spec's acceptance criteria**, in the built app (`npm run build && npm run preview`):
  1. ≥1024px: sidebar + main + rail; no bottom tabs or header ♩.
  2. Metronome + stopwatch survive view changes, lesson open/close, and a resize across 1024px.
  3. Learn → rail lesson, card selected, Esc/✕ closes.
  4. Dialogs centered on desktop, bottom sheets on phone.
  5. A 390×844 screenshot of each view matches the same screenshot taken at commit `7322931` (the last commit before this plan): `git worktree add ../ws-before 7322931`, then `npm ci && npx vite --port 5198` in that directory.
  6. Every shortcut works; none fires while typing or in a dialog.
  7. Offline: load the preview once, stop the preview server, reload → the app opens. `navigator.serviceWorker.controller` is non-null. Chrome shows the install icon.
  8. `.github/workflows/pages.yml` present (runs at first push).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: README — desktop layout, install, shortcuts, Pages deploy"
```

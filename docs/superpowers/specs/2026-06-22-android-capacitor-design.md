# Woodshed on Android (Capacitor) — Design

**Date:** 2026-06-22
**Status:** Approved design, pending implementation plan

## Problem

Woodshed is a phone-first, offline, local-storage web app. We want a real
Android app without forking into a second codebase, and without giving up the
"yours, offline — no account, no server" identity.

## Goal

Wrap the existing web build in Capacitor so the **same React codebase** ships as
both the website and a native Android app whose assets are bundled for full
offline use. Make it a genuinely good Android app (native daily reminders, mic
permission, self-hosted fonts), stopping before Play Store signing/submission.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Wrapper | Capacitor (bundled `dist/`, offline, one codebase) |
| App ID | `app.woodshed` (permanent Play identity — do not change after publish) |
| App name | Woodshed |
| Scope | Scaffold + native polish; **stop before** Play signing/submission |
| Fonts | Self-host via `@fontsource` packages (replaces the Google Fonts CDN) |

## Delivery boundary

This machine has **node/npm but no JDK, Android SDK, or Android Studio**.

- **In scope (delivered here):** all scaffolding + code — Capacitor deps,
  `capacitor.config.json`, the generated `android/` project (a file/npm copy, no
  SDK needed), the platform abstraction, native-notification wiring, the mic
  permission in the manifest, self-hosted fonts, scripts, docs. The **web build
  stays green** (`npm test`, `npm run build`).
- **Out of scope (you do, in Android Studio):** the actual Gradle build of the
  APK/AAB, running on a device/emulator, the signing keystore, and Play Console
  account/submission. The README documents the steps; no signing stubs.

## Architecture

Capacitor copies the built `dist/` into the Android app's WebView at
`cap sync` time, so the native app is fully self-contained (no hosting). The web
and native targets are the **same bundle**; the only runtime divergence is a
thin platform layer.

### 1. Platform abstraction — `src/platform/`

One bundle for both targets, branching at runtime on
`Capacitor.isNativePlatform()`. Components never import Capacitor directly — all
platform divergence is isolated here, so the seam stays small and the web build
stays clean.

- `src/platform/index.js` — exports `isNative` (and room for future helpers).
- `src/platform/notify.js` — the daily-reminder strategy:
  - `permissionState()` → `"granted" | "denied" | "default" | "unsupported"`
  - `ensurePermission()` → request permission (native: LocalNotifications; web: `Notification.requestPermission`)
  - `setDailyReminder(enabled, time)` → native: schedule/cancel a repeating daily local notification at `time`; web: no-op (the in-app interval is the web mechanism)
  - `fireInApp(title, body)` → web in-app `Notification` (used by the existing interval)

### 2. Native reminder (the upgrade)

`@capacitor/local-notifications` schedules a **repeating daily** notification
that fires **even when the app is closed** — properly solving the README's
"reminders can't reach a fully-closed app" limitation, with no push backend.

Refactor in `src/App.jsx`:
- The reminder effect ([App.jsx:69-91](../../../src/App.jsx)) gets an early
  `if (isNative) return;` — native uses the scheduled notification, not the
  in-app minute interval. **Web behavior is unchanged.**
- Settings `setReminder` ([App.jsx:965-979](../../../src/App.jsx)) calls
  `notify.ensurePermission()` + `notify.setDailyReminder(enabled, time)` instead
  of touching `Notification` directly; `notifyState`/`reminderNote()` read
  `notify.permissionState()`.

### 3. Mic permission

Add `<uses-permission android:name="android.permission.RECORD_AUDIO"/>` to the
generated `android/app/src/main/AndroidManifest.xml`. `getUserMedia` in
[useListener.js:51](../../../src/useListener.js) is unchanged; Capacitor's
WebView forwards the OS runtime prompt. **Requires real-device testing.**

### 4. Self-hosted fonts

Replace the Google Fonts `<link>` in [index.html](../../../index.html) with
`@fontsource` packages imported in `src/main.jsx`:
- `@fontsource/hanken-grotesk` (400, 500, 600, 700)
- `@fontsource/jetbrains-mono` (400, 500)
- `@fontsource-variable/bricolage-grotesque` (opsz/weight axes used by the CSS)

The CSS already references these family names ([styles.css](../../../src/styles.css)),
so `@font-face` from Fontsource satisfies them with **no style changes**. This
makes the bundled app render correctly offline. (Exact package names/weights are
confirmed at `npm install` time in the plan.)

### 5. Config, scripts, what's committed

- `capacitor.config.json`: `{ appId: "app.woodshed", appName: "Woodshed", webDir: "dist" }`.
- `package.json` scripts: `"cap:sync": "npm run build && npx cap sync"`,
  `"android": "npx cap open android"`; Capacitor deps added.
- Commit the `android/` project (it's a real, versioned native project).
- `.gitignore`: keep Capacitor's generated `android/.gitignore`; additionally
  ignore the synced web assets `android/app/src/main/assets/public` (regenerated
  by `cap sync` — don't commit build output).
- README "Android (Capacitor)" section: install Android Studio → `npm run
  cap:sync` → `npm run android` → build/run; plus a pointer to signing for
  release.

## Non-goals

Signing keystore, Play Console account/submission, store-listing assets. Live
updates (Appflow/Capgo) are a possible later add, not now.

## Testing

- **Web (automated, must stay green):** `npm test` (smoke + lessons) and
  `npm run build`. The platform abstraction's web path preserves current
  reminder behavior exactly.
- **Native (manual device checklist — can't run here):**
  - Offline cold launch renders (self-hosted fonts) and the app works with no network.
  - Daily reminder fires at the set time **with the app closed**.
  - Mic permission prompt appears; the tuner/listener reads pitch.
  - Status bar / safe-area insets look right; hardware back button behaves.
  - Metronome audio output works.

## Risks / notes

- **Network for install:** adding Capacitor + Fontsource needs `npm install`. If
  the registry is unreachable here, that blocks scaffolding; the plan should run
  installs early and stop/report if they fail (don't half-scaffold).
- **Toolchain:** node 25 is newer than Capacitor's tested matrix — expect
  possible engine warnings, not failures. The APK build itself is unverifiable
  here (no SDK), so "done" = builds clean in the plan's web checks + opens in
  Android Studio.
- **App ID is immutable** once published — `app.woodshed` is locked in.
- **WebView ≠ desktop Chrome:** audio + mic are the device-only risk areas
  (already flagged in the README).

## Files

**New:** `capacitor.config.json`, `src/platform/index.js`,
`src/platform/notify.js`, generated `android/**`,
`docs/superpowers/specs/2026-06-22-android-capacitor-design.md` (this file).
**Edited:** `src/App.jsx` (reminder refactor), `src/main.jsx` + `index.html`
(fonts), `package.json` (deps + scripts), `.gitignore`, `README.md`.

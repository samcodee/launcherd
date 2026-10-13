# launcherd

A minimal, PIN-protected Android launcher built for students and people who want fewer
distractions and more focus. It replaces your home screen with a small,
deliberately limited surface: only the apps you choose, plus a simple todo
list. Settings can be protected with a PIN.

## Why

Home screens are designed to pull you in. `launcherd` gives you a blank,
quiet one instead. You decide which apps are reachable, and the rest stay a
deliberate step away.

## Features

- PIN-gated settings
- Pick which installed apps appear on the home screen
- Web apps: pin any website to the home grid as an app-like tile with an
  optional domain whitelist, built on an in-app browser
- A TODO list
- Countdown to a date, editable from the home screen, with a configurable
  label and a show/hide toggle in Settings
- Minimalist UI
- No network access, no analytics, no accounts

## Web apps

From **Settings → Web apps → Add web app** you can turn any website into a
tile on the home grid. It opens in a built-in browser (JavaScript, cookies
and storage enabled) with a compact bar for back, close and reload.

Options per web app:

- **Incognito** — history, cookies and site data are not kept between uses.
- **Restrict to allowed domains** — only links matching the patterns you list
  can be opened; anything else shows a "Blocked" notice. Patterns are
  space/comma separated: `*youtube.com` allows youtube.com and its
  subdomains (this is prefilled from the URL you enter), `*.reddit.com`
  allows subdomains only, and wrapping a pattern in slashes like
  `/^https:\/\/en\.wikipedia\.org\//` uses it as a regex.

## Getting started

Download APK from website or build it and install it using the instructions in the next section.

On first launch a short onboarding explains what launcherd does and asks how
you want to protect Settings: **set a 4-digit PIN**, or **skip for now** (you
can add a PIN from Settings later). To make `launcherd` your home screen,
open **Settings** (home screen, top right) and tap **Set as default
launcher**.

Tip: for a kids' or study device, have one person set a PIN that the user
doesn't know, then hand the device over.

## Building a release APK

```bash
pnpm i
pnpm build:release
```

Requirements to build the APK: JDK 17, pnpm, node, Android SDK.

The script automatically checks for node, pnpm, JDK 17+ and the Android SDK, runs `expo prebuild`, then `./gradlew
assembleRelease`, and moves the result to `launcherd-release.apk` in the project
root.

Release builds are signed with the debug keystore until you configure a real
signing key in `android/app/build.gradle`.

## Notes and limitations

- The PIN is a speed bump, not a security boundary. The launcher can still be left via the system notification shade or recents.
- The launcher is meant to increase friction towards distractions and reduce friction for productive work, not completely disable or block stuff.
- This repo contains some AI-assisted code.

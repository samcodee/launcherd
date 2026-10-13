#!/usr/bin/env bash
#
# launcherd release build
#
# Checks for node, pnpm, JDK 17 and the Android SDK, builds a release APK,
# and drops it in the project root as launcherd-release.apk.
#
# Usage:  pnpm build:release      (or)      bash scripts/build-release.sh

set -euo pipefail

BOLD=$'\033[1m'
DIM=$'\033[2m'
RED=$'\033[31m'
GREEN=$'\033[32m'
RESET=$'\033[0m'

step() { printf "${DIM}==>${RESET} %s\n" "$*"; }
ok()   { printf "${GREEN}  ok${RESET} %s\n" "$*"; }
die()  { printf "\n${RED}%s${RESET}\n\n" "$*" >&2; exit 1; }

cd "$(dirname "${BASH_SOURCE[0]}")/.."

printf "\n${BOLD}launcherd: build release APK${RESET}\n\n"

# --- checks ------------------------------------------------------------------
command -v node >/dev/null 2>&1 || die "Node.js not found.
  Install: https://nodejs.org"
ok "node $(node --version)"

command -v pnpm >/dev/null 2>&1 || die "pnpm not found.
  Install: https://pnpm.io/installation   (quick: corepack enable)"
ok "pnpm $(pnpm --version)"

JAVA="${JAVA_HOME:+$JAVA_HOME/bin/java}"
if [ ! -x "${JAVA:-}" ]; then
  JAVA="$(command -v java || true)"
fi
[ -n "$JAVA" ] || die "java not found. Install JDK 17 with sdkman:
  curl -s https://get.sdkman.io | bash
  sdk install java 17.0.20-tem"

JAVA_MAJOR="$("$JAVA" -version 2>&1 | head -1 | sed -E 's/.*"([0-9]+).*/\1/' || true)"
if [ "${JAVA_MAJOR:-0}" != "17" ]; then
  die "Java 17 is required, found ${JAVA_MAJOR:-unknown} ($JAVA).
  Switch with sdkman:
    sdk install java 17.0.20-tem
    sdk env                    # uses this repo's .sdkmanrc
  Or point JAVA_HOME at a JDK 17."
fi
ok "java 17"

SDK=""
for candidate in \
  "${ANDROID_HOME:-}" \
  "${ANDROID_SDK_ROOT:-}" \
  "$HOME/Android/Sdk" \
  "$HOME/Library/Android/sdk"; do
  if [ -n "$candidate" ] && [ -d "$candidate" ]; then
    SDK="$candidate"
    break
  fi
done
[ -n "$SDK" ] || die "Android SDK not found. Install it and set ANDROID_HOME.
  Android Studio:      https://developer.android.com/studio
  Command line tools:  https://developer.android.com/tools#tools-sdk"
export ANDROID_HOME="$SDK"
export ANDROID_SDK_ROOT="$SDK"
ok "Android SDK: $SDK"

# --- build -------------------------------------------------------------------
if [ ! -d node_modules ]; then
  step "pnpm install"
  pnpm install
fi

step "expo prebuild (regenerating android/)"
npx expo prebuild --platform android --clean

printf 'sdk.dir=%s\n' "$SDK" > android/local.properties

step "gradlew assembleRelease (this takes a few minutes)"
( cd android && ./gradlew assembleRelease )

mv -f android/app/build/outputs/apk/release/app-release.apk launcherd-release.apk

printf "\n${GREEN}${BOLD}Done:${RESET} launcherd-release.apk\n\n"

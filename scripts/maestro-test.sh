#!/usr/bin/env bash
# scripts/maestro-test.sh — Maestro E2E test runner.
#
# Önkoşullar:
#   1. ~/.maestro/bin/maestro yüklü (brew install --cask maestro veya get.maestro.mobile.dev)
#   2. Java 17+ (brew install openjdk@17, PATH'e ekle)
#   3. iOS Simulator açık (xcrun simctl boot <UDID>)
#   4. AirSpeak development build simulator'da yüklü
#      (expo run:ios --device <UDID> veya eas build --profile development --local)
#
# Komutlar:
#   maestro-test.sh all                → tüm flow'lar (.maestro/flows/)
#   maestro-test.sh <flow_name>        → tek flow (örn: onboarding)
#   maestro-test.sh smoke              → tag:smoke
#   maestro-test.sh critical           → tag:critical (regression)
#   maestro-test.sh boot               → iPhone 17 Pro simulator başlat
#   maestro-test.sh setup              → kurulum durumu kontrol

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAESTRO="${HOME}/.maestro/bin/maestro"
SIM_NAME="${MAESTRO_SIM:-iPhone 17 Pro}"

# Java 17 PATH inject — brew openjdk@17 default'a eklenmiyor
if [[ -d "/opt/homebrew/opt/openjdk@17/bin" ]]; then
  export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
fi

cmd_setup() {
  echo "=== Setup check ==="
  if [[ ! -x "$MAESTRO" ]]; then
    echo "❌ Maestro CLI yok: $MAESTRO"
    echo "   curl -Ls https://get.maestro.mobile.dev | bash"
  else
    echo "✓ Maestro: $($MAESTRO --version 2>&1 | head -1)"
  fi
  if ! command -v java >/dev/null 2>&1; then
    echo "❌ Java yok"
    echo "   brew install openjdk@17"
  else
    echo "✓ Java: $(java -version 2>&1 | head -1)"
  fi
  echo "✓ Simulator hedef: $SIM_NAME"
  xcrun simctl list devices "$SIM_NAME" 2>&1 | grep -E "($SIM_NAME).*\(.*\)" | head -3
}

cmd_boot() {
  local udid
  udid=$(xcrun simctl list devices "$SIM_NAME" 2>&1 | grep -E "($SIM_NAME).*\(.*\)" | grep -v unavailable | head -1 | grep -oE "[0-9A-F-]{36}")
  if [[ -z "$udid" ]]; then
    echo "❌ Simulator bulunamadı: $SIM_NAME"
    exit 1
  fi
  echo "Booting $SIM_NAME ($udid)"
  xcrun simctl boot "$udid" 2>/dev/null || echo "  (zaten açık)"
  open -a Simulator
  echo "✓ Simulator açık"
}

cmd_all() {
  "$MAESTRO" test "$ROOT/.maestro/flows/"
}

cmd_smoke() {
  "$MAESTRO" test --include-tags=smoke "$ROOT/.maestro/flows/"
}

cmd_critical() {
  "$MAESTRO" test --include-tags=critical "$ROOT/.maestro/flows/"
}

cmd_flow() {
  local name="$1"
  local path="$ROOT/.maestro/flows/${name}.yaml"
  if [[ ! -f "$path" ]]; then
    echo "❌ Flow yok: $path"
    echo "Mevcut flow'lar:"
    ls "$ROOT/.maestro/flows/" | sed 's/^/  /'
    exit 1
  fi
  "$MAESTRO" test "$path"
}

case "${1:-}" in
  setup)    cmd_setup ;;
  boot)     cmd_boot ;;
  all)      cmd_all ;;
  smoke)    cmd_smoke ;;
  critical) cmd_critical ;;
  ""|help|-h|--help)
    grep -E "^#" "$0" | sed 's/^# \?//'
    ;;
  *)        cmd_flow "$1" ;;
esac

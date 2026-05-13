#!/usr/bin/env bash
# scripts/issues-sync.sh — GitHub Issues sync helper.
#
# Sentry → GitHub issue otomatik bridge.
# gh CLI auth gerekir: gh auth status
#
# Komutlar:
#   list                       → açık issue'lar
#   create <title> [body]      → manuel issue
#   close <num>                → kapat
#   sync-sentry [days]         → Sentry unresolved → GH issue (dedup)
#   sync-todo                  → CLAUDE.md "Pending Items" → GH issue (henüz yok)
#
# Env (sync-sentry için):
#   SENTRY_AUTH_TOKEN          → read scope yeterli

set -euo pipefail

REPO="tinymaxi1/airspeak"
SENTRY_ORG="airspeak"
SENTRY_PROJECT="react-native"

cmd_list() {
  gh issue list --repo "$REPO" --state open --limit 30
}

cmd_create() {
  local title="${1:-}"
  local body="${2:-}"
  if [[ -z "$title" ]]; then echo "ERROR: create <title> [body]" >&2; exit 1; fi
  gh issue create --repo "$REPO" --title "$title" --body "$body"
}

cmd_close() {
  local num="${1:-}"
  if [[ -z "$num" ]]; then echo "ERROR: close <num>" >&2; exit 1; fi
  gh issue close --repo "$REPO" "$num"
}

cmd_sync_sentry() {
  local days="${1:-14d}"
  if [[ -z "${SENTRY_AUTH_TOKEN:-}" ]]; then
    echo "ERROR: SENTRY_AUTH_TOKEN env yok" >&2; exit 1
  fi

  echo "1) Sentry unresolved $days çek..."
  local sentry_json
  sentry_json=$(curl -s -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
    "https://sentry.io/api/0/projects/$SENTRY_ORG/$SENTRY_PROJECT/issues/?query=is:unresolved&statsPeriod=$days&limit=20")

  echo "2) GitHub açık issue'ları çek (dedup için)..."
  local gh_titles
  gh_titles=$(gh issue list --repo "$REPO" --state open --limit 100 --json title --jq '.[].title' || echo "")

  echo "3) Her Sentry issue için GH issue aç (yoksa)..."
  echo "$sentry_json" | python3 -c "
import json, sys, subprocess, os

repo = '$REPO'
issues = json.load(sys.stdin)
existing = set(line.strip() for line in '''$gh_titles'''.split('\n') if line.strip())

created = 0
skipped = 0
for i in issues:
    short_id = i.get('shortId', '?')
    title = f'[Sentry {short_id}] {(i.get(\"title\",\"\") or \"\")[:70]}'
    if title in existing:
        print(f'  SKIP  {short_id} (zaten var)')
        skipped += 1
        continue

    md = i.get('metadata', {})
    body = f'''**Sentry Issue:** [{short_id}](https://sentry.io/organizations/$SENTRY_ORG/issues/{i[\"id\"]}/)

**Title:** {i.get(\"title\")}
**Level:** {i.get(\"level\",\"?\")}
**Events:** {i.get(\"count\",\"?\")}
**Users:** {i.get(\"userCount\",\"?\")}
**First seen:** {i.get(\"firstSeen\",\"?\")}
**Last seen:** {i.get(\"lastSeen\",\"?\")}
**File:** \`{md.get(\"filename\",\"?\")}:{md.get(\"function\",\"?\")}\`

---
_Auto-synced from Sentry. Resolve burada ve Sentry'de._
'''
    # Severity: events sayısına göre etiket
    cnt = i.get('count') or 0
    severity = 'severity-high' if int(cnt) >= 20 else ('severity-medium' if int(cnt) >= 5 else 'severity-low')

    result = subprocess.run([
        'gh', 'issue', 'create', '--repo', repo,
        '--title', title, '--body', body,
        '--label', 'bug,sentry-auto,' + severity,
    ], capture_output=True, text=True)
    if result.returncode == 0:
        print(f'  ✓ {short_id} → {result.stdout.strip()}')
        created += 1
    else:
        # Label yoksa fallback (label otomatik oluşturulamayabilir)
        result2 = subprocess.run([
            'gh', 'issue', 'create', '--repo', repo,
            '--title', title, '--body', body,
        ], capture_output=True, text=True)
        if result2.returncode == 0:
            print(f'  ✓ {short_id} → {result2.stdout.strip()} (no labels)')
            created += 1
        else:
            print(f'  ✗ {short_id} fail: {result2.stderr[:100]}')

print(f'\\n✅ {created} oluşturuldu, {skipped} atlandı')
"
}

cmd_sync_todo() {
  echo "TODO: CLAUDE.md 'Pending Items' parse → henüz implement edilmedi"
  echo "Manuel: gh issue create --repo $REPO --title '<title>'"
}

case "${1:-}" in
  list)         cmd_list ;;
  create)       cmd_create "${2:-}" "${3:-}" ;;
  close)        cmd_close "${2:-}" ;;
  sync-sentry)  cmd_sync_sentry "${2:-14d}" ;;
  sync-todo)    cmd_sync_todo ;;
  ""|help|-h|--help)
    grep -E "^#" "$0" | sed 's/^# \?//'
    ;;
  *)
    echo "Bilinmeyen komut: $1" >&2
    echo "Kullanım: $0 [list|create|close|sync-sentry|sync-todo|help]" >&2
    exit 1
    ;;
esac

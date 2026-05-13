#!/usr/bin/env bash
# scripts/sentry-helper.sh
#
# Sentry CLI wrapper — issue list / resolve / event trace.
# Token: $SENTRY_AUTH_TOKEN (env, NEVER commit token to file).
#
# Komutlar:
#   sentry-helper.sh list             → son 24h unresolved issue listele
#   sentry-helper.sh list 14d         → son 14d unresolved
#   sentry-helper.sh latest           → en son crash event detayı
#   sentry-helper.sh resolve <id>     → issue resolve
#   sentry-helper.sh unresolve <id>   → issue unresolve (test)
#   sentry-helper.sh trace <event_id> → tek event tam stack trace
#   sentry-helper.sh issue <id>       → issue summary (event count, frame)
#
# id formatı: REACT-NATIVE-1 (shortId) veya 119139646 (numeric).

set -euo pipefail

ORG="airspeak"
PROJECT="react-native"
API="https://sentry.io/api/0"

if [[ -z "${SENTRY_AUTH_TOKEN:-}" ]]; then
  echo "ERROR: SENTRY_AUTH_TOKEN env var gerekli." >&2
  exit 1
fi

AUTH=(-H "Authorization: Bearer $SENTRY_AUTH_TOKEN")

# Resolve shortId → numeric id
# - Numeric ise direkt return
# - Aksi halde Sentry shortids endpoint (case-sensitive uppercase normalize)
resolve_id() {
  local raw="$1"
  if [[ "$raw" =~ ^[0-9]+$ ]]; then
    echo "$raw"
    return
  fi
  local upper; upper=$(echo "$raw" | tr '[:lower:]' '[:upper:]')
  curl -s "${AUTH[@]}" \
    "$API/organizations/$ORG/shortids/$upper/" \
    | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    if isinstance(d, dict) and d.get('groupId'):
        print(d['groupId'])
except Exception:
    pass
"
}

cmd_list() {
  local period="${1:-24h}"
  echo "=== Sentry $ORG/$PROJECT — unresolved $period ==="
  curl -s "${AUTH[@]}" \
    "$API/projects/$ORG/$PROJECT/issues/?query=is:unresolved&statsPeriod=$period&limit=20&sort=date" \
    | python3 -c "
import json, sys
data = json.load(sys.stdin)
if isinstance(data, dict) and 'detail' in data:
    print('ERROR:', data['detail']); sys.exit(1)
print(f'Total: {len(data)}')
print()
for i in data:
    print(f'{i[\"shortId\"]:<18} id={i[\"id\"]:<12} | level={i.get(\"level\",\"?\"):<6} events={i.get(\"count\",\"?\"):<5} users={i.get(\"userCount\",\"?\"):<3} last={i.get(\"lastSeen\",\"?\")[:19]}')
    print(f'  {i[\"title\"][:100]}')
    md = i.get('metadata',{})
    if md.get('filename'): print(f'  file: {md.get(\"filename\")}:{md.get(\"function\",\"?\")}')
    print()
"
}

cmd_latest() {
  echo "=== En son unresolved event ==="
  curl -s "${AUTH[@]}" \
    "$API/projects/$ORG/$PROJECT/issues/?query=is:unresolved&statsPeriod=24h&limit=1&sort=date" \
    | python3 -c "
import json, sys
data = json.load(sys.stdin)
if not data: print('Yok — 24h içinde unresolved event yok.'); sys.exit(0)
i = data[0]
print(f'shortId: {i[\"shortId\"]} (id={i[\"id\"]})')
print(f'title: {i[\"title\"][:120]}')
print(f'count: {i.get(\"count\")} events, {i.get(\"userCount\")} users')
print(f'lastSeen: {i.get(\"lastSeen\")}')
md = i.get('metadata',{})
if md.get('filename'): print(f'file: {md.get(\"filename\")}:{md.get(\"function\",\"?\")}')
print()
print(f'Trace komutu: sentry-helper.sh trace <event_id>')
print(f'  (event_id için Sentry UI veya issue events endpoint)')
"
}

cmd_resolve() {
  local id; id=$(resolve_id "$1")
  if [[ -z "$id" ]]; then echo "Issue bulunamadı: $1" >&2; exit 1; fi
  curl -s -X PUT "${AUTH[@]}" -H "Content-Type: application/json" \
    -d '{"status":"resolved"}' \
    "$API/organizations/$ORG/issues/$id/" \
    | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f'Resolved: status={d.get(\"status\")} actor={d.get(\"statusDetails\",{}).get(\"actor\",{}).get(\"username\",\"?\")}')
"
}

cmd_unresolve() {
  local id; id=$(resolve_id "$1")
  if [[ -z "$id" ]]; then echo "Issue bulunamadı: $1" >&2; exit 1; fi
  curl -s -X PUT "${AUTH[@]}" -H "Content-Type: application/json" \
    -d '{"status":"unresolved"}' \
    "$API/organizations/$ORG/issues/$id/" \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Unresolved: status={d.get(\"status\")}')"
}

cmd_trace() {
  local event_id="$1"
  echo "=== Event trace: $event_id ==="
  curl -s "${AUTH[@]}" \
    "$API/projects/$ORG/$PROJECT/events/$event_id/" \
    | python3 -c "
import json, sys
d = json.load(sys.stdin)
if isinstance(d, dict) and 'detail' in d:
    print('ERROR:', d['detail']); sys.exit(1)
print(f'Date: {d.get(\"dateCreated\")}')
print(f'Group: {d.get(\"groupID\")}')
print(f'Title: {(d.get(\"title\") or \"\")[:100]}')
rel = d.get('release') or {}
print(f'Release: {rel.get(\"version\",\"?\")}')
ctx = d.get('contexts',{})
print(f'App: v{ctx.get(\"app\",{}).get(\"app_version\",\"?\")} build {ctx.get(\"app\",{}).get(\"app_build\",\"?\")}')
print(f'OS: {ctx.get(\"os\",{}).get(\"name\",\"?\")} {ctx.get(\"os\",{}).get(\"version\",\"?\")}')
tags = {t['key']: t['value'] for t in d.get('tags', [])}
print(f'\\nTags interesting:')
for k in ('environment','release','dist','expo-update-id','expo-channel','expo-update-embedded'):
    if k in tags: print(f'  {k}: {tags[k]}')
for ent in d.get('entries', []):
    if ent.get('type') == 'exception':
        for exc in ent['data'].get('values', []):
            print(f'\\n{exc.get(\"type\")}: {(exc.get(\"value\",\"\") or \"\")[:200]}')
            mech = exc.get('mechanism') or {}
            print(f'mechanism: {mech.get(\"type\",\"?\")} handled={mech.get(\"handled\",\"?\")}')
            frames = (exc.get('stacktrace') or {}).get('frames') or []
            in_app = [f for f in frames if f.get('inApp')]
            if in_app:
                print(f'In-app (top 5):')
                for f in reversed(in_app[-5:]):
                    print(f'  {f.get(\"filename\",\"?\")}:{f.get(\"lineNo\",\"?\")} → {(f.get(\"function\") or \"?\")[:50]}')
    if ent.get('type') == 'breadcrumbs':
        crumbs = (ent['data'].get('values') or [])[-8:]
        print(f'\\nLast {len(crumbs)} breadcrumbs:')
        for c in crumbs:
            ts = (c.get('timestamp','') or '')[:19]
            cat = c.get('category','?')
            msg = c.get('message') or (c.get('data',{}) or {}).get('url') or str(c.get('data',{}))[:60]
            print(f'  {ts} [{cat[:14]:<14}] {msg[:90]}')
"
}

cmd_issue() {
  local id; id=$(resolve_id "$1")
  if [[ -z "$id" ]]; then echo "Issue bulunamadı: $1" >&2; exit 1; fi
  curl -s "${AUTH[@]}" "$API/organizations/$ORG/issues/$id/" | python3 -m json.tool | head -40
}

case "${1:-}" in
  list)      cmd_list "${2:-24h}" ;;
  latest)    cmd_latest ;;
  resolve)   cmd_resolve "${2:-}" ;;
  unresolve) cmd_unresolve "${2:-}" ;;
  trace)     cmd_trace "${2:-}" ;;
  issue)     cmd_issue "${2:-}" ;;
  ""|help|-h|--help)
    grep -E "^#" "$0" | sed 's/^# \?//'
    ;;
  *)
    echo "Bilinmeyen komut: $1" >&2
    echo "Kullanım: $0 [list|latest|resolve|unresolve|trace|issue|help]" >&2
    exit 1
    ;;
esac

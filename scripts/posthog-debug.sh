#!/usr/bin/env bash
# scripts/posthog-debug.sh
#
# PostHog Analytics API helper.
#
# Gerekli env vars:
#   POSTHOG_PERSONAL_KEY   (phx_...)  → kişisel API key (read scope)
#   POSTHOG_PROJECT_ID     (422338)
#   POSTHOG_HOST           (https://us.posthog.com — API için, mobile farklı)
#
# Komutlar:
#   ph events <user_id> [hours]    → kullanıcının son event'leri
#   ph latest [hours]              → son N saatte tüm event'ler (default 1h)
#   ph user <user_id>              → person properties
#   ph counts [hours]              → event_name → count
#   ph project                     → proje info (smoke test)
#
# Not: crash-trail/funnel/retention için PostHog UI öner — API ile karmaşık.

set -euo pipefail

PROJECT="${POSTHOG_PROJECT_ID:-422338}"
HOST="${POSTHOG_HOST:-https://us.posthog.com}"

if [[ -z "${POSTHOG_PERSONAL_KEY:-}" ]]; then
  echo "ERROR: POSTHOG_PERSONAL_KEY env var gerekli (phx_...)." >&2
  exit 1
fi

AUTH=(-H "Authorization: Bearer $POSTHOG_PERSONAL_KEY")

cmd_project() {
  curl -s "${AUTH[@]}" "$HOST/api/projects/$PROJECT/" \
    | python3 -c "
import json, sys
d = json.load(sys.stdin)
if 'detail' in d: print('ERROR:', d['detail']); sys.exit(1)
print(f'id: {d.get(\"id\")}')
print(f'name: {d.get(\"name\")}')
print(f'created_at: {d.get(\"created_at\")}')
print(f'token: {d.get(\"api_token\",\"?\")[:14]}...')
"
}

cmd_events() {
  local user_id="${1:-}"
  local hours="${2:-24}"
  if [[ -z "$user_id" ]]; then echo "ERROR: events <user_id>" >&2; exit 1; fi
  local after; after=$(python3 -c "from datetime import datetime, timedelta, timezone; print((datetime.now(timezone.utc) - timedelta(hours=$hours)).isoformat())")
  curl -s "${AUTH[@]}" \
    "$HOST/api/projects/$PROJECT/events/?distinct_id=$user_id&after=$after&limit=50" \
    | python3 -c "
import json, sys
d = json.load(sys.stdin)
if 'detail' in d: print('ERROR:', d['detail']); sys.exit(1)
results = d.get('results', [])
print(f'Total: {len(results)} events')
for e in results[:30]:
    ts = e.get('timestamp','')[:19]
    name = e.get('event','?')
    props = e.get('properties') or {}
    role = props.get('role') or props.get('\$lib','')
    print(f'  {ts}  {name:<32}  {role}')
"
}

cmd_latest() {
  local hours="${1:-1}"
  local after; after=$(python3 -c "from datetime import datetime, timedelta, timezone; print((datetime.now(timezone.utc) - timedelta(hours=$hours)).isoformat())")
  curl -s "${AUTH[@]}" \
    "$HOST/api/projects/$PROJECT/events/?after=$after&limit=30" \
    | python3 -c "
import json, sys
d = json.load(sys.stdin)
if 'detail' in d: print('ERROR:', d['detail']); sys.exit(1)
results = d.get('results', [])
print(f'Last $hours hour: {len(results)} events')
for e in results:
    ts = e.get('timestamp','')[:19]
    name = e.get('event','?')
    user = e.get('distinct_id','?')[:8]
    print(f'  {ts}  {name:<32}  user={user}')
"
}

cmd_user() {
  local user_id="${1:-}"
  if [[ -z "$user_id" ]]; then echo "ERROR: user <user_id>" >&2; exit 1; fi
  curl -s "${AUTH[@]}" \
    "$HOST/api/projects/$PROJECT/persons/?distinct_id=$user_id" \
    | python3 -c "
import json, sys
d = json.load(sys.stdin)
if 'detail' in d: print('ERROR:', d['detail']); sys.exit(1)
results = d.get('results', [])
for p in results:
    print(f'id: {p.get(\"id\")}')
    print(f'name: {p.get(\"name\",\"?\")}')
    print(f'created_at: {p.get(\"created_at\")}')
    print(f'properties: {json.dumps(p.get(\"properties\",{}), indent=2)[:400]}')
"
}

cmd_counts() {
  local hours="${1:-24}"
  local after; after=$(python3 -c "from datetime import datetime, timedelta, timezone; print((datetime.now(timezone.utc) - timedelta(hours=$hours)).isoformat())")
  curl -s "${AUTH[@]}" \
    "$HOST/api/projects/$PROJECT/events/?after=$after&limit=500" \
    | python3 -c "
import json, sys
from collections import Counter
d = json.load(sys.stdin)
if 'detail' in d: print('ERROR:', d['detail']); sys.exit(1)
c = Counter(e.get('event','?') for e in d.get('results', []))
print(f'Event counts last $hours h:')
for name, cnt in c.most_common(30):
    print(f'  {cnt:>4}  {name}')
"
}

case "${1:-}" in
  events)   cmd_events "${2:-}" "${3:-24}" ;;
  latest)   cmd_latest "${2:-1}" ;;
  user)     cmd_user "${2:-}" ;;
  counts)   cmd_counts "${2:-24}" ;;
  project)  cmd_project ;;
  ""|help|-h|--help)
    grep -E "^#" "$0" | sed 's/^# \?//'
    ;;
  *)
    echo "Bilinmeyen komut: $1" >&2
    echo "Kullanım: $0 [project|latest|events|user|counts|help]" >&2
    exit 1
    ;;
esac

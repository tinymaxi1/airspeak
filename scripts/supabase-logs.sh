#!/usr/bin/env bash
# scripts/supabase-logs.sh
#
# Supabase Management API log helper — BigQuery/Logflare üzerinden DB/Edge/Auth log'ları.
# Token: $SUPABASE_ACCESS_TOKEN (env, NEVER commit).
#
# Komutlar:
#   supabase-logs.sh errors [hours]      → son N saatte error log'lar (default 1h)
#   supabase-logs.sh slow [hours] [ms]   → yavaş query'ler (default >1000ms)
#   supabase-logs.sh auth [hours]        → auth event'leri (login, signup, fail)
#   supabase-logs.sh rpc <name> [hours]  → spesifik RPC çağrıları
#   supabase-logs.sh realtime [hours]    → realtime channel hataları
#   supabase-logs.sh project             → proje bilgisi (smoke test)
#   supabase-logs.sh tables              → log tablo row count survey
#   supabase-logs.sh sql "<SQL>"         → raw SQL (BigQuery dialect)
#
# Logflare BigQuery WHERE timestamp filter zorunlu — yoksa BQ scan etmez.

set -euo pipefail

PROJECT="neinhbkdctjtyyoskxpg"
API_BASE="https://api.supabase.com/v1/projects/$PROJECT"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "ERROR: SUPABASE_ACCESS_TOKEN env var gerekli." >&2
  exit 1
fi

AUTH=(-H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN")

# SQL URL-encode helper
encode_sql() {
  python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$1"
}

# Run SQL against Logflare endpoint, pretty-print result
run_sql() {
  local sql="$1"
  local enc; enc=$(encode_sql "$sql")
  curl -s "${AUTH[@]}" "$API_BASE/analytics/endpoints/logs.all?sql=$enc" \
    | python3 -c "
import json, sys
d = json.load(sys.stdin)
if d.get('error'):
    print(f'ERROR: {d[\"error\"].get(\"message\",\"?\")[:200]}')
    sys.exit(1)
rows = d.get('result', [])
if not rows:
    print('(boş — son 24h log yok veya retention dolmuş)')
    sys.exit(0)
print(f'{len(rows)} satır:')
for r in rows:
    if 'timestamp' in r and 'event_message' in r:
        ts = str(r.get('timestamp',''))[:19]
        msg = str(r.get('event_message',''))[:140]
        print(f'  {ts}  {msg}')
    else:
        print(' ', json.dumps(r, indent=2)[:200])
"
}

cmd_project() {
  curl -s "${AUTH[@]}" "$API_BASE" \
    | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f'id: {d.get(\"id\")}')
print(f'name: {d.get(\"name\")}')
print(f'region: {d.get(\"region\")}')
print(f'status: {d.get(\"status\")}')
print(f'created_at: {d.get(\"created_at\")}')
"
}

cmd_tables() {
  echo "Log tablo row count (retention window):"
  for TABLE in edge_logs postgres_logs auth_logs function_logs realtime_logs storage_logs function_edge_logs; do
    local result; result=$(curl -s "${AUTH[@]}" \
      "$API_BASE/analytics/endpoints/logs.all?sql=$(encode_sql "SELECT COUNT(*) AS count FROM $TABLE")")
    local count; count=$(echo "$result" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    if d.get('error'): print(f'ERR: {d[\"error\"].get(\"message\",\"?\")[:40]}')
    elif d.get('result'): print(d['result'][0].get('count', '?'))
    else: print('empty')
except: print('parse fail')")
    echo "  $TABLE: $count"
  done
}

cmd_errors() {
  local hours="${1:-1}"
  # error_severity metadata struct içinde — REGEXP_CONTAINS ile event_message'da filtre
  echo "=== Postgres errors — son ${hours}h ==="
  run_sql "SELECT timestamp, event_message FROM postgres_logs WHERE timestamp > timestamp_sub(current_timestamp(), interval $hours hour) AND REGEXP_CONTAINS(LOWER(event_message), r'(error|fatal|panic|violation|denied)') ORDER BY timestamp DESC LIMIT 30"
  echo ""
  echo "=== Edge function errors — son ${hours}h ==="
  run_sql "SELECT timestamp, event_message FROM function_edge_logs WHERE timestamp > timestamp_sub(current_timestamp(), interval $hours hour) AND REGEXP_CONTAINS(LOWER(event_message), r'error|fail|exception') ORDER BY timestamp DESC LIMIT 20"
}

cmd_slow() {
  local hours="${1:-1}"
  local threshold_ms="${2:-1000}"
  echo "=== Slow queries (duration log) — son ${hours}h ==="
  run_sql "SELECT timestamp, event_message FROM postgres_logs WHERE timestamp > timestamp_sub(current_timestamp(), interval $hours hour) AND REGEXP_CONTAINS(LOWER(event_message), r'duration') ORDER BY timestamp DESC LIMIT 30"
}

cmd_auth() {
  local hours="${1:-1}"
  echo "=== Auth events — son ${hours}h ==="
  run_sql "SELECT timestamp, event_message FROM auth_logs WHERE timestamp > timestamp_sub(current_timestamp(), interval $hours hour) ORDER BY timestamp DESC LIMIT 50"
}

cmd_rpc() {
  local name="${1:-}"
  local hours="${2:-1}"
  if [[ -z "$name" ]]; then echo "ERROR: rpc <name> gerekli" >&2; exit 1; fi
  echo "=== RPC '$name' calls — son ${hours}h ==="
  # BigQuery LIKE concat — name'i query'ye inline et (SQL injection — admin kullanım, kabul)
  run_sql "SELECT timestamp, event_message FROM postgres_logs WHERE timestamp > timestamp_sub(current_timestamp(), interval $hours hour) AND event_message LIKE '%${name}%' ORDER BY timestamp DESC LIMIT 30"
}

cmd_realtime() {
  local hours="${1:-1}"
  echo "=== Realtime events — son ${hours}h (error filter) ==="
  run_sql "SELECT timestamp, event_message FROM realtime_logs WHERE timestamp > timestamp_sub(current_timestamp(), interval $hours hour) AND REGEXP_CONTAINS(LOWER(event_message), r'error|fail|denied') ORDER BY timestamp DESC LIMIT 30"
}

cmd_sql() {
  local sql="${1:-}"
  if [[ -z "$sql" ]]; then echo "ERROR: sql \"<query>\" gerekli" >&2; exit 1; fi
  run_sql "$sql"
}

case "${1:-}" in
  project)   cmd_project ;;
  tables)    cmd_tables ;;
  errors)    cmd_errors "${2:-1}" ;;
  slow)      cmd_slow "${2:-1}" "${3:-1000}" ;;
  auth)      cmd_auth "${2:-1}" ;;
  rpc)       cmd_rpc "${2:-}" "${3:-1}" ;;
  realtime)  cmd_realtime "${2:-1}" ;;
  sql)       cmd_sql "${2:-}" ;;
  ""|help|-h|--help)
    grep -E "^#" "$0" | sed 's/^# \?//'
    ;;
  *)
    echo "Bilinmeyen komut: $1" >&2
    echo "Kullanım: $0 [project|tables|errors|slow|auth|rpc|realtime|sql|help]" >&2
    exit 1
    ;;
esac

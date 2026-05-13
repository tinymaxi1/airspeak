#!/usr/bin/env bash
# scripts/asc-helper.sh
#
# Apple App Store Connect API helper (JWT auth, ES256).
#
# Env vars:
#   ASC_KEY_ID     örn 76P9F3T6Z6
#   ASC_ISSUER_ID  örn 464c9ef0-00d2-4f0e-83d7-38c372794dad
#   ASC_KEY_PATH   .p8 dosya path
#
# Komutlar:
#   asc apps                    → tüm app'ler
#   asc builds [limit]          → son N build (default 10)
#   asc latest                  → en son build durumu (audience + processing state)
#   asc build <build_id>        → build detayı (TestFlight bilgisi dahil)
#   asc testflight              → TestFlight processing/ready durumu
#   asc beta-groups             → TestFlight beta gruplar
#   asc beta-testers <group_id> → grup tester listesi
#   asc reviews                 → App Store kullanıcı yorumları
#   asc versions                → App Store version'lar (release durumu)
#   asc raw <path>              → ham API çağrısı (path örn: /v1/apps)
#
# JWT scriptine bağlı: scripts/asc-jwt.mjs

set -euo pipefail

APP_ID="6766981661"
API="https://api.appstoreconnect.apple.com"
JWT_SCRIPT="$(dirname "$0")/asc-jwt.mjs"

if [[ -z "${ASC_KEY_ID:-}" || -z "${ASC_ISSUER_ID:-}" || -z "${ASC_KEY_PATH:-}" ]]; then
  echo "ERROR: ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH env vars gerekli." >&2
  exit 1
fi

JWT=$(node "$JWT_SCRIPT")
AUTH=(-H "Authorization: Bearer $JWT")

# URL-encode helper (Python)
encode() { python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$1"; }

cmd_apps() {
  curl -s "${AUTH[@]}" "$API/v1/apps" | python3 -c "
import json, sys
d = json.load(sys.stdin)
for a in d.get('data', []):
    at = a.get('attributes', {})
    print(f'{a[\"id\"]:<14} {at.get(\"name\",\"?\"):<30} {at.get(\"bundleId\",\"?\")} sku={at.get(\"sku\",\"?\")}')
"
}

cmd_builds() {
  local limit="${1:-10}"
  curl -s "${AUTH[@]}" "$API/v1/builds?filter%5Bapp%5D=$APP_ID&limit=$limit" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f'{len(d.get(\"data\", []))} build:')
for b in d.get('data', []):
    at = b.get('attributes', {})
    print(f'  build {at.get(\"version\",\"?\"):<5} | state={at.get(\"processingState\",\"?\"):<10} | audience={at.get(\"buildAudienceType\",\"?\"):<20} | uploaded={(at.get(\"uploadedDate\") or \"?\")[:19]} | id={b.get(\"id\")}')
"
}

cmd_latest() {
  curl -s "${AUTH[@]}" "$API/v1/builds?filter%5Bapp%5D=$APP_ID&limit=1" | python3 -c "
import json, sys
d = json.load(sys.stdin)
b = (d.get('data') or [None])[0]
if not b: print('No build'); sys.exit(0)
at = b.get('attributes', {})
print(f'build: {at.get(\"version\")}')
print(f'state: {at.get(\"processingState\")}')
print(f'audience: {at.get(\"buildAudienceType\")}')
print(f'uploaded: {at.get(\"uploadedDate\")}')
print(f'expires: {at.get(\"expirationDate\")}')
print(f'expired: {at.get(\"expired\")}')
print(f'minOS: {at.get(\"minOsVersion\")}')
print(f'id: {b.get(\"id\")}')
"
}

cmd_build() {
  local id="${1:-}"
  if [[ -z "$id" ]]; then echo "ERROR: build <id>" >&2; exit 1; fi
  curl -s "${AUTH[@]}" "$API/v1/builds/$id" | python3 -m json.tool | head -60
}

cmd_testflight() {
  # Build'ler + buildBetaDetail include
  curl -s "${AUTH[@]}" "$API/v1/builds?filter%5Bapp%5D=$APP_ID&limit=10&include=buildBetaDetail,betaAppReviewSubmission" | python3 -c "
import json, sys
d = json.load(sys.stdin)
included = {f'{i[\"type\"]}_{i[\"id\"]}': i for i in d.get('included', [])}
print('TestFlight Builds:')
for b in d.get('data', []):
    at = b.get('attributes', {})
    rel = b.get('relationships', {})
    bbd_id = (rel.get('buildBetaDetail', {}).get('data') or {}).get('id')
    bbd = included.get(f'buildBetaDetails_{bbd_id}') if bbd_id else None
    bbd_at = (bbd or {}).get('attributes', {})
    review_state = bbd_at.get('externalBuildState','?')
    internal_state = bbd_at.get('internalBuildState','?')
    print(f'  build {at.get(\"version\",\"?\"):<5} | processing={at.get(\"processingState\",\"?\"):<10} | internal={internal_state:<22} | external={review_state}')
"
}

cmd_beta_groups() {
  curl -s "${AUTH[@]}" "$API/v1/apps/$APP_ID/betaGroups" | python3 -c "
import json, sys
d = json.load(sys.stdin)
for g in d.get('data', []):
    at = g.get('attributes', {})
    print(f'  {g[\"id\"]} | {at.get(\"name\")} | public={at.get(\"isInternalGroup\",\"?\")} | created={(at.get(\"createdDate\") or \"?\")[:10]}')
"
}

cmd_beta_testers() {
  local gid="${1:-}"
  if [[ -z "$gid" ]]; then echo "ERROR: beta-testers <group_id>" >&2; exit 1; fi
  curl -s "${AUTH[@]}" "$API/v1/betaGroups/$gid/betaTesters" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f'{len(d.get(\"data\", []))} tester:')
for t in d.get('data', []):
    at = t.get('attributes', {})
    print(f'  {at.get(\"firstName\",\"\")} {at.get(\"lastName\",\"\")} <{at.get(\"email\",\"?\")}> state={at.get(\"state\",\"?\")}')
"
}

cmd_reviews() {
  curl -s "${AUTH[@]}" "$API/v1/apps/$APP_ID/customerReviews?limit=20&sort=-createdDate" | python3 -c "
import json, sys
d = json.load(sys.stdin)
reviews = d.get('data', [])
print(f'{len(reviews)} review:')
for r in reviews:
    at = r.get('attributes', {})
    print(f'  ★{at.get(\"rating\",\"?\")} {(at.get(\"createdDate\") or \"?\")[:10]} {at.get(\"reviewerNickname\",\"?\")}: {(at.get(\"title\") or \"\")[:60]}')
"
}

cmd_versions() {
  curl -s "${AUTH[@]}" "$API/v1/apps/$APP_ID/appStoreVersions?limit=10" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f'{len(d.get(\"data\", []))} version:')
for v in d.get('data', []):
    at = v.get('attributes', {})
    print(f'  {at.get(\"versionString\",\"?\"):<8} | state={at.get(\"appStoreState\",\"?\"):<24} | platform={at.get(\"platform\",\"?\"):<6} | released={(at.get(\"releaseType\") or \"?\")}')
"
}

cmd_raw() {
  local path="${1:-}"
  if [[ -z "$path" ]]; then echo "ERROR: raw <path>" >&2; exit 1; fi
  curl -s "${AUTH[@]}" "$API$path" | python3 -m json.tool | head -80
}

case "${1:-}" in
  apps)         cmd_apps ;;
  builds)       cmd_builds "${2:-10}" ;;
  latest)       cmd_latest ;;
  build)        cmd_build "${2:-}" ;;
  testflight)   cmd_testflight ;;
  beta-groups)  cmd_beta_groups ;;
  beta-testers) cmd_beta_testers "${2:-}" ;;
  reviews)      cmd_reviews ;;
  versions)     cmd_versions ;;
  raw)          cmd_raw "${2:-}" ;;
  ""|help|-h|--help)
    grep -E "^#" "$0" | sed 's/^# \?//'
    ;;
  *)
    echo "Bilinmeyen komut: $1" >&2
    echo "Kullanım: $0 [apps|builds|latest|build|testflight|beta-groups|beta-testers|reviews|versions|raw|help]" >&2
    exit 1
    ;;
esac

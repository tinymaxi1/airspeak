#!/usr/bin/env bash
# scripts/elevenlabs-helper.sh — ElevenLabs API yardımcı.
#
# Token: $ELEVENLABS_API_KEY env (NEVER commit).
#
# Komutlar:
#   voices                       → ses listesi
#   quota                        → kalan karakter
#   generate <text> [voice_id]   → tek metin → mp3 dosya (cwd'ye yazar)
#   batch-words [--dry-run]      → word_of_the_day kayıtları için karakter sayar (dry-run)

set -euo pipefail

API="https://api.elevenlabs.io/v1"
DEFAULT_VOICE="pNInz6obpgDQGcFmaJgB"  # Adam

if [[ -z "${ELEVENLABS_API_KEY:-}" ]]; then
  echo "ERROR: ELEVENLABS_API_KEY env gerekli" >&2
  exit 1
fi

AUTH=(-H "xi-api-key: $ELEVENLABS_API_KEY")

cmd_quota() {
  curl -s "${AUTH[@]}" "$API/user/subscription" | python3 -c "
import json, sys
d = json.load(sys.stdin)
used = d.get('character_count', 0)
lim = d.get('character_limit', 0)
print(f'Plan: {d.get(\"tier\",\"?\")}')
print(f'Kullanılan: {used:,} / {lim:,}')
print(f'Kalan: {lim - used:,} karakter')
"
}

cmd_voices() {
  curl -s "${AUTH[@]}" "$API/voices" | python3 -c "
import json, sys
d = json.load(sys.stdin)
for v in d.get('voices', [])[:20]:
    print(f'  {v[\"voice_id\"]} {v.get(\"name\",\"?\"):<20} category={v.get(\"category\",\"?\")}')
"
}

cmd_generate() {
  local text="${1:-}"
  local voice="${2:-$DEFAULT_VOICE}"
  if [[ -z "$text" ]]; then echo "ERROR: generate <text> [voice_id]" >&2; exit 1; fi
  local chars=${#text}
  echo "Karakter: $chars (kotadan düşecek)"
  local out="elevenlabs-$(date +%s).mp3"
  local payload; payload=$(mktemp)
  TEXT="$text" python3 -c "import json,os; print(json.dumps({'text':os.environ['TEXT'],'model_id':'eleven_multilingual_v2','voice_settings':{'stability':0.5,'similarity_boost':0.75}}))" > "$payload"
  curl -s "${AUTH[@]}" -H "Content-Type: application/json" -H "Accept: audio/mpeg" \
    -X POST "$API/text-to-speech/$voice" \
    --data-binary "@$payload" \
    -o "$out"
  rm -f "$payload"
  echo "✓ Yazıldı: $out ($(wc -c < "$out") byte)"
}

cmd_batch_words() {
  local dry="${1:-}"
  if [[ "$dry" != "--dry-run" ]]; then
    echo "❌ Şu an sadece --dry-run desteği (Pro plan öncesi karakter koruma)" >&2
    echo "Kullanım: batch-words --dry-run" >&2
    exit 1
  fi
  echo "Word of Day kayıtları taranıyor (DB'den, dry-run)..."
  echo "TODO: supabase db query --linked ile word_or_phrase + example_en topla"
  echo "      Karakter toplamı hesapla — Pro plan upgrade öncesi karar"
}

case "${1:-}" in
  voices)      cmd_voices ;;
  quota)       cmd_quota ;;
  generate)    cmd_generate "${2:-}" "${3:-}" ;;
  batch-words) cmd_batch_words "${2:-}" ;;
  ""|help|-h|--help)
    grep -E "^#" "$0" | sed 's/^# \?//'
    ;;
  *)
    echo "Bilinmeyen komut: $1" >&2
    exit 1
    ;;
esac

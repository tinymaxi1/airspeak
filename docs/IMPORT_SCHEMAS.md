# Bulk Import — JSON Şemaları

Admin panelinde `Bulk Import` sayfasından (`/import`) JSON dosyası yükleyerek toplu içerik aktarımı yapılır.

## Genel Kurallar

- **Dosya formatı:** Top-level JSON array. `[{...}, {...}, ...]`
- **Maksimum:** 5 MB · 5000 satır
- **Yetki:** sadece `super_admin`
- **Status:** Tüm satırlar **draft** olarak eklenir. Yayına almak için sonradan manuel publish gerekir.
- **Yasak alanlar (payload'da OLMAMALI):**
  - `slug` — server otomatik üretir
  - `status` — her satır otomatik `'draft'`
- **Akış:** Önce **Doğrula** butonu (dry-run, DB'ye yazmaz) → hatalar düzeltilir → **İçeri aktar** butonu (atomik bulk insert)

## Validation

Her satır Zod ile doğrulanır. Hata raporunda:
- `row`: 0-tabanlı satır indeksi (1-tabanlı UI'da gösterilir)
- `message`: özet hata
- `detail`: alan-yol + mesaj

Tek satırda bile hata varsa **hiçbir satır yazılmaz** (atomik).

---

## 1. `vocab_terms` — Kelime Terimleri

**Required:** `term`

```json
[
  {
    "role": "pilot",
    "category": "cockpit",
    "term": "squawk",
    "term_tr": "transponder kodu girmek",
    "ipa": "/skwɒk/",
    "pos": "verb",
    "definition": "To enter a transponder code as instructed by ATC.",
    "definition_tr": "ATC talimatıyla transponder koduna girmek.",
    "example": "Turkish 1, squawk 7421.",
    "example_tr": "Turkish 1, 7421 squawk yap.",
    "difficulty": 2,
    "audio_url": null,
    "tags": ["atc", "comm"],
    "is_premium": false
  }
]
```

**Enum'lar:**
- `role`: `pilot | cabin | technician | ground | student | all` (default `all`)
- `difficulty`: 1-5 (default 2)

---

## 2. `oral_prompts` — Sözlü Sınav Promptları

**Required:** `task_type`, `level`

```json
[
  {
    "task_type": "picture_description",
    "level": "B2",
    "prompt": "Describe what you see in this image.",
    "prompt_tr": "Bu görselde ne görüyorsun?",
    "cues_tr": ["Hava durumu", "Pist durumu", "Uçak konumu"],
    "vocabulary_tr": ["runway", "weather", "approach"],
    "image_url": null,
    "preparation_seconds": 30,
    "speaking_seconds": 90
  }
]
```

**Enum'lar:**
- `task_type`: `picture_description | story_telling | problem_solving | common_topics`
- `level`: `B1 | B2 | B2+ | C1`

---

## 3. `icao4_questions` — ICAO 4 Soruları

**Required:** `set_no`, `section`, `level`, `question`, `options` (4 adet), `correct_id`

```json
[
  {
    "set_no": 1,
    "section": "vocabulary",
    "level": "B2",
    "question": "The pilot decided to ___ takeoff because of a warning light.",
    "question_tr": null,
    "context": null,
    "audio_url": null,
    "options": [
      { "id": "a", "text": "reject" },
      { "id": "b", "text": "cancel" },
      { "id": "c", "text": "delay" },
      { "id": "d", "text": "postpone" }
    ],
    "correct_id": "a",
    "explanation_tr": "Reject takeoff (RTO) standart havacılık terimidir."
  }
]
```

**Enum'lar:**
- `set_no`: 1-5
- `section`: `vocabulary | phraseology | listening | reading | grammar | critical`
- `level`: `B1 | B2 | B2+ | C1`

**Constraint'ler:**
- `options` tam 4 satır olmalı
- `correct_id` `options` içinde mevcut olmalı
- `section='listening'` ve published yapılırsa `audio_url` zorunlu (DB constraint)

---

## 4. `placement_questions` — Placement Test Soruları

**Required:** `dimension`, `level`, `question`, `options` (4), `correct_id`

```json
[
  {
    "dimension": "aviation_english",
    "level": "B2",
    "category": "phraseology",
    "format": "short",
    "roles": ["pilot", "all"],
    "question": "What does 'squawk 7700' indicate?",
    "question_tr": null,
    "context": null,
    "options": [
      { "id": "a", "text": "Emergency" },
      { "id": "b", "text": "Hijack" },
      { "id": "c", "text": "Radio failure" },
      { "id": "d", "text": "VIP flight" }
    ],
    "correct_id": "a",
    "weight": 2
  }
]
```

**Enum'lar:**
- `dimension`: `general_english | aviation_english | aviation_knowledge | communication`
- `level`: `A1 | A2 | B1 | B2 | C1`
- `format`: `short | passage | scenario` (default `short`)
- `roles`: array, `pilot/cabin/technician/ground/student/all` (default `["all"]`)

**Constraint'ler:**
- `format='passage'` veya `format='scenario'` published yapılırsa `context` zorunlu (DB constraint)
- `weight`: 1-5 (default 1, puanlama ağırlığı)

---

## 5. `scenarios` — AI Senaryolar

**Required:** `category`, `title`

```json
[
  {
    "role": "pilot",
    "category": "atc",
    "title": "Holding pattern at VECON",
    "title_tr": "VECON üzerinde holding",
    "setup": "Turkish 1453 in holding pattern at FL240, expecting clearance.",
    "setup_tr": "Turkish 1453, FL240'da holding'de, clearance bekliyor.",
    "initial_message": "Turkish 1453, hold at VECON as published.",
    "goal": "Read back the holding clearance correctly.",
    "goal_tr": "Holding clearance'ı doğru read-back yap.",
    "difficulty": 3,
    "estimated_minutes": 5,
    "is_premium": false,
    "audio_intro_url": null
  }
]
```

**Enum'lar:**
- `role`: `pilot | cabin | technician | ground | student | all` (default `all`)
- `category`: `atc | cabin_emergency | maintenance_call | gate_announcement | pre_flight | post_flight | irrops | medical | security`
- `difficulty`: 1-5 (default 3)
- `estimated_minutes`: int ≥ 1 (default 5)

> Branching dialog turns (cevap tree'si) bu tabloda yok — Sprint 5 AI conversation entegrasyonunda eklenecek.

---

## 6. `exercises` — Egzersizler

**Required:** `lesson_slug`, `sort`, `type`

```json
[
  {
    "lesson_slug": "pilot_basics_lesson_1",
    "sort": 0,
    "type": "vocab-mc",
    "vocab_term_slug": null,
    "prompt": "What does 'squawk' mean?",
    "prompt_tr": "'Squawk' ne demek?",
    "context": null,
    "context_tr": null,
    "options": [
      { "id": "a", "text": "Transponder kodu girmek" },
      { "id": "b", "text": "Pilot komutu" },
      { "id": "c", "text": "Pist temizliği" },
      { "id": "d", "text": "Yakıt seviyesi" }
    ],
    "correct_id": "a",
    "alt_correct_ids": null,
    "explanation": null,
    "explanation_tr": "Squawk = transponder kodu ayarla.",
    "detailed_explanation_tr": null,
    "audio_url": null,
    "image_url": null,
    "difficulty": 2
  }
]
```

**Özel notlar:**
- `lesson_slug` payload'da **zorunlu** — server bu slug'ı `lessons` tablosunda arar, `lesson_id`'ye çevirir. Bulunamazsa hata.
- `vocab_term_slug` opsiyonel — verilirse `vocab_terms` tablosunda aranır, `vocab_term_id`'ye çevirir.
- Aynı dosyada birden fazla lesson'a egzersiz dağıtılabilir (her satırın `lesson_slug`'ı farklı olabilir).

**Enum'lar:**
- `type`: `vocab-mc | fill-blank | dialogue-fill | listening-mc | pronunciation-record | match | order | drag-drop | open-text`
- `difficulty`: 1-5 (default 2)

---

## Hata Mesajları

| Mesaj | Sebep |
|---|---|
| `Unrecognized key(s) in object: 'slug'` | `slug` payload'da olmamalı |
| `Unrecognized key(s) in object: 'status'` | `status` payload'da olmamalı |
| `Required` veya `... zorunlu` | Required alan eksik |
| `Invalid enum value` | Enum dışı değer |
| `4 şık zorunlu` | `options` tam 4 satır değil |
| `correct_id options içinde olmalı` | Doğru cevap id'si şıklarda yok |
| `lesson_slug bulunamadı: "..."` | `exercises` import'unda DB'de o slug yok |
| `vocab_term_slug bulunamadı: "..."` | `exercises` import'unda DB'de o vocab slug yok |

## Audit

Her import sonunda:
1. **Bireysel** — `audit_content_change` trigger her satıra `'create'` action yazar
2. **Özet** — `log_admin_action('import', table, metadata: { count, source: 'bulk_import' })`

Audit log `/audit` sayfasından görünür.

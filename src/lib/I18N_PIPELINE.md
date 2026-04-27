# AirSpeak i18n & TTS Pipeline

## Mevcut Durum

✅ **Altyapı hazır (Sprint 8)**
- 20 dil locale dosyası (`src/locales/{lang}.json`)
- `i18n.ts` tüm dilleri yükler
- `LocalizedString` tipi additif olarak vocab/exam şemalarına eklenmiş
- RTL desteği (Arapça, Farsça)
- Dil seçici ekranı (`/settings/language`)
- `tts.ts` soyutlama katmanı (stub)

⏳ **Yapılacak (Sprint 9-10)**
- 18 dil için UI string çevirisi (`{lang}.json` placeholder → real translations)
- Vocab/exam içeriği lokalizasyonu (`i18n.term`, `i18n.definition` doldurma)
- TTS ile ses üretimi (her dilde)

---

## Çeviri Hacmi

| Kategori | Adet | × 18 dil | Karakter (~) |
|---|---|---|---|
| UI string | 142 | 2,556 | 90,000 |
| Vocab terim | 1,300 | 23,400 | 1,200,000 |
| Vocab tanım | 1,300 | 23,400 | 3,500,000 |
| Vocab örnek cümle (5) | 6,500 | 117,000 | 8,000,000 |
| Mülakat sorusu | 155 | 2,790 | 800,000 |
| Mülakat cevap | 155 | 2,790 | 1,200,000 |
| Havayolu profil | 31 | 558 | 200,000 |
| Knowledge base (top 8) | 8 | 144 | 400,000 |
| **TOPLAM** | | | **~15M karakter** |

---

## Çeviri Maliyet Tahmini

| Sağlayıcı | Birim | Toplam (~15M char) |
|---|---|---|
| **Claude Sonnet 4.5 batch** | $3 / 1M tokens (~$1 / 250K char) | **$60** |
| GPT-4o batch | $2.5 / 1M | $50 |
| DeepL Pro API | $25 / 1M chars | $375 |
| Google Translate | $20 / 1M chars | $300 |

**Önerim: Claude Sonnet batch + dile özel quality check.**

---

## Pipeline Adımları (Sprint 9)

### 1. UI Strings (`src/locales/{lang}.json`)

```bash
# Her dil için:
node scripts/translate-ui.js --target ar
node scripts/translate-ui.js --target de
# ... 18 dil
```

**Claude prompt template:**
```
You are a professional translator specializing in aviation industry.
Source: English UI strings for "AirSpeak" — an aviation English learning app.
Target: {target_language}

Rules:
1. Preserve {{variables}} exactly (interpolation)
2. Aviation terminology: ICAO standard ({target_language} resmi havacılık terimi)
3. Keep tone: professional + warm (like an experienced cabin crew)
4. Length: ±20% of source (UI design constraint)
5. Cultural sensitivity: NO political content; aviation neutral

Source JSON:
{source_json}

Output JSON only, same structure.
```

### 2. Vocab Content (`src/features/lessons/seed/*.ts`)

Her vocab term için `i18n` alanı doldur:

```ts
{
  id: 'voc_pilot_001',
  term: 'cockpit',
  termTr: 'kokpit',
  // ... legacy fields
  i18n: {
    term: {
      ar: 'قمرة القيادة',
      de: 'Cockpit',
      fr: 'cockpit',
      es: 'cabina de mando',
      // ... 14 daha
    },
    definition: { /* ... */ },
    examples: { /* ... */ },
  },
}
```

**Batch script:**
```typescript
// scripts/translate-vocab.ts
import { Anthropic } from '@anthropic-ai/sdk';
import { PILOT_VOCAB_FAZ1 } from '@/features/lessons/seed/pilotVocab';

const targetLangs = ['ar','fa','de','fr','es','it','pt','nl','pl','el','zh','ja','ko','hi','id','th','ms','ru'];

for (const term of PILOT_VOCAB_FAZ1) {
  const i18n = await translateBatch(term, targetLangs);
  // ... write back to source
}
```

### 3. Mülakat Soruları (`interviewQuestions.ts`)

Aynı pattern — `question`, `goodAnswerPointsTr`, `redFlagsTr`, `sampleAnswerTr`, `tipsTr` alanlarına `i18n` ekle.

### 4. Quality Check

Her çeviri için:
- ✅ ICAO terminology kontrolü (havacılık otoritesi: target language regs)
- ✅ Length budget (UI bozmasın)
- ✅ RTL diller için manuel sample check (Arabic native review)
- ✅ Aviation native speaker validation (5-10 örnek)

---

## TTS Pipeline (Sprint 10)

### Hangi sağlayıcı?

| Use case | Sağlayıcı | Sebep |
|---|---|---|
| Premium ses (üretim) | **ElevenLabs Turbo v2.5** | En kaliteli, 29 dil natif voice |
| Batch (vocab) | **Azure Speech** | $0.016 / 1K char — %95 ucuz |
| AI conversation real-time | **Cartesia Sonic** | <100ms latency |
| Backup | **OpenAI TTS** | Stable |

### Üretim sırası
1. **EN + TR** önce (mevcut pazar) — ~50K karakter, $15
2. **AR + DE + FR + ES** (Gulf + Avrupa) — 200K char, $60
3. **Diğer 14 dil** — 500K char, $150 (Azure batch ile)

**Toplam TTS one-time: ~$225** (15M char x mix providers, Azure ağırlıklı batch için).

### Voice eşleme

```ts
// src/lib/voiceMap.ts
const VOICE_MAP: Record<Locale, Record<TtsVoice, string>> = {
  en: {
    'atc-controller': 'EXAVITQu4vr4xnSDxMaL',  // ElevenLabs ID
    'cabin-crew':     '21m00Tcm4TlvDq8ikWAM',
    'pilot-captain':  'pNInz6obpgDQGcFmaJgB',
  },
  ar: { /* ... */ },
  // ...
};
```

---

## CI/CD

`.github/workflows/i18n-check.yml`:
- Her PR'da `LOCALE_COVERAGE` minimum %80 (en+tr)
- Yeni `t()` çağrılarında EN string MUTLAKA olsun
- Locale JSON'larında orphan key uyarısı

---

## Roadmap

| Tarih | Görev | Durum |
|---|---|---|
| Sprint 8 (mevcut) | Altyapı kurulumu | ✅ |
| Sprint 9 | UI strings 18 dilde (Claude pipeline) | ⏳ |
| Sprint 9 | Vocab + exam içeriği EN/TR/AR/DE | ⏳ |
| Sprint 10 | TTS — EN/TR ses üretimi | ⏳ |
| Sprint 11 | Geri kalan 14 dilde içerik | ⏳ |
| Sprint 12 | Native speaker review (5 dil critical) | ⏳ |
| Sprint 13 | TTS — diğer 18 dilde batch | ⏳ |

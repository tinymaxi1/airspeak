# AirSpeak İçerik Üretim Pipeline

Plan'daki Sprint 9 — **Claude batch ile büyük ölçek içerik üretim**.

## Hedef

- **151 mülakat sorusunun `detailedExplanationTr`** (300-500 kelime)
- **1297 vocab teriminin `richDefinitionTr`** (200-400 kelime)
- **5 kalan placement long açıklama** (zaten 22/22 tamam)

## Provider seçenekleri

### 🌟 Seçenek 1 — Gemini Free (TAVSİYE EDİLEN, ücretsiz)

| Limit | Gemini 2.0 Flash Free |
|---|---|
| RPM | 15 |
| Günlük | 1500 req |
| Maliyet | **$0** |
| Kart sormuyor mu | ✅ Sadece Google hesap |

```bash
# 1. https://aistudio.google.com → "Get API Key"
# 2. .env'e ekle
echo "GEMINI_API_KEY=AIza..." >> .env
```

### Seçenek 2 — Anthropic Claude (ücretli)

| İş | Token (~) | Claude Sonnet 4.5 ücreti |
|---|---|---|
| 151 mülakat × 1200 token | 181K | ~$0.40 |
| 1297 vocab × 800 token | 1M | ~$3 |
| **Toplam** | **~1.2M** | **~$3.5** |

```bash
# 1. https://console.anthropic.com → kart ekle ($5+ kredi)
# 2. .env'e ekle
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

**Otomatik seçim**: Provider GEMINI_API_KEY varsa onu, yoksa ANTHROPIC_API_KEY kullanır.

## Kullanım

```bash
# Mülakat sorularına detailedExplanationTr üret
npm run content:interview-detailed

# Vocab terimlere richDefinitionTr üret
npm run content:vocab-rich

# Hepsini sırayla
npm run content:all

# Resume (yarıda kaldıysa)
npm run content:resume
```

## Çalışma prensibi

1. **Source scan**: `interviewQuestions.ts` ve `vocab/seed/*.ts` dosyalarını oku
2. **Filter**: `detailedExplanationTr` veya `richDefinitionTr` olmayan kayıtları bul
3. **Generate**: Her kayıt için Claude'a prompt gönder, 6-katmanlı/5-katmanlı yapıda cevap iste
4. **Save**: `scripts/content/output/{type}-{date}.json` dosyasına yaz (resume için)
5. **Inject**: `npm run content:inject` ile output JSON'u kaynak dosyaya enjekte et

## Rate limit + güvenlik

- Anthropic API tier 1: 50 req/dk → 1 req/1.2 sn = güvenli
- Her 10 üretimde bir checkpoint (output JSON kaydet)
- Crash recovery: yarıda kalırsa son checkpoint'ten devam
- Maliyet kontrolü: her batch sonrası kullanım rapor

## Dosya yapısı

```
scripts/content/
├── README.md                  (bu dosya)
├── prompts.ts                 (placement/interview/vocab prompt templates)
├── providers.ts               (Anthropic client wrapper)
├── generate.ts                (main orchestrator)
├── inject.ts                  (output → kaynak dosya enjeksiyonu)
└── output/                    (üretilen içerik, gitignore'da)
    ├── interview-2026-04-28.json
    └── vocab-2026-04-28.json
```

## Quality check

Üretildikten sonra:

```bash
# Manuel inceleme — random 10 örnek
npm run content:sample

# 6-katmanlı yapı kontrolü (özet/neden/arka plan/yaygın hata/ilgili terim/örnek)
npm run content:validate
```

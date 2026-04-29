# AirSpeak Çeviri Stratejisi & Notlar

**Son güncelleme:** 2026-04-29
**Durum:** Hibrit pipeline çalışıyor, kotalar tükendi, ek araç değerlendirmesi.

---

## 📊 Mevcut Durum (2026-04-29)

### Aktif araçlar

| Araç | Tier | Aylık limit | Şu an | Kalan |
|---|---|---|---|---|
| **DeepL Free** | Free | 500.000 char | %100 | 0 (1 Mayıs reset) |
| **Argos Translate** | Self-host | Sınırsız | OK | ∞ |
| **Gemini Flash** | Free | 1500 req/gün | Kullanılıyor (içerik üretim) | ~daily |

### Kapsanan diller

| Tier | Diller | Kalite |
|---|---|---|
| **Manuel (orijinal)** | EN, TR | A+ |
| **DeepL Free** | DE, FR, ES, IT, PT, NL, PL, EL, ZH, JA, KO, ID, RU, AR | A |
| **Argos fallback** | FA, HI, TH, MS | B-C (mekanik) |

### Tamamlanmış işler

- ✅ UI strings 20 dil (synced 717 satır × 20)
- ✅ ICAO aviation glossary (manuel verified, hiçbir dile bozulmuyor)
- ✅ Quality check pipeline (`scripts/i18n/quality-check.ts`)

### Yarıda kalanlar

| İçerik | Hacim | Sebep |
|---|---|---|
| Placement-long 22 öğe × 18 dil | ~860K char | Argos ile çevriliyor (~1 saat) |
| Interview-detailed ~205 soru × 18 dil | ~3.9M char | DeepL kotası tükendi |
| Vocab-rich 1297 terim × 18 dil | ~7.2M char | Hiç başlanmadı |

---

## 🎯 Sorun

DeepL Free 500K/ay → bizim ihtiyacımız ~12M karakter. **24 ay sürer**.
Argos kalitesi düşük (özellikle FA/HI/TH/MS).
Gemini Flash içerik üretim için kullanılıyor — çeviri olarak da kullanabilir mi?

---

## 🛠 Çeviri Aracı Karşılaştırma

### A) Google Cloud Translate (En öncelikli ek)

| Özellik | Değer |
|---|---|
| **Free tier** | 500.000 char/ay |
| **Sonrası ücret** | $20 / 1M char |
| **Dil** | 109 dil (DeepL'in 31'inden çok geniş) |
| **TR→EN kalite** | A (DeepL ile yakın) |
| **Aviation terminolojisi** | Glossary support var |
| **Setup süresi** | 5-10 dk (Google Cloud kayıt + API key) |
| **Kart sorar mı** | Evet ama free tier kart kullanmaz |
| **Hibrit DeepL ile** | Direkt çoğaltır → **1M char/ay free** |

**Önerilen sebep:** En kolay setup, en hızlı %100 verim artışı. DeepL Free + Google Free = aylık 1M char.

---

### B) Microsoft Translator (Azure)

| Özellik | Değer |
|---|---|
| **Free tier** | 2.000.000 char/ay (en cömert!) |
| **Sonrası ücret** | $10 / 1M char |
| **Dil** | 135 dil |
| **Aviation terminolojisi** | Custom Translator (özelleştirilebilir) |
| **Setup süresi** | 20-30 dk (Azure subscription, kart gerekli) |
| **Kart sorar mı** | Evet (free tier'da bile) |

**Avantaj:** Tek başına AirSpeak'in tüm aylık ihtiyacını karşılayabilir (2M ≈ vocab-rich tek dil).

**Dezavantaj:** Azure setup karmaşık. Free tier kullansa bile kart talep ediyor.

---

### C) Gemini Flash (mevcut, çeviri için de kullanabiliriz)

| Özellik | Değer |
|---|---|
| **Free tier** | 1500 req/gün × ~1500 token = ~2M token/gün |
| **Maliyet** | $0 (Free) |
| **Dil** | 100+ |
| **TR→EN kalite** | A+ (LLM, context-aware) |
| **Aviation terminolojisi** | **Glossary inject** kabul eder (prompt'ta "şu terimleri çevirme: Mayday, Squawk...") |
| **Hız** | 1-2 sn/req |
| **Avantaj** | Glossary preservation + context awareness |

**En büyük avantaj:** ICAO frazeolojisi prompt-level korunur, DeepL'in hiç yapamayacağı şey. Kalite > DeepL.

**Pratik plan:** Mevcut content pipeline'ı çeviri için de kullan. 1297 vocab × 18 dil = 23K req. Daily 1500 → 16 günde biter. Veya per-language batch ile 20 günde tüm vocab.

---

### D) Anthropic Claude Haiku 4.5 (ücretli, önerilen)

| Özellik | Değer |
|---|---|
| **Maliyet** | $0.25 input / $1.25 output (1M token) |
| **Dil** | 100+ |
| **Kalite** | A+ (en iyi context-awareness) |
| **Aviation terminolojisi** | Glossary + prompt context inject |
| **Toplam tahmini maliyet** | ~$5-8 (tüm AirSpeak içeriği) |
| **Setup** | 5 dk (console.anthropic.com) |
| **Kart** | Gerekli ($5+ kredi yatır) |

**Hesap:**
- Interview detailed 205 × 1500 token × 18 dil ≈ 5.5M token
- Vocab rich 1297 × 800 token × 18 dil ≈ 18.7M token
- Toplam ≈ 24M token input + 24M token output
- $0.25 × 24 + $1.25 × 24 = **$36** tek seferlik

Beklenmez ama **paranın değdiği seçenek**: kalite > tüm diğerleri.

---

### E) OpenAI GPT-4o mini (ucuz LLM alternatifi)

| Özellik | Değer |
|---|---|
| **Maliyet** | $0.15 input / $0.60 output (1M token) |
| **Toplam tahmini** | ~$18 (Haiku'dan ucuz) |
| **Kalite** | A (Haiku'dan biraz alttan ama iyi) |
| **Setup** | 5 dk + kart ($5 kredi) |

**Önerilen sebep:** Haiku'dan %50 daha ucuz, kalite kabul edilebilir.

---

### F) DeepL Pro (sürdürülebilir Free → Pro upgrade)

| Plan | Aylık | Char | Per char |
|---|---|---|---|
| **Starter** | $7/ay | 1M | $7/M |
| **Advanced** | $25/ay | 5M | $5/M |
| **Ultimate** | $50/ay | Sınırsız | — |

**Önerilen sebep:** Mevcut entegrasyonu bozmadan sadece quota artırır. Aylık $7-25 ile sürdürülebilir.

---

### G) LibreTranslate (self-host, alternatif Argos)

| Özellik | Değer |
|---|---|
| **Maliyet** | $0 (self-host) |
| **Dil** | Argos paketleri (~30 dil) |
| **Kalite** | Argos ile aynı (B-C) |
| **Avantaj** | Mevcut Argos'tan farkı yok |

**Sonuç:** Gerek yok, Argos zaten yapıyor.

---

### H) Hugging Face Inference API (LLM, free tier)

| Özellik | Değer |
|---|---|
| **Free tier** | Limitli (rate-limited, kullanım planına bağlı) |
| **Modeller** | NLLB-200 (200 dil), Llama, Mistral |
| **Kalite** | NLLB orta-iyi, Llama context-aware |
| **Setup** | 5 dk (HF token) |

**Önerilen sebep:** Sadece LLM çeşitlendirme istersen.

---

## 🎯 Önerilen Strateji

### Aşama 1: Hızlı kazanç (bugün, ücretsiz)

**Google Cloud Translate ekle**
- 5 dk setup, 500K/ay free
- DeepL ile paralel kullanım → mevcut quota %200'e çıkar
- Pipeline'a hibrit fallback: DeepL → Google → Argos

```ts
// Yeni layer
async function translateGoogle(texts: string[], target: string): Promise<string[]>
```

### Aşama 2: Kalite + glossary (1-2 gün, ücretsiz)

**Gemini Flash'ı çeviri için kullan**
- Mevcut Gemini API key var
- Aviation glossary prompt-level inject:
  ```
  Çevir: {{text}}
  Diller: {{target_lang}}
  ASLA çevirme (İngilizce kalmalı): Mayday, Squawk, Roger, Wilco, ICAO, ATC...
  ```
- Daily 1500 req: vocab-rich 16 günde, interview-detailed 11 günde
- Kalite > DeepL, ama yavaş

### Aşama 3: Bütçe varsa profesyonel (tek seferlik $30-50)

**Claude Haiku 4.5 batch**
- $36 ile tüm içeriği (placement + interview + vocab) bir günde çevir
- En yüksek kalite (Türkçe nüans, aviation context)
- Cost-effective long-term (yeni içerik için ~$1-2/ay)

### Aşama 4: Sürdürülebilir (aylık $7-25)

**DeepL Pro Starter veya Advanced**
- Mevcut entegrasyon devam, sadece quota büyütür
- Aviation terminolojisi DeepL Glossary feature ile özelleştirilebilir

---

## 📋 Hibrit Pipeline Önerisi

```
1. Aviation Glossary (ICAO terms) — manuel, sıfır API
   → Mayday, Squawk, Roger gibi terimler her zaman aynı

2. Wikipedia Language Links — noun terms %40
   → "Cockpit", "Runway" gibi terimler doğrulanmış çeviri

3. Gemini Flash (LLM, context-aware) — primary çeviri
   → Glossary inject + context awareness

4. Google Cloud Translate — DeepL paralel quota
   → Hızlı batch, geniş dil

5. DeepL Free/Pro — kaliteli batch
   → 16 dil için en iyi

6. Microsoft Translator (Azure) — opsiyonel ek 2M/ay
   → Yedek quota

7. Argos (offline) — son çare
   → Quota tükenirse FA/HI/TH/MS için
```

---

## 💰 Bütçe Senaryoları

### Senaryo A: $0/ay (sadece free tier'lar)

- DeepL Free 500K/ay
- Google Free 500K/ay
- Gemini Free 1500 req/gün
- Argos sınırsız

**Toplam**: ~1.5M char/ay (Argos sınırsız) — vocab-rich 5 ayda biter, interview 3 ayda.

### Senaryo B: $7-25/ay (DeepL Pro)

- DeepL Starter $7 → 1M/ay
- veya DeepL Advanced $25 → 5M/ay
- Diğerleri free

**Toplam**: 1.5M veya 5.5M char/ay — vocab-rich 1-2 ayda.

### Senaryo C: $36 tek seferlik (Claude Haiku)

- Tüm AirSpeak içeriği bir günde çevirilir
- Ardından sürdürülebilir için Senaryo A veya B

**En verimli senaryo:** C + A.

---

## 📝 Tasarımcı Notları (gelecekte yararlı)

- **DeepL Free 500K char/ay** = reset her ay başı, kart yok
- **Gemini Free 1500 req/gün** = reset her gece, sadece Google account
- **Argos kalitesi**: FA/HI/TH/MS düşük, AR/DE/FR mükemmel
- **ICAO frazeoloji** her zaman İngilizce kalmalı (regülasyon)
- **TR-spesifik nüans**: "abi", "kardeşim" gibi günlük dil çevirilirken sıkıntı yaratır → resmi ton tercih
- **TR uppercase i / I** dikkat edilmeli (DeepL bunu bozmuyor, Argos bozabiliyor)

### Test edildi, çalışmadı
- Yandex Translate API: TR-EN çalışıyor ama EN-AR/EN-FA zayıf
- Helsinki-NLP HuggingFace: ücretsiz ama rate limit kötü
- Apertium: Türkçe destek yok

---

## 🚀 Sonraki Adımlar (önerilen sıra)

1. **[5 dk]** Google Cloud Translate API key al + .env'e ekle
2. **[30 dk]** `scripts/i18n/translate-google.ts` ekle (DeepL ile aynı interface)
3. **[15 dk]** Pipeline'a hibrit fallback: DeepL → Google → Argos
4. **[1 saat]** Gemini Flash çeviri kullanıcısı: `scripts/i18n/translate-gemini.ts` (LLM + glossary)
5. **[opsiyonel, 5 dk + $5]** Anthropic Claude Haiku key + tek batch
6. **[aylık]** DeepL Pro Starter $7 (sürdürülebilir)

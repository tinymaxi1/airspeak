# AirSpeak Bedava Çeviri Pipeline

20 dile içerik çevirme — **toplam maliyet ~$0** (Google Cloud free credit içinde).

## 🎯 Strateji

| Katman | Kaynak | Maliyet | Kalite | Hangi içerik |
|---|---|---|---|---|
| 1 | **Aviation glossary** (manuel, ICAO/IATE bazlı) | $0 | ⭐⭐⭐⭐⭐ | Kritik terim (cleared, mayday, brace) |
| 2 | **Wikipedia language links** | $0 | ⭐⭐⭐⭐ | Aviation noun (cockpit, runway) |
| 3 | **DeepL Free** (500K char/ay) | $0 | ⭐⭐⭐⭐ | Cümleler, açıklamalar |
| 4 | **Argos Translate offline** | $0 | ⭐⭐⭐ | Bulk fallback (sınırsız) |
| 5 | **Claude API** (eğer credit varsa) | $0-30 | ⭐⭐⭐⭐ | Karmaşık aviation context |
| 6 | **Manuel review** | $0 (zaman) | ⭐⭐⭐⭐⭐ | ICAO frazeolojisi son kontrol |

## 📦 Scriptler

```
scripts/i18n/
├── aviation-glossary.json     # 80 kritik aviation term × 20 dil (resmi kaynaklı)
├── translate-wikipedia.ts     # Wikipedia API → 20 dil (auth yok, free)
├── translate-deepl.ts         # DeepL Free API (500K char/ay)
├── translate-argos.ts         # Argos Translate offline wrapper
├── translate-claude.ts        # Anthropic API fallback ($5 free credit)
├── quality-check.ts           # Glossary'e karşı doğrula
├── run-pipeline.ts            # Master orchestrator
└── translated-output/         # Çıktı dizini (commit edilmez)
```

## 🚀 Kurulum

### Adım 1: Argos Translate (yerel offline çeviri)
```bash
# Python 3.8+ gerekli
pip install argostranslate

# Dil paketleri indir (her dil ~100MB, bir kez)
python -c "
import argostranslate.package
argostranslate.package.update_package_index()
available = argostranslate.package.get_available_packages()
for pkg in available:
    if pkg.from_code == 'en' and pkg.to_code in ['ar','fa','de','fr','es','it','pt','nl','pl','el','zh','ja','ko','hi','id','th','ms','ru','tr']:
        argostranslate.package.install_from_path(pkg.download())
        print(f'Installed: en→{pkg.to_code}')
"
```

### Adım 2: DeepL Free API key (opsiyonel ama güçlü)
1. https://www.deepl.com/pro-api → "DeepL API Free" kayıt
2. **500.000 karakter/ay ücretsiz**
3. API key al → `.env` dosyasına: `DEEPL_API_KEY=...`

### Adım 3: ICAO Terminology (manuel, 1 kez)
1. https://store.icao.int/en/multilingual-aviation-vocabulary-doc-9713 (Doc 9713 ücretsiz)
2. PDF indir, parse et veya manuel olarak `aviation-glossary.json`'a ekle
3. Bizim glossary 80 terim ile başlıyor — istersen 500'e çıkar

### Adım 4: Anthropic API (opsiyonel, $5 free credit)
1. console.anthropic.com → yeni hesap → $5 credit otomatik
2. API key → `.env` → `ANTHROPIC_API_KEY=...`
3. ~$5 ile 100K karakter Claude Sonnet quality

## 🏃 Çalıştırma

### Hepsini sırayla
```bash
npm run translate:all
```

### Kademeli (tavsiye edilen)
```bash
# 1. Glossary'i UI strings'e uygula (anlık)
npm run translate:glossary

# 2. Wikipedia'dan vocab terim çevirilerini topla (~5 dk)
npm run translate:wikipedia

# 3. DeepL ile cümle çevir (500K char/ay limit)
npm run translate:deepl --target ar
npm run translate:deepl --target de
# ... 18 dil

# 4. Argos ile geriye kalanı doldur (offline, sınırsız)
npm run translate:argos

# 5. Quality check — ICAO frazeolojisi koruma
npm run translate:check
```

## 📊 Beklenen Sonuç

| Kategori | Yöntem | Tahmini kapsama |
|---|---|---|
| UI strings (142 × 18) | Glossary + DeepL | %95 doğru |
| Vocab term (1300 × 18) | Wikipedia + Argos | %85 doğru |
| Vocab definition | DeepL + Argos | %80 doğru |
| Mülakat sorusu | DeepL + Claude | %85 doğru |
| Aviation phraseology | Glossary (manuel) | %100 doğru ⭐ |

## ⚠️ Manuel Kontrol Gereken Yerler

Bu terimleri **ASLA otomatik çevirme**:
- "Mayday Mayday Mayday" → tüm dillerde aynı kalır
- "Cleared for takeoff" → ICAO standart frazeoloji, hedef dilin **resmi havacılık otoritesi sözlüğüne** uy
- "Roger / Wilco / Affirmative" → IATA standart, çevirme
- Callsign: "Turkish 1", "Speedbird 6" — aynı kalır
- Numbers: pilot fonetik — "fife", "niner" universal

Bunlar `aviation-glossary.json`'da işaretli, otomatik korunur.

# 14 · Privacy & Legal Compliance

App Store Privacy Nutrition Label, GDPR, KVKK, COPPA, regional compliance.

## 14.1 Apple App Store Privacy Nutrition Label

### App Store Connect → App Privacy

Apple her app için 4 kategori soruyor:

### Kategori A: "Data Used to Track You"
- ❌ **Hiçbiri** — biz tracking yapmıyoruz (third party advertising network'lerine satılmıyor)

### Kategori B: "Data Linked to You"
| Tip | Veri | Amaç | Bizde |
|---|---|---|---|
| Contact Info | Email | Auth, support | ✅ Email |
| User Content | App content (lesson progress) | App functionality | ✅ Lesson data |
| Identifiers | Device ID | App functionality (analytics) | ✅ Anonymized |
| Usage Data | Product interaction | Analytics | ✅ PostHog |

### Kategori C: "Data Not Linked to You"
| Tip | Bizde |
|---|---|
| Diagnostics | ✅ Sentry (crash log, anonymized) |

### Kategori D: "Data Not Collected"
- ❌ Audio recordings (cihazda işlenir, hiç toplanmaz)
- ❌ Browsing history
- ❌ Search history
- ❌ Location
- ❌ Health data
- ❌ Financial info (Apple/Google ödemeyi yönetir)
- ❌ Contacts
- ❌ Photos/Videos

### Kritik mesaj (App Store description'da öne çıkar)

> 🔒 GİZLİLİK
> Mikrofon kayıtların **cihazda** işlenir, sunucuya gönderilmez.
> Audio data **hiç toplanmaz**.
> İlerlemen MMKV ile yerel olarak şifrelenir.
> KVKK + GDPR + CCPA uyumlu.

---

## 14.2 KVKK (Türkiye Kişisel Veri Koruma Kanunu)

### Veri Sorumlusu Kayıt
- VERBIS sicili kayıt zorunluluğu (eğer kayıtlı kullanıcı 5K üzeri)
- Hedef: yıl 1 sonu 20K kullanıcı → kayıt zorunlu

### Aydınlatma Metni (`airspeak.app/aydinlatma`)

```markdown
# AirSpeak Aydınlatma Metni

**Veri sorumlusu**: AirSpeak Yazılım A.Ş.
**Tarih**: {{date}}

## İşlenen kişisel veri kategorileri

1. **Kimlik bilgisi**
   - E-posta adresi
   - Kullanıcı adı (kullanıcı tarafından oluşturulan)

2. **Kullanım verisi**
   - Lesson tamamlama, score, streak
   - In-app etkileşim event'leri
   - Cihaz tipi, OS versiyonu

3. **Mikrofon kayıtları**
   - **CİHAZDA İŞLENİR**, sunucuya gönderilmez
   - Speech-to-text dönüşümü cihazda yapılır
   - Audio dosyası kayıt sonrası silinir

## Veri toplama amaçları

- App fonksiyonu (giriş, ders takibi, ilerleme)
- Performans analitik (PostHog)
- Crash analizi (Sentry)
- Push notification (kullanıcı izniyle)

## Verilerin paylaşımı

- 3. taraflarla paylaşmıyoruz (advertising, marketing)
- Sadece zorunlu hizmet sağlayıcılar:
  - Supabase (auth + database, Frankfurt sunucuları, GDPR uyumlu)
  - PostHog (analitik, EU sunucuları)
  - Sentry (crash, EU sunucuları)
  - Apple/Google (ödeme, kendi gizlilik politikaları)

## Saklama süresi

- Aktif kullanıcı: hesap silinmediği sürece
- Pasif (12 ay+ giriş yok): otomatik anonim verilere dönüşür
- Mikrofon: 0 saniye (cihazda işlenir, sunucuda yok)

## Haklarınız (KVKK m.11)

- Verinizin işlenip işlenmediğini öğrenme
- İşlenmiş veri hakkında bilgi talep etme
- Düzeltme, silme talep etme
- Verinin işlenmesine itiraz etme

İletişim: kvkk@airspeak.app
```

### KVKK uyumlu eylemler

- [ ] Aydınlatma metni airspeak.app/aydinlatma'da yayınlandı
- [ ] In-app: kayıt sırasında "Aydınlatma metnini okudum" checkbox
- [ ] User data export feature (in-app: Settings → Verimi indir)
- [ ] Account deletion feature (Settings → Hesabı sil)
- [ ] VERBIS kayıt (5K üzeri kullanıcıdan sonra)

---

## 14.3 GDPR (AB Genel Veri Koruma Yönetmeliği)

### Yasal yükümlülükler (AB kullanıcısı için)

1. **Lawful basis**: kullanıcı consent (kayıt sırasında)
2. **Right to access**: data export
3. **Right to erasure**: account deletion
4. **Data portability**: JSON export
5. **Privacy by design**: cihazda STT, sunucuda hiç audio yok
6. **DPO**: 250+ employee için (bizde gerek yok)
7. **Data Processing Agreement (DPA)**: Supabase/PostHog/Sentry ile imzalı

### Cookie consent (web)
- airspeak.app banner: "Çerezleri kabul ediyor musun?"
- Reject button mevcut (legal zorunlu)
- Analytics çerezler default OFF (kullanıcı opt-in)

### EU representative
- AB içindeki bir bent (Düsseldorf veya Dublin) gerekli (250K+ kullanıcı sonrası)
- $1K-3K/yıl outsourced firma

---

## 14.4 COPPA (US Children's Online Privacy Protection Act)

### Kapsam: 13 yaş altı kullanıcı

### Bizim durumumuz
- App: 13+ kullanım rated (App Store)
- Pilot/öğrenci typically 18+ (lisans yaş zorunlulukları)
- Lise öğrenci 16-17 yaş havacılık fakültesi adayları
- 13 yaş altı kullanıcı yok denecek kadar az

### Compliance
- Kayıt sırasında "13 yaşından büyük müsün?" checkbox
- 13 yaş altı tespit edildiğinde: hesap silinir
- Apple/Google bu yaşı kontrol ediyor (parent consent)

---

## 14.5 Sub-processor Listesi (DPA imzalı)

### Veri işleyenler (Sub-processors)

| Servis | Amaç | Veri tipi | Konum | DPA |
|---|---|---|---|---|
| **Supabase** | Auth + DB | Email, user content | Frankfurt (EU) | ✅ |
| **PostHog** | Analytics | Anonymized event | Frankfurt | ✅ |
| **Sentry** | Crash log | Stack trace, device | Dublin | ✅ |
| **DeepL Free** | Translation (one-time) | Description text | Almanya | ✅ |
| **Apple** | Payments + push | Payment info | US/EU | ✅ |
| **Google** | Payments | Payment info | US/EU | ✅ |
| **Vercel** | Web hosting | Static site | US (CDN global) | ✅ |
| **Beehiiv** | Newsletter | Email | US | ✅ |

### Kullanıcıya transparency
- Privacy policy'de tüm sub-processor listesi
- Yeni sub-processor eklenince 30 gün öncesinden bildir

---

## 14.6 In-App Purchase Disclosure

### Apple App Store gerekleri

**Auto-renewable subscription tüketici hakları**:

```
ABONELİK ŞARTLARI

✓ Ücret App Store hesabınızdan otomatik kesilir
✓ Süre bitiminden 24 saat öncesine kadar otomatik yenilenir
✓ İptal: Ayarlar > Apple ID > Abonelikler
✓ Yenileme süresi: 1 ay veya 1 yıl (seçtiğiniz)
✓ Ücretsiz deneme süresi sonrasında ücretlendirilirsiniz

PROMOSYON TARİHLERİ
- 7 gün ücretsiz deneme (yeni abone)
- Reklamlı kullanıcılarda promosyon kodu

KULLANIM ŞARTLARI: airspeak.app/terms
GİZLİLİK: airspeak.app/privacy
```

### Yer
- App Store description'da (gerekli)
- Paywall ekranında (uygulama içi)
- Settings → Subscription'da

---

## 14.7 Terms of Service

### URL: `airspeak.app/terms`

### Yapı

```markdown
# AirSpeak Kullanım Şartları

Tarih: {{date}}

## 1. Genel Hükümler
[1 paragraf — ne yaptığımız, kim olduğumuz]

## 2. Hesap
- 13+ yaş zorunlu
- 1 hesap = 1 cihaz limiti yok (Apple Family Sharing destekli)
- Hesap güvenliği kullanıcı sorumluluğunda

## 3. Hizmet Tanımı
- Aviation English eğitim app'i
- ICAO 4 hazırlık (eğitim, sertifika DEĞİL)
- Mülakat hazırlık materyali
- Pratik araç (resmi sertifika yetkilisi DEĞİL)

## 4. Ücretlendirme
[Pricing detayları]

## 5. Refund Politikası
- Apple/Google üzerinden 14 gün otomatik
- Sonra 30 gün diskreşonel (case-by-case)

## 6. Fikri Mülkiyet
- AirSpeak içeriği: bizim
- Kullanıcı içeriği: kullanıcının (lesson notes, custom)
- Lisans: kişisel, ticari kullanım yasak

## 7. Yasaklı Davranış
- Hesap paylaşma (kurumsal hariç)
- Reverse engineering
- Spam, kötüye kullanım

## 8. Sorumluluk Reddi
- ICAO 4 sınavı GARANTİ DEĞİL — bizim app pratik aracı
- Mülakat sonucu garantisi yok
- "As-is" service

## 9. Yasal Yetkili Mahkeme
- İstanbul Mahkemeleri (TR kullanıcı)
- ICC arbitration (uluslararası)

## 10. Değişiklikler
- 30 gün öncesinden bildirim
- Continued use = kabul

İletişim: legal@airspeak.app
```

---

## 14.8 Privacy Policy

### URL: `airspeak.app/privacy`

### Yapı (KVKK + GDPR uyumlu)

```markdown
# Gizlilik Politikası

[Aydınlatma metnini içerir + GDPR/CCPA için ek hükümler]

## CCPA (California sakinleri için)
- Right to know
- Right to delete
- Right to opt-out (doğrudan satıştan)
- Bizim için: kullanıcı verisi 3. tarafa SATMIYORUZ → CCPA opt-out gereği yok

## Çocuklar (13 yaş altı)
COPPA uyumlu — yasaklı

## Veri Saklama
[Yukarıda KVKK bölümünde detay]

## İletişim
privacy@airspeak.app
```

---

## 14.9 Region-Specific Compliance

### Türkiye (KVKK + Tüketici Kanunu)
- VERBIS kayıt (5K user üzeri)
- Aydınlatma metni Türkçe zorunlu
- Sözleşmeden cayma 14 gün (Tüketici Kanunu 48. madde)

### AB (GDPR)
- Cookie consent banner web'de
- DPO yok (250+ employee gerek)
- EU representative (Düsseldorf, 250K+ user sonrası)

### ABD
- CCPA (California)
- COPPA (children)
- US user için "Do not sell my info" linki (yararlanmıyor olduğumuzu göster)

### Çin (PRC, eğer pazara girersek)
- ICP filing zorunlu (Çin domain hosting için)
- Çin sunucusunda data tutma zorunlu (lokal hosting iceberg)
- Gerek yoksa Çin pazarına girme (compliance pahalı)

### Rusya
- Federal Law 152-FZ (kişisel veri lokalizasyonu)
- Bizim Çin ile benzer engel — Rusya pazara giriş zor

---

## 14.10 App Store Reject Edilmemek İçin Checklist

### Apple Reject sebepleri (önlemler)

| Reject Sebebi | Önlem |
|---|---|
| **Permission'ın gerekçesi yok** | Info.plist'te NSMicrophoneUsageDescription, NSSpeechRecognitionUsageDescription net |
| **In-App Purchase eksik** | Subscription auto-renew yazımı net |
| **Misleading metadata** | Description ile özellik aynı |
| **Crash** | Sentry'de yıllık <1% crash rate |
| **Web wrapper hissi** | Native React Native, Expo bridge kullanılıyor |
| **"Not enough functionality"** | Lansman'da 5 senaryo, 41 havayolu, ICAO mock var |
| **Fake review hissi** | Beta tester referans, reklamı dengeli |
| **Privacy policy eksik** | airspeak.app/privacy URL Apple'a verildi |
| **Children content / advertising** | Yok |

### Google Play Reject

| Reject | Önlem |
|---|---|
| **Adaptive icon yok** | Foreground + background ayrı katman |
| **Permission abuse** | Sadece ihtiyaç duyulan permission isteniyor |
| **Misleading category** | Education kategori uygun |
| **Account creation şart** | Free use option (lesson tüm features açık 1 hafta) |

---

## 14.11 Insurance & Risk

### Tipik startup sigortası (yıl 1)
- **General liability**: $500K coverage, $1.500/yıl
- **Cyber liability**: $1M coverage, $3.000/yıl
- **Errors & Omissions**: $1M coverage, $2.500/yıl
- **D&O insurance** (yatırım sonrası): $5M, $10K/yıl

### Toplam yıllık ~$7.000 (TR'de daha ucuz, $3.500 civarı)

---

## 14.12 Aksiyonlar

| Aksiyon | Sahip | Süre |
|---|---|---|
| Privacy policy yazımı (TR + EN) | Legal | Hafta 4 |
| Terms of service | Legal | Hafta 4 |
| KVKK Aydınlatma metni | Legal | Hafta 4 |
| App Store Privacy Nutrition fill | Product | Hafta 6 |
| VERBIS kayıt (5K user sonrası) | Legal | Ay 6 |
| GDPR DPA Supabase/PostHog/Sentry | Legal | Hafta 4 |
| Cookie consent banner web | Web | Hafta 6 |
| In-app account deletion feature | Eng | Hafta 8 |
| Data export feature | Eng | Hafta 10 |
| Insurance quotes 3 broker | Founder | Ay 2 |

---

*v1.0 · 2026-04-29*

# Telefonda Test — AirSpeak'i Canlı Görme Rehberi

## 🎯 5 Dakikada İlk Demo

### 1. Expo Go Uygulamasını İndir (telefon)

| Cihaz | Link |
|---|---|
| **iPhone** | [App Store — Expo Go](https://apps.apple.com/app/expo-go/id982107779) |
| **Android** | [Play Store — Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) |

Ücretsiz, ~80 MB.

### 2. Bilgisayar ve Telefon Aynı WiFi'de mi?

Evet ise → "LAN mode" kullanırız (hızlı)
Hayır ise → "Tunnel mode" gerekir (`--tunnel` flag, biraz yavaş ama her ağda çalışır)

### 3. Expo'yu Başlat (Mac terminalden)

```bash
cd "/Users/ozlemakcin/Desktop/thy app"
npx expo start
```

İlk başlatma 30-60 saniye sürer. Terminal'de **QR kod** çıkacak.

#### Aynı WiFi yoksa:
```bash
npx expo start --tunnel
```

İlk tunnel kullanımında ngrok kurulması istenebilir, "yes" de.

### 4. QR Kodu Tara

| Cihaz | Yöntem |
|---|---|
| **iPhone** | Kamera uygulamasıyla QR'a bak → bildirim çıkar → tıkla |
| **Android** | Expo Go uygulamasını aç → "Scan QR code" |

### 5. AirSpeak Açılır

Splash ekranı (lacivert) → Welcome → Register → Onboarding → Ana sayfa.

---

## 🎬 Test Senaryoları (Hangi Akışları Dene?)

### A) Tam Onboarding Akışı (5 dakika)

1. **Welcome ekranı** → "Başla" tıkla
2. **Register** → herhangi bir email + şifre (örn: `test@test.com` / `123456`)
   - Mock auth, gerçekten kaydediyor (telefon belleğinde)
3. **Rol seçimi** → "Pilot" seç → "Devam et"
4. **Seviye testi (10 soru)** → "Teste başla"
   - Her soruyu cevapla, anlık feedback gör
   - "Bilmiyorum" butonu da var
5. **Sonuç ekranı** → seviyeni gör (A1-C1)
6. **Günlük dakika** → "15 dk" seç → "Başla"
7. **Ana sayfa** → 3 günlük görev + streak ateşi yandı

### B) İlk Ders (3 dakika)

1. Ana sayfa → "Hızlı başla — Ders ağacını aç"
2. Modul 1 → Ünite 1 → İlk dersi tıkla
3. **5 vocab egzersizi** çöz
4. Doğru → +10 XP, yanlış → -1 can
5. **Ders sonu kutlaması** (animasyon) → "Ana sayfaya dön"

### C) SRS Flashcard (2 dakika)

1. Pratik tab → "SRS Tekrar"
2. 5 yeni terim flashcard
3. "Cevabı göster" → quality buton (Yeniden/Zor/İyi/Kolay)
4. Algoritma sıradaki tekrar zamanını hesaplar

### D) Telaffuz Drill (3 dakika)

1. Pratik tab → "Telaffuz Drill"
2. "Cleared for takeoff, runway two seven" cümlesi
3. **Mikrofon iznini ver** (ilk açılışta)
4. Mikrofon butonu → konuş → "Bitti"
5. Mock skor: kelime kelime renk feedback (yeşil/sarı/kırmızı)
6. ICAO 1-6 level

### E) ICAO 4 Simülatör (2 dakika)

1. Pratik tab → "ICAO 4 Sözlü Simülatör"
2. İlk görev (free) → "Picture Description"
3. Görevi oku, ipucunu gör → "Hazırım, kaydı başlat"
4. Konuş 30-60 sn → "Bitti — değerlendir"
5. **6-alan rubric sonuç** + öneri listesi

### F) Lig Tab (1 dakika)

1. Lig tab
2. Bronz Lig tier görüntüsü
3. 30 kişilik mock leaderboard
4. Senin pozisyonun highlighted (yeşil/kırmızı zone)
5. Promotion mesajı

### G) Mağaza (1 dakika)

1. Profil tab → "🪙 Mağaza"
2. Coin balance + 6 ürün
3. Streak freeze 100 coin → "Al" → onay
4. Yetersiz coin'de uyarı çıkar

### H) Premium Paywall (30 saniye)

1. Ana sayfa → "AI ile 1 kez konuş" görevi (kilitli)
2. Paywall ekranı açılır
3. 3 plan kart (yıllık varsayılan EN POPÜLER)
4. "Ücretsiz başla" → mock trial alert

---

## 🔧 Yaygın Sorunlar ve Çözümleri

### "Network response timed out"
- Bilgisayar ve telefon farklı WiFi'de → `--tunnel` flag kullan
- Firewall Expo'yu engelliyor → terminal'de "Allow" izni ver

### "Unable to resolve module"
- Cache temizle: `npx expo start --clear`

### Ekran beyaz kalıyor
- Sallayıp dev menu'yu aç → "Reload"
- Terminal'de Metro logları kontrol et

### Mikrofon izni reddedildi
- iOS: Ayarlar > Expo Go > Mikrofon → aç
- Android: Ayarlar > Uygulamalar > Expo Go > İzinler

### "Mock auth: e-posta zaten kayıtlı"
- Storage temizle: Ayarlar > Expo Go > Verileri sil
- Veya farklı bir email dene

---

## 📊 Test Edilebilir Tüm Özellikler (Liste)

| # | Özellik | Durum |
|---|---|---|
| 1 | Welcome ekranı | ✅ |
| 2 | Register (mock auth) | ✅ |
| 3 | Login (mock auth) | ✅ |
| 4 | Onboarding rol seçimi (5 rol) | ✅ |
| 5 | 10 soruluk placement test + scoring | ✅ |
| 6 | Sonuç ekranı (A1-C1 mapping) | ✅ |
| 7 | Günlük dakika seçimi | ✅ |
| 8 | Ana sayfa (XP/streak/hearts/coins/level) | ✅ |
| 9 | Daily quest 3 görev (rastgele) | ✅ |
| 10 | Quest progress otomatik tracking | ✅ |
| 11 | Quest claim + XP + coin | ✅ |
| 12 | Ders ağacı (Modul 1, 10 ünite) | ✅ |
| 13 | Ünite kilitleri (sıralı unlock) | ✅ |
| 14 | Premium gate (Ünite 6+) | ✅ |
| 15 | Vocab lesson (5 egzersiz) | ✅ |
| 16 | Anlık feedback (renk + açıklama) | ✅ |
| 17 | Lesson complete celebration | ✅ |
| 18 | SRS flashcard (SM-2 algoritması) | ✅ |
| 19 | Quality buton (Yeniden/Zor/İyi/Kolay) | ✅ |
| 20 | Telaffuz drill (mikrofon kayıt) | ✅ |
| 21 | Mock pronunciation scoring | ✅ |
| 22 | Word-by-word renk feedback | ✅ |
| 23 | ICAO 4 sınav simülatörü | ✅ |
| 24 | 4 task type (picture/story/problem/topic) | ✅ |
| 25 | 6-alan rubric scoring | ✅ |
| 26 | Lig tab (30 fake leaderboard) | ✅ |
| 27 | Promotion/demotion zone | ✅ |
| 28 | Profil (stats + 13 rozet + ayarlar) | ✅ |
| 29 | Dil değiştir (TR ↔ EN canlı) | ✅ |
| 30 | Mağaza (6 ürün + coin sistem) | ✅ |
| 31 | Paywall (3 plan + güvence rozet) | ✅ |
| 32 | Çıkış yap (Alert onayı) | ✅ |
| 33 | Rol bazlı vocab (Pilot/Kabin/Teknisyen) | ✅ |
| 34 | Tüm ekranlarda Türkçe ↔ İngilizce | ✅ |

**Henüz çalışmayacak:**
- ❌ Gerçek Supabase auth (mock auth açık)
- ❌ AI konuşma (Anthropic key gerekir, placeholder)
- ❌ Gerçek Whisper telaffuz analizi (mock scorer)
- ❌ Gerçek ICAO 4 examiner (Claude key gerekir, mock)
- ❌ Push notification (Expo push token kayıt yok)
- ❌ RevenueCat ödeme (Apple Developer hesabı gerekir)
- ❌ Lottie animasyon (paket eklendi ama dosya yok)
- ❌ Inter font (sistem fontuna düşüyor)

---

## 💡 Demo Senaryosu (Birine Gösterirken)

**45 saniyelik wow moment akışı:**

1. (0-10s) Welcome → register hızlı geç
2. (10-20s) Rol "Pilot" + 3 soru hızlı cevap
3. (20-30s) Sonuç ekranı: "B1 — Orta" + spesifik vaat
4. (30-40s) Ana sayfa: XP bar, streak, daily görev
5. (40-50s) İlk dersi aç, 1 egzersiz, **🎉 kutlama animasyonu**
6. (50-60s) Lig tab: 30 kişilik leaderboard
7. (60s+) Paywall: 3 plan, "İlk 7 gün ücretsiz"

**Önemli mesaj:** "Bunu solo + Claude ile yaptım. Hiçbir ekip yok."

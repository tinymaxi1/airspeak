# SPRINTS — Detaylı Sprint Görev Listesi

PROJECT_PLAN.md'deki Sprint planının uygulanabilir checklist halidir. Her sprint sonunda Türkçe commit + özet rapor.

---

## ✈️ Sprint -1 — Tasarım Reference + Wireframe (Hafta -1)

**Süre:** 7 gün | **Çıktı:** Figma tasarım sistemi + 6 ana ekran wireframe + logo asset'leri

- [ ] Gün 1: Mobbin'de 50 ekran screenshot
- [ ] Gün 2: Figma Community 3 template incele
- [ ] Gün 3: Figma `AirSpeak Design System` dosyası (color, type, spacing tokens)
- [ ] Gün 4-5: 6 ana ekran low-fi wireframe
- [ ] Gün 6-7: v0.dev / Galileo ile hi-fi mockup baseline
- [ ] Logo SVG vektörleştirme + asset paketi
- [ ] EN tagline kararı

---

## 🚀 Sprint 0 — Hazırlık (Hafta 0)

**Süre:** 5 gün | **Commit:** `feat: proje iskeleti ve altyapı kurulumu`

- [ ] Hesap kurulumları (SETUP.md)
- [ ] Domain `airspeak.app` satın al + DNS Cloudflare
- [ ] `npx create-expo-app airspeak` (TS + expo-router)
- [ ] Git first commit + GitHub repo
- [ ] EAS init + eas.json
- [ ] App.json: bundle id `com.airspeak.app`, icon, splash, marka rengi
- [ ] `.env.local` template + secrets
- [ ] Supabase yeni proje (Europe West)
- [ ] İlk migration: profiles + RLS
- [ ] Auth: Email + Google OAuth
- [ ] Tüm npm bağımlılıklarını kur
- [ ] Tamagui kurulum + theme config (logo paleti)
- [ ] Font yükle (Inter + JetBrains Mono)
- [ ] Atomic component'ler (Button, Input, Card, Modal)
- [ ] PostHog + Sentry init
- [ ] Sosyal medya hesaplarını aç

---

## 👤 Sprint 1 — Auth & Onboarding (Hafta 1-2)

**Commit:** `feat: kullanıcı kaydı ve onboarding akışı`

- [ ] Supabase Auth client wrapper (`src/lib/supabase.ts`)
- [ ] Email + şifre kayıt akışı
- [ ] Google ile giriş (expo-auth-session)
- [ ] Şifre sıfırlama
- [ ] `profiles` tablosu detayı + trigger (auth.users → profiles)
- [ ] Splash ekran
- [ ] Karşılama 3 slayt
- [ ] Kayıt formu (react-hook-form + zod)
- [ ] Giriş formu
- [ ] Rol seçim ekranı (5 kart)
- [ ] Seviye belirleme testi (10 soru)
- [ ] Hedef belirleme (günlük dakika)
- [ ] i18n kurulum (TR + EN)
- [ ] Tab navigation (5 tab) + base layout
- [ ] Auth state Zustand store
- [ ] Protected routes

---

## 📚 Sprint 2 — İçerik Şeması & Ders Motoru (Hafta 3-4)

**Commit:** `feat: ders motoru ve egzersiz tipleri`

- [ ] `categories`, `courses`, `units`, `lessons`, `exercises`, `audio_assets` migration'ları
- [ ] `vocabulary_terms` migration
- [ ] Seed: Pilot rolü 1 ünite + 5 ders + 30 egzersiz (manuel JSON)
- [ ] Ders ağacı UI (tree view)
- [ ] Ders detay ekranı
- [ ] Egzersiz tipleri: multiple_choice, fill_blank, match, listen
- [ ] `user_lesson_progress` ile ilerleme kaydı
- [ ] MMKV cache (offline son 3 ders)
- [ ] Ders sonucu ekranı (XP+, doğru/yanlış)

---

## 🎮 Sprint 3 — Gamification Çekirdeği (Hafta 5-6)

**Commit:** `feat: xp, streak, can, coin sistemi ve rozetler`

- [ ] `xp_logs`, `user_xp_summary`, `streaks`, `hearts`, `coins` migration'ları
- [ ] `badges`, `user_badges` migration
- [ ] DB trigger: xp_log → user_xp_summary güncelle
- [ ] Edge function: streak günlük cron
- [ ] Heart refill timer (server-side check)
- [ ] Shop ekranı (3 başlangıç ürünü)
- [ ] İlk 10 rozet seed + otomatik trigger
- [ ] Ana sayfa: streak ateşi, XP bar, can, coin, "kaldığın yerden"
- [ ] Lottie animasyon: rozet kazanımı, level up

---

## 🧠 Sprint 4 — SRS + Görev + Lig (Hafta 7-8)

**Commit:** `feat: srs hafıza sistemi, günlük görevler, lig`

- [ ] `user_term_srs` migration (SuperMemo SM-2)
- [ ] SM-2 algoritma implementasyonu
- [ ] SRS tekrar ekranı (flashcard tarzı)
- [ ] 800 vocabulary_terms üretim (paralel iş)
- [ ] `daily_quests`, `quest_templates` migration
- [ ] Daily quest generator (gece cron, 3 görev)
- [ ] Görev kartı UI (ana sayfada)
- [ ] `leagues`, `league_seasons`, `user_league_membership` migration
- [ ] Lig algoritması (pg_cron Pazartesi 00:00)
- [ ] Lig ekranı (sıralama, tier ikon)
- [ ] Haftalık ödül dağıtımı

---

## 🤖 Sprint 5 — AI Konuşma Çekirdeği (Hafta 9-10)

**Commit:** `feat: AI konuşma partneri ve voice-to-voice`

- [ ] Claude SDK kurulum (`@anthropic-ai/sdk`)
- [ ] Edge Function: Claude proxy (API key client'ta yok)
- [ ] Voice recorder bileşeni (expo-av)
- [ ] Whisper STT pipeline (Edge Function)
- [ ] ElevenLabs TTS pipeline
- [ ] AI konuşma ekranı: voice-to-voice akışı
- [ ] Transkript bubble UI
- [ ] `conversation_scenarios` migration + 30 senaryo seed
- [ ] `user_conversations` migration (arşiv için)
- [ ] 6 alan rubric skoru hesaplama (Sonnet 4.6)
- [ ] AI maliyet logger + günlük limit
- [ ] System prompt: ICAO Doc 9432 referans

---

## 🎤 Sprint 6 — Telaffuz Analizi + Premium (Hafta 11-12)

**Commit:** `feat: telaffuz analizi, abonelik ve paywall`

- [ ] Telaffuz drill ekranı
- [ ] Whisper word-level confidence parser
- [ ] Phoneme matching basit MVP
- [ ] ICAO Seviye 4 rubric puanlama
- [ ] 200 telaffuz cümlesi seed
- [ ] RevenueCat SDK entegrasyonu
- [ ] 5 ürün config (RevenueCat dashboard)
- [ ] Paywall ekranı (3 plan kart)
- [ ] 12 paywall tetikleyicisi
- [ ] Free limitler: 3 ders/gün, 5 telaffuz, 3 AI mesaj
- [ ] AdMob entegrasyonu (free user only)
- [ ] Subscription webhook → Supabase
- [ ] Trial başlama akışı

---

## 📝 Sprint 7 — Sınav + ICAO 4 Sözlü AI Examiner + Bildirim (Hafta 13-14)

**Commit:** `feat: sınav simülasyonu, ICAO 4 sözlü AI examiner, bildirimler`

- [ ] `exam_simulations`, `exam_questions` migration
- [ ] ICAO 4 yazılı (3 set × 50 soru) seed
- [ ] SHGM mock (2 set × 40) seed
- [ ] YDS havacılık çıkmış sorular seed
- [ ] Mülakat soru bankası 100 seed
- [ ] Sınav çözme ekranı (zamanlayıcı, navigasyon)
- [ ] Sonuç ekranı + band score + AI zayıflık özeti
- [ ] `oral_exam_prompts` migration + 30 prompt seed
- [ ] ICAO 4 sözlü AI examiner ekranı (4 görev tipi)
- [ ] Konuşma arşivi ekranı (geri dinle)
- [ ] Mock mülakat stüdyosu
- [ ] expo-notifications + push token kayıt
- [ ] 11 bildirim trigger (Edge Function cron)
- [ ] Bildirim ayarları ekranı
- [ ] `content_flags` + içerik bildir akışı

---

## 📖 Sprint 8 — Frazeoloji + NOTAM + Offline + Sınav Günü Modu (Hafta 15-16)

**Commit:** `feat: frazeoloji, dokuman okuma, offline, sınav günü modu, referral`

- [ ] `phraseology_entries` migration + tsvector index
- [ ] 1000 frazeoloji entry seed
- [ ] Frazeoloji cep sözlüğü ekranı (full-text search)
- [ ] `aviation_documents` migration
- [ ] 100 NOTAM/METAR/ATIS örnek seed
- [ ] Doküman okuma modülü ekranı
- [ ] Decode pratiği + comprehension quiz
- [ ] `user_exam_schedules` migration
- [ ] Sınav tarih girişi + AI 30 günlük plan üretici
- [ ] T-7, T-1 özel mod ekranları
- [ ] Sınav günü countdown widget (ana sayfa)
- [ ] `offline_downloads` migration
- [ ] Offline indirme yönetici ekranı (premium)
- [ ] Toplu indirme akışı (ders + ses + SRS)
- [ ] `referrals`, `referral_codes` migration
- [ ] Davet et ekranı + paylaşım sheet
- [ ] Davet tablosu
- [ ] Ödül dağıtım akışı (her iki tarafa 1 ay)

---

## 🎨 Sprint 9 — İçerik Üretim + Cila + Yayın (Hafta 17-18)

**Commit:** `chore: içerik seed ve yayın hazırlıkları`

### İçerik Üretim Maratonu
- [ ] 800 terim Claude üretim + GPT-4 çapraz doğrulama
- [ ] 60 diyalog senaryosu üretim
- [ ] 1000 frazeoloji entry üretim
- [ ] 100 NOTAM/METAR örnek
- [ ] 200 telaffuz cümlesi
- [ ] 30 ICAO 4 sözlü prompt
- [ ] ElevenLabs ile ~80K karakter ses sentezi
- [ ] İçerik validation status'ları güncelle

### Hukuki & Compliance
- [ ] KVKK aydınlatma metni
- [ ] Üyelik sözleşmesi
- [ ] Gizlilik politikası
- [ ] Çocuk koruma uyarıları (Türkiye yasası)
- [ ] App Store / Play privacy nutrition labels

### Cila
- [ ] Performance audit (React Profiler, Reanimated)
- [ ] Ekran geçişleri polish
- [ ] Lottie animasyon yerleşimi
- [ ] Dark mode test
- [ ] Accessibility audit (screen reader, contrast)
- [ ] Hata durumları + boş durum ekranları
- [ ] Loading state'ler
- [ ] Network kesilince fallback

### Yayın Hazırlık
- [ ] App Store screenshot mockup (Mockuphone)
- [ ] Play Store grafikler
- [ ] App Store description (TR + EN)
- [ ] ASO anahtar kelime listesi
- [ ] TestFlight build + 30 beta kullanıcı
- [ ] Play Internal Testing
- [ ] Crash + analytics monitoring
- [ ] Beta feedback iterasyonu
- [ ] App Store submission
- [ ] Play Store submission

---

## 📈 Lansman Sonrası (Ay 5-12)

PROJECT_PLAN.md Bölüm 18 — Yıl 1 Global Ürün Liderliği Yol Haritası

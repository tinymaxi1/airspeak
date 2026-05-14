-- Faz 4 — v1.0.0 retroaktif release notu seed
--
-- Mevcut tüm kullanıcılar (last_seen_release_version = NULL) ilk app açılışında
-- WhatsNewSheet ile v1.0.0 yeniliklerini görür.
--
-- TR + EN aynı yapı: emoji + title + description.

INSERT INTO public.app_releases (version, released_at, changes_tr, changes_en, mandatory)
VALUES (
  '1.0.0',
  now(),
  '[
    {"emoji":"🎯","title":"Hızlı seviye testi","description":"Artık 10 soru + 2 dakikada hızlı seviye tahmini yapabilirsin. Tam test 22 soruyla daha kesin sonuç verir."},
    {"emoji":"🔥","title":"Streak Risk Uyarısı","description":"Saat 19:00 sonrasında streak''in tehlikedeyse anasayfada uyarı görürsün — 1 ders streak''i kurtarır."},
    {"emoji":"✈","title":"Sana özel hızlı pratik","description":"Helikopter pilotu, A320 teknisyeni, kabin görevlisi gibi alt-rolüne göre Quick Practice kartları kişiselleştirildi."},
    {"emoji":"🏆","title":"Lige otomatik katılım","description":"Kayıt olur olmaz uygun lig grubuna atanırsın. 20 sanal pilot ile leaderboard hep dolu."},
    {"emoji":"📊","title":"Profil sekmeleri","description":"Logbook (uçuş kaydı), Profil (kim olduğun), Hangar (ayarlar) — her şey kendi yerinde."},
    {"emoji":"⭐","title":"Daha tutarlı tasarım","description":"Boş ekranlar artık ortak bir tasarım dilinde — yer imleri, bildirimler, topluluk."},
    {"emoji":"🌍","title":"Türkçe iyileştirmeler","description":"Cohort → Filo, MOCK → DENEME, Squadron Hub → Topluluk Merkezi. Daha doğal Türkçe."},
    {"emoji":"👋","title":"Hızlı kayıt","description":"Onboarding adımlarında ''Atla'' butonu — alt-rol, profil, hedef seçimi opsiyonel."},
    {"emoji":"🔐","title":"Yaş onayı + KVKK","description":"13+ yaş onayı eklendi. Hesabını sildiğinde 30 gün içinde tüm verilerin kalıcı silinir."},
    {"emoji":"📄","title":"Yasal şeffaflık","description":"Gizlilik Politikası ve Kullanım Şartları her yerden erişilebilir — paywall, ayarlar, kayıt ekranı."}
  ]'::jsonb,
  '[
    {"emoji":"🎯","title":"Quick level test","description":"Now you can get a quick level estimate with 10 questions in 2 minutes. The full 22-question test gives more accurate results."},
    {"emoji":"🔥","title":"Streak risk alert","description":"After 7 PM, if your streak is at risk, you''ll see a warning on home — 1 lesson saves the streak."},
    {"emoji":"✈","title":"Practice tailored to you","description":"Quick Practice cards now personalized by sub-role: Helicopter pilot, A320 technician, cabin crew, etc."},
    {"emoji":"🏆","title":"Auto-join leagues","description":"You''re assigned to a suitable league group as soon as you sign up. Leaderboard stays lively with 20 virtual pilots."},
    {"emoji":"📊","title":"Profile tabs","description":"Logbook (flight record), Profile (who you are), Hangar (settings) — everything has its place."},
    {"emoji":"⭐","title":"More consistent design","description":"Empty screens now share a common design language — bookmarks, notifications, community."},
    {"emoji":"🌍","title":"Turkish improvements","description":"Cohort → Filo, MOCK → DENEME, Squadron Hub → Topluluk Merkezi. More natural Turkish."},
    {"emoji":"👋","title":"Faster signup","description":"''Skip'' buttons in onboarding — sub-role, profile, goal selection now optional."},
    {"emoji":"🔐","title":"Age consent + KVKK","description":"13+ age consent added. When you delete your account, all data is permanently removed within 30 days."},
    {"emoji":"📄","title":"Legal transparency","description":"Privacy Policy and Terms of Use accessible everywhere — paywall, settings, signup screen."}
  ]'::jsonb,
  false
)
ON CONFLICT (version) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE 'v1.0.0 release notu seed edildi (mandatory=false)';
END $$;

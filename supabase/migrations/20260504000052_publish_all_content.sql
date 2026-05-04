-- Sprint 14.B.1 — Tüm içeriği yayınla (draft → published)
--
-- Mevcut DB durumu (analiz raporundan):
--   modules:    14 toplam, 1 published, 13 draft
--   units:      180 toplam (status filter yapılmadı)
--   lessons:    720 toplam, 0 published, 719 draft, 1 review
--   exercises:  75 toplam, 0 published, 74 draft, 1 review
--   vocab_terms: 1350 toplam (status filter yapılmadı)
--
-- useModules hook .eq('status', 'published') filter uyguladığı için
-- şu an mobile'da lesson tree boş — kullanıcı hiçbir ders göremiyor.
-- Bu migration tüm draft içeriği toplu olarak published yapar.

with m as (
  update public.modules    set status = 'published'
    where status in ('draft', 'review') returning 1
), u as (
  update public.units      set status = 'published'
    where status in ('draft', 'review') returning 1
), l as (
  update public.lessons    set status = 'published'
    where status in ('draft', 'review') returning 1
), e as (
  update public.exercises  set status = 'published'
    where status in ('draft', 'review') returning 1
), v as (
  update public.vocab_terms set status = 'published'
    where status in ('draft', 'review') returning 1
)
select
  (select count(*) from m) as modules_updated,
  (select count(*) from u) as units_updated,
  (select count(*) from l) as lessons_updated,
  (select count(*) from e) as exercises_updated,
  (select count(*) from v) as vocab_terms_updated;

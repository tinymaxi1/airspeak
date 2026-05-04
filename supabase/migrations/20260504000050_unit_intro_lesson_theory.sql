-- Sprint 12 — Unit Intro + Lesson Theory
-- units.intro_md / intro_md_en  → ünite girişinde modal'da gösterilen tanıtım
-- lessons.theory_md / theory_md_en / theory_image_url → theory tipi dersler
-- lesson_type enum'a 'theory' eklendi

alter type lesson_type add value if not exists 'theory';

alter table public.lessons
  add column if not exists theory_md text,
  add column if not exists theory_md_en text,
  add column if not exists theory_image_url text;

alter table public.units
  add column if not exists intro_md text,
  add column if not exists intro_md_en text;

comment on column public.units.intro_md is 'Ünite girişinde gösterilen TR tanıtım metni (markdown). Boş ise intro modal gösterilmez.';
comment on column public.units.intro_md_en is 'Ünite girişinde gösterilen EN tanıtım metni (markdown).';
comment on column public.lessons.theory_md is 'Theory tipi dersler için TR markdown anlatım. Sadece type=theory için kullanılır.';
comment on column public.lessons.theory_md_en is 'Theory tipi dersler için EN markdown anlatım.';
comment on column public.lessons.theory_image_url is 'Theory dersi opsiyonel görsel (lesson-images bucket public URL).';

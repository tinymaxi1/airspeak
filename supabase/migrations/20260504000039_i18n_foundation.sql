-- Sprint 9.A — Çoklu dil altyapı
-- content_translations + aviation_glossary + glossary_translations
-- ============================================================================

-- pg_trgm: aviation_glossary üzerinde fuzzy term search için
create extension if not exists pg_trgm;

-- ============================================================================
-- 1) content_translations
--    Mevcut _tr kolonları korunur (legacy hızlı path).
--    Bu tablo TR/EN dışındaki 18 dil için ana kaynak.
-- ============================================================================
create table if not exists public.content_translations (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in (
    'lessons', 'exercises', 'vocab_terms',
    'interview_questions', 'oral_prompts',
    'placement_questions', 'airlines',
    'modules', 'units'
  )),
  content_id uuid not null,
  field_name text not null,                 -- 'title' | 'description' | 'prompt' | 'definition' | ...
  language_code text not null,              -- ISO 639-1, SUPPORTED_LOCALES (20 dil)
  value text not null,
  is_machine_translated boolean not null default true,
  reviewed_at timestamptz,
  translator text not null default 'claude'
    check (translator in ('claude', 'deepl', 'human')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_type, content_id, field_name, language_code)
);

create index if not exists content_translations_lookup_idx
  on public.content_translations (content_type, content_id, language_code);

create index if not exists content_translations_lang_idx
  on public.content_translations (language_code);

create index if not exists content_translations_unreviewed_idx
  on public.content_translations (is_machine_translated, reviewed_at)
  where reviewed_at is null and is_machine_translated = true;

-- updated_at trigger
drop trigger if exists set_content_translations_updated_at on public.content_translations;
create trigger set_content_translations_updated_at
  before update on public.content_translations
  for each row execute function public.set_updated_at();

-- RLS
alter table public.content_translations enable row level security;

drop policy if exists "content_translations_select_authenticated" on public.content_translations;
create policy "content_translations_select_authenticated"
  on public.content_translations for select
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

drop policy if exists "content_translations_admin_insert" on public.content_translations;
create policy "content_translations_admin_insert"
  on public.content_translations for insert
  with check (public.is_admin_user());

drop policy if exists "content_translations_admin_update" on public.content_translations;
create policy "content_translations_admin_update"
  on public.content_translations for update
  using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "content_translations_admin_delete" on public.content_translations;
create policy "content_translations_admin_delete"
  on public.content_translations for delete
  using (public.is_admin_user());

-- ============================================================================
-- 2) aviation_glossary
--    50K hedef. Şimdi şema, içerik admin/seed script ile sonradan dolar.
-- ============================================================================
create table if not exists public.aviation_glossary (
  id uuid primary key default gen_random_uuid(),
  term_en text not null,
  term_tr text,
  category text not null check (category in (
    'phraseology',           -- ICAO standart frazeoloji (Mayday, Squawk)
    'aircraft_parts',        -- Aircraft components (aileron, flaps)
    'aerodynamics',          -- Lift, drag, stall
    'navigation',            -- VOR, ILS, FMS
    'meteorology',           -- METAR, TAF, turbulence
    'atc_communication',     -- Clearance, readback
    'emergency',             -- Emergency procedures
    'flight_operations',     -- Takeoff, landing, taxi
    'crew_resource_mgmt',    -- CRM concepts
    'maintenance',           -- MEL, AD, SB
    'cabin_service',         -- Cabin crew terminology
    'ground_operations',     -- Pushback, deicing
    'documentation',         -- Logbook, NOTAM
    'regulations',           -- FAA, EASA, ICAO Annex
    'medical',               -- Class 1 medical, fatigue
    'general'                -- Genel havacılık
  )),
  abbreviation text,         -- e.g., 'METAR', 'ILS', 'VOR'
  definition_en text,
  definition_tr text,
  example_usage text,        -- Örnek cümle EN
  icao_reference text,       -- e.g., 'ICAO Annex 10', 'Doc 4444'
  source text not null default 'admin_manual'
    check (source in ('icao_doc', 'admin_manual', 'ai_generated')),
  is_verified boolean not null default false,
  frequency int not null default 0,    -- Kullanım sıklığı (admin manuel veya analytics)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aviation_glossary_category_idx
  on public.aviation_glossary (category);

create index if not exists aviation_glossary_verified_idx
  on public.aviation_glossary (is_verified, frequency desc)
  where is_verified = true;

create index if not exists aviation_glossary_term_en_trgm_idx
  on public.aviation_glossary using gin (term_en gin_trgm_ops);

create index if not exists aviation_glossary_abbr_idx
  on public.aviation_glossary (abbreviation)
  where abbreviation is not null;

drop trigger if exists set_aviation_glossary_updated_at on public.aviation_glossary;
create trigger set_aviation_glossary_updated_at
  before update on public.aviation_glossary
  for each row execute function public.set_updated_at();

-- RLS: public read, admin write
alter table public.aviation_glossary enable row level security;

drop policy if exists "aviation_glossary_select_all" on public.aviation_glossary;
create policy "aviation_glossary_select_all"
  on public.aviation_glossary for select
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

drop policy if exists "aviation_glossary_admin_write" on public.aviation_glossary;
create policy "aviation_glossary_admin_write"
  on public.aviation_glossary for all
  using (public.is_admin_user()) with check (public.is_admin_user());

-- ============================================================================
-- 3) glossary_translations
--    aviation_glossary entry'lerinin 18 ek dile çevirileri.
--    EN/TR ana tabloda (term_en, term_tr, definition_en, definition_tr).
-- ============================================================================
create table if not exists public.glossary_translations (
  id uuid primary key default gen_random_uuid(),
  glossary_id uuid not null references public.aviation_glossary(id) on delete cascade,
  language_code text not null,
  term_value text not null,
  definition_value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (glossary_id, language_code)
);

create index if not exists glossary_translations_lookup_idx
  on public.glossary_translations (glossary_id, language_code);

create index if not exists glossary_translations_lang_term_idx
  on public.glossary_translations (language_code);

drop trigger if exists set_glossary_translations_updated_at on public.glossary_translations;
create trigger set_glossary_translations_updated_at
  before update on public.glossary_translations
  for each row execute function public.set_updated_at();

alter table public.glossary_translations enable row level security;

drop policy if exists "glossary_translations_select_all" on public.glossary_translations;
create policy "glossary_translations_select_all"
  on public.glossary_translations for select
  using (auth.role() = 'authenticated' or auth.role() = 'anon');

drop policy if exists "glossary_translations_admin_write" on public.glossary_translations;
create policy "glossary_translations_admin_write"
  on public.glossary_translations for all
  using (public.is_admin_user()) with check (public.is_admin_user());

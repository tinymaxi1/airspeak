-- AirSpeak — Content tables (modules, units, lessons, exercises, vocab, ...)
-- Faz 0.2: Tüm içerik DB'de yaşar; admin paneli buradan yönetir, mobil app buradan okur.

-- ============================================================================
-- ENUMS
-- ============================================================================

do $$ begin
  create type content_status as enum ('draft', 'review', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lesson_type as enum ('vocabulary', 'dialogue', 'listening', 'pronunciation', 'quiz', 'reading', 'speaking');
exception when duplicate_object then null; end $$;

do $$ begin
  create type exercise_type as enum (
    'vocab-mc', 'fill-blank', 'dialogue-fill', 'listening-mc',
    'pronunciation-record', 'match', 'order', 'drag-drop', 'open-text'
  );
exception when duplicate_object then null; end $$;

-- profiles.role text check yerine enum gibi kullanmak için yardımcı domain
-- (mevcut text check'i bozmadan, FK kolonlarda text + check kullanıyoruz)

-- ============================================================================
-- HİYERARŞİ — Module → Unit → Lesson → Exercise
-- ============================================================================

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  role text not null check (role in ('pilot', 'cabin', 'technician', 'ground', 'student')),
  number int not null,
  title text not null,
  title_tr text,
  description text,
  description_tr text,
  badge text,
  reward_xp int not null default 50,
  status content_status not null default 'draft',
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists modules_role_status_idx on public.modules (role, status);
create index if not exists modules_sort_idx on public.modules (role, sort);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  module_id uuid not null references public.modules(id) on delete cascade,
  number int not null,
  title text not null,
  title_tr text,
  description text,
  description_tr text,
  badge text,
  status content_status not null default 'draft',
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists units_module_idx on public.units (module_id, sort);
create index if not exists units_status_idx on public.units (status);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  unit_id uuid not null references public.units(id) on delete cascade,
  number int not null,
  title text not null,
  title_tr text,
  type lesson_type not null,
  xp int not null default 10,
  estimated_minutes int not null default 5,
  is_premium boolean not null default false,
  status content_status not null default 'draft',
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists lessons_unit_idx on public.lessons (unit_id, sort);
create index if not exists lessons_status_idx on public.lessons (status);

-- ============================================================================
-- VOCAB TERMS (önce — exercises bunu referans verebilir)
-- ============================================================================

create table if not exists public.vocab_terms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  role text check (role in ('pilot', 'cabin', 'technician', 'ground', 'student', 'all')),
  category text,
  term text not null,
  term_tr text,
  ipa text,
  pos text,
  definition text,
  definition_tr text,
  example text,
  example_tr text,
  difficulty smallint not null default 2 check (difficulty between 1 and 5),
  audio_url text,
  tags jsonb not null default '[]'::jsonb,
  is_premium boolean not null default false,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists vocab_terms_role_status_idx on public.vocab_terms (role, status);
create index if not exists vocab_terms_category_idx on public.vocab_terms (category);
create index if not exists vocab_terms_difficulty_idx on public.vocab_terms (difficulty);

-- ============================================================================
-- EXERCISES — bir lesson içinde sıralı egzersizler
-- ============================================================================

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  sort int not null,
  type exercise_type not null,
  vocab_term_id uuid references public.vocab_terms(id) on delete set null,
  prompt text,
  prompt_tr text,
  context text,
  context_tr text,
  options jsonb,
  correct_id text,
  alt_correct_ids jsonb,
  explanation text,
  explanation_tr text,
  detailed_explanation_tr text,
  audio_url text,
  image_url text,
  difficulty smallint not null default 2 check (difficulty between 1 and 5),
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create unique index if not exists exercises_lesson_sort_idx on public.exercises (lesson_id, sort);
create index if not exists exercises_type_idx on public.exercises (type);
create index if not exists exercises_status_idx on public.exercises (status);

-- ============================================================================
-- INTERVIEW QUESTIONS
-- ============================================================================

create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  role text not null check (role in ('pilot', 'cabin', 'technician', 'ground', 'student')),
  airline_slug text,
  category text not null check (category in (
    'motivational', 'situational', 'technical', 'behavioral', 'tricky', 'english',
    'manager', 'safety', 'crm', 'culture_knowledge', 'role_specific'
  )),
  difficulty smallint not null default 3 check (difficulty between 1 and 5),
  question text not null,
  question_tr text,
  good_answer_points_tr jsonb,
  red_flags_tr jsonb,
  tips_tr jsonb,
  detailed_explanation_tr text,
  star_template_tr text,
  follow_up_questions jsonb,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists iq_role_status_idx on public.interview_questions (role, status);
create index if not exists iq_airline_idx on public.interview_questions (airline_slug);
create index if not exists iq_category_idx on public.interview_questions (category);

-- ============================================================================
-- ICAO 4 QUESTIONS
-- ============================================================================

create table if not exists public.icao4_questions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  set_no smallint not null check (set_no between 1 and 5),
  section text not null check (section in ('vocabulary', 'phraseology', 'listening', 'reading')),
  level text not null check (level in ('B1', 'B2', 'B2+', 'C1')),
  question text not null,
  question_tr text,
  context text,
  audio_url text,
  options jsonb not null,
  correct_id text not null,
  explanation_tr text,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists icao4_set_section_idx on public.icao4_questions (set_no, section);
create index if not exists icao4_status_idx on public.icao4_questions (status);

-- ============================================================================
-- ORAL PROMPTS
-- ============================================================================

create table if not exists public.oral_prompts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  task_type text not null check (task_type in (
    'picture_description', 'story_telling', 'problem_solving', 'common_topics'
  )),
  level text not null check (level in ('B1', 'B2', 'B2+', 'C1')),
  prompt text,
  prompt_tr text,
  cues_tr jsonb,
  vocabulary_tr jsonb,
  image_url text,
  preparation_seconds int not null default 30,
  speaking_seconds int not null default 90,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists oral_task_level_idx on public.oral_prompts (task_type, level);
create index if not exists oral_status_idx on public.oral_prompts (status);

-- ============================================================================
-- PLACEMENT QUESTIONS
-- ============================================================================

create table if not exists public.placement_questions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  level text not null check (level in ('A1', 'A2', 'B1', 'B2', 'C1')),
  category text,
  dimension text not null check (dimension in (
    'general_english', 'aviation_english', 'aviation_knowledge', 'communication'
  )),
  format text check (format in ('short', 'passage', 'scenario')),
  roles jsonb not null default '["all"]'::jsonb,
  question text not null,
  question_tr text,
  context text,
  options jsonb not null,
  correct_id text not null,
  weight int not null default 1,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists placement_dim_level_idx on public.placement_questions (dimension, level);
create index if not exists placement_status_idx on public.placement_questions (status);

-- ============================================================================
-- AIRLINES
-- ============================================================================

create table if not exists public.airlines (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  iata_code text,
  country_emoji text,
  hub text,
  region text check (region in (
    'turkey', 'middle-east', 'europe-fsc', 'europe-lcc', 'asia', 'americas', 'oceania', 'africa'
  )),
  tier text check (tier in ('flag', 'lcc', 'regional', 'charter')),
  fleet_size int,
  destinations int,
  prestige smallint check (prestige between 1 and 5),
  hiring_status text check (hiring_status in ('open', 'closed', 'open_day_only', 'experienced_only')),
  insider_tip_tr text,
  pilot_interview jsonb,
  cabin_interview jsonb,
  technician_interview jsonb,
  ground_interview jsonb,
  student_interview jsonb,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists airlines_region_idx on public.airlines (region);
create index if not exists airlines_status_idx on public.airlines (status);

-- ============================================================================
-- SCENARIOS (AI Conversation senaryoları)
-- ============================================================================

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  role text check (role in ('pilot', 'cabin', 'technician', 'ground', 'student', 'all')),
  category text check (category in (
    'atc', 'cabin_emergency', 'maintenance_call', 'gate_announcement',
    'pre_flight', 'post_flight', 'irrops', 'medical', 'security'
  )),
  title text not null,
  title_tr text,
  setup text,
  setup_tr text,
  initial_message text,
  goal text,
  goal_tr text,
  difficulty smallint not null default 3 check (difficulty between 1 and 5),
  estimated_minutes int not null default 5,
  is_premium boolean not null default false,
  audio_intro_url text,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

create index if not exists scenarios_role_status_idx on public.scenarios (role, status);
create index if not exists scenarios_category_idx on public.scenarios (category);

-- ============================================================================
-- updated_at trigger (tüm içerik tabloları)
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'modules', 'units', 'lessons', 'exercises', 'vocab_terms',
    'interview_questions', 'icao4_questions', 'oral_prompts',
    'placement_questions', 'airlines', 'scenarios'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end $$;

-- ============================================================================
-- RLS — public read (published), admin write (editor+), super_admin delete
-- ============================================================================

-- Tablolar için RLS aktive et + policy uygula (DRY helper inline)
do $$
declare
  t text;
begin
  foreach t in array array[
    'modules', 'units', 'lessons', 'exercises', 'vocab_terms',
    'interview_questions', 'icao4_questions', 'oral_prompts',
    'placement_questions', 'airlines', 'scenarios'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);

    -- Public select sadece published rows (admin için ek policy aşağıda)
    execute format('drop policy if exists public_read_published on public.%I', t);
    execute format(
      $f$create policy public_read_published on public.%I
         for select
         using (status = 'published')$f$,
      t
    );

    -- Admin select all
    execute format('drop policy if exists admin_read_all on public.%I', t);
    execute format(
      $f$create policy admin_read_all on public.%I
         for select
         using (public.is_admin_user())$f$,
      t
    );

    -- Editor+ insert/update
    execute format('drop policy if exists editor_insert on public.%I', t);
    execute format(
      $f$create policy editor_insert on public.%I
         for insert
         with check (public.has_admin_role('editor'))$f$,
      t
    );

    execute format('drop policy if exists editor_update on public.%I', t);
    execute format(
      $f$create policy editor_update on public.%I
         for update
         using (public.has_admin_role('editor'))
         with check (public.has_admin_role('editor'))$f$,
      t
    );

    -- Super admin delete
    execute format('drop policy if exists super_admin_delete on public.%I', t);
    execute format(
      $f$create policy super_admin_delete on public.%I
         for delete
         using (public.has_admin_role('super_admin'))$f$,
      t
    );
  end loop;
end $$;

comment on table public.modules is 'Rol bazlı modüller (Module → Unit → Lesson hiyerarşisinin tepesi)';
comment on table public.units is 'Modül altındaki temalar (örn Holding & approach)';
comment on table public.lessons is 'Birim içindeki dersler';
comment on table public.exercises is 'Bir ders içindeki sıralı egzersizler — sort kolonu KRİTİK';
comment on table public.vocab_terms is 'Rol bazlı kelime hazinesi (binlerce terim)';
comment on table public.interview_questions is 'Mülakat soru bankası, havayolu × rol';
comment on table public.icao4_questions is 'ICAO Level 4 sınav soru bankası (3 set × 4 section)';
comment on table public.oral_prompts is 'Sözlü sınav prompt''ları (4 görev tipi)';
comment on table public.placement_questions is 'Seviye testi soruları (4 boyut)';
comment on table public.airlines is '41+ havayolu profili (interview pipeline''lar jsonb)';
comment on table public.scenarios is 'AI conversation senaryoları (rol × kategori)';

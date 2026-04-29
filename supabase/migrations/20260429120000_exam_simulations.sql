-- AirSpeak — exam_simulations + exam_questions_attempts + oral_exam_prompts
-- Sprint 7 / Hafta 13-14
--
-- Sınav simülasyon kayıtları (yazılı + sözlü), kullanıcı band score takibi,
-- AI examiner için sözlü prompt bankası.

-- ============================================================================
-- EXAM SIMULATIONS — kullanıcının başlattığı her sınav oturumu
-- ============================================================================
create table if not exists public.exam_simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  /** catalog.ts'deki ExamDefinition.id (örn: icao4_written_pilot) */
  exam_id text not null,
  /** Hangi set kullanıldı (set1/set2/set3 — ICAO 4 yazılı için) */
  set_id text,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  /** 0-100 toplam yüzde */
  score_percent numeric(5, 2),
  /** ICAO 1-6 band score (sözlü için) */
  band_score integer check (band_score between 1 and 6),
  /** Section bazlı detay JSONB: { sectionId: { correct, total, weight } } */
  section_breakdown jsonb,
  /** AI zayıflık özeti (sonuç ekranında gösterilir) */
  weakness_summary_tr text,
  passed boolean
);

create index if not exists exam_sim_user_idx on public.exam_simulations (user_id, started_at desc);
create index if not exists exam_sim_exam_idx on public.exam_simulations (exam_id);
create index if not exists exam_sim_status_idx on public.exam_simulations (status) where status = 'in_progress';

alter table public.exam_simulations enable row level security;

drop policy if exists "exam_sim_own" on public.exam_simulations;
create policy "exam_sim_own"
  on public.exam_simulations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- EXAM QUESTION ATTEMPTS — her bir soru için cevap kaydı
-- ============================================================================
create table if not exists public.exam_question_attempts (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.exam_simulations(id) on delete cascade,
  /** icao4Questions.ts'deki ExamQuestion.id */
  question_id text not null,
  section_id text not null,
  /** Kullanıcının seçtiği şık ('a' / 'b' / 'c' / 'd') */
  selected_option text,
  /** Doğru/yanlış */
  is_correct boolean,
  /** Kaç saniyede cevapladı */
  time_seconds integer,
  answered_at timestamptz not null default now()
);

create index if not exists exam_qa_sim_idx on public.exam_question_attempts (simulation_id);
create index if not exists exam_qa_question_idx on public.exam_question_attempts (question_id);

alter table public.exam_question_attempts enable row level security;

drop policy if exists "exam_qa_own" on public.exam_question_attempts;
create policy "exam_qa_own"
  on public.exam_question_attempts for all
  using (
    exists (
      select 1 from public.exam_simulations s
      where s.id = simulation_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.exam_simulations s
      where s.id = simulation_id and s.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ORAL EXAM PROMPTS — AI examiner için prompt bankası (read-only)
-- ============================================================================
create table if not exists public.oral_exam_prompts (
  id text primary key,
  task_type text not null check (task_type in ('picture_description', 'story_telling', 'problem_solving', 'common_topics')),
  prompt text not null,
  image_hint text,
  follow_ups jsonb not null default '[]'::jsonb,
  expected_topics jsonb not null default '[]'::jsonb,
  difficulty_hint text not null check (difficulty_hint in ('A1', 'A2', 'B1', 'B2', 'C1')),
  context text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists oral_prompts_task_idx on public.oral_exam_prompts (task_type) where active;

-- Kullanıcı sadece okuyabilir (içerik moderasyon backend'den geliyor)
alter table public.oral_exam_prompts enable row level security;

drop policy if exists "oral_prompts_read" on public.oral_exam_prompts;
create policy "oral_prompts_read"
  on public.oral_exam_prompts for select
  using (active = true);

-- ============================================================================
-- ORAL EXAM ATTEMPTS — kullanıcının her sözlü cevabı (transcript + skor)
-- ============================================================================
create table if not exists public.oral_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.exam_simulations(id) on delete cascade,
  prompt_id text not null references public.oral_exam_prompts(id),
  /** STT'den gelen ham transkript */
  transcript text,
  /** Audio storage path (Supabase Storage) — geri dinleme için */
  audio_path text,
  duration_seconds integer,
  /** ICAO 6 alan rubric: pronunciation, structure, vocab, fluency, comprehension, interactions (1-6) */
  rubric jsonb,
  /** Toplam band score (1-6) */
  band_score integer check (band_score between 1 and 6),
  /** AI feedback metni (TR) */
  feedback_tr text,
  attempted_at timestamptz not null default now()
);

create index if not exists oral_att_sim_idx on public.oral_exam_attempts (simulation_id);

alter table public.oral_exam_attempts enable row level security;

drop policy if exists "oral_att_own" on public.oral_exam_attempts;
create policy "oral_att_own"
  on public.oral_exam_attempts for all
  using (
    exists (
      select 1 from public.exam_simulations s
      where s.id = simulation_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.exam_simulations s
      where s.id = simulation_id and s.user_id = auth.uid()
    )
  );

-- AirSpeak — content_flags
-- Sprint 7 / Hafta 13-14
--
-- Apple App Store Safety Requirement 1.2 (UGC) + 5.6.2 Erişilebilirlik:
-- Tüm UGC ve sistem içerikleri için kullanıcının "bildir" akışı olmalı.
-- 24 saat içinde moderasyon hedefi.

-- ============================================================================
-- CONTENT FLAGS
-- ============================================================================
create table if not exists public.content_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  content_type text not null check (content_type in (
    'interview_question',
    'exam_question',
    'lesson_exercise',
    'vocabulary_term',
    'conversation_scenario',
    'phraseology_entry',
    'ai_response',
    'other'
  )),
  content_id text not null,
  reason text not null check (reason in (
    'inaccurate',
    'offensive',
    'copyright',
    'spam',
    'broken_audio',
    'other'
  )),
  comment text check (char_length(comment) <= 500),
  status text not null default 'pending' check (status in (
    'pending',
    'reviewed',
    'resolved',
    'dismissed'
  )),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewer_note text check (char_length(reviewer_note) <= 1000)
);

create index if not exists content_flags_user_id_idx on public.content_flags (user_id);
create index if not exists content_flags_status_idx on public.content_flags (status) where status = 'pending';
create index if not exists content_flags_content_idx on public.content_flags (content_type, content_id);
create index if not exists content_flags_created_at_idx on public.content_flags (created_at desc);

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.content_flags enable row level security;

-- Kullanıcı kendi raporlarını görebilir
drop policy if exists "content_flags_select_own" on public.content_flags;
create policy "content_flags_select_own"
  on public.content_flags for select
  using (auth.uid() = user_id);

-- Insert: auth zorunlu, user_id = auth.uid()
drop policy if exists "content_flags_insert_auth" on public.content_flags;
create policy "content_flags_insert_auth"
  on public.content_flags for insert
  with check (auth.uid() = user_id);

-- Update / Delete kullanıcı için yok — moderasyon backend tarafında.
-- Bir içeriği yanlışlıkla bildirdiyse: ek "withdraw" kayıt yerine support kanalı.

-- ============================================================================
-- DUPLICATE GUARD — aynı kullanıcı aynı içeriği 24 saat içinde tekrar bildirmesin
-- ============================================================================
create or replace function public.check_duplicate_flag()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1 from public.content_flags
    where user_id = new.user_id
      and content_type = new.content_type
      and content_id = new.content_id
      and created_at > now() - interval '24 hours'
  ) then
    raise exception 'duplicate_flag_within_24h' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_duplicate_flag on public.content_flags;
create trigger trg_check_duplicate_flag
  before insert on public.content_flags
  for each row
  execute function public.check_duplicate_flag();

-- ============================================================================
-- FLAG COUNT VIEW — moderatör paneli için
-- ============================================================================
create or replace view public.content_flag_counts as
select
  content_type,
  content_id,
  count(*) filter (where status = 'pending') as pending_count,
  count(*) as total_count,
  max(created_at) as last_flagged_at
from public.content_flags
group by content_type, content_id;

-- View'in RLS'i ana tablodan miras alır.

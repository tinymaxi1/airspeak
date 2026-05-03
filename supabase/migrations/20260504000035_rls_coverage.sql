-- Sprint 7.A — RLS coverage migration
-- 17 tablo'ya RLS aç + uygun policy'ler.
-- ============================================================================

-- ─── İÇERİK (10 tablo): authenticated public select, admin write ─────────
DO $$
DECLARE
  t text;
  content_tables text[] := ARRAY[
    'modules', 'units', 'lessons', 'vocab_terms', 'exercises',
    'interview_questions', 'icao4_questions', 'oral_prompts',
    'placement_questions', 'airlines'
  ];
BEGIN
  FOREACH t IN ARRAY content_tables LOOP
    -- Eğer tablo varsa
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('alter table public.%I enable row level security', t);

      EXECUTE format('drop policy if exists "%s_select_all" on public.%I', t, t);
      EXECUTE format($pol$
        create policy "%s_select_all" on public.%I
          for select using (auth.role() = 'authenticated' or auth.role() = 'anon')
      $pol$, t, t);

      EXECUTE format('drop policy if exists "%s_admin_insert" on public.%I', t, t);
      EXECUTE format($pol$
        create policy "%s_admin_insert" on public.%I
          for insert with check (public.is_admin_user())
      $pol$, t, t);

      EXECUTE format('drop policy if exists "%s_admin_update" on public.%I', t, t);
      EXECUTE format($pol$
        create policy "%s_admin_update" on public.%I
          for update using (public.is_admin_user()) with check (public.is_admin_user())
      $pol$, t, t);

      EXECUTE format('drop policy if exists "%s_admin_delete" on public.%I', t, t);
      EXECUTE format($pol$
        create policy "%s_admin_delete" on public.%I
          for delete using (public.is_admin_user())
      $pol$, t, t);
    END IF;
  END LOOP;
END $$;

-- ─── USER DATA (4 tablo): own-only ───────────────────────────────────────
-- user_xp_summary
alter table if exists public.user_xp_summary enable row level security;
drop policy if exists "user_xp_summary_own_select" on public.user_xp_summary;
create policy "user_xp_summary_own_select" on public.user_xp_summary
  for select using (auth.uid() = user_id);
drop policy if exists "user_xp_summary_own_update" on public.user_xp_summary;
create policy "user_xp_summary_own_update" on public.user_xp_summary
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user_xp_summary_admin_all" on public.user_xp_summary;
create policy "user_xp_summary_admin_all" on public.user_xp_summary
  for select using (public.is_admin_user());

-- streaks
alter table if exists public.streaks enable row level security;
drop policy if exists "streaks_own_select" on public.streaks;
create policy "streaks_own_select" on public.streaks
  for select using (auth.uid() = user_id);
drop policy if exists "streaks_own_update" on public.streaks;
create policy "streaks_own_update" on public.streaks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "streaks_admin_select" on public.streaks;
create policy "streaks_admin_select" on public.streaks
  for select using (public.is_admin_user());

-- user_lesson_progress
alter table if exists public.user_lesson_progress enable row level security;
drop policy if exists "user_lesson_progress_own_select" on public.user_lesson_progress;
create policy "user_lesson_progress_own_select" on public.user_lesson_progress
  for select using (auth.uid() = user_id);
drop policy if exists "user_lesson_progress_own_insert" on public.user_lesson_progress;
create policy "user_lesson_progress_own_insert" on public.user_lesson_progress
  for insert with check (auth.uid() = user_id);
drop policy if exists "user_lesson_progress_own_update" on public.user_lesson_progress;
create policy "user_lesson_progress_own_update" on public.user_lesson_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user_lesson_progress_admin_select" on public.user_lesson_progress;
create policy "user_lesson_progress_admin_select" on public.user_lesson_progress
  for select using (public.is_admin_user());

-- user_experiences
alter table if exists public.user_experiences enable row level security;
drop policy if exists "user_experiences_own_select" on public.user_experiences;
create policy "user_experiences_own_select" on public.user_experiences
  for select using (auth.uid() = user_id);
drop policy if exists "user_experiences_own_insert" on public.user_experiences;
create policy "user_experiences_own_insert" on public.user_experiences
  for insert with check (auth.uid() = user_id);
drop policy if exists "user_experiences_own_update" on public.user_experiences;
create policy "user_experiences_own_update" on public.user_experiences
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user_experiences_own_delete" on public.user_experiences;
create policy "user_experiences_own_delete" on public.user_experiences
  for delete using (auth.uid() = user_id);
drop policy if exists "user_experiences_admin_select" on public.user_experiences;
create policy "user_experiences_admin_select" on public.user_experiences
  for select using (public.is_admin_user());

-- ─── LEAGUE (3 tablo): public select, service-role write only ────────────
-- Cron rotasyonu (Sprint 4) service_role ile yazıyor → RLS bypass eder.
-- Anon authenticated INSERT/UPDATE/DELETE engelli.

alter table if exists public.league_seasons enable row level security;
drop policy if exists "league_seasons_select_all" on public.league_seasons;
create policy "league_seasons_select_all" on public.league_seasons
  for select using (auth.role() = 'authenticated' or auth.role() = 'anon');
drop policy if exists "league_seasons_admin_write" on public.league_seasons;
create policy "league_seasons_admin_write" on public.league_seasons
  for all using (public.is_admin_user()) with check (public.is_admin_user());

alter table if exists public.league_groups enable row level security;
drop policy if exists "league_groups_select_all" on public.league_groups;
create policy "league_groups_select_all" on public.league_groups
  for select using (auth.role() = 'authenticated' or auth.role() = 'anon');
drop policy if exists "league_groups_admin_write" on public.league_groups;
create policy "league_groups_admin_write" on public.league_groups
  for all using (public.is_admin_user()) with check (public.is_admin_user());

alter table if exists public.league_memberships enable row level security;
drop policy if exists "league_memberships_select_all" on public.league_memberships;
create policy "league_memberships_select_all" on public.league_memberships
  for select using (auth.role() = 'authenticated' or auth.role() = 'anon');
drop policy if exists "league_memberships_admin_write" on public.league_memberships;
create policy "league_memberships_admin_write" on public.league_memberships
  for all using (public.is_admin_user()) with check (public.is_admin_user());

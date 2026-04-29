-- AirSpeak — Content versioning + realtime publish broadcast
-- Faz 0.3: Her içerik değişikliği snapshot'a yazılır; published olunca pg_notify ile yayınlanır.

-- ============================================================================
-- CONTENT REVISIONS — versioning
-- ============================================================================

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id uuid not null,
  snapshot jsonb not null,
  status_before content_status,
  status_after content_status,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists content_revisions_table_row_idx
  on public.content_revisions (table_name, row_id, created_at desc);
create index if not exists content_revisions_actor_idx
  on public.content_revisions (created_by, created_at desc);

alter table public.content_revisions enable row level security;

drop policy if exists revisions_admin_read on public.content_revisions;
create policy revisions_admin_read
  on public.content_revisions
  for select
  using (public.is_admin_user());

drop policy if exists revisions_admin_write on public.content_revisions;
create policy revisions_admin_write
  on public.content_revisions
  for insert
  with check (public.has_admin_role('editor'));

comment on table public.content_revisions is 'Her UPDATE öncesi otomatik snapshot — geri al + diff için';

-- ============================================================================
-- TRIGGER: snapshot before update
-- ============================================================================

create or replace function public.snapshot_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_status content_status;
  new_status content_status;
begin
  -- Eski hâli snapshot'a yaz
  begin
    old_status := old.status;
  exception when others then
    old_status := null;
  end;

  begin
    new_status := new.status;
  exception when others then
    new_status := null;
  end;

  insert into public.content_revisions (table_name, row_id, snapshot, status_before, status_after, created_by)
  values (tg_table_name, old.id, to_jsonb(old), old_status, new_status, auth.uid());

  return new;
end;
$$;

-- 11 içerik tablosuna trigger uygula
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
    execute format('drop trigger if exists snapshot_revision on public.%I', t);
    execute format(
      'create trigger snapshot_revision before update on public.%I for each row execute function public.snapshot_before_update()',
      t
    );
  end loop;
end $$;

-- ============================================================================
-- TRIGGER: pg_notify on publish (realtime için)
-- ============================================================================

create or replace function public.notify_content_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_status content_status;
  new_status content_status;
  payload jsonb;
begin
  -- INSERT'lerde old null olur
  if tg_op = 'INSERT' then
    new_status := new.status;
    if new_status = 'published' then
      payload := jsonb_build_object('table', tg_table_name, 'op', 'INSERT', 'id', new.id, 'slug', new.slug);
      perform pg_notify('content_published', payload::text);
    end if;
  elsif tg_op = 'UPDATE' then
    old_status := old.status;
    new_status := new.status;
    if old_status is distinct from new_status and new_status in ('published', 'archived') then
      payload := jsonb_build_object(
        'table', tg_table_name,
        'op', 'UPDATE',
        'id', new.id,
        'slug', new.slug,
        'old_status', old_status,
        'new_status', new_status
      );
      perform pg_notify('content_published', payload::text);
    end if;
  end if;

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
    execute format('drop trigger if exists notify_publish on public.%I', t);
    execute format(
      'create trigger notify_publish after insert or update on public.%I for each row execute function public.notify_content_published()',
      t
    );
  end loop;
end $$;

comment on function public.snapshot_before_update() is 'Her UPDATE öncesi mevcut hâli content_revisions''a kopyalar';
comment on function public.notify_content_published() is 'Status published olunca pg_notify ile mobile app''e haber verir';

-- ============================================================================
-- HELPER: Bir kaydın son N revizyonunu getir
-- ============================================================================

create or replace function public.get_revisions(target_table text, target_id uuid, limit_count int default 10)
returns table (
  id uuid,
  snapshot jsonb,
  status_before content_status,
  status_after content_status,
  created_by uuid,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select id, snapshot, status_before, status_after, created_by, created_at
  from public.content_revisions
  where table_name = target_table and row_id = target_id
  order by created_at desc
  limit limit_count
$$;

comment on function public.get_revisions(text, uuid, int) is 'Bir içerik kaydının son N revizyonunu döndürür (admin paneli geçmiş tab)';

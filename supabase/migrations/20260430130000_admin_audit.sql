-- AirSpeak — Admin actions audit log
-- Faz 0.4: Her admin aksiyonu (create/update/delete/publish/ban_user) kaydedilir.

-- ============================================================================
-- ADMIN ACTIONS
-- ============================================================================

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in (
    'create', 'update', 'delete',
    'publish', 'unpublish', 'archive', 'restore',
    'set_premium', 'unset_premium',
    'ban_user', 'unban_user',
    'set_admin_role', 'unset_admin_role',
    'login', 'export', 'import', 'bulk_update'
  )),
  table_name text,
  row_id uuid,
  target_user_id uuid references auth.users(id) on delete set null,
  diff jsonb,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists admin_actions_actor_idx on public.admin_actions (actor_id, created_at desc);
create index if not exists admin_actions_target_user_idx on public.admin_actions (target_user_id, created_at desc);
create index if not exists admin_actions_action_idx on public.admin_actions (action, created_at desc);
create index if not exists admin_actions_table_idx on public.admin_actions (table_name, row_id, created_at desc);
create index if not exists admin_actions_created_at_idx on public.admin_actions (created_at desc);

alter table public.admin_actions enable row level security;

-- Sadece admin kendi action'larını + diğer adminlerin action'larını görebilir
drop policy if exists admin_read_audit on public.admin_actions;
create policy admin_read_audit
  on public.admin_actions
  for select
  using (public.is_admin_user());

-- Server-side insert (Edge Function veya backend service_role ile yazar — RLS bypass)
-- Client-side insert: admin kendi adına insert edebilir
drop policy if exists admin_self_insert_audit on public.admin_actions;
create policy admin_self_insert_audit
  on public.admin_actions
  for insert
  with check (public.is_admin_user() and actor_id = auth.uid());

-- Admin actions silinmesin (audit immutability)
drop policy if exists no_delete_audit on public.admin_actions;
create policy no_delete_audit
  on public.admin_actions
  for delete
  using (false);

comment on table public.admin_actions is 'Tüm admin aksiyonlarının audit logu — silinmez, sadece append-only';

-- ============================================================================
-- HELPER: Action kaydı eklemek için
-- ============================================================================

create or replace function public.log_admin_action(
  p_action text,
  p_table_name text default null,
  p_row_id uuid default null,
  p_target_user_id uuid default null,
  p_diff jsonb default null,
  p_metadata jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  log_id uuid;
begin
  if not public.is_admin_user() then
    raise exception 'Sadece admin kullanıcılar action loglayabilir';
  end if;

  insert into public.admin_actions (
    actor_id, action, table_name, row_id, target_user_id, diff, metadata
  )
  values (
    auth.uid(), p_action, p_table_name, p_row_id, p_target_user_id, p_diff, p_metadata
  )
  returning id into log_id;

  return log_id;
end;
$$;

comment on function public.log_admin_action(text, text, uuid, uuid, jsonb, jsonb)
  is 'Admin action audit logu yazmak için kullanılır (admin paneli + Edge Functions çağırır)';

-- ============================================================================
-- TRIGGER: profiles.is_admin / admin_role / banned_at değişikliklerini auto-log
-- ============================================================================

create or replace function public.audit_profile_admin_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- is_admin değişti
  if new.is_admin is distinct from old.is_admin then
    insert into public.admin_actions (actor_id, action, target_user_id, metadata)
    values (
      auth.uid(),
      case when new.is_admin then 'set_admin_role' else 'unset_admin_role' end,
      new.id,
      jsonb_build_object('is_admin', new.is_admin, 'admin_role', new.admin_role)
    );
  end if;

  -- admin_role değişti
  if new.admin_role is distinct from old.admin_role then
    insert into public.admin_actions (actor_id, action, target_user_id, metadata)
    values (
      auth.uid(),
      'set_admin_role',
      new.id,
      jsonb_build_object('old_role', old.admin_role, 'new_role', new.admin_role)
    );
  end if;

  -- banned_at değişti
  if new.banned_at is distinct from old.banned_at then
    insert into public.admin_actions (actor_id, action, target_user_id, metadata)
    values (
      auth.uid(),
      case when new.banned_at is not null then 'ban_user' else 'unban_user' end,
      new.id,
      jsonb_build_object('reason', new.ban_reason, 'banned_at', new.banned_at)
    );
  end if;

  -- premium_until değişti
  if new.premium_until is distinct from old.premium_until then
    insert into public.admin_actions (actor_id, action, target_user_id, metadata)
    values (
      auth.uid(),
      case when new.premium_until > now() then 'set_premium' else 'unset_premium' end,
      new.id,
      jsonb_build_object('premium_until', new.premium_until)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_audit_admin on public.profiles;
create trigger profiles_audit_admin
  after update on public.profiles
  for each row
  execute function public.audit_profile_admin_changes();

-- ============================================================================
-- TRIGGER: İçerik tablolarında otomatik audit (create/update/delete)
-- ============================================================================

create or replace function public.audit_content_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  action_name text;
  diff_jsonb jsonb;
begin
  -- Sadece admin yapıyorsa logla (auth.uid() null değilse)
  if auth.uid() is null then
    return coalesce(new, old);
  end if;

  case tg_op
    when 'INSERT' then
      action_name := 'create';
      diff_jsonb := jsonb_build_object('after', to_jsonb(new));
    when 'UPDATE' then
      -- Status değişimi özel action olarak işaretlenir
      if old.status is distinct from new.status then
        action_name := case new.status::text
          when 'published' then 'publish'
          when 'archived' then 'archive'
          when 'draft' then case old.status::text when 'archived' then 'restore' else 'unpublish' end
          else 'update'
        end;
      else
        action_name := 'update';
      end if;
      diff_jsonb := jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new));
    when 'DELETE' then
      action_name := 'delete';
      diff_jsonb := jsonb_build_object('before', to_jsonb(old));
  end case;

  insert into public.admin_actions (actor_id, action, table_name, row_id, diff)
  values (
    auth.uid(),
    action_name,
    tg_table_name,
    coalesce(new.id, old.id),
    diff_jsonb
  );

  return coalesce(new, old);
end;
$$;

-- 11 içerik tablosuna audit trigger uygula
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
    execute format('drop trigger if exists audit_change on public.%I', t);
    execute format(
      'create trigger audit_change after insert or update or delete on public.%I for each row execute function public.audit_content_change()',
      t
    );
  end loop;
end $$;

-- ============================================================================
-- VIEW: Audit log özet (UI için pratik)
-- ============================================================================

create or replace view public.admin_actions_view as
select
  a.id,
  a.actor_id,
  p.username as actor_username,
  p.full_name as actor_name,
  a.action,
  a.table_name,
  a.row_id,
  a.target_user_id,
  tp.username as target_username,
  a.diff,
  a.metadata,
  a.created_at
from public.admin_actions a
left join public.profiles p on p.id = a.actor_id
left join public.profiles tp on tp.id = a.target_user_id;

grant select on public.admin_actions_view to authenticated;

comment on view public.admin_actions_view is 'Audit log + actor/target kullanıcı adlarıyla join''lenmiş hâli';

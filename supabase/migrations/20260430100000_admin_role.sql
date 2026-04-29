-- AirSpeak — Admin role + helper functions
-- Faz 0.1: profiles tablosuna admin alanları + role-bazlı yardımcı fonksiyonlar

-- ============================================================================
-- PROFILES — admin role kolonları
-- ============================================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists admin_role text check (admin_role in ('super_admin', 'editor', 'reviewer')),
  add column if not exists premium_until timestamptz,
  add column if not exists banned_at timestamptz,
  add column if not exists ban_reason text;

create index if not exists profiles_is_admin_idx on public.profiles (is_admin) where is_admin = true;
create index if not exists profiles_premium_idx on public.profiles (premium_until) where premium_until is not null;
create index if not exists profiles_banned_idx on public.profiles (banned_at) where banned_at is not null;

comment on column public.profiles.is_admin is 'true ise admin paneline erişebilir';
comment on column public.profiles.admin_role is 'super_admin (her şey) > editor (içerik CRUD) > reviewer (publish onay)';
comment on column public.profiles.premium_until is 'null veya geçmiş = ücretsiz; gelecek tarih = premium aktif';
comment on column public.profiles.banned_at is 'null değilse hesap askıya alınmıştır';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Mevcut kullanıcı admin mi?
create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  )
$$;

-- Mevcut kullanıcı belirli admin rolüne sahip mi?
-- Hierarchy: super_admin (3) > editor (2) > reviewer (1)
create or replace function public.has_admin_role(min_role text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  user_lvl int;
  required_lvl int;
begin
  select case admin_role
    when 'super_admin' then 3
    when 'editor' then 2
    when 'reviewer' then 1
    else 0
  end
  into user_lvl
  from public.profiles
  where id = auth.uid();

  required_lvl := case min_role
    when 'super_admin' then 3
    when 'editor' then 2
    when 'reviewer' then 1
    else 0
  end;

  return coalesce(user_lvl, 0) >= required_lvl;
end;
$$;

-- Premium aktif mi?
create or replace function public.is_premium_user(target_user_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select premium_until > now() from public.profiles where id = coalesce(target_user_id, auth.uid())),
    false
  )
$$;

-- Yasaklı mı?
create or replace function public.is_banned_user(target_user_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select banned_at is not null from public.profiles where id = coalesce(target_user_id, auth.uid())),
    false
  )
$$;

comment on function public.is_admin_user() is 'Mevcut auth kullanıcısı admin mi (RLS policy''lerinde kullanılır)';
comment on function public.has_admin_role(text) is 'Hiyerarşik admin rol kontrolü: super_admin > editor > reviewer';
comment on function public.is_premium_user(uuid) is 'Premium üyelik aktif mi (tarih > now)';
comment on function public.is_banned_user(uuid) is 'Hesap askıya alınmış mı';

-- ============================================================================
-- RLS — admin kendi profilini ve diğer kullanıcı profillerini görebilsin
-- ============================================================================

-- Mevcut RLS policy'lerini koruyoruz (kullanıcı kendi profilini görür/değiştirir)
-- Yeni: admin tüm profilleri görebilir + güncelleyebilir
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles
  for select
  using (public.is_admin_user());

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
  on public.profiles
  for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

-- Sadece super_admin kullanıcıları silebilir veya is_admin / admin_role değiştirebilir
-- (UI tarafında ek kontrol; SQL'de güvenli olmak için trigger'la garantilenir)
create or replace function public.guard_admin_role_changes()
returns trigger
language plpgsql
security definer
as $$
begin
  -- is_admin veya admin_role değişiyorsa, sadece super_admin yapabilir
  if (new.is_admin is distinct from old.is_admin or new.admin_role is distinct from old.admin_role)
     and not public.has_admin_role('super_admin') then
    raise exception 'Sadece super_admin kullanıcılar admin rollerini değiştirebilir';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_admin_role on public.profiles;
create trigger profiles_guard_admin_role
  before update on public.profiles
  for each row
  execute function public.guard_admin_role_changes();

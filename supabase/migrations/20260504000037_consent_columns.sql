-- Sprint 8.B — Kayıt sırasında alınan onayların DB kaydı
-- KVKK md.10 + ETK md.6 (İYS) uyumu için.
-- ============================================================================

alter table public.profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists kvkk_accepted_at timestamptz,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz;

create index if not exists profiles_marketing_consent_idx
  on public.profiles (marketing_consent)
  where marketing_consent = true;

-- RPC: kullanıcı kayıt sonrası onay timestamps'lerini set eder
create or replace function public.record_signup_consents(
  p_terms boolean,
  p_kvkk boolean,
  p_marketing boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := now();
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  if not p_terms or not p_kvkk then
    return jsonb_build_object('ok', false, 'error', 'mandatory_consents_missing');
  end if;

  update public.profiles
     set terms_accepted_at = coalesce(terms_accepted_at, v_now),
         kvkk_accepted_at  = coalesce(kvkk_accepted_at,  v_now),
         marketing_consent = p_marketing,
         marketing_consent_at = case when p_marketing then v_now else null end
   where id = v_uid;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.record_signup_consents(boolean, boolean, boolean) from public;
grant execute on function public.record_signup_consents(boolean, boolean, boolean) to authenticated;

-- RPC: kullanıcı pazarlama iznini sonradan değiştirebilir (Settings)
create or replace function public.set_marketing_consent(p_enabled boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  update public.profiles
     set marketing_consent = p_enabled,
         marketing_consent_at = case when p_enabled then now() else null end
   where id = v_uid;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.set_marketing_consent(boolean) from public;
grant execute on function public.set_marketing_consent(boolean) to authenticated;

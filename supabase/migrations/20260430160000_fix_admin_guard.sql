-- Admin role guard trigger düzeltme:
-- service_role (auth.uid() = null) için bypass; sadece authenticated kullanıcılarda kontrol et.

create or replace function public.guard_admin_role_changes()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Service role veya migration (auth.uid() null) için bypass
  if auth.uid() is null then
    return new;
  end if;

  -- is_admin veya admin_role değişiyorsa, sadece super_admin yapabilir
  if (new.is_admin is distinct from old.is_admin or new.admin_role is distinct from old.admin_role)
     and not public.has_admin_role('super_admin') then
    raise exception 'Sadece super_admin kullanıcılar admin rollerini değiştirebilir';
  end if;
  return new;
end;
$$;

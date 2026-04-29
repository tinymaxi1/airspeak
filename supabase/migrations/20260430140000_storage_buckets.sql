-- AirSpeak — Storage buckets (audio + images)
-- Faz 0.5: 5 bucket — public read (CDN), admin write (editor+).

-- ============================================================================
-- BUCKETS
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  -- Lesson içeriği için ses dosyaları (egzersiz audio)
  ('lesson-audio', 'lesson-audio', true, 5 * 1024 * 1024,
    array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg']),

  -- Vocab terim telaffuz dosyaları
  ('vocab-audio', 'vocab-audio', true, 1 * 1024 * 1024,
    array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg']),

  -- Lesson görselleri (illüstrasyon, diagram)
  ('lesson-images', 'lesson-images', true, 2 * 1024 * 1024,
    array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),

  -- Sözlü sınav prompt'larının görselleri (resim tasviri görevi)
  ('oral-prompt-images', 'oral-prompt-images', true, 3 * 1024 * 1024,
    array['image/jpeg', 'image/png', 'image/webp']),

  -- Kullanıcı avatar'ları
  ('user-avatars', 'user-avatars', true, 1 * 1024 * 1024,
    array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================================
-- RLS POLICIES — admin write, public read
-- ============================================================================

-- lesson-audio: editor+ write, public read
drop policy if exists "lesson-audio public read" on storage.objects;
create policy "lesson-audio public read"
  on storage.objects
  for select
  using (bucket_id = 'lesson-audio');

drop policy if exists "lesson-audio editor write" on storage.objects;
create policy "lesson-audio editor write"
  on storage.objects
  for insert
  with check (bucket_id = 'lesson-audio' and public.has_admin_role('editor'));

drop policy if exists "lesson-audio editor update" on storage.objects;
create policy "lesson-audio editor update"
  on storage.objects
  for update
  using (bucket_id = 'lesson-audio' and public.has_admin_role('editor'));

drop policy if exists "lesson-audio super delete" on storage.objects;
create policy "lesson-audio super delete"
  on storage.objects
  for delete
  using (bucket_id = 'lesson-audio' and public.has_admin_role('super_admin'));

-- vocab-audio: editor+ write, public read
drop policy if exists "vocab-audio public read" on storage.objects;
create policy "vocab-audio public read"
  on storage.objects
  for select
  using (bucket_id = 'vocab-audio');

drop policy if exists "vocab-audio editor write" on storage.objects;
create policy "vocab-audio editor write"
  on storage.objects
  for insert
  with check (bucket_id = 'vocab-audio' and public.has_admin_role('editor'));

drop policy if exists "vocab-audio editor update" on storage.objects;
create policy "vocab-audio editor update"
  on storage.objects
  for update
  using (bucket_id = 'vocab-audio' and public.has_admin_role('editor'));

drop policy if exists "vocab-audio super delete" on storage.objects;
create policy "vocab-audio super delete"
  on storage.objects
  for delete
  using (bucket_id = 'vocab-audio' and public.has_admin_role('super_admin'));

-- lesson-images
drop policy if exists "lesson-images public read" on storage.objects;
create policy "lesson-images public read"
  on storage.objects
  for select
  using (bucket_id = 'lesson-images');

drop policy if exists "lesson-images editor write" on storage.objects;
create policy "lesson-images editor write"
  on storage.objects
  for insert
  with check (bucket_id = 'lesson-images' and public.has_admin_role('editor'));

drop policy if exists "lesson-images editor update" on storage.objects;
create policy "lesson-images editor update"
  on storage.objects
  for update
  using (bucket_id = 'lesson-images' and public.has_admin_role('editor'));

drop policy if exists "lesson-images super delete" on storage.objects;
create policy "lesson-images super delete"
  on storage.objects
  for delete
  using (bucket_id = 'lesson-images' and public.has_admin_role('super_admin'));

-- oral-prompt-images
drop policy if exists "oral-prompt-images public read" on storage.objects;
create policy "oral-prompt-images public read"
  on storage.objects
  for select
  using (bucket_id = 'oral-prompt-images');

drop policy if exists "oral-prompt-images editor write" on storage.objects;
create policy "oral-prompt-images editor write"
  on storage.objects
  for insert
  with check (bucket_id = 'oral-prompt-images' and public.has_admin_role('editor'));

drop policy if exists "oral-prompt-images editor update" on storage.objects;
create policy "oral-prompt-images editor update"
  on storage.objects
  for update
  using (bucket_id = 'oral-prompt-images' and public.has_admin_role('editor'));

drop policy if exists "oral-prompt-images super delete" on storage.objects;
create policy "oral-prompt-images super delete"
  on storage.objects
  for delete
  using (bucket_id = 'oral-prompt-images' and public.has_admin_role('super_admin'));

-- user-avatars: kullanıcı kendi avatar'ını yükler, herkes okur
drop policy if exists "user-avatars public read" on storage.objects;
create policy "user-avatars public read"
  on storage.objects
  for select
  using (bucket_id = 'user-avatars');

drop policy if exists "user-avatars own write" on storage.objects;
create policy "user-avatars own write"
  on storage.objects
  for insert
  with check (
    bucket_id = 'user-avatars'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin_user())
  );

drop policy if exists "user-avatars own update" on storage.objects;
create policy "user-avatars own update"
  on storage.objects
  for update
  using (
    bucket_id = 'user-avatars'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin_user())
  );

drop policy if exists "user-avatars own delete" on storage.objects;
create policy "user-avatars own delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'user-avatars'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.has_admin_role('super_admin'))
  );

-- ============================================================================
-- HELPER: Bucket boyutu istatistikleri (admin paneli storage sayfası)
-- ============================================================================

create or replace function public.get_bucket_stats()
returns table (
  bucket_id text,
  file_count bigint,
  total_size_bytes bigint
)
language sql
stable
security definer
set search_path = public, storage
as $$
  select
    bucket_id,
    count(*)::bigint as file_count,
    coalesce(sum((metadata->>'size')::bigint), 0) as total_size_bytes
  from storage.objects
  group by bucket_id
  order by bucket_id
$$;

revoke execute on function public.get_bucket_stats() from public;
grant execute on function public.get_bucket_stats() to authenticated;

comment on function public.get_bucket_stats() is 'Admin paneli için bucket başına dosya sayısı ve toplam boyut';

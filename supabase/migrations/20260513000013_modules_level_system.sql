-- Level system — profiles.level genişlet + modules.level kolonu + backfill
-- FAZ 1 — Level system + admin role expansion + empty state

-- 1) profiles.level CHECK constraint genişlet (A0 + C2 dahil)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_level_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_level_check
  CHECK (level IS NULL OR level IN ('A0','A1','A2','B1','B2','C1','C2'));

-- 2) modules.level kolonu
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS level text
  CHECK (level IS NULL OR level IN ('A0','A1','A2','B1','B2','C1','C2'));

CREATE INDEX IF NOT EXISTS idx_modules_role_level_sort
  ON public.modules (role, level, sort);

COMMENT ON COLUMN public.modules.level IS
  'CEFR level: A0/A1/A2/B1/B2/C1/C2. NULL = legacy module (slug-based).';

-- 3) Backfill mevcut modülleri slug'tan extract
UPDATE public.modules SET level = 'A0' WHERE slug ~ '-a0$' AND level IS NULL;
UPDATE public.modules SET level = 'A1' WHERE slug ~ '-a1$' AND level IS NULL;
UPDATE public.modules SET level = 'A2' WHERE slug ~ '-a2$' AND level IS NULL;
UPDATE public.modules SET level = 'B1' WHERE slug ~ '-b1$' AND level IS NULL;
UPDATE public.modules SET level = 'B2' WHERE slug ~ '-b2$' AND level IS NULL;
UPDATE public.modules SET level = 'C1' WHERE slug ~ '-c1$' AND level IS NULL;
UPDATE public.modules SET level = 'C2' WHERE slug ~ '-c2$' AND level IS NULL;

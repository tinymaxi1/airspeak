-- Sprint 10.A — exercise_type enum genişletme + 3 yeni kolon
-- NOT: ALTER TYPE ADD VALUE pg kısıtı: yeni enum değerleri aynı tx'te
-- CHECK constraint içinde kullanılamaz. CHECK constraint 042 migrasyonunda.
-- ============================================================================

-- 1. exercise_type enum genişlet (her statement implicit commit)
ALTER TYPE public.exercise_type ADD VALUE IF NOT EXISTS 'matching';
ALTER TYPE public.exercise_type ADD VALUE IF NOT EXISTS 'ordering';
ALTER TYPE public.exercise_type ADD VALUE IF NOT EXISTS 'true_false';

-- 2. exercises tablosuna 3 yeni kolon
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS pairs jsonb,
  ADD COLUMN IF NOT EXISTS correct_order jsonb,
  ADD COLUMN IF NOT EXISTS is_true boolean;

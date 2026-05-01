-- Sprint 10.E (devam) — exercise_type enum genişletme v2
-- Yeni naming: fill_blank, listening, speaking + 2 yeni kolon
-- (mevcut fill-blank, listening-mc, pronunciation-record paralel kalır)
-- ============================================================================

-- 1. enum genişlet (3 yeni değer; her statement implicit commit)
ALTER TYPE public.exercise_type ADD VALUE IF NOT EXISTS 'fill_blank';
ALTER TYPE public.exercise_type ADD VALUE IF NOT EXISTS 'listening';
ALTER TYPE public.exercise_type ADD VALUE IF NOT EXISTS 'speaking';

-- 2. exercises tablosuna 2 yeni kolon
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS transcript text,
  ADD COLUMN IF NOT EXISTS target_text text;

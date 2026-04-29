-- AirSpeak — TS seed değerleriyle DB check constraint'lerini hizala
-- Faz 1 migration başlamadan önce gerekli düzeltmeler.

-- ============================================================================
-- airlines.tier: 'flagship' | 'major' | 'lcc' | 'regional' | 'cargo'
-- ============================================================================

alter table public.airlines
  drop constraint if exists airlines_tier_check;

alter table public.airlines
  add constraint airlines_tier_check
  check (tier in ('flagship', 'major', 'lcc', 'regional', 'cargo', 'charter', 'flag'));

-- ============================================================================
-- airlines.hiring_status: zaten doğru ama emin olalım
-- ============================================================================

alter table public.airlines
  drop constraint if exists airlines_hiring_status_check;

alter table public.airlines
  add constraint airlines_hiring_status_check
  check (hiring_status in ('open', 'closed', 'open_day_only', 'experienced_only'));

-- ============================================================================
-- interview_questions.category: TS seed'den gelen tüm değerler
-- (motivational, situational, technical, behavioral, tricky, english,
--  manager, safety, crm, culture_knowledge, role_specific)
-- ============================================================================

-- Mevcut değerlerin tümü zaten kabul edilmiş durumda (zaten doğruydu).

-- ============================================================================
-- placement_questions.dimension: TS'te camelCase (generalEnglish), DB'de snake_case
-- Migration script camelCase → snake_case dönüşümü yapar; DB hem ikisini kabul etsin
-- ============================================================================

alter table public.placement_questions
  drop constraint if exists placement_questions_dimension_check;

alter table public.placement_questions
  add constraint placement_questions_dimension_check
  check (dimension in (
    'general_english', 'aviation_english', 'aviation_knowledge', 'communication',
    'generalEnglish', 'aviationEnglish', 'aviationKnowledge'  -- TS camelCase fallback
  ));

-- ============================================================================
-- placement_questions.category: NULL veya çeşitli string (TS Category enum)
-- TS değerleri: vocabulary, listening, phraseology, grammar, reading, critical
-- ============================================================================

-- Şu an check yok, eklemiyoruz — admin paneli serbest text kabul etmeli.

-- ============================================================================
-- icao4_questions.section: TS'te bazıları farklı isim taşıyor
-- ============================================================================

alter table public.icao4_questions
  drop constraint if exists icao4_questions_section_check;

alter table public.icao4_questions
  add constraint icao4_questions_section_check
  check (section in (
    'vocabulary', 'phraseology', 'listening', 'reading', 'grammar', 'critical'
  ));

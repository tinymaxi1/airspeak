-- Sprint 11.A.1 — aviation_glossary kullanıcı sözlüğüne genişletme
-- vocab_terms (ders içeriği) ayrı kalır, aviation_glossary mobile sözlük sekmesi
-- için public lookup tablosuna dönüşür. Ayrıca AI çeviri referansı görevini sürdürür.
--
-- 50K terim hedefi için: ek kolonlar (ipa, pos, difficulty, audio, image, tags),
-- term_en unique, full-text search GIN index'leri, public read RLS, search RPC.
-- ============================================================================

-- ─── 1) Yeni kolonlar ──────────────────────────────────────────────────────
ALTER TABLE public.aviation_glossary
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ipa text,
  ADD COLUMN IF NOT EXISTS pos text,
  ADD COLUMN IF NOT EXISTS difficulty int NOT NULL DEFAULT 1
    CHECK (difficulty BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS related_terms uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ─── 2) term_en case-insensitive unique ────────────────────────────────────
-- Şu an 0 kayıt → güvenli. Bulk import sırasında duplicate engellenir.
CREATE UNIQUE INDEX IF NOT EXISTS aviation_glossary_term_en_unique_idx
  ON public.aviation_glossary (lower(term_en));

-- ─── 3) Full-text search GIN index'leri ────────────────────────────────────
CREATE INDEX IF NOT EXISTS aviation_glossary_search_en_idx
  ON public.aviation_glossary
  USING GIN (to_tsvector('english',
    coalesce(term_en, '') || ' ' ||
    coalesce(abbreviation, '') || ' ' ||
    coalesce(definition_en, '')
  ));

CREATE INDEX IF NOT EXISTS aviation_glossary_search_tr_idx
  ON public.aviation_glossary
  USING GIN (to_tsvector('turkish',
    coalesce(term_tr, '') || ' ' ||
    coalesce(definition_tr, '')
  ));

CREATE INDEX IF NOT EXISTS aviation_glossary_difficulty_public_idx
  ON public.aviation_glossary (difficulty)
  WHERE is_public = true;

-- ─── 4) RLS — public read (is_public=true) + admin full ───────────────────
ALTER TABLE public.aviation_glossary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aviation_glossary_public_read ON public.aviation_glossary;
CREATE POLICY aviation_glossary_public_read ON public.aviation_glossary
  FOR SELECT
  TO authenticated, anon
  USING (is_public = true);

DROP POLICY IF EXISTS aviation_glossary_admin_write ON public.aviation_glossary;
CREATE POLICY aviation_glossary_admin_write ON public.aviation_glossary
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true)
  );

-- glossary_translations 20 dil çevirileri — public read için aviation_glossary
-- public olmasına bağla (kapalı term'in çevirisi de görünmesin)
ALTER TABLE public.glossary_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS glossary_translations_public_read ON public.glossary_translations;
CREATE POLICY glossary_translations_public_read ON public.glossary_translations
  FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (SELECT 1 FROM public.aviation_glossary
            WHERE id = glossary_translations.glossary_id AND is_public = true)
  );

DROP POLICY IF EXISTS glossary_translations_admin_write ON public.glossary_translations;
CREATE POLICY glossary_translations_admin_write ON public.glossary_translations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true)
  );

-- ─── 5) search_glossary RPC — mobile dictionary için ana arama ───────────
CREATE OR REPLACE FUNCTION public.search_glossary(
  p_query text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_abbreviations_only boolean DEFAULT false,
  p_min_difficulty int DEFAULT 1,
  p_max_difficulty int DEFAULT 5,
  p_lang text DEFAULT 'en',
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  term_en text,
  term_tr text,
  abbreviation text,
  category text,
  definition_en text,
  definition_tr text,
  example_usage text,
  ipa text,
  pos text,
  difficulty int,
  icao_reference text,
  audio_url text,
  is_verified boolean,
  frequency int
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT g.id, g.term_en, g.term_tr, g.abbreviation, g.category,
         g.definition_en, g.definition_tr, g.example_usage,
         g.ipa, g.pos, g.difficulty,
         g.icao_reference, g.audio_url, g.is_verified, g.frequency
  FROM public.aviation_glossary g
  WHERE g.is_public = true
    AND (p_category IS NULL OR g.category = p_category)
    AND (NOT p_abbreviations_only OR g.abbreviation IS NOT NULL)
    AND g.difficulty BETWEEN p_min_difficulty AND p_max_difficulty
    AND (
      p_query IS NULL
      OR p_query = ''
      OR (p_lang = 'tr' AND (
        to_tsvector('turkish', coalesce(g.term_tr, '') || ' ' || coalesce(g.definition_tr, ''))
          @@ websearch_to_tsquery('turkish', p_query)
        OR g.term_tr ILIKE '%' || p_query || '%'
        OR g.term_en ILIKE '%' || p_query || '%'
        OR g.abbreviation ILIKE '%' || p_query || '%'
      ))
      OR (p_lang <> 'tr' AND (
        to_tsvector('english',
          coalesce(g.term_en, '') || ' ' ||
          coalesce(g.abbreviation, '') || ' ' ||
          coalesce(g.definition_en, ''))
          @@ websearch_to_tsquery('english', p_query)
        OR g.term_en ILIKE '%' || p_query || '%'
        OR g.abbreviation ILIKE '%' || p_query || '%'
      ))
    )
  ORDER BY
    -- Önce tam kısaltma, sonra tam terim, sonra verified+frequency
    CASE WHEN g.abbreviation IS NOT NULL AND lower(g.abbreviation) = lower(p_query) THEN 0
         WHEN lower(g.term_en) = lower(p_query) THEN 1
         WHEN lower(coalesce(g.term_tr, '')) = lower(p_query) THEN 1
         ELSE 2 END,
    g.is_verified DESC,
    g.frequency DESC,
    g.term_en
  LIMIT p_limit OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION public.search_glossary TO authenticated, anon;

-- ─── 6) Helper RPC: get_glossary_categories — kategori sayıları ──────────
CREATE OR REPLACE FUNCTION public.get_glossary_categories()
RETURNS TABLE (category text, term_count bigint)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT category, count(*)::bigint
  FROM public.aviation_glossary
  WHERE is_public = true
  GROUP BY category
  ORDER BY count(*) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_glossary_categories TO authenticated, anon;

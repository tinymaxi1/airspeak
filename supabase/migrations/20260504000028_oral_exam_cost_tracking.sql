-- AirSpeak — Sprint 7.C — Cost tracking + daily usage view
--
-- - oral_exam_attempts: tokens_in/out + estimated_cost_usd kolonları
-- - ai_daily_cost view (admin maliyet dashboard için)
-- - check_ai_daily_cost RPC: cap aşıldıysa false (Edge function mock'a düşer)
-- - Estimated cost helper (model bazlı sabit fiyat)

BEGIN;

-- ─── 1. Cost tracking kolonları ─────────────────────────────────────────
ALTER TABLE public.oral_exam_attempts
  ADD COLUMN IF NOT EXISTS tokens_in int,
  ADD COLUMN IF NOT EXISTS tokens_out int,
  ADD COLUMN IF NOT EXISTS estimated_cost_usd numeric(10, 6);

CREATE INDEX IF NOT EXISTS oral_attempts_evaluated_idx
  ON public.oral_exam_attempts (evaluated_at DESC)
  WHERE evaluated_at IS NOT NULL;

COMMENT ON COLUMN public.oral_exam_attempts.tokens_in IS 'Provider input tokens (transcript+system prompt)';
COMMENT ON COLUMN public.oral_exam_attempts.tokens_out IS 'Provider output tokens (rubric+feedback)';
COMMENT ON COLUMN public.oral_exam_attempts.estimated_cost_usd IS 'Model fiyatına göre tahmini USD maliyet';

-- ─── 2. Daily AI cost view (admin görür) ────────────────────────────────
CREATE OR REPLACE VIEW public.ai_daily_cost AS
SELECT
  date_trunc('day', evaluated_at)::date AS day,
  COUNT(*) AS attempts,
  COUNT(*) FILTER (WHERE provider = 'mock') AS mock_attempts,
  COUNT(*) FILTER (WHERE provider = 'claude') AS claude_attempts,
  COUNT(*) FILTER (WHERE provider = 'gpt') AS gpt_attempts,
  COALESCE(SUM(tokens_in), 0) AS total_tokens_in,
  COALESCE(SUM(tokens_out), 0) AS total_tokens_out,
  COALESCE(SUM(estimated_cost_usd), 0)::numeric(12, 6) AS total_cost_usd
FROM public.oral_exam_attempts
WHERE evaluated_at IS NOT NULL
GROUP BY day
ORDER BY day DESC;

GRANT SELECT ON public.ai_daily_cost TO authenticated;

-- ─── 3. check_ai_daily_cost RPC ─────────────────────────────────────────
-- Bugünkü harcama daily_cap'i aştı mı? Edge function başında check eder,
-- aşıldıysa graceful mock fallback yapar.
CREATE OR REPLACE FUNCTION public.check_ai_daily_cost()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $check_cost$
DECLARE
  v_today numeric;
  v_cap numeric;
  v_cap_value jsonb;
BEGIN
  SELECT COALESCE(SUM(estimated_cost_usd), 0) INTO v_today
    FROM public.oral_exam_attempts
   WHERE evaluated_at > current_date;

  SELECT value INTO v_cap_value
    FROM public.app_config WHERE key = 'ai.daily_cost_cap_usd';
  v_cap := COALESCE(NULLIF(v_cap_value::text, '')::numeric, 50);

  RETURN jsonb_build_object(
    'within_cap', v_today < v_cap,
    'today_usd', v_today,
    'cap_usd', v_cap
  );
END;
$check_cost$;

GRANT EXECUTE ON FUNCTION public.check_ai_daily_cost() TO authenticated, anon;

DO $$ BEGIN
  RAISE NOTICE 'Sprint 7.C — cost tracking + daily cap aktif';
END $$;

COMMIT;

-- Sprint 9.C — Translation provider config
INSERT INTO public.app_config (key, value, description, category, data_type)
VALUES
  ('ai.translation_provider', '"mock"'::jsonb,
   'Çeviri provider: mock | claude (default mock — API key girene kadar)',
   'general', 'string'),
  ('ai.translation_model', '"claude-sonnet-4-5"'::jsonb,
   'Çeviri için Claude model kimliği',
   'general', 'string'),
  ('ai.translation_cost_total', '"0"'::jsonb,
   'Çeviri toplam maliyet USD (translate-content edge fn izler)',
   'general', 'string'),
  ('ai.translation_calls', '"0"'::jsonb,
   'Çeviri toplam çağrı sayısı',
   'general', 'string')
ON CONFLICT (key) DO NOTHING;

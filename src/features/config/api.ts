/**
 * App Config — runtime ayarları (admin'den değiştirilen reklam, freemium, paywall).
 *
 * Mobile her açılışta DB'den çeker, 5 dk cache + realtime invalidation.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase as typedSupabase } from '@/lib/supabase';
const supabase: any = typedSupabase;

export interface AppConfig {
  // Ads
  'ads.enabled': boolean;
  'ads.banner_home': boolean;
  'ads.banner_lesson_complete': boolean;
  'ads.interstitial_every_n_lessons': number;
  'ads.rewarded_heart_refill': boolean;
  'ads.cta_text_tr': string;
  'ads.admob_app_id_ios': string;
  'ads.admob_app_id_android': string;
  'ads.admob_banner_unit_id': string;
  'ads.admob_interstitial_unit_id': string;

  // Freemium
  'freemium.max_lessons_per_day': number;
  'freemium.max_ai_conversations_per_day': number;
  'freemium.max_vocab_lookups_per_day': number;
  'freemium.max_pronunciation_per_day': number;
  'freemium.max_readback_per_day': number;
  'freemium.max_listen_solve_per_day': number;
  'freemium.placement_test_free': boolean;
  'freemium.icao4_set1_free': boolean;
  'freemium.icao4_set2_free': boolean;
  'freemium.icao4_set3_free': boolean;
  'freemium.oral_exam_free_count': number;
  'freemium.interview_questions_free_per_airline': number;
  'freemium.bookmark_max': number;
  'freemium.heart_max': number;
  'freemium.heart_refill_hours': number;

  // Premium feature flags
  'premium.unlimited_lessons': boolean;
  'premium.unlimited_ai': boolean;
  'premium.icao4_full_access': boolean;
  'premium.detailed_explanations': boolean;
  'premium.no_ads': boolean;
  'premium.audio_download': boolean;
  'premium.priority_support': boolean;
  'premium.advanced_analytics': boolean;

  // Paywall
  'paywall.monthly_price_try': number;
  'paywall.yearly_price_try': number;
  'paywall.lifetime_price_try': number;
  'paywall.trial_days': number;
  'paywall.yearly_savings_percent': number;
  'paywall.headline_tr': string;
  'paywall.subhead_tr': string;
  'paywall.benefits_tr': string[];
  'paywall.show_lifetime': boolean;
  'paywall.recommended_tier': 'monthly' | 'yearly' | 'lifetime';

  // General
  'app.maintenance_mode': boolean;
  'app.maintenance_message_tr': string;
  'app.min_supported_version_ios': string;
  'app.min_supported_version_android': string;
  'app.force_update': boolean;
}

const DEFAULTS: AppConfig = {
  'ads.enabled': true,
  'ads.banner_home': false,
  'ads.banner_lesson_complete': true,
  'ads.interstitial_every_n_lessons': 3,
  'ads.rewarded_heart_refill': true,
  'ads.cta_text_tr': "Reklamsız bir AirSpeak için Pro'ya geç",
  'ads.admob_app_id_ios': '',
  'ads.admob_app_id_android': '',
  'ads.admob_banner_unit_id': '',
  'ads.admob_interstitial_unit_id': '',
  'freemium.max_lessons_per_day': 5,
  'freemium.max_ai_conversations_per_day': 1,
  'freemium.max_vocab_lookups_per_day': 50,
  'freemium.max_pronunciation_per_day': 2,
  'freemium.max_readback_per_day': 2,
  'freemium.max_listen_solve_per_day': 2,
  'freemium.placement_test_free': true,
  'freemium.icao4_set1_free': true,
  'freemium.icao4_set2_free': false,
  'freemium.icao4_set3_free': false,
  'freemium.oral_exam_free_count': 3,
  'freemium.interview_questions_free_per_airline': 5,
  'freemium.bookmark_max': 20,
  'freemium.heart_max': 5,
  'freemium.heart_refill_hours': 6,
  'premium.unlimited_lessons': true,
  'premium.unlimited_ai': true,
  'premium.icao4_full_access': true,
  'premium.detailed_explanations': true,
  'premium.no_ads': true,
  'premium.audio_download': true,
  'premium.priority_support': true,
  'premium.advanced_analytics': true,
  'paywall.monthly_price_try': 99,
  'paywall.yearly_price_try': 799,
  'paywall.lifetime_price_try': 1999,
  'paywall.trial_days': 7,
  'paywall.yearly_savings_percent': 33,
  'paywall.headline_tr': "Tüm 30000 egzersiz, ICAO 4'ün tam içeriği, sınırsız AI",
  'paywall.subhead_tr': '7 gün ücretsiz dene. İstediğin zaman iptal et.',
  'paywall.benefits_tr': [
    'Sınırsız ders',
    'Tüm ICAO 4 setleri',
    'Reklamsız',
    'AI ile sınırsız konuşma',
    'Offline ses indirme',
    'Öncelikli destek',
  ],
  'paywall.show_lifetime': true,
  'paywall.recommended_tier': 'yearly',
  'app.maintenance_mode': false,
  'app.maintenance_message_tr': 'Bakım yapılıyor, kısa süre içinde döneceğiz.',
  'app.min_supported_version_ios': '1.0.0',
  'app.min_supported_version_android': '1.0.0',
  'app.force_update': false,
};

/**
 * Tüm config'i DB'den çek + 5 dk cache.
 * Realtime: app_config tablosu UPDATE event'inde React Query invalidate olur (Faz 2 realtime.ts).
 */
export function useAppConfig(): AppConfig {
  const { data } = useQuery({
    queryKey: ['content', 'app_config'],
    queryFn: async (): Promise<AppConfig> => {
      const { data: rows, error } = await supabase
        .from('app_config')
        .select('key, value');
      if (error) throw error;

      const out = { ...DEFAULTS };
      for (const r of rows ?? []) {
        (out as any)[r.key] = r.value;
      }
      return out;
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  return data ?? DEFAULTS;
}

/**
 * Tek bir config değerini al (default fallback ile).
 */
export function useConfigValue<K extends keyof AppConfig>(key: K): AppConfig[K] {
  const config = useAppConfig();
  return config[key];
}

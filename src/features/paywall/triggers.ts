/**
 * Paywall trigger registry + cooldown.
 *
 * Bir trigger 24 saatte 1× gösterilir (kullanıcı bunaltmasın).
 * Premium kullanıcıya HİÇ gösterilmez.
 */
import { setItem, getItem } from '@/lib/storage';

export type PaywallTriggerId =
  // Mevcut (5.A öncesi):
  | 'lesson_day_limit'
  | 'heart_zero'
  | 'shop_premium_item'
  // 5.A yeni:
  | 'onboarding_tour_end'
  | 'icao_oral_first_task_done'
  | 'exam_second_attempt'
  | 'streak_milestone_3d'
  | 'badge_celebration_random'
  | 'league_top3_celebration'
  // Sonraki sprintler için rezerve:
  | 'ai_message_limit'
  | 'pronunciation_limit'
  | 'trial_ending'
  | 'exam_day_mode'
  | 'offline_download';

export interface TriggerMeta {
  id: PaywallTriggerId;
  /** UI mesajı (PaywallSheet header) */
  title: string;
  body: string;
  /** Cooldown saat (default 24) — bazı trigger'lar daha sık tetiklenebilir */
  cooldownHours?: number;
  /** Soft = küçük chip; Hard = full sheet */
  intensity: 'soft' | 'hard';
}

export const TRIGGERS: Record<PaywallTriggerId, TriggerMeta> = {
  lesson_day_limit: {
    id: 'lesson_day_limit',
    title: 'Sınırsız ders aç',
    body: 'Bugünlük 5 dersin doldu. Pro ile sınırsız uç.',
    intensity: 'hard',
  },
  heart_zero: {
    id: 'heart_zero',
    title: 'Canların bitti',
    body: 'Beklemeden devam et — Pro\'da sınırsız can.',
    intensity: 'hard',
  },
  shop_premium_item: {
    id: 'shop_premium_item',
    title: 'Premium ürün',
    body: 'Bu ürün sadece Pro kullanıcılar için.',
    intensity: 'hard',
  },

  onboarding_tour_end: {
    id: 'onboarding_tour_end',
    title: 'İlk 7 gün ücretsiz',
    body: 'Tüm ICAO 4 setleri, sınırsız AI, telaffuz, lig — denemeye başla.',
    intensity: 'soft',
    cooldownHours: 720, // 30 gün — onboarding 1× gösterilir
  },
  icao_oral_first_task_done: {
    id: 'icao_oral_first_task_done',
    title: 'Diğer 3 görevi aç',
    body: 'ICAO 4 sözlü sınavın 4 görevi var. 3\'ünü Pro ile çöz.',
    intensity: 'hard',
    cooldownHours: 168, // 7 gün
  },
  exam_second_attempt: {
    id: 'exam_second_attempt',
    title: 'Tüm sınav setleri',
    body: 'Pro ile 3 set × 50 soru — gerçek sınav öncesi sınırsız pratik.',
    intensity: 'hard',
  },
  streak_milestone_3d: {
    id: 'streak_milestone_3d',
    title: '3 günlük streak 🔥',
    body: 'Streak\'ini koru — Pro\'da otomatik freeze + sınırsız ders.',
    intensity: 'soft',
    cooldownHours: 168, // hafta 1×
  },
  badge_celebration_random: {
    id: 'badge_celebration_random',
    title: 'Daha hızlı yükselme',
    body: 'XP boost + sınırsız ders ile rozetleri 2× hızla topla.',
    intensity: 'soft',
    cooldownHours: 72, // 3 günde 1
  },
  league_top3_celebration: {
    id: 'league_top3_celebration',
    title: 'Ödülünü 2× al',
    body: 'Pro üyeler tüm lig ödüllerini iki katı alır.',
    intensity: 'soft',
    cooldownHours: 168,
  },

  ai_message_limit: {
    id: 'ai_message_limit',
    title: 'Sınırsız AI pratik',
    body: 'Günlük AI mesaj limitin doldu. Pro ile sınırsız.',
    intensity: 'hard',
  },
  pronunciation_limit: {
    id: 'pronunciation_limit',
    title: 'ICAO 4 için sınırsız drill',
    body: 'Bugünlük 5 telaffuz hakkın doldu.',
    intensity: 'hard',
  },
  trial_ending: {
    id: 'trial_ending',
    title: 'Deneme bitiyor',
    body: 'Pro\'yu kaybetme — yıllık ile %50 tasarruf.',
    intensity: 'hard',
    cooldownHours: 168, // haftada 1× — push trigger'ı zaten her gün gönderiyor
  },
  exam_day_mode: {
    id: 'exam_day_mode',
    title: '30 günlük sınav planı',
    body: 'Pro ile kişiselleştirilmiş sınav günü programı.',
    intensity: 'hard',
  },
  offline_download: {
    id: 'offline_download',
    title: 'Sınırsız offline',
    body: 'Tüm ders + ses + SRS\'i indir, internetsiz çalış.',
    intensity: 'hard',
  },
};

const COOLDOWN_KEY = 'airspeak.paywall.lastShown';

interface CooldownMap {
  [triggerId: string]: number; // epoch ms
}

function readCooldownMap(): CooldownMap {
  return getItem<CooldownMap>(COOLDOWN_KEY) ?? {};
}

function writeCooldownMap(map: CooldownMap): void {
  setItem(COOLDOWN_KEY, map);
}

/**
 * Trigger gösterilebilir mi? Cooldown kontrolü.
 */
export function canShowTrigger(
  triggerId: PaywallTriggerId,
  isPremium: boolean,
): boolean {
  if (isPremium) return false;
  const meta = TRIGGERS[triggerId];
  if (!meta) return false;
  const map = readCooldownMap();
  const lastMs = map[triggerId];
  if (!lastMs) return true;
  const cooldownMs = (meta.cooldownHours ?? 24) * 3_600_000;
  return Date.now() - lastMs >= cooldownMs;
}

/**
 * Trigger gösterildi olarak işaretle.
 */
export function markTriggerShown(triggerId: PaywallTriggerId): void {
  const map = readCooldownMap();
  map[triggerId] = Date.now();
  writeCooldownMap(map);
}

/**
 * Reset (test için).
 */
export function resetTriggerCooldowns(): void {
  writeCooldownMap({});
}

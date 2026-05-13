/**
 * quickPracticeCards — Home ekranındaki "Hızlı Alıştırma" 4 kartının role-aware
 * tanımı. v1.0 UX REAL FIX — eskiden hardcoded 4 pilot kartı vardı, artık
 * profiles.role'e göre değişir.
 *
 * NOT (önemli): route'lar MEVCUT çalışan ekranlara yönlendirir. Bazı role'ler
 * için ideal kategoriye özel içerik henüz DB'de YOK (örn. teknisyen için
 * "fault_reporting" clearance seti). Bu durumda route + routeParams query
 * gönderilir ama hedef ekran param'ı tanımıyorsa **genel pratiğe** düşer
 * (graceful fallback) — kullanıcı yine pratik yapar, sadece role-spesifik
 * içerik beklemez. İçerik üretimi ayrı sprint.
 */
import type { UserRole } from '@/types/profile';

export interface QuickCard {
  /** Emoji veya unicode icon */
  icon: string;
  /** i18n key — label (kalın başlık) */
  labelKey: string;
  /** i18n key — sub (küçük açıklama) */
  subKey: string;
  /** UI accent rengi */
  color: string;
  /** expo-router route path */
  route: string;
  /** Route query params (opsiyonel) */
  routeParams?: Record<string, string>;
}

/**
 * 7 rol + 'default' fallback için her birinde 4 kart.
 *
 * Renk paleti (tutarlılık için her rolde 4 farklı):
 *   #E63946 kırmızı, #2EA8FF mavi, #7C5CFF mor, #F2C14E sarı,
 *   #2DBE6C yeşil, #FF6B35 turuncu, #5B8AB5 navy
 */
export const QUICK_CARDS_BY_ROLE: Record<UserRole | 'default', QuickCard[]> = {
  pilot: [
    { icon: '🎙', labelKey: 'quick.readback.label', subKey: 'quick.readback.pilotSub', color: '#E63946', route: '/readback' },
    { icon: '🎧', labelKey: 'quick.listen.label', subKey: 'quick.listen.pilotSub', color: '#2EA8FF', route: '/practice', routeParams: { category: 'listening' } },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.pilotSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.pilotSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  atc: [
    { icon: '🗼', labelKey: 'quick.clearance.label', subKey: 'quick.clearance.sub', color: '#FF6B35', route: '/readback' },
    { icon: '⚠️', labelKey: 'quick.conflict.label', subKey: 'quick.conflict.sub', color: '#E63946', route: '/practice', routeParams: { category: 'emergency' } },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.atcSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.atcSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  cabin: [
    { icon: '📢', labelKey: 'quick.announcement.label', subKey: 'quick.announcement.sub', color: '#7C5CFF', route: '/practice', routeParams: { category: 'speaking' } },
    { icon: '🛟', labelKey: 'quick.safety.label', subKey: 'quick.safety.sub', color: '#2DBE6C', route: '/practice', routeParams: { category: 'emergency' } },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.cabinSub', color: '#E63946', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.cabinSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  technician: [
    { icon: '🔧', labelKey: 'quick.maintenance.label', subKey: 'quick.maintenance.sub', color: '#2EA8FF', route: '/practice', routeParams: { category: 'vocab' } },
    { icon: '📋', labelKey: 'quick.faultReport.label', subKey: 'quick.faultReport.sub', color: '#E63946', route: '/readback' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.technicianSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.technicianSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  ground: [
    { icon: '🛞', labelKey: 'quick.pushback.label', subKey: 'quick.pushback.sub', color: '#2DBE6C', route: '/practice', routeParams: { category: 'speaking' } },
    { icon: '🏃', labelKey: 'quick.marshalling.label', subKey: 'quick.marshalling.sub', color: '#FF6B35', route: '/readback' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.groundSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.groundSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  student: [
    { icon: '🔤', labelKey: 'quick.alphabet.label', subKey: 'quick.alphabet.sub', color: '#F2C14E', route: '/pronunciation/p1' },
    { icon: '🔢', labelKey: 'quick.numbers.label', subKey: 'quick.numbers.sub', color: '#E63946', route: '/pronunciation/p1' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.studentSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '📚', labelKey: 'quick.basics.label', subKey: 'quick.basics.sub', color: '#2DBE6C', route: '/practice', routeParams: { category: 'vocab' } },
  ],
  dispatcher: [
    { icon: '📊', labelKey: 'quick.flightPlan.label', subKey: 'quick.flightPlan.sub', color: '#5B8AB5', route: '/practice', routeParams: { category: 'vocab' } },
    { icon: '🌦', labelKey: 'quick.weather.label', subKey: 'quick.weather.sub', color: '#2EA8FF', route: '/practice', routeParams: { category: 'vocab' } },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.dispatcherSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.dispatcherSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  default: [
    { icon: '🎙', labelKey: 'quick.readback.label', subKey: 'quick.readback.generalSub', color: '#E63946', route: '/readback' },
    { icon: '🎧', labelKey: 'quick.listen.label', subKey: 'quick.listen.generalSub', color: '#2EA8FF', route: '/practice', routeParams: { category: 'listening' } },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.generalSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.generalSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
};

/** Profile.role'den uygun kart setini al — null/dispatcher tanımsız ise default. */
export function getQuickCardsForRole(role: UserRole | null | undefined): QuickCard[] {
  if (!role) return QUICK_CARDS_BY_ROLE.default;
  return QUICK_CARDS_BY_ROLE[role] ?? QUICK_CARDS_BY_ROLE.default;
}

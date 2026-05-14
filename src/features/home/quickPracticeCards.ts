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
    { icon: '🎧', labelKey: 'quick.listen.label', subKey: 'quick.listen.pilotSub', color: '#2EA8FF', route: '/listen-solve/atc_listen' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.pilotSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.pilotSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  atc: [
    { icon: '🗼', labelKey: 'quick.clearance.label', subKey: 'quick.clearance.sub', color: '#FF6B35', route: '/readback' },
    { icon: '⚠️', labelKey: 'quick.conflict.label', subKey: 'quick.conflict.sub', color: '#E63946', route: '/listen-solve/atc_listen' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.atcSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.atcSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  cabin: [
    { icon: '📢', labelKey: 'quick.announcement.label', subKey: 'quick.announcement.sub', color: '#7C5CFF', route: '/listen-solve/pa_decode' },
    { icon: '🛟', labelKey: 'quick.safety.label', subKey: 'quick.safety.sub', color: '#2DBE6C', route: '/listen-solve/pa_decode' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.cabinSub', color: '#E63946', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.cabinSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  technician: [
    { icon: '🔧', labelKey: 'quick.maintenance.label', subKey: 'quick.maintenance.sub', color: '#2EA8FF', route: '/listen-solve/snag_report' },
    { icon: '📋', labelKey: 'quick.faultReport.label', subKey: 'quick.faultReport.sub', color: '#E63946', route: '/readback' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.technicianSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.technicianSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  ground: [
    { icon: '🛞', labelKey: 'quick.pushback.label', subKey: 'quick.pushback.sub', color: '#2DBE6C', route: '/listen-solve/atc_listen' },
    { icon: '🏃', labelKey: 'quick.marshalling.label', subKey: 'quick.marshalling.sub', color: '#FF6B35', route: '/readback' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.groundSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.groundSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  student: [
    { icon: '🔤', labelKey: 'quick.alphabet.label', subKey: 'quick.alphabet.sub', color: '#F2C14E', route: '/pronunciation/p1' },
    { icon: '🔢', labelKey: 'quick.numbers.label', subKey: 'quick.numbers.sub', color: '#E63946', route: '/pronunciation/p1' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.studentSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '📚', labelKey: 'quick.basics.label', subKey: 'quick.basics.sub', color: '#2DBE6C', route: '/listen-solve/practice' },
  ],
  dispatcher: [
    { icon: '📊', labelKey: 'quick.flightPlan.label', subKey: 'quick.flightPlan.sub', color: '#5B8AB5', route: '/listen-solve/metar_notam' },
    { icon: '🌦', labelKey: 'quick.weather.label', subKey: 'quick.weather.sub', color: '#2EA8FF', route: '/listen-solve/metar_notam' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.dispatcherSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.dispatcherSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  default: [
    { icon: '🎙', labelKey: 'quick.readback.label', subKey: 'quick.readback.generalSub', color: '#E63946', route: '/readback' },
    { icon: '🎧', labelKey: 'quick.listen.label', subKey: 'quick.listen.generalSub', color: '#2EA8FF', route: '/listen-solve/practice' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.generalSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.generalSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
};

/**
 * Faz 3.9 — Sub_role override map (40 sub_role'ün popüler olanları için).
 * Bu map'te olmayan sub_role'ler role default'a düşer.
 *
 * Her override 4 kart döner. Aviation jargon'a uygun spesifik kategoriler:
 *  - Helikopter pilotu: rotor + approach pattern (sabit kanat değil)
 *  - ATC Tower: ground movement + wake turbulence
 *  - Tech engine: engine start + AOG comm
 *  - Student ICAO4: descriptor practice
 */
export const QUICK_CARDS_BY_SUBROLE: Record<string, QuickCard[]> = {
  // PILOT alt-rolleri
  pilot_helicopter: [
    { icon: '🚁', labelKey: 'quick.rotorPower.label', subKey: 'quick.rotorPower.sub', color: '#E63946', route: '/readback' },
    { icon: '🎯', labelKey: 'quick.approachPattern.label', subKey: 'quick.approachPattern.sub', color: '#2EA8FF', route: '/listen-solve/atc_listen' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.pilotSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.pilotSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  pilot_atr: [
    { icon: '⚙️', labelKey: 'quick.turboprop.label', subKey: 'quick.turboprop.sub', color: '#FF6B35', route: '/readback' },
    { icon: '🎧', labelKey: 'quick.listen.label', subKey: 'quick.listen.pilotSub', color: '#2EA8FF', route: '/listen-solve/atc_listen' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.pilotSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.pilotSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  // ATC alt-rolleri
  atc_tower: [
    { icon: '🛬', labelKey: 'quick.groundMovement.label', subKey: 'quick.groundMovement.sub', color: '#FF6B35', route: '/readback' },
    { icon: '💨', labelKey: 'quick.wakeTurbulence.label', subKey: 'quick.wakeTurbulence.sub', color: '#E63946', route: '/listen-solve/atc_listen' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.atcSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.atcSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  atc_approach: [
    { icon: '🛩', labelKey: 'quick.sequencing.label', subKey: 'quick.sequencing.sub', color: '#FF6B35', route: '/readback' },
    { icon: '🧭', labelKey: 'quick.vectoring.label', subKey: 'quick.vectoring.sub', color: '#E63946', route: '/listen-solve/atc_listen' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.atcSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.atcSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  atc_enroute: [
    { icon: '📡', labelKey: 'quick.enrouteFreq.label', subKey: 'quick.enrouteFreq.sub', color: '#5B8AB5', route: '/readback' },
    { icon: '🔁', labelKey: 'quick.handoff.label', subKey: 'quick.handoff.sub', color: '#FF6B35', route: '/listen-solve/atc_listen' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.atcSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.atcSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  // CABIN alt-rolleri
  cabin_business: [
    { icon: '🥂', labelKey: 'quick.premiumService.label', subKey: 'quick.premiumService.sub', color: '#7C5CFF', route: '/conversation' },
    { icon: '📢', labelKey: 'quick.announcement.label', subKey: 'quick.announcement.sub', color: '#2DBE6C', route: '/listen-solve/pa_decode' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.cabinSub', color: '#E63946', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.cabinSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  cabin_first: [
    { icon: '🥂', labelKey: 'quick.premiumService.label', subKey: 'quick.premiumService.sub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🛟', labelKey: 'quick.safety.label', subKey: 'quick.safety.sub', color: '#2DBE6C', route: '/listen-solve/pa_decode' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.cabinSub', color: '#E63946', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.cabinSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  // TECHNICIAN alt-rolleri
  tech_line: [
    { icon: '🔍', labelKey: 'quick.preflightInspection.label', subKey: 'quick.preflightInspection.sub', color: '#2EA8FF', route: '/readback' },
    { icon: '📋', labelKey: 'quick.faultReport.label', subKey: 'quick.faultReport.sub', color: '#E63946', route: '/listen-solve/snag_report' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.technicianSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.technicianSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  tech_engine: [
    { icon: '⚙️', labelKey: 'quick.engineStart.label', subKey: 'quick.engineStart.sub', color: '#FF6B35', route: '/readback' },
    { icon: '🚨', labelKey: 'quick.aogComm.label', subKey: 'quick.aogComm.sub', color: '#E63946', route: '/listen-solve/snag_report' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.technicianSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.technicianSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  tech_landing_gear: [
    { icon: '🛞', labelKey: 'quick.tireWear.label', subKey: 'quick.tireWear.sub', color: '#2DBE6C', route: '/readback' },
    { icon: '💧', labelKey: 'quick.hydraulicComm.label', subKey: 'quick.hydraulicComm.sub', color: '#2EA8FF', route: '/listen-solve/snag_report' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.technicianSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.technicianSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  // GROUND alt-rolleri
  ground_pushback: [
    { icon: '🛞', labelKey: 'quick.pushback.label', subKey: 'quick.pushback.sub', color: '#2DBE6C', route: '/listen-solve/atc_listen' },
    { icon: '👋', labelKey: 'quick.handSignals.label', subKey: 'quick.handSignals.sub', color: '#FF6B35', route: '/readback' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.groundSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.groundSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  ground_refueling: [
    { icon: '⛽', labelKey: 'quick.fuelOrder.label', subKey: 'quick.fuelOrder.sub', color: '#F2C14E', route: '/readback' },
    { icon: '✅', labelKey: 'quick.qcCheck.label', subKey: 'quick.qcCheck.sub', color: '#2DBE6C', route: '/listen-solve/practice' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.groundSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.groundSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
  // STUDENT alt-rolleri
  student_icao4: [
    { icon: '🎯', labelKey: 'quick.descriptorPractice.label', subKey: 'quick.descriptorPractice.sub', color: '#E63946', route: '/exam/icao4-briefing' },
    { icon: '🔤', labelKey: 'quick.alphabet.label', subKey: 'quick.alphabet.sub', color: '#F2C14E', route: '/pronunciation/p1' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.studentSub', color: '#7C5CFF', route: '/conversation' },
    { icon: '📚', labelKey: 'quick.basics.label', subKey: 'quick.basics.sub', color: '#2DBE6C', route: '/listen-solve/practice' },
  ],
  // DISPATCHER alt-rolleri
  dispatcher_vip: [
    { icon: '🤫', labelKey: 'quick.discretionComm.label', subKey: 'quick.discretionComm.sub', color: '#7C5CFF', route: '/conversation' },
    { icon: '📊', labelKey: 'quick.flightPlan.label', subKey: 'quick.flightPlan.sub', color: '#5B8AB5', route: '/listen-solve/metar_notam' },
    { icon: '🤖', labelKey: 'quick.roleplay.label', subKey: 'quick.roleplay.dispatcherSub', color: '#E63946', route: '/conversation' },
    { icon: '🔊', labelKey: 'quick.pronunciation.label', subKey: 'quick.pronunciation.dispatcherSub', color: '#F2C14E', route: '/pronunciation/p1' },
  ],
};

/**
 * Profile.role + sub_role'den uygun kart setini al.
 *
 * Resolution order (Faz 3.9):
 *   1. sub_role override map'te varsa onu
 *   2. Yoksa role default'a düş
 *   3. Role da yoksa 'default' fallback
 */
export function getQuickCardsForRole(
  role: UserRole | null | undefined,
  subRole?: string | null | undefined,
): QuickCard[] {
  // Faz 3.9: önce sub_role override
  if (subRole && QUICK_CARDS_BY_SUBROLE[subRole]) {
    return QUICK_CARDS_BY_SUBROLE[subRole]!;
  }
  if (!role) return QUICK_CARDS_BY_ROLE.default;
  return QUICK_CARDS_BY_ROLE[role] ?? QUICK_CARDS_BY_ROLE.default;
}

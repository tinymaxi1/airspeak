/**
 * Airlines Index — tüm bölge dosyalarını birleştir.
 */
import { MIDDLE_EAST_AIRLINES } from './airlinesMiddleEast';
import { EUROPE_AIRLINES } from './airlinesEurope';
import { TURKEY_AIRLINES } from './airlinesTurkey';
import type { AirlineProfile, AirlineRegion } from './airlineTypes';

export const ALL_AIRLINES: AirlineProfile[] = [
  ...TURKEY_AIRLINES,
  ...MIDDLE_EAST_AIRLINES,
  ...EUROPE_AIRLINES,
];

export const AIRLINE_REGION_LABELS: Record<AirlineRegion, { tr: string; emoji: string }> = {
  turkey: { tr: 'Türkiye', emoji: '🇹🇷' },
  'middle-east': { tr: 'Orta Doğu', emoji: '🕌' },
  'europe-fsc': { tr: 'Avrupa — Bayrak Taşıyıcı', emoji: '🏛️' },
  'europe-lcc': { tr: 'Avrupa — Düşük Maliyet', emoji: '💸' },
  asia: { tr: 'Asya', emoji: '🏯' },
  americas: { tr: 'Amerika', emoji: '🗽' },
  oceania: { tr: 'Okyanusya', emoji: '🦘' },
  africa: { tr: 'Afrika', emoji: '🦁' },
};

export function getAirlineById(id: string): AirlineProfile | undefined {
  return ALL_AIRLINES.find((a) => a.id === id);
}

export function getAirlinesForRoleAndRegion(
  role: string | null | undefined,
  region?: AirlineRegion,
): AirlineProfile[] {
  let list = ALL_AIRLINES;
  if (region) list = list.filter((a) => a.region === region);
  if (role) list = list.filter((a) => a.interviews.some((i) => i.role === role));
  return list;
}

export function getAirlinesByRegion(role?: string | null): Record<AirlineRegion, AirlineProfile[]> {
  const groups: Partial<Record<AirlineRegion, AirlineProfile[]>> = {};
  const list = role
    ? ALL_AIRLINES.filter((a) => a.interviews.some((i) => i.role === role))
    : ALL_AIRLINES;
  for (const a of list) {
    if (!groups[a.region]) groups[a.region] = [];
    groups[a.region]!.push(a);
  }
  return groups as Record<AirlineRegion, AirlineProfile[]>;
}

export type { AirlineProfile, AirlineRegion } from './airlineTypes';

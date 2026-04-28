/**
 * B2B Squadron / Cohort static kodlar — gerçek havayolu/okul programları.
 *
 * Mantık: kullanıcı squadron-pairing ekranında 8 karakter kod girer.
 * Bu listede match varsa kohort'a "katılır" (state'e eklenir).
 * Gerçek backend gelmesi durumunda Supabase'e geçilir.
 *
 * Şimdilik 5 statik kohort — gerçekten varolanları temsil eder.
 */

export interface Cohort {
  /** 8 karakter benzersiz kod (büyük harf + tire) */
  code: string;
  airlineId: string; // ALL_AIRLINES'ta eşleşen ID
  name: string;
  shortCode: string; // mülakat ekranında gösterilen "TK·47·OPS" gibi
  cohortNumber: number;
  programTr: string; // "ICAO L4 program"
  programLength: string; // "14w"
  endsOn: string; // ISO date
  cadetCount: number;
  instructorTr: string;
}

export const COHORTS: Cohort[] = [
  {
    code: 'TK47OPS',
    airlineId: 'turkish_airlines',
    name: 'Turkish Airlines Flight Academy',
    shortCode: 'TK·47·OPS',
    cohortNumber: 47,
    programTr: 'ICAO L4 program',
    programLength: '14w',
    endsOn: '2026-08-22',
    cadetCount: 84,
    instructorTr: 'Kpt. A. Yılmaz',
  },
  {
    code: 'PGS22CAB',
    airlineId: 'pegasus',
    name: 'Pegasus Cadet Cabin',
    shortCode: 'PGS·22·CAB',
    cohortNumber: 22,
    programTr: 'Cabin crew İngilizce',
    programLength: '8w',
    endsOn: '2026-07-15',
    cadetCount: 56,
    instructorTr: 'Cabin Mgr. M. Demir',
  },
  {
    code: 'EK19PIL',
    airlineId: 'emirates',
    name: 'Emirates Future Pilots',
    shortCode: 'EK·19·PIL',
    cohortNumber: 19,
    programTr: 'EK ATPL → Captain',
    programLength: '24w',
    endsOn: '2026-12-10',
    cadetCount: 32,
    instructorTr: 'Capt. R. Sharma',
  },
  {
    code: 'QR08LV4',
    airlineId: 'qatar',
    name: 'Qatar L4 Boost',
    shortCode: 'QR·08·LV4',
    cohortNumber: 8,
    programTr: 'ICAO L4 hızlı yol',
    programLength: '6w',
    endsOn: '2026-06-30',
    cadetCount: 48,
    instructorTr: 'F. Al-Mansoori',
  },
  {
    code: 'LH33GND',
    airlineId: 'lufthansa',
    name: 'Lufthansa Ground Ops',
    shortCode: 'LH·33·GND',
    cohortNumber: 33,
    programTr: 'IGOM ramp + ATC',
    programLength: '10w',
    endsOn: '2026-09-12',
    cadetCount: 72,
    instructorTr: 'Capt. K. Bauer',
  },
];

/**
 * Kullanıcı kodunu doğrula (büyük harf, tire ve nokta'ları temizle).
 * 8 alfanumerik karakter beklenir.
 */
export function normalizeCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
}

/**
 * Kohort'u kodla bul. Yoksa undefined.
 */
export function findCohortByCode(code: string): Cohort | undefined {
  const norm = normalizeCode(code);
  return COHORTS.find((c) => c.code === norm);
}

/**
 * Kullanıcının join ettiği kohort var mı kontrol et (squadronStore'dan).
 */
export function isCohortValid(code: string | null): boolean {
  if (!code) return false;
  return findCohortByCode(code) !== undefined;
}

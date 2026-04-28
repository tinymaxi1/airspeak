/**
 * League leaderboard NPC simulator — gerçek zamanlı yarış hissi (sıfır API).
 *
 * Mantık:
 *   1. Her tier'da 49 NPC + kullanıcı = 50 kişi
 *   2. NPC'ler her gün 0-3000 XP arası rastgele (Pareto dist) kazanır
 *   3. Kullanıcının XP'si gerçek (gamificationStore.totalXp)
 *   4. Hafta başı = pazartesi 00:00 (lokal saat)
 *   5. Pazar gecesi top 10 advance, alt 10 demote, ortadakiler kalır
 *   6. NPC isim + ülke havuzu sabit
 *
 * Tüm hesap deterministic (seed = hafta başı tarihi) → tutarlı.
 */

const NPC_NAMES = [
  { name: 'Captain Sky', country: '🇩🇪' },
  { name: 'M. Aydın', country: '🇹🇷' },
  { name: 'José L.', country: '🇪🇸' },
  { name: 'flight_a01', country: '🇮🇳' },
  { name: 'Nina V.', country: '🇳🇱' },
  { name: 'Ahmed F.', country: '🇪🇬' },
  { name: 'Yuki K.', country: '🇯🇵' },
  { name: 'Pierre M.', country: '🇫🇷' },
  { name: 'Anna B.', country: '🇵🇱' },
  { name: 'Carlos S.', country: '🇧🇷' },
  { name: 'Sofia R.', country: '🇮🇹' },
  { name: 'Hassan T.', country: '🇸🇦' },
  { name: 'Wei L.', country: '🇨🇳' },
  { name: 'Olga P.', country: '🇷🇺' },
  { name: 'Min-jun K.', country: '🇰🇷' },
  { name: 'Aisha N.', country: '🇮🇩' },
  { name: 'Lars J.', country: '🇸🇪' },
  { name: 'Maria K.', country: '🇬🇷' },
  { name: 'Captain THY', country: '🇹🇷' },
  { name: 'Pegasus_42', country: '🇹🇷' },
  { name: 'P. Schmidt', country: '🇩🇪' },
  { name: 'A. Reyes', country: '🇵🇭' },
  { name: 'B. Tan', country: '🇸🇬' },
  { name: 'Y. Cohen', country: '🇮🇱' },
  { name: 'D. Petrov', country: '🇧🇬' },
  { name: 'V. Singh', country: '🇮🇳' },
  { name: 'Capt Lima', country: '🇵🇪' },
  { name: 'F. Rossi', country: '🇮🇹' },
  { name: 'K. Müller', country: '🇨🇭' },
  { name: 'T. Nakamura', country: '🇯🇵' },
  { name: 'R. Kowalski', country: '🇵🇱' },
  { name: 'S. Andersson', country: '🇸🇪' },
  { name: 'M. Janssen', country: '🇳🇱' },
  { name: 'I. Ivanova', country: '🇷🇺' },
  { name: 'A. Khan', country: '🇵🇰' },
  { name: 'O. Kowalski', country: '🇵🇱' },
  { name: 'flightlevel350', country: '🇩🇪' },
  { name: 'pilot_42', country: '🇫🇷' },
  { name: 'cadet_x', country: '🇬🇧' },
  { name: 'cabin_pro', country: '🇨🇦' },
  { name: 'L. Costa', country: '🇵🇹' },
  { name: 'N. Ergin', country: '🇹🇷' },
  { name: 'D. Gümüş', country: '🇹🇷' },
  { name: 'A. Yılmaz', country: '🇹🇷' },
  { name: 'C. Demir', country: '🇹🇷' },
  { name: 'B. Akın', country: '🇹🇷' },
  { name: 'M. Selçuk', country: '🇹🇷' },
  { name: 'A. Kaya', country: '🇹🇷' },
  { name: 'F. Türker', country: '🇹🇷' },
];

export interface LeaguePlayer {
  rank: number;
  name: string;
  xp: number;
  country: string;
  you?: boolean;
  initials: string;
}

const TIERS = ['Cadet', 'First Officer', 'Senior FO', 'Captain', 'Senior Capt', 'Check Capt', 'Star Capt'];

/**
 * Mulberry32 PRNG — deterministik, hafta başı seed'iyle.
 */
function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Bu haftanın başlangıç tarihi (pazartesi 00:00 lokal).
 */
export function getWeekStartTimestamp(now: number = Date.now()): number {
  const d = new Date(now);
  const day = d.getDay(); // 0=Sun, 1=Mon
  const diff = day === 0 ? 6 : day - 1; // Mon=0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function getWeekEndTimestamp(now: number = Date.now()): number {
  return getWeekStartTimestamp(now) + 7 * 24 * 60 * 60 * 1000;
}

/**
 * Hafta sonuna kalan saat.
 */
export function getHoursUntilWeekEnd(now: number = Date.now()): number {
  const end = getWeekEndTimestamp(now);
  return Math.max(0, Math.round((end - now) / (60 * 60 * 1000)));
}

/**
 * Bu hafta içinde geçen gün (0-7).
 */
function getDaysIntoWeek(now: number = Date.now()): number {
  const start = getWeekStartTimestamp(now);
  const days = (now - start) / (24 * 60 * 60 * 1000);
  return Math.max(0, Math.min(7, days));
}

/**
 * NPC'lerin bu haftaki XP'si — hafta başı seed'le deterministik üretilir,
 * gün geçtikçe artar (gerçek zamanlı simülasyon hissi).
 */
function generateNpcXp(npcIndex: number, weekStart: number, daysIn: number, tier: number): number {
  const rng = mulberry32(weekStart + npcIndex * 1000 + tier * 100);

  // Her NPC için günlük ortalama hedef (Pareto: çoğu az, birkaçı yüksek)
  // Tier büyüdükçe NPC'ler daha çalışkan
  const baselinePerDay = 200 + tier * 80; // Cadet=200, Star Capt=760
  const wobble = rng() * baselinePerDay * 1.5;
  // %20 NPC çok aktif (high performer)
  const isHighPerformer = rng() > 0.8;
  const dailyAvg = isHighPerformer ? baselinePerDay * 2.5 + wobble : baselinePerDay + wobble * 0.5;

  // Toplam XP = günlük × geçen gün + ufak rastgele ekleme
  const totalXp = Math.round(dailyAvg * daysIn + rng() * 200);
  return totalXp;
}

/**
 * Bu haftanın leaderboard'unu üretir.
 * @param userXp - kullanıcının bu hafta kazandığı XP
 * @param userName - kullanıcının görünen ismi (örn "EK")
 * @param userCountry - kullanıcının bayrağı
 * @param tier - kullanıcının tier'ı (0-6, Cadet to Star Capt)
 */
export function buildLeaderboard(
  userXp: number,
  userName: string,
  userCountry: string,
  tier: number = 3,
  now: number = Date.now(),
): LeaguePlayer[] {
  const weekStart = getWeekStartTimestamp(now);
  const daysIn = getDaysIntoWeek(now);

  // 49 NPC + 1 kullanıcı = 50 oyuncu (üst seviyelerde böyle olur)
  // Daha küçük tier'larda daha az
  const totalSize = 50;
  const npcCount = totalSize - 1;

  const npcs: LeaguePlayer[] = [];
  for (let i = 0; i < npcCount; i++) {
    const npc = NPC_NAMES[i % NPC_NAMES.length]!;
    const xp = generateNpcXp(i, weekStart, daysIn, tier);
    const initial = npc.name.charAt(0).toUpperCase();
    npcs.push({
      rank: 0, // sonra hesaplanır
      name: npc.name,
      xp,
      country: npc.country,
      initials: initial,
    });
  }

  // Kullanıcıyı ekle
  const userInitial = userName.charAt(0).toUpperCase();
  const all = [
    ...npcs,
    {
      rank: 0,
      name: userName,
      xp: userXp,
      country: userCountry,
      you: true,
      initials: userInitial,
    },
  ];

  // XP'ye göre sırala (azalan)
  all.sort((a, b) => b.xp - a.xp);

  // Rank atı
  for (let i = 0; i < all.length; i++) {
    all[i]!.rank = i + 1;
  }

  return all;
}

export function getTierName(tierIdx: number): string {
  return TIERS[Math.max(0, Math.min(TIERS.length - 1, tierIdx))] ?? 'Cadet';
}

export function getNextTierName(tierIdx: number): string | null {
  return TIERS[tierIdx + 1] ?? null;
}

/**
 * Kullanıcının current tier'ını XP toplam'ından hesapla.
 * Eşikler: 0/500/1500/3000/6000/12000/25000
 */
export function getTierForXp(totalXp: number): number {
  const thresholds = [0, 500, 1500, 3000, 6000, 12000, 25000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalXp >= thresholds[i]!) return i;
  }
  return 0;
}

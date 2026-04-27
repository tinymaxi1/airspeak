/**
 * Mock leaderboard seed — 30 sahte kullanıcı.
 * Her kullanıcı haftalık XP'ye göre sıralanır.
 */

export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';

export interface LeagueMember {
  id: string;
  username: string;
  avatar: string; // emoji
  weeklyXp: number;
  isCurrentUser?: boolean;
}

export const TIER_INFO: Record<LeagueTier, { name: string; emoji: string; minXp: number }> = {
  bronze: { name: 'Bronz', emoji: '🥉', minXp: 0 },
  silver: { name: 'Gümüş', emoji: '🥈', minXp: 200 },
  gold: { name: 'Altın', emoji: '🥇', minXp: 500 },
  diamond: { name: 'Elmas', emoji: '💎', minXp: 1000 },
  master: { name: 'Usta', emoji: '👑', minXp: 2000 },
};

const TURKISH_AVIATION_USERNAMES = [
  'Pilot_Mehmet',
  'Cabin_Selin',
  'AvGeek_Ali',
  'ATC_Ayşe',
  'KaptanBerk',
  'Hostes_Zeynep',
  'TeknisyenBurak',
  'Pilotage_Onur',
  'SkyEsra',
  'AviationFan34',
  'CockpitCenk',
  'Flight_Deniz',
  'Pilot_Pegasus',
  'CabinCrew_Eda',
  'TurboCem',
  'MayDayMurat',
  'Roger_Rana',
  'Wilco_Yusuf',
  'AeroAhmet',
  'TurkishKaptan',
  'BridgeBurçin',
  'TaxiwayTuna',
  'FinalHaluk',
  'GroundOps_Gül',
  'JetAyşegül',
  'FlapsKerem',
  'PushbackPınar',
  'WingsMert',
  'CleanRunwayHasan',
  'AltimeterAyla',
];

const AVATARS = ['✈️', '👨‍✈️', '👩‍✈️', '🛩️', '🛫', '🛬', '🔧', '🌍', '🌟', '⚡', '🔥', '🎯', '🏆', '💼'];

export function generateLeagueMembers(currentUserXp: number): LeagueMember[] {
  // 29 fake user + 1 current user = 30 total
  const members: LeagueMember[] = [];

  // Range: weekly XP between 0 and 3000
  for (let i = 0; i < 29; i++) {
    const xp = Math.floor(Math.random() * 3000);
    const username = TURKISH_AVIATION_USERNAMES[i] ?? `User${i}`;
    const avatar = AVATARS[i % AVATARS.length] ?? '✈️';
    members.push({
      id: `mock_${i}`,
      username,
      avatar,
      weeklyXp: xp,
    });
  }

  members.push({
    id: 'current',
    username: 'Sen',
    avatar: '🎯',
    weeklyXp: currentUserXp,
    isCurrentUser: true,
  });

  // Sort descending
  members.sort((a, b) => b.weeklyXp - a.weeklyXp);

  return members;
}

export function tierForRank(rank: number): { promoted: boolean; demoted: boolean } {
  // Top 7 → promote, last 10 (out of 30) → demote
  return {
    promoted: rank <= 7,
    demoted: rank > 20,
  };
}

/**
 * Hafta sonu kalan süreyi getir.
 */
export function timeUntilWeekEnd(): { days: number; hours: number; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday...
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  const sunday = new Date(now);
  sunday.setDate(now.getDate() + daysUntilSunday);
  sunday.setHours(23, 59, 59, 999);

  const diffMs = sunday.getTime() - now.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

  if (days === 0) return { days: 0, hours, label: `${hours} saat` };
  return { days, hours, label: `${days} gün ${hours} saat` };
}

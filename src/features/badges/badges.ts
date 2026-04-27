/**
 * Rozet sistemi — kullanıcı belli kriterlere ulaşınca kazanır.
 */
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';

export interface Badge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  category: 'streak' | 'xp' | 'content' | 'level' | 'special';
  /** Kullanıcı bu rozeti kazandı mı? Store state'inden hesaplanır */
  isEarned: () => boolean;
}

export const ALL_BADGES: Badge[] = [
  // Streak
  {
    id: 'streak_3',
    emoji: '🔥',
    title: 'İlk Ateş',
    description: '3 gün üst üste giriş yap',
    category: 'streak',
    isEarned: () => useGamificationStore.getState().longestStreak >= 3,
  },
  {
    id: 'streak_7',
    emoji: '🔥',
    title: 'Haftalık',
    description: '7 gün üst üste giriş yap',
    category: 'streak',
    isEarned: () => useGamificationStore.getState().longestStreak >= 7,
  },
  {
    id: 'streak_30',
    emoji: '🔥',
    title: 'Aylık',
    description: '30 gün üst üste giriş yap',
    category: 'streak',
    isEarned: () => useGamificationStore.getState().longestStreak >= 30,
  },
  {
    id: 'streak_100',
    emoji: '💯',
    title: 'Centurion',
    description: '100 gün üst üste giriş yap',
    category: 'streak',
    isEarned: () => useGamificationStore.getState().longestStreak >= 100,
  },
  // XP
  {
    id: 'xp_500',
    emoji: '⭐',
    title: 'İlk 500',
    description: '500 XP topla',
    category: 'xp',
    isEarned: () => useGamificationStore.getState().totalXp >= 500,
  },
  {
    id: 'xp_2k',
    emoji: '🌟',
    title: 'XP Avcısı',
    description: '2.000 XP topla',
    category: 'xp',
    isEarned: () => useGamificationStore.getState().totalXp >= 2000,
  },
  {
    id: 'xp_10k',
    emoji: '✨',
    title: 'XP Lordu',
    description: '10.000 XP topla',
    category: 'xp',
    isEarned: () => useGamificationStore.getState().totalXp >= 10000,
  },
  // Level
  {
    id: 'level_5',
    emoji: '🎖️',
    title: 'Level 5',
    description: 'Seviye 5\'e ulaş',
    category: 'level',
    isEarned: () => useGamificationStore.getState().currentLevel >= 5,
  },
  {
    id: 'level_10',
    emoji: '🥇',
    title: 'Level 10',
    description: 'Seviye 10\'a ulaş',
    category: 'level',
    isEarned: () => useGamificationStore.getState().currentLevel >= 10,
  },
  // Content
  {
    id: 'first_lesson',
    emoji: '🎓',
    title: 'İlk Adım',
    description: 'İlk dersini tamamla',
    category: 'content',
    isEarned: () => useProgressStore.getState().completedLessonIds.length >= 1,
  },
  {
    id: 'lessons_10',
    emoji: '📚',
    title: '10 Ders',
    description: '10 ders tamamla',
    category: 'content',
    isEarned: () => useProgressStore.getState().completedLessonIds.length >= 10,
  },
  {
    id: 'lessons_50',
    emoji: '📖',
    title: 'Kitap Kurdu',
    description: '50 ders tamamla',
    category: 'content',
    isEarned: () => useProgressStore.getState().completedLessonIds.length >= 50,
  },
  // Special
  {
    id: 'cockpit_master',
    emoji: '🛩️',
    title: 'Cockpit Master',
    description: 'Modül 1\'in tamamını bitir',
    category: 'special',
    isEarned: () => useProgressStore.getState().completedLessonIds.length >= 50,
  },
];

export function getEarnedBadges(): Badge[] {
  return ALL_BADGES.filter((b) => b.isEarned());
}

export function getLockedBadges(): Badge[] {
  return ALL_BADGES.filter((b) => !b.isEarned());
}

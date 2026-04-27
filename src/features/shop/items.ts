/**
 * Mağaza ürünleri — coin ile satın alınabilir.
 */

export type ShopItemType = 'streak_freeze' | 'extra_heart' | 'heart_full' | 'hint' | 'xp_boost' | 'lesson_skip';

export interface ShopItem {
  id: string;
  type: ShopItemType;
  emoji: string;
  titleTr: string;
  descriptionTr: string;
  costCoins: number;
  isPremiumOnly: boolean;
  badge?: string; // "BEST VALUE" gibi
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'streak_freeze_1',
    type: 'streak_freeze',
    emoji: '🧊',
    titleTr: 'Streak Freeze',
    descriptionTr: '1 gün kaçırırsan serini koruyacak',
    costCoins: 100,
    isPremiumOnly: false,
    badge: 'POPÜLER',
  },
  {
    id: 'heart_full',
    type: 'heart_full',
    emoji: '❤️',
    titleTr: 'Tüm canları doldur',
    descriptionTr: '5 cana hemen ulaş',
    costCoins: 130,
    isPremiumOnly: false,
  },
  {
    id: 'extra_heart',
    type: 'extra_heart',
    emoji: '💗',
    titleTr: '1 Ekstra Can',
    descriptionTr: 'Anlık can kazan',
    costCoins: 30,
    isPremiumOnly: false,
  },
  {
    id: 'hint',
    type: 'hint',
    emoji: '💡',
    titleTr: 'Hint Pack (3 hint)',
    descriptionTr: 'Quiz\'lerde 50/50 yardımı',
    costCoins: 60,
    isPremiumOnly: false,
  },
  {
    id: 'xp_boost',
    type: 'xp_boost',
    emoji: '⚡',
    titleTr: '2× XP Boost (1 saat)',
    descriptionTr: '1 saat boyunca tüm XP iki katı',
    costCoins: 200,
    isPremiumOnly: true,
    badge: 'PREMIUM',
  },
  {
    id: 'lesson_skip',
    type: 'lesson_skip',
    emoji: '⏭️',
    titleTr: 'Ders Atla',
    descriptionTr: 'Sıkıştığın bir dersi atla (XP almazsın)',
    costCoins: 150,
    isPremiumOnly: true,
    badge: 'PREMIUM',
  },
];

/**
 * Mağaza ürünleri — coin ile satın alınabilir.
 */

export type ShopItemType = 'streak_freeze' | 'extra_heart' | 'heart_full' | 'hint' | 'xp_boost' | 'lesson_skip';

export interface ShopItem {
  id: string;
  type: ShopItemType;
  emoji: string;
  /** i18n key root: `screens.shop.items.{key}` (title) + `screens.shop.items.{key}Desc` */
  key: string;
  /** Deprecated — i18n için `key` kullan. Geriye uyumluluk için tutuluyor. */
  titleTr: string;
  descriptionTr: string;
  costCoins: number;
  isPremiumOnly: boolean;
  /** i18n key: `screens.shop.popular` / `screens.shop.premium`. */
  badgeKey?: 'popular' | 'premium';
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'streak_freeze_1',
    type: 'streak_freeze',
    emoji: '🧊',
    key: 'streakFreeze',
    titleTr: 'Streak Freeze',
    descriptionTr: '1 gün kaçırırsan serini koruyacak',
    costCoins: 100,
    isPremiumOnly: false,
    badgeKey: 'popular',
  },
  {
    id: 'heart_full',
    type: 'heart_full',
    emoji: '❤️',
    key: 'heartFull',
    titleTr: 'Tüm canları doldur',
    descriptionTr: '5 cana hemen ulaş',
    costCoins: 130,
    isPremiumOnly: false,
  },
  {
    id: 'extra_heart',
    type: 'extra_heart',
    emoji: '💗',
    key: 'extraHeart',
    titleTr: '1 Ekstra Can',
    descriptionTr: 'Anlık can kazan',
    costCoins: 30,
    isPremiumOnly: false,
  },
  {
    id: 'hint',
    type: 'hint',
    emoji: '💡',
    key: 'hint',
    titleTr: 'Hint Pack (3 hint)',
    descriptionTr: 'Quiz\'lerde 50/50 yardımı',
    costCoins: 60,
    isPremiumOnly: false,
  },
  {
    id: 'xp_boost',
    type: 'xp_boost',
    emoji: '⚡',
    key: 'xpBoost',
    titleTr: '2× XP Boost (1 saat)',
    descriptionTr: '1 saat boyunca tüm XP iki katı',
    costCoins: 200,
    isPremiumOnly: true,
    badgeKey: 'premium',
  },
  {
    id: 'lesson_skip',
    type: 'lesson_skip',
    emoji: '⏭️',
    key: 'lessonSkip',
    titleTr: 'Ders Atla',
    descriptionTr: 'Sıkıştığın bir dersi atla (XP almazsın)',
    costCoins: 150,
    isPremiumOnly: true,
    badgeKey: 'premium',
  },
];

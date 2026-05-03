/**
 * Shop Screen — Coin store (DB-backed).
 *
 * - useWallet ile DB'den okur (realtime).
 * - purchaseShopItem RPC: spend + inventory atomik.
 * - extra_heart / heart_full / xp_boost — local store (hearts MMKV).
 */
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SHOP_ITEMS, type ShopItem } from '@/features/shop/items';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAuthStore } from '@/stores/authStore';
import { useWallet, purchaseShopItem } from '@/features/wallet/api';
import {
  Mono,
  Body,
  FONTS,
} from '@/components/airspeak';

const INVENTORY_FIELD: Partial<Record<ShopItem['type'], 'streak_freezes_inventory' | 'hints_inventory' | 'lesson_skips_inventory'>> = {
  streak_freeze: 'streak_freezes_inventory',
  hint: 'hints_inventory',
  lesson_skip: 'lesson_skips_inventory',
};

export default function ShopScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const { wallet } = useWallet(userId);
  const hearts = useGamificationStore((s) => s.hearts);
  const maxHearts = useGamificationStore((s) => s.maxHearts);

  const coins = wallet?.coins ?? 0;
  const streakFreezes = wallet?.streak_freezes_inventory ?? 0;
  const hints = wallet?.hints_inventory ?? 0;

  function handlePurchase(item: ShopItem) {
    if (item.isPremiumOnly) {
      Alert.alert(
        t('screens.shop.premiumLocked'),
        t('screens.shop.premiumGo'),
        [
          { text: t('screens.shop.cancel'), style: 'cancel' },
          { text: t('screens.shop.premiumGo'), onPress: () => router.push('/paywall') },
        ],
      );
      return;
    }

    if (coins < item.costCoins) {
      Alert.alert(
        t('screens.shop.notEnoughTitle'),
        t('screens.shop.notEnoughBody', { cost: item.costCoins, coins }),
      );
      return;
    }

    const title = t(`screens.shop.items.${item.key}`);
    Alert.alert(
      t('screens.shop.buyConfirmTitle'),
      t('screens.shop.buyConfirmBody', { title, cost: item.costCoins }),
      [
        { text: t('screens.shop.cancel'), style: 'cancel' },
        {
          text: t('screens.shop.buy'),
          onPress: () => void doPurchase(item, title),
        },
      ],
    );
  }

  async function doPurchase(item: ShopItem, title: string) {
    const inventoryField = INVENTORY_FIELD[item.type];
    const isLocalOnly = item.type === 'extra_heart' || item.type === 'heart_full';

    // extra_heart / heart_full — DB inventory yok, sadece coin spend + local hearts.
    if (isLocalOnly) {
      const res = await purchaseShopItem({
        itemId: item.id,
        cost: item.costCoins,
      });
      if (!res.ok) {
        Alert.alert(t('screens.shop.errorTitle', 'Hata'), res.error ?? t('screens.shop.errorBody', 'İşlem başarısız.'));
        return;
      }
      const store = useGamificationStore.getState();
      if (item.type === 'extra_heart') store.addHeart(1);
      else if (item.type === 'heart_full') store.fillHearts();
      Alert.alert(t('screens.shop.successTitle'), t('screens.shop.successBody', { title }));
      return;
    }

    // xp_boost — DB-side `xp_boost_until` set
    if (item.type === 'xp_boost') {
      const res = await purchaseShopItem({
        itemId: item.id,
        cost: item.costCoins,
        boostMinutes: 60,
      });
      if (!res.ok) {
        Alert.alert(t('screens.shop.errorTitle', 'Hata'), res.error ?? t('screens.shop.errorBody', 'İşlem başarısız.'));
        return;
      }
      Alert.alert(t('screens.shop.successTitle'), t('screens.shop.successBody', { title }));
      return;
    }

    // streak_freeze / hint / lesson_skip — DB inventory column
    const count = item.type === 'hint' ? 3 : 1;
    const res = await purchaseShopItem({
      itemId: item.id,
      cost: item.costCoins,
      inventoryField,
      inventoryCount: count,
    });
    if (!res.ok) {
      Alert.alert(t('screens.shop.errorTitle', 'Hata'), res.error ?? t('screens.shop.errorBody', 'İşlem başarısız.'));
      return;
    }
    Alert.alert(t('screens.shop.successTitle'), t('screens.shop.successBody', { title }));
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}>
            <Text style={{ fontSize: 22, color: '#0E1116' }}>←</Text>
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              fontFamily: FONTS.body800,
              fontSize: 22,
              color: '#0E1116',
            }}
          >
            🪙 {t('screens.shop.title')}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Body color="#5A6478" style={{ fontSize: 14, marginBottom: 16, lineHeight: 21 }}>
          {t('screens.shop.subtitle')}
        </Body>

        {/* Coin balance card */}
        <View
          style={{
            backgroundColor: '#FFD56B',
            borderRadius: 14,
            padding: 18,
            borderBottomWidth: 4,
            borderBottomColor: '#F2C14E',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 48 }}>🪙</Text>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: '#0A1430', letterSpacing: 1.8 }}>
              {t('screens.shop.balance')}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 40,
                fontWeight: '700',
                color: '#0A1430',
                letterSpacing: -1.6,
                lineHeight: 44,
              }}
            >
              {coins.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Inventory row */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
          <InventoryChip emoji="❤️" label={`${hearts}/${maxHearts}`} />
          <InventoryChip emoji="🧊" label={String(streakFreezes)} />
          <InventoryChip emoji="💡" label={String(hints)} />
        </View>

        {/* Items */}
        <View style={{ gap: 10 }}>
          {SHOP_ITEMS.map((item) => {
            const canAfford = coins >= item.costCoins;
            const isLocked = item.isPremiumOnly;
            return (
              <ShopItemCard
                key={item.id}
                item={item}
                canAfford={canAfford}
                isLocked={isLocked}
                onPress={() => handlePurchase(item)}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function InventoryChip({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        borderRadius: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text
        style={{
          fontFamily: FONTS.mono700,
          fontSize: 14,
          color: '#0E1116',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ShopItemCard({
  item,
  canAfford,
  isLocked,
  onPress,
}: {
  item: ShopItem;
  canAfford: boolean;
  isLocked: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const title = t(`screens.shop.items.${item.key}`);
  const desc = t(`screens.shop.items.${item.key}Desc`);
  const badgeColor = item.badgeKey === 'premium' ? '#FFD56B' : '#E63946';
  const badgeTextColor = item.badgeKey === 'premium' ? '#0A1430' : '#FFFFFF';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: isLocked ? '#FFD56B' : '#DCE0E8',
        borderBottomWidth: 4,
        borderBottomColor: isLocked ? '#F2C14E' : '#DCE0E8',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        opacity: isLocked || !canAfford ? 0.85 : 1,
        position: 'relative',
      }}
    >
      {/* Badge */}
      {item.badgeKey && (
        <View
          style={{
            position: 'absolute',
            top: -8,
            right: 12,
            backgroundColor: badgeColor,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Mono style={{ fontSize: 9, color: badgeTextColor, letterSpacing: 0.81 }}>
            {t(`screens.shop.${item.badgeKey}`)}
          </Mono>
        </View>
      )}

      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          backgroundColor: '#EDEFF3',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: '#0E1116' }}>
          {title}
        </Text>
        <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }}>
          {desc}
        </Body>
      </View>

      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        {isLocked ? (
          <Text style={{ fontSize: 22 }}>🔒</Text>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: canAfford ? '#FFF3D6' : '#FFE4E7',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Text style={{ fontSize: 14 }}>🪙</Text>
            <Text
              style={{
                fontFamily: FONTS.mono700,
                fontSize: 13,
                color: canAfford ? '#F2C14E' : '#E63946',
              }}
            >
              {item.costCoins}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

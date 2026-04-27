import { ScrollView, Alert } from 'react-native';
import { YStack, XStack, H2, Paragraph, Card, Button, Text } from 'tamagui';
import { router } from 'expo-router';
import { SHOP_ITEMS, type ShopItem } from '@/features/shop/items';
import { useGamificationStore } from '@/stores/gamificationStore';

export default function ShopScreen() {
  const coins = useGamificationStore((s) => s.coins);
  const spendCoins = useGamificationStore((s) => s.spendCoins);
  const hearts = useGamificationStore((s) => s.hearts);
  const maxHearts = useGamificationStore((s) => s.maxHearts);

  function handlePurchase(item: ShopItem) {
    if (item.isPremiumOnly) {
      Alert.alert(
        'Premium üyelik gerekli',
        'Bu ürün sadece premium üyeler için. Premium\'a geç!',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Premium\'a geç', onPress: () => router.push('/paywall') },
        ],
      );
      return;
    }

    if (coins < item.costCoins) {
      Alert.alert(
        'Yeterli coin yok',
        `Bu ürün için ${item.costCoins} coin gerekiyor. Sende ${coins} coin var. Ders tamamla, lig'de yarış, daily görev al!`,
      );
      return;
    }

    Alert.alert(
      'Satın al',
      `${item.titleTr} için ${item.costCoins} coin harcanacak. Onaylıyor musun?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Satın al',
          onPress: () => {
            const success = spendCoins(item.costCoins, item.type);
            if (success) {
              applyItemEffect(item);
              Alert.alert('🎉 Başarılı!', `${item.titleTr} senin oldu.`);
            }
          },
        },
      ],
    );
  }

  function applyItemEffect(item: ShopItem) {
    const store = useGamificationStore.getState();
    switch (item.type) {
      case 'extra_heart':
        if (hearts < maxHearts) {
          // hearts state'e direct yazmak için store API'sine bir helper eklemediği için
          // kısa yoldan: refill timer'ı geçmişe çek + manual set yapmak yerine
          // Sprint 3'te addHeart fonksiyonu ekleriz. Şimdilik mock alert yeterli.
        }
        break;
      case 'heart_full':
        // Aynı şekilde Sprint 3'te düzeltilecek
        break;
      // streak_freeze, hint, xp_boost: gerçek effect Sprint 3+
      default:
        break;
    }
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <YStack gap="$1">
          <H2 color="$text">🪙 Mağaza</H2>
          <Paragraph color="$textSecondary">
            Coin ile alışveriş yap. Coin kazanmak için: ders tamamla, lig'de yarış, daily görev al.
          </Paragraph>
        </YStack>

        {/* Coin Balance */}
        <Card padding="$4" backgroundColor="$warning">
          <XStack alignItems="center" gap="$3">
            <Text fontSize={48}>🪙</Text>
            <YStack flex={1}>
              <Text fontSize="$3" color="$primaryText" textTransform="uppercase">
                Coin bakiyesi
              </Text>
              <Text fontSize="$8" fontWeight="700" color="$primaryText">
                {coins}
              </Text>
            </YStack>
          </XStack>
        </Card>

        {/* Items */}
        <YStack gap="$3">
          {SHOP_ITEMS.map((item) => {
            const canAfford = coins >= item.costCoins;
            const isLocked = item.isPremiumOnly;
            return (
              <Card
                key={item.id}
                padding="$4"
                backgroundColor="$surface"
                bordered
                opacity={isLocked ? 0.7 : 1}
              >
                <XStack gap="$3" alignItems="center">
                  <Text fontSize={36}>{item.emoji}</Text>
                  <YStack flex={1}>
                    <XStack gap="$2" alignItems="center">
                      <Text fontSize="$5" fontWeight="700" color="$text">
                        {item.titleTr}
                      </Text>
                      {item.badge && (
                        <Card
                          backgroundColor={
                            item.badge === 'PREMIUM' ? '$warning' : '$accent'
                          }
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                        >
                          <Text fontSize="$1" color="$primaryText" fontWeight="700">
                            {item.badge}
                          </Text>
                        </Card>
                      )}
                    </XStack>
                    <Text fontSize="$3" color="$textSecondary">
                      {item.descriptionTr}
                    </Text>
                    <Text fontSize="$3" fontWeight="600" color="$primary">
                      🪙 {item.costCoins}
                    </Text>
                  </YStack>
                  <Button
                    size="$3"
                    backgroundColor={
                      isLocked
                        ? '$border'
                        : canAfford
                          ? '$primary'
                          : '$backgroundHover'
                    }
                    color={
                      isLocked
                        ? '$textSecondary'
                        : canAfford
                          ? '$primaryText'
                          : '$textSecondary'
                    }
                    onPress={() => handlePurchase(item)}
                    disabled={!isLocked && !canAfford}
                  >
                    {isLocked ? '🔒' : canAfford ? 'Al' : 'Yetersiz'}
                  </Button>
                </XStack>
              </Card>
            );
          })}
        </YStack>

        <Card padding="$3" backgroundColor="$accent">
          <Text color="$accentText" fontSize="$3">
            💡 Premium üyelere ekstra: 2× XP Boost ve Ders Atla.
          </Text>
        </Card>
      </YStack>
    </ScrollView>
  );
}

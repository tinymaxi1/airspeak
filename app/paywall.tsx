import { ScrollView } from 'react-native';
import { YStack, XStack, H1, H2, H3, Paragraph, Card, Button, Text } from 'tamagui';
import { router } from 'expo-router';
import { useState } from 'react';
import { track } from '@/lib/posthog';

type Plan = 'monthly' | 'yearly' | 'student';

const PLANS: Record<
  Plan,
  { price: string; pricePerMonth: string; label: string; badge?: string; saving?: string }
> = {
  yearly: {
    price: '₺2.499/yıl',
    pricePerMonth: 'ayda ₺208',
    label: 'Yıllık',
    badge: '⭐ EN POPÜLER',
    saving: '%40 indirim',
  },
  monthly: {
    price: '₺349/ay',
    pricePerMonth: '',
    label: 'Aylık',
  },
  student: {
    price: '₺1.499/yıl',
    pricePerMonth: 'ayda ₺125',
    label: 'Öğrenci yıllık',
    badge: '🎓 .edu.tr',
    saving: '%57 indirim',
  },
};

const FEATURES = [
  { emoji: '🎙️', title: 'AI ile sınırsız konuş', desc: 'Pilot, ATC, mülakat rol oyna' },
  { emoji: '✈️', title: 'ICAO 4 sözlü sınav', desc: '4 görev tipi, 6 alan rubric' },
  { emoji: '🎯', title: 'Telaffuz analizi', desc: 'Kelime kelime feedback' },
  { emoji: '📥', title: 'Offline indirme', desc: 'Uçakta da çalış' },
];

export default function PaywallScreen() {
  const [selected, setSelected] = useState<Plan>('yearly');

  const handleStart = () => {
    track('trial_started', { product: selected });
    // Mock: gerçek RevenueCat entegrasyonu Sprint 6'da
    alert('Trial başladı! (Mock - RevenueCat Sprint 6\'da bağlanacak)');
    router.back();
  };

  const handleClose = () => {
    track('paywall_dismissed', { trigger: 'manual' });
    router.back();
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background">
        <XStack justifyContent="flex-end">
          <Button size="$2" variant="outlined" onPress={handleClose}>
            ✕
          </Button>
        </XStack>

        <YStack alignItems="center" gap="$2">
          <Text fontSize={48}>🚀</Text>
          <H1 color="$text" textAlign="center">
            Sınırsız öğren
          </H1>
          <Paragraph color="$textSecondary" textAlign="center">
            ICAO 4 sınavına hazır olmak için 5 ay yeter.
          </Paragraph>
        </YStack>

        {/* Features */}
        <YStack gap="$2">
          {FEATURES.map((f) => (
            <Card key={f.title} padding="$4" backgroundColor="$surface" bordered>
              <XStack gap="$3" alignItems="center">
                <Text fontSize="$7">{f.emoji}</Text>
                <YStack flex={1}>
                  <Text fontSize="$5" fontWeight="600" color="$text">
                    {f.title}
                  </Text>
                  <Text fontSize="$3" color="$textSecondary">
                    {f.desc}
                  </Text>
                </YStack>
              </XStack>
            </Card>
          ))}
        </YStack>

        <H3 color="$text" marginTop="$2">
          Planını seç:
        </H3>

        {/* Plans */}
        <YStack gap="$2">
          {(['yearly', 'monthly', 'student'] as Plan[]).map((planKey) => {
            const plan = PLANS[planKey];
            const isSelected = selected === planKey;
            return (
              <Card
                key={planKey}
                bordered
                padding="$4"
                backgroundColor={isSelected ? '$primary' : '$surface'}
                borderColor={isSelected ? '$primary' : '$border'}
                onPress={() => setSelected(planKey)}
                pressStyle={{ scale: 0.98 }}
              >
                <YStack gap="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack>
                      <XStack gap="$2" alignItems="center">
                        <Text
                          fontSize="$5"
                          fontWeight="700"
                          color={isSelected ? '$primaryText' : '$text'}
                        >
                          {plan.label}
                        </Text>
                        {plan.badge && (
                          <Card
                            backgroundColor="$warning"
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                          >
                            <Text fontSize="$1" color="$primaryText" fontWeight="600">
                              {plan.badge}
                            </Text>
                          </Card>
                        )}
                      </XStack>
                      <Text
                        fontSize="$6"
                        fontWeight="700"
                        color={isSelected ? '$primaryText' : '$primary'}
                      >
                        {plan.price}
                      </Text>
                      {plan.pricePerMonth && (
                        <Text
                          fontSize="$3"
                          color={isSelected ? '$primaryText' : '$textSecondary'}
                        >
                          {plan.pricePerMonth} {plan.saving && `· ${plan.saving}`}
                        </Text>
                      )}
                    </YStack>
                    {isSelected && (
                      <Text fontSize="$6" color="$primaryText">
                        ✓
                      </Text>
                    )}
                  </XStack>
                </YStack>
              </Card>
            );
          })}
        </YStack>

        {/* Guarantees */}
        <Card padding="$3" backgroundColor="$successSubtle">
          <YStack gap="$1">
            <Text color="$text" fontSize="$3">
              ✅ İlk 7 gün ücretsiz
            </Text>
            <Text color="$text" fontSize="$3">
              ✅ Tek dokunuşla iptal
            </Text>
            <Text color="$text" fontSize="$3">
              ✅ Trial bitmeden hatırlatma
            </Text>
          </YStack>
        </Card>

        <Button
          size="$5"
          backgroundColor="$warning"
          color="$primaryText"
          onPress={handleStart}
        >
          🟡 Ücretsiz başla →
        </Button>

        <Text fontSize="$1" color="$textSecondary" textAlign="center">
          Üyelik şartları · Gizlilik · KVKK
        </Text>
      </YStack>
    </ScrollView>
  );
}

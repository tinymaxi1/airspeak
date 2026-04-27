import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Button, Text } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { StreakBadge } from '@/components/gamification/StreakBadge';
import { XpBar } from '@/components/gamification/XpBar';
import { HeartsRow } from '@/components/gamification/HeartsRow';
import { CoinsBadge } from '@/components/gamification/CoinsBadge';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useGamificationStore } from '@/stores/gamificationStore';

export default function HomeScreen() {
  const { t } = useTranslation();
  const placement = useOnboardingStore((s) => s.placementResult);
  const dailyGoal = useOnboardingStore((s) => s.dailyGoalMinutes);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        {/* Header */}
        <YStack gap="$1">
          <H2 color="$text">{t('home.greeting', 'Hoş geldin, Kaptan!')}</H2>
          <Paragraph color="$textSecondary">{t('home.subtitle')}</Paragraph>
        </YStack>

        {/* Top Stats Row */}
        <Card padding="$4" backgroundColor="$surface" bordered>
          <YStack gap="$3">
            <XStack justifyContent="space-between">
              <StreakBadge size="md" />
              <CoinsBadge />
            </XStack>
            <XpBar />
            <HeartsRow />
          </YStack>
        </Card>

        {/* Level info */}
        {placement && (
          <Card padding="$4" backgroundColor="$accent">
            <XStack alignItems="center" gap="$3">
              <Text fontSize={36} fontWeight="700" color="$accentText">
                {placement.level}
              </Text>
              <YStack flex={1}>
                <Text fontSize="$3" color="$accentText" textTransform="uppercase">
                  {t('home.yourLevel', 'Seviyen')}
                </Text>
                <Text fontSize="$5" fontWeight="600" color="$accentText">
                  {placement.level === 'A1' && t('level.A1')}
                  {placement.level === 'A2' && t('level.A2')}
                  {placement.level === 'B1' && t('level.B1')}
                  {placement.level === 'B2' && t('level.B2')}
                  {placement.level === 'C1' && t('level.C1')}
                </Text>
                <Text fontSize="$3" color="$accentText">
                  {placement.totalScore}/100 puan
                </Text>
              </YStack>
            </XStack>
          </Card>
        )}

        {/* Today's Goal */}
        {dailyGoal && (
          <Card padding="$4" backgroundColor="$surface" bordered>
            <YStack gap="$2">
              <Text fontSize="$3" color="$textSecondary" textTransform="uppercase">
                {t('home.dailyGoal', 'Günlük hedef')}
              </Text>
              <XStack gap="$2" alignItems="center">
                <Text fontSize="$7">⏱️</Text>
                <Text fontSize="$6" fontWeight="700" color="$primary">
                  {dailyGoal} dk
                </Text>
              </XStack>
            </YStack>
          </Card>
        )}

        {/* Bugünün Görevleri */}
        <YStack gap="$2">
          <H3 color="$text">Bugünün görevleri</H3>
          <Card padding="$4" backgroundColor="$surface" bordered>
            <XStack gap="$3" alignItems="center">
              <Text fontSize="$6">📚</Text>
              <YStack flex={1}>
                <Text fontSize="$5" fontWeight="600" color="$text">
                  İlk dersi tamamla
                </Text>
                <Text fontSize="$3" color="$textSecondary">
                  +50 XP · ~5 dakika
                </Text>
              </YStack>
              <Button
                size="$3"
                backgroundColor="$primary"
                color="$primaryText"
                onPress={() => {
                  recordDailyActivity();
                  router.push('/lesson/sample-001');
                }}
              >
                Başla
              </Button>
            </XStack>
          </Card>

          <Card padding="$4" backgroundColor="$surface" bordered opacity={0.6}>
            <XStack gap="$3" alignItems="center">
              <Text fontSize="$6">🎙️</Text>
              <YStack flex={1}>
                <Text fontSize="$5" fontWeight="600" color="$text">
                  AI ile 1 kez konuş
                </Text>
                <Text fontSize="$3" color="$textSecondary">
                  +80 XP · 🔒 PREMIUM
                </Text>
              </YStack>
              <Button
                size="$3"
                variant="outlined"
                onPress={() => router.push('/paywall')}
              >
                🔒
              </Button>
            </XStack>
          </Card>

          <Card padding="$4" backgroundColor="$surface" bordered>
            <XStack gap="$3" alignItems="center">
              <Text fontSize="$6">🧠</Text>
              <YStack flex={1}>
                <Text fontSize="$5" fontWeight="600" color="$text">
                  10 yeni terim öğren
                </Text>
                <Text fontSize="$3" color="$textSecondary">
                  +30 XP
                </Text>
              </YStack>
              <Button size="$3" variant="outlined">
                Aç
              </Button>
            </XStack>
          </Card>
        </YStack>
      </YStack>
    </ScrollView>
  );
}

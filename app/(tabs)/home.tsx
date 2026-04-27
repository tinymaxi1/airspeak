import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Button, Text, Progress } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { StreakBadge } from '@/components/gamification/StreakBadge';
import { XpBar } from '@/components/gamification/XpBar';
import { HeartsRow } from '@/components/gamification/HeartsRow';
import { CoinsBadge } from '@/components/gamification/CoinsBadge';
import { DailyQuests } from '@/components/gamification/DailyQuests';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { getNextLesson, getOverallProgress } from '@/features/lessons/seed/lessonTree';

export default function HomeScreen() {
  const { t } = useTranslation();
  const placement = useOnboardingStore((s) => s.placementResult);
  const dailyGoal = useOnboardingStore((s) => s.dailyGoalMinutes);
  const role = useOnboardingStore((s) => s.role);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);
  const completedSet = useProgressStore((s) => new Set(s.completedLessonIds));

  const next = getNextLesson(role, completedSet, false);
  const overall = getOverallProgress(role, completedSet);

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

        {/* Daily Quests */}
        <DailyQuests />

        {/* Kaldığın yerden devam — sıradaki ders */}
        {next && (
          <Card padding="$4" backgroundColor="$primary">
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <Text fontSize="$3" color="$primaryText" textTransform="uppercase">
                  {next.isFirstEver ? 'İlk dersin' : 'Kaldığın yerden devam et'}
                </Text>
              </XStack>
              <YStack gap="$1">
                <Text fontSize="$2" color="$primaryText" opacity={0.85}>
                  Modül {next.module.number} · {next.module.title}
                </Text>
                <Text fontSize="$2" color="$primaryText" opacity={0.85}>
                  Ünite {next.unit.number} · {next.unit.title}
                </Text>
                <Text fontSize="$6" fontWeight="700" color="$primaryText" marginTop="$1">
                  {next.lesson.title}
                </Text>
                <Text fontSize="$2" color="$primaryText" opacity={0.85}>
                  +{next.lesson.xp} XP · {next.lesson.estimatedMinutes} dk · {lessonTypeLabel(next.lesson.type)}
                </Text>
              </YStack>
              <Button
                size="$5"
                backgroundColor="$primaryText"
                color="$primary"
                onPress={() => {
                  recordDailyActivity();
                  router.push({ pathname: '/lesson/[id]', params: { id: next.lesson.id } });
                }}
              >
                {next.isFirstEver ? '🚀 Hadi başla' : '▶️  Devam et'}
              </Button>
            </YStack>
          </Card>
        )}

        {/* Genel ilerleme — rol bazlı yolculuk yüzdesi */}
        {overall.total > 0 && (
          <Card padding="$4" backgroundColor="$surface" bordered>
            <YStack gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$3" color="$textSecondary" textTransform="uppercase">
                  Toplam ilerleme
                </Text>
                <Text fontSize="$4" fontWeight="700" color="$primary">
                  {overall.percent}%
                </Text>
              </XStack>
              <Progress value={overall.percent} max={100} backgroundColor="$border">
                <Progress.Indicator animation="lazy" backgroundColor="$primary" />
              </Progress>
              <Text fontSize="$2" color="$textSecondary">
                {overall.completed} / {overall.total} ders tamamlandı
              </Text>
            </YStack>
          </Card>
        )}

        {/* Tüm yolculuk tamamlanmışsa */}
        {!next && overall.total > 0 && (
          <Card padding="$4" backgroundColor="$success">
            <YStack gap="$2" alignItems="center">
              <Text fontSize={48}>🏆</Text>
              <Text fontSize="$6" fontWeight="700" color="$primaryText">
                Yolculuğu tamamladın!
              </Text>
              <Text fontSize="$3" color="$primaryText">
                Tüm açık dersleri bitirdin — premium ile devam edebilirsin
              </Text>
              <Button
                size="$4"
                backgroundColor="$primaryText"
                color="$success"
                onPress={() => router.push('/paywall')}
              >
                Premium'a geç
              </Button>
            </YStack>
          </Card>
        )}

        {/* Ders ağacını aç (ikincil aksiyon) */}
        <Button
          size="$4"
          variant="outlined"
          borderColor="$primary"
          color="$primary"
          onPress={() => router.push('/(tabs)/learn')}
        >
          Tüm dersleri görüntüle →
        </Button>
      </YStack>
    </ScrollView>
  );
}

function lessonTypeLabel(type: string): string {
  switch (type) {
    case 'vocabulary':
      return '📚 Vocab';
    case 'dialogue':
      return '💬 Diyalog';
    case 'listening':
      return '🎧 Dinleme';
    case 'pronunciation':
      return '🎙️ Telaffuz';
    case 'quiz':
      return '🎯 Quiz';
    default:
      return '📘 Ders';
  }
}

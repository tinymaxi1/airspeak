import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Button, Card, Text, Progress } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { track } from '@/lib/posthog';

interface DailyGoalOption {
  mins: 5 | 10 | 15 | 30 | 60;
  emoji: string;
  labelKey: string;
  titleKey: string;
  recommended?: boolean;
}

const DAILY_GOALS: DailyGoalOption[] = [
  { mins: 5, emoji: '⚡', labelKey: 'onboarding.daily.5', titleKey: 'onboarding.daily.5_title' },
  { mins: 10, emoji: '☕', labelKey: 'onboarding.daily.10', titleKey: 'onboarding.daily.10_title' },
  {
    mins: 15,
    emoji: '⭐',
    labelKey: 'onboarding.daily.15',
    titleKey: 'onboarding.daily.15_title',
    recommended: true,
  },
  { mins: 30, emoji: '🔥', labelKey: 'onboarding.daily.30', titleKey: 'onboarding.daily.30_title' },
  { mins: 60, emoji: '🚀', labelKey: 'onboarding.daily.60', titleKey: 'onboarding.daily.60_title' },
];

export default function GoalsScreen() {
  const { t } = useTranslation();
  const placement = useOnboardingStore((s) => s.placementResult);
  const setDailyGoal = useOnboardingStore((s) => s.setDailyGoal);
  const role = useOnboardingStore((s) => s.role);
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete);
  const [selected, setSelected] = useState<5 | 10 | 15 | 30 | 60 | null>(15);

  const handleFinish = () => {
    if (!selected) return;
    setDailyGoal(selected);
    setOnboardingComplete(true);
    track('onboarding_completed', {
      role: role ?? null,
      level: placement?.level ?? null,
      daily_goal: selected,
    });
    router.replace('/(tabs)/home');
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
        <Progress value={80} max={100} backgroundColor="$border">
          <Progress.Indicator animation="lazy" backgroundColor="$primary" />
        </Progress>
        <Paragraph size="$2" color="$textSecondary">
          {t('onboarding.step', 'Adım {{current}}/{{total}}', { current: 4, total: 5 })}
        </Paragraph>

        {/* Placement sonucu özeti */}
        {placement && (
          <Card padding="$4" backgroundColor="$accent">
            <YStack gap="$2">
              <Text fontSize="$3" color="$accentText" textTransform="uppercase">
                {t('onboarding.goals.yourLevel', 'Seviyen')}
              </Text>
              <XStack alignItems="center" gap="$3">
                <Text fontSize={48} fontWeight="700" color="$accentText">
                  {placement.level}
                </Text>
                <YStack flex={1}>
                  <Text fontSize="$5" fontWeight="600" color="$accentText">
                    {placement.level === 'A1' && t('level.A1', 'Başlangıç')}
                    {placement.level === 'A2' && t('level.A2', 'Temel')}
                    {placement.level === 'B1' && t('level.B1', 'Orta')}
                    {placement.level === 'B2' && t('level.B2', 'Orta-üstü')}
                    {placement.level === 'C1' && t('level.C1', 'İleri')}
                  </Text>
                  <Text fontSize="$3" color="$accentText">
                    {placement.totalScore}/100 puan
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          </Card>
        )}

        <H2 color="$text">
          {t('onboarding.goals.title', 'Günde ne kadar zaman ayırabilirsin?')}
        </H2>
        <Paragraph color="$textSecondary">
          {t('onboarding.goals.subtitle', 'Sonra istediğin zaman değiştirebilirsin.')}
        </Paragraph>

        <YStack gap="$3">
          {DAILY_GOALS.map((option) => {
            const isSelected = selected === option.mins;
            return (
              <Card
                key={option.mins}
                bordered
                padding="$4"
                backgroundColor={isSelected ? '$primary' : '$surface'}
                borderColor={isSelected ? '$primary' : '$border'}
                onPress={() => setSelected(option.mins)}
                pressStyle={{ scale: 0.98 }}
              >
                <XStack gap="$3" alignItems="center">
                  <Text fontSize={28}>{option.emoji}</Text>
                  <YStack flex={1}>
                    <XStack gap="$2" alignItems="center">
                      <Text
                        fontSize="$5"
                        fontWeight="600"
                        color={isSelected ? '$primaryText' : '$text'}
                      >
                        {option.mins} {t('common.minutes', 'dakika')}
                      </Text>
                      {option.recommended && (
                        <Card
                          backgroundColor="$warning"
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                        >
                          <Text fontSize="$1" color="$primaryText" fontWeight="600">
                            ÖNERİLEN
                          </Text>
                        </Card>
                      )}
                    </XStack>
                    <Text
                      fontSize="$3"
                      color={isSelected ? '$primaryText' : '$textSecondary'}
                    >
                      {t(option.titleKey, '...')}
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            );
          })}
        </YStack>

        <Button
          size="$5"
          backgroundColor={selected ? '$primary' : '$border'}
          color={selected ? '$primaryText' : '$textSecondary'}
          disabled={!selected}
          onPress={handleFinish}
          marginTop="$4"
        >
          {t('onboarding.goals.cta', 'AirSpeak\'e başla 🛫')}
        </Button>
      </YStack>
    </ScrollView>
  );
}

import { ScrollView } from 'react-native';
import { YStack, XStack, H2, Paragraph, Button, Card, Text, Progress } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { UserRole } from '@/types/profile';

const ROLES: { id: UserRole; emoji: string; titleKey: string; descKey: string }[] = [
  {
    id: 'pilot',
    emoji: '✈️',
    titleKey: 'onboarding.roles.pilot.title',
    descKey: 'onboarding.roles.pilot.desc',
  },
  {
    id: 'cabin',
    emoji: '👨‍✈️',
    titleKey: 'onboarding.roles.cabin.title',
    descKey: 'onboarding.roles.cabin.desc',
  },
  {
    id: 'technician',
    emoji: '🔧',
    titleKey: 'onboarding.roles.technician.title',
    descKey: 'onboarding.roles.technician.desc',
  },
  {
    id: 'ground',
    emoji: '🛬',
    titleKey: 'onboarding.roles.ground.title',
    descKey: 'onboarding.roles.ground.desc',
  },
  {
    id: 'student',
    emoji: '🎓',
    titleKey: 'onboarding.roles.student.title',
    descKey: 'onboarding.roles.student.desc',
  },
];

export default function RoleSelectScreen() {
  const { t } = useTranslation();
  const setRole = useOnboardingStore((s) => s.setRole);
  const currentRole = useOnboardingStore((s) => s.role);
  const [selected, setSelected] = useState<UserRole | null>(currentRole);

  const handleNext = () => {
    if (!selected) return;
    setRole(selected);
    router.push('/(auth)/onboarding/level-test');
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
        <Progress value={20} max={100} backgroundColor="$border">
          <Progress.Indicator animation="lazy" backgroundColor="$primary" />
        </Progress>
        <Paragraph size="$2" color="$textSecondary">
          {t('onboarding.step', 'Adım {{current}}/{{total}}', { current: 1, total: 5 })}
        </Paragraph>

        <H2 color="$text">
          {t('onboarding.roleSelect.title', 'Hangi rolde havacılığa bakıyorsun?')}
        </H2>
        <Paragraph color="$textSecondary">
          {t('onboarding.roleSelect.subtitle', 'Sana özel ders yolu kuracağız.')}
        </Paragraph>

        <YStack gap="$3">
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            return (
              <Card
                key={role.id}
                elevate
                bordered
                padding="$4"
                backgroundColor={isSelected ? '$primary' : '$surface'}
                borderColor={isSelected ? '$primary' : '$border'}
                onPress={() => setSelected(role.id)}
                pressStyle={{ scale: 0.98 }}
              >
                <XStack gap="$3" alignItems="center">
                  <Text fontSize={32}>{role.emoji}</Text>
                  <YStack flex={1}>
                    <Text
                      fontSize="$5"
                      fontWeight="600"
                      color={isSelected ? '$primaryText' : '$text'}
                    >
                      {t(role.titleKey)}
                    </Text>
                    <Text
                      fontSize="$3"
                      color={isSelected ? '$primaryText' : '$textSecondary'}
                    >
                      {t(role.descKey)}
                    </Text>
                  </YStack>
                  {isSelected && (
                    <Text fontSize="$5" color="$primaryText">
                      ✓
                    </Text>
                  )}
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
          onPress={handleNext}
          marginTop="$4"
        >
          {t('common.continue', 'Devam et')}
        </Button>
      </YStack>
    </ScrollView>
  );
}

import { ScrollView } from 'react-native';
import { YStack, XStack, H2, Paragraph, Button, Card, Text } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useState } from 'react';
import type { UserRole } from '@/types/profile';

const ROLES: { id: UserRole; emoji: string; titleKey: string; descKey: string }[] = [
  { id: 'pilot', emoji: '✈️', titleKey: 'onboarding.roles.pilot.title', descKey: 'onboarding.roles.pilot.desc' },
  { id: 'cabin', emoji: '👨‍✈️', titleKey: 'onboarding.roles.cabin.title', descKey: 'onboarding.roles.cabin.desc' },
  { id: 'technician', emoji: '🔧', titleKey: 'onboarding.roles.technician.title', descKey: 'onboarding.roles.technician.desc' },
  { id: 'ground', emoji: '🛬', titleKey: 'onboarding.roles.ground.title', descKey: 'onboarding.roles.ground.desc' },
  { id: 'student', emoji: '🎓', titleKey: 'onboarding.roles.student.title', descKey: 'onboarding.roles.student.desc' },
];

export default function RoleSelectScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const handleNext = () => {
    if (!selected) return;
    // TODO: persist to profile (Sprint 1 — auth API)
    router.push('/(auth)/onboarding/level-test');
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
        <H2 color="$text">
          {t('onboarding.roleSelect.title', 'Hangi rolde çalışıyorsun?')}
        </H2>
        <Paragraph color="$textSecondary">
          {t('onboarding.roleSelect.subtitle', 'Sana özel ders ve içerik göstereceğiz')}
        </Paragraph>

        <YStack gap="$3">
          {ROLES.map((role) => (
            <Card
              key={role.id}
              elevate
              bordered
              padding="$4"
              backgroundColor={selected === role.id ? '$accent' : '$surface'}
              onPress={() => setSelected(role.id)}
              pressStyle={{ scale: 0.98 }}
            >
              <XStack gap="$3" alignItems="center">
                <Text fontSize={32}>{role.emoji}</Text>
                <YStack flex={1}>
                  <Text
                    fontSize="$5"
                    fontWeight="600"
                    color={selected === role.id ? '$accentText' : '$text'}
                  >
                    {t(role.titleKey)}
                  </Text>
                  <Text
                    fontSize="$3"
                    color={selected === role.id ? '$accentText' : '$textSecondary'}
                  >
                    {t(role.descKey)}
                  </Text>
                </YStack>
              </XStack>
            </Card>
          ))}
        </YStack>

        <Button
          size="$5"
          backgroundColor="$primary"
          color="$primaryText"
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

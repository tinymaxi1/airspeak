import { YStack, H2, Paragraph, Button } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

export default function LevelTestScreen() {
  const { t } = useTranslation();

  return (
    <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
      <H2 color="$text">{t('onboarding.levelTest.title', 'Seviye belirleme testi')}</H2>
      <Paragraph color="$textSecondary">
        {t('onboarding.levelTest.subtitle', '10 soru — 1 dakika sürer')}
      </Paragraph>
      {/* TODO: 10 soruluk seviye testi (Sprint 1) */}
      <Button
        size="$5"
        backgroundColor="$primary"
        color="$primaryText"
        onPress={() => router.push('/(auth)/onboarding/goals')}
      >
        {t('common.continue', 'Devam et')}
      </Button>
    </YStack>
  );
}

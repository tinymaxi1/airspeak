import { YStack, H2, Paragraph, Button } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function GoalsScreen() {
  const { t } = useTranslation();

  const finishOnboarding = () => {
    useAuthStore.getState().setOnboardingComplete(true);
    router.replace('/(tabs)/home');
  };

  return (
    <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
      <H2 color="$text">{t('onboarding.goals.title', 'Günlük hedefini seç')}</H2>
      <Paragraph color="$textSecondary">
        {t('onboarding.goals.subtitle', 'Ne kadar süre çalışmak istersin?')}
      </Paragraph>
      {/* TODO: 5/10/15/30 dk seçimi (Sprint 1) */}
      <Button size="$5" backgroundColor="$primary" color="$primaryText" onPress={finishOnboarding}>
        {t('onboarding.goals.cta', 'Başla')}
      </Button>
    </YStack>
  );
}

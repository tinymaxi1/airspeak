import { YStack, H1, Paragraph, Button } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <YStack flex={1} padding="$4" justifyContent="space-between" backgroundColor="$background">
      <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
        <H1 textAlign="center" color="$primary">
          AirSpeak
        </H1>
        <Paragraph textAlign="center" color="$textSecondary" size="$5">
          {t('welcome.tagline', 'Master Aviation English')}
        </Paragraph>
      </YStack>

      <YStack gap="$3" paddingBottom="$6">
        <Button
          size="$5"
          backgroundColor="$primary"
          color="$primaryText"
          onPress={() => router.push('/(auth)/register')}
        >
          {t('welcome.getStarted', 'Başla')}
        </Button>
        <Button
          size="$5"
          variant="outlined"
          onPress={() => router.push('/(auth)/login')}
        >
          {t('welcome.haveAccount', 'Hesabım var')}
        </Button>
      </YStack>
    </YStack>
  );
}

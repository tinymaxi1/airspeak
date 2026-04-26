import { ScrollView } from 'react-native';
import { YStack, H2, Paragraph } from 'tamagui';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <H2 color="$text">{t('home.greeting', 'Hoş geldin, Kaptan!')}</H2>
        <Paragraph color="$textSecondary">
          {t('home.subtitle', 'Bugünün görevleri ve kaldığın yerden devam et')}
        </Paragraph>
        {/* TODO: Streak widget, görevler, devam et kartı (Sprint 3) */}
      </YStack>
    </ScrollView>
  );
}

import { ScrollView } from 'react-native';
import { YStack, H2, Paragraph } from 'tamagui';
import { useTranslation } from 'react-i18next';

export default function PracticeScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <H2 color="$text">{t('practice.title', 'Pratik')}</H2>
        <Paragraph color="$textSecondary">
          {t('practice.subtitle', 'AI konuşma · Quiz · Sınav · Telaffuz · SRS')}
        </Paragraph>
        {/* TODO: Pratik hub (Sprint 4-5) */}
      </YStack>
    </ScrollView>
  );
}

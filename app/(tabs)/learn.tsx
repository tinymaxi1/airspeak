import { ScrollView } from 'react-native';
import { YStack, H2, Paragraph } from 'tamagui';
import { useTranslation } from 'react-i18next';

export default function LearnScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <H2 color="$text">{t('learn.title', 'Öğren')}</H2>
        <Paragraph color="$textSecondary">
          {t('learn.subtitle', 'Rolüne ve seviyene özel ders ağacı')}
        </Paragraph>
        {/* TODO: Ders ağacı (Sprint 2) */}
      </YStack>
    </ScrollView>
  );
}

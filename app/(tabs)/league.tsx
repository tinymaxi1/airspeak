import { ScrollView } from 'react-native';
import { YStack, H2, Paragraph } from 'tamagui';
import { useTranslation } from 'react-i18next';

export default function LeagueScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <H2 color="$text">{t('league.title', 'Lig')}</H2>
        <Paragraph color="$textSecondary">
          {t('league.subtitle', 'Haftalık sıralama — tier yüksel, ödül kazan')}
        </Paragraph>
        {/* TODO: Lig leaderboard (Sprint 4) */}
      </YStack>
    </ScrollView>
  );
}

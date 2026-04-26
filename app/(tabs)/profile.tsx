import { ScrollView } from 'react-native';
import { YStack, H2, Paragraph, Button } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { signOut } from '@/features/auth/api';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <H2 color="$text">{t('profile.title', 'Profil')}</H2>
        <Paragraph color="$textSecondary">
          {t('profile.subtitle', 'İstatistiklerin, rozetler, ayarlar')}
        </Paragraph>
        {/* TODO: Profil istatistikleri (Sprint 1-3) */}
        <Button onPress={signOut} variant="outlined">
          {t('profile.signOut', 'Çıkış yap')}
        </Button>
      </YStack>
    </ScrollView>
  );
}

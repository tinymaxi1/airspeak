import { YStack, H2, Paragraph, Button, Input, Label } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useState } from 'react';
import { resetPassword } from '@/features/auth/api';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setError(null);
    const { error: err } = await resetPassword(email);
    if (err) setError(err.message);
    else setSent(true);
    setLoading(false);
  }

  return (
    <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
      <H2 color="$text">{t('auth.forgot.title', 'Şifre sıfırla')}</H2>
      <Paragraph color="$textSecondary">
        {t('auth.forgot.subtitle', 'E-posta adresine sıfırlama linki göndereceğiz')}
      </Paragraph>

      {sent ? (
        <Paragraph color="$success">
          {t('auth.forgot.sent', 'E-postanı kontrol et — sıfırlama linki gönderildi.')}
        </Paragraph>
      ) : (
        <>
          <YStack gap="$2">
            <Label htmlFor="email">{t('auth.email', 'E-posta')}</Label>
            <Input
              id="email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </YStack>
          {error && <Paragraph color="$danger">{error}</Paragraph>}
          <Button
            size="$5"
            backgroundColor="$primary"
            color="$primaryText"
            disabled={loading}
            onPress={handleSend}
          >
            {t('auth.forgot.cta', 'Link gönder')}
          </Button>
        </>
      )}

      <Button variant="outlined" onPress={() => router.back()}>
        {t('common.back', 'Geri dön')}
      </Button>
    </YStack>
  );
}

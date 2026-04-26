import { YStack, H2, Paragraph, Button, Input, Label } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useState } from 'react';
import { signUpWithEmail } from '@/features/auth/api';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setLoading(true);
    setError(null);
    const { error: err } = await signUpWithEmail(email, password);
    if (err) setError(err.message);
    else router.replace('/(auth)/onboarding/role-select');
    setLoading(false);
  }

  return (
    <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
      <H2 color="$text">{t('auth.register.title', 'Kayıt ol')}</H2>
      <Paragraph color="$textSecondary">
        {t('auth.register.subtitle', 'İlk 7 gün ücretsiz dene')}
      </Paragraph>

      <YStack gap="$2">
        <Label htmlFor="email">{t('auth.email', 'E-posta')}</Label>
        <Input
          id="email"
          value={email}
          onChangeText={setEmail}
          placeholder="ornek@email.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
      </YStack>

      <YStack gap="$2">
        <Label htmlFor="password">{t('auth.password', 'Şifre')}</Label>
        <Input
          id="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          placeholder={t('auth.passwordHint', 'En az 8 karakter')}
        />
      </YStack>

      {error && <Paragraph color="$danger">{error}</Paragraph>}

      <Button
        size="$5"
        backgroundColor="$primary"
        color="$primaryText"
        disabled={loading}
        onPress={handleRegister}
      >
        {loading ? t('auth.loading', 'Kaydediliyor...') : t('auth.register.cta', 'Kayıt ol')}
      </Button>

      <Button variant="outlined" onPress={() => router.replace('/(auth)/login')}>
        {t('auth.haveAccount', 'Hesabın var mı? Giriş yap')}
      </Button>
    </YStack>
  );
}

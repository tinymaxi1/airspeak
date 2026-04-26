import { YStack, H2, Paragraph, Button, Input, Label } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useState } from 'react';
import { signInWithEmail } from '@/features/auth/api';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    const { error: err } = await signInWithEmail(email, password);
    if (err) setError(err.message);
    setLoading(false);
  }

  return (
    <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
      <H2 color="$text">{t('auth.login.title', 'Giriş yap')}</H2>
      <Paragraph color="$textSecondary">
        {t('auth.login.subtitle', 'AirSpeak hesabına giriş yap')}
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
          autoComplete="current-password"
        />
      </YStack>

      {error && <Paragraph color="$danger">{error}</Paragraph>}

      <Button
        size="$5"
        backgroundColor="$primary"
        color="$primaryText"
        disabled={loading}
        onPress={handleLogin}
      >
        {loading ? t('auth.loading', 'Giriş yapılıyor...') : t('auth.login.cta', 'Giriş yap')}
      </Button>

      <Button variant="outlined" onPress={() => router.push('/(auth)/forgot-password')}>
        {t('auth.forgotPassword', 'Şifremi unuttum')}
      </Button>

      <Button variant="outlined" onPress={() => router.replace('/(auth)/register')}>
        {t('auth.noAccount', 'Hesabın yok mu? Kayıt ol')}
      </Button>
    </YStack>
  );
}

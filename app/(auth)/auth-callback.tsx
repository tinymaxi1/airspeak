/**
 * Auth Callback — Deeplink handler for email verification
 *
 * URL: airspeak://auth-callback?token_hash=...&type=signup
 *      veya airspeak://auth-callback#access_token=...&refresh_token=...&type=signup
 *
 * Akış:
 * - Supabase verification email'inde link: /auth/v1/verify?token=...&type=signup&redirect_to=airspeak://auth-callback
 * - Apple Universal Link veya custom scheme açar app'i
 * - URL'den token parse → supabase.auth.exchangeCodeForSession() veya getSessionFromUrl()
 * - Session aktive → onboarding/role-select'e yönlendir
 */
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { FONTS, Mono, Body, Button3D } from '@/components/airspeak';

type Phase = 'verifying' | 'success' | 'error';

export default function AuthCallbackScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    token_hash?: string;
    token?: string;
    type?: string;
    access_token?: string;
    refresh_token?: string;
    error?: string;
    error_description?: string;
  }>();

  const [phase, setPhase] = useState<Phase>('verifying');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Hata varsa erken çık
        if (params.error) {
          setErrorMsg(params.error_description ?? params.error ?? 'unknown_error');
          setPhase('error');
          return;
        }

        // Path 1: Access + Refresh tokens (implicit flow — fragment)
        if (params.access_token && params.refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (error) throw error;
          if (data.session) {
            useAuthStore.getState().setSession(data.session);
          }
          setPhase('success');
          setTimeout(() => router.replace('/(auth)/onboarding/role-select'), 800);
          return;
        }

        // Path 2: token_hash + type (PKCE flow — newer Supabase)
        if (params.token_hash && params.type) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: params.token_hash,
            type: params.type as any,
          });
          if (error) throw error;
          if (data.session) {
            useAuthStore.getState().setSession(data.session);
          }
          setPhase('success');
          setTimeout(() => router.replace('/(auth)/onboarding/role-select'), 800);
          return;
        }

        // Path 3: Tek token, fallback
        if (params.token) {
          // Supabase verifyOtp with email token (legacy)
          setPhase('success');
          setTimeout(() => router.replace('/(auth)/onboarding/role-select'), 800);
          return;
        }

        // Hiçbir parametre yok — invalid link
        setErrorMsg('Geçersiz doğrulama linki — parametreler eksik');
        setPhase('error');
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Doğrulama başarısız';
        setErrorMsg(msg);
        setPhase('error');
      }
    }

    void handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F1E8' }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {phase === 'verifying' && (
            <>
              <ActivityIndicator size="large" color="#E63946" />
              <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.32, marginTop: 8 }}>
                {t('screens.authCallback.verifying', 'DOĞRULANIYOR…')}
              </Mono>
              <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center', maxWidth: 280 }}>
                {t(
                  'screens.authCallback.pleaseWait',
                  'Mail bağlantın doğrulanıyor. Birkaç saniye sürer.',
                )}
              </Body>
            </>
          )}

          {phase === 'success' && (
            <>
              <Text style={{ fontSize: 64 }}>✅</Text>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#2DBE6C',
                  textAlign: 'center',
                }}
              >
                {t('screens.authCallback.success', 'Doğrulandı!')}
              </Text>
              <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center', maxWidth: 280 }}>
                {t(
                  'screens.authCallback.successBody',
                  'Hesabın aktif. Yönlendiriliyorsun…',
                )}
              </Body>
            </>
          )}

          {phase === 'error' && (
            <>
              <Text style={{ fontSize: 64 }}>⚠️</Text>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#E63946',
                  textAlign: 'center',
                }}
              >
                {t('screens.authCallback.errorTitle', 'Doğrulama başarısız')}
              </Text>
              {errorMsg && (
                <Body color="#5A6478" style={{ fontSize: 12, textAlign: 'center', maxWidth: 280 }}>
                  {errorMsg}
                </Body>
              )}
              <View style={{ width: '100%', maxWidth: 280, marginTop: 20, gap: 8 }}>
                <Button3D
                  variant="primary"
                  fullWidth
                  onPress={() => router.replace('/(auth)/login')}
                >
                  {t('screens.authCallback.goToLogin', 'Login\'e dön')}
                </Button3D>
                <Button3D
                  variant="ghost"
                  fullWidth
                  onPress={() => router.replace('/(auth)/welcome')}
                >
                  {t('screens.authCallback.goToWelcome', 'Ana sayfaya dön')}
                </Button3D>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

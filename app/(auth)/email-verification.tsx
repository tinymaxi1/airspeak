/**
 * Email Verification Screen — Apple Submit / Production standart flow
 *
 * Akış:
 * - Register sonrası signUp() session null + user var → buraya yönlendir
 * - User'a "Mailini kontrol et" mesajı, "Tekrar gönder" butonu (60sn cooldown)
 * - Auto-poll: her 5sn supabase.auth.getUser() → email_confirmed_at set olunca
 *   otomatik onboarding'e geçer (user app'i bırakıp mail'e döndüğünde catch eder)
 * - "Login'e dön" linki (kullanıcı maili kaybederse veya sonra bakacaksa)
 *
 * Deeplink akışı:
 * - Mail'deki link → airspeak://auth-callback?token=...&type=signup
 * - auth-callback.tsx session'ı exchange eder, sonra onboarding/role-select'e yönlendirir
 */
import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, AppState, type AppStateStatus } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resendVerificationEmail, checkEmailVerified } from '@/features/auth/api';
import { supabase } from '@/lib/supabase';
import {
  HHero,
  Eyebrow,
  Body,
  Mono,
  FONTS,
  Button3D,
} from '@/components/airspeak';

const POLL_INTERVAL_MS = 5000; // her 5sn auto-check
const RESEND_COOLDOWN_SEC = 60;

export default function EmailVerificationScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';

  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SEC);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-poll: her 5sn verification status check
  useEffect(() => {
    async function tick() {
      if (checking) return;
      setChecking(true);
      try {
        const verified = await checkEmailVerified();
        if (verified) {
          // Verification başarılı — session aktif, onboarding'e geç
          if (pollRef.current) clearInterval(pollRef.current);
          router.replace('/(auth)/onboarding/role-select');
        }
      } finally {
        setChecking(false);
      }
    }

    pollRef.current = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AppState: app foreground'a döndüğünde immediate check (user mailden döndü)
  useEffect(() => {
    const onChange = async (next: AppStateStatus) => {
      if (next === 'active') {
        const verified = await checkEmailVerified();
        if (verified) {
          router.replace('/(auth)/onboarding/role-select');
        }
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  // Auth state listener: Supabase magic link callback ile session set olduğunda yakala
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        router.replace('/(auth)/onboarding/role-select');
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Resend cooldown countdown
  useEffect(() => {
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  async function onResend() {
    if (cooldown > 0 || resending || !email) return;
    setResending(true);
    const { error } = await resendVerificationEmail(email);
    setResending(false);
    if (error) {
      Alert.alert(
        t('common.error', 'Hata') as string,
        error.message ?? t('screens.emailVerification.resendError', 'Mail gönderilemedi'),
      );
      return;
    }
    setCooldown(RESEND_COOLDOWN_SEC);
    Alert.alert(
      t('screens.emailVerification.resentTitle', 'Mail gönderildi'),
      t(
        'screens.emailVerification.resentBody',
        '{{email}} adresine yeni doğrulama linki gönderildi.',
        { email },
      ) as string,
    );
  }

  function onBackToLogin() {
    router.replace('/(auth)/login');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F1E8' }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={{ fontSize: 24, color: '#0E1116' }}>←</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 }}
      >
        <Eyebrow accent>
          {t('screens.emailVerification.eyebrow', 'DOĞRULAMA BEKLENİYOR')}
        </Eyebrow>
        <HHero style={{ marginTop: 6, fontSize: 30, lineHeight: 32, letterSpacing: -0.75 }}>
          {t('screens.emailVerification.title1', 'Mailini')}
          {'\n'}
          {t('screens.emailVerification.title2', 'kontrol et.')}
        </HHero>

        <Body color="#5A6478" style={{ fontSize: 14, marginTop: 14, lineHeight: 21 }}>
          {t(
            'screens.emailVerification.body',
            '{{email}} adresine doğrulama linki gönderdik. Mail kutunu aç, linke dokun — otomatik geri döneceksin.',
            { email },
          )}
        </Body>

        {/* Email card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
            marginTop: 22,
            padding: 16,
          }}
        >
          <Eyebrow>
            {t('screens.emailVerification.sentTo', 'GÖNDERİLDİ')}
          </Eyebrow>
          <Text
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              fontWeight: '600',
              color: '#0E1116',
              marginTop: 6,
            }}
          >
            {email || '—'}
          </Text>

          {/* Auto-check status hint */}
          <View
            style={{
              borderTopWidth: 1,
              borderStyle: 'dashed',
              borderColor: '#DCE0E8',
              marginVertical: 12,
              marginHorizontal: -2,
            }}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#2DBE6C',
              }}
            />
            <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 0.9 }}>
              {t(
                'screens.emailVerification.autoCheck',
                'OTOMATIK KONTROL · DOĞRULAMA YAPINCA GEÇER',
              )}
            </Mono>
          </View>
        </View>

        {/* Info: Spam / Promosyonlar */}
        <View
          style={{
            backgroundColor: '#E0F2FF',
            padding: 14,
            borderRadius: 12,
            marginTop: 16,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#2EA8FF',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>i</Text>
          </View>
          <Text style={{ flex: 1, fontSize: 12, color: '#0F1E47', lineHeight: 17 }}>
            {t(
              'screens.emailVerification.spamHint',
              'Mail görünmüyorsa Spam ve Promosyonlar klasörünü kontrol et. Gönderen: noreply@supabase.io',
            )}
          </Text>
        </View>

        {/* Resend button */}
        <View style={{ marginTop: 22 }}>
          <Button3D
            variant="primary"
            fullWidth
            disabled={cooldown > 0 || resending}
            onPress={onResend}
          >
            {resending
              ? (t('common.loading', 'Gönderiliyor…') as string)
              : cooldown > 0
                ? (t('screens.emailVerification.resendCooldown', 'Tekrar gönder ({{sec}})', {
                    sec: cooldown,
                  }) as string)
                : (t('screens.emailVerification.resend', 'Maili tekrar gönder') as string)}
          </Button3D>
        </View>

        {/* Back to login */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onBackToLogin}
          style={{ height: 44, marginTop: 8, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 14, fontFamily: FONTS.body700, color: '#5A6478' }}>
            {t('screens.emailVerification.backToLogin', 'Login\'e dön')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/**
 * Settings → Account — email + şifre değiştirme.
 * Supabase auth.updateUser kullanır.
 */
import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Eyebrow, Mono, Body, FONTS, BackButton, Button3D } from '@/components/airspeak';
import { KeyboardAware } from '@/components/ui/KeyboardAware';
import { mapAuthError } from '@/lib/authErrors';

export default function AccountSettingsScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [email, setEmail] = useState(user?.email ?? '');
  const [emailLoading, setEmailLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  async function onChangeEmail() {
    if (!email || email === user?.email) return;
    if (!email.includes('@')) {
      Alert.alert(t('common.error', 'Hata'), t('settings.account.invalidEmail', 'Geçersiz email'));
      return;
    }
    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser({ email });
    setEmailLoading(false);
    if (error) {
      const f = mapAuthError(error);
      Alert.alert(f.title, f.message);
      return;
    }
    Alert.alert(
      t('settings.account.emailSentTitle', 'Doğrulama gönderildi'),
      t(
        'settings.account.emailSentBody',
        'Yeni email adresine doğrulama maili gönderildi. Linke tıklayınca güncellenecek.',
      ),
    );
  }

  async function onChangePassword() {
    if (!newPw || newPw.length < 8) {
      Alert.alert(
        t('common.error', 'Hata'),
        t('settings.account.pwTooShort', 'Şifre en az 8 karakter olmalı'),
      );
      return;
    }
    if (newPw !== newPw2) {
      Alert.alert(
        t('common.error', 'Hata'),
        t('settings.account.pwMismatch', 'Şifreler eşleşmiyor'),
      );
      return;
    }
    if (!user?.email) return;

    setPwLoading(true);
    // Mevcut şifre doğrulaması: re-auth
    const { error: reAuthErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPw,
    });
    if (reAuthErr) {
      setPwLoading(false);
      Alert.alert(
        t('common.error', 'Hata'),
        t('settings.account.wrongPw', 'Mevcut şifre yanlış'),
      );
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) {
      const f = mapAuthError(error);
      Alert.alert(f.title, f.message);
      return;
    }
    setCurrentPw('');
    setNewPw('');
    setNewPw2('');
    Alert.alert(
      t('common.success', 'Tamam'),
      t('settings.account.pwChanged', 'Şifren güncellendi'),
    );
  }

  return (
    <KeyboardAware style={{ backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <BackButton onPress={() => router.back()} label={t('common.back', 'Geri')} />
          <Text
            accessibilityRole="header"
            style={{ flex: 1, fontFamily: FONTS.body800, fontSize: 22, color: '#0E1116' }}
          >
            {t('settings.account.title', 'Hesap')}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* EMAIL */}
        <Eyebrow>{t('settings.account.emailEyebrow', 'EMAIL')}</Eyebrow>
        <View
          style={{
            marginTop: 8,
            marginBottom: 22,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            padding: 14,
          }}
        >
          <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.4 }}>
            {t('settings.account.currentEmail', 'MEVCUT')}
          </Mono>
          <Text
            style={{
              fontFamily: FONTS.body700,
              fontSize: 15,
              color: '#0E1116',
              marginTop: 4,
              marginBottom: 14,
            }}
          >
            {user?.email}
          </Text>

          <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.4 }}>
            {t('settings.account.newEmail', 'YENİ EMAIL')}
          </Mono>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="ornek@airspeak.io"
            placeholderTextColor="#8A93A6"
            style={{
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 15,
              fontFamily: FONTS.body,
              color: '#0E1116',
              marginTop: 6,
              marginBottom: 12,
            }}
          />
          <Button3D
            onPress={onChangeEmail}
            disabled={emailLoading || email === user?.email || !email}
            variant="navy"
          >
            {emailLoading
              ? t('common.loading', 'Yükleniyor…')
              : t('settings.account.changeEmail', 'Email değiştir')}
          </Button3D>
          <Body color="#5A6478" style={{ fontSize: 11, marginTop: 8 }}>
            {t(
              'settings.account.emailNote',
              'Yeni adresine doğrulama maili gider. Tıklayınca aktif olur.',
            )}
          </Body>
        </View>

        {/* ŞİFRE */}
        <Eyebrow>{t('settings.account.passwordEyebrow', 'ŞİFRE')}</Eyebrow>
        <View
          style={{
            marginTop: 8,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            padding: 14,
          }}
        >
          {[
            {
              label: t('settings.account.currentPw', 'Mevcut şifre'),
              value: currentPw,
              setter: setCurrentPw,
            },
            {
              label: t('settings.account.newPw', 'Yeni şifre (min 8)'),
              value: newPw,
              setter: setNewPw,
            },
            {
              label: t('settings.account.confirmPw', 'Yeni şifre tekrar'),
              value: newPw2,
              setter: setNewPw2,
            },
          ].map((f, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.4 }}>
                {f.label.toUpperCase()}
              </Mono>
              <TextInput
                value={f.value}
                onChangeText={f.setter}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="••••••••"
                placeholderTextColor="#8A93A6"
                style={{
                  borderWidth: 1.5,
                  borderColor: '#DCE0E8',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 15,
                  fontFamily: FONTS.body,
                  color: '#0E1116',
                  marginTop: 6,
                }}
              />
            </View>
          ))}
          <Button3D
            onPress={onChangePassword}
            disabled={pwLoading || !currentPw || !newPw || !newPw2}
            variant="navy"
          >
            {pwLoading
              ? t('common.loading', 'Yükleniyor…')
              : t('settings.account.changePw', 'Şifreyi güncelle')}
          </Button3D>
        </View>
      </ScrollView>
    </KeyboardAware>
  );
}

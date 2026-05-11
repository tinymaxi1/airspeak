/**
 * Forgot Password Screen — IFR Approach (intent-perfect rewrite)
 *
 * Tasarım: screens-auth.jsx ForgotPasswordScreen
 * - TopBar: ArrowLeft + STEP 1 OF 2 eyebrow
 * - Eyebrow accent: RECOVERY · IFR APPROACH
 * - Hero 30px: "Şifren mi kaybolduğun\nbulutlarda kaldı?"
 * - Body: açıklama
 * - Boarding pass card:
 *   EMAIL · CALLSIGN eyebrow + email value mono
 *   cut-line dashed
 *   VERIFIED EMAIL mono | ● Ready (green-500 when valid)
 * - Sky-100 info card with i icon
 * - btn-primary "Send reset link"
 * - btn-ghost "Try a different email" (height 44)
 */
import { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAware } from '@/components/ui/KeyboardAware';
import { resetPassword } from '@/features/auth/api';
import { mapAuthError } from '@/lib/authErrors';
import {
  HHero,
  Eyebrow,
  Body,
  Mono,
  FONTS,
  Button3D,
} from '@/components/airspeak';

const SKY_100 = '#E0F2FF';
const SKY_500 = '#2EA8FF';
const GREEN_500 = '#2DBE6C';
const NAVY_800 = '#0F1E47';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const isValidEmail = EMAIL_RE.test(email);

  async function handleSend() {
    if (!isValidEmail) {
      Alert.alert(
        t('common.invalid', 'Geçersiz') as string,
        t('screens.forgotPassword.body') as string,
      );
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      const f = mapAuthError(error);
      Alert.alert(f.title, f.message);
      return;
    }
    setSent(true);
  }

  return (
    <KeyboardAware style={{ backgroundColor: '#F4F1E8' }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={{ fontSize: 24, color: '#0E1116' }}>←</Text>
          </TouchableOpacity>
          <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
            {t('screens.forgotPassword.step', 'STEP 1 OF 2')}
          </Mono>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Eyebrow accent>{t('screens.forgotPassword.heroAccent', 'RECOVERY · IFR APPROACH')}</Eyebrow>
        <HHero style={{ marginTop: 6, fontSize: 30, lineHeight: 32, letterSpacing: -0.75 }}>
          {t('screens.forgotPassword.hero1')}
          {'\n'}
          {t('screens.forgotPassword.hero2')}
        </HHero>
        <Body color="#5A6478" style={{ fontSize: 14, marginTop: 12, lineHeight: 21 }}>
          {t('screens.forgotPassword.body')}
        </Body>

        {/* Boarding pass card */}
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
          <Eyebrow>{t('screens.forgotPassword.emailCallsign', 'EMAIL · CALLSIGN')}</Eyebrow>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="captain@airspeak.app"
            placeholderTextColor="#8A93A6"
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!sent}
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              fontWeight: '600',
              color: '#0E1116',
              marginTop: 6,
              padding: 0,
            }}
          />

          {/* Cut line dashed */}
          <View
            style={{
              borderTopWidth: 1,
              borderStyle: 'dashed',
              borderColor: '#DCE0E8',
              marginVertical: 12,
              marginHorizontal: -2,
            }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Mono style={{ fontSize: 11, color: '#8A93A6' }}>
              {t('screens.forgotPassword.verifiedLabel', 'VERIFIED EMAIL')}
            </Mono>
            <Text
              style={{
                fontSize: 11,
                fontFamily: FONTS.body700,
                color: isValidEmail ? GREEN_500 : '#B8BFCC',
              }}
            >
              {isValidEmail
                ? t('screens.forgotPassword.readyText', '● Ready')
                : '○ —'}
            </Text>
          </View>
        </View>

        {/* Sky-100 info card */}
        <View
          style={{
            backgroundColor: SKY_100,
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
              backgroundColor: SKY_500,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700', lineHeight: 13 }}>i</Text>
          </View>
          <Text style={{ flex: 1, fontSize: 12, color: NAVY_800, lineHeight: 17 }}>
            {sent
              ? t('screens.forgotPassword.sentText', 'Check your email — reset link sent.')
              : t('screens.forgotPassword.infoText', 'Email gelmediyse spam klasörüne bak. 60 saniye sonra tekrar gönderebilirsin.')}
          </Text>
        </View>

        <View style={{ marginTop: 22 }}>
          <Button3D
            variant="primary"
            fullWidth
            onPress={handleSend}
            disabled={loading || !isValidEmail || sent}
          >
            {loading
              ? t('common.loading', 'Loading...')
              : t('screens.forgotPassword.sendBtn', 'Send reset link')}
          </Button3D>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            setSent(false);
            setEmail('');
          }}
          style={{
            height: 44,
            marginTop: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontFamily: FONTS.body700, color: '#5A6478' }}>
            {t('screens.forgotPassword.retryBtn', 'Try a different email')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAware>
  );
}

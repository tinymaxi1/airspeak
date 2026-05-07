/**
 * Login Screen — Dark + minimal (intent-perfect)
 *
 * Tasarım: screens-auth.jsx LoginScreen
 * - bg navy-900 (#0A1430), white text, status bar dark
 * - Top: ArrowLeft (white) + "Help" link top-right (white 70%)
 * - Topo overlay (opacity 0.4)
 * - LogoMark size 48 red-500
 * - Eyebrow accent: WELCOME BACK · CLEARED FOR APPROACH
 * - Hero 36px display: "Tower'a tekrar\nbağlan."
 * - 2 FieldDark: EMAIL · CALLSIGN (mono) + PASSWORD (with inline "Forgot" right-side red-400)
 * - btn-primary "Sign in" + ArrowRight
 * - OR divider (rgba 0.1)
 * - 2 SocialBtn: Continue with Apple / Continue with Google (white bg, navy text)
 * - Footer: "Henüz pilot lisansı yok? Sign up" red-400 weight 700
 */
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { KeyboardAware } from '@/components/ui/KeyboardAware';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmail } from '@/features/auth/api';
import { mapAuthError } from '@/lib/authErrors';
import {
  Eyebrow,
  FONTS,
  Button3D,
  LogoMark,
  TopoBackground,
} from '@/components/airspeak';

const NAVY_900 = '#0A1430';
const RED_400 = '#FF5A66';
const RED_500 = '#E63946';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await signInWithEmail(email || 'mock@airspeak.io', password || 'mock1234');
    setLoading(false);
    if (error) {
      const f = mapAuthError(error);
      Alert.alert(f.title, f.message);
      return;
    }
    router.replace('/');
  }

  return (
    <KeyboardAware style={{ backgroundColor: NAVY_900 }}>
      {/* Topo bg overlay (behind content) */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4 }}
      >
        <TopoBackground />
      </View>

      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 4,
            paddingBottom: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={{ fontSize: 24, color: '#FFFFFF' }}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/legal/help' as any)}>
            <Text
              style={{
                fontSize: 13,
                fontFamily: FONTS.body700,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {t('screens.login.helpLink', 'Help')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 28 }}>
          <LogoMark size={48} color={RED_500} />
        </View>

        <Eyebrow accent>{t('screens.login.heroAccent', 'WELCOME BACK · CLEARED FOR APPROACH')}</Eyebrow>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 36,
            fontWeight: '700',
            lineHeight: 38,
            letterSpacing: -0.9,
            color: '#FFFFFF',
            marginTop: 8,
          }}
        >
          {t('screens.login.hero1')}
          {'\n'}
          {t('screens.login.hero2')}
        </Text>

        <View style={{ marginTop: 28, gap: 12 }}>
          <FieldDark
            label={t('screens.login.callsignLabel', 'EMAIL · CALLSIGN')}
            value={email}
            onChangeText={setEmail}
            placeholder="captain@airspeak.io"
            mono
            keyboardType="email-address"
          />
          <FieldDark
            label={t('screens.login.password', 'PASSWORD')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('screens.login.passwordHint', '••••••••')}
            secure
            right={
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text style={{ fontSize: 12, fontFamily: FONTS.body700, color: RED_400 }}>
                  {t('screens.login.forgot', 'Forgot')}
                </Text>
              </TouchableOpacity>
            }
          />
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ marginTop: 22 }}>
          <Button3D variant="primary" fullWidth onPress={handleLogin} disabled={loading}>
            {loading ? t('screens.login.loading', 'Loading...') : `${t('screens.login.signIn', 'Sign in')} →`}
          </Button3D>
        </View>

        {/* OR divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <Text
            style={{
              fontFamily: FONTS.mono,
              fontSize: 10,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: 1.8,
            }}
          >
            {t('screens.login.or', 'OR')}
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </View>

        <View style={{ gap: 10 }}>
          <SocialBtn label={t('screens.login.continueApple', 'Continue with Apple')} icon="apple" onPress={() => Alert.alert('Soon', 'Apple sign-in')} />
          <SocialBtn label={t('screens.login.continueGoogle', 'Continue with Google')} icon="google" onPress={() => Alert.alert('Soon', 'Google sign-in')} />
        </View>

        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            {t('screens.login.signUpPrompt', 'Henüz pilot lisansı yok?')}{' '}
            <Text
              onPress={() => router.replace('/(auth)/register')}
              style={{ color: RED_400, fontFamily: FONTS.body700 }}
            >
              {t('screens.login.signUpLink', 'Sign up')}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAware>
  );
}

// ─────────────────────────────────────────────
// FieldDark — dark theme input pill (rgba alpha bg + border)
// ─────────────────────────────────────────────
function FieldDark({
  label,
  value,
  onChangeText,
  placeholder,
  mono,
  secure,
  keyboardType,
  right,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  secure?: boolean;
  keyboardType?: 'email-address' | 'default';
  right?: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: FONTS.mono,
            fontSize: 9,
            letterSpacing: 1.62,
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
        {right}
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        autoCapitalize="none"
        secureTextEntry={secure}
        keyboardType={keyboardType}
        style={{
          fontSize: 16,
          fontFamily: mono ? FONTS.mono : FONTS.body600,
          fontWeight: '600',
          color: '#FFFFFF',
          marginTop: 4,
          padding: 0,
        }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// SocialBtn — white bg, navy text (Continue with X)
// ─────────────────────────────────────────────
function SocialBtn({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: 'apple' | 'google';
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        height: 52,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 3,
        borderBottomColor: 'rgba(0,0,0,0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 18, color: NAVY_900 }}>{icon === 'apple' ? '' : 'G'}</Text>
      <Text style={{ fontSize: 14, fontFamily: FONTS.body800, color: NAVY_900 }}>{label}</Text>
    </TouchableOpacity>
  );
}

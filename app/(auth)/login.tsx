/**
 * Login Screen — Boarding pass sign-in (eşlik eden Register tasarımıyla aynı dil)
 */
import { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { KeyboardAware } from '@/components/ui/KeyboardAware';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmail } from '@/features/auth/api';
import {
  HHero,
  Eyebrow,
  Mono,
  Body,
  FONTS,
  Button3D,
} from '@/components/airspeak';

export default function LoginScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await signInWithEmail(email || 'mock@airspeak.io', password || 'mock1234');
    setLoading(false);
    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }
    // Index'e yönlendir — onboarding tamamlanmış mı diye orada karar verilir
    // (hasCompletedOnboarding=false ise role-select'e gider, true ise home'a)
    router.replace('/');
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
          }}
        >
          <Text onPress={() => router.back()} style={{ fontSize: 24, color: '#0E1116' }}>
            ←
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <HHero style={{ marginBottom: 4 }}>{t('screens.login.hero1')}{'\n'}{t('screens.login.hero2')}</HHero>
        <Body color="#5A6478" style={{ fontSize: 15, marginBottom: 24 }}>
          {t('screens.login.subtitle')}
        </Body>

        {/* Boarding pass form */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
          }}
        >
          <View
            style={{
              padding: 20,
              paddingBottom: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View>
              <Eyebrow>{t('screens.login.passenger')}</Eyebrow>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#0E1116',
                  marginTop: 4,
                }}
              >
                {t('screens.login.title')}
              </Text>
            </View>
            <Text style={{ fontSize: 32 }}>🎫</Text>
          </View>

          <View style={{ paddingHorizontal: 20, paddingBottom: 16, gap: 14 }}>
            <Field
              label={t('screens.login.email')}
              value={email}
              onChangeText={setEmail}
              placeholder="captain@airspeak.io"
            />
            <PasswordField
              label={t('screens.login.password')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('screens.login.passwordHint')}
            />
          </View>

          <View
            style={{
              borderTopWidth: 1,
              borderStyle: 'dashed',
              borderColor: '#DCE0E8',
              marginHorizontal: 16,
            }}
          />

          <View style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
            <Stub label="GATE" value="A1" />
            <Stub label="SEAT" value="01A" />
            <Stub label="CLASS" value="PRO" />
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Button3D variant="primary" fullWidth onPress={handleLogin} disabled={loading}>
            {loading ? t('screens.login.loading') : t('screens.login.boarding')}
          </Button3D>
        </View>

        <View style={{ marginTop: 8 }}>
          <Button3D variant="ghost" fullWidth onPress={() => router.push('/(auth)/forgot-password')}>
            {t('screens.login.forgot')}
          </Button3D>
        </View>

        <View style={{ marginTop: 8 }}>
          <Button3D variant="ghost" fullWidth onPress={() => router.replace('/(auth)/register')}>
            {t('screens.login.noAccount')}
          </Button3D>
        </View>
      </ScrollView>
    </KeyboardAware>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}) {
  return (
    <View>
      <Eyebrow>{label}</Eyebrow>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A93A6"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          marginTop: 4,
          borderBottomWidth: 1.5,
          borderBottomColor: '#B8BFCC',
          paddingBottom: 6,
          fontSize: 17,
          fontFamily: FONTS.body600,
          color: '#0E1116',
        }}
      />
    </View>
  );
}

function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <Eyebrow>{label}</Eyebrow>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8A93A6"
          autoCapitalize="none"
          secureTextEntry={!visible}
          style={{
            flex: 1,
            marginTop: 4,
            borderBottomWidth: 1.5,
            borderBottomColor: '#B8BFCC',
            paddingBottom: 6,
            fontSize: 17,
            fontFamily: FONTS.mono,
            color: '#0E1116',
          }}
        />
        <TouchableOpacity
          onPress={() => setVisible((v) => !v)}
          style={{ paddingLeft: 10, paddingBottom: 4 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={{ fontSize: 18 }}>{visible ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Stub({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Eyebrow>{label}</Eyebrow>
      <Text
        style={{
          fontFamily: FONTS.mono700,
          fontSize: 18,
          fontWeight: '700',
          color: '#0E1116',
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * Register Screen — Boarding pass create
 *
 * Tasarım birebir (screens-onboarding.jsx RegisterScreen):
 * - "Create your\nflight log." (HHero) + "7 free days. No card needed."
 * - Boarding pass form (PASSENGER · NEW PILOT, EMAIL + PASSWORD inputs, cut line, GATE/SEAT/CLASS stubs)
 * - "Board — start trial" red CTA
 * - OR CONTINUE WITH divider + Google/Apple secondary
 * - Terms footnote
 */
import { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { KeyboardAware } from '@/components/ui/KeyboardAware';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signUpWithEmail } from '@/features/auth/api';
import {
  HHero,
  Eyebrow,
  Mono,
  Body,
  FONTS,
  Button3D,
} from '@/components/airspeak';

export default function RegisterScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password || password.length < 6) {
      Alert.alert('Eksik bilgi', 'Geçerli e-posta ve en az 6 karakter şifre.');
      return;
    }
    setLoading(true);
    const { error } = await signUpWithEmail(email, password);
    setLoading(false);
    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }
    router.replace('/(auth)/onboarding/role-select');
  }

  return (
    <KeyboardAware style={{ backgroundColor: c.bg }}>
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
          <Text
            onPress={() => router.back()}
            style={{ fontSize: 24, color: '#0E1116' }}
          >
            ←
          </Text>
          <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
            {t('screens.register.step')}
          </Mono>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <HHero style={{ marginBottom: 4 }}>{t('screens.register.hero1')}{'\n'}{t('screens.register.hero2')}</HHero>
        <Body color="#5A6478" style={{ fontSize: 15, marginBottom: 24 }}>
          {t('screens.register.subtitle')}
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
          {/* Header */}
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
              <Eyebrow>{t('screens.register.passenger')}</Eyebrow>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#0E1116',
                  marginTop: 4,
                }}
              >
                {t('screens.register.title')}
              </Text>
            </View>
            <Text style={{ fontSize: 32 }}>🎫</Text>
          </View>

          {/* Inputs */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 16, gap: 14 }}>
            <Field
              label={t('screens.register.email')}
              value={email}
              onChangeText={setEmail}
              placeholder="captain@airspeak.io"
              keyboardType="email-address"
            />
            <PasswordField
              label={t('screens.register.password')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('screens.register.passwordHint')}
            />
          </View>

          {/* Cut line (dashed) */}
          <View
            style={{
              borderTopWidth: 1,
              borderStyle: 'dashed',
              borderColor: '#DCE0E8',
              marginHorizontal: 16,
            }}
          />

          {/* Stubs */}
          <View
            style={{
              padding: 16,
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <Stub label="GATE" value="A1" />
            <Stub label="SEAT" value="01A" />
            <Stub label="CLASS" value="TRIAL" />
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Button3D variant="primary" fullWidth onPress={handleRegister} disabled={loading}>
            {loading ? t('screens.register.loading') : t('screens.register.board')}
          </Button3D>
        </View>

        {/* OR CONTINUE WITH */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#DCE0E8' }} />
          <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.8 }}>
            {t('screens.register.or')}
          </Mono>
          <View style={{ flex: 1, height: 1, backgroundColor: '#DCE0E8' }} />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button3D variant="secondary" fullWidth onPress={() => Alert.alert('Soon', 'Google sign-in')}>
              G  Google
            </Button3D>
          </View>
          <View style={{ flex: 1 }}>
            <Button3D variant="secondary" fullWidth onPress={() => Alert.alert('Soon', 'Apple sign-in')}>
                Apple
            </Button3D>
          </View>
        </View>

        <Body
          color="#8A93A6"
          style={{ fontSize: 11, textAlign: 'center', marginTop: 24, lineHeight: 16 }}
        >
          {t('screens.register.terms')}
        </Body>
      </ScrollView>
    </KeyboardAware>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  mono,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  mono?: boolean;
  keyboardType?: 'email-address' | 'default';
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
        keyboardType={keyboardType}
        style={{
          marginTop: 4,
          borderBottomWidth: 1.5,
          borderBottomColor: '#B8BFCC',
          paddingBottom: 6,
          fontSize: 17,
          fontFamily: mono ? FONTS.mono : FONTS.body600,
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

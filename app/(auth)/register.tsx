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
import { ScrollView, View, Text, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password || password.length < 8) {
      Alert.alert('Eksik bilgi', 'Geçerli e-posta ve en az 8 karakter şifre.');
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
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
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
            STEP 1 OF 6
          </Mono>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <HHero style={{ marginBottom: 4 }}>Create your{'\n'}flight log.</HHero>
        <Body color="#5A6478" style={{ fontSize: 15, marginBottom: 24 }}>
          7 free days. No card needed.
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
              <Eyebrow>PASSENGER</Eyebrow>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#0E1116',
                  marginTop: 4,
                }}
              >
                NEW PILOT
              </Text>
            </View>
            <Text style={{ fontSize: 32 }}>🎫</Text>
          </View>

          {/* Inputs */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 16, gap: 14 }}>
            <Field
              label="EMAIL"
              value={email}
              onChangeText={setEmail}
              placeholder="captain@airspeak.io"
              keyboardType="email-address"
            />
            <Field
              label="PASSWORD"
              value={password}
              onChangeText={setPassword}
              placeholder="•••••••• (min 8)"
              secureTextEntry
              mono
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
            {loading ? 'Boarding...' : 'Board — start trial →'}
          </Button3D>
        </View>

        {/* OR CONTINUE WITH */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#DCE0E8' }} />
          <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.8 }}>
            OR CONTINUE WITH
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
          By continuing, you agree to our Terms and Privacy Policy.{'\n'}
          Trial automatically ends — we'll remind you.
        </Body>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  mono,
  secureTextEntry,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  mono?: boolean;
  secureTextEntry?: boolean;
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
        secureTextEntry={secureTextEntry}
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

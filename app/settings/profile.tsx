/**
 * Settings → Profile & callsign — kullanıcı profil bilgileri editör.
 */
import { ScrollView, View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  Eyebrow,
  Mono,
  Body,
  FONTS,
  Button3D,
  Avatar,
} from '@/components/airspeak';

export default function ProfileSettingsScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const role = useOnboardingStore((s) => s.role);
  const placement = useOnboardingStore((s) => s.placementResult);
  const username = user?.email?.split('@')[0] ?? 'pilot';
  const [callsign, setCallsign] = useState(`@${username}`);

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
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
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: '#0E1116' }}>←</Text>
          </TouchableOpacity>
          <Text style={{ flex: 1, fontFamily: FONTS.body800, fontSize: 22, color: '#0E1116' }}>
            {t('screens.settings.profile', 'Profil')}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Avatar + name */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
            padding: 20,
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <Avatar initials={username.slice(0, 2).toUpperCase()} color="#0F1E47" size={80} />
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 22,
              fontWeight: '700',
              color: '#0E1116',
              marginTop: 12,
            }}
          >
            {username}
          </Text>
          <Body color="#5A6478" style={{ fontSize: 13, marginTop: 4 }}>
            {user?.email ?? ''}
          </Body>
        </View>

        <Eyebrow>{t('settings.profile.callsign', 'ÇAĞRI KODU')}</Eyebrow>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginTop: 8,
            marginBottom: 18,
          }}
        >
          <TextInput
            value={callsign}
            onChangeText={setCallsign}
            style={{ fontFamily: FONTS.mono700, fontSize: 16, color: '#0E1116' }}
            placeholder="@callsign"
          />
        </View>

        <Eyebrow>{t('settings.profile.role', 'ROL')}</Eyebrow>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderRadius: 14,
            padding: 14,
            marginTop: 8,
            marginBottom: 18,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Body style={{ fontSize: 14, color: '#0E1116' }}>{role ?? '—'}</Body>
          <TouchableOpacity onPress={() => router.push('/(auth)/onboarding/role-select')}>
            <Mono style={{ fontSize: 11, color: '#E63946', letterSpacing: 1.1 }}>
              {t('settings.profile.changeRole', 'DEĞİŞTİR')}
            </Mono>
          </TouchableOpacity>
        </View>

        <Eyebrow>{t('settings.profile.level', 'SEVİYE')}</Eyebrow>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderRadius: 14,
            padding: 14,
            marginTop: 8,
            marginBottom: 18,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Body style={{ fontSize: 14, color: '#0E1116' }}>
            {placement?.generalEnglish?.label ?? placement?.level ?? 'B1'}
          </Body>
          <TouchableOpacity onPress={() => router.push('/(auth)/onboarding/level-test')}>
            <Mono style={{ fontSize: 11, color: '#E63946', letterSpacing: 1.1 }}>
              {t('settings.profile.retake', 'TEKRAR TESTE GİR')}
            </Mono>
          </TouchableOpacity>
        </View>

        <Button3D
          variant="primary"
          fullWidth
          onPress={() => Alert.alert(t('common.saved', 'Kaydedildi'), t('settings.profile.saved', 'Profil bilgilerin güncellendi.'))}
        >
          {t('common.save', 'Kaydet')}
        </Button3D>
      </ScrollView>
    </View>
  );
}

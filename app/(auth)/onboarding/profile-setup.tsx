/**
 * Onboarding — Profile Setup
 *
 * Goals → Profile Setup → Onboarding Tour
 * Opsiyonel: avatar + full_name + callsign. "Atla" → callsign default.
 */
import { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/authStore';
import { useProfile, invalidateProfile } from '@/features/profile/useProfile';
import { upsertProfileFields } from '@/features/profile/api';
import { presentAvatarSheet } from '@/features/profile/AvatarUploader';
import { Avatar, FONTS, Mono, Body, HHero, Button3D } from '@/components/airspeak';
import { Camera } from 'lucide-react-native';

function defaultCallsign(name: string, email?: string | null): string {
  const seed = (name || email?.split('@')[0] || '').trim();
  if (!seed) return '@captain';
  const cleaned = seed
    .toLowerCase()
    .replace(/[ğüşıöç]/g, (c) =>
      ({ ğ: 'g', ü: 'u', ş: 's', ı: 'i', ö: 'o', ç: 'c' }[c] ?? c),
    )
    .replace(/[^a-z0-9]+/g, '');
  return `@${cleaned.slice(0, 16) || 'captain'}`;
}

export default function ProfileSetupScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { profile } = useProfile(user?.id);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [callsign, setCallsign] = useState(profile?.callsign ?? '');
  const [saving, setSaving] = useState(false);

  const initials = (fullName || user?.email || 'PI').slice(0, 2).toUpperCase();

  async function persistAndContinue(opts: { skip?: boolean }) {
    if (!user?.id) {
      router.replace('/onboarding-tour');
      return;
    }
    setSaving(true);
    const finalCallsign = opts.skip
      ? defaultCallsign(fullName || profile?.full_name || '', user.email)
      : callsign.trim() || defaultCallsign(fullName, user.email);

    const patch: Record<string, unknown> = {
      callsign: finalCallsign,
    };
    if (!opts.skip && fullName.trim()) {
      patch.full_name = fullName.trim();
    }

    const r = await upsertProfileFields(user.id, patch);
    setSaving(false);
    if (!r.ok && r.error) {
      Alert.alert('Hata', r.error);
      return;
    }
    invalidateProfile();
    router.replace('/onboarding-tour');
  }

  function onAvatarTap() {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    presentAvatarSheet(user.id, !!profile?.avatar_url, () => {});
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={() => persistAndContinue({ skip: true })} hitSlop={8}>
            <Mono style={{ fontSize: 12, color: '#8A93A6', letterSpacing: 1.2 }}>
              {t('screens.profileSetup.skip', 'ATLA')}
            </Mono>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 }}
      >
        <HHero>
          {t('screens.profileSetup.title1', 'Profilini')}{'\n'}
          {t('screens.profileSetup.title2', 'tanıt.')}
        </HHero>
        <Body color="#5A6478" style={{ marginTop: 12 }}>
          {t(
            'screens.profileSetup.desc',
            'Avatar, isim ve çağrı kodu — sonra istediğin zaman değiştirebilirsin.',
          )}
        </Body>

        {/* Avatar */}
        <View style={{ alignItems: 'center', marginTop: 28 }}>
          <TouchableOpacity onPress={onAvatarTap} activeOpacity={0.85}>
            <View>
              <Avatar
                initials={initials}
                imageUrl={profile?.avatar_url}
                color="#0F1E47"
                size={96}
                ringColor="#E63946"
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#F2C14E',
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={14} color="#0A1430" strokeWidth={2.5} />
              </View>
            </View>
          </TouchableOpacity>
          <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1.2, marginTop: 12 }}>
            {t('screens.profileSetup.avatarHint', 'AVATAR EKLE / DEĞİŞTİR')}
          </Mono>
        </View>

        {/* Full name */}
        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4, marginTop: 32 }}>
          {t('screens.profileSetup.fullName', 'TAM İSİM')}
        </Mono>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginTop: 6,
          }}
        >
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('screens.profileSetup.fullNamePh', 'Captain Ekrem Yılmaz') ?? ''}
            style={{ fontFamily: FONTS.body, fontSize: 16, color: '#0E1116' }}
            autoCapitalize="words"
          />
        </View>

        {/* Callsign */}
        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4, marginTop: 18 }}>
          {t('screens.profileSetup.callsign', 'ÇAĞRI KODU')}
        </Mono>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginTop: 6,
          }}
        >
          <TextInput
            value={callsign}
            onChangeText={setCallsign}
            placeholder={defaultCallsign(fullName, user?.email)}
            style={{ fontFamily: FONTS.mono700, fontSize: 16, color: '#0E1116' }}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <Body color="#8A93A6" style={{ fontSize: 11, marginTop: 6 }}>
          {t(
            'screens.profileSetup.callsignHint',
            'Boş bırakırsan ismine göre otomatik atanır.',
          )}
        </Body>

        <View style={{ marginTop: 32 }}>
          <Button3D
            variant="primary"
            fullWidth
            onPress={() => persistAndContinue({ skip: false })}
            disabled={saving}
          >
            {saving
              ? t('common.saving', 'Kaydediliyor…')
              : t('screens.profileSetup.continue', 'Devam et')}
          </Button3D>
        </View>
      </ScrollView>
    </View>
  );
}

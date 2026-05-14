/**
 * Onboarding — Profile Setup
 *
 * Goals → Profile Setup → Onboarding Tour
 * Opsiyonel: avatar + full_name + callsign. "Atla" → callsign default.
 */
import { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { usePalette } from '@/lib/usePalette';
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
import { track } from '@/lib/posthog';

/**
 * Anlamlı default callsign:
 * - Önce kullanıcının full_name'inden Türkçe karakterleri sadeleştir
 * - 3+ harf bulunabilirse onu kullan (örn "Mehmet Kara" → @MEHMETK)
 * - Apple privaterelay gibi rastgele email'leri YOK SAY (ör 'yhnwv6nw8z@privaterelay' → @PILOT001 fallback)
 * - Rol bazlı fallback: pilot → PILOT001, technician → TECH001, atc → ATC001 …
 */
function defaultCallsign(name: string, email?: string | null, role?: string | null): string {
  const cleanName = (name || '')
    .toLowerCase()
    .replace(/[ğüşıöç]/g, (c) => ({ ğ: 'g', ü: 'u', ş: 's', ı: 'i', ö: 'o', ç: 'c' }[c] ?? c))
    .replace(/[^a-z0-9]+/g, '')
    .toUpperCase();
  if (cleanName.length >= 3) return `@${cleanName.slice(0, 10)}`;

  // Email prefix anlamlıysa kullan (apple privaterelay gibi rastgele dizileri at)
  const emailPrefix = (email?.split('@')[0] ?? '').trim().toLowerCase();
  const isRandomGarbage = emailPrefix.length >= 10 && !/[aeiouy]/.test(emailPrefix);
  if (emailPrefix && !isRandomGarbage && emailPrefix.length >= 3) {
    return `@${emailPrefix.replace(/[^a-z0-9]+/g, '').slice(0, 10).toUpperCase()}`;
  }

  // Rol bazlı fallback
  const rolePrefix: Record<string, string> = {
    pilot: 'PILOT', atc: 'ATC', cabin: 'CABIN', technician: 'TECH',
    ground: 'GROUND', student: 'STUDENT', dispatcher: 'DISP',
  };
  const prefix = (role && rolePrefix[role]) || 'CAPTAIN';
  const rand = Math.floor(100 + Math.random() * 900);
  return `@${prefix}${rand}`;
}

/** Callsign validation: 3-10 karakter (@ hariç), harf+rakam, küçük harf normalize. */
function validateCallsign(input: string): { ok: boolean; cleaned: string; error?: string } {
  const trimmed = input.trim().replace(/^@+/, '');
  if (trimmed.length === 0) return { ok: false, cleaned: '', error: 'Çağrı kodu boş olamaz' };
  if (trimmed.length < 3) return { ok: false, cleaned: '', error: 'En az 3 karakter olmalı' };
  if (trimmed.length > 10) return { ok: false, cleaned: '', error: 'En fazla 10 karakter' };
  if (!/^[a-zA-Z0-9]+$/.test(trimmed)) return { ok: false, cleaned: '', error: 'Sadece harf ve rakam' };
  return { ok: true, cleaned: `@${trimmed.toUpperCase()}` };
}

export default function ProfileSetupScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { profile } = useProfile(user?.id);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [callsign, setCallsign] = useState(profile?.callsign ?? '');
  const [saving, setSaving] = useState(false);
  const role = (profile as any)?.role as string | null;

  const initials = (fullName || user?.email || 'PI').slice(0, 2).toUpperCase();

  async function persistAndContinue(opts: { skip?: boolean }) {
    if (opts.skip) {
      track('onboarding_skip_step', { step: 'profile_setup' });
    }
    if (!user?.id) {
      router.replace('/onboarding-tour');
      return;
    }
    setSaving(true);
    let finalCallsign: string;
    if (opts.skip) {
      finalCallsign = defaultCallsign(fullName || profile?.full_name || '', user.email, role);
    } else if (callsign.trim()) {
      const v = validateCallsign(callsign);
      if (!v.ok) {
        setSaving(false);
        Alert.alert(t('common.error', 'Hata'), v.error ?? '');
        return;
      }
      finalCallsign = v.cleaned;
    } else {
      finalCallsign = defaultCallsign(fullName, user.email, role);
    }

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
    <View style={{ flex: 1, backgroundColor: c.bg }}>
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

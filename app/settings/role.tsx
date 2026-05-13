/**
 * Settings → Role — kullanıcı role değiştirme.
 * profiles.role günceller. Onboarding flow'undan ayrı, hesap değişiminden değil.
 */
import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types/profile';
import { Eyebrow, Mono, Body, FONTS, BackButton, Button3D } from '@/components/airspeak';
import { useLocalizedSubRoles } from '@/features/profile/useSubRoles';

interface RoleSpec {
  id: UserRole;
  icon: string;
  code: string;
  accent: string;
  tk: string;
  dk: string;
}

const ROLES: RoleSpec[] = [
  { id: 'pilot', icon: '✈', code: 'PIL', accent: '#E63946', tk: 'rolePilot', dk: 'rolePilotDesc' },
  { id: 'cabin', icon: '🎧', code: 'CAB', accent: '#7C5CFF', tk: 'roleCabin', dk: 'roleCabinDesc' },
  { id: 'technician', icon: '⚙', code: 'TEC', accent: '#2EA8FF', tk: 'roleTech', dk: 'roleTechDesc' },
  { id: 'ground', icon: '💼', code: 'GND', accent: '#2DBE6C', tk: 'roleGround', dk: 'roleGroundDesc' },
  { id: 'student', icon: '📖', code: 'STU', accent: '#F2C14E', tk: 'roleStudent', dk: 'roleStudentDesc' },
  { id: 'dispatcher', icon: '📊', code: 'DSP', accent: '#5B8AB5', tk: 'roleDispatcher', dk: 'roleDispatcherDesc' },
];

export default function RoleSettingsScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [selected, setSelected] = useState<UserRole | null>(
    (profile?.role as UserRole | undefined) ?? null,
  );
  const [saving, setSaving] = useState(false);

  // Mevcut sub_role'u lokalize göster (varsa)
  const currentRole = profile?.role as UserRole | undefined;
  const { items: currentSubRoleItems } = useLocalizedSubRoles(currentRole);
  const currentSubRoleItem = currentSubRoleItems.find((it) => it.id === profile?.sub_role);

  async function onSave() {
    if (!userId || !selected || selected === profile?.role) return;
    setSaving(true);
    // Role değişiyorsa sub_role'u NULL'a düşür — eski sub_role yeni role'e uymaz.
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update({ role: selected, sub_role: null })
      .eq('id', userId)
      .select()
      .single();
    setSaving(false);

    if (error) {
      Alert.alert(t('common.error', 'Hata'), error.message);
      return;
    }
    if (data) setProfile(data);
    Alert.alert(
      t('common.success', 'Tamam'),
      t(
        'settings.role.updatedReselectSubRole',
        'Rol güncellendi. Şimdi yeni rolün için alt-rolünü seç.',
      ),
      [
        {
          text: t('common.continue', 'Devam'),
          onPress: () => router.push('/(auth)/onboarding/sub-role-select'),
        },
      ],
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
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
            {t('settings.role.title', 'Rol & Pozisyon')}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Body color="#5A6478" style={{ fontSize: 14, marginBottom: 20, lineHeight: 21 }}>
          {t(
            'settings.role.intro',
            'Rolünü değiştirirsen ders/sınav içeriği yeni role göre filtrelenir. İlerlemen kaybolmaz.',
          )}
        </Body>

        {/* Mevcut sub_role (varsa) — bilgi + değiştir butonu */}
        {currentRole && (
          <View style={{ marginBottom: 24 }}>
            <Eyebrow>{t('settings.role.subRoleEyebrow', 'ALT-ROL')}</Eyebrow>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(auth)/onboarding/sub-role-select')}
              style={{
                marginTop: 8,
                padding: 14,
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: '#DCE0E8',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: '#F5F5F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 22 }}>{currentSubRoleItem?.icon ?? '·'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.body700, fontSize: 15, color: '#0E1116' }}>
                  {currentSubRoleItem?.name ?? t('settings.role.subRoleNotSet', 'Henüz seçilmedi')}
                </Text>
                <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }}>
                  {t('settings.role.subRoleHint', 'Tıkla — değiştir veya seç')}
                </Body>
              </View>
              <Text style={{ fontSize: 18, color: '#8A93A6' }}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        <Eyebrow>{t('settings.role.eyebrow', 'ROLLER')}</Eyebrow>
        <View style={{ marginTop: 8, gap: 10 }}>
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            const isCurrent = profile?.role === role.id;
            return (
              <TouchableOpacity
                key={role.id}
                activeOpacity={0.85}
                onPress={() => setSelected(role.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: 14,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  borderWidth: isSelected ? 2 : 1.5,
                  borderColor: isSelected ? role.accent : '#DCE0E8',
                  borderBottomWidth: isSelected ? 4 : 1.5,
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: role.accent + '22',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{role.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text
                      style={{
                        fontFamily: FONTS.body700,
                        fontSize: 16,
                        color: '#0E1116',
                      }}
                    >
                      {t(`screens.roleSelect.${role.tk}`, role.id)}
                    </Text>
                    <Mono
                      style={{
                        fontSize: 10,
                        color: role.accent,
                        backgroundColor: role.accent + '22',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      {role.code}
                    </Mono>
                    {isCurrent && (
                      <Mono
                        style={{
                          fontSize: 9,
                          color: '#5A6478',
                          letterSpacing: 1.2,
                        }}
                      >
                        {t('settings.role.current', 'MEVCUT')}
                      </Mono>
                    )}
                  </View>
                  <Body color="#5A6478" style={{ fontSize: 12, marginTop: 4 }}>
                    {t(`screens.roleSelect.${role.dk}`, '')}
                  </Body>
                </View>
                {isSelected && (
                  <Text style={{ fontSize: 22, color: role.accent, fontWeight: '700' }}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      {selected && selected !== profile?.role && (
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: c.bg }}>
          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#EDEFF3' }}>
            <Button3D onPress={onSave} disabled={saving} variant="primary">
              {saving
                ? t('common.loading', 'Yükleniyor…')
                : t('settings.role.save', 'Rolü güncelle')}
            </Button3D>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

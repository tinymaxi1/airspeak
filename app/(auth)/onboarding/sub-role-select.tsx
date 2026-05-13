/**
 * Sub-Role Select Screen — "Hangi tip / atölye / sınıf?"
 *
 * Onboarding adım 2.5 — role-select sonrası, level-test öncesi.
 * DB'den parent_role'e ait active sub_roles çekilir, dinamik liste gösterilir.
 *
 * Kurallar:
 *   - Skip butonu YOK, zorunlu seç (user kuralı)
 *   - "Geri" ile role-select'e dönülebilir (role değiştirme şansı)
 *   - role değişirse subRole reset olur (onboardingStore setRole davranışı)
 *
 * profiles.sub_role direct update — useUserDataSync hidrasyonu authStore.profile'a
 * yansıtır. RPC gerekmez (basit UPDATE yeterli).
 */
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useLocalizedSubRoles } from '@/features/profile/useSubRoles';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/posthog';
import { useAuthStore } from '@/stores/authStore';
import {
  HHero,
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Button3D,
  ProgressBar,
  BackButton,
} from '@/components/airspeak';

export default function SubRoleSelectScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const role = useOnboardingStore((s) => s.role);
  const subRole = useOnboardingStore((s) => s.subRole);
  const setSubRole = useOnboardingStore((s) => s.setSubRole);
  const userId = useAuthStore((s) => s.user?.id);
  const setProfile = useAuthStore((s) => s.setProfile);
  const profile = useAuthStore((s) => s.profile);

  const { items, isLoading } = useLocalizedSubRoles(role);
  const [selected, setSelected] = useState<string | null>(subRole);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    if (!selected || !userId) return;
    setSaving(true);
    setSubRole(selected);
    track('sub_role_selected', { sub_role: selected, parent_role: role });

    // profiles.sub_role update — best effort, fail olsa onboarding devam
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .update({ sub_role: selected })
        .eq('id', userId)
        .select()
        .single();
      if (!error && data) {
        setProfile({ ...profile, ...data });
      }
    } catch {
      /* graceful — sonra settings/role'dan tekrar denenebilir */
    }
    setSaving(false);
    router.push('/(auth)/onboarding/level-test');
  }

  if (!role) {
    // Role seçilmemişse role-select'e geri at — edge case
    router.replace('/(auth)/onboarding/role-select');
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <BackButton onPress={() => router.back()} label={t('common.back', 'Geri')} />
          <Mono style={{ fontSize: 11, color: '#8A93A6', letterSpacing: 1.8 }}>
            {t('screens.subRoleSelect.step', 'ADIM 2.5 / 6')}
          </Mono>
        </View>
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <ProgressBar value={42} />
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        <HHero>
          {t('screens.subRoleSelect.hero1', 'Hangi tip')}
          {'\n'}
          {t('screens.subRoleSelect.hero2', 'sende?')}
        </HHero>

        <Body color="#5A6478" style={{ fontSize: 14, marginTop: 14, lineHeight: 22 }}>
          {t(
            'screens.subRoleSelect.subtitle',
            'Daha kişiselleştirilmiş ders ve senaryolar için rolünün altındaki spesifik tipi seç.',
          )}
        </Body>

        <Eyebrow style={{ marginTop: 24 }}>{t('screens.subRoleSelect.eyebrow', 'ALT-ROLÜN')}</Eyebrow>

        {isLoading && (
          <View style={{ paddingTop: 32, alignItems: 'center' }}>
            <ActivityIndicator color="#E63946" />
            <Body color="#8A93A6" style={{ fontSize: 12, marginTop: 8 }}>
              {t('common.loading', 'Yükleniyor...')}
            </Body>
          </View>
        )}

        {!isLoading && items.length === 0 && (
          <View
            style={{
              marginTop: 14,
              padding: 18,
              borderRadius: 14,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: '#B8BFCC',
              backgroundColor: '#F5F5F0',
            }}
          >
            <Text style={{ fontSize: 28, marginBottom: 6 }}>📭</Text>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#0F1E47' }}>
              {t('screens.subRoleSelect.emptyTitle', 'Bu rol için tanımlı alt-rol yok')}
            </Text>
            <Body color="#5A6478" style={{ fontSize: 12, marginTop: 4, lineHeight: 17 }}>
              {t(
                'screens.subRoleSelect.emptyBody',
                'Şimdilik genel müfredata devam ediyoruz. Admin alt-roller eklediğinde profilinden seçebilirsin.',
              )}
            </Body>
          </View>
        )}

        {!isLoading && items.length > 0 && (
          <View style={{ marginTop: 10, gap: 10 }}>
            {items.map((item) => {
              const isSelected = selected === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => setSelected(item.id)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 2,
                    borderColor: isSelected ? '#E63946' : '#E5E8EF',
                    borderBottomWidth: isSelected ? 4 : 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: isSelected ? '#E63946' : '#F5F5F0',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{item.icon ?? '•'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: '#0F1E47' }}>
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text
                        style={{
                          fontFamily: FONTS.body,
                          fontSize: 12,
                          color: '#5A6478',
                          marginTop: 4,
                          lineHeight: 17,
                        }}
                      >
                        {item.description}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <Text style={{ fontSize: 20, color: '#E63946', fontWeight: '700' }}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: c.bg }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderTopColor: '#E5E8EF',
          }}
        >
          {items.length === 0 && !isLoading ? (
            // Bu rolde alt-rol yok → atla butonu
            <Button3D
              variant="primary"
              fullWidth
              onPress={() => router.push('/(auth)/onboarding/level-test')}
            >
              {t('screens.subRoleSelect.continueWithout', 'Devam et →')}
            </Button3D>
          ) : (
            <Button3D
              variant="primary"
              fullWidth
              disabled={!selected || saving}
              onPress={handleContinue}
            >
              {saving
                ? t('common.saving', 'Kaydediliyor...')
                : t('screens.subRoleSelect.continue', 'Devam et →')}
            </Button3D>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

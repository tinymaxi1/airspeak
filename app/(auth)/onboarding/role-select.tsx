/**
 * Role Select Screen — "Pick your callsign."
 *
 * Tasarım birebir (screens-onboarding.jsx):
 * - Top bar: STEP 2 OF 6 + Skip (right)
 * - Progress 33% (red)
 * - Hero "Pick your\ncallsign."
 * - 5 role cards (pilot=red, cabin=purple, tech=sky, ground=green, student=gold)
 * - Each card: 52x52 icon box + title + role code (PIL/CAB/TEC/GND/STU) + desc
 * - Selected card: colored border + 3D shadow + checkmark right
 * - Sticky CTA: "Continue →"
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { UserRole } from '@/types/profile';
import { track } from '@/lib/posthog';
import {
  HHero,
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Button3D,
  ProgressBar,
} from '@/components/airspeak';

interface RoleConfig {
  id: UserRole;
  icon: string;
  title: string;
  desc: string;
  code: string;
  accent: string;
}

interface RoleSpec {
  id: UserRole;
  icon: string;
  code: string;
  accent: string;
  /** translation key: titleKey */
  tk: string;
  /** translation key: descKey */
  dk: string;
}

const ROLES: RoleSpec[] = [
  { id: 'pilot', icon: '✈', code: 'PIL', accent: '#E63946', tk: 'rolePilot', dk: 'rolePilotDesc' },
  { id: 'atc', icon: '🗼', code: 'ATC', accent: '#FF6B35', tk: 'roleAtc', dk: 'roleAtcDesc' },
  { id: 'cabin', icon: '🎧', code: 'CAB', accent: '#7C5CFF', tk: 'roleCabin', dk: 'roleCabinDesc' },
  { id: 'technician', icon: '⚙', code: 'TEC', accent: '#2EA8FF', tk: 'roleTech', dk: 'roleTechDesc' },
  { id: 'ground', icon: '💼', code: 'GND', accent: '#2DBE6C', tk: 'roleGround', dk: 'roleGroundDesc' },
  { id: 'student', icon: '📖', code: 'STU', accent: '#F2C14E', tk: 'roleStudent', dk: 'roleStudentDesc' },
  { id: 'dispatcher', icon: '📊', code: 'DSP', accent: '#5B8AB5', tk: 'roleDispatcher', dk: 'roleDispatcherDesc' },
];

export default function RoleSelectScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const setRole = useOnboardingStore((s) => s.setRole);
  const currentRole = useOnboardingStore((s) => s.role);
  const [selected, setSelected] = useState<UserRole | null>(currentRole);

  useEffect(() => {
    track('onboarding_started');
  }, []);

  const handleNext = () => {
    if (!selected) return;
    setRole(selected);
    track('role_selected', { role: selected });
    // FAZ 3 — sub-role-select adımına git (level-test'e değil).
    router.push('/(auth)/onboarding/sub-role-select');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']}>
        {/* Top bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40 }}>
            <Text style={{ fontSize: 24, color: '#0E1116' }}>‹</Text>
          </TouchableOpacity>
          <Eyebrow style={{ flex: 1, textAlign: 'center' }}>{t('screens.roleSelect.step')}</Eyebrow>
          <TouchableOpacity style={{ width: 40, alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: FONTS.body600, fontSize: 13, color: '#5A6478' }}>{t('common.skip', 'Skip')}</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <ProgressBar value={33} color="red" height={4} />
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <HHero>{t('screens.roleSelect.hero1')}{'\n'}{t('screens.roleSelect.hero2')}</HHero>
        <Body style={{ marginTop: 4, marginBottom: 20 }}>
          {t('screens.roleSelect.subtitle')}
        </Body>

        <View style={{ gap: 10 }}>
          {ROLES.map((r) => {
            const isSelected = selected === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                activeOpacity={0.85}
                onPress={() => setSelected(r.id)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  borderWidth: isSelected ? 2.5 : 1.5,
                  borderColor: isSelected ? r.accent : '#DCE0E8',
                  // Tasarım: selected 4px + accent shadow, unselected 3px + border-strong
                  borderBottomWidth: isSelected ? 4 : 3,
                  borderBottomColor: isSelected ? r.accent : '#B8BFCC',
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                {/* Icon box */}
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: isSelected ? r.accent : '#E9E6DD',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 28, color: isSelected ? '#FFFFFF' : r.accent }}>
                    {r.icon}
                  </Text>
                </View>

                {/* Title + desc */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text
                      style={{
                        fontFamily: FONTS.body800,
                        fontSize: 17,
                        color: '#0E1116',
                      }}
                    >
                      {t(`screens.roleSelect.${r.tk}`)}
                    </Text>
                    <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1 }}>
                      {r.code}
                    </Mono>
                  </View>
                  <Body style={{ fontSize: 13, marginTop: 2 }}>{t(`screens.roleSelect.${r.dk}`)}</Body>
                </View>

                {/* Check */}
                {isSelected && (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: r.accent,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 16 }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
        <View style={{ padding: 16 }}>
          <Button3D variant="primary" fullWidth disabled={!selected} onPress={handleNext}>
            {t('screens.roleSelect.continue')} →
          </Button3D>
        </View>
      </SafeAreaView>
    </View>
  );
}

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
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { UserRole } from '@/types/profile';
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

const ROLES: RoleConfig[] = [
  { id: 'pilot', icon: '✈', title: 'Pilot', desc: 'Cockpit, ATC, ICAO Level 4', code: 'PIL', accent: '#E63946' },
  { id: 'cabin', icon: '🎧', title: 'Cabin Crew', desc: 'PA, safety demo, interview prep', code: 'CAB', accent: '#7C5CFF' },
  { id: 'technician', icon: '⚙', title: 'Aircraft Technician', desc: 'EASA Part-66, AMM reading', code: 'TEC', accent: '#2EA8FF' },
  { id: 'ground', icon: '💼', title: 'Ground Ops', desc: 'IATA IGOM, ramp, customer service', code: 'GND', accent: '#2DBE6C' },
  { id: 'student', icon: '📖', title: 'Aviation Student', desc: 'YDS, university, ICAO preview', code: 'STU', accent: '#F2C14E' },
];

export default function RoleSelectScreen() {
  const setRole = useOnboardingStore((s) => s.setRole);
  const currentRole = useOnboardingStore((s) => s.role);
  const [selected, setSelected] = useState<UserRole | null>(currentRole);

  const handleNext = () => {
    if (!selected) return;
    setRole(selected);
    router.push('/(auth)/onboarding/level-test');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
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
          <Eyebrow style={{ flex: 1, textAlign: 'center' }}>STEP 2 OF 6</Eyebrow>
          <TouchableOpacity style={{ width: 40, alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: FONTS.body600, fontSize: 13, color: '#5A6478' }}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <ProgressBar value={33} color="red" height={4} />
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <HHero>Pick your{'\n'}callsign.</HHero>
        <Body style={{ marginTop: 4, marginBottom: 20 }}>
          We'll build a learning route just for your role.
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
                  borderBottomWidth: 4,
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
                      {r.title}
                    </Text>
                    <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1 }}>
                      {r.code}
                    </Mono>
                  </View>
                  <Body style={{ fontSize: 13, marginTop: 2 }}>{r.desc}</Body>
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
            Continue →
          </Button3D>
        </View>
      </SafeAreaView>
    </View>
  );
}

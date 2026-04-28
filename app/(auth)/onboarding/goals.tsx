/**
 * Goals Screen — Daily flight time pick
 *
 * Tasarım birebir (screens-onboarding.jsx GoalsScreen):
 * - "How long is\nyour daily flight?" HHero + "You can change this any time."
 * - 5 goal cards (5/10/15/30/60 min) — Steady RECOMMENDED red border + 4px shadow
 * - "Take off ✈" red CTA
 */
import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { track } from '@/lib/posthog';
import {
  HHero,
  Body,
  Mono,
  FONTS,
  Button3D,
} from '@/components/airspeak';

interface GoalOption {
  mins: 5 | 10 | 15 | 30 | 60;
  label: string;
  desc: string;
  icon: string;
  recommended?: boolean;
}

const GOALS: GoalOption[] = [
  { mins: 5, label: 'Casual', desc: '1 lesson · maintain streak', icon: '☁️' },
  { mins: 10, label: 'Steady', desc: '2 lessons · most popular', icon: '⚡' },
  { mins: 15, label: 'Serious', desc: '3 lessons · ICAO 4 in 14w', icon: '🎯', recommended: true },
  { mins: 30, label: 'Intense', desc: '6 lessons · L4 in 7w', icon: '🔥' },
  { mins: 60, label: 'Captain', desc: 'Full session · L4 in 4w', icon: '👑' },
];

export default function GoalsScreen() {
  const placement = useOnboardingStore((s) => s.placementResult);
  const role = useOnboardingStore((s) => s.role);
  const setDailyGoal = useOnboardingStore((s) => s.setDailyGoal);
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete);
  const [selected, setSelected] = useState<GoalOption['mins']>(15);

  const handleFinish = () => {
    setDailyGoal(selected);
    setOnboardingComplete(true);
    track('onboarding_completed', {
      role: role ?? null,
      level: placement?.level ?? null,
      daily_goal: selected,
    });
    router.replace('/(tabs)/home');
  };

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
          <Text onPress={() => router.back()} style={{ fontSize: 24, color: '#0E1116' }}>
            ←
          </Text>
          <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
            STEP 6 OF 6
          </Mono>
          <View style={{ width: 24 }} />
        </View>
        {/* Progress 95% */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <View style={{ height: 4, backgroundColor: '#DCE0E8', borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ width: '95%', height: '100%', backgroundColor: '#E63946' }} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
      >
        <HHero>How long is{'\n'}your daily flight?</HHero>
        <Body color="#5A6478" style={{ fontSize: 15, marginBottom: 20 }}>
          You can change this any time.
        </Body>

        <View style={{ gap: 10 }}>
          {GOALS.map((g) => {
            const sel = selected === g.mins;
            return (
              <TouchableOpacity
                key={g.mins}
                activeOpacity={0.85}
                onPress={() => setSelected(g.mins)}
                style={{
                  backgroundColor: sel ? '#FFE4E7' : '#FFFFFF',
                  borderRadius: 14,
                  borderWidth: sel ? 2.5 : 1.5,
                  borderColor: sel ? '#E63946' : '#DCE0E8',
                  borderBottomWidth: 4,
                  borderBottomColor: sel ? '#E63946' : '#DCE0E8',
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <View style={{ width: 56 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 36,
                      fontWeight: '700',
                      color: sel ? '#E63946' : '#0E1116',
                      letterSpacing: -1.44,
                      lineHeight: 36,
                    }}
                  >
                    {g.mins}
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#8A93A6' }}>min</Text>
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontFamily: FONTS.body800, fontSize: 16, color: '#0E1116' }}>
                      {g.label}
                    </Text>
                    {g.recommended && (
                      <View
                        style={{
                          backgroundColor: '#E63946',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}
                      >
                        <Mono style={{ fontSize: 9, color: '#FFFFFF', letterSpacing: 0.81 }}>
                          RECOMMENDED
                        </Mono>
                      </View>
                    )}
                  </View>
                  <Body color="#5A6478" style={{ fontSize: 13, marginTop: 2 }}>
                    {g.desc}
                  </Body>
                </View>
                <Text style={{ fontSize: 22 }}>{g.icon}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
        <View style={{ padding: 16 }}>
          <Button3D variant="primary" fullWidth onPress={handleFinish}>
            Take off ✈
          </Button3D>
        </View>
      </SafeAreaView>
    </View>
  );
}

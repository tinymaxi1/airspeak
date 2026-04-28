/**
 * Conversation Index — AI Co-pilot senaryolarını listele.
 *
 * Kullanıcı buraya gelince tüm 5 (gelecek 50+) senaryoyu görür,
 * birini seçip /conversation/[scenario] route'una gider.
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Eyebrow,
  Mono,
  Body,
  FONTS,
  TopoBackground,
} from '@/components/airspeak';
import { SCENARIOS, getScenariosForRole } from '@/features/conversation/scenarios';
import { useOnboardingStore } from '@/stores/onboardingStore';

const ROLE_FILTERS = [
  { value: 'all', label: 'Tümü' },
  { value: 'pilot', label: '✈ Pilot' },
  { value: 'cabin', label: '🎧 Kabin' },
  { value: 'tech', label: '⚙ Teknisyen' },
  { value: 'ground', label: '💼 Yer' },
];

export default function ConversationIndexScreen() {
  const { t } = useTranslation();
  const role = useOnboardingStore((s) => s.role);
  const [filter, setFilter] = useState<string>('all');

  const scenarios = filter === 'all' ? SCENARIOS : SCENARIOS.filter((s) => s.role === filter);

  return (
    <View style={{ flex: 1, backgroundColor: '#06091A' }}>
      <View style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <TopoBackground />
      </View>

      <SafeAreaView edges={['top']} style={{ backgroundColor: 'rgba(15, 30, 71, 0.6)' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: '#FFFFFF' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.7)' }}>
              {t('conversation.indexEyebrow', 'AI CO-PILOT · 5 SENARYO')}
            </Mono>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 22, color: '#FFFFFF', marginTop: 2 }}>
              {t('conversation.indexTitle', 'Senaryo seç')}
            </Text>
          </View>
        </View>

        {/* Role filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 6 }}
        >
          {ROLE_FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                activeOpacity={0.85}
                onPress={() => setFilter(f.value)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1.5,
                  borderColor: active ? '#FFD56B' : 'rgba(255,255,255,0.18)',
                  backgroundColor: active ? 'rgba(255,213,107,0.16)' : 'transparent',
                }}
              >
                <Mono
                  style={{
                    fontSize: 11,
                    color: active ? '#FFD56B' : 'rgba(255,255,255,0.85)',
                    letterSpacing: 0.99,
                  }}
                >
                  {f.label}
                </Mono>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {scenarios.length === 0 && (
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: 'rgba(255,255,255,0.18)',
              borderRadius: 14,
              padding: 24,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 36 }}>🎙</Text>
            <Body color="rgba(255,255,255,0.7)" style={{ fontSize: 14, textAlign: 'center' }}>
              {t('conversation.noScenarios', 'Bu rol için henüz senaryo yok')}
            </Body>
          </View>
        )}

        {scenarios.map((s) => (
          <TouchableOpacity
            key={s.id}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/conversation/[scenario]', params: { scenario: s.id } })}
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.12)',
              borderRadius: 14,
              padding: 14,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: 'rgba(230,57,70,0.15)',
                borderWidth: 1,
                borderColor: '#FB6D78',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 26 }}>
                {s.role === 'pilot' ? '✈' : s.role === 'cabin' ? '🎧' : s.role === 'tech' ? '⚙' : '💼'}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#FFFFFF' }}>
                  {s.titleTr}
                </Text>
                <View
                  style={{
                    backgroundColor: s.level === 'L4' ? '#FFD56B' : s.level === 'B2' ? '#2EA8FF' : '#2DBE6C',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  <Mono style={{ fontSize: 9, color: s.level === 'L4' ? '#0A1430' : '#FFFFFF', letterSpacing: 0.81 }}>
                    {s.level}
                  </Mono>
                </View>
              </View>
              <Body color="rgba(255,255,255,0.7)" style={{ fontSize: 12, marginTop: 4 }}>
                {s.contextTr}
              </Body>
              <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                {s.turns.length} turn · ~{s.estimatedSeconds}sn
              </Mono>
            </View>

            <Text style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)' }}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

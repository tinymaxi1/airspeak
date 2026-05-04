/**
 * Practice Screen — Quick Flight drill hub
 *
 * Tasarım birebir (screens-other.jsx):
 * - "QUICK FLIGHT · NO STREAK PENALTY" eyebrow + "Practice" title
 * - 3 stat cards (Energy 7/10 gold, Today 2 drills red, Bonus +50 XP green)
 * - Filter chips (All active + Speaking, Listening, Vocab, Emergency)
 * - Featured weekly challenge card (red bg, mic watermark, "Diversion under fuel pressure")
 * - 5 drill cards (3D, ATC read-back, Numbers, Garbled, Emergency vocab, Weather)
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HHero,
  H2,
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Button3D,
  Card3D,
} from '@/components/airspeak';

type DrillCategory = 'all' | 'speaking' | 'listening' | 'vocab' | 'emergency';

interface Drill {
  title: string;
  sub: string;
  icon: string;
  accent: string;
  xp: number;
  mins: number;
  stars?: number;
  route?: Href;
  category: Exclude<DrillCategory, 'all'>;
}

const DRILLS: Drill[] = [
  { title: 'ATC read-back rapid fire', sub: '60 sec · 12 clearances', icon: '🎙', accent: '#E63946', xp: 80, mins: 2, route: '/readback', category: 'speaking' },
  { title: 'Numbers 0–9 (decimals)', sub: 'Pronunciation · 3 stars', icon: '🔊', accent: '#F2C14E', xp: 50, mins: 3, stars: 2, route: { pathname: '/pronunciation/[id]', params: { id: 'p1' } }, category: 'speaking' },
  { title: 'Garbled radio decode', sub: 'Listening · noise +30%', icon: '🎧', accent: '#2EA8FF', xp: 65, mins: 4, category: 'listening' },
  { title: 'Emergency vocabulary', sub: 'Match · 24 words', icon: '🛡', accent: '#7C5CFF', xp: 60, mins: 3, stars: 3, category: 'emergency' },
  { title: 'Weather phenomena', sub: 'Reading · METAR/TAF', icon: '☁', accent: '#2DBE6C', xp: 75, mins: 5, category: 'vocab' },
  { title: 'Aviation vocab matching', sub: '300 terim · 5 dakika', icon: '📖', accent: '#7C5CFF', xp: 40, mins: 5, category: 'vocab' },
  { title: 'ATC tower listening', sub: 'Audio + transcribe', icon: '🎧', accent: '#2EA8FF', xp: 55, mins: 4, category: 'listening' },
];

export default function PracticeScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<DrillCategory>('all');

  const FILTER_CHIPS: { label: string; value: DrillCategory }[] = [
    { label: t('screens.practice.filterAll'), value: 'all' },
    { label: t('screens.practice.filterSpeaking'), value: 'speaking' },
    { label: t('screens.practice.filterListening'), value: 'listening' },
    { label: t('screens.practice.filterVocab'), value: 'vocab' },
    { label: t('screens.practice.filterEmergency'), value: 'emergency' },
  ];

  const filteredDrills = filter === 'all' ? DRILLS : DRILLS.filter((d) => d.category === filter);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 }}>
          <Eyebrow>{t('screens.practice.eyebrow')}</Eyebrow>
          <Text style={{ fontFamily: FONTS.body800, fontSize: 22, color: '#0E1116', marginTop: 4 }}>
            {t('screens.practice.title')}
          </Text>
        </View>
        {/* Sprint 14.A.3 — Segment: Dersler / Pratik (learn ile symmetric) */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingBottom: 10,
            gap: 8,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.replace('/(tabs)/learn')}
            accessibilityLabel="Derslere dön"
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0E1116' }}>
              Dersler
            </Text>
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: '#0F1E47',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#FFFFFF' }}>
              Pratik
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Stat row */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
          <PracticeStat icon="⚡" label={t('screens.practice.energy')} value="7/10" color="#F2C14E" />
          <PracticeStat icon="🎯" label={t('screens.practice.todayDrills')} value={t('screens.practice.todayValue', { count: 2 })} color="#E63946" />
          <PracticeStat icon="⭐" label={t('screens.practice.bonus')} value={t('screens.practice.bonusValue')} color="#2DBE6C" />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 14 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {FILTER_CHIPS.map((c) => {
            const active = filter === c.value;
            return (
              <TouchableOpacity
                key={c.value}
                activeOpacity={0.85}
                onPress={() => setFilter(c.value)}
                style={{
                  height: 36,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: active ? '#0F1E47' : '#FFFFFF',
                  borderWidth: 1.5,
                  borderColor: active ? '#0F1E47' : '#DCE0E8',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.body700,
                    fontSize: 13,
                    color: active ? '#FFFFFF' : '#0E1116',
                  }}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Weekly Challenge */}
        <View
          style={{
            backgroundColor: '#E63946',
            borderRadius: 14,
            padding: 16,
            marginBottom: 18,
            borderBottomWidth: 4,
            borderBottomColor: '#C8202E',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Text
            style={{
              position: 'absolute',
              right: -10,
              bottom: -16,
              fontSize: 140,
              opacity: 0.18,
            }}
          >
            🎙
          </Text>

          <Eyebrow accent color="rgba(255,255,255,0.85)">
            {t('screens.practice.weeklyChallenge')}
          </Eyebrow>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 24,
              fontWeight: '700',
              color: '#FFFFFF',
              marginTop: 6,
              lineHeight: 26,
              letterSpacing: -0.48,
            }}
          >
            {t('screens.practice.weeklyTitle')}
          </Text>
          <Body color="rgba(255,255,255,0.9)" style={{ fontSize: 13, marginTop: 6 }}>
            {t('screens.practice.weeklyDesc')}
          </Body>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/practice')}
            style={{
              marginTop: 12,
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderBottomWidth: 3,
              borderBottomColor: 'rgba(0,0,0,0.18)',
            }}
          >
            <Text style={{ fontFamily: FONTS.body800, fontSize: 13, color: '#E63946' }}>
              {t('screens.practice.weeklyCta')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fast drills */}
        <Eyebrow>{t('screens.practice.fastDrills')}</Eyebrow>
        <View style={{ gap: 10, marginTop: 10 }}>
          {filteredDrills.length === 0 && (
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: '#DCE0E8',
                padding: 24,
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 36 }}>🔍</Text>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#5A6478', textAlign: 'center' }}>
                {t('screens.practice.noResults', 'Bu kategoride drill yok')}
              </Text>
            </View>
          )}
          {filteredDrills.map((d, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.85}
              onPress={() => d.route && router.push(d.route)}
              disabled={!d.route}
            >
              <Card3D style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: d.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 26, color: '#FFFFFF' }}>{d.icon}</Text>
                </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                  {d.title}
                </Text>
                <Body style={{ fontSize: 12, marginTop: 2 }}>{d.sub}</Body>
                {d.stars !== undefined && (
                  <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
                    {[1, 2, 3].map((s) => (
                      <Text
                        key={s}
                        style={{
                          fontSize: 10,
                          color: s <= d.stars! ? '#F2C14E' : '#DCE0E8',
                        }}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                )}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Mono style={{ fontSize: 11, color: '#8A93A6', letterSpacing: 1 }}>
                  {d.mins}M
                </Mono>
                <Text
                  style={{
                    fontFamily: FONTS.body800,
                    fontSize: 13,
                    color: '#0E1116',
                    marginTop: 2,
                  }}
                >
                  +{d.xp} XP
                </Text>
              </View>
              </Card3D>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function PracticeStat({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        padding: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 14, color }}>{icon}</Text>
        <Text
          style={{
            fontFamily: FONTS.mono,
            fontSize: 10,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 18,
          fontWeight: '700',
          color: '#0E1116',
          marginTop: 2,
          letterSpacing: -0.18,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

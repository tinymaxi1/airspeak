/**
 * Home Screen — AirSpeak Daily Flight Plan
 *
 * Tasarım birebir uygulandı (screens-home.jsx):
 * - Custom header: navy topo + "Good morning, Captain." + 4 stat pills
 * - Daily flight plan card (2/3 lessons today, IST→JFK pattern)
 * - Week strip (7 günlük progress)
 * - Quick practice 2x2 grid (4 ikon)
 * - Word of the flight ("squawk")
 * - Tab bar 5 sekme (active: home)
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { getNextLesson } from '@/features/lessons/seed/lessonTree';
import {
  HHero,
  H2,
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Avatar,
  Button3D,
  Card3D,
} from '@/components/airspeak';

export default function HomeScreen() {
  const role = useOnboardingStore((s) => s.role);
  const placement = useOnboardingStore((s) => s.placementResult);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);
  const completedIds = useProgressStore((s) => s.completedLessonIds);
  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
  const next = useMemo(() => getNextLesson(role, completedSet, false), [role, completedSet]);

  const streak = 12; // TODO: gamificationStore.streak
  const hearts = 4;
  const xp = 2840;
  const level = placement?.generalEnglish?.label ?? placement?.level ?? 'B1';

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      {/* ═══════════ HEADER — navy topo strip ═══════════ */}
      <View style={{ backgroundColor: '#0F1E47', position: 'relative', overflow: 'hidden' }}>
        <SafeAreaView edges={['top']}>
          <View style={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 18 }}>
            {/* Topo glow background */}
            <View style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
              <Svg width="100%" height="100%" viewBox="0 0 393 200">
                <Defs>
                  <RadialGradient id="topoGlow" cx="0%" cy="0%">
                    <Stop offset="0%" stopColor="rgba(91,192,255,0.18)" />
                    <Stop offset="100%" stopColor="rgba(91,192,255,0)" />
                  </RadialGradient>
                  <RadialGradient id="redGlow" cx="100%" cy="100%">
                    <Stop offset="0%" stopColor="rgba(230,57,70,0.18)" />
                    <Stop offset="100%" stopColor="rgba(230,57,70,0)" />
                  </RadialGradient>
                </Defs>
                <Rect width="393" height="200" fill="url(#topoGlow)" />
                <Rect width="393" height="200" fill="url(#redGlow)" />
              </Svg>
            </View>

            {/* Greeting + Avatar */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
                position: 'relative',
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    letterSpacing: 1.8,
                    color: 'rgba(255,255,255,0.65)',
                    textTransform: 'uppercase',
                  }}
                >
                  FLT 12 ✦ DAY {streak}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 26,
                    fontWeight: '700',
                    color: '#FFFFFF',
                    letterSpacing: -0.52,
                    marginTop: 2,
                  }}
                >
                  Good morning, Captain.
                </Text>
              </View>
              <Avatar initials="EK" color="#E63946" size={44} />
            </View>

            {/* Stat pills row */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <StatPill icon="🔥" value={String(streak)} label="streak" />
              <StatPill icon="❤" value={String(hearts)} label="hearts" />
              <StatPill icon="⭐" value={xp.toLocaleString()} label="XP" />
              <StatPill icon="🌐" value={level} label="level" />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ═══════════ SCROLL AREA ═══════════ */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Flight Plan card */}
        <Card3D style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          {/* Header */}
          <View
            style={{
              padding: 16,
              paddingBottom: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 1.5,
              borderBottomColor: '#B8BFCC',
              borderStyle: 'dashed',
            }}
          >
            <View>
              <Eyebrow>TODAY'S FLIGHT PLAN</Eyebrow>
              <Mono style={{ fontSize: 12, fontWeight: '700', marginTop: 4 }}>
                IST <Text style={{ color: '#8A93A6' }}>—————</Text> JFK
              </Mono>
            </View>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 22,
                fontWeight: '700',
                color: '#E63946',
              }}
            >
              2 / 3
            </Text>
          </View>

          {/* Lesson list */}
          <View style={{ padding: 16 }}>
            <FlightPlanRow
              state="done"
              title="Read-back: Taxi clearance"
              meta="+45 XP · 2 perfect"
              time="9:12"
            />
            <FlightPlanRow
              state="done"
              title="Vocab: Approach phase"
              meta="+38 XP · 1 mistake"
              time="9:18"
              hasBorder
            />
            <FlightPlanRow
              state="current"
              title={next?.lesson.title ?? 'AI Conversation: Holding pattern'}
              meta="~5 min · live with co-pilot AI"
              hasBorder
            />
          </View>

          {/* Resume button */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button3D
              variant="primary"
              fullWidth
              onPress={() => {
                recordDailyActivity();
                if (next) {
                  router.push({ pathname: '/lesson/[id]', params: { id: next.lesson.id } });
                } else {
                  router.push('/(tabs)/learn');
                }
              }}
            >
              Resume ✈
            </Button3D>
          </View>
        </Card3D>

        {/* Week strip */}
        <Eyebrow>WEEK 6 · ON ROUTE</Eyebrow>
        <Card3D style={{ padding: 14, marginTop: 8, marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            {(['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const).map((d, i) => {
              const states = ['done', 'done', 'done', 'done', 'current', 'future', 'future'] as const;
              const s = states[i];
              return (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.body700,
                      fontSize: 11,
                      color: '#8A93A6',
                      marginBottom: 6,
                    }}
                  >
                    {d}
                  </Text>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor:
                        s === 'done' ? '#2DBE6C' : s === 'current' ? '#E63946' : '#E9E6DD',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: s === 'current' ? 2 : 0,
                      borderColor: '#E63946',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONTS.body700,
                        fontSize: 12,
                        color: s === 'future' ? '#8A93A6' : '#FFFFFF',
                      }}
                    >
                      {s === 'done' ? '✓' : s === 'current' ? '🔥' : i + 1}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8', paddingTop: 10 }}>
            <Body style={{ fontSize: 13, color: '#5A6478', textAlign: 'center' }}>
              <Text style={{ color: '#0E1116', fontFamily: FONTS.body700 }}>4 days</Text> till new perfect week badge.
            </Body>
          </View>
        </Card3D>

        {/* Quick practice 2x2 */}
        <Eyebrow>FAST PRACTICE — 90 SEC</Eyebrow>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
          <QuickCard
            icon="🎙"
            label="Read-back drill"
            sub="ATC clearances"
            color="#E63946"
            onPress={() => router.push('/(tabs)/practice')}
          />
          <QuickCard
            icon="🎧"
            label="Listen & decode"
            sub="Garbled radio"
            color="#2EA8FF"
            onPress={() => router.push('/(tabs)/practice')}
          />
          <QuickCard
            icon="🤖"
            label="AI roleplay"
            sub="Holding pattern"
            color="#7C5CFF"
            onPress={() => router.push('/paywall')}
          />
          <QuickCard
            icon="🔊"
            label="Pronounce"
            sub="Numbers 0–9"
            color="#F2C14E"
            onPress={() => router.push('/(tabs)/practice')}
          />
        </View>

        {/* Word of the flight */}
        <Eyebrow style={{ marginTop: 18 }}>WORD OF THE FLIGHT</Eyebrow>
        <Card3D style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 30,
                  fontWeight: '700',
                  letterSpacing: -0.6,
                  color: '#0E1116',
                }}
              >
                squawk
              </Text>
              <Mono style={{ fontSize: 12, color: '#8A93A6', marginTop: -2 }}>
                /skwɒk/ · verb
              </Mono>
              <Body style={{ fontSize: 14, marginTop: 8 }}>
                To set a 4-digit transponder code as instructed by ATC.
              </Body>
              <View
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: '#E63946',
                  paddingLeft: 10,
                  marginTop: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 13,
                    fontStyle: 'italic',
                    color: '#0E1116',
                  }}
                >
                  "Turkish 1453, squawk 7421."
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#0F1E47',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 18 }}>🔊</Text>
            </TouchableOpacity>
          </View>
        </Card3D>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════

function StatPill({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <View>
        <Text
          style={{
            fontFamily: FONTS.body800,
            fontSize: 13,
            color: '#FFFFFF',
            lineHeight: 14,
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            fontFamily: FONTS.body700,
            fontSize: 9,
            letterSpacing: 0.9,
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            marginTop: 2,
            lineHeight: 9,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

function FlightPlanRow({
  state,
  title,
  meta,
  time,
  hasBorder,
}: {
  state: 'done' | 'current';
  title: string;
  meta: string;
  time?: string;
  hasBorder?: boolean;
}) {
  const config = {
    done: { bg: '#2DBE6C', shadow: '#1FA35A', icon: '✓' },
    current: { bg: '#E63946', shadow: '#C8202E', icon: '✈' },
  }[state];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 10,
        borderTopWidth: hasBorder ? 1 : 0,
        borderTopColor: '#DCE0E8',
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: config.bg,
          borderBottomWidth: 3,
          borderBottomColor: config.shadow,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 22 }}>{config.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>{title}</Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: 12, color: '#5A6478', marginTop: 2 }}>
          {meta}
        </Text>
      </View>
      {time && (
        <Mono style={{ fontSize: 12, color: '#8A93A6' }}>{time}</Mono>
      )}
      {state === 'current' && (
        <Text style={{ fontSize: 20, color: '#E63946' }}>›</Text>
      )}
    </View>
  );
}

function QuickCard({
  icon,
  label,
  sub,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  sub: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flex: 1,
        minWidth: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        borderBottomWidth: 4.5,
        padding: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 18, color: '#FFFFFF' }}>{icon}</Text>
      </View>
      <Text style={{ fontFamily: FONTS.body800, fontSize: 13, color: '#0E1116' }}>{label}</Text>
      <Text style={{ fontFamily: FONTS.body, fontSize: 11, color: '#5A6478', marginTop: 2 }}>
        {sub}
      </Text>
    </TouchableOpacity>
  );
}

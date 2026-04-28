/**
 * Placement Result Screen — "Your boarding pass" (signature design)
 *
 * Tasarım birebir (screens-onboarding.jsx):
 * - Top bar transparent: "TEST COMPLETE" + "Your boarding pass"
 * - Boarding pass card:
 *   - Üst: Navy header — YOUR LEVEL B1 (Space Grotesk 64px) + RouteGlobe
 *   - Alt: "FROM B1 → TARGET L4" (3-col layout)
 *   - Plane icon ortada dashed line üstünde
 *   - "~14 weeks at 15 min/day → ICAO L4 ready"
 * - 4 boyut bar grafiği (GEN/AVE/KNO/COM — sky/red/gold/green)
 * - Recommended path card (3 madde)
 * - Sticky "Hadi başla" CTA → goals
 */
import { ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Path } from 'react-native-svg';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  HHero,
  H2,
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Button3D,
  RouteGlobe,
  ProgressBar,
} from '@/components/airspeak';

interface DimRow {
  name: string;
  code: string;
  scoreKey: 'generalEnglish' | 'aviationEnglish' | 'aviationKnowledge' | 'communication';
  color: 'red' | 'navy' | 'gold' | 'green';
  accentHex: string;
}

const DIMENSIONS: DimRow[] = [
  { name: 'General English', code: 'GEN', scoreKey: 'generalEnglish', color: 'navy', accentHex: '#2EA8FF' },
  { name: 'Aviation English', code: 'AVE', scoreKey: 'aviationEnglish', color: 'red', accentHex: '#E63946' },
  { name: 'Aviation Knowledge', code: 'KNO', scoreKey: 'aviationKnowledge', color: 'gold', accentHex: '#F2C14E' },
  { name: 'Communication', code: 'COM', scoreKey: 'communication', color: 'green', accentHex: '#2DBE6C' },
];

export default function PlacementResultScreen() {
  const result = useOnboardingStore((s) => s.placementResult);
  const role = useOnboardingStore((s) => s.role);

  if (!result || !result.generalEnglish) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFAF7', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 16 }}>📋</Text>
        <H2 style={{ textAlign: 'center', marginBottom: 12 }}>Henüz test alınmamış</H2>
        <Body style={{ textAlign: 'center', marginBottom: 24 }}>
          Önce 4-segment placement testi tamamla.
        </Body>
        <Button3D variant="primary" onPress={() => router.replace('/(auth)/onboarding/level-test')}>
          Teste başla
        </Button3D>
      </View>
    );
  }

  const overallLevel = result.generalEnglish?.label ?? result.level ?? 'B1';

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 12,
            alignItems: 'center',
          }}
        >
          <Eyebrow>TEST COMPLETE</Eyebrow>
          <Text
            style={{
              fontFamily: FONTS.body800,
              fontSize: 16,
              color: '#0E1116',
              marginTop: 4,
            }}
          >
            Your boarding pass
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* ═══════════ BOARDING PASS ═══════════ */}
        <View
          style={{
            borderRadius: 14,
            backgroundColor: '#FFFFFF',
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          {/* Navy header — YOUR LEVEL */}
          <View
            style={{
              backgroundColor: '#0F1E47',
              paddingHorizontal: 20,
              paddingVertical: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View>
              <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.7)' }}>
                YOUR LEVEL
              </Mono>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 64,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  lineHeight: 64,
                  letterSpacing: -2.56,
                }}
              >
                {overallLevel}
              </Text>
              <Body color="rgba(255,255,255,0.85)" style={{ fontSize: 13, marginTop: 4 }}>
                Operational Pre-ICAO 4
              </Body>
            </View>
            <RouteGlobe size={100} />
          </View>

          {/* FROM → TARGET */}
          <View style={{ padding: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              {/* FROM */}
              <View>
                <Eyebrow>FROM</Eyebrow>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 32,
                    fontWeight: '700',
                    color: '#0E1116',
                    marginTop: 2,
                    letterSpacing: -0.64,
                  }}
                >
                  {overallLevel}
                </Text>
                <Body style={{ fontSize: 12 }}>Pre-Operational</Body>
              </View>

              {/* Plane on dashed line */}
              <View style={{ flex: 1, height: 32, marginHorizontal: 12, justifyContent: 'center' }}>
                <Svg viewBox="0 0 200 32" width="100%" height={32}>
                  <Line
                    x1={0}
                    y1={16}
                    x2={200}
                    y2={16}
                    stroke="#B8BFCC"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                  <Path d="M88 16 L100 8 L108 14 L108 18 L100 24 L88 16z" fill="#E63946" />
                </Svg>
              </View>

              {/* TARGET */}
              <View style={{ alignItems: 'flex-end' }}>
                <Eyebrow>TARGET</Eyebrow>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 32,
                    fontWeight: '700',
                    color: '#0E1116',
                    marginTop: 2,
                    letterSpacing: -0.64,
                  }}
                >
                  L4
                </Text>
                <Body style={{ fontSize: 12 }}>ICAO Operational</Body>
              </View>
            </View>

            {/* Time estimate */}
            <View
              style={{
                backgroundColor: '#E9E6DD',
                borderRadius: 10,
                padding: 12,
              }}
            >
              <Body style={{ fontSize: 13 }}>
                <Text style={{ color: '#0E1116', fontFamily: FONTS.body700 }}>~14 weeks</Text> at 15 min/day → ICAO L4 ready.
              </Body>
            </View>
          </View>
        </View>

        {/* ═══════════ 4 DIMENSION BARS ═══════════ */}
        <Eyebrow>YOUR DIMENSIONS</Eyebrow>
        <View style={{ marginTop: 8, gap: 12, marginBottom: 20 }}>
          {DIMENSIONS.map((d) => {
            const dim = result[d.scoreKey];
            const score = dim?.score ?? 0;
            const label = dim?.label ?? '—';
            return (
              <View
                key={d.code}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#DCE0E8',
                  padding: 14,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: '#0E1116' }}>
                      {d.name}
                    </Text>
                    <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1 }}>
                      {d.code}
                    </Mono>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 24,
                        fontWeight: '700',
                        color: d.accentHex,
                        letterSpacing: -0.48,
                      }}
                    >
                      {label}
                    </Text>
                    <Mono style={{ fontSize: 11, color: '#8A93A6' }}>{score}%</Mono>
                  </View>
                </View>
                <ProgressBar value={score} color={d.color} height={8} />
              </View>
            );
          })}
        </View>

        {/* Recommended path */}
        {result.recommendations && (
          <>
            <Eyebrow>RECOMMENDED PATH</Eyebrow>
            <View
              style={{
                marginTop: 8,
                backgroundColor: '#0F1E47',
                borderRadius: 14,
                padding: 16,
                borderBottomWidth: 4,
                borderBottomColor: '#0A1430',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  letterSpacing: -0.44,
                  marginBottom: 8,
                  lineHeight: 26,
                }}
              >
                Focus first: {result.recommendations.primaryFocus.split('—')[0]?.trim()}
              </Text>
              {result.recommendations.roadmap.slice(0, 3).map((step, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <Mono color="#FFD56B" style={{ fontSize: 12 }}>
                    {String(i + 1).padStart(2, '0')}
                  </Mono>
                  <Body color="rgba(255,255,255,0.85)" style={{ fontSize: 13, flex: 1 }}>
                    {step}
                  </Body>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
        <View style={{ padding: 16 }}>
          <Button3D
            variant="primary"
            fullWidth
            onPress={() => router.replace('/(auth)/onboarding/goals')}
          >
            Set my daily goal →
          </Button3D>
        </View>
      </SafeAreaView>
    </View>
  );
}

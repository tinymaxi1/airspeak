/**
 * ICAO L4 Live Screen — taking the exam
 *
 * Tasarım birebir (screens-icao.jsx ICAOLiveScreen):
 * - Navy-900 bg
 * - Top: SEC 04 · ATC INTERACTION + Q3/5 + red live timer 04:12
 * - Section bar (6 segments: green done / red current / gray pending)
 * - SCENARIO image (sky gradient + runway + landing plane + storm + lightning + RWY tag)
 * - Question (display 22) + 30s think + 90s answer
 * - Live transcript card (gray bg + cursor)
 * - Mic dock: pause + waveform "RECORDING" + red 56 next button
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Polygon,
  Line,
  G,
  Ellipse,
} from 'react-native-svg';
import { Mono, FONTS } from '@/components/airspeak';

export default function ICAOLiveScreen() {
  const sections = [
    { state: 'done' },
    { state: 'done' },
    { state: 'done' },
    { state: 'current' },
    { state: 'pending' },
    { state: 'pending' },
  ] as const;

  return (
    <View style={{ flex: 1, backgroundColor: '#06091A' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#06091A' }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <View>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.55)' }}>
              SEC 04 · ATC INTERACTION
            </Mono>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#FFFFFF', marginTop: 2 }}>
              Question 3 / 5
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(230,57,70,0.16)',
              borderWidth: 1,
              borderColor: 'rgba(230,57,70,0.5)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#FB6D78',
              }}
            />
            <Text style={{ fontFamily: FONTS.mono700, fontSize: 13, color: '#FFFFFF' }}>
              04 : 12
            </Text>
          </View>
        </View>

        {/* Section bar */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', gap: 4 }}>
          {sections.map((s, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor:
                  s.state === 'done'
                    ? '#2DBE6C'
                    : s.state === 'current'
                      ? '#E63946'
                      : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.8 }}>SCENARIO</Mono>

        {/* Scenario image */}
        <View
          style={{
            marginTop: 8,
            borderRadius: 16,
            overflow: 'hidden',
            height: 200,
            position: 'relative',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 360 200"
            preserveAspectRatio="xMidYMid slice"
          >
            <Defs>
              <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FF7847" stopOpacity={0.3} />
                <Stop offset="60%" stopColor="#1B3478" />
                <Stop offset="100%" stopColor="#0A1430" />
              </LinearGradient>
            </Defs>
            <Rect width={360} height={200} fill="url(#sky)" />
            {/* Mountains */}
            <Path
              d="M0 130 L60 100 L120 120 L180 90 L240 115 L300 95 L360 120 L360 200 L0 200 Z"
              fill="rgba(0,0,0,0.4)"
            />
            {/* Runway */}
            <Polygon points="180,140 200,140 280,200 100,200" fill="#222" />
            <Line x1={180} y1={148} x2={200} y2={148} stroke="white" strokeWidth={1.5} />
            <Line x1={178} y1={156} x2={202} y2={156} stroke="white" strokeWidth={1.5} />
            <Line x1={174} y1={168} x2={206} y2={168} stroke="white" strokeWidth={1.5} />
            <Line x1={168} y1={184} x2={212} y2={184} stroke="white" strokeWidth={1.5} />
            {/* Landing plane */}
            <G transform="translate(220 70) rotate(15)">
              <Path
                d="M0 0 L24 -2 L26 -8 L36 -2 L40 0 L36 2 L26 4 L20 8 L8 8 L4 4 Z"
                fill="white"
                opacity={0.95}
              />
            </G>
            {/* Storm clouds */}
            <Ellipse cx={80} cy={50} rx={40} ry={14} fill="rgba(255,255,255,0.12)" />
            <Ellipse cx={100} cy={58} rx={30} ry={10} fill="rgba(255,255,255,0.08)" />
            {/* Lightning */}
            <Path d="M70 64 L66 76 L74 76 L70 88" stroke="#FFD56B" strokeWidth={2} fill="none" />
          </Svg>
          {/* RWY tag */}
          <View
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: 'rgba(0,0,0,0.5)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
            }}
          >
            <Mono style={{ fontSize: 10, color: '#FFFFFF', letterSpacing: 1 }}>
              RWY 27R · WX: TS APPROACHING
            </Mono>
          </View>
        </View>

        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 22,
            fontWeight: '700',
            color: '#FFFFFF',
            marginTop: 18,
            lineHeight: 26,
            letterSpacing: -0.44,
          }}
        >
          Describe the situation{'\n'}and what you would do.
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
            marginTop: 6,
            lineHeight: 19,
            fontFamily: FONTS.body,
          }}
        >
          Speak naturally. Take 30 seconds to think, then up to 90 seconds to answer.
        </Text>

        {/* Live transcript */}
        <View
          style={{
            marginTop: 18,
            padding: 14,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: 14,
            minHeight: 100,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.8 }}>
              LIVE TRANSCRIPT
            </Mono>
            <Mono style={{ fontSize: 10, color: '#4FD487', letterSpacing: 1.2 }}>
              ● 0:34 / 1:30
            </Mono>
          </View>
          <Text
            style={{
              fontSize: 15,
              lineHeight: 22,
              color: 'rgba(255,255,255,0.85)',
              fontFamily: FONTS.body,
            }}
          >
            We are on final approach to runway two-seven right. There is a thunderstorm building to
            the south, and I can see lightning. I would request a go-around and divert to{' '}
            <Text style={{ color: '#FB6D78' }}>▌</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Mic dock */}
      <SafeAreaView
        edges={['bottom']}
        style={{
          backgroundColor: '#0F1E47',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(255,255,255,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18, color: '#FFFFFF' }}>⏸</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center', height: 24 }}>
              {Array.from({ length: 28 }).map((_, i) => {
                const h = 4 + Math.abs(Math.sin(i * 0.6)) * 18;
                return (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height: h,
                      backgroundColor: '#FB6D78',
                      borderRadius: 1,
                    }}
                  />
                );
              })}
            </View>
            <Mono
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.5)',
                marginTop: 2,
                letterSpacing: 1,
              }}
            >
              RECORDING · DO NOT STOP MID-SENTENCE
            </Mono>
          </View>
          <TouchableOpacity
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#E63946',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottomWidth: 4,
              borderBottomColor: '#C8202E',
            }}
            onPress={() => router.push('/exam/icao4-result')}
          >
            <Text style={{ fontSize: 22, color: '#FFFFFF' }}>→</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

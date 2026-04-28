/**
 * Mic Denied Screen
 *
 * Tasarım birebir (screens-extras.jsx MicDeniedScreen):
 * - "LESSON 04 · UNIT 3" eyebrow + "Read-back drill" title + close
 * - Top progress 40% + 4/5 hearts
 * - 160x160 red-bg dashed circle with mic + diagonal red X overlay
 * - "RX BLOCKED · MIC DENIED" eyebrow + "Mikrofon erişimi kapalı."
 * - 3-step instruction list (numbered navy boxes)
 * - Open settings primary + Type my answer ghost
 */
import { Linking } from 'react-native';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import { Mono, FONTS, Button3D } from '@/components/airspeak';

const STEPS = ['Settings → AirSpeak', 'Microphone toggle → On', 'Bu ekrana geri dön'];

export default function MicDeniedScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
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
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: '#0E1116' }}>✕</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
              LESSON 04 · UNIT 3
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.body800,
                fontSize: 22,
                color: '#0E1116',
                marginTop: 2,
              }}
            >
              Read-back drill
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
      >
        {/* Progress + hearts */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 10,
              backgroundColor: '#EDEFF3',
              borderRadius: 5,
              overflow: 'hidden',
            }}
          >
            <View style={{ width: '40%', height: '100%', backgroundColor: '#E63946' }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 3 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Text key={i} style={{ fontSize: 16, color: i <= 4 ? '#E63946' : '#DCE0E8' }}>
                ❤
              </Text>
            ))}
          </View>
        </View>

        {/* Mic crossed */}
        <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <View
            style={{
              width: 160,
              height: 160,
              borderRadius: 32,
              backgroundColor: '#FFE4E7',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: '#E63946',
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 80 }}>🎙</Text>
            <View style={{ position: 'absolute', top: -10, left: -10 }}>
              <Svg width={180} height={180} viewBox="0 0 180 180">
                <Line
                  x1={40}
                  y1={40}
                  x2={140}
                  y2={140}
                  stroke="#E63946"
                  strokeWidth={6}
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          </View>

          <Mono
            style={{
              fontSize: 10,
              color: '#FFD56B',
              letterSpacing: 1.8,
              textAlign: 'center',
            }}
          >
            RX BLOCKED · MIC DENIED
          </Mono>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 26,
              fontWeight: '700',
              lineHeight: 29,
              textAlign: 'center',
              marginTop: 8,
              color: '#0E1116',
              paddingHorizontal: 8,
            }}
          >
            Mikrofon erişimi kapalı.
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#5A6478',
              textAlign: 'center',
              marginTop: 10,
              lineHeight: 21,
              paddingHorizontal: 8,
              fontFamily: FONTS.body,
            }}
          >
            Read-back ve AI co-pilot için sesin lazım.{'\n'}
            iOS ayarlarından AirSpeak'e mikrofon izni ver.
          </Text>

          {/* Steps */}
          <View
            style={{
              backgroundColor: '#EDEFF3',
              borderRadius: 14,
              padding: 14,
              marginTop: 20,
              width: '100%',
            }}
          >
            {STEPS.map((s, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 6,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    backgroundColor: '#0F1E47',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Mono style={{ fontSize: 11, color: '#FFFFFF' }}>{i + 1}</Mono>
                </View>
                <Text
                  style={{
                    fontFamily: FONTS.body600,
                    fontSize: 13,
                    color: '#0E1116',
                  }}
                >
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={{ gap: 8, marginTop: 20 }}>
          <Button3D
            variant="primary"
            fullWidth
            onPress={() => Linking.openSettings()}
          >
            Open settings
          </Button3D>
          <Button3D variant="ghost" fullWidth onPress={() => router.back()}>
            Type my answer instead
          </Button3D>
        </View>
      </ScrollView>
    </View>
  );
}

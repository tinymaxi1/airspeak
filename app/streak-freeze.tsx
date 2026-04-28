/**
 * Streak Freeze Modal Screen
 *
 * Tasarım birebir (screens-extras.jsx StreakFreezeModal):
 * - Dimmed bg (rgba 0.55) + bottom sheet
 * - Drag handle 40x5
 * - 96x96 sky-gradient hero with snowflake SVG + flame badge top-right
 * - "STREAK FREEZE · TK-12 PROTECTED" eyebrow + "Hava bozuktu — streak'in donduruldu."
 * - Inventory: 3 cells (2 sky filled + 1 empty) + "2 of 3 freezes left" + Buy gold pill
 * - Got it primary + See streak rules ghost
 */
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import {
  Mono,
  FONTS,
  Button3D,
} from '@/components/airspeak';

export default function StreakFreezeScreen() {
  return (
    <Pressable
      onPress={() => router.back()}
      style={{
        flex: 1,
        backgroundColor: 'rgba(5,11,26,0.55)',
        justifyContent: 'flex-end',
      }}
    >
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FAFAF7',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          paddingBottom: 36,
        }}
      >
        {/* Drag handle */}
        <View
          style={{
            width: 40,
            height: 5,
            borderRadius: 999,
            backgroundColor: '#DCE0E8',
            alignSelf: 'center',
            marginBottom: 16,
          }}
        />

        {/* Hero icon */}
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            alignSelf: 'center',
            marginBottom: 16,
            position: 'relative',
          }}
        >
          <Svg width={96} height={96} viewBox="0 0 96 96">
            <Defs>
              <LinearGradient id="freezeGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#5BC0FF" />
                <Stop offset="100%" stopColor="#2EA8FF" />
              </LinearGradient>
            </Defs>
            <Rect width={96} height={96} rx={24} fill="url(#freezeGrad)" />
            <Path
              d="M48 22v52M22 48h52M30 30l36 36M66 30L30 66"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          {/* Flame badge */}
          <View
            style={{
              position: 'absolute',
              top: -12,
              right: -12,
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: '#FF7847',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>🔥</Text>
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
          STREAK FREEZE · TK-12 PROTECTED
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
          }}
        >
          Hava bozuktu — streak'in donduruldu.
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#5A6478',
            textAlign: 'center',
            marginTop: 8,
            lineHeight: 21,
            fontFamily: FONTS.body,
          }}
        >
          12 günlük streak'in korunuyor.{' '}
          <Text style={{ fontFamily: FONTS.body700 }}>2 freeze daha</Text> kaldı bu ay. Yarın 20
          dakikalık plana geri dön.
        </Text>

        {/* Inventory */}
        <View
          style={{
            backgroundColor: '#EDEFF3',
            borderRadius: 14,
            padding: 14,
            marginTop: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  width: 22,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: i <= 2 ? '#2EA8FF' : '#DCE0E8',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i <= 2 && (
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>❄</Text>
                )}
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0E1116' }}>
              2 of 3 freezes left
            </Text>
            <Text style={{ fontSize: 11, color: '#8A93A6', fontFamily: FONTS.body }}>
              Aylık reset · 1 Nis
            </Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: '#FFD56B',
              paddingHorizontal: 12,
              height: 28,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Mono style={{ fontSize: 11, color: '#0A1430', letterSpacing: 0.99 }}>+ BUY</Mono>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 16 }}>
          <Button3D variant="primary" fullWidth onPress={() => router.back()}>
            Got it · plan tomorrow
          </Button3D>
        </View>
        <View style={{ marginTop: 8 }}>
          <Button3D variant="ghost" fullWidth onPress={() => router.back()}>
            See streak rules
          </Button3D>
        </View>
      </Pressable>
    </Pressable>
  );
}

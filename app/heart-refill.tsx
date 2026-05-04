/**
 * Heart Refill Modal Screen
 *
 * Tasarım birebir (screens-extras.jsx HeartRefillModal):
 * - Dimmed bg + bottom sheet
 * - 5 empty heart SVGs (dashed stroke + last has check)
 * - "HEARTS DEPLETED · COOLDOWN ACTIVE" + "Tüm canların bitti."
 * - Cooldown text 23:42
 * - 3 option cards: Pro Pilot navy w/ gold radial · Practice green +1 · Coins gold 350¢
 * - "Wait it out · 23:42" ghost
 */
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import {
  Mono,
  FONTS,
  Button3D,
} from '@/components/airspeak';

export default function HeartRefillScreen() {
  const c = usePalette();
  const { t } = useTranslation();
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
          backgroundColor: c.bg,
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

        {/* Empty hearts row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
            marginVertical: 8,
            marginBottom: 16,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Svg key={i} width="40" height="36" viewBox="0 0 40 36" fill="none">
              <Path
                d="M20 32S4 22 4 13a8 8 0 0114-5 8 8 0 0114 5c0 9-12 19-12 19z"
                fill={i === 5 ? 'rgba(230,57,70,0.18)' : 'rgba(0,0,0,0.05)'}
                stroke="#B8BFCC"
                strokeWidth={1.5}
                strokeDasharray={i === 5 ? undefined : '3 3'}
              />
            </Svg>
          ))}
        </View>

        <Mono
          style={{
            fontSize: 10,
            color: '#FFD56B',
            letterSpacing: 1.8,
            textAlign: 'center',
          }}
        >
          {t('screens.modals.heartRefillEyebrow')}
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
          {t('screens.modals.heartRefillTitle')}
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
          {t('screens.modals.heartRefillBody', { time: '23:42' })}
        </Text>

        {/* Options */}
        <View style={{ gap: 10, marginTop: 18 }}>
          {/* Pro */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              router.back();
              router.push('/paywall');
            }}
            style={{
              backgroundColor: '#06091A',
              borderRadius: 14,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#FFD56B',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 22, color: '#0F1E47' }}>✦</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#FFFFFF' }}>
                {t('screens.modals.heartRefillPro')}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: FONTS.body,
                }}
              >
                {t('screens.modals.heartRefillProDesc')}
              </Text>
            </View>
            <Text style={{ fontSize: 18, color: '#FFFFFF' }}>›</Text>
          </TouchableOpacity>

          {/* Practice */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              router.back();
              router.push('/practice');
            }}
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              borderRadius: 14,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#DDF7E6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 22, color: '#2DBE6C' }}>🎙</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                {t('screens.modals.heartRefillPractice')}
              </Text>
              <Text style={{ fontSize: 12, color: '#8A93A6', fontFamily: FONTS.body }}>
                {t('screens.modals.heartRefillPracticeDesc')}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#DDF7E6',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Mono style={{ fontSize: 10, color: '#2DBE6C', letterSpacing: 0.9 }}>{t('screens.modals.heartRefillFree')}</Mono>
            </View>
          </TouchableOpacity>

          {/* Coins */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              borderRadius: 14,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#FFF3D6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 22, color: '#F2C14E' }}>🪙</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                {t('screens.modals.heartRefillCoins')}
              </Text>
              <Text style={{ fontSize: 12, color: '#8A93A6', fontFamily: FONTS.body }}>
                {t('screens.modals.heartRefillCoinsDesc', { coins: 340 })}
              </Text>
            </View>
            <Text style={{ fontFamily: FONTS.mono700, fontSize: 13, color: '#0E1116' }}>
              350 ¢
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 14 }}>
          <Button3D variant="ghost" fullWidth onPress={() => router.back()}>
            {t('screens.modals.heartRefillWait', { time: '23:42' })}
          </Button3D>
        </View>
      </Pressable>
    </Pressable>
  );
}

/**
 * Streak Freeze Modal — wallet-backed.
 *
 * - Inventory: useWallet().streak_freezes_inventory (DB realtime).
 * - "Apply" button: applyStreakFreeze() RPC — frozen_until = today + 1 gün.
 * - "Buy more": shop'a yönlendirir.
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Alert } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import {
  Mono,
  FONTS,
  Button3D,
} from '@/components/airspeak';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useWallet, applyStreakFreeze } from '@/features/wallet/api';

export default function StreakFreezeScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const { wallet } = useWallet(userId);
  const currentStreak = useGamificationStore((s) => s.currentStreak);
  const inventory = wallet?.streak_freezes_inventory ?? 0;
  const [applying, setApplying] = useState(false);
  const canApply = inventory > 0 && !applying;

  async function onApply() {
    if (!canApply) return;
    setApplying(true);
    const res = await applyStreakFreeze();
    setApplying(false);
    if (!res.ok) {
      Alert.alert(t('common.error', 'Hata'), res.error ?? t('common.tryAgain', 'Tekrar deneyin.'));
      return;
    }
    Alert.alert(
      t('screens.modals.streakFreezeAppliedTitle', '🧊 Streak korundu'),
      t('screens.modals.streakFreezeAppliedBody', 'Yarına kadar streak\'in donduruldu.'),
      [{ text: t('common.ok', 'Tamam'), onPress: () => router.back() }],
    );
  }

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
          {t('screens.modals.streakFreezeEyebrow', { streak: currentStreak })}
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
          {t('screens.modals.streakFreezeTitle')}
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
          {t('screens.modals.streakFreezeBody', { streak: currentStreak, remaining: inventory })}
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
                  backgroundColor: i <= inventory ? '#2EA8FF' : '#DCE0E8',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i <= inventory && (
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>❄</Text>
                )}
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0E1116' }}>
              {t('screens.modals.streakFreezeCount', { used: inventory, total: 3 })}
            </Text>
            <Text style={{ fontSize: 11, color: '#8A93A6', fontFamily: FONTS.body }}>
              {t('screens.modals.streakFreezeReset')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              router.back();
              setTimeout(() => router.push('/shop'), 200);
            }}
            style={{
              backgroundColor: '#FFD56B',
              paddingHorizontal: 12,
              height: 28,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Mono style={{ fontSize: 11, color: '#0A1430', letterSpacing: 0.99 }}>{t('screens.modals.streakFreezeBuy')}</Mono>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 16 }}>
          <Button3D
            variant="primary"
            fullWidth
            disabled={!canApply}
            onPress={onApply}
          >
            {applying
              ? t('screens.modals.streakFreezeApplying', 'Uygulanıyor…')
              : inventory > 0
                ? t('screens.modals.streakFreezeApply', 'Şimdi Kullan (1)')
                : t('screens.modals.streakFreezeOk')}
          </Button3D>
        </View>
        <View style={{ marginTop: 8 }}>
          <Button3D variant="ghost" fullWidth onPress={() => router.back()}>
            {t('screens.modals.streakFreezeRules')}
          </Button3D>
        </View>
      </Pressable>
    </Pressable>
  );
}

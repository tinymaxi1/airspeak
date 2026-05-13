/**
 * Heart Refill Modal Screen
 *
 * Sprint Freemium UX Polish — 3 fix:
 *   1. Live countdown (profiles.hearts_refill_at → her saniye delta)
 *   2. heart.max config-driven (eskiden hardcoded 5)
 *   3. Coin refill button çalışır (refill_heart_via_coins RPC)
 */
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Alert } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '@/stores/authStore';
import { useProfile } from '@/features/profile/useProfile';
import { useAppConfig } from '@/features/config/api';
import { supabase } from '@/lib/supabase';
import { useGamificationStore } from '@/stores/gamificationStore';
import {
  Mono,
  FONTS,
  Button3D,
} from '@/components/airspeak';

/** Verilen ISO tarihten şimdiye kadar kalan süre. */
function useCountdown(targetIso: string | null | undefined): {
  hours: number;
  minutes: number;
  totalMs: number;
  expired: boolean;
} {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!targetIso) return;
    const id = setInterval(() => setNow(Date.now()), 30_000); // her 30 sn (dakika granül)
    return () => clearInterval(id);
  }, [targetIso]);
  if (!targetIso) return { hours: 0, minutes: 0, totalMs: 0, expired: true };
  const target = new Date(targetIso).getTime();
  const totalMs = Math.max(0, target - now);
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  return { hours, minutes, totalMs, expired: totalMs <= 0 };
}

export default function HeartRefillScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { profile } = useProfile(user?.id);
  const cfg = useAppConfig();
  const coinsLocal = useGamificationStore((s) => s.coins ?? 0);

  // Config-driven max (default 2)
  const maxHearts = ((cfg as any)['heart.max'] as number) ?? 2;
  const refillCost = ((cfg as any)['heart.refill_cost_single'] as number) ?? 25;

  const heartsRefillAt = (profile as any)?.hearts_refill_at as string | null | undefined;
  const cd = useCountdown(heartsRefillAt);

  const countdownText = cd.expired
    ? t('heartRefill.refillReady', 'Şimdi yenilenebilir')
    : t('heartRefill.countdownLabel', {
        h: cd.hours,
        m: cd.minutes,
        defaultValue: '{{h}} saat {{m}} dk',
      });

  const [refillPending, setRefillPending] = useState(false);

  async function onCoinRefill() {
    if (coinsLocal < refillCost) {
      Alert.alert(
        t('heartRefill.insufficientTitle', 'Yeterli coin yok'),
        t('heartRefill.insufficientBody', { cost: refillCost, balance: coinsLocal,
          defaultValue: '{{cost}} coin gerekli, sende {{balance}} coin var.' }),
      );
      return;
    }
    setRefillPending(true);
    try {
      const { data, error } = await (supabase as any).rpc('refill_heart_via_coins');
      if (error || !data?.ok) {
        Alert.alert(
          t('heartRefill.failTitle', 'Hata'),
          data?.error ?? error?.message ?? t('heartRefill.failBody', 'Tekrar deneyin.'),
        );
        return;
      }
      // Local state sync
      useGamificationStore.setState({ hearts: data.hearts, coins: data.balance ?? coinsLocal - refillCost });
      router.back();
    } catch (e: any) {
      Alert.alert(t('heartRefill.failTitle', 'Hata'), e?.message ?? '?');
    } finally {
      setRefillPending(false);
    }
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

        {/* Empty hearts row — config max */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
            marginVertical: 8,
            marginBottom: 16,
          }}
        >
          {Array.from({ length: maxHearts }, (_, i) => i).map((i) => (
            <Svg key={i} width="40" height="36" viewBox="0 0 40 36" fill="none">
              <Path
                d="M20 32S4 22 4 13a8 8 0 0114-5 8 8 0 0114 5c0 9-12 19-12 19z"
                fill={i === maxHearts - 1 ? 'rgba(230,57,70,0.18)' : 'rgba(0,0,0,0.05)'}
                stroke="#B8BFCC"
                strokeWidth={1.5}
                strokeDasharray={i === maxHearts - 1 ? undefined : '3 3'}
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
          {t('screens.modals.heartRefillBody', { time: countdownText, defaultValue: 'Yeni kalp {{time}} sonra' })}
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

          {/* Coins — gerçek RPC */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={refillPending}
            onPress={onCoinRefill}
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: coinsLocal >= refillCost ? '#F2C14E' : '#DCE0E8',
              borderBottomWidth: coinsLocal >= refillCost ? 3 : 1.5,
              borderBottomColor: coinsLocal >= refillCost ? '#C49B2C' : '#DCE0E8',
              borderRadius: 14,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              opacity: refillPending ? 0.6 : 1,
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
                {t('heartRefill.coinBalance', { balance: coinsLocal, defaultValue: 'Bakiyen: {{balance}}' })}
              </Text>
            </View>
            <Text style={{ fontFamily: FONTS.mono700, fontSize: 13, color: '#0E1116' }}>
              {refillCost} ¢
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 14 }}>
          <Button3D variant="ghost" fullWidth onPress={() => router.back()}>
            {t('screens.modals.heartRefillWait', { time: countdownText, defaultValue: 'Bekle · {{time}}' })}
          </Button3D>
        </View>
      </Pressable>
    </Pressable>
  );
}

/**
 * StreakRiskBanner — akşam saatlerinde streak'i tehlikede olan kullanıcıya uyarı
 *
 * Faz 3.6 — Görünme koşulları:
 *  - currentStreak > 0 (streak var)
 *  - Saat ≥ HOUR_THRESHOLD (default 19:00)
 *  - lastActivityDate !== bugün (bugün lesson yapılmadı)
 *  - Aynı gün 1 kez kapatılabilir (sessionStorage ile dismiss)
 *
 * Tasarım: sarı uyarı kart, ateş emoji + countdown + CTA.
 */
import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useGamificationStore } from '@/stores/gamificationStore';
import { FONTS, Mono, Body } from '@/components/airspeak';
import { track } from '@/lib/posthog';

const HOUR_THRESHOLD = 19;

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Props {
  onPress: () => void;
}

export function StreakRiskBanner({ onPress }: Props) {
  const { t } = useTranslation();
  const currentStreak = useGamificationStore((s) => s.currentStreak ?? 0);
  const lastActivityDate = useGamificationStore((s) => s.lastActivityDate);
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = useMemo(() => {
    if (dismissed) return false;
    if (currentStreak < 1) return false;
    const now = new Date();
    if (now.getHours() < HOUR_THRESHOLD) return false;
    if (lastActivityDate === todayString()) return false;
    return true;
  }, [dismissed, currentStreak, lastActivityDate]);

  // Telemetri — şartlar sağlandığında bir kez emit
  useMemo(() => {
    if (shouldShow) {
      track('streak_risk_shown', { current_streak: currentStreak });
    }
  }, [shouldShow, currentStreak]);

  if (!shouldShow) return null;

  // Gece yarısına kalan saat
  const now = new Date();
  const hoursLeft = 23 - now.getHours();
  const minutesLeft = 60 - now.getMinutes();

  return (
    <View
      style={{
        backgroundColor: '#FFF7E0',
        borderWidth: 1.5,
        borderColor: '#F2C14E',
        borderBottomWidth: 4,
        borderBottomColor: '#D9A726',
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 32 }}>🔥</Text>
      <View style={{ flex: 1 }}>
        <Mono style={{ fontSize: 10, color: '#9C7A00', letterSpacing: 1.6 }}>
          {t('home.streakRisk.eyebrow', 'STREAK TEHLİKEDE')}
        </Mono>
        <Text
          style={{
            fontFamily: FONTS.body800,
            fontSize: 14,
            color: '#5C4400',
            marginTop: 3,
            lineHeight: 18,
          }}
        >
          {t('home.streakRisk.title', '{{n}} günlük serini kaybetme!', { n: currentStreak })}
        </Text>
        <Body color="#7A5C00" style={{ fontSize: 11, marginTop: 2 }}>
          {t('home.streakRisk.body', 'Gece yarısına {{h}}s {{m}}dk kaldı · 1 ders yeterli', {
            h: hoursLeft,
            m: minutesLeft,
          })}
        </Body>
      </View>
      <TouchableOpacity
        onPress={() => {
          track('streak_risk_cta_clicked', { current_streak: currentStreak });
          onPress();
        }}
        style={{
          backgroundColor: '#E63946',
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 999,
          borderBottomWidth: 3,
          borderBottomColor: '#C8202E',
        }}
      >
        <Text style={{ fontFamily: FONTS.body800, fontSize: 12, color: '#FFFFFF' }}>
          {t('home.streakRisk.cta', 'BAŞLA')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setDismissed(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={{ fontSize: 16, color: '#9C7A00', marginLeft: 4 }}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

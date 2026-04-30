/**
 * LimitedOfferBanner — aktif limited offer var ise göster.
 *
 * - Countdown ends_at'e kadar (her saniye update).
 * - Discount badge (%X) ya da tier override fiyat preview.
 * - Tap → showPaywall('limited_offer_seen') — paywall offer code ile açılır.
 * - banner_color özelleştirilebilir.
 *
 * `compact` modu daha kısa varyant (settings/onboarding'de kullan).
 */
import { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTopOffer } from '@/features/offers/api';
import { showPaywall } from '@/stores/paywallStore';
import { FONTS } from '@/components/airspeak';

interface Props {
  compact?: boolean;
  /** marginBottom override (default 14) */
  marginBottom?: number;
}

function fmtRemaining(endsAtIso: string): string {
  const ms = new Date(endsAtIso).getTime() - Date.now();
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}g ${hours}sa ${mins}dk`;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function LimitedOfferBanner({ compact, marginBottom = 14 }: Props) {
  const offer = useTopOffer();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!offer) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [offer]);

  if (!offer) return null;

  const remaining = fmtRemaining(offer.ends_at);
  if (remaining === '00:00:00') return null;

  const bg = offer.banner_color ?? '#E63946';
  const fg = '#FFFFFF';

  const headline = offer.discount_percent
    ? `🎁 %${offer.discount_percent} İNDİRİM`
    : '🎁 ÖZEL TEKLİF';

  // tick reference (lint silencer)
  void tick;

  if (compact) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => showPaywall('limited_offer_seen')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: bg,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 12,
          marginBottom,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: fg, flex: 1 }}>
          {headline} · {offer.title_tr}
        </Text>
        <Text
          style={{
            fontFamily: FONTS.mono700,
            fontSize: 11,
            color: fg,
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          {remaining}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => showPaywall('limited_offer_seen')}
      style={{
        backgroundColor: bg,
        borderRadius: 14,
        padding: 14,
        borderBottomWidth: 4,
        borderBottomColor: 'rgba(0,0,0,0.18)',
        marginBottom,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.22)',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.mono700,
              fontSize: 10,
              color: fg,
              letterSpacing: 1.2,
            }}
          >
            {headline}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: FONTS.mono700,
            fontSize: 11,
            color: fg,
            opacity: 0.9,
            marginLeft: 'auto' as any,
          }}
        >
          ⏱ {remaining}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: FONTS.body800,
          fontSize: 17,
          color: fg,
          marginTop: 8,
        }}
      >
        {offer.title_tr}
      </Text>
      {offer.body_tr ? (
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 4 }}>
          {offer.body_tr}
        </Text>
      ) : null}
      <View
        style={{
          marginTop: 10,
          alignSelf: 'flex-start',
          backgroundColor: 'rgba(255,255,255,0.2)',
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: fg }}>
          DETAY →
        </Text>
      </View>
    </TouchableOpacity>
  );
}

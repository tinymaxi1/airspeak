/**
 * LastChanceBanner — Pratik öncesi "son hak" / "limit doldu" uyarısı.
 *
 * remaining === 1 → sarı uyarı banner
 * remaining === 0 → kırmızı limit doldu + Premium CTA
 * remaining > 1   → null (göstermez)
 */
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { showPaywall } from '@/stores/paywallStore';
import { FONTS, Body, Mono } from '@/components/airspeak';

interface Props {
  used: number;
  limit: number;
  paywallReason: 'lesson_limit' | 'ai_limit' | 'readback_limit' | 'listen_solve_limit' | 'pronunciation_limit';
}

export function LastChanceBanner({ used, limit, paywallReason }: Props) {
  const { t } = useTranslation();
  const isPremium = useAuthStore((s) => s.isPremium);

  if (isPremium || limit < 0) return null;
  const remaining = Math.max(0, limit - used);
  if (remaining > 1) return null;

  if (remaining === 0) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => showPaywall(paywallReason as any)}
        style={{
          backgroundColor: '#FFE4E7',
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: '#E63946',
          borderBottomWidth: 4,
          borderBottomColor: '#C8202E',
          paddingHorizontal: 14,
          paddingVertical: 12,
          marginBottom: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 22 }}>🚫</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.body800, fontSize: 13, color: '#C8202E' }}>
            {t('practice.limitReached.title', 'Bugünkü hakkın doldu')}
          </Text>
          <Body color="#7A1D2A" style={{ fontSize: 11, marginTop: 2 }}>
            {t('practice.limitReached.body', 'Pro ile sınırsız erişim — tıkla')}
          </Body>
        </View>
        <Text style={{ fontSize: 18, color: '#C8202E' }}>›</Text>
      </TouchableOpacity>
    );
  }

  // remaining === 1
  return (
    <View
      style={{
        backgroundColor: '#FFF6E0',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#F2C14E',
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 20 }}>⚠️</Text>
      <View style={{ flex: 1 }}>
        <Mono style={{ fontSize: 10, color: '#8A6914', letterSpacing: 1.2 }}>
          {t('practice.lastChance.eyebrow', 'SON HAKKIN')}
        </Mono>
        <Body style={{ fontSize: 12, color: '#5A4A20', marginTop: 2 }}>
          {t('practice.lastChance.body', 'Bugün 1 hakkın kaldı. Kullandıktan sonra yarın yenilenir.')}
        </Body>
      </View>
    </View>
  );
}

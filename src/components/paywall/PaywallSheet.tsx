/**
 * Paywall Sheet — limit aşıldığında veya premium feature isteğinde açılır.
 *
 * Tüm metin ve fiyat admin'den okunan app_config'ten gelir.
 */
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppConfig } from '@/features/config/api';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Trigger sebebi — analytics için */
  reason?: 'lesson_limit' | 'ai_limit' | 'icao4_locked' | 'feature_locked' | 'manual';
}

export function PaywallSheet({ visible, onClose, reason: _reason }: Props) {
  const cfg = useAppConfig();
  const setPremium = useAuthStore((s) => s.setPremium);

  const tiers = [
    {
      id: 'monthly' as const,
      label: 'Aylık',
      price: cfg['paywall.monthly_price_try'],
      period: 'ay',
      badge: null,
    },
    {
      id: 'yearly' as const,
      label: 'Yıllık',
      price: cfg['paywall.yearly_price_try'],
      period: 'yıl',
      badge: `%${cfg['paywall.yearly_savings_percent']} TASARRUF`,
    },
    ...(cfg['paywall.show_lifetime']
      ? [
          {
            id: 'lifetime' as const,
            label: 'Lifetime',
            price: cfg['paywall.lifetime_price_try'],
            period: 'tek seferde',
            badge: '⭐ EN İYİSİ',
          },
        ]
      : []),
  ];

  const recommended = cfg['paywall.recommended_tier'];

  // TODO: gerçek IAP entegrasyonu (Apple/Google) - şimdilik mock
  const handlePurchase = (_tierId: 'monthly' | 'yearly' | 'lifetime') => {
    // Demo: 30g premium ver
    setPremium(true);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#0F1E47' }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8 }}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
            {/* HEADER */}
            <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 24 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: '#F2C14E',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 40 }}>👑</Text>
              </View>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  letterSpacing: -0.5,
                  lineHeight: 32,
                }}
              >
                {cfg['paywall.headline_tr']}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.7)',
                  textAlign: 'center',
                  marginTop: 8,
                }}
              >
                {cfg['paywall.subhead_tr']}
              </Text>
            </View>

            {/* BENEFITS */}
            <View style={{ marginBottom: 24, gap: 10 }}>
              {(cfg['paywall.benefits_tr'] ?? []).map((b, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#2DBE6C',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>✓</Text>
                  </View>
                  <Text style={{ color: '#FFFFFF', fontSize: 15, flex: 1 }}>{b}</Text>
                </View>
              ))}
            </View>

            {/* TIER CARDS */}
            <View style={{ gap: 10, marginBottom: 16 }}>
              {tiers.map((t) => {
                const isRecommended = t.id === recommended;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => handlePurchase(t.id)}
                    style={{
                      backgroundColor: isRecommended ? '#E63946' : 'rgba(255,255,255,0.08)',
                      borderRadius: 14,
                      padding: 16,
                      borderWidth: 2,
                      borderColor: isRecommended ? '#E63946' : 'rgba(255,255,255,0.18)',
                      borderBottomWidth: 4,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        {t.badge && (
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '700',
                              letterSpacing: 1.6,
                              color: isRecommended ? '#FFD56B' : '#F2C14E',
                              marginBottom: 4,
                            }}
                          >
                            {t.badge}
                          </Text>
                        )}
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>
                          {t.label}
                        </Text>
                        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                          / {t.period}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFFFFF' }}>
                          ₺{t.price}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* TRIAL */}
            <View
              style={{
                backgroundColor: 'rgba(45,190,108,0.18)',
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>
                ⏱ İlk {cfg['paywall.trial_days']} gün ücretsiz · istediğin zaman iptal
              </Text>
            </View>

            {/* TERMS */}
            <Text
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
                marginTop: 16,
                lineHeight: 16,
              }}
            >
              Otomatik yenilenir. Apple ID / Google hesabından iptal edebilirsin.{'\n'}
              Kullanım Koşulları · Gizlilik Politikası
            </Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

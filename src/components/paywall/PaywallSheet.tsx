/**
 * Paywall Sheet — limit aşıldığında veya premium feature isteğinde açılır.
 *
 * Tüm metin ve fiyat admin'den okunan app_config'ten gelir.
 */
import { Modal, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@/features/config/api';
import { useAuthStore } from '@/stores/authStore';
import { useTrialStatus, startTrial } from '@/features/trial/api';
import { useActiveCount24h } from '@/features/social/presence';
import { useTopOffer, useEffectivePricing, claimOffer } from '@/features/offers/api';
import { LimitedOfferBanner } from '@/components/offers/LimitedOfferBanner';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Trigger sebebi — analytics için */
  reason?: 'lesson_limit' | 'ai_limit' | 'readback_limit' | 'listen_solve_limit' | 'pronunciation_limit' | 'icao4_locked' | 'feature_locked' | 'manual';
}

export function PaywallSheet({ visible, onClose, reason }: Props) {
  const { t } = useTranslation();
  const cfg = useAppConfig();
  const setPremium = useAuthStore((s) => s.setPremium);
  const userId = useAuthStore((s) => s.user?.id);
  const trial = useTrialStatus(userId);
  const { count: activeCount } = useActiveCount24h();
  const offer = useTopOffer();
  const { pricing } = useEffectivePricing(offer?.code ?? null);

  // Effective fiyatlar: offer varsa override, yoksa app_config default
  const monthly = pricing?.monthly ?? Number(cfg['paywall.monthly_price_try'] ?? 0);
  const yearly = pricing?.yearly ?? Number(cfg['paywall.yearly_price_try'] ?? 0);
  const lifetime = pricing?.lifetime ?? Number(cfg['paywall.lifetime_price_try'] ?? 0);
  const monthlyDefault = pricing?.monthly_default ?? monthly;
  const yearlyDefault = pricing?.yearly_default ?? yearly;
  const lifetimeDefault = pricing?.lifetime_default ?? lifetime;

  const tiers = [
    {
      id: 'monthly' as const,
      label: 'Aylık',
      price: monthly,
      defaultPrice: monthlyDefault,
      period: 'ay',
      badge: null as string | null,
    },
    {
      id: 'yearly' as const,
      label: 'Yıllık',
      price: yearly,
      defaultPrice: yearlyDefault,
      period: 'yıl',
      badge: `%${cfg['paywall.yearly_savings_percent']} TASARRUF`,
    },
    ...(cfg['paywall.show_lifetime']
      ? [
          {
            id: 'lifetime' as const,
            label: 'Lifetime',
            price: lifetime,
            defaultPrice: lifetimeDefault,
            period: 'tek seferde',
            badge: '⭐ EN İYİSİ',
          },
        ]
      : []),
  ];

  const recommended = cfg['paywall.recommended_tier'];

  // Sprint 13.A.8 — sheet'ten satın alma yapılmaz; asıl paywall ekranına yönlendir.
  // Apple Guideline 3.1.1: tüm in-app satın alma StoreKit (RevenueCat) üzerinden olmalı.
  const handlePurchase = (_tierId: 'monthly' | 'yearly' | 'lifetime') => {
    if (offer?.code) void claimOffer(offer.code);
    onClose();
    // Modal kapandıktan sonra navigation
    setTimeout(() => router.push('/paywall'), 50);
  };

  // Trial backend-driven; mock gating yok — başarılı olursa server premium_until set eder,
  // _layout.tsx'teki syncPremiumFromIap zincirin bağlandığında hydrate olur.
  const handleStartTrial = async () => {
    const res = await startTrial();
    if (!res.ok) {
      Alert.alert(
        'Deneme başlatılamadı',
        res.error === 'already_used'
          ? 'Bu hesap için deneme zaten kullanıldı.'
          : res.error ?? 'Tekrar deneyin.',
      );
      return;
    }
    // Trial DB'de aktif edildi — local state'i sync et, kullanıcı app'i kullanmaya devam etsin
    setPremium(true);
    onClose();
  };

  const showSocialProof = (activeCount ?? 0) >= 100;

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
              {/* Reason-specific reason banner (lansman polish) */}
              {reason && reason !== 'manual' && (
                <View
                  style={{
                    backgroundColor: 'rgba(230,57,70,0.18)',
                    borderWidth: 1,
                    borderColor: 'rgba(230,57,70,0.5)',
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 10,
                    marginBottom: 14,
                  }}
                >
                  <Text style={{ fontSize: 13, color: '#FFFFFF', fontWeight: '600', textAlign: 'center' }}>
                    {t(`screens.paywall.reason.${reason}`, cfg['paywall.headline_tr'] ?? '')}
                  </Text>
                </View>
              )}
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

              {/* Social proof — son 24h aktif sayısı (>=100 ise) */}
              {showSocialProof && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: 'rgba(45,190,108,0.18)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    marginTop: 12,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#2DBE6C',
                    }}
                  />
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                    {activeCount?.toLocaleString('tr-TR')} pilot son 24 saatte aktif
                  </Text>
                </View>
              )}

              {/* Aktif trial — countdown */}
              {trial.isTrialing && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: 'rgba(255,213,107,0.22)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    marginTop: 12,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>⏱</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                    Deneme aktif — {trial.daysLeft} gün kaldı
                  </Text>
                </View>
              )}
            </View>

            {/* LIMITED OFFER BANNER — paywall içi (header altı) */}
            {offer && (
              <View style={{ marginBottom: 16 }}>
                <LimitedOfferBanner marginBottom={0} />
              </View>
            )}

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
                        {t.defaultPrice && t.defaultPrice > t.price && (
                          <Text
                            style={{
                              fontSize: 13,
                              color: 'rgba(255,255,255,0.55)',
                              textDecorationLine: 'line-through',
                              marginBottom: 2,
                            }}
                          >
                            ₺{t.defaultPrice}
                          </Text>
                        )}
                        <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFFFFF' }}>
                          ₺{t.price}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* TRIAL CTA — kullanılmadıysa primary buton, aktifse durum, kullanılmışsa hint */}
            {trial.canStartTrial && !trial.isTrialing && (
              <TouchableOpacity
                onPress={handleStartTrial}
                style={{
                  backgroundColor: '#2DBE6C',
                  borderRadius: 14,
                  padding: 14,
                  alignItems: 'center',
                  borderBottomWidth: 4,
                  borderBottomColor: '#1F8B4D',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
                  🎁 {cfg['paywall.trial_days']} gün ücretsiz dene
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 4 }}>
                  Otomatik aboneliğe çevirme yok · istediğin zaman iptal
                </Text>
              </TouchableOpacity>
            )}
            {trial.isTrialing && (
              <View
                style={{
                  backgroundColor: 'rgba(255,213,107,0.18)',
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>
                  ⏱ Deneme aktif — {trial.daysLeft} gün kaldı
                </Text>
              </View>
            )}
            {!trial.canStartTrial && !trial.isTrialing && (
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                  Deneme zaten kullanıldı
                </Text>
              </View>
            )}

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

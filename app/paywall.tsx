/**
 * Paywall Screen — Pro Pilot (cinematic gold-on-navy)
 *
 * Tasarım birebir (screens-other.jsx PaywallScreen):
 * - Navy-900 bg + gold radial glow
 * - PRO PILOT badge (gold border + crown)
 * - "Unlimited flight hours." (44px Space Grotesk + gold "flight hours")
 * - Feature comparison list (FREE / PRO columns, gold pro values)
 * - 3 plan cards (Annual selected w/ BEST VALUE, Monthly, Student)
 * - Sticky CTA "Start 7-day trial"
 */
import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { track } from '@/lib/posthog';
import {
  Hero,
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Button3D,
  TopoBackground,
} from '@/components/airspeak';

interface PlanData {
  id: 'annual' | 'monthly' | 'student';
  name: string;
  price: string;
  sub: string;
  badge?: string;
}

// PLANS — translation keys via plan id
const PLAN_IDS: PlanData['id'][] = ['annual', 'monthly', 'student'];

const FEATURE_KEYS = ['feat1', 'feat2', 'feat3', 'feat4', 'feat5', 'feat6'];
const FEATURE_HAS_FREE = [true, true, true, false, false, false];

export default function PaywallScreen() {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<PlanData['id']>('annual');

  const plans: PlanData[] = PLAN_IDS.map((id) => ({
    id,
    name: t(`screens.paywall.${id}`),
    price: t(`screens.paywall.${id}Price`),
    sub: t(`screens.paywall.${id}Sub`),
    badge: id === 'annual' ? t('screens.paywall.bestValue') : undefined,
  }));

  const handleSubscribe = () => {
    track('paywall_subscribe', { plan: selectedPlan });
    // TODO: RevenueCat purchase flow
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F1E47' }}>
      {/* Bg art */}
      <View style={{ position: 'absolute', inset: 0 }}>
        <TopoBackground />
        <Svg
          viewBox="0 0 393 850"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0 }}
        >
          <Defs>
            <RadialGradient id="paywallGlow" cx="50%" cy="22%" r="50%">
              <Stop offset="0%" stopColor="rgba(255,213,107,0.3)" />
              <Stop offset="100%" stopColor="rgba(255,213,107,0)" />
            </RadialGradient>
          </Defs>
          <Circle cx={196} cy={180} r={180} fill="url(#paywallGlow)" />
        </Svg>
      </View>

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Top bar */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)' }}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={{ fontFamily: FONTS.body600, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              {t('screens.paywall.restore')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        >
          {/* HERO */}
          <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(255,213,107,0.12)',
                borderWidth: 1,
                borderColor: '#FFD56B',
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 999,
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 14, color: '#FFD56B' }}>👑</Text>
              <Mono style={{ fontSize: 11, letterSpacing: 1.98, color: '#FFD56B' }}>
                {t('screens.paywall.badge')}
              </Mono>
            </View>

            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 44,
                fontWeight: '700',
                color: '#FFFFFF',
                lineHeight: 43,
                letterSpacing: -1.32,
                textAlign: 'center',
              }}
            >
              {t('screens.paywall.hero1')}{'\n'}
              <Text style={{ color: '#FFD56B' }}>{t('screens.paywall.hero2')}</Text>
            </Text>

            <Body
              color="rgba(255,255,255,0.7)"
              style={{
                fontSize: 14,
                maxWidth: 280,
                marginTop: 12,
                textAlign: 'center',
              }}
            >
              {t('screens.paywall.subtitle')}
            </Body>
          </View>

          {/* Feature comparison header */}
          <View
            style={{
              flexDirection: 'row',
              gap: 16,
              paddingHorizontal: 0,
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.18)',
            }}
          >
            <View style={{ flex: 1 }} />
            <View style={{ width: 56, alignItems: 'center' }}>
              <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.9 }}>
                {t('screens.paywall.free')}
              </Mono>
            </View>
            <View style={{ width: 56, alignItems: 'center' }}>
              <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 0.9 }}>
                {t('screens.paywall.pro')}
              </Mono>
            </View>
          </View>

          {/* Feature comparison rows */}
          <View style={{ marginBottom: 20 }}>
            {FEATURE_KEYS.map((fk, i) => {
              const hasFree = FEATURE_HAS_FREE[i];
              return (
                <View
                  key={fk}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    paddingVertical: 12,
                    borderBottomWidth: i < FEATURE_KEYS.length - 1 ? 1 : 0,
                    borderBottomColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text style={{ flex: 1, fontFamily: FONTS.body600, fontSize: 14, color: '#FFFFFF' }}>
                    {t(`screens.paywall.${fk}`)}
                  </Text>
                  <Text
                    style={{
                      width: 56,
                      textAlign: 'center',
                      fontFamily: FONTS.body,
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {hasFree ? t(`screens.paywall.${fk}Free`) : '—'}
                  </Text>
                  <Text
                    style={{
                      width: 56,
                      textAlign: 'center',
                      fontFamily: FONTS.body700,
                      fontSize: 13,
                      color: '#FFD56B',
                    }}
                  >
                    {hasFree ? t(`screens.paywall.${fk}Pro`) : '✓'}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Plans */}
          <View style={{ gap: 10, marginBottom: 16 }}>
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={selectedPlan === p.id}
                onPress={() => setSelectedPlan(p.id)}
              />
            ))}
          </View>

          {/* Disclaimer */}
          <Body
            color="rgba(255,255,255,0.4)"
            style={{ fontSize: 11, textAlign: 'center', marginBottom: 8 }}
          >
            {t('screens.paywall.disclaimer')}
          </Body>
        </ScrollView>

        {/* Sticky CTA */}
        <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}>
          <View style={{ padding: 16 }}>
            <Button3D
              variant="primary"
              fullWidth
              onPress={handleSubscribe}
              style={{ backgroundColor: '#FFD56B', borderBottomColor: '#F2C14E' }}
              textStyle={{ color: '#0A1430' }}
            >
              {t('screens.paywall.cta')}
            </Button3D>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </View>
  );
}

function PlanCard({
  plan,
  selected,
  onPress,
}: {
  plan: PlanData;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: selected ? 'rgba(255,213,107,0.12)' : 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        borderWidth: selected ? 2 : 1.5,
        borderColor: selected ? '#FFD56B' : 'rgba(255,255,255,0.18)',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        position: 'relative',
      }}
    >
      {plan.badge && (
        <View
          style={{
            position: 'absolute',
            top: -10,
            right: 12,
            backgroundColor: '#FFD56B',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Mono style={{ fontSize: 9, color: '#0A1430', letterSpacing: 0.81 }}>{plan.badge}</Mono>
        </View>
      )}

      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: selected ? '#FFD56B' : 'rgba(255,255,255,0.4)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFD56B' }} />}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: FONTS.body800,
            fontSize: 17,
            color: '#FFFFFF',
          }}
        >
          {plan.name}
        </Text>
        <Body color="rgba(255,255,255,0.6)" style={{ fontSize: 12, marginTop: 2 }}>
          {plan.sub}
        </Body>
      </View>

      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 20,
          fontWeight: '700',
          color: selected ? '#FFD56B' : '#FFFFFF',
          letterSpacing: -0.4,
        }}
      >
        {plan.price}
      </Text>
    </TouchableOpacity>
  );
}

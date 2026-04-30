/**
 * ICAO 4 Yazılı Sınav — Set Seçimi (3 set kart).
 *
 * Set 1 free, Set 2-3 premium (config-driven, app_config'ten).
 * LockedCard pattern: kilitli setler blur + kilit ikonu, tap → paywall.
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ChevronLeft, GraduationCap } from 'lucide-react-native';
import { Body, FONTS, Mono } from '@/components/airspeak';
import { LockedCard } from '@/components/paywall/LockedCard';
import { useIcao4SetAccess } from '@/features/config/limits';
import { showPaywall } from '@/stores/paywallStore';

const SETS = [
  {
    setNo: 1 as const,
    title: 'Set 1 — Foundational',
    description: 'B1-B2 seviye · 50 soru · vocab + phraseology + listening + reading',
    color: '#1F8B4D',
  },
  {
    setNo: 2 as const,
    title: 'Set 2 — Intermediate',
    description: 'B2 seviye · 50 soru · ATC iletişim + acil durum',
    color: '#1F4FB6',
  },
  {
    setNo: 3 as const,
    title: 'Set 3 — Advanced',
    description: 'B2+ seviye · 50 soru · NOTAM + METAR + complex scenarios',
    color: '#7C5CFF',
  },
];

export default function Icao4SetsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0F1E47' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#0F1E47',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <GraduationCap size={22} color="#F2C14E" />
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
              ICAO 4 YAZILI SINAV
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 22,
                color: '#FFFFFF',
                fontWeight: '700',
                marginTop: 2,
              }}
            >
              Set Seç
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Body color="#5A6478" style={{ fontSize: 13, marginBottom: 16, lineHeight: 19 }}>
          3 set × 50 soru — gerçek sınav öncesi kapsamlı pratik. Set 1 ücretsiz,
          Set 2 ve 3 Pro üyelerin.
        </Body>

        {SETS.map((s, i) => (
          <SetCard key={s.setNo} set={s} delay={i * 60} />
        ))}
      </ScrollView>
    </View>
  );
}

function SetCard({
  set,
  delay,
}: {
  set: (typeof SETS)[number];
  delay: number;
}) {
  const access = useIcao4SetAccess(set.setNo);
  const isLocked = !access.allowed;

  function onPress() {
    if (isLocked) {
      showPaywall('icao_oral_first_task_done');
      return;
    }
    router.push(`/exam/icao4-briefing?set=${set.setNo}` as any);
  }

  const card = (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: set.color,
        padding: 16,
        gap: 8,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: `${set.color}20`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22, fontFamily: FONTS.display, fontWeight: '700', color: set.color }}>
            {set.setNo}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: FONTS.body700,
              fontSize: 16,
              color: '#0E1116',
            }}
          >
            {set.title}
          </Text>
          <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }}>
            {set.description}
          </Body>
        </View>
      </View>
    </View>
  );

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(280)}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <LockedCard
          locked={isLocked}
          variant="crown"
          message={`Set ${set.setNo} Pro ile`}
          borderRadius={14}
          onPress={onPress}
        >
          {card}
        </LockedCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Havayolu Mülakat Hub — bölge filtresi + role bazlı listeleme.
 *
 * Pilot/Cabin/Technician/Ground/Student kullanıcı kendi rolüne uygun
 * havayollarını görür. Bölge filtresi: TR / Orta Doğu / Avrupa FSC / Avrupa LCC.
 */
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Text, Button } from 'tamagui';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  getAirlinesByRegion,
  AIRLINE_REGION_LABELS,
} from '@/features/exams/airlines';
import type { AirlineProfile, AirlineRegion } from '@/features/exams/airlineTypes';

const REGION_FILTERS: { id: AirlineRegion | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Tümü', emoji: '🌍' },
  { id: 'turkey', label: 'TR', emoji: '🇹🇷' },
  { id: 'middle-east', label: 'Orta Doğu', emoji: '🕌' },
  { id: 'europe-fsc', label: 'Avrupa FSC', emoji: '🏛️' },
  { id: 'europe-lcc', label: 'Avrupa LCC', emoji: '💸' },
];

export default function AirlinesHubScreen() {
  const role = useOnboardingStore((s) => s.role);
  const [activeFilter, setActiveFilter] = useState<AirlineRegion | 'all'>('all');

  const groups = getAirlinesByRegion(role);
  const visibleRegions =
    activeFilter === 'all'
      ? (Object.keys(groups) as AirlineRegion[])
      : ([activeFilter] as AirlineRegion[]);

  const totalCount = Object.values(groups).reduce(
    (sum, arr) => sum + (arr?.length ?? 0),
    0,
  );

  if (!role) {
    return (
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background" justifyContent="center">
        <Text fontSize={64} textAlign="center">✈️</Text>
        <H2 color="$text" textAlign="center">Önce rol seç</H2>
        <Paragraph color="$textSecondary" textAlign="center">
          Sana uygun havayollarını görmek için profilinden rol seç.
        </Paragraph>
        <Button onPress={() => router.push('/(tabs)/profile')}>Profile git</Button>
      </YStack>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <YStack gap="$1">
          <H2 color="$text">Havayolu Mülakatları</H2>
          <Paragraph color="$textSecondary">
            {totalCount} havayolu · Pilot/Kabin mülakat süreçleri + soru bankası
          </Paragraph>
        </YStack>

        {/* Bölge filtresi pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" paddingVertical="$1">
            {REGION_FILTERS.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <Card
                  key={f.id}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  backgroundColor={isActive ? '$primary' : '$surface'}
                  borderColor={isActive ? '$primary' : '$border'}
                  bordered
                  onPress={() => setActiveFilter(f.id)}
                  pressStyle={{ scale: 0.98 }}
                >
                  <XStack gap="$1" alignItems="center">
                    <Text fontSize={16}>{f.emoji}</Text>
                    <Text
                      fontSize="$3"
                      fontWeight="600"
                      color={isActive ? '$primaryText' : '$text'}
                    >
                      {f.label}
                    </Text>
                  </XStack>
                </Card>
              );
            })}
          </XStack>
        </ScrollView>

        {visibleRegions.map((region) => {
          const airlines = groups[region];
          if (!airlines || airlines.length === 0) return null;
          const label = AIRLINE_REGION_LABELS[region];

          return (
            <YStack key={region} gap="$2">
              <XStack gap="$2" alignItems="center">
                <Text fontSize="$6">{label.emoji}</Text>
                <H3 color="$text">{label.tr}</H3>
                <Card backgroundColor="$backgroundHover" paddingHorizontal="$2" paddingVertical="$1">
                  <Text fontSize="$1" color="$textSecondary">
                    {airlines.length}
                  </Text>
                </Card>
              </XStack>
              {airlines.map((a) => (
                <AirlineCard key={a.id} airline={a} userRole={role} />
              ))}
            </YStack>
          );
        })}
      </YStack>
    </ScrollView>
  );
}

function AirlineCard({ airline, userRole }: { airline: AirlineProfile; userRole: string }) {
  const interview = airline.interviews.find((i) => i.role === userRole);
  if (!interview) return null;

  const handlePress = () => {
    router.push({ pathname: '/exam/airline/[id]', params: { id: airline.id } });
  };

  const stars = '★'.repeat(airline.prestige) + '☆'.repeat(5 - airline.prestige);

  const hiringBadge = {
    open: { text: '✅ Aktif alım', color: '$success' as const },
    closed: { text: '⏸️ Şu an kapalı', color: '$textSecondary' as const },
    open_day_only: { text: '📅 Open Day', color: '$warning' as const },
    experienced_only: { text: '🎯 Tecrübeli', color: '$accent' as const },
  }[interview.hiringStatus];

  return (
    <Card
      padding="$4"
      backgroundColor="$surface"
      bordered
      onPress={handlePress}
      pressStyle={{ scale: 0.98 }}
    >
      <YStack gap="$2">
        <XStack gap="$2" alignItems="center">
          <Text fontSize={28}>{airline.countryEmoji}</Text>
          <YStack flex={1}>
            <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
              {airline.iataCode} · {airline.tier.toUpperCase()}
            </Text>
            <Text fontSize="$5" fontWeight="700" color="$text">
              {airline.name}
            </Text>
            <Text fontSize="$2" color="$textSecondary">
              {airline.hub}
            </Text>
          </YStack>
          <YStack alignItems="flex-end" gap="$1">
            <Text fontSize="$2" color={hiringBadge.color}>
              {hiringBadge.text}
            </Text>
            <Text fontSize="$1" color="$accent">
              {stars}
            </Text>
          </YStack>
        </XStack>

        <XStack gap="$2" flexWrap="wrap">
          <InfoChip label={`${airline.fleetSize} uçak`} />
          <InfoChip label={`${airline.destinations} dest.`} />
          <InfoChip label={`Min ${interview.requiredLevel}`} />
          <InfoChip label={`%${interview.englishWeight} EN`} />
          {interview.averageSalaryTryK && (
            <InfoChip label={`~₺${interview.averageSalaryTryK}K/ay`} />
          )}
        </XStack>

        <YStack gap="$1">
          <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
            Mülakat aşamaları ({interview.stages.length})
          </Text>
          {interview.stages.slice(0, 3).map((s, idx) => (
            <Text key={s.id} fontSize="$2" color="$text">
              {idx + 1}. {s.titleTr} · {s.durationMinutes} dk
            </Text>
          ))}
          {interview.stages.length > 3 && (
            <Text fontSize="$2" color="$textSecondary">
              + {interview.stages.length - 3} aşama daha
            </Text>
          )}
        </YStack>

        <Paragraph fontSize="$2" color="$textSecondary" fontStyle="italic">
          💡 {airline.insiderTipTr}
        </Paragraph>

        <Button
          size="$4"
          backgroundColor="$primary"
          color="$primaryText"
          marginTop="$1"
        >
          Detay + Mock Interview →
        </Button>
      </YStack>
    </Card>
  );
}

function InfoChip({ label }: { label: string }) {
  return (
    <Card paddingHorizontal="$2" paddingVertical="$1" backgroundColor="$backgroundHover">
      <Text fontSize="$1" color="$textSecondary">
        {label}
      </Text>
    </Card>
  );
}

/**
 * Havayolu Mülakatları — AirSpeak design + role-aware + premium gate.
 *
 * Mantık:
 * - Kullanıcı kendi rolüne uygun mülakatları FREE görür ve tıklar.
 * - Diğer rollerin mülakatları PREMIUM kilitli — paywall'a yönlendirir.
 * - Tech/ground/student rolünde kendi rolüne özel havayolu seed'i henüz yoksa,
 *   pilot/cabin mülakatları "öğretici örnek" olarak premium altında gösterilir.
 *
 * Bölge filtresi: Tümü / TR / Orta Doğu / Avrupa FSC / Avrupa LCC / Asya.
 */
import { useMemo, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { ALL_AIRLINES, AIRLINE_REGION_LABELS } from '@/features/exams/airlines';
import type { AirlineProfile, AirlineRegion } from '@/features/exams/airlineTypes';
import type { UserRole } from '@/types/profile';
import {
  HHero,
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Card3D,
} from '@/components/airspeak';

const REGION_FILTERS: { id: AirlineRegion | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Tümü', emoji: '🌍' },
  { id: 'turkey', label: 'TR', emoji: '🇹🇷' },
  { id: 'middle-east', label: 'Orta Doğu', emoji: '🕌' },
  { id: 'europe-fsc', label: 'Avrupa FSC', emoji: '🏛️' },
  { id: 'europe-lcc', label: 'Avrupa LCC', emoji: '💸' },
  { id: 'asia', label: 'Asya', emoji: '🏯' },
];

const ROLE_LABELS: Record<UserRole, string> = {
  pilot: 'Pilot',
  cabin: 'Kabin',
  technician: 'Teknisyen',
  ground: 'Yer Hizmetleri',
  student: 'Öğrenci',
};

export default function AirlinesHubScreen() {
  const role = useOnboardingStore((s) => s.role) as UserRole | null;
  const isPremium = useAuthStore((s) => s.isPremium);
  const [activeFilter, setActiveFilter] = useState<AirlineRegion | 'all'>('all');

  // Bölgeye göre filtrele (her havayolu kullanıcının rolüyle eşleşmiyorsa kilitli görünür)
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return ALL_AIRLINES;
    return ALL_AIRLINES.filter((a) => a.region === activeFilter);
  }, [activeFilter]);

  // Kullanıcı rolü için interview olan havayolları (free) vs olmayan (premium)
  const split = useMemo(() => {
    const own: AirlineProfile[] = [];
    const others: AirlineProfile[] = [];
    for (const a of filtered) {
      const hasOwnRole = role && a.interviews.some((i) => i.role === role);
      if (hasOwnRole) own.push(a);
      else others.push(a);
    }
    return { own, others };
  }, [filtered, role]);

  // Bölgeye göre grupla (own + others ayrı)
  const ownByRegion = useMemo(() => groupByRegion(split.own), [split.own]);
  const othersByRegion = useMemo(() => groupByRegion(split.others), [split.others]);

  if (!role) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFAF7', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 16 }}>✈️</Text>
        <HHero style={{ textAlign: 'center', marginBottom: 8 }}>Önce rol seç</HHero>
        <Body color="#5A6478" style={{ textAlign: 'center', fontSize: 15 }}>
          Sana uygun havayollarını görmek için profilinden rol seç.
        </Body>
      </View>
    );
  }

  const ownTotalCount = split.own.length;
  const lockedCount = split.others.length;
  const roleLabel = ROLE_LABELS[role];

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <SafeAreaView edges={['top']}>
          <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ marginBottom: 8, alignSelf: 'flex-start' }}
              accessibilityRole="button"
              accessibilityLabel="Geri"
            >
              <Text style={{ fontSize: 26, color: '#0E1116' }}>←</Text>
            </TouchableOpacity>
            <Eyebrow>HAVAYOLU MÜLAKATLARI</Eyebrow>
            <HHero style={{ marginTop: 6, marginBottom: 4 }}>Mülakat hub'ı</HHero>
            <Body color="#5A6478" style={{ fontSize: 14, lineHeight: 20 }}>
              {ownTotalCount > 0
                ? `${ownTotalCount} havayolu sana uygun · ${roleLabel} mülakat süreçleri ve soru bankası.`
                : `${roleLabel} rolü için seed henüz hazır değil. Pilot ve kabin örneklerini premium ile inceleyebilirsin.`}
            </Body>
          </View>
        </SafeAreaView>

        {/* Region pills — fixed height, horizontal scroll */}
        <View style={{ height: 44, marginBottom: 12 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
          >
            {REGION_FILTERS.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  activeOpacity={0.85}
                  onPress={() => setActiveFilter(f.id)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: isActive ? '#0F1E47' : '#FFFFFF',
                    borderWidth: 1.5,
                    borderColor: isActive ? '#0F1E47' : '#DCE0E8',
                    borderRadius: 999,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{f.emoji}</Text>
                  <Text
                    style={{
                      fontFamily: FONTS.body700,
                      fontSize: 13,
                      color: isActive ? '#FFFFFF' : '#0E1116',
                    }}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* OWN ROLE airlines (free) */}
        <View style={{ paddingHorizontal: 16 }}>
          {Object.keys(ownByRegion).length === 0 && split.own.length === 0 && (
            <View
              style={{
                backgroundColor: '#FFF5E1',
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: '#F2C14E',
                padding: 16,
                marginBottom: 18,
                flexDirection: 'row',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <Text style={{ fontSize: 28 }}>📋</Text>
              <View style={{ flex: 1 }}>
                <Mono style={{ fontSize: 10, letterSpacing: 1.4, color: '#7A6010' }}>
                  HAZIRLIKTA
                </Mono>
                <Text
                  style={{
                    fontFamily: FONTS.body800,
                    fontSize: 14,
                    color: '#0E1116',
                    marginTop: 4,
                  }}
                >
                  {roleLabel} için doğrudan mülakat seed'i yakında.
                </Text>
                <Body color="#5A6478" style={{ fontSize: 12, marginTop: 4, lineHeight: 17 }}>
                  Şimdilik aşağıda pilot ve kabin mülakatlarını öğretici örnek olarak premium ile
                  açabilirsin — havacılık İngilizcesi pratiği için bire bir uyum.
                </Body>
              </View>
            </View>
          )}

          {(Object.keys(ownByRegion) as AirlineRegion[]).map((region) => {
            const list = ownByRegion[region];
            if (!list || list.length === 0) return null;
            const label = AIRLINE_REGION_LABELS[region];
            return (
              <View key={`own-${region}`} style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 18 }}>{label.emoji}</Text>
                  <Text
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 18,
                      fontWeight: '700',
                      color: '#0E1116',
                      flex: 1,
                    }}
                  >
                    {label.tr}
                  </Text>
                  <View
                    style={{
                      backgroundColor: '#EDEFF3',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                    }}
                  >
                    <Mono style={{ fontSize: 11, color: '#5A6478' }}>{list.length}</Mono>
                  </View>
                </View>
                <View style={{ gap: 10 }}>
                  {list.map((a) => (
                    <AirlineCard key={a.id} airline={a} userRole={role} locked={false} />
                  ))}
                </View>
              </View>
            );
          })}

          {/* OTHER ROLES — premium gated */}
          {lockedCount > 0 && (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 8,
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 18 }}>🔒</Text>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 18,
                    fontWeight: '700',
                    color: '#0E1116',
                    flex: 1,
                  }}
                >
                  Diğer roller {isPremium ? '' : '· PRO'}
                </Text>
                <View
                  style={{
                    backgroundColor: '#EDEFF3',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 999,
                  }}
                >
                  <Mono style={{ fontSize: 11, color: '#5A6478' }}>{lockedCount}</Mono>
                </View>
              </View>
              {!isPremium && (
                <Body color="#5A6478" style={{ fontSize: 12, marginBottom: 12 }}>
                  Pilot/kabin/teknisyen tüm mülakat süreçlerini gör — havacılık İngilizcesini her
                  açıdan pratik et.
                </Body>
              )}
              {(Object.keys(othersByRegion) as AirlineRegion[]).map((region) => {
                const list = othersByRegion[region];
                if (!list || list.length === 0) return null;
                const label = AIRLINE_REGION_LABELS[region];
                return (
                  <View key={`other-${region}`} style={{ marginBottom: 18 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Text style={{ fontSize: 16, opacity: 0.6 }}>{label.emoji}</Text>
                      <Text
                        style={{
                          fontFamily: FONTS.body700,
                          fontSize: 14,
                          color: '#5A6478',
                          flex: 1,
                        }}
                      >
                        {label.tr}
                      </Text>
                    </View>
                    <View style={{ gap: 10 }}>
                      {list.map((a) => (
                        <AirlineCard
                          key={a.id}
                          airline={a}
                          userRole={role}
                          locked={!isPremium}
                        />
                      ))}
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// AIRLINE CARD
// ═══════════════════════════════════════════════════════════════

function AirlineCard({
  airline,
  userRole,
  locked,
}: {
  airline: AirlineProfile;
  userRole: UserRole;
  locked: boolean;
}) {
  // Kart kullanıcının rolüne uygun interview varsa onu kullan; yoksa ilk interview (genelde pilot)
  const interview =
    airline.interviews.find((i) => i.role === userRole) ?? airline.interviews[0];
  if (!interview) return null;

  const handlePress = () => {
    if (locked) {
      router.push('/paywall');
      return;
    }
    router.push({ pathname: '/exam/airline/[id]', params: { id: airline.id } });
  };

  const stars = '★'.repeat(airline.prestige) + '☆'.repeat(5 - airline.prestige);
  const hiringBadge = {
    open: { text: '✅ Aktif alım', color: '#2DBE6C' },
    closed: { text: '⏸️ Kapalı', color: '#8A93A6' },
    open_day_only: { text: '📅 Open Day', color: '#F2C14E' },
    experienced_only: { text: '🎯 Tecrübeli', color: '#7C5CFF' },
  }[interview.hiringStatus];

  const interviewRoleLabel =
    interview.role === userRole ? null : ROLE_LABELS[interview.role];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${airline.name} ${locked ? 'kilitli' : ''}`}
    >
      <Card3D style={{ padding: 14, opacity: locked ? 0.7 : 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 32 }}>{airline.countryEmoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Mono style={{ fontSize: 10, letterSpacing: 1.4, color: '#5A6478' }}>
                {airline.iataCode} · {airline.tier.toUpperCase()}
              </Mono>
              {interviewRoleLabel && (
                <View
                  style={{
                    backgroundColor: '#EDEFF3',
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    borderRadius: 4,
                  }}
                >
                  <Mono style={{ fontSize: 9, color: '#5A6478' }}>
                    {interviewRoleLabel.toUpperCase()}
                  </Mono>
                </View>
              )}
            </View>
            <Text
              style={{
                fontFamily: FONTS.body800,
                fontSize: 16,
                color: '#0E1116',
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {airline.name}
            </Text>
            <Body color="#5A6478" style={{ fontSize: 12, marginTop: 1 }} numberOfLines={1}>
              {airline.hub}
            </Body>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            {locked ? (
              <View
                style={{
                  backgroundColor: '#0F1E47',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 10, color: '#FFD56B' }}>🔒</Text>
                <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.2 }}>PRO</Mono>
              </View>
            ) : (
              <Text style={{ fontSize: 11, color: hiringBadge.color }}>{hiringBadge.text}</Text>
            )}
            <Text style={{ fontSize: 10, color: '#F2C14E' }}>{stars}</Text>
          </View>
        </View>

        {/* Bottom strip: chips + stages summary (only when unlocked) */}
        {!locked && (
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              <Chip text={`${airline.fleetSize} uçak`} />
              <Chip text={`Min ${interview.requiredLevel}`} />
              <Chip text={`%${interview.englishWeight} EN`} />
              {interview.averageSalaryTryK ? (
                <Chip text={`~₺${interview.averageSalaryTryK}K/ay`} />
              ) : null}
            </View>
            <View style={{ marginTop: 8, gap: 2 }}>
              <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.4 }}>
                {interview.stages.length} AŞAMA
              </Mono>
              {interview.stages.slice(0, 2).map((s, idx) => (
                <Body key={s.id} color="#0E1116" style={{ fontSize: 12 }}>
                  {idx + 1}. {s.titleTr} · {s.durationMinutes} dk
                </Body>
              ))}
              {interview.stages.length > 2 && (
                <Mono style={{ fontSize: 11, color: '#8A93A6' }}>
                  + {interview.stages.length - 2} aşama daha
                </Mono>
              )}
            </View>
          </View>
        )}

        {locked && (
          <Body color="#5A6478" style={{ fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
            🔓 Pro ile {ROLE_LABELS[interview.role]} mülakat sürecini aç
          </Body>
        )}
      </Card3D>
    </TouchableOpacity>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <View
      style={{
        backgroundColor: '#EDEFF3',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
      }}
    >
      <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 0.4 }}>{text}</Mono>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function groupByRegion(list: AirlineProfile[]): Partial<Record<AirlineRegion, AirlineProfile[]>> {
  const groups: Partial<Record<AirlineRegion, AirlineProfile[]>> = {};
  for (const a of list) {
    if (!groups[a.region]) groups[a.region] = [];
    groups[a.region]!.push(a);
  }
  return groups;
}

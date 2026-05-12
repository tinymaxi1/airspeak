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
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { useAirlines } from '@/features/content/api';
import type { AirlineRow, AirlineInterview } from '@/features/content/types';
import type { UserRole } from '@/types/profile';

type AirlineRegion = 'turkey' | 'middle-east' | 'europe-fsc' | 'europe-lcc' | 'asia' | 'americas' | 'oceania' | 'africa';

const AIRLINE_REGION_LABELS: Record<AirlineRegion, { tr: string; emoji: string }> = {
  turkey: { tr: 'Türkiye', emoji: '🇹🇷' },
  'middle-east': { tr: 'Orta Doğu', emoji: '🕌' },
  'europe-fsc': { tr: 'Avrupa — Bayrak', emoji: '🏛️' },
  'europe-lcc': { tr: 'Avrupa — LCC', emoji: '💸' },
  asia: { tr: 'Asya', emoji: '🏯' },
  americas: { tr: 'Amerika', emoji: '🗽' },
  oceania: { tr: 'Okyanusya', emoji: '🦘' },
  africa: { tr: 'Afrika', emoji: '🦁' },
};

/** DB row'undan kullanıcının rolüne ait interview'i çek. */
function getRoleInterview(a: AirlineRow, role: UserRole | null): AirlineInterview | null {
  if (!role) return null;
  switch (role) {
    case 'pilot': return a.pilot_interview;
    case 'atc': return a.pilot_interview;
    case 'cabin': return a.cabin_interview;
    case 'technician': return a.technician_interview;
    case 'ground': return a.ground_interview;
    case 'student': return a.student_interview;
  }
}

/** Kart için kullanılacak interview — rol uygun yoksa pilot/cabin'a düş. */
function getDisplayInterview(a: AirlineRow, role: UserRole | null): { interview: AirlineInterview; role: UserRole } | null {
  const own = getRoleInterview(a, role);
  if (own) return { interview: own, role: role! };
  if (a.pilot_interview) return { interview: a.pilot_interview, role: 'pilot' };
  if (a.cabin_interview) return { interview: a.cabin_interview, role: 'cabin' };
  return null;
}
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
  atc: 'Hava Trafik Kontrolör',
  cabin: 'Kabin',
  technician: 'Teknisyen',
  ground: 'Yer Hizmetleri',
  student: 'Öğrenci',
};

export default function AirlinesHubScreen() {
  const c = usePalette();
  const role = useOnboardingStore((s) => s.role) as UserRole | null;
  const isPremium = useAuthStore((s) => s.isPremium);
  const [activeFilter, setActiveFilter] = useState<AirlineRegion | 'all'>('all');

  // DB'den havayollarını çek
  const { data: allAirlines = [], isLoading } = useAirlines();

  // Bölgeye göre filtrele
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return allAirlines;
    return allAirlines.filter((a) => a.region === activeFilter);
  }, [allAirlines, activeFilter]);

  // Kullanıcı rolü için interview olan havayolları (free) vs olmayan (premium)
  const split = useMemo(() => {
    const own: AirlineRow[] = [];
    const others: AirlineRow[] = [];
    for (const a of filtered) {
      const hasOwnRole = !!getRoleInterview(a, role);
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
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 16 }}>✈️</Text>
        <HHero style={{ textAlign: 'center', marginBottom: 8 }}>Önce rol seç</HHero>
        <Body color="#5A6478" style={{ textAlign: 'center', fontSize: 15 }}>
          Sana uygun havayollarını görmek için profilinden rol seç.
        </Body>
      </View>
    );
  }

  if (isLoading && allAirlines.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E63946" />
        <Text style={{ marginTop: 12, color: '#5A6478' }}>Havayolları yükleniyor…</Text>
      </View>
    );
  }

  const ownTotalCount = split.own.length;
  const lockedCount = split.others.length;
  const roleLabel = ROLE_LABELS[role];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
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
  airline: AirlineRow;
  userRole: UserRole;
  locked: boolean;
}) {
  // Kart kullanıcının rolüne uygun interview varsa onu kullan; yoksa ilk available
  const display = getDisplayInterview(airline, userRole);
  if (!display) return null;
  const { interview, role: shownRole } = display;

  const handlePress = () => {
    if (locked) {
      router.push('/paywall');
      return;
    }
    router.push({ pathname: '/exam/airline/[id]', params: { id: airline.slug } });
  };

  const prestige = airline.prestige ?? 3;
  const stars = '★'.repeat(prestige) + '☆'.repeat(5 - prestige);
  const hiringBadge: { text: string; color: string } = {
    open: { text: '✅ Aktif alım', color: '#2DBE6C' },
    closed: { text: '⏸️ Kapalı', color: '#8A93A6' },
    open_day_only: { text: '📅 Open Day', color: '#F2C14E' },
    experienced_only: { text: '🎯 Tecrübeli', color: '#7C5CFF' },
  }[interview.hiringStatus ?? 'closed'] ?? { text: '⏸️ Kapalı', color: '#8A93A6' };

  const interviewRoleLabel = shownRole === userRole ? null : ROLE_LABELS[shownRole];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${airline.name} ${locked ? 'kilitli' : ''}`}
    >
      <Card3D style={{ padding: 14, opacity: locked ? 0.7 : 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 32 }}>{airline.country_emoji ?? '🌍'}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Mono style={{ fontSize: 10, letterSpacing: 1.4, color: '#5A6478' }}>
                {airline.iata_code ?? '—'} · {(airline.tier ?? '').toUpperCase()}
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
              {airline.hub ?? '—'}
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
              {airline.fleet_size ? <Chip text={`${airline.fleet_size} uçak`} /> : null}
              {interview.requiredLevel ? <Chip text={`Min ${interview.requiredLevel}`} /> : null}
              {interview.englishWeight !== undefined ? (
                <Chip text={`%${interview.englishWeight} EN`} />
              ) : null}
              {interview.averageSalaryTryK ? (
                <Chip text={`~₺${interview.averageSalaryTryK}K/ay`} />
              ) : null}
            </View>
            {interview.stages && interview.stages.length > 0 && (
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
            )}
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

function groupByRegion(list: AirlineRow[]): Partial<Record<AirlineRegion, AirlineRow[]>> {
  const groups: Partial<Record<AirlineRegion, AirlineRow[]>> = {};
  for (const a of list) {
    const r = (a.region ?? 'asia') as AirlineRegion;
    if (!groups[r]) groups[r] = [];
    groups[r]!.push(a);
  }
  return groups;
}

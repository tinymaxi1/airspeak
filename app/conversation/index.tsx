/**
 * Conversation Index — AI Co-pilot senaryolarını listele.
 *
 * Kullanıcı buraya gelince tüm 5 (gelecek 50+) senaryoyu görür,
 * birini seçip /conversation/[scenario] route'una gider.
 */
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mono,
  Body,
  FONTS,
  TopoBackground,
  CoachMark,
  BackButton,
} from '@/components/airspeak';
import { useScenarios, dbToStaticScenario } from '@/features/conversation/useScenarios';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useCoachMarkStore } from '@/stores/coachMarkStore';
import { track } from '@/lib/posthog';
import { useAuthStore } from '@/stores/authStore';
import { useLocalizedSubRoles } from '@/features/profile/useSubRoles';
import type { UserRole } from '@/types/profile';

const ROLE_ICONS: Record<string, string> = {
  pilot: '✈',
  atc: '🗼',
  cabin: '🎧',
  technician: '⚙',
  ground: '💼',
  student: '🎓',
  dispatcher: '📊',
  all: '🌐',
};

const LEVEL_BADGE: Record<string, { bg: string; fg: string }> = {
  L4: { bg: '#FFD56B', fg: '#0A1430' },
  B2: { bg: '#2EA8FF', fg: '#FFFFFF' },
  B1: { bg: '#2DBE6C', fg: '#FFFFFF' },
};

export default function ConversationIndexScreen() {
  const { t } = useTranslation();
  // Tab değeri: 'all' veya sub_role id (örn 'tech_line').
  const [filter, setFilter] = useState<string>('all');
  const bookmarkEntries = useBookmarkStore((s) => s.entries);
  const bookmarkedSet = useMemo(
    () => new Set(bookmarkEntries.filter((e) => e.kind === 'scenario').map((e) => e.id)),
    [bookmarkEntries],
  );
  const toggleBookmark = useBookmarkStore((s) => s.toggle);
  const coachSeen = useCoachMarkStore((s) => s.isSeen('conversation_first_open'));
  const markCoachSeen = useCoachMarkStore((s) => s.markSeen);

  // User'ın parent role'una göre sub_role tab listesi
  const userRole = useAuthStore((s) => s.profile?.role) as UserRole | null;
  const { items: subRoles } = useLocalizedSubRoles(userRole);

  // Senaryolar — TEK useScenarios() çağrısı (önceden 2 ayrı çağrı vardı →
  // React Query çift subscription → useSyncExternalStore re-render loop → RN-7 crash).
  // dbRows'tan hem static items hem sub_role map türet, tek subscription yeter.
  const { data: dbRows = [], isLoading } = useScenarios();
  const allScenarios = useMemo(() => dbRows.map(dbToStaticScenario), [dbRows]);
  const subRoleBySlug = useMemo(() => {
    const m = new Map<string, string[]>();
    dbRows.forEach((r) => m.set(r.slug, r.target_sub_roles ?? []));
    return m;
  }, [dbRows]);

  // Filter: 'all' tab → tümü; sub_role tab → o sub_role tag'i olan veya boş olanlar
  const scenarios = useMemo(() => {
    if (filter === 'all') return allScenarios;
    return allScenarios.filter((s) => {
      const tags = subRoleBySlug.get(s.id) ?? [];
      // Sub_role tag matching: spesifik tag varsa match, boşsa da gösteriliyor mu?
      // Tasarım kararı: BOŞ olanlar her tab'da görünür (parent role'a açık)
      return tags.length === 0 || tags.includes(filter);
    });
  }, [filter, allScenarios, subRoleBySlug]);

  return (
    <View style={{ flex: 1, backgroundColor: '#06091A' }}>
      <View style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <TopoBackground />
      </View>

      <SafeAreaView edges={['top']} style={{ backgroundColor: 'rgba(15, 30, 71, 0.6)' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <BackButton onPress={() => router.back()} color="#FFFFFF" label={t('common.back', 'Geri')} />
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.7)' }}>
              {t('conversation.indexEyebrowCount', { count: scenarios.length, defaultValue: 'AI CO-PILOT · {{count}} SENARYO' })}
            </Mono>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 22, color: '#FFFFFF', marginTop: 2 }}>
              {t('conversation.indexTitle', 'Senaryo seç')}
            </Text>
          </View>
        </View>

        {/* Sub-role filter tabs — user.role'a ait alt-roller */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 6 }}
        >
          {/* Tümü tab — her zaman ilk */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFilter('all')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: filter === 'all' ? '#FFD56B' : 'rgba(255,255,255,0.18)',
              backgroundColor: filter === 'all' ? 'rgba(255,213,107,0.16)' : 'transparent',
            }}
          >
            <Mono
              style={{
                fontSize: 11,
                color: filter === 'all' ? '#FFD56B' : 'rgba(255,255,255,0.85)',
                letterSpacing: 0.99,
              }}
            >
              🌐 {t('common.all', 'Tümü')}
            </Mono>
          </TouchableOpacity>
          {/* Sub_role tab'ları — kullanıcının parent role'una bağlı */}
          {subRoles.map((sr) => {
            const active = filter === sr.id;
            return (
              <TouchableOpacity
                key={sr.id}
                activeOpacity={0.85}
                onPress={() => setFilter(sr.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1.5,
                  borderColor: active ? '#FFD56B' : 'rgba(255,255,255,0.18)',
                  backgroundColor: active ? 'rgba(255,213,107,0.16)' : 'transparent',
                }}
              >
                <Mono
                  style={{
                    fontSize: 11,
                    color: active ? '#FFD56B' : 'rgba(255,255,255,0.85)',
                    letterSpacing: 0.99,
                  }}
                >
                  {sr.icon ?? '·'} {sr.name}
                </Mono>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {isLoading && (
          <View style={{ paddingTop: 32, alignItems: 'center' }}>
            <ActivityIndicator color="#FFD56B" />
          </View>
        )}
        {!isLoading && scenarios.length === 0 && (
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: 'rgba(255,255,255,0.18)',
              borderRadius: 14,
              padding: 24,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 36 }}>🎙</Text>
            <Body color="rgba(255,255,255,0.7)" style={{ fontSize: 14, textAlign: 'center' }}>
              {filter === 'all'
                ? t('conversation.noScenarios', 'Bu rol için henüz senaryo yok')
                : t('conversation.noScenariosSubRole', 'Bu alt-rol için henüz senaryo yok. "Tümü" sekmesine bak.')}
            </Body>
          </View>
        )}

        {scenarios.map((s) => (
          <TouchableOpacity
            key={s.id}
            activeOpacity={0.85}
            onPress={() => {
              track('scenario_opened', { scenario_id: s.id, role: s.role, level: s.level });
              router.push({ pathname: '/conversation/[scenario]', params: { scenario: s.id } });
            }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.12)',
              borderRadius: 14,
              padding: 14,
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: 'rgba(230,57,70,0.15)',
                borderWidth: 1,
                borderColor: '#FB6D78',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 26 }}>{ROLE_ICONS[s.role] ?? '🌐'}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#FFFFFF' }}>
                  {s.titleTr}
                </Text>
                {(() => {
                  const badge = LEVEL_BADGE[s.level] ?? LEVEL_BADGE.B1!;
                  return (
                    <View
                      style={{
                        backgroundColor: badge.bg,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      <Mono style={{ fontSize: 9, color: badge.fg, letterSpacing: 0.81 }}>
                        {s.level}
                      </Mono>
                    </View>
                  );
                })()}
              </View>
              <Body color="rgba(255,255,255,0.7)" style={{ fontSize: 12, marginTop: 4 }}>
                {s.contextTr}
              </Body>
              <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                {s.turns.length} turn · ~{s.estimatedSeconds}sn
              </Mono>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={bookmarkedSet.has(s.id) ? 'Yer iminden çıkar' : 'Yer imlerine ekle'}
              onPress={(e) => {
                e.stopPropagation();
                toggleBookmark('scenario', s.id);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 4 }}
            >
              <Text style={{ fontSize: 20, color: bookmarkedSet.has(s.id) ? '#FFD56B' : 'rgba(255,255,255,0.5)' }}>
                {bookmarkedSet.has(s.id) ? '⭐' : '☆'}
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)' }}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!coachSeen && (
        <CoachMark
          text="ATC senaryolarında ⭐ ile favorilerini kaydedebilirsin. Her senaryo gerçek frekans + İngilizce konuşma pratiği."
          onDismiss={() => markCoachSeen('conversation_first_open')}
        />
      )}
    </View>
  );
}

/**
 * Conversation Index — AI Co-pilot senaryolarını listele.
 *
 * Kullanıcı buraya gelince tüm 5 (gelecek 50+) senaryoyu görür,
 * birini seçip /conversation/[scenario] route'una gider.
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
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
import { SCENARIOS } from '@/features/conversation/scenarios';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useCoachMarkStore } from '@/stores/coachMarkStore';

const ROLE_ICONS: Record<string, string> = {
  pilot: '✈',
  cabin: '🎧',
  tech: '⚙',
  ground: '💼',
  all: '🌐',
};

const LEVEL_BADGE: Record<string, { bg: string; fg: string }> = {
  L4: { bg: '#FFD56B', fg: '#0A1430' },
  B2: { bg: '#2EA8FF', fg: '#FFFFFF' },
  B1: { bg: '#2DBE6C', fg: '#FFFFFF' },
};

const ROLE_FILTERS: { value: 'all' | 'pilot' | 'cabin' | 'tech' | 'ground'; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'pilot', label: '✈ Pilot' },
  { value: 'cabin', label: '🎧 Kabin' },
  { value: 'tech', label: '⚙ Teknisyen' },
  { value: 'ground', label: '💼 Yer' },
];

export default function ConversationIndexScreen() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>('all');
  const bookmarkedSet = useBookmarkStore((s) =>
    new Set(s.entries.filter((e) => e.kind === 'scenario').map((e) => e.id)),
  );
  const toggleBookmark = useBookmarkStore((s) => s.toggle);
  const coachSeen = useCoachMarkStore((s) => s.isSeen('conversation_first_open'));
  const markCoachSeen = useCoachMarkStore((s) => s.markSeen);

  const scenarios = useMemo(
    () => (filter === 'all' ? SCENARIOS : SCENARIOS.filter((s) => s.role === filter)),
    [filter],
  );

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
              {t('conversation.indexEyebrow', 'AI CO-PILOT · 5 SENARYO')}
            </Mono>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 22, color: '#FFFFFF', marginTop: 2 }}>
              {t('conversation.indexTitle', 'Senaryo seç')}
            </Text>
          </View>
        </View>

        {/* Role filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 6 }}
        >
          {ROLE_FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                activeOpacity={0.85}
                onPress={() => setFilter(f.value)}
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
                  {f.label}
                </Mono>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {scenarios.length === 0 && (
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
              {t('conversation.noScenarios', 'Bu rol için henüz senaryo yok')}
            </Body>
          </View>
        )}

        {scenarios.map((s) => (
          <TouchableOpacity
            key={s.id}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/conversation/[scenario]', params: { scenario: s.id } })}
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

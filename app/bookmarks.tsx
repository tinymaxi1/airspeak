/**
 * Bookmarks — kullanıcının ⭐ ile kaydettiği vocab + senaryolar.
 *
 * Vocab terimleri ve AI senaryoları iki sekme. Boşsa empty state gösterir.
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mono,
  Body,
  FONTS,
  EmptyState,
  BackButton,
} from '@/components/airspeak';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { getVocabForRole } from '@/features/lessons/seed';
import { SCENARIOS } from '@/features/conversation/scenarios';

type Tab = 'vocab' | 'scenario';

export default function BookmarksScreen() {
  const { t } = useTranslation();
  const role = useOnboardingStore((s) => s.role);
  const [tab, setTab] = useState<Tab>('vocab');
  const entries = useBookmarkStore((s) => s.entries);
  const toggleBookmark = useBookmarkStore((s) => s.toggle);

  const vocabBookmarks = useMemo(() => {
    const ids = new Set(entries.filter((e) => e.kind === 'vocab').map((e) => e.id));
    return getVocabForRole(role).filter((v) => ids.has(v.id));
  }, [entries, role]);

  const scenarioBookmarks = useMemo(() => {
    const ids = new Set(entries.filter((e) => e.kind === 'scenario').map((e) => e.id));
    return SCENARIOS.filter((s) => ids.has(s.id));
  }, [entries]);

  const counts = {
    vocab: vocabBookmarks.length,
    scenario: scenarioBookmarks.length,
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <BackButton onPress={() => router.back()} label={t('common.back', 'Geri')} />
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
              {t('bookmarks.eyebrow', '{{n}} KAYIT', { n: counts.vocab + counts.scenario })}
            </Mono>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 22, color: '#0E1116', marginTop: 2 }}>
              {t('bookmarks.title', 'Yer İmleri')}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 }}>
          <TabChip
            label={t('bookmarks.tabVocab', 'Vocab')}
            count={counts.vocab}
            active={tab === 'vocab'}
            onPress={() => setTab('vocab')}
          />
          <TabChip
            label={t('bookmarks.tabScenarios', 'Senaryo')}
            count={counts.scenario}
            active={tab === 'scenario'}
            onPress={() => setTab('scenario')}
          />
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {tab === 'vocab' ? (
          vocabBookmarks.length === 0 ? (
            <EmptyState
              icon="⭐"
              message={t(
                'bookmarks.emptyVocab',
                'Henüz vocab kaydetmedin. Vocab listesinde ⭐ ikonuna bas.',
              )}
            />
          ) : (
            vocabBookmarks.map((v) => (
              <View
                key={v.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1.5,
                  borderColor: '#DCE0E8',
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: '#0E1116' }}>
                    {v.term}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.body700,
                      fontSize: 13,
                      color: '#E63946',
                      marginTop: 2,
                    }}
                  >
                    {v.termTr}
                  </Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t('common.removeBookmark', 'Yer iminden çıkar')}
                  onPress={() => toggleBookmark('vocab', v.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={{ fontSize: 18 }}>⭐</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        ) : scenarioBookmarks.length === 0 ? (
          <EmptyState
            icon="⭐"
            message={t(
              'bookmarks.emptyScenarios',
              'Henüz senaryo kaydetmedin. AI Co-pilot listesinde ⭐ ikonuna bas.',
            )}
          />
        ) : (
          scenarioBookmarks.map((s) => (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.85}
              onPress={() =>
                router.push({ pathname: '/conversation/[scenario]', params: { scenario: s.id } })
              }
              accessibilityRole="button"
              accessibilityLabel={s.titleTr}
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#DCE0E8',
                borderRadius: 14,
                padding: 14,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                  {s.titleTr}
                </Text>
                <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }}>
                  {s.contextTr}
                </Body>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('common.removeBookmark', 'Yer iminden çıkar')}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleBookmark('scenario', s.id);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={{ fontSize: 18 }}>⭐</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function TabChip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: active ? '#0F1E47' : '#DCE0E8',
        backgroundColor: active ? '#0F1E47' : '#FFFFFF',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <Text
        style={{
          fontFamily: FONTS.body700,
          fontSize: 13,
          color: active ? '#FFFFFF' : '#5A6478',
        }}
      >
        {label}
      </Text>
      <Mono
        style={{
          fontSize: 11,
          color: active ? 'rgba(255,255,255,0.7)' : '#8A93A6',
        }}
      >
        {count}
      </Mono>
    </TouchableOpacity>
  );
}

/**
 * Vocab — Hibrit (search-first + mastery-tracker)
 *
 * Designer Block 2.C dengelenmiş hibrit:
 * - Üst: search bar (her zaman primary, sticky)
 * - Altında ince mastery progress bar ("X / Y öğrenildi")
 *   tasarımdaki 4 status chip → tek bar'a sıkıştırıldı
 * - Category chip row (search focus'ta gizlenir, blur'da görünür)
 * - SectionList: letter-grouped (A/B/C...) + sticky section header (red-500)
 * - Per-row: word + IPA + category pill + thin mastery bar + Volume + bookmark + expand
 * - Expand: 2-line definition + example
 *
 * Mastery: SRS card.repetitions / 5 (0=new, 1=mastered).
 * Card yoksa mastery=0 (henüz başlanmamış).
 */
import { useState, useMemo } from 'react';
import {
  SectionList,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import * as Speech from 'expo-speech';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mono,
  Body,
  FONTS,
  BackButton,
} from '@/components/airspeak';
import { useVocab } from '@/features/content/api';
import type { VocabTermRow } from '@/features/content/types';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useSrsStore } from '@/stores/srsStore';
import type { UserRole } from '@/types/profile';

type VocabularyTerm = {
  id: string;
  term: string;
  termTr: string;
  pronunciation: string;
  category: string;
  difficulty: number;
  definitionTr: string;
  exampleEn?: string;
  exampleTr?: string;
};

function rowToTerm(r: VocabTermRow): VocabularyTerm {
  return {
    id: r.slug,
    term: r.term,
    termTr: r.term_tr ?? r.term,
    pronunciation: r.ipa ?? '',
    category: r.category ?? 'general',
    difficulty: r.difficulty,
    definitionTr: r.definition_tr ?? r.definition ?? '',
    exampleEn: r.example ?? undefined,
    exampleTr: r.example_tr ?? undefined,
  };
}

export default function VocabScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const role = useOnboardingStore((s) => s.role) as UserRole | null;
  const { data: vocabRows = [] } = useVocab(role);
  const allVocab = useMemo(() => vocabRows.map(rowToTerm), [vocabRows]);

  const srsCards = useSrsStore((s) => s.cards);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [searchFocused, setSearchFocused] = useState(false);

  // Mastery hesabı: SRS card.repetitions / 5 (clamped 0-1)
  const masteryOf = (id: string): number => {
    const card = srsCards[id];
    if (!card) return 0;
    return Math.min(1, card.repetitions / 5);
  };

  const categories = useMemo(() => {
    const set = new Set(allVocab.map((v) => v.category));
    return ['all', ...Array.from(set).sort()];
  }, [allVocab]);

  const filtered = useMemo(() => {
    let list = allVocab;
    if (category !== 'all') list = list.filter((v) => v.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) =>
          v.term.toLowerCase().includes(q) ||
          v.termTr.toLowerCase().includes(q) ||
          v.definitionTr.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allVocab, query, category]);

  // Letter-grouped SectionList data (tasarım intent)
  const sections = useMemo(() => {
    const groups: Record<string, VocabularyTerm[]> = {};
    for (const term of filtered) {
      const letter = (term.term[0] ?? '#').toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : '#';
      if (!groups[key]) groups[key] = [];
      groups[key]!.push(term);
    }
    return Object.keys(groups)
      .sort()
      .map((title) => ({ title, data: groups[title]! }));
  }, [filtered]);

  // Mastery summary: filtered set'te öğrenilmiş (≥0.7) vs total
  const masteredCount = useMemo(
    () => filtered.filter((t) => masteryOf(t.id) >= 0.7).length,
    [filtered, srsCards],
  );
  const masteryPct = filtered.length > 0 ? (masteredCount / filtered.length) * 100 : 0;

  const handleSpeak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: 'en-US', rate: 0.9 });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']}>
        {/* TopBar: back + eyebrow + title */}
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
              {t('vocab.eyebrow', 'VOCAB · ICAO 4 · {{count}} TERIM', {
                count: allVocab.length,
              })}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 22,
                fontWeight: '700',
                color: '#0E1116',
                letterSpacing: -0.44,
                marginTop: 2,
              }}
            >
              {t('vocab.title', 'Glossary')}
            </Text>
          </View>
        </View>

        {/* Search bar — primary, always visible */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: searchFocused ? '#0F1E47' : '#DCE0E8',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 10,
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 14, color: '#8A93A6' }}>🔍</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('vocab.searchPlaceholder', 'kelime, anlam, tanım ara...')}
              placeholderTextColor="#8A93A6"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                flex: 1,
                fontFamily: FONTS.body,
                fontSize: 15,
                color: '#0E1116',
                padding: 0,
              }}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                <Text style={{ fontSize: 16, color: '#8A93A6' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Mastery thin progress bar — 4 status chip → tek bar (Block 2.C) */}
        <View style={{ paddingHorizontal: 16, paddingBottom: searchFocused ? 8 : 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 0.9 }}>
              {t('vocab.masterySummary', '{{m}} / {{n}} ÖĞRENİLDİ', {
                m: masteredCount,
                n: filtered.length,
              })}
            </Mono>
            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 0.9 }}>
              {Math.round(masteryPct)}%
            </Mono>
          </View>
          <View style={{ height: 4, backgroundColor: '#DCE0E8', borderRadius: 2, overflow: 'hidden' }}>
            <View
              style={{
                width: `${masteryPct}%`,
                height: '100%',
                backgroundColor: '#2DBE6C',
              }}
            />
          </View>
        </View>

        {/* Category chips — search focus'ta gizlenir, blur'da görünür */}
        {!searchFocused && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10, gap: 6 }}
          >
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.85}
                  onPress={() => setCategory(cat)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    borderWidth: 1.5,
                    borderColor: active ? '#0F1E47' : '#DCE0E8',
                    backgroundColor: active ? '#0F1E47' : '#FFFFFF',
                  }}
                >
                  <Mono
                    style={{
                      fontSize: 11,
                      color: active ? '#FFFFFF' : '#5A6478',
                      letterSpacing: 0.99,
                    }}
                  >
                    {cat === 'all' ? t('vocab.allCategories', 'TÜMÜ') : cat.toUpperCase()}
                  </Mono>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>

      {/* SectionList — letter-grouped + sticky section header */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={{ backgroundColor: c.bg, paddingTop: 10, paddingBottom: 4, paddingHorizontal: 16 }}>
            <Mono
              style={{
                fontSize: 11,
                color: '#E63946',
                letterSpacing: 1.65,
                fontWeight: '700',
              }}
            >
              {section.title}
            </Mono>
          </View>
        )}
        renderItem={({ item }) => (
          <VocabRow
            term={item}
            mastery={masteryOf(item.id)}
            onSpeak={() => handleSpeak(item.term)}
          />
        )}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
            <Body color="#5A6478" style={{ textAlign: 'center' }}>
              {t('vocab.noResults', '"{{q}}" için sonuç bulunamadı', { q: query })}
            </Body>
          </View>
        }
        keyboardShouldPersistTaps="handled"
        windowSize={10}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// VocabRow — letter-grouped + mastery + Volume + bookmark + expand
// ─────────────────────────────────────────────
function VocabRow({
  term,
  mastery,
  onSpeak,
}: {
  term: VocabularyTerm;
  mastery: number;
  onSpeak: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isBookmarked = useBookmarkStore((s) => s.isBookmarked('vocab', term.id));
  const toggleBookmark = useBookmarkStore((s) => s.toggle);

  // Mastery rengi: tasarım — green>0.7, gold>0.4, red else
  const masteryColor =
    mastery > 0.7 ? '#2DBE6C' : mastery > 0.4 ? '#F2C14E' : '#E63946';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setExpanded((v) => !v)}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#DCE0E8',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        {/* Word row */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: '#0E1116' }}>
            {term.term}
          </Text>
          {term.pronunciation && (
            <Mono style={{ fontSize: 10, color: '#8A93A6' }}>{term.pronunciation}</Mono>
          )}
          {term.category && term.category !== 'general' && (
            <View
              style={{
                paddingHorizontal: 5,
                paddingVertical: 1,
                borderRadius: 4,
                backgroundColor: '#EDEFF3',
              }}
            >
              <Mono style={{ fontSize: 8, color: '#5A6478', letterSpacing: 0.72 }}>
                {term.category.toUpperCase()}
              </Mono>
            </View>
          )}
        </View>
        {/* TR translation */}
        <Text
          style={{
            fontFamily: FONTS.body,
            fontSize: 13,
            color: '#5A6478',
            marginTop: 2,
          }}
        >
          {term.termTr}
        </Text>
        {/* Mastery thin bar + numeric */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <View
            style={{
              flex: 1,
              height: 4,
              backgroundColor: '#DCE0E8',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${mastery * 100}%`,
                height: '100%',
                backgroundColor: masteryColor,
              }}
            />
          </View>
          <Mono style={{ fontSize: 10, color: '#8A93A6' }}>{Math.round(mastery * 100)}</Mono>
        </View>

        {/* Expanded definition + example */}
        {expanded && (
          <View style={{ marginTop: 10, gap: 8 }}>
            {term.definitionTr ? (
              <Body color="#0E1116" style={{ fontSize: 13, lineHeight: 19 }}>
                {term.definitionTr}
              </Body>
            ) : null}
            {term.exampleEn && (
              <View
                style={{
                  backgroundColor: '#EDEFF3',
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 13,
                    color: '#0E1116',
                    fontStyle: 'italic',
                  }}
                >
                  &ldquo;{term.exampleEn}&rdquo;
                </Text>
                {term.exampleTr && (
                  <Body color="#5A6478" style={{ fontSize: 11, marginTop: 2 }}>
                    {term.exampleTr}
                  </Body>
                )}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Volume + Bookmark — column right */}
      <View style={{ alignItems: 'center', gap: 4 }}>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onSpeak();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Sesli oku: ${term.term}`}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={{ padding: 4 }}
        >
          <Text style={{ fontSize: 18, color: '#5A6478' }}>🔊</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            toggleBookmark('vocab', term.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? 'Yer iminden çıkar' : 'Yer imlerine ekle'}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={{ padding: 4 }}
        >
          <Text style={{ fontSize: 16 }}>{isBookmarked ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

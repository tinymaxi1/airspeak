/**
 * Vocab Search & Browse — 1300+ aviation vocabulary search edip incele.
 */
import { ScrollView, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mono,
  Body,
  FONTS,
  SearchBar,
  EmptyState,
  BackButton,
} from '@/components/airspeak';
import { useVocab } from '@/features/content/api';
import type { VocabTermRow } from '@/features/content/types';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import type { UserRole } from '@/types/profile';

/** Eski TS VocabularyTerm shape'i — VocabCard component'i bunu bekliyor. */
type VocabularyTerm = {
  id: string;
  term: string;
  termTr: string;
  pronunciation: string;
  category: string;
  difficulty: number;
  definitionEn: string;
  definitionTr: string;
  examples: { en: string; tr: string }[];
};

function rowToTerm(r: VocabTermRow): VocabularyTerm {
  return {
    id: r.slug,
    term: r.term,
    termTr: r.term_tr ?? r.term,
    pronunciation: r.ipa ?? '',
    category: r.category ?? 'general',
    difficulty: r.difficulty,
    definitionEn: r.definition ?? '',
    definitionTr: r.definition_tr ?? '',
    examples:
      r.example && r.example_tr
        ? [{ en: r.example, tr: r.example_tr }]
        : r.example
          ? [{ en: r.example, tr: '' }]
          : [],
  };
}

export default function VocabScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const role = useOnboardingStore((s) => s.role) as UserRole | null;
  const { data: vocabRows = [] } = useVocab(role);
  const allVocab = useMemo(() => vocabRows.map(rowToTerm), [vocabRows]);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  // Kategorileri çıkar
  const categories = useMemo(() => {
    const set = new Set(allVocab.map((v) => v.category));
    return ['all', ...Array.from(set).sort()];
  }, [allVocab]);

  // Filtre + arama
  const filtered = useMemo(() => {
    let list = allVocab;
    if (category !== 'all') {
      list = list.filter((v) => v.category === category);
    }
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

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
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
              {t('vocab.eyebrow', '{{count}} TERIM', { count: allVocab.length })}
            </Mono>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 22, color: '#0E1116', marginTop: 2 }}>
              {t('vocab.title', 'Vocabulary')}
            </Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={t('vocab.searchPlaceholder', 'kelime, anlam, tanım ara...')}
          />
        </View>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 6 }}
        >
          {categories.map((c) => {
            const active = category === c;
            return (
              <TouchableOpacity
                key={c}
                activeOpacity={0.85}
                onPress={() => setCategory(c)}
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
                  {c === 'all' ? t('vocab.allCategories', 'TÜMÜ') : c.toUpperCase()}
                </Mono>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <FlatList
        data={filtered}
        keyExtractor={(term) => term.id}
        renderItem={({ item }) => <VocabCard term={item} />}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <Mono style={{ fontSize: 11, color: '#5A6478', marginBottom: 8 }}>
            {t('vocab.results', '{{count}} sonuç', { count: filtered.length })}
          </Mono>
        }
        ListEmptyComponent={
          <View style={{ marginTop: 16 }}>
            <EmptyState
              icon="🔍"
              message={t('vocab.noResults', '"{{q}}" için sonuç bulunamadı', { q: query })}
            />
          </View>
        }
        windowSize={10}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
      />
    </View>
  );
}

function VocabCard({ term }: { term: VocabularyTerm }) {
  const [expanded, setExpanded] = useState(false);
  const isBookmarked = useBookmarkStore((s) => s.isBookmarked('vocab', term.id));
  const toggleBookmark = useBookmarkStore((s) => s.toggle);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setExpanded(!expanded)}
      style={{
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 16, color: '#0E1116' }}>
              {term.term}
            </Text>
            <Mono style={{ fontSize: 11, color: '#5A6478' }}>{term.pronunciation}</Mono>
          </View>
          <Text
            style={{
              fontFamily: FONTS.body700,
              fontSize: 14,
              color: '#E63946',
              marginTop: 2,
            }}
          >
            {term.termTr}
          </Text>
          <Mono style={{ fontSize: 10, color: '#8A93A6', marginTop: 4, letterSpacing: 0.9 }}>
            {term.category.toUpperCase()}
          </Mono>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? 'Yer iminden çıkar' : 'Yer imlerine ekle'}
          onPress={(e) => {
            e.stopPropagation();
            toggleBookmark('vocab', term.id);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ padding: 4 }}
        >
          <Text style={{ fontSize: 18 }}>{isBookmarked ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, color: '#8A93A6' }}>{expanded ? '−' : '+'}</Text>
      </View>

      {expanded && (
        <View style={{ marginTop: 12, gap: 8 }}>
          <Body color="#0E1116" style={{ fontSize: 13, lineHeight: 19 }}>
            {term.definitionTr}
          </Body>
          {term.examples[0] && (
            <View
              style={{
                backgroundColor: '#EDEFF3',
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Text style={{ fontFamily: FONTS.body, fontSize: 13, color: '#0E1116', fontStyle: 'italic' }}>
                "{term.examples[0].en}"
              </Text>
              <Body color="#5A6478" style={{ fontSize: 11, marginTop: 2 }}>
                {term.examples[0].tr}
              </Body>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

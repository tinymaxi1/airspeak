/**
 * Vocab Search & Browse — 1300+ aviation vocabulary search edip incele.
 */
import { ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Eyebrow,
  Mono,
  Body,
  FONTS,
} from '@/components/airspeak';
import { getVocabForRole } from '@/features/lessons/seed';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { VocabularyTerm } from '@/features/lessons/seed/pilotVocab';

export default function VocabScreen() {
  const { t } = useTranslation();
  const role = useOnboardingStore((s) => s.role);
  const allVocab = useMemo(() => getVocabForRole(role), [role]);

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
    return list.slice(0, 100); // Performance için limit
  }, [allVocab, query, category]);

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
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: '#0E1116' }}>←</Text>
          </TouchableOpacity>
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
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>🔍</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('vocab.searchPlaceholder', 'kelime, anlam, tanım ara...')}
              placeholderTextColor="#8A93A6"
              style={{
                flex: 1,
                fontFamily: FONTS.body,
                fontSize: 15,
                color: '#0E1116',
              }}
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={{ fontSize: 18, color: '#8A93A6' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Mono style={{ fontSize: 11, color: '#5A6478', marginBottom: 8 }}>
          {t('vocab.results', '{{count}} sonuç', { count: filtered.length })}
        </Mono>

        {filtered.length === 0 && (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: '#DCE0E8',
              borderRadius: 14,
              padding: 24,
              alignItems: 'center',
              gap: 8,
              marginTop: 16,
            }}
          >
            <Text style={{ fontSize: 36 }}>🔍</Text>
            <Body color="#5A6478" style={{ fontSize: 14, textAlign: 'center' }}>
              {t('vocab.noResults', '"{{q}}" için sonuç bulunamadı', { q: query })}
            </Body>
          </View>
        )}

        {filtered.map((term) => (
          <VocabCard key={term.id} term={term} />
        ))}
      </ScrollView>
    </View>
  );
}

function VocabCard({ term }: { term: VocabularyTerm }) {
  const [expanded, setExpanded] = useState(false);
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

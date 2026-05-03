/**
 * Global Search — vocab + airline + scenario + clearance arama.
 *
 * Tek search bar, 4 farklı kaynaktan canlı sonuç gösterir.
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { useState, useMemo } from 'react';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mono,
  Body,
  FONTS,
  SearchBar,
  ScreenHeader,
  EmptyState,
  NavCard,
} from '@/components/airspeak';
import { useVocab, useAirlines } from '@/features/content/api';
import { SCENARIOS } from '@/features/conversation/scenarios';
import { CLEARANCES } from '@/features/readback/clearances';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { UserRole } from '@/types/profile';

interface SearchResult {
  type: 'vocab' | 'airline' | 'scenario' | 'clearance';
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: Href;
}

export default function SearchScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const role = useOnboardingStore((s) => s.role) as UserRole | null;
  const { data: vocabRows = [] } = useVocab(role);
  const { data: airlineRows = [] } = useAirlines();
  const [query, setQuery] = useState('');

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const out: SearchResult[] = [];

    // Vocab (max 10)
    const vocabHits = vocabRows
      .filter(
        (v) =>
          v.term.toLowerCase().includes(q) ||
          (v.term_tr ?? '').toLowerCase().includes(q) ||
          (v.definition_tr ?? '').toLowerCase().includes(q),
      )
      .slice(0, 10);
    for (const v of vocabHits) {
      out.push({
        type: 'vocab',
        id: v.slug,
        title: v.term,
        subtitle: `${v.term_tr ?? ''} · ${v.category ?? ''}`,
        icon: '📖',
        color: '#2EA8FF',
        route: '/vocab',
      });
    }

    // Airlines (max 8)
    const airlineHits = airlineRows
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.iata_code ?? '').toLowerCase() === q,
      )
      .slice(0, 8);
    for (const a of airlineHits) {
      out.push({
        type: 'airline',
        id: a.slug,
        title: a.name,
        subtitle: `${a.country_emoji ?? '🌍'} · ${a.iata_code ?? ''}`,
        icon: '✈',
        color: '#E63946',
        route: { pathname: '/exam/airline/[id]', params: { id: a.slug } },
      });
    }

    // Scenarios (max 5)
    const scenarioHits = SCENARIOS.filter((s) =>
      s.titleTr.toLowerCase().includes(q) || s.contextTr.toLowerCase().includes(q),
    ).slice(0, 5);
    for (const s of scenarioHits) {
      out.push({
        type: 'scenario',
        id: s.id,
        title: s.titleTr,
        subtitle: `🤖 AI Co-pilot · ${s.turns.length} turn`,
        icon: '🤖',
        color: '#7C5CFF',
        route: { pathname: '/conversation/[scenario]', params: { scenario: s.id } },
      });
    }

    // Clearances (max 5)
    const clearanceHits = CLEARANCES.filter(
      (c) =>
        c.atcUtterance.toLowerCase().includes(q) ||
        c.expectedReadback.toLowerCase().includes(q) ||
        c.station.toLowerCase().includes(q),
    ).slice(0, 5);
    for (const c of clearanceHits) {
      out.push({
        type: 'clearance',
        id: c.id,
        title: c.station,
        subtitle: c.atcUtterance.slice(0, 80) + '...',
        icon: '🎙',
        color: '#FF7847',
        route: '/readback',
      });
    }

    return out;
  }, [query, vocabRows, airlineRows]);

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
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Geri">
            <Text style={{ fontSize: 22, color: '#0E1116' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder={t('search.placeholder', 'vocab, havayolu, senaryo, clearance...')}
              autoFocus
            />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {!query && (
          <View style={{ gap: 16 }}>
            <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.32 }}>
              {t('search.tipsEyebrow', 'NE ARAYABILIRSIN')}
            </Mono>
            {[
              { icon: '📖', label: t('search.tipVocab', 'Vocab terim'), example: '"altimeter", "squawk"' },
              { icon: '✈', label: t('search.tipAirline', 'Havayolu'), example: '"THY", "Emirates", "TK"' },
              { icon: '🤖', label: t('search.tipScenario', 'AI senaryo'), example: '"holding", "taxi", "go-around"' },
              { icon: '🎙', label: t('search.tipClearance', 'ATC clearance'), example: '"runway 35", "MAYDAY"' },
            ].map((tip) => (
              <View
                key={tip.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ fontSize: 24 }}>{tip.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                    {tip.label}
                  </Text>
                  <Mono style={{ fontSize: 11, color: '#5A6478', marginTop: 2 }}>
                    {tip.example}
                  </Mono>
                </View>
              </View>
            ))}
          </View>
        )}

        {query && query.length < 2 && (
          <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center', marginTop: 24 }}>
            {t('search.tooShort', 'En az 2 karakter yaz')}
          </Body>
        )}

        {query && query.length >= 2 && results.length === 0 && (
          <View style={{ marginTop: 16 }}>
            <EmptyState
              icon="🔍"
              message={t('search.noResults', '"{{q}}" için sonuç yok', { q: query })}
            />
          </View>
        )}

        {results.length > 0 && (
          <Mono style={{ fontSize: 11, color: '#5A6478', marginBottom: 8 }}>
            {t('search.resultCount', '{{count}} sonuç', { count: results.length })}
          </Mono>
        )}

        {results.map((r) => (
          <View key={`${r.type}-${r.id}`} style={{ marginBottom: 8 }}>
            <NavCard
              icon={r.icon}
              iconBg={r.color + '20'}
              iconBoxSize={44}
              title={r.title}
              subtitle={r.subtitle}
              onPress={() => router.push(r.route)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

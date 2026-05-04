/**
 * Tab → Dictionary — Aviation Glossary mobile lookup
 * Sprint 11.A.2
 *
 * aviation_glossary tablosu üzerinden public read.
 * search_glossary RPC ile kategori + arama + difficulty filter.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Search, X, Star, Volume2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { usePalette } from '@/lib/usePalette';
import { Eyebrow, Mono, FONTS } from '@/components/airspeak';

type Category =
  | 'phraseology'
  | 'aircraft_parts'
  | 'aerodynamics'
  | 'navigation'
  | 'meteorology'
  | 'atc_communication'
  | 'emergency'
  | 'flight_operations'
  | 'crew_resource_mgmt'
  | 'maintenance'
  | 'cabin_service'
  | 'ground_operations'
  | 'documentation'
  | 'regulations'
  | 'medical'
  | 'general';

const CATEGORY_LABELS: Record<Category, string> = {
  phraseology: 'Frazeoloji',
  aircraft_parts: 'Uçak Parçaları',
  aerodynamics: 'Aerodinamik',
  navigation: 'Seyrüsefer',
  meteorology: 'Meteoroloji',
  atc_communication: 'ATC',
  emergency: 'Acil Durum',
  flight_operations: 'Uçuş Op.',
  crew_resource_mgmt: 'CRM',
  maintenance: 'Bakım',
  cabin_service: 'Kabin',
  ground_operations: 'Yer Op.',
  documentation: 'Doküman',
  regulations: 'Mevzuat',
  medical: 'Tıbbi',
  general: 'Genel',
};

interface GlossaryItem {
  id: string;
  term_en: string;
  term_tr: string | null;
  abbreviation: string | null;
  category: string;
  definition_en: string | null;
  definition_tr: string | null;
  example_usage: string | null;
  ipa: string | null;
  pos: string | null;
  difficulty: number;
  icao_reference: string | null;
  audio_url: string | null;
  is_verified: boolean;
  frequency: number;
}

export default function DictionaryScreen() {
  const c = usePalette();
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [abbreviationsOnly, setAbbreviationsOnly] = useState(false);
  const [maxDifficulty, setMaxDifficulty] = useState(5);
  const [items, setItems] = useState<GlossaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<GlossaryItem | null>(null);

  const lang = i18n.language?.startsWith('tr') ? 'tr' : 'en';

  // Debounce query 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const { data, error } = await (supabase as any).rpc('search_glossary', {
        p_query: debouncedQuery || null,
        p_category: category,
        p_abbreviations_only: abbreviationsOnly,
        p_min_difficulty: 1,
        p_max_difficulty: maxDifficulty,
        p_lang: lang,
        p_limit: 100,
        p_offset: 0,
      });
      if (cancelled) return;
      if (error) {
        console.warn('Dictionary search error:', error);
        setItems([]);
      } else {
        setItems((data as GlossaryItem[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, category, abbreviationsOnly, maxDifficulty, lang]);

  const showEmpty = !loading && items.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
          <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
            {t('dictionary.eyebrow', 'AIRSPEAK · SÖZLÜK')}
          </Mono>
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: FONTS.body800,
              fontSize: 22,
              color: '#0E1116',
              marginTop: 2,
            }}
          >
            {t('dictionary.title', 'Aviation Glossary')}
          </Text>
        </View>

        {/* Search bar */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              borderRadius: 12,
              paddingHorizontal: 12,
              gap: 8,
            }}
          >
            <Search size={18} color="#5A6478" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('dictionary.searchPlaceholder', 'Terim, kısaltma veya tanım ara...')}
              placeholderTextColor="#8A93A6"
              style={{
                flex: 1,
                paddingVertical: 12,
                fontSize: 14,
                fontFamily: FONTS.body,
                color: '#0E1116',
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
                <X size={16} color="#8A93A6" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 4, flexDirection: 'row', gap: 8 }}>
          <FilterChip
            active={abbreviationsOnly}
            label={t('dictionary.abbreviations', 'Sadece kısaltmalar')}
            onPress={() => setAbbreviationsOnly((v) => !v)}
          />
          <DifficultyFilter value={maxDifficulty} onChange={setMaxDifficulty} />
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 6 }}
        >
          <FilterChip
            active={category === null}
            label={t('dictionary.all', 'Hepsi')}
            onPress={() => setCategory(null)}
          />
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
            <FilterChip
              key={cat}
              active={category === cat}
              label={CATEGORY_LABELS[cat]}
              onPress={() => setCategory((prev) => (prev === cat ? null : cat))}
            />
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="#0F2D5C" />
        </View>
      ) : showEmpty ? (
        <EmptyState query={debouncedQuery} category={category} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <DictionaryRow item={item} lang={lang} onPress={() => setSelected(item)} />
          )}
        />
      )}

      {/* Detail modal */}
      <Modal
        visible={selected !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (
          <DetailView
            item={selected}
            lang={lang}
            onClose={() => setSelected(null)}
          />
        )}
      </Modal>
    </View>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────

function FilterChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: active ? '#0F2D5C' : '#FFFFFF',
        borderWidth: 1.5,
        borderColor: active ? '#0F2D5C' : '#DCE0E8',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontFamily: FONTS.body700,
          color: active ? '#FFFFFF' : '#0E1116',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DifficultyFilter({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const next = value === 5 ? 1 : value + 1;
  return (
    <TouchableOpacity
      onPress={() => onChange(next)}
      style={{
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Star size={12} color="#FFD56B" fill="#FFD56B" />
      <Text style={{ fontSize: 12, fontFamily: FONTS.body700, color: '#0E1116' }}>
        ≤ {value}
      </Text>
    </TouchableOpacity>
  );
}

function DictionaryRow({
  item,
  lang,
  onPress,
}: {
  item: GlossaryItem;
  lang: string;
  onPress: () => void;
}) {
  const definition = lang === 'tr' ? item.definition_tr : item.definition_en;
  const term = lang === 'tr' && item.term_tr ? item.term_tr : item.term_en;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 18,
            fontWeight: '700',
            color: '#0E1116',
            flexShrink: 1,
          }}
        >
          {term}
        </Text>
        {item.abbreviation && (
          <Mono
            style={{
              fontSize: 11,
              color: '#5A6478',
              backgroundColor: '#EDEFF3',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            {item.abbreviation}
          </Mono>
        )}
        {item.is_verified && (
          <View
            style={{
              backgroundColor: '#2DBE6C',
              borderRadius: 8,
              paddingHorizontal: 5,
              paddingVertical: 1,
            }}
          >
            <Mono style={{ fontSize: 9, color: '#FFFFFF', letterSpacing: 0.6 }}>✓</Mono>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <Mono
          style={{
            fontSize: 9,
            color: '#0F2D5C',
            backgroundColor: '#0F2D5C15',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            letterSpacing: 0.8,
          }}
        >
          {(CATEGORY_LABELS[item.category as Category] ?? item.category).toUpperCase()}
        </Mono>
        {item.ipa && (
          <Text style={{ fontSize: 11, color: '#5A6478', fontStyle: 'italic' }}>
            /{item.ipa}/
          </Text>
        )}
      </View>
      {definition && (
        <Text
          numberOfLines={2}
          style={{
            fontSize: 12,
            color: '#5A6478',
            marginTop: 6,
            lineHeight: 17,
            fontFamily: FONTS.body,
          }}
        >
          {definition}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function DetailView({
  item,
  lang,
  onClose,
}: {
  item: GlossaryItem;
  lang: string;
  onClose: () => void;
}) {
  const c = usePalette();
  const definition = lang === 'tr' ? item.definition_tr : item.definition_en;
  const fallbackDefinition = lang === 'tr' ? item.definition_en : item.definition_tr;
  const term = lang === 'tr' && item.term_tr ? item.term_tr : item.term_en;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <X size={24} color="#0E1116" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0 }}>
        {/* Eyebrow + category */}
        <Mono style={{ fontSize: 10, color: '#0F2D5C', letterSpacing: 1.5 }}>
          {(CATEGORY_LABELS[item.category as Category] ?? item.category).toUpperCase()}
        </Mono>

        {/* Term + abbreviation row */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 32,
              fontWeight: '800',
              color: '#0E1116',
              lineHeight: 36,
            }}
          >
            {term}
          </Text>
          {item.abbreviation && (
            <Mono
              style={{
                fontSize: 14,
                color: '#5A6478',
                backgroundColor: '#EDEFF3',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                marginBottom: 4,
              }}
            >
              {item.abbreviation}
            </Mono>
          )}
        </View>

        {/* IPA + POS + verified */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
          {item.ipa && (
            <Text style={{ fontSize: 14, color: '#5A6478', fontStyle: 'italic' }}>
              /{item.ipa}/
            </Text>
          )}
          {item.pos && (
            <Text style={{ fontSize: 12, color: '#8A93A6', fontFamily: FONTS.body700 }}>
              {item.pos}
            </Text>
          )}
          {item.audio_url && (
            <TouchableOpacity
              onPress={() => Linking.openURL(item.audio_url!)}
              hitSlop={10}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Volume2 size={16} color="#0F2D5C" />
              <Text style={{ fontSize: 12, color: '#0F2D5C', fontFamily: FONTS.body700 }}>Sesli dinle</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Difficulty stars */}
        <View style={{ flexDirection: 'row', gap: 2, marginTop: 12 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={14}
              color="#FFD56B"
              fill={n <= item.difficulty ? '#FFD56B' : 'transparent'}
            />
          ))}
        </View>

        {/* Definition */}
        {definition ? (
          <View style={{ marginTop: 24 }}>
            <Eyebrow>TANIM</Eyebrow>
            <Text
              style={{
                fontSize: 15,
                color: '#0E1116',
                lineHeight: 22,
                marginTop: 6,
                fontFamily: FONTS.body,
              }}
            >
              {definition}
            </Text>
          </View>
        ) : fallbackDefinition ? (
          <View style={{ marginTop: 24 }}>
            <Eyebrow>{lang === 'tr' ? 'DEFINITION (EN)' : 'TANIM (TR)'}</Eyebrow>
            <Text
              style={{
                fontSize: 15,
                color: '#5A6478',
                lineHeight: 22,
                marginTop: 6,
                fontFamily: FONTS.body,
                fontStyle: 'italic',
              }}
            >
              {fallbackDefinition}
            </Text>
          </View>
        ) : null}

        {/* Example usage */}
        {item.example_usage && (
          <View style={{ marginTop: 20 }}>
            <Eyebrow>ÖRNEK KULLANIM</Eyebrow>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderLeftWidth: 3,
                borderLeftColor: '#0F2D5C',
                borderRadius: 6,
                padding: 12,
                marginTop: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: '#0E1116',
                  fontStyle: 'italic',
                  lineHeight: 21,
                }}
              >
                "{item.example_usage}"
              </Text>
            </View>
          </View>
        )}

        {/* ICAO reference */}
        {item.icao_reference && (
          <View style={{ marginTop: 20 }}>
            <Eyebrow>ICAO REFERANS</Eyebrow>
            <Mono style={{ fontSize: 12, color: '#0F2D5C', marginTop: 6 }}>
              {item.icao_reference}
            </Mono>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function EmptyState({ query, category }: { query: string; category: Category | null }) {
  const hasFilter = query.length > 0 || category !== null;
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      }}
    >
      <Text style={{ fontSize: 48, marginBottom: 12 }}>📚</Text>
      <Text
        style={{
          fontFamily: FONTS.body800,
          fontSize: 16,
          color: '#0E1116',
          textAlign: 'center',
        }}
      >
        {hasFilter ? 'Eşleşen terim yok' : 'Sözlük henüz hazırlanıyor'}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: '#5A6478',
          textAlign: 'center',
          marginTop: 8,
          lineHeight: 19,
        }}
      >
        {hasFilter
          ? 'Aramayı değiştir veya filtreyi kaldır.'
          : '50.000 havacılık terimi yükleniyor. İlk parti yakında.'}
      </Text>
    </View>
  );
}

/**
 * PlacementCard — profile sayfasında kullanılır.
 *
 * - Son placement sonucu (level + 4 score + tarih)
 * - "Tekrar al" butonu — cooldown gate (30 gün)
 * - Cooldown aktifse: kalan gün gösterimi
 * - Hiç test yoksa: ilk test'e davet
 */
import { TouchableOpacity, View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import {
  useUserPlacementResult,
  useCanTakePlacement,
} from '@/features/placement/api';
import { FONTS, Mono, Body } from '@/components/airspeak';

interface Props {
  userId: string | null | undefined;
}

const LEVEL_COLOR: Record<string, string> = {
  A1: '#E63946',
  A2: '#F2C14E',
  B1: '#1F4FB6',
  B2: '#2DBE6C',
  C1: '#7C5CFF',
};

export function PlacementCard({ userId }: Props) {
  const { result, loading } = useUserPlacementResult(userId);
  const { state: canTake } = useCanTakePlacement(userId);

  if (loading && !result) return null;

  // Henüz test alınmamış
  if (!result || !result.overall_level) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/(auth)/onboarding/level-test' as any)}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: '#FFD56B',
          borderBottomWidth: 4,
          borderBottomColor: '#F2C14E',
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: '#FFE4E7',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>📋</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#0E1116' }}>
            Placement test almadın
          </Text>
          <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }}>
            5 dakika · seviyeni belirle
          </Body>
        </View>
        <Text style={{ fontSize: 18, color: '#F2C14E' }}>›</Text>
      </TouchableOpacity>
    );
  }

  const level = result.overall_level;
  const levelColor = LEVEL_COLOR[level] ?? '#1F4FB6';
  const takenDate = new Date(result.taken_at).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const canRetry = canTake?.can_take ?? false;
  const daysRemaining = canTake?.days_remaining ?? 0;

  function onRetry() {
    if (!canRetry) {
      Alert.alert(
        'Henüz tekrar test alamazsın',
        `${daysRemaining} gün sonra tekrar test alabilirsin. Cooldown 30 gün.`,
      );
      return;
    }
    Alert.alert(
      'Placement testi yenile',
      'Bu seni yeniden değerlendirir ve seviyeni günceller. 5-10 dakika sürer. Devam mı?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Başla',
          onPress: () => router.push('/(auth)/onboarding/level-test' as any),
        },
      ],
    );
  }

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        borderBottomWidth: 4,
        borderBottomColor: '#DCE0E8',
        padding: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: levelColor,
            backgroundColor: `${levelColor}11`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 22,
              fontWeight: '700',
              color: levelColor,
              lineHeight: 24,
            }}
          >
            {level}
          </Text>
          <Mono style={{ fontSize: 8, color: levelColor, letterSpacing: 0.8 }}>CEFR</Mono>
        </View>
        <View style={{ flex: 1 }}>
          <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 1 }}>
            PLACEMENT · {result.attempt_number}. ATTEMPT
          </Mono>
          <Text
            style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#0E1116', marginTop: 2 }}
          >
            Son test: {takenDate}
          </Text>
          {result.questions_answered > 0 && (
            <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8, marginTop: 2 }}>
              {result.questions_answered} soru
              {result.test_duration_seconds
                ? ` · ${Math.round(result.test_duration_seconds / 60)} dk`
                : ''}
            </Mono>
          )}
        </View>
      </View>

      {/* 4 dimension scores */}
      <View
        style={{
          flexDirection: 'row',
          gap: 6,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#EDEFF3',
          marginBottom: 12,
        }}
      >
        <ScorePill label="VOC" value={result.vocabulary_score} />
        <ScorePill label="GRA" value={result.grammar_score} />
        <ScorePill label="LIS" value={result.listening_score} />
        <ScorePill label="REA" value={result.reading_score} />
      </View>

      {/* Retry CTA */}
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.85}
        style={{
          paddingVertical: 10,
          backgroundColor: canRetry ? '#FAFAF7' : '#F4F5F8',
          borderRadius: 10,
          borderWidth: 1,
          borderColor: canRetry ? '#E63946' : '#DCE0E8',
          alignItems: 'center',
        }}
      >
        <Mono
          style={{
            fontSize: 11,
            color: canRetry ? '#E63946' : '#8A93A6',
            letterSpacing: 1,
          }}
        >
          {canRetry
            ? '🔄 TESTİ YENİLE'
            : `⏱ ${daysRemaining} GÜN SONRA TEKRAR ALINABİLİR`}
        </Mono>
      </TouchableOpacity>
    </View>
  );
}

function ScorePill({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0;
  const tone = v >= 4 ? '#2DBE6C' : v >= 3 ? '#F2C14E' : v >= 1 ? '#E63946' : '#8A93A6';
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: `${tone}11`,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: FONTS.body800, fontSize: 16, color: tone }}>
        {value !== null ? value.toFixed(1) : '—'}
      </Text>
      <Mono style={{ fontSize: 8, color: '#8A93A6', letterSpacing: 0.8, marginTop: 1 }}>
        {label}
      </Mono>
    </View>
  );
}

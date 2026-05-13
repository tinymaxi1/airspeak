/**
 * Result screen — senaryo sonu skor + breakdown.
 * conversationPlayStore'dan turn results okur.
 */
import { ScrollView, View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mono, Body, FONTS, Button3D, BackButton } from '@/components/airspeak';
import { useConversationPlayStore } from '@/stores/conversationPlayStore';

export default function ResultScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ scenario: string }>();
  const slug = typeof params.scenario === 'string' ? params.scenario : null;

  const { scenarioTitle, turnResults, reset } = useConversationPlayStore();

  const avgScore = useMemo(() => {
    if (turnResults.length === 0) return 0;
    return Math.round(turnResults.reduce((sum, r) => sum + r.matchScore, 0) / turnResults.length);
  }, [turnResults]);

  const totalHit = useMemo(
    () => turnResults.reduce((s, r) => s + r.mustIncludeHit.length, 0),
    [turnResults],
  );
  const totalMiss = useMemo(
    () => turnResults.reduce((s, r) => s + r.mustIncludeMiss.length, 0),
    [turnResults],
  );

  function handleRetry() {
    reset();
    if (slug) router.replace({ pathname: '/conversation/[scenario]', params: { scenario: slug } });
  }
  function handleNew() {
    reset();
    router.replace('/conversation');
  }
  function handleHome() {
    reset();
    router.replace('/(tabs)/home');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#06091A' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: 'rgba(15, 30, 71, 0.6)' }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <BackButton onPress={handleHome} color="#FFFFFF" label={t('common.home', 'Anasayfa')} />
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.7)' }}>
              {t('conversation.resultEyebrow', 'SONUÇ')}
            </Mono>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 18, color: '#FFFFFF', marginTop: 2 }}>
              {scenarioTitle ?? '—'}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Skor banner */}
        <View
          style={{
            backgroundColor: avgScore >= 70 ? '#2DBE6C' : avgScore >= 40 ? '#FFD56B' : '#E63946',
            borderRadius: 14,
            padding: 20,
            alignItems: 'center',
            borderBottomWidth: 4,
            borderBottomColor: 'rgba(0,0,0,0.2)',
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 50 }}>{avgScore >= 70 ? '🎯' : avgScore >= 40 ? '👍' : '💪'}</Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 56, fontWeight: '700', color: '#FFFFFF', marginTop: 4 }}>
            {avgScore}
          </Text>
          <Body color="rgba(255,255,255,0.9)" style={{ fontSize: 13 }}>
            {t('conversation.avgScore', 'ortalama eşleşme · {{turns}} turn', { turns: turnResults.length })}
          </Body>
        </View>

        {/* Must include özet */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(45,190,108,0.12)', borderColor: 'rgba(45,190,108,0.4)', borderWidth: 1, borderRadius: 10, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#4FD487' }}>{totalHit}</Text>
            <Body color="rgba(255,255,255,0.7)" style={{ fontSize: 11, marginTop: 2 }}>{t('conversation.hitWords', 'doğru kelime')}</Body>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(230,57,70,0.12)', borderColor: 'rgba(230,57,70,0.4)', borderWidth: 1, borderRadius: 10, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#FB6D78' }}>{totalMiss}</Text>
            <Body color="rgba(255,255,255,0.7)" style={{ fontSize: 11, marginTop: 2 }}>{t('conversation.missWords', 'eksik kelime')}</Body>
          </View>
        </View>

        {/* Turn breakdown */}
        {turnResults.map((r, idx) => (
          <View
            key={r.turnId + idx}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 10,
              padding: 12,
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: 1.2 }}>
                TURN {idx + 1}
              </Mono>
              <Text style={{ fontFamily: FONTS.mono700, fontSize: 14, color: r.matchScore >= 70 ? '#4FD487' : '#FFD56B' }}>
                {r.matchScore}%
              </Text>
            </View>
            {r.mustIncludeHit.length > 0 && (
              <Text style={{ fontSize: 12, color: '#4FD487', marginTop: 4 }}>
                ✓ {r.mustIncludeHit.join(', ')}
              </Text>
            )}
            {r.mustIncludeMiss.length > 0 && (
              <Text style={{ fontSize: 12, color: '#FB6D78', marginTop: 2 }}>
                ✗ {r.mustIncludeMiss.join(', ')}
              </Text>
            )}
            {r.expectedResponse && (
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4, fontStyle: 'italic' }}>
                "{r.expectedResponse}"
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#06091A' }}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }}>
          <Button3D variant="primary" fullWidth onPress={handleRetry}>
            🔄 {t('conversation.retry', 'Tekrar dene')}
          </Button3D>
          <Button3D variant="secondary" fullWidth onPress={handleNew}>
            ➕ {t('conversation.newScenario', 'Yeni senaryo')}
          </Button3D>
        </View>
      </SafeAreaView>
    </View>
  );
}

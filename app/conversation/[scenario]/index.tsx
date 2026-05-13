/**
 * Briefing screen — pre-scenario context.
 *
 * Senaryo seçildikten sonra direkt play'e gitmek yerine kullanıcıya:
 *   📋 DURUM, 👤 ROLÜN, 🎯 HEDEFİN, 📚 ANAHTAR KELİMELER, ⏱ süre
 * gösterilir. [Başla] → /conversation/[scenario]/play
 */
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mono,
  Body,
  Eyebrow,
  FONTS,
  TopoBackground,
  BackButton,
  Button3D,
} from '@/components/airspeak';
import { useScenario } from '@/features/conversation/useScenarios';
import { useConversationPlayStore } from '@/stores/conversationPlayStore';

interface VocabItem {
  term: string;
  definition_tr?: string;
  definition_en?: string;
}

export default function BriefingScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ scenario: string }>();
  const slug = typeof params.scenario === 'string' ? params.scenario : null;
  const { data: scenario, isLoading } = useScenario(slug);
  const startPlay = useConversationPlayStore((s) => s.start);
  const [vocabExpanded, setVocabExpanded] = useState(false);

  const lang = i18n.language === 'tr' ? 'tr' : 'en';

  function handleStart() {
    if (!scenario || !slug) return;
    startPlay(slug, (lang === 'tr' ? scenario.title_tr : scenario.title) ?? slug);
    router.push({ pathname: '/conversation/[scenario]/play', params: { scenario: slug } });
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#06091A', justifyContent: 'center' }}>
        <ActivityIndicator color="#FFD56B" />
      </View>
    );
  }
  if (!scenario) {
    return (
      <View style={{ flex: 1, backgroundColor: '#06091A', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {t('conversation.notFound', 'Senaryo bulunamadı.')}
        </Text>
        <View style={{ marginTop: 16 }}>
          <Button3D variant="primary" fullWidth onPress={() => router.back()}>
            {t('common.back', 'Geri')}
          </Button3D>
        </View>
      </View>
    );
  }

  const briefingTxt =
    (scenario as any).briefing?.[lang] ?? scenario.setup_tr ?? scenario.setup ?? '';
  const learnerRoleTxt = (scenario as any).learner_role?.[lang] ?? '';
  const objectiveTxt = (scenario as any).objective?.[lang] ?? '';
  const keyVocab = ((scenario as any).key_vocabulary ?? []) as VocabItem[];
  const durationSec =
    (scenario as any).estimated_duration_seconds ?? scenario.estimated_minutes * 60 ?? 120;
  const durationMin = Math.max(1, Math.ceil(durationSec / 60));

  return (
    <View style={{ flex: 1, backgroundColor: '#06091A' }}>
      <View style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <TopoBackground />
      </View>
      <SafeAreaView edges={['top']} style={{ backgroundColor: 'rgba(15, 30, 71, 0.6)' }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <BackButton onPress={() => router.back()} color="#FFFFFF" label={t('common.back', 'Geri')} />
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.7)' }}>
              {t('conversation.briefingEyebrow', 'BRİFİNG')}
            </Mono>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 22, color: '#FFFFFF', marginTop: 2 }}>
              {lang === 'tr' ? scenario.title_tr : scenario.title}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* DURUM */}
        {!!briefingTxt && (
          <View style={cardStyle('#FFD56B')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>📋</Text>
              <Mono style={{ fontSize: 11, letterSpacing: 1.6, color: '#FFD56B' }}>
                {t('conversation.situation', 'DURUM')}
              </Mono>
            </View>
            <Body color="rgba(255,255,255,0.92)" style={{ fontSize: 14, lineHeight: 21, marginTop: 8 }}>
              {briefingTxt}
            </Body>
          </View>
        )}

        {/* ROLÜN */}
        {!!learnerRoleTxt && (
          <View style={cardStyle('#7C5CFF')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>👤</Text>
              <Mono style={{ fontSize: 11, letterSpacing: 1.6, color: '#9B7CFF' }}>
                {t('conversation.yourRole', 'ROLÜN')}
              </Mono>
            </View>
            <Body color="rgba(255,255,255,0.92)" style={{ fontSize: 14, lineHeight: 21, marginTop: 8 }}>
              {learnerRoleTxt}
            </Body>
          </View>
        )}

        {/* HEDEFİN */}
        {!!objectiveTxt && (
          <View style={cardStyle('#4FD487')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>🎯</Text>
              <Mono style={{ fontSize: 11, letterSpacing: 1.6, color: '#4FD487' }}>
                {t('conversation.objective', 'HEDEFİN')}
              </Mono>
            </View>
            <Body color="rgba(255,255,255,0.92)" style={{ fontSize: 14, lineHeight: 21, marginTop: 8 }}>
              {objectiveTxt}
            </Body>
          </View>
        )}

        {/* ANAHTAR KELİMELER */}
        {keyVocab.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setVocabExpanded(!vocabExpanded)}
            style={cardStyle('#2EA8FF')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>📚</Text>
              <Mono style={{ fontSize: 11, letterSpacing: 1.6, color: '#2EA8FF', flex: 1 }}>
                {t('conversation.keyVocab', 'ANAHTAR KELİMELER')} ({keyVocab.length})
              </Mono>
              <Text style={{ color: '#2EA8FF', fontSize: 14 }}>{vocabExpanded ? '▲' : '▼'}</Text>
            </View>
            {vocabExpanded ? (
              <View style={{ marginTop: 10, gap: 10 }}>
                {keyVocab.map((v, idx) => (
                  <View key={idx} style={{ paddingBottom: 8, borderBottomWidth: idx < keyVocab.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
                    <Text style={{ fontFamily: FONTS.mono700, fontSize: 13, color: '#FFD56B' }}>
                      {v.term}
                    </Text>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2, lineHeight: 17 }}>
                      {(lang === 'tr' ? v.definition_tr : v.definition_en) ?? ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
                {keyVocab.slice(0, 4).map((v) => v.term).join(' · ')}
                {keyVocab.length > 4 ? ' ...' : ''}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Tahmini süre */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <Text style={{ fontSize: 16 }}>⏱</Text>
          <Body color="rgba(255,255,255,0.7)" style={{ fontSize: 13 }}>
            {t('conversation.estDuration', 'Tahmini süre: ~{{min}} dk', { min: durationMin })}
          </Body>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#06091A' }}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }}>
          <Button3D variant="primary" fullWidth onPress={handleStart}>
            {t('conversation.start', 'Başla')} ✈
          </Button3D>
        </View>
      </SafeAreaView>
    </View>
  );
}

function cardStyle(accent: string): any {
  return {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderLeftWidth: 3,
    borderLeftColor: accent,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  };
}

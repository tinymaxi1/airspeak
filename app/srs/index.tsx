/**
 * SRS Review Screen — Spaced Repetition flashcard tekrar
 *
 * Yeni tasarım (airspeak design system):
 * - LessonChrome (X + progress + hearts)
 * - Eyebrow: NEW veya REVIEW
 * - Term card (büyük, ortalı): kelime + IPA + kategori
 * - Cevap aç → çeviri + tanım + örnek cümle
 * - 4 quality buton: Yeniden / Zor / İyi / Kolay
 */
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVocab } from '@/features/content/api';
import type { VocabTermRow } from '@/features/content/types';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { UserRole } from '@/types/profile';

/** Eski TS shape'i ile uyumluluk için tip alias */
type VocabularyTerm = VocabTermRow & {
  termTr?: string | null;
  definitionTr?: string | null;
};
import { useSrsStore } from '@/stores/srsStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useQuestsStore } from '@/stores/questsStore';
import { useLessonHistoryStore } from '@/stores/lessonHistoryStore';
import { isNewCard } from '@/features/srs/algorithm';
import { track } from '@/lib/posthog';
import {
  LessonChrome,
  Eyebrow,
  Mono,
  Body,
  FONTS,
  Button3D,
} from '@/components/airspeak';

interface QualityOpt {
  value: 1 | 3 | 4 | 5;
  label: string;
  emoji: string;
  bg: string;
  fg: string;
  bottom: string;
}

export default function SrsReviewScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const ensureCard = useSrsStore((s) => s.ensureCard);
  const reviewTerm = useSrsStore((s) => s.reviewTerm);
  const cards = useSrsStore((s) => s.cards);
  const addXp = useGamificationStore((s) => s.addXp);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);
  const recordHistoryActivity = useLessonHistoryStore((s) => s.recordActivity);
  const incrementQuest = useQuestsStore((s) => s.incrementProgress);
  const role = useOnboardingStore((s) => s.role) as UserRole | null;
  const { data: vocabRows = [] } = useVocab(role);

  const [queue, setQueue] = useState<VocabTermRow[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    if (vocabRows.length === 0) return;
    const due: VocabTermRow[] = [];
    const newCards: VocabTermRow[] = [];

    for (const term of vocabRows) {
      const card = cards[term.slug];
      if (!card) {
        ensureCard(term.slug);
        newCards.push(term);
      } else if (card.nextReviewAt <= Date.now()) {
        due.push(term);
      }
    }

    const session = [...due, ...newCards.slice(0, 5)];
    setQueue(session.sort(() => Math.random() - 0.5));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vocabRows.length]);

  const total = queue.length;
  const term = queue[currentIdx];

  const QUALITY_OPTS: QualityOpt[] = [
    { value: 1, label: t('screens.srs.again', 'Yeniden'), emoji: '😵', bg: '#E63946', fg: '#FFFFFF', bottom: '#C8202E' },
    { value: 3, label: t('screens.srs.hard', 'Zor'), emoji: '😬', bg: '#FF7847', fg: '#FFFFFF', bottom: '#E5602F' },
    { value: 4, label: t('screens.srs.good', 'İyi'), emoji: '🙂', bg: '#2EA8FF', fg: '#FFFFFF', bottom: '#1B8FE0' },
    { value: 5, label: t('screens.srs.easy', 'Kolay'), emoji: '😎', bg: '#2DBE6C', fg: '#FFFFFF', bottom: '#22A659' },
  ];

  // ─── EMPTY STATE ───
  if (total === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0F1E47',
          justifyContent: 'center',
          padding: 24,
          gap: 24,
        }}
      >
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 80 }}>🎉</Text>
          <Mono style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 2.16 }}>
            {t('screens.srs.allDoneEyebrow', 'TEKRAR KUYRUĞU BOŞ')}
          </Mono>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 32,
              fontWeight: '700',
              color: '#FFFFFF',
              letterSpacing: -0.96,
              textAlign: 'center',
            }}
          >
            {t('screens.srs.allDoneTitle', 'Tüm tekrarlar tamam!')}
          </Text>
          <Body color="rgba(255,255,255,0.85)" style={{ fontSize: 15, textAlign: 'center' }}>
            {t('screens.srs.allDoneSub', 'Yarın yeni terimler ve tekrarlar hazır olacak.')}
          </Body>
        </View>
        <Button3D variant="primary" fullWidth onPress={() => router.replace('/(tabs)/home')}>
          {t('screens.srs.backHome', 'Ana sayfa →')}
        </Button3D>
      </View>
    );
  }

  // ─── SESSION COMPLETE ───
  if (!term) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0F1E47',
          justifyContent: 'center',
          padding: 24,
          gap: 24,
        }}
      >
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 80 }}>✅</Text>
          <Mono style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 2.16 }}>
            {t('screens.srs.sessionDoneEyebrow', 'OTURUM TAMAM')}
          </Mono>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 38,
              fontWeight: '700',
              color: '#FFFFFF',
              letterSpacing: -1.14,
              textAlign: 'center',
            }}
          >
            {t('screens.srs.sessionDoneTitle', 'Süper iş!')}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.body700,
              fontSize: 17,
              color: '#FFD56B',
            }}
          >
            {t('screens.srs.sessionDoneCount', '{{count}} terim tekrar edildi', { count: reviewedCount })}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#E63946',
            borderRadius: 14,
            padding: 20,
            alignItems: 'center',
            borderBottomWidth: 4,
            borderBottomColor: '#C8202E',
          }}
        >
          <Mono style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.8 }}>
            XP EARNED
          </Mono>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 56,
              fontWeight: '700',
              color: '#FFFFFF',
              letterSpacing: -1.68,
              lineHeight: 56,
              marginTop: 4,
            }}
          >
            +{reviewedCount * 4}
          </Text>
        </View>

        <Button3D variant="primary" fullWidth onPress={() => router.replace('/(tabs)/home')}>
          {t('screens.srs.finish', 'Bitir →')}
        </Button3D>
      </View>
    );
  }

  // ─── NORMAL CARD ───
  const card = cards[term.slug];
  const isNew = !card || isNewCard(card);

  function handleQuality(quality: 1 | 3 | 4 | 5) {
    reviewTerm(term!.slug, quality);
    addXp(quality >= 4 ? 5 : 3, 'srs_review');
    incrementQuest('srs_review', 1);
    if (reviewedCount === 0) {
      recordDailyActivity();
      recordHistoryActivity('srs');
      incrementQuest('streak_check', 1);
    }
    setReviewedCount((c) => c + 1);
    track('srs_review_completed', {
      term_id: term!.slug,
      quality,
    });
    setShowAnswer(false);
    setCurrentIdx(currentIdx + 1);
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']}>
        <LessonChrome
          progress={(currentIdx / total) * 100}
          hearts={5}
          onClose={() => router.back()}
        />
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Status pill */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Mono style={{ fontSize: 11, color: '#5A6478' }}>
            {t('screens.srs.cardN', 'Kart {{n}} / {{total}}', { n: currentIdx + 1, total })}
          </Mono>
          <View
            style={{
              backgroundColor: isNew ? '#2DBE6C' : '#FFD56B',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Mono style={{ fontSize: 10, color: isNew ? '#FFFFFF' : '#0A1430', letterSpacing: 0.9 }}>
              {isNew ? `🌱 ${t('screens.srs.new', 'YENİ')}` : `🔄 ${t('screens.srs.review', 'TEKRAR')}`}
            </Mono>
          </View>
        </View>

        {/* Term card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
            padding: 24,
            minHeight: 300,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.1 }}>
            {term.category ?? ''} · {term.ipa ?? ''}
          </Mono>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 38,
              fontWeight: '700',
              color: '#0E1116',
              letterSpacing: -1.14,
              textAlign: 'center',
            }}
          >
            {term.term}
          </Text>

          {showAnswer && (
            <View style={{ gap: 12, alignItems: 'center', width: '100%' }}>
              <View
                style={{
                  height: 1,
                  width: '100%',
                  backgroundColor: '#DCE0E8',
                }}
              />
              <Text
                style={{
                  fontFamily: FONTS.body800,
                  fontSize: 22,
                  color: '#E63946',
                  textAlign: 'center',
                }}
              >
                {term.term_tr ?? ''}
              </Text>
              <Body color="#5A6478" style={{ fontSize: 14, textAlign: 'center', lineHeight: 21 }}>
                {term.definition_tr ?? ''}
              </Body>
              {term.example && (
                <View
                  style={{
                    backgroundColor: '#EDEFF3',
                    borderRadius: 10,
                    padding: 12,
                    width: '100%',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 14,
                      color: '#0E1116',
                      fontStyle: 'italic',
                      marginBottom: 4,
                    }}
                  >
                    "{term.example}"
                  </Text>
                  {term.example_tr && (
                    <Body color="#5A6478" style={{ fontSize: 12 }}>
                      {term.example_tr}
                    </Body>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action area */}
      <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
        <View style={{ padding: 16 }}>
          {!showAnswer ? (
            <Button3D variant="primary" fullWidth onPress={() => setShowAnswer(true)}>
              {t('screens.srs.showAnswer', 'Cevabı göster 👀')}
            </Button3D>
          ) : (
            <View style={{ gap: 8 }}>
              <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center', marginBottom: 4 }}>
                {t('screens.srs.howHard', 'Bu terim ne kadar zordu?')}
              </Body>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {QUALITY_OPTS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.85}
                    onPress={() => handleQuality(opt.value)}
                    style={{
                      flex: 1,
                      backgroundColor: opt.bg,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      borderBottomWidth: 4,
                      borderBottomColor: opt.bottom,
                      gap: 4,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{opt.emoji}</Text>
                    <Mono style={{ fontSize: 11, color: opt.fg, letterSpacing: 0.9 }}>
                      {opt.label}
                    </Mono>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

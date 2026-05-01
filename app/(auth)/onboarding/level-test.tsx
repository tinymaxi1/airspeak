/**
 * Level Test — 4 Segmentli Çok Boyutlu Placement (yeni tasarım)
 *
 * Tasarım birebir (screens-onboarding.jsx PlacementIntroScreen + PlacementQuestionScreen):
 * - Intro: STEP 3/6 + progress 50% + "Pre-flight check." + EXAMINER MODE navy card + 4 numbered segment rows
 * - Question: progress + segment eyebrow + Q counter + 3 pills (level/format/role) + ATC kırmızı vurgu + hint banner + 4 option card + Submit
 * - Break: Segment tamamlandı + sonraki segment kartı + Devam
 */
import { useState, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HHero,
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Button3D,
  Card3D,
  TopoBackground,
} from '@/components/airspeak';
import { finalizePlacement, type PlacementLevel } from '@/features/placement/api';
import {
  getQuestionsForSegment,
  calculateAllDimensions,
  calculateLevel,
  calculateScores,
  type Dimension,
  type PlacementQuestion,
} from '@/features/placement/questions';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { track } from '@/lib/posthog';

interface Answer {
  questionId: string;
  selectedId: string;
}

interface SegmentSpec {
  dim: Dimension;
  /** translation key in screens.levelTest.segments */
  k: string;
  /** Display number */
  n: number;
  /** Accent color */
  color: string;
}

const SEGMENTS: SegmentSpec[] = [
  { dim: 'generalEnglish', k: 'general', n: 1, color: '#2EA8FF' },
  { dim: 'aviationEnglish', k: 'aviation', n: 2, color: '#E63946' },
  { dim: 'aviationKnowledge', k: 'knowledge', n: 3, color: '#F2C14E' },
  { dim: 'communication', k: 'communication', n: 4, color: '#2DBE6C' },
];

type Step = 'intro' | 'segment' | 'segmentBreak';

export default function LevelTestScreen() {
  const c = usePalette();
  const { t, i18n } = useTranslation();
  const setPlacementResult = useOnboardingStore((s) => s.setPlacementResult);
  const role = useOnboardingStore((s) => s.role);

  const [step, setStep] = useState<Step>('intro');
  const [segmentIdx, setSegmentIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLongExplanation, setShowLongExplanation] = useState(false);
  const [allAnswers, setAllAnswers] = useState<Answer[]>([]);
  // Sprint 3f.B — test başlangıç zamanı (duration için)
  const [testStartedAt, setTestStartedAt] = useState<number | null>(null);

  const segmentQuestions = useMemo<PlacementQuestion[][]>(
    () => SEGMENTS.map((s) => getQuestionsForSegment(role, s.dim)),
    [role],
  );

  const totalQuestions = segmentQuestions.reduce((sum, arr) => sum + arr.length, 0);
  const answeredCount = allAnswers.length;
  const overallProgress = (answeredCount / Math.max(totalQuestions, 1)) * 100;

  const currentSegment = SEGMENTS[segmentIdx]!;
  const currentSegmentPool = segmentQuestions[segmentIdx] ?? [];
  const currentQuestion = currentSegmentPool[questionIdx];

  // ═══════════════ INTRO ═══════════════
  if (step === 'intro') {
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
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 22, color: '#0E1116' }}>←</Text>
            </TouchableOpacity>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478', flex: 1, textAlign: 'center' }}>
              {t('screens.levelTest.step')}
            </Mono>
            <View style={{ width: 22 }} />
          </View>
          {/* Progress 50% */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <View style={{ height: 4, backgroundColor: '#DCE0E8', borderRadius: 2, overflow: 'hidden' }}>
              <View style={{ width: '50%', height: '100%', backgroundColor: '#E63946' }} />
            </View>
          </View>
        </SafeAreaView>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        >
          <HHero>{t('screens.levelTest.intro.hero1')}{'\n'}{t('screens.levelTest.intro.hero2')}</HHero>
          <Body color="#5A6478" style={{ fontSize: 15, marginVertical: 12, marginBottom: 20 }}>
            {t('screens.levelTest.intro.subtitle', { count: totalQuestions })}
          </Body>

          {/* Examiner mode card */}
          <View
            style={{
              backgroundColor: '#0F1E47',
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: '#0F1E47',
              borderBottomWidth: 4,
              borderBottomColor: '#0A1430',
              padding: 20,
              marginBottom: 16,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative compass watermark */}
            <Text
              style={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                fontSize: 140,
                opacity: 0.18,
              }}
            >
              🧭
            </Text>
            <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.8 }}>
              {t('screens.levelTest.intro.examinerMode')}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 28,
                fontWeight: '700',
                color: '#FFFFFF',
                marginTop: 6,
                lineHeight: 31,
                letterSpacing: -0.56,
              }}
            >
              {t('screens.levelTest.intro.examinerTitle1')}{'\n'}
              {t('screens.levelTest.intro.examinerTitle2')}
            </Text>
          </View>

          {/* 4 segments */}
          {SEGMENTS.map((seg, idx) => {
            const count = segmentQuestions[idx]?.length ?? 0;
            return (
              <View
                key={seg.dim}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  marginBottom: 10,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#DCE0E8',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 26,
                    fontWeight: '700',
                    color: seg.color,
                    width: 36,
                    letterSpacing: -0.52,
                  }}
                >
                  0{seg.n}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.body700, fontSize: 15, color: '#0E1116' }}>
                    {t(`screens.levelTest.segments.${seg.k}`)}
                  </Text>
                  <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }}>
                    {t(`screens.levelTest.segments.${seg.k}Short`, { count })}
                  </Body>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
          <View style={{ padding: 16, gap: 8 }}>
            <Button3D
              variant="primary"
              fullWidth
              onPress={() => {
                setStep('segment');
                setTestStartedAt(Date.now());
                track('level_test_started');
              }}
            >
              {t('screens.levelTest.intro.begin')} →
            </Button3D>
            {__DEV__ && (
              <Button3D
                variant="ghost"
                fullWidth
                onPress={() => {
                  setPlacementResult({
                    generalEnglish: { label: 'B1', score: 65, confidence: 'medium', questionsAnswered: 6 },
                    aviationEnglish: { label: 'intermediate', score: 58, confidence: 'medium', questionsAnswered: 6 },
                    aviationKnowledge: { label: 'intermediate', score: 70, confidence: 'medium', questionsAnswered: 6 },
                    communication: { label: 'intermediate', score: 62, confidence: 'medium', questionsAnswered: 6 },
                    recommendations: {
                      primaryFocus: 'Aviation English phraseology',
                      roleAdvice: ['Read-back drill önemli', 'ICAO Doc 9432 oku'],
                      roadmap: ['Hafta 1: Numbers & callsigns', 'Hafta 2: Read-back patterns'],
                    },
                    completedAt: new Date().toISOString(),
                    level: 'B1',
                    totalScore: 64,
                    byCategory: {} as never,
                  });
                  router.replace('/(auth)/onboarding/placement-result');
                }}
              >
                {t('screens.levelTest.intro.skip')}
              </Button3D>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ═══════════════ SEGMENT BREAK (ara kart) ═══════════════
  if (step === 'segmentBreak') {
    const justFinishedIdx = segmentIdx;
    const justFinished = SEGMENTS[justFinishedIdx]!;
    const nextSegmentIdx = justFinishedIdx + 1;
    const nextSegment = SEGMENTS[nextSegmentIdx];

    const finishedAnswers = allAnswers.filter((a) =>
      (segmentQuestions[justFinishedIdx] ?? []).some((q) => q.id === a.questionId),
    );
    const correctInSegment = finishedAnswers.filter((a) => {
      const q = (segmentQuestions[justFinishedIdx] ?? []).find((qq) => qq.id === a.questionId);
      return q && a.selectedId === q.correctId;
    }).length;

    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <SafeAreaView edges={['top']}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
            <View style={{ height: 4, backgroundColor: '#DCE0E8', borderRadius: 2, overflow: 'hidden' }}>
              <View style={{ width: `${overallProgress}%`, height: '100%', backgroundColor: '#E63946' }} />
            </View>
          </View>
        </SafeAreaView>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 24, justifyContent: 'center', flexGrow: 1 }}
        >
          {/* Done celebration */}
          <View
            style={{
              backgroundColor: '#DDF7E6',
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: '#2DBE6C',
              borderBottomWidth: 4,
              borderBottomColor: '#22A659',
              padding: 24,
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 64 }}>✅</Text>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 28,
                fontWeight: '700',
                color: '#0E1116',
                marginTop: 8,
                letterSpacing: -0.56,
              }}
            >
              {t('screens.levelTest.break.done', { n: justFinishedIdx + 1 })}
            </Text>
            <Text
              style={{
                fontFamily: FONTS.body700,
                fontSize: 16,
                color: '#22A659',
                marginTop: 4,
              }}
            >
              {t(`screens.levelTest.segments.${justFinished.k}`)}
            </Text>
            <Body color="#5A6478" style={{ fontSize: 13, marginTop: 8, textAlign: 'center' }}>
              {t('screens.levelTest.break.score', { correct: correctInSegment, total: finishedAnswers.length })}
            </Body>
          </View>

          {/* Next segment preview */}
          {nextSegment && (
            <View
              style={{
                backgroundColor: '#0F1E47',
                borderRadius: 14,
                padding: 16,
                borderBottomWidth: 4,
                borderBottomColor: '#0A1430',
              }}
            >
              <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.8 }}>
                {t('screens.levelTest.break.next')}
              </Mono>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 }}>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 36,
                    fontWeight: '700',
                    color: nextSegment.color,
                    width: 50,
                    letterSpacing: -0.72,
                  }}
                >
                  0{nextSegment.n}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.body800,
                      fontSize: 17,
                      color: '#FFFFFF',
                    }}
                  >
                    {t(`screens.levelTest.segments.${nextSegment.k}`)}
                  </Text>
                  <Body color="rgba(255,255,255,0.75)" style={{ fontSize: 12, marginTop: 2 }}>
                    {t(`screens.levelTest.segments.${nextSegment.k}Short`, { count: segmentQuestions[nextSegmentIdx]?.length ?? 0 })}
                  </Body>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
          <View style={{ padding: 16 }}>
            <Button3D
              variant="primary"
              fullWidth
              onPress={() => {
                setSegmentIdx(nextSegmentIdx);
                setQuestionIdx(0);
                setSelectedId(null);
                setShowFeedback(false);
                setShowLongExplanation(false);
                setStep('segment');
              }}
            >
              {t('screens.levelTest.break.continue')}
            </Button3D>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ═══════════════ SEGMENT (soru ekranı) ═══════════════
  if (!currentQuestion) {
    setStep('segmentBreak');
    return null;
  }

  const handleAnswer = () => {
    if (!selectedId) return;
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (!selectedId) return;
    const newAnswer: Answer = { questionId: currentQuestion.id, selectedId };
    const newAllAnswers = [...allAnswers, newAnswer];
    setAllAnswers(newAllAnswers);

    const isLastInSegment = questionIdx + 1 >= currentSegmentPool.length;
    const isLastSegment = segmentIdx >= SEGMENTS.length - 1;

    if (isLastInSegment && isLastSegment) {
      const dims = calculateAllDimensions(newAllAnswers, role);
      const allPool = segmentQuestions.flat();
      const level = calculateLevel(newAllAnswers, allPool);
      const scores = calculateScores(newAllAnswers, allPool);

      setPlacementResult({
        generalEnglish: dims.generalEnglish,
        aviationEnglish: dims.aviationEnglish,
        aviationKnowledge: dims.aviationKnowledge,
        communication: dims.communication,
        recommendations: dims.recommendations,
        completedAt: new Date().toISOString(),
        level,
        totalScore: scores.total,
        byCategory: scores.byCategory,
      });
      track('level_test_completed', {
        result_level: level,
        score: scores.total,
        general_english: dims.generalEnglish.label,
        aviation_english: dims.aviationEnglish.label,
        aviation_knowledge: dims.aviationKnowledge.label,
        communication: dims.communication.label,
      });
      // Sprint 3f.B — DB'ye yaz (mevcut 4 dim → yeni 4 score map)
      // Mapping: generalEnglish→vocabulary, aviationEnglish→grammar,
      //          aviationKnowledge→listening, communication→reading.
      // Her dim'in CEFR label'ından band (1-5) hesaplanır.
      const labelToBand = (lbl: string): number => {
        const m: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5,
          beginner: 1, elementary: 2, intermediate: 3, advanced: 4, expert: 5 };
        return m[lbl] ?? 3;
      };
      const durationSec = testStartedAt ? Math.round((Date.now() - testStartedAt) / 1000) : null;
      void finalizePlacement({
        scores: {
          vocabulary: labelToBand(dims.generalEnglish.label),
          grammar: labelToBand(dims.aviationEnglish.label),
          listening: labelToBand(dims.aviationKnowledge.label),
          reading: labelToBand(dims.communication.label),
        },
        questionsAnswered: newAllAnswers.length,
        testDurationSeconds: durationSec ?? undefined,
      }).catch((e) => console.warn('finalizePlacement failed:', e));
      router.replace('/(auth)/onboarding/placement-result');
    } else if (isLastInSegment) {
      setStep('segmentBreak');
      setQuestionIdx(0);
      setSelectedId(null);
      setShowFeedback(false);
      setShowLongExplanation(false);
    } else {
      setQuestionIdx(questionIdx + 1);
      setSelectedId(null);
      setShowFeedback(false);
      setShowLongExplanation(false);
    }
  };

  const isCorrect = selectedId === currentQuestion.correctId;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              Alert.alert('', '', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', style: 'destructive', onPress: () => router.back() },
              ])
            }
          >
            <Text style={{ fontSize: 22, color: '#0E1116' }}>✕</Text>
          </TouchableOpacity>
          <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478', flex: 1, textAlign: 'center' }}>
            {currentSegment.n}/4 · {t(`screens.levelTest.segments.${currentSegment.k}`)}
          </Mono>
          <Mono style={{ fontSize: 12, color: '#5A6478' }}>
            {t('screens.levelTest.question.counter', {
              n: String(answeredCount + 1).padStart(2, '0'),
              total: totalQuestions,
            })}
          </Mono>
        </View>
        {/* Progress */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <View style={{ height: 6, backgroundColor: '#DCE0E8', borderRadius: 3, overflow: 'hidden' }}>
            <View
              style={{
                width: `${overallProgress}%`,
                height: '100%',
                backgroundColor: '#E63946',
              }}
            />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Pills row */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
          <Pill text={currentQuestion.level} variant="navy" />
          <Pill text={currentQuestion.category.toUpperCase()} variant="outline" />
          {role && <Pill text={role.toUpperCase()} variant="outline" />}
        </View>

        {/* Question */}
        {/* Soru metni: TR locale + questionTr varsa BÜYÜK Türkçe, İngilizce küçük referans.
            Diğer dillerde İngilizce büyük (henüz çevirisi yok). Yanıt şıkları İngilizce kalır
            (test edilen dil). */}
        {i18n.language === 'tr' && currentQuestion.questionTr ? (
          <>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 24,
                fontWeight: '700',
                color: '#0E1116',
                lineHeight: 30,
                letterSpacing: -0.48,
                marginBottom: 6,
              }}
            >
              {currentQuestion.questionTr.replace(/^[\p{Emoji}\s]+/u, '').trim()}
            </Text>
            <Body color="#8A93A6" style={{ fontSize: 12, marginBottom: 14 }}>
              EN: {currentQuestion.question}
            </Body>
          </>
        ) : (
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 24,
              fontWeight: '700',
              color: '#0E1116',
              lineHeight: 30,
              letterSpacing: -0.48,
              marginBottom: 12,
            }}
          >
            {currentQuestion.question}
          </Text>
        )}

        {/* Hint banner — kategoriye göre değişir (ATC mesajı sadece phraseology/listening için) */}
        {(() => {
          const cat = currentQuestion.category;
          const hintKey =
            cat === 'phraseology' || cat === 'listening'
              ? 'screens.levelTest.question.hintAtc'
              : cat === 'grammar'
                ? 'screens.levelTest.question.hintGrammar'
                : cat === 'vocabulary'
                  ? 'screens.levelTest.question.hintVocab'
                  : cat === 'reading'
                    ? 'screens.levelTest.question.hintReading'
                    : 'screens.levelTest.question.hintGeneral';
          return (
            <View
              style={{
                backgroundColor: '#EDEFF3',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 10,
                marginBottom: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Body style={{ fontSize: 13, color: '#5A6478' }}>
                {t(hintKey, t('screens.levelTest.question.hint'))}
              </Body>
            </View>
          );
        })()}

        {/* Context (if any) */}
        {currentQuestion.context && (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <Body color="#5A6478" style={{ fontSize: 14, lineHeight: 21 }}>
              {currentQuestion.context}
            </Body>
          </View>
        )}

        {/* Options */}
        <View style={{ gap: 10 }}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedId === option.id;
            const isThisCorrect = option.id === currentQuestion.correctId;
            const showAsCorrect = showFeedback && isThisCorrect;
            const showAsWrong = showFeedback && isSelected && !isThisCorrect;

            const borderColor = showAsCorrect
              ? '#2DBE6C'
              : showAsWrong
                ? '#E63946'
                : isSelected
                  ? '#E63946'
                  : '#DCE0E8';
            const bgColor = showAsCorrect ? '#DDF7E6' : showAsWrong ? '#FFE4E7' : isSelected ? '#FFE4E7' : '#FFFFFF';
            const letterBg = showAsCorrect
              ? '#2DBE6C'
              : showAsWrong
                ? '#E63946'
                : isSelected
                  ? '#E63946'
                  : '#EDEFF3';
            const letterColor = showAsCorrect || showAsWrong || isSelected ? '#FFFFFF' : '#5A6478';

            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.85}
                disabled={showFeedback}
                onPress={() => setSelectedId(option.id)}
                style={{
                  backgroundColor: bgColor,
                  borderRadius: 14,
                  borderWidth: isSelected || showAsCorrect || showAsWrong ? 2.5 : 1.5,
                  borderColor,
                  borderBottomWidth: isSelected || showAsCorrect || showAsWrong ? 4 : 1.5,
                  borderBottomColor: borderColor,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: letterBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.mono700,
                      fontSize: 14,
                      color: letterColor,
                    }}
                  >
                    {option.id.toUpperCase()}
                  </Text>
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: FONTS.body600,
                    fontSize: 15,
                    color: '#0E1116',
                    lineHeight: 21,
                  }}
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {showFeedback && (
          <View
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 14,
              backgroundColor: isCorrect ? '#DDF7E6' : '#FFE4E7',
              borderWidth: 1.5,
              borderColor: isCorrect ? '#2DBE6C' : '#E63946',
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.body800,
                fontSize: 16,
                color: isCorrect ? '#22A659' : '#C8202E',
                marginBottom: 6,
              }}
            >
              {isCorrect ? t('screens.levelTest.question.correct') : t('screens.levelTest.question.wrong')}
            </Text>
            <Body style={{ fontSize: 14, color: '#0E1116', lineHeight: 21 }}>
              {currentQuestion.explanationTr}
            </Body>
            {currentQuestion.icaoReference && (
              <Mono style={{ fontSize: 11, color: '#5A6478', marginTop: 6 }}>
                📘 {currentQuestion.icaoReference}
              </Mono>
            )}
            {currentQuestion.explanationLongTr && (
              <View style={{ marginTop: 10 }}>
                {!showLongExplanation ? (
                  <Button3D variant="ghost" fullWidth onPress={() => setShowLongExplanation(true)}>
                    {t('screens.levelTest.question.more')}
                  </Button3D>
                ) : (
                  <View
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1.5,
                      borderColor: '#DCE0E8',
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <Mono style={{ fontSize: 10, color: '#E63946', letterSpacing: 1.8 }}>
                      {t('screens.levelTest.question.longExp')}
                    </Mono>
                    <Body style={{ fontSize: 14, color: '#0E1116', lineHeight: 21, marginTop: 8, marginBottom: 10 }}>
                      {currentQuestion.explanationLongTr}
                    </Body>
                    <Button3D variant="ghost" fullWidth onPress={() => setShowLongExplanation(false)}>
                      {t('screens.levelTest.question.close')}
                    </Button3D>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
        <View style={{ padding: 16 }}>
          {!showFeedback ? (
            <Button3D variant="primary" fullWidth disabled={!selectedId} onPress={handleAnswer}>
              {t('screens.levelTest.question.submit')}
            </Button3D>
          ) : (
            <Button3D variant="primary" fullWidth onPress={handleNext}>
              {questionIdx + 1 >= currentSegmentPool.length && segmentIdx >= SEGMENTS.length - 1
                ? t('screens.levelTest.question.result')
                : questionIdx + 1 >= currentSegmentPool.length
                  ? t('screens.levelTest.question.next4', { n: segmentIdx + 2 })
                  : t('screens.levelTest.question.next')}
            </Button3D>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function Pill({
  text,
  variant,
}: {
  text: string;
  variant: 'navy' | 'outline';
}) {
  const isNavy = variant === 'navy';
  return (
    <View
      style={{
        backgroundColor: isNavy ? '#0F1E47' : 'transparent',
        borderWidth: isNavy ? 0 : 1.5,
        borderColor: '#DCE0E8',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      <Mono
        style={{
          fontSize: 10,
          color: isNavy ? '#FFFFFF' : '#5A6478',
          letterSpacing: 0.9,
        }}
      >
        {text}
      </Mono>
    </View>
  );
}

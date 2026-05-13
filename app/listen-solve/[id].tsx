/**
 * Listen & Solve Screen
 *
 * Stage state machine: briefing → playing → answering → feedback → done
 *
 * Pattern: scenario play.tsx'in basit versiyonu — TTS oku, soru göster, 4 multi-choice,
 * doğru/yanlış feedback + explanation, sonraki drill otomatik 2 sn sonra.
 */
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { usePalette } from '@/lib/usePalette';
import { safeSpeechSpeak, safeSpeechStop } from '@/lib/speechSafe';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useLessonHistoryStore } from '@/stores/lessonHistoryStore';
import { useActivityStore } from '@/stores/activityStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';
import { useDailyLimitsStore } from '@/stores/dailyLimitsStore';
import { useListenSolveLimit, bumpServerUsage } from '@/features/config/limits';
import { bumpUserXpForLeague } from '@/features/gamification/api';
import { PaywallSheet } from '@/components/paywall/PaywallSheet';
import { track } from '@/lib/posthog';
import {
  Eyebrow,
  Mono,
  Body,
  FONTS,
  Button3D,
} from '@/components/airspeak';
import { TabletShell } from '@/components/tablet';
import { pickListenSolveDrills, routeIdToFilters, useListenSolveDrills } from '@/features/listen-solve/api';
import { CATEGORY_LABEL, type ListenSolveDrill } from '@/features/listen-solve/drills';
import type { UserRole } from '@/types/profile';

type Stage = 'briefing' | 'playing' | 'answering' | 'feedback' | 'done';

export default function ListenSolveScreen() {
  const c = usePalette();
  const { t, i18n } = useTranslation();
  const isTr = i18n.language === 'tr';
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : 'practice';

  const role = useOnboardingStore((s) => s.role) as UserRole | null;
  const userLevel = useAuthStore((s) => s.profile?.level ?? null) as 'A2' | 'B1' | 'B2' | null;
  const addXp = useGamificationStore((s) => s.addXp);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);
  const recordHistoryActivity = useLessonHistoryStore((s) => s.recordActivity);
  const recordRecentActivity = useActivityStore((s) => s.recordActivity);

  // DB-first fetch (Sprint C2). Fallback TS hook içinde.
  const { category } = useMemo(() => routeIdToFilters(id), [id]);
  const { data: dbDrills, isLoading: drillsLoading } = useListenSolveDrills(role ?? 'all', null, category);

  // Picker: fetch sonucundan rol+kategori+level eşleşme, sonra shuffle + max 7
  const drills = useMemo<ListenSolveDrill[]>(() => {
    if (!dbDrills || dbDrills.length === 0) {
      // Hook hala loading ya da boş — pickListenSolveDrills TS fallback'i de işler
      return pickListenSolveDrills({
        role: role ?? 'all',
        category,
        level: userLevel && ['A2', 'B1', 'B2'].includes(userLevel) ? userLevel : undefined,
      });
    }
    // DB'den geleni shuffle + max 7
    const shuffled = [...dbDrills].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 7);
  }, [dbDrills, role, category, userLevel]);

  const [stage, setStage] = useState<Stage>('briefing');
  const [idx, setIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const startedAtRef = useRef<number>(0);

  // Sprint (post-C3d) — günlük limit + paywall
  const listenSolveLimit = useListenSolveLimit();
  const bumpDaily = useDailyLimitsStore((s) => s.bump);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const current = drills[idx];
  const total = drills.length;

  // Cleanup TTS
  useEffect(() => {
    return () => {
      safeSpeechStop();
    };
  }, []);

  // Drill yoksa erken çıkış (loading değilse)
  if (!drillsLoading && drills.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg, padding: 24 }}>
        <Text style={{ fontSize: 48 }}>🎧</Text>
        <Text style={{ fontFamily: FONTS.body800, fontSize: 18, color: '#0E1116', marginTop: 12, textAlign: 'center' }}>
          {t('screens.listenSolve.empty.title', 'Bu kategori için içerik yakında')}
        </Text>
        <Button3D variant="primary" onPress={() => router.back()} style={{ marginTop: 16 }}>
          {t('common.back', 'Geri')}
        </Button3D>
      </View>
    );
  }

  function playAudio() {
    if (!current) return;
    setStage('playing');
    const spoke = safeSpeechSpeak(current.audio_text, {
      language: 'en-US',
      rate: 0.95,
      pitch: 1.0,
      onDone: () => setStage('answering'),
      onError: () => setStage('answering'),
    });
    if (!spoke) {
      // TTS yoksa düz metinle direkt cevaba geç
      setStage('answering');
    }
  }

  function startDrill() {
    // Sprint (post-C3d) — günlük limit kontrolü
    if (!listenSolveLimit.allowed) {
      setPaywallOpen(true);
      return;
    }
    startedAtRef.current = Date.now();
    track('listen_solve_started', {
      drill_count: total,
      role: role ?? 'none',
      route_id: id,
    });
    playAudio();
  }

  function chooseAnswer(optionId: string) {
    if (stage !== 'answering') return;
    setSelectedId(optionId);
    const correct = optionId === current?.correct_id;
    Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    ).catch(() => {});
    if (correct) setCorrectCount((c) => c + 1);
    setStage('feedback');

    // 3 sn sonra sonraki drill (otomatik akış)
    setTimeout(() => {
      if (idx + 1 >= total) {
        finishDrill(correct ? correctCount + 1 : correctCount);
      } else {
        setIdx(idx + 1);
        setSelectedId(null);
        // Otomatik audio çal
        setTimeout(() => playAudio(), 200);
      }
    }, 3000);
  }

  function replay() {
    if (stage !== 'answering' && stage !== 'playing') return;
    playAudio();
  }

  function finishDrill(finalCorrect: number) {
    setStage('done');
    const score = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
    const xpGain = finalCorrect * 10;
    addXp(xpGain, 'listen_solve');
    recordDailyActivity();
    recordHistoryActivity('lesson');
    // Sprint (post-C3d) — server counter + league XP
    void bumpServerUsage('listen_solve_attempts', 1);
    if (xpGain > 0) void bumpUserXpForLeague('listen_solve', xpGain);
    bumpDaily('listen_solve_attempts', 1);
    recordRecentActivity({
      type: 'lesson',
      refId: `listen-solve-${id}`,
      titleTr: 'Dinle & Çöz',
      subtitleTr: `${finalCorrect}/${total} doğru`,
      score,
    });
    const durationSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
    track('listen_solve_completed', {
      drill_count: total,
      correct_count: finalCorrect,
      score,
      role: role ?? 'none',
      sub_role: null,
      duration_seconds: durationSeconds,
      category: routeIdToFilters(id).category ?? null,
      route_id: id,
    });
  }

  // ═══════════ DONE ═══════════
  if (stage === 'done') {
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <TabletShell background={c.bg}>
        <View style={{ flex: 1, backgroundColor: c.bg, padding: 24, justifyContent: 'center' }}>
          <Text style={{ fontSize: 80, textAlign: 'center', marginBottom: 12 }}>
            {score >= 70 ? '🏆' : score >= 40 ? '👍' : '💪'}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 28,
              fontWeight: '700',
              color: '#0E1116',
              textAlign: 'center',
              letterSpacing: -0.56,
              marginBottom: 4,
            }}
          >
            {t('screens.listenSolve.result.title', 'Drill bitti')}
          </Text>
          <Body color="#5A6478" style={{ fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            {t('screens.listenSolve.result.score', { correct: correctCount, total, score,
              defaultValue: '{{correct}}/{{total}} doğru · skor {{score}}' })}
          </Body>

          <Button3D
            variant="primary"
            fullWidth
            onPress={() => {
              setIdx(0);
              setCorrectCount(0);
              setSelectedId(null);
              setStage('briefing');
            }}
          >
            {t('screens.listenSolve.result.tryAgain', 'Tekrar dene')}
          </Button3D>
          <View style={{ height: 10 }} />
          <Button3D variant="ghost" fullWidth onPress={() => router.back()}>
            {t('screens.listenSolve.result.next', 'Çık')}
          </Button3D>
        </View>
      </TabletShell>
    );
  }

  // ═══════════ BRIEFING ═══════════
  if (stage === 'briefing') {
    const cat = current?.category;
    const catLabel = cat
      ? CATEGORY_LABEL[cat][isTr ? 'tr' : 'en']
      : t('screens.listenSolve.briefing.generalCat', 'Karışık');
    return (
      <TabletShell background={c.bg}>
        <View style={{ flex: 1, backgroundColor: c.bg }}>
          <SafeAreaView edges={['top']}>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ fontSize: 22, color: '#0E1116' }}>‹</Text>
              </TouchableOpacity>
              <Eyebrow>{t('screens.listenSolve.briefing.eyebrow', 'DİNLE & ÇÖZ')}</Eyebrow>
            </View>
          </SafeAreaView>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, flexGrow: 1 }}>
            <Text style={{ fontSize: 64, textAlign: 'center', marginVertical: 20 }}>🎧</Text>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 28,
                fontWeight: '700',
                color: '#0E1116',
                textAlign: 'center',
                letterSpacing: -0.56,
                marginBottom: 8,
              }}
            >
              {t('screens.listenSolve.briefing.title', 'Dinle ve cevap ver')}
            </Text>
            <Body color="#5A6478" style={{ fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
              {t('screens.listenSolve.briefing.subtitle', {
                count: total,
                cat: catLabel,
                defaultValue: '{{count}} drill · {{cat}}. Audio okunur, doğru cevabı seç.',
              })}
            </Body>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: '#DCE0E8',
                padding: 16,
                marginBottom: 20,
              }}
            >
              <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1 }}>
                {t('screens.listenSolve.briefing.howEyebrow', 'NASIL OYNANIR')}
              </Mono>
              <Body style={{ fontSize: 13, color: '#0E1116', marginTop: 6, lineHeight: 19 }}>
                {t('screens.listenSolve.briefing.howStep1', '1. Cihaz audio okur — dikkatle dinle')}
                {'\n'}
                {t('screens.listenSolve.briefing.howStep2', '2. "Tekrar dinle" ile tekrar edebilirsin')}
                {'\n'}
                {t('screens.listenSolve.briefing.howStep3', '3. 4 seçenekten doğru cevabı seç')}
                {'\n'}
                {t('screens.listenSolve.briefing.howStep4', '4. Her doğru +10 XP')}
              </Body>
            </View>
          </ScrollView>

          <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
            <View style={{ padding: 16 }}>
              <Button3D variant="primary" fullWidth onPress={startDrill}>
                {t('screens.listenSolve.briefing.start', 'Başla →')}
              </Button3D>
            </View>
          </SafeAreaView>
        </View>
      </TabletShell>
    );
  }

  // ═══════════ PLAYING / ANSWERING / FEEDBACK ═══════════
  if (!current) return null;

  return (
    <TabletShell background={c.bg}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <SafeAreaView edges={['top']}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  t('common.exit', 'Çık'),
                  t('screens.listenSolve.exitConfirm', 'Drill\'den çıkmak istiyor musun?'),
                  [
                    { text: t('common.cancel', 'Vazgeç'), style: 'cancel' },
                    { text: t('common.exit', 'Çık'), style: 'destructive', onPress: () => router.back() },
                  ],
                )
              }
            >
              <Text style={{ fontSize: 22, color: '#0E1116' }}>✕</Text>
            </TouchableOpacity>
            <Mono style={{ flex: 1, fontSize: 12, color: '#5A6478', textAlign: 'center', letterSpacing: 1 }}>
              {idx + 1} / {total}
            </Mono>
          </View>
          {/* Progress bar */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <View style={{ height: 6, backgroundColor: '#DCE0E8', borderRadius: 3, overflow: 'hidden' }}>
              <View
                style={{
                  width: `${((idx + (stage === 'feedback' ? 1 : 0)) / Math.max(total, 1)) * 100}%`,
                  height: '100%',
                  backgroundColor: '#E63946',
                }}
              />
            </View>
          </View>
        </SafeAreaView>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          {/* Audio play / replay button */}
          <View
            style={{
              backgroundColor: '#0F1E47',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              marginBottom: 20,
              borderBottomWidth: 4,
              borderBottomColor: '#0A1430',
            }}
          >
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 }}>
              {CATEGORY_LABEL[current.category][isTr ? 'tr' : 'en'].toUpperCase()}
            </Mono>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={replay}
              disabled={stage === 'playing'}
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: stage === 'playing' ? '#1F4FB6' : '#E63946',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 14,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 36 }}>{stage === 'playing' ? '🔊' : '▶'}</Text>
            </TouchableOpacity>
            <Body color="rgba(255,255,255,0.85)" style={{ fontSize: 13, marginTop: 6 }}>
              {stage === 'playing'
                ? t('screens.listenSolve.playing.now', 'Çalıyor…')
                : t('screens.listenSolve.playing.replay', 'Tekrar dinle')}
            </Body>
          </View>

          {/* Question */}
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 20,
              fontWeight: '700',
              color: '#0E1116',
              lineHeight: 26,
              letterSpacing: -0.4,
              marginBottom: 16,
            }}
          >
            {isTr ? current.question_tr : current.question_en}
          </Text>

          {/* Options */}
          <View style={{ gap: 10 }}>
            {current.options.map((opt) => {
              const isSelected = selectedId === opt.id;
              const isCorrect = opt.id === current.correct_id;
              const showAsCorrect = stage === 'feedback' && isCorrect;
              const showAsWrong = stage === 'feedback' && isSelected && !isCorrect;
              const borderColor = showAsCorrect
                ? '#2DBE6C'
                : showAsWrong
                  ? '#E63946'
                  : isSelected
                    ? '#E63946'
                    : '#DCE0E8';
              const bgColor = showAsCorrect ? '#DDF7E6' : showAsWrong ? '#FFE4E7' : '#FFFFFF';
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.85}
                  disabled={stage !== 'answering'}
                  onPress={() => chooseAnswer(opt.id)}
                  style={{
                    backgroundColor: bgColor,
                    borderRadius: 14,
                    borderWidth: isSelected || showAsCorrect ? 2.5 : 1.5,
                    borderColor,
                    borderBottomWidth: isSelected || showAsCorrect ? 4 : 1.5,
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
                      backgroundColor: showAsCorrect ? '#2DBE6C' : showAsWrong ? '#E63946' : isSelected ? '#E63946' : '#EDEFF3',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 14,
                        color: isSelected || showAsCorrect || showAsWrong ? '#FFFFFF' : '#5A6478',
                        fontWeight: '700',
                      }}
                    >
                      {opt.id.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={{ flex: 1, fontFamily: FONTS.body600, fontSize: 15, color: '#0E1116', lineHeight: 21 }}>
                    {isTr ? opt.label_tr : opt.label_en}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback */}
          {stage === 'feedback' && (
            <View
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 14,
                backgroundColor: selectedId === current.correct_id ? '#DDF7E6' : '#FFE4E7',
                borderWidth: 1.5,
                borderColor: selectedId === current.correct_id ? '#2DBE6C' : '#E63946',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.body800,
                  fontSize: 16,
                  color: selectedId === current.correct_id ? '#22A659' : '#C8202E',
                  marginBottom: 6,
                }}
              >
                {selectedId === current.correct_id
                  ? t('screens.listenSolve.feedback.correct', 'Doğru!')
                  : t('screens.listenSolve.feedback.incorrect', 'Yanlış')}
              </Text>
              <Body style={{ fontSize: 14, color: '#0E1116', lineHeight: 21 }}>
                {isTr ? current.explanation_tr : current.explanation_en}
              </Body>
              {/* Audio text gösterimi (yanlış cevap için yardımcı) */}
              <Mono style={{ fontSize: 11, color: '#5A6478', marginTop: 8, letterSpacing: 0.5 }}>
                {t('screens.listenSolve.feedback.transcript', 'AUDIO:')} "{current.audio_text}"
              </Mono>
            </View>
          )}

          {current.hint_tr && stage === 'answering' && (
            <View
              style={{
                marginTop: 14,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: '#FFF6E0',
                borderRadius: 10,
                borderLeftWidth: 3,
                borderLeftColor: '#F2C14E',
              }}
            >
              <Mono style={{ fontSize: 10, color: '#8A6914', letterSpacing: 1 }}>
                {t('screens.listenSolve.hintLabel', 'İPUCU')}
              </Mono>
              <Body style={{ fontSize: 13, color: '#5A4A20', marginTop: 2 }}>{current.hint_tr}</Body>
            </View>
          )}
        </ScrollView>
        <PaywallSheet
          visible={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          reason="listen_solve_limit"
        />
      </View>
    </TabletShell>
  );
}

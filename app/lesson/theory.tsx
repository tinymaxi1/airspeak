/**
 * Theory dersi — egzersiz olmayan, sadece okuma/anlatım.
 * Sprint 12 — lesson.type === 'theory' için lesson/[id].tsx'ten redirect edilir.
 *
 * Akış:
 * - URL: /lesson/theory?id=<lessonSlug>
 * - DB'den lesson çekilir (theory_md / theory_md_en / theory_image_url okunur)
 * - SimpleMarkdown ile render edilir
 * - "Anladım, devam et" → +5 XP, lesson tamam, geri dön
 */
import { ScrollView, View, Text, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button3D, SimpleMarkdown, FONTS, Eyebrow as ASEyebrow } from '@/components/airspeak';
import { useLesson } from '@/features/content/api';
import { useProgressStore } from '@/stores/progressStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useLessonProgressStore } from '@/stores/lessonProgressStore';
import { useActivityStore } from '@/stores/activityStore';
import { useLessonHistoryStore } from '@/stores/lessonHistoryStore';
import { getCurrentLanguage } from '@/lib/i18n';
import { bumpUserXp } from '@/features/league/api';
import { addCoins as addCoinsServer } from '@/features/wallet/api';
import { track } from '@/lib/posthog';
import { usePalette } from '@/lib/usePalette';

const THEORY_XP = 5;

export default function TheoryScreen() {
  const c = usePalette();
  const params = useLocalSearchParams<{ id: string }>();
  const lessonSlug = typeof params.id === 'string' ? params.id : '';
  const { data: lesson, isLoading } = useLesson(lessonSlug);

  const addXp = useGamificationStore((s) => s.addXp);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);
  const markLessonCompleted = useProgressStore((s) => s.markLessonCompleted);
  const markLessonProgressCompleted = useLessonProgressStore((s) => s.markCompleted);
  const recordRecentActivity = useActivityStore((s) => s.recordActivity);
  const recordHistoryActivity = useLessonHistoryStore((s) => s.recordActivity);

  if (isLoading || !lesson) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg }}>
        <ActivityIndicator size="large" color="#E63946" />
        <Text style={{ marginTop: 12, color: '#5A6478', fontSize: 13 }}>Anlatım yükleniyor…</Text>
      </View>
    );
  }

  const lang = getCurrentLanguage();
  const body =
    lang === 'tr'
      ? lesson.theory_md ?? lesson.theory_md_en ?? ''
      : lesson.theory_md_en ?? lesson.theory_md ?? '';
  const title = lang === 'tr' ? lesson.title_tr ?? lesson.title : lesson.title;

  if (!body) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg, padding: 24 }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>📖</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0E1116', marginBottom: 8 }}>
          Anlatım hazırlanıyor
        </Text>
        <Text style={{ fontSize: 13, color: '#5A6478', textAlign: 'center', marginBottom: 20 }}>
          Bu ders için henüz içerik girilmemiş.
        </Text>
        <Button3D variant="primary" onPress={() => router.back()}>Geri dön</Button3D>
      </View>
    );
  }

  function onComplete() {
    if (!lesson) return;
    addXp(THEORY_XP, 'theory_completed');
    void addCoinsServer({ amount: 2, reason: 'lesson_completed', source: 'lesson_completed' });
    recordDailyActivity();
    recordHistoryActivity('lesson');
    markLessonCompleted(lessonSlug, 100);
    markLessonProgressCompleted(lessonSlug);
    recordRecentActivity({
      type: 'lesson',
      refId: lessonSlug,
      titleTr: title,
      subtitleTr: 'Anlatım tamamlandı',
      score: 100,
    });
    if (lesson.id) {
      void bumpUserXp({ lessonId: lesson.id, score: 100, xp: THEORY_XP });
    }
    track('theory_completed', { lesson_id: lessonSlug });
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#DCE0E8',
          }}
        >
          <Text
            onPress={() => router.back()}
            style={{ fontSize: 22, color: '#0E1116', paddingRight: 12 }}
          >
            ‹
          </Text>
          <View style={{ flex: 1 }}>
            <ASEyebrow>Anlatım · +{THEORY_XP} XP</ASEyebrow>
            <Text
              numberOfLines={1}
              style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: '700', color: '#0E1116', marginTop: 2 }}
            >
              {title}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {lesson.theory_image_url && (
          <Image
            source={{ uri: lesson.theory_image_url }}
            style={{
              width: '100%',
              height: 200,
              borderRadius: 12,
              marginBottom: 16,
              backgroundColor: '#F2F2F2',
            }}
            resizeMode="cover"
          />
        )}
        <SimpleMarkdown source={body} />
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
        <View style={{ padding: 16 }}>
          <Button3D variant="primary" fullWidth onPress={onComplete}>
            Anladım, devam et →
          </Button3D>
        </View>
      </SafeAreaView>
    </View>
  );
}

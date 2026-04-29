/**
 * Mock Mülakat Stüdyosu
 *
 * Cross-airline + cross-role mülakat pratiği. Kullanıcı:
 *   1) Rol seçer (kendi rolünden default)
 *   2) Kategori chip'leri seçer (motivasyon, davranışsal, teknik, vs.)
 *   3) Zorluk slider (1-5)
 *   4) Soru sayısı (5/10/20)
 *   5) Start → randomize → in-progress modunda soruları geçer
 *   6) Bitince özet (cevapladığı sayı + kategori dağılımı)
 *
 * Sprint 7 — bağımsız stüdyo (havayolu özelinden bağımsız).
 */
import { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { FONTS, Mono } from '@/components/airspeak';
import { INTERVIEW_QUESTIONS } from '@/features/exams/interviewQuestions';
import type { InterviewQuestion } from '@/features/exams/airlineTypes';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types/profile';
import { FlagContentTrigger } from '@/components/moderation/FlagContentSheet';
import { track } from '@/lib/posthog';

type Stage = 'setup' | 'live' | 'done';

const ROLES: { id: UserRole; label: string; emoji: string }[] = [
  { id: 'pilot', label: 'Pilot', emoji: '✈️' },
  { id: 'cabin', label: 'Kabin', emoji: '🧳' },
  { id: 'technician', label: 'Teknisyen', emoji: '🛠' },
  { id: 'ground', label: 'Yer', emoji: '🦺' },
  { id: 'student', label: 'Öğrenci', emoji: '🎓' },
];

type Category = InterviewQuestion['category'];

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'motivation', label: 'Motivasyon', emoji: '🔥' },
  { id: 'behavioral', label: 'Davranışsal', emoji: '🎯' },
  { id: 'situational', label: 'Senaryo', emoji: '🧩' },
  { id: 'technical', label: 'Teknik', emoji: '⚙️' },
  { id: 'english', label: 'İngilizce', emoji: '🗣' },
  { id: 'company_knowledge', label: 'Şirket bilgisi', emoji: '🏢' },
  { id: 'icebreaker', label: 'Buz kırıcı', emoji: '👋' },
  { id: 'tricky', label: 'Zor', emoji: '🌶' },
];

const COUNTS = [5, 10, 20];

export default function MockStudioScreen() {
  const { t } = useTranslation();
  const profileRole = useAuthStore((s) => s.user?.role) as UserRole | undefined;

  const [stage, setStage] = useState<Stage>('setup');
  const [role, setRole] = useState<UserRole>(profileRole ?? 'cabin');
  const [categories, setCategories] = useState<Set<Category>>(
    new Set(['motivation', 'behavioral', 'situational']),
  );
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [count, setCount] = useState<number>(10);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Pool önizleme
  const availablePool = useMemo(() => {
    return INTERVIEW_QUESTIONS.filter((q) => {
      if (!q.roles.includes(role)) return false;
      if (categories.size > 0 && !categories.has(q.category)) return false;
      if (q.difficulty > difficulty) return false;
      return true;
    });
  }, [role, categories, difficulty]);

  function toggleCategory(c: Category) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function start() {
    if (availablePool.length === 0) return;
    const shuffled = [...availablePool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(count, shuffled.length));
    setQuestions(picked);
    setIdx(0);
    setRevealed(false);
    setStage('live');
    track('mock_studio_started', {
      role,
      categories: Array.from(categories),
      difficulty,
      count: picked.length,
    });
  }

  function next() {
    setRevealed(false);
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
    } else {
      setStage('done');
      track('mock_studio_completed', { questionCount: questions.length, role });
    }
  }

  function restart() {
    setStage('setup');
    setIdx(0);
    setRevealed(false);
    setQuestions([]);
  }

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
          <Pressable
            onPress={() => (stage === 'setup' ? router.back() : restart())}
            accessibilityRole="button"
            accessibilityLabel={t('common.back', 'Geri')}
            hitSlop={8}
          >
            <Text style={{ fontSize: 22, color: '#0E1116' }}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
              {t('mockStudio.eyebrow', 'MOCK MÜLAKAT')}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.body800,
                fontSize: 22,
                color: '#0E1116',
                marginTop: 2,
              }}
            >
              {stage === 'setup'
                ? t('mockStudio.titleSetup', 'Stüdyo · ayarla')
                : stage === 'live'
                  ? `${idx + 1} / ${questions.length}`
                  : t('mockStudio.titleDone', 'Tamamlandı 🎉')}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {stage === 'setup' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
          {/* Rol */}
          <SectionTitle text={t('mockStudio.roleSection', 'Rol')} />
          <ChipRow>
            {ROLES.map((r) => (
              <Chip
                key={r.id}
                active={role === r.id}
                emoji={r.emoji}
                label={t(`roles.${r.id}`, r.label)}
                onPress={() => setRole(r.id)}
              />
            ))}
          </ChipRow>

          {/* Kategori */}
          <SectionTitle text={t('mockStudio.categorySection', 'Kategori (çoklu seç)')} />
          <ChipRow>
            {CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                active={categories.has(c.id)}
                emoji={c.emoji}
                label={t(`mockStudio.cat.${c.id}`, c.label)}
                onPress={() => toggleCategory(c.id)}
              />
            ))}
          </ChipRow>

          {/* Zorluk */}
          <SectionTitle
            text={t('mockStudio.difficultySection', 'Maks zorluk')}
            sub={'★'.repeat(difficulty) + '☆'.repeat(5 - difficulty)}
          />
          <ChipRow>
            {[1, 2, 3, 4, 5].map((d) => (
              <Chip
                key={d}
                active={difficulty === d}
                label={`${d}`}
                onPress={() => setDifficulty(d as 1 | 2 | 3 | 4 | 5)}
              />
            ))}
          </ChipRow>

          {/* Soru sayısı */}
          <SectionTitle text={t('mockStudio.countSection', 'Soru sayısı')} />
          <ChipRow>
            {COUNTS.map((c) => (
              <Chip key={c} active={count === c} label={`${c}`} onPress={() => setCount(c)} />
            ))}
          </ChipRow>

          {/* Pool özeti */}
          <View
            style={{
              marginTop: 20,
              padding: 14,
              borderRadius: 12,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#DCE0E8',
            }}
          >
            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.8 }}>
              {t('mockStudio.poolEyebrow', 'HAVUZ')}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.body800,
                fontSize: 20,
                color: '#0E1116',
                marginTop: 4,
              }}
            >
              {t('mockStudio.poolCount', '{{count}} uygun soru', { count: availablePool.length })}
            </Text>
            <Text
              style={{
                fontFamily: FONTS.body,
                fontSize: 12,
                color: '#5A6478',
                marginTop: 4,
                lineHeight: 18,
              }}
            >
              {availablePool.length >= count
                ? t('mockStudio.poolReady', 'Filtre uyumlu — {{n}} soru rastgele seçilecek.', {
                    n: count,
                  })
                : availablePool.length === 0
                  ? t('mockStudio.poolEmpty', 'Filtreni gevşet, hiç soru kalmadı.')
                  : t('mockStudio.poolPartial', 'Yeterli yok — {{n}} soru ile başlanacak.', {
                      n: availablePool.length,
                    })}
            </Text>
          </View>

          {/* Start */}
          <Pressable
            onPress={start}
            disabled={availablePool.length === 0}
            accessibilityRole="button"
            style={{
              marginTop: 20,
              height: 52,
              borderRadius: 14,
              backgroundColor: availablePool.length === 0 ? '#8A93A6' : '#0F1E47',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: '#FFFFFF' }}>
              {t('mockStudio.start', '🎬 Stüdyoyu başlat')}
            </Text>
          </Pressable>
        </ScrollView>
      )}

      {stage === 'live' && questions[idx] && (
        <LiveQuestion
          q={questions[idx]!}
          revealed={revealed}
          onReveal={() => setRevealed(true)}
          onNext={next}
          isLast={idx + 1 >= questions.length}
        />
      )}

      {stage === 'done' && (
        <View style={{ padding: 24, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 56 }}>🎉</Text>
          <Text
            style={{
              fontFamily: FONTS.body800,
              fontSize: 22,
              color: '#0E1116',
              marginTop: 12,
              textAlign: 'center',
            }}
          >
            {t('mockStudio.doneTitle', '{{n}} soru tamamlandı', { n: questions.length })}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.body,
              fontSize: 14,
              color: '#5A6478',
              marginTop: 8,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {t(
              'mockStudio.doneBody',
              'Cevap kalitesini gerçek mülakatta düşün. Yeni bir set ile tekrar başlat.',
            )}
          </Text>
          <Pressable
            onPress={restart}
            accessibilityRole="button"
            style={{
              marginTop: 24,
              height: 48,
              paddingHorizontal: 24,
              borderRadius: 12,
              backgroundColor: '#0F1E47',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#FFFFFF' }}>
              {t('mockStudio.restart', 'Yeni stüdyo başlat')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            style={{
              marginTop: 12,
              height: 48,
              paddingHorizontal: 24,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
              {t('common.close', 'Kapat')}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  ALT BİLEŞENLER
// ═══════════════════════════════════════════════════════════════════

function SectionTitle({ text, sub }: { text: string; sub?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 16, marginBottom: 8 }}>
      <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.8 }}>{text.toUpperCase()}</Mono>
      {sub && <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0E1116' }}>{sub}</Text>}
    </View>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>;
}

function Chip({
  active,
  emoji,
  label,
  onPress,
}: {
  active: boolean;
  emoji?: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: active ? '#0F1E47' : '#DCE0E8',
        backgroundColor: active ? '#0F1E47' : '#FFFFFF',
      }}
    >
      {emoji && <Text style={{ fontSize: 14 }}>{emoji}</Text>}
      <Text
        style={{
          fontFamily: FONTS.body700,
          fontSize: 13,
          color: active ? '#FFFFFF' : '#0E1116',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function LiveQuestion({
  q,
  revealed,
  onReveal,
  onNext,
  isLast,
}: {
  q: InterviewQuestion;
  revealed: boolean;
  onReveal: () => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const { t } = useTranslation();
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <View
        style={{
          backgroundColor: '#0F1E47',
          padding: 20,
          borderRadius: 16,
        }}
      >
        <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.8 }}>
          {categoryLabel(q.category).toUpperCase()} · ★{q.difficulty}
        </Mono>
        <Text
          style={{
            fontFamily: FONTS.body800,
            fontSize: 18,
            color: '#FFFFFF',
            marginTop: 10,
            lineHeight: 24,
          }}
        >
          {q.question}
        </Text>
        {q.context && (
          <Text
            style={{
              fontFamily: FONTS.body,
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              marginTop: 10,
              lineHeight: 19,
            }}
          >
            {q.context}
          </Text>
        )}
      </View>

      {!revealed ? (
        <>
          <View
            style={{
              marginTop: 16,
              padding: 16,
              backgroundColor: '#FFF8E1',
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.body700,
                fontSize: 13,
                color: '#7A5C00',
                marginBottom: 6,
              }}
            >
              {t('mockStudio.prepTitle', 'Hazırlık')}
            </Text>
            <Text
              style={{
                fontFamily: FONTS.body,
                fontSize: 13,
                color: '#7A5C00',
                lineHeight: 19,
              }}
            >
              {t(
                'mockStudio.prepBody',
                'Soruyu oku, kafanda 60 saniye cevabı kur. Sonra "Model cevap" tuşuyla kıyasla.',
              )}
            </Text>
          </View>
          <Pressable
            onPress={onReveal}
            accessibilityRole="button"
            style={{
              marginTop: 16,
              height: 52,
              borderRadius: 14,
              backgroundColor: '#0F1E47',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: '#FFFFFF' }}>
              {t('mockStudio.reveal', '💡 Model cevabı göster')}
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          {/* Good points */}
          <Card title={t('mockStudio.goodPoints', '✓ İyi cevap noktaları')} bg="#E8F8EE" titleColor="#1B7E3A">
            {q.goodAnswerPointsTr.map((p, i) => (
              <Text key={i} style={lineStyle('#1B7E3A')}>
                • {p}
              </Text>
            ))}
          </Card>

          {/* Red flags */}
          <Card title={t('mockStudio.redFlags', '✗ Kaçınılacaklar')} bg="#FFEAEC" titleColor="#A62133">
            {q.redFlagsTr.map((p, i) => (
              <Text key={i} style={lineStyle('#A62133')}>
                • {p}
              </Text>
            ))}
          </Card>

          {/* Sample */}
          {q.sampleAnswerTr && (
            <Card title={t('mockStudio.sample', 'Örnek cevap (TR)')} bg="#F2F4F8" titleColor="#0E1116">
              <Text style={lineStyle('#0E1116', false)}>{q.sampleAnswerTr}</Text>
            </Card>
          )}

          {q.modelAnswerEn && (
            <Card title={t('mockStudio.modelEn', 'Model answer (EN)')} bg="#EAF1FF" titleColor="#0F1E47">
              <Text style={lineStyle('#0F1E47', false)}>{q.modelAnswerEn}</Text>
            </Card>
          )}

          {/* Tips */}
          <Card title={t('mockStudio.tips', '💡 İpuçları')} bg="#FFF8E1" titleColor="#7A5C00">
            {q.tipsTr.map((p, i) => (
              <Text key={i} style={lineStyle('#7A5C00')}>
                • {p}
              </Text>
            ))}
          </Card>

          {/* Next */}
          <Pressable
            onPress={onNext}
            accessibilityRole="button"
            style={{
              marginTop: 16,
              height: 52,
              borderRadius: 14,
              backgroundColor: '#0F1E47',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: '#FFFFFF' }}>
              {isLast ? t('mockStudio.finish', 'Stüdyoyu bitir →') : t('mockStudio.next', 'Sonraki soru →')}
            </Text>
          </Pressable>

          <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
            <FlagContentTrigger contentType="interview_question" contentId={q.id} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

function Card({
  title,
  bg,
  titleColor,
  children,
}: {
  title: string;
  bg: string;
  titleColor: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        marginTop: 12,
        padding: 14,
        borderRadius: 12,
        backgroundColor: bg,
      }}
    >
      <Text
        style={{
          fontFamily: FONTS.body700,
          fontSize: 13,
          color: titleColor,
          marginBottom: 6,
          textTransform: Platform.OS === 'web' ? 'uppercase' : undefined,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function lineStyle(color: string, bullet = true) {
  return {
    fontFamily: FONTS.body,
    fontSize: 13,
    color,
    lineHeight: 19,
    marginTop: bullet ? 2 : 0,
  };
}

function categoryLabel(c: Category): string {
  const map: Record<Category, string> = {
    icebreaker: 'Buz kırıcı',
    motivation: 'Motivasyon',
    technical: 'Teknik',
    behavioral: 'Davranışsal',
    situational: 'Senaryo',
    english: 'İngilizce',
    company_knowledge: 'Şirket bilgisi',
    group_exercise: 'Grup egzersizi',
    role_play: 'Role-play',
    cv_based: 'CV bazlı',
    tricky: 'Zor',
  };
  return map[c] ?? c;
}

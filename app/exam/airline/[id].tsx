/**
 * Tek havayolu detay + mock interview deneyimleme.
 *
 * Kullanıcı görür:
 * - Havayolu detay (filo, hub, dil, perks)
 * - Tüm mülakat aşamaları (sırayla, ipuçları ile)
 * - Soru bankası — havayolu + genel
 * - Mock interview moduna geç (her sorunun "good answer points"i göster)
 */
import { useState } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Text, Button, Progress } from 'tamagui';
import { useLocalSearchParams, router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAirline, useInterviewQuestions } from '@/features/content/api';
import type { AirlineInterview, InterviewQuestionRow } from '@/features/content/types';
import { getKnowledgeForAirline, getRoleKnowledge } from '@/features/exams/airlineKnowledge';
import { FlagContentTrigger } from '@/components/moderation/FlagContentSheet';
import type { UserRole } from '@/types/profile';

/** Eski TS InterviewQuestion shape'i ekran içinde kullanılıyor — DB row'u dönüştür. */
type InterviewQuestion = {
  id: string;
  category: string;
  question: string;
  context?: string | null;
  difficulty: number;
  goodAnswerPointsTr?: string[] | null;
  redFlagsTr?: string[] | null;
  tipsTr?: string[] | null;
  sampleAnswerTr?: string | null;
  modelAnswerEn?: string | null;
  detailedExplanationTr?: string | null;
};

function rowToQuestion(r: InterviewQuestionRow): InterviewQuestion {
  return {
    id: r.slug,
    category: r.category,
    question: r.question,
    difficulty: r.difficulty,
    goodAnswerPointsTr: r.good_answer_points_tr,
    redFlagsTr: r.red_flags_tr,
    tipsTr: r.tips_tr,
    sampleAnswerTr: r.star_template_tr,
    detailedExplanationTr: r.detailed_explanation_tr,
  };
}

function pickInterview(
  airline: any,
  role: UserRole | null,
): AirlineInterview | null {
  if (!role) return null;
  switch (role) {
    case 'pilot': return airline.pilot_interview;
    case 'cabin': return airline.cabin_interview;
    case 'technician': return airline.technician_interview;
    case 'ground': return airline.ground_interview;
    case 'student': return airline.student_interview;
  }
}

export default function AirlineDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const role = useOnboardingStore((s) => s.role) as UserRole | null;
  const [view, setView] = useState<'overview' | 'mock'>('overview');

  const airlineSlug = typeof params.id === 'string' ? params.id : '';
  const { data: airline, isLoading } = useAirline(airlineSlug);
  const { data: questionRows = [] } = useInterviewQuestions(role, airlineSlug);
  const questions: InterviewQuestion[] = questionRows.map(rowToQuestion);

  if (isLoading) {
    return (
      <YStack flex={1} padding="$4" justifyContent="center" alignItems="center" backgroundColor="$background">
        <ActivityIndicator size="large" color="#E63946" />
        <Text marginTop="$3">Yükleniyor…</Text>
      </YStack>
    );
  }

  if (!airline) {
    return (
      <YStack flex={1} padding="$4" justifyContent="center" backgroundColor="$background">
        <Text fontSize={64} textAlign="center">❓</Text>
        <H2 color="$text" textAlign="center">Havayolu bulunamadı</H2>
        <Button onPress={() => router.back()}>Geri dön</Button>
      </YStack>
    );
  }

  // DB'den gelen jsonb'de eski TS interface'inin tüm alanları olabilir (loose any).
  const interview = (pickInterview(airline, role) ?? {}) as any;
  const kb = getKnowledgeForAirline(airline.slug);
  const roleKb = role ? getRoleKnowledge(airline.slug, role as never) : undefined;

  if (view === 'mock' && questions.length > 0) {
    return <MockInterview airline={airline.name} questions={questions} onExit={() => setView('overview')} />;
  }

  if (!interview) {
    return (
      <YStack flex={1} padding="$4" gap="$3" backgroundColor="$background">
        <Text fontSize={64} textAlign="center">😕</Text>
        <H2 color="$text" textAlign="center">{airline.name}</H2>
        <Paragraph color="$textSecondary" textAlign="center">
          Bu havayolu senin rolün için aktif mülakat girişi sunmuyor.
        </Paragraph>
        <Button onPress={() => router.back()}>Diğer havayollarına dön</Button>
      </YStack>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        {/* Header */}
        <Card padding="$4" backgroundColor="$primary">
          <YStack gap="$2">
            <XStack gap="$2" alignItems="center">
              <Text fontSize={48}>{airline.country_emoji ?? '🌍'}</Text>
              <YStack flex={1}>
                <Text fontSize="$2" color="$primaryText" textTransform="uppercase">
                  {airline.iata_code ?? '—'}
                </Text>
                <Text fontSize="$7" fontWeight="700" color="$primaryText">
                  {airline.name}
                </Text>
                <Text fontSize="$3" color="$primaryText">
                  {airline.hub ?? '—'}
                </Text>
              </YStack>
            </XStack>
          </YStack>
        </Card>

        {/* Quick stats */}
        <XStack gap="$2" flexWrap="wrap">
          {airline.fleet_size ? <StatCard label="Filo" value={`${airline.fleet_size}`} /> : null}
          {airline.destinations ? <StatCard label="Destination" value={`${airline.destinations}`} /> : null}
          {airline.prestige ? <StatCard label="Prestij" value={'★'.repeat(airline.prestige)} /> : null}
          {interview?.requiredLevel ? <StatCard label="Min İngilizce" value={interview.requiredLevel} /> : null}
        </XStack>

        {/* Insider tip */}
        {airline.insider_tip_tr ? (
          <Card padding="$4" backgroundColor="$accent">
            <YStack gap="$1">
              <Text fontSize="$3" color="$accentText" textTransform="uppercase">
                💡 İçeriden ipucu
              </Text>
              <Paragraph color="$accentText">{airline.insider_tip_tr}</Paragraph>
            </YStack>
          </Card>
        ) : null}

        {/* Interview overview */}
        <YStack gap="$2">
          <H3 color="$text">Mülakat Süreci</H3>
          <XStack gap="$2" flexWrap="wrap">
            <InfoChip label={`Toplam ~${interview.totalProcessDays} gün`} />
            <InfoChip label={`Başarı ~%${interview.successRatePercent}`} />
            <InfoChip label={`İngilizce ağırlığı %${interview.englishWeight}`} />
            <InfoChip label={hiringStatusLabel(interview.hiringStatus)} />
          </XStack>
          {interview.averageSalaryTryK && (
            <Text fontSize="$3" color="$success">
              💰 Ortalama brüt ~₺{interview.averageSalaryTryK}K/ay
            </Text>
          )}
        </YStack>

        {/* Stages */}
        <YStack gap="$2">
          <H3 color="$text">Aşamalar ({(interview.stages ?? []).length})</H3>
          {(interview.stages ?? []).map((s: any, idx: number) => (
            <Card key={s.id} padding="$3" backgroundColor="$surface" bordered>
              <YStack gap="$2">
                <XStack gap="$2" alignItems="center">
                  <Card backgroundColor="$primary" paddingHorizontal="$2" paddingVertical="$1">
                    <Text fontSize="$3" color="$primaryText" fontWeight="700">
                      {idx + 1}
                    </Text>
                  </Card>
                  <Text fontSize="$4" fontWeight="600" color="$text" flex={1}>
                    {s.titleTr}
                  </Text>
                  <Text fontSize="$2" color="$textSecondary">
                    {s.durationMinutes} dk
                  </Text>
                </XStack>
                {s.descriptionTr ? (
                  <Paragraph fontSize="$3" color="$textSecondary">
                    {s.descriptionTr}
                  </Paragraph>
                ) : null}
                {s.passingTipsTr && s.passingTipsTr.length > 0 ? (
                  <YStack gap="$1">
                    <Text fontSize="$2" color="$primary" textTransform="uppercase">
                      Geçme ipuçları
                    </Text>
                    {s.passingTipsTr.map((tip: string, i: number) => (
                      <Text key={i} fontSize="$2" color="$text">
                        ✓ {tip}
                      </Text>
                    ))}
                  </YStack>
                ) : null}
              </YStack>
            </Card>
          ))}
        </YStack>

        {/* Perks */}
        {interview.perks && interview.perks.length > 0 && (
          <YStack gap="$2">
            <H3 color="$text">Avantajlar</H3>
            {interview.perks.map((p: string, i: number) => (
              <Text key={i} fontSize="$3" color="$text">
                • {p}
              </Text>
            ))}
          </YStack>
        )}

        {/* Bilinmesi Gerekenler — yapısal knowledge base */}
        {kb && (
          <YStack gap="$3">
            <H3 color="$text">📋 Bilinmesi Gerekenler</H3>

            {/* Key Facts */}
            <Card padding="$4" backgroundColor="$surface" bordered>
              <YStack gap="$2">
                <Text fontSize="$3" color="$primary" textTransform="uppercase">
                  Kritik fact'ler
                </Text>
                {kb.keyFacts.map((f, i) => (
                  <XStack key={i} gap="$2" alignItems="flex-start">
                    <Text fontSize="$2" color="$textSecondary" minWidth={140}>
                      {f.label}:
                    </Text>
                    <Text fontSize="$3" color="$text" flex={1} fontWeight="600">
                      {f.value}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </Card>

            {/* Company DNA */}
            <Card padding="$4" backgroundColor="$primarySubtle">
              <YStack gap="$2">
                <Text fontSize="$3" color="$primary" textTransform="uppercase">
                  🧬 Şirket DNA
                </Text>
                <Paragraph color="$text">{kb.companyDNA}</Paragraph>
              </YStack>
            </Card>

            {/* Recent News */}
            <Card padding="$4" backgroundColor="$surface" bordered>
              <YStack gap="$2">
                <Text fontSize="$3" color="$primary" textTransform="uppercase">
                  📰 Son 12 ay
                </Text>
                {kb.recentNews.map((n, i) => (
                  <Text key={i} fontSize="$3" color="$text">
                    • {n}
                  </Text>
                ))}
              </YStack>
            </Card>

            {/* Network + Fleet + Competitive */}
            <Card padding="$4" backgroundColor="$surface" bordered>
              <YStack gap="$3">
                <YStack gap="$1">
                  <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
                    Filo Detayı
                  </Text>
                  <Paragraph color="$text">{kb.fleetDetail}</Paragraph>
                </YStack>
                <YStack gap="$1">
                  <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
                    Network Stratejisi
                  </Text>
                  <Paragraph color="$text">{kb.networkStrategy}</Paragraph>
                </YStack>
                <YStack gap="$1">
                  <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
                    Rekabet Pozisyonu
                  </Text>
                  <Paragraph color="$text">{kb.competitivePosition}</Paragraph>
                </YStack>
              </YStack>
            </Card>

            {/* ROL ÖZEL — must know + mistakes + tips */}
            {roleKb && (
              <YStack gap="$2">
                <H3 color="$text">🎯 {roleLabel(role!)} İçin Özel</H3>

                <Card padding="$4" backgroundColor="$successSubtle">
                  <YStack gap="$2">
                    <Text fontSize="$4" fontWeight="700" color="$success">
                      ✅ Mutlaka Bilinmesi
                    </Text>
                    {roleKb.mustKnow.map((m, i) => (
                      <Text key={i} fontSize="$3" color="$text">
                        • {m}
                      </Text>
                    ))}
                  </YStack>
                </Card>

                <Card padding="$4" backgroundColor="$dangerSubtle">
                  <YStack gap="$2">
                    <Text fontSize="$4" fontWeight="700" color="$danger">
                      ⛔ Sıkça Yapılan Hatalar
                    </Text>
                    {roleKb.commonMistakes.map((m, i) => (
                      <Text key={i} fontSize="$3" color="$text">
                        • {m}
                      </Text>
                    ))}
                  </YStack>
                </Card>

                <Card padding="$4" backgroundColor="$accent">
                  <YStack gap="$2">
                    <Text fontSize="$4" fontWeight="700" color="$accentText">
                      💡 Hazırlık İpuçları
                    </Text>
                    {roleKb.preparationTips.map((t, i) => (
                      <Text key={i} fontSize="$3" color="$accentText">
                        • {t}
                      </Text>
                    ))}
                  </YStack>
                </Card>

                <Card padding="$4" backgroundColor="$surface" bordered>
                  <YStack gap="$2">
                    <Text fontSize="$3" color="$primary" textTransform="uppercase">
                      🔑 Shibboleth — Şirket Jargonu
                    </Text>
                    <Text fontSize="$2" color="$textSecondary">
                      Bu ifadeleri mülakatta kullan veya tanı — şirket içi olduğunu gösterir.
                    </Text>
                    {roleKb.shibboleths.map((s, i) => (
                      <Text key={i} fontSize="$3" color="$text">
                        • {s}
                      </Text>
                    ))}
                  </YStack>
                </Card>

                <Card padding="$4" backgroundColor="$surface" bordered>
                  <YStack gap="$2">
                    <Text fontSize="$3" color="$primary" textTransform="uppercase">
                      👔 Dress Code
                    </Text>
                    <Paragraph color="$text">{roleKb.dressCode}</Paragraph>
                  </YStack>
                </Card>

                <Card padding="$4" backgroundColor="$primarySubtle">
                  <YStack gap="$2">
                    <Text fontSize="$3" color="$primary" textTransform="uppercase">
                      📅 Mülakat günü öncesi checklist
                    </Text>
                    {roleKb.dayBeforeChecklist.map((c, i) => (
                      <Text key={i} fontSize="$3" color="$text">
                        ☐ {c}
                      </Text>
                    ))}
                  </YStack>
                </Card>

                <Card padding="$4" backgroundColor="$surface" bordered>
                  <YStack gap="$2">
                    <Text fontSize="$3" color="$primary" textTransform="uppercase">
                      📞 Mülakat sonrası
                    </Text>
                    {roleKb.postInterviewActions.map((a, i) => (
                      <Text key={i} fontSize="$3" color="$text">
                        • {a}
                      </Text>
                    ))}
                  </YStack>
                </Card>
              </YStack>
            )}

            {/* Verified Tips */}
            <Card padding="$4" backgroundColor="$surface" bordered borderColor="$success">
              <YStack gap="$2">
                <Text fontSize="$3" color="$success" textTransform="uppercase">
                  ✓ Doğrulanmış İpuçları
                </Text>
                {kb.verifiedTips.map((t, i) => (
                  <Text key={i} fontSize="$3" color="$text">
                    {t}
                  </Text>
                ))}
              </YStack>
            </Card>

            {/* Sources */}
            <Card padding="$3" backgroundColor="$backgroundHover">
              <YStack gap="$1">
                <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
                  Kaynaklar · Son güncelleme {kb.lastUpdated}
                </Text>
                {kb.sources.map((s, i) => (
                  <Text key={i} fontSize="$2" color="$textSecondary">
                    • {s}
                  </Text>
                ))}
              </YStack>
            </Card>
          </YStack>
        )}

        {!kb && (
          <Card padding="$3" backgroundColor="$warning">
            <YStack gap="$1">
              <Text fontSize="$3" color="$primaryText" fontWeight="600">
                ⚠️ Detaylı bilgi tabanı yakında
              </Text>
              <Text fontSize="$2" color="$primaryText">
                Bu havayolu için MVP\'de yapısal knowledge base yok — Sprint 9\'da eklenecek.
                Genel mülakat bilgileri yukarıda mevcut.
              </Text>
            </YStack>
          </Card>
        )}

        {/* Mock interview CTA */}
        <Card padding="$4" backgroundColor="$accent">
          <YStack gap="$3">
            <Text fontSize="$5" fontWeight="700" color="$accentText">
              🎙️ Mock Interview Pratiği
            </Text>
            <Paragraph color="$accentText">
              {questions.length} özelleştirilmiş soru. Soruyu oku → kafanda cevapla → "model cevabı"
              ile karşılaştır. Her soruda iyi cevap noktaları + red flag'ler.
            </Paragraph>
            <Button
              size="$5"
              backgroundColor="$accentText"
              color="$accent"
              onPress={() => setView('mock')}
              disabled={questions.length === 0}
            >
              ▶️ Mock Interview Başlat
            </Button>
          </YStack>
        </Card>

        {interview.applicationUrl && (
          <Card padding="$3" backgroundColor="$surface" bordered>
            <YStack gap="$1">
              <Text fontSize="$2" color="$textSecondary">
                Resmi başvuru
              </Text>
              <Text fontSize="$3" color="$primary" fontWeight="600">
                {interview.applicationUrl}
              </Text>
            </YStack>
          </Card>
        )}
      </YStack>
    </ScrollView>
  );
}

function MockInterview({
  airline,
  questions,
  onExit,
}: {
  airline: string;
  questions: InterviewQuestion[];
  onExit: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const q = questions[idx];
  if (!q) return null;

  const next = () => {
    setRevealed(false);
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else onExit();
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <Progress value={((idx + 1) / questions.length) * 100} max={100} backgroundColor="$border">
          <Progress.Indicator animation="lazy" backgroundColor="$primary" />
        </Progress>
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$2" color="$textSecondary">
            {airline} · Soru {idx + 1} / {questions.length}
          </Text>
          <Button size="$2" variant="outlined" onPress={onExit}>
            ✕ Çık
          </Button>
        </XStack>

        <Card padding="$3" backgroundColor="$backgroundHover">
          <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
            {categoryLabel(q.category)} · Zorluk {'★'.repeat(q.difficulty)}{'☆'.repeat(5 - q.difficulty)}
          </Text>
        </Card>

        <Card padding="$4" backgroundColor="$primary">
          <Text fontSize="$5" fontWeight="600" color="$primaryText">
            {q.question}
          </Text>
        </Card>

        {q.context && (
          <Card padding="$3" backgroundColor="$surface" bordered>
            <Text color="$text">{q.context}</Text>
          </Card>
        )}

        {!revealed ? (
          <YStack gap="$3">
            <Card padding="$4" backgroundColor="$accent">
              <YStack gap="$1">
                <Text fontSize="$3" color="$accentText" textTransform="uppercase">
                  Hazırlık
                </Text>
                <Paragraph color="$accentText">
                  Soruyu oku, kafanda 60 saniye cevabını hazırla. Sonra "Model cevabı göster"
                  butonuna bas — kendi cevabınla kıyasla.
                </Paragraph>
              </YStack>
            </Card>
            <Button
              size="$5"
              backgroundColor="$primary"
              color="$primaryText"
              onPress={() => setRevealed(true)}
            >
              💡 Model cevabı göster
            </Button>
          </YStack>
        ) : (
          <YStack gap="$3">
            {/* İyi cevap noktaları */}
            <Card padding="$4" backgroundColor="$successSubtle">
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="700" color="$success">
                  ✅ İyi cevapta olması gerekenler
                </Text>
                {(q.goodAnswerPointsTr ?? []).map((p, i) => (
                  <Text key={i} fontSize="$3" color="$text">
                    • {p}
                  </Text>
                ))}
              </YStack>
            </Card>

            {/* Red flags */}
            <Card padding="$4" backgroundColor="$dangerSubtle">
              <YStack gap="$2">
                <Text fontSize="$4" fontWeight="700" color="$danger">
                  ⛔ Yapma — red flag
                </Text>
                {(q.redFlagsTr ?? []).map((p, i) => (
                  <Text key={i} fontSize="$3" color="$text">
                    • {p}
                  </Text>
                ))}
              </YStack>
            </Card>

            {/* Sample answer (TR) */}
            {q.sampleAnswerTr && (
              <Card padding="$4" backgroundColor="$surface" bordered>
                <YStack gap="$2">
                  <Text fontSize="$3" color="$textSecondary" textTransform="uppercase">
                    Örnek cevap (TR)
                  </Text>
                  <Paragraph color="$text">{q.sampleAnswerTr}</Paragraph>
                </YStack>
              </Card>
            )}

            {/* Model answer (EN) */}
            {q.modelAnswerEn && (
              <Card padding="$4" backgroundColor="$primarySubtle">
                <YStack gap="$2">
                  <Text fontSize="$3" color="$primary" textTransform="uppercase">
                    Model answer (EN)
                  </Text>
                  <Paragraph color="$text">{q.modelAnswerEn}</Paragraph>
                </YStack>
              </Card>
            )}

            {/* Tips */}
            <Card padding="$3" backgroundColor="$accent">
              <YStack gap="$1">
                <Text fontSize="$3" color="$accentText" textTransform="uppercase">
                  💡 İpuçları
                </Text>
                {(q.tipsTr ?? []).map((t, i) => (
                  <Text key={i} fontSize="$3" color="$accentText">
                    • {t}
                  </Text>
                ))}
              </YStack>
            </Card>

            {/* Daha fazla oku — detaylı cevap (300-500 kelime) */}
            {q.detailedExplanationTr && (
              <DetailedExplanationExpand text={q.detailedExplanationTr} />
            )}

            <Button size="$5" backgroundColor="$primary" color="$primaryText" onPress={next}>
              {idx + 1 < questions.length ? 'Sonraki soru →' : 'Mock interview\'ı bitir →'}
            </Button>
          </YStack>
        )}

        <XStack justifyContent="flex-end" paddingTop="$2">
          <FlagContentTrigger contentType="interview_question" contentId={q.id} />
        </XStack>
      </YStack>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="$2" backgroundColor="$surface" bordered minWidth={90}>
      <YStack gap="$1" alignItems="center">
        <Text fontSize="$1" color="$textSecondary" textTransform="uppercase">
          {label}
        </Text>
        <Text fontSize="$4" fontWeight="700" color="$text">
          {value}
        </Text>
      </YStack>
    </Card>
  );
}

function InfoChip({ label }: { label: string }) {
  return (
    <Card paddingHorizontal="$2" paddingVertical="$1" backgroundColor="$backgroundHover">
      <Text fontSize="$1" color="$textSecondary">
        {label}
      </Text>
    </Card>
  );
}

function hiringStatusLabel(status: string): string {
  return (
    {
      open: '✅ Aktif alım',
      closed: '⏸️ Kapalı',
      open_day_only: '📅 Open Day',
      experienced_only: '🎯 Tecrübeli',
    }[status] ?? status
  );
}

/**
 * Detaylı cevap expand komponenti — uzun öğretici cevabı tıklamayla genişletir.
 */
function DetailedExplanationExpand({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <Button size="$4" variant="outlined" onPress={() => setExpanded(true)}>
        📖 Detaylı cevabı oku (300-500 kelime)
      </Button>
    );
  }

  return (
    <Card padding="$4" backgroundColor="$surface" bordered>
      <YStack gap="$2">
        <Text fontSize="$3" color="$primary" textTransform="uppercase">
          📚 Detaylı Cevap
        </Text>
        <Paragraph color="$text" lineHeight="$1">
          {text}
        </Paragraph>
        <Button size="$2" variant="outlined" onPress={() => setExpanded(false)}>
          ▲ Kapat
        </Button>
      </YStack>
    </Card>
  );
}

function categoryLabel(cat: string): string {
  return (
    {
      icebreaker: 'Tanışma',
      motivation: 'Motivasyon',
      technical: 'Teknik',
      behavioral: 'Davranışsal (STAR)',
      situational: 'Senaryo',
      english: 'İngilizce',
      company_knowledge: 'Şirket bilgisi',
      group_exercise: 'Grup egzersizi',
      role_play: 'Role-play',
      cv_based: 'CV bazlı',
      tricky: 'Zor / Tuzak',
    }[cat] ?? cat
  );
}

function roleLabel(role: string): string {
  return (
    {
      pilot: 'Pilot',
      cabin: 'Kabin Memuru',
      technician: 'Teknisyen',
      ground: 'Yer Hizmetleri',
      student: 'Öğrenci',
    }[role] ?? role
  );
}

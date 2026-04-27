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
import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Text, Button, Progress } from 'tamagui';
import { useLocalSearchParams, router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { getAirlineById } from '@/features/exams/airlines';
import { getQuestionsForAirline } from '@/features/exams/interviewQuestions';
import type { InterviewQuestion } from '@/features/exams/airlineTypes';

export default function AirlineDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const role = useOnboardingStore((s) => s.role);
  const [view, setView] = useState<'overview' | 'mock'>('overview');

  const airlineId = typeof params.id === 'string' ? params.id : '';
  const airline = getAirlineById(airlineId);

  if (!airline) {
    return (
      <YStack flex={1} padding="$4" justifyContent="center" backgroundColor="$background">
        <Text fontSize={64} textAlign="center">❓</Text>
        <H2 color="$text" textAlign="center">Havayolu bulunamadı</H2>
        <Button onPress={() => router.back()}>Geri dön</Button>
      </YStack>
    );
  }

  const interview = airline.interviews.find((i) => i.role === role);
  const questions = role ? getQuestionsForAirline(airline.id, role) : [];

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
              <Text fontSize={48}>{airline.countryEmoji}</Text>
              <YStack flex={1}>
                <Text fontSize="$2" color="$primaryText" textTransform="uppercase">
                  {airline.iataCode} · {airline.icaoCode} · {airline.country}
                </Text>
                <Text fontSize="$7" fontWeight="700" color="$primaryText">
                  {airline.name}
                </Text>
                <Text fontSize="$3" color="$primaryText">
                  {airline.hub}
                </Text>
              </YStack>
            </XStack>
            <Paragraph color="$primaryText">{airline.descriptionTr}</Paragraph>
          </YStack>
        </Card>

        {/* Quick stats */}
        <XStack gap="$2" flexWrap="wrap">
          <StatCard label="Filo" value={`${airline.fleetSize}`} />
          <StatCard label="Destination" value={`${airline.destinations}`} />
          <StatCard label="Personel" value={`${(airline.employeeCount / 1000).toFixed(0)}K`} />
          <StatCard label="Prestij" value={'★'.repeat(airline.prestige)} />
          <StatCard label="Şirket dili" value={airline.primaryLanguage} />
          <StatCard label="Min İngilizce" value={interview.requiredLevel} />
        </XStack>

        {/* Insider tip */}
        <Card padding="$4" backgroundColor="$accent">
          <YStack gap="$1">
            <Text fontSize="$3" color="$accentText" textTransform="uppercase">
              💡 İçeriden ipucu
            </Text>
            <Paragraph color="$accentText">{airline.insiderTipTr}</Paragraph>
          </YStack>
        </Card>

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
          <H3 color="$text">Aşamalar ({interview.stages.length})</H3>
          {interview.stages.map((s, idx) => (
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
                <Paragraph fontSize="$3" color="$textSecondary">
                  {s.descriptionTr}
                </Paragraph>
                <YStack gap="$1">
                  <Text fontSize="$2" color="$primary" textTransform="uppercase">
                    Geçme ipuçları
                  </Text>
                  {s.passingTipsTr.map((tip, i) => (
                    <Text key={i} fontSize="$2" color="$text">
                      ✓ {tip}
                    </Text>
                  ))}
                </YStack>
              </YStack>
            </Card>
          ))}
        </YStack>

        {/* Perks */}
        {interview.perks && interview.perks.length > 0 && (
          <YStack gap="$2">
            <H3 color="$text">Avantajlar</H3>
            {interview.perks.map((p, i) => (
              <Text key={i} fontSize="$3" color="$text">
                • {p}
              </Text>
            ))}
          </YStack>
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
                {q.goodAnswerPointsTr.map((p, i) => (
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
                {q.redFlagsTr.map((p, i) => (
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
                {q.tipsTr.map((t, i) => (
                  <Text key={i} fontSize="$3" color="$accentText">
                    • {t}
                  </Text>
                ))}
              </YStack>
            </Card>

            <Button size="$5" backgroundColor="$primary" color="$primaryText" onPress={next}>
              {idx + 1 < questions.length ? 'Sonraki soru →' : 'Mock interview\'ı bitir →'}
            </Button>
          </YStack>
        )}
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

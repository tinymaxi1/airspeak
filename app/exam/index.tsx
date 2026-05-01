/**
 * Sınav Hub Ekranı — kullanıcının rolüne özel tüm sınavlar.
 *
 * Pilot kullanıcı: ICAO 4 yazılı + sözlü, SHGM PEL, YDS, THY mülakat...
 * Kabin kullanıcı: SHGM CCD, THY/Pegasus/Emirates kabin mülakat...
 * Teknisyen: EASA Part-66, AMM Reading, FAA A&P
 * Yer hizmetleri: IATA IGOM, Customer Service, Ramp Safety
 * Öğrenci: YDS, üniversite hazırlık, ICAO 4 önizleme
 */
import { ScrollView } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { YStack, XStack, H2, H3, Paragraph, Card, Text, Button } from 'tamagui';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  getExamsByCategory,
  EXAM_CATEGORY_LABELS,
} from '@/features/exams/catalog';
import type { ExamDefinition } from '@/features/exams/types';

export default function ExamHubScreen() {
  const c = usePalette();
  const role = useOnboardingStore((s) => s.role);
  const examGroups = getExamsByCategory(role);
  const categories = Object.keys(examGroups);

  if (!role) {
    return (
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background" justifyContent="center">
        <Text fontSize={64} textAlign="center">🎯</Text>
        <H2 color="$text" textAlign="center">Önce rol seç</H2>
        <Paragraph color="$textSecondary" textAlign="center">
          Sana özel sınavları görmek için profilinden rolünü seç.
        </Paragraph>
        <Button onPress={() => router.push('/(tabs)/profile')}>Profile git</Button>
      </YStack>
    );
  }

  const totalExams = Object.values(examGroups).reduce((sum, arr) => sum + arr.length, 0);
  const freeCount = Object.values(examGroups)
    .flat()
    .filter((e) => !e.isPremium).length;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <YStack gap="$1">
          <H2 color="$text">Sınav Hazırlık</H2>
          <Paragraph color="$textSecondary">
            {totalExams} sınav · {freeCount} ücretsiz · {roleLabel(role)} için seçildi
          </Paragraph>
        </YStack>

        {categories.map((cat) => {
          const exams = examGroups[cat]!;
          const label = EXAM_CATEGORY_LABELS[cat] ?? { tr: cat, emoji: '📋' };

          return (
            <YStack key={cat} gap="$2">
              <XStack gap="$2" alignItems="center">
                <Text fontSize="$6">{label.emoji}</Text>
                <H3 color="$text">{label.tr}</H3>
              </XStack>

              {exams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </YStack>
          );
        })}

        <Card padding="$4" backgroundColor="$primarySubtle" bordered>
          <YStack gap="$2">
            <Text fontSize="$3" color="$primary" textTransform="uppercase">
              💡 Sınav günü modu
            </Text>
            <Paragraph color="$text">
              Sınav tarihi gir → AI sana 30/14/7/1 günlük kişisel hazırlık planı çıkarır.
              T-1 gün özel mod açılır.
            </Paragraph>
            <Button
              size="$4"
              variant="outlined"
              onPress={() => router.push('/(tabs)/profile')}
            >
              Sınav tarihi ayarla →
            </Button>
          </YStack>
        </Card>

        {/* Havayolu Mülakat Hub */}
        <Card
          padding="$4"
          backgroundColor="$accent"
          onPress={() => router.push('/exam/airlines')}
          pressStyle={{ scale: 0.98 }}
        >
          <YStack gap="$2">
            <XStack gap="$2" alignItems="center">
              <Text fontSize={36}>✈️</Text>
              <YStack flex={1}>
                <Text fontSize="$5" fontWeight="700" color="$accentText">
                  Havayolu Mülakat Bankası
                </Text>
                <Text fontSize="$3" color="$accentText">
                  31 havayolu · TR + Orta Doğu + Avrupa
                </Text>
              </YStack>
              <Text fontSize="$5" color="$accentText">
                →
              </Text>
            </XStack>
            <Text fontSize="$2" color="$accentText">
              Emirates · Qatar · Lufthansa · BA · Ryanair · Wizz · ITA + 25 daha
            </Text>
            <Text fontSize="$2" color="$accentText">
              Her havayolu için: aşamalar · ipuçları · model cevap · mock interview
            </Text>
          </YStack>
        </Card>
      </YStack>
    </ScrollView>
  );
}

function ExamCard({ exam }: { exam: ExamDefinition }) {
  const handlePress = () => {
    if (exam.id === 'icao4_oral_pilot') {
      router.push('/exam/icao4');
      return;
    }
    if (exam.isPremium) {
      router.push('/paywall');
      return;
    }
    // Default: ileride /exam/[id] dynamic route ile detay sayfası
    router.push('/exam/icao4'); // placeholder
  };

  const stars = '★'.repeat(exam.prestige) + '☆'.repeat(5 - exam.prestige);

  return (
    <Card
      padding="$4"
      backgroundColor="$surface"
      bordered
      onPress={handlePress}
      pressStyle={{ scale: 0.98 }}
    >
      <YStack gap="$2">
        <XStack gap="$2" alignItems="center">
          <Text fontSize={28}>{exam.badge}</Text>
          <YStack flex={1}>
            <Text fontSize="$3" color="$textSecondary" textTransform="uppercase">
              {exam.organization}
            </Text>
            <Text fontSize="$5" fontWeight="700" color="$text">
              {exam.titleTr}
            </Text>
          </YStack>
          {exam.isPremium && (
            <Card backgroundColor="$warning" padding="$2">
              <Text fontSize="$1" color="$primaryText" fontWeight="700">
                🔒 PRO
              </Text>
            </Card>
          )}
          {!exam.isPremium && (
            <Card backgroundColor="$success" padding="$2">
              <Text fontSize="$1" color="$primaryText" fontWeight="700">
                ✓ FREE
              </Text>
            </Card>
          )}
        </XStack>

        <Paragraph fontSize="$3" color="$textSecondary">
          {exam.descriptionTr}
        </Paragraph>

        <XStack gap="$2" flexWrap="wrap">
          <InfoChip label={`${exam.totalQuestions} soru`} />
          <InfoChip label={`${exam.totalDurationMinutes} dk`} />
          <InfoChip label={`Hedef ${exam.targetLevel}`} />
          <InfoChip label={`Geçer ≥%${exam.passingScorePercent}`} />
        </XStack>

        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$2" color="$accent">
            {stars} prestij
          </Text>
          {exam.schedule && (
            <Text fontSize="$2" color="$textSecondary">
              📅 {exam.schedule}
            </Text>
          )}
        </XStack>

        <YStack gap="$1">
          {exam.sections.map((s) => (
            <XStack key={s.id} gap="$2" alignItems="center">
              <Text fontSize="$2" color="$primary" fontWeight="600">
                ·
              </Text>
              <Text fontSize="$2" color="$text" flex={1}>
                {s.titleTr}
              </Text>
              <Text fontSize="$2" color="$textSecondary">
                {s.questionCount} soru · {s.durationMinutes} dk · %{s.weight}
              </Text>
            </XStack>
          ))}
        </YStack>

        <Button
          size="$4"
          backgroundColor={exam.isPremium ? '$warning' : '$primary'}
          color="$primaryText"
          marginTop="$2"
        >
          {exam.isPremium
            ? `🔒 ${exam.freePreviewCount} ücretsiz soru · Premium'a geç`
            : '▶️ Sınava başla'}
        </Button>
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

function roleLabel(role: string): string {
  switch (role) {
    case 'pilot':
      return 'Pilot';
    case 'cabin':
      return 'Kabin Memuru';
    case 'technician':
      return 'Teknisyen';
    case 'ground':
      return 'Yer Hizmetleri';
    case 'student':
      return 'Öğrenci';
    default:
      return role;
  }
}

import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Text, Progress } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  getModulesForRole,
  isUnitUnlocked,
  isModuleUnlocked,
  getUnitProgress,
  type UnitNode,
  type ModuleNode,
} from '@/features/lessons/seed/lessonTree';
import { useProgressStore } from '@/stores/progressStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function LearnScreen() {
  const { t } = useTranslation();
  const completedSet = useProgressStore((s) => new Set(s.completedLessonIds));
  const role = useOnboardingStore((s) => s.role);
  const modules = getModulesForRole(role);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);

  const activeModule = modules[activeModuleIdx];

  if (!activeModule) return null;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <YStack gap="$1">
          <H2 color="$text">{t('learn.title', 'Öğren')}</H2>
          <Paragraph color="$textSecondary">
            {modules.length} modül · {modules.length * 50} ders ·{' '}
            {role === 'pilot' && 'Pilot yolu'}
            {role === 'cabin' && 'Kabin yolu'}
            {role === 'technician' && 'Teknisyen yolu'}
            {role === 'ground' && 'Yer Hizmetleri yolu'}
            {role === 'student' && 'Öğrenci yolu'}
          </Paragraph>
        </YStack>

        {/* Module selector pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" paddingVertical="$2">
            {modules.map((m, idx) => {
              const unlocked = isModuleUnlocked(modules, idx, completedSet);
              const isActive = idx === activeModuleIdx;
              return (
                <Card
                  key={m.id}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  backgroundColor={isActive ? '$primary' : '$surface'}
                  borderColor={isActive ? '$primary' : '$border'}
                  bordered
                  opacity={unlocked ? 1 : 0.5}
                  onPress={() => unlocked && setActiveModuleIdx(idx)}
                  pressStyle={{ scale: 0.98 }}
                >
                  <XStack gap="$1" alignItems="center">
                    <Text fontSize={20}>{unlocked ? m.badge : '🔒'}</Text>
                    <Text
                      fontSize="$3"
                      fontWeight="600"
                      color={isActive ? '$primaryText' : '$text'}
                    >
                      M{m.number}
                    </Text>
                  </XStack>
                </Card>
              );
            })}
          </XStack>
        </ScrollView>

        <ModuleContent module={activeModule} completedSet={completedSet} />
      </YStack>
    </ScrollView>
  );
}

function ModuleContent({
  module,
  completedSet,
}: {
  module: ModuleNode;
  completedSet: Set<string>;
}) {
  const moduleProgress = module.units.reduce(
    (acc, u) => {
      const p = getUnitProgress(u, completedSet);
      return { completed: acc.completed + p.completed, total: acc.total + p.total };
    },
    { completed: 0, total: 0 },
  );
  const modulePercent =
    moduleProgress.total === 0
      ? 0
      : Math.round((moduleProgress.completed / moduleProgress.total) * 100);

  return (
    <>
      {/* Module header */}
      <Card padding="$4" backgroundColor="$primary">
        <YStack gap="$2">
          <XStack gap="$2" alignItems="center">
            <Text fontSize={32}>{module.badge}</Text>
            <YStack flex={1}>
              <Text fontSize="$3" color="$primaryText" textTransform="uppercase">
                Modül {module.number}
              </Text>
              <Text fontSize="$5" fontWeight="700" color="$primaryText">
                {module.title}
              </Text>
            </YStack>
          </XStack>
          <Paragraph color="$primaryText" fontSize="$3">
            {module.description}
          </Paragraph>
          <Progress value={modulePercent} max={100} backgroundColor="$accentHover">
            <Progress.Indicator animation="lazy" backgroundColor="$accent" />
          </Progress>
          <Text fontSize="$2" color="$primaryText">
            {moduleProgress.completed} / {moduleProgress.total} ders · {modulePercent}%
          </Text>
        </YStack>
      </Card>

      <YStack gap="$3">
        {module.units.map((unit, idx) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            unlocked={isUnitUnlocked(module, idx, completedSet)}
            completedSet={completedSet}
          />
        ))}
      </YStack>
    </>
  );
}

function UnitCard({
  unit,
  unlocked,
  completedSet,
}: {
  unit: UnitNode;
  unlocked: boolean;
  completedSet: Set<string>;
}) {
  const progress = getUnitProgress(unit, completedSet);
  const allPremium = unit.lessons.every((l) => l.isPremium);

  return (
    <Card
      padding="$4"
      backgroundColor={unlocked ? '$surface' : '$backgroundHover'}
      bordered
      opacity={unlocked ? 1 : 0.6}
    >
      <YStack gap="$3">
        <XStack gap="$2" alignItems="center">
          <Text fontSize={24}>{unit.badge ?? (unlocked ? '📘' : '🔒')}</Text>
          <YStack flex={1}>
            <Text fontSize="$3" color="$textSecondary">
              Ünite {unit.number}
            </Text>
            <Text fontSize="$5" fontWeight="600" color="$text">
              {unit.title}
            </Text>
          </YStack>
          {allPremium && unlocked && (
            <Card backgroundColor="$warning" padding="$2">
              <Text fontSize="$1" color="$primaryText" fontWeight="700">
                🔒 PREMIUM
              </Text>
            </Card>
          )}
        </XStack>

        {unlocked && (
          <YStack gap="$2">
            <Progress value={progress.percent} max={100} backgroundColor="$border">
              <Progress.Indicator animation="lazy" backgroundColor="$primary" />
            </Progress>
            <Text fontSize="$2" color="$textSecondary">
              {progress.completed} / {progress.total} ders
            </Text>
          </YStack>
        )}

        {unlocked && (
          <YStack gap="$2">
            {unit.lessons.map((lesson) => {
              const isDone = completedSet.has(lesson.id);
              const isLocked = lesson.isPremium;
              return (
                <Card
                  key={lesson.id}
                  padding="$3"
                  backgroundColor={isDone ? '$successSubtle' : '$backgroundHover'}
                  bordered
                  borderColor={isDone ? '$success' : '$border'}
                  onPress={() => {
                    if (isLocked) {
                      router.push('/paywall');
                      return;
                    }
                    router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } });
                  }}
                  pressStyle={{ scale: 0.98 }}
                >
                  <XStack gap="$2" alignItems="center">
                    <Text fontSize="$5">
                      {isDone ? '✅' : isLocked ? '🔒' : lessonTypeEmoji(lesson.type)}
                    </Text>
                    <YStack flex={1}>
                      <Text
                        fontSize="$4"
                        fontWeight="500"
                        color={isDone ? '$success' : '$text'}
                        textDecorationLine={isDone ? 'line-through' : 'none'}
                      >
                        {lesson.title}
                      </Text>
                      <Text fontSize="$2" color="$textSecondary">
                        +{lesson.xp} XP · {lesson.estimatedMinutes} dk
                      </Text>
                    </YStack>
                  </XStack>
                </Card>
              );
            })}
          </YStack>
        )}

        {!unlocked && (
          <Paragraph fontSize="$3" color="$textSecondary" fontStyle="italic">
            🔒 Önceki üniteyi tamamla
          </Paragraph>
        )}
      </YStack>
    </Card>
  );
}

function lessonTypeEmoji(type: string): string {
  switch (type) {
    case 'vocabulary':
      return '📚';
    case 'dialogue':
      return '💬';
    case 'listening':
      return '🎧';
    case 'pronunciation':
      return '🎙️';
    case 'quiz':
      return '🎯';
    default:
      return '📘';
  }
}

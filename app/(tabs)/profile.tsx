import { ScrollView, Alert } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Button, Text, Separator } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { signOut } from '@/features/auth/api';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { useAuthStore } from '@/stores/authStore';
import { ALL_BADGES, getEarnedBadges } from '@/features/badges/badges';
import { changeLanguage, getCurrentLanguage } from '@/lib/i18n';
import { useState } from 'react';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const placement = useOnboardingStore((s) => s.placementResult);
  const role = useOnboardingStore((s) => s.role);
  const dailyGoal = useOnboardingStore((s) => s.dailyGoalMinutes);
  const totalXp = useGamificationStore((s) => s.totalXp);
  const level = useGamificationStore((s) => s.currentLevel);
  const longestStreak = useGamificationStore((s) => s.longestStreak);
  const currentStreak = useGamificationStore((s) => s.currentStreak);
  const completedCount = useProgressStore((s) => s.completedLessonIds.length);
  const [lang, setLang] = useState(getCurrentLanguage());

  const earnedBadges = getEarnedBadges();

  function handleSignOut() {
    Alert.alert('Çıkış yap', 'Emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  function handleLangChange(target: 'en' | 'tr') {
    void changeLanguage(target);
    setLang(target);
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        {/* Avatar + email */}
        <Card padding="$4" backgroundColor="$primary">
          <XStack gap="$3" alignItems="center">
            <Card
              width={64}
              height={64}
              borderRadius={9999}
              backgroundColor="$accent"
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize={32}>{role === 'pilot' ? '✈️' : role === 'cabin' ? '👨‍✈️' : role === 'technician' ? '🔧' : role === 'ground' ? '🛬' : '🎓'}</Text>
            </Card>
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="700" color="$primaryText">
                {user?.email ?? 'Misafir'}
              </Text>
              <Text fontSize="$3" color="$primaryText">
                {role === 'pilot' && 'Pilot'}
                {role === 'cabin' && 'Kabin Memuru'}
                {role === 'technician' && 'Uçak Teknisyeni'}
                {role === 'ground' && 'Yer Hizmetleri'}
                {role === 'student' && 'Havacılık Öğrencisi'}
              </Text>
              {placement && (
                <Text fontSize="$3" color="$primaryText">
                  {placement.level} · {placement.totalScore}/100
                </Text>
              )}
            </YStack>
          </XStack>
        </Card>

        {/* Stats */}
        <YStack gap="$2">
          <H3 color="$text">İstatistikler</H3>
          <XStack gap="$2">
            <StatCard emoji="⭐" label="XP" value={totalXp.toString()} />
            <StatCard emoji="🎖️" label="Level" value={level.toString()} />
          </XStack>
          <XStack gap="$2">
            <StatCard emoji="🔥" label="Mevcut seri" value={`${currentStreak} gün`} />
            <StatCard emoji="🏆" label="En uzun seri" value={`${longestStreak} gün`} />
          </XStack>
          <StatCard emoji="📚" label="Tamamlanan ders" value={completedCount.toString()} />
        </YStack>

        {/* Badges */}
        <YStack gap="$2">
          <XStack justifyContent="space-between" alignItems="center">
            <H3 color="$text">Rozetler</H3>
            <Text fontSize="$3" color="$textSecondary">
              {earnedBadges.length} / {ALL_BADGES.length}
            </Text>
          </XStack>
          <XStack flexWrap="wrap" gap="$2">
            {ALL_BADGES.map((badge) => {
              const earned = earnedBadges.find((b) => b.id === badge.id);
              return (
                <Card
                  key={badge.id}
                  padding="$3"
                  backgroundColor={earned ? '$accent' : '$backgroundHover'}
                  bordered
                  width="48%"
                  opacity={earned ? 1 : 0.5}
                >
                  <YStack alignItems="center" gap="$1">
                    <Text fontSize={32}>{badge.emoji}</Text>
                    <Text
                      fontSize="$3"
                      fontWeight="600"
                      color={earned ? '$accentText' : '$textSecondary'}
                      textAlign="center"
                    >
                      {badge.title}
                    </Text>
                    <Text
                      fontSize="$1"
                      color={earned ? '$accentText' : '$textSecondary'}
                      textAlign="center"
                    >
                      {badge.description}
                    </Text>
                  </YStack>
                </Card>
              );
            })}
          </XStack>
        </YStack>

        <Separator />

        {/* Settings */}
        <YStack gap="$2">
          <H3 color="$text">Ayarlar</H3>

          <Card
            padding="$3"
            backgroundColor="$surface"
            bordered
            onPress={() => router.push('/settings/language')}
            pressStyle={{ scale: 0.98 }}
          >
            <XStack gap="$2" alignItems="center" justifyContent="space-between">
              <YStack flex={1}>
                <Text fontSize="$3" color="$textSecondary">Dil · Language</Text>
                <Text fontSize="$5" fontWeight="600" color="$text">
                  {lang === 'tr' ? '🇹🇷 Türkçe' : lang === 'en' ? '🇬🇧 English' : `🌐 ${lang.toUpperCase()}`}
                </Text>
                <Text fontSize="$2" color="$textSecondary">
                  20 dil destekleniyor →
                </Text>
              </YStack>
              <Text fontSize="$5" color="$primary">→</Text>
            </XStack>
          </Card>

          <Card padding="$3" backgroundColor="$surface" bordered>
            <YStack gap="$2">
              <Text fontSize="$3" color="$textSecondary">Günlük hedef</Text>
              <Text fontSize="$5" fontWeight="600" color="$text">
                {dailyGoal ?? 15} dakika
              </Text>
              <Button
                size="$3"
                variant="outlined"
                onPress={() => router.push('/(auth)/onboarding/goals')}
              >
                Değiştir
              </Button>
            </YStack>
          </Card>
        </YStack>

        <Separator />

        {/* Shop */}
        <Card
          padding="$4"
          backgroundColor="$accent"
          onPress={() => router.push('/shop')}
          pressStyle={{ scale: 0.98 }}
        >
          <XStack gap="$3" alignItems="center">
            <Text fontSize={32}>🪙</Text>
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="700" color="$accentText">
                Mağaza
              </Text>
              <Text fontSize="$3" color="$accentText">
                Streak freeze, ekstra can, XP boost
              </Text>
            </YStack>
            <Text fontSize="$5" color="$accentText">
              →
            </Text>
          </XStack>
        </Card>

        {/* Premium */}
        <Card padding="$4" backgroundColor="$warning">
          <YStack gap="$2">
            <Text fontSize="$5" fontWeight="700" color="$primaryText">
              🚀 Premium'a geç
            </Text>
            <Text fontSize="$3" color="$primaryText">
              Sınırsız ders, AI konuşma, ICAO 4 simülatör
            </Text>
            <Button
              size="$4"
              backgroundColor="$primaryText"
              color="$warning"
              onPress={() => router.push('/paywall')}
            >
              Planları gör →
            </Button>
          </YStack>
        </Card>

        <Separator />

        <YStack gap="$2">
          <Button variant="outlined" onPress={handleSignOut}>
            {t('profile.signOut', 'Çıkış yap')}
          </Button>
          <Text fontSize="$1" color="$textSecondary" textAlign="center">
            AirSpeak v0.1.0 · KVKK · Üyelik Sözleşmesi
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  );
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <Card flex={1} padding="$3" backgroundColor="$surface" bordered>
      <YStack alignItems="center" gap="$1">
        <Text fontSize={28}>{emoji}</Text>
        <Text fontSize="$5" fontWeight="700" color="$primary">
          {value}
        </Text>
        <Text fontSize="$2" color="$textSecondary">
          {label}
        </Text>
      </YStack>
    </Card>
  );
}

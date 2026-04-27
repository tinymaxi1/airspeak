import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Text, Separator } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import {
  generateLeagueMembers,
  tierForRank,
  timeUntilWeekEnd,
  TIER_INFO,
  type LeagueTier,
  type LeagueMember,
} from '@/features/league/seed';
import { useGamificationStore } from '@/stores/gamificationStore';

const CURRENT_TIER: LeagueTier = 'bronze'; // MVP'de herkes bronz başlar

export default function LeagueScreen() {
  const { t } = useTranslation();
  const totalXp = useGamificationStore((s) => s.totalXp);

  // Mock weekly XP — total XP'nin son ~%20'si gibi simülasyon
  const weeklyXp = useMemo(() => Math.min(totalXp, Math.round(totalXp * 0.3)), [totalXp]);

  const members = useMemo(() => generateLeagueMembers(weeklyXp), [weeklyXp]);
  const userIdx = members.findIndex((m) => m.isCurrentUser);
  const userRank = userIdx + 1;
  const promotion = tierForRank(userRank);
  const timeLeft = timeUntilWeekEnd();
  const tier = TIER_INFO[CURRENT_TIER];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <YStack gap="$1">
          <H2 color="$text">{t('league.title', 'Lig')}</H2>
          <Paragraph color="$textSecondary">{t('league.subtitle')}</Paragraph>
        </YStack>

        {/* Tier header */}
        <Card padding="$4" backgroundColor="$primary">
          <YStack gap="$2" alignItems="center">
            <Text fontSize={48}>{tier.emoji}</Text>
            <Text fontSize="$5" fontWeight="700" color="$primaryText">
              {tier.name} Lig
            </Text>
            <Text fontSize="$3" color="$primaryText">
              {timeLeft.label} kaldı
            </Text>
          </YStack>
        </Card>

        {/* User position */}
        <Card
          padding="$4"
          backgroundColor={promotion.promoted ? '$success' : promotion.demoted ? '$danger' : '$accent'}
        >
          <YStack gap="$1">
            <Text fontSize="$3" color="$primaryText" textTransform="uppercase">
              Bu haftaki sıran
            </Text>
            <XStack alignItems="center" gap="$3">
              <Text fontSize={36} fontWeight="700" color="$primaryText">
                #{userRank}
              </Text>
              <YStack flex={1}>
                <Text fontSize="$5" fontWeight="600" color="$primaryText">
                  {weeklyXp} XP / hafta
                </Text>
                <Text fontSize="$3" color="$primaryText">
                  {promotion.promoted
                    ? '⬆️ Top 7 — bir üst lige çıkıyorsun!'
                    : promotion.demoted
                      ? '⬇️ Son 10 — alt lige düşüyorsun, dikkat!'
                      : '— Konumunu koru'}
                </Text>
              </YStack>
            </XStack>
          </YStack>
        </Card>

        {/* Promotion zone */}
        <Card padding="$3" backgroundColor="$successSubtle">
          <Text color="$success" fontSize="$3" fontWeight="600">
            ⬆️ Top 7: Bir üst lige (Gümüş) yükselir, +200 coin bonus
          </Text>
        </Card>

        {/* Leaderboard */}
        <YStack gap="$2">
          <H3 color="$text">Haftalık Sıralama</H3>
          <Card backgroundColor="$surface" bordered>
            <YStack>
              {members.map((member, idx) => {
                const rank = idx + 1;
                const isPromotionZone = rank <= 7;
                const isDemotionZone = rank > 20;
                return (
                  <LeaderboardRow
                    key={member.id}
                    rank={rank}
                    member={member}
                    isPromotion={isPromotionZone}
                    isDemotion={isDemotionZone}
                    showSeparator={idx === 6 || idx === 19}
                  />
                );
              })}
            </YStack>
          </Card>
        </YStack>

        <Card padding="$3" backgroundColor="$dangerSubtle">
          <Text color="$danger" fontSize="$3" fontWeight="600">
            ⬇️ Son 10: Alt lige düşer (Bronz hariç)
          </Text>
        </Card>

        <Card padding="$4" backgroundColor="$surface" bordered>
          <YStack gap="$2">
            <Text fontSize="$5" fontWeight="600" color="$text">
              💡 Lig nasıl çalışır?
            </Text>
            <Text fontSize="$3" color="$textSecondary">
              • Her hafta Pazartesi 00:00 yeni grup{'\n'}• 30 kişilik gruplar
              {'\n'}• Top 7 yükselir, son 10 düşer{'\n'}• 5 lig: Bronz → Gümüş → Altın → Elmas → Usta
              {'\n'}• İlk 3'e bonus coin (200/100/50)
            </Text>
          </YStack>
        </Card>
      </YStack>
    </ScrollView>
  );
}

function LeaderboardRow({
  rank,
  member,
  isPromotion,
  isDemotion,
  showSeparator,
}: {
  rank: number;
  member: LeagueMember;
  isPromotion: boolean;
  isDemotion: boolean;
  showSeparator: boolean;
}) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <>
      <Card
        padding="$3"
        backgroundColor={member.isCurrentUser ? '$accent' : 'transparent'}
        borderRadius={0}
      >
        <XStack gap="$3" alignItems="center">
          <Text
            fontSize="$5"
            fontWeight="700"
            color={
              member.isCurrentUser
                ? '$accentText'
                : isPromotion
                  ? '$success'
                  : isDemotion
                    ? '$danger'
                    : '$text'
            }
            width={32}
          >
            {medal ?? rank}
          </Text>
          <Text fontSize={24}>{member.avatar}</Text>
          <Text
            fontSize="$4"
            fontWeight={member.isCurrentUser ? '700' : '500'}
            color={member.isCurrentUser ? '$accentText' : '$text'}
            flex={1}
          >
            {member.username}
            {member.isCurrentUser && ' (sen)'}
          </Text>
          <Text
            fontSize="$3"
            fontWeight="600"
            color={member.isCurrentUser ? '$accentText' : '$textSecondary'}
          >
            {member.weeklyXp} XP
          </Text>
        </XStack>
      </Card>
      {showSeparator && <Separator />}
    </>
  );
}

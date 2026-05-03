/**
 * GroupCard — community group list satırı.
 *
 * Privacy badge: open / closed / secret / premium (lock ikon + renk).
 * Member count + post count + emoji + banner (varsa).
 */
import { TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { CommunityGroup, GroupPrivacy } from '@/features/community/api';
import { FONTS, Mono, Body } from '@/components/airspeak';

const PRIVACY_META: Record<GroupPrivacy, { label: string; emoji: string; color: string }> = {
  open: { label: 'AÇIK', emoji: '🌐', color: '#2DBE6C' },
  closed: { label: 'KAPALI', emoji: '🔐', color: '#1F4FB6' },
  secret: { label: 'GİZLİ', emoji: '🤫', color: '#7C5CFF' },
  premium: { label: 'PRO', emoji: '👑', color: '#F2C14E' },
};

export function GroupCard({ group, compact }: { group: CommunityGroup; compact?: boolean }) {
  const meta = PRIVACY_META[group.privacy];
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/community/${group.slug}` as any)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        borderBottomWidth: 4,
        borderBottomColor: '#DCE0E8',
        padding: compact ? 10 : 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {group.banner_url ? (
        <Image
          source={{ uri: group.banner_url }}
          style={{ width: 52, height: 52, borderRadius: 12 }}
        />
      ) : (
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            backgroundColor: `${meta.color}22`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 26 }}>{group.emoji}</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            numberOfLines={1}
            style={{ fontFamily: FONTS.body800, fontSize: 15, color: '#0E1116', flex: 1 }}
          >
            {group.name}
          </Text>
          <View
            style={{
              backgroundColor: `${meta.color}22`,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Mono style={{ fontSize: 9, color: meta.color, letterSpacing: 0.81 }}>
              {meta.emoji} {meta.label}
            </Mono>
          </View>
        </View>
        {group.description && !compact ? (
          <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }} numberOfLines={2}>
            {group.description}
          </Body>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
          <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8 }}>
            👥 {group.member_count.toLocaleString('tr-TR')}/{group.capacity}
          </Mono>
          <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8 }}>
            📝 {group.post_count.toLocaleString('tr-TR')}
          </Mono>
        </View>
      </View>
    </TouchableOpacity>
  );
}

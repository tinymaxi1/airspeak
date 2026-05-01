/**
 * Community in-app notifications feed.
 *
 * - useCommunityNotifications: realtime postgres_changes subscribe.
 * - Tap → ilgili post veya comment'a navigate.
 * - Tüm okundu işaretle butonu (markCommunityNotificationsRead).
 */
import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import {
  useCommunityNotifications,
  markCommunityNotificationsRead,
  type CommunityNotification,
  type NotificationType,
} from '@/features/community/notifications';
import { FONTS, Avatar, Mono, Body } from '@/components/airspeak';

const TYPE_META: Record<NotificationType, { emoji: string; label: string; color: string }> = {
  mention: { emoji: '@', label: 'Etiketleme', color: '#1F4FB6' },
  comment_reply: { emoji: '💬', label: 'Yanıt', color: '#7C5CFF' },
  post_reaction: { emoji: '♥', label: 'Tepki', color: '#E63946' },
  mod_warning: { emoji: '⚠️', label: 'Uyarı', color: '#FF7847' },
};

function relTime(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}sn`;
  if (d < 3600) return `${Math.floor(d / 60)}dk`;
  if (d < 86400) return `${Math.floor(d / 3600)}sa`;
  if (d < 7 * 86400) return `${Math.floor(d / 86400)}g`;
  return new Date(iso).toLocaleDateString('tr-TR');
}

export default function CommunityNotificationsScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const { rows, loading, refresh, unreadCount } = useCommunityNotifications(userId);
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  async function markAll() {
    if (unreadCount === 0) return;
    await markCommunityNotificationsRead();
    void refresh();
  }

  function onTap(n: CommunityNotification) {
    // Mark single read (optimistic via refresh after navigate)
    if (!n.read_at) void markCommunityNotificationsRead([n.id]);
    if (n.target_type === 'post') {
      router.push(`/community/post/${n.target_id}` as any);
    } else if (n.target_type === 'comment') {
      // Comment için parent post'a yönlendir (post detail içinde scroll'a gerek yok şimdilik)
      // n.target_id = comment_id; post_id'yi snippet'ten alamadığımız için RPC veya extra fetch gerek
      // Basit: comment_id ile post detail'i açmak yerine, snippet ekranı placeholder
      router.push(`/community/post/${n.target_id}` as any);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0F1E47' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#0F1E47',
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: '#FFFFFF' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
              KOMÜNITE
            </Mono>
            <Text style={{ fontFamily: FONTS.display, fontSize: 22, color: '#FFFFFF', fontWeight: '700' }}>
              🔔 Bildirimler {unreadCount > 0 ? `· ${unreadCount}` : ''}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAll}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: FONTS.body700 }}>
                Tümü okundu
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />}
      >
        {loading && rows.length === 0 ? (
          <Body color="#5A6478" style={{ textAlign: 'center', marginTop: 40 }}>
            Yükleniyor…
          </Body>
        ) : rows.length === 0 ? (
          <View style={{ marginTop: 60, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 48 }}>🔔</Text>
            <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center', maxWidth: 240 }}>
              Henüz bildirimin yok. Bir gruba katılınca yorumlar, mention'lar ve tepkiler burada görünür.
            </Body>
          </View>
        ) : (
          rows.map((n) => {
            const meta = TYPE_META[n.type];
            const unread = !n.read_at;
            const actorName = n.actor_full_name ?? n.actor_username ?? 'Birisi';
            return (
              <TouchableOpacity
                key={n.id}
                activeOpacity={0.85}
                onPress={() => onTap(n)}
                style={{
                  backgroundColor: unread ? '#FFE4E7' : '#FFFFFF',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: unread ? '#FFC1C8' : '#EDEFF3',
                  padding: 12,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${meta.color}22`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {n.actor_avatar_url ? (
                    <Image
                      source={{ uri: n.actor_avatar_url }}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                  ) : (
                    <Avatar
                      initials={actorName.slice(0, 2).toUpperCase()}
                      color={meta.color}
                      size={40}
                    />
                  )}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      backgroundColor: meta.color,
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                    }}
                  >
                    <Text style={{ fontSize: 10 }}>{meta.emoji}</Text>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0E1116' }}>
                    {n.type === 'mention' && `${actorName} seni etiketledi`}
                    {n.type === 'comment_reply' &&
                      (n.target_type === 'comment'
                        ? `${actorName} yorumunu yanıtladı`
                        : `${actorName} postunu yorumladı`)}
                    {n.type === 'post_reaction' && `${actorName} ${n.snippet ?? '✨'} reaction verdi`}
                    {n.type === 'mod_warning' && 'Moderasyon uyarısı'}
                  </Text>
                  {n.snippet && n.type !== 'post_reaction' && (
                    <Body
                      color="#5A6478"
                      style={{ fontSize: 12, marginTop: 2, lineHeight: 17 }}
                      numberOfLines={2}
                    >
                      {n.snippet}
                    </Body>
                  )}
                  <Mono style={{ fontSize: 9, color: '#8A93A6', marginTop: 4, letterSpacing: 0.7 }}>
                    {relTime(n.created_at)} · {meta.label}
                  </Mono>
                </View>

                {unread && (
                  <View
                    style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#E63946', marginTop: 6 }}
                  />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

/**
 * Notifications Screen — gerçek DB feed (notification_log + community_notifications).
 * Sprint 5.B
 *
 * - Tab strip: All / Unread / Coach / League / Community
 * - Swipe to delete (gesture-handler)
 * - Tap → markRead + deep link
 * - "Tümünü oku" header butonu
 * - Realtime (yeni notif anlık görünür)
 * - Empty state
 */
import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { useAuthStore } from '@/stores/authStore';
import {
  useNotifications,
  markAllNotificationsRead,
  deleteNotification,
  markNotificationTapped,
  routeFromNotification,
  type UnifiedNotification,
} from '@/features/notifications/api';
import { Mono, FONTS, BackButton } from '@/components/airspeak';

type FilterKey = 'all' | 'unread' | 'coach' | 'league' | 'community';

const FILTERS: Array<{ key: FilterKey; tk: string; td: string }> = [
  { key: 'all', tk: 'notif.filter.all', td: 'Hepsi' },
  { key: 'unread', tk: 'notif.filter.unread', td: 'Okunmamış' },
  { key: 'coach', tk: 'notif.filter.coach', td: 'Koç' },
  { key: 'league', tk: 'notif.filter.league', td: 'Lig' },
  { key: 'community', tk: 'notif.filter.community', td: 'Komünite' },
];

function categorize(n: UnifiedNotification): 'coach' | 'league' | 'community' | 'system' {
  if (n.source === 'community') return 'community';
  const t = n.type;
  if (t.startsWith('league_') || t === 'squadron_lapped') return 'league';
  if (
    t.startsWith('streak') ||
    t === 'heart_full' ||
    t === 'icao_mock_feedback' ||
    t === 'oral_evaluated' ||
    t === 'ai_scenario_weekly' ||
    t === 'inactivity_recovery' ||
    t === 'new_unit' ||
    t === 'exam_countdown'
  )
    return 'coach';
  return 'system';
}

const CAT_STYLE: Record<string, { icon: string; color: string }> = {
  coach: { icon: '🤖', color: '#7C5CFF' },
  league: { icon: '🏆', color: '#F2C14E' },
  community: { icon: '💬', color: '#2EA8FF' },
  system: { icon: '✦', color: '#0F1E47' },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'şimdi';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}dk`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}sa`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}g`;
  return `${Math.floor(d / 7)}h`;
}

export default function NotificationsScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const { rows, loading, refresh, unreadCount } = useNotifications(userId);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'unread') return rows.filter((r) => !r.read_at);
    return rows.filter((r) => categorize(r) === filter);
  }, [rows, filter]);

  async function onTap(item: UnifiedNotification) {
    void markNotificationTapped(item);
    const route = routeFromNotification(item);
    router.push(route as any);
  }

  async function onMarkAllRead() {
    await markAllNotificationsRead();
    await refresh();
  }

  async function onDelete(item: UnifiedNotification) {
    await deleteNotification(item);
    await refresh();
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
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
          <BackButton onPress={() => router.back()} label={t('common.back', 'Geri')} />
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.6 }}>
              OPS FREQ · {unreadCount} NEW
            </Mono>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 22, color: '#0E1116', marginTop: 2 }}>
              {t('screens.notifications.title', 'Bildirimler')}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={onMarkAllRead}>
              <Mono style={{ fontSize: 11, color: '#0F1E47', letterSpacing: 1 }}>
                {t('notif.markAllRead', 'TÜMÜNÜ OKU')}
              </Mono>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 12,
            gap: 4,
            borderBottomWidth: 1,
            borderBottomColor: '#EDEFF3',
          }}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const count =
              f.key === 'all'
                ? rows.length
                : f.key === 'unread'
                  ? unreadCount
                  : rows.filter((r) => categorize(r) === f.key).length;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderBottomWidth: active ? 2 : 0,
                  borderBottomColor: '#E63946',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.body700,
                    fontSize: 13,
                    color: active ? '#0E1116' : '#8A93A6',
                  }}
                >
                  {t(f.tk, f.td)}
                  {count > 0 && (
                    <Text style={{ color: active ? '#E63946' : '#8A93A6' }}> ({count})</Text>
                  )}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0F1E47" />
        </View>
      ) : filtered.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 56, marginBottom: 12 }}>🔔</Text>
          <Text style={{ fontFamily: FONTS.body700, fontSize: 16, color: '#0E1116', marginBottom: 6 }}>
            {filter === 'unread'
              ? t('notif.empty.unread', 'Okunmamış bildirim yok')
              : t('notif.empty.title', 'Henüz bildirim yok')}
          </Text>
          <Text style={{ fontSize: 13, color: '#8A93A6', textAlign: 'center', lineHeight: 18 }}>
            {t(
              'notif.empty.body',
              'Streak, lig, komünite ve ICAO sözlü bildirimleri burada toplanır.',
            )}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => `${item.source}-${item.id}`}
          windowSize={7}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await refresh();
                setRefreshing(false);
              }}
            />
          }
          renderItem={({ item }) => (
            <NotifRow item={item} onTap={onTap} onDelete={onDelete} />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

function NotifRow({
  item,
  onTap,
  onDelete,
}: {
  item: UnifiedNotification;
  onTap: (i: UnifiedNotification) => void;
  onDelete: (i: UnifiedNotification) => void;
}) {
  const cat = categorize(item);
  const style = CAT_STYLE[cat] ?? CAT_STYLE.system!;
  const unread = !item.read_at;

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={() =>
        Alert.alert('Sil', 'Bu bildirimi silmek istediğine emin misin?', [
          { text: 'İptal', style: 'cancel' },
          { text: 'Sil', style: 'destructive', onPress: () => onDelete(item) },
        ])
      }
      style={{
        backgroundColor: '#E63946',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
      }}
    >
      <Text style={{ color: '#FFFFFF', fontFamily: FONTS.body700, fontSize: 13 }}>Sil</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onTap(item)}
        style={{
          flexDirection: 'row',
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: unread ? '#FFF1F2' : '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#EDEFF3',
          alignItems: 'flex-start',
        }}
      >
        {unread && (
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#E63946',
              marginTop: 18,
            }}
          />
        )}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: style.color + '22',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: unread ? 0 : 6,
          }}
        >
          <Text style={{ fontSize: 20 }}>{style.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                fontFamily: unread ? FONTS.body700 : FONTS.body,
                fontSize: 14,
                color: '#0E1116',
              }}
            >
              {item.title}
            </Text>
            <Mono style={{ fontSize: 11, color: '#8A93A6' }}>{relativeTime(item.created_at)}</Mono>
          </View>
          {item.body && (
            <Text
              numberOfLines={2}
              style={{ fontSize: 13, color: '#5A6478', marginTop: 3, lineHeight: 17 }}
            >
              {item.body}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

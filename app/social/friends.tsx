/**
 * Arkadaşlar — pending requests + accepted list + add by username.
 */
import { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  ChevronLeft,
  UserPlus,
  Check,
  X,
  Trash2,
  TrendingUp,
} from 'lucide-react-native';
import { Body, FONTS, Mono, Avatar, Button3D } from '@/components/airspeak';
import { useAuthStore } from '@/stores/authStore';
import {
  useFriends,
  sendFriendRequest,
  respondFriendRequest,
  deleteFriendship,
  type FriendRow,
} from '@/features/social/api';

export default function FriendsScreen() {
  const c = usePalette();
  const user = useAuthStore((s) => s.user);
  const { rows, loading, refresh } = useFriends(user?.id);
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);

  const incoming = useMemo(
    () => rows.filter((r) => r.status === 'pending' && r.is_incoming),
    [rows],
  );
  const outgoing = useMemo(
    () => rows.filter((r) => r.status === 'pending' && !r.is_incoming),
    [rows],
  );
  const accepted = useMemo(() => {
    const arr = rows.filter((r) => r.status === 'accepted');
    arr.sort((a, b) => b.week_xp - a.week_xp);
    return arr;
  }, [rows]);

  async function add() {
    if (!username.trim()) return;
    setBusy(true);
    const r = await sendFriendRequest(username.trim());
    setBusy(false);
    if (r.ok) {
      Alert.alert(
        '✓',
        r.auto_accepted ? 'Otomatik kabul edildi (karşılıklı request)' : 'İstek gönderildi',
      );
      setUsername('');
      void refresh();
    } else {
      Alert.alert('Hata', r.error ?? 'Bir şeyler yanlış gitti');
    }
  }

  async function respond(id: string, accept: boolean) {
    const r = await respondFriendRequest(id, accept);
    if (r.ok) void refresh();
    else Alert.alert('Hata', r.error ?? 'Hata');
  }

  async function remove(id: string, name: string) {
    Alert.alert(`${name}`, 'Arkadaşlığı sil?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const r = await deleteFriendship(id);
          if (r.ok) void refresh();
          else Alert.alert('Hata', r.error ?? 'Hata');
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0F1E47' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#0F1E47',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <UserPlus size={22} color="#FFFFFF" />
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
              ARKADAŞLAR
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 22,
                color: '#FFFFFF',
                fontWeight: '700',
                marginTop: 2,
              }}
            >
              {accepted.length} aktif · {incoming.length} bekleyen
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Add */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: '#EDEFF3',
            marginBottom: 16,
          }}
        >
          <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4 }}>
            ARKADAŞ EKLE
          </Mono>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="kullanıcı adı"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                flex: 1,
                backgroundColor: '#F4F2EC',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontFamily: FONTS.mono700,
                fontSize: 14,
                color: '#0E1116',
              }}
            />
            <TouchableOpacity
              onPress={add}
              disabled={busy || !username.trim()}
              style={{
                backgroundColor: username.trim() ? '#E63946' : '#DCE0E8',
                borderRadius: 10,
                paddingHorizontal: 16,
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#FFFFFF' }}>
                {busy ? '…' : 'EKLE'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Incoming requests */}
        {incoming.length > 0 && (
          <View style={{ marginBottom: 18 }}>
            <Mono style={{ fontSize: 11, color: '#E63946', letterSpacing: 1.4, marginBottom: 8 }}>
              GELEN İSTEK · {incoming.length}
            </Mono>
            {incoming.map((f, i) => (
              <FriendCard
                key={f.friendship_id}
                friend={f}
                delay={i * 40}
                actions={
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => respond(f.friendship_id, true)}
                      style={{
                        backgroundColor: '#2DBE6C',
                        padding: 8,
                        borderRadius: 8,
                      }}
                    >
                      <Check size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => respond(f.friendship_id, false)}
                      style={{
                        backgroundColor: '#E63946',
                        padding: 8,
                        borderRadius: 8,
                      }}
                    >
                      <X size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                }
              />
            ))}
          </View>
        )}

        {/* Outgoing pending */}
        {outgoing.length > 0 && (
          <View style={{ marginBottom: 18 }}>
            <Mono style={{ fontSize: 11, color: '#8A93A6', letterSpacing: 1.4, marginBottom: 8 }}>
              BEKLEYEN · {outgoing.length}
            </Mono>
            {outgoing.map((f, i) => (
              <FriendCard
                key={f.friendship_id}
                friend={f}
                delay={i * 40}
                actions={
                  <TouchableOpacity
                    onPress={() => respond(f.friendship_id, false)}
                    style={{ padding: 6 }}
                  >
                    <Trash2 size={14} color="#8A93A6" />
                  </TouchableOpacity>
                }
              />
            ))}
          </View>
        )}

        {/* Accepted (sorted by week_xp DESC — friends leaderboard) */}
        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4, marginBottom: 8 }}>
          ARKADAŞLAR · BU HAFTA SIRALAMASI
        </Mono>
        {loading && rows.length === 0 ? (
          <ActivityIndicator color="#E63946" style={{ marginTop: 24 }} />
        ) : accepted.length === 0 ? (
          <Body color="#8A93A6" style={{ fontSize: 13, textAlign: 'center', marginTop: 16 }}>
            Henüz arkadaşın yok. Yukarıdaki kutudan kullanıcı adı ile ekle.
          </Body>
        ) : (
          accepted.map((f, i) => (
            <FriendCard
              key={f.friendship_id}
              friend={f}
              rank={i + 1}
              delay={i * 30}
              showStats
              actions={
                <TouchableOpacity onPress={() => remove(f.friendship_id, f.full_name ?? f.username ?? 'Pilot')}>
                  <Trash2 size={14} color="#8A93A6" />
                </TouchableOpacity>
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function FriendCard({
  friend,
  rank,
  delay,
  actions,
  showStats,
}: {
  friend: FriendRow;
  rank?: number;
  delay: number;
  actions: React.ReactNode;
  showStats?: boolean;
}) {
  const initials = (friend.full_name ?? friend.username ?? 'PI').slice(0, 2).toUpperCase();
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(260)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EDEFF3',
      }}
    >
      {rank != null && (
        <Text style={{ fontFamily: FONTS.display, fontSize: 14, fontWeight: '700', color: '#5A6478', width: 24 }}>
          {rank}
        </Text>
      )}
      <Avatar initials={initials} imageUrl={friend.avatar_url} size={36} color="#0F1E47" />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }} numberOfLines={1}>
          {friend.full_name ?? friend.username ?? 'Pilot'}
        </Text>
        {friend.username && friend.username !== friend.full_name && (
          <Mono style={{ fontSize: 10, color: '#8A93A6', marginTop: 1 }}>
            @{friend.username}
          </Mono>
        )}
        {showStats && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <TrendingUp size={10} color="#E63946" />
              <Mono style={{ fontSize: 10, color: '#5A6478' }}>
                {friend.week_xp.toLocaleString('tr-TR')}
              </Mono>
            </View>
            <Mono style={{ fontSize: 10, color: '#FF7847' }}>
              🔥 {friend.current_streak}
            </Mono>
          </View>
        )}
      </View>
      {actions}
    </Animated.View>
  );
}

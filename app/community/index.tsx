/**
 * Community index — group browser.
 *
 * 2 sekme: "Benim Gruplarım" / "Keşfet"
 * Sağ üst: yeni grup oluşturma butonu
 */
import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useGroups, useMyGroups } from '@/features/community/api';
import { GroupCard } from '@/components/community/GroupCard';
import { FONTS, Mono, Body } from '@/components/airspeak';

export default function CommunityIndexScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const [tab, setTab] = useState<'mine' | 'discover'>(userId ? 'mine' : 'discover');
  const { rows: myRows, loading: myLoading } = useMyGroups(userId);
  const { rows: allRows, loading: allLoading, refresh } = useGroups();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refresh().catch(() => undefined);
    setRefreshing(false);
  }

  const rows = tab === 'mine' ? myRows : allRows;
  const loading = tab === 'mine' ? myLoading : allLoading;

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
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}>
            <Text style={{ fontSize: 22, color: '#FFFFFF' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
              KOMÜNITE
            </Mono>
            <Text style={{ fontFamily: FONTS.display, fontSize: 22, color: '#FFFFFF', fontWeight: '700' }}>
              Squadron Hub
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/community/search' as any)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/community/bookmarks' as any)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>🔖</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/community/new-group' as any)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>+ Yeni</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#EDEFF3',
        }}
      >
        {(['mine', 'discover'] as const).map((id) => {
          const active = tab === id;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setTab(id)}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderBottomWidth: 3,
                borderBottomColor: active ? '#E63946' : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.body800,
                  fontSize: 13,
                  color: active ? '#0E1116' : '#8A93A6',
                  letterSpacing: 0.39,
                }}
              >
                {id === 'mine' ? 'BENIM GRUPLARIM' : 'KEŞFET'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
          <View style={{ marginTop: 40, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 48 }}>{tab === 'mine' ? '✈️' : '🌐'}</Text>
            <Text
              style={{ fontFamily: FONTS.body700, fontSize: 15, color: '#0E1116', textAlign: 'center' }}
            >
              {tab === 'mine' ? 'Henüz bir grupta değilsin' : 'Henüz açık grup yok'}
            </Text>
            <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center', maxWidth: 260 }}>
              {tab === 'mine'
                ? '"Keşfet" sekmesinden bir gruba katıl ya da kendin oluştur.'
                : 'İlk grubu sen oluştur — diğer pilotları davet et.'}
            </Body>
          </View>
        ) : (
          rows.map((g) => <GroupCard key={g.id} group={g} />)
        )}
      </ScrollView>
    </View>
  );
}

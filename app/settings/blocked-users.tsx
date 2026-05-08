/**
 * Settings → Engellenen Kullanıcılar
 *
 * Apple Submit Guideline 1.2 zorunlu — kullanıcı engellediği listesini görüp
 * yönetebilmeli (engeli kaldırma).
 */
import { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePalette } from '@/lib/usePalette';
import { useTranslation } from 'react-i18next';
import {
  listBlockedUsers,
  unblockUser,
  type BlockedUserRow,
} from '@/features/community/api';
import {
  FONTS,
  Mono,
  Body,
  Avatar,
  Eyebrow,
  BackButton,
} from '@/components/airspeak';

export default function BlockedUsersScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const [rows, setRows] = useState<BlockedUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await listBlockedUsers();
    setRows(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function onUnblock(row: BlockedUserRow) {
    Alert.alert(
      t('settings.blockedUsers.unblockTitle', 'Engeli kaldır?'),
      t(
        'settings.blockedUsers.unblockBody',
        '@{{u}} kullanıcısının postları ve yorumları tekrar görünecek.',
        { u: row.username ?? 'kullanıcı' },
      ),
      [
        { text: t('common.cancel', 'Vazgeç'), style: 'cancel' },
        {
          text: t('settings.blockedUsers.unblockConfirm', 'Engeli kaldır'),
          style: 'destructive',
          onPress: async () => {
            setBusyId(row.user_id);
            const r = await unblockUser(row.user_id);
            setBusyId(null);
            if (r.ok) {
              setRows((prev) => prev.filter((x) => x.user_id !== row.user_id));
            } else {
              Alert.alert('Hata', r.error ?? 'Engel kaldırılamadı');
            }
          },
        },
      ],
    );
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
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
              {t('settings.blockedUsers.eyebrow', 'AYARLAR · GİZLİLİK')}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 22,
                fontWeight: '700',
                color: '#0E1116',
                letterSpacing: -0.44,
                marginTop: 2,
              }}
            >
              {t('settings.blockedUsers.title', 'Engellenen Kullanıcılar')}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />}
      >
        <Body color="#5A6478" style={{ fontSize: 13, marginBottom: 16, lineHeight: 19 }}>
          {t(
            'settings.blockedUsers.desc',
            'Engellediğin kullanıcıların post ve yorumları sana görünmez. İstediğin zaman engeli kaldırabilirsin.',
          )}
        </Body>

        {loading ? (
          <Body color="#5A6478" style={{ textAlign: 'center', marginTop: 40 }}>
            {t('common.loading', 'Yükleniyor…')}
          </Body>
        ) : rows.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40, gap: 8 }}>
            <Text style={{ fontSize: 48 }}>🤝</Text>
            <Text
              style={{ fontFamily: FONTS.body700, fontSize: 15, color: '#0E1116', textAlign: 'center' }}
            >
              {t('settings.blockedUsers.empty', 'Henüz engellediğin kullanıcı yok')}
            </Text>
            <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center', maxWidth: 260 }}>
              {t(
                'settings.blockedUsers.emptyDesc',
                'Bir kullanıcıyı engellemek için profiline gidip "Engelle" butonunu kullanabilirsin.',
              )}
            </Body>
          </View>
        ) : (
          <>
            <Eyebrow>{t('settings.blockedUsers.count', '{{n}} ENGELLİ', { n: rows.length })}</Eyebrow>
            <View style={{ marginTop: 8, gap: 8 }}>
              {rows.map((row) => (
                <View
                  key={row.user_id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: '#DCE0E8',
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {row.avatar_url ? (
                    <Image
                      source={{ uri: row.avatar_url }}
                      style={{ width: 44, height: 44, borderRadius: 22 }}
                    />
                  ) : (
                    <Avatar
                      initials={(row.username ?? row.full_name ?? '??').slice(0, 2).toUpperCase()}
                      color="#0F1E47"
                      size={44}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#0E1116' }}
                      numberOfLines={1}
                    >
                      {row.full_name ?? row.username ?? 'Kullanıcı'}
                    </Text>
                    {row.username && (
                      <Mono style={{ fontSize: 11, color: '#8A93A6', marginTop: 2 }}>
                        @{row.username}
                      </Mono>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => onUnblock(row)}
                    disabled={busyId === row.user_id}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1.5,
                      borderColor: '#DCE0E8',
                      opacity: busyId === row.user_id ? 0.5 : 1,
                    }}
                  >
                    <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: '#5A6478' }}>
                      {busyId === row.user_id
                        ? '...'
                        : t('settings.blockedUsers.unblock', 'Engeli kaldır')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

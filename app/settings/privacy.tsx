/**
 * Settings → Privacy & data — KVKK + GDPR uyumlu privacy ekranı.
 */
import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, Linking, Switch } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from '@/features/auth/api';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { updateMentionPrivacy } from '@/features/community/api';
import {
  Eyebrow,
  Mono,
  Body,
  FONTS,
  SettingsRow,
  BackButton,
} from '@/components/airspeak';

export default function PrivacySettingsScreen() {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const [friendsOnlyMentions, setFriendsOnlyMentions] = useState(false);
  const [mentionLoading, setMentionLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setMentionLoading(false);
      return;
    }
    void (async () => {
      const { data } = await (supabase as any)
        .from('profiles')
        .select('mention_privacy')
        .eq('id', userId)
        .maybeSingle();
      if (mounted) {
        setFriendsOnlyMentions((data as any)?.mention_privacy === 'friends_only');
        setMentionLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  async function onToggleMentionPrivacy(next: boolean) {
    setFriendsOnlyMentions(next); // optimistic
    const r = await updateMentionPrivacy(next ? 'friends_only' : 'all');
    if (!r.ok) {
      setFriendsOnlyMentions(!next);
      Alert.alert('Hata', r.error ?? 'Kaydedilemedi');
    }
  }

  const [deletionStatus, setDeletionStatus] = useState<{
    pending: boolean;
    daysRemaining?: number;
  }>({ pending: false });

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      const { data } = await (supabase as any).rpc('get_account_deletion_status');
      if (data?.pending) {
        setDeletionStatus({
          pending: true,
          daysRemaining: data.days_remaining,
        });
      }
    })();
  }, [userId]);

  const handleExportData = () => {
    Alert.alert(
      t('settings.privacy.exportTitle', 'Verilerini İndir'),
      t(
        'settings.privacy.exportBody',
        'Tüm verilerin JSON formatında 24 saat içinde email ile gönderilecek.',
      ),
      [
        { text: t('common.cancel', 'İptal'), style: 'cancel' },
        {
          text: t('settings.privacy.requestExport', 'Talep gönder'),
          onPress: async () => {
            const { data, error } = await (supabase as any).rpc('request_data_export');
            if (error) {
              Alert.alert(t('common.error', 'Hata'), error.message);
              return;
            }
            if (data?.ok === false) {
              Alert.alert(
                t('settings.privacy.exportTitle', 'Verilerini İndir'),
                data.message ?? 'İstek alınamadı',
              );
              return;
            }
            Alert.alert(
              t('common.success', 'Tamam'),
              data?.message ?? 'İstek alındı. 24 saat içinde email gelecek.',
            );
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.privacy.deleteTitle', 'Hesabı Sil'),
      t(
        'settings.privacy.deleteBody',
        'Tüm verilerin 30 gün sonra kalıcı silinir. Bu süre içinde giriş yaparak iptal edebilirsin.',
      ),
      [
        { text: t('common.cancel', 'İptal'), style: 'cancel' },
        {
          text: t('settings.privacy.confirmDelete', 'Sil'),
          style: 'destructive',
          onPress: async () => {
            const { data, error } = await (supabase as any).rpc('request_account_deletion');
            if (error || data?.ok === false) {
              Alert.alert(t('common.error', 'Hata'), error?.message ?? 'İşlem başarısız');
              return;
            }
            Alert.alert(
              t('settings.privacy.deletePendingTitle', 'Hesap silme talebi alındı'),
              data?.message ??
                '30 gün içinde giriş yaparak iptal edebilirsin. Aksi halde hesabın silinecek.',
              [
                {
                  text: 'OK',
                  onPress: async () => {
                    await signOut();
                    router.replace('/(auth)/welcome');
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const handleCancelDeletion = () => {
    Alert.alert(
      t('settings.privacy.cancelDeleteTitle', 'Silme talebini iptal et'),
      t(
        'settings.privacy.cancelDeleteBody',
        'Hesabın aktif kalacak. Daha sonra tekrar talep edebilirsin.',
      ),
      [
        { text: t('common.back', 'Geri'), style: 'cancel' },
        {
          text: t('common.confirm', 'Onayla'),
          onPress: async () => {
            const { data, error } = await (supabase as any).rpc('cancel_account_deletion');
            if (error || data?.ok === false) {
              Alert.alert(t('common.error', 'Hata'), error?.message ?? 'İşlem başarısız');
              return;
            }
            setDeletionStatus({ pending: false });
            Alert.alert(t('common.success', 'Tamam'), 'Hesap silme talebi iptal edildi.');
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
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
          <Text
            accessibilityRole="header"
            style={{ flex: 1, fontFamily: FONTS.body800, fontSize: 22, color: '#0E1116' }}
          >
            {t('settings.privacy.title', 'Gizlilik & Veri')}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Body color="#5A6478" style={{ fontSize: 14, marginBottom: 20, lineHeight: 21 }}>
          {t(
            'settings.privacy.intro',
            'Mikrofon kayıtların cihazda işlenir, sunucuya gönderilmez. KVKK + GDPR uyumlu.',
          )}
        </Body>

        {/* Komünite mention privacy */}
        <Eyebrow>KOMÜNITE</Eyebrow>
        <View style={{ marginTop: 8, marginBottom: 16, paddingHorizontal: 4 }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              paddingHorizontal: 14,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 22 }}>@</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                Sadece arkadaşlar etiketleyebilir
              </Text>
              <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }}>
                Açık ise yalnız arkadaş listendekiler @kullanıcı_adın yazınca push gelir.
              </Body>
            </View>
            <Switch
              value={friendsOnlyMentions}
              onValueChange={onToggleMentionPrivacy}
              disabled={mentionLoading || !userId}
              trackColor={{ false: '#DCE0E8', true: '#2DBE6C' }}
            />
          </View>
        </View>

        <Eyebrow>{t('settings.privacy.docs', 'BELGELER')}</Eyebrow>
        <View style={{ marginTop: 8, marginBottom: 16, paddingHorizontal: 4 }}>
          <SettingsRow
            icon="📜"
            label={t('settings.privacy.policy', 'Gizlilik Politikası')}
            onPress={() => Linking.openURL('https://airspeak.io/privacy')}
          />
          <SettingsRow
            icon="📋"
            label={t('settings.privacy.terms', 'Kullanım Şartları')}
            onPress={() => Linking.openURL('https://airspeak.io/terms')}
          />
          <SettingsRow
            icon="🇹🇷"
            label={t('settings.privacy.kvkk', 'KVKK Aydınlatma Metni')}
            onPress={() => Linking.openURL('https://airspeak.io/kvkk')}
            last
          />
        </View>

        <Eyebrow>{t('settings.privacy.data', 'VERİLERİN')}</Eyebrow>
        <View style={{ marginTop: 8, marginBottom: 16, paddingHorizontal: 4 }}>
          <SettingsRow
            icon="📥"
            label={t('settings.privacy.export', 'Verilerimi indir (JSON)')}
            onPress={handleExportData}
            last
          />
        </View>

        <Eyebrow>{t('settings.privacy.danger', 'TEHLİKELİ ALAN')}</Eyebrow>
        <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
          {deletionStatus.pending ? (
            <>
              <View
                style={{
                  backgroundColor: '#FFE4E7',
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: '#E63946',
                  padding: 14,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#E63946' }}>
                  {t('settings.privacy.pendingDeletion', 'Hesabın silinmek üzere')}
                </Text>
                <Body color="#5A6478" style={{ fontSize: 12, marginTop: 4 }}>
                  {t(
                    'settings.privacy.pendingDeletionBody',
                    '{{days}} gün sonra kalıcı silinecek. İptal etmek için aşağıdan onayla.',
                    { days: deletionStatus.daysRemaining ?? 30 },
                  )}
                </Body>
              </View>
              <SettingsRow
                icon="↶"
                label={t('settings.privacy.cancelDeletion', 'Silme talebini iptal et')}
                onPress={handleCancelDeletion}
                last
              />
            </>
          ) : (
            <SettingsRow
              icon="🗑"
              label={t('settings.privacy.deleteAccount', 'Hesabı kalıcı sil')}
              danger
              onPress={handleDeleteAccount}
              last
            />
          )}
        </View>

        <Mono
          style={{
            fontSize: 11,
            color: '#8A93A6',
            textAlign: 'center',
            marginTop: 24,
            lineHeight: 16,
          }}
        >
          {t(
            'settings.privacy.contact',
            'Soru/şikayet: privacy@airspeak.io · KVKK temsilci için kvkk@airspeak.io',
          )}
        </Mono>
      </ScrollView>
    </View>
  );
}

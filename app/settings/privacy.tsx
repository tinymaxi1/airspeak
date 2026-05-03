/**
 * Settings → Privacy & data — KVKK + GDPR uyumlu privacy ekranı.
 */
import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, Linking, Switch } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  signOut,
  requestAccountDeletion,
  cancelAccountDeletion,
  getAccountDeletionStatus,
  type AccountDeletionStatus,
} from '@/features/auth/api';
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
  const [deletionStatus, setDeletionStatus] = useState<AccountDeletionStatus | null>(null);

  async function refreshDeletionStatus() {
    const s = await getAccountDeletionStatus();
    setDeletionStatus(s);
  }

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
      const s = await getAccountDeletionStatus();
      if (mounted) setDeletionStatus(s);
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

  const handleExportData = () => {
    Alert.alert(
      t('settings.privacy.exportTitle', 'Verilerini İndir'),
      t('settings.privacy.exportBody', 'Tüm verilerin JSON formatında 24 saat içinde email ile gönderilecek.'),
      [
        { text: t('common.cancel', 'İptal'), style: 'cancel' },
        { text: t('settings.privacy.requestExport', 'Talep gönder'), onPress: () => {} },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.privacy.deleteTitle', 'Hesabı Sil'),
      t(
        'settings.privacy.deleteBody',
        'Tüm verilerin 30 gün içinde kalıcı silinir. Bu süre içinde tekrar giriş yaparak vazgeçebilirsin.',
      ),
      [
        { text: t('common.cancel', 'İptal'), style: 'cancel' },
        {
          text: t('settings.privacy.confirmDelete', 'Sil'),
          style: 'destructive',
          onPress: async () => {
            const r = await requestAccountDeletion();
            if (r.error || !r.scheduledFor) {
              Alert.alert(
                t('common.error', 'Hata'),
                t(
                  'settings.privacy.deleteFailed',
                  'Silme talebi oluşturulamadı. Lütfen tekrar dene.',
                ),
              );
              return;
            }
            Alert.alert(
              t('settings.privacy.deleteScheduledTitle', 'Silme talebi alındı'),
              t(
                'settings.privacy.deleteScheduledBody',
                'Hesabın 30 gün sonra kalıcı silinecek. Çıkış yapılıyor.',
              ),
              [
                {
                  text: t('common.ok', 'Tamam'),
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
      t('settings.privacy.cancelDeleteTitle', 'Silmeyi durdur'),
      t(
        'settings.privacy.cancelDeleteBody',
        'Hesap silme talebini iptal etmek istediğine emin misin?',
      ),
      [
        { text: t('common.cancel', 'İptal'), style: 'cancel' },
        {
          text: t('settings.privacy.confirmCancelDelete', 'Vazgeç'),
          onPress: async () => {
            const r = await cancelAccountDeletion();
            if (!r.ok) {
              Alert.alert(
                t('common.error', 'Hata'),
                r.error ?? t('settings.privacy.cancelDeleteFailed', 'İşlem başarısız.'),
              );
              return;
            }
            await refreshDeletionStatus();
            Alert.alert(
              t('settings.privacy.cancelDeleteSuccessTitle', 'Talep iptal edildi'),
              t(
                'settings.privacy.cancelDeleteSuccessBody',
                'Hesabın silinmeyecek. İyi ki vazgeçtin.',
              ),
            );
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
          />
          <SettingsRow
            icon="🔄"
            label={t('settings.privacy.reset', 'İlerlemeyi sıfırla')}
            onPress={() =>
              Alert.alert(
                t('settings.privacy.resetTitle', 'İlerleme sıfırla'),
                t('settings.privacy.resetBody', 'Streak, XP, ders ilerlemen silinir. Hesabın kalır.'),
                [
                  { text: t('common.cancel', 'İptal'), style: 'cancel' },
                  { text: t('settings.privacy.confirmReset', 'Sıfırla'), style: 'destructive' },
                ],
              )
            }
            last
          />
        </View>

        <Eyebrow>{t('settings.privacy.danger', 'TEHLİKELİ ALAN')}</Eyebrow>
        {deletionStatus ? (
          <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
            <View
              style={{
                backgroundColor: '#FFF5F0',
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: '#E5564B',
                padding: 14,
              }}
            >
              <Text style={{ fontFamily: FONTS.body800, fontSize: 15, color: '#A82E25' }}>
                {t('settings.privacy.deletionPendingTitle', 'Silme talebi bekliyor')}
              </Text>
              <Body color="#A82E25" style={{ fontSize: 13, marginTop: 4, lineHeight: 19 }}>
                {t('settings.privacy.deletionPendingBody', {
                  defaultValue:
                    'Hesabın {{days}} gün sonra kalıcı silinecek. Vazgeçmek için aşağıdaki butona bas.',
                  days: deletionStatus.days_remaining,
                })}
              </Body>
              <TouchableOpacity
                onPress={handleCancelDeletion}
                style={{
                  marginTop: 12,
                  backgroundColor: '#A82E25',
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#FFFFFF' }}>
                  {t('settings.privacy.cancelDeletionButton', 'Silmekten Vazgeç')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
            <SettingsRow
              icon="🗑"
              label={t('settings.privacy.deleteAccount', 'Hesabı kalıcı sil')}
              danger
              onPress={handleDeleteAccount}
              last
            />
          </View>
        )}

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

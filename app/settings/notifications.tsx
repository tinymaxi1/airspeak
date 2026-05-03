/**
 * Settings → Notifications — global + 6 tip-bazlı toggle + quiet hours.
 */
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Switch, ActivityIndicator, Alert } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import {
  fetchUserSettings,
  updateUserSettings,
  type UserSettings,
} from '@/features/settings/api';
import { Eyebrow, Mono, Body, FONTS, BackButton } from '@/components/airspeak';

const TYPED: Array<{ key: keyof UserSettings; icon: string; tk: string; td: string }> = [
  { key: 'notif_streak', icon: '🔥', tk: 'Streak hatırlatıcı', td: 'Streak\'in tehlikedeyken' },
  { key: 'notif_league', icon: '🏆', tk: 'Lig & yarışmalar', td: 'Terfi, demotion, hafta sonu' },
  { key: 'notif_community', icon: '💬', tk: 'Komünite', td: 'Mention, yorum, beğeni' },
  { key: 'notif_offers', icon: '🎁', tk: 'Fırsatlar', td: 'Sınırlı süreli teklifler' },
  { key: 'notif_oral', icon: '🎙', tk: 'ICAO sözlü', td: 'Değerlendirme tamamlandı' },
  { key: 'notif_placement', icon: '🎯', tk: 'Seviye testi', td: 'Cooldown bitti, tekrar al' },
];

export default function NotificationsSettingsScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const [s, setS] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      const data = await fetchUserSettings(userId);
      setS(data);
      setLoading(false);
    })();
  }, [userId]);

  async function patch(p: Partial<UserSettings>) {
    if (!userId || !s) return;
    setS({ ...s, ...p } as UserSettings);
    const r = await updateUserSettings(userId, p);
    if (!r.ok) {
      Alert.alert(t('common.error', 'Hata'), r.error ?? '');
      const fresh = await fetchUserSettings(userId);
      setS(fresh);
    }
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
          <Text
            accessibilityRole="header"
            style={{ flex: 1, fontFamily: FONTS.body800, fontSize: 22, color: '#0E1116' }}
          >
            {t('settings.notifications.title', 'Bildirimler')}
          </Text>
        </View>
      </SafeAreaView>

      {loading || !s ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0F1E47" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* GLOBAL */}
          <Eyebrow>{t('settings.notifications.globalEyebrow', 'GENEL')}</Eyebrow>
          <Card>
            <Row
              icon="🔔"
              title={t('settings.notifications.global', 'Tüm bildirimler')}
              sub={t('settings.notifications.globalSub', 'Kapatırsan hiçbir push gelmez')}
              value={s.notifications_enabled}
              onChange={(v) => patch({ notifications_enabled: v })}
              last
            />
          </Card>

          {/* TYPED */}
          <Eyebrow style={{ marginTop: 22 }}>
            {t('settings.notifications.typesEyebrow', 'KATEGORİLER')}
          </Eyebrow>
          <Card>
            {TYPED.map((row, i) => (
              <Row
                key={row.key}
                icon={row.icon}
                title={t(`settings.notifications.${row.key}`, row.tk)}
                sub={t(`settings.notifications.${row.key}Sub`, row.td)}
                value={(s[row.key] as boolean) && s.notifications_enabled}
                disabled={!s.notifications_enabled}
                onChange={(v) => patch({ [row.key]: v } as Partial<UserSettings>)}
                last={i === TYPED.length - 1}
              />
            ))}
          </Card>

          {/* QUIET HOURS */}
          <Eyebrow style={{ marginTop: 22 }}>
            {t('settings.notifications.quietEyebrow', 'SESSİZ SAATLER')}
          </Eyebrow>
          <Body color="#5A6478" style={{ fontSize: 13, marginTop: 4, marginBottom: 8 }}>
            {t(
              'settings.notifications.quietBody',
              'Belirlenen aralıkta push gönderilmez. Açmak için iki saat seç.',
            )}
          </Body>
          <Card>
            <HourRow
              label={t('settings.notifications.quietStart', 'Başlangıç')}
              value={s.quiet_hours_start}
              onChange={(v) => patch({ quiet_hours_start: v })}
            />
            <HourRow
              label={t('settings.notifications.quietEnd', 'Bitiş')}
              value={s.quiet_hours_end}
              onChange={(v) => patch({ quiet_hours_end: v })}
              last
            />
          </Card>
          <Mono
            style={{ fontSize: 11, color: '#8A93A6', marginTop: 8, paddingHorizontal: 4 }}
          >
            {s.quiet_hours_start !== null && s.quiet_hours_end !== null
              ? t('settings.notifications.quietActive', '{{a}}:00 — {{b}}:00 arası sessiz', {
                  a: s.quiet_hours_start,
                  b: s.quiet_hours_end,
                })
              : t('settings.notifications.quietInactive', 'Aktif değil')}
          </Mono>
        </ScrollView>
      )}
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        paddingHorizontal: 14,
      }}
    >
      {children}
    </View>
  );
}

function Row({
  icon,
  title,
  sub,
  value,
  onChange,
  disabled,
  last,
}: {
  icon: string;
  title: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: '#EDEFF3',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: '#EDEFF3',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>{title}</Text>
        {sub && <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }}>{sub}</Body>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: '#DCE0E8', true: '#2DBE6C' }}
      />
    </View>
  );
}

function HourRow({
  label,
  value,
  onChange,
  last,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  last?: boolean;
}) {
  const display = value === null ? '--' : `${String(value).padStart(2, '0')}:00`;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: '#EDEFF3',
      }}
    >
      <Text style={{ flex: 1, fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Stepper
          onPress={() => {
            const next = value === null ? 22 : value === 0 ? null : value - 1;
            onChange(next);
          }}
          label="−"
        />
        <Mono style={{ fontSize: 14, minWidth: 50, textAlign: 'center', color: '#0E1116' }}>
          {display}
        </Mono>
        <Stepper
          onPress={() => {
            const next = value === null ? 22 : value === 23 ? null : value + 1;
            onChange(next);
          }}
          label="+"
        />
      </View>
    </View>
  );
}

function Stepper({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Text
      onPress={onPress}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        textAlign: 'center',
        lineHeight: 30,
        fontSize: 18,
        color: '#0F1E47',
        backgroundColor: '#FFFFFF',
      }}
    >
      {label}
    </Text>
  );
}

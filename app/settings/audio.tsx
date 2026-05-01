/**
 * Settings → Audio — TTS hızı + otomatik oynatma + ses efektleri.
 */
import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
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

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5];

export default function AudioSettingsScreen() {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const [s, setS] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      setS(await fetchUserSettings(userId));
      setLoading(false);
    })();
  }, [userId]);

  async function patch(p: Partial<UserSettings>) {
    if (!userId || !s) return;
    setS({ ...s, ...p } as UserSettings);
    const r = await updateUserSettings(userId, p);
    if (!r.ok) {
      Alert.alert(t('common.error', 'Hata'), r.error ?? '');
      setS(await fetchUserSettings(userId));
    }
  }

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
            {t('settings.audio.title', 'Ses & Konuşma')}
          </Text>
        </View>
      </SafeAreaView>

      {loading || !s ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0F1E47" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Eyebrow>{t('settings.audio.ttsEyebrow', 'KONUŞMA (TTS)')}</Eyebrow>
          <Body color="#5A6478" style={{ fontSize: 13, marginTop: 4, marginBottom: 12 }}>
            {t(
              'settings.audio.ttsBody',
              'Ders kelime/cümlelerinin sesli okunma hızını ayarla.',
            )}
          </Body>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {SPEED_OPTIONS.map((sp) => {
              const sel = Math.abs(s.tts_speed - sp) < 0.01;
              return (
                <TouchableOpacity
                  key={sp}
                  onPress={() => patch({ tts_speed: sp })}
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    backgroundColor: sel ? '#0F1E47' : '#FFFFFF',
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: sel ? '#0F1E47' : '#DCE0E8',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.body700,
                      fontSize: 15,
                      color: sel ? '#FFD56B' : '#0E1116',
                    }}
                  >
                    {sp}×
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Eyebrow style={{ marginTop: 28 }}>
            {t('settings.audio.behaviorEyebrow', 'DAVRANIŞ')}
          </Eyebrow>
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
            <Row
              icon="▶"
              title={t('settings.audio.autoPlay', 'Otomatik oynat')}
              sub={t('settings.audio.autoPlaySub', 'Yeni ekran açılınca ses kendi çalsın')}
              value={s.tts_auto_play}
              onChange={(v) => patch({ tts_auto_play: v })}
            />
            <Row
              icon="🔊"
              title={t('settings.audio.sfx', 'Ses efektleri')}
              sub={t('settings.audio.sfxSub', 'Doğru/yanlış cevap, XP kazanma sesleri')}
              value={s.sound_enabled}
              onChange={(v) => patch({ sound_enabled: v })}
              last
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function Row({
  icon,
  title,
  sub,
  value,
  onChange,
  last,
}: {
  icon: string;
  title: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
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
      <Switch value={value} onValueChange={onChange} trackColor={{ false: '#DCE0E8', true: '#2DBE6C' }} />
    </View>
  );
}

/**
 * Settings → Microphone — izin durumu + test kaydı.
 */
import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Eyebrow, Mono, Body, FONTS, BackButton, Button3D } from '@/components/airspeak';

type PermStatus = 'granted' | 'denied' | 'undetermined' | 'unknown';

export default function MicrophoneSettingsScreen() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<PermStatus>('unknown');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [testState, setTestState] = useState<'idle' | 'recording' | 'playing' | 'busy'>('idle');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [testUri, setTestUri] = useState<string | null>(null);

  useEffect(() => {
    void refreshStatus();
    return () => {
      void sound?.unloadAsync().catch(() => {});
      void recording?.stopAndUnloadAsync().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshStatus() {
    const { status: s } = await Audio.getPermissionsAsync();
    setStatus(s as PermStatus);
  }

  async function requestPerm() {
    const { status: s } = await Audio.requestPermissionsAsync();
    setStatus(s as PermStatus);
    if (s !== 'granted') {
      Alert.alert(
        t('settings.microphone.deniedTitle', 'İzin reddedildi'),
        t(
          'settings.microphone.deniedBody',
          'Sözlü egzersizler için mikrofon izni gerekli. Ayarlar\'dan açabilirsin.',
        ),
        [
          { text: t('common.cancel', 'İptal'), style: 'cancel' },
          { text: t('settings.microphone.openSettings', 'Ayarları aç'), onPress: () => Linking.openSettings() },
        ],
      );
    }
  }

  async function startTest() {
    if (status !== 'granted') {
      await requestPerm();
      return;
    }
    setTestState('busy');
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const r = new Audio.Recording();
      await r.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await r.startAsync();
      setRecording(r);
      setTestState('recording');
    } catch (e: any) {
      setTestState('idle');
      Alert.alert(t('common.error', 'Hata'), e?.message ?? 'Test başlatılamadı');
    }
  }

  async function stopTest() {
    if (!recording) return;
    setTestState('busy');
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setTestUri(uri);
      setTestState('idle');
    } catch (e: any) {
      setTestState('idle');
      Alert.alert(t('common.error', 'Hata'), e?.message ?? '');
    }
  }

  async function playTest() {
    if (!testUri) return;
    setTestState('busy');
    try {
      const { sound: s } = await Audio.Sound.createAsync({ uri: testUri });
      setSound(s);
      setTestState('playing');
      s.setOnPlaybackStatusUpdate((st) => {
        if ('didJustFinish' in st && st.didJustFinish) {
          setTestState('idle');
          void s.unloadAsync().catch(() => {});
        }
      });
      await s.playAsync();
    } catch (e: any) {
      setTestState('idle');
      Alert.alert(t('common.error', 'Hata'), e?.message ?? '');
    }
  }

  const statusColor =
    status === 'granted' ? '#2DBE6C' : status === 'denied' ? '#E63946' : '#8A93A6';
  const statusLabel =
    status === 'granted'
      ? t('settings.microphone.granted', 'İzin verildi')
      : status === 'denied'
        ? t('settings.microphone.denied', 'Reddedildi')
        : t('settings.microphone.notRequested', 'Henüz istenmedi');

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
            {t('settings.microphone.title', 'Mikrofon')}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Body color="#5A6478" style={{ fontSize: 14, marginBottom: 20, lineHeight: 21 }}>
          {t(
            'settings.microphone.intro',
            'ICAO sözlü, telaffuz, readback ve konuşma egzersizleri için mikrofona ihtiyaç var. Kayıtlar cihazda işlenir, sadece sen başlatınca sunucuya gider.',
          )}
        </Body>

        <Eyebrow>{t('settings.microphone.statusEyebrow', 'İZİN DURUMU')}</Eyebrow>
        <View
          style={{
            marginTop: 8,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: statusColor,
            }}
          />
          <Text style={{ flex: 1, fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
            {statusLabel}
          </Text>
          {status !== 'granted' && (
            <TouchableOpacity
              onPress={status === 'denied' ? () => Linking.openSettings() : requestPerm}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                backgroundColor: '#0F1E47',
                borderRadius: 8,
              }}
            >
              <Mono style={{ fontSize: 11, color: '#FFD56B', letterSpacing: 1 }}>
                {status === 'denied'
                  ? t('settings.microphone.openSettings', 'Ayarlar')
                  : t('settings.microphone.request', 'İzin iste')}
              </Mono>
            </TouchableOpacity>
          )}
        </View>

        <Eyebrow style={{ marginTop: 28 }}>{t('settings.microphone.testEyebrow', 'TEST')}</Eyebrow>
        <Body color="#5A6478" style={{ fontSize: 13, marginTop: 4, marginBottom: 12 }}>
          {t(
            'settings.microphone.testBody',
            '3 saniye konuş, sonra dinle. Mikrofon doğru çalışıyor mu kontrol et.',
          )}
        </Body>

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            padding: 16,
            alignItems: 'center',
            gap: 12,
          }}
        >
          {testState === 'idle' && !testUri && (
            <Button3D
              variant="navy"
              onPress={startTest}
              fullWidth
              disabled={status === 'denied'}
            >
              🎙 {t('settings.microphone.start', 'Kayıt başlat')}
            </Button3D>
          )}
          {testState === 'recording' && (
            <Button3D variant="primary" onPress={stopTest} fullWidth>
              ⏹ {t('settings.microphone.stop', 'Durdur')}
            </Button3D>
          )}
          {testState === 'idle' && testUri && (
            <>
              <Button3D variant="navy" onPress={playTest} fullWidth>
                ▶ {t('settings.microphone.play', 'Dinle')}
              </Button3D>
              <Button3D
                variant="ghost"
                onPress={() => {
                  setTestUri(null);
                  void startTest();
                }}
                fullWidth
              >
                ↻ {t('settings.microphone.again', 'Tekrar kaydet')}
              </Button3D>
            </>
          )}
          {testState === 'playing' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ActivityIndicator color="#0F1E47" />
              <Mono style={{ fontSize: 12, color: '#5A6478' }}>
                {t('settings.microphone.playing', 'çalıyor…')}
              </Mono>
            </View>
          )}
          {testState === 'busy' && <ActivityIndicator color="#0F1E47" />}
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
          {Platform.OS === 'ios'
            ? t('settings.microphone.iosNote', 'iOS · Ayarlar > AirSpeak > Mikrofon')
            : t('settings.microphone.androidNote', 'Android · Ayarlar > Uygulamalar > AirSpeak > İzinler')}
        </Mono>
      </ScrollView>
    </View>
  );
}

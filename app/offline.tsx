/**
 * Offline Screen — Radio lost
 *
 * Tasarım birebir (screens-extras.jsx OfflineScreen):
 * - Navy-900 bg
 * - Red status banner: pulsing dot + "RADIO LOST · NO SIGNAL"
 * - Big radio tower SVG with broken signal arcs + red X
 * - "SİNYAL YOK · OFFLINE MODE" eyebrow + "Frequency clear.\nBağlantı koptu."
 * - Downloaded list card (3 lessons)
 * - Practice offline primary + Retry connection ghost
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Mono, FONTS, Button3D } from '@/components/airspeak';
import { useOfflineStore } from '@/stores/offlineStore';

// Default unit listesi — bundle'a dahil olduğu için "indirilebilir" sayılır
const ALL_UNITS = [
  { id: 'holding', l: 'Holding patterns', s: '12 lessons · ~18 MB' },
  { id: 'severe-weather', l: 'Severe weather phraseology', s: '8 lessons · ~11 MB' },
  { id: 'numbers', l: 'Numbers & altimeter', s: '6 lessons · ~6 MB' },
  { id: 'emergency', l: 'Emergency procedures', s: '10 lessons · ~14 MB' },
  { id: 'taxi', l: 'Taxi & ground ops', s: '9 lessons · ~10 MB' },
];

export default function OfflineScreen() {
  const { t } = useTranslation();
  const downloadedIds = useOfflineStore((s) => s.downloadedUnits);
  const toggleDownload = useOfflineStore((s) => s.toggleDownload);
  const downloaded = ALL_UNITS.filter((u) => downloadedIds.includes(u.id));
  // Hiç indirme yoksa hepsini default göster (kullanıcı önce indirmeli)
  const display = downloaded.length > 0 ? downloaded : ALL_UNITS;

  return (
    <View style={{ flex: 1, backgroundColor: '#06091A' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#E63946' }}>
        <View
          style={{
            backgroundColor: '#E63946',
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#FFFFFF',
            }}
          />
          <Mono style={{ fontSize: 12, color: '#FFFFFF', letterSpacing: 0.48 }}>
            {t('screens.offline.banner')}
          </Mono>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 28, paddingBottom: 32 }}
      >
        {/* Tower SVG */}
        <View style={{ height: 180, marginBottom: 24, alignItems: 'center' }}>
          <Svg viewBox="0 0 200 180" width="100%" height="100%" fill="none">
            <Path
              d="M100 140V60M85 60l30 60M115 60l-30 60M90 80h20M88 100h24M86 120h28"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Path
              d="M70 160h60"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Circle cx={100} cy={58} r={4} fill="#E63946" />
            <Path
              d="M60 50a40 40 0 0080 0"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1.5}
              strokeDasharray="4 6"
            />
            <Path
              d="M40 40a60 60 0 00120 0"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1.5}
              strokeDasharray="4 6"
            />
            <Path
              d="M84 28l32 32M116 28l-32 32"
              stroke="#E63946"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </Svg>
        </View>

        <Mono
          style={{
            fontSize: 10,
            color: '#FFD56B',
            letterSpacing: 1.8,
            textAlign: 'center',
          }}
        >
          {t('screens.offline.eyebrow')}
        </Mono>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 30,
            fontWeight: '700',
            lineHeight: 33,
            textAlign: 'center',
            marginTop: 10,
            color: '#FFFFFF',
          }}
        >
          {t('screens.offline.title1')}{'\n'}{t('screens.offline.title2')}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            marginTop: 12,
            lineHeight: 21,
            fontFamily: FONTS.body,
          }}
        >
          {t('screens.offline.body')}
        </Text>

        {/* Downloaded list */}
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
            borderRadius: 14,
            marginTop: 22,
            paddingHorizontal: 4,
            paddingVertical: 4,
          }}
        >
          {display.map((d, i) => {
            const isDownloaded = downloadedIds.includes(d.id);
            return (
              <TouchableOpacity
                key={d.id}
                activeOpacity={0.85}
                onPress={() => toggleDownload(d.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderBottomWidth: i < display.length - 1 ? 1 : 0,
                  borderBottomColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: isDownloaded ? 'rgba(45,190,108,0.15)' : 'rgba(255,255,255,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, color: isDownloaded ? '#4FD487' : 'rgba(255,255,255,0.6)' }}>
                    {isDownloaded ? '✓' : '↓'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.body700,
                      fontSize: 13,
                      color: '#FFFFFF',
                    }}
                  >
                    {d.l}
                  </Text>
                  <Mono
                    style={{
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.6)',
                      marginTop: 2,
                    }}
                  >
                    {d.s}
                  </Mono>
                </View>
                <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>
                  {isDownloaded ? '✓' : '›'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: 22 }}>
          <Button3D variant="primary" fullWidth onPress={() => router.replace('/(tabs)/learn')}>
            {t('screens.offline.practiceOffline')}
          </Button3D>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 8,
            height: 44,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,0.18)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
            {t('screens.offline.retry')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

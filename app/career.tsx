/**
 * Career Hub — havayolu mülakat + ICAO sınav + Squadron kohort tek ekran.
 *
 * Buraya Home'dan ve Profile'dan gelir.
 * Kullanıcının kariyer odaklı tüm aksiyonları:
 *   - 41 havayolu mülakat hazırlık
 *   - ICAO Level 4 mock sınav
 *   - Squadron / Cohort katıl
 *   - Mock geçmiş (gelecek)
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mono,
  Body,
  FONTS,
  TopoBackground,
  BackButton,
} from '@/components/airspeak';
import { ALL_AIRLINES } from '@/features/exams/airlines';
import { useSquadronStore } from '@/stores/squadronStore';

export default function CareerHubScreen() {
  const { t } = useTranslation();
  const cohort = useSquadronStore((s) => s.getCurrentCohort());

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
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
              {t('career.eyebrow', 'KARİYER MERKEZİ')}
            </Mono>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 22, color: '#0E1116', marginTop: 2 }}>
              {t('career.title', 'Hedefine Hazırlan')}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* ICAO 4 Mock — Hero card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/exam/icao4')}
          style={{
            backgroundColor: '#06091A',
            borderRadius: 14,
            padding: 0,
            overflow: 'hidden',
            position: 'relative',
            borderBottomWidth: 4,
            borderBottomColor: '#0A1430',
            marginBottom: 14,
          }}
        >
          <View style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
            <TopoBackground />
          </View>
          <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                backgroundColor: '#FFD56B',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 32, color: '#0F1E47' }}>🎯</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.8 }}>
                {t('career.icaoEyebrow', 'ICAO LEVEL 4 SINAV')}
              </Mono>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  marginTop: 4,
                  letterSpacing: -0.44,
                }}
              >
                {t('career.icaoTitle', 'Mock Sınav · 6 Descriptor')}
              </Text>
              <Body color="rgba(255,255,255,0.85)" style={{ fontSize: 13, marginTop: 4 }}>
                {t('career.icaoSub', '20 dk · gerçek değerlendirme · sertifika damgası')}
              </Body>
            </View>
          </View>
        </TouchableOpacity>

        {/* 41 Airlines */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/exam/airlines')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: '#FFE4E7',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 28 }}>🏢</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.8 }}>
              {t('career.airlinesEyebrow', '{{count}} HAVAYOLU', { count: ALL_AIRLINES.length })}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.body800,
                fontSize: 17,
                color: '#0E1116',
                marginTop: 4,
                lineHeight: 21,
              }}
            >
              {t('career.airlinesTitle', 'Havayolu mülakat hazırlık')}
            </Text>
            <Body color="#5A6478" style={{ fontSize: 12, marginTop: 4 }}>
              {t(
                'career.airlinesSub',
                'THY · Pegasus · Emirates · Qatar · Lufthansa · Singapore + 35 daha',
              )}
            </Body>
          </View>
          <Text style={{ fontSize: 22, color: '#8A93A6' }}>›</Text>
        </TouchableOpacity>

        {/* Squadron / Cohort */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/squadron-pairing')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: cohort ? '#2DBE6C' : '#DCE0E8',
            borderBottomWidth: 4,
            borderBottomColor: cohort ? '#22A659' : '#DCE0E8',
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: cohort ? '#DDF7E6' : '#EDEFF3',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 28 }}>👥</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: cohort ? '#22A659' : '#5A6478', letterSpacing: 1.8 }}>
              {cohort
                ? t('career.squadronJoined', 'KOHORTUNDASIN')
                : t('career.squadronEyebrow', 'B2B / SQUADRON')}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.body800,
                fontSize: 17,
                color: '#0E1116',
                marginTop: 4,
                lineHeight: 21,
              }}
            >
              {cohort?.name ?? t('career.squadronTitle', 'Squadron / Kohort')}
            </Text>
            <Body color="#5A6478" style={{ fontSize: 12, marginTop: 4 }}>
              {cohort
                ? `${cohort.shortCode} · ${cohort.programTr}`
                : t(
                    'career.squadronSub',
                    'Havayolu / okul kodu ile kohort\'a katıl, eğitmenle çalış',
                  )}
            </Body>
          </View>
          <Text style={{ fontSize: 22, color: '#8A93A6' }}>›</Text>
        </TouchableOpacity>

        {/* AI Co-pilot */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/conversation')}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            marginBottom: 14,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: '#F0EBFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 28 }}>🤖</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.8 }}>
              {t('career.aiEyebrow', 'AI CO-PILOT')}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.body800,
                fontSize: 17,
                color: '#0E1116',
                marginTop: 4,
              }}
            >
              {t('career.aiTitle', 'ATC Roleplay Senaryoları')}
            </Text>
            <Body color="#5A6478" style={{ fontSize: 12, marginTop: 4 }}>
              {t('career.aiSub', '5 senaryo · Holding · Taxi · Go-around · MAYDAY')}
            </Body>
          </View>
          <Text style={{ fontSize: 22, color: '#8A93A6' }}>›</Text>
        </TouchableOpacity>

        <Mono
          style={{
            fontSize: 11,
            color: '#8A93A6',
            textAlign: 'center',
            marginTop: 16,
            lineHeight: 16,
          }}
        >
          {t('career.disclaimer', 'AirSpeak resmi sertifika DEĞİL — pratik aracı.')}
        </Mono>
      </ScrollView>
    </View>
  );
}

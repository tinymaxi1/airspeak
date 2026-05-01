/**
 * Yasal sayfa ortak layout (Privacy / Terms / KVKK).
 * Sprint 8.A
 */
import { ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Mono, Body, FONTS, BackButton } from '@/components/airspeak';
import { usePalette } from '@/lib/usePalette';

interface Props {
  title: string;
  lastUpdated: string;
  intro?: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, lastUpdated, intro, children }: Props) {
  const { t } = useTranslation();
  const c = usePalette();

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
            {title}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Mono style={{ fontSize: 11, color: '#8A93A6', letterSpacing: 1.4, marginBottom: 12 }}>
          {t('legal.lastUpdated', 'SON GÜNCELLEME')}: {lastUpdated}
        </Mono>
        {intro && (
          <Body color="#5A6478" style={{ fontSize: 14, lineHeight: 22, marginBottom: 18 }}>
            {intro}
          </Body>
        )}
        {children}
      </ScrollView>
    </View>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text
        style={{
          fontFamily: FONTS.body800,
          fontSize: 16,
          color: '#0E1116',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <Body color="#3A4254" style={{ fontSize: 14, lineHeight: 22 }}>
      {children}
    </Body>
  );
}

export function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingLeft: 6 }}>
      <Text style={{ color: '#5A6478', fontSize: 14, lineHeight: 22 }}>•</Text>
      <Body color="#3A4254" style={{ flex: 1, fontSize: 14, lineHeight: 22 }}>
        {children}
      </Body>
    </View>
  );
}

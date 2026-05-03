/**
 * ICAO disclaimer banner — Sprint 8.C
 * icao4 ekranlarında "AirSpeak resmi sınav DEĞİL" uyarısı.
 */
import { View, Text } from 'react-native';
import { Mono, Body, FONTS } from '@/components/airspeak';

interface Props {
  compact?: boolean;
}

export function IcaoDisclaimer({ compact }: Props) {
  if (compact) {
    return (
      <View
        style={{
          backgroundColor: '#FFF6E0',
          borderWidth: 1,
          borderColor: '#F2C14E',
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 6,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 14 }}>⚠</Text>
        <Mono style={{ fontSize: 10, color: '#704800', letterSpacing: 0.6, flex: 1 }}>
          PRATİK ARACI · Resmi ICAO sınavı değildir
        </Mono>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: '#FFF6E0',
        borderWidth: 1.5,
        borderColor: '#F2C14E',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 22, lineHeight: 24 }}>⚠</Text>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: FONTS.body700,
            fontSize: 13,
            color: '#704800',
            marginBottom: 4,
          }}
        >
          AirSpeak pratik aracıdır
        </Text>
        <Body color="#5A4500" style={{ fontSize: 12, lineHeight: 17 }}>
          Bu uygulama resmi ICAO Level 4 sertifikası veya sınav değildir. Resmi sınav SHGM (Sivil Havacılık
          Genel Müdürlüğü) yetkili merkezlerinde yapılır.
        </Body>
      </View>
    </View>
  );
}

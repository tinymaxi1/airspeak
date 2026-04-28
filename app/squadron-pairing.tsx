/**
 * B2B Squadron Pairing Screen
 *
 * Tasarım birebir (screens-extras.jsx B2BPairingScreen):
 * - "STEP 03/06 · OPTIONAL" eyebrow + Skip
 * - "FLEET ENROLLMENT" + "Bir okul ya da\nfilo seninle mi\nçalışıyor?"
 * - Boarding pass code entry: 8 boxes (4 filled "TK47" + dot + empty "OPS")
 * - "8 KARAKTER · BÜYÜK HARF" + "● Verified"
 * - Match preview card (TK navy box + Turkish Airlines Flight Academy + cohort/instructor/program/ends stubs)
 * - Sky info banner: privacy notice
 * - Join cohort + I'm flying solo
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Eyebrow,
  Mono,
  FONTS,
  Button3D,
} from '@/components/airspeak';

const CODE = ['T', 'K', '4', '7', '·', 'O', 'P', 'S'];

export default function SquadronPairingScreen() {
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
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: '#0E1116' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
              STEP 03/06 · OPTIONAL
            </Mono>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#8A93A6' }}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.8 }}>
          FLEET ENROLLMENT
        </Mono>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 30,
            fontWeight: '700',
            lineHeight: 31,
            marginTop: 6,
            color: '#0E1116',
          }}
        >
          Bir okul ya da{'\n'}filo seninle mi{'\n'}çalışıyor?
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#5A6478',
            marginTop: 10,
            lineHeight: 21,
            fontFamily: FONTS.body,
          }}
        >
          Eğer havayolun, okulun veya eğitmenin AirSpeak Squadron kullanıyorsa, kodu girerek
          müfredatlarına ve takım liderlik tablosuna katıl.
        </Text>

        {/* Code entry */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
            padding: 18,
            marginTop: 20,
          }}
        >
          <Eyebrow>SQUADRON CODE</Eyebrow>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            {CODE.map((c, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 56,
                  borderRadius: 10,
                  borderWidth: c === '·' ? 0 : 2,
                  borderColor: '#B8BFCC',
                  backgroundColor: c === '·' ? 'transparent' : i < 4 ? '#EDEFF3' : '#FAFAF7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.mono700,
                    fontSize: 22,
                    color: c === '·' ? '#8A93A6' : i < 4 ? '#0E1116' : '#8A93A6',
                  }}
                >
                  {c === '·' ? '·' : i < 4 ? c : ''}
                </Text>
              </View>
            ))}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 12,
            }}
          >
            <Mono style={{ fontSize: 11, color: '#8A93A6' }}>8 KARAKTER · BÜYÜK HARF</Mono>
            <Text style={{ fontFamily: FONTS.body700, fontSize: 11, color: '#2DBE6C' }}>
              ● Verified
            </Text>
          </View>
        </View>

        {/* Match preview */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 2,
            borderColor: '#0F1E47',
            borderBottomWidth: 4,
            padding: 18,
            marginTop: 14,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                backgroundColor: '#06091A',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#FFFFFF',
                }}
              >
                TK
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1.8 }}>
                TK·47·OPS
              </Mono>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 17,
                  fontWeight: '700',
                  color: '#0E1116',
                  marginTop: 2,
                  lineHeight: 21,
                }}
              >
                Turkish Airlines Flight Academy
              </Text>
              <Text style={{ fontSize: 12, color: '#5A6478', marginTop: 2, fontFamily: FONTS.body }}>
                Cohort 47 · ICAO L4 program · 84 cadets
              </Text>
            </View>
          </View>

          <View
            style={{
              borderTopWidth: 1,
              borderStyle: 'dashed',
              borderColor: '#DCE0E8',
              marginVertical: 14,
            }}
          />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Eyebrow>INSTRUCTOR</Eyebrow>
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 13,
                  color: '#0E1116',
                  marginTop: 4,
                }}
              >
                Capt. A. Yılmaz
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow>PROGRAM</Eyebrow>
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 13,
                  color: '#0E1116',
                  marginTop: 4,
                }}
              >
                L3 → L4 · 14w
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow>ENDS</Eyebrow>
              <Text
                style={{
                  fontFamily: FONTS.mono700,
                  fontSize: 13,
                  color: '#0E1116',
                  marginTop: 4,
                }}
              >
                2026-08-22
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy banner */}
        <View
          style={{
            backgroundColor: '#E0F0FF',
            borderRadius: 12,
            padding: 12,
            marginTop: 14,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <Text style={{ fontSize: 16, color: '#2EA8FF' }}>ℹ</Text>
          <Text
            style={{
              flex: 1,
              fontSize: 12,
              color: '#0F1E47',
              lineHeight: 17,
              fontFamily: FONTS.body,
            }}
          >
            Eğitmenin haftalık ilerlemeni, mock skorlarını ve zayıf descriptor'larını görür.
            Pronunciation kayıtların paylaşılmaz.
          </Text>
        </View>

        <View style={{ marginTop: 18 }}>
          <Button3D variant="primary" fullWidth onPress={() => router.back()}>
            Join cohort
          </Button3D>
        </View>
        <View style={{ marginTop: 8 }}>
          <Button3D variant="ghost" fullWidth onPress={() => router.back()}>
            I'm flying solo
          </Button3D>
        </View>
      </ScrollView>
    </View>
  );
}

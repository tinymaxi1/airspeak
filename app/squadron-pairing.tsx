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
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Eyebrow,
  Mono,
  FONTS,
  Body,
  Button3D,
} from '@/components/airspeak';
import { useSquadronStore } from '@/stores/squadronStore';
import { findCohortByCode, normalizeCode, COHORTS } from '@/features/squadron/cohorts';

export default function SquadronPairingScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const joinCohort = useSquadronStore((s) => s.joinCohort);
  const [input, setInput] = useState('');
  // Faz 3.3 — Default solo prominent. Kod input gizli, "Kodum var" link tıklanınca expand olur.
  const [showCodeInput, setShowCodeInput] = useState(false);
  const normalized = normalizeCode(input);
  const cohort = findCohortByCode(normalized);
  const isValid = cohort !== undefined;

  const handleJoin = () => {
    if (!isValid || !cohort) {
      Alert.alert(
        t('screens.squadron.invalidTitle', 'Kod doğrulanamadı'),
        t('screens.squadron.invalidBody', 'Bu kod şu an aktif bir squadron ile eşleşmiyor.'),
      );
      return;
    }
    const success = joinCohort(normalized);
    if (success) {
      Alert.alert(
        t('screens.squadron.joinedTitle', '🎉 Katıldın!'),
        t('screens.squadron.joinedBody', '{{name}} squadron\'una hoş geldin.', { name: cohort.name }),
        [{ text: 'OK', onPress: () => router.back() }],
      );
    }
  };

  // Display: girilen kodu 8 kutuya yay, eksik kalanı boş göster
  const displayChars: string[] = [];
  for (let i = 0; i < 8; i++) {
    if (i === 4) {
      displayChars.push('·');
    } else {
      const realIdx = i < 4 ? i : i - 1;
      displayChars.push(normalized[realIdx] ?? '');
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
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: '#0E1116' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
              {t('screens.squadron.step')}
            </Mono>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#8A93A6' }}>
              {t('screens.squadron.skip')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.8 }}>
          {t('screens.squadron.eyebrow')}
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
          {t('screens.squadron.hero1')}{'\n'}{t('screens.squadron.hero2')}{'\n'}{t('screens.squadron.hero3')}
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
          {t('screens.squadron.subtitle')}
        </Text>

        {/* Code entry — sadece "kodum var" tıklanınca açılır (Faz 3.3) */}
        {showCodeInput && (
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
          <Eyebrow>{t('screens.squadron.code')}</Eyebrow>
          {/* Hidden TextInput — odaklanan input gerçek karakterleri toplar */}
          <TextInput
            value={input}
            onChangeText={setInput}
            autoCapitalize="characters"
            placeholder="TK47OPS"
            placeholderTextColor="transparent"
            maxLength={9}
            style={{
              position: 'absolute',
              opacity: 0.01,
              height: 56,
              width: '100%',
              top: 50,
            }}
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            {displayChars.map((c, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 56,
                  borderRadius: 10,
                  borderWidth: c === '·' ? 0 : 2,
                  borderColor: c === '·' ? 'transparent' : isValid ? '#2DBE6C' : c ? '#0F1E47' : '#B8BFCC',
                  backgroundColor: c === '·' ? 'transparent' : c ? '#EDEFF3' : '#FAFAF7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.mono700,
                    fontSize: 22,
                    color: c === '·' ? '#8A93A6' : c ? '#0E1116' : '#8A93A6',
                  }}
                >
                  {c || ''}
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
            <Mono style={{ fontSize: 11, color: '#8A93A6' }}>{t('screens.squadron.codeHint')}</Mono>
            {isValid ? (
              <Text style={{ fontFamily: FONTS.body700, fontSize: 11, color: '#2DBE6C' }}>
                {t('screens.squadron.verified')}
              </Text>
            ) : normalized.length === 8 ? (
              <Text style={{ fontFamily: FONTS.body700, fontSize: 11, color: '#FB6D78' }}>
                ● {t('screens.squadron.invalid', 'GEÇERSİZ')}
              </Text>
            ) : (
              <Text style={{ fontFamily: FONTS.body700, fontSize: 11, color: '#8A93A6' }}>
                {normalized.length}/8
              </Text>
            )}
          </View>
        </View>
        )}

        {/* Match preview — sadece valid cohort + showCodeInput aktifken */}
        {showCodeInput && cohort && (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              borderWidth: 2,
              borderColor: '#2DBE6C',
              borderBottomWidth: 4,
              borderBottomColor: '#22A659',
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
                  {cohort.code.slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1.8 }}>
                  {cohort.shortCode}
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
                  {cohort.name}
                </Text>
                <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }}>
                  {t('screens.squadron.academyDescDynamic', 'Cohort {{n}} · {{program}} · {{cadets}} öğrenci', {
                    n: cohort.cohortNumber,
                    program: cohort.programTr,
                    cadets: cohort.cadetCount,
                  })}
                </Body>
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
              <Eyebrow>{t('screens.squadron.instructor')}</Eyebrow>
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 13,
                  color: '#0E1116',
                  marginTop: 4,
                }}
              >
                {cohort.instructorTr}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow>{t('screens.squadron.program')}</Eyebrow>
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 13,
                  color: '#0E1116',
                  marginTop: 4,
                }}
              >
                {cohort.programLength}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow>{t('screens.squadron.ends')}</Eyebrow>
              <Text
                style={{
                  fontFamily: FONTS.mono700,
                  fontSize: 13,
                  color: '#0E1116',
                  marginTop: 4,
                }}
              >
                {cohort.endsOn}
              </Text>
            </View>
          </View>
          </View>
        )}

        {/* Geçerli kod yoksa öneriler — sadece showCodeInput aktifken */}
        {showCodeInput && !cohort && normalized.length > 0 && (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              borderRadius: 12,
              padding: 14,
              marginTop: 14,
            }}
          >
            <Mono style={{ fontSize: 10, color: '#FB6D78', letterSpacing: 1.2 }}>
              {t('screens.squadron.notFound', 'KOD BULUNAMADI')}
            </Mono>
            <Body color="#5A6478" style={{ fontSize: 13, marginTop: 6, lineHeight: 19 }}>
              {t('screens.squadron.tryThese', 'Mevcut squadron kodları:')}
            </Body>
            <View style={{ marginTop: 8, gap: 4 }}>
              {COHORTS.map((c) => (
                <TouchableOpacity key={c.code} onPress={() => setInput(c.code)}>
                  <Text
                    style={{
                      fontFamily: FONTS.mono700,
                      fontSize: 13,
                      color: '#0F1E47',
                    }}
                  >
                    • {c.code} — {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Privacy banner — sadece kod giriş aktifken */}
        {showCodeInput && (
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
            {t('screens.squadron.privacy')}
          </Text>
        </View>
        )}

        {/* CTA bölümü — Faz 3.3: Solo varsayılan prominent. Kodum var link ile flip */}
        {!showCodeInput ? (
          <>
            <View style={{ marginTop: 28 }}>
              <Button3D variant="primary" fullWidth onPress={() => router.back()}>
                {t('screens.squadron.solo', 'Tek başıma uçuyorum')}
              </Button3D>
            </View>
            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setShowCodeInput(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.body700,
                    fontSize: 13,
                    color: '#2EA8FF',
                    textDecorationLine: 'underline',
                  }}
                >
                  {t('screens.squadron.haveCode', 'Bir kohort/havayolu kodum var')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={{ marginTop: 18 }}>
              <Button3D variant="primary" fullWidth disabled={!isValid} onPress={handleJoin}>
                {t('screens.squadron.join')}
              </Button3D>
            </View>
            <View style={{ marginTop: 8 }}>
              <Button3D
                variant="ghost"
                fullWidth
                onPress={() => {
                  setShowCodeInput(false);
                  setInput('');
                }}
              >
                {t('screens.squadron.solo')}
              </Button3D>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/**
 * ICAO L4 Result Screen — official-looking score sheet
 *
 * Tasarım birebir (screens-icao.jsx ICAOResultScreen):
 * - Stamp result card: navy header + L4 gold display 80px + "OPERATIONAL · ICAO Annex 1"
 *   + circular green PASSED stamp (rotated -8deg)
 * - Cut line + 3 stub lights (VALID UNTIL / ICAO ID / EXAMINER)
 * - 6-descriptor profile rows: code + name + 6-bar progress + score number
 *   weakest = red border + FOCUS tag
 * - Examiner Note paper card
 * - Sticky: Share secondary + "Aim for L5" red CTA
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Eyebrow,
  Mono,
  FONTS,
  Button3D,
  TopoBackground,
} from '@/components/airspeak';

const DESCRIPTORS = [
  { code: 'PRO', name: 'Pronunciation', score: 4 },
  { code: 'STR', name: 'Structure', score: 4 },
  { code: 'VOC', name: 'Vocabulary', score: 5 },
  { code: 'FLU', name: 'Fluency', score: 3 },
  { code: 'CMP', name: 'Comprehension', score: 4 },
  { code: 'INT', name: 'Interactions', score: 4 },
];

export default function ICAOResultScreen() {
  const overall = Math.min(...DESCRIPTORS.map((d) => d.score));

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
            <Text style={{ fontSize: 22, color: '#0E1116' }}>✕</Text>
          </TouchableOpacity>
          <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
            EXAM COMPLETE
          </Mono>
          <Text style={{ fontSize: 22 }}>✦</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
      >
        {/* Stamp result card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#0F1E47',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 16,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <View style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
              <TopoBackground />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <View>
                <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.8 }}>
                  OVERALL
                </Mono>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 80,
                    fontWeight: '700',
                    color: '#FFD56B',
                    lineHeight: 76,
                    letterSpacing: -3.2,
                  }}
                >
                  L{overall}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.85)',
                    marginTop: 4,
                    fontFamily: FONTS.body,
                  }}
                >
                  OPERATIONAL · ICAO Annex 1
                </Text>
              </View>

              {/* PASSED stamp */}
              <View
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 46,
                  borderWidth: 3,
                  borderColor: '#4FD487',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(45,190,108,0.08)',
                  transform: [{ rotate: '-8deg' }],
                }}
              >
                <Text style={{ fontSize: 24, color: '#4FD487' }}>✓</Text>
                <Mono style={{ fontSize: 9, color: '#4FD487', letterSpacing: 1, marginTop: 2 }}>
                  PASSED
                </Mono>
                <Mono style={{ fontSize: 8, color: '#4FD487', opacity: 0.8 }}>26·APR·26</Mono>
              </View>
            </View>
          </View>

          {/* Cut line */}
          <View
            style={{
              borderTopWidth: 1,
              borderStyle: 'dashed',
              borderColor: '#DCE0E8',
              marginHorizontal: 16,
            }}
          />

          {/* 3 stat lights */}
          <View style={{ padding: 16, flexDirection: 'row', gap: 8 }}>
            <StatLight label="VALID UNTIL" value="04·2029" />
            <StatLight label="ICAO ID" value="TR-PIL-7421" />
            <StatLight label="EXAMINER" value="AS-AI-V3" />
          </View>
        </View>

        {/* 6-descriptor profile */}
        <Eyebrow>SIX-DESCRIPTOR PROFILE</Eyebrow>
        <View style={{ marginTop: 8, gap: 8 }}>
          {DESCRIPTORS.map((d) => {
            const isWeakest = d.score === overall;
            return (
              <View
                key={d.code}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  borderWidth: isWeakest ? 2 : 1.5,
                  borderColor: isWeakest ? '#E63946' : '#DCE0E8',
                  padding: 12,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Mono
                    style={{
                      fontSize: 11,
                      color: '#8A93A6',
                      width: 40,
                      letterSpacing: 1.1,
                    }}
                  >
                    {d.code}
                  </Mono>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text
                      style={{
                        fontFamily: FONTS.body700,
                        fontSize: 14,
                        color: '#0E1116',
                      }}
                    >
                      {d.name}
                    </Text>
                    {isWeakest && (
                      <Mono
                        style={{
                          fontSize: 10,
                          color: '#E63946',
                          letterSpacing: 1,
                        }}
                      >
                        FOCUS
                      </Mono>
                    )}
                  </View>
                  {/* 6 bar level */}
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <View
                        key={n}
                        style={{
                          width: 14,
                          height: 22,
                          borderRadius: 3,
                          backgroundColor:
                            n <= d.score
                              ? d.score >= 4
                                ? '#2DBE6C'
                                : '#E63946'
                              : '#EDEFF3',
                        }}
                      />
                    ))}
                  </View>
                  <Text
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 22,
                      fontWeight: '700',
                      width: 24,
                      textAlign: 'right',
                      color: '#0E1116',
                    }}
                  >
                    {d.score}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Examiner note */}
        <View
          style={{
            marginTop: 18,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
            padding: 14,
          }}
        >
          <Eyebrow>EXAMINER NOTE</Eyebrow>
          <Text
            style={{
              fontSize: 14,
              color: '#0E1116',
              marginTop: 6,
              lineHeight: 21,
              fontFamily: FONTS.body,
            }}
          >
            Confident performer, especially in standard phraseology and emergencies. Fluency drops
            slightly under unexpected scenario load — recommend 2 weeks of{' '}
            <Text style={{ fontFamily: FONTS.body700 }}>improvisation drills</Text> before re-test
            for L5.
          </Text>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
        <View style={{ padding: 16, flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button3D variant="secondary" fullWidth onPress={() => {}}>
              Share
            </Button3D>
          </View>
          <View style={{ flex: 1.5 }}>
            <Button3D variant="primary" fullWidth onPress={() => router.replace('/(tabs)/home')}>
              Aim for L5 →
            </Button3D>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function StatLight({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Mono style={{ fontSize: 9, color: '#5A6478', letterSpacing: 1.62 }}>{label}</Mono>
      <Text
        style={{
          fontFamily: FONTS.mono700,
          fontSize: 13,
          color: '#0E1116',
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

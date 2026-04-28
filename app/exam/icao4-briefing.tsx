/**
 * ICAO L4 Briefing Screen — pre-flight check
 *
 * Tasarım birebir (screens-icao.jsx ICAOBriefingScreen):
 * - Navy-900 cinematic bg
 * - Topo header + "ICAO L4 ✦ MOCK EXAM" eyebrow + close
 * - "Pre-flight\nbriefing." (display 38px) + 20-min descriptor
 * - 6 dashed descriptor stamps (PRO/STR/VOC/FLU/CMP/INT) gold icons
 * - Sections list (01-06 red numbers + minutes)
 * - Gold Exam Conditions card
 * - Sticky CTA "Begin exam" + ESTIMATED 20:00
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mono,
  FONTS,
  Button3D,
  TopoBackground,
} from '@/components/airspeak';

const DESCRIPTORS = [
  { code: 'PRO', name: 'Pronunciation', icon: '🔊' },
  { code: 'STR', name: 'Structure', icon: '🧭' },
  { code: 'VOC', name: 'Vocabulary', icon: '📖' },
  { code: 'FLU', name: 'Fluency', icon: '⚡' },
  { code: 'CMP', name: 'Comprehension', icon: '🎧' },
  { code: 'INT', name: 'Interactions', icon: '💬' },
];

const SECTIONS = [
  { num: '01', name: 'Aviation topics — short answers', mins: 3 },
  { num: '02', name: 'Picture description', mins: 3 },
  { num: '03', name: 'Listening — comprehension', mins: 4 },
  { num: '04', name: 'ATC interaction', mins: 4 },
  { num: '05', name: 'Unexpected situations', mins: 3 },
  { num: '06', name: 'Free conversation', mins: 3 },
];

export default function ICAOBriefingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#06091A' }}>
      <View
        style={{ backgroundColor: '#0F1E47', position: 'relative', overflow: 'hidden' }}
      >
        <View style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
          <TopoBackground />
        </View>
        <SafeAreaView edges={['top']}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 22, color: '#FFFFFF' }}>✕</Text>
            </TouchableOpacity>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.7)' }}>
              ICAO L4 ✦ MOCK EXAM
            </Mono>
            <View style={{ width: 22 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.8 }}>
          BRIEFING SHEET
        </Mono>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 38,
            fontWeight: '700',
            color: '#FFFFFF',
            marginTop: 6,
            lineHeight: 37,
            letterSpacing: -0.95,
          }}
        >
          Pre-flight{'\n'}briefing.
        </Text>
        <Text
          style={{
            fontFamily: FONTS.body,
            fontSize: 14,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 20,
            marginTop: 12,
          }}
        >
          20 minutes · 6 sections · graded across the 6 ICAO descriptors. Headphones recommended.
        </Text>

        {/* 6 descriptor stamps */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
          {DESCRIPTORS.map((d) => (
            <View
              key={d.code}
              style={{
                width: '48%',
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: 'rgba(255,255,255,0.25)',
                borderRadius: 12,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: 'rgba(255,255,255,0.03)',
              }}
            >
              <Text style={{ fontSize: 18, color: '#FFD56B' }}>{d.icon}</Text>
              <View>
                <Mono style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.08 }}>
                  {d.code}
                </Mono>
                <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#FFFFFF' }}>
                  {d.name}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sections */}
        <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.8, marginTop: 24 }}>
          SECTIONS
        </Mono>
        <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}>
          {SECTIONS.map((s) => (
            <View
              key={s.num}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#FB6D78',
                  width: 36,
                  letterSpacing: -0.48,
                }}
              >
                {s.num}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontFamily: FONTS.body600,
                  fontSize: 14,
                  color: '#FFFFFF',
                }}
              >
                {s.name}
              </Text>
              <Mono style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                {s.mins} min
              </Mono>
            </View>
          ))}
        </View>

        {/* Exam conditions */}
        <View
          style={{
            backgroundColor: 'rgba(255,213,107,0.1)',
            borderWidth: 1,
            borderColor: 'rgba(255,213,107,0.4)',
            borderRadius: 14,
            padding: 14,
            marginTop: 18,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Text style={{ fontSize: 16, color: '#FFD56B' }}>🛡</Text>
            <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.8 }}>
              EXAM CONDITIONS
            </Mono>
          </View>
          {[
            'Quiet environment, no background voices.',
            'You can pause once for up to 60 seconds.',
            'Recording is reviewed by an examiner within 48h.',
          ].map((rule, i) => (
            <Text
              key={i}
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 13,
                lineHeight: 21,
                fontFamily: FONTS.body,
              }}
            >
              • {rule}
            </Text>
          ))}
        </View>
      </ScrollView>

      <SafeAreaView
        edges={['bottom']}
        style={{
          backgroundColor: '#0F1E47',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <View style={{ padding: 16 }}>
          <Button3D variant="primary" fullWidth onPress={() => router.push('/exam/icao4-live')}>
            Begin exam ✈
          </Button3D>
          <Mono
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: 1.1,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            ESTIMATED · 20:00
          </Mono>
        </View>
      </SafeAreaView>
    </View>
  );
}

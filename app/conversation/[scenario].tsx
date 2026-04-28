/**
 * AI Conversation Screen — ATC Roleplay live cockpit
 *
 * Tasarım birebir (screens-ai.jsx AIConversationScreen):
 * - Navy-900 cockpit bg
 * - Header: SCENARIO · HOLDING PATTERN + AI Co-pilot LIVE + REC 03:24 indicator
 * - 4 instrument gauges (ALT/HDG/SPD/FREQ)
 * - Chat: ATC bubble (radio frequency badge) / user bubble (red, right) / system divider tags
 * - Live caption with red dashed border + countdown
 * - Mic dock: headset btn + 64px red mic + waveform + lightning btn
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mono, FONTS } from '@/components/airspeak';

interface ChatItem {
  type: 'system' | 'atc' | 'user';
  name?: string;
  freq?: string;
  text: string;
  alert?: boolean;
  confidence?: number;
}

const CHAT: ChatItem[] = [
  { type: 'system', text: 'HOLD AT VECON · EXPECT FURTHER CLEARANCE 12:45Z' },
  {
    type: 'atc',
    name: 'ANKARA APPROACH',
    freq: '120.9',
    text: 'Turkish 1453, hold at VECON as published, expect further clearance one-two-four-five Zulu.',
  },
  {
    type: 'user',
    text: 'Hold at VECON as published, expect further clearance one-two-four-five Zulu, Turkish 1453.',
    confidence: 94,
  },
  { type: 'atc', name: 'ANKARA APPROACH', freq: '120.9', text: 'Read-back correct.' },
  { type: 'system', text: 'SIMULATED EVENT · WEATHER DEVIATION' },
  {
    type: 'atc',
    name: 'ANKARA APPROACH',
    freq: '120.9',
    alert: true,
    text: 'Turkish 1453, weather building south. Suggest holding direction reverse — confirm if able.',
  },
];

export default function ConversationScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#06091A' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0F1E47' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 20, color: '#FFFFFF' }}>✕</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.7)' }}>
                SCENARIO · HOLDING PATTERN
              </Mono>
              <Text
                style={{
                  fontFamily: FONTS.body800,
                  fontSize: 14,
                  color: '#FFFFFF',
                  marginTop: 2,
                }}
              >
                AI Co-pilot · LIVE
              </Text>
            </View>
            {/* REC indicator */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(45,190,108,0.18)',
                borderWidth: 1,
                borderColor: 'rgba(45,190,108,0.4)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#4FD487',
                }}
              />
              <Mono style={{ fontSize: 11, color: '#FFFFFF' }}>REC 03:24</Mono>
            </View>
          </View>

          {/* Instrument strip */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Gauge label="ALT" value="FL240" />
            <Gauge label="HDG" value="270°" />
            <Gauge label="SPD" value="280kt" />
            <Gauge label="FREQ" value="120.9" />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        {CHAT.map((item, i) => {
          if (item.type === 'system') {
            return (
              <Mono
                key={i}
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: 1.8,
                  textAlign: 'center',
                  marginVertical: 12,
                }}
              >
                ─── {item.text} ───
              </Mono>
            );
          }
          return <ChatBubble key={i} item={item} />;
        })}

        {/* Live caption — your turn */}
        <View
          style={{
            backgroundColor: 'rgba(230,57,70,0.12)',
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: '#FB6D78',
            borderRadius: 12,
            padding: 12,
            marginTop: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Text style={{ fontSize: 14, color: '#FB6D78' }}>🎙</Text>
            <Mono style={{ fontSize: 11, color: '#FB6D78', letterSpacing: 1.32 }}>
              YOUR TURN · 6S
            </Mono>
          </View>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
            "Affirm, Turkish 1453, reversing hold..."{' '}
            <Text style={{ color: '#FFFFFF' }}>|</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Mic dock */}
      <SafeAreaView
        edges={['bottom']}
        style={{
          backgroundColor: '#0F1E47',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <View
          style={{
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <DockButton icon="🎧" />
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#E63946',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottomWidth: 4,
              borderBottomColor: '#C8202E',
            }}
          >
            <Text style={{ fontSize: 28 }}>🎙</Text>
          </View>
          {/* Waveform */}
          <View style={{ flex: 1, flexDirection: 'row', gap: 3, alignItems: 'center' }}>
            {Array.from({ length: 20 }).map((_, i) => {
              const h = 4 + Math.abs(Math.sin(i * 0.7)) * 18;
              return (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: h,
                    backgroundColor: '#FB6D78',
                    borderRadius: 2,
                  }}
                />
              );
            })}
          </View>
          <DockButton icon="⚡" />
        </View>
      </SafeAreaView>
    </View>
  );
}

function Gauge({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.32)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 8,
        alignItems: 'center',
      }}
    >
      <Mono style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.08 }}>
        {label}
      </Mono>
      <Text
        style={{
          fontFamily: FONTS.mono700,
          fontSize: 13,
          color: '#FFD56B',
          marginTop: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function ChatBubble({ item }: { item: ChatItem }) {
  const isUser = item.type === 'user';
  return (
    <View
      style={{
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}
    >
      {!isUser && (
        <Mono
          style={{
            fontSize: 10,
            color: item.alert ? '#FFD56B' : 'rgba(255,255,255,0.5)',
            marginBottom: 4,
            letterSpacing: 1.2,
          }}
        >
          🗼 {item.name}
          {item.freq && ` · ${item.freq}`}
        </Mono>
      )}
      <View
        style={{
          maxWidth: '85%',
          backgroundColor: isUser
            ? '#E63946'
            : item.alert
              ? 'rgba(255,213,107,0.16)'
              : 'rgba(255,255,255,0.08)',
          borderWidth: item.alert ? 1 : isUser ? 0 : 1,
          borderColor: item.alert ? '#FFD56B' : 'rgba(255,255,255,0.12)',
          borderRadius: 18,
          borderTopRightRadius: isUser ? 4 : 18,
          borderTopLeftRadius: isUser ? 18 : 4,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 20, fontFamily: FONTS.body }}>
          {item.text}
        </Text>
        {item.confidence !== undefined && (
          <View
            style={{
              marginTop: 6,
              paddingTop: 6,
              borderTopWidth: 1,
              borderStyle: 'dashed',
              borderTopColor: 'rgba(255,255,255,0.3)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Mono style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: 1 }}>
              ✓ READ-BACK MATCH · {item.confidence}%
            </Mono>
          </View>
        )}
      </View>
    </View>
  );
}

function DockButton({ icon }: { icon: string }) {
  return (
    <TouchableOpacity
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 22, color: '#FFFFFF' }}>{icon}</Text>
    </TouchableOpacity>
  );
}

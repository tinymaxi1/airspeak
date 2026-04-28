/**
 * Notifications Screen — Ops freq feed
 *
 * Tasarım birebir (screens-extras.jsx NotificationsScreen):
 * - "OPS FREQ · 3 NEW" eyebrow + Notifications title + Mark read
 * - Tab strip: All(12)/Coach(3)/League/System with red underline
 * - Date eyebrows (TODAY · 04 MAR / YESTERDAY / EARLIER)
 * - Notif items: 40x40 colored icon + title + time + body + action pills
 *   unread = red dot left + light red bg
 */
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mono, FONTS } from '@/components/airspeak';

interface Notif {
  icon: string;
  color: string;
  title: string;
  body: string;
  time: string;
  unread?: boolean;
  actions?: { label: string; primary?: boolean }[];
}

const TODAY: Notif[] = [
  {
    icon: '🔥',
    color: '#E63946',
    title: 'Streak ateşte 🔥 — 12 gün',
    body: 'Bugünkü 20 dakikalık planını henüz başlatmadın. 3 saat 14 dk kaldı.',
    time: '2h',
    unread: true,
    actions: [{ label: 'Start flight', primary: true }, { label: 'Snooze 1h' }],
  },
  {
    icon: '🤖',
    color: '#7C5CFF',
    title: 'AI Co-pilot · yeni senaryo',
    body: 'Diversion to alternate · LFPG → LEMD. Geçen hafta kaçırdığın holding pattern bu kez senaryoda.',
    time: '5h',
    unread: true,
    actions: [{ label: 'Roleplay', primary: true }],
  },
  {
    icon: '🏆',
    color: '#F2C14E',
    title: 'Captain ligine yükseldin',
    body: 'Geçen hafta 1,820 XP — top 12. Bu hafta podium için 240 XP daha lazım.',
    time: '9h',
    unread: true,
  },
];

const YESTERDAY: Notif[] = [
  {
    icon: '🎧',
    color: '#2EA8FF',
    title: 'ICAO mock geri bildirimi',
    body: 'Pronunciation 3 → 4 yükseldi. Fluency hâlâ 3 — "expanded responses" egzersizi öneriyoruz.',
    time: '1d',
    actions: [{ label: 'See breakdown' }],
  },
  {
    icon: '❤',
    color: '#FB6D78',
    title: '5/5 hearts',
    body: 'Tüm canların yenilendi. Yeni dersler için hazırsın.',
    time: '1d',
  },
  {
    icon: '👥',
    color: '#0F1E47',
    title: 'Squadron · @altay seninle yarışıyor',
    body: 'Altay bu hafta 1,640 XP topladı. Sen 1,420 XP\'desin.',
    time: '1d',
  },
];

const EARLIER: Notif[] = [
  {
    icon: '✦',
    color: '#FF7847',
    title: 'Yeni unit: Severe Weather Ops',
    body: '6 yeni ders, 32 phraseology kartı. Pro Pilot için kilitli.',
    time: '3d',
  },
  {
    icon: '🛡',
    color: '#2DBE6C',
    title: 'Streak freeze kullanıldı',
    body: 'Pazar günü dersi kaçırdın ama freeze devreye girdi. Streak korundu.',
    time: '6d',
  },
];

const TABS = [
  { l: 'All', count: 12, active: true },
  { l: 'Coach', count: 3 },
  { l: 'League' },
  { l: 'System' },
];

export default function NotificationsScreen() {
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
              OPS FREQ · 3 NEW
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.body800,
                fontSize: 22,
                color: '#0E1116',
                marginTop: 2,
              }}
            >
              Notifications
            </Text>
          </View>
          <TouchableOpacity>
            <Text
              style={{
                fontFamily: FONTS.body700,
                fontSize: 12,
                color: '#5A6478',
              }}
            >
              Mark read
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab strip */}
        <View
          style={{
            flexDirection: 'row',
            gap: 24,
            paddingHorizontal: 16,
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#DCE0E8',
          }}
        >
          {TABS.map((t, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: 10,
                borderBottomWidth: 2,
                borderBottomColor: t.active ? '#E63946' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 13,
                  color: t.active ? '#0E1116' : '#8A93A6',
                }}
              >
                {t.l}
              </Text>
              {t.count !== undefined && (
                <View
                  style={{
                    backgroundColor: t.active ? '#E63946' : '#EDEFF3',
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    borderRadius: 999,
                  }}
                >
                  <Mono
                    style={{
                      fontSize: 10,
                      color: t.active ? '#FFFFFF' : '#8A93A6',
                    }}
                  >
                    {t.count}
                  </Mono>
                </View>
              )}
            </View>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }}>
        <Section title="TODAY · 04 MAR" notifs={TODAY} />
        <Section title="DÜN · 03 MAR" notifs={YESTERDAY} />
        <Section title="DAHA ÖNCE" notifs={EARLIER} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, notifs }: { title: string; notifs: Notif[] }) {
  return (
    <>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
        <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>{title}</Mono>
      </View>
      {notifs.map((n, i) => (
        <NotifItem key={i} n={n} />
      ))}
    </>
  );
}

function NotifItem({ n }: { n: Notif }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: n.unread ? 'rgba(230,57,70,0.04)' : 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '#EDEFF3',
        position: 'relative',
      }}
    >
      {n.unread && (
        <View
          style={{
            position: 'absolute',
            left: 6,
            top: '50%',
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#E63946',
          }}
        />
      )}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: n.color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 18, color: '#FFFFFF' }}>{n.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontFamily: FONTS.body700,
              fontSize: 14,
              color: '#0E1116',
              lineHeight: 18,
            }}
          >
            {n.title}
          </Text>
          <Mono style={{ fontSize: 10, color: '#8A93A6' }}>{n.time}</Mono>
        </View>
        <Text
          style={{
            fontSize: 13,
            color: '#5A6478',
            marginTop: 4,
            lineHeight: 18,
            fontFamily: FONTS.body,
          }}
        >
          {n.body}
        </Text>
        {n.actions && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            {n.actions.map((a, ai) => (
              <View
                key={ai}
                style={{
                  height: 30,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: a.primary ? 0 : 1.5,
                  borderColor: '#DCE0E8',
                  backgroundColor: a.primary ? '#0F1E47' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.body700,
                    fontSize: 12,
                    color: a.primary ? '#FFFFFF' : '#0E1116',
                  }}
                >
                  {a.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

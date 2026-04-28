/**
 * Settings Screen — Pilot logbook
 *
 * Tasarım birebir (screens-extras.jsx SettingsScreen):
 * - "ACCOUNT · CALLSIGN MTC-038" eyebrow + "Settings" title
 * - Pilot card (boarding pass): avatar + FIRST OFFICER · TK + name + ICAO L3 → L4 + PRO pill
 * - 4 settings groups: ACCOUNT, LEARNING, APP, (signout)
 * - Each row: 36x36 icon box + label + sub + chevron
 * - AIRSPEAK v2.4.1 · BUILD footer
 */
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { signOut } from '@/features/auth/api';
import {
  Eyebrow,
  Mono,
  FONTS,
  Avatar,
} from '@/components/airspeak';

interface RowDef {
  icon: string;
  label: string;
  sub?: string;
  right?: string;
  rightTone?: 'gold' | 'mono';
  danger?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const username = user?.email?.split('@')[0] ?? 'pilot';

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const groups: { title?: string; rows: RowDef[] }[] = [
    {
      title: 'ACCOUNT',
      rows: [
        { icon: '👤', label: 'Profile & callsign', sub: `${username} · @${username} · TK fleet` },
        { icon: '🎯', label: 'Target & deadline', sub: 'ICAO Level 4 by Aug 2026' },
        { icon: '✈', label: 'Role', sub: 'First Officer · Narrow-body' },
        {
          icon: '🪙',
          label: 'Pro Pilot subscription',
          sub: 'Renews Mar 14 · ₺249/mo',
          right: 'ACTIVE',
          rightTone: 'gold',
          onPress: () => router.push('/paywall'),
        },
      ],
    },
    {
      title: 'LEARNING',
      rows: [
        { icon: '⚡', label: 'Daily flight plan', sub: '20 min · weekdays + Sat' },
        { icon: '🔔', label: 'Reminders', sub: '08:30 morning · 21:00 night' },
        { icon: '🎧', label: 'Audio & accent', sub: 'ICAO neutral · 0.95× speed' },
        { icon: '🎙', label: 'Microphone', sub: 'Bose A30 · last calibrated 4d ago' },
      ],
    },
    {
      title: 'APP',
      rows: [
        {
          icon: '✦',
          label: 'Appearance',
          sub: 'Auto · matches cockpit night',
          right: 'AUTO',
          rightTone: 'mono',
        },
        {
          icon: '🌐',
          label: 'Language · Türkçe',
          sub: 'UI dili',
          onPress: () => router.push('/settings/language'),
        },
        { icon: '🔒', label: 'Privacy & data' },
        { icon: '🤖', label: 'Help & contact ops' },
      ],
    },
    {
      rows: [
        { icon: '✕', label: 'Sign out', danger: true, onPress: handleSignOut },
        {
          icon: '✕',
          label: 'Delete account',
          sub: 'Logbook deleted permanently',
          danger: true,
        },
      ],
    },
  ];

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
              ACCOUNT · CALLSIGN MTC-038
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.body800,
                fontSize: 22,
                color: '#0E1116',
                marginTop: 2,
              }}
            >
              Settings
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Pilot card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
            padding: 16,
            marginBottom: 22,
            flexDirection: 'row',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <Avatar initials={username.slice(0, 2).toUpperCase()} color="#0F1E47" size={52} />
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 9, color: '#5A6478', letterSpacing: 1.62 }}>
              FIRST OFFICER · TK
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 18,
                fontWeight: '700',
                color: '#0E1116',
                marginTop: 2,
                lineHeight: 20,
              }}
            >
              {username}
            </Text>
            <Mono style={{ fontSize: 11, color: '#8A93A6', marginTop: 4 }}>
              ICAO L3 · TARGET L4 · DUE 2026-08
            </Mono>
          </View>
          <View
            style={{
              backgroundColor: '#FFD56B',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Mono style={{ fontSize: 10, color: '#0A1430', letterSpacing: 0.9 }}>PRO</Mono>
          </View>
        </View>

        {groups.map((g, gi) => (
          <View key={gi} style={{ marginBottom: 22 }}>
            {g.title && (
              <View style={{ paddingLeft: 4, marginBottom: 8 }}>
                <Eyebrow>{g.title}</Eyebrow>
              </View>
            )}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: '#DCE0E8',
                paddingHorizontal: 14,
              }}
            >
              {g.rows.map((row, ri) => (
                <SettingsRow
                  key={ri}
                  row={row}
                  last={ri === g.rows.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

        <Mono
          style={{
            textAlign: 'center',
            paddingTop: 8,
            paddingBottom: 24,
            color: '#8A93A6',
            fontSize: 11,
          }}
        >
          AIRSPEAK v2.4.1 · BUILD 2026.04
        </Mono>
      </ScrollView>
    </View>
  );
}

function SettingsRow({ row, last }: { row: RowDef; last: boolean }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={row.onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: '#EDEFF3',
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: row.danger ? '#FFE4E7' : '#EDEFF3',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 18, color: row.danger ? '#E63946' : '#0F1E47' }}>
          {row.icon}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: FONTS.body700,
            fontSize: 15,
            color: row.danger ? '#E63946' : '#0E1116',
            lineHeight: 18,
          }}
        >
          {row.label}
        </Text>
        {row.sub && (
          <Text
            style={{
              fontSize: 12,
              color: '#8A93A6',
              marginTop: 2,
              fontFamily: FONTS.body,
            }}
          >
            {row.sub}
          </Text>
        )}
      </View>
      {row.right ? (
        row.rightTone === 'gold' ? (
          <View
            style={{
              backgroundColor: '#FFD56B',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Mono style={{ fontSize: 10, color: '#0A1430', letterSpacing: 0.9 }}>
              {row.right}
            </Mono>
          </View>
        ) : (
          <Mono style={{ fontSize: 11, color: '#8A93A6' }}>{row.right}</Mono>
        )
      ) : (
        <Text style={{ fontSize: 18, color: '#8A93A6' }}>›</Text>
      )}
    </TouchableOpacity>
  );
}

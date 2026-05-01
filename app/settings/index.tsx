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
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { signOut } from '@/features/auth/api';
import {
  Eyebrow,
  Mono,
  FONTS,
  Avatar,
} from '@/components/airspeak';
import { LimitedOfferBanner } from '@/components/offers/LimitedOfferBanner';

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
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const username = user?.email?.split('@')[0] ?? 'pilot';
  const themePref = useThemeStore((s) => s.theme);
  const themeLabel =
    themePref === 'system'
      ? t('screens.settings.auto')
      : themePref === 'dark'
        ? t('settings.appearance.dark', 'Karanlık')
        : t('settings.appearance.light', 'Aydınlık');

  const handleSignOut = () => {
    Alert.alert(t('screens.settings.signOut'), t('screens.profile.signOutConfirm'), [
      { text: t('screens.profile.cancel'), style: 'cancel' },
      {
        text: t('screens.settings.signOut'),
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
      title: t('screens.settings.groupAccount'),
      rows: [
        {
          icon: '👤',
          label: t('screens.settings.profile'),
          sub: t('screens.settings.profileDesc', { name: username, username }),
          onPress: () => router.push('/settings/profile-edit'),
        },
        {
          icon: '🎯',
          label: t('screens.settings.target'),
          sub: t('screens.settings.targetDesc'),
          onPress: () => router.push('/settings/profile-edit'),
        },
        {
          icon: '✈',
          label: t('screens.settings.role'),
          sub: t('screens.settings.roleDesc'),
          onPress: () => router.push('/(auth)/onboarding/role-select'),
        },
        {
          icon: '🪙',
          label: t('screens.settings.subscription'),
          sub: t('screens.settings.subscriptionDesc'),
          right: t('screens.settings.active'),
          rightTone: 'gold',
          onPress: () => router.push('/paywall'),
        },
        {
          icon: '👥',
          label: t('screens.settings.squadron', 'Squadron / Kohort'),
          sub: t('screens.settings.squadronDesc', 'Havayolu / okul kodu ile kohort\'a katıl'),
          onPress: () => router.push('/squadron-pairing'),
        },
      ],
    },
    {
      title: t('screens.settings.groupLearning'),
      rows: [
        { icon: '⚡', label: t('screens.settings.dailyPlan'), sub: t('screens.settings.dailyPlanDesc') },
        { icon: '🔔', label: t('screens.settings.reminders'), sub: t('screens.settings.remindersDesc') },
        { icon: '🎧', label: t('screens.settings.audio'), sub: t('screens.settings.audioDesc') },
        { icon: '🎙', label: t('screens.settings.microphone'), sub: t('screens.settings.microphoneDesc') },
      ],
    },
    {
      title: t('screens.settings.groupApp'),
      rows: [
        {
          icon: '✦',
          label: t('screens.settings.appearance'),
          sub: t('screens.settings.appearanceDesc'),
          right: themeLabel,
          rightTone: 'mono',
          onPress: () => router.push('/settings/appearance'),
        },
        {
          icon: '🌐',
          label: t('screens.settings.language'),
          sub: t('screens.settings.languageDesc'),
          onPress: () => router.push('/settings/language'),
        },
        {
          icon: '🔒',
          label: t('screens.settings.privacy'),
          onPress: () => router.push('/settings/privacy'),
        },
        {
          icon: '🤖',
          label: t('screens.settings.help'),
          onPress: () => router.push('/settings/help'),
        },
      ],
    },
    {
      rows: [
        { icon: '✕', label: t('screens.settings.signOut'), danger: true, onPress: handleSignOut },
        {
          icon: '✕',
          label: t('screens.settings.deleteAccount'),
          sub: t('screens.settings.deleteAccountDesc'),
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
              {t('screens.settings.eyebrow')}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.body800,
                fontSize: 22,
                color: '#0E1116',
                marginTop: 2,
              }}
            >
              {t('screens.settings.title')}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Limited offer banner — settings ekranı üstünde, kendi marginini yönetir */}
        <LimitedOfferBanner compact />

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
              {t('screens.settings.firstOfficer')}
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
              {t('screens.settings.icaoTarget')}
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
            <Mono style={{ fontSize: 10, color: '#0A1430', letterSpacing: 0.9 }}>{t('screens.settings.pro')}</Mono>
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
          {t('screens.settings.version')}
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

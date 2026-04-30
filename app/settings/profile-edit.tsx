/**
 * Profile Edit — multi-tab profil düzenleme.
 *
 * Sprint 3c-A: Temel + Gizlilik tabları aktif.
 * Sprint 3c-B: Kariyer / Aviation / Sosyal tabları doldurulacak (placeholder).
 */
import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/authStore';
import {
  useProfile,
  invalidateProfile,
  patchProfileCache,
} from '@/features/profile/useProfile';
import { upsertProfileFields } from '@/features/profile/api';
import { presentAvatarSheet } from '@/features/profile/AvatarUploader';
import { Avatar, FONTS, Mono, Body, Button3D } from '@/components/airspeak';
import { TabBar, type TabItem } from '@/components/profile/TabBar';
import { Camera, ChevronLeft } from 'lucide-react-native';

type TabKey = 'basic' | 'career' | 'aviation' | 'social' | 'privacy';

const TABS: TabItem<TabKey>[] = [
  { key: 'basic', label: 'Temel', emoji: '👤' },
  { key: 'career', label: 'Kariyer', emoji: '💼' },
  { key: 'aviation', label: 'Aviation', emoji: '✈️' },
  { key: 'social', label: 'Sosyal', emoji: '🌐' },
  { key: 'privacy', label: 'Gizlilik', emoji: '🔒' },
];

export default function ProfileEditScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { profile, loading } = useProfile(user?.id);
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  // Form state — profile yüklenince populate edilir
  const [fullName, setFullName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [bioShort, setBioShort] = useState('');
  const [bioLong, setBioLong] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? '');
    setCallsign(profile.callsign ?? '');
    setBioShort(profile.bio_short ?? '');
    setBioLong(profile.bio_long ?? '');
    setIsPublic(profile.is_profile_public);
  }, [profile?.id, profile?.updated_at]);

  async function save() {
    if (!user?.id) return;
    if (bioShort.length > 280) {
      Alert.alert('Hata', 'Kısa bio en fazla 280 karakter olmalı.');
      return;
    }
    if (bioLong.length > 1500) {
      Alert.alert('Hata', 'Uzun bio en fazla 1500 karakter olmalı.');
      return;
    }
    setSaving(true);
    const patch = {
      full_name: fullName.trim() || null,
      callsign: callsign.trim() || null,
      bio_short: bioShort.trim() || null,
      bio_long: bioLong.trim() || null,
      is_profile_public: isPublic,
    };
    const r = await upsertProfileFields(user.id, patch);
    setSaving(false);
    if (!r.ok) {
      Alert.alert('Hata', r.error ?? 'Bilinmeyen hata');
      return;
    }
    patchProfileCache(user.id, patch as any);
    invalidateProfile();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert(t('common.saved', 'Kaydedildi'), t('settings.profile.saved', 'Profil güncellendi.'));
  }

  function onAvatarTap() {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    presentAvatarSheet(user.id, !!profile?.avatar_url, () => {});
  }

  const initials = (fullName || profile?.username || user?.email || 'PI')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#EDEFF3',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={26} color="#0E1116" />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontFamily: FONTS.body800, fontSize: 18, color: '#0E1116' }}>
            {t('settings.profile.editTitle', 'Profil Düzenle')}
          </Text>
          {profile && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: '#DDF7E6',
              }}
            >
              <Mono style={{ fontSize: 10, color: '#118040', letterSpacing: 0.8 }}>
                %{profile.profile_completion_percent}
              </Mono>
            </View>
          )}
        </View>
      </SafeAreaView>

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      >
        {loading && !profile ? (
          <Body color="#8A93A6" style={{ textAlign: 'center', marginTop: 24 }}>
            {t('common.loading', 'Yükleniyor…')}
          </Body>
        ) : null}

        {activeTab === 'basic' && (
          <BasicTab
            fullName={fullName}
            setFullName={setFullName}
            callsign={callsign}
            setCallsign={setCallsign}
            bioShort={bioShort}
            setBioShort={setBioShort}
            bioLong={bioLong}
            setBioLong={setBioLong}
            avatarUrl={profile?.avatar_url ?? null}
            initials={initials}
            email={user?.email ?? ''}
            onAvatarTap={onAvatarTap}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacyTab isPublic={isPublic} setIsPublic={setIsPublic} />
        )}

        {(activeTab === 'career' || activeTab === 'aviation' || activeTab === 'social') && (
          <ComingSoon tab={activeTab} />
        )}

        <View style={{ marginTop: 24 }}>
          <Button3D variant="primary" fullWidth onPress={save} disabled={saving}>
            {saving ? t('common.saving', 'Kaydediliyor…') : t('common.save', 'Kaydet')}
          </Button3D>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Tab 1: Temel ──────────────────────────────────────────────────────────
function BasicTab(props: {
  fullName: string;
  setFullName: (v: string) => void;
  callsign: string;
  setCallsign: (v: string) => void;
  bioShort: string;
  setBioShort: (v: string) => void;
  bioLong: string;
  setBioLong: (v: string) => void;
  avatarUrl: string | null;
  initials: string;
  email: string;
  onAvatarTap: () => void;
}) {
  return (
    <View style={{ gap: 18 }}>
      {/* Avatar */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#EDEFF3',
          padding: 20,
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={props.onAvatarTap} activeOpacity={0.85}>
          <View>
            <Avatar
              initials={props.initials}
              imageUrl={props.avatarUrl}
              color="#0F1E47"
              size={88}
              ringColor="#E63946"
            />
            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: '#F2C14E',
                borderWidth: 2,
                borderColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={13} color="#0A1430" strokeWidth={2.5} />
            </View>
          </View>
        </TouchableOpacity>
        <Body color="#8A93A6" style={{ fontSize: 12, marginTop: 10 }}>
          {props.email}
        </Body>
      </View>

      <FieldText
        label="Tam İsim"
        value={props.fullName}
        onChangeText={props.setFullName}
        placeholder="Captain Ekrem Yılmaz"
        autoCapitalize="words"
      />

      <FieldText
        label="Çağrı Kodu"
        value={props.callsign}
        onChangeText={props.setCallsign}
        placeholder="@captainalper"
        autoCapitalize="none"
        autoCorrect={false}
        mono
      />

      <FieldText
        label="Kısa Bio"
        hint={`${props.bioShort.length} / 280`}
        value={props.bioShort}
        onChangeText={props.setBioShort}
        placeholder="Bir cümleyle kim olduğunu anlat."
        multiline
        rows={2}
        maxLength={280}
      />

      <FieldText
        label="Uzun Bio"
        hint={`${props.bioLong.length} / 1500`}
        value={props.bioLong}
        onChangeText={props.setBioLong}
        placeholder="Detaylı tanıtım — kariyer hikâyen, ilgi alanların, hedeflerin."
        multiline
        rows={6}
        maxLength={1500}
      />
    </View>
  );
}

// ─── Tab 5: Gizlilik ──────────────────────────────────────────────────────
function PrivacyTab({
  isPublic,
  setIsPublic,
}: {
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
}) {
  return (
    <View style={{ gap: 14 }}>
      <ToggleRow
        label="Profilim herkese açık"
        description="Açık: kariyer detayların, eğitim, sertifika ve sosyal medyan diğer kullanıcılar tarafından görülebilir. Kapalı: yalnızca sen."
        value={isPublic}
        onChange={setIsPublic}
      />

      <View
        style={{
          backgroundColor: '#FFFAEC',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#F2C14E',
          padding: 14,
        }}
      >
        <Mono style={{ fontSize: 10, color: '#8B6E2E', letterSpacing: 1.2 }}>
          BİLGİ
        </Mono>
        <Body color="#5A4A1F" style={{ fontSize: 13, marginTop: 4, lineHeight: 19 }}>
          Avatar, isim ve rozetler her durumda görünür. Alan-bazlı detaylı gizlilik
          ayarları Sprint 3c-B sonrası.
        </Body>
      </View>
    </View>
  );
}

// ─── Coming soon (kariyer/aviation/sosyal) ────────────────────────────────
function ComingSoon({ tab }: { tab: TabKey }) {
  const labels: Record<TabKey, string> = {
    basic: '',
    career: 'Kariyer detayı',
    aviation: 'Aviation alanları',
    social: 'Sosyal medya bağlantıları',
    privacy: '',
  };
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#EDEFF3',
        padding: 24,
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 36 }}>🚧</Text>
      <Mono style={{ fontSize: 11, color: '#8A93A6', letterSpacing: 1.4 }}>
        SPRINT 3C-B
      </Mono>
      <Body color="#5A6478" style={{ textAlign: 'center', maxWidth: 280 }}>
        {labels[tab]} bir sonraki sprint'te aktive olacak. Backend hazır, UI yolda.
      </Body>
    </View>
  );
}

// ─── Field helpers ─────────────────────────────────────────────────────────
function FieldText({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  multiline,
  rows,
  mono,
  ...rest
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  mono?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  maxLength?: number;
}) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4 }}>
          {label.toUpperCase()}
        </Mono>
        {hint && (
          <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8 }}>
            {hint}
          </Mono>
        )}
      </View>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: '#DCE0E8',
          paddingHorizontal: 14,
          paddingVertical: multiline ? 10 : 12,
          marginTop: 6,
          minHeight: multiline ? (rows ?? 2) * 22 + 20 : undefined,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'auto'}
          style={{
            fontFamily: mono ? FONTS.mono700 : FONTS.body,
            fontSize: mono ? 15 : 16,
            color: '#0E1116',
            minHeight: multiline ? (rows ?? 2) * 22 : undefined,
          }}
          {...rest}
        />
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onChange(!value)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#EDEFF3',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.body700, fontSize: 15, color: '#0E1116' }}>
          {label}
        </Text>
        <Body color="#5A6478" style={{ fontSize: 12, marginTop: 4, lineHeight: 18 }}>
          {description}
        </Body>
      </View>
      <View
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          backgroundColor: value ? '#2DBE6C' : '#DCE0E8',
          padding: 2,
          marginTop: 2,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#FFFFFF',
            transform: [{ translateX: value ? 18 : 0 }],
          }}
        />
      </View>
    </TouchableOpacity>
  );
}

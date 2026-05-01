/**
 * Profile Edit — multi-tab profil düzenleme.
 *
 * Sprint 3c-A: Temel + Gizlilik
 * Sprint 3c-B: Kariyer + Aviation + Sosyal — 4 detay listesi (CRUD)
 *
 * URL param: ?tab=basic|career|aviation|social|privacy ile direkt tab'a gir.
 */
import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/authStore';
import {
  useProfile,
  invalidateProfile,
  patchProfileCache,
} from '@/features/profile/useProfile';
import {
  upsertProfileFields,
  createDetailRow,
  updateDetailRow,
  deleteDetailRow,
  useUserExperiences,
  useUserEducation,
  useUserCertifications,
  useUserTypeRatings,
  type ExperienceRow,
  type EducationRow,
  type CertificationRow,
  type TypeRatingRow,
} from '@/features/profile/api';
import { presentAvatarSheet } from '@/features/profile/AvatarUploader';
import { Avatar, FONTS, Mono, Body, Button3D } from '@/components/airspeak';
import { TabBar, type TabItem } from '@/components/profile/TabBar';
import { CrudListEditor } from '@/components/profile/CrudListEditor';
import {
  FieldText,
  FieldNumber,
  FieldRadio,
  FieldSelect,
  FieldToggle,
} from '@/components/profile/FormFields';
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
  const c = usePalette();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ tab?: string }>();
  const user = useAuthStore((s) => s.user);
  const { profile, loading } = useProfile(user?.id);
  const initialTab = (params.tab as TabKey) ?? 'basic';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Tab 1 — Temel
  const [fullName, setFullName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [bioShort, setBioShort] = useState('');
  const [bioLong, setBioLong] = useState('');

  // Tab 2 — Kariyer (şu anki)
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [baseAirport, setBaseAirport] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  // Tab 3 — Aviation
  const [icaoLevel, setIcaoLevel] = useState<'4' | '5' | '6' | null>(null);
  const [experienceYears, setExperienceYears] = useState('');

  // Tab 4 — Sosyal
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [facebook, setFacebook] = useState('');
  const [website, setWebsite] = useState('');

  // Tab 5 — Gizlilik
  const [isPublic, setIsPublic] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? '');
    setCallsign(profile.callsign ?? '');
    setBioShort(profile.bio_short ?? '');
    setBioLong(profile.bio_long ?? '');
    setCompany(profile.company ?? '');
    setPosition(profile.position ?? '');
    setBaseAirport(profile.base_airport ?? '');
    setCity(profile.city ?? '');
    setCountry(profile.country ?? '');
    setIcaoLevel(profile.icao_english_level);
    setExperienceYears(
      profile.aviation_experience_years != null
        ? String(profile.aviation_experience_years)
        : '',
    );
    setLinkedinUrl(profile.linkedin_url ?? '');
    setInstagram(profile.instagram ?? '');
    setTwitter(profile.twitter ?? '');
    setYoutube(profile.youtube ?? '');
    setFacebook(profile.facebook ?? '');
    setWebsite(profile.website ?? '');
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
      company: company.trim() || null,
      position: position.trim() || null,
      base_airport: baseAirport.trim().toUpperCase() || null,
      city: city.trim() || null,
      country: country.trim() || null,
      icao_english_level: icaoLevel,
      aviation_experience_years: experienceYears ? Number(experienceYears) : null,
      linkedin_url: linkedinUrl.trim() || null,
      instagram: instagram.trim() || null,
      twitter: twitter.trim() || null,
      youtube: youtube.trim() || null,
      facebook: facebook.trim() || null,
      website: website.trim() || null,
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
    <View style={{ flex: 1, backgroundColor: c.bg }}>
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

        {activeTab === 'career' && user?.id && (
          <CareerTab
            userId={user.id}
            company={company}
            setCompany={setCompany}
            position={position}
            setPosition={setPosition}
            baseAirport={baseAirport}
            setBaseAirport={setBaseAirport}
            city={city}
            setCity={setCity}
            country={country}
            setCountry={setCountry}
            experienceYears={experienceYears}
            setExperienceYears={setExperienceYears}
          />
        )}

        {activeTab === 'aviation' && (
          <AviationTab
            icaoLevel={icaoLevel}
            setIcaoLevel={setIcaoLevel}
            experienceYears={experienceYears}
            setExperienceYears={setExperienceYears}
          />
        )}

        {activeTab === 'social' && (
          <SocialTab
            linkedinUrl={linkedinUrl}
            setLinkedinUrl={setLinkedinUrl}
            instagram={instagram}
            setInstagram={setInstagram}
            twitter={twitter}
            setTwitter={setTwitter}
            youtube={youtube}
            setYoutube={setYoutube}
            facebook={facebook}
            setFacebook={setFacebook}
            website={website}
            setWebsite={setWebsite}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacyTab isPublic={isPublic} setIsPublic={setIsPublic} />
        )}

        {activeTab !== 'career' && (
          <View style={{ marginTop: 24 }}>
            <Button3D variant="primary" fullWidth onPress={save} disabled={saving}>
              {saving ? t('common.saving', 'Kaydediliyor…') : t('common.save', 'Kaydet')}
            </Button3D>
          </View>
        )}

        {activeTab === 'career' && (
          <View style={{ marginTop: 16 }}>
            <Button3D variant="primary" fullWidth onPress={save} disabled={saving}>
              {saving
                ? t('common.saving', 'Kaydediliyor…')
                : t('settings.profile.saveCurrent', 'Şu anki bilgileri kaydet')}
            </Button3D>
          </View>
        )}
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

// ─── Tab 2: Kariyer ────────────────────────────────────────────────────────
function CareerTab(props: {
  userId: string;
  company: string;
  setCompany: (v: string) => void;
  position: string;
  setPosition: (v: string) => void;
  baseAirport: string;
  setBaseAirport: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  experienceYears: string;
  setExperienceYears: (v: string) => void;
}) {
  const { rows: experiences, loading: lE } = useUserExperiences(props.userId);
  const { rows: education, loading: lEdu } = useUserEducation(props.userId);
  const { rows: certs, loading: lCert } = useUserCertifications(props.userId);
  const { rows: ratings, loading: lTR } = useUserTypeRatings(props.userId);

  return (
    <View style={{ gap: 22 }}>
      {/* Şu anki */}
      <View style={{ gap: 14 }}>
        <Mono style={{ fontSize: 11, color: '#0F1E47', letterSpacing: 1.4 }}>
          ŞU ANKİ POZİSYON
        </Mono>
        <FieldText
          label="Şirket"
          value={props.company}
          onChangeText={props.setCompany}
          placeholder="Türk Hava Yolları"
        />
        <FieldText
          label="Pozisyon"
          value={props.position}
          onChangeText={props.setPosition}
          placeholder="First Officer"
        />
        <FieldText
          label="Ana Üs"
          hint="IATA kodu"
          value={props.baseAirport}
          onChangeText={(v) => props.setBaseAirport(v.toUpperCase())}
          placeholder="IST"
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <FieldText
          label="Şehir"
          value={props.city}
          onChangeText={props.setCity}
          placeholder="İstanbul"
        />
        <FieldText
          label="Ülke"
          value={props.country}
          onChangeText={props.setCountry}
          placeholder="Türkiye"
        />
        <FieldNumber
          label="Aviation Deneyim (yıl)"
          hint="Aviation Tab ile aynı"
          value={props.experienceYears}
          onChangeText={props.setExperienceYears}
          placeholder="0"
          min={0}
        />
      </View>

      {/* Deneyim listesi */}
      <ExperiencesEditor userId={props.userId} items={experiences} loading={lE} />

      {/* Eğitim listesi */}
      <EducationEditor userId={props.userId} items={education} loading={lEdu} />

      {/* Sertifika listesi */}
      <CertificationsEditor userId={props.userId} items={certs} loading={lCert} />

      {/* Type Rating listesi */}
      <TypeRatingsEditor userId={props.userId} items={ratings} loading={lTR} />
    </View>
  );
}

// ─── Tab 3: Aviation ───────────────────────────────────────────────────────
function AviationTab(props: {
  icaoLevel: '4' | '5' | '6' | null;
  setIcaoLevel: (v: '4' | '5' | '6' | null) => void;
  experienceYears: string;
  setExperienceYears: (v: string) => void;
}) {
  return (
    <View style={{ gap: 18 }}>
      <FieldRadio<'4' | '5' | '6'>
        label="ICAO English Level"
        options={[
          { value: '4', label: 'Level 4 — Operational' },
          { value: '5', label: 'Level 5 — Extended' },
          { value: '6', label: 'Level 6 — Expert' },
        ]}
        value={props.icaoLevel}
        onChange={props.setIcaoLevel}
      />
      <Body color="#8A93A6" style={{ fontSize: 12 }}>
        Tıklayarak seçimi temizleyebilirsin (belirtmek istemiyorum).
      </Body>

      <FieldNumber
        label="Aviation Deneyim (yıl)"
        hint="Kariyer Tab ile aynı"
        value={props.experienceYears}
        onChangeText={props.setExperienceYears}
        placeholder="5"
        min={0}
      />
    </View>
  );
}

// ─── Tab 4: Sosyal ─────────────────────────────────────────────────────────
function SocialTab(props: {
  linkedinUrl: string;
  setLinkedinUrl: (v: string) => void;
  instagram: string;
  setInstagram: (v: string) => void;
  twitter: string;
  setTwitter: (v: string) => void;
  youtube: string;
  setYoutube: (v: string) => void;
  facebook: string;
  setFacebook: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
}) {
  return (
    <View style={{ gap: 14 }}>
      <FieldText
        label="🔗 LinkedIn URL"
        value={props.linkedinUrl}
        onChangeText={props.setLinkedinUrl}
        placeholder="https://linkedin.com/in/..."
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FieldText
        label="📷 Instagram"
        hint="kullanıcı adı"
        value={props.instagram}
        onChangeText={props.setInstagram}
        placeholder="captain_alper"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FieldText
        label="𝕏 Twitter"
        hint="kullanıcı adı"
        value={props.twitter}
        onChangeText={props.setTwitter}
        placeholder="captainalper"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FieldText
        label="🎬 YouTube"
        hint="kanal handle"
        value={props.youtube}
        onChangeText={props.setYoutube}
        placeholder="@captainalper"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FieldText
        label="ⓕ Facebook"
        value={props.facebook}
        onChangeText={props.setFacebook}
        placeholder="https://facebook.com/..."
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FieldText
        label="🌐 Website"
        value={props.website}
        onChangeText={props.setWebsite}
        placeholder="https://..."
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
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
      <FieldToggle
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
        <Mono style={{ fontSize: 10, color: '#8B6E2E', letterSpacing: 1.2 }}>BİLGİ</Mono>
        <Body color="#5A4A1F" style={{ fontSize: 13, marginTop: 4, lineHeight: 19 }}>
          Avatar, isim ve rozetler her durumda görünür. Alan-bazlı detaylı gizlilik
          ayarları sonraki sürümde.
        </Body>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4 detay editör — CrudListEditor wrapper'ları
// ═══════════════════════════════════════════════════════════════════════════

interface ExperienceForm {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
}

function ExperiencesEditor({
  userId,
  items,
  loading,
}: {
  userId: string;
  items: ExperienceRow[];
  loading: boolean;
}) {
  return (
    <CrudListEditor<ExperienceRow, ExperienceForm>
      title="Deneyim"
      items={items}
      loading={loading}
      emptyEmoji="💼"
      emptyText="Deneyim henüz yok. İlk işini ekle."
      renderCard={(it) => ({
        primary: it.position,
        secondary: it.company,
        tertiary: [
          it.start_date ?? '?',
          it.is_current ? 'devam ediyor' : it.end_date ?? '?',
        ].join(' — '),
      })}
      itemToForm={(it) =>
        it
          ? {
              company: it.company,
              position: it.position,
              start_date: it.start_date ?? '',
              end_date: it.end_date ?? '',
              is_current: it.is_current,
              description: it.description ?? '',
            }
          : {
              company: '',
              position: '',
              start_date: '',
              end_date: '',
              is_current: false,
              description: '',
            }
      }
      renderForm={(f, set) => (
        <>
          <FieldText
            label="Şirket"
            value={f.company}
            onChangeText={(v) => set({ ...f, company: v })}
          />
          <FieldText
            label="Pozisyon"
            value={f.position}
            onChangeText={(v) => set({ ...f, position: v })}
          />
          <FieldText
            label="Başlangıç"
            hint="YYYY-MM"
            value={f.start_date}
            onChangeText={(v) => set({ ...f, start_date: v })}
            placeholder="2022-03"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {!f.is_current && (
            <FieldText
              label="Bitiş"
              hint="YYYY-MM"
              value={f.end_date}
              onChangeText={(v) => set({ ...f, end_date: v })}
              placeholder="2024-08"
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
          <FieldToggle
            label="Halen burada çalışıyorum"
            value={f.is_current}
            onChange={(v) => set({ ...f, is_current: v, end_date: v ? '' : f.end_date })}
          />
          <FieldText
            label="Açıklama"
            value={f.description}
            onChangeText={(v) => set({ ...f, description: v })}
            multiline
            rows={3}
            placeholder="Sorumluluk, başarı, uçuş türleri…"
          />
        </>
      )}
      onSubmit={async (f, editingId) => {
        if (!f.company.trim() || !f.position.trim()) {
          return { ok: false, error: 'Şirket ve pozisyon zorunlu' };
        }
        const payload = {
          company: f.company.trim(),
          position: f.position.trim(),
          start_date: normalizeDate(f.start_date) ?? null,
          end_date: f.is_current ? null : normalizeDate(f.end_date) ?? null,
          is_current: f.is_current,
          description: f.description.trim() || null,
        };
        if (editingId) return updateDetailRow('user_experiences', editingId, payload);
        return createDetailRow('user_experiences', userId, payload);
      }}
      onDelete={(id) => deleteDetailRow('user_experiences', id)}
    />
  );
}

interface EducationForm {
  school: string;
  degree: string;
  field: string;
  graduation_year: string;
}

function EducationEditor({
  userId,
  items,
  loading,
}: {
  userId: string;
  items: EducationRow[];
  loading: boolean;
}) {
  return (
    <CrudListEditor<EducationRow, EducationForm>
      title="Eğitim"
      items={items}
      loading={loading}
      emptyEmoji="🎓"
      emptyText="Eğitim henüz yok."
      renderCard={(it) => ({
        primary: it.school,
        secondary: [it.degree, it.field].filter(Boolean).join(' · ') || undefined,
        tertiary: it.graduation_year ? String(it.graduation_year) : undefined,
      })}
      itemToForm={(it) =>
        it
          ? {
              school: it.school,
              degree: it.degree ?? '',
              field: it.field ?? '',
              graduation_year: it.graduation_year != null ? String(it.graduation_year) : '',
            }
          : { school: '', degree: '', field: '', graduation_year: '' }
      }
      renderForm={(f, set) => (
        <>
          <FieldText
            label="Okul"
            value={f.school}
            onChangeText={(v) => set({ ...f, school: v })}
          />
          <FieldText
            label="Derece"
            value={f.degree}
            onChangeText={(v) => set({ ...f, degree: v })}
            placeholder="Lisans, Yüksek lisans…"
          />
          <FieldText
            label="Alan"
            value={f.field}
            onChangeText={(v) => set({ ...f, field: v })}
            placeholder="Aviation Management"
          />
          <FieldNumber
            label="Mezuniyet Yılı"
            value={f.graduation_year}
            onChangeText={(v) => set({ ...f, graduation_year: v })}
            placeholder="2020"
            min={1900}
          />
        </>
      )}
      onSubmit={async (f, editingId) => {
        if (!f.school.trim()) return { ok: false, error: 'Okul zorunlu' };
        const year = f.graduation_year ? Number(f.graduation_year) : null;
        if (year !== null && (year < 1900 || year > 2100)) {
          return { ok: false, error: 'Yıl 1900-2100 arası olmalı' };
        }
        const payload = {
          school: f.school.trim(),
          degree: f.degree.trim() || null,
          field: f.field.trim() || null,
          graduation_year: year,
        };
        if (editingId) return updateDetailRow('user_education', editingId, payload);
        return createDetailRow('user_education', userId, payload);
      }}
      onDelete={(id) => deleteDetailRow('user_education', id)}
    />
  );
}

interface CertificationForm {
  type: string;
  number: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
}

const CERT_TYPE_OPTIONS = [
  { value: 'ICAO English Level', label: 'ICAO English' },
  { value: 'EASA Part-66', label: 'EASA Part-66' },
  { value: 'FAA A&P', label: 'FAA A&P' },
  { value: 'Cabin Crew', label: 'Cabin Crew' },
  { value: 'Other', label: 'Diğer' },
] as const;

function CertificationsEditor({
  userId,
  items,
  loading,
}: {
  userId: string;
  items: CertificationRow[];
  loading: boolean;
}) {
  return (
    <CrudListEditor<CertificationRow, CertificationForm>
      title="Sertifika"
      items={items}
      loading={loading}
      emptyEmoji="🏅"
      emptyText="Sertifika henüz yok."
      renderCard={(it) => ({
        primary: it.type,
        secondary: it.issuing_authority ?? undefined,
        tertiary: [
          it.number ? `№ ${it.number}` : null,
          it.issue_date,
          it.expiry_date ? `bitiş: ${it.expiry_date}` : null,
        ]
          .filter(Boolean)
          .join(' · '),
      })}
      itemToForm={(it) =>
        it
          ? {
              type: it.type,
              number: it.number ?? '',
              issue_date: it.issue_date ?? '',
              expiry_date: it.expiry_date ?? '',
              issuing_authority: it.issuing_authority ?? '',
            }
          : {
              type: 'ICAO English Level',
              number: '',
              issue_date: '',
              expiry_date: '',
              issuing_authority: '',
            }
      }
      renderForm={(f, set) => (
        <>
          <FieldSelect
            label="Tip"
            options={CERT_TYPE_OPTIONS as unknown as { value: string; label: string }[]}
            value={f.type}
            onChange={(v) => set({ ...f, type: v })}
          />
          <FieldText
            label="Numara"
            value={f.number}
            onChangeText={(v) => set({ ...f, number: v })}
            placeholder="opsiyonel"
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <FieldText
            label="Veriliş tarihi"
            hint="YYYY-MM-DD"
            value={f.issue_date}
            onChangeText={(v) => set({ ...f, issue_date: v })}
            placeholder="2023-05-12"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FieldText
            label="Bitiş tarihi"
            hint="YYYY-MM-DD"
            value={f.expiry_date}
            onChangeText={(v) => set({ ...f, expiry_date: v })}
            placeholder="2026-05-12"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FieldText
            label="Veren kurum"
            value={f.issuing_authority}
            onChangeText={(v) => set({ ...f, issuing_authority: v })}
            placeholder="SHGM, EASA, FAA…"
          />
        </>
      )}
      onSubmit={async (f, editingId) => {
        if (!f.type.trim()) return { ok: false, error: 'Tip zorunlu' };
        const payload = {
          type: f.type.trim(),
          number: f.number.trim() || null,
          issue_date: normalizeDate(f.issue_date, true) ?? null,
          expiry_date: normalizeDate(f.expiry_date, true) ?? null,
          issuing_authority: f.issuing_authority.trim() || null,
        };
        if (editingId) return updateDetailRow('user_certifications', editingId, payload);
        return createDetailRow('user_certifications', userId, payload);
      }}
      onDelete={(id) => deleteDetailRow('user_certifications', id)}
    />
  );
}

interface TypeRatingForm {
  aircraft_type: string;
  hours: string;
  certified_date: string;
}

function TypeRatingsEditor({
  userId,
  items,
  loading,
}: {
  userId: string;
  items: TypeRatingRow[];
  loading: boolean;
}) {
  return (
    <CrudListEditor<TypeRatingRow, TypeRatingForm>
      title="Type Rating"
      items={items}
      loading={loading}
      emptyEmoji="🛩️"
      emptyText="Type rating henüz yok."
      renderCard={(it) => ({
        primary: it.aircraft_type,
        secondary: it.hours != null ? `${it.hours.toLocaleString()} saat` : undefined,
        tertiary: it.certified_date ?? undefined,
      })}
      itemToForm={(it) =>
        it
          ? {
              aircraft_type: it.aircraft_type,
              hours: it.hours != null ? String(it.hours) : '',
              certified_date: it.certified_date ?? '',
            }
          : { aircraft_type: '', hours: '', certified_date: '' }
      }
      renderForm={(f, set) => (
        <>
          <FieldText
            label="Uçak Tipi"
            value={f.aircraft_type}
            onChangeText={(v) => set({ ...f, aircraft_type: v })}
            placeholder="A320, B737, ATR-72…"
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <FieldNumber
            label="Saat"
            value={f.hours}
            onChangeText={(v) => set({ ...f, hours: v })}
            placeholder="1200"
            min={0}
          />
          <FieldText
            label="Sertifika Tarihi"
            hint="YYYY-MM-DD"
            value={f.certified_date}
            onChangeText={(v) => set({ ...f, certified_date: v })}
            placeholder="2022-09-14"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </>
      )}
      onSubmit={async (f, editingId) => {
        if (!f.aircraft_type.trim())
          return { ok: false, error: 'Uçak tipi zorunlu' };
        const payload = {
          aircraft_type: f.aircraft_type.trim(),
          hours: f.hours ? Number(f.hours) : null,
          certified_date: normalizeDate(f.certified_date, true) ?? null,
        };
        if (editingId) return updateDetailRow('user_type_ratings', editingId, payload);
        return createDetailRow('user_type_ratings', userId, payload);
      }}
      onDelete={(id) => deleteDetailRow('user_type_ratings', id)}
    />
  );
}

// ─── Date helper ───────────────────────────────────────────────────────────
function normalizeDate(input: string, full = false): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (full) {
    return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
  }
  // YYYY-MM → YYYY-MM-01 (DB'ye date olarak yazılır)
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return null;
}

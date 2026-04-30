'use client';

/**
 * UserDetailView — admin user detail tab UI (4 tab).
 *
 * Tabs: Kişisel · Kariyer · Sertifika · Sosyal
 * Her tab'da inline form + (kariyer/sertifika) detay listeler CRUD.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label, Select } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/Dialog';
import {
  adminUpdateProfile,
  adminClearAvatar,
  adminCreateDetailRow,
  adminUpdateDetailRow,
  adminDeleteDetailRow,
  type UserDetailTable,
} from '@/lib/users/actions';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  ShieldOff,
  ImageOff,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Plane,
} from 'lucide-react';

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  level: string | null;
  callsign: string | null;
  bio_short: string | null;
  bio_long: string | null;
  company: string | null;
  position: string | null;
  base_airport: string | null;
  city: string | null;
  country: string | null;
  linkedin_url: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  facebook: string | null;
  website: string | null;
  icao_english_level: string | null;
  aviation_experience_years: number | null;
  profile_completion_percent: number;
  is_profile_public: boolean;
  is_admin: boolean;
  admin_role: string | null;
  premium_until: string | null;
  banned_at: string | null;
  created_at: string;
}

export interface ExperienceRow {
  id: string;
  company: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

export interface EducationRow {
  id: string;
  school: string;
  degree: string | null;
  field: string | null;
  graduation_year: number | null;
}

export interface CertificationRow {
  id: string;
  type: string;
  number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  issuing_authority: string | null;
}

export interface TypeRatingRow {
  id: string;
  aircraft_type: string;
  hours: number | null;
  certified_date: string | null;
}

interface Props {
  profile: UserProfile;
  experiences: ExperienceRow[];
  education: EducationRow[];
  certifications: CertificationRow[];
  typeRatings: TypeRatingRow[];
  currentAdminRole: 'super_admin' | 'editor' | 'reviewer' | null;
}

type TabKey = 'personal' | 'career' | 'certs' | 'social';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'personal', label: '👤 Kişisel' },
  { key: 'career', label: '💼 Kariyer' },
  { key: 'certs', label: '🏅 Sertifika' },
  { key: 'social', label: '🌐 Sosyal' },
];

export function UserDetailView({
  profile,
  experiences,
  education,
  certifications,
  typeRatings,
  currentAdminRole,
}: Props) {
  const [active, setActive] = useState<TabKey>('personal');

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} canModerate={currentAdminRole === 'super_admin'} />

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                active === t.key
                  ? 'bg-airspeak-navy text-white'
                  : 'bg-white text-foreground hover:bg-secondary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {active === 'personal' && <PersonalTab profile={profile} />}
          {active === 'career' && (
            <CareerTab
              profile={profile}
              experiences={experiences}
              education={education}
            />
          )}
          {active === 'certs' && (
            <CertsTab
              userId={profile.id}
              certifications={certifications}
              typeRatings={typeRatings}
            />
          )}
          {active === 'social' && <SocialTab profile={profile} />}
        </div>
      </div>
    </div>
  );
}

// ─── Header (her tab'da görünür) ──────────────────────────────────────────
function ProfileHeader({
  profile,
  canModerate,
}: {
  profile: UserProfile;
  canModerate: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initials = (profile.full_name ?? profile.username ?? 'PI').slice(0, 2).toUpperCase();

  function clearAvatar() {
    if (!confirm("Avatar'ı temizle? Kullanıcı bunu görür ve baştan yükler.")) return;
    startTransition(async () => {
      const r = await adminClearAvatar(profile.id);
      if (r.ok) {
        toast.success('Avatar temizlendi');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  return (
    <div className="bg-white border border-border rounded-xl p-5 flex items-center gap-5">
      <div className="relative">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={initials}
            className="w-20 h-20 rounded-full object-cover border-2 border-airspeak-navy"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-airspeak-navy text-white flex items-center justify-center text-xl font-bold">
            {initials}
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-2xl font-bold text-airspeak-navy">
            {profile.full_name ?? profile.username ?? 'İsimsiz'}
          </h2>
          {profile.callsign && (
            <span className="font-mono text-sm text-muted-foreground">{profile.callsign}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-mono mt-1">{profile.id}</p>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {profile.role && (
            <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-secondary">
              {profile.role}
            </span>
          )}
          {profile.is_profile_public ? (
            <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-emerald-100 text-emerald-700">
              Public
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-amber-100 text-amber-700">
              Private
            </span>
          )}
          <span
            className={`text-xs px-2 py-0.5 rounded font-bold ${
              profile.profile_completion_percent >= 80
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-airspeak-red/10 text-airspeak-red'
            }`}
          >
            %{profile.profile_completion_percent} tamamlandı
          </span>
        </div>
      </div>
      {canModerate && profile.avatar_url && (
        <Button variant="outline" size="sm" onClick={clearAvatar} disabled={isPending}>
          <ImageOff className="w-4 h-4" /> Avatar Temizle
        </Button>
      )}
    </div>
  );
}

// ─── Tab 1: Kişisel ───────────────────────────────────────────────────────
function PersonalTab({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    callsign: profile.callsign ?? '',
    bio_short: profile.bio_short ?? '',
    bio_long: profile.bio_long ?? '',
    role: profile.role ?? '',
    level: profile.level ?? '',
    is_profile_public: profile.is_profile_public,
  });
  const [isPending, startTransition] = useTransition();

  function save() {
    if (form.bio_short.length > 280) {
      toast.error('Kısa bio en fazla 280 karakter');
      return;
    }
    if (form.bio_long.length > 1500) {
      toast.error('Uzun bio en fazla 1500 karakter');
      return;
    }
    startTransition(async () => {
      const r = await adminUpdateProfile(profile.id, {
        full_name: form.full_name.trim() || null,
        callsign: form.callsign.trim() || null,
        bio_short: form.bio_short.trim() || null,
        bio_long: form.bio_long.trim() || null,
        role: form.role || null,
        level: form.level || null,
        is_profile_public: form.is_profile_public,
      });
      if (r.ok) {
        toast.success('Kaydedildi');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tam İsim</Label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div>
          <Label>Çağrı Kodu</Label>
          <Input
            value={form.callsign}
            onChange={(e) => setForm({ ...form, callsign: e.target.value })}
            className="font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Rol</Label>
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="">—</option>
            <option value="pilot">Pilot</option>
            <option value="cabin">Cabin</option>
            <option value="technician">Technician</option>
            <option value="ground">Ground</option>
            <option value="student">Student</option>
          </Select>
        </div>
        <div>
          <Label>Seviye</Label>
          <Select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            <option value="">—</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
          </Select>
        </div>
      </div>

      <div>
        <Label hint={`${form.bio_short.length} / 280`}>Kısa Bio</Label>
        <Textarea
          value={form.bio_short}
          onChange={(e) => setForm({ ...form, bio_short: e.target.value })}
          rows={2}
          maxLength={280}
        />
      </div>
      <div>
        <Label hint={`${form.bio_long.length} / 1500`}>Uzun Bio</Label>
        <Textarea
          value={form.bio_long}
          onChange={(e) => setForm({ ...form, bio_long: e.target.value })}
          rows={5}
          maxLength={1500}
        />
      </div>

      <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3 border border-border">
        <div>
          <p className="text-sm font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4" /> Profil herkese açık
          </p>
          <p className="text-xs text-muted-foreground">
            Kapalı: kariyer/sertifika detayı sadece kullanıcı görür
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...form, is_profile_public: !form.is_profile_public })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
            form.is_profile_public ? 'bg-airspeak-green' : 'bg-secondary border border-border'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition mt-0.5 ${
              form.is_profile_public ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <Button onClick={save} disabled={isPending}>
        {isPending ? 'Kaydediliyor…' : 'Kaydet'}
      </Button>
    </div>
  );
}

// ─── Tab 2: Kariyer (şu anki + experiences + education) ──────────────────
function CareerTab({
  profile,
  experiences,
  education,
}: {
  profile: UserProfile;
  experiences: ExperienceRow[];
  education: EducationRow[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    company: profile.company ?? '',
    position: profile.position ?? '',
    base_airport: profile.base_airport ?? '',
    city: profile.city ?? '',
    country: profile.country ?? '',
    icao_english_level: profile.icao_english_level ?? '',
    aviation_experience_years:
      profile.aviation_experience_years != null ? String(profile.aviation_experience_years) : '',
  });
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const r = await adminUpdateProfile(profile.id, {
        company: form.company.trim() || null,
        position: form.position.trim() || null,
        base_airport: form.base_airport.trim().toUpperCase() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        icao_english_level: form.icao_english_level || null,
        aviation_experience_years: form.aviation_experience_years
          ? Number(form.aviation_experience_years)
          : null,
      });
      if (r.ok) {
        toast.success('Kaydedildi');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-airspeak-navy" />
          Şu Anki Pozisyon
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Şirket</Label>
            <Input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div>
            <Label>Pozisyon</Label>
            <Input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </div>
          <div>
            <Label hint="IATA">Ana Üs</Label>
            <Input
              value={form.base_airport}
              onChange={(e) => setForm({ ...form, base_airport: e.target.value.toUpperCase() })}
              className="font-mono uppercase"
            />
          </div>
          <div>
            <Label>Şehir</Label>
            <Input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div>
            <Label>Ülke</Label>
            <Input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>
          <div>
            <Label>Aviation Deneyim (yıl)</Label>
            <Input
              type="number"
              min={0}
              value={form.aviation_experience_years}
              onChange={(e) =>
                setForm({ ...form, aviation_experience_years: e.target.value })
              }
            />
          </div>
          <div>
            <Label>ICAO English Level</Label>
            <Select
              value={form.icao_english_level}
              onChange={(e) => setForm({ ...form, icao_english_level: e.target.value })}
            >
              <option value="">—</option>
              <option value="4">Level 4 — Operational</option>
              <option value="5">Level 5 — Extended</option>
              <option value="6">Level 6 — Expert</option>
            </Select>
          </div>
        </div>
        <Button onClick={save} disabled={isPending} className="mt-4">
          {isPending ? 'Kaydediliyor…' : 'Şu anki bilgileri kaydet'}
        </Button>
      </div>

      <DetailListSection
        userId={profile.id}
        table="user_experiences"
        title="Deneyim Geçmişi"
        icon={Briefcase}
        items={experiences}
        renderRow={(it) => ({
          primary: it.position,
          secondary: it.company,
          tertiary: `${it.start_date ?? '?'} → ${it.is_current ? 'devam' : it.end_date ?? '?'}`,
        })}
        formFields={(form, setForm) => (
          <ExperienceFields form={form} setForm={setForm} />
        )}
        emptyForm={() => ({
          company: '',
          position: '',
          start_date: '',
          end_date: '',
          is_current: false,
          description: '',
        })}
        rowToForm={(it: ExperienceRow) => ({
          company: it.company,
          position: it.position,
          start_date: it.start_date ?? '',
          end_date: it.end_date ?? '',
          is_current: it.is_current,
          description: it.description ?? '',
        })}
        prepare={(f) => ({
          company: f.company.trim(),
          position: f.position.trim(),
          start_date: normalizeDate(f.start_date) ?? null,
          end_date: f.is_current ? null : normalizeDate(f.end_date) ?? null,
          is_current: f.is_current,
          description: f.description.trim() || null,
        })}
        validate={(f) => (f.company && f.position ? null : 'Şirket ve pozisyon zorunlu')}
      />

      <DetailListSection
        userId={profile.id}
        table="user_education"
        title="Eğitim"
        icon={GraduationCap}
        items={education}
        renderRow={(it) => ({
          primary: it.school,
          secondary: [it.degree, it.field].filter(Boolean).join(' · ') || undefined,
          tertiary: it.graduation_year ? String(it.graduation_year) : undefined,
        })}
        formFields={(form, setForm) => <EducationFields form={form} setForm={setForm} />}
        emptyForm={() => ({ school: '', degree: '', field: '', graduation_year: '' })}
        rowToForm={(it: EducationRow) => ({
          school: it.school,
          degree: it.degree ?? '',
          field: it.field ?? '',
          graduation_year: it.graduation_year != null ? String(it.graduation_year) : '',
        })}
        prepare={(f) => ({
          school: f.school.trim(),
          degree: f.degree.trim() || null,
          field: f.field.trim() || null,
          graduation_year: f.graduation_year ? Number(f.graduation_year) : null,
        })}
        validate={(f) => (f.school ? null : 'Okul zorunlu')}
      />
    </div>
  );
}

// ─── Tab 3: Sertifika + Type Rating ───────────────────────────────────────
function CertsTab({
  userId,
  certifications,
  typeRatings,
}: {
  userId: string;
  certifications: CertificationRow[];
  typeRatings: TypeRatingRow[];
}) {
  return (
    <div className="space-y-6">
      <DetailListSection
        userId={userId}
        table="user_certifications"
        title="Sertifikalar"
        icon={Award}
        items={certifications}
        renderRow={(it) => ({
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
        formFields={(form, setForm) => <CertFields form={form} setForm={setForm} />}
        emptyForm={() => ({
          type: 'ICAO English Level',
          number: '',
          issue_date: '',
          expiry_date: '',
          issuing_authority: '',
        })}
        rowToForm={(it: CertificationRow) => ({
          type: it.type,
          number: it.number ?? '',
          issue_date: it.issue_date ?? '',
          expiry_date: it.expiry_date ?? '',
          issuing_authority: it.issuing_authority ?? '',
        })}
        prepare={(f) => ({
          type: f.type.trim(),
          number: f.number.trim() || null,
          issue_date: normalizeDate(f.issue_date, true) ?? null,
          expiry_date: normalizeDate(f.expiry_date, true) ?? null,
          issuing_authority: f.issuing_authority.trim() || null,
        })}
        validate={(f) => (f.type ? null : 'Tip zorunlu')}
      />

      <DetailListSection
        userId={userId}
        table="user_type_ratings"
        title="Type Ratings"
        icon={Plane}
        items={typeRatings}
        renderRow={(it) => ({
          primary: it.aircraft_type,
          secondary: it.hours != null ? `${it.hours.toLocaleString()} saat` : undefined,
          tertiary: it.certified_date ?? undefined,
        })}
        formFields={(form, setForm) => <TypeRatingFields form={form} setForm={setForm} />}
        emptyForm={() => ({ aircraft_type: '', hours: '', certified_date: '' })}
        rowToForm={(it: TypeRatingRow) => ({
          aircraft_type: it.aircraft_type,
          hours: it.hours != null ? String(it.hours) : '',
          certified_date: it.certified_date ?? '',
        })}
        prepare={(f) => ({
          aircraft_type: f.aircraft_type.trim(),
          hours: f.hours ? Number(f.hours) : null,
          certified_date: normalizeDate(f.certified_date, true) ?? null,
        })}
        validate={(f) => (f.aircraft_type ? null : 'Uçak tipi zorunlu')}
      />
    </div>
  );
}

// ─── Tab 4: Sosyal ────────────────────────────────────────────────────────
function SocialTab({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const [form, setForm] = useState({
    linkedin_url: profile.linkedin_url ?? '',
    instagram: profile.instagram ?? '',
    twitter: profile.twitter ?? '',
    youtube: profile.youtube ?? '',
    facebook: profile.facebook ?? '',
    website: profile.website ?? '',
  });
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const patch: Record<string, string | null> = {};
      for (const [k, v] of Object.entries(form)) {
        patch[k] = v.trim() || null;
      }
      const r = await adminUpdateProfile(profile.id, patch);
      if (r.ok) {
        toast.success('Kaydedildi');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  return (
    <div className="space-y-3">
      {(
        [
          ['linkedin_url', '🔗 LinkedIn URL'],
          ['instagram', '📷 Instagram'],
          ['twitter', '𝕏 Twitter'],
          ['youtube', '🎬 YouTube'],
          ['facebook', 'ⓕ Facebook'],
          ['website', '🌐 Website'],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <Label>{label}</Label>
          <Input
            value={(form as any)[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            placeholder={
              key === 'instagram' || key === 'twitter' || key === 'youtube'
                ? 'kullanıcı adı'
                : 'https://...'
            }
          />
        </div>
      ))}
      <Button onClick={save} disabled={isPending}>
        {isPending ? 'Kaydediliyor…' : 'Kaydet'}
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Generic detail list section + per-table form fields
// ═══════════════════════════════════════════════════════════════════════════
function DetailListSection<T extends { id: string }, F>({
  userId,
  table,
  title,
  icon: Icon,
  items,
  renderRow,
  formFields,
  emptyForm,
  rowToForm,
  prepare,
  validate,
}: {
  userId: string;
  table: UserDetailTable;
  title: string;
  icon: React.ElementType;
  items: T[];
  renderRow: (it: T) => { primary: string; secondary?: string; tertiary?: string };
  formFields: (form: F, setForm: (f: F) => void) => React.ReactNode;
  emptyForm: () => F;
  rowToForm: (it: T) => F;
  prepare: (f: F) => Record<string, unknown>;
  validate: (f: F) => string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<F | null>(null);
  const [isPending, startTransition] = useTransition();

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  }
  function startEdit(it: T) {
    setEditingId(it.id);
    setForm(rowToForm(it));
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setEditingId(null);
    setForm(null);
  }
  function submit() {
    if (!form) return;
    const err = validate(form);
    if (err) {
      toast.error(err);
      return;
    }
    const payload = prepare(form);
    startTransition(async () => {
      const r = editingId
        ? await adminUpdateDetailRow(table, editingId, payload, userId)
        : await adminCreateDetailRow(userId, table, payload);
      if (r.ok) {
        toast.success(editingId ? 'Güncellendi' : 'Eklendi');
        close();
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }
  function del(it: T) {
    if (!confirm(`"${renderRow(it).primary}" silinsin mi?`)) return;
    startTransition(async () => {
      const r = await adminDeleteDetailRow(table, it.id, userId);
      if (r.ok) {
        toast.success('Silindi');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Icon className="w-5 h-5 text-airspeak-navy" />
          {title}
        </h3>
        <Button size="sm" variant="secondary" onClick={startCreate}>
          <Plus className="w-4 h-4" /> Ekle
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-4 text-center">
          Kayıt yok.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => {
            const r = renderRow(it);
            return (
              <div
                key={it.id}
                className="border border-border rounded-lg p-3 bg-white flex items-center gap-3"
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm">{r.primary}</p>
                  {r.secondary && (
                    <p className="text-xs text-muted-foreground">{r.secondary}</p>
                  )}
                  {r.tertiary && (
                    <p className="text-xs text-muted-foreground font-mono mt-1">{r.tertiary}</p>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => startEdit(it)}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => del(it)}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editingId ? `${title} — Düzenle` : `${title} — Ekle`}</DialogTitle>
            <DialogDescription>Admin yetkisiyle kullanıcı kaydı.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">{form !== null ? formFields(form, setForm) : null}</div>
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={isPending}>
              Vazgeç
            </Button>
            <Button onClick={submit} disabled={isPending}>
              {isPending ? 'Kaydediliyor…' : editingId ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Per-table form fields ─────────────────────────────────────────────────
function ExperienceFields({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Şirket</Label>
          <Input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>
        <div>
          <Label>Pozisyon</Label>
          <Input
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label hint="YYYY-MM">Başlangıç</Label>
          <Input
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            placeholder="2022-03"
          />
        </div>
        {!form.is_current && (
          <div>
            <Label hint="YYYY-MM">Bitiş</Label>
            <Input
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              placeholder="2024-08"
            />
          </div>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.is_current}
          onChange={(e) =>
            setForm({
              ...form,
              is_current: e.target.checked,
              end_date: e.target.checked ? '' : form.end_date,
            })
          }
        />
        Halen burada çalışıyor
      </label>
      <div>
        <Label>Açıklama</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />
      </div>
    </>
  );
}

function EducationFields({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <>
      <div>
        <Label>Okul</Label>
        <Input
          value={form.school}
          onChange={(e) => setForm({ ...form, school: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Derece</Label>
          <Input
            value={form.degree}
            onChange={(e) => setForm({ ...form, degree: e.target.value })}
          />
        </div>
        <div>
          <Label>Alan</Label>
          <Input
            value={form.field}
            onChange={(e) => setForm({ ...form, field: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Mezuniyet Yılı</Label>
        <Input
          type="number"
          min={1900}
          max={2100}
          value={form.graduation_year}
          onChange={(e) => setForm({ ...form, graduation_year: e.target.value })}
        />
      </div>
    </>
  );
}

function CertFields({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <>
      <div>
        <Label>Tip</Label>
        <Select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="ICAO English Level">ICAO English Level</option>
          <option value="EASA Part-66">EASA Part-66</option>
          <option value="FAA A&P">FAA A&P</option>
          <option value="Cabin Crew">Cabin Crew</option>
          <option value="Other">Other</option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Numara</Label>
          <Input
            value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
          />
        </div>
        <div>
          <Label>Veren Kurum</Label>
          <Input
            value={form.issuing_authority}
            onChange={(e) => setForm({ ...form, issuing_authority: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label hint="YYYY-MM-DD">Veriliş</Label>
          <Input
            value={form.issue_date}
            onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
            placeholder="2023-05-12"
          />
        </div>
        <div>
          <Label hint="YYYY-MM-DD">Bitiş</Label>
          <Input
            value={form.expiry_date}
            onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
            placeholder="2026-05-12"
          />
        </div>
      </div>
    </>
  );
}

function TypeRatingFields({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <>
      <div>
        <Label>Uçak Tipi</Label>
        <Input
          value={form.aircraft_type}
          onChange={(e) => setForm({ ...form, aircraft_type: e.target.value.toUpperCase() })}
          className="font-mono uppercase"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Saat</Label>
          <Input
            type="number"
            min={0}
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: e.target.value })}
          />
        </div>
        <div>
          <Label hint="YYYY-MM-DD">Sertifika Tarihi</Label>
          <Input
            value={form.certified_date}
            onChange={(e) => setForm({ ...form, certified_date: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}

function normalizeDate(input: string, full = false): string | null {
  const t = input.trim();
  if (!t) return null;
  if (full) return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null;
  if (/^\d{4}-\d{2}$/.test(t)) return `${t}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  return null;
}

'use client';

/**
 * UserDetailView — admin user detail (5 tab).
 *
 * Tabs: Genel Bakış · Kişisel · Kariyer · Sosyal · Moderasyon
 * Kariyer altında 4 alt-section: deneyim/eğitim/sertifika/type rating.
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
  adminBlankBio,
  adminCreateDetailRow,
  adminUpdateDetailRow,
  adminDeleteDetailRow,
  type UserDetailTable,
} from '@/lib/users/actions';
import {
  setPremium,
  banUser,
  unbanUser,
  setAdminRole,
} from '@/lib/content/actions';
import {
  changeUserLeagueClass,
  adjustUserXp,
  removeUserFromLeague,
} from '@/lib/leagues/actions';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  ImageOff,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Plane,
  Crown,
  Ban,
  ShieldCheck,
  Activity,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Trophy,
  History,
  XCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
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
  ban_reason: string | null;
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
export interface AuditEntry {
  id: string;
  action: string;
  table_name: string | null;
  diff: any;
  metadata: any;
  created_at: string;
}

export interface LeagueSummary {
  current_class: string | null;
  highest_class: string | null;
  total_xp: number;
  week_xp: number;
  month_xp: number;
  year_xp: number;
  current_rank: number | null;
  current_group_id: string | null;
  championship_count: number;
}

interface Props {
  profile: UserProfile;
  experiences: ExperienceRow[];
  education: EducationRow[];
  certifications: CertificationRow[];
  typeRatings: TypeRatingRow[];
  badgeCount: number;
  lastSignInAt: string | null;
  auditEntries: AuditEntry[];
  league: LeagueSummary;
  currentAdminRole: 'super_admin' | 'editor' | 'reviewer' | null;
}

type TabKey = 'overview' | 'personal' | 'career' | 'social' | 'league' | 'moderation';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '📊 Genel Bakış' },
  { key: 'personal', label: '👤 Kişisel' },
  { key: 'career', label: '💼 Kariyer' },
  { key: 'social', label: '🌐 Sosyal' },
  { key: 'league', label: '🏆 Lig' },
  { key: 'moderation', label: '🛡️ Moderasyon' },
];

export function UserDetailView(props: Props) {
  const [active, setActive] = useState<TabKey>('overview');
  const isSuper = props.currentAdminRole === 'super_admin';

  return (
    <div className="space-y-6">
      <ProfileHeader profile={props.profile} canModerate={isSuper} />

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
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
          {active === 'overview' && (
            <OverviewTab
              profile={props.profile}
              badgeCount={props.badgeCount}
              lastSignInAt={props.lastSignInAt}
              experiencesCount={props.experiences.length}
              certificationsCount={props.certifications.length}
            />
          )}
          {active === 'personal' && <PersonalTab profile={props.profile} canSuper={isSuper} />}
          {active === 'career' && (
            <CareerTab
              profile={props.profile}
              experiences={props.experiences}
              education={props.education}
              certifications={props.certifications}
              typeRatings={props.typeRatings}
            />
          )}
          {active === 'social' && <SocialTab profile={props.profile} />}
          {active === 'league' && (
            <LeagueTab
              profile={props.profile}
              league={props.league}
              canSuper={isSuper}
            />
          )}
          {active === 'moderation' && (
            <ModerationTab
              profile={props.profile}
              auditEntries={props.auditEntries}
              canSuper={isSuper}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────
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
  const isBanned = !!profile.banned_at;
  const isPremium = profile.premium_until && new Date(profile.premium_until) > new Date();

  function clearAvatar() {
    if (!confirm("Avatar'ı temizle? Kullanıcı baştan yükler.")) return;
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
            <Pill className="bg-secondary">{profile.role.toUpperCase()}</Pill>
          )}
          {profile.is_profile_public ? (
            <Pill className="bg-emerald-100 text-emerald-700">
              <Eye className="w-3 h-3 inline mr-1" /> Public
            </Pill>
          ) : (
            <Pill className="bg-amber-100 text-amber-700">
              <EyeOff className="w-3 h-3 inline mr-1" /> Private
            </Pill>
          )}
          {isPremium && (
            <Pill className="bg-amber-100 text-amber-800">
              <Crown className="w-3 h-3 inline mr-1" /> Premium
            </Pill>
          )}
          {isBanned && (
            <Pill className="bg-red-100 text-red-700">
              <Ban className="w-3 h-3 inline mr-1" /> Yasaklı
            </Pill>
          )}
          {profile.is_admin && (
            <Pill className="bg-airspeak-red/10 text-airspeak-red">
              <ShieldCheck className="w-3 h-3 inline mr-1" /> {profile.admin_role ?? 'admin'}
            </Pill>
          )}
          <Pill
            className={
              profile.profile_completion_percent >= 80
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-airspeak-red/10 text-airspeak-red'
            }
          >
            %{profile.profile_completion_percent} tamamlandı
          </Pill>
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

function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${className}`}>
      {children}
    </span>
  );
}

// ─── Tab 1: Genel Bakış ────────────────────────────────────────────────────
function OverviewTab({
  profile,
  badgeCount,
  lastSignInAt,
  experiencesCount,
  certificationsCount,
}: {
  profile: UserProfile;
  badgeCount: number;
  lastSignInAt: string | null;
  experiencesCount: number;
  certificationsCount: number;
}) {
  const isPremium = profile.premium_until && new Date(profile.premium_until) > new Date();
  const isBanned = !!profile.banned_at;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCell
          label="Üyelik"
          value={fmtDate(profile.created_at)}
          icon={<Calendar className="w-4 h-4" />}
        />
        <StatCell
          label="Son Giriş"
          value={lastSignInAt ? fmtRelative(lastSignInAt) : '—'}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCell
          label="Rozetler"
          value={String(badgeCount)}
          icon={<Trophy className="w-4 h-4 text-amber-600" />}
        />
        <StatCell
          label="Tamamlanma"
          value={`%${profile.profile_completion_percent}`}
          icon={<Activity className="w-4 h-4" />}
          accent={profile.profile_completion_percent >= 80 ? 'green' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Kimlik & İletişim" icon={<Globe className="w-4 h-4" />}>
          <Row label="Tam İsim" value={profile.full_name} />
          <Row label="Kullanıcı Adı" value={profile.username} mono />
          <Row label="Çağrı Kodu" value={profile.callsign} mono />
          <Row label="Rol" value={profile.role?.toUpperCase() ?? null} />
          <Row label="Seviye" value={profile.level} />
          <Row
            label="Lokasyon"
            value={
              [profile.base_airport, profile.city, profile.country]
                .filter(Boolean)
                .join(' · ') || null
            }
          />
        </InfoCard>

        <InfoCard title="Hesap Durumu" icon={<ShieldCheck className="w-4 h-4" />}>
          <Row
            label="Premium"
            value={
              isPremium
                ? `Aktif — ${fmtDate(profile.premium_until!)}`
                : profile.premium_until
                  ? `Bitmiş — ${fmtDate(profile.premium_until)}`
                  : 'Yok'
            }
            accent={isPremium ? 'amber' : undefined}
          />
          <Row
            label="Yasaklı"
            value={
              isBanned
                ? `${fmtDate(profile.banned_at!)} — ${profile.ban_reason ?? '—'}`
                : 'Hayır'
            }
            accent={isBanned ? 'red' : undefined}
          />
          <Row
            label="Admin"
            value={profile.is_admin ? profile.admin_role ?? 'admin' : 'Hayır'}
            accent={profile.is_admin ? 'red' : undefined}
          />
          <Row
            label="Profil Görünür"
            value={profile.is_profile_public ? 'Evet (public)' : 'Hayır (private)'}
          />
          <Row label="ICAO English" value={profile.icao_english_level ? `L${profile.icao_english_level}` : null} />
          <Row
            label="Aviation Deneyim"
            value={
              profile.aviation_experience_years != null
                ? `${profile.aviation_experience_years} yıl`
                : null
            }
          />
        </InfoCard>

        <InfoCard title="Kariyer" icon={<Briefcase className="w-4 h-4" />}>
          <Row label="Şirket" value={profile.company} />
          <Row label="Pozisyon" value={profile.position} />
          <Row label="Deneyim Kayıtları" value={String(experiencesCount)} />
          <Row label="Sertifika" value={String(certificationsCount)} />
        </InfoCard>

        <InfoCard title="Bio" icon={<Activity className="w-4 h-4" />}>
          {profile.bio_short ? (
            <p className="text-sm text-foreground whitespace-pre-wrap">{profile.bio_short}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Kısa bio yok.</p>
          )}
        </InfoCard>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  accent?: 'green' | 'red' | 'amber';
}) {
  const accentClass =
    accent === 'green'
      ? 'text-emerald-700'
      : accent === 'red'
        ? 'text-airspeak-red'
        : accent === 'amber'
          ? 'text-amber-700'
          : 'text-airspeak-navy';
  return (
    <div className="bg-secondary/30 border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`mt-1 text-xl font-bold ${accentClass}`}>{value}</p>
    </div>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  accent?: 'red' | 'amber' | 'green';
}) {
  const accentClass =
    accent === 'red'
      ? 'text-airspeak-red'
      : accent === 'amber'
        ? 'text-amber-700'
        : accent === 'green'
          ? 'text-emerald-700'
          : 'text-foreground';
  return (
    <div className="flex justify-between gap-2 py-1 border-b border-border last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-sm text-right ${mono ? 'font-mono' : ''} ${accentClass}`}
      >
        {value ?? <span className="text-muted-foreground italic">—</span>}
      </span>
    </div>
  );
}

// ─── Tab 2: Kişisel ───────────────────────────────────────────────────────
function PersonalTab({ profile, canSuper }: { profile: UserProfile; canSuper: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    callsign: profile.callsign ?? '',
    bio_short: profile.bio_short ?? '',
    bio_long: profile.bio_long ?? '',
    role: profile.role ?? '',
    level: profile.level ?? '',
    is_profile_public: profile.is_profile_public,
    icao_english_level: profile.icao_english_level ?? '',
    aviation_experience_years:
      profile.aviation_experience_years != null ? String(profile.aviation_experience_years) : '',
  });
  const [isPending, startTransition] = useTransition();

  function save() {
    if (form.bio_short.length > 280) return toast.error('Kısa bio en fazla 280 karakter');
    if (form.bio_long.length > 1500) return toast.error('Uzun bio en fazla 1500 karakter');
    startTransition(async () => {
      const r = await adminUpdateProfile(profile.id, {
        full_name: form.full_name.trim() || null,
        callsign: form.callsign.trim() || null,
        bio_short: form.bio_short.trim() || null,
        bio_long: form.bio_long.trim() || null,
        role: form.role || null,
        level: form.level || null,
        is_profile_public: form.is_profile_public,
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

  function clearBio() {
    if (!confirm('Kısa ve uzun bio temizlensin mi?')) return;
    startTransition(async () => {
      const r = await adminBlankBio(profile.id);
      if (r.ok) {
        toast.success('Bio temizlendi');
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

      <div className="grid grid-cols-2 gap-3">
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
        <div>
          <Label>Aviation Deneyim (yıl)</Label>
          <Input
            type="number"
            min={0}
            value={form.aviation_experience_years}
            onChange={(e) => setForm({ ...form, aviation_experience_years: e.target.value })}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <Label hint={`${form.bio_short.length} / 280`}>Kısa Bio</Label>
          {canSuper && (form.bio_short || form.bio_long) && (
            <button
              type="button"
              onClick={clearBio}
              className="text-xs text-airspeak-red font-bold uppercase tracking-wider"
              disabled={isPending}
            >
              Bio Temizle
            </button>
          )}
        </div>
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
            Kapalı: kariyer/sertifika sadece kullanıcı görür
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

// ─── Tab 3: Kariyer (4 alt-section) ───────────────────────────────────────
function CareerTab({
  profile,
  experiences,
  education,
  certifications,
  typeRatings,
}: {
  profile: UserProfile;
  experiences: ExperienceRow[];
  education: EducationRow[];
  certifications: CertificationRow[];
  typeRatings: TypeRatingRow[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    company: profile.company ?? '',
    position: profile.position ?? '',
    base_airport: profile.base_airport ?? '',
    city: profile.city ?? '',
    country: profile.country ?? '',
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
      });
      if (r.ok) {
        toast.success('Kaydedildi');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  return (
    <div className="space-y-6">
      {/* Şu anki */}
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
        </div>
        <Button onClick={save} disabled={isPending} className="mt-4">
          {isPending ? 'Kaydediliyor…' : 'Şu anki bilgileri kaydet'}
        </Button>
      </div>

      <DetailListSection
        userId={profile.id}
        table="user_experiences"
        title="Deneyim"
        icon={Briefcase}
        items={experiences}
        renderRow={(it) => ({
          primary: it.position,
          secondary: it.company,
          tertiary: `${it.start_date ?? '?'} → ${it.is_current ? 'devam' : it.end_date ?? '?'}`,
        })}
        formFields={(form, setForm) => <ExperienceFields form={form} setForm={setForm} />}
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

      <DetailListSection
        userId={profile.id}
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
        userId={profile.id}
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
      for (const [k, v] of Object.entries(form)) patch[k] = v.trim() || null;
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

// ─── Tab 5: Lig ──────────────────────────────────────────────────────────
function LeagueTab({
  profile,
  league,
  canSuper,
}: {
  profile: UserProfile;
  league: LeagueSummary;
  canSuper: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newClass, setNewClass] = useState<string>(league.current_class ?? 'bronze');
  const [xpDelta, setXpDelta] = useState<number>(0);
  const [xpReason, setXpReason] = useState<string>('');

  function changeClass() {
    if (!confirm(`${profile.full_name ?? profile.username} kullanıcısı ${newClass} sınıfına alınacak. Devam?`)) return;
    startTransition(async () => {
      const r = await changeUserLeagueClass({ userId: profile.id, newClass: newClass as any });
      if (r.ok) {
        toast.success('Sınıf değiştirildi');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  function applyXpAdjust() {
    if (!xpReason.trim()) return toast.error('Sebep zorunlu');
    if (xpDelta === 0) return toast.error('Delta 0 olamaz');
    if (!confirm(`XP ${xpDelta > 0 ? '+' : ''}${xpDelta} ayarlanacak. Devam?`)) return;
    startTransition(async () => {
      const r = await adjustUserXp({
        userId: profile.id,
        delta: xpDelta,
        reason: xpReason.trim(),
      });
      if (r.ok) {
        toast.success('XP düzenlendi');
        setXpDelta(0);
        setXpReason('');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  function removeFromLeague() {
    if (!confirm('Kullanıcı liglerden çıkarılsın mı? Mevcut membership silinir, sınıf bilgisi temizlenir.')) return;
    startTransition(async () => {
      const r = await removeUserFromLeague({ userId: profile.id });
      if (r.ok) {
        toast.success('Lig\'den çıkarıldı');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-secondary/30 border border-border rounded-lg p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">Mevcut Sınıf</div>
          <div className="text-xl font-bold mt-1">{league.current_class ?? '—'}</div>
        </div>
        <div className="bg-secondary/30 border border-border rounded-lg p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">En Yüksek</div>
          <div className="text-xl font-bold mt-1">{league.highest_class ?? '—'}</div>
        </div>
        <div className="bg-secondary/30 border border-border rounded-lg p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">Şu An Sıra</div>
          <div className="text-xl font-bold mt-1">{league.current_rank ?? '—'}</div>
        </div>
        <div className="bg-secondary/30 border border-border rounded-lg p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">Şampiyonluk</div>
          <div className="text-xl font-bold mt-1">{league.championship_count}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-border rounded-lg p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">Toplam XP</div>
          <div className="text-lg font-bold mt-1 font-mono">{league.total_xp.toLocaleString('tr-TR')}</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">Bu Hafta</div>
          <div className="text-lg font-bold mt-1 font-mono">{league.week_xp.toLocaleString('tr-TR')}</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">Bu Ay</div>
          <div className="text-lg font-bold mt-1 font-mono">{league.month_xp.toLocaleString('tr-TR')}</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">Bu Yıl</div>
          <div className="text-lg font-bold mt-1 font-mono">{league.year_xp.toLocaleString('tr-TR')}</div>
        </div>
      </div>

      {canSuper && (
        <>
          <div className="bg-white border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-airspeak-gold" /> Sınıf Değiştir
            </h3>
            <div className="flex gap-2">
              <Select
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                className="w-44"
              >
                <option value="bronze">Bronz</option>
                <option value="silver">Gümüş</option>
                <option value="gold">Altın</option>
                <option value="sapphire">Safir</option>
                <option value="ruby">Yakut</option>
                <option value="emerald">Zümrüt</option>
                <option value="diamond">Elmas</option>
              </Select>
              <Button onClick={changeClass} disabled={isPending}>
                Sınıfa Taşı
              </Button>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-airspeak-navy" /> XP Düzelt
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label hint="negatif veya pozitif">Delta</Label>
                <Input
                  type="number"
                  value={xpDelta}
                  onChange={(e) => setXpDelta(Number(e.target.value))}
                />
              </div>
              <div>
                <Label required>Sebep (audit)</Label>
                <Input
                  value={xpReason}
                  onChange={(e) => setXpReason(e.target.value)}
                  placeholder="Düzeltme nedeni"
                />
              </div>
            </div>
            <Button onClick={applyXpAdjust} disabled={isPending} variant="secondary">
              Uygula
            </Button>
          </div>

          <div className="bg-red-50 border border-airspeak-red/40 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-airspeak-red" /> Lig'den Çıkar
            </h3>
            <p className="text-xs text-red-900">
              Membership silinir, current_league_class temizlenir. Bir sonraki ders
              tamamlandığında lazy assign yeniden çalışır.
            </p>
            <Button
              variant="destructive"
              onClick={removeFromLeague}
              disabled={isPending}
              size="sm"
            >
              Lig'den Çıkar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab 6: Moderasyon ────────────────────────────────────────────────────
function ModerationTab({
  profile,
  auditEntries,
  canSuper,
}: {
  profile: UserProfile;
  auditEntries: AuditEntry[];
  canSuper: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isPremium = profile.premium_until && new Date(profile.premium_until) > new Date();
  const isBanned = !!profile.banned_at;

  const [premiumDays, setPremiumDays] = useState(30);
  const [banReason, setBanReason] = useState('');
  const [adminRoleSel, setAdminRoleSel] = useState(profile.admin_role ?? 'reviewer');

  function applyPremium(days: number | null) {
    startTransition(async () => {
      const r = await setPremium(profile.id, days);
      if (r.ok) {
        toast.success(days === null ? 'Premium kaldırıldı' : `${days} gün premium`);
        router.refresh();
      } else toast.error(r.error);
    });
  }
  function applyBan() {
    if (!banReason.trim()) return toast.error('Sebep zorunlu');
    startTransition(async () => {
      const r = await banUser(profile.id, banReason.trim());
      if (r.ok) {
        toast.success('Yasaklandı');
        setBanReason('');
        router.refresh();
      } else toast.error(r.error);
    });
  }
  function applyUnban() {
    startTransition(async () => {
      const r = await unbanUser(profile.id);
      if (r.ok) {
        toast.success('Yasak kaldırıldı');
        router.refresh();
      } else toast.error(r.error);
    });
  }
  function applyAdminRole(role: string | null) {
    startTransition(async () => {
      const r = await setAdminRole(profile.id, role);
      if (r.ok) {
        toast.success(role ? `Admin: ${role}` : 'Admin yetkisi kaldırıldı');
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-6">
      {/* Premium */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 font-bold">
          <Crown className="w-5 h-5 text-amber-700" />
          <span>Premium</span>
          {isPremium && (
            <span className="text-xs text-amber-700">
              Aktif — {fmtDate(profile.premium_until!)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="number"
            min={1}
            value={premiumDays}
            onChange={(e) => setPremiumDays(Number(e.target.value))}
            className="w-24"
          />
          <Button
            size="sm"
            variant="gold"
            onClick={() => applyPremium(premiumDays)}
            disabled={isPending}
          >
            {premiumDays} gün ver
          </Button>
          {isPremium && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyPremium(null)}
              disabled={isPending}
            >
              Premium'u Kaldır
            </Button>
          )}
        </div>
      </div>

      {/* Ban */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 font-bold">
          <Ban className="w-5 h-5 text-airspeak-red" />
          <span>Hesap Yasağı</span>
          {isBanned && (
            <span className="text-xs text-airspeak-red">
              {fmtDate(profile.banned_at!)} — {profile.ban_reason ?? '—'}
            </span>
          )}
        </div>
        {isBanned ? (
          <Button size="sm" variant="outline" onClick={applyUnban} disabled={isPending}>
            Yasağı Kaldır
          </Button>
        ) : (
          <div className="space-y-2">
            <Textarea
              placeholder="Yasak sebebi (zorunlu)"
              rows={2}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
            <Button size="sm" variant="destructive" onClick={applyBan} disabled={isPending}>
              Yasakla
            </Button>
          </div>
        )}
      </div>

      {/* Admin role — sadece super_admin görür */}
      {canSuper && (
        <div className="bg-secondary/40 border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-5 h-5 text-airspeak-red" />
            <span>Admin Yetkisi</span>
            {profile.is_admin && (
              <span className="text-xs text-airspeak-red">{profile.admin_role}</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={adminRoleSel}
              onChange={(e) => setAdminRoleSel(e.target.value)}
              className="w-44"
            >
              <option value="reviewer">Reviewer</option>
              <option value="editor">Editor</option>
              <option value="super_admin">Super Admin</option>
            </Select>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => applyAdminRole(adminRoleSel)}
              disabled={isPending}
            >
              Atan / Yükselt
            </Button>
            {profile.is_admin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => applyAdminRole(null)}
                disabled={isPending}
              >
                Admin'i Kaldır
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Audit log */}
      <div>
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
          <History className="w-5 h-5 text-airspeak-navy" />
          Audit Log <span className="text-xs text-muted-foreground">(son 50)</span>
        </h3>
        {auditEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Bu kullanıcı için audit kaydı yok.</p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="px-3 py-2 text-left">Zaman</th>
                  <th className="px-3 py-2 text-left">Aksiyon</th>
                  <th className="px-3 py-2 text-left">Tablo</th>
                  <th className="px-3 py-2 text-left">Detay</th>
                </tr>
              </thead>
              <tbody>
                {auditEntries.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {fmtDateTime(a.created_at)}
                    </td>
                    <td className="px-3 py-2 font-mono">{a.action}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">
                      {a.table_name ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      {a.metadata ? (
                        <code className="text-[10px] text-muted-foreground">
                          {JSON.stringify(a.metadata).slice(0, 80)}
                        </code>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
    if (err) return toast.error(err);
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

// ─── Helpers ───────────────────────────────────────────────────────────────
function normalizeDate(input: string, full = false): string | null {
  const t = input.trim();
  if (!t) return null;
  if (full) return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null;
  if (/^\d{4}-\d{2}$/.test(t)) return `${t}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  return null;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function fmtRelative(iso: string): string {
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.floor(ms / 60000);
    if (min < 60) return `${min} dk önce`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} saat önce`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d} gün önce`;
    return fmtDate(iso);
  } catch {
    return iso;
  }
}

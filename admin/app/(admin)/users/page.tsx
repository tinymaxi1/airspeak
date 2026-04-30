import Link from 'next/link';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { formatDate } from '@/lib/utils';
import { Crown, Ban, ShieldCheck, ExternalLink, Users, UserPlus, Activity, Percent, Gauge } from 'lucide-react';
import { UserRowActions } from '@/components/forms/UserActions';

const ROLE_BADGE: Record<string, string> = {
  pilot: 'bg-airspeak-red/10 text-airspeak-red',
  cabin: 'bg-pink-100 text-pink-700',
  technician: 'bg-amber-100 text-amber-700',
  ground: 'bg-emerald-100 text-emerald-700',
  student: 'bg-blue-100 text-blue-700',
};

interface UserRow {
  id: string;
  username: string | null;
  full_name: string | null;
  role: string | null;
  level: string | null;
  premium_until: string | null;
  banned_at: string | null;
  is_admin: boolean;
  admin_role: string | null;
  created_at: string;
  profile_completion_percent: number;
}

export default async function UsersPage() {
  await requireAdminRole('editor');

  const supabase = await createClient();
  const service = createServiceClient();

  const { data: users } = await (supabase as any)
    .from('profiles')
    .select(
      'id, username, full_name, role, level, premium_until, banned_at, is_admin, admin_role, created_at, profile_completion_percent',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  // Dashboard stats — service_role ile tam tablo
  const now = new Date();
  const weekAgoIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [totalRes, weekRes, premiumActiveRes, completionAvgRes] = await Promise.all([
    (service as any).from('profiles').select('*', { count: 'exact', head: true }),
    (service as any)
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgoIso),
    (service as any)
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('premium_until', now.toISOString()),
    // Postgres aggregate via RPC değil — basit yaklaşım: liste fetch + JS avg
    (service as any).from('profiles').select('profile_completion_percent'),
  ]);

  const total = totalRes.count ?? 0;
  const weekNew = weekRes.count ?? 0;
  const premiumActive = premiumActiveRes.count ?? 0;
  const premiumPct = total > 0 ? Math.round((premiumActive / total) * 100) : 0;
  const completionRows: { profile_completion_percent: number }[] =
    completionAvgRes.data ?? [];
  const completionAvg =
    completionRows.length > 0
      ? Math.round(
          completionRows.reduce((s, r) => s + (r.profile_completion_percent ?? 0), 0) /
            completionRows.length,
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-airspeak-navy">Kullanıcılar</h1>
        <p className="text-muted-foreground mt-1">
          {(users ?? []).length} liste · {total} toplam
        </p>
      </div>

      {/* Dashboard 5 hücre */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <DashCell icon={Users} label="Toplam" value={total.toLocaleString('tr-TR')} />
        <DashCell
          icon={UserPlus}
          label="Bu Hafta Yeni"
          value={weekNew.toLocaleString('tr-TR')}
          accent="green"
        />
        <DashCell
          icon={Crown}
          label="Premium Aktif"
          value={premiumActive.toLocaleString('tr-TR')}
          accent="amber"
        />
        <DashCell icon={Percent} label="Premium %" value={`%${premiumPct}`} accent="amber" />
        <DashCell
          icon={Gauge}
          label="Ort. Profil Tam."
          value={`%${completionAvg}`}
          accent={completionAvg >= 60 ? 'green' : 'red'}
        />
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Kullanıcı</th>
              <th className="px-4 py-3 text-left font-semibold w-20">Rol</th>
              <th className="px-4 py-3 text-left font-semibold w-14">Sev.</th>
              <th className="px-4 py-3 text-left font-semibold w-20">Tam.</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Premium</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Admin</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Kayıt</th>
              <th className="px-4 py-3 text-left font-semibold w-20">Durum</th>
              <th className="px-4 py-3 text-right font-semibold w-44">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {((users ?? []) as UserRow[]).map((u) => {
              const isPremium = u.premium_until && new Date(u.premium_until) > new Date();
              const isBanned = !!u.banned_at;
              return (
                <tr
                  key={u.id}
                  className="border-b border-border last:border-b-0 hover:bg-secondary/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/users/${u.id}`}
                      className="inline-flex items-center gap-1.5 hover:text-airspeak-red"
                    >
                      <div>
                        <div className="font-semibold">
                          {u.full_name ?? u.username ?? '—'}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.id.slice(0, 8)}…</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {u.role && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${ROLE_BADGE[u.role] ?? 'bg-secondary'}`}
                      >
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{u.level ?? '—'}</td>
                  <td className="px-4 py-3">
                    <CompletionBar pct={u.profile_completion_percent} />
                  </td>
                  <td className="px-4 py-3">
                    {isPremium ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-bold">
                        <Crown className="w-3 h-3" /> {formatDate(u.premium_until!)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.is_admin && (
                      <span className="inline-flex items-center gap-1 text-xs text-airspeak-red font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        {u.admin_role ?? 'admin'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {isBanned ? (
                      <span className="inline-flex items-center gap-1 text-xs text-destructive font-bold">
                        <Ban className="w-3 h-3" /> Yasaklı
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-700">Aktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <UserRowActions user={u as any} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DashCell({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
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
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <p className={`mt-1 text-2xl font-bold ${accentClass}`}>{value}</p>
    </div>
  );
}

function CompletionBar({ pct }: { pct: number }) {
  const safe = Math.max(0, Math.min(100, pct ?? 0));
  const color = safe >= 80 ? 'bg-emerald-500' : safe >= 40 ? 'bg-amber-500' : 'bg-airspeak-red';
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-secondary rounded overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${safe}%` }} />
      </div>
      <span className="text-xs font-mono text-muted-foreground tabular-nums">%{safe}</span>
    </div>
  );
}

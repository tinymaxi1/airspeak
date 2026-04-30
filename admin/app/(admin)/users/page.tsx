import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { formatDate } from '@/lib/utils';
import { Crown, Ban, ShieldCheck, ExternalLink } from 'lucide-react';
import { UserRowActions } from '@/components/forms/UserActions';

const ROLE_BADGE: Record<string, string> = {
  pilot: 'bg-airspeak-red/10 text-airspeak-red',
  cabin: 'bg-pink-100 text-pink-700',
  technician: 'bg-amber-100 text-amber-700',
  ground: 'bg-emerald-100 text-emerald-700',
  student: 'bg-blue-100 text-blue-700',
};

export default async function UsersPage() {
  // Editor+ erişimi gerekir
  await requireAdminRole('editor');

  const supabase = await createClient();
  const { data: users } = await (supabase as any)
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-airspeak-navy">Kullanıcılar</h1>
        <p className="text-muted-foreground mt-1">{(users ?? []).length} kullanıcı (max 200)</p>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Kullanıcı</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Rol</th>
              <th className="px-4 py-3 text-left font-semibold w-16">Sev.</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Premium</th>
              <th className="px-4 py-3 text-left font-semibold w-28">Admin</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Kayıt</th>
              <th className="px-4 py-3 text-left font-semibold w-20">Durum</th>
              <th className="px-4 py-3 text-right font-semibold w-44">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u: any) => {
              const isPremium = u.premium_until && new Date(u.premium_until) > new Date();
              const isBanned = !!u.banned_at;
              return (
                <tr key={u.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
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
                      <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${ROLE_BADGE[u.role] ?? 'bg-secondary'}`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{u.level ?? '—'}</td>
                  <td className="px-4 py-3">
                    {isPremium ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-bold">
                        <Crown className="w-3 h-3" /> {formatDate(u.premium_until)}
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
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(u.created_at)}</td>
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
                      <UserRowActions user={u} />
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

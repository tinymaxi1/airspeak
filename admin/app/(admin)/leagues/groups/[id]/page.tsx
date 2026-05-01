import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Users } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

const CLASS_LABEL: Record<string, string> = {
  bronze: 'Bronz',
  silver: 'Gümüş',
  gold: 'Altın',
  sapphire: 'Safir',
  ruby: 'Yakut',
  emerald: 'Zümrüt',
  diamond: 'Elmas',
};

export default async function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { data: group } = await (supabase as any)
    .from('league_groups')
    .select('*, league_seasons(season_type, year, period_number, status)')
    .eq('id', params.id)
    .single();

  if (!group) notFound();

  const { data: members } = await (supabase as any)
    .from('league_memberships')
    .select(
      'id, user_id, week_xp, rank, promotion_status, joined_at, profiles(username, full_name, avatar_url)',
    )
    .eq('group_id', params.id)
    .order('week_xp', { ascending: false })
    .order('joined_at', { ascending: true });

  const totalMembers = (members ?? []).length;
  const promoCutoff = (group as any).class_tier === 'diamond' ? 0 : 10;
  const demoCutoff = (group as any).class_tier === 'bronze' ? 0 : 10;
  const demoStartRank = totalMembers - demoCutoff + 1;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Link
        href={`/leagues/seasons/${(group as any).season_id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-airspeak-navy"
      >
        <ChevronLeft className="w-4 h-4" /> Sezon Grupları
      </Link>

      <div className="bg-white border border-border rounded-xl p-5">
        <h1 className="text-2xl font-bold text-airspeak-navy">
          {CLASS_LABEL[(group as any).class_tier]} · {(group as any).role ?? '—'} · {(group as any).level_tier ?? '—'}
        </h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <Users className="w-4 h-4" />
          <span>{totalMembers} / 50 üye</span>
          <span>·</span>
          <span className="font-mono">{(group as any).id.slice(0, 8)}…</span>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-3 py-2 text-left font-semibold w-12">#</th>
              <th className="px-3 py-2 text-left font-semibold">Kullanıcı</th>
              <th className="px-3 py-2 text-right font-semibold w-24">Week XP</th>
              <th className="px-3 py-2 text-left font-semibold w-24">Status</th>
              <th className="px-3 py-2 text-left font-semibold w-24">Zone</th>
            </tr>
          </thead>
          <tbody>
            {(members ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  Bu grupta üye yok.
                </td>
              </tr>
            ) : (
              ((members ?? []) as any[]).map((m, idx) => {
                const rank = m.rank ?? idx + 1;
                const inPromoZone = promoCutoff > 0 && rank <= promoCutoff;
                const inDemoZone = demoCutoff > 0 && rank >= demoStartRank;
                return (
                  <tr
                    key={m.id}
                    className={`border-b border-border last:border-b-0 ${
                      inPromoZone
                        ? 'bg-emerald-50'
                        : inDemoZone
                          ? 'bg-rose-50'
                          : ''
                    }`}
                  >
                    <td className="px-3 py-2 font-bold">{rank}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/users/${m.user_id}`}
                        className="hover:text-airspeak-red"
                      >
                        {m.profiles?.full_name ?? m.profiles?.username ?? m.user_id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {m.week_xp.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-3 py-2 text-xs">{m.promotion_status}</td>
                    <td className="px-3 py-2 text-xs">
                      {inPromoZone && (
                        <span className="text-emerald-700 font-bold">↑ TERFİ</span>
                      )}
                      {inDemoZone && (
                        <span className="text-airspeak-red font-bold">↓ DÜŞÜŞ</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

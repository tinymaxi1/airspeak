'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  setCompetitionStatus,
  manualResolveCompetition,
  removeCompetitionEntry,
  deleteCompetition,
} from '@/lib/competitions/actions';
import { EditCompetitionButton } from '@/components/forms/CompetitionForm';
import { toast } from 'sonner';
import { Trophy, Users, Calendar, Coins, Crown } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  announced: 'bg-blue-100 text-blue-700',
  active: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-airspeak-navy/10 text-airspeak-navy',
  cancelled: 'bg-red-100 text-red-700',
};

interface EntryRow {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  score: number;
  rank: number | null;
  joined_at: string;
}

export function CompetitionDetailView({
  competition,
  entries,
  rewards,
  canSuper,
}: {
  competition: any;
  entries: EntryRow[];
  rewards: any[];
  canSuper: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeStatus(status: 'announced' | 'active' | 'cancelled' | 'closed') {
    if (!confirm(`Status "${status}" yapılacak. Devam?`)) return;
    startTransition(async () => {
      const r = await setCompetitionStatus(competition.id, status);
      if (r.ok) {
        toast.success('Status güncellendi');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  function manualResolve() {
    if (
      !confirm(
        'Yarışma manuel olarak kapatılacak ve ödüller dağıtılacak. Geri alınamaz. Devam?',
      )
    )
      return;
    startTransition(async () => {
      const r = await manualResolveCompetition(competition.id);
      if (r.ok) {
        toast.success('Çözüldü, ödüller dağıtıldı');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  function removeEntry(entryId: string, name: string) {
    const reason = prompt(`${name} entry siliniyor. Sebep:`);
    if (!reason) return;
    startTransition(async () => {
      const r = await removeCompetitionEntry(entryId, reason);
      if (r.ok) {
        toast.success('Entry silindi');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  function deleteAll() {
    if (
      !confirm(
        `"${competition.name}" yarışması TAMAMEN silinecek (tüm entries + rewards). Geri alınamaz. Devam?`,
      )
    )
      return;
    startTransition(async () => {
      const r = await deleteCompetition(competition.id);
      if (r.ok) {
        toast.success('Silindi');
        router.push('/competitions');
      } else toast.error(r.error ?? 'Hata');
    });
  }

  return (
    <div className="space-y-6">
      <Link
        href="/competitions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-airspeak-navy"
      >
        ← Yarışmalar
      </Link>

      {/* Header */}
      <div className="bg-white border border-border rounded-xl p-5 flex items-start gap-5">
        <div className="text-5xl">{competition.icon_emoji}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-airspeak-navy">
              {competition.name_tr ?? competition.name}
            </h1>
            <span
              className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${STATUS_COLOR[competition.status]}`}
            >
              {competition.status}
            </span>
            {competition.is_premium && (
              <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-amber-100 text-amber-800">
                <Crown className="w-3 h-3 inline mr-1" /> Premium
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1">{competition.slug}</p>
          {competition.description_tr && (
            <p className="text-sm text-muted-foreground mt-2">{competition.description_tr}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>
              <Calendar className="w-3 h-3 inline mr-1" />
              {new Date(competition.start_date).toLocaleString('tr-TR')} →{' '}
              {new Date(competition.end_date).toLocaleString('tr-TR')}
            </span>
            <span>
              <Users className="w-3 h-3 inline mr-1" />
              {entries.length} katılımcı
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <EditCompetitionButton row={competition} />
          {competition.status === 'draft' && (
            <Button size="sm" variant="secondary" onClick={() => changeStatus('announced')}>
              Duyur
            </Button>
          )}
          {competition.status === 'announced' && (
            <Button size="sm" variant="green" onClick={() => changeStatus('active')}>
              Başlat
            </Button>
          )}
          {(competition.status === 'announced' || competition.status === 'active') && (
            <Button size="sm" variant="outline" onClick={() => changeStatus('cancelled')}>
              İptal
            </Button>
          )}
          {competition.status === 'active' && canSuper && (
            <Button size="sm" variant="gold" onClick={manualResolve}>
              Manuel Resolve
            </Button>
          )}
          {canSuper && (
            <Button size="sm" variant="destructive" onClick={deleteAll}>
              Sil
            </Button>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-border rounded-lg p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">Tema</div>
          <div className="text-lg font-bold mt-1">{competition.theme}</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">Tip</div>
          <div className="text-lg font-bold mt-1 font-mono">{competition.type}</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">Hedef</div>
          <div className="text-sm font-bold mt-1">
            {[competition.target_role, competition.target_level_tier]
              .filter(Boolean)
              .join(' · ') || 'Filtre yok'}
          </div>
        </div>
        <div className="bg-white border border-border rounded-lg p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">Katılım</div>
          <div className="text-lg font-bold mt-1 flex items-center gap-1">
            {competition.entry_cost_coin > 0 ? (
              <>
                <Coins className="w-4 h-4 text-amber-700" />
                {competition.entry_cost_coin}
              </>
            ) : (
              'Ücretsiz'
            )}
          </div>
        </div>
      </div>

      {/* Prize pool */}
      <div className="bg-white border border-border rounded-xl p-5">
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-airspeak-gold" />
          Ödül Havuzu
        </h2>
        {(competition.prize_pool ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Ödül yok.</p>
        ) : (
          <div className="space-y-2">
            {(competition.prize_pool as any[]).map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm border border-border rounded-lg p-2 bg-secondary/30"
              >
                <span className="font-bold w-20">
                  {p.rank != null ? `#${p.rank}` : `#${p.rank_from}-${p.rank_to}`}
                </span>
                <span className="text-xs uppercase font-mono w-24">{p.type}</span>
                <span className="font-mono text-xs">
                  {p.type === 'badge'
                    ? `code: ${p.code}`
                    : p.type === 'premium_days'
                      ? `${p.days} gün`
                      : p.amount?.toLocaleString('tr-TR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard / entries */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-bold text-lg">Sıralama ({entries.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-2 text-left font-semibold w-12">#</th>
              <th className="px-4 py-2 text-left font-semibold">Kullanıcı</th>
              <th className="px-4 py-2 text-right font-semibold w-24">Score</th>
              <th className="px-4 py-2 text-left font-semibold w-32">Katıldı</th>
              {canSuper && <th className="px-4 py-2 text-right font-semibold w-20"></th>}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={canSuper ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                  Henüz katılımcı yok.
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2 font-bold">{e.rank ?? '—'}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/users/${e.user_id}`}
                      className="hover:text-airspeak-red"
                    >
                      {e.full_name ?? e.username ?? e.user_id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {Number(e.score).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {new Date(e.joined_at).toLocaleDateString('tr-TR')}
                  </td>
                  {canSuper && (
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          removeEntry(
                            e.id,
                            e.full_name ?? e.username ?? e.user_id.slice(0, 8),
                          )
                        }
                        disabled={isPending}
                        className="text-xs text-airspeak-red hover:underline"
                      >
                        Sil
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rewards (closed competitions) */}
      {competition.status === 'closed' && rewards.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-airspeak-gold" />
            Dağıtılan Ödüller
          </h2>
          <div className="space-y-2">
            {rewards.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 text-sm border border-border rounded-lg p-2 bg-secondary/30"
              >
                <span className="font-bold w-12">#{r.rank}</span>
                <Link
                  href={`/users/${r.user_id}`}
                  className="flex-1 hover:text-airspeak-red"
                >
                  {r.user_id.slice(0, 8)}…
                </Link>
                <span className="text-xs font-mono">{r.reward_type}</span>
                <span className="text-xs font-mono">
                  {r.reward_value?.amount ?? r.reward_value?.code ?? r.reward_value?.days ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

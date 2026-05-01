'use client';

/**
 * Admin Lig Yönetim — 5 tab (client component).
 *
 * Tabs: Aktif Sezonlar · Şampiyonlar · Ödüller · Şüpheli Aktivite · Config
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { ConfigField } from '@/components/config/ConfigField';
import {
  manualRotateWeekly,
  manualRotateMonthly,
  manualRotateYearly,
  resolveSuspiciousFlag,
  flagSuspiciousUser,
  manualGrantReward,
} from '@/lib/leagues/actions';
import { toast } from 'sonner';
import {
  Calendar,
  Crown,
  Star,
  Trophy,
  AlertTriangle,
  Settings,
  RefreshCw,
  ExternalLink,
  Coins,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const CLASS_COLORS: Record<string, string> = {
  bronze: 'bg-amber-100 text-amber-800',
  silver: 'bg-gray-100 text-gray-700',
  gold: 'bg-yellow-100 text-yellow-800',
  sapphire: 'bg-blue-100 text-blue-700',
  ruby: 'bg-rose-100 text-rose-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  diamond: 'bg-cyan-100 text-cyan-700',
};

interface ActiveSeason {
  id: string;
  season_type: 'weekly' | 'monthly' | 'yearly';
  year: number;
  period_number: number;
  start_date: string;
  end_date: string;
  status: string;
  group_count: number;
  member_count: number;
}

interface ChampionshipRow {
  id: string;
  championship_type: 'weekly' | 'monthly' | 'yearly';
  year: number;
  period_number: number;
  role: string | null;
  level_tier: string | null;
  user_id: string;
  username: string | null;
  full_name: string | null;
  snapshot_xp: number;
  awarded_at: string;
}

interface RewardRow {
  id: string;
  user_id: string;
  username: string | null;
  rank: number | null;
  reward_type: string;
  reward_value: any;
  granted_at: string;
}

interface SuspiciousRow {
  user_id: string;
  username: string | null;
  full_name: string | null;
  xp_1h: number;
  xp_24h: number;
  avg_time_24h: number;
  lessons_24h: number;
  device_count: number;
  suspicion_score: number;
  reasons: string[];
}

interface ManualFlag {
  id: string;
  user_id: string;
  username: string | null;
  reason: string;
  detail: any;
  flagged_at: string;
  reviewed_at: string | null;
  resolution: string | null;
}

interface ConfigRow {
  key: string;
  value: any;
  description: string | null;
  category: string;
  data_type: 'boolean' | 'number' | 'string' | 'json' | 'array';
  updated_at: string;
}

type TabKey = 'seasons' | 'champions' | 'rewards' | 'suspicious' | 'config';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'seasons', label: 'Aktif Sezonlar', icon: Calendar },
  { key: 'champions', label: 'Şampiyonlar', icon: Crown },
  { key: 'rewards', label: 'Ödüller', icon: Coins },
  { key: 'suspicious', label: 'Şüpheli Aktivite', icon: AlertTriangle },
  { key: 'config', label: 'Config', icon: Settings },
];

export function AdminLeaguesView({
  activeSeasons,
  championships,
  rewards,
  suspiciousRows,
  manualFlags,
  config,
  totalRewardCoinsWeek,
  totalRewardCoinsMonth,
  totalRewardCoinsYear,
  premiumGiftCount,
}: {
  activeSeasons: ActiveSeason[];
  championships: ChampionshipRow[];
  rewards: RewardRow[];
  suspiciousRows: SuspiciousRow[];
  manualFlags: ManualFlag[];
  config: ConfigRow[];
  totalRewardCoinsWeek: number;
  totalRewardCoinsMonth: number;
  totalRewardCoinsYear: number;
  premiumGiftCount: number;
}) {
  const [tab, setTab] = useState<TabKey>('seasons');

  const championshipCounts = {
    weekly: championships.filter((c) => c.championship_type === 'weekly').length,
    monthly: championships.filter((c) => c.championship_type === 'monthly').length,
    yearly: championships.filter((c) => c.championship_type === 'yearly').length,
  };

  const totalGroups = activeSeasons.reduce((s, a) => s + a.group_count, 0);
  const totalMembers = activeSeasons.reduce((s, a) => s + a.member_count, 0);
  const weeklySeason = activeSeasons.find((a) => a.season_type === 'weekly');

  return (
    <div className="space-y-6">
      {/* Üst stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCell
          label="Aktif Hafta"
          value={
            weeklySeason
              ? `${weeklySeason.year} W${weeklySeason.period_number}`
              : '—'
          }
          icon={Calendar}
        />
        <StatCell label="Toplam Grup" value={String(totalGroups)} icon={Trophy} />
        <StatCell label="Aktif Üye" value={String(totalMembers)} icon={Crown} />
        <StatCell
          label="Bu Hafta Coin"
          value={totalRewardCoinsWeek.toLocaleString('tr-TR')}
          icon={Coins}
          accent="amber"
        />
        <StatCell
          label="Premium Hediye"
          value={String(premiumGiftCount)}
          icon={Star}
          accent="amber"
        />
      </div>

      {/* Tab navigation */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
                  tab === t.key
                    ? 'bg-airspeak-navy text-white'
                    : 'bg-white text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {tab === 'seasons' && <SeasonsTab seasons={activeSeasons} />}
          {tab === 'champions' && (
            <ChampionsTab champions={championships} counts={championshipCounts} />
          )}
          {tab === 'rewards' && (
            <RewardsTab
              rewards={rewards}
              totalWeek={totalRewardCoinsWeek}
              totalMonth={totalRewardCoinsMonth}
              totalYear={totalRewardCoinsYear}
            />
          )}
          {tab === 'suspicious' && (
            <SuspiciousTab autoRows={suspiciousRows} manualFlags={manualFlags} />
          )}
          {tab === 'config' && <ConfigTab config={config} />}
        </div>
      </div>
    </div>
  );
}

// ─── Stat cell ────────────────────────────────────────────────────────────
function StatCell({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: any;
  accent?: 'amber' | 'green' | 'red';
}) {
  const accentClass =
    accent === 'amber'
      ? 'text-amber-700'
      : accent === 'green'
        ? 'text-emerald-700'
        : accent === 'red'
          ? 'text-airspeak-red'
          : 'text-airspeak-navy';
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <p className={`mt-1 text-xl font-bold ${accentClass}`}>{value}</p>
    </div>
  );
}

// ─── Tab 1: Sezonlar ──────────────────────────────────────────────────────
function SeasonsTab({ seasons }: { seasons: ActiveSeason[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const byType = {
    weekly: seasons.find((s) => s.season_type === 'weekly'),
    monthly: seasons.find((s) => s.season_type === 'monthly'),
    yearly: seasons.find((s) => s.season_type === 'yearly'),
  };

  function rotate(type: 'weekly' | 'monthly' | 'yearly') {
    const labels = {
      weekly: 'haftalık',
      monthly: 'aylık',
      yearly: 'yıllık',
    };
    if (
      !confirm(
        `${labels[type]} rotation manuel tetiklenecek. Bu, tüm sezonu kapatır + yenisini açar + ödülleri dağıtır. Devam?`,
      )
    )
      return;
    startTransition(async () => {
      const r =
        type === 'weekly'
          ? await manualRotateWeekly()
          : type === 'monthly'
            ? await manualRotateMonthly()
            : await manualRotateYearly();
      if (r.ok) {
        toast.success(`${labels[type]} rotation tamamlandı`);
        router.refresh();
      } else {
        toast.error(r.error ?? 'Hata');
      }
    });
  }

  return (
    <div className="space-y-4">
      {(['weekly', 'monthly', 'yearly'] as const).map((type) => {
        const s = byType[type];
        const labels = { weekly: 'Haftalık', monthly: 'Aylık', yearly: 'Yıllık' };
        const Icon = type === 'weekly' ? Calendar : type === 'monthly' ? Crown : Star;
        return (
          <div
            key={type}
            className="bg-white border border-border rounded-lg p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
              <Icon className="w-6 h-6 text-airspeak-navy" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg">{labels[type]} Sezon</h3>
                {s && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {s.status}
                  </span>
                )}
              </div>
              {s ? (
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  {s.start_date} → {s.end_date} · {s.group_count} grup ·{' '}
                  {s.member_count} üye
                </div>
              ) : (
                <div className="text-xs text-muted-foreground mt-1 italic">
                  Aktif sezon yok
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {s && type === 'weekly' && (
                <Link
                  href={`/leagues/seasons/${s.id}`}
                  className="text-xs px-3 py-2 rounded-lg border border-border hover:bg-secondary inline-flex items-center gap-1"
                >
                  Grupları Gör <ExternalLink className="w-3 h-3" />
                </Link>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => rotate(type)}
                disabled={isPending}
              >
                <RefreshCw className="w-3 h-3" /> Manuel Rotate
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab 2: Şampiyonlar ───────────────────────────────────────────────────
function ChampionsTab({
  champions,
  counts,
}: {
  champions: ChampionshipRow[];
  counts: { weekly: number; monthly: number; yearly: number };
}) {
  const [filter, setFilter] = useState<'all' | 'weekly' | 'monthly' | 'yearly'>('all');
  const filtered =
    filter === 'all' ? champions : champions.filter((c) => c.championship_type === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { k: 'all', l: `Tümü (${champions.length})` },
            { k: 'weekly', l: `Haftalık (${counts.weekly})` },
            { k: 'monthly', l: `Aylık (${counts.monthly})` },
            { k: 'yearly', l: `Yıllık (${counts.yearly})` },
          ] as const
        ).map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              filter === f.k
                ? 'bg-airspeak-navy text-white'
                : 'bg-secondary text-foreground'
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-3 py-2 text-left font-semibold w-24">Tip</th>
              <th className="px-3 py-2 text-left font-semibold w-28">Periyot</th>
              <th className="px-3 py-2 text-left font-semibold w-20">Rol</th>
              <th className="px-3 py-2 text-left font-semibold w-16">Tier</th>
              <th className="px-3 py-2 text-left font-semibold">Kullanıcı</th>
              <th className="px-3 py-2 text-right font-semibold w-24">Snapshot XP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  Şampiyonluk yok.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 text-xs font-semibold uppercase">
                    {c.championship_type}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono">
                    {c.year}
                    {c.championship_type === 'weekly' && `-W${c.period_number}`}
                    {c.championship_type === 'monthly' && `-${String(c.period_number).padStart(2, '0')}`}
                  </td>
                  <td className="px-3 py-2 text-xs">{c.role ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{c.level_tier ?? '—'}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/users/${c.user_id}`}
                      className="hover:text-airspeak-red"
                    >
                      {c.full_name ?? c.username ?? c.user_id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {c.snapshot_xp.toLocaleString('tr-TR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab 3: Ödüller ───────────────────────────────────────────────────────
function RewardsTab({
  rewards,
  totalWeek,
  totalMonth,
  totalYear,
}: {
  rewards: RewardRow[];
  totalWeek: number;
  totalMonth: number;
  totalYear: number;
}) {
  const [grantOpen, setGrantOpen] = useState(false);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCell label="Bu Hafta Coin" value={totalWeek.toLocaleString('tr-TR')} icon={Coins} accent="amber" />
        <StatCell label="Bu Ay Coin" value={totalMonth.toLocaleString('tr-TR')} icon={Coins} accent="amber" />
        <StatCell label="Bu Yıl Coin" value={totalYear.toLocaleString('tr-TR')} icon={Coins} accent="amber" />
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Son Ödüller (100)</h3>
        <Button size="sm" variant="secondary" onClick={() => setGrantOpen(true)}>
          Manuel Ödül
        </Button>
      </div>

      <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-3 py-2 text-left font-semibold w-32">Zaman</th>
              <th className="px-3 py-2 text-left font-semibold">Kullanıcı</th>
              <th className="px-3 py-2 text-left font-semibold w-16">Sıra</th>
              <th className="px-3 py-2 text-left font-semibold w-20">Tip</th>
              <th className="px-3 py-2 text-right font-semibold w-20">Miktar</th>
            </tr>
          </thead>
          <tbody>
            {rewards.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  Ödül kaydı yok.
                </td>
              </tr>
            ) : (
              rewards.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 text-xs font-mono text-muted-foreground">
                    {new Date(r.granted_at).toLocaleString('tr-TR', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/users/${r.user_id}`}
                      className="hover:text-airspeak-red"
                    >
                      {r.username ?? r.user_id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-xs">{r.rank ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.reward_type}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {r.reward_value?.amount?.toLocaleString('tr-TR') ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {grantOpen && <ManualGrantDialog onClose={() => setGrantOpen(false)} />}
    </div>
  );
}

function ManualGrantDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState(100);
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!userId.trim()) {
      toast.error('User ID zorunlu');
      return;
    }
    if (amount <= 0) {
      toast.error('Miktar pozitif olmalı');
      return;
    }
    if (!reason.trim()) {
      toast.error('Sebep zorunlu (audit için)');
      return;
    }
    startTransition(async () => {
      const r = await manualGrantReward({
        userId: userId.trim(),
        amount,
        rewardType: 'coin',
        reason: reason.trim(),
      });
      if (r.ok) {
        toast.success('Ödül verildi');
        onClose();
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manuel Ödül Ver</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label required>User ID (UUID)</Label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} className="font-mono text-xs" />
          </div>
          <div>
            <Label required>Coin Miktarı</Label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <Label required>Sebep</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Vazgeç
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? 'Veriliyor…' : 'Ver'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab 4: Şüpheli Aktivite ──────────────────────────────────────────────
function SuspiciousTab({
  autoRows,
  manualFlags,
}: {
  autoRows: SuspiciousRow[];
  manualFlags: ManualFlag[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function flag(userId: string) {
    const reason = prompt('Şüphe sebebi:');
    if (!reason) return;
    startTransition(async () => {
      const r = await flagSuspiciousUser({ userId, reason });
      if (r.ok) {
        toast.success('İşaretlendi');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  function resolve(flagId: string, resolution: 'cleared' | 'banned' | 'warned') {
    startTransition(async () => {
      const r = await resolveSuspiciousFlag({ flagId, resolution });
      if (r.ok) {
        toast.success(`Çözüldü: ${resolution}`);
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-airspeak-red" />
          Otomatik Tespit (suspicious_xp_view)
        </h3>
        <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Kullanıcı</th>
                <th className="px-3 py-2 text-right font-semibold">XP 1h</th>
                <th className="px-3 py-2 text-right font-semibold">XP 24h</th>
                <th className="px-3 py-2 text-right font-semibold">Avg sn</th>
                <th className="px-3 py-2 text-right font-semibold">Cihaz</th>
                <th className="px-3 py-2 text-left font-semibold">Sebepler</th>
                <th className="px-3 py-2 text-right font-semibold w-16">Skor</th>
                <th className="px-3 py-2 text-right font-semibold w-20"></th>
              </tr>
            </thead>
            <tbody>
              {autoRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    Şu an anormal aktivite yok ✓
                  </td>
                </tr>
              ) : (
                autoRows.map((r) => (
                  <tr key={r.user_id} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2">
                      <Link
                        href={`/users/${r.user_id}`}
                        className="hover:text-airspeak-red font-semibold"
                      >
                        {r.full_name ?? r.username ?? r.user_id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{r.xp_1h.toLocaleString('tr-TR')}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.xp_24h.toLocaleString('tr-TR')}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.avg_time_24h}sn</td>
                    <td className="px-3 py-2 text-right font-mono">{r.device_count}</td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-[10px] text-airspeak-red">
                        {r.reasons.join(', ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`font-bold ${r.suspicion_score >= 60 ? 'text-airspeak-red' : 'text-amber-700'}`}
                      >
                        {r.suspicion_score}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => flag(r.user_id)}>
                        Flag
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-airspeak-navy" />
          Manuel Flag'ler
        </h3>
        <div className="space-y-2">
          {manualFlags.length === 0 ? (
            <p className="text-xs text-muted-foreground">Manuel flag yok.</p>
          ) : (
            manualFlags.map((f) => (
              <div
                key={f.id}
                className="border border-border rounded-lg p-3 flex items-center gap-3 bg-white"
              >
                <AlertTriangle
                  className={`w-4 h-4 ${
                    f.reviewed_at ? 'text-muted-foreground' : 'text-airspeak-red'
                  }`}
                />
                <div className="flex-1">
                  <Link
                    href={`/users/${f.user_id}`}
                    className="font-semibold text-sm hover:text-airspeak-red"
                  >
                    {f.username ?? f.user_id.slice(0, 8)}
                  </Link>
                  <div className="text-xs text-muted-foreground">{f.reason}</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {new Date(f.flagged_at).toLocaleString('tr-TR')}
                    {f.resolution && ` · resolved: ${f.resolution}`}
                  </div>
                </div>
                {!f.reviewed_at && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => resolve(f.id, 'cleared')} disabled={isPending}>
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => resolve(f.id, 'warned')} disabled={isPending}>
                      Uyar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => resolve(f.id, 'banned')} disabled={isPending}>
                      <XCircle className="w-3 h-3 text-airspeak-red" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 5: Config ────────────────────────────────────────────────────────
function ConfigTab({ config }: { config: ConfigRow[] }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Lig ödül miktarları, capacity, promotion/demotion sayıları. Mobil app her açılışta okur.
      </p>
      <div className="bg-white border border-border rounded-lg p-4">
        {config.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            League config yok — migration uygulanmamış olabilir.
          </p>
        ) : (
          config.map((row) => <ConfigField key={row.key} row={row as any} />)
        )}
      </div>
    </div>
  );
}

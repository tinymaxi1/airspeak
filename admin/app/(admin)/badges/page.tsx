import { createClient } from '@/lib/supabase/server';
import { CreateBadgeButton, EditBadgeButton } from '@/components/forms/BadgeForm';
import { Award } from 'lucide-react';

const RARITY_COLOR: Record<string, string> = {
  common: 'bg-gray-100 text-gray-700',
  rare: 'bg-emerald-100 text-emerald-800',
  epic: 'bg-violet-100 text-violet-800',
  legendary: 'bg-amber-100 text-amber-800',
};

const CATEGORY_LABEL: Record<string, string> = {
  streak: 'Streak',
  xp: 'XP',
  level: 'Level',
  lesson: 'Ders',
  speed: 'Hız',
  social: 'Sosyal',
  league: 'Lig',
  special: 'Özel',
};

interface BadgeRow {
  id: string;
  code: string;
  name_tr: string;
  icon_emoji: string;
  icon_url: string | null;
  category: string;
  condition_type: string;
  condition_value: number;
  rarity: string;
  sort: number;
  is_active: boolean;
}

export default async function BadgesPage() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('badges')
    .select('*')
    .order('category', { ascending: true })
    .order('sort', { ascending: true })
    .limit(500);

  const { count: earnedTotal } = await (supabase as any)
    .from('user_badges')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-airspeak-gold/15 flex items-center justify-center">
              <Award className="w-5 h-5 text-airspeak-gold" />
            </div>
            <h1 className="text-3xl font-bold text-airspeak-navy">Rozetler</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {(data ?? []).length} template · {earnedTotal ?? 0} toplam kazanım
          </p>
        </div>
        <CreateBadgeButton label="Yeni rozet" />
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-16">İkon</th>
              <th className="px-4 py-3 text-left font-semibold">Code · İsim</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Kategori</th>
              <th className="px-4 py-3 text-left font-semibold w-44">Koşul</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Rarity</th>
              <th className="px-4 py-3 text-left font-semibold w-20">Aktif</th>
              <th className="px-4 py-3 text-right font-semibold w-44">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {((data ?? []) as BadgeRow[]).map((b) => (
              <tr key={b.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3">
                  {b.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.icon_url} alt={b.code} className="w-9 h-9 object-contain" />
                  ) : (
                    <span className="text-2xl">{b.icon_emoji}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{b.name_tr}</div>
                  <div className="font-mono text-xs text-muted-foreground">{b.code}</div>
                </td>
                <td className="px-4 py-3 text-xs">
                  {CATEGORY_LABEL[b.category] ?? b.category}
                </td>
                <td className="px-4 py-3 text-xs">
                  {b.condition_type} ≥ <span className="font-semibold">{b.condition_value}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                      RARITY_COLOR[b.rarity] ?? RARITY_COLOR.common
                    }`}
                  >
                    {b.rarity}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  {b.is_active ? (
                    <span className="text-emerald-700">✓ Aktif</span>
                  ) : (
                    <span className="text-muted-foreground">— Kapalı</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <EditBadgeButton row={b} />
                  </div>
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Henüz rozet yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

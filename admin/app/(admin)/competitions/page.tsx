import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { CreateCompetitionButton } from '@/components/forms/CompetitionForm';
import { Trophy, ExternalLink, Calendar, Users } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  announced: 'bg-blue-100 text-blue-700',
  active: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-airspeak-navy/10 text-airspeak-navy',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Taslak',
  announced: 'Duyuruldu',
  active: 'Aktif',
  closed: 'Kapalı',
  cancelled: 'İptal',
};

const THEME_LABEL: Record<string, string> = {
  icao_focus: 'ICAO',
  phraseology: 'Frazeoloji',
  vocabulary_blast: 'Kelime',
  maintenance: 'Bakım',
  cabin_safety: 'Kabin',
  seasonal: 'Sezon',
  company_event: 'Şirket',
  other: 'Diğer',
};

export default async function CompetitionsPage() {
  await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { data: comps } = await (supabase as any)
    .from('competitions')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(100);

  // Entry sayıları
  const entryCounts = new Map<string, number>();
  if (comps && (comps as any[]).length > 0) {
    const ids = (comps as any[]).map((c) => c.id);
    const { data: counts } = await (supabase as any)
      .from('competition_entries')
      .select('competition_id')
      .in('competition_id', ids);
    for (const r of (counts ?? []) as any[]) {
      entryCounts.set(
        r.competition_id,
        (entryCounts.get(r.competition_id) ?? 0) + 1,
      );
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-airspeak-gold/15 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-airspeak-gold" />
            </div>
            <h1 className="text-3xl font-bold text-airspeak-navy">Yarışmalar</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {(comps ?? []).length} yarışma · event-based etkinlikler
          </p>
        </div>
        <CreateCompetitionButton label="Yeni yarışma" />
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-12"></th>
              <th className="px-4 py-3 text-left font-semibold">Ad · Slug</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Tema</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Tip</th>
              <th className="px-4 py-3 text-left font-semibold w-44">Tarih</th>
              <th className="px-4 py-3 text-left font-semibold w-20">Üye</th>
              <th className="px-4 py-3 text-left font-semibold w-28">Durum</th>
              <th className="px-4 py-3 text-right font-semibold w-24">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {(comps ?? []).length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  Henüz yarışma yok.
                </td>
              </tr>
            ) : (
              ((comps ?? []) as any[]).map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-b-0 hover:bg-secondary/30"
                >
                  <td className="px-4 py-3 text-2xl">{c.icon_emoji}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/competitions/${c.id}`}
                      className="font-semibold hover:text-airspeak-red inline-flex items-center gap-1"
                    >
                      {c.name_tr ?? c.name}
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </Link>
                    <div className="text-xs font-mono text-muted-foreground">{c.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{THEME_LABEL[c.theme] ?? c.theme}</td>
                  <td className="px-4 py-3 text-xs font-mono">{c.type}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(c.start_date).toLocaleDateString('tr-TR')} →{' '}
                    {new Date(c.end_date).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <Users className="w-3 h-3 inline mr-1" />
                    {entryCounts.get(c.id) ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${STATUS_COLOR[c.status] ?? ''}`}
                    >
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/competitions/${c.id}`}
                      className="text-xs text-airspeak-red font-bold uppercase hover:underline"
                    >
                      DETAY
                    </Link>
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

import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Plus } from 'lucide-react';

const REGION_LABEL: Record<string, string> = {
  turkey: '🇹🇷 Türkiye',
  'middle-east': '🕌 Orta Doğu',
  'europe-fsc': '🏛️ Avrupa Bayrak',
  'europe-lcc': '💸 Avrupa LCC',
  asia: '🏯 Asya',
  americas: '🗽 Amerika',
  oceania: '🦘 Okyanusya',
  africa: '🦁 Afrika',
};

export default async function AirlinesPage() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('airlines')
    .select('*')
    .order('prestige', { ascending: false })
    .limit(100);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Havayolları</h1>
          <p className="text-muted-foreground mt-1">{(data ?? []).length} havayolu</p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 bg-airspeak-navy/40 text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Yeni havayolu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data ?? []).map((a: any) => {
          const interviewCount = [
            a.pilot_interview,
            a.cabin_interview,
            a.technician_interview,
            a.ground_interview,
            a.student_interview,
          ].filter(Boolean).length;
          return (
            <div
              key={a.id}
              className="bg-white border border-border rounded-xl p-4 hover:border-airspeak-red transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{a.country_emoji ?? '🌍'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.iata_code ?? '—'} · {a.tier ?? '—'}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {REGION_LABEL[a.region] ?? a.region} · {a.fleet_size ?? '—'} uçak
              </p>
              <p className="text-xs">
                <span className="text-airspeak-red font-bold">{interviewCount}</span>/5 rol için interview
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

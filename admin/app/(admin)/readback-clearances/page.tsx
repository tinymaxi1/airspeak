import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/guard';
import { CreateReadbackButton } from '@/components/forms/ReadbackForm';
import { BulkPracticePanel, type PracticeRow } from '@/components/forms/BulkPracticePanel';

export default async function ReadbackClearancesPage() {
  const me = await requireAdmin();
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('readback_clearances')
    .select('*')
    .order('target_role', { ascending: true })
    .order('sort', { ascending: true })
    .limit(500);

  const rows: PracticeRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    slug: r.slug,
    level: r.level,
    target_role: r.target_role,
    status: r.status,
    summary: r.atc_utterance,
    meta: [r.station, r.freq].filter(Boolean).join(' · ') || r.category,
    raw: r,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Telsiz Tekrarı</h1>
          <p className="text-muted-foreground mt-1">
            {rows.length} clearance · ATC read-back drill bank
          </p>
        </div>
        <CreateReadbackButton label="Yeni clearance" />
      </div>

      <BulkPracticePanel
        table="readback_clearances"
        revalidate="/readback-clearances"
        rows={rows}
        columnHeaders={{ summary: 'ATC Utterance', meta: 'İstasyon · Freq' }}
        canDelete={me.admin_role === 'super_admin'}
      />
    </div>
  );
}

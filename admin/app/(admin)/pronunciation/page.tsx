import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/guard';
import { CreatePronunciationButton, EditPronunciationButton } from '@/components/forms/PronunciationForm';
import { StatusActions } from '@/components/forms/StatusActions';
import { BulkPracticePanel, type PracticeRow } from '@/components/forms/BulkPracticePanel';

export default async function PronunciationPage() {
  const me = await requireAdmin();
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('pronunciation_sentences')
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
    summary: r.text_en,
    meta: r.ipa || r.category,
    raw: r,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Telaffuz</h1>
          <p className="text-muted-foreground mt-1">
            {rows.length} cümle · phoneme-level pronunciation drill
          </p>
        </div>
        <CreatePronunciationButton label="Yeni cümle" />
      </div>

      <BulkPracticePanel
        table="pronunciation_sentences"
        revalidate="/pronunciation"
        rows={rows}
        columnHeaders={{ summary: 'Cümle (EN)', meta: 'IPA / Kategori' }}
        canDelete={me.admin_role === 'super_admin'}
        renderActions={(row) => (
          <>
            <EditPronunciationButton row={row.raw} />
            <StatusActions
              table="pronunciation_sentences"
              id={row.id}
              status={row.status}
              revalidate="/pronunciation"
              label={row.summary?.slice(0, 60)}
              canDelete={me.admin_role === 'super_admin'}
            />
          </>
        )}
      />
    </div>
  );
}

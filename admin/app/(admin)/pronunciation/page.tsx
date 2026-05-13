import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CreatePronunciationButton, EditPronunciationButton } from '@/components/forms/PronunciationForm';
import { StatusActions } from '@/components/forms/StatusActions';

export default async function PronunciationPage() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('pronunciation_sentences')
    .select('*')
    .order('target_role', { ascending: true })
    .order('sort', { ascending: true })
    .limit(500);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Telaffuz</h1>
          <p className="text-muted-foreground mt-1">
            {(data ?? []).length} cümle · phoneme-level pronunciation drill
          </p>
        </div>
        <CreatePronunciationButton label="Yeni cümle" />
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-20">Rol</th>
              <th className="px-4 py-3 text-left font-semibold w-16">Seviye</th>
              <th className="px-4 py-3 text-left font-semibold w-28">Kategori</th>
              <th className="px-4 py-3 text-left font-semibold">Cümle (EN)</th>
              <th className="px-4 py-3 text-left font-semibold w-32">IPA</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Durum</th>
              <th className="px-4 py-3 text-right font-semibold w-56">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((s: any) => (
              <tr key={s.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 text-xs uppercase tracking-wider">{s.target_role}</td>
                <td className="px-4 py-3 text-xs font-mono">{s.level ?? '—'}</td>
                <td className="px-4 py-3 text-xs">{s.category ?? '—'}</td>
                <td className="px-4 py-3">
                  <p className="text-sm line-clamp-2">{s.text_en}</p>
                </td>
                <td className="px-4 py-3 text-xs font-mono">{s.ipa ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <EditPronunciationButton row={s} />
                    <StatusActions
                      table="pronunciation_sentences"
                      id={s.id}
                      status={s.status}
                      revalidate="/pronunciation"
                      label={s.text_en?.slice(0, 60)}
                      canDelete
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Henüz cümle yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * /admin/banned-words — community_banned_words CRUD.
 */
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { CreateBannedWordButton } from '@/components/forms/BannedWordForm';
import { BannedWordRowActions } from '@/components/moderation/BannedWordRowActions';
import { Ban, AlertTriangle } from 'lucide-react';

const SEVERITY_COLOR: Record<string, string> = {
  block: 'bg-red-100 text-red-700',
  warn: 'bg-amber-100 text-amber-700',
};

const CATEGORY_LABEL: Record<string, string> = {
  profanity: 'Küfür',
  spam: 'Spam',
  hate: 'Nefret',
  pii: 'PII',
  other: 'Diğer',
};

export default async function BannedWordsPage() {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { data } = await (supabase as any)
    .from('community_banned_words')
    .select('id, word, severity, category, created_at')
    .order('created_at', { ascending: false });

  const rows = (data ?? []) as any[];
  const canDelete = profile.admin_role === 'super_admin';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Ban className="w-5 h-5 text-airspeak-red" />
            </div>
            <h1 className="text-3xl font-bold text-airspeak-navy">Yasaklı Kelimeler</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {rows.length} kelime · auto-mod create_post / create_comment'ta filtre eder
          </p>
        </div>
        <CreateBannedWordButton />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs flex gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
        <div>
          <strong>Word-boundary regex match.</strong> Lowercase saklanır, case-insensitive
          arama yapılır. <strong>Block</strong> = içerik yayınlanmaz; <strong>Warn</strong> =
          sessizce 'hidden' olur, mod queue'sunda görünür, kullanıcıya push gider.
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Kelime</th>
              <th className="px-4 py-3 text-left font-semibold w-28">Severity</th>
              <th className="px-4 py-3 text-left font-semibold w-28">Kategori</th>
              <th className="px-4 py-3 text-left font-semibold w-32">Eklenme</th>
              <th className="px-4 py-3 text-right font-semibold w-32">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Henüz yasaklı kelime yok.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-sm">{r.word}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${SEVERITY_COLOR[r.severity] ?? ''}`}
                    >
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{CATEGORY_LABEL[r.category] ?? r.category}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <BannedWordRowActions row={r} canDelete={canDelete} />
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

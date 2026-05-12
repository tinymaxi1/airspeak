/**
 * /admin/word-of-day — Word of the Day (Günün Kelimesi) yönetim listesi.
 * Sprint 14.D — Faz B.
 *
 * Mobile home ekranındaki 'GÜNÜN KELİMESİ' kartı bu tablodan rol bazlı çekilir.
 * get_word_of_today() RPC ile kullanıcının rolüne uygun bugünün içeriği döner.
 */
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { Sparkles } from 'lucide-react';
import { CreateWordOfDayButton } from '@/components/word-of-day/WordOfDayForm';
import { WordOfDayFilter } from '@/components/word-of-day/WordOfDayFilter';
import { WordOfDayRowActions } from '@/components/word-of-day/WordOfDayRowActions';

const ROLE_LABEL: Record<string, string> = {
  pilot: '✈ Pilot',
  atc: '🗼 ATC',
  cabin: '🎧 Kabin',
  technician: '⚙ Teknisyen',
  ground: '💼 Yer',
  student: '📖 Öğrenci',
};

const DIFFICULTY_BADGE: Record<string, string> = {
  basic: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
};

const CONTENT_TYPE_BADGE: Record<string, string> = {
  word: 'bg-airspeak-navy/10 text-airspeak-navy',
  phrase: 'bg-blue-100 text-blue-700',
  sentence: 'bg-purple-100 text-purple-700',
  dialogue: 'bg-orange-100 text-orange-700',
  tip: 'bg-gray-100 text-gray-700',
};

interface SearchParams {
  q?: string;
  role?: string;
  difficulty?: string;
  active?: string;
}

export default async function WordOfDayPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const profile = await requireAdminRole('reviewer');
  const sp = await searchParams;
  const supabase = createServiceClient();

  let query = (supabase as any)
    .from('word_of_the_day')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(500);

  if (sp.q) query = query.ilike('word_or_phrase', `%${sp.q}%`);
  if (sp.role) query = query.contains('target_roles', [sp.role]);
  if (sp.difficulty) query = query.eq('difficulty', sp.difficulty);
  if (sp.active === 'true') query = query.eq('is_active', true);
  if (sp.active === 'false') query = query.eq('is_active', false);

  const { data } = await query;
  const rows = (data ?? []) as any[];

  const { count: totalCount } = await (supabase as any)
    .from('word_of_the_day')
    .select('id', { count: 'exact', head: true });
  const { count: activeCount } = await (supabase as any)
    .from('word_of_the_day')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  const canDelete = profile.admin_role === 'super_admin';
  const canEdit = profile.admin_role === 'editor' || profile.admin_role === 'super_admin';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-airspeak-red/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-airspeak-red" />
            </div>
            <h1 className="text-3xl font-bold text-airspeak-navy">Günün Kelimesi</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {totalCount ?? 0} kayıt · {activeCount ?? 0} aktif · 6 rol için içerik
          </p>
        </div>
        {canEdit && <CreateWordOfDayButton />}
      </div>

      <WordOfDayFilter />

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Kelime / İfade</th>
              <th className="px-4 py-3 text-left font-semibold w-32">Tür</th>
              <th className="px-4 py-3 text-left font-semibold">Hedef Roller</th>
              <th className="px-4 py-3 text-left font-semibold w-40">Kategori</th>
              <th className="px-4 py-3 text-center font-semibold w-32">Zorluk</th>
              <th className="px-4 py-3 text-center font-semibold w-24">Aktif</th>
              <th className="px-4 py-3 text-right font-semibold w-36">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="font-semibold text-base">{row.word_or_phrase}</div>
                  {row.ipa && (
                    <div className="font-mono text-xs text-muted-foreground mt-0.5">
                      {row.ipa}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-md">
                    {row.definition_tr}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded font-semibold ${
                      CONTENT_TYPE_BADGE[row.content_type] ?? 'bg-gray-100'
                    }`}
                  >
                    {row.content_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(row.target_roles ?? []).map((r: string) => (
                      <span
                        key={r}
                        className="inline-block text-xs px-2 py-0.5 rounded bg-airspeak-navy/10 text-airspeak-navy"
                      >
                        {ROLE_LABEL[r] ?? r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{row.category}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded font-bold ${
                      DIFFICULTY_BADGE[row.difficulty] ?? ''
                    }`}
                  >
                    {row.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {row.is_active ? (
                    <span className="text-emerald-600 font-bold">✓</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <WordOfDayRowActions row={row} canDelete={canDelete} canEdit={canEdit} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  {sp.q || sp.role || sp.difficulty
                    ? 'Filtreyle eşleşen kayıt yok.'
                    : 'Henüz kayıt yok. "Yeni kelime" ile başla.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="bg-airspeak-gold/10 border border-airspeak-gold/40 rounded-xl p-5 text-sm space-y-2">
        <p className="font-semibold">💡 Günün Kelimesi nasıl çalışır?</p>
        <ul className="list-disc pl-5 text-xs space-y-1">
          <li>
            Mobile app home ekranında kullanıcının rolüne göre içerik gösterilir
            (<code className="text-xs">get_word_of_today()</code> RPC).
          </li>
          <li>
            Bir kelime birden fazla role atanabilir (örn 'cleared to land' atc+pilot).
          </li>
          <li>
            <strong>Scheduled date</strong> doluysa öncelikli — admin manuel atama.
          </li>
          <li>
            Yoksa: <code>day_of_year % role_word_count</code> deterministik rotation.
          </li>
          <li>
            Pasif (is_active=false) kayıtlar gösterilmez ama silinmez (geri aktive edilebilir).
          </li>
        </ul>
      </section>
    </div>
  );
}

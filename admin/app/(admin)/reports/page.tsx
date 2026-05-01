/**
 * /admin/reports — Content flags moderation queue.
 *
 * Tüm content_flags'i listeler, pending'i en üste taşır.
 * Filter parametreleri (URL): ?status=pending&type=community_post
 */
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { ReportRowActions } from '@/components/moderation/ReportRowActions';
import { ShieldAlert, Calendar } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  dismissed: 'bg-gray-100 text-gray-600',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Bekliyor',
  reviewed: 'İncelendi',
  resolved: 'Çözüldü',
  dismissed: 'Reddedildi',
};

const TYPE_LABEL: Record<string, string> = {
  community_post: 'Post',
  community_comment: 'Yorum',
  community_group: 'Grup',
  user_profile: 'Profil',
  interview_question: 'Mülakat',
  exam_question: 'Sınav',
  lesson_exercise: 'Egzersiz',
  vocabulary_term: 'Kelime',
  conversation_scenario: 'Senaryo',
  phraseology_entry: 'Frazeoloji',
  ai_response: 'AI cevap',
  other: 'Diğer',
};

const REASON_LABEL: Record<string, string> = {
  inaccurate: 'Yanlış',
  offensive: 'Saldırgan',
  copyright: 'Telif',
  spam: 'Spam',
  broken_audio: 'Bozuk ses',
  harassment: 'Taciz',
  misinformation: 'Yanlış bilgi',
  hate_speech: 'Nefret söylemi',
  sexual: 'Cinsel içerik',
  violence: 'Şiddet',
  self_harm: 'Kendine zarar',
  impersonation: 'Sahtekarlık',
  pii: 'Kişisel bilgi',
  illegal: 'Yasadışı',
  other: 'Diğer',
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  await requireAdminRole('reviewer');
  const supabase = createServiceClient();
  const params = await searchParams;
  const filterStatus = params.status ?? 'pending';
  const filterType = params.type;

  let q = (supabase as any)
    .from('content_flags')
    .select(
      'id, user_id, content_type, content_id, reason, comment, status, created_at, reviewed_at, reviewer_id, reviewer_note, reporter:profiles!content_flags_user_id_fkey(username, full_name)',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (filterStatus && filterStatus !== 'all') q = q.eq('status', filterStatus);
  if (filterType) q = q.eq('content_type', filterType);

  const { data } = await q;
  const rows = (data ?? []) as any[];

  // Pending count
  const { count: pendingCount } = await (supabase as any)
    .from('content_flags')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Reports Queue</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          {rows.length} kayıt · {pendingCount ?? 0} bekliyor
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {(['pending', 'all', 'resolved', 'dismissed'] as const).map((s) => (
          <a
            key={s}
            href={`/reports?status=${s}${filterType ? `&type=${filterType}` : ''}`}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-wide ${
              filterStatus === s
                ? 'bg-airspeak-navy text-white'
                : 'bg-white border border-border text-muted-foreground'
            }`}
          >
            {s === 'all' ? 'Tümü' : STATUS_LABEL[s] ?? s}
          </a>
        ))}
        <span className="border-r border-border mx-2" />
        {Object.entries(TYPE_LABEL)
          .filter(([t]) => t.startsWith('community_') || t === 'user_profile')
          .map(([t, label]) => (
            <a
              key={t}
              href={`/reports?status=${filterStatus}${filterType === t ? '' : `&type=${t}`}`}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                filterType === t
                  ? 'bg-airspeak-red text-white'
                  : 'bg-white border border-border text-muted-foreground'
              }`}
            >
              {label}
            </a>
          ))}
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-28">Tip</th>
              <th className="px-4 py-3 text-left font-semibold w-32">Sebep</th>
              <th className="px-4 py-3 text-left font-semibold">Yorum / Reporter</th>
              <th className="px-4 py-3 text-left font-semibold w-40">Tarih</th>
              <th className="px-4 py-3 text-left font-semibold w-28">Durum</th>
              <th className="px-4 py-3 text-right font-semibold w-44">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Bu filtreyle eşleşen kayıt yok.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                  <td className="px-4 py-3 text-xs">
                    <span className="font-mono">{TYPE_LABEL[r.content_type] ?? r.content_type}</span>
                    <div className="font-mono text-[10px] text-muted-foreground mt-1 truncate max-w-[100px]">
                      {String(r.content_id).slice(0, 12)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold">
                    {REASON_LABEL[r.reason] ?? r.reason}
                  </td>
                  <td className="px-4 py-3">
                    {r.comment && (
                      <div className="text-xs italic text-foreground line-clamp-2">"{r.comment}"</div>
                    )}
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {r.reporter?.full_name ?? r.reporter?.username ?? 'Anonim'}
                    </div>
                    {r.reviewer_note && (
                      <div className="text-[11px] text-emerald-700 mt-1">↪ {r.reviewer_note}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(r.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${STATUS_COLOR[r.status] ?? ''}`}
                    >
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ReportRowActions row={r} />
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

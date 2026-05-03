/**
 * /admin/translations — Çoklu dil yönetimi (Sprint 9.D)
 *
 * - Cost dashboard (toplam maliyet + çağrı sayısı + provider)
 * - Content type seçimi → o tablodaki content listesi + her satır 18 dil
 *   coverage % bar + "Çevir" butonu
 * - Eksik dilleri filtrele
 */
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { Languages, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import { TranslationsTable } from '@/components/translations/TranslationsTable';

const CONTENT_TYPES: Record<string, { table: string; titleField: string }> = {
  modules: { table: 'modules', titleField: 'title' },
  units: { table: 'units', titleField: 'title' },
  lessons: { table: 'lessons', titleField: 'title' },
  exercises: { table: 'exercises', titleField: 'prompt' },
  vocab_terms: { table: 'vocab_terms', titleField: 'term' },
  interview_questions: { table: 'interview_questions', titleField: 'question' },
  oral_prompts: { table: 'oral_prompts', titleField: 'prompt' },
  placement_questions: { table: 'placement_questions', titleField: 'question' },
  airlines: { table: 'airlines', titleField: 'title' },
};

const TARGET_LANG_COUNT = 18; // SUPPORTED_LOCALES \ {en, tr}

export default async function TranslationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; missing_only?: string }>;
}) {
  await requireAdminRole('editor');
  const sp = await searchParams;
  const supabase = createServiceClient();

  const contentType = sp.type ?? 'lessons';
  const meta = CONTENT_TYPES[contentType] ?? CONTENT_TYPES.lessons!;

  // Cost summary (app_config)
  const { data: configRows } = await (supabase as any)
    .from('app_config')
    .select('key, value')
    .in('key', ['ai.translation_provider', 'ai.translation_cost_total', 'ai.translation_calls']);
  const cfg = new Map<string, string>();
  for (const r of (configRows ?? []) as any[]) {
    cfg.set(r.key, String(r.value ?? '').replace(/^"|"$/g, ''));
  }
  const provider = cfg.get('ai.translation_provider') ?? 'mock';
  const costTotal = parseFloat(cfg.get('ai.translation_cost_total') ?? '0') || 0;
  const calls = parseInt(cfg.get('ai.translation_calls') ?? '0', 10) || 0;

  // Source rows (limited)
  const { data: rowsData } = await (supabase as any)
    .from(meta.table)
    .select(`id, ${meta.titleField}`)
    .order('created_at', { ascending: false })
    .limit(100);
  const rows = (rowsData ?? []) as any[];

  // Existing translations count per content_id (only this content_type)
  const { data: trans } = await (supabase as any)
    .from('content_translations')
    .select('content_id, language_code')
    .eq('content_type', contentType)
    .in('content_id', rows.map((r) => r.id).slice(0, 500));

  const transByContent = new Map<string, Set<string>>();
  for (const t of (trans ?? []) as any[]) {
    if (!transByContent.has(t.content_id)) transByContent.set(t.content_id, new Set());
    transByContent.get(t.content_id)!.add(t.language_code);
  }

  // Toplam coverage özeti
  const totalCells = rows.length * TARGET_LANG_COUNT;
  let filledCells = 0;
  for (const r of rows) {
    filledCells += transByContent.get(r.id)?.size ?? 0;
  }
  const coveragePct = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;

  let listRows = rows.map((r) => ({
    id: r.id,
    title: (r as any)[meta.titleField] ?? '(başlıksız)',
    coverage: transByContent.get(r.id)?.size ?? 0,
  }));

  if (sp.missing_only === '1') {
    listRows = listRows.filter((r) => r.coverage < TARGET_LANG_COUNT);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-airspeak-navy/10 flex items-center justify-center">
            <Languages className="w-5 h-5 text-airspeak-navy" />
          </div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Çeviri Yönetimi</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          {contentType} · {rows.length} kayıt · 18 hedef dil · toplam coverage {coveragePct}%
        </p>
      </div>

      {/* Cost dashboard */}
      <div className="grid grid-cols-3 gap-4">
        <Stat
          icon={<DollarSign className="w-5 h-5 text-emerald-700" />}
          label="Toplam Maliyet"
          value={`$${costTotal.toFixed(4)}`}
          sub={`Provider: ${provider}`}
        />
        <Stat
          icon={<Activity className="w-5 h-5 text-blue-700" />}
          label="Çağrı Sayısı"
          value={calls.toString()}
          sub="translate-content edge fn"
        />
        <Stat
          icon={<AlertTriangle className="w-5 h-5 text-amber-700" />}
          label="Eksik Dil Bucket"
          value={`${rows.length * TARGET_LANG_COUNT - filledCells}`}
          sub={`${TARGET_LANG_COUNT} dil × ${rows.length} kayıt = ${totalCells} hücre`}
        />
      </div>

      {provider === 'mock' && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm">
          <strong>⚠ Provider mock</strong> — Gerçek çeviri için Settings &gt; AI &gt;
          translation_provider'ı &quot;claude&quot; yap ve Anthropic API key gir.
        </div>
      )}

      {/* Type tabs + filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold mr-2">Tip:</span>
        {Object.keys(CONTENT_TYPES).map((t) => (
          <Link
            key={t}
            href={`/translations?type=${t}${sp.missing_only ? '&missing_only=1' : ''}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
              contentType === t
                ? 'bg-airspeak-navy text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {t}
          </Link>
        ))}
        <Link
          href={`/translations?type=${contentType}${sp.missing_only === '1' ? '' : '&missing_only=1'}`}
          className={`ml-auto px-3 py-1.5 rounded-lg text-sm font-semibold ${
            sp.missing_only === '1'
              ? 'bg-airspeak-red text-white'
              : 'border border-border hover:bg-secondary'
          }`}
        >
          {sp.missing_only === '1' ? '× Tümü göster' : 'Sadece eksik'}
        </Link>
      </div>

      <TranslationsTable
        contentType={contentType}
        rows={listRows}
        targetLangCount={TARGET_LANG_COUNT}
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-bold text-airspeak-navy mt-2">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

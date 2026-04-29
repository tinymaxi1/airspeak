import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/guard';
import { ArrowLeft } from 'lucide-react';
import { relativeTime } from '@/lib/utils';

interface Revision {
  id: string;
  table_name: string;
  row_id: string;
  snapshot: Record<string, any>;
  status_before: string | null;
  status_after: string | null;
  created_by: string | null;
  created_at: string;
}

export default async function RevisionsPage({
  params,
}: {
  params: Promise<{ table: string; id: string }>;
}) {
  await requireAdmin();
  const { table, id } = await params;
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('content_revisions')
    .select('*')
    .eq('table_name', table)
    .eq('row_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  const revisions: Revision[] = data ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href="/audit"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Audit
        </Link>
        <h1 className="text-3xl font-bold text-airspeak-navy">
          Revizyonlar — <span className="font-mono text-base">{table}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {revisions.length} snapshot · ID {id.slice(0, 8)}…
        </p>
      </div>

      <div className="space-y-4">
        {revisions.map((r, idx) => {
          const next = revisions[idx + 1];
          const diff = computeDiff(r.snapshot, next?.snapshot);
          return (
            <div key={r.id} className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm">
                  <p className="font-semibold">v{revisions.length - idx}</p>
                  <p className="text-xs text-muted-foreground">{relativeTime(r.created_at)}</p>
                </div>
                {r.status_before && r.status_after && r.status_before !== r.status_after && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold">
                    {r.status_before} → {r.status_after}
                  </span>
                )}
              </div>

              {diff.length === 0 ? (
                <p className="text-xs text-muted-foreground">Önceki revizyonla aynı içerik</p>
              ) : (
                <div className="space-y-2">
                  {diff.slice(0, 8).map((d) => (
                    <div key={d.key} className="text-xs font-mono">
                      <p className="text-muted-foreground">{d.key}</p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-destructive/10 p-2 rounded line-clamp-3">
                          <span className="text-destructive opacity-70">- </span>
                          {String(d.before ?? '(yok)').slice(0, 200)}
                        </div>
                        <div className="bg-airspeak-green/10 p-2 rounded line-clamp-3">
                          <span className="text-emerald-700 opacity-70">+ </span>
                          {String(d.after ?? '(yok)').slice(0, 200)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {diff.length > 8 && (
                    <p className="text-xs text-muted-foreground">… +{diff.length - 8} alan daha</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {revisions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Henüz revizyon yok.</div>
        )}
      </div>
    </div>
  );
}

function computeDiff(
  current: Record<string, any> | undefined,
  previous: Record<string, any> | undefined,
): { key: string; before: any; after: any }[] {
  if (!previous) return [];
  const out: { key: string; before: any; after: any }[] = [];
  const keys = new Set([...Object.keys(current ?? {}), ...Object.keys(previous ?? {})]);
  for (const k of keys) {
    const a = (current ?? {})[k];
    const b = (previous ?? {})[k];
    const aS = JSON.stringify(a);
    const bS = JSON.stringify(b);
    if (aS !== bS) {
      // Skip auto kolonlar
      if (k === 'updated_at' || k === 'created_at') continue;
      out.push({ key: k, before: b, after: a });
    }
  }
  return out;
}

/**
 * /admin/app-releases — App release notu listesi + ekleme formu
 *
 * Server Component list + CreateReleaseButton (client).
 * Her insert → DB trigger → release-broadcast edge function → push gönderir.
 */
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { CreateReleaseButton } from './CreateReleaseButton';
import { ResendButton } from './ResendButton';

interface ReleaseRow {
  id: string;
  version: string;
  released_at: string;
  changes_tr: { emoji: string; title: string; description: string }[];
  changes_en: { emoji: string; title: string; description: string }[];
  mandatory: boolean;
  push_sent_at: string | null;
  created_at: string;
}

export default async function AppReleasesPage() {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const { data: releases } = await (supabase as any)
    .from('app_releases')
    .select('*')
    .order('released_at', { ascending: false })
    .limit(50);

  const rows: ReleaseRow[] = (releases ?? []) as ReleaseRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-airspeak-navy">App Releases</h1>
          <p className="text-sm text-airspeak-muted">
            Her yeni OTA sonrası release notu ekle. Mobile'de "yenilikler" sheet'i
            otomatik açılır + tüm kullanıcılara push bildirim gider.
          </p>
        </div>
        <CreateReleaseButton />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-airspeak-border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-airspeak-border text-sm">
          <thead className="bg-airspeak-paper-soft text-airspeak-muted uppercase tracking-wider text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Version</th>
              <th className="px-4 py-3 text-left">Released</th>
              <th className="px-4 py-3 text-center">Push</th>
              <th className="px-4 py-3 text-center">Mandatory</th>
              <th className="px-4 py-3 text-left">TR / EN değişiklik</th>
              <th className="px-4 py-3 text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-airspeak-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-airspeak-muted">
                  Henüz release notu yok. Sağ üstten ilkini ekle.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-airspeak-paper-soft/40">
                  <td className="px-4 py-3 font-mono font-bold text-airspeak-navy">v{r.version}</td>
                  <td className="px-4 py-3 text-airspeak-muted">
                    {new Date(r.released_at).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.push_sent_at ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        ✓ Gönderildi
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Bekliyor
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.mandatory ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        Zorunlu
                      </span>
                    ) : (
                      <span className="text-airspeak-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-airspeak-muted">
                    {r.changes_tr?.length ?? 0} TR / {r.changes_en?.length ?? 0} EN
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ResendButton releaseId={r.id} version={r.version} />
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

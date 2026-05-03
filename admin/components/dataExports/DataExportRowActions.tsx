'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { processDataExport, markDataExportFailed } from '@/lib/dataExports/actions';

export function DataExportRowActions({ row }: { row: any }) {
  const [busy, setBusy] = useState(false);

  if (row.status === 'sent' || row.status === 'ready') {
    return (
      <span className="text-xs text-muted-foreground">
        ✓ {row.file_url?.startsWith('local-download:') ? row.file_url.slice(15) : 'tamam'}
      </span>
    );
  }

  if (row.status === 'failed') {
    return (
      <button
        onClick={() => handleProcess()}
        disabled={busy}
        className="text-xs px-3 py-1.5 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 font-semibold"
      >
        Tekrar dene
      </button>
    );
  }

  return (
    <button
      onClick={() => handleProcess()}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-airspeak-navy text-white hover:bg-airspeak-navy/90 font-semibold disabled:opacity-50"
    >
      {busy ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          İşleniyor…
        </>
      ) : (
        <>
          <Download className="w-3 h-3" />
          İşle & İndir
        </>
      )}
    </button>
  );

  async function handleProcess() {
    setBusy(true);
    try {
      const r = await processDataExport(row.id);
      if (!r.ok || !r.dataUrl || !r.filename) {
        await markDataExportFailed(row.id, r.error ?? 'Bilinmeyen hata');
        alert('Hata: ' + (r.error ?? 'işlenemedi'));
        return;
      }
      // Browser download trigger
      const a = document.createElement('a');
      a.href = r.dataUrl;
      a.download = r.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      alert(
        `Dosya indirildi: ${r.filename}\n\nDestek ekibine ileterek kullanıcıya gönderebilirsiniz.`,
      );
      // Server'da revalidatePath çalıştı; sayfa refresh
      window.location.reload();
    } catch (e: any) {
      alert('Hata: ' + (e?.message ?? 'bilinmeyen'));
    } finally {
      setBusy(false);
    }
  }
}

import { requireAdminRole } from '@/lib/auth/guard';
import { ImportPanel } from '@/components/import/ImportPanel';
import { FileJson } from 'lucide-react';

export default async function ImportPage() {
  await requireAdminRole('super_admin');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-airspeak-navy/10 flex items-center justify-center">
            <FileJson className="w-5 h-5 text-airspeak-navy" />
          </div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Bulk Import</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          JSON dosyasından toplu içerik yükleme. Sadece <span className="font-semibold">super_admin</span> erişimi.
          Tüm satırlar <span className="font-semibold">draft</span> olarak eklenir, manuel publish gerekir.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Şema referansı:{' '}
          <code className="bg-secondary px-1 rounded">docs/IMPORT_SCHEMAS.md</code>
        </p>
      </div>

      <ImportPanel />
    </div>
  );
}

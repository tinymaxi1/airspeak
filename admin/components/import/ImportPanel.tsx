'use client';

/**
 * Bulk Import paneli — file picker + preview + validate + import.
 *
 * Akış:
 *   1. Tablo seç (6)
 *   2. JSON dosyası bırak / seç (max 5MB)
 *   3. Parse + ilk 5 satır preview
 *   4. "Doğrula" → /api/import/{table}?dryRun=true
 *   5. Hatalar listelenir veya "✓ N satır geçerli"
 *   6. Geçerliyse "İçeri aktar" → confirm → POST → toast + refresh
 */
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Label, Select } from '@/components/ui/Input';
import {
  IMPORT_TABLES,
  TABLE_LABEL,
  type ImportTable,
} from '@/lib/import/schemas';
import { Upload, FileJson, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface RowError {
  row: number;
  message: string;
  detail?: string;
}

type ValidationState =
  | { kind: 'idle' }
  | { kind: 'valid'; count: number }
  | { kind: 'errors'; errors: RowError[] };

const MAX_BYTES = 5 * 1024 * 1024;

export function ImportPanel() {
  const router = useRouter();
  const [table, setTable] = useState<ImportTable>('vocab_terms');
  const [rows, setRows] = useState<unknown[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationState>({ kind: 'idle' });
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setRows(null);
    setFileName(null);
    setValidation({ kind: 'idle' });
    if (inputRef.current) inputRef.current.value = '';
  }

  async function readFile(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error(`Dosya ${(file.size / 1024 / 1024).toFixed(1)} MB — max 5 MB`);
      return;
    }
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e: any) {
      toast.error(`JSON parse hatası: ${e.message}`);
      return;
    }
    if (!Array.isArray(parsed)) {
      toast.error("JSON top-level 'array' olmalı: [{...}, {...}]");
      return;
    }
    if (parsed.length === 0) {
      toast.error('Dosyada satır yok');
      return;
    }
    if (parsed.length > 5000) {
      toast.error(`${parsed.length} satır — max 5000, dosyayı böl`);
      return;
    }
    setRows(parsed);
    setFileName(file.name);
    setValidation({ kind: 'idle' });
    toast.success(`${parsed.length} satır okundu`);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void readFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void readFile(f);
  }

  function callImport(dryRun: boolean) {
    if (!rows) return;
    startTransition(async () => {
      const res = await fetch(`/api/import/${table}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rows, dryRun }),
      });
      const json = await res.json();
      if (json.ok) {
        if (dryRun) {
          setValidation({ kind: 'valid', count: json.validCount ?? rows.length });
          toast.success(`✓ ${json.validCount} satır geçerli`);
        } else {
          toast.success(`${json.inserted} satır taslak olarak eklendi`);
          reset();
          router.refresh();
        }
      } else {
        setValidation({ kind: 'errors', errors: json.errors ?? [] });
        toast.error(`${(json.errors ?? []).length} satırda hata`);
      }
    });
  }

  function commit() {
    if (validation.kind !== 'valid') return;
    const ok = window.confirm(
      `${validation.count} satır "${TABLE_LABEL[table]}" tablosuna taslak olarak eklenecek. Devam?`,
    );
    if (!ok) return;
    callImport(false);
  }

  return (
    <div className="space-y-6">
      {/* Tablo seçici */}
      <div className="bg-white border border-border rounded-xl p-5 space-y-4">
        <div>
          <Label required>Hedef tablo</Label>
          <Select
            value={table}
            onChange={(e) => {
              setTable(e.target.value as ImportTable);
              setValidation({ kind: 'idle' });
            }}
          >
            {IMPORT_TABLES.map((t) => (
              <option key={t} value={t}>
                {TABLE_LABEL[t]} — {t}
              </option>
            ))}
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Tüm satırlar <span className="font-semibold">draft</span> durumunda eklenir. Yayına
            almak için sonradan manuel publish gerekir.
          </p>
        </div>

        {/* File picker / drag-drop */}
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={onInputChange}
        />

        {!fileName ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-airspeak-red bg-airspeak-red/5'
                : 'border-border bg-secondary/30 hover:border-airspeak-navy/50'
            }`}
          >
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-semibold mt-2">JSON dosyası bırak ya da tıkla</p>
            <p className="text-xs text-muted-foreground mt-1">Max 5 MB · Top-level array</p>
          </button>
        ) : (
          <div className="border border-border rounded-lg p-3 bg-secondary/30 flex items-center gap-3">
            <FileJson className="w-5 h-5 text-airspeak-navy" />
            <div className="flex-1">
              <p className="text-sm font-semibold truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">{rows?.length} satır</p>
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={reset}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Action butonları */}
        {rows && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => callImport(true)}
              disabled={isPending}
              className="flex-1"
            >
              {isPending && validation.kind === 'idle' ? 'Doğrulanıyor…' : 'Doğrula'}
            </Button>
            <Button
              type="button"
              variant="green"
              onClick={commit}
              disabled={isPending || validation.kind !== 'valid'}
              className="flex-1"
            >
              {isPending && validation.kind === 'valid' ? 'Aktarılıyor…' : 'İçeri aktar'}
            </Button>
          </div>
        )}
      </div>

      {/* Preview */}
      {rows && rows.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-2">İlk {Math.min(5, rows.length)} satır preview</h3>
          <pre className="text-xs bg-secondary/50 rounded p-3 overflow-x-auto max-h-72 font-mono">
            {JSON.stringify(rows.slice(0, 5), null, 2)}
          </pre>
          {rows.length > 5 && (
            <p className="text-xs text-muted-foreground mt-2">
              … ve {rows.length - 5} satır daha
            </p>
          )}
        </div>
      )}

      {/* Validation sonucu */}
      {validation.kind === 'valid' && (
        <div className="bg-emerald-50 border border-airspeak-green/40 rounded-xl p-4 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-airspeak-green shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-900">{validation.count} satır geçerli</p>
            <p className="text-sm text-emerald-800 mt-1">
              "İçeri aktar" butonuyla draft olarak kaydedilebilir.
            </p>
          </div>
        </div>
      )}

      {validation.kind === 'errors' && (
        <div className="bg-red-50 border border-airspeak-red/40 rounded-xl p-4">
          <div className="flex gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-airspeak-red shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">
                {validation.errors.length} satırda hata
              </p>
              <p className="text-sm text-red-800 mt-1">
                Düzelt ve tekrar doğrula.
              </p>
            </div>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {validation.errors.slice(0, 50).map((e, i) => (
              <div
                key={i}
                className="text-xs bg-white border border-red-200 rounded p-2 font-mono"
              >
                <span className="font-semibold text-airspeak-red">
                  Satır {e.row >= 0 ? e.row + 1 : '—'}:
                </span>{' '}
                {e.message}
                {e.detail && (
                  <div className="text-muted-foreground mt-1">{e.detail}</div>
                )}
              </div>
            ))}
            {validation.errors.length > 50 && (
              <p className="text-xs text-muted-foreground">
                … ve {validation.errors.length - 50} hata daha (ilk 50 gösteriliyor)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

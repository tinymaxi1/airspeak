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
  section?: 'vocab' | 'exercises';
}

// Sprint 10.C — bundle import için pseudo-table sentinel
const BUNDLE_KEY = '__lesson_bundle__';
type TableOrBundle = ImportTable | typeof BUNDLE_KEY;

// Sprint 10.E — bundle artık array; tek object eski format için backward compat
const BUNDLE_SAMPLE = [
  {
    lesson_slug: 'tech-m1-u01-l1',
    vocab: [
      {
        term: 'engine',
        term_tr: 'motor',
        definition: 'A machine that converts fuel into mechanical motion.',
        example: 'The engine produces 30,000 lbs of thrust.',
        difficulty: 2,
      },
    ],
    exercises: [
      {
        sort: 0,
        type: 'matching',
        prompt_tr: 'Eşleştir: parçalar — fonksiyonlar',
        pairs: [
          { id: 'p1', left: 'Aileron', right: 'Roll control' },
          { id: 'p2', left: 'Elevator', right: 'Pitch control' },
        ],
        difficulty: 2,
      },
    ],
  },
  {
    lesson_slug: 'tech-m1-u01-l2',
    vocab: [],
    exercises: [
      {
        sort: 0,
        type: 'true_false',
        prompt_tr: 'Mayday üç kez tekrar edilmelidir.',
        is_true: true,
        difficulty: 1,
      },
      {
        sort: 1,
        type: 'ordering',
        prompt_tr: 'Pre-flight check sırası',
        options: [
          { id: 'o1', text: 'Walkaround' },
          { id: 'o2', text: 'Cockpit setup' },
          { id: 'o3', text: 'Engine start' },
        ],
        correct_order: ['o1', 'o2', 'o3'],
        difficulty: 2,
      },
    ],
  },
];

type ValidationState =
  | { kind: 'idle' }
  | { kind: 'valid'; count: number }
  | { kind: 'errors'; errors: RowError[] };

const MAX_BYTES = 5 * 1024 * 1024;

export function ImportPanel() {
  const router = useRouter();
  const [table, setTable] = useState<TableOrBundle>('vocab_terms');
  const [rows, setRows] = useState<unknown[] | null>(null);
  const [bundleData, setBundleData] = useState<any | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationState>({ kind: 'idle' });
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBundle = table === BUNDLE_KEY;

  function reset() {
    setRows(null);
    setBundleData(null);
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

    if (isBundle) {
      // Bundle: top-level Array (önerilen) veya tek Object (backward compat)
      let arr: any[];
      if (Array.isArray(parsed)) {
        arr = parsed;
      } else if (parsed && typeof parsed === 'object') {
        arr = [parsed];
      } else {
        toast.error("Bundle JSON 'array' veya 'object' olmalı");
        return;
      }

      if (arr.length === 0) {
        toast.error('Bundle: en az 1 lesson bundle gerekli');
        return;
      }

      let totalV = 0;
      let totalE = 0;
      for (let i = 0; i < arr.length; i++) {
        const obj = arr[i];
        if (!obj || typeof obj !== 'object') {
          toast.error(`Bundle[${i}]: object olmalı`);
          return;
        }
        if (!obj.lesson_slug || typeof obj.lesson_slug !== 'string') {
          toast.error(`Bundle[${i}]: 'lesson_slug' (string) zorunlu`);
          return;
        }
        totalV += Array.isArray(obj.vocab) ? obj.vocab.length : 0;
        totalE += Array.isArray(obj.exercises) ? obj.exercises.length : 0;
      }

      if (totalV + totalE === 0) {
        toast.error('Bundle: en az 1 vocab veya 1 exercise gerekli');
        return;
      }
      if (totalV + totalE > 5000) {
        toast.error(`${totalV + totalE} toplam — max 5000`);
        return;
      }

      setBundleData(arr);
      setRows(null);
      setFileName(file.name);
      setValidation({ kind: 'idle' });
      toast.success(`${arr.length} bundle · ${totalV} vocab · ${totalE} exercise`);
      return;
    }

    // Standart per-table mode: top-level Array
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
    setBundleData(null);
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
    startTransition(async () => {
      // BUNDLE MODE — POST /api/import/lesson-bundle (dryRun support yok, direkt commit)
      if (isBundle) {
        if (!bundleData) return;
        // bundleData artık array (tek object da array'e wrap edildi readFile'da)
        const arr: any[] = Array.isArray(bundleData) ? bundleData : [bundleData];
        let totalV = 0;
        let totalE = 0;
        for (const b of arr) {
          totalV += (b.vocab ?? []).length;
          totalE += (b.exercises ?? []).length;
        }
        if (dryRun) {
          // Pre-parse OK
          setValidation({ kind: 'valid', count: totalV + totalE });
          toast.success(`✓ ${arr.length} bundle · ${totalV} vocab · ${totalE} exercise`);
          return;
        }
        const res = await fetch('/api/import/lesson-bundle', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(bundleData),
        });
        const json = await res.json();
        if (json.ok) {
          toast.success(
            `${(json.bundles ?? []).length} bundle eklendi: ${json.total_vocab} vocab · ${json.total_exercises} exercise`,
          );
          reset();
          router.refresh();
        } else {
          setValidation({ kind: 'errors', errors: json.errors ?? [] });
          toast.error(`${(json.errors ?? []).length} hata`);
        }
        return;
      }

      // STANDART MODE
      if (!rows) return;
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
    const label = isBundle ? 'Lesson Bundle' : TABLE_LABEL[table as ImportTable];
    const ok = window.confirm(
      `${validation.count} satır "${label}" olarak eklenecek (draft). Devam?`,
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
              setTable(e.target.value as TableOrBundle);
              reset();
            }}
          >
            <option value={BUNDLE_KEY}>📦 Lesson Bundle — vocab + exercises tek dosya</option>
            <optgroup label="Tek tablo">
              {IMPORT_TABLES.map((t) => (
                <option key={t} value={t}>
                  {TABLE_LABEL[t]} — {t}
                </option>
              ))}
            </optgroup>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Tüm satırlar <span className="font-semibold">draft</span> durumunda eklenir. Yayına
            almak için sonradan manuel publish gerekir.
          </p>
          {isBundle && (
            <div className="mt-3 bg-airspeak-gold/10 border border-airspeak-gold/40 rounded-lg p-3 text-xs space-y-1">
              <p className="font-semibold">📦 Lesson Bundle modu</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Array: <code>[{'{'}lesson_slug, vocab[], exercises[]{'}'}, ...]</code> (çoklu bundle)</li>
                <li>Tek bundle için object da kabul edilir (backward compat)</li>
                <li>Tüm lesson_slug'lar DB'de mevcut olmalı (önce manuel veya tree'den oluştur)</li>
                <li>Vocab + exercises bundle başına ardışık insert; hata olursa tümü rollback</li>
                <li>Yeni tipler: <code>matching</code> (pairs), <code>ordering</code> (correct_order), <code>true_false</code> (is_true)</li>
              </ul>
              <button
                type="button"
                onClick={() => setShowSample((s) => !s)}
                className="text-airspeak-navy underline mt-1"
              >
                {showSample ? 'Örnek JSON\'u gizle' : 'Örnek JSON\'u göster'}
              </button>
              {showSample && (
                <pre className="mt-2 bg-white border border-border rounded p-2 overflow-x-auto max-h-72 text-[11px] font-mono leading-relaxed">
                  {JSON.stringify(BUNDLE_SAMPLE, null, 2)}
                </pre>
              )}
            </div>
          )}
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
        {(rows || bundleData) && (
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

      {/* Preview — standart mod */}
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

      {/* Preview — bundle mod (array of bundles) */}
      {bundleData && (
        <div className="bg-white border border-border rounded-xl p-5">
          {(() => {
            const arr: any[] = Array.isArray(bundleData) ? bundleData : [bundleData];
            const totalV = arr.reduce((sum, b) => sum + ((b.vocab ?? []).length), 0);
            const totalE = arr.reduce((sum, b) => sum + ((b.exercises ?? []).length), 0);
            return (
              <>
                <h3 className="font-semibold mb-2">
                  Bundle preview — {arr.length} bundle · {totalV} vocab · {totalE} exercise
                </h3>
                <div className="bg-secondary/30 rounded p-3 mb-3">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground border-b border-border">
                      <tr>
                        <th className="text-left py-1 pr-3">#</th>
                        <th className="text-left py-1 pr-3">lesson_slug</th>
                        <th className="text-right py-1 pr-3">vocab</th>
                        <th className="text-right py-1">exercise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arr.slice(0, 20).map((b: any, i: number) => (
                        <tr key={i} className="border-b border-border last:border-b-0">
                          <td className="py-1 pr-3 text-muted-foreground">{i + 1}</td>
                          <td className="py-1 pr-3 font-mono">{b.lesson_slug}</td>
                          <td className="py-1 pr-3 text-right font-mono">
                            {(b.vocab ?? []).length}
                          </td>
                          <td className="py-1 text-right font-mono">
                            {(b.exercises ?? []).length}
                          </td>
                        </tr>
                      ))}
                      {arr.length > 20 && (
                        <tr>
                          <td colSpan={4} className="py-2 text-xs text-muted-foreground text-center">
                            … ve {arr.length - 20} bundle daha
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <pre className="text-xs bg-secondary/50 rounded p-3 overflow-x-auto max-h-72 font-mono">
                  {JSON.stringify(bundleData, null, 2).slice(0, 2000)}
                  {JSON.stringify(bundleData, null, 2).length > 2000 ? '\n…' : ''}
                </pre>
              </>
            );
          })()}
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

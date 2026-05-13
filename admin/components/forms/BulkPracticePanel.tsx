'use client';

/**
 * BulkPracticePanel — Sprint C3c
 *
 * 3 practice content sayfasında (readback / pronunciation / listen-solve) ortak:
 * - Status / role / level filter chips
 * - Checkbox list (per row + "select all")
 * - Bulk actions: publish / draft / archive / delete (admin only)
 *
 * Server-side rendered rows + client-side filter + bulk action.
 */
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { bulkSetStatus, bulkDelete } from '@/lib/content/bulk-actions';
import { toast } from 'sonner';
import { Send, Archive, Trash2, RotateCcw, CheckSquare, Square } from 'lucide-react';
import type { ContentTable } from '@/lib/content/actions';
import { EditReadbackButton } from '@/components/forms/ReadbackForm';
import { EditPronunciationButton } from '@/components/forms/PronunciationForm';
import { EditListenSolveButton } from '@/components/forms/ListenSolveForm';
import { StatusActions } from '@/components/forms/StatusActions';

type Status = 'draft' | 'published' | 'archived';

export interface PracticeRow {
  id: string;
  slug: string;
  level: string | null;
  target_role: string;
  status: Status;
  /** Tablo özel: özet metni (utterance / text_en / question_tr ilk N char) */
  summary: string;
  /** Listede gösterilen ekstra meta (istasyon / IPA / kategori) */
  meta?: string | null;
  /** Eski row pointer — child edit button için */
  raw: any;
}

const ROLES = ['all', 'pilot', 'atc', 'cabin', 'technician', 'ground', 'student', 'dispatcher'] as const;
const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const STATUSES: { id: 'all' | Status; label: string; color: string }[] = [
  { id: 'all', label: 'Hepsi', color: 'bg-secondary text-foreground' },
  { id: 'draft', label: 'Taslak', color: 'bg-amber-100 text-amber-800' },
  { id: 'published', label: 'Yayında', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'archived', label: 'Arşiv', color: 'bg-zinc-100 text-zinc-700' },
];

interface Props {
  table: ContentTable;
  revalidate: string;
  rows: PracticeRow[];
  /** Kolon başlıkları + meta label */
  columnHeaders: { summary: string; meta: string };
  /** Super admin? — bulk delete için */
  canDelete?: boolean;
}

/** Tablo bazlı per-row action render (client-side, Server function prop yasağına çare). */
function PracticeRowActions({
  table,
  row,
  revalidate,
  canDelete,
}: {
  table: ContentTable;
  row: PracticeRow;
  revalidate: string;
  canDelete: boolean;
}) {
  let editBtn: React.ReactNode = null;
  if (table === 'readback_clearances') editBtn = <EditReadbackButton row={row.raw} />;
  else if (table === 'pronunciation_sentences') editBtn = <EditPronunciationButton row={row.raw} />;
  else if (table === 'listen_solve_drills') editBtn = <EditListenSolveButton row={row.raw} />;
  return (
    <>
      {editBtn}
      <StatusActions
        table={table}
        id={row.id}
        status={row.status}
        revalidate={revalidate}
        label={row.summary?.slice(0, 60)}
        canDelete={canDelete}
      />
    </>
  );
}

export function BulkPracticePanel({
  table,
  revalidate,
  rows,
  columnHeaders,
  canDelete = false,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | typeof ROLES[number]>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | typeof LEVELS[number]>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (roleFilter !== 'all' && r.target_role !== roleFilter) return false;
      if (levelFilter !== 'all' && r.level !== levelFilter) return false;
      return true;
    });
  }, [rows, statusFilter, roleFilter, levelFilter]);

  // Counts per status (banner için)
  const counts = useMemo(() => {
    const c = { draft: 0, published: 0, archived: 0, total: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function toggleAll() {
    if (allVisibleSelected) {
      const next = new Set(selected);
      for (const r of filtered) next.delete(r.id);
      setSelected(next);
    } else {
      const next = new Set(selected);
      for (const r of filtered) next.add(r.id);
      setSelected(next);
    }
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function bulkUpdate(status: Status) {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      toast.error('Hiç satır seçilmedi');
      return;
    }
    startTransition(async () => {
      const r = await bulkSetStatus(table, ids, status, revalidate);
      if (r.ok) {
        const verb =
          status === 'published' ? 'yayınlandı' :
          status === 'draft' ? 'taslağa alındı' : 'arşivlendi';
        toast.success(`${r.data.updated} satır ${verb}`);
        clearSelection();
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  async function confirmDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    startTransition(async () => {
      const r = await bulkDelete(table, ids, revalidate);
      if (r.ok) {
        toast.success(`${r.data.deleted} satır silindi`);
        clearSelection();
        setDeleteConfirmOpen(false);
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Banner — toplam draft + yayında */}
      <div className="bg-airspeak-navy/5 border border-airspeak-navy/10 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">Toplam:</span>
          <span className="font-semibold">{counts.total}</span>
          <span className="text-amber-700">📝 {counts.draft} taslak</span>
          <span className="text-emerald-700">✓ {counts.published} yayında</span>
          {counts.archived > 0 && (
            <span className="text-zinc-500">📦 {counts.archived} arşiv</span>
          )}
        </div>
        {counts.draft > 0 && (
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className="text-xs text-airspeak-red hover:underline font-semibold"
          >
            Taslakları gör →
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status */}
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                statusFilter === s.id
                  ? 'border-airspeak-navy bg-airspeak-navy text-white'
                  : `${s.color} border-transparent hover:border-airspeak-navy/30`
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-border" />
        {/* Role */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-3 py-1 rounded-md text-xs border border-border bg-white"
        >
          <option value="all">Tüm roller</option>
          {ROLES.filter((r) => r !== 'all').map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {/* Level */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as any)}
          className="px-3 py-1 rounded-md text-xs border border-border bg-white"
        >
          <option value="all">Tüm seviyeler</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} / {rows.length} satır
        </span>
      </div>

      {/* Bulk action bar (sticky, sadece seçim varsa) */}
      {selected.size > 0 && (
        <div className="bg-airspeak-navy text-white rounded-lg px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow">
          <span className="font-semibold text-sm">
            {selected.size} satır seçildi
          </span>
          <div className="h-4 w-px bg-white/20" />
          <Button
            size="sm"
            variant="primary"
            onClick={() => bulkUpdate('published')}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Send className="w-3.5 h-3.5" /> Yayınla
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => bulkUpdate('draft')}
            disabled={isPending}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Taslak
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => bulkUpdate('archived')}
            disabled={isPending}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <Archive className="w-3.5 h-3.5" /> Arşivle
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isPending}
              className="bg-airspeak-red hover:bg-airspeak-red/90 text-white"
            >
              <Trash2 className="w-3.5 h-3.5" /> Sil
            </Button>
          )}
          <button
            type="button"
            onClick={clearSelection}
            className="text-xs text-white/70 hover:text-white ml-auto"
          >
            Temizle
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-3 py-3 w-10">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-airspeak-navy hover:text-airspeak-red"
                  title={allVisibleSelected ? 'Hepsini bırak' : 'Hepsini seç'}
                >
                  {allVisibleSelected ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-3 py-3 text-left font-semibold w-20">Rol</th>
              <th className="px-3 py-3 text-left font-semibold w-14">Seviye</th>
              <th className="px-3 py-3 text-left font-semibold">{columnHeaders.summary}</th>
              <th className="px-3 py-3 text-left font-semibold w-40">{columnHeaders.meta}</th>
              <th className="px-3 py-3 text-left font-semibold w-20">Durum</th>
              <th className="px-3 py-3 text-right font-semibold w-44">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className={`border-b border-border last:border-b-0 hover:bg-secondary/30 ${
                  selected.has(r.id) ? 'bg-airspeak-red/5' : ''
                }`}
              >
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleOne(r.id)}
                    className="text-airspeak-navy hover:text-airspeak-red"
                  >
                    {selected.has(r.id) ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-xs uppercase tracking-wider">{r.target_role}</td>
                <td className="px-3 py-2.5 text-xs font-mono">{r.level ?? '—'}</td>
                <td className="px-3 py-2.5">
                  <p className="text-sm line-clamp-1">{r.summary}</p>
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{r.meta ?? '—'}</td>
                <td className="px-3 py-2.5">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <PracticeRowActions
                      table={table}
                      row={r}
                      revalidate={revalidate}
                      canDelete={canDelete}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Filtreye uyan satır yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected.size} satır silinecek</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Audit log kayıt eder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={isPending}>
              İptal
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-airspeak-red hover:bg-airspeak-red/90 text-white"
            >
              {isPending ? 'Siliniyor…' : `Sil (${selected.size})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  const cfg = {
    draft: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'TASLAK' },
    published: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'YAYINDA' },
    archived: { bg: 'bg-zinc-100', text: 'text-zinc-600', label: 'ARŞİV' },
  }[status];
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wider ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

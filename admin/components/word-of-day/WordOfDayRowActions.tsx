'use client';

import { useState } from 'react';
import { Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { WordOfDayForm } from './WordOfDayForm';
import { deleteWordOfDay, toggleWordOfDayActive } from '@/lib/word-of-day/actions';

interface Props {
  row: any;
  canEdit: boolean;
  canDelete: boolean;
}

export function WordOfDayRowActions({ row, canEdit, canDelete }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    if (busy) return;
    setBusy(true);
    await toggleWordOfDayActive(row.id, !row.is_active);
    setBusy(false);
  }

  async function handleDelete() {
    if (busy) return;
    if (!confirm(`"${row.word_or_phrase}" kaydını silmek istediğinden emin misin? Geri alınamaz.`)) return;
    setBusy(true);
    await deleteWordOfDay(row.id);
    setBusy(false);
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {canEdit && (
        <button
          onClick={handleToggle}
          disabled={busy}
          className="p-1.5 rounded hover:bg-secondary disabled:opacity-50"
          title={row.is_active ? 'Pasifleştir' : 'Aktifleştir'}
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : row.is_active ? (
            <Eye className="w-4 h-4 text-emerald-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      )}
      {canEdit && (
        <button
          onClick={() => setEditOpen(true)}
          className="p-1.5 rounded hover:bg-secondary"
          title="Düzenle"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={busy}
          className="p-1.5 rounded hover:bg-red-50 text-red-600 disabled:opacity-50"
          title="Sil"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {editOpen && (
        <WordOfDayForm
          mode="edit"
          initial={row}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}

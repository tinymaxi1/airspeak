'use client';

import { useState } from 'react';
import { Trash2, Check, X } from 'lucide-react';
import { deleteGlossaryTerm, setGlossaryVerified } from '@/lib/glossary/actions';
import { EditGlossaryButton } from './GlossaryForm';

export function GlossaryRowActions({
  row,
  canDelete,
  canEdit,
}: {
  row: any;
  canDelete: boolean;
  canEdit: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function toggleVerified() {
    setBusy(true);
    await setGlossaryVerified(row.id, !row.is_verified);
    setBusy(false);
  }

  async function onDelete() {
    if (!confirm(`"${row.term_en}" silinsin mi?`)) return;
    setBusy(true);
    const r = await deleteGlossaryTerm(row.id);
    setBusy(false);
    if (!r.ok) alert('Hata: ' + r.error);
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {canEdit && (
        <button
          onClick={toggleVerified}
          disabled={busy}
          title={row.is_verified ? 'Doğrulamayı kaldır' : 'Doğrula'}
          className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1 ${
            row.is_verified
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          {row.is_verified ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
          {row.is_verified ? 'İptal' : 'Doğrula'}
        </button>
      )}
      {canEdit && <EditGlossaryButton row={row} />}
      {canDelete && (
        <button
          onClick={onDelete}
          disabled={busy}
          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 inline-flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

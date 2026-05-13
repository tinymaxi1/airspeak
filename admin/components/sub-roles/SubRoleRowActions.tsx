'use client';

/**
 * SubRoleRowActions — Edit / Toggle Active / Delete butonları.
 */
import { useState } from 'react';
import { Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { deleteSubRole, toggleSubRoleActive } from '@/lib/sub-roles/actions';
import { SubRoleForm } from './SubRoleForm';
import type { SubRolePayload } from '@/lib/sub-roles/actions';

interface Props {
  row: SubRolePayload & { id: string };
  canEdit: boolean;
  canDelete: boolean;
}

export function SubRoleRowActions({ row, canEdit, canDelete }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    setBusy(true);
    await toggleSubRoleActive(row.id, !row.active);
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirm(`"${row.id}" alt-rolü silmek istiyor musun?\n\nBu sub_role'u seçmiş kullanıcılar otomatik NULL'a düşer (parent role korunur).`)) {
      return;
    }
    setBusy(true);
    const result = await deleteSubRole(row.id);
    setBusy(false);
    if (!result.ok) alert(`Hata: ${result.error}`);
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {canEdit && (
        <button
          onClick={handleToggle}
          disabled={busy}
          title={row.active ? 'Pasif yap' : 'Aktif yap'}
          className="p-1.5 rounded hover:bg-secondary disabled:opacity-50"
        >
          {row.active ? (
            <ToggleRight className="w-4 h-4 text-emerald-600" />
          ) : (
            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      )}
      {canEdit && (
        <button
          onClick={() => setEditOpen(true)}
          disabled={busy}
          title="Düzenle"
          className="p-1.5 rounded hover:bg-secondary disabled:opacity-50"
        >
          <Pencil className="w-4 h-4 text-blue-600" />
        </button>
      )}
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={busy}
          title="Sil"
          className="p-1.5 rounded hover:bg-red-50 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 text-red-600" />
          )}
        </button>
      )}
      {editOpen && (
        <SubRoleForm mode="edit" initial={row} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
}

'use client';

/**
 * SubRolesTable — Drag-drop reorder destekli liste.
 *
 * Parent role filter URL param (?parent=pilot). Drag-drop ile display_order
 * batch update. dnd-kit/sortable kullanır.
 */
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GripVertical, Loader2 } from 'lucide-react';
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reorderSubRoles, type ParentRole, type SubRolePayload } from '@/lib/sub-roles/actions';
import { SubRoleRowActions } from './SubRoleRowActions';

type SubRoleRow = SubRolePayload & { id: string };

interface Props {
  rows: SubRoleRow[];
  canEdit: boolean;
  canDelete: boolean;
}

const PARENT_TABS: { id: ParentRole | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Tümü', emoji: '🌐' },
  { id: 'pilot', label: 'Pilot', emoji: '✈️' },
  { id: 'atc', label: 'ATC', emoji: '🗼' },
  { id: 'cabin', label: 'Kabin', emoji: '🎧' },
  { id: 'technician', label: 'Teknisyen', emoji: '⚙️' },
  { id: 'ground', label: 'Yer', emoji: '💼' },
  { id: 'student', label: 'Öğrenci', emoji: '📖' },
  { id: 'dispatcher', label: 'Dispatcher', emoji: '📊' },
];

export function SubRolesTable({ rows, canEdit, canDelete }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('parent') as ParentRole | null) ?? 'all';
  const [localRows, setLocalRows] = useState<SubRoleRow[]>(rows);
  const [reordering, startReorder] = useTransition();

  // Re-sync if server rows change (after revalidatePath)
  if (rows !== localRows && rows.length !== localRows.length) {
    setLocalRows(rows);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const filteredRows =
    activeTab === 'all' ? localRows : localRows.filter((r) => r.parent_role === activeTab);

  function setTab(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'all') params.delete('parent');
    else params.set('parent', tab);
    router.push(`/sub-roles?${params.toString()}`);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Drag sadece aynı parent_role içinde anlamlı — guard
    const activeRow = filteredRows.find((r) => r.id === active.id);
    const overRow = filteredRows.find((r) => r.id === over.id);
    if (!activeRow || !overRow || activeRow.parent_role !== overRow.parent_role) return;

    const oldIndex = filteredRows.findIndex((r) => r.id === active.id);
    const newIndex = filteredRows.findIndex((r) => r.id === over.id);
    const reordered = arrayMove(filteredRows, oldIndex, newIndex);

    // Yeni display_order'ları üret (0'dan başlayan)
    const updates = reordered.map((r, idx) => ({ id: r.id, display_order: idx }));

    // Optimistic UI — localRows içinde sadece bu parent_role'un sırasını güncelle
    const newLocal = localRows.map((r) => {
      if (r.parent_role !== activeRow.parent_role) return r;
      const upd = updates.find((u) => u.id === r.id);
      return upd ? { ...r, display_order: upd.display_order } : r;
    }).sort((a, b) => {
      if (a.parent_role !== b.parent_role) return a.parent_role.localeCompare(b.parent_role);
      return a.display_order - b.display_order;
    });
    setLocalRows(newLocal);

    startReorder(async () => {
      const result = await reorderSubRoles(updates);
      if (!result.ok) {
        alert(`Sıralama hatası: ${result.error}`);
        setLocalRows(rows); // server'a geri dön
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Parent role tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {PARENT_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count =
            tab.id === 'all'
              ? localRows.length
              : localRows.filter((r) => r.parent_role === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                isActive
                  ? 'bg-airspeak-navy text-white'
                  : 'bg-white border border-border text-airspeak-navy hover:bg-secondary'
              }`}
            >
              {tab.emoji} {tab.label}{' '}
              <span className={`ml-1 text-xs ${isActive ? 'opacity-80' : 'text-muted-foreground'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {reordering && (
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" /> Sıra kaydediliyor...
        </div>
      )}

      {/* Drag-drop table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 bg-secondary border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-1">Sıra</div>
          <div className="col-span-1">Icon</div>
          <div className="col-span-2">ID</div>
          <div className="col-span-2">Parent</div>
          <div className="col-span-2">İsim (TR)</div>
          <div className="col-span-2">İsim (EN)</div>
          <div className="col-span-1 text-center">Aktif</div>
          <div className="col-span-1 text-right">Aksiyon</div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={filteredRows.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredRows.length === 0 ? (
              <div className="px-4 py-12 text-center text-muted-foreground text-sm">
                {activeTab === 'all'
                  ? 'Henüz alt-rol yok. "+ Yeni alt-rol" ile başla.'
                  : `${activeTab} altında alt-rol yok.`}
              </div>
            ) : (
              filteredRows.map((row) => (
                <SortableRow
                  key={row.id}
                  row={row}
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              ))
            )}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function SortableRow({
  row,
  canEdit,
  canDelete,
}: {
  row: SubRoleRow;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const nameTr = row.names?.tr ?? '—';
  const nameEn = row.names?.en ?? '—';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-12 items-center px-4 py-3 border-b border-border last:border-b-0 hover:bg-secondary/30 text-sm"
    >
      <div className="col-span-1 flex items-center gap-2">
        {canEdit && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-muted-foreground hover:text-foreground"
            title="Sürükle ile sırala"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <span className="text-xs font-mono text-muted-foreground">{row.display_order}</span>
      </div>
      <div className="col-span-1 text-2xl">{row.icon ?? '·'}</div>
      <div className="col-span-2 font-mono text-xs">{row.id}</div>
      <div className="col-span-2 text-xs capitalize">{row.parent_role}</div>
      <div className="col-span-2 truncate font-semibold">{nameTr}</div>
      <div className="col-span-2 truncate text-muted-foreground">{nameEn}</div>
      <div className="col-span-1 text-center">
        {row.active ? (
          <span className="text-emerald-600 font-bold">✓</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      <div className="col-span-1">
        <SubRoleRowActions row={row} canEdit={canEdit} canDelete={canDelete} />
      </div>
    </div>
  );
}

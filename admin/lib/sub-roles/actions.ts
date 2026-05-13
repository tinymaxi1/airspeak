/**
 * Sub-Roles — Server actions (admin CRUD + reorder).
 * FAZ 2 — sub_roles tablo yönetimi.
 *
 * Tüm aksiyonlar:
 *  - requireAdminRole('editor') guard (delete super_admin)
 *  - admin_actions tablosuna audit log yazar
 *  - revalidatePath('/sub-roles') cache flush
 *
 * Not: sub_roles.id text tipinde (örn 'pilot_a320') ama admin_actions.row_id
 * uuid tipinde — text id metadata içine yazılır (sub_role_id field'ında).
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

export type ParentRole =
  | 'pilot' | 'atc' | 'cabin' | 'technician' | 'ground' | 'student' | 'dispatcher';

export interface SubRolePayload {
  id: string;
  parent_role: ParentRole;
  display_order: number;
  active: boolean;
  icon: string | null;
  names: Record<string, string>;          // 20 dil
  descriptions: Record<string, string> | null;
}

// ─── Validation ───────────────────────────────────────────────────────────
const ID_PATTERN = /^[a-z][a-z0-9_]{2,40}$/;
const PARENT_ROLES: ParentRole[] = ['pilot','atc','cabin','technician','ground','student','dispatcher'];

function validate(p: SubRolePayload): string | null {
  if (!ID_PATTERN.test(p.id)) {
    return 'ID kuralı: 3-40 karakter, küçük harf + rakam + _ (örn: pilot_a320)';
  }
  if (!PARENT_ROLES.includes(p.parent_role)) {
    return 'Geçersiz parent_role';
  }
  if (!p.names.tr?.trim() || !p.names.en?.trim()) {
    return 'TR ve EN isimleri zorunlu';
  }
  if (typeof p.display_order !== 'number' || p.display_order < 0) {
    return 'display_order >= 0 olmalı';
  }
  return null;
}

// ─── Create ───────────────────────────────────────────────────────────────
export async function createSubRole(payload: SubRolePayload) {
  const profile = await requireAdminRole('editor');
  const err = validate(payload);
  if (err) return { ok: false, error: err };

  const supabase = createServiceClient();
  const { error } = await (supabase as any).from('sub_roles').insert({
    id: payload.id,
    parent_role: payload.parent_role,
    display_order: payload.display_order,
    active: payload.active,
    icon: payload.icon,
    names: payload.names,
    descriptions: payload.descriptions,
  });
  if (error) return { ok: false, error: error.message };

  await (supabase as any).from('admin_actions').insert({
    actor_id: profile.id,
    action: 'create',
    table_name: 'sub_roles',
    metadata: {
      sub_role_id: payload.id,
      parent_role: payload.parent_role,
      name_tr: payload.names.tr,
      name_en: payload.names.en,
    },
  });

  revalidatePath('/sub-roles');
  return { ok: true, id: payload.id };
}

// ─── Update ───────────────────────────────────────────────────────────────
export async function updateSubRole(id: string, patch: Partial<SubRolePayload>) {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  // parent_role değiştirilemez (FK consistency)
  const updateBody: Record<string, unknown> = {};
  if (patch.display_order !== undefined) updateBody.display_order = patch.display_order;
  if (patch.active !== undefined) updateBody.active = patch.active;
  if (patch.icon !== undefined) updateBody.icon = patch.icon;
  if (patch.names !== undefined) {
    if (!patch.names.tr?.trim() || !patch.names.en?.trim()) {
      return { ok: false, error: 'TR ve EN isimleri zorunlu' };
    }
    updateBody.names = patch.names;
  }
  if (patch.descriptions !== undefined) updateBody.descriptions = patch.descriptions;

  if (Object.keys(updateBody).length === 0) {
    return { ok: false, error: 'Değişiklik yok' };
  }

  const { error } = await (supabase as any)
    .from('sub_roles')
    .update(updateBody)
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  await (supabase as any).from('admin_actions').insert({
    actor_id: profile.id,
    action: 'update',
    table_name: 'sub_roles',
    metadata: { sub_role_id: id, diff: updateBody },
  });

  revalidatePath('/sub-roles');
  return { ok: true };
}

// ─── Delete ───────────────────────────────────────────────────────────────
export async function deleteSubRole(id: string) {
  const profile = await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  // FK ON DELETE SET NULL — profile.sub_role null'a düşer otomatik
  const { error } = await (supabase as any).from('sub_roles').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  await (supabase as any).from('admin_actions').insert({
    actor_id: profile.id,
    action: 'delete',
    table_name: 'sub_roles',
    metadata: { sub_role_id: id },
  });

  revalidatePath('/sub-roles');
  return { ok: true };
}

// ─── Toggle active ────────────────────────────────────────────────────────
export async function toggleSubRoleActive(id: string, active: boolean) {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { error } = await (supabase as any)
    .from('sub_roles')
    .update({ active })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  await (supabase as any).from('admin_actions').insert({
    actor_id: profile.id,
    action: 'toggle_active',
    table_name: 'sub_roles',
    metadata: { sub_role_id: id, active },
  });

  revalidatePath('/sub-roles');
  return { ok: true };
}

// ─── Reorder (batch) ──────────────────────────────────────────────────────
export async function reorderSubRoles(items: { id: string; display_order: number }[]) {
  const profile = await requireAdminRole('editor');
  if (items.length === 0) return { ok: false, error: 'Boş liste' };

  const supabase = createServiceClient();
  // Birden fazla UPDATE — paralel
  const updates = items.map((item) =>
    (supabase as any)
      .from('sub_roles')
      .update({ display_order: item.display_order })
      .eq('id', item.id),
  );
  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) return { ok: false, error: firstError.message };

  await (supabase as any).from('admin_actions').insert({
    actor_id: profile.id,
    action: 'reorder',
    table_name: 'sub_roles',
    metadata: { count: items.length, items: items.map((i) => i.id) },
  });

  revalidatePath('/sub-roles');
  return { ok: true };
}

/**
 * useSubRoles — DB'den parent_role'e ait aktif alt-rolleri çeker.
 *
 * - SELECT FROM sub_roles WHERE parent_role=? AND active=true
 * - display_order ASC ile sıralı
 * - react-query, 1 saat staleTime (admin nadiren değiştirir)
 *
 * names JSONB → i18n.language ile localized string seç (fallback: en, sonra tr, sonra id)
 */
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserRole, SubRoleRow } from '@/types/profile';

const ONE_HOUR = 1000 * 60 * 60;

/** Raw fetch — names + descriptions JSONB döner. */
export function useSubRoles(parentRole: UserRole | null | undefined) {
  return useQuery({
    queryKey: ['sub-roles', parentRole],
    enabled: !!parentRole,
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR * 6,
    queryFn: async (): Promise<SubRoleRow[]> => {
      if (!parentRole) return [];
      const { data, error } = await (supabase as any)
        .from('sub_roles')
        .select('id, parent_role, display_order, active, icon, names, descriptions, created_at, updated_at')
        .eq('parent_role', parentRole)
        .eq('active', true)
        .order('display_order', { ascending: true });
      if (error) return [];
      return (data ?? []) as SubRoleRow[];
    },
  });
}

/**
 * SubRoleRow için locale'e göre name döndüren helper.
 * Öncelik: requested → en → tr → id.
 */
export function localizedName(row: SubRoleRow, lang: string): string {
  return (
    row.names?.[lang] ??
    row.names?.en ??
    row.names?.tr ??
    row.id
  );
}

/** Description aynı pattern. NULL döndürebilir. */
export function localizedDescription(row: SubRoleRow, lang: string): string | null {
  if (!row.descriptions) return null;
  return (
    row.descriptions[lang] ??
    row.descriptions.en ??
    row.descriptions.tr ??
    null
  );
}

/**
 * useSubRoles + i18n entegrasyonu. UI'da kart render etmek için hazır lokalize array.
 */
export function useLocalizedSubRoles(parentRole: UserRole | null | undefined) {
  const { i18n } = useTranslation();
  const { data: rows = [], isLoading } = useSubRoles(parentRole);
  const items = useMemo(
    () =>
      rows.map((row) => ({
        id: row.id,
        icon: row.icon,
        name: localizedName(row, i18n.language),
        description: localizedDescription(row, i18n.language),
        displayOrder: row.display_order,
      })),
    [rows, i18n.language],
  );
  return { items, isLoading, raw: rows };
}

/**
 * Profile detay tabloları — experiences/education/certifications/type_ratings.
 *
 * Pattern: useProfile gibi module-level cache + realtime subscribe.
 * Per-table per-userId cache.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const TTL_MS = 5 * 60 * 1000;

export interface ExperienceRow {
  id: string;
  user_id: string;
  company: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  is_current: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
}

export interface EducationRow {
  id: string;
  user_id: string;
  school: string;
  degree: string | null;
  field: string | null;
  graduation_year: number | null;
  sort: number;
  created_at: string;
  updated_at: string;
}

export interface CertificationRow {
  id: string;
  user_id: string;
  type: string;
  number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  issuing_authority: string | null;
  sort: number;
  created_at: string;
  updated_at: string;
}

export interface TypeRatingRow {
  id: string;
  user_id: string;
  aircraft_type: string;
  hours: number | null;
  certified_date: string | null;
  sort: number;
  created_at: string;
  updated_at: string;
}

type Row = ExperienceRow | EducationRow | CertificationRow | TypeRatingRow;
type TableName =
  | 'user_experiences'
  | 'user_education'
  | 'user_certifications'
  | 'user_type_ratings';

interface CacheEntry<T> {
  rows: T[];
  loadedAt: number;
}

const caches = {
  user_experiences: new Map<string, CacheEntry<ExperienceRow>>(),
  user_education: new Map<string, CacheEntry<EducationRow>>(),
  user_certifications: new Map<string, CacheEntry<CertificationRow>>(),
  user_type_ratings: new Map<string, CacheEntry<TypeRatingRow>>(),
};

const subs = {
  user_experiences: new Map<string, Set<(rows: ExperienceRow[]) => void>>(),
  user_education: new Map<string, Set<(rows: EducationRow[]) => void>>(),
  user_certifications: new Map<string, Set<(rows: CertificationRow[]) => void>>(),
  user_type_ratings: new Map<string, Set<(rows: TypeRatingRow[]) => void>>(),
};

const realtimeBound = new Set<string>(); // `${table}:${userId}`

async function fetchRows<T extends Row>(table: TableName, userId: string): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .order('sort', { ascending: true })
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as T[];
}

function bindRealtime<T extends Row>(table: TableName, userId: string) {
  const key = `${table}:${userId}`;
  if (realtimeBound.has(key)) return;
  realtimeBound.add(key);

  supabase
    .channel(`${table}_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const fresh = await fetchRows<T>(table, userId);
        const cache = caches[table] as Map<string, CacheEntry<T>>;
        cache.set(userId, { rows: fresh, loadedAt: Date.now() });
        const sub = subs[table].get(userId) as Set<(rows: T[]) => void> | undefined;
        sub?.forEach((cb) => cb(fresh));
      },
    )
    .subscribe();
}

function useUserDetailRows<T extends Row>(
  table: TableName,
  userId: string | null | undefined,
): { rows: T[]; loading: boolean; refresh: () => Promise<void> } {
  const cache = caches[table] as Map<string, CacheEntry<T>>;
  const cached = userId ? cache.get(userId)?.rows : null;
  const [rows, setRows] = useState<T[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached && !!userId);

  useEffect(() => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    let mounted = true;

    let subSet = subs[table].get(userId) as Set<(rows: T[]) => void> | undefined;
    if (!subSet) {
      subSet = new Set();
      (subs[table] as Map<string, Set<(rows: T[]) => void>>).set(userId, subSet);
    }
    const cb = (next: T[]) => {
      if (mounted) setRows(next);
    };
    subSet.add(cb);

    const entry = cache.get(userId);
    if (entry && Date.now() - entry.loadedAt < TTL_MS) {
      setRows(entry.rows);
      setLoading(false);
      bindRealtime<T>(table, userId);
    } else {
      void fetchRows<T>(table, userId).then((r) => {
        if (!mounted) return;
        cache.set(userId, { rows: r, loadedAt: Date.now() });
        setRows(r);
        setLoading(false);
        bindRealtime<T>(table, userId);
      });
    }

    return () => {
      mounted = false;
      subSet!.delete(cb);
    };
  }, [userId]);

  async function refresh() {
    if (!userId) return;
    const fresh = await fetchRows<T>(table, userId);
    cache.set(userId, { rows: fresh, loadedAt: Date.now() });
    setRows(fresh);
  }

  return { rows, loading, refresh };
}

export function useUserExperiences(userId: string | null | undefined) {
  return useUserDetailRows<ExperienceRow>('user_experiences', userId);
}

export function useUserEducation(userId: string | null | undefined) {
  return useUserDetailRows<EducationRow>('user_education', userId);
}

export function useUserCertifications(userId: string | null | undefined) {
  return useUserDetailRows<CertificationRow>('user_certifications', userId);
}

export function useUserTypeRatings(userId: string | null | undefined) {
  return useUserDetailRows<TypeRatingRow>('user_type_ratings', userId);
}

// ─── Mutation helpers (kullanıcı kendi kayıtları) ─────────────────────────

export async function upsertProfileFields(
  userId: string,
  patch: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function createDetailRow<T extends Record<string, unknown>>(
  table: TableName,
  userId: string,
  data: T,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data: row, error } = await (supabase as any)
    .from(table)
    .insert({ ...data, user_id: userId })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: row.id };
}

export async function updateDetailRow(
  table: TableName,
  id: string,
  patch: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await (supabase as any).from(table).update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteDetailRow(
  table: TableName,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * useScenarios — DB-driven scenarios with role + sub_role filter.
 *
 * Önceki: src/features/conversation/scenarios.ts (static, hardcoded 5 senaryo)
 * Yeni:   public.scenarios DB tablosu
 *
 * Filter:
 *   - status = 'published'
 *   - role = 'all' VEYA user.role = ANY(target_roles)
 *   - target_sub_roles = '{}' VEYA user.sub_role = ANY(target_sub_roles)
 */
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types/profile';
import type { ConversationScenario } from './scenarios';

const ONE_HOUR = 1000 * 60 * 60;

export interface DbDialogTurn {
  id: string;
  atcStation: string;
  atcUtterance: string;
  frequency?: string;
  expectedReadback: string;
  keyPhrases: string[][];
  correctionTr: string;
  hintTr?: string;
  isFinal?: boolean;
}

export interface DbScenario {
  id: string;
  slug: string;
  role: 'pilot' | 'atc' | 'cabin' | 'technician' | 'ground' | 'student' | 'dispatcher' | 'all';
  target_roles: string[];
  target_sub_roles: string[];
  level: 'B1' | 'B2' | 'L4' | null;
  title: string | null;
  title_tr: string | null;
  setup: string | null;
  setup_tr: string | null;
  turns: DbDialogTurn[];
  gauges: { alt?: string; hdg?: string; spd?: string; freq?: string } | null;
  difficulty: number;
  estimated_minutes: number;
  is_premium: boolean;
}

/**
 * Kullanıcının ROLE'üne ait tüm yayınlanmış senaryoları döner.
 * Sub_role filter UI tarafında (sub_role tab'larında) yapılır — burada
 * yapmıyoruz, böylece UI tab değiştirdikçe ek fetch yok.
 */
export function useScenarios() {
  const role = useAuthStore((s) => s.profile?.role ?? null);

  return useQuery({
    queryKey: ['scenarios', role],
    staleTime: ONE_HOUR,
    queryFn: async (): Promise<DbScenario[]> => {
      const { data, error } = await (supabase as any)
        .from('scenarios')
        .select('*')
        .eq('status', 'published')
        .order('difficulty', { ascending: true })
        .limit(200);
      if (error) return [];
      const rows = (data ?? []) as DbScenario[];
      // Sadece role match — sub_role UI tarafında
      return rows.filter((s) => {
        return (
          s.role === 'all' ||
          (s.target_roles && s.target_roles.length === 0) ||
          (role && s.target_roles?.includes(role))
        );
      });
    },
  });
}

/** Tek senaryo, slug bazlı. */
export function useScenario(slug: string | null | undefined) {
  return useQuery({
    queryKey: ['scenario', slug],
    enabled: !!slug,
    staleTime: ONE_HOUR,
    queryFn: async (): Promise<DbScenario | null> => {
      if (!slug) return null;
      const { data, error } = await (supabase as any)
        .from('scenarios')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error) return null;
      return (data as DbScenario) ?? null;
    },
  });
}

/**
 * DbScenario → static ConversationScenario adapter.
 * Mevcut UI component'lerini bozmadan DB'ye geçiş için.
 */
export function dbToStaticScenario(db: DbScenario): ConversationScenario {
  return {
    id: db.slug,
    role: (db.role === 'dispatcher' ? 'all' : db.role) as ConversationScenario['role'],
    level: (db.level ?? 'B1') as ConversationScenario['level'],
    titleTr: db.title_tr ?? db.title ?? '',
    contextTr: db.setup_tr ?? db.setup ?? '',
    gauges: db.gauges ?? undefined,
    turns: db.turns as any,
    estimatedSeconds: Math.max(60, (db.estimated_minutes ?? 1) * 60),
  };
}

/** useScenarios + adapter — UI için hazır ConversationScenario array. */
export function useScenariosAsStatic() {
  const { data: dbRows = [], isLoading } = useScenarios();
  const items = useMemo(() => dbRows.map(dbToStaticScenario), [dbRows]);
  return { items, isLoading };
}

/**
 * Role bazlı filter (static scenarios.ts'in fonksiyonu ile uyumlu).
 * @deprecated useScenarios() kullan, DB filter zaten role-aware.
 */
export function useScenariosForRole(_role: UserRole | null | undefined) {
  return useScenarios();
}

/**
 * Readback Clearances API — DB-driven, TS fallback.
 *
 * Sprint C2:
 * - DB tablo: readback_clearances
 * - TS fallback: src/features/readback/clearances.ts (DB boşsa veya hata)
 */
import { useQuery } from '@tanstack/react-query';
import { supabase as typedSupabase } from '@/lib/supabase';
import { CLEARANCES as TS_FALLBACK, type AtcClearance } from './clearances';

const supabase: any = typedSupabase;
const FIVE_MIN = 5 * 60_000;

export interface ReadbackClearanceRow {
  id: string;
  slug: string;
  level: string | null;
  target_role: string;
  target_sub_roles: string[] | null;
  category: string | null;
  station: string | null;
  freq: string | null;
  atc_utterance: string;
  expected_readback: string;
  key_phrases: string[][];
  icao_ref: string | null;
  hint_tr: string | null;
  hint_en: string | null;
  audio_url: string | null;
  sort: number;
}

/** DB row → mobile AtcClearance şekline çevir. */
function rowToClearance(r: ReadbackClearanceRow): AtcClearance {
  return {
    id: r.slug,
    level: (r.level as any) ?? 'B1',
    category: (r.category as any) ?? 'taxi',
    station: r.station ?? '',
    freq: r.freq ?? undefined,
    atcUtterance: r.atc_utterance,
    expectedReadback: r.expected_readback,
    keyPhrases: r.key_phrases ?? [],
    icaoRef: r.icao_ref ?? undefined,
    hintTr: r.hint_tr ?? '',
  };
}

export function useReadbackClearances(
  role: string | null | undefined,
  subRole?: string | null,
  level?: string | null,
) {
  return useQuery({
    queryKey: ['readback-clearances', role ?? 'any', subRole ?? 'any', level ?? 'any'],
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<AtcClearance[]> => {
      try {
        let query = supabase
          .from('readback_clearances')
          .select('*')
          .eq('status', 'published');

        // target_role: rol veya 'all'
        if (role) {
          query = query.in('target_role', [role, 'all']);
        }
        if (level) {
          query = query.eq('level', level);
        }
        const { data, error } = await query.order('sort', { ascending: true }).limit(50);
        if (error) throw error;
        if (!data || data.length === 0) {
          return TS_FALLBACK; // boş → fallback
        }

        let rows = data as ReadbackClearanceRow[];

        // SubRole filter (client-side, target_sub_roles array içinde mi)
        if (subRole) {
          const subFiltered = rows.filter(
            (r) => !r.target_sub_roles || r.target_sub_roles.length === 0 || r.target_sub_roles.includes(subRole),
          );
          if (subFiltered.length >= 2) rows = subFiltered;
        }

        return rows.map(rowToClearance);
      } catch (e) {
        if (__DEV__) console.warn('readback fetch failed, fallback to TS:', e);
        return TS_FALLBACK;
      }
    },
  });
}

/** Senkron random N tane (mevcut TS API). Pre-fetched data alır, yoksa TS. */
export function pickRandomClearances(pool: AtcClearance[] | undefined, count: number): AtcClearance[] {
  const source = pool && pool.length > 0 ? pool : TS_FALLBACK;
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

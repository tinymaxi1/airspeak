/**
 * Listen & Solve API — DB-driven, TS fallback.
 *
 * Sprint C2:
 * - DB tablo: listen_solve_drills
 * - TS fallback: src/features/listen-solve/drills.ts (DB boşsa veya hata)
 */
import { useQuery } from '@tanstack/react-query';
import { supabase as typedSupabase } from '@/lib/supabase';
import {
  LISTEN_SOLVE_DRILLS,
  type ListenSolveDrill,
  type ListenSolveRole,
  type ListenSolveCategory,
} from './drills';

const supabase: any = typedSupabase;
const FIVE_MIN = 5 * 60_000;

export interface ListenSolveDrillRow {
  id: string;
  slug: string;
  level: string | null;
  target_role: string;
  target_sub_roles: string[] | null;
  category: string;
  audio_text: string;
  question_tr: string;
  question_en: string;
  options: any;
  correct_id: string;
  explanation_tr: string | null;
  explanation_en: string | null;
  hint_tr: string | null;
  hint_en: string | null;
  noise_level: number;
  audio_url: string | null;
  sort: number;
}

function rowToDrill(r: ListenSolveDrillRow): ListenSolveDrill {
  return {
    id: r.slug,
    slug: r.slug,
    level: (r.level as any) ?? 'B1',
    target_role: r.target_role as ListenSolveRole,
    target_sub_roles: r.target_sub_roles ?? [],
    category: r.category as ListenSolveCategory,
    audio_text: r.audio_text,
    question_tr: r.question_tr,
    question_en: r.question_en,
    options: r.options,
    correct_id: r.correct_id,
    explanation_tr: r.explanation_tr ?? '',
    explanation_en: r.explanation_en ?? '',
    hint_tr: r.hint_tr ?? undefined,
  };
}

export function useListenSolveDrills(
  role: string | null | undefined,
  subRole?: string | null,
  category?: ListenSolveCategory,
) {
  return useQuery({
    queryKey: ['listen-solve-drills', role ?? 'any', subRole ?? 'any', category ?? 'any'],
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<ListenSolveDrill[]> => {
      try {
        let query = supabase
          .from('listen_solve_drills')
          .select('*')
          .eq('status', 'published');
        if (role) query = query.in('target_role', [role, 'all']);
        if (category) query = query.eq('category', category);
        const { data, error } = await query.order('sort', { ascending: true }).limit(50);
        if (error) throw error;
        // DB boş → fallback KULLANMA (rol için içerik yok). Sadece error → fallback
        if (!data || data.length === 0) return [];

        let rows = data as ListenSolveDrillRow[];
        if (subRole) {
          const subFiltered = rows.filter(
            (r) => !r.target_sub_roles || r.target_sub_roles.length === 0 || r.target_sub_roles.includes(subRole),
          );
          if (subFiltered.length >= 2) rows = subFiltered;
        }
        return rows.map(rowToDrill);
      } catch (e) {
        if (__DEV__) console.warn('listen-solve fetch failed, fallback to TS:', e);
        return LISTEN_SOLVE_DRILLS;
      }
    },
  });
}

/**
 * Rol + opsiyonel kategori filtresine göre drill setini döndürür.
 *
 * Picker mantığı:
 *   1. Tam eşleşme: target_role === role
 *   2. Eğer kategori varsa: category === categoryFilter
 *   3. Eğer rol için < 2 drill bulunursa: 'all' role drill'leri ekle (fallback)
 *   4. Eğer hala < 2 drill: TÜM drill'lerden seç (extreme fallback)
 *   5. Maksimum 7 drill (rapid fire için)
 */
export function pickListenSolveDrills(args: {
  role: ListenSolveRole | null | undefined;
  category?: ListenSolveCategory;
  level?: 'A2' | 'B1' | 'B2';
  max?: number;
}): ListenSolveDrill[] {
  const role = args.role ?? 'all';
  const max = args.max ?? 7;

  const byRole = LISTEN_SOLVE_DRILLS.filter((d) => d.target_role === role);
  const byAll = LISTEN_SOLVE_DRILLS.filter((d) => d.target_role === 'all');

  let pool = [...byRole, ...byAll];

  // Kategori filtresi
  if (args.category) {
    const catFiltered = pool.filter((d) => d.category === args.category);
    if (catFiltered.length >= 2) pool = catFiltered;
    // Kategori için yeterli drill yoksa rol pool'una düş (graceful)
  }

  // Level filtresi (opsiyonel, < min'e düşerse atla)
  if (args.level) {
    const lvFiltered = pool.filter((d) => d.level === args.level);
    if (lvFiltered.length >= 2) pool = lvFiltered;
  }

  // Hâlâ az ise tüm drill'lerden ekle (extreme fallback)
  if (pool.length < 2) {
    pool = [...pool, ...LISTEN_SOLVE_DRILLS.filter((d) => !pool.includes(d))];
  }

  // Karıştır + max
  return shuffle(pool).slice(0, max);
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Route id'sini drill picker args'a çevir.
 * id = 'practice' → role default, kategori yok (tüm rol drill'leri)
 * id = 'garbled' → category='garbled_radio'
 * id = 'atc_listen' / 'transcribe' / 'pa_decode' / 'snag_report' / 'metar_notam' → spesifik kategori
 */
export function routeIdToFilters(id: string): { category?: ListenSolveCategory } {
  const validCategories: Record<string, ListenSolveCategory> = {
    atc_listen: 'atc_listen',
    garbled: 'garbled_radio',
    garbled_radio: 'garbled_radio',
    transcribe: 'transcribe',
    pa_decode: 'pa_decode',
    snag_report: 'snag_report',
    metar_notam: 'metar_notam',
  };
  if (validCategories[id]) return { category: validCategories[id] };
  return {}; // 'practice' veya tanımsız → tüm rol drill'leri
}

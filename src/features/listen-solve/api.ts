/**
 * Listen & Solve API — drill picker.
 *
 * Şu an hardcoded TS drill bank'tan filtreler. İleride DB tablosu eklenirse
 * supabase query'e geçer (interface aynı kalır).
 */
import {
  LISTEN_SOLVE_DRILLS,
  type ListenSolveDrill,
  type ListenSolveRole,
  type ListenSolveCategory,
} from './drills';

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

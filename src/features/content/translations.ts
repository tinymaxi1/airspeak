/**
 * Content translations — mobile entegrasyon.
 * Sprint 9.E
 *
 * Mevcut _tr kolonları korunur:
 *   - locale='tr' → row.<field>_tr (örn. title_tr)
 *   - locale='en' → row.<field> (örn. title)
 *   - locale ∈ {ar,de,fr,...} → content_translations tablosundan oku
 *
 * Fallback chain: locale → en (row.<field>) → tr (row.<field>_tr) → ''
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getCurrentLanguage } from '@/lib/i18n';
import type { Locale } from '@/lib/i18nTypes';

export type ContentType =
  | 'lessons'
  | 'exercises'
  | 'vocab_terms'
  | 'interview_questions'
  | 'oral_prompts'
  | 'placement_questions'
  | 'airlines'
  | 'modules'
  | 'units';

export interface ContentTranslationRow {
  field_name: string;
  language_code: string;
  value: string;
}

/**
 * Tek bir content_id için tüm dillerin ek çevirilerini getirir (TR/EN hariç).
 * Dönüş: Map<field_name, Map<language_code, value>>
 */
export function useContentTranslations(
  contentType: ContentType | undefined,
  contentId: string | undefined,
) {
  return useQuery({
    queryKey: ['content_translations', contentType, contentId],
    enabled: !!contentType && !!contentId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('content_translations')
        .select('field_name, language_code, value')
        .eq('content_type', contentType!)
        .eq('content_id', contentId!);
      if (error) throw error;
      const byField = new Map<string, Map<string, string>>();
      for (const r of (data as ContentTranslationRow[]) ?? []) {
        if (!byField.has(r.field_name)) byField.set(r.field_name, new Map());
        byField.get(r.field_name)!.set(r.language_code, r.value);
      }
      return byField;
    },
  });
}

/**
 * Resolver: row + translations + locale + field → string
 *
 * @param row Source row (must have <fieldEn> ve <fieldEn>_tr alanları)
 * @param translations useContentTranslations sonucu (Map veya undefined)
 * @param locale Hedef dil
 * @param fieldEn Field adı EN baseline (örn. 'title' veya 'term')
 */
export function resolveContentField(
  row: Record<string, any> | null | undefined,
  translations: Map<string, Map<string, string>> | undefined,
  locale: Locale,
  fieldEn: string,
): string {
  if (!row) return '';

  // tr fast path → row.<field>_tr
  if (locale === 'tr') {
    const tr = row[`${fieldEn}_tr`];
    if (typeof tr === 'string' && tr.length > 0) return tr;
    // tr boşsa en'e fallback
    const en = row[fieldEn];
    if (typeof en === 'string' && en.length > 0) return en;
    return '';
  }

  // en fast path → row.<field>
  if (locale === 'en') {
    const en = row[fieldEn];
    if (typeof en === 'string' && en.length > 0) return en;
    const tr = row[`${fieldEn}_tr`];
    if (typeof tr === 'string' && tr.length > 0) return tr;
    return '';
  }

  // Diğer 18 dil → content_translations
  const fieldMap = translations?.get(fieldEn);
  const v = fieldMap?.get(locale);
  if (typeof v === 'string' && v.length > 0) return v;

  // Fallback chain: en → tr → ''
  const en = row[fieldEn];
  if (typeof en === 'string' && en.length > 0) return en;
  const tr = row[`${fieldEn}_tr`];
  if (typeof tr === 'string' && tr.length > 0) return tr;
  return '';
}

/**
 * Convenience hook: tek field + auto resolve.
 * Heavy kullanımda useContentTranslations + resolveContentField yapısını kullan.
 */
export function useLocalizedField(
  row: Record<string, any> | null | undefined,
  contentType: ContentType,
  contentId: string | undefined,
  fieldEn: string,
): string {
  const locale = getCurrentLanguage();
  // tr/en için query yok (legacy kolon yeterli)
  const skip = locale === 'tr' || locale === 'en' || !contentId;
  const { data } = useContentTranslations(skip ? undefined : contentType, skip ? undefined : contentId);
  return resolveContentField(row, data, locale, fieldEn);
}

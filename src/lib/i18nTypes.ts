/**
 * AirSpeak — 20 dil i18n altyapısı.
 *
 * Strateji:
 * - 20 dil destek (havacılık sektörü pazar büyüklüğüne göre seçildi)
 * - LocalizedString tipi — her metin alanı opsiyonel olarak tüm dillerde
 * - t() helper: fallback zinciri (kullanıcı dili → EN → TR → ilk mevcut)
 * - RTL diller (Arapça, Farsça, İbranice) için layout flip desteği
 * - Geri uyumlu: mevcut termTr/definitionTr alanları korundu, i18n alanı additif
 *
 * UI metinleri: src/locales/{locale}.json dosyalarında
 * İçerik metinleri (vocab, exams, airlines): inline LocalizedString olarak
 */

/** AirSpeak destekli 20 dil — ISO 639-1 kodlar */
export const SUPPORTED_LOCALES = [
  // Ana pazar
  'en', // English (global aviation lingua franca)
  'tr', // Türkçe (ana iç pazar)

  // Orta Doğu (Gulf carriers + Türk Cumhuriyetleri)
  'ar', // العربية (Emirates, Qatar, Etihad, Saudia)
  'fa', // فارسی (Iran Air)

  // Avrupa (FSC + LCC)
  'de', // Deutsch (Lufthansa Group)
  'fr', // Français (Air France, MEA, Royal Air Maroc)
  'es', // Español (Iberia, Vueling)
  'it', // Italiano (ITA Airways)
  'pt', // Português (TAP, LATAM Brasil)
  'nl', // Nederlands (KLM)
  'pl', // Polski (LOT)
  'el', // Ελληνικά (Aegean)

  // Asya
  'zh', // 中文 简体 (Air China, China Southern, Cathay)
  'ja', // 日本語 (JAL, ANA)
  'ko', // 한국어 (Korean Air, Asiana)
  'hi', // हिन्दी (Air India, IndiGo)
  'id', // Bahasa Indonesia (Garuda, Lion)
  'th', // ภาษาไทย (Thai Airways)
  'ms', // Bahasa Melayu (Malaysia Airlines, AirAsia)

  // Doğu Avrupa / post-Sovyet
  'ru', // Русский (Aeroflot, post-Soviet states)
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Sağdan-sola yazılan diller — Arabic, Persian (+ Hebrew gelecekte) */
export const RTL_LOCALES: Locale[] = ['ar', 'fa'];

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

/** Dil meta bilgisi — UI\'da seçici için */
export interface LocaleMeta {
  code: Locale;
  /** Dilin kendi adında ismi (kullanıcı tanır) */
  nativeName: string;
  /** İngilizce adı */
  englishName: string;
  /** Türkçe adı */
  turkishName: string;
  /** Bayrak emojisi (en yaygın ülke için) */
  flag: string;
  /** RTL mi */
  rtl: boolean;
  /** Hedef pazar / havayolu kümeleri */
  targetMarkets: string[];
  /** Tahmini havacılık öğrenci pazar büyüklüğü (AirSpeak için TAM) */
  estimatedTAM: 'high' | 'medium' | 'low';
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { code: 'en', nativeName: 'English', englishName: 'English', turkishName: 'İngilizce', flag: '🇬🇧', rtl: false, targetMarkets: ['Global', 'UK', 'Ireland', 'India aviation'], estimatedTAM: 'high' },
  tr: { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', turkishName: 'Türkçe', flag: '🇹🇷', rtl: false, targetMarkets: ['Türkiye', 'Türk Cumhuriyetleri'], estimatedTAM: 'high' },
  ar: { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', turkishName: 'Arapça', flag: '🇸🇦', rtl: true, targetMarkets: ['Suudi', 'BAE', 'Katar', 'Mısır', 'Ürdün'], estimatedTAM: 'high' },
  fa: { code: 'fa', nativeName: 'فارسی', englishName: 'Persian', turkishName: 'Farsça', flag: '🇮🇷', rtl: true, targetMarkets: ['İran', 'Afganistan'], estimatedTAM: 'medium' },
  de: { code: 'de', nativeName: 'Deutsch', englishName: 'German', turkishName: 'Almanca', flag: '🇩🇪', rtl: false, targetMarkets: ['Almanya', 'Avusturya', 'İsviçre'], estimatedTAM: 'high' },
  fr: { code: 'fr', nativeName: 'Français', englishName: 'French', turkishName: 'Fransızca', flag: '🇫🇷', rtl: false, targetMarkets: ['Fransa', 'Fas', 'Lübnan', 'Tunus'], estimatedTAM: 'medium' },
  es: { code: 'es', nativeName: 'Español', englishName: 'Spanish', turkishName: 'İspanyolca', flag: '🇪🇸', rtl: false, targetMarkets: ['İspanya', 'LATAM'], estimatedTAM: 'high' },
  it: { code: 'it', nativeName: 'Italiano', englishName: 'Italian', turkishName: 'İtalyanca', flag: '🇮🇹', rtl: false, targetMarkets: ['İtalya'], estimatedTAM: 'medium' },
  pt: { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', turkishName: 'Portekizce', flag: '🇵🇹', rtl: false, targetMarkets: ['Portekiz', 'Brezilya', 'Angola', 'Mozambik'], estimatedTAM: 'medium' },
  nl: { code: 'nl', nativeName: 'Nederlands', englishName: 'Dutch', turkishName: 'Hollandaca', flag: '🇳🇱', rtl: false, targetMarkets: ['Hollanda', 'Belçika'], estimatedTAM: 'medium' },
  pl: { code: 'pl', nativeName: 'Polski', englishName: 'Polish', turkishName: 'Lehçe', flag: '🇵🇱', rtl: false, targetMarkets: ['Polonya'], estimatedTAM: 'low' },
  el: { code: 'el', nativeName: 'Ελληνικά', englishName: 'Greek', turkishName: 'Yunanca', flag: '🇬🇷', rtl: false, targetMarkets: ['Yunanistan', 'Kıbrıs'], estimatedTAM: 'low' },
  zh: { code: 'zh', nativeName: '中文', englishName: 'Chinese (Simplified)', turkishName: 'Çince', flag: '🇨🇳', rtl: false, targetMarkets: ['Çin', 'Singapur (kısmi)', 'Hong Kong'], estimatedTAM: 'high' },
  ja: { code: 'ja', nativeName: '日本語', englishName: 'Japanese', turkishName: 'Japonca', flag: '🇯🇵', rtl: false, targetMarkets: ['Japonya'], estimatedTAM: 'medium' },
  ko: { code: 'ko', nativeName: '한국어', englishName: 'Korean', turkishName: 'Korece', flag: '🇰🇷', rtl: false, targetMarkets: ['Güney Kore'], estimatedTAM: 'medium' },
  hi: { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', turkishName: 'Hintçe', flag: '🇮🇳', rtl: false, targetMarkets: ['Hindistan'], estimatedTAM: 'high' },
  id: { code: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', turkishName: 'Endonezce', flag: '🇮🇩', rtl: false, targetMarkets: ['Endonezya'], estimatedTAM: 'medium' },
  th: { code: 'th', nativeName: 'ภาษาไทย', englishName: 'Thai', turkishName: 'Tayca', flag: '🇹🇭', rtl: false, targetMarkets: ['Tayland'], estimatedTAM: 'medium' },
  ms: { code: 'ms', nativeName: 'Bahasa Melayu', englishName: 'Malay', turkishName: 'Malayca', flag: '🇲🇾', rtl: false, targetMarkets: ['Malezya', 'Singapur (kısmi)', 'Brunei'], estimatedTAM: 'medium' },
  ru: { code: 'ru', nativeName: 'Русский', englishName: 'Russian', turkishName: 'Rusça', flag: '🇷🇺', rtl: false, targetMarkets: ['Rusya', 'Türk Cumhuriyetleri', 'Doğu Avrupa'], estimatedTAM: 'medium' },
};

/**
 * Lokalize string — opsiyonel olarak her dilde sürüm.
 * Hiçbir dil yoksa "" döner. Genelde fallback chain ile kullanılır.
 */
export type LocalizedString = Partial<Record<Locale, string>>;

/**
 * Lokalize array (örn. örnek cümleler listesi).
 */
export type LocalizedStringArray = Partial<Record<Locale, string[]>>;

/**
 * Çeviri çözücü — fallback chain:
 * istenen → en → tr → ilk mevcut → ""
 *
 * @param ls Lokalize string (örn term.i18n)
 * @param locale Hedef dil
 * @returns Çözümlenen string
 */
export function resolveLocalized(
  ls: LocalizedString | undefined,
  locale: Locale,
): string {
  if (!ls) return '';
  if (ls[locale]) return ls[locale]!;
  if (ls.en) return ls.en;
  if (ls.tr) return ls.tr;
  for (const lang of SUPPORTED_LOCALES) {
    if (ls[lang]) return ls[lang]!;
  }
  return '';
}

/**
 * Lokalize array çözücü.
 */
export function resolveLocalizedArray(
  ls: LocalizedStringArray | undefined,
  locale: Locale,
): string[] {
  if (!ls) return [];
  if (ls[locale]) return ls[locale]!;
  if (ls.en) return ls.en;
  if (ls.tr) return ls.tr;
  for (const lang of SUPPORTED_LOCALES) {
    if (ls[lang]) return ls[lang]!;
  }
  return [];
}

/**
 * Eski (legacy) `xxxTr` alanını yeni LocalizedString'e migrate et.
 * Mevcut content kırılmasın diye fallback olarak kullanılır.
 */
export function legacyToLocalized(tr: string, en?: string): LocalizedString {
  const result: LocalizedString = { tr };
  if (en) result.en = en;
  return result;
}

/**
 * 20 dilin kapsanma oranını ölç (kaç tanesi dolu).
 */
export function localizedCoverage(ls: LocalizedString | undefined): number {
  if (!ls) return 0;
  const filled = SUPPORTED_LOCALES.filter((l) => ls[l] && ls[l]!.length > 0).length;
  return Math.round((filled / SUPPORTED_LOCALES.length) * 100);
}

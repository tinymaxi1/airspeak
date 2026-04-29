/**
 * AirSpeak i18n — 20 dil desteği.
 *
 * Strateji:
 * - Tüm 20 locale yüklenir (bundle ~150KB ekstra — kabul edilebilir)
 * - Cihaz dili otomatik algılanır, desteklenmeyenler EN fallback
 * - Kullanıcı tercihi MMKV'da saklanır
 * - RTL diller için layout yönü `I18nManager` ile değişir (Arabic, Persian)
 * - Çeviri durumu: EN/TR tam, diğer 18 dil placeholder (EN'den kopya)
 *   - Real lokalizasyon Sprint 9'da Claude pipeline ile yapılacak
 *   - LOCALE_COVERAGE map ile her dilin tamamlanma yüzdesi takip edilir
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';
import { storage } from './storage';
import { SUPPORTED_LOCALES, type Locale, isRTL } from './i18nTypes';

// 20 dilin tüm dosyaları — Metro bundler statik analiz için inline import
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';
import ar from '@/locales/ar.json';
import fa from '@/locales/fa.json';
import de from '@/locales/de.json';
import fr from '@/locales/fr.json';
import es from '@/locales/es.json';
import it from '@/locales/it.json';
import pt from '@/locales/pt.json';
import nl from '@/locales/nl.json';
import pl from '@/locales/pl.json';
import el from '@/locales/el.json';
import zh from '@/locales/zh.json';
import ja from '@/locales/ja.json';
import ko from '@/locales/ko.json';
import hi from '@/locales/hi.json';
import id from '@/locales/id.json';
import th from '@/locales/th.json';
import ms from '@/locales/ms.json';
import ru from '@/locales/ru.json';

const STORAGE_KEY = 'airspeak-language';

/** Her locale\'in tamamlanma yüzdesi — placeholder oldukları için low */
export const LOCALE_COVERAGE: Record<Locale, number> = {
  en: 100,
  tr: 100,
  // Sprint 9'da Claude pipeline ile çevrilecek
  ar: 0, fa: 0, de: 0, fr: 0, es: 0, it: 0, pt: 0, nl: 0, pl: 0, el: 0,
  zh: 0, ja: 0, ko: 0, hi: 0, id: 0, th: 0, ms: 0, ru: 0,
};

const RESOURCES: Record<Locale, { translation: object }> = {
  en: { translation: en }, tr: { translation: tr },
  ar: { translation: ar }, fa: { translation: fa },
  de: { translation: de }, fr: { translation: fr },
  es: { translation: es }, it: { translation: it },
  pt: { translation: pt }, nl: { translation: nl },
  pl: { translation: pl }, el: { translation: el },
  zh: { translation: zh }, ja: { translation: ja },
  ko: { translation: ko }, hi: { translation: hi },
  id: { translation: id }, th: { translation: th },
  ms: { translation: ms }, ru: { translation: ru },
};

function detectLanguage(): Locale {
  const stored = storage.getString(STORAGE_KEY);
  if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) {
    return stored as Locale;
  }
  const deviceLocale = getLocales()[0]?.languageCode;
  if (deviceLocale && (SUPPORTED_LOCALES as readonly string[]).includes(deviceLocale)) {
    return deviceLocale as Locale;
  }
  return 'en';
}

/** RTL durumu uygula — uygulama yeniden başlatma gerekebilir */
function applyRTL(locale: Locale): void {
  const shouldBeRTL = isRTL(locale);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    // Production'da: RNRestart.Restart() ile reload tetiklenir
  }
}

export function initI18n(): void {
  const lang = detectLanguage();
  applyRTL(lang);
  void i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3', // RN environment Intl.PluralRules tam desteklemiyor
    resources: RESOURCES,
    lng: lang,
    fallbackLng: ['en', 'tr'], // chain: kullanıcı dili → en → tr
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false, // Suspense kapalı — RN'de re-render döngüsüne girebiliyor
    },
  });
}

export function changeLanguage(lang: Locale): Promise<unknown> {
  storage.set(STORAGE_KEY, lang);
  applyRTL(lang);
  return i18n.changeLanguage(lang);
}

export function getCurrentLanguage(): Locale {
  return (i18n.language as Locale) || 'en';
}

export type { Locale };
export { SUPPORTED_LOCALES };
export default i18n;

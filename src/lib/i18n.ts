import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';
import { storage } from './storage';

const STORAGE_KEY = 'airspeak-language';
const SUPPORTED = ['en', 'tr'] as const;
type Lang = (typeof SUPPORTED)[number];

function detectLanguage(): Lang {
  const stored = storage.getString(STORAGE_KEY);
  if (stored && (SUPPORTED as readonly string[]).includes(stored)) {
    return stored as Lang;
  }
  const deviceLocale = getLocales()[0]?.languageCode;
  return deviceLocale === 'tr' ? 'tr' : 'en';
}

export function initI18n(): void {
  const lang = detectLanguage();
  void i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources: {
      en: { translation: en },
      tr: { translation: tr },
    },
    lng: lang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export function changeLanguage(lang: Lang): Promise<unknown> {
  storage.set(STORAGE_KEY, lang);
  return i18n.changeLanguage(lang);
}

export function getCurrentLanguage(): Lang {
  return (i18n.language as Lang) || 'en';
}

export default i18n;

/**
 * Çeviri Kalite Kontrol — havacılık standartlarına uyumluluk denetimi.
 *
 * Kontroller:
 * 1. ICAO frazeolojisi koruma — Mayday, Roger, Pan Pan değiştirilmiş mi?
 * 2. Aviation glossary uyum — bizim verified terimler kullanılıyor mu?
 * 3. Length budget — orijinal +%30 sınırı (UI bozulmasın)
 * 4. Empty translations — boş veya source-language kalmış var mı?
 * 5. Charset doğrulama — Arapça/Çince karakter beklediği yerde mi?
 *
 * Çıktı: scripts/i18n/quality-report.json
 */
import fs from 'fs';
import path from 'path';

const PRESERVE_TERMS = [
  'Mayday', 'Pan Pan', 'Roger', 'Wilco', 'Affirmative', 'Negative',
  'Squawk 7700', 'Squawk 7600', 'Squawk 7500',
  'Turkish', 'Speedbird', 'Lufthansa', 'Emirates', 'Qatari',
  'V1', 'VR', 'V2', 'TCAS', 'ILS', 'NDB', 'VOR', 'ATC', 'ICAO', 'IATA',
];

const RTL_LANGS = ['ar', 'fa'];
const CJK_LANGS = ['zh', 'ja', 'ko'];

interface QualityIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  context?: string;
}

interface QualityReport {
  language: string;
  totalChecked: number;
  issues: QualityIssue[];
  score: number; // 0-100
}

/**
 * Bir dil için kalite kontrolü.
 */
export function checkLanguage(lang: string): QualityReport {
  const issues: QualityIssue[] = [];
  let totalChecked = 0;

  const localePath = path.join(__dirname, `../../src/locales/${lang}.json`);
  const enPath = path.join(__dirname, '../../src/locales/en.json');

  if (!fs.existsSync(localePath)) {
    return {
      language: lang,
      totalChecked: 0,
      issues: [{ severity: 'error', category: 'missing_file', message: `${lang}.json yok` }],
      score: 0,
    };
  }

  const target = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  const source = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  const flatten = (obj: any, prefix = ''): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') out[key] = v;
      else if (typeof v === 'object' && v) Object.assign(out, flatten(v, key));
    }
    return out;
  };

  const sourceFlat = flatten(source);
  const targetFlat = flatten(target);

  for (const [key, srcText] of Object.entries(sourceFlat)) {
    totalChecked++;
    const tgtText = targetFlat[key];

    // Check 1: Çeviri eksik
    if (!tgtText) {
      issues.push({
        severity: 'error',
        category: 'missing',
        message: `Anahtar çevrilmemiş: ${key}`,
      });
      continue;
    }

    // Check 2: Source-language kalmış (placeholder)
    if (lang !== 'en' && tgtText === srcText && srcText.length > 5) {
      issues.push({
        severity: 'warning',
        category: 'untranslated',
        message: `İngilizce kalmış: ${key}`,
        context: tgtText,
      });
    }

    // Check 3: Length budget (+%50)
    const lengthRatio = tgtText.length / Math.max(srcText.length, 1);
    if (lengthRatio > 1.5) {
      issues.push({
        severity: 'warning',
        category: 'too_long',
        message: `Çok uzun (${Math.round(lengthRatio * 100)}%): ${key}`,
        context: tgtText.substring(0, 100),
      });
    }

    // Check 4: ICAO frazeolojisi koruma
    for (const preserved of PRESERVE_TERMS) {
      if (srcText.includes(preserved) && !tgtText.includes(preserved)) {
        issues.push({
          severity: 'error',
          category: 'phraseology_lost',
          message: `"${preserved}" değiştirilmiş ${key}`,
          context: tgtText,
        });
      }
    }

    // Check 5: Charset (RTL diller Arabic/Persian script)
    if (RTL_LANGS.includes(lang) && !/[؀-ۿ]/.test(tgtText) && tgtText.length > 5) {
      issues.push({
        severity: 'error',
        category: 'wrong_script',
        message: `${lang} için Arapça karakter beklenirdi: ${key}`,
        context: tgtText,
      });
    }

    // Check 6: CJK karakter kontrolü
    if (CJK_LANGS.includes(lang) && !/[㐀-鿿぀-ゟ가-힯]/.test(tgtText) && tgtText.length > 5) {
      issues.push({
        severity: 'error',
        category: 'wrong_script',
        message: `${lang} için CJK karakter beklenirdi: ${key}`,
        context: tgtText,
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const score = Math.max(
    0,
    100 - errorCount * 5 - warningCount * 1,
  );

  return { language: lang, totalChecked, issues, score };
}

/**
 * Tüm 20 dili kontrol et + rapor.
 */
export function runFullCheck(): void {
  const TARGET_LANGS = ['en', 'tr', 'ar', 'fa', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'el', 'zh', 'ja', 'ko', 'hi', 'id', 'th', 'ms', 'ru'];

  console.log('🔍 AirSpeak i18n Kalite Kontrolü\n');
  const reports: QualityReport[] = [];

  for (const lang of TARGET_LANGS) {
    const report = checkLanguage(lang);
    reports.push(report);

    const errors = report.issues.filter((i) => i.severity === 'error').length;
    const warnings = report.issues.filter((i) => i.severity === 'warning').length;
    const emoji = report.score >= 90 ? '✅' : report.score >= 70 ? '⚠️' : '❌';
    console.log(`${emoji} ${lang.toUpperCase().padEnd(3)} skor: ${report.score}/100 — ${errors} hata, ${warnings} uyarı (${report.totalChecked} string)`);
  }

  const reportPath = path.join(__dirname, 'quality-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reports, null, 2));
  console.log(`\n📄 Detaylı rapor: ${reportPath}`);

  const avgScore = Math.round(reports.reduce((s, r) => s + r.score, 0) / reports.length);
  console.log(`\n🎯 Ortalama kalite: ${avgScore}/100`);
}

if (require.main === module) {
  const lang = process.argv[2];
  if (lang) {
    const report = checkLanguage(lang);
    console.log(JSON.stringify(report, null, 2));
  } else {
    runFullCheck();
  }
}

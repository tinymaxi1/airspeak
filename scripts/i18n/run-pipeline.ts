/**
 * Master Orchestrator — bedava çeviri pipeline'ı.
 *
 * Sıralı katmanlı çeviri:
 *   1. Aviation glossary (manuel verified) → en kritik %20
 *   2. Wikipedia language links → noun terms %40
 *   3. DeepL Free → cümleler (500K char/ay)
 *   4. Argos offline → kalan tüm metinler (sınırsız)
 *
 * Her katman bir öncekinin doldurmadığı yeri doldurur.
 * Kalite önceliklendirme: glossary > Wikipedia > DeepL > Argos.
 *
 * Çalıştırma:
 *   ts-node scripts/i18n/run-pipeline.ts --target ui-strings
 *   ts-node scripts/i18n/run-pipeline.ts --target vocab
 *   ts-node scripts/i18n/run-pipeline.ts --target all
 */
import fs from 'fs';
import path from 'path';
import { fetchWikipediaTranslations } from './translate-wikipedia';
import { translateDeepL, isSupportedByDeepL, getDeepLUsage } from './translate-deepl';
import { bulkTranslateArgos, isSupportedByArgos } from './translate-argos';

const TARGET_LANGS = ['ar', 'fa', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'el', 'zh', 'ja', 'ko', 'hi', 'id', 'th', 'ms', 'ru'];
// EN ve TR zaten dolu

interface TranslationSource {
  glossary?: string;
  wikipedia?: string;
  deepl?: string;
  argos?: string;
  manual?: string;
}

interface TranslatedTerm {
  id: string;
  source: string; // EN
  translations: Record<string, { text: string; source: keyof TranslationSource }>;
}

/**
 * Glossary'den önce kontrol et.
 */
function lookupGlossary(term: string): Record<string, string> | null {
  const glossaryPath = path.join(__dirname, 'aviation-glossary.json');
  const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
  const match = glossary.terms.find(
    (t: any) => t.translations.en.toLowerCase() === term.toLowerCase(),
  );
  return match ? match.translations : null;
}

/**
 * Bir terim için tam çeviri pipeline.
 */
export async function translateTerm(
  termEn: string,
  options: { deeplApiKey?: string; useArgos?: boolean } = {},
): Promise<Record<string, { text: string; source: keyof TranslationSource }>> {
  const result: Record<string, { text: string; source: keyof TranslationSource }> = {};

  // Layer 1: Glossary (en kaliteli, anlık)
  const glossary = lookupGlossary(termEn);
  if (glossary) {
    for (const lang of TARGET_LANGS) {
      if (glossary[lang]) {
        result[lang] = { text: glossary[lang], source: 'glossary' };
      }
    }
  }

  // Layer 2: Wikipedia (eksikleri doldur)
  const missingAfterGlossary = TARGET_LANGS.filter((l) => !result[l]);
  if (missingAfterGlossary.length > 0) {
    try {
      const wiki = await fetchWikipediaTranslations(termEn);
      for (const lang of missingAfterGlossary) {
        if (wiki[lang]) {
          result[lang] = { text: wiki[lang], source: 'wikipedia' };
        }
      }
    } catch (e) {
      // Wikipedia başarısız — devam
    }
  }

  // Layer 3: DeepL (eksikleri doldur)
  const missingAfterWiki = TARGET_LANGS.filter((l) => !result[l]);
  if (options.deeplApiKey && missingAfterWiki.length > 0) {
    for (const lang of missingAfterWiki) {
      if (!isSupportedByDeepL(lang)) continue;
      try {
        const [translated] = await translateDeepL([termEn], lang, options.deeplApiKey);
        if (translated) {
          result[lang] = { text: translated, source: 'deepl' };
        }
      } catch (e) {
        // DeepL quota dolmuş veya başarısız — devam
      }
    }
  }

  // Layer 4: Argos (kalan dilleri doldur)
  const missingAfterDeepL = TARGET_LANGS.filter((l) => !result[l]);
  if (options.useArgos && missingAfterDeepL.length > 0) {
    for (const lang of missingAfterDeepL) {
      if (!isSupportedByArgos(lang)) continue;
      try {
        const [translated] = await bulkTranslateArgos([termEn], lang);
        if (translated) {
          result[lang] = { text: translated, source: 'argos' };
        }
      } catch (e) {
        // Argos başarısız (paket kurulu değil?) — devam
      }
    }
  }

  return result;
}

/**
 * Pipeline çalıştırıcı — vocab, ui-strings, exam dosyalarını işler.
 */
export async function runPipeline(target: string): Promise<void> {
  const deeplApiKey = process.env.DEEPL_API_KEY;
  const useArgos = process.env.USE_ARGOS !== 'false';

  console.log('🚀 AirSpeak Bedava Çeviri Pipeline\n');
  console.log(`Hedef: ${target}`);
  console.log(`DeepL: ${deeplApiKey ? '✅' : '❌ (DEEPL_API_KEY yok)'}`);
  console.log(`Argos: ${useArgos ? '✅' : '❌ (USE_ARGOS=false)'}`);

  if (deeplApiKey) {
    const usage = await getDeepLUsage(deeplApiKey);
    console.log(`DeepL kota: ${usage.characterCount.toLocaleString()} / ${usage.characterLimit.toLocaleString()} (%${usage.percentUsed})`);
  }
  console.log('');

  switch (target) {
    case 'ui-strings':
      await pipelineUiStrings({ deeplApiKey, useArgos });
      break;
    case 'vocab':
      await pipelineVocab({ deeplApiKey, useArgos });
      break;
    case 'exams':
      console.log('⚠️ Exam pipeline yapım aşamasında');
      break;
    case 'all':
      await pipelineUiStrings({ deeplApiKey, useArgos });
      await pipelineVocab({ deeplApiKey, useArgos });
      break;
    default:
      console.log('Geçerli target: ui-strings | vocab | exams | all');
  }
}

/**
 * UI strings çeviri — src/locales/{lang}.json doldurma.
 */
async function pipelineUiStrings(opts: { deeplApiKey?: string; useArgos: boolean }): Promise<void> {
  console.log('📝 UI Strings → 18 dil...');
  const enJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/locales/en.json'), 'utf8'));

  // Recursive flatten
  const flatten = (obj: any, prefix = ''): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') out[key] = v;
      else if (typeof v === 'object' && v) Object.assign(out, flatten(v, key));
    }
    return out;
  };

  const flatStrings = flatten(enJson);
  const keys = Object.keys(flatStrings);
  const values = Object.values(flatStrings);
  console.log(`  ${keys.length} string × 18 dil = ${keys.length * 18} çeviri\n`);

  for (const lang of TARGET_LANGS) {
    console.log(`  → ${lang}...`);
    const translatedFlat: Record<string, string> = {};
    let usedSource = '';

    // DeepL desteklerse hızlı batch
    if (opts.deeplApiKey && isSupportedByDeepL(lang)) {
      try {
        const translated = await translateDeepL(values, lang, opts.deeplApiKey);
        keys.forEach((k, i) => (translatedFlat[k] = translated[i] ?? values[i]!));
        usedSource = 'DeepL';
      } catch (e) {
        console.log(`    DeepL başarısız: ${e}`);
      }
    }

    // Argos fallback
    if (Object.keys(translatedFlat).length === 0 && opts.useArgos && isSupportedByArgos(lang)) {
      try {
        const translated = await bulkTranslateArgos(values, lang);
        keys.forEach((k, i) => (translatedFlat[k] = translated[i] ?? values[i]!));
        usedSource = 'Argos';
      } catch (e) {
        console.log(`    Argos başarısız: ${e}`);
      }
    }

    if (Object.keys(translatedFlat).length === 0) {
      console.log(`    ❌ ${lang} atlandı (çeviri kaynağı yok)`);
      continue;
    }

    // Unflatten geri yapı
    const nested: any = {};
    for (const [k, v] of Object.entries(translatedFlat)) {
      const parts = k.split('.');
      let cur = nested;
      parts.forEach((p, i) => {
        if (i === parts.length - 1) cur[p] = v;
        else cur = cur[p] = cur[p] ?? {};
      });
    }

    const outputPath = path.join(__dirname, `../../src/locales/${lang}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(nested, null, 2));
    console.log(`    ✅ ${lang} (${usedSource}) → ${outputPath}`);
  }

  console.log(`\n✅ UI strings pipeline tamamlandı`);
}

/**
 * Vocab çeviri — vocabulary terms i18n alanı doldur.
 */
async function pipelineVocab(opts: { deeplApiKey?: string; useArgos: boolean }): Promise<void> {
  console.log('📚 Vocab terms → 18 dil...');
  console.log('  ⚠️ Bu pipeline 1300 terim × 18 dil çevirir — 1-3 saat sürebilir');
  console.log('  Önce küçük subset ile test et: --target vocab --limit 50\n');

  // Demo: ilk 5 terim
  const sampleTerms = ['cockpit', 'runway', 'takeoff', 'landing', 'turbulence'];
  const outputPath = path.join(__dirname, 'translated-output/vocab-sample.json');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const results: Record<string, any> = {};
  for (const term of sampleTerms) {
    console.log(`  → "${term}"...`);
    const translations = await translateTerm(term, opts);
    results[term] = translations;
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Sample vocab translations → ${outputPath}`);
  console.log('Tam pipeline için bu fonksiyonu PILOT_VOCAB_FAZ1 üzerinde döndür.');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const targetIdx = args.indexOf('--target');
  const target = targetIdx !== -1 ? args[targetIdx + 1] : 'all';
  runPipeline(target ?? 'all').catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

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
    case 'placement-long':
      await pipelinePlacementLong({ deeplApiKey, useArgos });
      break;
    case 'interview-detailed':
      await pipelineInterviewDetailed({ deeplApiKey, useArgos });
      break;
    case 'vocab-rich':
      await pipelineVocabRich({ deeplApiKey, useArgos });
      break;
    case 'all':
      await pipelineUiStrings({ deeplApiKey, useArgos });
      await pipelineVocab({ deeplApiKey, useArgos });
      break;
    default:
      console.log('Geçerli target: ui-strings | vocab | exams | placement-long | interview-detailed | vocab-rich | all');
  }
}

/**
 * Generic uzun-metin pipeline — TR kaynak metinleri 18 dile çevir.
 *
 * Kaynak: { id: string; tr: string }[]
 * Output: scripts/i18n/translated-output/{slug}.json
 *   {
 *     "<id>": { "tr": "...", "ar": "...", "de": "...", ... }
 *   }
 *
 * DeepL kotasında sığarsa onu kullanır, taşarsa kalanı Argos'a düşer.
 * Mevcut output JSON'unda zaten dolu olan diller atlanır (resume desteği).
 */
async function translateLongTextPipeline(
  slug: string,
  emoji: string,
  label: string,
  items: { id: string; tr: string }[],
  opts: { deeplApiKey?: string; useArgos: boolean },
): Promise<void> {
  console.log(`${emoji} ${label} → 18 dil...`);
  console.log(`  ${items.length} öğe × 18 dil = ${items.length * 18} çeviri`);

  const totalChars = items.reduce((s, it) => s + it.tr.length, 0);
  console.log(`  Kaynak hacim: ${totalChars.toLocaleString()} karakter`);
  console.log(`  18 dil hedef: ~${(totalChars * 18).toLocaleString()} karakter\n`);

  const outputDir = path.join(__dirname, 'translated-output');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${slug}.json`);

  // Resume: var olan output'u oku
  const existing: Record<string, Record<string, string>> = fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, 'utf8'))
    : {};

  // TR kaynak her id için sabit
  for (const it of items) {
    existing[it.id] = existing[it.id] ?? {};
    existing[it.id]!.tr = it.tr;
  }

  for (const lang of TARGET_LANGS) {
    // Bu dilde hangi id'ler eksik?
    const missing = items.filter((it) => !existing[it.id]?.[lang]);
    if (missing.length === 0) {
      console.log(`  ✓ ${lang} zaten tam (${items.length}/${items.length})`);
      continue;
    }
    console.log(`  → ${lang} (${missing.length} eksik)...`);
    const sources = missing.map((m) => m.tr);
    let translated: string[] | null = null;
    let usedSource = '';

    // DeepL once dene
    if (opts.deeplApiKey && isSupportedByDeepL(lang)) {
      try {
        translated = await translateDeepL(sources, lang, opts.deeplApiKey);
        usedSource = 'DeepL';
      } catch (e) {
        console.log(`    DeepL başarısız (${(e as Error).message.slice(0, 60)}), Argos'a düşülüyor`);
      }
    }

    // Argos fallback
    if (!translated && opts.useArgos && isSupportedByArgos(lang)) {
      try {
        translated = await bulkTranslateArgos(sources, lang);
        usedSource = 'Argos';
      } catch (e) {
        console.log(`    Argos da başarısız: ${(e as Error).message.slice(0, 80)}`);
      }
    }

    if (!translated) {
      console.log(`    ❌ ${lang} atlandı (kaynak yok)`);
      continue;
    }

    missing.forEach((it, i) => {
      existing[it.id]![lang] = translated![i] ?? it.tr;
    });

    // Her dilden sonra disk'e yaz (resume güvenliği)
    fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2));
    console.log(`    ✅ ${lang} (${usedSource}) yazıldı`);
  }

  console.log(`\n✅ ${label} pipeline tamamlandı → ${outputPath}`);
}

/**
 * Placement test 22 sorusunun explanationLongTr alanını 18 dile çevir.
 */
async function pipelinePlacementLong(opts: { deeplApiKey?: string; useArgos: boolean }): Promise<void> {
  const mod: any = await import('../../src/features/placement/questions');
  const PLACEMENT_QUESTIONS: any[] = mod.PLACEMENT_QUESTIONS ?? mod.default?.PLACEMENT_QUESTIONS ?? [];
  const items = PLACEMENT_QUESTIONS.filter((q: any) => q.explanationLongTr).map((q: any) => ({
    id: q.id,
    tr: q.explanationLongTr,
  }));
  if (items.length === 0) {
    console.log('⚠️ explanationLongTr olan placement question yok');
    return;
  }
  await translateLongTextPipeline('placement-long', '📚', 'Placement Long Explanations', items, opts);
}

/**
 * Mülakat sorularının detailedExplanationTr alanını 18 dile çevir.
 * INTERVIEW_QUESTIONS modülünden okur (tüm dosyalar zaten merge'lenmiş).
 * Henüz inject edilmemiş içerik content/output/interview-detailed.json'dan eklenir.
 */
async function pipelineInterviewDetailed(opts: {
  deeplApiKey?: string;
  useArgos: boolean;
}): Promise<void> {
  const mod: any = await import('../../src/features/exams/interviewQuestions');
  const INTERVIEW_QUESTIONS: any[] = mod.INTERVIEW_QUESTIONS ?? mod.default?.INTERVIEW_QUESTIONS ?? [];
  const items: { id: string; tr: string }[] = INTERVIEW_QUESTIONS
    .filter((q: any) => q.detailedExplanationTr)
    .map((q: any) => ({ id: q.id, tr: q.detailedExplanationTr }));

  // Henüz inject edilmemiş üretim
  const outputJson = path.join(__dirname, '../content/output/interview-detailed.json');
  if (fs.existsSync(outputJson)) {
    const data = JSON.parse(fs.readFileSync(outputJson, 'utf8'));
    if (Array.isArray(data.items)) {
      for (const it of data.items as { id: string; text: string }[]) {
        if (!items.find((x) => x.id === it.id)) {
          items.push({ id: it.id, tr: it.text });
        }
      }
    }
  }

  if (items.length === 0) {
    console.log('⚠️ detailedExplanationTr olan mülakat sorusu bulunamadı');
    return;
  }
  await translateLongTextPipeline(
    'interview-detailed',
    '💼',
    'Interview Detailed Explanations',
    items,
    opts,
  );
}

/**
 * Vocab terimlerinin richDefinitionTr alanını 18 dile çevir.
 * Tüm rolün vocab seed'lerinden import + üretilmiş output birleştir.
 */
async function pipelineVocabRich(opts: {
  deeplApiKey?: string;
  useArgos: boolean;
}): Promise<void> {
  const items: { id: string; tr: string }[] = [];

  const seedNames = ['pilotVocab', 'cabinVocab', 'technicianVocab', 'groundVocab', 'studentVocab'];
  const seedExports = ['PILOT_VOCAB_FAZ1', 'CABIN_VOCAB_FAZ1', 'TECHNICIAN_VOCAB_FAZ1', 'GROUND_VOCAB_FAZ1', 'STUDENT_VOCAB_FAZ1'];
  for (let i = 0; i < seedNames.length; i++) {
    const mod: any = await import(`../../src/features/lessons/seed/${seedNames[i]}`);
    const exportName = seedExports[i]!;
    const arr: any[] = mod[exportName] ?? mod.default?.[exportName] ?? [];
    for (const v of arr) {
      if (v.richDefinitionTr && !items.find((x) => x.id === v.id)) {
        items.push({ id: v.id, tr: v.richDefinitionTr });
      }
    }
  }

  // Henüz inject edilmemiş üretim
  const outputJson = path.join(__dirname, '../content/output/vocab-rich.json');
  if (fs.existsSync(outputJson)) {
    const data = JSON.parse(fs.readFileSync(outputJson, 'utf8'));
    if (Array.isArray(data.items)) {
      for (const it of data.items as { id: string; text: string }[]) {
        if (!items.find((x) => x.id === it.id)) {
          items.push({ id: it.id, tr: it.text });
        }
      }
    }
  }

  if (items.length === 0) {
    console.log('⚠️ richDefinitionTr olan vocab terimi bulunamadı');
    return;
  }
  await translateLongTextPipeline('vocab-rich', '📚', 'Vocab Rich Definitions', items, opts);
}

/**
 * TS kaynak dosyasından `id: '...'` ve `<field>: '...'` veya template literal
 * alanlarını eşleştirip { id, tr } listesi çıkarır. Basit regex tabanlı,
 * AST kullanmadan — kaynak dosyalar düzenli format kullanıyor.
 */
function extractIdAndField(source: string, field: string): { id: string; tr: string }[] {
  const out: { id: string; tr: string }[] = [];
  // Object literal'leri kabaca yakala: id: '...' den sonraki ilk <field>: ...
  // Hem '...', "..." hem `...` (template literal) destekler.
  //
  // Önemli: placement options (`{ id: 'a', text: '...' }`) gibi nested ID'leri
  // yakalama — onlarda hemen `text:` gelir veya ID 1 karakter (a/b/c/d).
  const objectRe = /id:\s*['"`]([^'"`]+)['"`][\s\S]*?(?=\bid:\s*['"`]|\Z)/g;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = objectRe.exec(source)) !== null) {
    const id = match[1]!;
    const block = match[0]!;

    // Filtre 1: çok kısa ID = nested option (a/b/c/d)
    if (id.length < 2) continue;

    // Filtre 2: aynı satırda `text:` varsa nested option literal'i
    const firstLine = block.split('\n')[0]!;
    if (/text:\s*['"`]/.test(firstLine)) continue;

    // Filtre 3: aynı id daha önce görüldüyse (nested duplicate)
    if (seen.has(id)) continue;
    seen.add(id);

    const fieldRe = new RegExp(`${field}:\\s*([\`'\"])([\\s\\S]*?)(?<!\\\\)\\1`);
    const fieldMatch = block.match(fieldRe);
    if (fieldMatch && fieldMatch[2]) {
      out.push({ id, tr: fieldMatch[2] });
    }
  }
  return out;
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

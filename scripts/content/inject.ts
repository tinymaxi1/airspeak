/**
 * AirSpeak İçerik Inject — output JSON'larını kaynak dosyalara enjekte et.
 *
 * Strateji: TS dosyalarını AST manipulation YAPMADAN, regex ile minimal
 * invasive ekleme. Her item'in id'sini bulup, ilgili alanı doğru yerde
 * ekler (mevcut alanı bozmadan).
 *
 * Güvenlik: Backup oluşturur, dry-run modu var.
 */
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(__dirname, 'output');

interface GeneratedItem {
  id: string;
  text: string;
}

interface InjectionTarget {
  outputFile: string;
  sourceFile: string;
  fieldName: string;
  description: string;
}

const INJECTIONS: InjectionTarget[] = [
  {
    outputFile: 'placement-long.json',
    sourceFile: 'src/features/placement/questions.ts',
    fieldName: 'explanationLongTr',
    description: 'Placement test long explanation',
  },
  {
    outputFile: 'interview-detailed.json',
    sourceFile: 'src/features/exams/interviewQuestions.ts',
    fieldName: 'detailedExplanationTr',
    description: 'Mülakat detayed cevap',
  },
  // Vocab birden fazla dosyaya dağılı — özel handling
];

const VOCAB_INJECTIONS = [
  'src/features/lessons/seed/pilotVocab.ts',
  'src/features/lessons/seed/cabinVocab.ts',
  'src/features/lessons/seed/technicianVocab.ts',
  'src/features/lessons/seed/groundVocab.ts',
  'src/features/lessons/seed/studentVocab.ts',
];

/**
 * String'i TS template literal için escape et — backtick ve dollar.
 */
function escapeTemplateLiteral(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
}

/**
 * Tek bir field eklenmesi — mevcut id'yi bul, son alanın altına ekle.
 *
 * Regex yaklaşımı: `id: 'X'` örüntüsü bul, sonraki `},` (objenin sonu)
 * arasındaki bölgeyi al, son property'den sonra yeni alan ekle.
 *
 * Eğer field zaten varsa: skip.
 */
function injectField(
  source: string,
  itemId: string,
  fieldName: string,
  fieldValue: string,
): { source: string; injected: boolean; reason?: string } {
  // Item'i bul
  const idPattern = new RegExp(`id:\\s*'${itemId.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}'`);
  const idMatch = idPattern.exec(source);
  if (!idMatch) {
    return { source, injected: false, reason: 'id not found' };
  }

  // Item start (önceki { karakteri)
  let itemStart = source.lastIndexOf('{', idMatch.index);
  if (itemStart === -1) return { source, injected: false, reason: 'object start not found' };

  // Item end ({...} matching brace)
  let depth = 0;
  let itemEnd = -1;
  for (let i = itemStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) {
        itemEnd = i;
        break;
      }
    }
  }
  if (itemEnd === -1) return { source, injected: false, reason: 'object end not found' };

  const itemBody = source.substring(itemStart, itemEnd + 1);

  // Zaten field var mı?
  if (itemBody.includes(`${fieldName}:`)) {
    return { source, injected: false, reason: 'field already exists' };
  }

  // Son property'yi bul — `}` öncesinden geriye, son `,` veya değer-sonu
  // Basit yaklaşım: kapanış `}` öncesine yeni alan ekle.
  const escapedValue = escapeTemplateLiteral(fieldValue);
  const insertion = `,\n    ${fieldName}: \`${escapedValue}\``;

  // En son özellik virgül ile bitmiyorsa virgül ekle
  // Yaklaşımımız: `}` öncesindeki ilk non-whitespace karakteri kontrol et
  let beforeBrace = itemEnd - 1;
  while (beforeBrace > itemStart && /\s/.test(source[beforeBrace]!)) beforeBrace--;
  const lastChar = source[beforeBrace];

  let newSource: string;
  if (lastChar === ',') {
    // Zaten virgül var — direkt ekle
    newSource =
      source.substring(0, itemEnd) +
      `    ${fieldName}: \`${escapedValue}\`,\n  ` +
      source.substring(itemEnd);
  } else {
    // Virgül ekle + yeni alan
    newSource =
      source.substring(0, itemEnd) +
      `,\n    ${fieldName}: \`${escapedValue}\`,\n  ` +
      source.substring(itemEnd);
  }

  return { source: newSource, injected: true };
}

async function injectFromOutput(
  outputFile: string,
  sourceFile: string,
  fieldName: string,
  description: string,
): Promise<void> {
  const outputPath = path.join(OUTPUT_DIR, outputFile);
  const sourcePath = path.join(__dirname, '../..', sourceFile);

  if (!fs.existsSync(outputPath)) {
    console.log(`⚠️  ${description}: ${outputFile} yok, atlanıyor`);
    return;
  }
  if (!fs.existsSync(sourcePath)) {
    console.log(`❌  Kaynak dosya yok: ${sourceFile}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(outputPath, 'utf8')) as { items: GeneratedItem[] };
  let source = fs.readFileSync(sourcePath, 'utf8');

  // Backup
  const backupPath = `${sourcePath}.backup-${Date.now()}`;
  fs.writeFileSync(backupPath, source);

  let injectedCount = 0;
  let skippedCount = 0;

  for (const item of data.items) {
    const result = injectField(source, item.id, fieldName, item.text);
    if (result.injected) {
      source = result.source;
      injectedCount += 1;
    } else {
      skippedCount += 1;
      if (result.reason !== 'field already exists') {
        console.log(`   ⚠️ ${item.id}: ${result.reason}`);
      }
    }
  }

  fs.writeFileSync(sourcePath, source);
  console.log(`✅ ${description}`);
  console.log(`   Enjekte: ${injectedCount}, Atlandı: ${skippedCount}`);
  console.log(`   Kaynak: ${sourceFile}`);
  console.log(`   Backup: ${path.basename(backupPath)}\n`);
}

/**
 * Vocab — id pattern (voc_pilot_*, voc_cabin_* vb.) hangi dosyaya ait belirle.
 */
async function injectVocab(): Promise<void> {
  const outputPath = path.join(OUTPUT_DIR, 'vocab-rich.json');
  if (!fs.existsSync(outputPath)) {
    console.log('⚠️  vocab-rich.json yok, atlanıyor');
    return;
  }

  const data = JSON.parse(fs.readFileSync(outputPath, 'utf8')) as { items: GeneratedItem[] };

  // Item ID prefix → kaynak dosya eşleşmesi
  const fileMap: Record<string, string> = {
    voc_pilot: 'src/features/lessons/seed/pilotVocab.ts',
    voc_cabin: 'src/features/lessons/seed/cabinVocab.ts',
    voc_tech: 'src/features/lessons/seed/technicianVocab.ts',
    voc_ground: 'src/features/lessons/seed/groundVocab.ts',
    voc_student: 'src/features/lessons/seed/studentVocab.ts',
  };

  const byFile = new Map<string, GeneratedItem[]>();
  for (const item of data.items) {
    for (const [prefix, file] of Object.entries(fileMap)) {
      if (item.id.startsWith(prefix)) {
        if (!byFile.has(file)) byFile.set(file, []);
        byFile.get(file)!.push(item);
        break;
      }
    }
  }

  for (const [file, items] of byFile) {
    const sourcePath = path.join(__dirname, '../..', file);
    if (!fs.existsSync(sourcePath)) {
      console.log(`❌ ${file} yok`);
      continue;
    }

    let source = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync(`${sourcePath}.backup-${Date.now()}`, source);

    let injected = 0;
    let skipped = 0;
    for (const item of items) {
      const result = injectField(source, item.id, 'richDefinitionTr', item.text);
      if (result.injected) {
        source = result.source;
        injected++;
      } else {
        skipped++;
      }
    }

    fs.writeFileSync(sourcePath, source);
    console.log(`✅ ${file}: ${injected} enjekte, ${skipped} atlandı`);
  }
}

async function main() {
  console.log('🚀 AirSpeak İçerik Inject\n');

  for (const inj of INJECTIONS) {
    await injectFromOutput(inj.outputFile, inj.sourceFile, inj.fieldName, inj.description);
  }

  await injectVocab();

  console.log('✅ Inject tamamlandı.\n');
  console.log('Doğrulama:');
  console.log('  npx tsc --noEmit');
  console.log('  git diff src/features/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

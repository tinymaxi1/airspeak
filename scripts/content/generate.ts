/**
 * AirSpeak İçerik Üretim — Master Orchestrator
 *
 * Kullanım:
 *   npm run content:placement-long       (5 kalan placement)
 *   npm run content:interview-detailed   (151 mülakat)
 *   npm run content:vocab-rich           (1297 vocab)
 *   npm run content:all
 *
 * Resume support: yarıda kalırsa output/{type}.json'dan devam.
 */
import fs from 'fs';
import path from 'path';
import { getProvider, type ContentProvider } from './providers';
import {
  buildPlacementLongPrompt,
  buildInterviewDetailedPrompt,
  buildVocabRichPrompt,
} from './prompts';

const OUTPUT_DIR = path.join(__dirname, 'output');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

interface GeneratedItem {
  id: string;
  generatedAt: string;
  text: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
}

interface RunStats {
  type: string;
  totalTargets: number;
  alreadyDone: number;
  generated: number;
  totalCostUsd: number;
  totalTokensIn: number;
  totalTokensOut: number;
  startedAt: string;
  finishedAt?: string;
}

/**
 * Output dosyasını oku — resume support için.
 */
function loadExisting(outputFile: string): Map<string, GeneratedItem> {
  if (!fs.existsSync(outputFile)) return new Map();
  const data = JSON.parse(fs.readFileSync(outputFile, 'utf8')) as { items: GeneratedItem[] };
  return new Map(data.items.map((i) => [i.id, i]));
}

function saveOutput(outputFile: string, items: GeneratedItem[], stats: RunStats): void {
  fs.writeFileSync(outputFile, JSON.stringify({ stats, items }, null, 2));
}

/**
 * Rate limit + checkpoint loop — her N içerikte bir kaydet.
 */
async function runBatch<T extends { id: string }>(
  type: string,
  targets: T[],
  buildPrompt: (t: T) => string,
  provider: ContentProvider,
  options: { delayMs?: number; checkpointEvery?: number } = {},
): Promise<void> {
  const { delayMs = 1300, checkpointEvery = 5 } = options;
  const outputFile = path.join(OUTPUT_DIR, `${type}.json`);

  const existing = loadExisting(outputFile);
  const remaining = targets.filter((t) => !existing.has(t.id));

  console.log(`\n📦 ${type}`);
  console.log(`   Toplam hedef: ${targets.length}`);
  console.log(`   Daha önce üretildi: ${existing.size}`);
  console.log(`   Kalan: ${remaining.length}`);
  console.log(`   Tahmini süre: ${Math.round((remaining.length * (delayMs + 5000)) / 60000)} dk`);
  console.log(`   Tahmini maliyet: ~$${(remaining.length * 0.005).toFixed(2)}\n`);

  if (remaining.length === 0) {
    console.log(`   ✅ Hepsi tamamlandı, çıktı: ${outputFile}\n`);
    return;
  }

  const stats: RunStats = {
    type,
    totalTargets: targets.length,
    alreadyDone: existing.size,
    generated: 0,
    totalCostUsd: 0,
    totalTokensIn: 0,
    totalTokensOut: 0,
    startedAt: new Date().toISOString(),
  };
  const items = Array.from(existing.values());

  for (let i = 0; i < remaining.length; i++) {
    const target = remaining[i]!;
    process.stdout.write(`   [${i + 1}/${remaining.length}] ${target.id}... `);

    try {
      const result = await provider.generate(buildPrompt(target));

      const item: GeneratedItem = {
        id: target.id,
        generatedAt: new Date().toISOString(),
        text: result.text,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        costUsd: result.costUsd,
      };
      items.push(item);
      stats.generated += 1;
      stats.totalCostUsd += result.costUsd;
      stats.totalTokensIn += result.tokensIn;
      stats.totalTokensOut += result.tokensOut;

      console.log(`✅ ${result.tokensOut}t → $${result.costUsd.toFixed(4)} (cum: $${stats.totalCostUsd.toFixed(2)})`);
    } catch (e) {
      console.log(`❌ ${(e as Error).message}`);
    }

    // Checkpoint
    if ((i + 1) % checkpointEvery === 0) {
      saveOutput(outputFile, items, stats);
    }

    // Rate limit (Anthropic tier 1: 50 req/dk)
    if (i < remaining.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  stats.finishedAt = new Date().toISOString();
  saveOutput(outputFile, items, stats);

  console.log(`\n   ✅ ${type} tamamlandı`);
  console.log(`      Üretilen: ${stats.generated}`);
  console.log(`      Toplam maliyet: $${stats.totalCostUsd.toFixed(2)}`);
  console.log(`      Output: ${outputFile}\n`);
}

/**
 * Kaynak dosyaları oku, hedef listesi üret.
 */
async function getPlacementTargets(): Promise<any[]> {
  const { PLACEMENT_QUESTIONS } = await import('../../src/features/placement/questions');
  return PLACEMENT_QUESTIONS.filter((q: any) => !q.explanationLongTr);
}

async function getInterviewTargets(): Promise<any[]> {
  const { INTERVIEW_QUESTIONS } = await import('../../src/features/exams/interviewQuestions');
  return INTERVIEW_QUESTIONS.filter((q: any) => !q.detailedExplanationTr);
}

async function getVocabTargets(): Promise<any[]> {
  const { PILOT_VOCAB_FAZ1 } = await import('../../src/features/lessons/seed/pilotVocab');
  const { CABIN_VOCAB_FAZ1 } = await import('../../src/features/lessons/seed/cabinVocab');
  const { TECHNICIAN_VOCAB_FAZ1 } = await import('../../src/features/lessons/seed/technicianVocab');
  const { GROUND_VOCAB_FAZ1 } = await import('../../src/features/lessons/seed/groundVocab');
  const { STUDENT_VOCAB_FAZ1 } = await import('../../src/features/lessons/seed/studentVocab');
  const all = [
    ...PILOT_VOCAB_FAZ1,
    ...CABIN_VOCAB_FAZ1,
    ...TECHNICIAN_VOCAB_FAZ1,
    ...GROUND_VOCAB_FAZ1,
    ...STUDENT_VOCAB_FAZ1,
  ];
  return all.filter((t: any) => !t.richDefinitionTr);
}

async function main() {
  const target = process.argv[2] ?? 'all';
  const provider = getProvider();

  console.log('🚀 AirSpeak İçerik Üretim Pipeline');
  console.log(`   Provider: ${provider.name}`);
  console.log(`   Hedef: ${target}\n`);

  if (target === 'placement-long' || target === 'all') {
    const targets = await getPlacementTargets();
    await runBatch('placement-long', targets, buildPlacementLongPrompt, provider);
  }

  if (target === 'interview-detailed' || target === 'all') {
    const targets = await getInterviewTargets();
    await runBatch('interview-detailed', targets, buildInterviewDetailedPrompt, provider);
  }

  if (target === 'vocab-rich' || target === 'all') {
    const targets = await getVocabTargets();
    await runBatch('vocab-rich', targets, buildVocabRichPrompt, provider);
  }

  console.log('\n✅ Tamamlandı!');
  console.log('Sonraki adım: npm run content:inject — output\'u kaynak dosyalara enjekte et\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

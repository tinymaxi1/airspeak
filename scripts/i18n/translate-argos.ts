/**
 * Argos Translate offline çeviri wrapper.
 *
 * Argos Translate açık kaynak, %100 ücretsiz, yerel makinede çalışır.
 * Sınırsız çeviri, ama kalite DeepL'den biraz düşük.
 *
 * Kurulum:
 *   pip install argostranslate
 *   python scripts/i18n/install-argos-langs.py  (dil paketleri indir)
 *
 * Bizden istenen 20 dilden Argos destekleyenler:
 * en, tr, ar, fa, de, fr, es, it, pt, nl, pl, el, zh, ja, ko, hi, id, ru
 * (th, ms paketi şu an yok — Argos'ta gelecek)
 *
 * Bu TypeScript wrapper Python subprocess çağırır.
 */
import { spawn } from 'child_process';

export const ARGOS_SUPPORTED = [
  'en', 'tr', 'ar', 'fa', 'de', 'fr', 'es', 'it', 'pt', 'nl',
  'pl', 'el', 'zh', 'ja', 'ko', 'hi', 'id', 'ru',
];

const ARGOS_UNSUPPORTED = ['th', 'ms'];

export function isSupportedByArgos(lang: string): boolean {
  return !ARGOS_UNSUPPORTED.includes(lang);
}

/**
 * Bir metni Argos ile çevir.
 * Python subprocess çağırır — ilk çağrı yavaş (~2sn model load),
 * sonrakiler hızlı (~50ms/metin).
 */
export function translateArgos(
  text: string,
  targetLang: string,
  sourceLang: string = 'en',
): Promise<string> {
  if (!isSupportedByArgos(targetLang)) {
    return Promise.reject(new Error(`Argos ${targetLang} desteklemiyor`));
  }

  const pythonScript = `
import argostranslate.translate
import sys
text = sys.stdin.read()
print(argostranslate.translate.translate(text, '${sourceLang}', '${targetLang}'))
`.trim();

  return new Promise((resolve, reject) => {
    const proc = spawn('python3', ['-c', pythonScript]);
    let out = '';
    let err = '';
    proc.stdout.on('data', (d) => (out += d));
    proc.stderr.on('data', (d) => (err += d));
    proc.on('close', (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(`Argos failed (${code}): ${err}`));
    });
    proc.stdin.write(text);
    proc.stdin.end();
  });
}

/**
 * Bulk çeviri — Python tarafında loop, daha verimli.
 */
export async function bulkTranslateArgos(
  texts: string[],
  targetLang: string,
  sourceLang: string = 'en',
): Promise<string[]> {
  if (!isSupportedByArgos(targetLang)) {
    throw new Error(`Argos ${targetLang} desteklemiyor`);
  }

  const pythonScript = `
import argostranslate.translate
import json
import sys

input_data = json.loads(sys.stdin.read())
results = []
for text in input_data:
    try:
        results.append(argostranslate.translate.translate(text, '${sourceLang}', '${targetLang}'))
    except Exception as e:
        results.append(text)  # fallback: keep source
print(json.dumps(results))
`.trim();

  return new Promise((resolve, reject) => {
    const proc = spawn('python3', ['-c', pythonScript]);
    let out = '';
    let err = '';
    proc.stdout.on('data', (d) => (out += d));
    proc.stderr.on('data', (d) => (err += d));
    proc.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(out));
        } catch (e) {
          reject(e);
        }
      } else reject(new Error(`Argos failed: ${err}`));
    });
    proc.stdin.write(JSON.stringify(texts));
    proc.stdin.end();
  });
}

if (require.main === module) {
  const text = process.argv[2];
  const target = process.argv[3];
  if (!text || !target) {
    console.log('Usage: ts-node translate-argos.ts "<text>" <lang>');
    process.exit(1);
  }
  translateArgos(text, target)
    .then((r) => console.log(r))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}

/**
 * DeepL Free API ile çeviri.
 *
 * Aylık 500.000 karakter ücretsiz.
 * https://www.deepl.com/pro-api → "DeepL API Free"
 *
 * Kullanım:
 *   DEEPL_API_KEY=xxx ts-node scripts/i18n/translate-deepl.ts "Cleared for takeoff" tr
 *
 * Bulk:
 *   ts-node scripts/i18n/translate-deepl.ts --batch ui-strings.json --target ar
 */
import fs from 'fs';
import https from 'https';

const DEEPL_FREE_HOST = 'api-free.deepl.com';

// DeepL'in desteklediği diller — 20 hedefimizden 16'sı destekleniyor (2024+)
// Desteklenmeyenler: fa (Farsça), hi (Hintçe), th (Tayca), ms (Malayca)
// Bunlar için Argos kullanılır
const DEEPL_LANG_MAP: Record<string, string> = {
  en: 'EN-US', tr: 'TR', ar: 'AR', de: 'DE', fr: 'FR',
  es: 'ES', it: 'IT', pt: 'PT-PT', nl: 'NL', pl: 'PL',
  el: 'EL', zh: 'ZH', ja: 'JA', ko: 'KO', ru: 'RU',
  id: 'ID', // 2024'te eklendi
};

const UNSUPPORTED_BY_DEEPL = ['fa', 'hi', 'th', 'ms'];

export function isSupportedByDeepL(lang: string): boolean {
  return !UNSUPPORTED_BY_DEEPL.includes(lang);
}

interface DeepLResponse {
  translations: Array<{ detected_source_language: string; text: string }>;
  message?: string;
}

/**
 * DeepL Free API'sine tek istek.
 * @param texts — çevrilecek metin(ler) — array gönder, batch ücretsiz
 * @param targetLang — hedef dil (20-dil kodumuzda)
 * @param apiKey — DeepL Free API key
 */
export async function translateDeepL(
  texts: string[],
  targetLang: string,
  apiKey: string,
): Promise<string[]> {
  if (!isSupportedByDeepL(targetLang)) {
    throw new Error(`DeepL ${targetLang} dilini desteklemiyor (Argos kullan)`);
  }

  const deeplLang = DEEPL_LANG_MAP[targetLang];
  if (!deeplLang) throw new Error(`Unknown lang: ${targetLang}`);

  const params = new URLSearchParams();
  texts.forEach((t) => params.append('text', t));
  params.append('target_lang', deeplLang);
  params.append('preserve_formatting', '1');
  // Aviation domain için "more formal" tone
  if (['de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru', 'ja'].includes(targetLang)) {
    params.append('formality', 'more');
  }

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: DEEPL_FREE_HOST,
        path: '/v2/translate',
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(params.toString()),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const data = JSON.parse(body) as DeepLResponse;
            if (data.message) reject(new Error(data.message));
            else resolve(data.translations.map((t) => t.text));
          } catch (e) {
            reject(e);
          }
        });
      },
    );
    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

/**
 * Karakter kullanımı kontrol et — quota tükenmesin.
 */
export async function getDeepLUsage(
  apiKey: string,
): Promise<{ characterCount: number; characterLimit: number; percentUsed: number }> {
  return new Promise((resolve, reject) => {
    https.get(
      {
        host: DEEPL_FREE_HOST,
        path: '/v2/usage',
        headers: { 'Authorization': `DeepL-Auth-Key ${apiKey}` },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve({
              characterCount: data.character_count,
              characterLimit: data.character_limit,
              percentUsed: Math.round((data.character_count / data.character_limit) * 100),
            });
          } catch (e) {
            reject(e);
          }
        });
      },
    );
  });
}

if (require.main === module) {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.error('DEEPL_API_KEY environment variable gerekli');
    console.log('1. https://www.deepl.com/pro-api adresinden Free hesap aç');
    console.log('2. .env dosyasına: DEEPL_API_KEY=...');
    process.exit(1);
  }

  const arg1 = process.argv[2];

  // --usage komutu (target gerekmez)
  if (arg1 === '--usage') {
    getDeepLUsage(apiKey)
      .then((u) => {
        console.log(`Kullanılan: ${u.characterCount.toLocaleString()} / ${u.characterLimit.toLocaleString()} (${u.percentUsed}%)`);
      })
      .catch((e) => {
        console.error('DeepL hatası:', e.message);
        process.exit(1);
      });
  } else {
    // Çeviri komutu — text + target gerekli
    const text = arg1;
    const target = process.argv[3];

    if (!text || !target) {
      console.log('Usage: npm run translate:deepl -- "<text>" <lang>');
      console.log('   Or: npm run translate:usage   (kotayı görmek için)');
      process.exit(1);
    }

    translateDeepL([text], target, apiKey)
      .then((r) => console.log(r[0]))
      .catch((e) => {
        console.error('Çeviri hatası:', e.message);
        process.exit(1);
      });
  }
}

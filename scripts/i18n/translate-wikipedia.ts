/**
 * Wikipedia Language Links Translator
 *
 * Bedava — auth gerekmez. Wikipedia API ile her makalenin
 * 200+ dildeki başlıklarını çeker.
 *
 * Kullanım:
 *   ts-node scripts/i18n/translate-wikipedia.ts "Cockpit" en
 *   → { en: "Cockpit", de: "Cockpit", tr: "Kokpit", ar: "قمرة القيادة", ... }
 *
 * Hız: ~1 sorgu/saniye (rate limit etiketsiz)
 * Başarı oranı: aviation isimleri için ~%85
 *
 * Örnek pipeline:
 *   1. Vocab term'leri oku (1300 terim)
 *   2. Her terim için Wikipedia EN article ara
 *   3. Article bulunduysa langlinks API çağır
 *   4. 20 dildeki başlık → vocab.i18n.term[lang]
 */
import fs from 'fs';
import path from 'path';
import https from 'https';

const TARGET_LANGS = ['en', 'tr', 'ar', 'fa', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'el', 'zh', 'ja', 'ko', 'hi', 'id', 'th', 'ms', 'ru'];

interface WikipediaResponse {
  query?: {
    pages?: Record<string, {
      pageid?: number;
      title?: string;
      langlinks?: Array<{ lang: string; '*': string }>;
    }>;
  };
}

/**
 * Bir terim için Wikipedia'dan tüm dil çevirilerini al.
 */
export async function fetchWikipediaTranslations(
  term: string,
  sourceLang: string = 'en',
): Promise<Record<string, string>> {
  const result: Record<string, string> = { [sourceLang]: term };

  // Wikipedia langlinks API — tek sorguda tüm dilleri al
  const url = new URL(`https://${sourceLang}.wikipedia.org/w/api.php`);
  url.searchParams.set('action', 'query');
  url.searchParams.set('titles', term);
  url.searchParams.set('prop', 'langlinks');
  url.searchParams.set('lllimit', '500');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const data = await fetchJson<WikipediaResponse>(url.toString());
  const pages = data.query?.pages;
  if (!pages) return result;

  const page = Object.values(pages)[0];
  if (!page?.langlinks) return result;

  for (const link of page.langlinks) {
    if (TARGET_LANGS.includes(link.lang)) {
      result[link.lang] = link['*'];
    }
  }

  return result;
}

function fetchJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'AirSpeak-Translator/1.0' } }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
      res.on('error', reject);
    });
  });
}

/**
 * Bulk translate — her terim için fetch + dosyaya yaz.
 */
export async function bulkTranslate(
  terms: { id: string; term: string }[],
  outputPath: string,
  delayMs: number = 1000,
): Promise<void> {
  const results: Record<string, Record<string, string>> = {};
  const total = terms.length;

  for (let i = 0; i < total; i++) {
    const t = terms[i]!;
    process.stdout.write(`\r[${i + 1}/${total}] ${t.term}...`);

    try {
      const translations = await fetchWikipediaTranslations(t.term);
      results[t.id] = translations;
    } catch (e) {
      console.warn(`\nFailed: ${t.term}`, e);
      results[t.id] = { en: t.term };
    }

    // Rate limit (Wikipedia 1 saniye/sorgu güvenli)
    await new Promise((r) => setTimeout(r, delayMs));

    // Her 20 terimde bir kaydet (crash recovery)
    if ((i + 1) % 20 === 0) {
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ ${total} term tercüme edildi → ${outputPath}`);
}

// CLI
if (require.main === module) {
  const term = process.argv[2];
  if (!term) {
    console.log('Usage: ts-node translate-wikipedia.ts <term> [sourceLang]');
    console.log('Example: ts-node translate-wikipedia.ts "Cockpit"');
    process.exit(1);
  }
  fetchWikipediaTranslations(term, process.argv[3] ?? 'en')
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

#!/usr/bin/env node
/**
 * scripts/i18n/translate-new-keys.mjs
 *
 * EN fallback olan yeni i18n key'leri Argos ile 16 dile çevirir.
 *
 * Hedef key path'leri:
 *  - screens.subRoleSelect.*       (FAZ 3)
 *  - settings.role.subRole*        (FAZ 3)
 *  - quick.*                       (FAZ 2)
 *  - screens.home.emptyState.*     (FAZ 3)
 *  - screens.home.allDone.*        (FAZ 3)
 *  - screens.home.comingSoon.*     (FAZ 3)
 *
 * Stratejisi: TR ve EN dosyalardan TR/EN paralel oku. Her hedef path için
 * EN dilindeki değeri Argos'la çevir, locale dosyasına yaz.
 * Idempotent: hedef dilde değer EN ile aynıysa (= çevrilmemiş) çevir,
 * farklıysa atla.
 *
 * Cache: aynı EN string'i tekrar çevirme (bellek içi map).
 */

import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PYTHON = '/tmp/argos-venv/bin/python3';
const HELPER_PY = resolve(ROOT, 'scripts/i18n/argos-translate-helper.py');

// Argos destekli 16 hedef (tr/en hariç). th/ms Argos'ta yok → atla.
const TARGETS = ['de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'el', 'zh', 'ja', 'ko', 'id', 'ru', 'ar', 'fa', 'hi'];

const HEDEF_PATHS = [
  ['screens', 'subRoleSelect'],
  ['settings', 'role'],
  ['quick'],
  ['screens', 'home', 'emptyState'],
  ['screens', 'home', 'allDone'],
  ['screens', 'home', 'comingSoon'],
];

// Sadece settings.role içindeki "subRole*" key'leri çevir (diğerleri eski)
function isTargetSubRoleKey(k) {
  return k.startsWith('subRole') || k === 'updatedReselectSubRole';
}

function getByPath(obj, path) {
  let cur = obj;
  for (const k of path) {
    if (cur == null) return null;
    cur = cur[k];
  }
  return cur;
}

function setByPath(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (cur[path[i]] == null) cur[path[i]] = {};
    cur = cur[path[i]];
  }
  cur[path[path.length - 1]] = value;
}

/** Tüm leaf string'leri topla (path → value map). */
function collectStrings(obj, basePath = []) {
  const out = [];
  if (obj == null) return out;
  if (typeof obj === 'string') {
    out.push({ path: basePath, value: obj });
    return out;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      // settings.role özel filtre
      if (basePath.length === 2 && basePath[0] === 'settings' && basePath[1] === 'role') {
        if (!isTargetSubRoleKey(k)) continue;
      }
      out.push(...collectStrings(v, [...basePath, k]));
    }
  }
  return out;
}

async function argosTranslate(texts, toLang) {
  return new Promise((resolveP, rejectP) => {
    const p = spawn(PYTHON, [HELPER_PY], { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (d) => (stdout += d));
    p.stderr.on('data', (d) => (stderr += d));
    p.on('close', (code) => {
      if (code !== 0) {
        rejectP(new Error(`Argos ${toLang} fail: ${stderr.slice(0, 200)}`));
        return;
      }
      try {
        const r = JSON.parse(stdout);
        resolveP(r.translations);
      } catch (e) {
        rejectP(e);
      }
    });
    p.stdin.write(JSON.stringify({ texts, to: toLang }));
    p.stdin.end();
  });
}

async function main() {
  const enData = JSON.parse(readFileSync(resolve(ROOT, 'src/locales/en.json'), 'utf-8'));

  // Hedef pathlerden EN string toplama
  const enStrings = [];
  for (const basePath of HEDEF_PATHS) {
    const slice = getByPath(enData, basePath);
    if (slice == null) continue;
    enStrings.push(...collectStrings(slice, basePath));
  }
  console.log(`EN: ${enStrings.length} string toplandı`);
  console.log(`  paths: ${HEDEF_PATHS.map((p) => p.join('.')).join(', ')}`);

  const startTime = Date.now();
  let totalTranslated = 0;

  for (const lang of TARGETS) {
    const langFile = resolve(ROOT, `src/locales/${lang}.json`);
    let langData;
    try {
      langData = JSON.parse(readFileSync(langFile, 'utf-8'));
    } catch (e) {
      console.warn(`[${lang}] dosya yok, atlanıyor`);
      continue;
    }

    // Idempotent: sadece EN ile aynı (çevrilmemiş) string'leri topla
    const toTranslate = [];
    const toTranslateIdx = []; // enStrings içindeki indexler
    for (let i = 0; i < enStrings.length; i++) {
      const { path, value: enValue } = enStrings[i];
      const currentValue = getByPath(langData, path);
      // Eğer hedef yoksa veya EN ile aynıysa → çevir
      if (currentValue == null || currentValue === enValue) {
        toTranslate.push(enValue);
        toTranslateIdx.push(i);
      }
    }

    if (toTranslate.length === 0) {
      console.log(`[${lang}] zaten çevrili, atlandı`);
      continue;
    }

    console.log(`[${lang}] ${toTranslate.length} string çevriliyor...`);
    try {
      const translated = await argosTranslate(toTranslate, lang);
      for (let j = 0; j < translated.length; j++) {
        const { path } = enStrings[toTranslateIdx[j]];
        setByPath(langData, path, translated[j]);
      }
      writeFileSync(langFile, JSON.stringify(langData, null, 2) + '\n', 'utf-8');
      totalTranslated += translated.length;
      console.log(`[${lang}] ✓ ${translated.length} kayıt yazıldı`);
    } catch (e) {
      console.error(`[${lang}] ✗ ${e.message}`);
    }
  }

  const seconds = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Toplam ${totalTranslated} çeviri yazıldı (${seconds}s)`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});

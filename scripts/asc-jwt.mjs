#!/usr/bin/env node
/**
 * scripts/asc-jwt.mjs
 *
 * Apple App Store Connect API için ES256 JWT üretir (20 dk validity).
 * Node built-in crypto — extra dep yok.
 *
 * Env vars:
 *   ASC_KEY_ID     örn 76P9F3T6Z6
 *   ASC_ISSUER_ID  örn 464c9ef0-00d2-4f0e-83d7-38c372794dad
 *   ASC_KEY_PATH   örn /Users/.../AuthKey_XXXXXXX.p8
 *
 * Output: stdout JWT string.
 */
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const KEY_ID = process.env.ASC_KEY_ID;
const ISSUER_ID = process.env.ASC_ISSUER_ID;
const KEY_PATH = process.env.ASC_KEY_PATH;

if (!KEY_ID || !ISSUER_ID || !KEY_PATH) {
  console.error('ERROR: ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH env vars gerekli.');
  process.exit(1);
}

const privateKey = readFileSync(KEY_PATH, 'utf-8');

const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
const now = Math.floor(Date.now() / 1000);
const payload = {
  iss: ISSUER_ID,
  iat: now,
  exp: now + 1200,
  aud: 'appstoreconnect-v1',
};

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

const headerB64 = base64url(JSON.stringify(header));
const payloadB64 = base64url(JSON.stringify(payload));
const signingInput = `${headerB64}.${payloadB64}`;

const sign = createSign('SHA256');
sign.update(signingInput);
sign.end();

const signature = sign.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' });
const signatureB64 = signature.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

process.stdout.write(`${signingInput}.${signatureB64}`);

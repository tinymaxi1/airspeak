/**
 * AI provider wrapper — vendor-agnostic content generation.
 *
 * Desteklenen:
 * - Google Gemini (FREE tier 2.0 Flash — 15 RPM, 1500 req/gün, ücretsiz)
 * - Anthropic Claude (Sonnet 4.5 — $3/$15 per 1M tokens)
 *
 * Otomatik seçim: GEMINI_API_KEY > ANTHROPIC_API_KEY
 */
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './prompts';

export interface ContentProvider {
  name: string;
  /** Önerilen rate limit gecikmesi (ms) */
  recommendedDelayMs: number;
  generate(userPrompt: string): Promise<{ text: string; tokensIn: number; tokensOut: number; costUsd: number }>;
}

// ═══════════════════════════════════════════════════════════
// GEMINI (FREE)
// ═══════════════════════════════════════════════════════════

class GeminiProvider implements ContentProvider {
  name = 'gemini-flash-latest';
  /** 6s/req = 10 RPM, free tier ramp-up için güvenli */
  recommendedDelayMs = 6500;
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.5-flash-lite') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(userPrompt: string): Promise<{ text: string; tokensIn: number; tokensOut: number; costUsd: number }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    };

    // Exponential backoff on 429/503 — 3 retry: 30s, 60s, 120s
    const backoffMs = [30000, 60000, 120000];
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= backoffMs.length; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (response.status === 429 || response.status === 503) {
          const wait = backoffMs[attempt] ?? 0;
          if (wait > 0) {
            console.log(`\n     ⏸ ${response.status} rate limit — ${wait / 1000}s bekle...`);
            await new Promise((r) => setTimeout(r, wait));
            continue;
          }
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API ${response.status}: ${errText.substring(0, 200)}`);
        }

        const data = (await response.json()) as {
          candidates?: { content: { parts: { text: string }[] } }[];
          usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number };
        };

        const text = data.candidates?.[0]?.content.parts.map((p) => p.text).join('') ?? '';
        const tokensIn = data.usageMetadata?.promptTokenCount ?? 0;
        const tokensOut = data.usageMetadata?.candidatesTokenCount ?? 0;

        return { text: text.trim(), tokensIn, tokensOut, costUsd: 0 };
      } catch (e) {
        lastError = e as Error;
        if (attempt < backoffMs.length) continue;
      }
    }

    throw lastError ?? new Error('Gemini API failed after retries');
  }
}

// ═══════════════════════════════════════════════════════════
// ANTHROPIC
// ═══════════════════════════════════════════════════════════

class AnthropicProvider implements ContentProvider {
  name = 'anthropic-sonnet-4.5';
  /** Tier 1: 50 RPM = 1.3s güvenli */
  recommendedDelayMs = 1300;
  private client: Anthropic;
  private model: string;
  private readonly INPUT_PRICE_PER_M = 3.0;
  private readonly OUTPUT_PRICE_PER_M = 15.0;

  constructor(apiKey: string, model: string = 'claude-sonnet-4-5-20250929') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generate(userPrompt: string): Promise<{ text: string; tokensIn: number; tokensOut: number; costUsd: number }> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const tokensIn = response.usage.input_tokens;
    const tokensOut = response.usage.output_tokens;
    const costUsd =
      (tokensIn / 1_000_000) * this.INPUT_PRICE_PER_M +
      (tokensOut / 1_000_000) * this.OUTPUT_PRICE_PER_M;

    return { text: text.trim(), tokensIn, tokensOut, costUsd };
  }
}

// ═══════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════

export function getProvider(): ContentProvider {
  // Öncelik: GEMINI (free) > ANTHROPIC (paid)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    console.log('🌟 Provider: Gemini 2.0 Flash (FREE tier)');
    return new GeminiProvider(geminiKey);
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    console.log('🤖 Provider: Anthropic Claude Sonnet 4.5');
    return new AnthropicProvider(anthropicKey);
  }

  console.error('❌ Hiç API key yok!');
  console.log('\nSeçenek 1 — Gemini (ÜCRETSİZ, tavsiye edilen):');
  console.log('  1. https://aistudio.google.com → Get API Key (Google hesap, kart sormuyor)');
  console.log('  2. echo "GEMINI_API_KEY=AIza..." >> .env\n');
  console.log('Seçenek 2 — Anthropic (ücretli, ~$3-5):');
  console.log('  1. https://console.anthropic.com → Sign up + Add credit');
  console.log('  2. echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env\n');
  process.exit(1);
}

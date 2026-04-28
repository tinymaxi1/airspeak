/**
 * AI provider wrapper — vendor-agnostic content generation.
 *
 * Şu an: Anthropic Claude
 * Sonra: Gemini Free tier, OpenAI, DeepSeek alternatifleri eklenebilir
 */
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './prompts';

export interface ContentProvider {
  name: string;
  generate(userPrompt: string): Promise<{ text: string; tokensIn: number; tokensOut: number; costUsd: number }>;
}

class AnthropicProvider implements ContentProvider {
  name = 'anthropic';
  private client: Anthropic;
  private model: string;
  /** Sonnet 4.5 fiyat (USD per 1M tokens) */
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

export function getProvider(): ContentProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY environment variable gerekli');
    console.log('1. https://console.anthropic.com → Sign up (yeni hesap $5 free credit)');
    console.log('2. API Keys → Create');
    console.log('3. echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env');
    process.exit(1);
  }
  return new AnthropicProvider(apiKey);
}

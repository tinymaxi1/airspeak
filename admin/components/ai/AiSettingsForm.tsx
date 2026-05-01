'use client';

/**
 * AiSettingsForm — provider/model/key + limits + test buttons.
 *
 * Mevcut config'i prop olarak alır, server action ile her field update edilir.
 * Optimistic UI: input değişince update + toast.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import {
  updateAiConfig,
  testClaudeKey,
  testOpenAiKey,
  type AiConfigRow,
} from '@/lib/ai/actions';
import { toast } from 'sonner';
import { Bot, Mic, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  rows: AiConfigRow[];
}

function findValue(rows: AiConfigRow[], key: string): any {
  return rows.find((r) => r.key === key)?.value;
}

function unquote(v: any): string {
  if (typeof v !== 'string') return String(v ?? '');
  return v.replace(/^"|"$/g, '');
}

function num(v: any): number {
  return Number(v ?? 0);
}

export function AiSettingsForm({ rows }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const examinerProvider = unquote(findValue(rows, 'ai.examiner_provider')) || 'mock';
  const sttProvider = unquote(findValue(rows, 'ai.stt_provider')) || 'native';
  const examinerModel = unquote(findValue(rows, 'ai.examiner_model')) || 'claude-sonnet-4-5';
  const whisperModel = unquote(findValue(rows, 'ai.whisper_model')) || 'whisper-1';
  const anthropicKey = unquote(findValue(rows, 'ai.anthropic_api_key'));
  const openaiKey = unquote(findValue(rows, 'ai.openai_api_key'));
  const maxAudioSec = num(findValue(rows, 'ai.max_audio_seconds'));
  const dailyCostCap = num(findValue(rows, 'ai.daily_cost_cap_usd'));
  const reviewConfMin = num(findValue(rows, 'ai.review_confidence_min'));

  const [localKeys, setLocalKeys] = useState({
    anthropic: anthropicKey,
    openai: openaiKey,
  });
  const [showKeys, setShowKeys] = useState(false);
  const [testing, setTesting] = useState<'claude' | 'openai' | null>(null);

  function update<T = unknown>(key: string, value: T, label: string) {
    startTransition(async () => {
      const r = await updateAiConfig(key, value);
      if (r.ok) {
        toast.success(`${label} güncellendi`);
        router.refresh();
      } else {
        toast.error(r.error ?? 'Hata');
      }
    });
  }

  async function onTestClaude() {
    setTesting('claude');
    const r = await testClaudeKey();
    setTesting(null);
    if (r.ok) {
      toast.success(`Claude key OK (${r.model})`);
    } else {
      toast.error(`Claude test başarısız: ${r.error?.slice(0, 100) ?? r.status ?? 'unknown'}`);
    }
  }
  async function onTestOpenAi() {
    setTesting('openai');
    const r = await testOpenAiKey();
    setTesting(null);
    if (r.ok) {
      toast.success('OpenAI key OK');
    } else {
      toast.error(`OpenAI test başarısız: ${r.error?.slice(0, 100) ?? r.status ?? 'unknown'}`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Provider selection */}
      <section className="bg-white border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-airspeak-navy" />
          <h2 className="font-bold text-lg">Examiner Provider</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label hint="mock = key yokken çalışır">Examiner</Label>
            <Select
              defaultValue={examinerProvider}
              onChange={(e) =>
                update('ai.examiner_provider', JSON.stringify(e.target.value), 'Examiner provider')
              }
              disabled={pending}
            >
              <option value="mock">Mock (deterministik)</option>
              <option value="claude">Claude (Anthropic)</option>
              <option value="gpt">GPT (OpenAI) — TODO</option>
            </Select>
          </div>
          <div>
            <Label>Examiner Model</Label>
            <Select
              defaultValue={examinerModel}
              onChange={(e) =>
                update('ai.examiner_model', JSON.stringify(e.target.value), 'Examiner model')
              }
              disabled={pending}
            >
              <option value="claude-sonnet-4-5">claude-sonnet-4-5 ($3/$15 per 1M)</option>
              <option value="claude-haiku-4-5-20251001">claude-haiku-4-5 ($0.8/$4)</option>
              <option value="claude-opus-4-7">claude-opus-4-7 ($15/$75)</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label hint="native = ücretsiz, cihaz STT">STT Provider</Label>
            <Select
              defaultValue={sttProvider}
              onChange={(e) =>
                update('ai.stt_provider', JSON.stringify(e.target.value), 'STT provider')
              }
              disabled={pending}
            >
              <option value="native">Native (cihaz)</option>
              <option value="whisper">Whisper (OpenAI)</option>
              <option value="mock">Mock</option>
            </Select>
          </div>
          <div>
            <Label>Whisper Model</Label>
            <Select
              defaultValue={whisperModel}
              onChange={(e) =>
                update('ai.whisper_model', JSON.stringify(e.target.value), 'Whisper model')
              }
              disabled={pending}
            >
              <option value="whisper-1">whisper-1 ($0.006/min)</option>
            </Select>
          </div>
        </div>
      </section>

      {/* API keys */}
      <section className="bg-white border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-airspeak-red" />
            <h2 className="font-bold text-lg">API Keys</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowKeys((s) => !s)}
            className="text-xs font-semibold text-muted-foreground"
          >
            {showKeys ? 'Gizle' : 'Göster'}
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-amber-800">
            Key'ler Supabase RLS ile mobile'a kapalı. Sadece server-side Edge Function ve admin
            okur. Yine de log/git'e yansıtmamak için dikkatli ol.
          </div>
        </div>

        <div>
          <Label hint="sk-ant-...">Anthropic API Key</Label>
          <div className="flex gap-2">
            <Input
              type={showKeys ? 'text' : 'password'}
              value={localKeys.anthropic}
              onChange={(e) => setLocalKeys((s) => ({ ...s, anthropic: e.target.value }))}
              placeholder="sk-ant-..."
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() =>
                update('ai.anthropic_api_key', JSON.stringify(localKeys.anthropic), 'Anthropic key')
              }
              disabled={pending || localKeys.anthropic === anthropicKey}
            >
              Kaydet
            </Button>
            <Button
              variant="ghost"
              onClick={onTestClaude}
              disabled={testing === 'claude' || pending}
            >
              {testing === 'claude' ? 'Test…' : 'Test'}
            </Button>
          </div>
        </div>

        <div>
          <Label hint="sk-...">OpenAI API Key (Whisper + GPT)</Label>
          <div className="flex gap-2">
            <Input
              type={showKeys ? 'text' : 'password'}
              value={localKeys.openai}
              onChange={(e) => setLocalKeys((s) => ({ ...s, openai: e.target.value }))}
              placeholder="sk-..."
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() =>
                update('ai.openai_api_key', JSON.stringify(localKeys.openai), 'OpenAI key')
              }
              disabled={pending || localKeys.openai === openaiKey}
            >
              Kaydet
            </Button>
            <Button
              variant="ghost"
              onClick={onTestOpenAi}
              disabled={testing === 'openai' || pending}
            >
              {testing === 'openai' ? 'Test…' : 'Test'}
            </Button>
          </div>
        </div>
      </section>

      {/* Limits */}
      <section className="bg-white border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Mic className="w-5 h-5 text-airspeak-gold" /> Limits & Economy
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label hint="saniye">Max audio</Label>
            <Input
              type="number"
              defaultValue={maxAudioSec}
              onBlur={(e) =>
                update('ai.max_audio_seconds', Number(e.target.value), 'Max audio')
              }
              disabled={pending}
            />
          </div>
          <div>
            <Label hint="USD">Daily cost cap</Label>
            <Input
              type="number"
              defaultValue={dailyCostCap}
              onBlur={(e) =>
                update('ai.daily_cost_cap_usd', Number(e.target.value), 'Daily cap')
              }
              disabled={pending}
            />
          </div>
          <div>
            <Label hint="0-1">Review confidence min</Label>
            <Input
              type="number"
              step="0.05"
              min={0}
              max={1}
              defaultValue={reviewConfMin}
              onBlur={(e) =>
                update('ai.review_confidence_min', Number(e.target.value), 'Review threshold')
              }
              disabled={pending}
            />
          </div>
        </div>
      </section>

      {/* Status banner */}
      <section
        className={`rounded-xl p-4 text-sm flex gap-3 ${
          examinerProvider === 'mock'
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-emerald-50 border border-emerald-200'
        }`}
      >
        {examinerProvider === 'mock' ? (
          <>
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>MOCK MODE aktif.</strong> Sınav sonuçları deterministik 1-4.5 band score.
              Gerçek AI evaluation için provider'ı 'claude' yap ve Anthropic API key gir.
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong>{examinerProvider.toUpperCase()} aktif.</strong> Edge function gerçek API
              call yapacak. Daily cost cap'i takip et, aşılırsa graceful mock'a düşer.
            </div>
          </>
        )}
      </section>
    </div>
  );
}

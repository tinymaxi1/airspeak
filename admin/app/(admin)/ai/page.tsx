/**
 * /admin/ai — AI Settings + maliyet dashboard.
 *
 * Settings: provider/model/key/limits → AiSettingsForm (client)
 * Dashboard: ai_daily_cost view son 14 gün
 */
import { requireAdminRole } from '@/lib/auth/guard';
import { getAiConfig, getAiDailyCost } from '@/lib/ai/actions';
import { AiSettingsForm } from '@/components/ai/AiSettingsForm';
import { Bot, BarChart3 } from 'lucide-react';

export default async function AiSettingsPage() {
  await requireAdminRole('editor');
  const [rows, daily] = await Promise.all([getAiConfig(), getAiDailyCost(14)]);

  const totalCost = daily.reduce((s, d) => s + Number(d.total_cost_usd ?? 0), 0);
  const totalAttempts = daily.reduce((s, d) => s + Number(d.attempts ?? 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-airspeak-navy/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-airspeak-navy" />
          </div>
          <h1 className="text-3xl font-bold text-airspeak-navy">AI Settings</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Examiner + STT provider seçimi, API key yönetimi, maliyet kontrolü.
        </p>
      </div>

      <AiSettingsForm rows={rows} />

      {/* Cost dashboard */}
      <section className="bg-white border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-airspeak-red" />
            <h2 className="font-bold text-lg">Maliyet (son 14 gün)</h2>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Toplam: </span>
            <strong className="text-airspeak-navy">${totalCost.toFixed(4)}</strong>
            <span className="text-muted-foreground"> · {totalAttempts} attempt</span>
          </div>
        </div>

        {daily.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Henüz evaluated attempt yok.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Gün</th>
                <th className="px-3 py-2 text-right font-semibold">Toplam</th>
                <th className="px-3 py-2 text-right font-semibold">Mock</th>
                <th className="px-3 py-2 text-right font-semibold">Claude</th>
                <th className="px-3 py-2 text-right font-semibold">GPT</th>
                <th className="px-3 py-2 text-right font-semibold">Token In</th>
                <th className="px-3 py-2 text-right font-semibold">Token Out</th>
                <th className="px-3 py-2 text-right font-semibold">Cost USD</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.day} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 font-mono text-xs">{d.day}</td>
                  <td className="px-3 py-2 text-right">{d.attempts}</td>
                  <td className="px-3 py-2 text-right text-amber-700">{d.mock_attempts}</td>
                  <td className="px-3 py-2 text-right text-airspeak-navy">{d.claude_attempts}</td>
                  <td className="px-3 py-2 text-right text-emerald-700">{d.gpt_attempts}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{d.total_tokens_in}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{d.total_tokens_out}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    ${Number(d.total_cost_usd ?? 0).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

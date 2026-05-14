'use client';

import { useState } from 'react';
import { resendBroadcast } from './actions';

interface Props {
  releaseId: string;
  version: string;
}

export function ResendButton({ releaseId, version }: Props) {
  const [sending, setSending] = useState(false);

  async function handleClick() {
    if (!confirm(`v${version} push bildirimini tüm kullanıcılara TEKRAR göndereceksin. Emin misin?`)) {
      return;
    }
    setSending(true);
    const r = await resendBroadcast(releaseId);
    setSending(false);
    if (!r.ok) {
      alert('Hata: ' + (r.error ?? 'unknown'));
    } else {
      alert('Push gönderildi');
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={sending}
      className="rounded-md border border-airspeak-border px-3 py-1 text-xs text-airspeak-muted hover:bg-airspeak-paper-soft disabled:opacity-50"
    >
      {sending ? '...' : 'Push yeniden'}
    </button>
  );
}

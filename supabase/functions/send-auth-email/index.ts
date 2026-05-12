/**
 * send-auth-email — Supabase Auth Send Email Hook
 *
 * Supabase Custom SMTP UI bug'ını bypass için direct Resend API entegrasyonu.
 * Supabase Auth events (signup, recovery, magic_link, email_change, invite)
 * tetiklendiğinde bu fonksiyona POST gelir, biz Resend API'ye forward ederiz.
 *
 * Setup:
 * 1. Supabase Dashboard → Edge Functions → Secrets:
 *    - RESEND_API_KEY        — Resend API key (re_...)
 *    - SEND_EMAIL_HOOK_SECRET — Supabase Auth Hook secret (v1,whsec_...)
 * 2. Supabase Dashboard → Authentication → Auth Hooks → Send Email Hook:
 *    - URL: https://<project-ref>.supabase.co/functions/v1/send-auth-email
 *    - Secret: SEND_EMAIL_HOOK_SECRET değeri
 *
 * Email template'i mail-templates/* dosyalarından gelir (HTML + plain text).
 * Türkçe metin, AirSpeak markası, airspeak.app verify URL'i.
 */
// @ts-expect-error — Deno runtime import
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';

interface EmailPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: 'signup' | 'recovery' | 'magiclink' | 'email_change' | 'invite';
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const HOOK_SECRET_RAW = Deno.env.get('SEND_EMAIL_HOOK_SECRET')!;
// Supabase secret formatı: v1,whsec_xxxxx — Webhook library "whsec_xxxxx" bekler
const HOOK_SECRET = HOOK_SECRET_RAW.replace(/^v1,/, '');

const FROM_EMAIL = 'AirSpeak <noreply@airspeak.app>';

function tr(actionType: EmailPayload['email_data']['email_action_type']): {
  subject: string;
  intro: string;
  cta: string;
  outro: string;
} {
  switch (actionType) {
    case 'signup':
      return {
        subject: 'AirSpeak — Hesabını doğrula',
        intro: 'AirSpeak\'e hoş geldin! Hesabını aktive etmek için aşağıdaki butona tıkla.',
        cta: 'Hesabımı doğrula',
        outro:
          'Bu maili sen istemediysen yok say — kimse hesabına erişemez. AirSpeak ekibi 7/24 destek için: support@airspeak.app',
      };
    case 'recovery':
      return {
        subject: 'AirSpeak — Şifre sıfırla',
        intro: 'AirSpeak şifreni sıfırlamak istediğini gördük. Aşağıdaki butonla yeni şifre belirle.',
        cta: 'Şifremi sıfırla',
        outro: 'Bu maili sen istemediysen yok say. Linkin geçerlilik süresi 1 saattir.',
      };
    case 'magiclink':
      return {
        subject: 'AirSpeak — Giriş bağlantın',
        intro: 'AirSpeak\'e giriş bağlantın hazır. Aşağıdaki butonla tek tıkla giriş yap.',
        cta: 'AirSpeak\'e giriş',
        outro: 'Bu maili sen istemediysen yok say.',
      };
    case 'email_change':
      return {
        subject: 'AirSpeak — E-posta değişikliği onayı',
        intro: 'AirSpeak hesabının yeni e-posta adresini doğrulamak için aşağıdaki butona tıkla.',
        cta: 'Yeni e-postamı doğrula',
        outro: 'Bu değişikliği sen yapmadıysan yardım için bize ulaş: support@airspeak.app',
      };
    case 'invite':
      return {
        subject: 'AirSpeak — Davet edildin',
        intro: 'AirSpeak\'e davet edildin. Aşağıdaki butonla hesabını oluştur.',
        cta: 'Davete katıl',
        outro: 'Bu maili beklemiyorduysan yok say.',
      };
    default:
      return {
        subject: 'AirSpeak',
        intro: '',
        cta: 'Devam et',
        outro: '',
      };
  }
}

function buildVerifyUrl(p: EmailPayload): string {
  const { token_hash, email_action_type } = p.email_data;
  // Supabase GET verify endpoint — token'ı doğrular + session oluşturur + redirect_to'ya
  // hash fragment ile access_token & refresh_token yollar.
  // verify.html bunu okuyup deep link açar.
  const SUPABASE_URL = 'https://neinhbkdctjtyyoskxpg.supabase.co';
  const params = new URLSearchParams({
    token_hash,
    type: email_action_type === 'signup' ? 'signup' : email_action_type,
    redirect_to: 'https://airspeak.app/auth/verify',
  });
  return `${SUPABASE_URL}/auth/v1/verify?${params.toString()}`;
}

function renderHTML(p: EmailPayload, t: ReturnType<typeof tr>, verifyUrl: string): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.subject}</title>
</head>
<body style="margin:0;padding:0;background:#0F1E47;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F1E47;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 32px 0;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#0F1E47;letter-spacing:-0.5px;">AirSpeak</div>
          <div style="font-size:10px;font-weight:700;color:#E11D2E;letter-spacing:2px;margin-top:4px;">AVIATION ENGLISH</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:24px;color:#0F1E47;line-height:1.3;">${t.subject}</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#404858;">${t.intro}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td style="background:#E11D2E;border-radius:10px;">
              <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;letter-spacing:0.3px;">${t.cta}</a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:12px;color:#8A93A6;line-height:1.6;">Buton çalışmıyorsa şu linke tıkla:<br><a href="${verifyUrl}" style="color:#2E7CD6;word-break:break-all;">${verifyUrl}</a></p>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#F5F6FA;border-top:1px solid #E5E8EF;">
          <p style="margin:0;font-size:11px;color:#8A93A6;line-height:1.6;">${t.outro}</p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:rgba(255,255,255,0.5);">© AirSpeak · MIRISSA KOZMETIK VE TICARET LTD ŞTİ · airspeak.app</p>
    </td></tr>
  </table>
</body>
</html>`;
}

function renderText(t: ReturnType<typeof tr>, verifyUrl: string): string {
  return `AirSpeak

${t.subject}

${t.intro}

${t.cta}: ${verifyUrl}

${t.outro}

© AirSpeak · airspeak.app`;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload: EmailPayload;
  try {
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers);
    // Standard Webhooks signature verification
    const wh = new Webhook(HOOK_SECRET);
    payload = wh.verify(rawBody, headers) as EmailPayload;
  } catch (e) {
    console.error('Webhook verify failed:', e);
    return new Response(
      JSON.stringify({ error: { http_code: 401, message: 'webhook signature invalid' } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const t = tr(payload.email_data.email_action_type);
  const verifyUrl = buildVerifyUrl(payload);
  const html = renderHTML(payload, t, verifyUrl);
  const text = renderText(t, verifyUrl);

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [payload.user.email],
        subject: t.subject,
        html,
        text,
      }),
    });

    if (!r.ok) {
      const errBody = await r.text();
      console.error('Resend API error:', r.status, errBody);
      return new Response(
        JSON.stringify({ error: { http_code: r.status, message: `resend error: ${errBody}` } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const data = await r.json();
    console.log('Email sent:', payload.user.email, 'action:', payload.email_data.email_action_type, 'resend_id:', data.id);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Send failed:', e);
    return new Response(
      JSON.stringify({ error: { http_code: 500, message: e instanceof Error ? e.message : 'unknown' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});

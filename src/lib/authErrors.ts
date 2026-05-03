/**
 * Supabase auth hata mesajlarını kullanıcı dostu Türkçe'ye map'le.
 * Sprint 7.E
 */
import type { AuthError } from '@supabase/supabase-js';

export interface FriendlyAuthError {
  title: string;
  message: string;
  /** 429 / rate-limit ise yaklaşık beklenecek saniye */
  retryAfterSeconds?: number;
}

/**
 * Supabase mesajından özelleşmiş Türkçe metin üretir.
 * Eşleşme yoksa generic mesajla orijinal mesajı korur.
 */
export function mapAuthError(error: AuthError | { message?: string; status?: number } | null | undefined): FriendlyAuthError {
  if (!error) {
    return { title: 'Hata', message: 'Bilinmeyen bir hata oluştu.' };
  }

  const raw = (error.message ?? '').toLowerCase();
  const status = (error as any).status as number | undefined;

  // 429 + rate limit ailesi
  if (status === 429 || raw.includes('rate limit') || raw.includes('too many')) {
    // Mesajdan saniye/dakika çekmeye çalış (örn. "after 47 seconds")
    const m = raw.match(/(\d+)\s*(second|seconds|minute|minutes|sec|min)/);
    let secs: number | undefined;
    if (m && m[1] && m[2]) {
      const n = parseInt(m[1], 10);
      secs = m[2].startsWith('min') ? n * 60 : n;
    }
    return {
      title: 'Çok fazla deneme',
      message: secs
        ? `Güvenlik için ${secs} saniye bekleyip tekrar dene.`
        : 'Bir süredir çok deneme yaptın. Birkaç dakika sonra tekrar dene.',
      retryAfterSeconds: secs,
    };
  }

  // Geçersiz kimlik
  if (raw.includes('invalid login') || raw.includes('invalid_credentials') || raw.includes('invalid credentials')) {
    return {
      title: 'Giriş başarısız',
      message: 'Email veya şifre hatalı. Bilgilerini kontrol et.',
    };
  }

  // Email doğrulanmamış
  if (raw.includes('email not confirmed') || raw.includes('not confirmed')) {
    return {
      title: 'Email doğrulanmamış',
      message: 'Mailindeki doğrulama linkine tıkladığında giriş yapabilirsin.',
    };
  }

  // Zaten kayıtlı
  if (raw.includes('already registered') || raw.includes('user already exists') || raw.includes('already exists')) {
    return {
      title: 'Hesap mevcut',
      message: 'Bu email zaten kayıtlı. Giriş ekranından devam edebilirsin.',
    };
  }

  // Şifre güvensiz / kısa
  if (raw.includes('password') && (raw.includes('short') || raw.includes('weak') || raw.includes('at least'))) {
    return {
      title: 'Şifre yetersiz',
      message: 'Şifre en az 6 karakter olmalı. Daha güçlü bir şifre seç.',
    };
  }

  // Email format
  if (raw.includes('invalid email') || raw.includes('email_address_invalid')) {
    return {
      title: 'Geçersiz email',
      message: 'Email adresinin formatı doğru değil.',
    };
  }

  // Network / sunucu
  if (raw.includes('network') || raw.includes('failed to fetch') || (status != null && status >= 500)) {
    return {
      title: 'Bağlantı sorunu',
      message: 'Sunucuya ulaşılamadı. İnternetini kontrol edip tekrar dene.',
    };
  }

  // Captcha (Supabase advanced)
  if (raw.includes('captcha')) {
    return {
      title: 'Doğrulama gerekli',
      message: 'Robot olmadığını doğrulamak için tekrar dene.',
    };
  }

  // Token expired (oturum)
  if (raw.includes('jwt expired') || raw.includes('token expired') || raw.includes('refresh_token')) {
    return {
      title: 'Oturum süresi doldu',
      message: 'Tekrar giriş yapmalısın.',
    };
  }

  // Default — orijinal mesajı sakla ama generic title
  return {
    title: 'Hata',
    message: error.message ?? 'Beklenmeyen bir hata oluştu.',
  };
}

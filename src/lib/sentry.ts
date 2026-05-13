import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';

const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const TOKEN_PARAM_REGEX = /([?&])(token|key|auth|session|password)=([^&]+)/gi;

function stripPii(value: string): string {
  return value.replace(EMAIL_REGEX, '<email>').replace(TOKEN_PARAM_REGEX, '$1$2=<redacted>');
}

/**
 * Sentry global tag'lerine OTA güncelleme metadata'sını ekler.
 *
 * Sentry'de release tag native build numarasını gösterir (örn 1.0.0+29) ama
 * hangi OTA update'i aktif olduğunu göstermez. expo-update-id ile her event
 * "hangi OTA üzerinde patladı?" sorusuna cevap verir.
 *
 * try/catch: Updates module import edilemezse veya runtime'da değerler
 * undefined ise app crash etmesin. Build embedded JS için Updates.updateId
 * null olur → 'embedded' fallback.
 */
function setExpoUpdateTags(): void {
  try {
    Sentry.setTag('expo-update-id', Updates.updateId ?? 'embedded');
    Sentry.setTag('expo-channel', Updates.channel ?? 'unknown');
    Sentry.setTag('expo-runtime-version', Updates.runtimeVersion ?? '?');
    Sentry.setTag('expo-update-embedded', String(Updates.isEmbeddedLaunch ?? false));
  } catch {
    /* fail-safe */
  }
}

export function initSentry(): void {
  if (__DEV__) return;

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    enableAutoSessionTracking: true,
    tracesSampleRate: 0.2,
    debug: false,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      if (typeof event.message === 'string') {
        event.message = stripPii(event.message);
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.message) breadcrumb.message = stripPii(breadcrumb.message);
      if (typeof breadcrumb.data?.url === 'string') {
        breadcrumb.data.url = stripPii(breadcrumb.data.url);
      }
      return breadcrumb;
    },
  });

  // Sentry init'inden HEMEN sonra OTA tag'lerini set et.
  // Tag'ler subsequent event'lere otomatik attach edilir.
  setExpoUpdateTags();
}

export function identifyUser(params: { id: string; role?: string | null }): void {
  Sentry.setUser({ id: params.id, role: params.role ?? undefined });
}

export function clearUser(): void {
  Sentry.setUser(null);
}

export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export const nativeCrash = Sentry.nativeCrash;
export const SentryErrorBoundary = Sentry.ErrorBoundary;
export const sentryWrap = Sentry.wrap;

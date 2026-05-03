import * as Sentry from '@sentry/react-native';

const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const TOKEN_PARAM_REGEX = /([?&])(token|key|auth|session|password)=([^&]+)/gi;

function stripPii(value: string): string {
  return value.replace(EMAIL_REGEX, '<email>').replace(TOKEN_PARAM_REGEX, '$1$2=<redacted>');
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

import PostHog from 'posthog-react-native';

let posthog: PostHog | null = null;

export function initAnalytics(): void {
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';
  if (!apiKey) {
    if (__DEV__) console.warn('PostHog API key missing — analytics disabled.');
    return;
  }
  posthog = new PostHog(apiKey, { host, captureAppLifecycleEvents: true });
}

export function track(event: string, properties?: Record<string, unknown>): void {
  posthog?.capture(event, properties);
}

export function identify(userId: string, properties?: Record<string, unknown>): void {
  posthog?.identify(userId, properties);
}

export function resetAnalytics(): void {
  posthog?.reset();
}

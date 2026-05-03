/**
 * App Tracking Transparency (ATT) — iOS 14.5+ zorunlu
 *
 * Apple kuralı: cihaz tanımlayıcı (IDFA) kullanan herhangi bir analytics/ads
 * SDK'sı çağırılmadan ÖNCE bu prompt gösterilmeli.
 *
 * Mock-first: Android'de + iOS 14 öncesinde no-op (granted döner).
 *
 * Çağrı noktası: ads SDK init'inden hemen önce. Şu an mobile'da ads SDK yok,
 * ileride `react-native-google-mobile-ads` aktive edildiğinde init wrapper
 * `requestAppTrackingPermission()` çağırıp sonucu MobileAds.initialize'ye verecek.
 *
 * Apple HIG önerisi: kullanıcıya pre-prompt (neden gerekli açıklayan custom screen)
 * göstermeden önce direkt sistem prompt'u açmak başarı oranını düşürür.
 */
import { Platform } from 'react-native';
import * as TrackingTransparency from 'expo-tracking-transparency';

export type TrackingStatus =
  | 'granted'
  | 'denied'
  | 'restricted'
  | 'not-determined'
  | 'unavailable';

export async function getAppTrackingStatus(): Promise<TrackingStatus> {
  if (Platform.OS !== 'ios') return 'unavailable';
  try {
    const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
    return status as TrackingStatus;
  } catch {
    return 'unavailable';
  }
}

export async function requestAppTrackingPermission(): Promise<TrackingStatus> {
  if (Platform.OS !== 'ios') return 'unavailable';
  try {
    const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
    return status as TrackingStatus;
  } catch {
    return 'unavailable';
  }
}

/**
 * Ads SDK init wrapper için kısayol.
 * Granted veya unavailable (Android) ise tracking yapılabilir.
 */
export async function canUseTracking(): Promise<boolean> {
  const status = await getAppTrackingStatus();
  return status === 'granted' || status === 'unavailable';
}

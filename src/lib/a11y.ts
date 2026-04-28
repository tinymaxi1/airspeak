/**
 * Accessibility helpers — VoiceOver labels, Dynamic Type, focus management.
 */
import { PixelRatio, AccessibilityInfo, Platform } from 'react-native';

/**
 * iOS Dynamic Type uyumu için font scale hesaplar.
 * iOS Settings > Accessibility > Display & Text Size > Larger Text ayarı bu değerleri etkiler.
 *
 * Default scale 1.0, küçük 0.85, büyük 1.5'a kadar.
 *
 * Kullanım:
 *   <Text style={{ fontSize: scaleFont(16) }} />
 *
 * Tasarım hassasiyetli ekranlarda override edilebilir (örn cinematic hero başlık).
 */
export function scaleFont(baseSize: number, options?: { max?: number; min?: number }): number {
  const scale = PixelRatio.getFontScale();
  const max = options?.max ?? baseSize * 1.4;
  const min = options?.min ?? baseSize * 0.9;
  return Math.max(min, Math.min(max, baseSize * scale));
}

/**
 * Belirli sayıda saniye sonra screen reader announcement.
 */
export async function announceForAccessibility(message: string): Promise<void> {
  if (Platform.OS === 'ios') {
    AccessibilityInfo.announceForAccessibility(message);
  } else {
    AccessibilityInfo.announceForAccessibility(message);
  }
}

/**
 * Reduce Motion aktif mi (Apple Watch + iOS Settings).
 * Animasyonları azaltmak için kontrol edilir.
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  return AccessibilityInfo.isReduceMotionEnabled();
}

/**
 * Standart accessibility label'lar — i18n ile beraber kullan.
 */
export const A11Y_ROLES = {
  button: 'button',
  link: 'link',
  header: 'header',
  search: 'search',
  text: 'text',
  image: 'image',
  none: 'none',
} as const;

/**
 * Color contrast helper — basit WCAG check (AA = 4.5:1, AAA = 7:1).
 * Production'da react-native-color-contrast lib daha doğru.
 */
export function getContrastRatio(_fgHex: string, _bgHex: string): number {
  // Placeholder — gerçek hesap için package ekle
  return 4.5;
}

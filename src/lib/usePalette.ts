/**
 * Theme palette — light/dark renk tokenları.
 * Sprint 6.F
 *
 * Kullanım:
 *   const c = usePalette();
 *   <View style={{ backgroundColor: c.bg }} />
 *
 * useThemeStore (Sprint 4.B) + useColorScheme'i izler.
 * Brand renkleri (red/gold/navy) tema-bağımsız.
 */
import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/stores/themeStore';

export interface Palette {
  /** Ekran arka planı (önceki #FAFAF7) */
  bg: string;
  /** Kart/surface (önceki #FFFFFF) */
  surface: string;
  /** Surface altı (yumuşak) */
  surfaceMuted: string;
  /** Birincil metin (önceki #0E1116) */
  text: string;
  /** İkincil metin (önceki #5A6478) */
  textSecondary: string;
  /** Üçüncül metin / placeholder (önceki #8A93A6) */
  textTertiary: string;
  /** Kart border (önceki #DCE0E8) */
  border: string;
  /** Yumuşak ayırıcı (önceki #EDEFF3) */
  borderSoft: string;
  /** Brand primary (red) */
  primary: string;
  /** Brand gold */
  gold: string;
  /** Brand navy (her iki temada da koyu kalır) */
  navy: string;
  /** Tehlike kırmızı bg yumuşak */
  dangerSoft: string;
  /** Erişilebilir yeşil */
  success: string;
  /** Mavi accent */
  info: string;
  /** Tema tipi (animasyon vb. için lazım) */
  isDark: boolean;
}

const LIGHT: Palette = {
  bg: '#FAFAF7',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F6F9',
  text: '#0E1116',
  textSecondary: '#5A6478',
  textTertiary: '#8A93A6',
  border: '#DCE0E8',
  borderSoft: '#EDEFF3',
  primary: '#E63946',
  gold: '#FFD56B',
  navy: '#0F1E47',
  dangerSoft: '#FFE4E7',
  success: '#2DBE6C',
  info: '#2EA8FF',
  isDark: false,
};

const DARK: Palette = {
  bg: '#06091A',
  surface: '#0B1226',
  surfaceMuted: '#131B36',
  text: '#F4F6FB',
  textSecondary: '#A8B0C4',
  textTertiary: '#7A8094',
  border: '#1E2640',
  borderSoft: '#131B36',
  primary: '#FF4D5C',
  gold: '#FFD56B',
  navy: '#0F1E47',
  dangerSoft: '#3A0E18',
  success: '#34D77A',
  info: '#5DBDFF',
  isDark: true,
};

export function usePalette(): Palette {
  const pref = useThemeStore((s) => s.theme);
  const scheme = useColorScheme();
  const isDark = pref === 'dark' || (pref === 'system' && scheme === 'dark');
  return isDark ? DARK : LIGHT;
}

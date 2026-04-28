/**
 * AirSpeak Design System — "Cleared for takeoff"
 *
 * Tasarım: Aviation + Duolingo karması — playful gamified
 * Renk: Navy + Signal Red, gold/sky aksanlarla
 * Font: Plus Jakarta Sans (gövde) + Space Grotesk (display) + JetBrains Mono (eyebrow/data)
 *
 * Design tokens design canvas'tan birebir kopya (styles.css):
 * - Navy: 950→400 (8 stop)
 * - Red: 600→100 (4 stop)
 * - Sky/Gold/Green/Purple/Orange aksanlar
 * - Paper/Ink neutral'lar (light + dark mode)
 */
import { config as defaultConfig } from '@tamagui/config/v3';
import { createTamagui, createTokens } from 'tamagui';

const palette = {
  // === Brand: Navy + Signal Red ===
  navy950: '#050B1A',
  navy900: '#0A1430',
  navy800: '#0F1E47',
  navy700: '#14275F',
  navy600: '#1B3478',
  navy500: '#2747A0',
  navy400: '#4B6BC8',

  red600: '#C8202E',
  red500: '#E63946',
  red400: '#FF5A66',
  red100: '#FFE4E7',

  // === Aksan renkleri ===
  sky500: '#2EA8FF',
  sky400: '#5BC0FF',
  sky100: '#E0F2FF',

  gold500: '#F2C14E',
  gold400: '#FFD56B',
  gold100: '#FFF3D1',

  green500: '#2DBE6C',
  green400: '#4FD487',
  green100: '#DDF7E6',

  purple500: '#7C5CFF',
  purple100: '#ECE6FF',

  orange500: '#FF7847',
  orange100: '#FFE5D9',

  // === Neutrals (warm paper + cool ink) ===
  paper: '#FAFAF7',
  paper2: '#F4F2EC',
  paper3: '#E9E6DD',
  ink900: '#0E1116',
  ink700: '#2A3140',
  ink500: '#5A6478',
  ink400: '#8A93A6',
  ink300: '#B8BFCC',
  ink200: '#DCE0E8',
  ink100: '#EDEFF3',

  white: '#FFFFFF',
  black: '#000000',
} as const;

const tokens = createTokens({
  ...defaultConfig.tokens,
  color: {
    ...defaultConfig.tokens.color,
    ...palette,
  },
  size: {
    ...defaultConfig.tokens.size,
  },
  space: {
    ...defaultConfig.tokens.space,
  },
  radius: {
    ...defaultConfig.tokens.radius,
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  zIndex: {
    ...defaultConfig.tokens.zIndex,
  },
});

type ThemeTokens = Record<string, string>;

/**
 * Light Mode — Paper bg, navy primary, red accent
 */
const lightTheme: ThemeTokens = {
  // Background layers (paper-ish warm)
  background: palette.paper,
  bg2: palette.white,
  bg3: palette.paper2,
  backgroundHover: palette.paper2,
  backgroundPress: palette.paper3,

  // Surfaces
  surface: palette.white,
  surfaceElevated: palette.white,

  // Borders
  border: palette.ink200,
  borderStrong: palette.ink300,

  // Text
  text: palette.ink900,
  text2: palette.ink500,
  text3: palette.ink400,
  textSecondary: palette.ink500,
  textInverse: palette.white,

  // Primary = Navy (deep operational)
  primary: palette.navy800,
  primaryHover: palette.navy700,
  primaryText: palette.white,

  // Accent = Signal Red (CTA, alerts)
  accent: palette.red500,
  accentHover: palette.red400,
  accentText: palette.white,

  // Semantic
  warning: palette.gold500,
  warningSubtle: palette.gold100,
  success: palette.green500,
  successSubtle: palette.green100,
  danger: palette.red500,
  dangerSubtle: palette.red100,
  sky: palette.sky500,
  skySubtle: palette.sky100,
  gold: palette.gold500,
  goldSubtle: palette.gold100,
  purple: palette.purple500,
  purpleSubtle: palette.purple100,
  orange: palette.orange500,
  orangeSubtle: palette.orange100,
};

/**
 * Dark Mode — Deep navy bg, red primary, gold accent
 */
const darkTheme: ThemeTokens = {
  background: '#06091A',
  bg2: '#0B1226',
  bg3: '#131B36',
  backgroundHover: '#0B1226',
  backgroundPress: '#131B36',

  surface: '#0F1730',
  surfaceElevated: '#131B36',

  border: '#1F2A4D',
  borderStrong: '#2C3A66',

  text: '#F4F6FB',
  text2: '#A8B0C4',
  text3: '#6E7794',
  textSecondary: '#A8B0C4',
  textInverse: palette.navy900,

  // Dark mode primary = Red (more vivid against dark navy)
  primary: palette.red500,
  primaryHover: palette.red400,
  primaryText: palette.white,

  // Dark mode accent = Gold (luxury feel)
  accent: palette.gold400,
  accentHover: palette.gold500,
  accentText: palette.navy900,

  warning: palette.gold400,
  warningSubtle: '#382D14',
  success: palette.green500,
  successSubtle: '#0F2419',
  danger: palette.red500,
  dangerSubtle: '#3B0F14',
  sky: palette.sky500,
  skySubtle: '#0F2540',
  gold: palette.gold400,
  goldSubtle: '#382D14',
  purple: palette.purple500,
  purpleSubtle: '#1F1A40',
  orange: palette.orange500,
  orangeSubtle: '#2D1810',
};

export const config = createTamagui({
  ...defaultConfig,
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  defaultTheme: 'light',
  defaultProps: {
    Text: {
      fontFamily: '$body',
    },
  },
});

export default config;

// Design tokens — direkt kullanılabilir export
export const DESIGN = {
  // Type scale (mobile-first)
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 38,
    '4xl': 48,
    '5xl': 64,
  },
  // Headlines
  hero: { fontSize: 34, lineHeight: 36, letterSpacing: -0.85 },
  h1: { fontSize: 28, lineHeight: 31, letterSpacing: -0.56 },
  h2: { fontSize: 22, lineHeight: 25, letterSpacing: -0.33 },
  h3: { fontSize: 17, lineHeight: 20 },
  // Eyebrow (mono uppercase)
  eyebrow: {
    fontFamily: 'JetBrainsMono',
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
  },
  // Shadows
  shadowCard3D: {
    shadowColor: '#0A1430',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    elevation: 4,
  },
  shadowGlowRed: {
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 8,
  },
  shadowMd: {
    shadowColor: '#0A1430',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  shadowLg: {
    shadowColor: '#0A1430',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 12,
  },
} as const;

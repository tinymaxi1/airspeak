import { config as defaultConfig } from '@tamagui/config/v3';
import { createTamagui, createTokens } from 'tamagui';

const palette = {
  navy900: '#0A1F3D',
  navy700: '#0F2D5C',
  navy500: '#1E4A8C',
  navy300: '#3D6BAA',
  blue500: '#2E7CD6',
  blue400: '#4F95E0',
  blue200: '#A8C8EC',
  blue100: '#DCE9F8',
  amber500: '#F59E0B',
  amber400: '#FBBF24',
  amber100: '#FEF3C7',
  slate900: '#0A1429',
  slate800: '#1A2540',
  slate700: '#2D3A55',
  slate500: '#64748B',
  slate300: '#CBD5E1',
  slate100: '#F1F5F9',
  slate50: '#FAFBFD',
  white: '#FFFFFF',
  black: '#000000',
  success500: '#10B981',
  success100: '#D1FAE5',
  danger500: '#EF4444',
  danger100: '#FEE2E2',
  warning500: '#F59E0B',
  info500: '#2E7CD6',
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
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  zIndex: {
    ...defaultConfig.tokens.zIndex,
  },
});

const lightTheme = {
  background: palette.slate50,
  backgroundHover: palette.slate100,
  backgroundPress: palette.blue100,
  surface: palette.white,
  surfaceElevated: palette.white,
  border: palette.slate300,
  text: palette.navy900,
  textSecondary: palette.slate500,
  textInverse: palette.white,
  primary: palette.navy700,
  primaryHover: palette.navy500,
  primaryText: palette.white,
  accent: palette.blue500,
  accentHover: palette.blue400,
  accentText: palette.white,
  warning: palette.amber500,
  warningSubtle: palette.amber100,
  success: palette.success500,
  successSubtle: palette.success100,
  danger: palette.danger500,
  dangerSubtle: palette.danger100,
};

const darkTheme: typeof lightTheme = {
  background: palette.slate900,
  backgroundHover: palette.slate800,
  backgroundPress: palette.navy700,
  surface: palette.slate800,
  surfaceElevated: palette.slate700,
  border: palette.slate700,
  text: palette.slate50,
  textSecondary: palette.slate300,
  textInverse: palette.navy900,
  primary: palette.blue500,
  primaryHover: palette.blue400,
  primaryText: palette.white,
  accent: palette.blue400,
  accentHover: palette.blue200,
  accentText: palette.navy900,
  warning: palette.amber400,
  warningSubtle: palette.amber500,
  success: palette.success500,
  successSubtle: palette.success100,
  danger: palette.danger500,
  dangerSubtle: palette.danger100,
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

export type AirSpeakConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AirSpeakConfig {}
}

export default config;

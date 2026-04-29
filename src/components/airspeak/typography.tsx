/**
 * AirSpeak Typography
 *
 * Tasarım sistemine göre 4 ana font role:
 * - Display (Space Grotesk) — heroes, big headlines
 * - Body (Plus Jakarta Sans) — gövde, h2/h3
 * - Mono (JetBrains Mono) — eyebrow, data, codes
 *
 * Plus Jakarta Sans 400/500/600/700/800 weight'lerini destekler.
 */
import { Text } from 'react-native';
import type { TextProps } from 'react-native';
import { scaleFont } from '@/lib/a11y';

const FONT_BODY = 'PlusJakartaSans_400Regular';
const FONT_BODY_500 = 'PlusJakartaSans_500Medium';
const FONT_BODY_600 = 'PlusJakartaSans_600SemiBold';
const FONT_BODY_700 = 'PlusJakartaSans_700Bold';
const FONT_BODY_800 = 'PlusJakartaSans_800ExtraBold';
const FONT_DISPLAY_700 = 'SpaceGrotesk_700Bold';
const FONT_MONO_500 = 'JetBrainsMono_500Medium';
const FONT_MONO_700 = 'JetBrainsMono_700Bold';

interface TypoProps extends TextProps {
  color?: string;
}

/** Hero — büyük splash başlık (welcome) */
export function Hero({ children, color, style, ...rest }: TypoProps) {
  return (
    <Text
      style={[
        {
          fontFamily: FONT_DISPLAY_700,
          fontSize: 56,
          lineHeight: 53,
          letterSpacing: -1.68,
          color: color ?? '#0E1116',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** H-Hero — orta-büyük başlık (onboarding) */
export function HHero({ children, color, style, ...rest }: TypoProps) {
  return (
    <Text
      style={[
        {
          fontFamily: FONT_DISPLAY_700,
          fontSize: 34,
          lineHeight: 36,
          letterSpacing: -0.85,
          color: color ?? '#0E1116',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** H1 — section başlık */
export function H1({ children, color, style, ...rest }: TypoProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.3}
      style={[
        {
          fontFamily: FONT_DISPLAY_700,
          fontSize: scaleFont(28, { max: 36 }),
          lineHeight: 31,
          letterSpacing: -0.56,
          color: color ?? '#0E1116',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** H2 — kart başlık (Plus Jakarta 800) */
export function H2({ children, color, style, ...rest }: TypoProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.3}
      style={[
        {
          fontFamily: FONT_BODY_800,
          fontSize: scaleFont(22, { max: 28 }),
          lineHeight: 25,
          letterSpacing: -0.33,
          color: color ?? '#0E1116',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** H3 — alt başlık */
export function H3({ children, color, style, ...rest }: TypoProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.4}
      style={[
        {
          fontFamily: FONT_BODY_700,
          fontSize: scaleFont(17, { max: 22 }),
          lineHeight: 20,
          color: color ?? '#0E1116',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** Body — paragraf metni (15px) */
export function Body({ children, color, style, ...rest }: TypoProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.5}
      style={[
        {
          fontFamily: FONT_BODY,
          fontSize: scaleFont(15, { max: 20 }),
          lineHeight: 22,
          color: color ?? '#5A6478',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** Eyebrow — küçük mono uppercase (10px, letter-spacing 0.18em) */
export function Eyebrow({
  children,
  color,
  style,
  accent,
  ...rest
}: TypoProps & { accent?: boolean }) {
  return (
    <Text
      style={[
        {
          fontFamily: FONT_MONO_500,
          fontSize: 10,
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          color: color ?? (accent ? '#E63946' : '#8A93A6'),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** Mono — data/kod (JetBrains Mono) */
export function Mono({ children, color, style, ...rest }: TypoProps) {
  return (
    <Text
      style={[
        {
          fontFamily: FONT_MONO_500,
          fontSize: 13,
          letterSpacing: 0.26,
          color: color ?? '#0E1116',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** Label (uppercase 11px small bold) — pill içeriği */
export function Label({ children, color, style, ...rest }: TypoProps) {
  return (
    <Text
      style={[
        {
          fontFamily: FONT_BODY_700,
          fontSize: 11,
          letterSpacing: 0.44,
          textTransform: 'uppercase',
          color: color ?? '#2A3140',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export const FONTS = {
  body: FONT_BODY,
  body500: FONT_BODY_500,
  body600: FONT_BODY_600,
  body700: FONT_BODY_700,
  body800: FONT_BODY_800,
  display: FONT_DISPLAY_700,
  mono: FONT_MONO_500,
  mono700: FONT_MONO_700,
} as const;

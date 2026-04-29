/**
 * AirSpeak Design System — Primitives
 *
 * Reusable component'ler — design canvas'taki signature pattern'lar:
 * - BoardingPass (yan deliklerli + kesik çizgi)
 * - RunwayStripes (pist şeritleri)
 * - LessonNode (4 durum: done/current/locked/checkpoint)
 * - Pill (renk varyantları)
 * - Button3D (alt-shadow signature CTA)
 * - StreakChip (orange→red gradient)
 * - HeartsRow (5 dolu/boş)
 * - Chip (XP/coin badge)
 * - Waveform (audio bars)
 * - PassDivider (boarding pass kesik)
 */
import { View, TouchableOpacity, type ViewProps, type TouchableOpacityProps } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import type { ReactNode } from 'react';
import { Eyebrow, Label, FONTS } from './typography';
import { Text } from 'react-native';

// ═══════════════════════════════════════════════
// BOARDING PASS — yan deliklerli, kesik çizgili kart
// ═══════════════════════════════════════════════

export function BoardingPass({
  children,
  bgColor = '#FFFFFF',
  borderColor = '#DCE0E8',
  outerBg = '#FAFAF7',
  style,
  ...rest
}: ViewProps & { bgColor?: string; borderColor?: string; outerBg?: string }) {
  return (
    <View
      style={[
        {
          backgroundColor: bgColor,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor,
          position: 'relative',
          overflow: 'visible',
        },
        style,
      ]}
      {...rest}
    >
      {children}
      {/* Sol delik */}
      <View
        style={{
          position: 'absolute',
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: outerBg,
          borderWidth: 1.5,
          borderColor,
          top: '50%',
          left: -12,
          marginTop: -11,
        }}
      />
      {/* Sağ delik */}
      <View
        style={{
          position: 'absolute',
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: outerBg,
          borderWidth: 1.5,
          borderColor,
          top: '50%',
          right: -12,
          marginTop: -11,
        }}
      />
    </View>
  );
}

/** Boarding pass içi kesik çizgi (cut-line) */
export function PassDivider({ color = '#B8BFCC' }: { color?: string }) {
  // Dashed line implementasyonu — RN native solution
  return (
    <View style={{ flexDirection: 'row', overflow: 'hidden', height: 2, marginVertical: 12 }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 2,
            backgroundColor: i % 2 === 0 ? color : 'transparent',
            marginRight: 2,
          }}
        />
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════
// RUNWAY STRIPES — pist şeritleri (dekoratif)
// ═══════════════════════════════════════════════

export function RunwayStripes({
  height = 6,
  color = 'rgba(255,255,255,0.7)',
  bgColor = 'transparent',
  style,
}: ViewProps & { height?: number; color?: string; bgColor?: string }) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          height,
          backgroundColor: bgColor,
          borderRadius: 2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: i % 2 === 0 ? color : 'transparent',
            marginRight: 2,
          }}
        />
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════
// PILL — renk varyantları
// ═══════════════════════════════════════════════

export type PillVariant = 'navy' | 'red' | 'gold' | 'green' | 'sky' | 'outline' | 'paper';

const PILL_COLORS: Record<PillVariant, { bg: string; fg: string; border?: string }> = {
  navy: { bg: '#0F1E47', fg: '#FFFFFF' },
  red: { bg: '#E63946', fg: '#FFFFFF' },
  gold: { bg: '#F2C14E', fg: '#0A1430' },
  green: { bg: '#2DBE6C', fg: '#FFFFFF' },
  sky: { bg: '#E0F2FF', fg: '#0F1E47' },
  outline: { bg: 'transparent', fg: '#5A6478', border: '#B8BFCC' },
  paper: { bg: '#FFFFFF', fg: '#0E1116', border: '#DCE0E8' },
};

export function Pill({
  children,
  variant = 'navy',
  icon,
  style,
}: {
  children: ReactNode;
  variant?: PillVariant;
  icon?: ReactNode;
  style?: ViewProps['style'];
}) {
  const colors = PILL_COLORS[variant];
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          height: 26,
          paddingHorizontal: 10,
          borderRadius: 999,
          backgroundColor: colors.bg,
          borderWidth: colors.border ? 1.5 : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {icon}
      <Label color={colors.fg}>{children}</Label>
    </View>
  );
}

// ═══════════════════════════════════════════════
// BUTTON 3D — Duolingo-tarzı alt-shadow CTA
// ═══════════════════════════════════════════════

export type ButtonVariant = 'primary' | 'navy' | 'secondary' | 'ghost';

const BTN_STYLES: Record<ButtonVariant, { bg: string; fg: string; shadow: string; border?: string }> = {
  primary: { bg: '#E63946', fg: '#FFFFFF', shadow: '#C8202E' },
  navy: { bg: '#0F1E47', fg: '#FFFFFF', shadow: '#0A1430' },
  secondary: { bg: '#FFFFFF', fg: '#0E1116', shadow: '#B8BFCC', border: '#DCE0E8' },
  ghost: { bg: 'transparent', fg: '#5A6478', shadow: 'transparent', border: '#DCE0E8' },
};

export function Button3D({
  children,
  variant = 'primary',
  onPress,
  disabled,
  fullWidth,
  height = 56,
  style,
  textStyle,
  accessibilityLabel,
  ...rest
}: TouchableOpacityProps & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  height?: number;
  textStyle?: any;
}) {
  const c = BTN_STYLES[variant];
  // Auto a11y label: child string ise onu kullan
  const autoLabel =
    accessibilityLabel ?? (typeof children === 'string' ? children : undefined);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={autoLabel}
      style={[
        {
          height,
          backgroundColor: c.bg,
          borderRadius: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderBottomWidth: 4,
          borderBottomColor: c.shadow,
          borderWidth: c.border ? 1.5 : 0,
          borderColor: c.border ?? c.shadow,
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {(() => {
        // Children string, number ya da bunların array'i ise tek <Text> içinde render et
        // (Button3D'ye {t('x')} ✈ gibi karışık string verirsen ona uyum sağlar)
        const isStringLike =
          typeof children === 'string' ||
          typeof children === 'number' ||
          (Array.isArray(children) &&
            children.every((c) => typeof c === 'string' || typeof c === 'number'));
        if (isStringLike) {
          return (
            <Text
              style={[
                {
                  fontFamily: FONTS.body800,
                  fontSize: 16,
                  letterSpacing: 0.32,
                  color: c.fg,
                  textTransform: 'uppercase',
                },
                textStyle,
              ]}
            >
              {children}
            </Text>
          );
        }
        return children;
      })()}
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════
// CARD 3D — alt-shadow düz kart
// ═══════════════════════════════════════════════

export function Card3D({ children, style, ...rest }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: '#DCE0E8',
          padding: 16,
          borderBottomWidth: 4.5,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

// ═══════════════════════════════════════════════
// STREAK CHIP — orange→red gradient (signature)
// ═══════════════════════════════════════════════

export function StreakChip({ days = 12 }: { days?: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FF7847',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        shadowColor: '#FF5A66',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Svg width={16} height={18} viewBox="0 0 16 18" fill="none">
        <Path
          d="M8 17c3.5 0 6-2.5 6-5.5 0-1.5-1-2.5-1-4 0-1.5-1-3-2.5-4 .3 2.5-1 3.5-2 4.5-1.5 1.5-1 4-1.5 4.5-.5-.5-1-1.5-1-2.5C5 11 4 12.5 4 14c0 1.5 1.5 3 4 3z"
          fill="white"
        />
      </Svg>
      <Text
        style={{
          fontFamily: FONTS.body800,
          fontSize: 14,
          color: '#FFFFFF',
        }}
      >
        {days}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════
// HEARTS ROW — 5 dolu/boş can
// ═══════════════════════════════════════════════

export function HeartsRow({ count = 4, max = 5 }: { count?: number; max?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <Svg key={i} width={22} height={20} viewBox="0 0 22 20">
          <Path
            d="M11 18s-7-4-9-9c-1-2.5.5-5 3-5.5 2-.5 4 .5 6 3 2-2.5 4-3.5 6-3 2.5.5 4 3 3 5.5-2 5-9 9-9 9z"
            fill={i < count ? '#E63946' : '#DCE0E8'}
          />
        </Svg>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════
// CHIP — XP/coin badge
// ═══════════════════════════════════════════════

export function Chip({
  children,
  icon,
  variant = 'navy',
  style,
}: {
  children: ReactNode;
  icon?: ReactNode;
  variant?: PillVariant;
  style?: ViewProps['style'];
}) {
  const colors = PILL_COLORS[variant];
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          height: 30,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: colors.bg,
          borderWidth: colors.border ? 1.5 : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={{
          fontFamily: FONTS.body800,
          fontSize: 13,
          color: colors.fg,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════
// LESSON NODE — runway-styled (4 durum)
// ═══════════════════════════════════════════════

export type LessonNodeState = 'done' | 'current' | 'locked' | 'available';

export function LessonNode({
  state,
  children,
  size = 76,
  onPress,
}: {
  state: LessonNodeState;
  children?: ReactNode;
  size?: number;
  onPress?: () => void;
}) {
  const config = {
    done: {
      bg: '#2DBE6C',
      border: '#2DBE6C',
      shadow: '#1FA35A',
      color: '#FFFFFF',
    },
    current: {
      bg: '#E63946',
      border: '#E63946',
      shadow: '#C8202E',
      color: '#FFFFFF',
    },
    locked: {
      bg: '#E9E6DD',
      border: '#DCE0E8',
      shadow: 'transparent',
      color: '#8A93A6',
    },
    available: {
      bg: '#FFFFFF',
      border: '#DCE0E8',
      shadow: '#B8BFCC',
      color: '#0E1116',
    },
  }[state];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={state === 'locked'}
      onPress={onPress}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: config.bg,
        borderWidth: 3,
        borderColor: config.border,
        borderBottomWidth: state === 'current' ? 8 : state === 'done' ? 4 : 0,
        borderBottomColor: config.shadow,
      }}
    >
      {children}
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════
// PROGRESS BAR — design canvas pattern (red/navy/gold/green)
// ═══════════════════════════════════════════════

export function ProgressBar({
  value,
  max = 100,
  color = 'red',
  height = 12,
}: {
  value: number;
  max?: number;
  color?: 'red' | 'navy' | 'gold' | 'green';
  height?: number;
}) {
  const COLORS = {
    red: '#E63946',
    navy: '#0F1E47',
    gold: '#F2C14E',
    green: '#2DBE6C',
  };
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <View
      style={{
        height,
        backgroundColor: '#EDEFF3',
        borderRadius: 999,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: COLORS[color],
          borderRadius: 999,
        }}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════
// AVATAR — initials circle
// ═══════════════════════════════════════════════

export function Avatar({
  initials,
  color = '#0F1E47',
  size = 40,
}: {
  initials: string;
  color?: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: FONTS.body700,
          fontSize: size * 0.38,
          color: '#FFFFFF',
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

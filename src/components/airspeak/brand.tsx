/**
 * AirSpeak Brand Components
 * - LogoMark (yıldız + uçak ikonu)
 * - LogoLockup (logo + wordmark + tagline)
 * - RouteGlobe (kürede dünya rotaları)
 * - TopoBackground (radial dot grid + gradient — navy hero)
 */
import { View, Text } from 'react-native';
import Svg, { Path, Rect, Circle, Ellipse, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import { FONTS } from './typography';

// ═══════════════════════════════════════════════
// LOGO MARK — yıldız + uçak (signature)
// ═══════════════════════════════════════════════

export function LogoMark({ size = 40, color = '#E63946' }: { size?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 40 40" width={size} height={size}>
      <Rect x={2} y={2} width={36} height={36} rx={10} fill={color} />
      <Path
        d="M9 22l5-1 5-9 1.5.5-2 9 5 1.5 2-3.5 1.5.5-1 5 1 5-1.5.5-2-3.5-5 1.5 2 9-1.5.5-5-9-5-1z"
        fill="white"
      />
    </Svg>
  );
}

// ═══════════════════════════════════════════════
// LOGO LOCKUP — logo + AirSpeak + tagline
// ═══════════════════════════════════════════════

export function LogoLockup({ inverse = false }: { inverse?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark size={36} color={inverse ? '#FFFFFF' : '#E63946'} />
      <View>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontWeight: '700',
            fontSize: 22,
            letterSpacing: -0.44,
            color: inverse ? '#FFFFFF' : '#0E1116',
            lineHeight: 22,
          }}
        >
          AirSpeak
        </Text>
        <Text
          style={{
            fontFamily: FONTS.mono,
            fontSize: 9,
            letterSpacing: 1.62,
            color: inverse ? 'rgba(255,255,255,0.6)' : '#8A93A6',
            marginTop: 2,
            textTransform: 'uppercase',
          }}
        >
          Aviation English
        </Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════
// ROUTE GLOBE — kürede IST→JFK rota
// ═══════════════════════════════════════════════

export function RouteGlobe({ size = 120 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 120 120" width={size} height={size}>
      <Circle cx={60} cy={60} r={48} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      <Ellipse cx={60} cy={60} rx={48} ry={22} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      <Ellipse cx={60} cy={60} rx={22} ry={48} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
      <Path
        d="M14 50 Q60 12 106 60 Q90 100 30 86"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <Circle cx={14} cy={50} r={3} fill="white" />
      <Circle cx={106} cy={60} r={3} fill="#E63946" />
    </Svg>
  );
}

// ═══════════════════════════════════════════════
// TOPO BACKGROUND — navy + glow (welcome hero)
// ═══════════════════════════════════════════════

export function TopoBackground({ width = 393, height = 850 }: { width?: number; height?: number }) {
  return (
    <Svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="40%">
          <Stop offset="0%" stopColor="rgba(230,57,70,0.35)" />
          <Stop offset="100%" stopColor="rgba(230,57,70,0)" />
        </RadialGradient>
        <RadialGradient id="cyan" cx="0%" cy="0%">
          <Stop offset="0%" stopColor="rgba(91,192,255,0.18)" />
          <Stop offset="100%" stopColor="rgba(91,192,255,0)" />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill="#0F1E47" />
      <Rect width={width} height={height} fill="url(#cyan)" />
      <Rect width={width} height={height} fill="url(#glow)" />

      {/* World arcs */}
      <Ellipse cx={196} cy={320} rx={220} ry={120} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <Ellipse cx={196} cy={320} rx={160} ry={80} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      <Ellipse cx={196} cy={320} rx={100} ry={50} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />

      {/* Route */}
      <Path d="M50 380 Q196 240 340 380" stroke="rgba(255,90,90,0.7)" strokeWidth={2} strokeDasharray="4 4" fill="none" />
      <Circle cx={50} cy={380} r={5} fill="white" />
      <Circle cx={340} cy={380} r={5} fill="#E63946" />

      {/* Tiny plane */}
      <G transform="translate(220 270) rotate(35)">
        <Path d="M0 -8 L2 6 L8 4 L8 8 L0 6 L-8 8 L-8 4 L-2 6 Z" fill="white" opacity={0.95} />
      </G>
    </Svg>
  );
}

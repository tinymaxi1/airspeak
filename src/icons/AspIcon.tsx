/**
 * AspIcon — AirSpeak custom icon registry
 *
 * Tasarım canvas (icons.jsx) → React Native SVG port.
 * 30+ aviation-flavored line icons (1.75px stroke, 24×24, round caps).
 *
 * Designer Q12 onayı: Custom registry + Lucide fallback.
 * Custom icon name varsa kendi SVG'mizi render eder; yoksa lucide-react-native'a düşer.
 *
 * Phase 12 — IconRegistry shell. Phase 1-11'deki emoji'lerin yerine
 * <AspIcon name="mic" /> kullanılacak (toplu refactor v1.1'de).
 */
import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import * as Lucide from 'lucide-react-native';

export type AspIconName =
  // Aviation
  | 'plane'
  | 'plane-tilt'
  | 'tower'
  | 'compass'
  | 'map'
  | 'route'
  | 'boarding'
  | 'engine'
  | 'cloud'
  // Audio
  | 'mic'
  | 'headset'
  | 'volume'
  | 'play'
  | 'pause'
  | 'mute'
  | 'radio'
  // Gamification
  | 'heart'
  | 'flame'
  | 'star'
  | 'crown'
  | 'trophy'
  | 'target'
  | 'coin'
  | 'lightning'
  | 'shield'
  | 'sparkle'
  // UI
  | 'check'
  | 'x'
  | 'plus'
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'search'
  | 'bell'
  | 'lock'
  | 'clock'
  | 'settings'
  | 'globe'
  | 'info'
  | 'bookmark'
  | 'book'
  | 'chat'
  | 'bot'
  | 'briefcase'
  | 'user'
  | 'moon'
  | 'sun'
  | 'eye'
  | 'camera';

export interface AspIconProps {
  name: AspIconName | string;
  size?: number;
  color?: string;
  /** İçi dolu (filled) variant — Heart/Star/Play/Pause vb. için */
  filled?: boolean;
}

const STROKE_WIDTH = 1.75;

export function AspIcon({ name, size = 24, color = '#0E1116', filled = false }: AspIconProps) {
  const fill = filled ? color : 'none';
  const common = {
    stroke: color,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };

  const wrap = (children: React.ReactNode) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {children}
    </Svg>
  );

  switch (name) {
    // ─── Aviation ───
    case 'plane':
      return wrap(
        <Path
          d="M3 12l4-1 5-7 1.5.5-2 7 4 1 2-3 1.5.5-1 4 1 4-1.5.5-2-3-4 1 2 7L12 22l-5-7-4-1z"
          {...common}
        />,
      );
    case 'plane-tilt':
      return wrap(
        <Path
          d="M21 13l-4-1-3-9-2 .5 1 8-6-1.5-1.5-3-1.5.5.5 4-1 1 1 1.5 4-.5 1.5 6 8 2 1-.5-2-3 4 1z"
          {...common}
        />,
      );
    case 'tower':
      return wrap(
        <G {...common}>
          <Path d="M9 4h6l-1 5h-4z" />
          <Path d="M8 9h8l1 11H7z" />
          <Path d="M12 4V2" />
          <Path d="M10 14h4" />
        </G>,
      );
    case 'compass':
      return wrap(
        <G {...common}>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M14.5 9.5L13 13l-3.5 1.5L11 11z" />
          <Path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21" />
        </G>,
      );
    case 'map':
      return wrap(
        <G {...common}>
          <Path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2z" />
          <Path d="M9 4v14M15 6v14" />
        </G>,
      );
    case 'boarding':
      return wrap(
        <G {...common}>
          <Rect x={3} y={6} width={18} height={12} rx={2} />
          <Path d="M9 6v12" />
          <Path d="M13 10h4M13 14h3" />
          <Circle cx={6} cy={12} r={1.5} />
        </G>,
      );
    case 'engine':
      return wrap(
        <G {...common}>
          <Circle cx={12} cy={12} r={8} />
          <Circle cx={12} cy={12} r={3} />
          <Path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
        </G>,
      );
    case 'cloud':
      return wrap(
        <Path d="M7 18a5 5 0 010-10 6 6 0 0111 1 4 4 0 010 9z" {...common} />,
      );

    // ─── Audio ───
    case 'mic':
      return wrap(
        <G {...common}>
          <Rect x={9} y={3} width={6} height={12} rx={3} />
          <Path d="M5 11a7 7 0 0014 0" />
          <Path d="M12 18v3" />
          <Path d="M9 21h6" />
        </G>,
      );
    case 'headset':
      return wrap(
        <G {...common}>
          <Path d="M4 14v-2a8 8 0 0116 0v2" />
          <Rect x={3} y={13} width={4} height={7} rx={1.5} />
          <Rect x={17} y={13} width={4} height={7} rx={1.5} />
          <Path d="M19 20a3 3 0 01-3 3h-2" />
        </G>,
      );
    case 'volume':
      return wrap(
        <G {...common}>
          <Path d="M4 9h3l5-4v14l-5-4H4z" />
          <Path d="M16 9a4 4 0 010 6" />
          <Path d="M19 6a8 8 0 010 12" />
        </G>,
      );
    case 'play':
      return wrap(<Path d="M7 5l12 7-12 7z" stroke={color} strokeWidth={STROKE_WIDTH} fill={color} strokeLinejoin="round" />);
    case 'pause':
      return wrap(
        <G stroke={color} strokeWidth={STROKE_WIDTH} fill={color}>
          <Rect x={6} y={5} width={4} height={14} rx={1} />
          <Rect x={14} y={5} width={4} height={14} rx={1} />
        </G>,
      );

    // ─── Gamification ───
    case 'heart':
      return wrap(
        <Path
          d="M12 20s-7-4.5-9-9c-1-2 0-5 3-6 2-.5 4 .5 6 3 2-2.5 4-3.5 6-3 3 1 4 4 3 6-2 4.5-9 9-9 9z"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill={filled ? color : 'none'}
          strokeLinejoin="round"
        />,
      );
    case 'flame':
      return wrap(
        <Path
          d="M12 22a6 6 0 006-6c0-3-2-4-2-7 0-2-1-4-3-6 .5 4-2 5-3 7-2 4 0 8-1 9a4 4 0 01-1-3c-1 1-2 3-2 5 0 3.5 3 6 6 6z"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill={filled ? color : 'none'}
          strokeLinejoin="round"
        />,
      );
    case 'star':
      return wrap(
        <Path
          d="M12 3l3 6 6 1-4.5 4.5 1 6L12 18l-5.5 2.5 1-6L3 10l6-1z"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill={filled ? color : 'none'}
          strokeLinejoin="round"
        />,
      );
    case 'crown':
      return wrap(
        <G {...common}>
          <Path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" />
          <Path d="M5 19h14" />
        </G>,
      );
    case 'trophy':
      return wrap(
        <G {...common}>
          <Path d="M7 4h10v3a5 5 0 01-10 0z" />
          <Path d="M7 5H4v2a3 3 0 003 3" />
          <Path d="M17 5h3v2a3 3 0 01-3 3" />
          <Path d="M9 14h6v3a3 3 0 01-3 3 3 3 0 01-3-3z" />
          <Path d="M8 22h8" />
        </G>,
      );
    case 'target':
      return wrap(
        <G {...common}>
          <Circle cx={12} cy={12} r={9} />
          <Circle cx={12} cy={12} r={5} />
          <Circle cx={12} cy={12} r={1.5} fill={color} />
        </G>,
      );
    case 'coin':
      return wrap(
        <G {...common}>
          <Circle cx={12} cy={12} r={9} />
          <Circle cx={12} cy={12} r={6} />
          <Path d="M12 8v8M9 11h6" />
        </G>,
      );
    case 'lightning':
      return wrap(<Path d="M13 3L4 13h6l-1 8 9-10h-6z" {...common} fill={filled ? color : 'none'} />);
    case 'shield':
      return wrap(
        <G {...common}>
          <Path d="M12 3l8 3v5c0 5-3 9-8 11-5-2-8-6-8-11V6z" />
          <Path d="M9 12l2 2 4-4" />
        </G>,
      );
    case 'sparkle':
      return wrap(
        <Path
          d="M12 4v6M12 14v6M4 12h6M14 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"
          {...common}
        />,
      );

    // ─── UI ───
    case 'check':
      return wrap(<Path d="M5 12l4 4 10-10" {...common} />);
    case 'x':
      return wrap(<Path d="M6 6l12 12M18 6l-12 12" {...common} />);
    case 'plus':
      return wrap(<Path d="M12 5v14M5 12h14" {...common} />);
    case 'arrow-right':
      return wrap(<Path d="M5 12h14M13 6l6 6-6 6" {...common} />);
    case 'arrow-left':
      return wrap(<Path d="M19 12H5M11 6l-6 6 6 6" {...common} />);
    case 'chevron-right':
      return wrap(<Path d="M9 6l6 6-6 6" {...common} />);
    case 'chevron-left':
      return wrap(<Path d="M15 6l-6 6 6 6" {...common} />);
    case 'chevron-up':
      return wrap(<Path d="M6 15l6-6 6 6" {...common} />);
    case 'chevron-down':
      return wrap(<Path d="M6 9l6 6 6-6" {...common} />);
    case 'search':
      return wrap(
        <G {...common}>
          <Circle cx={11} cy={11} r={6} />
          <Path d="M16 16l4 4" />
        </G>,
      );
    case 'bell':
      return wrap(
        <G {...common}>
          <Path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" />
          <Path d="M10 20a2 2 0 004 0" />
        </G>,
      );
    case 'lock':
      return wrap(
        <G {...common}>
          <Rect x={5} y={11} width={14} height={10} rx={2} />
          <Path d="M8 11V8a4 4 0 018 0v3" />
        </G>,
      );
    case 'clock':
      return wrap(
        <G {...common}>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M12 7v5l3 2" />
        </G>,
      );
    case 'settings':
      return wrap(
        <G {...common}>
          <Circle cx={12} cy={12} r={3} />
          <Path d="M19.4 15a7.97 7.97 0 000-6l1.6-1-2-3.5-2 .8a8 8 0 00-5-3l-.5-2h-3l-.5 2a8 8 0 00-5 3l-2-.8-2 3.5 1.6 1a7.97 7.97 0 000 6l-1.6 1 2 3.5 2-.8a8 8 0 005 3l.5 2h3l.5-2a8 8 0 005-3l2 .8 2-3.5z" />
        </G>,
      );
    case 'globe':
      return wrap(
        <G {...common}>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
        </G>,
      );
    case 'info':
      return wrap(
        <G {...common}>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M12 8v.01M12 11v6" />
        </G>,
      );
    case 'bookmark':
      return wrap(
        <Path
          d="M6 4h12v17l-6-4-6 4z"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill={filled ? color : 'none'}
          strokeLinejoin="round"
        />,
      );
    case 'book':
      return wrap(
        <G {...common}>
          <Path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 5v16" />
          <Path d="M9 7h6M9 11h4" />
        </G>,
      );
    case 'chat':
      return wrap(
        <G {...common}>
          <Path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H9l-4 4v-4H6a2 2 0 01-2-2z" />
          <Path d="M8 9h8M8 12h5" />
        </G>,
      );
    case 'bot':
      return wrap(
        <G {...common}>
          <Rect x={4} y={8} width={16} height={11} rx={3} />
          <Path d="M12 4v4M9 13h.01M15 13h.01M9 17c1 1 5 1 6 0" />
          <Path d="M2 13h2M20 13h2" />
        </G>,
      );
    case 'briefcase':
      return wrap(
        <G {...common}>
          <Rect x={3} y={7} width={18} height={13} rx={2} />
          <Path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
          <Path d="M3 13h18" />
        </G>,
      );
    case 'user':
      return wrap(
        <G {...common}>
          <Circle cx={12} cy={8} r={4} />
          <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </G>,
      );
    case 'moon':
      return wrap(<Path d="M21 13a8 8 0 01-11-11 8 8 0 1011 11z" {...common} />);
    case 'sun':
      return wrap(
        <G {...common}>
          <Circle cx={12} cy={12} r={4} />
          <Path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.5 1.5M17 17l1.5 1.5M5.5 18.5L7 17M17 7l1.5-1.5" />
        </G>,
      );
    case 'eye':
      return wrap(
        <G {...common}>
          <Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
          <Circle cx={12} cy={12} r={3} />
        </G>,
      );
    case 'camera':
      return wrap(
        <G {...common}>
          <Rect x={3} y={7} width={18} height={13} rx={2} />
          <Circle cx={12} cy={13} r={4} />
          <Path d="M9 7l1-2h4l1 2" />
        </G>,
      );

    // ─── Lucide fallback ───
    default: {
      // Custom registry'de yoksa lucide-react-native'a düş
      // Kebab-case → PascalCase: 'arrow-up' → 'ArrowUp'
      const lucideName = String(name)
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
      const LucideComponent = (Lucide as unknown as Record<string, React.ComponentType<{ size: number; color: string; strokeWidth: number }>>)[lucideName];
      if (LucideComponent) {
        return <LucideComponent size={size} color={color} strokeWidth={STROKE_WIDTH} />;
      }
      // Lucide'da da yok → boş svg (graceful)
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`[AspIcon] Unknown icon name: "${name}" (lucide fallback also missing)`);
      }
      return <Svg width={size} height={size} viewBox="0 0 24 24" />;
    }
  }
}

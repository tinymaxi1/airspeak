/**
 * TabletShell — Tablet container wrapper (Designer Q5 onayı)
 *
 * ≥768px width'te aktif. Phone design 560px max-width'te merkezlenir,
 * yanlarda decorative gradient + topo strip rendered.
 *
 * Phone (<768px): pass-through, hiçbir şey değişmez
 * Tablet (≥768px): centered shell + side decoration
 *
 * Designer prensibi: tablet'te phone-design'ı tekrar yaz YERİNE merkezle.
 * Apple Submit Tablet Level 1 gereksinimi karşılanır (orientation + multitasking).
 * v1.1: zengin tablet UX (nav rail + two-column master/detail) ayrı sprint.
 */
import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useResponsive, TABLET_SHELL_MAX_WIDTH } from '@/lib/useResponsive';
import { TopoBackground } from '@/components/airspeak';

interface TabletShellProps {
  children: React.ReactNode;
  /** Background fill — varsayılan paper (#FAFAF7).
   *  Dark screen'lerde navy-900 verilebilir (welcome/lesson-complete). */
  background?: string;
  /** Side decoration tipi:
   *  'topo' (default): topo bg pattern + soft fade
   *  'gradient': solid color gradient (welcome/cinematic dark screens için)
   *  'none': kararsız ekranlar için sade decorative kapatılır */
  decoration?: 'topo' | 'gradient' | 'none';
  /** Inner content style override */
  contentStyle?: ViewStyle;
}

export function TabletShell({
  children,
  background = '#FAFAF7',
  decoration = 'topo',
  contentStyle,
}: TabletShellProps) {
  const { isTablet } = useResponsive();

  // Phone: pass-through
  if (!isTablet) {
    return <>{children}</>;
  }

  // Tablet: centered shell + side decoration
  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      {/* Side decoration — left + right of centered shell */}
      {decoration !== 'none' && (
        <View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="none"
        >
          {decoration === 'topo' ? (
            <View style={{ flex: 1, opacity: 0.15 }}>
              <TopoBackground />
            </View>
          ) : (
            <Svg width="100%" height="100%" preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="tabletBg" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#0F1E47" stopOpacity={0.3} />
                  <Stop offset="50%" stopColor={background} stopOpacity={0} />
                  <Stop offset="100%" stopColor="#0F1E47" stopOpacity={0.3} />
                </LinearGradient>
              </Defs>
              <Rect x={0} y={0} width="100%" height="100%" fill="url(#tabletBg)" />
            </Svg>
          )}
        </View>
      )}

      {/* Centered shell — phone design 560px max-width */}
      <View
        style={[
          {
            flex: 1,
            width: '100%',
            maxWidth: TABLET_SHELL_MAX_WIDTH,
            alignSelf: 'center',
            backgroundColor: background,
            // Hafif side shadow — shell sınırını belirginleştirir
            shadowColor: '#0A1430',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 4,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

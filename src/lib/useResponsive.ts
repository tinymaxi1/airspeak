/**
 * useResponsive — Tablet/Phone breakpoint detection
 *
 * Phase 13 — Designer Q5 onayı: ≥768px = tablet
 * (Apple Submit Tablet Level 1: orientation + multitasking)
 *
 * iPad portrait: 768×1024
 * iPad landscape: 1024×768
 * iPhone Pro Max: 430×932
 *
 * Tablet breakpoint 768px → iPad portrait dahil.
 */
import { useWindowDimensions } from 'react-native';

export const TABLET_BREAKPOINT = 768;
export const TABLET_SHELL_MAX_WIDTH = 560;

export interface ResponsiveInfo {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
}

/**
 * Reactive: window resize/orientation change'inde re-render.
 * useWindowDimensions React Native built-in (orientation aware).
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isTablet: width >= TABLET_BREAKPOINT,
    isLandscape: width > height,
  };
}

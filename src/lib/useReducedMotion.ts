/**
 * useReducedMotion — iOS/Android Reduce Motion ayarını dinler.
 * Sprint 6.C
 *
 * Kullanım:
 *   const reduce = useReducedMotion();
 *   const duration = reduce ? 0 : 280;
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduce(enabled);
      })
      .catch(() => undefined);

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setReduce(enabled);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduce;
}

/**
 * Android hardware back button helper.
 * Sprint 6.B
 *
 * Kullanım:
 *   useAndroidBack(() => {
 *     // true döndürürsen default back engellenir
 *     return showExitConfirm();
 *   });
 */
import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

export function useAndroidBack(handler: () => boolean): void {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => sub.remove();
  }, [handler]);
}

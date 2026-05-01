/**
 * KeyboardAware — formlar için sarmalayıcı.
 * Sprint 6.D
 *
 * iOS: padding behavior; Android: height (klavye altta itme).
 * Klavye açıkken input görünür kalır.
 */
import { KeyboardAvoidingView, Platform, type ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  offset?: number;
}

export function KeyboardAware({ children, style, offset = 0 }: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={offset}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

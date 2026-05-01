/**
 * LockedCard — premium içerik için reusable blur+kilit overlay.
 *
 * Kullanım:
 *   <LockedCard locked onPress={() => showPaywall('icao_oral_first_task_done')}>
 *     <YourContent />
 *   </LockedCard>
 *
 * locked=false → children olduğu gibi render. locked=true → blur + kilit + tap = paywall.
 */
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Lock, Crown } from 'lucide-react-native';
import { FONTS, Mono } from '@/components/airspeak';

export interface LockedCardProps {
  locked: boolean;
  children: React.ReactNode;
  /** Tap edilince çağrılır (varsayılan: /paywall'a push) */
  onPress?: () => void;
  /** Custom CTA mesajı */
  message?: string;
  /** Premium emoji (Crown) yerine kilit göster */
  variant?: 'crown' | 'lock';
  /** Overlay opaklığı (default 0.92) */
  overlayOpacity?: number;
  /** Min height (children boş ise) */
  minHeight?: number;
  /** Border radius — children'ın radius'una uyumlu */
  borderRadius?: number;
}

export function LockedCard({
  locked,
  children,
  onPress,
  message,
  variant = 'crown',
  overlayOpacity = 0.92,
  minHeight,
  borderRadius = 14,
}: LockedCardProps) {
  if (!locked) {
    return <>{children}</>;
  }

  const handlePress = onPress ?? (() => router.push('/paywall'));
  const Icon = variant === 'crown' ? Crown : Lock;
  const iconColor = variant === 'crown' ? '#F2C14E' : '#FFFFFF';

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={{ position: 'relative', minHeight, borderRadius, overflow: 'hidden' }}
    >
      {/* Children faded */}
      <View style={{ opacity: 0.35 }}>{children}</View>

      {/* Lock overlay */}
      <View
        pointerEvents="none"
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: `rgba(15,30,71,${overlayOpacity * 0.55})`,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: 12,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: variant === 'crown' ? '#0F1E47' : '#E63946',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: variant === 'crown' ? '#F2C14E' : '#FFFFFF',
          }}
        >
          <Icon size={22} color={iconColor} strokeWidth={2.5} />
        </View>
        <Mono
          style={{
            fontSize: 10,
            color: '#FFFFFF',
            letterSpacing: 1.2,
            fontFamily: FONTS.mono700,
            textAlign: 'center',
          }}
        >
          {variant === 'crown' ? 'PRO' : 'KİLİTLİ'}
        </Mono>
        {message ? (
          <Text
            style={{
              fontFamily: FONTS.body700,
              fontSize: 12,
              color: '#FFFFFF',
              textAlign: 'center',
              maxWidth: 200,
            }}
          >
            {message}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

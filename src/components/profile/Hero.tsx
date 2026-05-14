/**
 * Profile Hero — avatar (uploadable) + isim + rol + level chips.
 *
 * Tap avatar → action sheet (Galeri / Kamera / Sil) → upload + cache patch.
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Avatar, FONTS, Mono } from '@/components/airspeak';
import { presentAvatarSheet } from '@/features/profile/AvatarUploader';
import { Camera } from 'lucide-react-native';

export interface HeroProps {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  initials: string;
  roleLabel: string;
  level: string;
}

export function Hero({
  userId,
  displayName,
  avatarUrl,
  initials,
  roleLabel,
  level,
}: HeroProps) {
  const [busy, setBusy] = useState(false);

  function onAvatarTap() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    presentAvatarSheet(userId, !!avatarUrl, (r) => {
      setBusy(false);
      if (!r.ok && r.error && r.error !== 'cancelled') {
        // Toast yerine Alert kullanılabilir; şimdilik sessiz fail.
        if (__DEV__) console.warn('avatar upload', r.error);
      }
    });
    setBusy(true);
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <TouchableOpacity
        onPress={onAvatarTap}
        activeOpacity={0.8}
        accessibilityLabel="Avatarı değiştir"
        accessibilityRole="button"
      >
        <View>
          <Avatar
            initials={initials}
            imageUrl={avatarUrl}
            color="#E63946"
            size={64}
            ringColor="rgba(255,255,255,0.25)"
          />
          {/* Camera badge — tap edilebilir hint */}
          <View
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: '#F2C14E',
              borderWidth: 2,
              borderColor: '#0F1E47',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#0A1430" />
            ) : (
              <Camera size={11} color="#0A1430" strokeWidth={2.5} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.7)' }}>
          {roleLabel.toUpperCase()}
        </Mono>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 26,
            fontWeight: '700',
            color: '#FFFFFF',
            letterSpacing: -0.52,
            marginTop: 2,
            lineHeight: 28,
          }}
          numberOfLines={1}
        >
          {displayName}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
            }}
          >
            <Mono style={{ fontSize: 11, color: '#FFFFFF', letterSpacing: 0.88 }}>
              {roleLabel}
            </Mono>
          </View>
          <View
            style={{
              backgroundColor: '#F2C14E',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 6,
            }}
          >
            <Mono style={{ fontSize: 11, color: '#0A1430', letterSpacing: 0.88 }}>
              LEVEL {level}
            </Mono>
          </View>
        </View>
      </View>
    </View>
  );
}

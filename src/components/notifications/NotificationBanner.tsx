/**
 * In-app notification banner — top toast, 3s auto-dismiss.
 * Sprint 5.C
 *
 * Tap → route push, dismiss.
 */
import { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View, Text, Easing } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBannerStore } from '@/stores/notificationBannerStore';
import { Mono, FONTS } from '@/components/airspeak';

const AUTO_DISMISS_MS = 3000;

export function NotificationBannerHost() {
  const current = useBannerStore((s) => s.current);
  const dismiss = useBannerStore((s) => s.dismiss);

  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!current) return;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      hide();
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  function hide() {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismiss();
    });
  }

  function onTap() {
    if (timerRef.current) clearTimeout(timerRef.current);
    const route = current?.route;
    hide();
    if (route) {
      // hide animasyonundan sonra route push
      setTimeout(() => router.push(route as any), 200);
    }
  }

  if (!current) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <SafeAreaView edges={['top']}>
        <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onTap}
            style={{
              backgroundColor: '#0F1E47',
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.18,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#FFD56B',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>{current.emoji ?? '🔔'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Mono style={{ fontSize: 9, color: '#FFD56B', letterSpacing: 1.5 }}>
                AIRSPEAK
              </Mono>
              <Text
                numberOfLines={1}
                style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#FFFFFF' }}
              >
                {current.title}
              </Text>
              {current.body ? (
                <Text
                  numberOfLines={2}
                  style={{ fontSize: 12, color: '#DCE0E8', marginTop: 2, lineHeight: 16 }}
                >
                  {current.body}
                </Text>
              ) : null}
            </View>
            <Text style={{ color: '#8A93A6', fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

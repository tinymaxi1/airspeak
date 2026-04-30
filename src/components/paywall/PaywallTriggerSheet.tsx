/**
 * Global paywall trigger sheet — bottom sheet nudge.
 *
 * Trigger çağrılır → bu sheet açılır (icon + title + body + 2 button).
 * "Pro'yu İncele" → /paywall (full plan picker)
 * "Şimdi değil" → kapat
 *
 * usePaywallStore.show('trigger_id') ile her yerden tetiklenir.
 * App root'unda <PaywallTriggerSheet /> bir kez render edilir.
 */
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Crown, X } from 'lucide-react-native';
import { usePaywallStore } from '@/stores/paywallStore';
import { FONTS, Mono, Body, Button3D } from '@/components/airspeak';

export function PaywallTriggerSheet() {
  const trigger = usePaywallStore((s) => s.activeTrigger);
  const close = usePaywallStore((s) => s.close);

  if (!trigger) return null;
  const isHard = trigger.intensity === 'hard';

  function goPaywall() {
    close();
    router.push('/paywall');
  }

  return (
    <Modal visible={true} animationType="none" transparent onRequestClose={close}>
      <Animated.View
        entering={FadeIn.duration(200)}
        style={{
          flex: 1,
          backgroundColor: 'rgba(15,30,71,0.65)',
          justifyContent: 'flex-end',
        }}
      >
        <Animated.View
          entering={SlideInDown.duration(280)}
          style={{
            backgroundColor: '#FAFAF7',
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingBottom: 36,
          }}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: isHard ? '#0F1E47' : '#E63946',
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: 24,
              paddingTop: 28,
              alignItems: 'center',
              gap: 10,
              position: 'relative',
            }}
          >
            <TouchableOpacity
              onPress={close}
              hitSlop={12}
              style={{ position: 'absolute', top: 12, right: 12 }}
            >
              <X size={22} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>

            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: 'rgba(242,193,78,0.18)',
                borderWidth: 2,
                borderColor: '#F2C14E',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Crown size={28} color="#F2C14E" />
            </View>
            <Mono
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: 1.4,
                fontFamily: FONTS.mono700,
              }}
            >
              {isHard ? 'PRO\'YA GEÇ' : 'AIRSPEAK PRO'}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 22,
                color: '#FFFFFF',
                fontWeight: '700',
                textAlign: 'center',
                lineHeight: 26,
              }}
            >
              {trigger.title}
            </Text>
            <Body
              color="rgba(255,255,255,0.92)"
              style={{ fontSize: 14, textAlign: 'center', maxWidth: 300, lineHeight: 20 }}
            >
              {trigger.body}
            </Body>
          </View>

          {/* Benefits */}
          <View style={{ padding: 24, gap: 10 }}>
            {[
              '✈️  Sınırsız ders + tüm ICAO 4 setleri',
              '💬  Sınırsız AI pratik + telaffuz drill',
              '👑  Lig ödülleri 2× + premium rozet',
              '📥  Offline indirme · reklam yok',
            ].map((line, i) => (
              <Text
                key={i}
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 14,
                  color: '#0E1116',
                  lineHeight: 21,
                }}
              >
                {line}
              </Text>
            ))}
          </View>

          {/* Actions */}
          <View style={{ paddingHorizontal: 24, gap: 8 }}>
            <Button3D variant="primary" fullWidth onPress={goPaywall}>
              Pro'yu İncele
            </Button3D>
            <TouchableOpacity onPress={close} style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 13,
                  color: '#8A93A6',
                }}
              >
                Şimdi değil
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

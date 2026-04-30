/**
 * TrialCountdownChip — sadece subscription_status='trialing' ise görünür.
 *
 * Tap → showPaywall('trial_ending') (cooldown çalışır).
 */
import { TouchableOpacity, Text, View } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useTrialStatus } from '@/features/trial/api';
import { showPaywall } from '@/stores/paywallStore';

export function TrialCountdownChip() {
  const userId = useAuthStore((s) => s.user?.id);
  const trial = useTrialStatus(userId);

  if (!trial.isTrialing) return null;

  const isEndingSoon = trial.daysLeft <= 1;

  return (
    <TouchableOpacity
      onPress={() => showPaywall('trial_ending')}
      activeOpacity={0.85}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: isEndingSoon ? '#E63946' : '#FFD56B',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderBottomWidth: 3,
        borderBottomColor: isEndingSoon ? '#B82E3A' : '#F2C14E',
        marginBottom: 14,
      }}
    >
      <Text style={{ fontSize: 16 }}>{isEndingSoon ? '🚨' : '👑'}</Text>
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: '700',
          color: isEndingSoon ? '#FFFFFF' : '#0A1430',
        }}
      >
        {isEndingSoon
          ? `Pro denemen ${trial.daysLeft === 0 ? 'bugün' : 'yarın'} bitiyor`
          : `Pro deneme aktif — ${trial.daysLeft} gün kaldı`}
      </Text>
      <View
        style={{
          backgroundColor: isEndingSoon ? 'rgba(255,255,255,0.22)' : 'rgba(10,20,48,0.12)',
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.8,
            color: isEndingSoon ? '#FFFFFF' : '#0A1430',
          }}
        >
          DEVAM ET →
        </Text>
      </View>
    </TouchableOpacity>
  );
}

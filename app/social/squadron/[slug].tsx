/**
 * Squadron detay — üyeler week_xp DESC + katıl/ayrıl.
 */
import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ChevronLeft, Users } from 'lucide-react-native';
import { Body, FONTS, Mono, Avatar, Button3D } from '@/components/airspeak';
import { useAuthStore } from '@/stores/authStore';
import {
  useSquadron,
  joinSquadron,
  leaveSquadron,
} from '@/features/social/api';

export default function SquadronDetailScreen() {
  const c = usePalette();
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const user = useAuthStore((s) => s.user);
  const { squadron, members, loading, refresh } = useSquadron(slug);
  const [busy, setBusy] = useState(false);

  if (loading || !squadron) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1F4FB6" />
      </View>
    );
  }

  const isMember = members.some((m) => m.user_id === user?.id);
  const isFull = squadron.member_count >= squadron.capacity;

  async function toggleMembership() {
    if (!squadron) return;
    setBusy(true);
    if (isMember) {
      const r = await leaveSquadron(squadron.id);
      if (r.ok) {
        Alert.alert('✓', 'Squadron\'dan ayrıldın');
        void refresh();
      } else Alert.alert('Hata', r.error ?? 'Hata');
    } else {
      const r = await joinSquadron(squadron.id);
      if (r.ok) {
        Alert.alert('✓', `${squadron.name} squadron'una katıldın`);
        void refresh();
      } else Alert.alert('Hata', r.error ?? 'Hata');
    }
    setBusy(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#1F4FB6' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#1F4FB6',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 28 }}>{squadron.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.4 }}>
              SQUADRON
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 20,
                color: '#FFFFFF',
                fontWeight: '700',
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {squadron.name}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: '#EDEFF3',
            marginBottom: 16,
          }}
        >
          {squadron.description ? (
            <Body color="#0E1116" style={{ fontSize: 14, lineHeight: 21, marginBottom: 10 }}>
              {squadron.description}
            </Body>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Users size={14} color="#5A6478" />
              <Mono style={{ fontSize: 11, color: '#5A6478' }}>
                {squadron.member_count} / {squadron.capacity}
              </Mono>
            </View>
            <Mono style={{ fontSize: 10, color: '#8A93A6' }}>@{squadron.slug}</Mono>
          </View>
        </View>

        {!isMember && (
          <View style={{ marginBottom: 16 }}>
            <Button3D
              variant="primary"
              fullWidth
              onPress={toggleMembership}
              disabled={busy || isFull}
            >
              {isFull ? 'Squadron dolu' : busy ? 'Katılıyor…' : 'Katıl'}
            </Button3D>
          </View>
        )}

        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4, marginBottom: 8 }}>
          ÜYELER · BU HAFTA
        </Mono>
        {members.map((m, i) => (
          <Animated.View
            key={m.user_id}
            entering={FadeInUp.delay(i * 25).duration(220)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 10,
              marginBottom: 6,
              backgroundColor: m.user_id === user?.id ? '#FFF1F2' : '#FFFFFF',
              borderRadius: 10,
              borderWidth: m.user_id === user?.id ? 2 : 1,
              borderColor: m.user_id === user?.id ? '#E63946' : '#EDEFF3',
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 14,
                fontWeight: '700',
                color: i < 3 ? '#1F4FB6' : '#5A6478',
                width: 24,
                textAlign: 'center',
              }}
            >
              {i + 1}
            </Text>
            <Avatar
              initials={(m.full_name ?? m.username ?? 'PI').slice(0, 2).toUpperCase()}
              imageUrl={m.avatar_url}
              size={32}
              color="#0F1E47"
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 13,
                  color: m.user_id === user?.id ? '#E63946' : '#0E1116',
                }}
                numberOfLines={1}
              >
                {m.full_name ?? m.username ?? 'Pilot'}
                {m.role === 'admin' ? ' 👑' : ''}
              </Text>
              <Mono style={{ fontSize: 10, color: '#8A93A6', marginTop: 1 }}>
                {m.week_xp.toLocaleString('tr-TR')} XP / hafta
              </Mono>
            </View>
          </Animated.View>
        ))}

        {isMember && squadron.created_by !== user?.id && (
          <View style={{ marginTop: 20 }}>
            <Button3D variant="ghost" fullWidth onPress={toggleMembership} disabled={busy}>
              {busy ? '…' : 'Squadron\'dan ayrıl'}
            </Button3D>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

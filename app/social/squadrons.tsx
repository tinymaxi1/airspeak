/**
 * Squadron Hub — leaderboard + kullanıcının squadron'ları + oluştur/ara.
 */
import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ChevronLeft, Plus, Search, Users } from 'lucide-react-native';
import { Body, FONTS, Mono, Button3D } from '@/components/airspeak';
import { useAuthStore } from '@/stores/authStore';
import {
  useUserSquadrons,
  useSquadronLeaderboard,
  searchPublicSquadrons,
  createSquadron,
  joinSquadron,
  type SquadronRow,
} from '@/features/social/api';

export default function SquadronsScreen() {
  const user = useAuthStore((s) => s.user);
  const { rows: mine, refresh: refreshMine } = useUserSquadrons(user?.id);
  const { rows: lb, loading: lbLoading } = useSquadronLeaderboard();

  const [createOpen, setCreateOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
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
          <Users size={22} color="#FFFFFF" />
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
              SQUADRONS
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 22,
                color: '#FFFFFF',
                fontWeight: '700',
                marginTop: 2,
              }}
            >
              {mine.length} kayıtlı
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Aksiyon butonları */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setCreateOpen(true)}
            style={{
              flex: 1,
              backgroundColor: '#1F4FB6',
              borderRadius: 12,
              padding: 14,
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#FFFFFF' }}>
              Squadron Oluştur
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSearchOpen(true)}
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 14,
              alignItems: 'center',
              gap: 4,
              borderWidth: 1,
              borderColor: '#1F4FB6',
            }}
          >
            <Search size={18} color="#1F4FB6" />
            <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#1F4FB6' }}>
              Squadron Bul
            </Text>
          </TouchableOpacity>
        </View>

        {/* User squadrons */}
        {mine.length > 0 && (
          <View style={{ marginBottom: 22 }}>
            <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4, marginBottom: 8 }}>
              KAYITLI OLDUKLARIN
            </Mono>
            {mine.map((s, i) => (
              <SquadronCard key={s.id} squadron={s} delay={i * 40} />
            ))}
          </View>
        )}

        {/* Public leaderboard */}
        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4, marginBottom: 8 }}>
          SQUADRON SIRALAMASI · BU HAFTA
        </Mono>
        {lbLoading && lb.length === 0 ? (
          <ActivityIndicator color="#1F4FB6" style={{ marginTop: 24 }} />
        ) : lb.length === 0 ? (
          <Body color="#8A93A6" style={{ fontSize: 13, textAlign: 'center', marginTop: 16 }}>
            Henüz public squadron yok. İlk olabilirsin!
          </Body>
        ) : (
          lb.map((s, i) => (
            <Animated.View
              key={s.id}
              entering={FadeInUp.delay(i * 25).duration(220)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                marginBottom: 8,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#EDEFF3',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 14,
                  fontWeight: '700',
                  color: s.rank <= 3 ? '#1F4FB6' : '#5A6478',
                  width: 24,
                  textAlign: 'center',
                }}
              >
                {s.rank}
              </Text>
              <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
              <TouchableOpacity
                onPress={() => router.push(`/social/squadron/${s.slug}`)}
                style={{ flex: 1 }}
              >
                <Text
                  style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}
                  numberOfLines={1}
                >
                  {s.name}
                </Text>
                <Mono style={{ fontSize: 10, color: '#8A93A6', marginTop: 2 }}>
                  {s.member_count} üye · {s.total_week_xp.toLocaleString('tr-TR')} XP
                </Mono>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {createOpen && (
        <CreateSquadronModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            void refreshMine();
          }}
        />
      )}
      {searchOpen && (
        <SearchSquadronModal
          onClose={() => setSearchOpen(false)}
          onJoined={() => {
            setSearchOpen(false);
            void refreshMine();
          }}
        />
      )}
    </View>
  );
}

function SquadronCard({ squadron, delay }: { squadron: SquadronRow; delay: number }) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(260)}>
      <TouchableOpacity
        onPress={() => router.push(`/social/squadron/${squadron.slug}`)}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 14,
          marginBottom: 8,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: '#1F4FB6',
        }}
      >
        <Text style={{ fontSize: 32 }}>{squadron.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.body700, fontSize: 15, color: '#0E1116' }} numberOfLines={1}>
            {squadron.name}
          </Text>
          <Mono style={{ fontSize: 10, color: '#5A6478', marginTop: 2 }}>
            {squadron.member_count} / {squadron.capacity} üye
          </Mono>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Create modal ─────────────────────────────────────────────────────────
function CreateSquadronModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✈️');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!slug.trim() || !/^[a-z0-9_-]+$/.test(slug)) {
      Alert.alert('Hata', 'Slug zorunlu (a-z, 0-9, _, -)');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Hata', 'İsim zorunlu');
      return;
    }
    setBusy(true);
    const r = await createSquadron({ slug: slug.trim(), name: name.trim(), emoji });
    setBusy(false);
    if (r.ok) {
      Alert.alert('✓', 'Squadron oluşturuldu');
      onCreated();
    } else {
      Alert.alert('Hata', r.error ?? 'Oluşturulamadı');
    }
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15,30,71,0.6)',
        justifyContent: 'flex-end',
      }}
    >
      <View
        style={{
          backgroundColor: '#FAFAF7',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          padding: 20,
          paddingBottom: 40,
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 22,
            fontWeight: '700',
            color: '#0F1E47',
            marginBottom: 16,
          }}
        >
          Yeni Squadron
        </Text>

        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.2 }}>
          SLUG (BENZERSİZ)
        </Mono>
        <TextInput
          value={slug}
          onChangeText={(v) => setSlug(v.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
          placeholder="thy-pilots-2026"
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            padding: 12,
            fontFamily: FONTS.mono700,
            fontSize: 14,
            color: '#0E1116',
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#DCE0E8',
          }}
        />

        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.2, marginTop: 12 }}>
          İSİM
        </Mono>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="THY Pilotları"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            padding: 12,
            fontFamily: FONTS.body,
            fontSize: 15,
            color: '#0E1116',
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#DCE0E8',
          }}
        />

        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.2, marginTop: 12 }}>
          EMOJI
        </Mono>
        <TextInput
          value={emoji}
          onChangeText={setEmoji}
          maxLength={2}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            padding: 12,
            fontSize: 24,
            color: '#0E1116',
            marginTop: 4,
            borderWidth: 1,
            borderColor: '#DCE0E8',
            textAlign: 'center',
            width: 80,
          }}
        />

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <Button3D variant="ghost" fullWidth onPress={onClose} disabled={busy}>
            Vazgeç
          </Button3D>
          <Button3D variant="primary" fullWidth onPress={submit} disabled={busy}>
            {busy ? 'Oluşturuluyor…' : 'Oluştur'}
          </Button3D>
        </View>
      </View>
    </View>
  );
}

// ─── Search modal ─────────────────────────────────────────────────────────
function SearchSquadronModal({
  onClose,
  onJoined,
}: {
  onClose: () => void;
  onJoined: () => void;
}) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SquadronRow[]>([]);

  useEffect(() => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setResults(await searchPublicSquadrons(q));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  async function join(id: string, name: string) {
    const r = await joinSquadron(id);
    if (r.ok) {
      Alert.alert('✓', `${name} squadron'una katıldın`);
      onJoined();
    } else {
      Alert.alert('Hata', r.error ?? 'Katılamadın');
    }
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15,30,71,0.6)',
        justifyContent: 'flex-end',
      }}
    >
      <View
        style={{
          backgroundColor: '#FAFAF7',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          padding: 20,
          paddingBottom: 40,
          maxHeight: '80%',
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 22,
            fontWeight: '700',
            color: '#0F1E47',
            marginBottom: 16,
          }}
        >
          Squadron Bul
        </Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="isim veya slug ara..."
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            padding: 12,
            fontFamily: FONTS.body,
            fontSize: 15,
            color: '#0E1116',
            borderWidth: 1,
            borderColor: '#DCE0E8',
          }}
        />

        <ScrollView style={{ marginTop: 12, maxHeight: 400 }}>
          {results.length === 0 ? (
            <Body color="#8A93A6" style={{ fontSize: 13, textAlign: 'center', marginTop: 24 }}>
              {q.length < 2 ? 'En az 2 karakter yaz' : 'Sonuç bulunamadı'}
            </Body>
          ) : (
            results.map((s) => (
              <View
                key={s.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  marginBottom: 8,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#EDEFF3',
                }}
              >
                <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }} numberOfLines={1}>
                    {s.name}
                  </Text>
                  <Mono style={{ fontSize: 10, color: '#8A93A6', marginTop: 1 }}>
                    @{s.slug} · {s.member_count}/{s.capacity}
                  </Mono>
                </View>
                <TouchableOpacity
                  onPress={() => join(s.id, s.name)}
                  disabled={s.member_count >= s.capacity}
                  style={{
                    backgroundColor: s.member_count >= s.capacity ? '#DCE0E8' : '#1F4FB6',
                    borderRadius: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  }}
                >
                  <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: '#FFFFFF' }}>
                    {s.member_count >= s.capacity ? 'DOLU' : 'KATIL'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        <Button3D variant="ghost" fullWidth onPress={onClose}>
          Kapat
        </Button3D>
      </View>
    </View>
  );
}

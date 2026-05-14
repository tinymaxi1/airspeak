/**
 * New community group create form.
 *
 * - slug (snake/dash, unique), name, description, emoji, privacy (4 segment),
 *   capacity (2-5000), passcode (sadece secret için)
 * - Premium privacy yalnız premium kullanıcı oluşturabilir (RPC reddeder).
 */
import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { createGroup, type GroupPrivacy } from '@/features/community/api';
import { FONTS, Mono, Body, Button3D } from '@/components/airspeak';

const PRIVACIES: { id: GroupPrivacy; label: string; help: string; emoji: string }[] = [
  { id: 'open', label: 'Açık', emoji: '🌐', help: 'Herkes görebilir + katılabilir' },
  { id: 'closed', label: 'Kapalı', emoji: '🔐', help: 'Görünür ama katılım onayla' },
  { id: 'secret', label: 'Gizli', emoji: '🤫', help: 'Listede çıkmaz, passcode ile' },
  { id: 'premium', label: 'Pro', emoji: '👑', help: 'Sadece Pro üyeler' },
];

export default function NewGroupScreen() {
  const c = usePalette();
  const isPremium = useAuthStore((s) => s.isPremium);

  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('✈️');
  const [privacy, setPrivacy] = useState<GroupPrivacy>('open');
  const [capacity, setCapacity] = useState('100');
  const [passcode, setPasscode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validateSlug(s: string): string | null {
    if (!/^[a-z0-9_-]+$/.test(s)) return 'küçük harf, rakam, _ ya da -';
    if (s.length < 3 || s.length > 40) return '3-40 karakter';
    return null;
  }

  async function submit() {
    const slugErr = validateSlug(slug);
    if (slugErr) {
      Alert.alert('Slug hatası', slugErr);
      return;
    }
    if (name.length < 2) {
      Alert.alert('Hata', 'İsim en az 2 karakter');
      return;
    }
    const cap = Math.max(2, Math.min(5000, parseInt(capacity, 10) || 100));
    if (privacy === 'secret' && passcode.length < 4) {
      Alert.alert('Hata', 'Gizli grup için passcode min 4 karakter');
      return;
    }
    if (privacy === 'premium' && !isPremium) {
      Alert.alert('Pro gerekli', 'Pro grup oluşturmak için Pro üyelik gerekir.');
      return;
    }

    setSubmitting(true);
    const r = await createGroup({
      slug,
      name,
      description: description.trim() || undefined,
      emoji: emoji.trim() || '✈️',
      privacy,
      capacity: cap,
      passcode: privacy === 'secret' ? passcode : undefined,
    });
    setSubmitting(false);

    if (!r.ok) {
      const msg =
        r.error === 'slug_already_exists'
          ? 'Bu slug zaten kullanımda'
          : r.error === 'premium_required'
            ? 'Pro üyelik gerekli'
            : r.error === 'passcode_min_4_chars'
              ? 'Passcode min 4 karakter'
              : r.error ?? 'Tekrar dene';
      Alert.alert('Oluşturulamadı', msg);
      return;
    }
    Alert.alert('Grup oluşturuldu', `${name} hazır.`, [
      {
        text: 'Aç',
        onPress: () => {
          router.replace(`/community/${slug}` as any);
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1 }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#0F1E47' }}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: '#0F1E47',
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 22, color: '#FFFFFF' }}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
                YENİ GRUP
              </Mono>
              <Text
                style={{ fontFamily: FONTS.display, fontSize: 22, color: '#FFFFFF', fontWeight: '700' }}
              >
                Squadron Oluştur
              </Text>
            </View>
          </View>
        </SafeAreaView>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <Field label="Slug *" hint="Linkte görünür · küçük harf · 3-40 karakter">
            <TextInput
              value={slug}
              onChangeText={(t) => setSlug(t.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="pilot-tk"
              autoCapitalize="none"
              style={inputStyle}
            />
          </Field>

          <Field label="Emoji">
            <TextInput
              value={emoji}
              onChangeText={setEmoji}
              placeholder="✈️"
              style={[inputStyle, { width: 80, textAlign: 'center', fontSize: 22 }]}
            />
          </Field>

          <Field label="İsim *" hint="2-80 karakter">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Pilot TK Squadron"
              style={inputStyle}
            />
          </Field>

          <Field label="Açıklama" hint="Opsiyonel · max 500">
            <TextInput
              value={description}
              onChangeText={(t) => t.length <= 500 && setDescription(t)}
              placeholder="THY pilotları için ICAO 4 hazırlık ve günlük pratik."
              multiline
              style={[inputStyle, { height: 80, paddingTop: 10 }]}
            />
          </Field>

          <View style={{ marginBottom: 16 }}>
            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1, marginBottom: 8 }}>
              GİZLİLİK *
            </Mono>
            <View style={{ gap: 8 }}>
              {PRIVACIES.map((p) => {
                const active = privacy === p.id;
                const disabled = p.id === 'premium' && !isPremium;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => !disabled && setPrivacy(p.id)}
                    disabled={disabled}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: active ? '#E63946' : '#DCE0E8',
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      opacity: disabled ? 0.5 : 1,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{p.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#0E1116' }}>
                        {p.label}{disabled ? ' (Pro)' : ''}
                      </Text>
                      <Body color="#5A6478" style={{ fontSize: 11 }}>
                        {p.help}
                      </Body>
                    </View>
                    {active && (
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: '#E63946',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {privacy === 'secret' && (
            <Field label="Passcode *" hint="Üyelik için min 4 karakter">
              <TextInput
                value={passcode}
                onChangeText={setPasscode}
                placeholder="örn flytk2026"
                autoCapitalize="none"
                secureTextEntry
                style={inputStyle}
              />
            </Field>
          )}

          <Field label="Kapasite" hint="2-5000 üye">
            <TextInput
              value={capacity}
              onChangeText={(t) => setCapacity(t.replace(/[^0-9]/g, ''))}
              placeholder="100"
              keyboardType="number-pad"
              style={[inputStyle, { width: 120 }]}
            />
          </Field>

          <Button3D variant="primary" fullWidth disabled={submitting} onPress={submit}>
            {submitting ? 'Oluşturuluyor…' : 'Grup oluştur'}
          </Button3D>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const inputStyle = {
  borderWidth: 1.5,
  borderColor: '#DCE0E8',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  fontFamily: FONTS.body,
  backgroundColor: '#FFFFFF',
} as const;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1, marginBottom: 6 }}>
        {label}
      </Mono>
      {children}
      {hint ? (
        <Body color="#8A93A6" style={{ fontSize: 11, marginTop: 4 }}>
          {hint}
        </Body>
      ) : null}
    </View>
  );
}

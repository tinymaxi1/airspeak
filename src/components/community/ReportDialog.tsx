/**
 * ReportDialog — kullanıcı içerik rapor eder.
 *
 * Modal: reason picker (13 sebep) + opsiyonel detay (max 500 char).
 * RPC: report_community_content (rate_limit + content_flags insert).
 */
import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  reportContent,
  REPORT_REASONS,
  type ReportTargetType,
  type ReportReason,
} from '@/features/community/api';
import { FONTS, Mono, Body, Button3D } from '@/components/airspeak';

interface Props {
  visible: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
}

export function ReportDialog({ visible, onClose, targetType, targetId }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setReason(null);
    setComment('');
    setSubmitting(false);
  }

  async function submit() {
    if (!reason) return;
    setSubmitting(true);
    const r = await reportContent({
      targetType,
      targetId,
      reason,
      comment: comment.trim() || undefined,
    });
    setSubmitting(false);
    if (!r.ok) {
      const msg =
        r.error === 'rate_limited'
          ? `Günlük rapor limitin doldu (${r.count}/${r.limit}). Yarın tekrar dene.`
          : r.error ?? 'Tekrar deneyin.';
      Alert.alert('Gönderilemedi', msg);
      return;
    }
    Alert.alert(
      '✓ Rapor alındı',
      'Mod ekibi 24 saat içinde inceleyecek. Yardımın için teşekkürler.',
      [
        {
          text: 'Tamam',
          onPress: () => {
            reset();
            onClose();
          },
        },
      ],
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#FAFAF7' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#EDEFF3',
            }}
          >
            <TouchableOpacity onPress={onClose} disabled={submitting}>
              <Text style={{ fontSize: 16, color: '#5A6478' }}>İptal</Text>
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: FONTS.body800,
                fontSize: 16,
                color: '#0E1116',
              }}
            >
              🚩 Bildir
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <Body color="#5A6478" style={{ fontSize: 13, marginBottom: 14, lineHeight: 19 }}>
              Bu içeriği neden bildirmek istiyorsun? Mod ekibi 24 saat içinde inceleyecek.
            </Body>

            <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1, marginBottom: 8 }}>
              SEBEP *
            </Mono>
            <View style={{ gap: 6, marginBottom: 16 }}>
              {REPORT_REASONS.map((r) => {
                const active = reason === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => setReason(r.id)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderWidth: 2,
                      borderColor: active ? '#E63946' : '#DCE0E8',
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        borderWidth: 2,
                        borderColor: active ? '#E63946' : '#DCE0E8',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {active && (
                        <View
                          style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#E63946' }}
                        />
                      )}
                    </View>
                    <Text style={{ fontSize: 14, fontFamily: FONTS.body, color: '#0E1116', flex: 1 }}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1, marginBottom: 6 }}>
              DETAY (OPSIYONEL)
            </Mono>
            <TextInput
              value={comment}
              onChangeText={(t) => t.length <= 500 && setComment(t)}
              placeholder="Mod ekibine yardımcı olmak için kısa bir açıklama..."
              placeholderTextColor="#8A93A6"
              multiline
              style={{
                borderWidth: 1.5,
                borderColor: '#DCE0E8',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                minHeight: 80,
                fontSize: 13,
                fontFamily: FONTS.body,
                color: '#0E1116',
                lineHeight: 19,
                backgroundColor: '#FFFFFF',
              }}
            />
            <Mono style={{ fontSize: 10, color: '#8A93A6', marginTop: 4 }}>
              {comment.length}/500
            </Mono>
          </ScrollView>

          <View
            style={{
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: '#EDEFF3',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Button3D
              variant="primary"
              fullWidth
              disabled={!reason || submitting}
              onPress={() => void submit()}
            >
              {submitting ? 'Gönderiliyor…' : 'Bildir'}
            </Button3D>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

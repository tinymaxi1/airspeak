/**
 * İçerik Bildirim Sheet — modal bottom sheet, neden + opsiyonel yorum.
 *
 * Kullanım:
 *   const [open, setOpen] = useState(false);
 *   <Pressable onPress={() => setOpen(true)}>...</Pressable>
 *   <FlagContentSheet open={open} onClose={() => setOpen(false)}
 *     contentType="interview_question" contentId="qt_te8" />
 */
import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FONTS } from '@/components/airspeak';
import { flagContent, type FlagContentType, type FlagReason } from '@/features/moderation/contentFlags';

const REASONS: { id: FlagReason; emoji: string; key: string }[] = [
  { id: 'inaccurate', emoji: '⚠️', key: 'inaccurate' },
  { id: 'offensive', emoji: '🚫', key: 'offensive' },
  { id: 'copyright', emoji: '©', key: 'copyright' },
  { id: 'broken_audio', emoji: '🔇', key: 'brokenAudio' },
  { id: 'spam', emoji: '🗑', key: 'spam' },
  { id: 'other', emoji: '…', key: 'other' },
];

type Status = 'idle' | 'submitting' | 'success' | 'duplicate' | 'no-auth' | 'error';

export function FlagContentSheet({
  open,
  onClose,
  contentType,
  contentId,
}: {
  open: boolean;
  onClose: () => void;
  contentType: FlagContentType;
  contentId: string;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<FlagReason | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  function reset() {
    setReason(null);
    setComment('');
    setStatus('idle');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function submit() {
    if (!reason) return;
    setStatus('submitting');
    const result = await flagContent({ contentType, contentId, reason, comment });
    if (result.ok) {
      setStatus('success');
      setTimeout(handleClose, 1400);
    } else if (result.reason === 'duplicate') {
      setStatus('duplicate');
    } else if (result.reason === 'no-auth') {
      setStatus('no-auth');
    } else {
      setStatus('error');
    }
  }

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        onPress={handleClose}
      >
        <Pressable
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 36 : 24,
            paddingHorizontal: 20,
          }}
          onPress={() => undefined}
        >
          {/* Drag handle */}
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#DCE0E8' }} />
          </View>

          <Text style={{ fontFamily: FONTS.body800, fontSize: 18, color: '#0E1116' }}>
            {t('flag.title', 'İçeriği bildir')}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.body,
              fontSize: 13,
              color: '#5A6478',
              marginTop: 4,
              lineHeight: 18,
            }}
          >
            {t(
              'flag.subtitle',
              '24 saat içinde inceleyeceğiz. Mükerrer raporlama 24 saat boyunca engellenir.',
            )}
          </Text>

          {status === 'success' ? (
            <View style={{ paddingVertical: 28, alignItems: 'center' }}>
              <Text style={{ fontSize: 36 }}>✅</Text>
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 15,
                  color: '#0E1116',
                  marginTop: 8,
                }}
              >
                {t('flag.thanks', 'Teşekkürler, bildirimin kayıt edildi.')}
              </Text>
            </View>
          ) : (
            <>
              {/* Reason chips */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 16,
                }}
              >
                {REASONS.map((r) => {
                  const active = reason === r.id;
                  return (
                    <Pressable
                      key={r.id}
                      onPress={() => setReason(r.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        borderWidth: 1.5,
                        borderColor: active ? '#0F1E47' : '#DCE0E8',
                        backgroundColor: active ? '#0F1E47' : 'transparent',
                      }}
                    >
                      <Text style={{ fontSize: 13 }}>{r.emoji}</Text>
                      <Text
                        style={{
                          fontFamily: FONTS.body700,
                          fontSize: 13,
                          color: active ? '#FFFFFF' : '#0E1116',
                        }}
                      >
                        {t(`flag.reason.${r.key}`, defaultReasonLabel(r.id))}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Optional comment */}
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder={t('flag.commentPlaceholder', 'Detay (opsiyonel, en fazla 500 karakter)')}
                placeholderTextColor="#8A93A6"
                multiline
                numberOfLines={3}
                maxLength={500}
                style={{
                  marginTop: 16,
                  borderWidth: 1,
                  borderColor: '#DCE0E8',
                  borderRadius: 12,
                  padding: 12,
                  fontFamily: FONTS.body,
                  fontSize: 14,
                  color: '#0E1116',
                  minHeight: 72,
                  textAlignVertical: 'top',
                }}
              />

              {/* Status messages */}
              {status === 'duplicate' && (
                <Text
                  style={{
                    marginTop: 8,
                    fontFamily: FONTS.body,
                    fontSize: 12,
                    color: '#E63946',
                  }}
                >
                  {t('flag.duplicate', 'Bu içeriği son 24 saatte zaten bildirdin.')}
                </Text>
              )}
              {status === 'no-auth' && (
                <Text
                  style={{
                    marginTop: 8,
                    fontFamily: FONTS.body,
                    fontSize: 12,
                    color: '#E63946',
                  }}
                >
                  {t('flag.noAuth', 'Bildirim için giriş yapman gerek.')}
                </Text>
              )}
              {status === 'error' && (
                <Text
                  style={{
                    marginTop: 8,
                    fontFamily: FONTS.body,
                    fontSize: 12,
                    color: '#E63946',
                  }}
                >
                  {t('flag.error', 'Bir sorun oldu. Tekrar deneyin.')}
                </Text>
              )}

              {/* Actions */}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <Pressable
                  onPress={handleClose}
                  accessibilityRole="button"
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: '#DCE0E8',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                    {t('common.cancel', 'Vazgeç')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={submit}
                  disabled={!reason || status === 'submitting'}
                  accessibilityRole="button"
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: !reason || status === 'submitting' ? '#8A93A6' : '#0F1E47',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 8,
                  }}
                >
                  {status === 'submitting' ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#FFFFFF' }}>
                      {t('flag.submit', 'Bildir')}
                    </Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function defaultReasonLabel(id: FlagReason): string {
  switch (id) {
    case 'inaccurate':
      return 'Yanlış bilgi';
    case 'offensive':
      return 'Uygunsuz';
    case 'copyright':
      return 'Telif';
    case 'broken_audio':
      return 'Bozuk ses';
    case 'spam':
      return 'Spam';
    case 'other':
      return 'Diğer';
  }
}

/**
 * Küçük "İçeriği bildir" tetikleyici — bayrak ikonu + label.
 * Soru/ders/AI cevap kartlarının altına yerleştirilir.
 */
export function FlagContentTrigger({
  contentType,
  contentId,
}: {
  contentType: FlagContentType;
  contentId: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('flag.triggerA11y', 'Bu içeriği bildir')}
        hitSlop={8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingVertical: 4,
          paddingHorizontal: 4,
        }}
      >
        <Text style={{ fontSize: 11 }}>🚩</Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: 11, color: '#8A93A6' }}>
          {t('flag.trigger', 'Bildir')}
        </Text>
      </Pressable>
      <FlagContentSheet
        open={open}
        onClose={() => setOpen(false)}
        contentType={contentType}
        contentId={contentId}
      />
    </>
  );
}

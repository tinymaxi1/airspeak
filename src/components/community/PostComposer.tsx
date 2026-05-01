/**
 * PostComposer — text + max 4 image picker, modal pattern.
 *
 * - Text input (max 10000 char)
 * - Image picker (max 4, expo-image-picker library)
 * - Upload to post-images bucket
 * - createPost RPC call
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { createPost, uploadPostImages } from '@/features/community/api';
import { FONTS, Mono, Button3D } from '@/components/airspeak';

const MAX_IMAGES = 4;
const MAX_CHARS = 10000;

interface Props {
  groupId: string;
  visible: boolean;
  onClose: () => void;
  onSuccess?: (postId: string) => void;
}

export function PostComposer({ groupId, visible, onClose, onSuccess }: Props) {
  const userId = useAuthStore((s) => s.user?.id);
  const [content, setContent] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setContent('');
    setImageUris([]);
    setSubmitting(false);
  }

  async function pickImages() {
    if (imageUris.length >= MAX_IMAGES) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Galeriye erişim için izin ver.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - imageUris.length,
      quality: 1,
    });
    if (r.canceled) return;
    const uris = (r.assets as { uri: string }[]).map((a) => a.uri);
    setImageUris((s) => [...s, ...uris].slice(0, MAX_IMAGES));
  }

  function removeImage(uri: string) {
    setImageUris((s) => s.filter((u) => u !== uri));
  }

  async function submit() {
    if (!userId) return;
    const trimmed = content.trim();
    if (!trimmed) {
      Alert.alert('Hata', 'Boş post gönderilemez.');
      return;
    }
    setSubmitting(true);

    let urls: string[] = [];
    if (imageUris.length > 0) {
      const r = await uploadPostImages(userId, imageUris);
      if (!r.ok) {
        setSubmitting(false);
        Alert.alert('Yükleme hatası', r.errors[0] ?? 'Bilinmeyen hata');
        return;
      }
      urls = r.urls;
    }

    const r = await createPost({ groupId, content: trimmed, imageUrls: urls });
    setSubmitting(false);
    if (!r.ok) {
      Alert.alert('Gönderilemedi', r.error ?? 'Tekrar deneyin.');
      return;
    }
    reset();
    onClose();
    if (r.id) onSuccess?.(r.id);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
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
              Yeni post
            </Text>
            <TouchableOpacity
              disabled={submitting || !content.trim()}
              onPress={submit}
              style={{ opacity: submitting || !content.trim() ? 0.4 : 1 }}
            >
              <Text style={{ fontSize: 16, color: '#E63946', fontWeight: '700' }}>
                {submitting ? 'Gönderiliyor…' : 'Gönder'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <TextInput
              value={content}
              onChangeText={(t) => t.length <= MAX_CHARS && setContent(t)}
              placeholder="Squadron'la bir şey paylaş..."
              placeholderTextColor="#8A93A6"
              multiline
              autoFocus
              style={{
                fontFamily: FONTS.body,
                fontSize: 16,
                color: '#0E1116',
                minHeight: 140,
                lineHeight: 23,
              }}
            />

            <Mono
              style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8, marginTop: 4 }}
            >
              {content.length}/{MAX_CHARS}
            </Mono>

            {imageUris.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 14 }}
                contentContainerStyle={{ gap: 8 }}
              >
                {imageUris.map((uri) => (
                  <View key={uri} style={{ position: 'relative' }}>
                    <Image
                      source={{ uri }}
                      style={{ width: 100, height: 100, borderRadius: 10 }}
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(uri)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 13 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </ScrollView>

          <View
            style={{
              padding: 12,
              borderTopWidth: 1,
              borderTopColor: '#EDEFF3',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={pickImages}
              disabled={imageUris.length >= MAX_IMAGES || submitting}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: imageUris.length >= MAX_IMAGES ? '#EDEFF3' : '#F4F5F8',
                opacity: imageUris.length >= MAX_IMAGES ? 0.5 : 1,
              }}
            >
              <Text style={{ fontSize: 16 }}>📷</Text>
              <Mono style={{ fontSize: 11, color: '#0E1116', letterSpacing: 0.8 }}>
                {imageUris.length}/{MAX_IMAGES}
              </Mono>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

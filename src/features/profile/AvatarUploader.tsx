/**
 * AvatarUploader — action sheet (Galeri / Kamera / Sil) → resize → Storage upload.
 *
 * Bucket: user-avatars (RLS: kullanıcı sadece {userId}/* yazabilir)
 * Resize: 512x512 max, JPEG q=0.8 (1 MB altı tutulur)
 */
import { ActionSheetIOS, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';
import { invalidateProfile, patchProfileCache } from './useProfile';

const BUCKET = 'user-avatars';
const TARGET_SIZE = 512;

export interface AvatarUploadResult {
  ok: boolean;
  url?: string;
  error?: string;
}

async function pickFromLibrary(): Promise<ImagePicker.ImagePickerAsset | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('İzin gerekli', 'Galeriye erişim için izin ver.');
    return null;
  }
  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  return r.canceled ? null : r.assets[0] ?? null;
}

async function pickFromCamera(): Promise<ImagePicker.ImagePickerAsset | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('İzin gerekli', 'Kameraya erişim için izin ver.');
    return null;
  }
  const r = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  return r.canceled ? null : r.assets[0] ?? null;
}

async function resizeAndCompress(uri: string): Promise<string> {
  const r = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: TARGET_SIZE, height: TARGET_SIZE } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
  );
  return r.uri;
}

async function uploadToStorage(userId: string, fileUri: string): Promise<AvatarUploadResult> {
  const path = `${userId}/avatar_${Date.now()}.jpg`;
  const res = await fetch(fileUri);
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
  if (error) return { ok: false, error: error.message };

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return { ok: true, url: pub.publicUrl };
}

async function persistAndCache(userId: string, url: string | null): Promise<AvatarUploadResult> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', userId);
  if (error) return { ok: false, error: error.message };
  // Optimistic UI: cache'i hemen güncelle
  patchProfileCache(userId, { avatar_url: url });
  invalidateProfile();
  return { ok: true, url: url ?? undefined };
}

export async function uploadAvatarFlow(
  userId: string,
  source: 'library' | 'camera',
): Promise<AvatarUploadResult> {
  const asset = source === 'library' ? await pickFromLibrary() : await pickFromCamera();
  if (!asset) return { ok: false, error: 'cancelled' };

  const resized = await resizeAndCompress(asset.uri);
  const upload = await uploadToStorage(userId, resized);
  if (!upload.ok) return upload;

  return persistAndCache(userId, upload.url ?? null);
}

export async function deleteAvatarFlow(userId: string): Promise<AvatarUploadResult> {
  return persistAndCache(userId, null);
}

/**
 * Action sheet aç → seçilen kaynağa göre upload akışını başlat.
 * iOS native ActionSheetIOS, Android'de Alert ile 3 seçenek.
 */
export function presentAvatarSheet(
  userId: string,
  hasExisting: boolean,
  onResult: (r: AvatarUploadResult) => void,
) {
  const labels = hasExisting
    ? ['Galeriden seç', 'Kameradan çek', 'Mevcut avatarı sil', 'Vazgeç']
    : ['Galeriden seç', 'Kameradan çek', 'Vazgeç'];
  const cancelIndex = labels.length - 1;
  const destructiveIndex = hasExisting ? 2 : -1;

  const handle = async (idx: number) => {
    if (idx === 0) onResult(await uploadAvatarFlow(userId, 'library'));
    else if (idx === 1) onResult(await uploadAvatarFlow(userId, 'camera'));
    else if (hasExisting && idx === 2) onResult(await deleteAvatarFlow(userId));
  };

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: labels,
        cancelButtonIndex: cancelIndex,
        destructiveButtonIndex: destructiveIndex >= 0 ? destructiveIndex : undefined,
      },
      (idx) => {
        if (idx !== cancelIndex) void handle(idx);
      },
    );
  } else {
    // Android — Alert.alert max 3 button, 4 olunca custom modal gerekir.
    // hasExisting=true → Sil opsiyonunu ayrı confirm'e at.
    const buttons = [
      { text: labels[0]!, onPress: () => void handle(0) },
      { text: labels[1]!, onPress: () => void handle(1) },
    ];
    if (hasExisting) {
      buttons.push({
        text: labels[2]!,
        style: 'destructive' as any,
        onPress: () => void handle(2),
      } as any);
    }
    buttons.push({ text: 'Vazgeç', style: 'cancel' as any } as any);
    Alert.alert('Avatar', 'Ne yapmak istersin?', buttons as any);
  }
}

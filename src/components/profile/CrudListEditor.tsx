/**
 * CrudListEditor — generic kart listesi + add/edit/delete modal.
 *
 * 4 detay listesinde (experience/education/certification/type_rating) kullanılır.
 * Form alanları her tip için farklı — `renderForm` prop'u dışarıdan gelir.
 */
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { FONTS, Mono, Body, Button3D } from '@/components/airspeak';
import { Plus, Pencil, Trash2, X } from 'lucide-react-native';

export interface CrudItem {
  id: string;
}

export interface CrudListEditorProps<T extends CrudItem, F> {
  title: string;
  items: T[];
  loading: boolean;
  emptyEmoji?: string;
  emptyText: string;
  /** Karta dönüştür (subtitle vs detay) */
  renderCard: (item: T) => { primary: string; secondary?: string; tertiary?: string };
  /** Modal açılırken initialFormState — yeni: undefined, edit: itemFromState */
  itemToForm: (item: T | null) => F;
  /** Form render — alanları kullanıcıya göster, change handler */
  renderForm: (form: F, setForm: (f: F) => void) => React.ReactNode;
  /** Submit — server'a yaz */
  onSubmit: (form: F, editingId: string | null) => Promise<{ ok: boolean; error?: string }>;
  /** Delete */
  onDelete: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

export function CrudListEditor<T extends CrudItem, F>({
  title,
  items,
  loading,
  emptyEmoji = '📋',
  emptyText,
  renderCard,
  itemToForm,
  renderForm,
  onSubmit,
  onDelete,
}: CrudListEditorProps<T, F>) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<F | null>(null);
  const [busy, setBusy] = useState(false);

  function startCreate() {
    Haptics.selectionAsync().catch(() => {});
    setEditingId(null);
    setForm(itemToForm(null));
    setOpen(true);
  }

  function startEdit(item: T) {
    Haptics.selectionAsync().catch(() => {});
    setEditingId(item.id);
    setForm(itemToForm(item));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setEditingId(null);
    setForm(null);
  }

  async function submit() {
    if (!form) return;
    setBusy(true);
    const r = await onSubmit(form, editingId);
    setBusy(false);
    if (!r.ok) {
      Alert.alert('Hata', r.error ?? 'Kaydedilemedi');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    close();
  }

  function confirmDelete(item: T) {
    Alert.alert('Sil', 'Bu kaydı silmek istediğine emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const r = await onDelete(item.id);
          if (!r.ok) Alert.alert('Hata', r.error ?? 'Silinemedi');
        },
      },
    ]);
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4 }}>
          {title.toUpperCase()}
        </Mono>
        <TouchableOpacity
          onPress={startCreate}
          activeOpacity={0.85}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 8,
            backgroundColor: '#FFF1F2',
          }}
        >
          <Plus size={14} color="#E63946" />
          <Mono style={{ fontSize: 11, color: '#E63946', letterSpacing: 0.9 }}>
            EKLE
          </Mono>
        </TouchableOpacity>
      </View>

      {loading && items.length === 0 ? (
        <Body color="#8A93A6" style={{ fontSize: 12 }}>
          Yükleniyor…
        </Body>
      ) : items.length === 0 ? (
        <View
          style={{
            padding: 18,
            backgroundColor: '#F4F2EC',
            borderRadius: 12,
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 26 }}>{emptyEmoji}</Text>
          <Body color="#5A6478" style={{ fontSize: 12, textAlign: 'center' }}>
            {emptyText}
          </Body>
        </View>
      ) : (
        items.map((item) => {
          const card = renderCard(item);
          return (
            <View
              key={item.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#EDEFF3',
                padding: 12,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                  {card.primary}
                </Text>
                {card.secondary ? (
                  <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }}>
                    {card.secondary}
                  </Body>
                ) : null}
                {card.tertiary ? (
                  <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8, marginTop: 4 }}>
                    {card.tertiary}
                  </Mono>
                ) : null}
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity onPress={() => startEdit(item)} hitSlop={8}>
                  <Pencil size={16} color="#8A93A6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={8}>
                  <Trash2 size={16} color="#E63946" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Modal */}
      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Pressable
            onPress={close}
            style={{
              flex: 1,
              backgroundColor: 'rgba(15,30,71,0.55)',
              justifyContent: 'flex-end',
            }}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#FAFAF7',
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
                maxHeight: '90%',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingTop: 14,
                  paddingBottom: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#EDEFF3',
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontFamily: FONTS.body800,
                    fontSize: 18,
                    color: '#0E1116',
                  }}
                >
                  {editingId ? `${title} Düzenle` : `${title} Ekle`}
                </Text>
                <TouchableOpacity onPress={close} hitSlop={8}>
                  <X size={22} color="#0E1116" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ maxHeight: 540 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 14 }}
                keyboardShouldPersistTaps="handled"
              >
                {form !== null ? renderForm(form, setForm) : null}

                <View style={{ marginTop: 8 }}>
                  <Button3D variant="primary" fullWidth onPress={submit} disabled={busy}>
                    {busy ? 'Kaydediliyor…' : editingId ? 'Güncelle' : 'Ekle'}
                  </Button3D>
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

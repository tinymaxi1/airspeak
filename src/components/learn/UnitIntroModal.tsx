/**
 * UnitIntroModal — Sprint 12.
 * Bir üniteye girerken kısa tanıtım gösterir. Kullanıcı dil tercihine göre
 * intro_md (TR) veya intro_md_en (EN) render edilir.
 *
 * Akış:
 * - learn.tsx'te kullanıcı üniteye tıklayınca; eğer ilk tıklama ise modal aç.
 * - "Atla" → modal kapanır, üniteye geçilmiş sayılır.
 * - "Başla →" → markSeen + modal kapanır.
 * - "i" ikonundan tetiklenirse manuel açılış (yine markSeen sayılmaz, isSeen check'i yapan caller).
 */
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button3D, SimpleMarkdown, FONTS, Eyebrow as ASEyebrow } from '@/components/airspeak';
import { getCurrentLanguage } from '@/lib/i18n';

type Unit = {
  id: string;
  number: number;
  title: string;
  title_tr: string | null;
  intro_md: string | null;
  intro_md_en: string | null;
  lessons?: Array<{ estimated_minutes?: number | null }>;
};

type Props = {
  unit: Unit | null;
  visible: boolean;
  onClose: () => void;
  onStart: () => void;
};

export function UnitIntroModal({ unit, visible, onClose, onStart }: Props) {
  if (!unit) return null;

  const lang = getCurrentLanguage();
  const body =
    lang === 'tr'
      ? unit.intro_md ?? unit.intro_md_en ?? ''
      : unit.intro_md_en ?? unit.intro_md ?? '';
  const title = lang === 'tr' ? unit.title_tr ?? unit.title : unit.title;
  const lessonCount = unit.lessons?.length ?? 0;
  const totalMin = (unit.lessons ?? []).reduce(
    (s, l) => s + (l.estimated_minutes ?? 5),
    0,
  );

  if (!body) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <SafeAreaView edges={['top']}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#DCE0E8',
            }}
          >
            <View style={{ flex: 1 }}>
              <ASEyebrow>UNIT {String(unit.number).padStart(2, '0')}</ASEyebrow>
              <Text
                numberOfLines={2}
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#0E1116',
                  marginTop: 2,
                  letterSpacing: -0.44,
                }}
              >
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={{ fontSize: 22, color: '#5A6478' }}>✕</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 16,
              marginBottom: 16,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: '#EEEFF3',
            }}
          >
            <Stat label="Ders" value={`${lessonCount}`} />
            <Stat label="Süre" value={`~${totalMin} dk`} />
          </View>

          <SimpleMarkdown source={body} />
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
          <View style={{ flexDirection: 'row', gap: 10, padding: 16 }}>
            <View style={{ flex: 1 }}>
              <Button3D variant="ghost" fullWidth onPress={onClose}>
                Atla
              </Button3D>
            </View>
            <View style={{ flex: 2 }}>
              <Button3D variant="primary" fullWidth onPress={onStart}>
                Başla →
              </Button3D>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontFamily: FONTS.mono,
          fontSize: 10,
          color: '#5A6478',
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 18,
          fontWeight: '700',
          color: '#0E1116',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * Settings → Help & contact ops — yardım merkezi.
 */
import { ScrollView, View, Text, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Eyebrow,
  Mono,
  Body,
  FONTS,
  Button3D,
  SettingsRow,
  BackButton,
} from '@/components/airspeak';

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: 'ICAO Level 4 mock sınav gerçek sertifika veriyor mu?',
    a: 'Hayır. AirSpeak pratik aracıdır, resmi ICAO sertifikası vermez. Resmi sınav SHGM yetkili merkezlerinde yapılır. Bizim app gerçek sınava hazırlık + 6 descriptor üzerinden self-assessment sunar.',
  },
  {
    q: 'Mikrofon kayıtlarım sunucuya gönderiliyor mu?',
    a: 'Hayır. Tüm konuşma tanıma cihazda iOS Speech / Android SpeechRecognizer ile işlenir. Sesin internet üzerinden hiç çıkmaz, kayıt saklanmaz.',
  },
  {
    q: 'Aboneliği nasıl iptal ederim?',
    a: 'iOS: Ayarlar > Apple ID > Abonelikler > AirSpeak > İptal et. Android: Play Store > Profil > Ödemeler ve abonelikler > AirSpeak > İptal. İstediğin zaman iptal edebilirsin, dönem sonuna kadar kullanırsın.',
  },
  {
    q: 'Streak nasıl korunur, kaç gün freeze hakkım var?',
    a: 'Her gün 1 ders + 1 SRS review yapmak streak\'i tutar. Pro Pilot abonelerine ay 3 streak freeze ücretsiz, otomatik kullanılır. Mağazadan da satın alınabilir.',
  },
  {
    q: 'Pronunciation skorum neden bazen düşük?',
    a: 'STT motor cihazda çalışır, gürültülü ortamda düşebilir. Mikrofona yakın, sessiz odada, net konuş. Süre çok kısa veya uzun olursa timing penalty verir.',
  },
  {
    q: 'AI Co-pilot gerçek AI mi?',
    a: 'AirSpeak AI Co-pilot scripted dialog tree kullanır — 50+ önceden yazılmış senaryo + key phrase pattern matching. ChatGPT / Claude gibi cloud AI değil. Bu sayede sıfır API maliyeti, sınırsız kullanım, gizlilik garantisi.',
  },
  {
    q: '20 dilde tam çeviri var mı?',
    a: 'Evet. EN/TR ana dil tam manuel çeviri. 13 dil DeepL Free ile çevrildi (DE/FR/ES/IT/PT/NL/PL/EL/ZH/JA/KO/ID/RU/AR). 4 dil Argos ile (FA/HI/TH/MS). ICAO frazeolojisi (Mayday, Squawk) tüm dillerde standart İngilizce kalır — uluslararası havacılık standardı.',
  },
  {
    q: 'Hesabımı silersem verilerim ne olur?',
    a: 'Settings > Privacy & Data > "Hesabı kalıcı sil" tıkla. 30 gün içinde tüm veri kalıcı silinir (KVKK + GDPR uyumlu). Süreyi geri alabilirsin: 30 gün içinde tekrar giriş yaparsan iptal olur.',
  },
];

export default function HelpScreen() {
  const { t } = useTranslation();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <BackButton onPress={() => router.back()} label={t('common.back', 'Geri')} />
          <Text
            accessibilityRole="header"
            style={{ flex: 1, fontFamily: FONTS.body800, fontSize: 22, color: '#0E1116' }}
          >
            {t('settings.help.title', 'Yardım & İletişim')}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Contact options */}
        <Eyebrow>{t('settings.help.contact', 'İLETİŞİM')}</Eyebrow>
        <View style={{ marginTop: 8, marginBottom: 16, paddingHorizontal: 4 }}>
          <SettingsRow
            icon="📧"
            label={t('settings.help.email', 'Email destek')}
            value="ops@airspeak.io"
            onPress={() => Linking.openURL('mailto:ops@airspeak.io')}
          />
          <SettingsRow
            icon="💬"
            label={t('settings.help.discord', 'Discord topluluk')}
            value="discord.gg/airspeak"
            onPress={() => Linking.openURL('https://discord.gg/airspeak')}
          />
          <SettingsRow
            icon="📷"
            label={t('settings.help.instagram', 'Instagram')}
            value="@airspeak_app"
            onPress={() => Linking.openURL('https://instagram.com/airspeak_app')}
            last
          />
        </View>

        {/* FAQ */}
        <Eyebrow>{t('settings.help.faq', 'SIK SORULAN SORULAR')}</Eyebrow>
        <View style={{ gap: 8, marginTop: 8 }}>
          {FAQS.map((item, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.85}
              onPress={() => setExpandedIdx(expandedIdx === i ? null : i)}
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#DCE0E8',
                borderRadius: 14,
                padding: 14,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: FONTS.body700,
                    fontSize: 14,
                    color: '#0E1116',
                    lineHeight: 19,
                  }}
                >
                  {item.q}
                </Text>
                <Text style={{ fontSize: 16, color: '#8A93A6' }}>
                  {expandedIdx === i ? '−' : '+'}
                </Text>
              </View>
              {expandedIdx === i && (
                <Body
                  color="#5A6478"
                  style={{ fontSize: 13, marginTop: 8, lineHeight: 19 }}
                >
                  {item.a}
                </Body>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 24, marginBottom: 16 }}>
          <Button3D
            variant="primary"
            fullWidth
            onPress={() => Linking.openURL('mailto:ops@airspeak.io?subject=AirSpeak%20Destek%20Talebi')}
          >
            {t('settings.help.contactSupport', '📧 Destek ekibine yaz')}
          </Button3D>
        </View>
      </ScrollView>
    </View>
  );
}


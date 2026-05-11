/**
 * Gizlilik Politikası (PT) — Sprint 8.A
 * Şablon metin. Resmi yayın öncesi hukuki redaksiyon önerilir.
 */
import { Body } from '@/components/airspeak';
import { LegalLayout, Section, P, Bullet } from '@/components/legal/LegalLayout';

function Bold({ children }: { children: React.ReactNode }) {
  return <Body style={{ fontWeight: '700', color: '#0E1116' }}>{children}</Body>;
}

export default function PrivacyPolicyScreen() {
  return (
    <LegalLayout
      title="Gizlilik Politikası"
      lastUpdated="2026-05-01"
      intro="AirSpeak olarak gizliliğine önem veriyoruz. Bu politika hangi verileri topladığımızı, neden topladığımızı, nasıl kullandığımızı ve haklarını açıklar."
    >
      <Section title="1. Veri Sorumlusu">
        <P>
          AirSpeak ("Uygulama", "biz") tarafından işletilen mobil uygulamadır. Veri sorumlusu olarak iletişim
          adresimiz <Bold>privacy@airspeak.app</Bold>. KVKK temsilcisi: <Bold>kvkk@airspeak.app</Bold>.
        </P>
      </Section>

      <Section title="2. Topladığımız Veriler">
        <P>Aşağıdaki kategorilerde kişisel veri işliyoruz:</P>
        <Bullet>
          <Bold>Hesap verileri:</Bold> ad, e-posta, şifre (hashlenmiş), kullanıcı adı, profil fotoğrafı,
          rol (pilot/kabin/teknisyen/yer hizmetleri/öğrenci), İngilizce seviyesi, doğum tarihi (opsiyonel).
        </Bullet>
        <Bullet>
          <Bold>İlerleme verileri:</Bold> tamamlanan dersler, XP, streak, lig sıralaması, başarı rozetleri,
          ICAO sözlü değerlendirme sonuçları.
        </Bullet>
        <Bullet>
          <Bold>Ses kayıtları:</Bold> ICAO sözlü egzersizleri sırasında 90 saniyeye kadar audio. Cihazda native
          STT ile yazıya çevrilir, sunucuda 30 gün saklanır, sonra otomatik silinir.
        </Bullet>
        <Bullet>
          <Bold>Cihaz verileri:</Bold> push notification token (Expo), uygulama versiyonu, işletim sistemi,
          dil tercihi, saat dilimi.
        </Bullet>
        <Bullet>
          <Bold>Kullanım verileri:</Bold> ekran ziyaretleri, butona tıklama, hata raporları (Sentry).
        </Bullet>
      </Section>

      <Section title="3. Veri İşleme Amaçları">
        <Bullet>Kullanıcı hesabını oluşturmak ve yönetmek (KVKK md.5/2-c).</Bullet>
        <Bullet>Eğitim hizmetini sunmak ve ilerlemeni takip etmek (KVKK md.5/2-c).</Bullet>
        <Bullet>İçerik kişiselleştirmesi ve ICAO sözlü değerlendirmesi (KVKK md.5/2-c).</Bullet>
        <Bullet>Bildirim göndermek (açık rıza varsa pazarlama için).</Bullet>
        <Bullet>Hizmeti iyileştirmek ve hata analizi (meşru menfaat — md.5/2-f).</Bullet>
        <Bullet>Yasal yükümlülüklere uymak (KVKK md.5/2-ç).</Bullet>
      </Section>

      <Section title="4. Üçüncü Taraflara Aktarım">
        <P>Verilerini hizmet sağlayıcılarımız üzerinden işleriz:</P>
        <Bullet>
          <Bold>Supabase Inc. (AB / Frankfurt):</Bold> veritabanı, kimlik doğrulama, dosya depolama. KVKK
          uyumlu standart sözleşme klozları altında.
        </Bullet>
        <Bullet>
          <Bold>Anthropic (ABD):</Bold> ICAO sözlü değerlendirmesi (Claude API). Ses kaydı değil, sadece
          yazıya dökülmüş transcript gönderilir.
        </Bullet>
        <Bullet>
          <Bold>OpenAI (ABD):</Bold> Whisper STT fallback (cihaz STT çalışmazsa). Ses kaydı geçici
          gönderilir, OpenAI saklamaz.
        </Bullet>
        <Bullet>
          <Bold>Expo (ABD):</Bold> push notification servisi.
        </Bullet>
        <Bullet>
          <Bold>Sentry (ABD):</Bold> hata raporları (kişisel veri içermez).
        </Bullet>
        <Bullet>
          <Bold>PostHog (AB):</Bold> kullanım analizi (anonim).
        </Bullet>
        <Bullet>
          <Bold>Apple / Google:</Bold> abonelik faturalandırma (uygulama içi satın alım).
        </Bullet>
      </Section>

      <Section title="5. Saklama Süreleri">
        <Bullet>Aktif hesap verileri: hesap silinene kadar.</Bullet>
        <Bullet>Hesap silme talebi sonrası: 30 gün grace period, sonrasında kalıcı silinir.</Bullet>
        <Bullet>Ses kayıtları: 30 gün, sonra otomatik silinir.</Bullet>
        <Bullet>Faturalandırma kayıtları: 10 yıl (Vergi Usul Kanunu md.253).</Bullet>
        <Bullet>Hata raporları: 90 gün.</Bullet>
      </Section>

      <Section title="6. Güvenlik">
        <P>
          Verileriniz HTTPS üzerinden iletilir, Supabase'de AES-256 ile şifrelenir. Şifreler bcrypt ile
          hashlenir. Mikrofon kayıtları cihaz dışına yalnız sınav gönderiminde çıkar; yazıya dökme cihazda
          yapılır. Production ortamında Row Level Security (RLS) ve role-based access control (RBAC) aktiftir.
        </P>
      </Section>

      <Section title="7. Haklarınız (KVKK md.11 + GDPR md.15-22)">
        <Bullet>İşlenen verilerinizi öğrenme, kopyasını alma (Settings → Gizlilik → Verilerimi indir).</Bullet>
        <Bullet>Düzeltme isteme (Profil ekranı).</Bullet>
        <Bullet>Silinme veya yok edilme (Settings → Gizlilik → Hesabı kalıcı sil).</Bullet>
        <Bullet>İşlemeye itiraz, kısıtlama isteme.</Bullet>
        <Bullet>Aktarımı durdurma talebi.</Bullet>
        <Bullet>
          Bu hakları kullanmak için <Bold>privacy@airspeak.app</Bold>'a yazabilirsin. 30 gün içinde yanıtlarız.
        </Bullet>
      </Section>

      <Section title="8. Çocukların Gizliliği">
        <P>
          AirSpeak 13 yaşından küçükler için tasarlanmamıştır. 13-18 yaş aralığındaki kullanıcıların ebeveyn
          onayı alması önerilir. 13 yaş altı bir hesap fark edersek hemen sileriz.
        </P>
      </Section>

      <Section title="9. Değişiklikler">
        <P>
          Bu politikayı güncellersek "Son güncelleme" tarihini değiştirir, önemli değişiklikleri push
          bildirim ile bildiririz. Devam eden kullanım, güncel politikanın kabulü anlamına gelir.
        </P>
      </Section>

      <Section title="10. İletişim">
        <Bullet>Genel: <Bold>privacy@airspeak.app</Bold></Bullet>
        <Bullet>KVKK temsilcisi: <Bold>kvkk@airspeak.app</Bold></Bullet>
        <Bullet>
          Şikayet: Kişisel Verileri Koruma Kurulu — <Bold>kvkk.gov.tr</Bold>
        </Bullet>
      </Section>
    </LegalLayout>
  );
}


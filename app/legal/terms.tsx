/**
 * Kullanım Koşulları (ToS) — Sprint 8.A
 * Şablon metin. Hukuki redaksiyon önerilir.
 */
import { Body } from '@/components/airspeak';
import { LegalLayout, Section, P, Bullet } from '@/components/legal/LegalLayout';

function Bold({ children }: { children: React.ReactNode }) {
  return <Body style={{ fontWeight: '700', color: '#0E1116' }}>{children}</Body>;
}

export default function TermsScreen() {
  return (
    <LegalLayout
      title="Kullanım Koşulları"
      lastUpdated="2026-05-01"
      intro="AirSpeak'i kullanarak aşağıdaki koşulları kabul etmiş olursun. Lütfen dikkatlice oku."
    >
      <Section title="1. Hizmet Tanımı">
        <P>
          AirSpeak, havacılık İngilizcesi (Aviation English) eğitim platformudur. Pilot, kabin ekibi,
          teknisyen, yer hizmetleri personeli ve havacılık öğrencileri için tasarlanmıştır. ICAO Level 4
          sınavına hazırlık, telaffuz pratiği, AI destekli konuşma egzersizleri sunar.
        </P>
        <P>
          <Bold>AirSpeak resmi ICAO sertifikası vermez.</Bold> Resmi sınav SHGM (Sivil Havacılık Genel
          Müdürlüğü) yetkili merkezlerinde yapılır.
        </P>
      </Section>

      <Section title="2. Hesap">
        <Bullet>Kayıt için 13+ yaş olmalısın. 13-18 yaş arası ebeveyn onayı önerilir.</Bullet>
        <Bullet>Hesap bilgilerin doğru olmalı. Sahte hesap engellenebilir.</Bullet>
        <Bullet>Şifren senin sorumluluğunda. Paylaşma. Ele geçirildiğinden şüphelenirsen değiştir.</Bullet>
        <Bullet>Bir kişi yalnız bir aktif hesaba sahip olabilir.</Bullet>
      </Section>

      <Section title="3. Kabul Edilebilir Kullanım">
        <P>Aşağıdakiler yasaktır:</P>
        <Bullet>Hizmeti tersine mühendislik, scraping, otomatik bot ile kullanma.</Bullet>
        <Bullet>Komünite alanında nefret söylemi, spam, taciz, illegal içerik paylaşma.</Bullet>
        <Bullet>Başka kullanıcının kişisel verilerini izinsiz toplama.</Bullet>
        <Bullet>Telif hakkı ihlali — başka kaynaktan kopya içerik paylaşma.</Bullet>
        <Bullet>Sahte ICAO sınav sertifikası iddia etme.</Bullet>
        <Bullet>İhlal durumunda hesabın askıya alınabilir veya kalıcı kapatılabilir.</Bullet>
      </Section>

      <Section title="4. Abonelik (Pro Pilot)">
        <Bullet>
          Pro Pilot aboneliği aylık veya yıllık olarak Apple App Store / Google Play üzerinden satın alınır.
        </Bullet>
        <Bullet>
          Ödeme, satın alma onaylandığında Apple/Google hesabından çekilir. Faturalandırma onlar tarafından
          yapılır.
        </Bullet>
        <Bullet>
          <Bold>Otomatik yenileme:</Bold> Dönem bitiminden 24 saat öncesine kadar iptal edilmezse abonelik
          aynı süre için otomatik yenilenir.
        </Bullet>
        <Bullet>
          İptal: iOS &gt; Ayarlar &gt; Apple ID &gt; Abonelikler / Android Play Store &gt; Profil &gt;
          Ödemeler ve abonelikler. İptal sonrası dönem sonuna kadar Pro özelliklerini kullanırsın.
        </Bullet>
        <Bullet>
          Türkiye Tüketici Kanunu md.48 kapsamında, dijital içerik tüketildiğinde 14 günlük cayma hakkı
          uygulanmaz. Kullanıcı abonelik aktivasyonu ile içeriği tüketmiş sayılır.
        </Bullet>
        <Bullet>
          Trial / Deneme süresi: yeni kullanıcılara 7 gün ücretsiz Pro denemesi sunulur. Trial sonunda
          iptal etmezsen abonelik başlar.
        </Bullet>
      </Section>

      <Section title="5. İçerik & Telif">
        <P>
          AirSpeak ders içeriği, ses kayıtları, ICAO frazeolojisi tasarımı, marka ve logo bizim mülkiyetimizdedir
          (ICAO standart frazeoloji ICAO mülkiyetidir). Kişisel kullanım dışında kopyalama, dağıtma, satma yasaktır.
        </P>
        <P>
          Komünite alanında paylaştığın içerikler senin telif hakkındadır. Ancak AirSpeak'e platformda
          gösterme, dağıtma, moderasyon yapma için ücretsiz ve dünya çapında lisans verirsin.
        </P>
      </Section>

      <Section title="6. Sorumluluk Reddi">
        <P>
          Hizmet "olduğu gibi" sunulur. Kesintisiz, hatasız çalışacağı garanti edilmez. AirSpeak içeriğinin
          ICAO seviye 4 sınavına yeterli hazırlık olduğunu garanti etmez — gerçek sınav performansı
          kullanıcının çalışmasına bağlıdır.
        </P>
        <P>
          AirSpeak, sınav sonucunun, mesleki kararların veya iş başvurularının sonuçlarından sorumlu değildir.
        </P>
      </Section>

      <Section title="7. Hesap Sonlandırma">
        <P>
          Hesabını istediğin zaman silebilirsin (Settings &gt; Gizlilik &gt; Hesabı kalıcı sil — 30 gün
          grace period). Biz, kuralların ihlali durumunda hesabını askıya alabilir veya silebiliriz.
        </P>
      </Section>

      <Section title="8. Değişiklikler">
        <P>
          Bu koşulları zaman zaman güncelleriz. Önemli değişiklikleri uygulama içi bildirim veya e-posta ile
          duyururuz. Devam eden kullanım, güncel koşulların kabulüdür.
        </P>
      </Section>

      <Section title="9. Uygulanacak Hukuk">
        <P>
          Bu sözleşme Türkiye Cumhuriyeti yasalarına tabidir. Anlaşmazlıklar İstanbul mahkemelerinde çözülür.
          Tüketici uyuşmazlıkları için ilgili Tüketici Hakem Heyeti / Tüketici Mahkemesi yetkilidir.
        </P>
      </Section>

      <Section title="10. İletişim">
        <Bullet>Genel: <Bold>support@airspeak.io</Bold></Bullet>
        <Bullet>Hukuki: <Bold>legal@airspeak.io</Bold></Bullet>
      </Section>
    </LegalLayout>
  );
}

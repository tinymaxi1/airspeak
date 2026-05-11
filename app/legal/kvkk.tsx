/**
 * KVKK Aydınlatma Metni — Sprint 8.A
 * 6698 Sayılı Kişisel Verilerin Korunması Kanunu md.10 kapsamında.
 */
import { Body } from '@/components/airspeak';
import { LegalLayout, Section, P, Bullet } from '@/components/legal/LegalLayout';

function Bold({ children }: { children: React.ReactNode }) {
  return <Body style={{ fontWeight: '700', color: '#0E1116' }}>{children}</Body>;
}

export default function KVKKScreen() {
  return (
    <LegalLayout
      title="KVKK Aydınlatma Metni"
      lastUpdated="2026-05-01"
      intro="6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) md.10 kapsamında, kişisel verilerinin işlenmesine ilişkin aydınlatma metnimizdir."
    >
      <Section title="1. Veri Sorumlusu">
        <Bullet>Veri sorumlusu: <Bold>AirSpeak</Bold></Bullet>
        <Bullet>İletişim: <Bold>privacy@airspeak.app</Bold></Bullet>
        <Bullet>KVKK temsilcisi: <Bold>kvkk@airspeak.app</Bold></Bullet>
      </Section>

      <Section title="2. İşlenen Kişisel Veri Kategorileri">
        <Bullet>
          <Bold>Kimlik:</Bold> Ad, soyad, kullanıcı adı, doğum tarihi (opsiyonel).
        </Bullet>
        <Bullet>
          <Bold>İletişim:</Bold> E-posta adresi.
        </Bullet>
        <Bullet>
          <Bold>Müşteri işlem:</Bold> Hesap kayıt tarihi, abonelik durumu, ödeme geçmişi (Apple/Google
          tarafından tutulur).
        </Bullet>
        <Bullet>
          <Bold>Mesleki bilgi:</Bold> Rol (pilot, kabin, teknisyen, yer hizmetleri, öğrenci), İngilizce
          seviyesi (A1-C2), havayolu bilgisi, callsign, baz havalimanı (opsiyonel).
        </Bullet>
        <Bullet>
          <Bold>Görsel ve işitsel:</Bold> Profil fotoğrafı (opsiyonel), ICAO sözlü sınav ses kayıtları
          (max 90sn, 30 gün saklanır).
        </Bullet>
        <Bullet>
          <Bold>İşlem güvenliği:</Bold> IP adresi (geçici), cihaz kimliği, push token, oturum bilgisi.
        </Bullet>
        <Bullet>
          <Bold>Eğitim ilerleme:</Bold> Tamamlanan dersler, XP, streak, lig sıralaması, başarı rozetleri,
          ICAO sözlü değerlendirme sonuçları.
        </Bullet>
      </Section>

      <Section title="3. İşleme Amaçları (KVKK md.5)">
        <Bullet>Sözleşmenin kurulması ve ifası — eğitim hizmeti sağlamak (md.5/2-c).</Bullet>
        <Bullet>Hesap güvenliği, kimlik doğrulama (md.5/2-c, md.5/2-f).</Bullet>
        <Bullet>İlerleme takibi, kişiselleştirilmiş içerik sunma (md.5/2-c).</Bullet>
        <Bullet>ICAO sözlü değerlendirmesi yapmak (açık rıza — md.5/1).</Bullet>
        <Bullet>Hizmet iyileştirme, hata analizi (meşru menfaat — md.5/2-f).</Bullet>
        <Bullet>Yasal yükümlülükler (vergi, ticaret kanunu — md.5/2-ç).</Bullet>
        <Bullet>Pazarlama iletişimi (yalnızca açık rıza varsa — md.5/1, ETK md.6).</Bullet>
      </Section>

      <Section title="4. Aktarım (KVKK md.8-9)">
        <P>Verileriniz aşağıdaki üçüncü taraflarla paylaşılır:</P>
        <Bullet>
          <Bold>Supabase (AB):</Bold> veri tabanı, kimlik doğrulama, dosya depolama. KVKK md.9 standart
          sözleşme klozları altında.
        </Bullet>
        <Bullet>
          <Bold>Anthropic Inc. (ABD):</Bold> ICAO sözlü transcript değerlendirmesi (Claude AI).
        </Bullet>
        <Bullet>
          <Bold>OpenAI (ABD):</Bold> Whisper STT — yalnız cihaz STT çalışmazsa, geçici aktarım.
        </Bullet>
        <Bullet>
          <Bold>Expo / Google / Apple:</Bold> push notification, abonelik faturalandırma.
        </Bullet>
        <Bullet>
          <Bold>Sentry, PostHog (ABD/AB):</Bold> hata raporları, anonim kullanım analizi.
        </Bullet>
        <Bullet>
          Yurt dışı aktarımlar KVKK md.9'a uygun (açık rıza veya AB/standart sözleşme klozları).
        </Bullet>
      </Section>

      <Section title="5. Toplama Yöntemi ve Hukuki Sebep">
        <P>
          Veriler doğrudan kullanıcıdan elektronik ortamda (uygulama içi formlar, ses kaydı, kullanım
          aktivitesi) toplanır. Hukuki sebepler: KVKK md.5/2-c (sözleşme), md.5/2-f (meşru menfaat),
          md.5/1 (açık rıza — pazarlama ve ses kaydı için).
        </P>
      </Section>

      <Section title="6. Saklama Süreleri">
        <Bullet>Aktif hesap verileri: hesap silinene kadar.</Bullet>
        <Bullet>Hesap silme talebi: 30 gün grace period sonrası kalıcı silinir.</Bullet>
        <Bullet>Ses kayıtları: 30 gün, sonra otomatik silinir.</Bullet>
        <Bullet>Audit/log kayıtları: 1 yıl.</Bullet>
        <Bullet>Faturalandırma: 10 yıl (Vergi Usul Kanunu md.253). Apple/Google tarafında saklanır.</Bullet>
      </Section>

      <Section title="7. Haklarınız (KVKK md.11)">
        <P>Aşağıdaki haklara sahipsiniz:</P>
        <Bullet>Kişisel verilerinizin işlenip işlenmediğini öğrenme.</Bullet>
        <Bullet>İşlenmişse buna ilişkin bilgi talep etme.</Bullet>
        <Bullet>İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme.</Bullet>
        <Bullet>Yurt içinde / yurt dışında aktarıldığı üçüncü kişileri bilme.</Bullet>
        <Bullet>Eksik / yanlış işlenmişse düzeltilmesini isteme.</Bullet>
        <Bullet>Kanunen gerekenler dışında silinmesini / yok edilmesini isteme.</Bullet>
        <Bullet>Düzeltme / silme işleminin aktarılan üçüncü kişilere bildirilmesini isteme.</Bullet>
        <Bullet>Otomatik analiz sonucu aleyhinize bir sonuç çıkmasına itiraz etme.</Bullet>
        <Bullet>Kanuna aykırı işleme sebebiyle zarara uğramışsanız tazminat isteme.</Bullet>
        <P>
          Bu haklarınızı kullanmak için <Bold>kvkk@airspeak.app</Bold> adresine yazılı başvuru yapabilirsiniz.
          KVKK md.13 kapsamında talebinize 30 gün içinde yanıt verilir.
        </P>
        <P>
          Başvurunuzdan tatmin olmazsanız Kişisel Verileri Koruma Kurulu'na şikayette bulunabilirsiniz:{' '}
          <Bold>kvkk.gov.tr</Bold>
        </P>
      </Section>

      <Section title="8. Açık Rıza Gerektiren İşlemler">
        <Bullet>Ses kaydı işleme (ICAO sözlü değerlendirmesi)</Bullet>
        <Bullet>Pazarlama amaçlı e-posta / push iletişimi (İYS uyumlu)</Bullet>
        <Bullet>Üçüncü taraf AI servisi (Anthropic, OpenAI) üzerinden değerlendirme</Bullet>
        <P>
          Bu işlemler için kayıt sırasında ayrı onay alınır. Onayını her zaman geri çekebilirsin (Settings).
        </P>
      </Section>

      <Section title="9. İletişim">
        <Bullet>KVKK temsilcisi: <Bold>kvkk@airspeak.app</Bold></Bullet>
        <Bullet>Posta: AirSpeak KVKK Birimi (firma adresi yayın aşamasında eklenecek)</Bullet>
      </Section>
    </LegalLayout>
  );
}

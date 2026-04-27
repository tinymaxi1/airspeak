/**
 * Havayolu Bilgi Tabanı — her havayolu için yapısal intel.
 *
 * Mülakat öncesi MUTLAKA bilinmesi gerekenler:
 * - Şirket fact'leri (CEO, kuruluş, son gelişme)
 * - Filo + network spesifik
 * - Per-role özel hazırlık
 * - "Shibboleth" sorular (havayolu özel jargon/kültür)
 * - Common mistakes
 * - Insider tipsleri (gerçek interview deneyimleri)
 *
 * Tüm bilgiler 2024-2025 verilerine göre. Sektör hızla değişir — her 6 ayda
 * güncellenmesi gereken alanlar: CEO, fleet, hiring status.
 */
import type { UserRole } from '@/types/profile';

export interface AirlineFact {
  label: string;
  value: string;
  source?: string;
}

export interface RoleSpecificKnowledge {
  role: UserRole;
  /** Bu rol için bilinmesi şart konular */
  mustKnow: string[];
  /** Bu rolde sıkça yapılan hatalar */
  commonMistakes: string[];
  /** Bu rol için spesifik hazırlık ipuçları */
  preparationTips: string[];
  /** "Shibboleth" — havayolunun kendine has terimleri / kültürü */
  shibboleths: string[];
  /** Mülakat günü dress + attitude */
  dressCode: string;
  /** Saat öncesi yapılacaklar */
  dayBeforeChecklist: string[];
  /** Mülakat sonrası izlemler */
  postInterviewActions: string[];
}

export interface AirlineKnowledgeBase {
  airlineId: string;
  /** 5-7 must-know fact (CEO, kuruluş yılı, son haber vs) */
  keyFacts: AirlineFact[];
  /** Şirket DNA — kültür, değerler, niçin farklı */
  companyDNA: string;
  /** Son 12 ayda önemli haberler */
  recentNews: string[];
  /** Filo detayı (jenerikten daha derin) */
  fleetDetail: string;
  /** Network strategy + hub neden bu */
  networkStrategy: string;
  /** Rakip analizi — neden bu havayolu */
  competitivePosition: string;
  /** Per role granular bilgi */
  roleSpecific: RoleSpecificKnowledge[];
  /** Verified pratik tavsiye */
  verifiedTips: string[];
  /** Bilgi kaynaklı (kullanıcı için referans) */
  sources: string[];
  /** Son güncelleme */
  lastUpdated: string;
}

export const AIRLINE_KNOWLEDGE: AirlineKnowledgeBase[] = [
  // ═══════════ EMIRATES ═══════════
  {
    airlineId: 'emirates',
    keyFacts: [
      { label: 'Kuruluş', value: '1985 (Dubai hükümeti tarafından)' },
      { label: 'CEO', value: 'Sheikh Ahmed bin Saeed Al Maktoum (Chairman & CE)' },
      { label: 'President', value: 'Sir Tim Clark' },
      { label: 'Filo', value: '~260 uçak — dünyanın en geniş B777 (~134) ve A380 (~119) filoları' },
      { label: 'Hub', value: 'Dubai International (DXB) Terminal 3 — özel terminal' },
      { label: 'Network', value: '150 destinasyon, 6 kıta' },
      { label: 'Çalışan sayısı', value: '~100.000 (Emirates Group)' },
      { label: 'Boy şartı', value: 'Min 160cm (topuksuz), reach 212cm topuk üzerinde' },
      { label: 'Skytrax', value: 'World\'s Best A380 Onboard Atmosphere 2024' },
    ],
    companyDNA:
      '"Fly Better" — premium servis + multi-cultural workforce (160+ ülkeden ekip). Lüks vurgu ama sıcak misafirperverlik. A380 öncülüğü = brand identity. Emirates Group içinde dnata (yer hizmetleri), Emirates Holidays, Emirates SkyCargo entegrasyonu.',
    recentNews: [
      '2024: $5B yıllık net kâr — havacılık tarihinde rekor',
      '2024: A350-900 ilk teslim alındı (Q4 2024)',
      '2025 hedef: 65 yeni rota, premium economy genişleme',
      '2025: Cabin crew salary +20% artış (Sheikh duyurdu Mayıs 2024)',
      'Boeing 777X siparişi: 205 uçak — gelecek 10 yıl filo yenileme',
    ],
    fleetDetail:
      'Tek fleet stratejisi: B777 (uzun-orta) + A380 (yoğun rota) + yeni A350 (ikincil rotalar). Boeing 787 yok (Tim Clark bilinçli tercih). Fleet ortalama yaşı: 8.5 yıl.',
    networkStrategy:
      'DXB hub-and-spoke — "world\'s 4th biggest airport for international traffic". 6. özgürlük havayolu (avrupa-asya transit Dubai üzerinden). Avustralya, Hindistan, ABD ana pazarları.',
    competitivePosition:
      'Qatar + Etihad ile Gulf Big 3. Emirates daha "lüks + global", Qatar "premium odaklı (Skytrax #1)", Etihad "boutique". Avantajı: ölçek + DXB konumu.',
    roleSpecific: [
      {
        role: 'cabin',
        mustKnow: [
          'Open Day formatı: dünyada şehir şehir, randevu yok, sıraya gir',
          'CV "Emirates format": A4, profesyonel headshot, bordo/lacivert background',
          'Reach test 212cm — topuk üzerinde dik dururken parmak ucu reach',
          'Yüzme testi şart — DXB\'de 50m yapılır',
          'Visa stamping: tek başına ya da çiftler için Dubai oturum izni',
          'Konut: paylaşımlı flat (3 crew), şirket sağlar, ücretsiz',
          'Vergisiz maaş + per diem (uçuş başına ek)',
          'Roster esnek değil — 4-5 günlük yorucu rotasyonlar normal',
        ],
        commonMistakes: [
          'CV\'de Photoshop fotoğraf — Emirates orijinal headshot ister',
          'Open Day\'a koşulsuz katılım — randevu YOK, gece kuyruğa girmek gerekebilir',
          'Reach test\'i hafife almak — pratik yapmadan giderek elde edilen sonuç ~%30',
          'Final interview\'da "para" konuşmak',
          'Gulf bölgesi hakkında bilgisizlik (Ramazan, abaya, kültürel uyum)',
          '"Dubai\'de sıkılırsam dönerim" yansıtmak',
        ],
        preparationTips: [
          'YouTube "Emirates Cabin Crew Open Day" 5+ vlog izle',
          'Reach test home practice — duvara mark + 6 hafta günlük germe',
          '50m yüzme — sürekli olabilmek (durmadan)',
          '"Why Dubai?" sorusu için 3 spesifik sebep hazırla',
          'Emirates fleet + lounge bilgisi (özellikle DXB Concourse A — A380)',
          'Open Day günü 5 saat erken git (saat 06:00\'da kuyruk başlar)',
          'CV\'yi 50 kopya yanında getir',
        ],
        shibboleths: [
          '"Fly Better" sloganı — kullanmasan bile bil',
          '"Emirates Group" = Emirates + dnata',
          '"Senior Flight Steward/ess" = SFS (purser yerine)',
          '"Concourse A" = DXB A380 özel terminal',
          '"Ek Style" = service standardı',
          '"Ghaf tree" = Emirates logo arkası',
        ],
        dressCode:
          'Beyaz shirt + bordo etek/pant (önerilen). Saç toplu, makyaj light, oje şeffaf veya bordo. Kapalı topuklu ayakkabı 5-7cm. Aksesuar minimal.',
        dayBeforeChecklist: [
          'CV 50 kopya + portfolio',
          'Pasaport + Schengen visa kopyası (Dubai vize sonra)',
          'Headshot fotoğraf 4 adet (yedek)',
          'Reach test pratik (son germe)',
          'Open Day adresi + erken kalkış alarmı',
          'Su + atıştırmalık (8+ saatlik kuyruk olabilir)',
        ],
        postInterviewActions: [
          'Email follow-up 24 saat içinde — recruiter LinkedIn bağlantı',
          'Video interview davetinde 48 saat içinde tamamla',
          'Final interview davetinde Dubai\'ye 2 hafta öncesinden plan',
          'Medical clearance için Türkiye\'de doktor randevusu (DXB tekrar şart)',
        ],
      },
      {
        role: 'pilot',
        mustKnow: [
          'Min 4000 saat — 2000 multi-crew jet zorunlu',
          'A380 + B777 ana fleet, A350 yeni',
          'Dubai konut 4-bedroom villa (FO için 3-BR apartment)',
          'Vergisiz maaş + housing + flying allowance',
          'Roster: long-haul ağırlıkta (12+ saatlik trips)',
          'Type rating Emirates karşılar (B777 veya A380)',
        ],
        commonMistakes: [
          'Logbook eksik bilgilerle başvurma',
          'Sim check\'te memory items zayıf',
          'CRM örnek hikayesi olmadan gel',
          '"Sadece Emirates" mesajı — diğer havayoluları kötüleme',
        ],
        preparationTips: [
          'A380 sim training pratik (varsa erişim)',
          'ICAO 4 → ICAO 5 yükselt (avantaj)',
          'Tim Clark\'ın son interview\'larını izle (strategy bil)',
          'Long-haul fatigue management bilgisi',
        ],
        shibboleths: [
          '"Sky Cargo" entegrasyonu',
          '"Premium Economy" — yeni segment 2024',
          '"DXB-DWC" — ikincil hub',
        ],
        dressCode: 'Lacivert takım, beyaz gömlek, sade kravat. Ayakkabı parlatılmış.',
        dayBeforeChecklist: [
          'Logbook + lisans original',
          'Sim check için pratik (737/A320 hatırla)',
          'Medical certificate güncel',
          'CV pilotaj-format (saat dökümü detay)',
        ],
        postInterviewActions: [
          'Sim check sonrası feedback iste',
          'Medical Dubai\'de tekrar yapılır',
          'Type rating eğitimi 6 ay (Emirates Aviation College)',
        ],
      },
    ],
    verifiedTips: [
      '✅ Open Day\'a profesyonel kıyafet zorunlu — "interview attire" düzeyinde',
      '✅ İlk eleme: %80 candidate elenir (boy/reach/CV/headshot)',
      '✅ Final interview\'da "Why Emirates?" sorusu kesin gelir — spesifik 3 sebep hazır olsun',
      '✅ Medical Dubai\'de yapılır — vücut işareti/dövme açıkta görünmemeli',
      '✅ Sözleşme 3 yıl — erken çıkış cezası ~$15K',
      '⚠️ Roster control düşük — şehir/uçuş seçemezsin',
      '⚠️ Layover + jetlag yorucu — bunu mülakatta sorularla göster',
    ],
    sources: [
      'Emirates Group Careers official portal',
      'Cabin Crew Connect community feedback (2024)',
      'Pprune.org Emirates pilot threads',
      'YouTube — "Emirates Cabin Crew Vlogs" 2023-2024',
    ],
    lastUpdated: '2025-01',
  },

  // ═══════════ QATAR AIRWAYS ═══════════
  {
    airlineId: 'qatar',
    keyFacts: [
      { label: 'Kuruluş', value: '1993 (1997\'de devlet sahipliği yeniden başladı)' },
      { label: 'CEO', value: 'Badr Mohammed Al-Meer (Kasım 2023\'ten beri)' },
      { label: 'Önceki CEO', value: 'Akbar Al Baker (1997-2023, 26 yıl — efsane)' },
      { label: 'Filo', value: '~235 uçak — A350, B777, B787 ana fleet' },
      { label: 'Hub', value: 'Hamad International (DOH) — Skytrax World\'s Best Airport 2024' },
      { label: 'Network', value: '170 destinasyon' },
      { label: 'Skytrax', value: 'World\'s Best Airline 2024 (8 kez kazanan tek havayolu)' },
      { label: 'Boy şartı', value: 'Min 160cm topuksuz, reach 212cm' },
      { label: 'Üye', value: 'Oneworld alliance' },
    ],
    companyDNA:
      'Detail-obsesif premium. "Going Places Together" sloganı. Q-Suite business class = endüstri standardı. FIFA 2022 partner — global brand boost. Akbar Al Baker dönemi agresif büyüme; Al-Meer dönemi konsolidasyon + sürdürülebilirlik.',
    recentNews: [
      '2024: Skytrax 8. kez "World\'s Best" — sektörde rekor',
      '2024: Boeing 777X ilk teslim Q4',
      '2024: Privilege Club LATAM\'a genişledi',
      '2024: Karbon offset CORSIA tam uyumluluk',
      '2025: Doha hub kapasitesi +%20 genişleme',
    ],
    fleetDetail:
      'A350-900/-1000 (~58, dünyanın en büyük A350 fleet), B777 (-300ER + Cargo), B787-8/-9. Q-Suite 1-2-1 layout — endüstride en lüks business class.',
    networkStrategy:
      'DOH 6. özgürlük hub. Asya-Avrupa-Afrika-Amerika transit. Avustralya non-stop (Doha-Auckland 17h45dk = en uzun ticari uçuş).',
    competitivePosition:
      'Skytrax #1 olduğu için kabin standardı endüstri benchmark\'ı. Detay obsesyonu farkı: ICE entertainment 4000+ saat, sommelier-trained crew, lüks amenity kit.',
    roleSpecific: [
      {
        role: 'cabin',
        mustKnow: [
          'Online video interview (HireVue) ilk aşama — 6 soru asynchronous',
          'Pymetrics oyunu: psikometrik personality + cognitive',
          'Open Day + Assessment Day: full day tek günde sonuç',
          'CV "QR template" formatı şart — düzenli, fotoğraflı',
          'Reach test 212cm topuk üzerinde',
          'Yüzme testi 25m sürekli',
          'Doha konut: Qatar Airways tower (single) veya 2-BR (couple)',
          '5 yıl bonded — erken çıkış $20K cezası',
          'Kosuz yıllık 22 gün izin + flight benefits',
        ],
        commonMistakes: [
          'Video interview\'da yüksek production değer (filtre, kostüm overdone)',
          'Pymetrics oyununda "doğru cevabı bulmaya" çalışmak',
          'Open Day kıyafeti casual',
          '"Why Qatar over Emirates?" sorusu için hazırlıksız',
          'Akbar Al Baker\'ın istifa ettiğini bilmemek (2023)',
          'Q-Suite\'i bilmemek',
        ],
        preparationTips: [
          'HireVue platform pratik (free demo var)',
          'Pymetrics 12 oyun pratik — speed/accuracy denge',
          'Q-Suite YouTube tour izle (3+ video)',
          'Doha hayatı vlog izle — Ramazan kuralları, hava (45°C+ yaz)',
          'Skytrax 8 kez "Best" detayı bil',
          'Yeni CEO Al-Meer hakkında 2-3 fact bil',
        ],
        shibboleths: [
          '"Going Places Together" — slogan',
          '"Q-Suite" = business class signature',
          '"Privilege Club" = loyalty program',
          '"Hamad International" = DOH (Doha Airport, Old Airport Road değil)',
          '"5-star service standards" — Skytrax kategoriler',
        ],
        dressCode:
          'Lacivert/koyu gri etek-takım, beyaz/krem shirt. Bordo aksesuar (Qatar logo rengi). Saç toplu, makyaj profesyonel. Kapalı topuk 5-7cm.',
        dayBeforeChecklist: [
          'CV "QR format" düzenli — fotoğraf bordo background',
          'Pymetrics platform login test',
          'Hücresel Open Day kuyruk için erken kalk',
          'Q-Suite + ICE bilgi tazele',
        ],
        postInterviewActions: [
          'Final 1-on-1 sonrası 24 saat içinde follow-up email',
          'Telefonik final için sessiz ortam hazırla',
          'Doha relocation 2-3 ay arada plan (visa süreci)',
        ],
      },
      {
        role: 'pilot',
        mustKnow: [
          'Min 4000 saat captain / 1500 FO',
          'A350 ana fleet — type rating önemli',
          'Doha sim center DOH\'da',
          'Vergisiz maaş + per diem',
          'Long-haul ağırlık — 12-18h trips',
        ],
        commonMistakes: [
          'A350 type rating yok varsayma',
          'Sim check\'te SOP zayıf',
          'CRM örnek hikayesi yok',
        ],
        preparationTips: [
          'A350 systems dokümantasyon (FCOM Vol 1)',
          'EFB usage practice',
          'Manual flying skills tazele (sim çoğu autopilot ile)',
        ],
        shibboleths: [
          '"Skybird" = Qatar callsign',
          '"DOH" = Doha airport (NOT Hamad)',
          '"FANS-A" = datalink standardı',
        ],
        dressCode: 'Lacivert takım klasik, beyaz gömlek. Sade kravat.',
        dayBeforeChecklist: [
          'Logbook + ATPL original',
          'Sim hours review',
          'Medical valid kontrol',
        ],
        postInterviewActions: [
          'Sim debriefing aktif katılım',
          'Type rating Qatar karşılar (6 ay eğitim)',
        ],
      },
    ],
    verifiedTips: [
      '✅ Akbar Al Baker dönemi agresif kültür — Al-Meer dönemi yumuşadı',
      '✅ Detail obsesyonu — kabin temizliği, üniforma, dakiklik',
      '✅ Skytrax denetimi sürekli — operasyonel mükemmellik vurgu',
      '✅ Bonded contract 5 yıl — erken çıkış cezası ciddi',
      '⚠️ Akbar dönemindeki "high turnover" — Al-Meer\'le iyileşiyor',
      '⚠️ Doha sıcaklık 45°C+ Haziran-Eylül — adaptasyon zor',
    ],
    sources: [
      'Qatar Airways Careers official',
      'CEO Al-Meer interview Bloomberg 2024',
      'Skytrax Awards 2024 detail',
      'Cabin Crew Connect QR threads',
    ],
    lastUpdated: '2025-01',
  },

  // ═══════════ ETIHAD ═══════════
  {
    airlineId: 'etihad',
    keyFacts: [
      { label: 'Kuruluş', value: '2003 (Abu Dhabi hükümeti tarafından)' },
      { label: 'CEO', value: 'Antonoaldo Neves (2022\'den beri, eski TAP CEO)' },
      { label: 'Filo', value: '~90 uçak — A350, B787, A380 (kademeli emekli)' },
      { label: 'Hub', value: 'Abu Dhabi (AUH) — yeni Terminal A 2023\'te açıldı' },
      { label: 'Network', value: '70 destinasyon' },
      { label: 'Boy şartı', value: 'Min 161cm topuksuz, reach 212cm' },
      { label: 'Boutique pozisyon', value: 'Emirates/Qatar\'dan daha küçük, premium odaklı' },
      { label: 'Üye', value: 'Bağımsız (alliance üyesi değil)' },
    ],
    companyDNA:
      '"Choose Well" — premium guest journey felsefesi. 2017-2022 mali kriz sonrası restrukturizasyon — küçüldü ama lüks vurgu güçlü. Etihad Residence (en lüks suite, 2 oda + private butler).',
    recentNews: [
      '2024: A350-1000 ilk teslim — fleet modernizasyon',
      '2024: Halka arz (IPO) hazırlık 2025\'e',
      '2024: Antonoaldo Neves yönetimi sürdürülebilir kâr odaklı',
      '2025: 30 yeni rota planı',
    ],
    fleetDetail: 'A350-1000 (yeni), B787-9/-10, A380 (kademeli emekli). A330/A340 emekli. Boutique fleet stratejisi.',
    networkStrategy:
      'AUH 6. özgürlük hub ama ölçek küçük. Stratejik partnership: Air Serbia (eski stake), partnership havayolları codeshare ağı.',
    competitivePosition:
      'Emirates/Qatar\'dan küçük ama "sakin lüks" pozisyonu. Family-friendly imaj. Residence suite = endüstri lüks zirvesi.',
    roleSpecific: [
      {
        role: 'cabin',
        mustKnow: [
          'Online HireVue + Pymetrics ilk aşama',
          'Assessment Day (Abu Dhabi veya online opsiyon)',
          'CV "Etihad format" — Abu Dhabi vurgu',
          'Etihad Residence bilgisi şart (en lüks suite)',
          'Yüzme + reach test',
          'Abu Dhabi konut — Khalifa City\'de paylaşımlı flat',
          'Vergisiz maaş + housing allowance',
        ],
        commonMistakes: [
          'Emirates/Qatar ile karıştırmak',
          'Antonoaldo Neves\'in Brazilian olduğunu bilmemek',
          '"Choose Well" sloganı bilmemek',
          'Yeni Terminal A 2023 detayı bilmemek',
        ],
        preparationTips: [
          'Etihad Residence YouTube tour',
          'Abu Dhabi vs Dubai farkı (sakin, kültürel, ailevi)',
          'Antonoaldo Neves background (TAP CEO geçmişi)',
          'Air Serbia + partnership ağı',
        ],
        shibboleths: [
          '"Choose Well"',
          '"The Residence" = en lüks suite',
          '"Etihad Guest" = loyalty',
          '"Manchester City" = sponsor (futbol)',
          '"Abu Dhabi Stopover" = ücretsiz hotel paket',
        ],
        dressCode: 'Lacivert/altın aksesuar (Etihad logo). Profesyonel kıyafet.',
        dayBeforeChecklist: ['Etihad Residence + Terminal A bilgi', 'CV güncel', 'Reach pratik'],
        postInterviewActions: [
          'AC sonrası 24 saat içinde teşekkür email',
          'Medical Abu Dhabi\'de yapılır',
        ],
      },
    ],
    verifiedTips: [
      '✅ "Choose Well" felsefesi mülakatta sıkça vurgu — anlamış olmalısın',
      '✅ Abu Dhabi sakin yaşam — Dubai\'den farklı (kültürel, ailevi)',
      '✅ Yeni Terminal A 2023 — bil',
      '⚠️ 2017-2022 zorlu dönem — "yeni Etihad" dönemi (2022+)',
      '⚠️ Filo küçülmesi — agresif büyüme yok, stabil',
    ],
    sources: [
      'Etihad Careers official',
      'CEO Neves interviews (Bloomberg, FT)',
      'Cabin Crew Connect EY threads',
    ],
    lastUpdated: '2025-01',
  },

  // ═══════════ TURKISH AIRLINES ═══════════
  {
    airlineId: 'turkish_airlines',
    keyFacts: [
      { label: 'Kuruluş', value: '1933 (Devlet Hava Yolları)' },
      { label: 'Genel Müdür', value: 'Bilal Ekşi (2022\'den beri)' },
      { label: 'Yönetim Kurulu Bşk', value: 'Prof. Ahmet Bolat' },
      { label: 'Filo', value: '~440 uçak — Star Alliance\'ın en büyük filolarından' },
      { label: 'Hub', value: 'İstanbul Havalimanı (IST) — 2019\'da açıldı, dünyanın en büyük' },
      { label: 'Network', value: '350 destinasyon — dünyada en geniş' },
      { label: 'Çalışan', value: '~35.000' },
      { label: 'Üye', value: 'Star Alliance' },
      { label: 'Boy şartı', value: 'Min 160cm topuksuz, max 200cm' },
    ],
    companyDNA:
      '"Globally Yours" — Türk misafirperverliği global ölçek. Bayrak taşıyıcı sorumluluğu. Anatolian hospitality + premium lounge servisi (IST Lounge — Skytrax winner). Yer hizmetlerinden Catering\'e kadar entegre grup.',
    recentNews: [
      '2023: 90. yıl kuruluş — global brand campaign',
      '2024: Skytrax 5-star airline (sürdürülebilir)',
      '2024: 350. destinasyon — Sydney',
      '2024: A350-900 + B787-9 yeni siparişler',
      '2025: 400. destinasyon hedef',
      'Bilal Ekşi yönetimi: dijital dönüşüm + sürdürülebilir kâr',
    ],
    fleetDetail:
      'Karma fleet: B777-300ER (long-haul), A330-300, B787-9, A350-900 (yeni), B737NG/MAX (orta), A321neo. AnadoluJet alt marka 75 uçak.',
    networkStrategy:
      'IST 6. özgürlük hub — Avrupa-Asya-Afrika-Amerika transit. Sub-Sahara Afrika ağı endüstri en güçlü (50+ destination).',
    competitivePosition:
      'Lufthansa Group + Air France-KLM\'le full FSC rakibi. Avantaj: IST konumu + en geniş network. Pegasus + AnadoluJet TR LCC rakipler.',
    roleSpecific: [
      {
        role: 'cabin',
        mustKnow: [
          'Türkçe + İngilizce yeterlilik (YDS 70+ tercih)',
          '90 günlük süreç (uzun)',
          'Online → English test → grup mülakat → bireysel → medical',
          'Kabin kıyafeti: kırmızı + beyaz THY üniforma',
          'IST Lounge "World\'s Best Lounge" Skytrax 2018',
          'Star Alliance benefits (37+ üye havayolu)',
          'TK Medlink program (medical advisory)',
        ],
        commonMistakes: [
          'Pegasus/THY karıştırmak (THY = full service)',
          'Star Alliance üye havayolularını bilmemek',
          '90 günlük süreçte iletişim eksikliği',
          'Türkçe + İngilizce dengesizliği (sadece İngilizce yetmez)',
          'IST yeni havalimanı detayını bilmemek',
        ],
        preparationTips: [
          'YDS havacılık vocab pratik',
          'Star Alliance 27+ üye listesi öğren',
          'TK 90. yıl reklam izle (brand DNA)',
          'IST Havalimanı tour video izle',
          'Bilal Ekşi son interview (vizyon)',
          'Türkçe sunum pratik (mülakat çoğu Türkçe)',
        ],
        shibboleths: [
          '"Globally Yours"',
          '"Türk Hava Yolları" = THY (Turkish değil)',
          '"IST" yeni hub (Atatürk değil)',
          '"AnadoluJet" iştirak',
          '"TK Medlink"',
          '"Star Alliance Gold"',
        ],
        dressCode: 'Klasik takım — lacivert/koyu gri. Beyaz shirt. Saç toplu. Aksesuar minimal.',
        dayBeforeChecklist: [
          'YDS sertifika original',
          'TK 90. yıl + son haberler bil',
          'IST Havalimanı bilgisi tazele',
          'Türkçe sunum pratik',
        ],
        postInterviewActions: [
          'Her aşama arası 1-2 hafta — sabırlı kal',
          'Medical Anadolu Sağlık tetkikleri',
          'Eğitim 6 hafta TK Akademi',
        ],
      },
      {
        role: 'pilot',
        mustKnow: [
          'CPL+IR+MCC + ATPL teori min',
          'Min 250 saat (TR vatandaşı)',
          'YDS 70+ tercih (ICAO 4 mecbur)',
          'TK Akademi sim Anadolu Yakası',
          'Karma fleet — B737/A320/B787/A330/A350/B777',
          'TR vatandaş öncelikli',
        ],
        commonMistakes: [
          'Logbook eksik',
          'YDS sertifikası geçersiz',
          'Sim check\'te SOP zayıf',
          'CRM örnek yok',
        ],
        preparationTips: [
          'TK Akademi sim hazırlık',
          '737 type rating bonusu',
          'YDS 70+ hedefli',
          'TR havacılık tarihi (90 yıl)',
        ],
        shibboleths: [
          '"Turkish 1" callsign',
          '"AnadoluJet AJA" callsign',
          '"TK Akademi" sim center',
        ],
        dressCode: 'Lacivert takım, beyaz gömlek, kırmızı kravat (TK rengi).',
        dayBeforeChecklist: ['Logbook + lisanslar', 'Sim check pratik', 'YDS sertifika original'],
        postInterviewActions: [
          'Sim debriefing aktif',
          'Type rating TK Akademi (6 ay)',
        ],
      },
    ],
    verifiedTips: [
      '✅ 90 günlük süreç gerçek — sabırlı ol, pasif kalma (her aşama arası HR ile iletişim)',
      '✅ Türkçe ağırlıklı mülakat — İngilizce sınav YDS sertifika değil',
      '✅ TR vatandaşlık + askerlik durumu (erkek için) — kontrol ediliyor',
      '✅ IST yeni havalimanı (2019) detaylı bilgi şart',
      '⚠️ Senior crew rotasyonu daha esnek, junior\'da yorucu',
      '⚠️ Maaş Gulf carrier\'lardan düşük ama TR yaşam maliyeti uygun',
    ],
    sources: [
      'THY Kariyer portalı',
      'Bilal Ekşi 90. yıl açılış konuşması 2023',
      'Skytrax 2024 World Airline Awards',
      'Pprune.org TK threads',
    ],
    lastUpdated: '2025-01',
  },

  // ═══════════ PEGASUS ═══════════
  {
    airlineId: 'pegasus',
    keyFacts: [
      { label: 'Kuruluş', value: '1990' },
      { label: 'CEO', value: 'Güliz Öztürk (2022\'den beri)' },
      { label: 'Filo', value: '~110 uçak — A320neo + 737 karma' },
      { label: 'Hub', value: 'İstanbul Sabiha Gökçen (SAW) + Antalya' },
      { label: 'Network', value: '130 destinasyon — yurtiçi + Avrupa + Orta Doğu' },
      { label: 'Tier', value: 'Türkiye\'nin en büyük LCC' },
      { label: 'Boy şartı', value: 'Min 160cm topuksuz' },
    ],
    companyDNA:
      '"Yeni nesil havayolu" — modern, hızlı, ulaşılabilir. THY\'nin lüks pozisyonuna karşı LCC + genç. Sabiha Gökçen merkez. 2024 itibariyle %20 yıllık büyüme.',
    recentNews: [
      '2024: Güliz Öztürk Türkiye\'nin tek kadın havayolu CEO\'su',
      '2024: A321neo XLR siparişi (long-haul LCC)',
      '2024: SAW genişleme — yeni terminal',
      '2025: 150 destinasyon hedef',
    ],
    fleetDetail: 'A320neo + A321neo (modern eko), 737-800 (kademeli emekli). Single-class kabin.',
    networkStrategy: 'SAW point-to-point + Antalya yaz hub. Kısa-orta menzil odaklı. THY ile çakışan ama LCC modeli.',
    competitivePosition: 'Wizz Air + AnadoluJet TR\'de LCC rakipler. Pegasus daha brand-konumlanmış.',
    roleSpecific: [
      {
        role: 'cabin',
        mustKnow: [
          'SAW merkez — Sabiha Gökçen yaşam',
          'Hızlı turnaround LCC tempo',
          'A320 family fleet — single-type eğitim',
          'Türkçe yeterli (yurtiçi ağırlık)',
          'Genç kültür — 25-35 yaş ortalama',
          'Dış görünüm + enerjik kişilik aranır',
        ],
        commonMistakes: [
          'THY ile karıştırmak (Pegasus = LCC)',
          'Güliz Öztürk\'ün CEO olduğunu bilmemek',
          'SAW\'ın IST değil olduğunu karıştırmak',
        ],
        preparationTips: [
          'Pegasus reklam kampanyaları izle (brand vibe)',
          'LCC business model bil',
          'SAW Havalimanı bilgi (THY IST\'tan farklı)',
          'Güliz Öztürk hakkında 2-3 fact',
        ],
        shibboleths: [
          '"Yeni nesil havayolu"',
          '"PC" code (Pegasus)',
          '"SAW" = Sabiha (NOT IST)',
          '"BolBol Miles" loyalty',
        ],
        dressCode: 'Kırmızı/beyaz Pegasus rengi vurgu. Casual professional.',
        dayBeforeChecklist: ['SAW\'a ulaşım plan', 'CV güncel', 'Pegasus reklam tazele'],
        postInterviewActions: ['AC sonuç 7-10 gün', 'Eğitim 4 hafta'],
      },
    ],
    verifiedTips: [
      '✅ Süreç THY\'den hızlı (45 gün)',
      '✅ Genç + enerjik vurgu — LCC kültürü',
      '✅ Türkçe yeterli — İngilizce A2/B1 yeterli',
      '⚠️ Maaş THY\'den düşük ama eve yakın yaşam (SAW yakını)',
      '⚠️ Hızlı tempo — 4-5 turnaround/gün normal',
    ],
    sources: ['Pegasus Kariyer', 'Güliz Öztürk Forbes 2024 interview'],
    lastUpdated: '2025-01',
  },

  // ═══════════ LUFTHANSA ═══════════
  {
    airlineId: 'lufthansa',
    keyFacts: [
      { label: 'Kuruluş', value: '1955 (modern dönem) — 1926 orijinal' },
      { label: 'CEO', value: 'Carsten Spohr (2014\'ten beri)' },
      { label: 'Filo', value: '~280 uçak — Lufthansa Mainline (Group toplam ~750)' },
      { label: 'Hub', value: 'Frankfurt (FRA) + München (MUC)' },
      { label: 'Group', value: 'Lufthansa + Swiss + Austrian + Brussels + Eurowings + ITA (yeni %41)' },
      { label: 'Üye', value: 'Star Alliance kurucu üye' },
      { label: 'Boy şartı', value: 'Min 160cm topuksuz' },
    ],
    companyDNA:
      'Alman mühendisliği + premium servis. Disiplin + dakiklik vurgu. Lufthansa Group şemsiyesi: 6 havayolu + Lufthansa Cargo + Lufthansa Technik (MRO devi). Sarı-yarasa logo.',
    recentNews: [
      '2024: ITA Airways %41 satın alma — İtalya pazarı',
      '2024: A350-1000 + B787-9 yeni siparişler',
      '2024: Allegris kabin yenilemesi (premium economy + business)',
      '2025: First class yeniden lanse',
    ],
    fleetDetail: 'A350, A330, A340 (kademeli), B747-8 (uzun süre korunacak), A320 family. Lufthansa Cargo MD-11F (emekli), 777F.',
    networkStrategy: 'FRA + MUC dual-hub. Star Alliance global koordinasyon.',
    competitivePosition: 'Air France-KLM ile Avrupa lideri. Gulf carrier\'lara karşı defansif.',
    roleSpecific: [
      {
        role: 'cabin',
        mustKnow: [
          'Almanca B1+ büyük avantaj (B2+ ideal)',
          'Online video → AC Frankfurt → medical',
          'AC tam gün — grup, role-play, 1-on-1, İngilizce',
          'Lufthansa Group flight benefits (6 havayolu)',
          'Frankfurt Airport (FRA) yaşam — kira yüksek',
          'EU sosyal güvenlik + 30 gün izin',
        ],
        commonMistakes: [
          'Almancayı önemsememe',
          'Lufthansa Group yapısını bilmemek',
          'Carsten Spohr\'un CEO olduğunu bilmemek',
          'ITA satın alma 2024 bilmemek',
        ],
        preparationTips: [
          'Almanca B1 sertifika hazırla',
          'Lufthansa Group 6 havayolu öğren',
          'Allegris yeni kabin video',
          'Spohr son interview (strategy)',
        ],
        shibboleths: [
          '"Lufthansa Group"',
          '"Allegris" yeni kabin',
          '"FRA" hub (Münchner farklı)',
          '"DLR test" pilot eğitim',
          '"Senator" loyalty top tier',
        ],
        dressCode: 'Lacivert/sarı aksesuar (LH rengi). Profesyonel.',
        dayBeforeChecklist: ['Almanca tazele', 'Lufthansa Group yapı', 'Allegris bilgi'],
        postInterviewActions: ['AC sonuç 2-3 hafta', 'Eğitim 6 hafta FRA'],
      },
      {
        role: 'pilot',
        mustKnow: [
          'DLR test = 2 günlük psikometrik Hamburg\'da',
          'Çok zor — özel hazırlık şart (€500+ kurs)',
          'Almanca + İngilizce çift dil',
          'EFTC (European Flight Training Center) sponsor opsiyonu',
          'A320 + A350 + 747 fleet',
        ],
        commonMistakes: [
          'DLR\'i hafife almak',
          'Almanca yetersiz',
          'CRM örnek yok',
        ],
        preparationTips: [
          'DLR Test pratik kitabı (Heinz Maier)',
          'Numerical + spatial reasoning günlük pratik 2 ay',
          'Almanca B2+ (mülakat çoğu Almanca)',
          'Spatial visualization apps',
        ],
        shibboleths: [
          '"DLR test" = Lufthansa kapısı',
          '"Lufthansa Aviation Training" (LAT)',
          '"Lufthansa Senator" pilot rütbe',
        ],
        dressCode: 'Klasik lacivert takım, sarı kravat aksesuar.',
        dayBeforeChecklist: ['DLR pratik', 'Logbook', 'Almanca konuşma'],
        postInterviewActions: ['DLR sonuç 1 hafta', 'Type rating LAT 6-8 ay'],
      },
    ],
    verifiedTips: [
      '✅ Almanca olmadan zor — minimum B1, ideal B2+',
      '✅ DLR test pilot için özel hazırlık şart',
      '✅ Lufthansa Group benefits 6 havayolu uçuş indirimi',
      '⚠️ Frankfurt kira yüksek — net maaş Gulf\'tan düşük',
      '⚠️ EU regulations sıkı — duty time strict',
    ],
    sources: ['be-lufthansa.com', 'Carsten Spohr 2024 interviews', 'DLR test resources'],
    lastUpdated: '2025-01',
  },

  // ═══════════ BRITISH AIRWAYS ═══════════
  {
    airlineId: 'british_airways',
    keyFacts: [
      { label: 'Kuruluş', value: '1974 (BOAC + BEA birleşmesi)' },
      { label: 'CEO', value: 'Sean Doyle (2020\'den beri)' },
      { label: 'Filo', value: '~280 uçak — A320, A350, A380, B777, B787' },
      { label: 'Hub', value: 'London Heathrow Terminal 5 (LHR T5) + Gatwick' },
      { label: 'IAG Grup', value: 'BA + Iberia + Vueling + Aer Lingus + LEVEL' },
      { label: 'Üye', value: 'Oneworld kurucu üye' },
      { label: 'Boy şartı', value: 'Min 158cm topuksuz, reach 188cm' },
    ],
    companyDNA:
      '"To Fly. To Serve." Latin moto Speedbird arması altında. Heritage + premium. Brexit sonrası yeniden konumlanıyor (UK passport öncelik). Premium Concorde Room CDG/JFK\'da hala lüks zirve.',
    recentNews: [
      '2024: Club Suite (yeni business class) tüm fleet\'a yayıldı',
      '2024: A350-1000 fleet genişleme',
      '2024: Sean Doyle yönetimi LHR slot stratejisi',
      '2025: BA Speedbird Pilot Cadetship sürdürülebilir',
    ],
    fleetDetail: 'A380 (~12), B777-200ER/-300ER, B787-8/-9/-10, A350-1000, A320 family. Concorde Room (özel lounge LHR/JFK).',
    networkStrategy: 'LHR slot dominance — UK\'nin en değerli havacılık varlığı. Atlantik trafik (US-UK) JV ile (American Airlines).',
    competitivePosition: 'oneworld + IAG dominance. Virgin Atlantic UK rakip — daha karakter odaklı.',
    roleSpecific: [
      {
        role: 'cabin',
        mustKnow: [
          'UK vize problemi (post-Brexit) — Settled status veya UK passport',
          'Online + situational judgment + AC LHR',
          'British accent net — RP veya regional kabul',
          'BA Speedbird vs Virgin farkı',
          'Club Suite 2024 yeni business class',
          'LHR T5 yaşam — kuzey-batı Londra (Hounslow/Heathrow village)',
        ],
        commonMistakes: [
          'Vize statüsü olmadan başvur',
          'Virgin Atlantic ile karıştır',
          '"To Fly. To Serve." sloganı bilmemek',
          'Brexit etkisi farkındalık eksik',
        ],
        preparationTips: [
          'UK vize statüs önceden çöz',
          'Speedbird arması anlam (RAF heritage)',
          'Concorde Room + Club Suite YouTube',
          'British heritage + modern lüks denge',
          'EU citizen ise pre-settled status başvur',
        ],
        shibboleths: [
          '"To Fly. To Serve."',
          '"Speedbird" callsign + arma',
          '"Club Suite" yeni business',
          '"First" = first class',
          '"LHR T5" = ana hub',
          '"Concorde Room" = ultra-premium lounge',
        ],
        dressCode: 'Klasik UK style — lacivert/gri etek-takım. Beyaz/krem shirt.',
        dayBeforeChecklist: [
          'Vize/passport durumu çöz',
          'Speedbird heritage bilgi',
          'Club Suite tour',
          'British etiquette',
        ],
        postInterviewActions: [
          'AC sonuç 2-3 hafta',
          'Medical Bristol veya LHR\'da',
          'Eğitim 6 hafta',
        ],
      },
    ],
    verifiedTips: [
      '✅ Vize zorunlu — UK passport, settled status veya skilled worker visa',
      '✅ "To Fly. To Serve." motto vurgu — Latin Speedbird arması',
      '✅ LHR T5 = BA\'in evi, T3/T4 değil',
      '✅ IAG group benefits (BA + Iberia + Aer Lingus uçuş)',
      '⚠️ Brexit sonrası EU citizen için süreç zor',
      '⚠️ Maaş Gulf\'tan düşük ama UK yaşam koşulları',
    ],
    sources: ['careers.ba.com', 'Sean Doyle interviews FT', 'IAG Annual Report 2024'],
    lastUpdated: '2025-01',
  },

  // ═══════════ RYANAIR ═══════════
  {
    airlineId: 'ryanair',
    keyFacts: [
      { label: 'Kuruluş', value: '1984 (Tony Ryan tarafından)' },
      { label: 'CEO', value: 'Michael O\'Leary (1994\'ten beri, 30+ yıl efsane)' },
      { label: 'Filo', value: '~600 uçak — Avrupa\'nın en büyük (sadece 737)' },
      { label: 'Hub', value: 'Dublin (DUB) + 90+ baz Avrupa\'da' },
      { label: 'Network', value: '230 destinasyon — Avrupa kılcal damarı' },
      { label: 'Tier', value: 'Avrupa\'nın en büyük LCC' },
    ],
    companyDNA:
      'Ucuz bilet obsesyonu + maliyet vahşeti. Michael O\'Leary "controversial CEO" — bilinçli olarak provokatif. Tek tip 737 fleet = maliyet düşük. Sözleşmeler agresif (kabin için training maliyeti kendin öder).',
    recentNews: [
      '2024: 600. uçak teslim — flotta milestone',
      '2024: 737 MAX 8200 (yüksek yoğunluk varyant)',
      '2024: O\'Leary 2028\'e kadar CEO sözleşme uzatması',
      '2025: 250 destinasyon hedef',
    ],
    fleetDetail: '737-800 (kademeli emekli) + 737 MAX 8/8200. Tek-tip = düşük operasyon maliyeti.',
    networkStrategy: 'Point-to-point + secondary airports (ucuz slot). Avrupa\'nın küçük şehirlerine bile uçuyor.',
    competitivePosition: 'Wizz Air + easyJet ile LCC lider. Maliyet vahşeti farkı.',
    roleSpecific: [
      {
        role: 'cabin',
        mustKnow: [
          'Training kendin ödüyorsun (~€2.000) — büyük dezavantaj',
          'İlk 6 ay düşük maaş (~€1.200/ay)',
          'Recruitment Day Avrupa\'da her şehir',
          'Tek günde sonuç',
          'Hızlı tempo — 4-6 turnaround/gün',
          'Fleet seçemezsin (737 only)',
          'Baz seçimi sınırlı (ilk yıl)',
        ],
        commonMistakes: [
          'Training masrafını fark etmemek',
          'Sözleşme detaylarını okumamak',
          'O\'Leary\'nin agresif tarzına alışkın olmamak',
          '"Yumuşak" kabin servisi beklemek',
        ],
        preparationTips: [
          'Sözleşme oku — eve döndüğünde detaylı',
          'Training maliyet planla (€2K kredi/aile)',
          'O\'Leary interview izle — şirket gerçeği',
          'Hızlı tempo + multitasking örnekleri',
        ],
        shibboleths: [
          '"Always Getting Better" 2014+ kampanya',
          '"FR" code',
          '"Boeing 737-800" tek-tip',
          '"O\'Leary" referansı',
        ],
        dressCode: 'Sade lacivert — Recruitment Day\'da profesyonel ama abartısız.',
        dayBeforeChecklist: [
          'Training maliyet hazır',
          'Sözleşme önceden incele',
          'Recruitment Day adresi (Dublin/Berlin/Madrid)',
        ],
        postInterviewActions: [
          'Training Dublin\'de 6 hafta',
          'Baz preference belirt (sınırlı)',
          'İlk uçuş 8-12 hafta sonra',
        ],
      },
      {
        role: 'pilot',
        mustKnow: [
          '737 type rating zorunlu (yoksa €40K kendi öder)',
          'Min 1500 saat',
          'Avrupa\'nın en aktif pilot işe alımı',
          'Hızlı upgrade — 3-5 yılda captain',
          'Vergisiz İrlanda kontrat (yıllık ~€80K FO start)',
        ],
        commonMistakes: [
          '737 type rating yok',
          'CRM zayıf',
          'Avrupa baz tercihi yanlış',
        ],
        preparationTips: [
          'B737NG type rating ön',
          'Sim check pratik',
          'O\'Leary low-cost felsefe anla',
        ],
        shibboleths: ['"Ryanair Sun" — charter alt marka'],
        dressCode: 'Klasik takım.',
        dayBeforeChecklist: ['Logbook', 'Type rating', 'Sim hazırlık'],
        postInterviewActions: ['Type rating yoksa Dublin\'de 6 hafta', 'Line training 6 ay'],
      },
    ],
    verifiedTips: [
      '✅ Training maliyeti gerçek — gizli değil ama farkındalık az',
      '✅ İlk 6 ay zorlu — sonra normalleşir',
      '✅ Hızlı upgrade — pilot için cazip',
      '✅ Avrupa pasaport şart (UK pre-settled değil)',
      '⚠️ O\'Leary tarzı sevenler/sevmeyenler — biliniyor olmalı',
      '⚠️ Sözleşme cezaları sıkı — erken çıkış €5K+',
    ],
    sources: ['careers.ryanair.com', 'O\'Leary CNN/Bloomberg interviews', 'Pprune FR threads'],
    lastUpdated: '2025-01',
  },
];

/**
 * Bir havayolu için detaylı bilgi getir.
 */
export function getKnowledgeForAirline(airlineId: string): AirlineKnowledgeBase | undefined {
  return AIRLINE_KNOWLEDGE.find((k) => k.airlineId === airlineId);
}

/**
 * Bir rol için spesifik bilgi getir.
 */
export function getRoleKnowledge(
  airlineId: string,
  role: UserRole,
): RoleSpecificKnowledge | undefined {
  const kb = getKnowledgeForAirline(airlineId);
  return kb?.roleSpecific.find((r) => r.role === role);
}

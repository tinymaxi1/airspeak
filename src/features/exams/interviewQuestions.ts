/**
 * Mülakat Soru Bankası — havayolu rol bazlı
 *
 * 60+ soru: kategori (icebreaker, motivation, technical, behavioral, situational,
 * english, company, group, role-play, cv-based, tricky) × rol × havayolu.
 *
 * Sprint 9'da Claude ile 200+ soruya çıkarılacak.
 */
import type { InterviewQuestion } from './airlineTypes';

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // ═══════════════════════════════════════
  // GENEL CABIN — TÜM HAVAYOLLARI
  // ═══════════════════════════════════════
  {
    id: 'q_cabin_motiv_1',
    category: 'motivation',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Why do you want to be a cabin crew member?',
    difficulty: 2,
    goodAnswerPointsTr: [
      'Hizmet etmenin verdiği keyfi spesifik örnekle anlat',
      'Seyahat sevgisi ama yüzeysel değil — kültürel merak',
      'Ekip oyunu + farklı insanlarla çalışma',
      'Profesyonel gelişim hedefleri',
    ],
    redFlagsTr: [
      '"Yurt dışı gezmek istiyorum" — yüzeysel kalır',
      '"Ailem öneriyor" — kişisel motivasyon yok',
      '"Maaşı iyi" — alaycı duyulur',
      'Hazırlıksız genel cevap',
    ],
    sampleAnswerTr:
      'Üniversitedeyken Erasmus\'la 6 ülke gezdim. Her ülkede yerel halkla doğal iletişim kurmayı öğrendim. Cabin crew rolü tam olarak bunu meslek haline getiriyor: farklı kültürlerden insanlara güvenli ve konforlu yolculuk sunmak. Ayrıca acil durum protokollerinin zorluk seviyesi bende kalite-altında-baskı odaklı çalışma motivasyonunu tetikliyor.',
    modelAnswerEn:
      'I genuinely enjoy creating moments of comfort for strangers. During my hospitality internship at a 5-star hotel, I learned that small details — anticipating a tired guest\'s need, calming an anxious one — create deep impact. As a cabin crew member, I would carry that mindset into a high-stakes safety environment. Every flight is a fresh chance to make 200 people feel welcomed.',
    tipsTr: ['STAR formatı kullan', 'Spesifik anekdot anlat', 'Şirket değerlerine bağla'],
  },
  {
    id: 'q_cabin_diff_pax',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: [],
    question: 'A passenger refuses to switch off their phone during taxi. How do you handle it?',
    difficulty: 3,
    goodAnswerPointsTr: [
      'Sakin tonla yaklaş',
      'Güvenlik gerekçesini açıkla (interferans)',
      'Kibar ama net — direnç sürerse purser\'a bildir',
      'Empati + kararlılık dengesi',
    ],
    redFlagsTr: ['Tehdit veya yüksek ses', 'Yolcuyu görmezden gel', 'Alaycı ton', 'Sadece "kuraldır" diyerek bitir'],
    sampleAnswerTr:
      '"Hoşgeldiniz, yolculuğunuz güvenli olsun. Telefonu kapatmanız şart çünkü uçağın navigasyon sistemine etki edebilir. Eminim acil mesaj varsa bittiğinde bakabilirsiniz." Eğer reddederse: gülümsemeyi koru, "Anladım acil olabilir, fakat sorumluluğum güvenliğiniz. Birim amirimi çağırayım." derim.',
    modelAnswerEn:
      'I approach with a smile and say warmly: "Hi sir, I need to ask you to turn off your phone for taxi. It can interfere with our navigation systems. I appreciate your understanding." If he refuses, I stay polite, repeat the safety rationale once, and then notify the purser without escalating. The goal is compliance without conflict.',
    tipsTr: ['Tonu iyi göster (ses yumuşak)', 'Hiyerarşiyi unutma', 'Empati + kural birlikte'],
  },
  {
    id: 'q_cabin_team',
    category: 'behavioral',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Tell me about a time when you had to work with a difficult team member.',
    difficulty: 3,
    goodAnswerPointsTr: [
      'STAR formatı (Situation, Task, Action, Result)',
      'Çatışmayı kişiselleştirme — odak iş',
      'Sen aldığın aksiyon (sadece "konuştuk" değil)',
      'Pozitif sonuç + öğrendiğin ders',
    ],
    redFlagsTr: ['Diğer kişiyi kötüleme', 'Çatışmadan kaçtığın hikaye', 'Sonuç yok', 'Kendini her zaman haklı göster'],
    sampleAnswerTr:
      'Kafe işinde bir vardiyada müşteri tatminsizliği için rekabetçi bir kolega vardı. Ben (S) Cumartesi yoğun saat (T) müşteri akışını birlikte yöneteceğiz. Onunla başlayan tartışmayı görmezden gelmedim ama (A) "Şu anda 12 sipariş bekliyor — sen kasaya, ben terastaki masalara bakayım" dedim. Vardiya bitince (R) sakin bir ortamda farklılığımızı konuştuk; sonraki haftalar daha verimli çalıştık.',
    tipsTr: ['STAR\'a sadık kal', 'Sayısal sonuç ver', 'Empati + iş odağı'],
  },
  {
    id: 'q_cabin_culture',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: [],
    question: 'What do you know about our company values?',
    difficulty: 2,
    goodAnswerPointsTr: [
      'Şirket hakkında 3-5 fact (kuruluş yılı, hub, fleet, ödüller)',
      'Değerleri ezbere değil, anlamlı bağla',
      'Kişisel değerlerle örtüşme örneği',
      'Yeni gelişmeleri bil (yeni hat, yeni filo)',
    ],
    redFlagsTr: ['Genel "iyi şirket" cevap', 'Yanlış fact', 'Rakip şirketle karıştırma'],
    tipsTr: ['Mülakat öncesi LinkedIn + careers sayfa oku', 'Son 6 ay haberleri tara', 'CEO + chief cabin officer adını bil'],
  },

  // ═══════════════════════════════════════
  // GULF-CARRIER ÖZEL (Emirates/Qatar/Etihad)
  // ═══════════════════════════════════════
  {
    id: 'q_gulf_1',
    category: 'motivation',
    roles: ['cabin'],
    airlineIds: ['emirates', 'etihad', 'qatar'],
    question: 'Why do you want to relocate to Dubai/Abu Dhabi/Doha?',
    difficulty: 3,
    goodAnswerPointsTr: [
      'Şehrin pozitif yanları (multi-kültür, vergi yok, modern altyapı)',
      'Uzun dönem plan (5+ yıl)',
      'Aile durumu açıklaması (single, esnek, hazırlıklı)',
      'Sıcak iklim + Ramazan kuralları farkındalığı',
    ],
    redFlagsTr: ['Türkiye\'den kaçış olarak göster', 'Sıcak iklim hakkında şikayet', 'Aileden uzak kalmaya hazırlıksız'],
    tipsTr: ['Şehri ziyaret etmiş olmak avantaj', 'YouTube vlog izle', 'Tax-free advantage somut hesapla'],
  },
  {
    id: 'q_gulf_2',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: ['emirates', 'etihad', 'qatar'],
    question: 'A passenger from a strict cultural background asks you (a female crew) not to address her husband. How do you respond?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Kültürel saygı + servis sürekliliği',
      'Pozisyon: erkek meslektaşa devret',
      'Yargılama yok, sadece pratik çözüm',
      'Servis kalitesinden ödün vermez',
    ],
    redFlagsTr: ['Kültürel pratiğe karşı çıkma', 'Yolcuyu utandırma', '"Kuralımız böyle" deyip bitirme'],
    sampleAnswerTr:
      'Kibarca "Tabii, eşinize yardımcı olmak için meslektaşımı çağırayım" derim. Erkek crew member\'ı bilgilendirir, hanımefendinin ihtiyaçlarını ben üstlenirim. Bu hem kültürel saygı hem servis kalitesi.',
    tipsTr: ['Saygı + esneklik', 'Crew rotasyonu bil', 'Yolcu deneyimi merkez'],
  },
  {
    id: 'q_gulf_3',
    category: 'tricky',
    roles: ['cabin'],
    airlineIds: ['emirates', 'qatar'],
    question: 'If you receive a same offer from Emirates and Qatar — which would you choose and why?',
    difficulty: 5,
    goodAnswerPointsTr: [
      'Mülakata geldiğin şirketi mantıklı + dürüst seç',
      'Diğerine saygı ama "şu fark beni çekiyor"',
      'Spesifik fark vurgu (network, kabin standardı, hub)',
      'Politik olma — iki şirket de iyi',
    ],
    redFlagsTr: ['Diğerini kötüleme', 'Para odaklı cevap', 'Kararsız kalma'],
    sampleAnswerTr:
      '(Emirates mülakatı) Emirates\'in 260+ uçaklık fleet\'inde 6 kıtaya ulaşması ve A380 deneyimi benim için ayrım yaratıyor. Qatar muhteşem bir havayolu, ama Emirates Group\'un Dubai içindeki entegrasyonu (DXB + DWC + dnata + Emirates Holidays) bana çok yönlü kariyer açıyor.',
    tipsTr: ['Diplomatik dur', 'Spesifik kıyas yap', 'Long-term plan göster'],
  },

  {
    id: 'q_em_1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: ['emirates'],
    question: 'What is the "Emirates Way"?',
    difficulty: 3,
    goodAnswerPointsTr: [
      'Emirates Way = excellence, service, professionalism + cultural awareness',
      '"FlyBetter" sloganını bil',
      'Multi-cultural workforce (160+ ülke)',
      'A380 öncülüğü',
    ],
    redFlagsTr: ['Bilmiyorum', 'Genel "iyi servis"'],
    tipsTr: ['Emirates careers blog oku', 'Brand video izle', 'Sloganları ezberle'],
  },
  {
    id: 'q_qr_1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: ['qatar'],
    question: 'Qatar Airways won Skytrax World\'s Best Airline. What does this mean for our crew?',
    difficulty: 3,
    goodAnswerPointsTr: [
      '7 kez Skytrax kazanan tek havayolu',
      'Kabin crew detaylara obsesif odak',
      'Premium kabin standardı + Q-Suite business class',
      'FIFA 2022 partner',
    ],
    redFlagsTr: ['Bilmiyorum', 'Yanlış sayı'],
    tipsTr: ['Skytrax kategorileri bil', 'Q-Suite YouTube tour izle'],
  },
  {
    id: 'q_qr_2',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: ['qatar'],
    question: 'A first class passenger (member of royal family) asks for off-menu meal. Galley has limited stock. What do you do?',
    difficulty: 5,
    goodAnswerPointsTr: [
      'Hızlı problem çözme',
      'Premium yolcu önceliği',
      'Galley\'deki yaratıcı kombin',
      'Pursar\'a bildir, captain devreye gerekirse',
    ],
    redFlagsTr: ['"Yapamam" deyip kapat', 'Diğer yolcudan al'],
    tipsTr: ['Servis hiyerarşisi bil', 'Off-menu = inflight chef alternatifi', 'VIP saygısı'],
  },
  {
    id: 'q_et_1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: ['etihad'],
    question: 'What is "Etihad Guest" experience philosophy?',
    difficulty: 3,
    goodAnswerPointsTr: [
      '"Choose Well" felsefesi',
      'Guest journey segmenti — pre, in-flight, post',
      'Lüks Arap misafirperverliği + modern hizmet',
      'Residence (en lüks suite)',
    ],
    redFlagsTr: ['Bilmiyorum'],
    tipsTr: ['Etihad blog oku', 'Residence video izle'],
  },

  // ═══════════════════════════════════════
  // EUROPEAN FSC ÖZEL (LH/AF/KL/BA/IB)
  // ═══════════════════════════════════════
  {
    id: 'q_eu_fsc_1',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: ['lufthansa', 'air_france', 'klm', 'british_airways', 'iberia', 'sas', 'finnair', 'austrian'],
    question: 'During boarding, you notice a passenger with a strong alcohol smell. What do you do?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Direkt purser\'a bildir',
      'Yolcu davranışını gözlemlemeye devam et',
      'Yolculuğa zarar verecek seviyede ise kaptan kararı',
      'EU regülasyonu: aşırı sarhoş yolcu binemez',
    ],
    redFlagsTr: ['Kendi başına yolcu boarding\'i durdur', 'Önyargı (sadece koku ile karar)', 'Görmezden gel'],
    tipsTr: ['Hiyerarşi: cabin crew → purser → captain', 'EU 261 yolcu hakları farkındalık'],
  },
  {
    id: 'q_lh_1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: ['lufthansa'],
    question: 'What does the Lufthansa crane logo represent?',
    difficulty: 2,
    goodAnswerPointsTr: ['Yarasa = uçuş + zarafet', '1918\'den beri', 'Alman mühendisliği sembolü', 'Lufthansa Group ortak'],
    redFlagsTr: ['Bilmiyorum'],
    tipsTr: ['Şirket tarihi bil — 1955 Frankfurt sonrası modern dönem'],
  },
  {
    id: 'q_af_1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: ['air_france'],
    question: 'Comment décrivez-vous l\'art de vivre à la française dans le service Air France?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Lüks Fransız yaşam felsefesi servise yansıması',
      'Şarap, sanat, yemek vurgu',
      'Premium kabin "Premiere" deneyimi',
      'Fransızca ile cevap ver',
    ],
    redFlagsTr: ['İngilizce cevapla — Fransızca soruluyorsa Fransızca'],
    tipsTr: ['Fransızca pratiği şart', 'AF\'in lüks pozisyon vurgu'],
  },
  {
    id: 'q_kl_1',
    category: 'behavioral',
    roles: ['cabin'],
    airlineIds: ['klm'],
    question: 'KLM "Blue Heart" values are: Service, Reliability, Care. Give an example where you embodied "Care".',
    difficulty: 3,
    goodAnswerPointsTr: ['STAR formatı', '"Care" = anticipating, empathy, going above', 'Hollanda direktlik + sıcaklık'],
    redFlagsTr: ['Genel "iyi insanım" cevap', 'STAR yok'],
    tipsTr: ['Spesifik müşteri hikayesi', 'KLM blog "Inflight stories" oku'],
  },
  {
    id: 'q_ba_1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: ['british_airways'],
    question: 'What is BA\'s "To Fly. To Serve." motto and how does it shape cabin service?',
    difficulty: 3,
    goodAnswerPointsTr: ['Latin "Speedbird" arması alt sloganı', 'Servis = uçuşun ayrılmaz parçası', 'Heritage + modern lüks'],
    redFlagsTr: ['Sloganı bilmemek'],
    tipsTr: ['BA brand video izle', 'Heritage hangar tarihi'],
  },
  {
    id: 'q_ib_1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: ['iberia'],
    question: 'Iberia es parte de IAG. ¿Qué otras aerolíneas pertenecen al grupo?',
    difficulty: 3,
    goodAnswerPointsTr: ['IAG = Iberia + BA + Vueling + Aer Lingus + LEVEL', 'Latin Amerika network odak', 'İspanyolca cevap ver'],
    redFlagsTr: ['Bilmiyorum'],
    tipsTr: ['IAG yapı bil', 'İspanyolca pratik'],
  },
  {
    id: 'q_lx_1',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: ['swiss'],
    question: 'A Japanese passenger only speaks Japanese. You don\'t. How do you serve them?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Tablet üzerinde ön-çevrilmiş kart kullan',
      'Beden dili + gülümseme',
      'Diğer crew member arasında Japonca konuşan var mı kontrol',
      'Kart üzerinden temel servis menüsü göster',
    ],
    redFlagsTr: ['Yolcuyu görmezden gel', 'İngilizceyi yüksek sesle tekrarla'],
    tipsTr: ['Çok dilli kabin gerçeği', 'Swiss\'in Asya destinasyonları'],
  },
  {
    id: 'q_vs_1',
    category: 'tricky',
    roles: ['cabin'],
    airlineIds: ['virgin_atlantic'],
    question: 'Why Virgin Atlantic and not British Airways?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Virgin "personality" + kişiliğe yer veriyor',
      'BA daha geleneksel, Virgin daha "rockstar"',
      'Genç, eğlenceli ama profesyonel kültür',
      'Branson\'ın "people first" felsefesi',
    ],
    redFlagsTr: ['BA\'yı kötüleme', 'Sadece para'],
    tipsTr: ['Branson autobiyografi tanı', 'Virgin "Flying Experience" video izle'],
  },

  // ═══════════════════════════════════════
  // LCC ÖZEL (Ryanair / easyJet / Wizz / Pegasus / Vueling)
  // ═══════════════════════════════════════
  {
    id: 'q_lcc_1',
    category: 'motivation',
    roles: ['cabin'],
    airlineIds: ['ryanair', 'easyjet', 'wizz_air', 'pegasus', 'vueling', 'flynas', 'flydubai', 'air_arabia', 'sunexpress', 'anadolujet'],
    question: 'Why low-cost carrier and not a full-service one?',
    difficulty: 3,
    goodAnswerPointsTr: [
      'LCC tempo + verimlilik motivasyonu',
      'Çoklu durak + multitasking sevgi',
      'Kariyer hızı (LCC → upgrade çabuk)',
      'Tüketici demokratizasyonu vurgu',
    ],
    redFlagsTr: ['"FSC alamadım" gibi alttan ima', 'LCC\'yi premium\'dan aşağı göster'],
    tipsTr: ['LCC business model bil', 'Turnaround time obsesyonu', 'Genç kültür'],
  },
  {
    id: 'q_lcc_pace',
    category: 'situational',
    roles: ['cabin', 'pilot'],
    airlineIds: ['ryanair', 'easyjet', 'wizz_air', 'pegasus'],
    question: 'A LCC turnaround is typically 25 minutes. Describe how you contribute to it.',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Boarding hazırlığı önceden',
      'Kabin temizlik kontrolü hızlı',
      'Crew arası iş bölümü net',
      'Yolcu indirme + boarding paralel',
    ],
    redFlagsTr: ['"25 dk az" şikayet', 'Bilmiyorum'],
    tipsTr: ['Turnaround bilgisi şart', 'Multitasking örnek'],
  },
  {
    id: 'q_u2_1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: ['easyjet'],
    question: 'easyJet "Orange Spirit" — what does it mean to you?',
    difficulty: 3,
    goodAnswerPointsTr: ['Eğlenceli + profesyonel', 'Approachable, friendly', 'Hızlı LCC ama soğuk değil'],
    redFlagsTr: ['Bilmiyorum'],
    tipsTr: ['easyJet brand video', 'Orange uniform geleneği'],
  },
  {
    id: 'q_w6_1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: ['wizz_air'],
    question: 'Wizz Air has bases in 40+ cities. Why is multi-base operation important?',
    difficulty: 3,
    goodAnswerPointsTr: ['Esneklik — birçok şehirde yaşayabilir', 'Doğu Avrupa odak', 'Yakıt tasarrufu', 'Network optimizasyon'],
    redFlagsTr: ['Bilmiyorum'],
    tipsTr: ['Wizz baz haritası bil', 'İstanbul (SAW) bazı var'],
  },

  // ═══════════════════════════════════════
  // TÜRK HAVAYOLLARI ÖZEL
  // ═══════════════════════════════════════
  {
    id: 'q_tk_1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: ['turkish_airlines'],
    question: 'THY 350+ destinasyonla dünyanın en geniş network\'üne sahip. Bu kabin crew için ne anlama gelir?',
    difficulty: 3,
    goodAnswerPointsTr: [
      'Çok kültürlü yolcu profili',
      'Uçuş süresi farklılığı (1 saat → 18 saat)',
      'Kültürel duyarlılık + dil çeşitliliği',
      'Sürekli öğrenme',
    ],
    redFlagsTr: ['Yüzeysel "iyi"'],
    tipsTr: ['THY harita ezberle', '5 kıta destinasyonu say'],
  },
  {
    id: 'q_tk_2',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: ['turkish_airlines'],
    question: 'Long-haul TK 1\'de (IST-JFK) bir yolcu sürekli alkol talep ediyor ve sesli konuşuyor. Yan yolcular rahatsız. Müdahale et.',
    difficulty: 4,
    goodAnswerPointsTr: [
      'İlk uyarı: "Misafir, etrafınızdaki yolcular dinlenmeye geçti"',
      'Alkol servisi yavaşlat (suyla servis, vs)',
      'Purser\'a bildir',
      'Israr ederse Captain devreye, gerekirse JFK polisi temas',
    ],
    redFlagsTr: ['Direkt alkol kes — saldırgan', 'Görmezden gel'],
    tipsTr: ['Aşamalı eskalasyon', 'Türkçe + İngilizce çift dil'],
  },
  {
    id: 'q_tk_3',
    category: 'motivation',
    roles: ['cabin'],
    airlineIds: ['turkish_airlines'],
    question: 'Neden THY? (Pegasus/SunExpress yerine)',
    difficulty: 3,
    goodAnswerPointsTr: [
      'Long-haul + global network',
      'Premium kabin standardı (Skytrax)',
      'Star Alliance + 5-yıldızlı catering',
      'Türk misafirperverliği global ölçek',
    ],
    redFlagsTr: ['Diğerlerini kötüleme', 'Yüzeysel cevap'],
    tipsTr: ['THY 2024 ödülleri bil', 'Yeni rotalar (Mexico, Vietnam vb)'],
  },
  {
    id: 'q_pc_1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: ['pegasus'],
    question: 'Pegasus\'un slogan ne ve sana ne ifade ediyor?',
    difficulty: 2,
    goodAnswerPointsTr: ['"Yeni nesil havayolu" — modern, hızlı, ulaşılabilir', 'Genç ekip', 'SAW hub gücü'],
    redFlagsTr: ['Bilmiyorum'],
    tipsTr: ['Pegasus haberleri tara', 'SAW genişleme planı'],
  },
  {
    id: 'q_xq_1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: ['sunexpress'],
    question: 'SunExpress — THY ve Lufthansa ortak girişimi. Bu seni neden çekiyor?',
    difficulty: 3,
    goodAnswerPointsTr: ['İki kültürün buluşması — TR + DE', 'Antalya turist trafiği eğitimli', 'Almanca öğrenme fırsatı'],
    redFlagsTr: ['Bilmiyorum yapı'],
    tipsTr: ['XQ ortaklık tarihi (1989)'],
  },

  // ═══════════════════════════════════════
  // PILOT ORTAK SORULAR
  // ═══════════════════════════════════════
  {
    id: 'q_pilot_motiv',
    category: 'motivation',
    roles: ['pilot'],
    airlineIds: [],
    question: 'Why do you want to fly for our airline?',
    difficulty: 3,
    goodAnswerPointsTr: [
      'Şirketin spesifik filo + network',
      'Kariyer hız + upgrade yolu',
      'Long-term commitment vurgu',
      'Şirket değerleriyle örtüşme',
    ],
    redFlagsTr: ['Genel "iyi havayolu"', 'Para odaklı'],
    tipsTr: ['STAR + spesifik fact', 'CEO veya chief pilot adını bil'],
  },
  {
    id: 'q_pilot_crm_fail',
    category: 'behavioral',
    roles: ['pilot'],
    airlineIds: [],
    question: 'Tell me about a time when CRM (Crew Resource Management) prevented an incident.',
    difficulty: 4,
    goodAnswerPointsTr: ['STAR formatı', 'Spesifik kokpit/kabin durumu', 'F/O assertiveness örneği', 'Captain decision review'],
    redFlagsTr: ['Genel CRM teorik cevap', 'Hata yok hikayesi'],
    tipsTr: ['Kendi uçuşundan örnek', 'NASA ASRS okuyabilirsin'],
  },
  {
    id: 'q_pilot_decision',
    category: 'situational',
    roles: ['pilot'],
    airlineIds: [],
    question: 'You have low fuel and your destination is below minima. What\'s your decision tree?',
    difficulty: 5,
    goodAnswerPointsTr: [
      'Önce: alternatif fuel kontrol',
      'Hold + fuel watch',
      'Min fuel deklare → priority handling',
      'Mayday fuel → diversion to nearest suitable',
      'EASA/ICAO kararname referans',
    ],
    redFlagsTr: ['Risk almak (kalkış!)', 'ATC bilgilendirme atla'],
    tipsTr: ['Standart fuel hierarchy', 'CAA/FAA min fuel definitions'],
  },
  {
    id: 'q_pilot_emergency_lead',
    category: 'situational',
    roles: ['pilot'],
    airlineIds: ['emirates', 'qatar'],
    question: 'Engine fire after V1 in your A380. Walk me through the next 60 seconds.',
    difficulty: 5,
    goodAnswerPointsTr: [
      'Memory items: thrust set + rotate, gear up, ECAM action',
      'Climb out + attitude maintain',
      'Mayday call + altitude assignment',
      'Cabin crew brief',
      'PNF/PF rolleri net',
    ],
    redFlagsTr: ['QRH önce dur — memory items kaçır', 'CRM unutulmuş'],
    tipsTr: ['A380 memory items ezbere', 'OEI procedures'],
  },
  {
    id: 'q_em_pilot_1',
    category: 'company_knowledge',
    roles: ['pilot'],
    airlineIds: ['emirates'],
    question: 'Emirates operates 119 A380s. Why is this strategy unique in industry?',
    difficulty: 3,
    goodAnswerPointsTr: ['DXB hub gücü + slot kısıtı', 'Premium yolcu kapasitesi', 'Brand image', 'Maliyetli ama strategic'],
    redFlagsTr: ['Bilmiyorum sayı'],
    tipsTr: ['EK fleet pdf'],
  },
  {
    id: 'q_qr_pilot_1',
    category: 'company_knowledge',
    roles: ['pilot'],
    airlineIds: ['qatar'],
    question: 'Qatar Airways operates A350-1000 long-haul ops. What sets this aircraft apart for pilots?',
    difficulty: 4,
    goodAnswerPointsTr: ['XWB cabin', 'Composite gövde %53', 'CFM Trent XWB', 'FBW + envelope protection'],
    redFlagsTr: ['Yanlış spec'],
    tipsTr: ['A350 type rating önemi'],
  },
  {
    id: 'q_lh_pilot_1',
    category: 'company_knowledge',
    roles: ['pilot'],
    airlineIds: ['lufthansa'],
    question: 'What is the DLR test and why is it Lufthansa\'s gateway?',
    difficulty: 4,
    goodAnswerPointsTr: ['German Aerospace Center test', '2 günlük psikometrik', 'Pilot aday seçim altın standardı', 'Hamburg\'da yapılır'],
    redFlagsTr: ['Bilmiyorum'],
    tipsTr: ['DLR test pratik kitabı al', 'Numerical + spatial ağırlık'],
  },
  {
    id: 'q_ba_pilot_1',
    category: 'company_knowledge',
    roles: ['pilot'],
    airlineIds: ['british_airways'],
    question: 'BA Speedbird Pilot Cadetship — what do you know about it?',
    difficulty: 3,
    goodAnswerPointsTr: ['Sponsorlu pilot eğitimi', 'L3Harris partnership', '18 ay full eğitim', 'BA garantili iş'],
    redFlagsTr: ['Bilmiyorum'],
    tipsTr: ['Cadet program web'],
  },
  {
    id: 'q_et_pilot_1',
    category: 'company_knowledge',
    roles: ['pilot'],
    airlineIds: ['etihad'],
    question: 'Etihad has Cadet Pilot Program. What\'s the path?',
    difficulty: 3,
    goodAnswerPointsTr: ['Sıfırdan ATPL programı', 'Horizon International Flight Academy', 'Type rating + line training', '~3 yıl total'],
    redFlagsTr: ['Bilmiyorum'],
    tipsTr: ['Etihad Cadet web'],
  },
  {
    id: 'q_sv_pilot_1',
    category: 'situational',
    roles: ['pilot'],
    airlineIds: ['saudia'],
    question: 'Hac sezonunda yoğun trafik + sıcak hava (45°C+). Operasyonel hazırlığın nasıl olur?',
    difficulty: 4,
    goodAnswerPointsTr: ['Performance calc — derate vs full', 'Fuel temp izle', 'Density altitude artar — daha uzun TOR', 'CRM yorgunluk farkındalık'],
    redFlagsTr: ['Sıcaklık etkisi göz ardı'],
    tipsTr: ['Hot/high airport ops bil'],
  },
  {
    id: 'q_tk_pilot_1',
    category: 'situational',
    roles: ['pilot'],
    airlineIds: ['turkish_airlines'],
    question: 'IST-JFK uçuşunda North Atlantic Track sistemine girdiğinde CPDLC bağlantı kesildi. Aksiyon?',
    difficulty: 5,
    goodAnswerPointsTr: ['HF radio backup', 'Position report standart format', 'Shanwick/Gander frekans', 'ADS-C kontrol'],
    redFlagsTr: ['Bilmiyorum'],
    tipsTr: ['NAT track ops bil', 'Datalink fail procedures'],
  },
];

/**
 * Bir havayolu için sorular getir.
 * Genel + havayolu-spesifik birleştirir.
 */
export function getQuestionsForAirline(
  airlineId: string,
  role: string,
): InterviewQuestion[] {
  return INTERVIEW_QUESTIONS.filter((q) => {
    if (!q.roles.includes(role as never)) return false;
    if (q.airlineIds.length === 0) return true; // genel soru
    return q.airlineIds.includes(airlineId);
  });
}

/**
 * Genel rol bazlı sorular (havayolu seçilmeden pratik için).
 */
export function getGeneralQuestionsForRole(role: string): InterviewQuestion[] {
  return INTERVIEW_QUESTIONS.filter(
    (q) => q.roles.includes(role as never) && q.airlineIds.length === 0,
  );
}

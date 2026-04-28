/**
 * Mülakat Soru Bankası — havayolu rol bazlı
 *
 * 180+ soru: kategori (icebreaker, motivation, technical, behavioral, situational,
 * english, company, group, role-play, cv-based, tricky) × rol × havayolu.
 *
 * Sprint 9'da Claude ile 500+ soruya çıkarılacak.
 */
import type { InterviewQuestion } from './airlineTypes';
import { CABIN_EXTRA_QUESTIONS } from './questionsCabinExtra';
import { PILOT_EXTRA_QUESTIONS } from './questionsPilotExtra';
import { ROLES_EXTRA_QUESTIONS } from './questionsRolesExtra';

const CORE_QUESTIONS: InterviewQuestion[] = [
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
    detailedExplanationTr: `**HR psikoloji perspektifi**: "Why cabin crew?" sorusu mülakatın temel sorularından. HR uzmanı 3 şey ölçer: 1) Motivasyonun gerçek mi yoksa "her iş olur" mu? 2) Sektör hakkında temel bilgi var mı? 3) Uzun dönem retention riski (ilk yıl içinde ayrılma oranı %30-40 sektörde). Cevap belirsiz veya yüzeysel olursa kabin crew "trampoline job" (geçici iş) olarak görüldüğün izlenimi yaratır.

**Bu aşamada neden sorulur**: Genellikle Open Day'in 2. veya 3. dakikasında, ilk eleme aşamasında. Cevabını ezberleyenleri ayırmak için varyasyon: "What attracts you to OUR airline specifically?" Bu sebeple cevabın 2 katmanlı olmalı: (a) genel kabin crew motivasyonu (b) bu havayolunun spesifik çekiciliği.

**3 seviyeli cevap örneği**:
- **Zayıf**: "Çünkü uçmayı seviyorum ve seyahat etmek istiyorum." → herkes der, 0 ayırt edicilik.
- **Orta**: "Hospitality deneyimim var, müşteri servisini seviyorum, kabin crew bir sonraki adım." → mantıklı ama kişiselleştirme yok.
- **Güçlü**: "Marriott'ta 4 yıl konsiyerj olarak çalıştım; en sevdiğim moment yorgun bir Japon misafire 3 saatte ek otel rezervasyonu organize edip teşekkür mektubu almamdı. Cabin crew'da o moment'ler 8-10 saatlik bir uçuşta günde 3-4 kez yaşanıyor — global ölçekte. Emirates/Qatar/THY gibi premium taşıyıcı, çünkü yolcu çeşitliliği ve servis standardı en yüksek." → spesifik anekdot + sektör bilgisi + havayolu uyarlama.

**STAR formatı uygulaması**: Bu sorularda STAR'ı esnek kullan. (S) "Marriott'ta 4 yıl çalıştım" — kısa kontekst. (T) "Yorgun misafirin uçuşunu yenileme görevim vardı" — somut görev. (A) "Otelden ücretsiz shuttle, partner havayolu acentem ile alternatif uçuş" — eylem detayı. (R) "Misafir teşekkür mektubu, oteli 9.8 puanladı" — ölçülebilir sonuç.

**Havayolu uyarlama**: Emirates "Fly Better" felsefesini vurgu — multi-cultural workforce (160 ülke). Qatar — Skytrax #1, detail obsession. THY — Türk misafirperverliği global. Lufthansa — disiplin + premium servis. BA — heritage + "To Fly. To Serve." Her şirket için 2-3 fact bilmen gerekiyor.

**Tipik takip soruları**: "Why now in your career?" "What if you don't get hired here?" "What would you say no to?" Bu cevapla bunlara da hazırlıklı ol.`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi**
HR uzmanı bu soruyla adayda özellikle **conflict management** (çatışma yönetimi) ve **emotional intelligence** (duygusal zeka) yetilerini ölçer. Havacılıkta güvenlik tavizsizdir; ancak bu güvenliğin yolcuya nasıl aktarıldığı markanın yüzünü belirler. Mülakatçı şu dört niteliği arar: **Assertiveness** (kararlılık), **De-escalation** (gerginliği düşürme), **Safety-first mindset** (önce emniyet yaklaşımı) ve **Resilience** (stres altında soğukkanlılık). Yolcuyu kırmadan ama kuralı da esnetmeden ikna edip edemeyeceğiniz test edilir.

**Bu aşamada neden sorulur**
Bu soru genellikle mülakatın orta kısmında, adayın teknik bilgisi ölçüldükten sonra "situational" (durumsal) yetkinlikleri anlamak için sorulur. Adayın "Müşteri Memnuniyeti" ile "Uçuş Emniyeti" arasındaki o ince çizgide nasıl yürüdüğünü görmek hedeflenir. Özellikle **taxi** gibi kokpitin **sterile cockpit** kuralına geçtiği kritik bir evrede, kabin ekibinin inisiyatif alma becerisi bu noktada sorgulanır.

**3 seviyeli cevap örneği**

*   **Zayıf**: "Yolcuya telefonunu kapatması gerektiğini, bunun bir kural olduğunu ve aksi takdirde uçağın kalkamayacağını sertçe söylerim. Eğer dinlemezse hemen güvenliği çağırırım." → **Kötü çünkü**: Empati yoksunu, tehditkar ve gerginliği tırmandıran bir yaklaşım.
*   **Orta**: "Yanına gidip nazikçe telefonunu kapatmasını rica ederim. Navigasyon sistemlerine **interference** (parazit) yapabileceğini açıklarım. Çoğu yolcu bunu anlayışla karşılar ve kapatır." → **İyi ama eksik**: İkna çabası doğru ancak yolcu direnç göstermeye devam ederse izlenecek hiyerarşik prosedür (escalation) belirtilmemiş.
*   **Güçlü**: "Önce gülümseyerek ve alçak sesle yaklaşırım. 'Beyefendi/Hanımefendi, çok önemli bir görüşme yaptığınızı görüyorum ancak **taxi** aşamasındayız ve güvenliğiniz için cihazınızı **flight mode**'a almanız gerekiyor' derim. Eğer direnç sürerse, bunun bir **regulatory requirement** olduğunu nazikçe vurgular, durumu **Purser**’a (Kabin Amiri) bildirerek ekip içi koordinasyonu sağlarım. Asla tartışmaya girmem." → **Bu cevap işe alır**: Hem çözüm odaklı hem de prosedüre sadık.

**STAR formatı uygulaması**
*   **Situation**: Taxi sırasında telefonunu kapatmayan bir yolcu.
*   **Task**: Yolcuyu provoke etmeden emniyet kurallarına uyumunu sağlamak.
*   **Action**: Sakin bir tonla yaklaşma, teknik gerekçeyi (interference) açıklama, kişiselleştirmeden kuralı hatırlatma ve gerekirse üst amire raporlama.
*   **Result**: Yolcunun ikna edilmesi, uçağın zamanında kalkması ve kokpit ekibinin gereksiz yere meşgul edilmemesi.

**Havayolu uyarlama**
*   **Emirates/Qatar**: Bu havayollarında "5-star service" ve "Multiculturalism" ön plandadır. Yolcuya hitap ederken çok daha resmi ve "Sir/Madam" odaklı, ultra-profesyonel bir dil beklenir.
*   **THY**: Türk misafirperverliği (hospitality) ile emniyetin harmanlanması istenir. "Sizi anlıyorum" diyerek empati kurmak ve ardından emniyet vurgusu yapmak THY kültürüne uygundur.
*   **LCC (Pegasus/Ryanair)**: Operasyonel hız ve kuralların netliği daha ön plandadır; daha direkt ama yine de profesyonel bir iletişim tercih edilir.

**Tipik takip soruları**
*   Yolcu size bağırmaya başlarsa tepkiniz ne olur?
*   Yolcu telefonun zararlı olmadığına dair bilimsel bir tartışmaya girerse ne yaparsınız?
*   Bu durum uçağın **take-off** (kalkış) saatini geciktirirse kokpite nasıl bilgi verirsiniz?`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**
Havayolu İK uzmanları bu soruyla sizin **Crew Resource Management (CRM)** yetkinliğinizi ve duygusal zekânızı (EQ) ölçer. Havacılıkta kokpit veya kabin içi uyum sadece huzur değil, uçuş emniyeti (flight safety) demektir. İK; çatışma anında profesyonel kalıp kalmadığınızı, kişisel egonuzu operasyonun önüne koyup koymadığınızı ve çözüm odaklılığınızı analiz eder. Aranan temel nitelikler: **Resilience (Dayanıklılık)**, **Conflict Resolution (Çatışma Çözümü)**, **Professionalism** ve **Adaptability**.

**Bu Aşamada Neden Sorulur?**
Bu soru genellikle mülakatın orta kısmında, aday teknik yeterliliğini kanıtladıktan sonra "kültürel uyum" (cultural fit) aşamasında sorulur. Havayolu, adayın stresli ve kısıtlı zamanlı bir ortamda (turnaround süresi gibi) zor bir karakterle karşılaştığında **SOP (Standard Operating Procedures)** dışına çıkıp çıkmayacağını anlamak ister.

**3 Seviyeli Cevap Örneği**
- **Zayıf**: "Eski işimde sürekli şikayet eden bir arkadaşım vardı. Çok negatifti, ben de onunla pek konuşmamayı tercih ettim ve işimi tek başıma bitirdim. Sonuçta iş halloldu."
  *Kötü çünkü: Pasif-agresif bir tutum sergiliyor, ekip çalışmasından kaçıyor ve sorunu çözmüyor.*
- **Orta**: "Bir ekip arkadaşım kurallara uymuyordu. Onu uyardım ama dinlemedi. Ben de durumu müdürümüze bildirdim. Sonrasında müdür müdahale etti ve sorun çözüldü."
  *İyi ama eksik: İnisiyatif alma ve bireysel iletişim becerisi zayıf, direkt yetkiliye gitmek her zaman ilk adım olmamalıdır.*
- **Güçlü**: "Yoğun bir operasyon sırasında bir ekip üyem, iş yükü nedeniyle çok gergindi ve briefing sırasında sert bir üslup kullandı. Kişisel algılamak yerine, 'Şu an önceliğimiz uçağın zamanında kalkması, bu konuyu inişten sonra detaylıca konuşalım' diyerek odağı operasyona çektim. Uçuş sonrası sakin bir dille, üslubunun ekip sinerjisini etkilediğini belirttim. Hatasını fark etti ve sonraki uçuşlarda daha koordineli çalıştık."
  *Bu cevap işe alır: Profesyonel, operasyon odaklı ve geri bildirim verme becerisi yüksek.*

**STAR Formatı Uygulaması**
- **Situation (Durum)**: Spesifik bir olay seçin (Örn: Gecikmiş bir uçuş veya eksik dokümantasyon süreci).
- **Task (Görev)**: Hedef neydi? (Örn: Uçağı emniyetle ve zamanında de-ice işlemine göndermek).
- **Action (Aksiyon)**: Sizin somut adımınız. "Konuştuk" yerine "Verileri gösterdim", "Görev paylaşımı önerdim" veya "SOP referansı verdim" deyin.
- **Result (Sonuç)**: İş başarıyla tamamlandı mı? Karşıdaki kişiyle ilişkiniz nasıl gelişti? Ne öğrendiniz?

**Havayolu Uyarlama**
- **THY**: "Kurumsal aidiyet" ve "saygı" vurgusu yapın. Hiyerarşi içinde profesyonel geri bildirimi nasıl verdiğinizi anlatın.
- **Emirates/Qatar**: "Multicultural environment" vurgusu ekleyin. Farklı kültürlerden gelen birinin çalışma tarzına nasıl adapte olduğunuzu ve ortak dil olan SOP'de nasıl buluştuğunuzu belirtin.
- **Lufthansa/FAA tabanlı şirketler**: "Safety First" ve "Direct Communication" ekolünü ön plana çıkarın.

**Tipik Takip Soruları**
- "Peki, bu kişi bir **Captain** (veya üst amiriniz) olsaydı yaklaşımınız nasıl değişirdi?"
- "Bu durumun uçuş emniyetini tehlikeye attığını hissetseydiniz hangi **assertiveness** seviyesini kullanırdınız?"
- "Geriye dönüp baktığınızda, o durumda farklı yapacağınız bir şey var mı?"`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi**
HR uzmanı bu soruyla adayda sadece ezber yeteneğini değil, şirkete olan bağlılık potansiyelini ve "cultural fit" (kültürel uyum) düzeyini ölçer. Bu soru aracılığıyla adayın profesyonel disiplini, araştırma derinliği ve şirketin vizyonunu kendi kariyer hedefleriyle ne kadar örtüştürdüğü analiz edilir. HR burada şu 4 temel niteliği arar: **Preparation** (hazırlık), **Diligence** (özen), **Alignment** (uyum) ve **Institutional Awareness** (kurumsal farkındalık).

**Bu aşamada neden sorulur**
Genellikle mülakatın orta kısmında, adayın geçmiş tecrübeleri konuşulduktan hemen sonra sorulur. Bu nokta, adayın "ben ne yapabilirim" aşamasından "bizim için ne yapabilirsin" aşamasına geçiş köprüsüdür. Adayın sadece teknik becerileriyle (hard skills) değil, şirketin ruhuyla da ilgilenip ilgilenmediğini anlamak için stratejik bir zamanlamadır.

**3 seviyeli cevap örneği**
*   **Zayıf:** "Sizin çok büyük ve başarılı bir havayolu olduğunuzu biliyorum. Güvenliğe önem veriyorsunuz ve uçaklarınız çok yeni. Bu yüzden burada çalışmak istiyorum."
    *   *Neden kötü?* Çok genel, her havayolu için söylenebilir ve hiçbir spesifik data içermiyor.
*   **Orta:** "Şirketinizin 1933’te kurulduğunu ve ana merkezinizin İstanbul olduğunu biliyorum. Değerleriniz arasında dürüstlük ve müşteri memnuniyeti var. Genç bir filonuz (fleet) olması beni etkiliyor."
    *   *Neden iyi ama eksik?* Bilgiler doğru ancak adayın bu değerleri kendi karakteriyle nasıl birleştirdiği eksik.
*   **Güçlü:** "Şirketinizin 'Safety First' ve 'Sustainability' vizyonunu yakından takip ediyorum. Özellikle son dönemdeki **Sustainable Aviation Fuel (SAF)** kullanımına dair yatırımlarınız, benim çevre duyarlılığı değerimle örtüşüyor. 300'den fazla destinasyona uçan geniş **network** ağınız ve 'Turkish Hospitality' vurgunuz, benim profesyonel hizmet anlayışımı yansıtıyor. Yeni teslim alınan **Airbus A350** uçaklarıyla filonuzu modernize etmeniz, teknolojiye verdiğiniz önemi gösteriyor."
    *   *Neden bu cevap işe alır?* Somut veriler (SAF, A350, network) içeriyor ve kurumsal değerleri kişisel motivasyonla bağlıyor.

**STAR formatı uygulaması**
Bu soruda STAR tekniği, değerlerin sizdeki karşılığını kanıtlamak için kullanılır.
*   **Situation:** Eski iş yerimde operasyonel bir gecikme (delay) yaşanıyordu.
*   **Task:** Şirketimin 'Müşteri Odaklılık' değerini korumam gerekiyordu.
*   **Action:** Yolculara **gate** bölgesinde proaktif bilgi verip **refreshment** süreçlerini yönettim.
*   **Result:** Yolcu memnuniyetini sağladım; bu da sizin 'Excellence' değerinizle birebir örtüşüyor.

**Havayolu uyarlama**
*   **THY:** "Widen Your World" mottosu, aile değerleri ve global erişim vurgulanmalı.
*   **Emirates:** "Tomorrow’s Emirates", lüks segmentteki liderlik, multikültürel yapı ve inovasyon odaklılık ön planda tutulmalı.
*   **Qatar Airways:** "Excellence in everything we do", 5-star airline unvanı ve yüksek disiplin standartları (discipline) vurgulanmalı.
*   **Pegasus:** "Low-cost" iş modeli, verimlilik (efficiency) ve dijitalleşme vizyonu üzerinden gidilmeli.

**Tipik takip soruları**
*   "Bahsettiğiniz bu değerlerden hangisi sizin için en kritiktir ve neden?"
*   "Bir operasyon sırasında 'Safety' ve 'Punctuality' (dakiklik) değerleri çatışırsa hangisini seçersiniz?" (Cevap her zaman Safety olmalıdır).
*   "Şirket kültürümüzde değiştirmek istediğiniz bir şey olur mu?"`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi** (60-80 kelime):
HR uzmanı bu soruyla temelde "retention" (çalışanı elde tutma) potansiyelinizi ölçer. Havayolu için bir pilot veya kabin memuru eğitimi yüksek maliyetli bir yatırımdır. Uzman; sizin duygusal dayanıklılığınızı (**resilience**), kültürel adaptasyon yeteneğinizi ve bölgeye dair gerçekçi beklentilerinizi sorgular. Aranan 3 temel nitelik: **Stability** (istikrar), **Cultural Awareness** (kültürel farkındalık) ve **Long-term Commitment** (uzun vadeli bağlılık).

**Bu aşamada neden sorulur** (40-60 kelime):
Genellikle mülakatın orta kısmında, teknik yetkinlikleriniz onaylandıktan sonra sorulur. Adayın sadece yüksek maaş veya vergisiz kazanç (**tax-free salary**) peşinde olup olmadığını, yoksa bölgedeki yaşam tarzına gerçekten hazır olup olmadığını anlamak için bir "eleme" noktasıdır. Motivasyonunuzun sürdürülebilirliği burada test edilir.

**3 seviyeli cevap örneği** (120-180 kelime):
- **Zayıf**: "Türkiye'deki ekonomik durumdan dolayı gelmek istiyorum. Dubai çok lüks bir yer ve maaşların vergisiz olması benim için büyük bir avantaj." → *Kötü çünkü: Sadece maddi odaklı ve ülkesinden kaçış motivasyonu taşıyor; bu da ilk zorlukta istifa edebileceği izlenimi verir.*
- **Orta**: "Emirates dünyanın en iyisi ve Dubai çok modern bir şehir. Oradaki çok kültürlü yapıyı seviyorum ve kariyerime orada devam etmek istiyorum." → *İyi ama eksik: Çok yüzeysel. Spesifik bir hazırlık veya bölgeye dair derin bir bilgi içermiyor.*
- **Güçlü**: "Dubai'nin sunduğu dinamik ve **multi-cultural** ortam, profesyonel hedeflerimle örtüşüyor. Bölgeyi ziyaret ettim; yaz aylarındaki yüksek sıcaklıkların ve Ramazan dönemindeki toplumsal kuralların farkındayım ve bunlara uyum sağlayacak disipline sahibim. Bekar bir profesyonel olarak esnek bir yaşam tarzına sahibim ve önümüzdeki 5-10 yılı bu **global hub** içerisinde planlıyorum." → *Bu cevap işe alır: Çünkü hem zorlukların bilincinde hem de uzun vadeli bir plan sunuyor.*

**STAR formatı uygulaması** (50-80 kelime):
- **Situation**: Ortadoğu'da yaşama kararı aldığım dönem.
- **Task**: Bölgeye adaptasyon sürecimi planlamam gerekiyordu.
- **Action**: Dubai/Doha'da yaşayan meslektaşlarımla görüştüm, iklim koşullarını ve yerel yasaları araştırdım. Hatta bölgeyi en sıcak döneminde ziyaret ederek kendimi test ettim.
- **Result**: Şehre taşındığım ilk gün operasyona odaklanabilecek düzeyde mental hazırlığımı tamamladım.

**Havayolu uyarlama** (50-80 kelime):
- **Emirates**: Dubai'nin "global bir erime potası" olması ve Expo gibi vizyon projelerine vurgu yapın.
- **Etihad**: Abu Dhabi'nin daha aile dostu, sakin ve sürdürülebilir büyüme stratejisine odaklanın.
- **Qatar Airways**: Doha'nın hızla gelişen spor ve sanat vizyonuna, ayrıca havayolunun "premium" hizmet standartlarına olan hayranlığınızı belirtin.

**Tipik takip soruları** (30-50 kelime):
- "Ailenizden/arkadaşlarınızdan uzak kalmak operasyonel performansınızı etkiler mi?"
- "50 dereceye varan sıcaklıklarda dışarıda çalışmaya veya yaşamaya nasıl adapte olacaksınız?"
- "Yerel kültüre saygı bağlamında hangi kurallara dikkat etmeniz gerektiğini biliyor musunuz?"`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi**
HR uzmanı bu soruyla adayın **Cultural Awareness** (kültürel farkındalık) ve **Emotional Intelligence** (duygusal zeka) seviyesini ölçer. Havayolu, kişisel değerleriniz ile yolcunun değerleri çatıştığında nasıl tepki verdiğinizi görmek ister. Aranan temel nitelikler; yargılayıcı olmamak (non-judgmental), esneklik ve kriz anında bile "Service Excellence" vizyonunu koruyabilmektir. Adayın, bir durumu kişiselleştirmeden profesyonel bir çözüm üretip üretemediği test edilir.

**Bu aşamada neden sorulur**
Genellikle mülakatın son aşaması olan "Final Interview" kısmında sorulur. Çünkü Emirates, Qatar veya Etihad gibi Körfez taşıyıcıları, 150’den fazla milletten yolcu taşır. Bu noktada teknik bilgiden ziyade, havayolunun marka imajını ve misafirperverlik anlayışını en zorlayıcı sosyal senaryolarda bile temsil edip edemeyeceğiniz kritik önem taşır.

**3 seviyeli cevap örneği**
*   **Zayıf**: "Onlara havayolu kurallarımızın herkese eşit hizmet vermek olduğunu söylerim ve görevime devam ederim." → **Kötü çünkü**: Kültürel hassasiyeti yok sayar, yolcuyla çatışma (conflict) yaratır ve yolcuyu uçağın içinde savunmasız veya rahatsız hissettirir.
*   **Orta**: "İsteği kabul ederim ve o yolcuya servis yapmayı bırakırım. Diğer yolcularla ilgilenirim." → **İyi ama eksik**: Yolcunun talebine saygı duyar ancak "Service Continuity" (servis sürekliliği) ilkesini bozar. Beyefendi servis alamazsa bu bir memnuniyetsizlik kaynağı olur.
*   **Güçlü**: "Gülümseyerek talebi nazikçe karşılarım ve 'Elbette, sizi anlıyorum' derim. Hemen bir **male crew member** (erkek kabin memuru) arkadaşımı durumdan haberdar ederim. Hanımefendiye benim servis yapmaya devam edeceğimi, beyefendiyle ise meslektaşımın ilgileneceğini belirtirim. Bu sayede hem kültürel sınırlara saygı duyarım hem de servis kalitesini en üst seviyede tutarım." → **Bu cevap işe alır**: Çözüm odaklıdır, ekip çalışmasını (teamwork) kullanır ve misafiri önceliklendirir.

**STAR formatı uygulaması**
*   **Situation**: Bir kadın yolcu, kültürel nedenlerle eşiyle iletişim kurmamı istemedi.
*   **Task**: Yolcunun kültürel değerlerine saygı gösterirken, eşinin servis almasını sağlamak.
*   **Action**: Talebi profesyonelce kabul ettim, durumu erkek meslektaşıma **briefing** vererek aktardım ve rolleri değiştirdik.
*   **Result**: Yolcular kendilerini güvende ve saygı görmüş hissettiler, uçuş sorunsuz tamamlandı.

**Havayolu uyarlama**
*   **Emirates**: "Globalistas" vizyonuyla, her kültüre evrensel bir saygı vurgusu yapılmalıdır.
*   **Qatar Airways**: "World's Best Airline" imajı için kusursuz ve kişiselleştirilmiş hizmet (personalized service) vurgulanmalıdır.
*   **Etihad**: "Arabian Hospitality" ruhuyla, misafirin geleneklerine en ince ayrıntısına kadar sadık kalındığı belirtilmelidir.

**Tipik takip soruları**
*   "Eğer uçakta o an erkek bir kabin memuru yoksa bu durumu nasıl yönetirsin?"
*   "Yolcu bu talebini kaba bir üslupla dile getirirse tepkin değişir mi?"
*   "Ekip arkadaşın bu değişikliği kabul etmezse ne yaparsın?"`,
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
    detailedExplanationTr: `**HR psikoloji perspektifi**: Bu soruyu "trick question" yapan şey: HR uzmanı "rakibi kötülüyor mu?" "kararsız mı?" "değişken loyalty mi?" değerlendirir. Aynı zamanda "havayolları arasındaki farkları ne kadar iyi biliyor?" da test eder. Cevap diplomatik + spesifik + bilinçli olmalı. Politik durmamak — ama abartılı övgü yapmamak.

**Bu aşamada neden sorulur**: Genelde Final Interview'in son 5 dakikasında. Adayın gerçek motivasyonunu ve emniyet seviyesini ölçer. Eğer aday "ikisi de aynı, hangisi alırsa giderim" derse: HR notu "low loyalty risk = high turnover". Eğer "Qatar her açıdan daha iyi" derse: HR "neden burdasın?" diye sorar.

**3 seviyeli cevap örneği**:
- **Zayıf**: "İkisi de iyi, fark etmez." → loyalty zero.
- **Orta**: "Emirates daha büyük olduğu için Emirates'i seçerdim." → yüzeysel.
- **Güçlü**: "İkisi de Skytrax 5-star ve harika rakip ama Emirates'in Dubai içindeki entegrasyonu (Emirates Group: dnata, Emirates Holidays, EK SkyCargo) kariyer çoklu yönlü açıyor. Q-Suite muhteşem ama A380 onboard atmosphere benim için unique deneyim. Ayrıca Dubai'nin multi-cultural yaşamı (200+ nationality crew) global vatandaş olma fırsatı sunar. Qatar'ı reddetmem ama Emirates'i tercih ederim." → spesifik fark + saygı + dürüstlük.

**STAR formatı uygulaması**: Bu durumsal sorudur, STAR doğrudan uygulanmaz. Yerine "Compare-Contrast-Conclude" yapısı: Compare (iki şirketi mukayese et), Contrast (farkı göster), Conclude (kendi tercihini argümanle).

**Havayolu uyarlama**:
- Emirates: A380 fleet, Dubai hub, Emirates Group entegrasyonu vurgu
- Qatar: Skytrax #1 (8 kez), Q-Suite, Hamad International T5
- Etihad: Boutique premium, "Choose Well", Abu Dhabi sakinliği
- Mülakatta hangisindeysen, oraya pozitif eğilim göster ama diğerini saygıyla anlat.

**Tipik takip soruları**: "What if Qatar offers you a better salary?" "Have you applied to other airlines?" "Where do you see yourself in 5 years if Emirates doesn't promote you?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**
HR uzmanları bu soruyla adayda sadece teknik bilgi değil, aynı zamanda **cultural fit** (kültürel uyum) ve marka sadakati ararlar. Bu soru; adayın şirketin vizyonunu ne kadar içselleştirdiğini, detaylara verdiği önemi ve 160’tan fazla milliyetin bir arada çalıştığı **multi-cultural workforce** yapısına adaptasyon kapasitesini ölçer. HR; profesyonellik, kültürel zeka (CQ), yüksek hizmet standartları ve "Emirates Ambassador" olma potansiyeli gibi 4 temel niteliği analiz eder.

**Bu Aşamada Neden Sorulur?**
Genellikle mülakatın orta kısmında, adayın genel yetkinlikleri anlaşıldıktan sonra sorulur. Amaç, adayın sadece "herhangi bir havayolu" için mi yoksa spesifik olarak Emirates için mi orada olduğunu anlamaktır. Adayın Dubai merkezli bu dev yapının **Fly Better** felsefesine ve global prestijine olan bağlılığı bu noktada test edilir.

**3 Seviyeli Cevap Örneği**
*   **Zayıf**: "Emirates Way, yolculara çok iyi servis vermek ve her zaman gülümsemektir. Dünyanın en iyi havayolu olmaktır."
    *   *Neden kötü?*: Çok genel, yüzeysel ve markaya özgü hiçbir detay (A380, multi-cultural yapı vb.) içermiyor.
*   **Orta**: "Emirates Way, şirketin 'Fly Better' sloganını temsil eder. A380 ve Boeing 777 filosuyla lüks hizmet sunmak ve profesyonel görünmektir."
    *   *Neden iyi ama eksik?*: Marka unsurlarına değiniyor ancak "insan" ve "kültür" faktörünü, yani Emirates'in kalbindeki çeşitliliği atlıyor.
*   **Güçlü**: "Emirates Way; mükemmeliyetçilik, profesyonellik ve kültürel farkındalığın birleşimidir. 160’tan fazla ülkeden gelen personelin oluşturduğu **multi-cultural** yapıyı bir avantaja dönüştürerek, her yolcuya kişiselleştirilmiş bir deneyim sunmaktır. Bu, sadece bir servis anlayışı değil; **Fly Better** sözünü her uçuşta, özellikle ikonik A380 filosuyla bir endüstri standardı haline getirme vizyonudur."
    *   *Neden işe alır?*: Hem operasyonel gücü (A380) hem de insani sermayeyi (diversity) vurguluyor.

**STAR Formatı Uygulaması**
Bu soruyu yanıtlarken geçmiş bir deneyiminizi bağlayabilirsiniz:
*   **Situation**: Farklı kültürlerden gelen yolcuların olduğu zorlu bir uçuş/durum.
*   **Task**: Herkesin beklentisini Emirates standartlarında karşılama görevi.
*   **Action**: Kültürel hassasiyetleri gözeterek ve profesyonel **grooming** ile çözüm üretme.
*   **Result**: Yolcunun "Fly Better" deneyimini bizzat yaşaması ve markaya olan güveninin artması.

**Havayolu Uyarlama**
Emirates için cevap verirken "global hub", "luxury" ve "diversity" vurgusu hayati önem taşır. Qatar Airways için bu soru sorulsaydı "5-star perfection" ve "discipline" ön planda olurdu. Türk Hava Yolları (THY) mülakatında ise "Turkish Hospitality" (Türk misafirperverliği) ve "Widen Your World" vizyonu üzerinden bir köprü kurulmalıdır.

**Tipik Takip Soruları**
*   "Farklı kültürlerden biriyle çatışma yaşadığınızda Emirates değerlerini nasıl korursunuz?"
*   "Sizce 'Fly Better' sloganı operasyonel olarak neyi ifade ediyor?"
*   "Kişisel değerleriniz ile Emirates Way arasındaki en büyük benzerlik nedir?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**
HR uzmanları bu soruyla adayın havayoluna olan bağlılığını, marka bilincini ve yüksek standartları içselleştirip içselleştirmediğini ölçer. Bu soru aracılığıyla adayda şu 3-4 temel nitelik aranır: **Attention to detail** (detaylara gösterilen özen), **Brand Ambassadorship** (marka elçiliği), **Commitment to Excellence** (mükemmeliyet taahhüdü) ve **Professional Pride** (mesleki gurur). Adayın sadece bir iş arayıp aramadığı yoksa dünyanın en iyi havayolunun bir parçası olmanın getirdiği sorumluluğu kavrayıp kavramadığı test edilir.

**Bu Aşamada Neden Sorulur?**
Bu soru genellikle mülakatın orta kısmında, adayın kişisel arka planı anlaşıldıktan sonra "Company Knowledge" (şirket bilgisi) aşamasında sorulur. Amaç, adayın Qatar Airways’in prestijini sadece bir reklam sloganı olarak mı gördüğünü, yoksa bu başarının arkasındaki **cabin crew** emeğini ve disiplinini anlayıp anlamadığını görmektir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Qatar Airways’in 7 kez dünyanın en iyisi seçildiğini biliyorum. Bu harika bir başarı ve böyle başarılı bir şirkette çalışmak benim için bir onur olur." 
    *   *Neden kötü:* Çok yüzeysel, somut veri içermiyor ve ödülün mürettebat üzerindeki operasyonel etkisine değinmiyor.
*   **Orta:** "Qatar Airways, Skytrax tarafından 7 kez 'World's Best Airline' seçilen tek havayolu. Bu durum crew için çok yüksek standartlar ve disiplin anlamına geliyor. Özellikle Q-Suite gibi ürünlerle bu başarıyı sürdürüyoruz." 
    *   *Neden iyi ama eksik:* Veriler doğru ancak adayın bu standartlara nasıl katkı sağlayacağına dair kişisel bir vizyon içermiyor.
*   **Güçlü:** "Qatar Airways’in Skytrax tarafından 7. kez 'World's Best Airline' seçilmesi, biz kabin ekibi için 'obsessive focus on detail' (detaylara obsesif odaklanma) demektir. Bu unvan, her uçuşta **Five-Star service** standartlarını koruma sorumluluğunu yükler. Özellikle **Q-Suite** gibi ödüllü ürünlerde yolcu beklentisi zirvededir. FIFA 2022 gibi dev organizasyonlardaki başarımızla birleşen bu ödül, benim için her zaman 'Excellence in everything we do' felsefesini temsil ediyor." 
    *   *Neden bu cevap işe alır:* Sayısal veriyi (7 kez), spesifik ürünü (Q-Suite) ve mürettebatın disiplinini (obsessive detail) birleştirerek profesyonel bir duruş sergiler.

**STAR Formatı Uygulaması**
*   **Situation:** Qatar Airways’in Skytrax’te 7. kez dünya birincisi olması.
*   **Task:** Bu prestijli unvanın getirdiği yüksek yolcu beklentisini yönetmek.
*   **Action:** Her uçuşta **Safety** ve **Service** protokollerine milimetrik uyum sağlamak, üniforma ve grooming standartlarından ödün vermemek.
*   **Result:** Yolcu memnuniyetini sürdürerek havayolunun bu unvanı korumasına ve global liderliğini pekiştirmesine katkıda bulunmak.

**Havayolu Uyarlama**
*   **Qatar Airways:** 7 kez kazanma vurgusu, **Q-Suite**, detaylara aşırı odaklanma ve FIFA 2022 partnerliği ön plandadır.
*   **Emirates:** "Fly Better" mottosu, A380 onboard lounge ve global network genişliği vurgulanır.
*   **Turkish Airlines:** "Best Airline in Europe" vurgusu, Türk misafirperverliği ve uçan aşçı (Flying Chef) konseptiyle gastronomi başarısı öne çıkarılır.

**Tipik Takip Soruları**
1. "Eğer bir yolcu servisimizin 'World's Best' standartlarında olmadığını söylerse ne yaparsınız?"
2. "Q-Suite hizmetini diğer Business Class ürünlerinden ayıran en temel özellik nedir?"
3. "Bu yüksek standartlar altında çalışmanın yaratacağı stresle nasıl başa çıkarsınız?"`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi**
HR uzmanları bu soruyla adayda "Hospitality Mindset" ve "Resourcefulness" (elindeki kısıtlı imkanla çözüm üretme) yeteneklerini ölçer. Özellikle Qatar Airways gibi beş yıldızlı havayollarında, "hayır" cevabı bir seçenek değildir. Uzmanlar; adayın stres altında panikleyip paniklemediğini, **First Class** standartlarındaki detaycılığını ve VVIP yolculara karşı sergilediği diplomatik yaklaşımı analiz eder. Ölçülen temel nitelikler: İnisiyatif alma, yaratıcılık ve marka sadakatidir.

**Bu aşamada neden sorulur**
Bu soru genellikle mülakatın son aşaması olan birebir görüşmede (Final Interview) sorulur. Adayın teknik bilgisinden ziyade, havayolunun premium marka imajını en zorlu senaryolarda bile nasıl koruyacağını görmek isterler. Özellikle Orta Doğulu taşıyıcılar için "kişiselleştirilmiş hizmet" (bespoke service) bir zorunluluktur; bu yüzden adayın bu kültürel beklentiye uyumu test edilir.

**3 seviyeli cevap örneği**
- **Zayıf**: "Yolcuya üzgün olduğumu, menü dışı bir yemeğimiz olmadığını ve sadece mevcut seçenekleri sunabileceğimi söylerim." → **Kötü çünkü**: "Hayır" diyerek hizmeti keser, çözüm odaklı değildir ve VVIP beklentisini karşılamaz.
- **Orta**: "Galley'i kontrol ederim, eğer benzer malzemeler varsa şefe veya Purser'a danışarak bir şeyler hazırlamaya çalışırım." → **İyi ama eksik**: Yaklaşım doğru ancak sunum ve yolcuya hissettirilen "özel olma" duygusu eksik kalmıştır.
- **Güçlü**: "Öncelikle talebi büyük bir memnuniyetle karşılarım. **Galley** stoğunu hızla analiz edip, mevcut premium malzemeleri (örneğin **Caviar** veya özel mezeler) yaratıcı bir şekilde kombine ederek 'şefe özel' bir tabak hazırlarım. Bu süreçte **Cabin Senior** veya **Purser**'ı bilgilendiririm. Eğer imkansız bir talepse, yolcuya en yakın alternatifi en şık **plating** ile sunarak kendisini özel hissetmesini sağlarım." → **Bu cevap işe alır**: Çözüm odaklıdır, hiyerarşiye saygılıdır ve lüks hizmet vizyonunu yansıtır.

**STAR formatı uygulaması**
- **Situation**: Bir kraliyet ailesi üyesinin menü dışı yemek talep etmesi.
- **Task**: Kısıtlı **galley** imkanlarıyla yolcunun beklentisini aşan bir çözüm üretmek.
- **Action**: Mevcut malzemeleri listeleme, yaratıcı bir **mix-and-match** yapma, ekip içi koordinasyonu sağlama ve sunumu kişiselleştirme.
- **Result**: Yolcu memnuniyetinin sağlanması, şikayetin önlenmesi ve havayolunun "beş yıldızlı" imajının korunması.

**Havayolu uyarlama**
- **Qatar Airways**: "Dine-on-Demand" konseptine vurgu yaparak, yolcunun istediği her an, istediği kombinasyonu yapabileceği belirtilmelidir.
- **Emirates**: "Fly Better" mottosuyla, çok uluslu mutfak bilgisini kullanarak yaratıcı bir çözüm sunulacağı vurgulanmalıdır.
- **THY**: "Turkish Hospitality" ve **Flying Chef** (varsa) ile iş birliği yaparak geleneksel misafirperverliğin en üst düzeyde sergileneceği ifade edilmelidir.

**Tipik takip soruları**
- Peki, diğer yolcular da aynı şeyi talep ederse ve stok tamamen biterse ne yaparsın?
- Hazırladığın yemeği yolcu beğenmezse **service recovery** planın nedir?
- Bu durumu raporuna (voyage report) nasıl yansıtırsın?`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi**
HR uzmanları bu soruyla adayın markaya olan bağlılığını ve hazırlık seviyesini ölçer. Sadece bir işe değil, Etihad’ın temsil ettiği "Abu Dhabi" ruhuna ve vizyonuna ne kadar hakim olduğunuzu görmek isterler. Bu soruyla şu 4 nitelik test edilir: **Brand Awareness** (marka farkındalığı), **Cultural Fit** (kültürel uyum), **Attention to Detail** (detaylara verilen önem) ve **Service Mindset** (hizmet odaklılık). Etihad, misafirlerini sadece birer yolcu değil, evine gelen birer "Guest" olarak görür.

**Bu aşamada neden sorulur**
Genellikle mülakatın orta kısmında, adayın kişisel özelliklerinden kurumsal yetkinliklere geçiş yapıldığı noktada sorulur. Adayın "herhangi bir havayolu" yerine neden "özellikle Etihad"ı seçtiğini kanıtlaması beklenen kritik bir eşiktir. Şirketin stratejik hamlelerini (rebranding süreçleri gibi) takip edip etmediğinizi anlamak için sorulur.

**3 seviyeli cevap örneği**
*   **Zayıf**: "Etihad misafirlerine çok iyi davranır ve lüks bir hizmet sunar. Uçakları çok moderndir ve herkesi mutlu etmeye çalışırlar." → **Neden kötü?** Çok genel, her havayolu için söylenebilir ve Etihad’a özgü "Choose Well" gibi spesifik felsefelerden yoksun.
*   **Orta**: "Etihad'ın felsefesi 'Choose Well' üzerine kuruludur. Yolculara kendi yolculuklarını tasarlama şansı verirler. Ayrıca The Residence gibi çok lüks sınıfları vardır ve Arap misafirperverliğini yansıtırlar." → **Neden iyi ama eksik?** Temel kavramları biliyor ancak misafir yolculuğunun (Guest Journey) segmentlerine ve felsefenin derinliğine inmiyor.
*   **Güçlü**: "Etihad’ın felsefesi, geleneksel Arap misafirperverliğini modern ve inovatif bir yaklaşımla birleştiren 'Choose Well' mottosuna dayanır. Bu felsefe, misafiri yolculuğun merkezine koyarak onlara pre-flight, in-flight ve post-flight aşamalarında kişiselleştirilmiş seçenekler sunar. Sektörde devrim yaratan **The Residence** ve **First Apartment** konseptleri, bu 'bespoke' (kişiye özel) hizmet anlayışının zirvesidir. Amaç, misafire sadece bir ulaşım değil, her detayını kendi belirlediği bir deneyim sunmaktır." → **Neden bu cevap işe alır?** Marka jargonuna hakim, somut örnekler veriyor ve süreci bir bütün olarak ele alıyor.

**STAR formatı uygulaması**
*   **Situation**: Yoğun bir uçuşta, standart hizmetten memnun olmayan bir misafirle karşılaştığınızı düşünün.
*   **Task**: Misafire Etihad’ın "Choose Well" felsefesini hissettirmek ve deneyimini iyileştirmek.
*   **Action**: Misafirin tercihlerini dinleyerek (örneğin yemek saati veya dinlenme tercihi) ona sunulan opsiyonları özelleştirmek.
*   **Result**: Misafirin markaya olan sadakatinin artması ve uçaktan "değer gördüğünü" hissederek ayrılması.

**Havayolu uyarlama**
Etihad’ın "Choose Well" felsefesi, Emirates’in "Fly Better" (ölçek ve görkem odaklı) veya Qatar Airways’in "Going Places Together" (hizmet mükemmeliyeti odaklı) vizyonlarından farklı olarak **kişiselleştirme ve seçme özgürlüğüne** odaklanır. THY’de "Turkish Hospitality" ve yemek kalitesi vurgulanırken, Etihad’da "modern lüks ve butik hizmet" ön plandadır. Etihad, misafire "kontrol sende" mesajı verir.

**Tipik takip soruları**
*   "Choose Well" felsefesini uçak içinde (in-flight) bir örnekle nasıl uygularsın?
*   Sence Etihad misafirperverliğini diğer Körfez taşıyıcılarından ayıran en büyük fark nedir?
*   Bir misafir sunduğumuz seçeneklerden (choices) memnun kalmazsa yaklaşımın ne olur?`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi**
HR uzmanları bu soruyla adayda öncelikle **Safety First** (önce emniyet) bilincini ve **Situational Awareness** (durumsal farkındalık) yetisini ölçer. Sadece kokuya dayanarak yargıya varmak yerine, adayın soğukkanlılığını koruyup korumadığına, ekip hiyerarşisine (**Chain of Command**) saygısına ve yasal regülasyonlara (EASA/FAA) olan hakimiyetine bakılır. Burada aranan 4 temel nitelik; profesyonel iletişim, gözlem yeteneği, ekip çalışması ve risk yönetimidir.

**Bu aşamada neden sorulur**
Bu soru genellikle mülakatın orta kısmında, adayın teknik bilgisinden ziyade operasyonel stres altındaki karar verme mekanizmasını anlamak için sorulur. Havayolu, adayın bireysel inisiyatif alıp kaosa mı yol açacağını, yoksa yerleşik prosedürleri (**SOPs**) takip ederek uçuş emniyetini mi koruyacağını görmek ister.

**3 seviyeli cevap örneği**

*   **Zayıf**: "Yolcunun yanına gider ve çok alkollü olduğu için uçağa binemeyeceğini söylerim. Diğer yolcuların rahatsız olmasını istemem."
    *   *Neden kötü?*: Kabin memuru tek başına boarding'i durdurma yetkisine sahip değildir ve yolcuyla gereksiz polemiğe girerek durumu tırmandırır (**escalation**).
*   **Orta**: "Durumu hemen Purser’a (Kabin Amiri) bildiririm. Yolcuyu gözlemlemeye devam ederim. Eğer sarhoşluğu uçağın güvenliğini tehlikeye atacak gibiyse uçağa alınmamasını sağlarım."
    *   *Neden iyi ama eksik?*: Prosedür doğru ancak "uçağa alınmamasını sağlarım" ifadesi yetki aşımıdır; son karar Kaptan Pilot’a aittir. Ayrıca regülasyon atfı eksiktir.
*   **Güçlü**: "Güçlü bir alkol kokusu aldığımda, ön yargılı davranmadan yolcuyu takibe alırım. Konuşmasında bozukluk (**slurred speech**) veya denge kaybı olup olmadığını gözlemlerim. Durumu vakit kaybetmeden **discreet** (gizli) bir şekilde Purser'a rapor ederim. **EASA Part-CAT** kuralları gereği, uçuş emniyetini tehlikeye atabilecek derecede intoksike olmuş yolcuların reddedilmesi gerektiğini bilerek, nihai kararı Kaptan Pilot'un vermesi için gerekli bilgileri aktarırım. Amacım süreci yolcuyu rencide etmeden ve operasyonu aksatmadan yönetmektir."
    *   *Neden bu cevap işe alır?*: Hiyerarşiye saygılıdır, gözlem odaklıdır ve yasal dayanak (EASA) sunar.

**STAR formatı uygulaması**
*   **Situation**: Boarding esnasında bir yolcudan ağır alkol kokusu gelmesi.
*   **Task**: Yolcunun uçuş emniyetine (**Flight Safety**) tehdit oluşturup oluşturmadığını belirlemek ve prosedürü işletmek.
*   **Action**: Purser’ı bilgilendirmek, yolcuyla kısa bir diyalog kurarak (boarding pass kontrolü gibi) bilişsel durumunu test etmek ve bulguları raporlamak.
*   **Result**: Kaptan kararıyla yolcunun uçuşa kabulü veya reddi; böylece olası bir **unruly passenger** vakasının havada yaşanmasının önüne geçilmesi.

**Havayolu uyarlama**
Lufthansa veya Austrian gibi Cermen kökenli havayollarında **SOP** ve disiplin vurgusu ön plandadır; "prosedür neyse o uygulanır" mesajı verilmelidir. British Airways veya Air France gibi bayrak taşıyıcılarda ise bu durumun markanın prestijine ve diğer yolcuların konforuna etkisi, yani **Customer Experience** dengesi de cevaba eklenmelidir. SAS veya Finnair gibi İskandinav şirketlerinde ise "eşitlik ve nezaket" çerçevesinde yolcuya yaklaşım vurgulanmalıdır.

**Tipik takip soruları**
*   "Kaptan yolcunun uçabileceğini söylerse ama siz hala endişeliyseniz ne yaparsınız?"
*   "Yolcu bu duruma itiraz edip agresifleşirse (verbal abuse) tepkiniz ne olur?"
*   "Alkol kokusu dışında başka hangi belirtiler uçağa kabul için engel teşkil eder?"`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi**
HR uzmanı bu soruyla adayda doğrudan "kurumsal aidiyet" ve "hazırlık seviyesi" ölçümü yapar. Havayolu kültürü, sadece uçuş operasyonlarından ibaret değildir; bir mirası temsil eder. Bu soru aracılığıyla adayda şu 3-4 nitelik aranır: **Attention to detail** (detaylara verilen önem), **brand loyalty** (marka sadakati), **cultural awareness** (kültürel farkındalık) ve profesyonel merak. Şirketin tarihine duyulan saygı, adayın uzun vadeli çalışma isteğinin bir göstergesi olarak kabul edilir.

**Bu aşamada neden sorulur**
Genellikle mülakatın orta kısmında, "Neden Lufthansa?" sorusunun hemen ardından veya "Company Knowledge" bölümünde sorulur. Adayın teknik bilgisinden ziyade, şirketin vizyonunu ve sembolize ettiği değerleri ne kadar içselleştirdiğini anlamak için stratejik bir geçiş noktasıdır. Sadece bir "kuş" logosu görüp görmediğinizi, yoksa arkasındaki yüzyıllık **heritage** (miras) yapısını anlayıp anlamadığınızı test eder.

**3 seviyeli cevap örneği**

*   **Zayıf**: "Lufthansa logosu bir kuştur, uçmayı ve gökyüzünü temsil eder. Çok eski bir logodur."
    *   *Neden kötü?*: Çok yüzeyseldir, hiçbir spesifik bilgi veya araştırma içermez.
*   **Orta**: "Logodaki hayvan bir turna kuşudur (crane). 1918 yılından beri kullanılmaktadır. Alman mühendisliğini ve havacılıktaki zarafeti simgeler."
    *   *Neden iyi ama eksik?*: Teknik bilgiler doğrudur ancak adayın bu değerlerle olan kişisel bağı veya logonun güncel **Lufthansa Group** yapısındaki yeri eksiktir.
*   **Güçlü**: "Lufthansa'nın ikonik 'Kranich' (Turna) logosu, 1918 yılında Otto Firle tarafından tasarlanmıştır ve dünyadaki en eski kurumsal logolardan biridir. Bu sembol sadece uçuşun zarafetini değil, aynı zamanda Alman mühendisliğinin temel taşları olan **reliability** (güvenilirlik) ve **technical perfection** (teknik mükemmellik) ilkelerini temsil eder. Turna kuşu, uzun mesafe uçuş yeteneği ve dayanıklılığı ile Lufthansa'nın global erişimini ve emniyet standartlarını simgeler. Bugün bu logo, tüm Lufthansa Group iştiraklerinde ortak bir kalite mührü olarak kabul edilir."
    *   *Neden bu cevap işe alır?*: Tarihsel derinlik, tasarımcı ismi, kurumsal değerler ve operasyonel karşılıklar (dayanıklılık/emniyet) mükemmel bir şekilde harmanlanmıştır.

**STAR formatı uygulaması**
Bu soruya STAR yapısıyla yaklaşırken; **Situation** (Lufthansa mülakatına hazırlanırken şirketin kimliğini araştırdım), **Task** (Markanın neden bu kadar prestijli olduğunu anlamam gerekiyordu), **Action** (1918'den bu yana değişmeyen 'Kranich' sembolünün anlamını ve Otto Firle'nin tasarım felsefesini inceledim), **Result** (Bu araştırma sayesinde, üniformamda taşıyacağım logonun sadece bir görsel değil, bir emniyet ve profesyonellik sözü olduğunu kavradım) şeklinde bir yapı kurabilirsiniz.

**Havayolu uyarlama**
Her havayolunun logosu farklı bir kültürel kod taşır. Örneğin; **Emirates** hat sanatı ile lüks ve Arap mirasını vurgularken, **Turkish Airlines** "yaban kazı" (wild goose) ile kıtalararası uzun menzilli uçuş kapasitesini ve rotasındaki kararlılığı simgeler. Lufthansa'da ise vurgu her zaman **heritage** ve **engineering excellence** (mühendislik mükemmelliği) üzerindedir. Cevabınızı verirken bu "disiplinli ve köklü yapı" vurgusunu korumalısınız.

**Tipik takip soruları**
*   Lufthansa'nın ana renkleri (Blue and Yellow) neyi temsil eder?
*   "Say Yes to the World" sloganımız hakkında ne düşünüyorsunuz?
*   Lufthansa Group bünyesindeki diğer havayollarından üçünü sayabilir misiniz?`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi**
HR uzmanı bu soruyla adayın sadece teknik becerilerini değil, Air France markasının "Ambassador" (elçi) rolünü ne kadar içselleştirdiğini ölçer. Havayolu, "France is in the air" mottosuyla kendini sadece bir taşıyıcı değil, Fransız kültürünün küresel bir temsilcisi olarak konumlandırır. HR burada; **kültürel farkındalık**, **estetik duyarlılık**, **detaycılık** ve **marka sadakati** niteliklerini arar. Adayın lüks segmentteki hizmet standartlarını (high-end service) kavrayıp kavramadığı sorgulanır.

**Bu aşamada neden sorulur**
Mülakatın genellikle orta bölümünde, teknik yeterlilikler (safety, security) onaylandıktan sonra "Kültürel Uyum" (Cultural Fit) aşamasında sorulur. Adayın şirketin ruhunu anlayıp anlamadığını görmek ve stres altında yabancı dilde (Fransızca) sofistike bir konuyu ne kadar akıcı anlatabildiğini test etmek amaçlanır.

**3 seviyeli cevap örneği**

*   **Zayıf**: Air France a un très bon service. La nourriture française est délicieuse et les uniformes sont très beaux. J'aime le style français.
    *   *Neden kötü?*: Çok yüzeysel, "Art de vivre" (yaşam sanatı) felsefesine dair hiçbir derinlik içermiyor ve çocuksu bir dil yapısına sahip.
*   **Orta**: Pour moi, le service d'Air France représente la culture française. On offre du bon vin, du fromage ve une ambiance élégante aux passagers. C'est une question de politesse et de qualité.
    *   *Neden iyi ama eksik?*: Doğru unsurlara değiniyor ancak "La Première" gibi premium vurgular ve markanın lüks felsefesi eksik kalıyor.
*   **Güçlü**: L'art de vivre à la française chez Air France est une véritable signature qui transforme le voyage en une expérience sensorielle. Cela se manifeste par une attention méticuleuse aux détails : de la haute gastronomie signée par des chefs étoilés à la sélection rigoureuse de vins et champagnes. En cabine **La Première**, nous offrons un service "haute couture" où l'élégance, la discrétion et le raffinement créent une atmosphère unique, typiquement parisienne, même à 30 000 pieds.
    *   *Neden işe alır?*: Fransızca terminoloji kusursuzdur; "haute couture", "raffinement" ve "chefs étoilés" gibi anahtar kelimelerle markanın lüks DNA'sına tam uyum sağlar.

**STAR formatı uygulaması**
*   **Situation**: Kabinde Fransız kültürüne mesafeli bir yolcuyla karşılaşma.
*   **Task**: Yolcuya Air France’ın sunduğu "Art de vivre" deneyimini tanıtmak.
*   **Action**: Yolcuya sunulan şarabın bağ bozumu (vintage) hikayesini anlatmak ve ikram edilen menünün hangi Michelin yıldızlı şef tarafından tasarlandığını belirtmek.
*   **Result**: Yolcunun uçuşu sadece bir ulaşım değil, kültürel bir keşif olarak görmesi ve memnuniyetle ayrılması.

**Havayolu uyarlama**
Bu soru Air France özelinde "Zarafet" (Elegance) odaklıdır. Eğer bu soru **Emirates** için sorulsaydı "Global lüks ve görkem", **Qatar Airways** için "5 yıldızlı kusursuz disiplin", **Turkish Airlines** için ise "Geleneksel misafirperverlik (Turkish Hospitality) ve zengin mutfak mirası" vurgulanmalıdır. Air France adayının odağı her zaman "Sofistike bir yaşam tarzı" olmalıdır.

**Tipik takip soruları**
*   Comment définiriez-vous l'élégance en un mot? (Zarafeti tek kelimeyle nasıl tanımlarsınız?)
*   Si un passager n'aime pas la cuisine française, que feriez-vous? (Bir yolcu Fransız mutfağını sevmezse ne yaparsınız?)
*   Quel est votre monument ou aspect préféré de la culture française? (Fransız kültürünün en sevdiğiniz yönü nedir?)`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi**
HR uzmanı bu soruyla adayda sadece teknik yeterlilik değil, KLM’in "Blue Heart" felsefesine olan duygusal uyumunu ölçer. Temel amaç, adayın bir yolcunun veya çalışma arkadaşının dile getirmediği ihtiyaçlarını sezip sezmediğini (anticipating needs) anlamaktır. Burada aranan 3-4 temel nitelik: **Empathy (Empati)**, **Proactivity (Proaktiflik)**, **Situational Awareness (Durumsal Farkındalık)** ve **Cultural Fit (Kültürel Uyumluluk)**. HR, "kuralları uygulayan" birinden ziyade, "insani dokunuş" katan bir profesyonel arar.

**Bu aşamada neden sorulur**
Bu soru genellikle mülakatın orta kısmında, adayın teknik geçmişi (CV check) tamamlandıktan sonra "Behavioral" (Davranışsal) aşamada sorulur. KLM gibi köklü havayolları için teknik beceri bir standarttır; farkı yaratan ise kurum kültürüne uyumdur. Adayın stres altındayken veya rutin dışı bir durumda "Care" değerini nasıl önceliklendirdiğini görmek için bu nokta seçilir.

**3 seviyeli cevap örneği**

*   **Zayıf:** "Bir keresinde uçuşta çok ağlayan bir çocuk vardı. Yanına gidip ona oyuncak verdim ve sakinleşmesini söyledim. Sonra annesi teşekkür etti. İnsanlara yardım etmeyi seviyorum."
    *   *Neden kötü?* STAR formatı yok, aksiyon çok yüzeysel ve "Care" değerinin derinliğini (öngörü ve çaba) yansıtmıyor.
*   **Orta:** "Uçuşu geciken bir yolcumuz bağlantılı uçağını kaçıracağı için çok gergindi. Ona sakin olmasını, yer hizmetlerinin (ground staff) yardımcı olacağını söyledim. Gidip müdürümle konuştum ve öncelikli inmesi için yardımcı oldum."
    *   *Neden iyi ama eksik?* Görev odaklı bir yaklaşım var ancak KLM'in beklediği "Going the extra mile" (ekstra çaba) ve duygusal bağ eksik.
*   **Güçlü:** "KLM ile seyahat eden yaşlı bir çiftin, bagajlarının gecikmesi nedeniyle ilaçlarına ulaşamadığını fark ettim. Sadece 'kayıp eşya' formunu doldurmalarına yardım etmekle kalmadım; Hollanda direktliğiyle durumu netçe açıkladım ve sıcak bir empatiyle onlara kalacakları otele kadar eşlik edecek bir transfer organize ettim. Ayrıca varış noktalarındaki eczaneyle iletişime geçip reçetelerinin transferi için köprü kurdum. Bu, KLM'in 'Care' anlayışındaki hem dürüstlük hem de derin sahiplenmeyi yansıtıyordu."
    *   *Neden işe alır?* Somut bir kriz yönetimi, inisiyatif alma ve KLM'in "Warm & Direct" kültürüne tam uyum var.

**STAR formatı uygulaması**
Bu soruda STAR yapısı hayati önem taşır:
*   **Situation (Durum):** Spesifik bir olay seçin (Örn: British Airways 2017 IT çöküşü gibi büyük bir operasyonel kriz veya bireysel bir yolcu sorunu).
*   **Task (Görev):** Çözmeniz gereken problem neydi? "Care" göstermeniz gereken o kritik anı tanımlayın.
*   **Action (Aksiyon):** KLM değerlerine uygun olarak ne yaptınız? (Anticipating, listening, taking ownership).
*   **Result (Sonuç):** Yolcunun geri bildirimi veya operasyona katkınız ne oldu?

**Havayolu uyarlama**
KLM için cevap verirken **Dutch Directness** (dürüstlük) ve **Warmth** (sıcaklık) dengesini kurmalısınız. Emirates için bu soru "Luxury & Excellence" odaklı, Qatar Airways için "Attention to Detail", THY için ise "Traditional Hospitality" (Misafirperverlik) vurgusuyla süslenmelidir. KLM'de ise "Ben bir çözüm ortağıyım ve insan olarak yanındayım" mesajı verilmelidir.

**Tipik takip soruları**
*   "Bu durumun operasyonel verimliliğe (on-time performance) etkisi ne oldu?"
*   "Eğer prosedürler bu yaptığınız 'Care' eylemine izin vermeseydi nasıl bir yol izlerdiniz?"
*   "Ekip arkadaşlarınız bu inisiyatifinize nasıl tepki verdi?"`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi**
HR uzmanları bu soruyla adayın "Brand Ambassadorship" (Marka Elçiliği) potansiyelini ve kurumsal aidiyet bilincini ölçer. Sadece bir iş arayıp aramadığınızı veya British Airways’in (BA) köklü mirasını gerçekten içselleştirip içselleştirmediğinizi anlamaya çalışırlar. Bu soruda şu 4 nitelik aranır: **Kurumsal farkındalık**, **detaylara verilen önem**, **hizmet odaklı zihniyet** ve **marka sadakati**. Adayın, havayolunun sadece bir taşıma aracı değil, bir "British Heritage" (İngiliz Mirası) temsilcisi olduğunu anlaması beklenir.

**Bu aşamada neden sorulur**
Genellikle mülakatın orta kısmında, "Neden British Airways?" sorusunun hemen ardından veya "Competency" (Yetkinlik) sorularına geçmeden önce sorulur. Amacı, adayın ön hazırlık yapıp yapmadığını ve şirketin "Speedbird" arması altındaki felsefeyi kavrayıp kavramadığını test ederek bir eleme filtresi oluşturmaktır. Sloganı bilmemek veya yüzeysel geçmek, ciddiyetsizlik göstergesi olarak kabul edilir.

**3 seviyeli cevap örneği**

*   **Zayıf**: "Bu slogan BA'in hem uçuş yaptığını hem de yemek servisi verdiğini anlatıyor. Müşterilere iyi davranmamız gerektiğini hatırlatıyor." → **Kötü çünkü**: Çok yüzeysel, sloganın tarihsel derinliğini ve markanın "premium" konumlandırmasını yansıtmıyor.
*   **Orta**: "To Fly. To Serve. sloganı BA armasında yer alır. Şirketin hem operasyonel mükemmelliğe hem de müşteri hizmetlerine odaklandığını gösterir. İngiliz misafirperverliğini temsil eder." → **İyi ama eksik**: Doğru bilgi ancak tutku ve somut uygulama detayları eksik.
*   **Güçlü**: "Bu motto, 2011'de yeniden canlandırılan ve BA'in Coat of Arms (Arma) üzerinde yer alan köklü bir taahhüttür. 'To Fly' kısmı teknik uzmanlığı ve emniyeti temsil ederken, 'To Serve' kısmı kabin içerisindeki 'British Hospitality' ve kişiselleştirilmiş hizmet anlayışını simgeler. Bu motto, her etkileşimde yolcuya kendisini özel hissettirmeyi, yani mirasımızı modern lüksle birleştirmeyi hedefler." → **Bu cevap işe alır**: Tarihsel referans verir, operasyonel ve hizmet dengesini kurar.

**STAR formatı uygulaması**
Bu soruda STAR tekniği, mottonun davranışa döküldüğü bir anıyla birleştirilmelidir.
*   **Situation**: Yoğun bir uzun mesafe uçuşunda (LHR-JFK), gecikme nedeniyle gergin bir yolcu grubu vardı.
*   **Task**: "To Serve" felsefesini kullanarak atmosferi yumuşatmam gerekiyordu.
*   **Action**: Her yolcuyla göz teması kurup, isimleriyle hitap ederek endişelerini dinledim ve onlara "British Afternoon Tea" ikramını bir jest olarak sundum.
*   **Result**: Yolcular kendilerini değerli hissetti ve uçuş sonunda teşekkür ederek ayrıldılar.

**Havayolu uyarlama**
BA için "Heritage ve Modernite" dengesi kritiktir. Diğer havayollarında bu yaklaşım değişir: **Emirates**'te odak "Fly Better" ile inovasyon ve ultra-lüks üzerineyken; **Qatar Airways**'te "Excellence in everything we do" ile kusursuz disiplin ön plandadır. **THY** mülakatında ise "Widen Your World" üzerinden "Turkish Hospitality" ve küresel bağlantı vurgulanmalıdır. BA mülakatında "Britishness" vurgusu her zaman merkezde olmalıdır.

**Tipik takip soruları**
*   "To Fly. To Serve." ilkesini zorlu bir yolcuyla karşılaştığınızda nasıl korursunuz?
*   Sizce "British Hospitality"yi diğerlerinden ayıran en temel özellik nedir?
*   Hizmet standartlarımızın emniyet (Safety) kurallarıyla çeliştiği bir durumda hangisine öncelik verirsiniz?`,
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
      detailedExplanationTr: `**Perspectiva de Psicología de RRHH**

Esta pregunta evalúa la preparación del candidato y su interés genuino en la aerolínea y su grupo. Un buen candidato demostrará que ha investigado, lo que indica compromiso y profesionalismo. Se buscan la diligencia, el conocimiento de la industria y la alineación con los valores de la empresa. La capacidad de proporcionar información precisa y concisa también es clave.

**¿Por qué se pregunta en esta etapa?**

Esta pregunta suele formularse al inicio o a mitad de la entrevista, después de las preguntas generales sobre la experiencia y antes de profundizar en aspectos técnicos. Se utiliza para calibrar el nivel de conocimiento del candidato sobre la estructura corporativa de la aerolínea y su posición en el mercado. Permite al entrevistador evaluar rápidamente el nivel de compromiso e interés.

**Ejemplo de Respuesta en 3 Niveles**

*   **Débil:** "No estoy seguro, creo que British Airways."
    *   *Malo porque:* Demuestra falta de investigación y conocimiento básico sobre la estructura del grupo. No ofrece ninguna información adicional ni muestra interés en profundizar.

*   **Medio:** "Iberia es parte de IAG, que también incluye British Airways y Vueling."
    *   *Bueno pero incompleto porque:* Identifica correctamente IAG y algunas de sus aerolíneas, pero omite otras aerolíneas importantes del grupo y no ofrece contexto adicional sobre el alcance de IAG.

*   **Fuerte:** "Iberia es una aerolínea clave dentro del grupo International Airlines Group (IAG). Además de Iberia, IAG también engloba a British Airways, Vueling, Aer Lingus y la marca de ocio LEVEL. Este grupo es particularmente fuerte en su red hacia Latinoamérica, lo cual es un punto estratégico para Iberia."
    *   *Esta respuesta funciona porque:* Proporciona la información precisa y completa solicitada, nombra las aerolíneas principales, identifica la entidad matriz (IAG) y añade un contexto estratégico relevante (enfoque en Latinoamérica), demostrando un conocimiento profundo y una perspectiva de negocio.

**Aplicación del Formato STAR**

Aunque esta pregunta no es una pregunta conductual directa, se puede enfocar desde una perspectiva similar. **Situación:** Estás siendo entrevistado para un puesto en Iberia. **Tarea:** Demostrar tu conocimiento sobre la estructura corporativa de Iberia y su grupo. **Acción:** Proporcionar una respuesta detallada y precisa, nombrando las aerolíneas clave de IAG y su enfoque estratégico. **Resultado:** Impressionar al entrevistador con tu preparación, profesionalismo e interés en la compañía.

**Adaptación a Aerolíneas Específicas**

Para aerolíneas como Emirates, se preguntaría sobre su propiedad (Gobierno de Dubái) y su alcance global. Para Qatar Airways, se enfocaría en su modelo de negocio como aerolínea de bandera nacional y su pertenencia a la alianza Oneworld. Para Turkish Airlines (THY), se destacaría su rol como aerolínea de bandera de Turquía, su expansión reciente y su estratégica ubicación geográfica. El conocimiento de la estructura y estrategia de cada grupo es fundamental.

**Preguntas de Seguimiento Típicas**

*   "¿Qué sinergias crees que existen entre Iberia y las otras aerolíneas de IAG?"
*   "¿Cómo crees que la red de IAG beneficia a los pasajeros de Iberia?"
*   "¿Qué sabes sobre la estrategia de IAG en el mercado latinoamericano?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın problem çözme becerisini, empati yeteneğini, iletişim stratejilerini ve kültürel duyarlılığını ölçer. HR uzmanı, bu senaryoda adayın aşağıdaki niteliklerini değerlendirir:
1.  **Problem Çözme ve Yaratıcılık:** Dil engeli gibi beklenmedik bir durumla nasıl başa çıktığı.
2.  **Empati ve Yolcu Odaklılık:** Yolcunun rahatsızlığını anlama ve ona göre hareket etme isteği.
3.  **Etkili İletişim:** Sadece sözlü değil, beden dili ve görsel materyallerle de iletişim kurabilme becerisi.
4.  **Takım Çalışması:** Diğer ekip üyelerinden yardım isteme ve işbirliği yapma eğilimi.

**Bu Aşamada Neden Sorulur**

Bu tür durumsal sorular genellikle mülakatın ortalarında veya sonlarına doğru sorulur. Adayın temel becerilerinin ve havacılıkla ilgili temel bilgilerinin değerlendirildiği ilk aşamalardan sonra, adayın gerçek dünya senaryolarına nasıl adapte olabileceğini görmek için bu tür daha karmaşık ve "zorlu" sorular gelir. Bu, adayın stres altında nasıl performans göstereceğini ve müşteri hizmetleri standartlarını nasıl uygulayacağını anlamak için önemlidir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "Japonca bilmediğim için yolcuya sadece İngilizce olarak menüyü gösterirdim ve anlamasını beklerdim. Belki tekrar tekrar söylerdim."
    *   **Neden Kötü:** Bu cevap, yolcuyu görmezden gelmekle eşdeğerdir. Dil engelini aşmak için hiçbir çaba sarf etmez, durumu daha da kötüleştirebilir ve havayolunun hizmet standartlarını kesinlikle karşılamaz. Red flag'lere doğrudan uyar.

*   **Orta Cevap:** "Japonca bilen başka bir kabin ekibi üyesi olup olmadığını sorardım. Eğer yoksa, tablet üzerindeki menüyü göstererek İngilizce olarak servis yapmaya çalışırdım."
    *   **Neden İyi Ama Eksik:** Ekip üyesinden yardım isteme fikri olumlu. Ancak sadece tablet menüsünü göstermek ve İngilizce servis denemek, dil engelini aşmak için yeterli olmayabilir. Daha fazla proaktif ve görsel/bedensel iletişim yöntemi kullanılabilir.

*   **Güçlü Cevap:** "Öncelikle gülümseyerek ve nazik bir beden diliyle yolcuya yaklaşırdım. Ardından, tabletimde önceden hazırlanmış ve temel servis seçeneklerini (örneğin, içecekler, yemekler) Japonca ve görsellerle içeren bir kart gösterirdim. Eğer bu yeterli olmazsa, diğer kabin ekibi üyelerine Japonca konuşan var mı diye sorardım. Japonca konuşan bir ekip arkadaşı bulursam, yolcunun siparişini onun yardımıyla alırdım. Eğer hiç kimse Japonca bilmiyorsa, görsel menü kartları ve basit işaretlerle servis sürecini tamamlamaya çalışırdım. Örneğin, 'water' kelimesini söylerken bir su bardağı işareti yapardım."
    *   **Neden İşe Yarar:** Bu cevap, empati, yaratıcılık ve takım çalışmasını birleştirir. Yolcuyu rahatlatmak için beden dilini kullanır, görsel ve çevrilmiş materyallerle dil engelini aşmaya çalışır ve en önemlisi, ekip içi işbirliğini devreye sokar. Bu, yolcu odaklı ve proaktif bir yaklaşımdır.

**STAR Formatı Uygulaması**

Bu soru, bir STAR (Situation, Task, Action, Result) formatı uygulaması için mükemmel bir örnektir.
*   **Situation:** Dil engeli olan bir Japon yolcuya servis vermek.
*   **Task:** Yolcuya etkili ve saygılı bir şekilde servis sunmak, dil engelini aşmak.
*   **Action:** Yukarıdaki güçlü cevapta belirtilen adımları uygulamak (beden dili, çevrilmiş kart, ekip içi yardım, görsel iletişim).
*   **Result:** Yolcunun ihtiyaçlarının karşılanması, olumlu bir yolcu deneyimi yaşanması ve havayolunun itibarının korunması.

**Havayolu Uyarlaması (Swiss)**

Swiss International Air Lines'ın "Swissiness" olarak bilinen yüksek hizmet standartları ve yolcu memnuniyeti odaklı kültürü göz önüne alındığında, bu soruya verilen cevapta "dikkate değer" ve "özenli" hizmet vurgusu yapılmalıdır. Swiss, yolcularına bireysel ilgi ve kültürel hassasiyet göstermeyi önemser. Bu nedenle, cevapta "Swiss'in misafirperverlik değerlerini yansıtacak şekilde, her yolcunun konforunu ve anlayışını önceliklendirdiğimi belirtirdim" gibi ifadeler kullanılabilir. Swiss'in genellikle çok uluslu bir kabin ekibine sahip olması, ekip içi dil desteği bulma olasılığını artırır.

**Tipik Takip Soruları**

1.  Bu durumu daha da zorlaştıran ne olabilirdi ve bu durumda ne yapardınız?
2.  Eğer yolcu acil bir durum bildiriyorsa ve dil engeli varsa, bu acil durumu nasıl yönetirdiniz?
3.  Kültürlerarası iletişimde karşılaştığınız başka zorluklar oldu mu ve bunları nasıl aştınız?`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi**
HR uzmanları bu soruyla adayda "kültürel uyum" (cultural fit) ve "marka sadakati" ararlar. Virgin Atlantic, havacılıkta bir "challenger brand" (meydan okuyan marka) olarak konumlandığı için adayın statükoyu sorgulayan, enerjik ve kalıpların dışına çıkabilen bir kişiliğe sahip olup olmadığını ölçer. Aranan 3-4 temel nitelik şunlardır: **Orijinallik (Authenticity), Duygusal Zeka (EQ), Marka Elçiliği Potansiyeli ve Esneklik.**

**Bu aşamada neden sorulur**
Bu soru genellikle mülakatın orta-son evresinde, teknik yeterlilikler (technical competencies) kanıtlandıktan sonra sorulur. HR, adayın sadece bir "iş" mi aradığını yoksa Virgin'in kendine has "Red Hot" hizmet anlayışını benimseyip benimsemediğini anlamak ister. British Airways (BA) gibi bir devle kıyaslama yaparak adayın profesyonel olgunluğunu ve rakip analizi yeteneğini test ederler.

**3 seviyeli cevap örneği**
*   **Zayıf:** "BA çok sıkıcı ve geleneksel geliyor, Virgin ise daha eğlenceli ve uçakları daha güzel. Kırmızı üniformayı daha çok seviyorum." → *Kötü çünkü:* Profesyonellikten uzak, yüzeysel ve rakibi (BA) temelsiz bir şekilde kötülüyor.
*   **Orta:** "Virgin Atlantic’in yenilikçi vizyonunu ve Richard Branson’ın liderliğini beğeniyorum. BA daha çok kurumsal bir yapıya sahipken, Virgin daha dinamik ve çalışan odaklı görünüyor." → *İyi ama eksik:* Doğru noktalara değiniyor ancak kişisel bir bağ veya somut bir örnek sunmuyor.
*   **Güçlü:** "BA, İngiliz mirasını temsil eden harika bir *Legacy Carrier* olsa da, benim çalışma karakterim Virgin'in 'Personality over Process' felsefesiyle daha çok örtüşüyor. Virgin'in katı kurallar yerine çalışanlarına kendi özgün kişiliklerini yansıtma alanı tanıması, *Customer Experience* (Müşteri Deneyimi) tarafında daha samimi bir bağ kurmamı sağlıyor. Branson'ın 'çalışanlarınıza iyi bakın, onlar da müşterilerinize baksın' yaklaşımı, benim havacılıktaki vizyonumla birebir eşleşiyor." → *Bu cevap işe alır:* Saygılı, stratejik ve marka değerlerine derinlemesine hakim.

**STAR formatı uygulaması**
**Situation:** Eski işimde katı bir protokol nedeniyle bir yolcunun özel talebini karşılayamamıştım. 
**Task:** Şirket imajını korurken yolcuyu mutlu etmem gerekiyordu. 
**Action:** İnisiyatif alarak protokole kendi kişisel dokunuşumu ekledim ve sorunu Virgin’in "flair" (yetenek/tarz) anlayışına uygun çözdüm. 
**Result:** Yolcu çok memnun kaldı. Virgin’i seçme nedenim, bu tarz yaratıcı çözümlerin burada bir istisna değil, kültürün bir parçası olmasıdır.

**Havayolu uyarlama**
Bu soru farklı havayolları için şu vurgularla değiştirilmelidir:
*   **Emirates:** "Global Hub" gücü ve kozmopolit yapı vurgulanmalı.
*   **Qatar Airways:** "Excellence" ve "World's Best" (Skytrax) takıntısı, disiplin ön plana çıkarılmalı.
*   **Turkish Airlines:** "Hospitality" (misafirperverlik) ve dünyanın en çok noktasına uçan "Network" gücü vurgulanmalı.

**Tipik takip soruları**
*   "Eğer BA size %20 daha fazla maaş teklif etseydi kararınız değişir miydi?"
*   "Virgin ruhunu (Red Hot spirit) bir yolcuya 30 saniyede nasıl yansıtırsınız?"
*   "Size göre Virgin'in en büyük zayıflığı nedir?"`,
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
      detailedExplanationTr: `**HR psikoloji perspektifi** (60-80 kelime):
İK uzmanı bu soruyla adayın "LCC Mindset" (Düşük Maliyetli Taşıyıcı Zihniyeti) olup olmadığını ve şirketin ticari modeline sadakatini ölçer. Aranan temel nitelikler; **operasyonel verimlilik (efficiency)** bilinci, yüksek tempoda çalışabilme kapasitesi, multitasking yeteneği ve şirketin kârlılık hedeflerine duyulan saygıdır. Adayın, LCC modelini bir "mecburiyet" değil, bilinçli bir kariyer tercihi olarak görüp görmediği test edilir.

**Bu aşamada neden sorulur** (40-60 kelime):
Genellikle mülakatın "Kişisel Motivasyon" bölümünde, teknik soruların hemen ardından sorulur. Adayın teknik olarak yetkin olduğu anlaşıldıktan sonra, şirketin yoğun operasyonel ritmine (örneğin günde 4-6 bacak uçuş) ayak uydurup uyduramayacağını ve uzun vadeli kalıcılığını anlamak için bu noktada sorulur.

**3 seviyeli cevap örneği** (120-180 kelime):

*   **Zayıf**: "Aslında büyük havayollarını da seviyorum ama sizin iş alımınız daha hızlıydı. Burada çok uçup hemen saat doldurabilirim." → **Kötü çünkü**: Şirketi sadece bir basamak (stepping stone) olarak gördüğünü açıkça belli eder ve kurumsal aidiyet hissi vermez.
*   **Orta**: "LCC modelleri çok daha dinamik. Uçaklarınız yeni ve rotalarınız çok çeşitli. Bu yüzden LCC'de çalışmak benim için daha heyecan verici." → **İyi ama eksik**: Genel ifadeler içeriyor; LCC'nin ticari mantığına ve operasyonel zorluklarına (turnaround süreçleri gibi) değinmiyor.
*   **Güçlü**: "Havacılığın demokratikleşmesine katkı sağlayan LCC modelinin verimlilik odaklı yapısı benim karakterimle örtüşüyor. **Point-to-point** operasyonlardaki yüksek **aircraft utilization** ve 25-30 dakikalık **turnaround** sürelerinin getirdiği disiplin, bir pilot olarak beni zinde tutuyor. Ayrıca, akşam evde olma imkanı sunan **roster** yapısı ve hızlı **command upgrade** fırsatları, kariyer hedeflerimle tam bir uyum içinde." → **Bu cevap işe alır**: Hem şirketin iş modelini (maliyet/verimlilik) bildiğini hem de kişisel avantajlarını rasyonel şekilde ifade eder.

**STAR formatı uygulaması** (50-80 kelime):
*   **Situation**: Önceki uç`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın stres altında çalışma yeteneğini, problem çözme becerilerini, takım çalışmasına yatkınlığını ve operasyonel verimliliğe olan bağlılığını ölçmeyi amaçlar. HR uzmanı, adayın baskı altında sakin kalıp kalmadığını, proaktif olup olmadığını, görev bilincini ve havayolunun hız odaklı kültürüne ne kadar uyum sağlayabileceğini değerlendirir. Adayın "turnaround" zamanına karşı tutumu ve bu süreci nasıl iyileştirebileceğine dair somut önerileri de önemlidir.

**Bu Aşamada Neden Sorulur**

Bu soru genellikle mülakatın ortalarında, adayın temel yetkinlikleri ve motivasyonu hakkında bir fikir edinildikten sonra sorulur. Havayolunun operasyonel verimliliğinin ne kadar kritik olduğunun altını çizmek ve adayın bu kritik süreçlere ne kadar hakim olduğunu anlamak için idealdir. Adayın, şirketin "turnaround" sürelerini iyileştirmeye yönelik potansiyel katkısını görmek hedeflenir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf**: "25 dakika çok kısa bir süre. Yolcuların uçağa binmesi ve inmesi bu kadar sürede zor olur. Ben elimden geleni yaparım ama yetiştiremeyiz." → Bu cevap, adayın zorluktan kaçındığını, şikayetçi olduğunu ve operasyonel gerçeklere uyum sağlayamadığını gösterir. Çözüm odaklı değil, sorun odaklıdır.
*   **Orta**: "Turnaround süresini kısaltmak için herkesin hızlı çalışması gerekir. Ben de yolcuların güvenli bir şekilde binmesini sağlamak için elimden geleni yaparım. Temizlik ekibiyle de koordineli çalışırım." → Bu cevap, temel görevlerin farkında olunduğunu gösterir ancak proaktiflik ve spesifik katkıdan yoksundur. "Herkesin hızlı çalışması gerekir" demek yerine kendi rolünü somutlaştırmalıdır.
*   **Güçlü**: "25 dakikalık turnaround, Low-Cost Carrier (LCC) operasyonlarının can damarıdır. Bu süreyi optimize etmek için ilk olarak, uçağın kapıları açılmadan hemen önce, kabin ekibi olarak **boarding hazırlıklarını** tamamlarım. Bu, özellikle **onboard sales** ve **lavabo kontrolü** gibi zaman alıcı olabilecek görevlerin önceden yapılmasını içerir. **Yolcu indirme ve binme süreçlerinin paralel yürütülmesi** kritik olduğundan, yolcuların uçağa girişini hızlandırmak için **giriş kartlarını (boarding passes) etkin bir şekilde kontrol eder**, gereksiz gecikmeleri önlerim. **Kabin temizlik ekibiyle önceden koordine olarak**, temizliğin en hızlı şekilde tamamlanmasını sağlarım. **Görev bölümünün net olması** ve her ekibin kendi sorumluluk alanında proaktif olması, bu süreyi verimli kullanmamızı sağlar. Örneğin, güvenlik anonslarını yaparken, bir yandan da **bagajların yerleştirilmesine yardımcı olacak ekip üyeleriyle telsizden iletişimde kalırım**." → Bu cevap, sürece hakimiyeti, proaktifliği, somut eylem adımlarını ve takım çalışmasına vurguyu net bir şekilde ortaya koyar.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı şu şekilde uygulanabilir: **Situation**: "LCC'lerde 25 dakikalık bir turnaround süresiyle karşı karşıyayız." **Task**: "Bu sürede yolcu indirme, temizlik, yakıt ikmali, catering ve yolcu binme işlemlerini hatasız ve güvenli bir şekilde tamamlamak." **Action**: (Yukarıdaki güçlü cevapta belirtilen somut adımlar) "Boarding hazırlıklarını önceden tamamlama, yolcu girişini hızlandırma, temizlik ekibiyle koordinasyon, görev bölümünün netliği..." **Result**: "Turnaround süresini optimize ederek, sonraki uçuşun zamanında kalkmasını sağlamak ve havayolunun verimliliğine katkıda bulunmak."

**Havayolu Uyarlama**

**Ryanair** ve **Wizz Air** gibi havayolları için "turnaround" süresi operasyonel rekabet avantajının temelidir. Bu nedenle, bu havayollarına başvururken, "hız ve verimlilik" kültürüne ne kadar uyum sağladığınızı, maliyet bilincinizi ve proaktif problem çözme yeteneğinizi vurgulamanız önemlidir. **Pegasus** için de benzer bir vurgu yapılabilir, ancak Türkiye pazarındaki dinamiklere ve yolcu profiline yönelik esnekliğe de değinebilirsiniz. Bu havayolları, her personelin operasyonel akışa doğrudan katkıda bulunmasını bekler.

**Tipik Takip Soruları**

*   "Bu 25 dakikalık sürede beklenmedik bir durumla (örneğin, gecikmiş bagajlar veya bir yolcunun acil tıbbi yardıma ihtiyacı) karşılaşırsanız ne yapardınız?"
*   "Kabin ekibinin bu turnaround sürecinde birbirine nasıl destek olabileceğine dair somut bir örnek verebilir misiniz?"
*   "Turnaround süresini daha da kısaltmak için önerebileceğiniz bir yenilik var mı?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soruyla insan kaynakları uzmanı, adayın easyJet'in temel değerlerini ne kadar anladığını ve bu değerlerle ne kadar örtüştüğünü ölçer. Adayın; müşteri odaklılık, ekip çalışmasına yatkınlık, proaktiflik, problem çözme becerisi ve şirketin "yaklaşılabilir" (approachable) ve "dostane" (friendly) kültürüne uyum sağlama potansiyeli değerlendirilir. Bu değerler, hızlı tempolu düşük maliyetli taşıyıcı (LCC) modelinde bile yolcu memnuniyetini ve marka imajını korumak için kritiktir.

**Bu Aşamada Neden Sorulur**

Bu soru genellikle mülakatın ortalarında veya sonlarına doğru sorulur. Adayın temel yetkinlikleri ve deneyimleri değerlendirildikten sonra, kültürel uyum ve şirket değerlerine bağlılık gibi daha derinlemesine konulara geçilir. Bu aşamada sorulması, adayın önceki cevaplarından edinen izlenimi pekiştirmek veya düzeltmek için idealdir. Şirketin kimliğini ve değerlerini anlama becerisi, adayın uzun vadeli potansiyelini gösterir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Orange Spirit'i bilmiyorum, sanırım bir pazarlama sloganı."
    *   *Kötü çünkü:* Şirket araştırması yapılmadığını ve temel değerlere ilgisizlik gösterdiğini ortaya koyar. Sadece yüzeysel bir yanıt, derinliksizliği ve potansiyel uyumsuzluğu işaret eder.

*   **Orta:** "Orange Spirit, easyJet'in hızlı ve uygun fiyatlı bir havayolu olduğunu ama aynı zamanda yolcularına iyi hizmet verdiğini düşünüyorum. Biraz daha insancıl bir yaklaşım gibi."
    *   *İyi ama eksik çünkü:* Şirketin temel LCC kimliğini ve müşteri odaklılığını yakalamış olsa da, "yaklaşılabilir", "dostane" ve "eğlenceli ama profesyonel" gibi nüansları tam olarak ifade etmiyor. Sloganların ardındaki somut davranışları açıklamakta yetersiz kalıyor.

*   **Güçlü:** "Benim için 'Orange Spirit', easyJet'in sadece düşük maliyetli bir taşıyıcı olmanın ötesinde, yolcularına ve birbirine karşı sıcak, samimi ve profesyonel bir yaklaşım sergilemesi anlamına geliyor. Bu, hızlı ve verimli operasyonları, yolcuların kendilerini rahat hissettikleri, güleryüzlü ve yardımsever bir kabin ekibiyle birleştiren bir kültürdür. Örneğin, bir yolcunun uçağa binerken aceleci ve stresli olduğunu fark eden bir kabin görevlisinin, nazikçe onu sakinleştirip kişisel bir ilgi göstermesi bu ruhun bir yansımasıdır. Bu, 'yaklaşılabilir' ve 'dostane' olma taahhüdüdür; yani operasyonel verimlilikten ödün vermeden, her yolcunun kendisini değerli hissetmesini sağlamak."
    *   *Bu cevap işe yarar çünkü:* Hem şirketin LCC modelini anlıyor hem de "Orange Spirit"in ardındaki "yaklaşılabilir", "dostane", "eğlenceli ama profesyonel" değerleri somut örneklerle açıklıyor. İnsan odaklılığı ve profesyonelliği bir araya getiren bu yaklaşım, easyJet'in marka kimliğiyle tam uyumlu.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı doğrudan bir deneyim anlatmak için kullanılmasa da, "Orange Spirit"in ne anlama geldiğini açıklarken yapısal bir çerçeve sunabilir:
*   **Situation (Durum):** easyJet'in genel iş modeli ve müşteri beklentileri.
*   **Task (Görev):** Yolculara verimli hizmet sunarken aynı zamanda sıcak ve dostane bir deneyim yaşatmak.
*   **Action (Eylem):** "Orange Spirit" ruhunu yansıtan personel davranışları (örneğin, güleryüzlü karşılama, yardımseverlik).
*   **Result (Sonuç):** Yüksek yolcu memnuniyeti ve güçlü marka sadakati.

**Havayolu Uyarlama**

Bu soru, diğer havayolları için de benzer bir mantıkla uyarlanabilir. Örneğin, **Emirates** için "Fly the world, your way" veya **Qatar Airways** için "Going places together" gibi sloganların arkasındaki değerler sorgulanabilir. Bu, adayın sadece bir havayolunu değil, genel olarak havayolu sektörünün marka değerlerini anlama yeteneğini gösterir. **THY**'nin "Globally Yours" mottosu da benzer şekilde, küresel erişimle birlikte yerel misafirperverliği vurgulayan bir değerler dizisini ifade eder. Önemli olan, adayın her şirketin kendine özgü değerlerini araştırıp bu değerlere uygun yanıtlar verebilmesidir.

**Tipik Takip Soruları**

*   "easyJet'in bu değerlerini operasyonlarınızda nasıl hayata geçirirdiniz?"
*   "Daha önce bu 'Orange Spirit' ruhunu sergilediğiniz bir durum oldu mu?"
*   "easyJet'in rakiplerinden farkı sizce nedir ve 'Orange Spirit' bu farkta nasıl bir rol oynar?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soruyla İK, adayın havayolu operasyonlarının temel dinamiklerini anlayıp anlamadığını, stratejik düşünme yeteneğini ve şirketin iş modeline ne kadar hakim olduğunu ölçer. Adayın problem çözme becerisi, analitik düşünme yeteneği, şirketin stratejisine uyum sağlama potansiyeli ve operasyonel verimlilik konusundaki farkındalığı değerlendirilir.

**Bu Aşamada Neden Sorulur**

Bu soru genellikle teknik mülakatların veya işe alım sürecinin orta aşamalarında sorulur. Adayın temel havacılık bilgisi ve stratejik bakış açısı ölçüldükten sonra, şirketin özel iş modeline ne kadar adapte olabileceğini görmek için bu tür bir soru yöneltilir. Bu, adayın sadece teknik becerilere değil, aynı zamanda şirketin operasyonel felsefesine de uyum sağlayıp sağlamadığını anlamak için önemlidir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf**: "Çok fazla şehirde üsleri olması, şirketin daha fazla uçuş yapmasını sağlar. Bu da daha fazla para kazanmaları demektir." → Kötü çünkü bu cevap, operasyonel önemi ve stratejik faydaları göz ardı ederek sadece finansal bir sonuca odaklanıyor. Esneklik, maliyet etkinliği ve ağ optimizasyonu gibi temel noktaları içermiyor.
*   **Orta**: "Wizz Air'in birçok üssü olması, operasyonel esneklik sağlar. Farklı pazarlara kolayca ulaşabilirler ve bu sayede potansiyel olarak daha fazla gelir elde edebilirler. Ayrıca, farklı yerlerdeki talebi karşılamalarına yardımcı olur." → İyi ama eksik çünkü bu cevap esnekliği belirtiyor ancak maliyet tasarrufu (yakıt, bakım) ve ağ optimizasyonu gibi stratejik avantajları yeterince vurgulamıyor. "Potansiyel olarak daha fazla gelir" gibi ifadeler yerine daha somut faydalar belirtilmeli.
*   **Güçlü**: "Wizz Air'in 40'tan fazla şehirde üs bulundurması, operasyonel esneklik ve maliyet etkinliği açısından kritik öneme sahiptir. Bu strateji, şirketin Doğu ve Orta Avrupa'daki güçlü pazar hakimiyetini pekiştirirken, farklı şehirlerdeki talebe göre filoyu hızlıca yeniden tahsis etme imkanı sunar. Yakıt tasarrufu, rotaların coğrafi yakınlığından ve bölgesel pazarlara odaklanmaktan kaynaklanır. Ayrıca, bu yaygın üs ağı, bakım ve mürettebat maliyetlerini optimize ederek, 'network optimizasyonu'nu sağlar ve rekabet avantajı yaratır." → Bu cevap, esneklik, Doğu Avrupa odağı, yakıt tasarrufu ve ağ optimizasyonu gibi istenen tüm noktaları somut bir şekilde ele alıyor. Havayolunun stratejik hedeflerine ve operasyonel verimliliğine net bir vurgu yapıyor.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı doğrudan bir olay anlatımı için değil, adayın stratejik anlayışını göstermesi için bir çerçeve sunar. Aday, "Situation" olarak Wizz Air'in çoklu üs stratejisini, "Task" olarak bu stratejinin ardındaki operasyonel gereklilikleri, "Action" olarak bu üslerin nasıl yönetildiğini (örneğin, filonun farklı bölgeler arasında esnek kullanımı), "Result" olarak ise bu stratejinin sağladığı operasyonel ve finansal faydaları (maliyet optimizasyonu, pazar erişimi) açıklayabilir.

**Havayolu Uyarlama**

Wizz Air örneğinde, çoklu üslerin Doğu ve Orta Avrupa'daki pazar penetrasyonunu artırdığı, bu bölgelerdeki düşük maliyetli operasyon modelini desteklediği vurgulanmalıdır. Örneğin, Ryanair'in de benzer bir "hub-and-spoke" olmayan, çoklu üs stratejisiyle Avrupa'da maliyet lideri olduğu belirtilebilir. Emirates veya Qatar Airways gibi havayollarının ise tek bir büyük üs (Dubai/Doha) etrafında kümelenerek küresel bir ağ kurma stratejisiyle bu durumun nasıl farklılaştığına değinilebilir.

**Tipik Takip Soruları**

1.  Bu çoklu üs stratejisinin potansiyel riskleri nelerdir?
2.  Wizz Air'in mevcut üslerinden birinin kapatılması gerekirse, bu durum operasyonlarını nasıl etkiler?
3.  Bu stratejinin sürdürülebilirliği hakkında ne düşünüyorsunuz?`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın sadece bilgi düzeyini değil, aynı zamanda problem çözme yeteneğini, uyum sağlama becerisini ve şirketin değerleriyle ne kadar örtüştüğünü ölçmeyi hedefler. HR uzmanı; adayın **kültürel zekasını**, **stratejik düşünme kapasitesini**, **iletişim becerilerini** ve **zorluklara karşı dayanıklılığını** değerlendirir. Bu nitelikler, karmaşık ve dinamik bir operasyonel ortamda başarılı olmak için kritik öneme sahiptir.

**Bu Aşamada Neden Sorulur?**

Bu soru genellikle mülakatın orta veya sonlarına doğru, adayın temel yetkinlikleri değerlendirildikten sonra sorulur. Adayın, havayolunun büyüklüğü ve operasyonel karmaşıklığı hakkında ne kadar derinlemesine düşünebildiğini görmek, şirketin stratejik vizyonunu anlayıp anlamadığını ölçmek amaçlanır. Bu, adayın sadece bir "uçan personel" değil, aynı zamanda şirketin bir parçası olarak değer katabilecek bir birey olup olmadığını anlamak için önemlidir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "THY'nin çok destinasyonu olması demek, çok insanla karşılaşmak demek. Bu da biraz yorucu olabilir ama eğlenceli de."
    *   *Neden Kötü:* Bu cevap yüzeyseldir, adayın konuyu derinlemesine anlamadığını gösterir. "Yorucu" ve "eğlenceli" gibi genel ifadeler, somut bir anlayıştan yoksundur.

*   **Orta Cevap:** "THY'nin geniş network'ü, farklı milletlerden yolcularla karşılaşacağımız anlamına gelir. Bu da bize farklı kültürlere saygı duymamız gerektiğini hatırlatır. Uçuş süreleri de farklı olacağı için hazırlıklı olmalıyız."
    *   *Neden İyi Ama Eksik:* Aday, çok kültürlülük ve uçuş süresi farklılığı gibi temel noktalara değiniyor. Ancak, bu durumun kabin ekibi üzerindeki somut etkilerini ve nasıl bir hazırlık gerektirdiğini yeterince açıklayamıyor. "Hazırlıklı olmak" ne demek, somutlaştırılmamış.

*   **Güçlü Cevap:** "THY'nin 350+ destinasyonluk geniş network'ü, kabin ekibi için hem büyük bir fırsat hem de ciddi bir sorumluluk anlamına gelir. Bu, her uçuşta **çok kültürlü bir yolcu profiliyle** karşılaşacağımız demektir. Bir uçuşta Batı Avrupa'dan gelen bir yolcunun beklentileriyle, diğerinde Uzak Doğu'dan gelen bir yolcunun beklentileri farklı olabilir. Ayrıca, **uçuş süresi farklılıkları** da (örn: 1 saatlik Kıbrıs uçuşundan, 15 saatlik Avustralya uçuşuna kadar) hem fiziksel hem de zihinsel hazırlık gerektirir. Bu durum, **kültürel duyarlılığın** ve **dil çeşitliliğine** (temel seviyede bile olsa İngilizce dışında birkaç dilin bilinmesi veya öğrenmeye açık olmak) büyük önem kazandığı anlamına gelir. Kabin ekibinin, farklı kültürel normlara, diyet tercihlerine ve iletişim tarzlarına saygı göstererek **sürekli öğrenme** ve adaptasyon içinde olması beklenir. Örneğin, bazı kültürlerde el sıkışma veya göz teması farklı anlamlar taşıyabilir; bu tür detaylara dikkat etmek, yolcu memnuniyetini artırır ve olası yanlış anlaşılmaları önler."

**STAR Formatı Uygulaması**

Bu soruda STAR formatı doğrudan bir olay anlatmak yerine, adayın bu geniş network'ün getirdiği zorluklara nasıl yaklaştığını yapılandırmak için kullanılabilir. Örneğin:
*   **Situation:** Geniş network'ün getirdiği çok kültürlü yolcu profili.
*   **Task:** Farklı kültürel beklentilere sahip yolculara üst düzey hizmet sunmak.
*   **Action:** Kültürel farkındalık eğitimlerine katılmak, farklı kültürlerden yolcularla iletişim kurarken sabırlı ve anlayışlı olmak, gerekirse temel seviyede dil bilgisi kullanmak.
*   **Result:** Yolcu memnuniyetini artırmak, olası sorunları proaktif olarak çözmek ve THY'nin küresel imajına katkıda bulunmak.

**Havayolu Uyarlama**

THY'nin kendi değerleri ve misyonuyla bu durum ilişkilendirilmelidir. "THY'nin 'Dünyaya Açılan Pencere' misyonuyla uyumlu olarak, geniş network'ümüzdeki her yolcu, bizim için özeldir. Emirates'in lüks ve küresel odaklı yaklaşımı veya Qatar Airways'in 'Al Nass' (Birlik) felsefesi gibi, bizim de **'Hoş Geldiniz'** yaklaşımımızla her kültürü kucaklıyoruz. Bu, sadece hizmet kalitemizi değil, aynı zamanda şirketimizin kapsayıcılığını da yansıtır."

**Tipik Takip Soruları**

1.  "Bu çok kültürlü ortamda karşılaştığınız bir zorluk ve bunu nasıl aştığınızı anlatır mısınız?"
2.  "Farklı bir kültürel normu bilmediğiniz bir durumda nasıl davranırdınız?"
3.  "Kabin ekibinin dil becerilerini geliştirmesi konusunda ne düşünüyorsunuz?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın problem çözme becerisini, kriz yönetimini, iletişim yeteneğini, empati gücünü ve stres altında soğukkanlılığını ölçer. Adayın yolcu memnuniyetini ve uçuş güvenliğini dengelerken, kurumsal prosedürlere uyum sağlama yeteneği değerlendirilir. Ayrıca, ekip çalışmasına yatkınlığı ve yetki hiyerarşisine saygısı da bu soru aracılığıyla anlaşılmaya çalışılır.

**Bu Aşamada Neden Sorulur**

Bu tür durumsal sorular, genellikle mülakatın ilerleyen aşamalarında, adayın temel bilgilerini ve motivasyonunu ölçen ilk aşamalar geçildikten sonra sorulur. Adayın teorik bilgilerini pratikte nasıl uygulayabileceğini, baskı altında nasıl tepki vereceğini görmek için kullanılır. Bu noktada, adayın gerçek bir kabin memuru rolüne ne kadar uygun olduğunu daha derinlemesine anlamak amaçlanır.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Yolcuya alkol vermeyi keserdim ve sakinleşmesini söylerdim. Eğer dinlemezse kabin şefine söylerdim." Bu cevap zayıftır çünkü çözüm odaklı değildir, sadece temel adımları belirtir ve havayolu prosedürlerini, yolcu psikolojisini dikkate almaz. Saldırgan bir yaklaşım sergileme potansiyeli taşır.

*   **Orta:** "Önce yolcuyla nazikçe konuşur, rahatsızlık vermemesi gerektiğini belirtirdim. Alkol servisini yavaşlatır, su ikramı yapardım. Durum devam ederse purser'a bildirirdim." Bu cevap daha iyidir, adım adım ilerler ve purser'ı bilgilendirmeyi içerir. Ancak, yolcunun rahatsızlığını azaltma ve diğer yolcularla empati kurma konusunda daha derinlemesine bir yaklaşım eksiktir.

*   **Güçlü:** "Öncelikle yolcuya yaklaşarak, nazik bir dille 'Misafir, etrafınızdaki diğer misafirlerimiz dinlenmeye geçti. Lütfen sesinizi biraz daha alçak tutabilir misiniz?' gibi bir ifadeyle ilk uyarıyı yapardım. Ardından, alkol servisini yavaşlatarak, su veya başka alternatif içecekler teklif eder, alkol tüketimini azaltmaya çalışırdım. Bu süreçte, durumu purser'a (kabinin başından sorumlu kabin memuru) sessizce bildirerek bilgi akışını sağlardım. Eğer yolcu ısrar eder, durumu kötüleştirirse, purser ile birlikte kaptan pilota durumun ciddiyetini ve alınan önlemleri aktarırdık. Gerekirse, ICAO Doc 9432'de belirtilen acil durum prosedürleri çerçevesinde, varış noktasındaki (JFK) ilgili güvenlik birimleriyle (polis) temas kurulması için kaptan pilotun talimatları doğrultusunda hareket ederdim. Bu yaklaşım, yolcu güvenliğini ve memnuniyetini ön planda tutarken, havayolu prosedürlerine ve güvenlik talimatlarına uygun hareket etmeyi sağlar." Bu cevap, HR uzmanının aradığı tüm nitelikleri taşır: proaktif, çözüm odaklı, iletişim becerisi yüksek, prosedürlere hakim ve durumu aşamalı olarak yönetebilen bir yaklaşım sergiler.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı şu şekilde uygulanır:
*   **Situation (Durum):** Long-haul uçuşta (TK 1, IST-JFK) alkol talebinde bulunan ve sesli konuşan, diğer yolcuları rahatsız eden bir yolcu.
*   **Task (Görev):** Yolcuyu sakinleştirmek, diğer yolcuların huzurunu sağlamak, alkol servisini yönetmek ve gerektiğinde üst mercilere bildirimde bulunmak.
*   **Action (Eylem):** Yukarıdaki "Güçlü Cevap" bölümünde detaylandırılan aşamalı müdahale (ilk uyarı, alkol servisini yavaşlatma, purser'a bildirim, kaptanla temas, gerekirse polisle irtibat).
*   **Result (Sonuç):** Yolcunun sakinleştirilmesi, diğer yolcuların rahatsızlığının giderilmesi, uçuşun güvenli ve sorunsuz bir şekilde tamamlanması.

**Havayolu Uyarlama**

Turkish Airlines (THY) gibi misafirperverlik ve yolcu memnuniyetini ön planda tutan bir havayolu için bu cevap, THY'nin "İnsan Odaklı Yaklaşım" ve "Güvenlik Her Şeyden Önce Gelir" değerleriyle uyumludur. Emirates veya Qatar Airways gibi küresel havayollarında da benzer prosedürler olsa da, THY'nin kendine özgü hizmet anlayışı ve misafirperverlik kültürü vurgulanarak cevap zenginleştirilebilir. Örneğin, "THY'nin misyonu doğrultusunda, her misafirimizin konforunu ve güvenliğini sağlamak önceliğimizdir" gibi bir ekleme yapılabilir.

**Tipik Takip Soruları**

1.  Eğer yolcu fiziksel olarak agresifleşirse ne yapardınız?
2.  Bu tür bir durumda purser'a durumu nasıl raporlardınız?
3.  Uçuş sonrası bu olayla ilgili raporlama prosedürleri hakkında bilginiz var mı?`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

HR uzmanları bu soruyu, adayın motivasyonunu, şirkete olan bağlılığını ve kariyer hedeflerinin havayolunun vizyonuyla ne kadar örtüştüğünü anlamak için sorar. Ölçülen temel nitelikler arasında; araştırma yeteneği, şirket değerlerini anlama, uzun vadeli bağlılık potansiyeli ve profesyonel beklentiler yer alır. Adayın sadece iş bulma arayışında olup olmadığını değil, aynı zamanda bu spesifik havayolunda neden başarılı olabileceğini ve kalabileceğini görmek isterler.

**Bu Aşamada Neden Sorulur**

Bu soru genellikle mülakatın ortalarında veya sonlarına doğru sorulur. Adayın temel yetkinlikleri ve deneyimleri değerlendirildikten sonra, motivasyonel uyumunu ve şirkete olan ilgisinin derinliğini ölçmek için idealdir. Bu noktada sorulması, adayın daha önceki cevaplarında sergilediği tutarlılığı teyit etmeye ve potansiyel kırmızı çizgileri (red flags) belirlemeye yardımcı olur.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "THY'yi tercih ediyorum çünkü büyük bir havayolu ve çok uçağı var. Pegasus veya SunExpress'ten daha iyi görünüyor."
    *   **Kötü Çünkü:** Bu cevap yüzeysel, karşılaştırmalı ve olumsuz. Diğer havayollarını kötüleyerek profesyonellikten uzak bir izlenim bırakıyor. THY'nin spesifik değerlerine veya başarılarına dair hiçbir içgörü sunmuyor.

*   **Orta Cevap:** "THY, Türkiye'nin bayrak taşıyıcısı ve global bir ağı var. Skytrax'ten 5 yıldız alması da etkileyici. Bu yüzden tercih ediyorum."
    *   **İyi Ama Eksik Çünkü:** Temel olumlu noktaları belirtiyor ancak yüzeysellikten tam olarak kurtulamıyor. "Global ağ" ve "5 yıldız" gibi ifadeler daha detaylandırılmalı. Türk misafirperverliği veya Star Alliance üyeliği gibi diğer güçlü yönler eksik.

*   **Güçlü Cevap:** "THY'yi, küresel ölçekteki uzun menzilli operasyonları ve geniş network'ü nedeniyle öncelikli tercihim olarak görüyorum. Skytrax'in sürekli 5 yıldızla ödüllendirdiği premium kabin standardı ve Star Alliance üyeliği ile sunduğu global bağlantılar, kariyer hedeflerimle örtüşüyor. Özellikle Türk misafirperverliğini uluslararası standartlarda sunma vizyonu ve başarılı catering hizmetleri (örneğin, Skytrax ödüllü ikramlar), profesyonel gelişimim için ideal bir ortam sunuyor. Bu, sadece bir iş değil, aynı zamanda markanın değerlerini temsil etme fırsatı."
    *   **Bu Cevap İşe Yarar Çünkü:** Spesifik başarıları (Skytrax, Star Alliance), güçlü yönleri (long-haul, network, premium kabin, Türk misafirperverliği) ve adayın kariyer hedefleriyle nasıl örtüştüğünü somut olarak açıklıyor. Olumsuz karşılaştırmalardan kaçınıyor ve havayolunun değerlerine odaklanıyor.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı doğrudan bir olay anlatmak yerine, adayın havayolunu neden seçtiğini ve bu seçimi destekleyen kendi profesyonel gelişimini veya deneyimlerini yapılandırmak için kullanılabilir. Örneğin, "Situation: Kariyerimde global bir oyuncuyla çalışmak istedim. Task: THY'nin network ve hizmet standartlarını araştırmak. Action: THY'nin Star Alliance'daki rolünü ve Skytrax değerlendirmelerini inceledim. Result: Bu analizin, beklentilerimi en iyi THY'nin karşılayacağını gösterdiğini fark ettim."

**Havayolu Uyarlama**

Her havayolunun kendine özgü güçlü yanları vardır. Emirates için "dünyanın en büyük ve en hızlı büyüyen havayolu," "modern filosu" ve "lüks deneyim" vurgulanabilir. Qatar Airways için "5 yıldızlı havayolu," "Skytrax'in en iyisi" ve "Qsuite" gibi yenilikçi ürünler öne çıkarılabilir. THY için ise yukarıda belirtilen "Türk misafirperverliği," "geniş network," "Star Alliance," "5 yıldızlı hizmet" ve "büyüyen global marka" vurgusu yapılmalıdır.

**Tipik Takip Soruları**

*   "THY'nin Skytrax 5 yıldızını hangi spesifik hizmetlerine borçlu olduğunu düşünüyorsunuz?"
*   "Star Alliance üyesi olmak, bir pilot/kabin memuru olarak size ne gibi avantajlar sağlar?"
*   "Türk misafirperverliğini kabin hizmetlerine nasıl entegre edersiniz?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın şirkete olan ilgisini, araştırma becerisini ve temel değerlerle ne kadar uyumlu olduğunu ölçer. HR uzmanı bu soruyla şu nitelikleri anlamaya çalışır: şirkete yönelik **motivasyon** ve **bağlılık**, **analitik düşünme** yeteneği (sloganın ardındaki anlamı kavrama), **iletişim becerisi** (fikrini net ifade edebilme) ve **kültürel uyum**. Adayın sadece sloganı bilmesi değil, onu yorumlayabilmesi önemlidir.

**Bu Aşama Neden Sorulur?**

Bu soru genellikle mülakatın ilk aşamalarında, adayın genel motivasyonunu ve şirkete olan ilgisini anlamak için sorulur. Adayın pozisyona ne kadar istekli olduğunu ve şirket hakkında temel bilgilere sahip olup olmadığını hızlıca değerlendirmek için etkilidir. Bu, adayın şirketin kimliğini ne kadar benimsediğini gösteren bir ön eleme görevi görür.

**3 Seviyeli Cevap Örneği**

*   **Zayıf**: "Pegasus'un sloganı 'Neredeysen Oraya Uçuyoruz' sanırım. Bunun ne anlama geldiğini tam bilmiyorum, ama sanırım her yere uçtukları anlamına geliyor."
    *   *Kötü çünkü:* Slogan hakkında emin olmama, anlamını derinlemesine kavrayamama ve yüzeysel bir yanıt verme eğilimindedir. Şirkete olan ilginin ve araştırma çabasının yetersiz olduğunu gösterir.

*   **Orta**: "Pegasus'un sloganı 'Neredeysen Oraya Uçuyoruz'. Bu, onların geniş uçuş ağına ve ulaşılabilirliğine işaret ediyor. Yolcuların istedikleri yere gitmelerini sağladıklarını düşünüyorum."
    *   *İyi ama eksik çünkü:* Sloganı doğru bilmek ve temel bir anlam çıkarmak olumlu. Ancak "geniş uçuş ağı" ve "ulaşılabilirlik" gibi genel ifadeler, sloganının "yeni nesil havayolu" vizyonuyla nasıl örtüştüğünü ve şirketin modern, hızlı ve erişilebilir olma stratejisini tam olarak yansıtmıyor.

*   **Güçlü**: "Pegasus'un sloganı **'Neredeysen Oraya Uçuyoruz'**. Bu slogan benim için hem şirketin **ulaşılabilirliği** ve **geniş ağını** ifade ediyor hem de daha derinde **'yeni nesil havayolu'** vizyonunu simgeliyor. Bu, sadece coğrafi bir ulaşım sağlamakla kalmayıp, aynı zamanda modern teknolojiyle, genç ve dinamik ekiple, **Sabiha Gökçen (SAW) hub'ının gücüyle** operasyonel verimliliği ve hızlı büyümeyi temsil ediyor. Pegasus, geleneksel havayolu anlayışının ötesine geçerek, herkes için seyahati daha kolay, hızlı ve erişilebilir kılmayı hedefliyor. Bu da benim gibi yenilikçi ve dinamik bir çalışma ortamında bulunmak isteyen biri için büyük bir motivasyon kaynağı."
    *   *Bu cevap işe yarar çünkü:* Sloganı hem doğru bilmekte hem de "yeni nesil havayolu" konseptiyle ilişkilendirerek derinlemesine yorumlamaktadır. "Genç ekip" ve "SAW hub gücü" gibi spesifik unsurları ekleyerek şirketin stratejik noktalarına değinir ve kişisel motivasyonunu bu değerlerle bağlar.

**STAR Formatı Uygulaması**

Bu soru doğrudan bir STAR vakası istemese de, adayın geçmiş deneyimlerini sloganla ilişkilendirmesi güçlü bir etki yaratır. Örneğin, **Situation**: "Daha önceki bir projede, müşteri odaklılığı artırmak için teknolojik çözümler geliştirdik." **Task**: "Pegasus'un 'Neredeysen Oraya Uçuyoruz' sloganının dijitalleşme ile nasıl daha iyi hayata geçirilebileceğini düşündüm." **Action**: "Bu sloganı, kişiselleştirilmiş seyahat deneyimleri sunan mobil uygulamalar ve akıllı rota planlama araçları gibi yeniliklerle nasıl pekiştirebileceğimizi analiz ettim." **Result**: "Bu yaklaşımın, Pegasus'un 'yeni nesil havayolu' vizyonunu güçlendireceğine ve müşteri memnuniyetini artıracağına inanıyorum."

**Havayolu Uyarlama**

Pegasus için "yeni nesil havayolu", "ulaşılabilirlik" ve "genç, dinamik ekip" vurgusu önemlidir. Benzer bir soru THY için sorulsaydı, "Türkiye'nin bayrak taşıyıcısı", "küresel ağ" ve "misafirperverlik" gibi değerler öne çıkabilirdi. Qatar Airways için ise "dünya standartlarında hizmet", "lüks" ve "bağlantı hub'ı" gibi temalar daha uygun olurdu. Her havayolunun kendi marka kimliği ve değerleri slogan yorumuna yansıtılmalıdır.

**Tipik Takip Soruları**

*   Bu sloganı Pegasus'un operasyonlarında nasıl gördüğünüzü somut örneklerle açıklar mısınız?
*   "Yeni nesil havayolu" olmak Pegasus'a rekabet avantajı sağlar mı? Nasıl?
*   Sloganın "genç ekip" ve "SAW hub gücü" ile bağlantısını biraz daha açar mısınız?`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın şirkete olan ilgisinin derinliğini ve uyum potansiyelini ölçmek için sorulur. HR uzmanı, adayın şirketin değerlerini anlayıp anlamadığını, motive olup olmadığını ve uzun vadeli bir bağlılık gösterip göstermeyeceğini değerlendirir. Temel olarak; **şirket bilgisi**, **motivasyon**, **kültürel uyum** ve **öğrenme isteği** gibi nitelikler aranır. Adayın sadece pozisyona değil, şirketin kendisine de değer verdiğini görmek isterler.

**Bu Aşamada Neden Sorulur?**

Bu soru genellikle mülakatın ilk aşamalarında, adayın temel nitelikleri ve deneyimi hakkında bilgi alındıktan sonra sorulur. Amaç, adayın şirkete olan ilgisinin yüzeysel mi yoksa derinlemesine mi olduğunu anlamaktır. Bu erken aşamada sorulması, adayın zamanını boşa harcamadan şirketin değerlerine ne kadar uyum sağlayabileceğinin ilk sinyallerini almak içindir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "SunExpress'i duydum, Türkiye ve Almanya ortaklığı sanırım. İki büyük şirketin birleşimi ilginç görünüyor."
    *   **Kötü Çünkü:** Bu cevap, adayın şirket hakkında yüzeysel bilgiye sahip olduğunu ve derinlemesine araştırma yapmadığını gösterir. Ortaklığın nedenlerini veya şirketin stratejik önemini anlamadığını ima eder. Sadece genel bir bilgi verme çabasıdır.

*   **Orta Cevap:** "SunExpress'in Türk Hava Yolları ve Lufthansa gibi iki güçlü ismin ortaklığı olması beni çekiyor. Bu, iki farklı havacılık kültürünün bir araya gelmesi anlamına geliyor ve bu deneyimin bir parçası olmak isterim."
    *   **İyi Ama Eksik Çünkü:** Ortaklığın iki kültürün birleşimi olduğunu doğru tespit ediyor ancak bu birleşimin getirdiği spesifik avantajları veya şirketin hedeflediği pazarları tam olarak anlamadığını gösteriyor. Sadece kültürel birleşime odaklanmak, şirketin stratejik hedeflerini göz ardı edebilir.

*   **Güçlü Cevap:** "SunExpress'in Türk Hava Yolları'nın dinamik yerel pazar bilgisi ile Lufthansa'nın uluslararası havacılıktaki kalite ve operasyonel mükemmellik anlayışını birleştirmesi, benim için son derece çekici. Özellikle Antalya gibi büyük bir turizm merkezindeki güçlü varlığı ve bu pazara sunduğu hizmet çeşitliliği, şirketin stratejik vizyonunu yansıtıyor. Ayrıca, Almanca bilgimi geliştirme ve iki farklı kurumsal kültürü deneyimleme fırsatı sunması, profesyonel gelişimim açısından da büyük önem taşıyor. Bu sinerjinin bir parçası olmak ve şirketin büyümesine katkıda bulunmak istiyorum."
    *   **Bu Cevap İşe Alır Çünkü:** Şirketin iki ana ortağının güçlü yönlerini (THY'nin yerel pazar bilgisi, Lufthansa'nın operasyonel mükemmelliği) somut olarak belirtiyor. Şirketin stratejik konumunu (Antalya turizm trafiği) ve bu konuma yönelik vizyonunu vurguluyor. Ayrıca, adayın kişisel gelişim hedeflerini (Almanca öğrenme, kültürel deneyim) şirketin sunduğu fırsatlarla ilişkilendirerek motivasyonunu ve uyum potansiyelini gösteriyor.

**STAR Formatı Uygulaması**

Bu soruya STAR formatı direkt olarak uygulanamaz çünkü bir durum analizi değildir. Ancak, adayın geçmiş deneyimlerini kullanarak SunExpress'e neden ilgi duyduğunu açıklarken STAR'ı dolaylı olarak kullanabilir. Örneğin, "Geçmişte farklı kültürel ortamlarda çalışma (Situation) deneyimim oldu. Bu deneyimlerimde, farklı çalışma prensiplerini anlama ve entegre etme (Task) becerimi geliştirdim. Bu sayede, SunExpress'in Türk ve Alman kültürlerini harmanlayan yapısına kolayca uyum sağlayabileceğime inanıyorum (Action). Sonuç (Result) olarak, bu tür ortamlarda başarılı projeler tamamladım."

**Havayolu Uyarlama**

SunExpress'in THY ve Lufthansa ortaklığına vurgu yapmak önemlidir. "Emirates'in küresel ağını ve premium hizmet anlayışını takdir ediyorum" demek yerine, SunExpress için "Türk Hava Yolları'nın Türkiye'deki güçlü operasyonel altyapısı ve pazar erişimi ile Lufthansa'nın Avrupa'daki köklü geçmişi ve operasyonel standartlarının birleşimi, SunExpress'i benzersiz kılıyor. Özellikle bu iki büyük ailenin bir araya gelerek oluşturduğu sinerji ve Antalya gibi stratejik bir noktadaki etkinliği, şirketin geleceğine dair önemli ipuçları veriyor." şeklinde bir uyarlama yapılabilir.

**Tipik Takip Soruları**

*   "Bu iki farklı kültürün (Türk ve Alman) çalışma prensiplerinin birleşmesinde ne gibi zorluklar öngörüyorsunuz ve bu zorluklarla nasıl başa çıkarsınız?"
*   "SunExpress'in Antalya'daki turizm trafiğine odaklanması hakkında ne düşünüyorsunuz? Bu stratejinin başarı potansiyeli hakkında ne söyleyebilirsiniz?"
*   "Almanca öğrenme fırsatı sizin için ne kadar önemli? Bu beceriyi şirkette nasıl kullanmayı planlıyorsunuz?"`,
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
    detailedExplanationTr: `**HR psikoloji perspektifi**: "Why our airline?" pilot mülakatlarının açılış sorusu. Chief pilot/recruiter 4 şey ölçer: (1) Şirket araştırma derinliği (2) Long-term plan (3) Değer örtüşmesi (4) Diğer havayolu offer'ları arasındaki tercih sebebi. Pilot işe alımları $1M+ yatırım (type rating + line training) — şirket "1-2 yıl sonra ayrılır mı?" riskini kontrol etmek ister.

**Bu aşamada neden sorulur**: Genelde Panel Interview'in ilk 5 dakikasında. Adayın hazırlığını ölçer. Yetersiz cevap → diğer aday ile karşılaştırmada zayıf. Zaten 2-3 senior captain ve HR panel önündesindir; cevap basmakalıp olursa unutulursun.

**3 seviyeli cevap örneği**:
- **Zayıf**: "Çünkü iyi havayolu, fleet büyük, maaş iyi." → herkes der, 0 ayırt edicilik.
- **Orta**: "Emirates'in 260+ uçaklık fleet'i ve Dubai hub'ı çekici. A380 deneyimi benzersiz." → fact var ama kişiselleştirme yok.
- **Güçlü**: "3 spesifik sebep: 1) Tim Clark'ın 2030 vizyonu — 65 yeni route + premium economy genişleme — büyüme dönemine girmek isterim. 2) A380 fleet (119 uçak) endüstride benzersiz, A380 type rating kariyerimde fark yaratır. 3) Dubai multi-cultural workforce (160 ülke) global pilot olma fırsatı. 5 yıl içinde A380 captain hedeflerim arasında. Diğer Gulf 3'üyle (Qatar, Etihad) karşılaştırdım — Emirates Group entegrasyonu (dnata, Emirates Holidays) en geniş kariyer çeşitlendirmesi sağlar." → spesifik vizyon + uzun dönem + rakip karşılaştırma.

**STAR formatı uygulaması**: Bu motivation soru, STAR direkt uygulanmaz. Yerine "SPECIFIC-VISION-ALIGNMENT" yapısı: Specific (spesifik fact'ler), Vision (kendi 5-yıl planın), Alignment (şirket değeri + senin değerin örtüşmesi).

**Havayolu uyarlama**:
- Emirates: "Fly Better", A380 fleet, Tim Clark vision, multi-cultural
- Qatar: Skytrax #1, Q-Suite, Al-Meer yönetimi, Doha hub
- THY: 90. yıl heritage, 350+ destination, Star Alliance, Bilal Ekşi
- Lufthansa: Group benefits, DLR test geçtim ama LH culture cezbeder
- BA: oneworld, Speedbird heritage, "To Fly. To Serve."
- Ryanair: Avrupa pasiif network, hızlı captain upgrade, low-cost rivalry önder

**Tipik takip soruları**: "What if Qatar offers you a better contract?" "Why now, you have 5 years experience already?" "What would make you leave us in 3 years?"`,
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
    detailedExplanationTr: `**HR psikoloji perspektifi**: Bu davranışsal soru chief pilot/recruiter için kritik çünkü pilot CRM'ı sadece teori olarak biliyor mu, yoksa pratikte uygulayan biri mi anlamak ister. Modern havacılığın temel taşı CRM — Tenerife'den Sully'ye geçen disiplin. Pilot "hiç CRM kullanmadım" derse: ya çok az uçuşu var ya self-awareness eksik. "Kendi hatamı F/O kurtardı" diyebilen pilot olgun pilottur.

**Bu aşamada neden sorulur**: Sim check sonrası Panel Interview'in 2. yarısında. CRM örneği ile aynı zamanda 3 şey ölçülür: (1) Self-awareness — kendi hatanı kabul edebiliyor musun? (2) Hierarchy navigation — captain otoritesine saygı + assertiveness dengesi (3) Outcome focus — sonuç yönetimi.

**3 seviyeli cevap örneği**:
- **Zayıf**: "CRM her uçuşta kullanırız, ekip iletişimi önemlidir." → teorik, hikaye yok.
- **Orta**: "Bir defasında F/O bir checklist item'i unuttu, ben hatırlattım, geçtik." → küçük, low-stakes.
- **Güçlü** (STAR): **Situation**: "Bir gece IST-FRA, FL370'te. Türbülans ön-belirti sıfır. APU starter generator EICAS warning geldi." **Task**: "F/O olarak monitor'düm. Captain QRH'ya yönelmek istedi ama autopilot disconnect aşaması yaklaşıyordu." **Action**: "PACE modeli kullandım — Probe (sorgu): 'Captain, autopilot 30 saniye sonra disconnect olabilir, QRH için co-pilot olarak ben okumayı isterdim, siz aviating'e odaklanın'. Captain başta 'ben hallederim' dedi. Alert (alarm) ile 'Düşük yükseklikte değiliz ama emergency descent ihtimali var, distribute task daha güvenli' dedim. Captain kabul etti." **Result**: "Ben QRH okudum, captain manual flying, F/O (eğitimli olduğu için) ATC ile iletişim. APU shutdown bittikten sonra emniyetli düzeltme. Post-flight debriefing'te captain açıkça 'haklıydın, single-pilot mindset'e kaymıştım' dedi." **Lesson**: "PACE escalation modeli pratik."

**STAR formatı uygulaması**: CRM hikayesinde özellikle: Action kısmı en uzun olmalı (ne dedin, ne yaptın detayı). Result ölçülebilir (incident önlendi, debriefing pozitif). Lesson learned kritik — bu öğreti yansıtma kabiliyetini gösterir.

**Havayolu uyarlama**:
- Emirates/Qatar: PACE modeli + multi-cultural team dinamikleri vurgu
- Lufthansa: Authority gradient (rütbe farkı navigasyon) Almanca pilot kültürü için kritik
- Ryanair: Hızlı turnaround baskısı altında CRM korunması
- THY: Türk hiyerarşi kültüründe junior'ın senior'a "yanlış yapıyorsun" diyebilmesi olgun pilot işareti

**Tipik takip soruları**: "What if the captain refused your input?" "Have you ever been wrong in a CRM challenge?" "How do you balance assertiveness with respect?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın baskı altında karar verme yeteneğini, risk yönetimini, prosedürel bağlılığını ve iletişim becerilerini ölçer. Kilit nitelikler şunlardır: problem çözme, durumsal farkındalık, stres toleransı ve emniyet odaklılık. HR, adayın karmaşık ve potansiyel olarak tehlikeli bir senaryoda soğukkanlılığını koruyup doğru adımları atıp atamayacağını görmek ister.

**Bu Aşamada Neden Sorulur**

Bu soru genellikle teknik mülakatın veya simülatör değerlendirmesinin sonlarına doğru, adayın temel havacılık bilgilerini ve prosedürel anlayışını gösterdiği bir aşamada sorulur. Bu, adayın teorik bilgisini pratik, acil durum senaryolarına nasıl uygulayabildiğini ve karmaşık kararlar alırken havacılık emniyet prensiplerini ne kadar içselleştirdiğini değerlendirmek için idealdir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf**: "Önce yakıtı kontrol ederim, eğer yetmiyorsa direkt en yakın meydana uçarım. ATC'ye haber veririm."
    *   *Kötü çünkü*: Bu cevap, prosedürel adımları atlıyor, alternatifleri değerlendirmiyor ve riskli bir yaklaşım sergiliyor. "Direkt en yakın meydana uçarım" kararı, uygunluk değerlendirmesi yapılmadan aceleci bir hamledir.

*   **Orta**: "Önce alternatif meydanlara bakarım. Yakıtım kritikse, 'minimum fuel' deklare edip öncelik isterim. Eğer hala yetmiyorsa, en yakın uygun meydana divert ederim."
    *   *İyi ama eksik çünkü*: Temel adımları içeriyor ancak MINIMA altındaki bir meydana iniş riskini ve hold süresince yakıt takibini detaylandırmıyor. "Uygun" meydanın ne olduğu ve neden olduğu açıklanmamış.

*   **Güçlü**: "Öncelikle, mevcut yakıtım ile hedef meydana iniş için gereken minimum yakıt (IFR minima) koşullarının sağlanıp sağlanmadığını kontrol ederim. Eğer hedef meydan minima altındaysa, ilk adımım derhal alternatif meydanlardaki hava durumu ve yakıt durumunu kontrol etmektir. Eğer alternatif meydanlar uygunsa ve yakıtım izin veriyorsa, hedef meydana kontrollü bir hold (bekleme) yaparak durumu izlemeye başlarım. Bu esnada yakıtımı sürekli olarak takip eder, her geçen dakika ile birlikte yakıt durumumun ne kadar kritikleştiğini değerlendiririm. Yakıtım, ICAO Annex 6 ve EASA Air Operations Regulation (EU) No 965/2012'de tanımlanan 'minimum fuel' seviyesine düştüğünde, bunu derhal ATC'ye bildirerek 'minimum fuel' durumunda olduğumu ve öncelikli iniş hakkı talep ettiğimi deklare ederim. Bu, ATC'nin beklemeleri veya diğer trafiği yönetirken bana öncelik vermesini sağlar. Eğer yakıtım, herhangi bir ek bekleme veya gecikmeye tahammül edemeyecek kadar kritikleşir ve 'emergency fuel' seviyesine yaklaşırsa (genellikle 30 dakika yakıt kalmışsa), derhal en yakın *uygun* meydana (nearest suitable airport) divert kararı alırım. Bu karar, sadece yakıtın değil, aynı zamanda hava durumu, pist durumu, CAT II/III ekipmanı gerekliliği gibi faktörleri de içeren kapsamlı bir uygunluk değerlendirmesi sonucunda verilir. ATC'ye 'MAYDAY fuel' durumunu ve divert ettiğim yeri bildiririm."

**STAR Formatı Uygulaması**

Bu soru, Situation (Hedef meydan minima altında, az yakıt), Task (Güvenli bir şekilde karar vermek ve icra etmek), Action (Yukarıda detaylandırılan karar ağacını takip etmek) ve Result (Emniyetli bir iniş veya diversion) adımlarını içerir. Adaydan, bu senaryoda hangi adımları atacağını açıklayarak bu yapıyı göstermesi beklenir.

**Havayolu Uyarlama**

Her havayolunun kendi acil durum prosedürleri ve kültürü vardır. Emirates gibi küresel bir havayolu, uluslararası standartlara (ICAO, EASA) sıkı sıkıya bağlılık ve her zaman en yüksek emniyet standartlarını vurgulayacaktır. Qatar Airways, 'Excellence' değeriyle tutarlı olarak, detaylı durum analizi ve kusursuz uygulama üzerinde durabilir. THY ise, Türk havacılık mevzuatına uyum ve operasyonel verimlilik dengesini ön plana çıkarabilir. Cevap, havayolunun emniyet felsefesiyle uyumlu olmalıdır.

**Tipik Takip Soruları**

1.  "Minimum fuel ve emergency fuel arasındaki fark nedir ve bu seviyeler neden önemlidir?"
2.  "Diversion kararı alırken hangi ek faktörleri (hava durumu, pist, ekipman vb.) göz önünde bulundurursunuz?"
3.  "Bu tür bir durumda kokpitteki diğer mürettebatla (eğer varsa) iletişiminizi nasıl yönetirsiniz?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

HR uzmanı bu soruyla pilotun stres altındaki karar verme yeteneğini, acil durum prosedürlerine hakimiyetini ve Crew Resource Management (CRM) becerilerini ölçer. Adayın sakin kalabilme, kritik bilgileri önceliklendirme, takım çalışmasına yatkınlık ve durumsal farkındalık gibi nitelikleri değerlendirilir. Bu, yüksek baskı altında bile güvenli operasyonları sürdürebilme potansiyelini anlamak için kritik bir göstergedir.

**Bu Aşama Neden Sorulur**

Bu tür detaylı ve kritik bir senaryo sorusu genellikle mülakatın ilerleyen aşamalarında, adayın temel teknik bilgileri ve deneyimi hakkında yeterli bir fikir edinildikten sonra sorulur. Amaç, adayın teorik bilgisini gerçek bir acil durumda nasıl uygulayabildiğini görmek, problem çözme yaklaşımını ve baskı altında nasıl performans gösterdiğini somut olarak değerlendirmektir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Motor yangını duyunca uçuşu iptal ederdim. Sonra ne yapacağımı düşünürdüm. Muhtemelen bir acil durum prosedürü bulmaya çalışırdım." Bu cevap, temel memory item'ları ve acil durum yönetiminin temel prensiplerini bilmediğini gösteriyor. ECAM'ı görmezden gelmek ve durumsal farkındalığın eksikliği büyük bir red flag'dir.
*   **Orta:** "V1 sonrası motor yangını olursa, hemen thrust'ı keserdim, rotate yapardım ve gear'ı yukarı alırdım. Sonra ECAM'ı kontrol edip yangın prosedürünü takip ederdim." Bu cevap, temel memory item'ları içeriyor ancak "thrust'ı keserdim" ifadesi V1 sonrası için yanlıştır. Ayrıca, MAYDAY çağrısı, cabin crew brifi ve PNF/PF rollerinin net ayrımı gibi kritik adımlar eksiktir.
*   **Güçlü:** "V1'i geçtikten sonra engine fire alarmı duyduğumda, ilk 60 saniyeyi şu şekilde yönetirdim: **PF olarak**, immediat olarak **THRUST SET** ve **ROTATE** komutlarını uygulardım. Ardından **GEAR UP**. ECAM, engine fire mesajını gösterecek. **ECAM action** listesindeki ilk memory item'ları (genellikle engine shutdown prosedürü başlangıcı) PF olarak uygularım. Bu sırada **PNF**, **MAYDAY** çağrısını yapar ve altitude assignment talebinde bulunur. Ardından **Cabin Crew Briefing** yapılır. PNF, ECAM action'larının geri kalanını okur ve uygular. Bu süreçte stabil bir climb out attitude korunur." Bu cevap, memory item'ları doğru sıralar, PNF/PF rollerini netleştirir, MAYDAY çağrısı ve cabin crew brifi gibi hayati adımları içerir ve stabil tırmanışa odaklanır.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı, adayın deneyimini sorgulamak yerine, bir senaryo üzerinden yetkinliğini göstermesi için kullanılır. **Situation:** V1 sonrası engine fire. **Task:** Güvenli bir şekilde acil durum prosedürlerini uygulamak ve uçağı stabilize etmek. **Action:** Yukarıda belirtilen 60 saniyelik detaylı prosedür adımları (memory items, MAYDAY, brief, PNF/PF rolleri). **Result:** Uçağın güvenli bir şekilde tırmanışa devam etmesi, durumun kontrol altına alınması ve sonraki adımlar için zemin hazırlanması.

**Havayolu Uyarlama**

Emirates ve Qatar Airways gibi havayolları, operasyonel mükemmelliğe ve en yüksek güvenlik standartlarına büyük önem verir. Bu nedenle, cevapta bu havayollarının güvenlik kültürüne atıfta bulunmak önemlidir. Örneğin, "Emirates'in operasyonel mükemmellik ve sıkı güvenlik protokollerine uygun olarak, bu prosedürleri hatasız uygulamak önceliğimizdir" veya "Qatar Airways'in kapsamlı CRM eğitimlerinin bir parçası olarak, PNF ve PF arasındaki net iletişim ve görev paylaşımı hayati önem taşır" gibi ifadeler kullanılabilir. Bu, adayın havayolunun değerlerini anladığını gösterir.

**Tipik Takip Soruları**

1.  Bu durumla başa çıkarken en büyük zorluk ne olurdu ve bunu nasıl aşardınız?
2.  Eğer PNF (Pilot Not Flying) olarak siz bu durumu deneyimleseydiniz, PF'ye (Pilot Flying) nasıl destek olurdunuz?
3.  ECAM'daki bu spesifik engine fire prosedürünün amacı ve kritik adımları nelerdir?`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın analitik düşünme becerisini, stratejik vizyonunu ve sektör bilgisi derinliğini ölçmeyi hedefler. Adayın problem çözme yeteneği, karmaşık iş modellerini anlama kapasitesi ve şirketin stratejisine dair eleştirel bir bakış açısına sahip olup olmadığı değerlendirilir. Ayrıca, adayın meraklı ve öğrenmeye açık bir profile sahip olup olmadığı da ipuçları verebilir.

**Bu Aşamada Neden Sorulur**

Bu tür stratejik ve bilgiye dayalı sorular genellikle mülakatın ilerleyen aşamalarında, adayın temel nitelikleri ve motivasyonları hakkında yeterli bilgi alındıktan sonra sorulur. Amaç, adayın sadece pozisyon için değil, aynı zamanda şirketin genel stratejisi ve sektörü hakkındaki anlayışını da test etmektir. Bu, adayın şirkete ne kadar entegre olabileceğini gösterir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf**: "Emirates çok sayıda A380 kullanıyor çünkü büyük bir şirket. Bu onların işi." → Bu cevap yüzeyseldir, stratejinin arkasındaki nedenleri açıklamaktan uzaktır ve analitik düşünce eksikliğini gösterir.
*   **Orta**: "Emirates'in A380 stratejisi, Dubai'deki (DXB) büyük hub'ını kullanarak premium yolculara hizmet vermeyi amaçlıyor. A380, çok yolcu taşıyabilen büyük bir uçak." → Bu cevap, DXB hub'ını ve premium yolcu segmentini doğru bir şekilde tanımlar, ancak stratejinin benzersizliğini ve diğer faktörleri (slot kısıtları, marka imajı, maliyetler) tam olarak ele almaz.
*   **Güçlü**: "Emirates'in 119 A380 filosu, sektörde benzersiz bir stratejidir çünkü birkaç kilit faktöre dayanır: 1. **DXB Hub Gücü ve Slot Kısıtları**: Dubai'nin coğrafi konumu ve DXB'deki slot kısıtları, Emirates'in 'point-to-point' yerine 'hub-and-spoke' modelini benimseyerek A380 gibi yüksek kapasiteli uçaklarla aktarmalı trafiği verimli yönetmesini sağlar. 2. **Premium Yolcu Kapasitesi ve Deneyimi**: A380, Emirates'in üst düzey kabin konseptlerini (First Class Suites, Business Class, Onboard Lounge) sunması için ideal bir platformdur. Bu, yüksek gelirli yolcuları çekerek ve elde tutarak marka sadakati oluşturur. 3. **Marka İmajı ve Ölçek Ekonomisi**: A380, Emirates'in küresel ölçekte lüks ve prestij imajını pekiştirir. Büyük filo, bakım ve operasyonel maliyetlerde ölçek ekonomisi sağlayabilir, ancak bu, yüksek doluluk oranları ve premium segmentteki güçlü pazar payı ile dengelenir. Bu strateji, yüksek başlangıç maliyetine rağmen, Emirates'in DXB'yi küresel bir aktarma merkezi olarak konumlandırması ve premium segmentte liderliğini sürdürmesi için stratejik bir yatırımdır."

**STAR Formatı Uygulaması**

Bu soruda STAR formatı doğrudan bir deneyim anlatımı için değil, adayın analitik becerisini ve stratejik düşünce yapısını sergilemek için kullanılır. Aday, "Situation" (Emirates'in A380 stratejisi) ve "Task" (Bu stratejinin neden benzersiz olduğunu açıklama) bölümlerini kullanarak analizini sunar. "Action" ve "Result" kısımları, adayın bu analizden çıkardığı sonuçları ve bu stratejinin havayolu için yarattığı "sonuçları" (rekabet avantajı, marka değeri vb.) vurgulayarak cevap yapısını güçlendirir.

**Havayolu Uyarlama**

Emirates'in A380 stratejisi, **Qatar Airways**'in "Hub-and-Spoke" modelini ve A380'i (daha küçük bir filo ile) premium hizmet sunmak için kullanmasını andırsa da, Emirates'in ölçeği ve DXB'nin merkezi konumu daha belirgindir. **Türk Hava Yolları (THY)** ise, daha çeşitli bir uçak filosuna sahip olup, hem aktarmalı hem de doğrudan uçuşlara odaklanarak daha geniş bir pazar yelpazesine hitap eder. THY'nin stratejisi daha esnektir ancak Emirates'in A380 odaklı premium segmentteki derinliği kadar belirgin bir niş oluşturmaz.

**Tipik Takip Soruları**

*   "Bu stratejinin uzun vadeli sürdürülebilirliği hakkında ne düşünüyorsunuz?"
*   "Emirates'in filosundaki A380'lerin yerini alacak potansiyel uçaklar nelerdir ve bu geçiş nasıl yönetilir?"
*   "Bu stratejinin maliyet-fayda analizi hakkında ne gibi öngörüleriniz var?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın sadece teknik bilgi düzeyini değil, aynı zamanda detaylara verdiği önemi, öğrenme isteğini ve şirketlerine olan ilgisini de ölçmeyi amaçlar. Adayın analitik düşünme yeteneği, problem çözme becerisi ve havacılık teknolojisine olan tutkusu değerlendirilir. Ayrıca, belirli bir uçak tipi hakkında bilgi sahibi olması, şirketin filosuna ve operasyonlarına gösterdiği özenin bir göstergesidir.

**Bu Aşamada Neden Sorulur**

Bu soru genellikle teknik mülakatın veya daha ileri aşamaların başında sorulur. Adayın temel bilgi seviyesini ve havacılık endüstrisindeki güncel gelişmeleri ne kadar takip ettiğini anlamak için kullanılır. Bu aşamada sorulması, adayın potansiyelini ve şirketin operasyonel gerekliliklerine ne kadar uyum sağlayabileceğini hızlıca değerlendirme fırsatı sunar.

**3 Seviyeli Cevap Örneği**

*   **Zayıf**: "Qatar Airways'in A350-1000 uçağı var. Sanırım bu uçaklar büyük ve uzun uçuşlar için. Pilotlar için iyi olmalı."
    *   *Kötü Çünkü*: Bu cevap, herhangi bir spesifik bilgi içermiyor. Uçağın teknik özelliklerinden veya pilotlar için getirdiği yeniliklerden bahsetmiyor. Sadece genel bir yorum.

*   **Orta**: "Qatar Airways'in A350-1000'leri, geniş kabini (XWB) ve kompozit gövdesiyle biliniyor. Bu, uçağı daha hafif ve verimli hale getiriyor. Pilotlar için, daha modern bir kokpite sahip olması önemlidir."
    *   *İyi Ama Eksik*: Temel teknik özelliklere değinilmiş (XWB, kompozit gövde). Ancak, bu özelliklerin pilotlar üzerindeki doğrudan etkileri ve diğer önemli sistemler (FBW, envelope protection) hakkında yeterli detay yok.

*   **Güçlü**: "Qatar Airways'in A350-1000'leri, özellikle pilotlar için birkaç önemli yenilik sunuyor. Öncelikle, %53 oranında kompozit malzeme kullanımıyla üretilen gövdesi, uçağın ağırlığını azaltarak yakıt verimliliğini artırıyor. Bu, uzun menzilli operasyonlar için kritik. İkinci olarak, Rolls-Royce Trent XWB motorları sessiz ve güçlü performansıyla öne çıkıyor. En önemlisi, gelişmiş Fly-By-Wire (FBW) sistemi ve envelope protection özellikleri, uçuş zarfını koruyarak pilotların iş yükünü azaltıyor ve uçuş güvenliğini artırıyor. Bu sistemler, pilotlara daha hassas kontrol sağlarken, aşırı manevraları otomatik olarak engelliyor. Bu da özellikle zorlu hava koşullarında veya acil durumlarda pilotlara büyük avantaj sağlıyor."
    *   *Bu Cevap İşe Yarar*: Bu cevap, uçağın temel teknik özelliklerini (kompozit gövde, Trent XWB motorlar) ve pilotlar için doğrudan faydalarını (FBW, envelope protection, iş yükü azaltma, güvenlik artışı) detaylı bir şekilde açıklıyor. Spesifik teknolojik avantajları somutlaştırıyor.

**STAR Formatı Uygulaması**

Bu soruya STAR formatı doğrudan uygulanmaz çünkü bu bir davranışsal soru değil, bilgi düzeyini ölçen bir sorudur. Ancak, adayın bilgi birikimini ve bu bilgiyi nasıl kullanabileceğini göstermesi beklenebilir. Örneğin, "Bu uçakla ilgili bildiğiniz bir teknolojik özelliği, daha önceki bir uçuş deneyiminizde benzer bir durumla nasıl ilişkilendirebilirsiniz?" gibi bir soruyla STAR'a yaklaştırılabilir.

**Havayolu Uyarlama**

Qatar Airways gibi uzun menzilli operasyonlara odaklanan bir havayolu için A350-1000'in verimliliği ve pilot konforu ön plandadır. Qatar'ın 'World's Best Airline' vizyonu, bu tür ileri teknoloji uçakların filosunda olmasını ve pilotların bu teknolojiyi etkin kullanmasını gerektirir. Bu nedenle, cevabın kompozit yapısı, motor verimliliği ve FBW sistemlerinin operasyonel avantajlarına vurgu yapması, şirketin stratejisiyle uyumlu olacaktır.

**Tipik Takip Soruları**

1.  "Bu advanced FBW sistemlerinin olası dezavantajları neler olabilir?"
2.  "Trent XWB motorlarının bakım gereksinimleri hakkında ne biliyorsunuz?"
3.  "A350'nin, rakip uçaklara (örneğin Boeing 777X) göre avantajları nelerdir?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

HR uzmanı, DLR testini adayların sadece teknik bilgi ve becerilerini değil, aynı zamanda pilotluk için kritik olan psikolojik yatkınlıklarını da ölçmek amacıyla sorar. Bu test, özellikle dikkat, konsantrasyon, karar verme mekanizmaları, stres yönetimi, uzamsal algı ve reaksiyon hızı gibi pilotluk mesleği için olmazsa olmaz temel yetkinlikleri değerlendirir. Bu niteliklerin yüksek olması, hem adayın kendisi hem de yolcuların güvenliği açısından hayati önem taşır.

**Bu Aşamada Neden Sorulur**

DLR testi, genellikle işe alım sürecinin erken aşamalarında, genellikle ilk başvuruların değerlendirilmesi ve temel uygunluğun belirlenmesi sonrasında sorulur. Bu aşamada sorulmasının temel nedeni, pilot adaylığı gibi yüksek maliyetli ve uzun süren bir eğitim programı öncesinde, adayların temel psikometrik gereksinimleri karşılayıp karşılamadığını hızlı ve objektif bir şekilde belirlemektir. Bu, havayolunun kaynaklarını yalnızca en uygun adaylara yönlendirmesini sağlar.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "DLR testi sanırım Almanların yaptığı bir test, pilotlar için."
    *   *Neden Kötü:* Bilgi eksikliği ve konuya ilgisizlik bariz. Testin içeriği, amacı veya Lufthansa ile ilişkisi hakkında hiçbir bilgi sunmuyor. Sadece yüzeysel bir yorum.

*   **Orta Cevap:** "DLR testi, Alman Havacılık ve Uzay Merkezi (DLR) tarafından geliştirilen ve pilot adaylarının bilişsel yeteneklerini ölçen psikometrik bir değerlendirmedir. Lufthansa bu testi kullanır çünkü pilotlarının yetenekli olmasını ister."
    *   *Neden Orta:* Testin ne olduğunu ve kimin geliştirdiğini biliyor. Lufthansa ile bağlantısını kuruyor ancak testin neden "altın standart" olduğunu, neleri ölçtüğünü ve testin sürecindeki yerini yeterince detaylandırmıyor.

*   **Güçlü Cevap:** "DLR testi, Alman Havacılık ve Uzay Merkezi (DLR) tarafından geliştirilen ve iki gün süren kapsamlı bir psikometrik değerlendirme programıdır. Pilot adaylarının karar verme, dikkat, hafıza, stres toleransı ve uzamsal yönelim gibi temel bilişsel ve psikomotor yeteneklerini ölçer. Lufthansa'nın bu testi 'altın standart' olarak kullanmasının nedeni, bu testin pilot seçiminde objektif ve güvenilir bir ölçüt sunmasıdır. Hamburg'da gerçekleştirilen bu test, adayların karmaşık havacılık ortamlarında başarılı olup olamayacaklarını öngörmede kritik bir rol oynar ve bu nedenle Lufthansa, işe alım sürecinin bu önemli aşamasında DLR testini bir ön koşul olarak tutar."
    *   *Neden Güçlü:* Testin adını, geliştiricisini, süresini, içeriğini (neleri ölçtüğünü), yerini (Hamburg) ve Lufthansa için neden "altın standart" olduğunu net bir şekilde açıklıyor. Kapsamlı ve konuya hakim bir cevap.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı doğrudan uygulanmaz çünkü kişisel bir deneyim yerine bilgi sorgulamasıdır. Ancak, adayın DLR testine hazırlanırken veya testi geçerken sergilediği **durum (Situation)**, testin **görevi (Task)**, adayın teste **yaklaşımı (Action)** ve bu yaklaşımın **sonucu (Result)** hakkında konuşarak bir STAR benzeri yapı kurulabilir. Örneğin, "DLR testinin uzamsal yönelim modülünde zorlandığım bir durum oldu. Görevim, karmaşık 3D şekilleri zihnimde döndürerek eşleştirmekti. Bunun için pratik yaparak ve görselleştirme teknikleri geliştirerek (Action) bu modülde başarılı oldum ve genel puanımı yükselttim (Result)."

**Havayolu Uyarlama**

Lufthansa'nın DLR testini kullanması, şirketin Alman mühendislik geleneği ve mükemmeliyetçilik anlayışını yansıtır. Benzer şekilde, Emirates'in kendi zorlu simülatör ve mülakat süreçleri, Qatar Airways'in ise takım çalışması ve hizmet odaklılığa verdiği önem, her havayolunun kendi kültürel değerlerine uygun aday profillerini aradığını gösterir. THY'nin de benzer şekilde hem teknik hem de kültürel uyumu değerlendiren süreçleri vardır.

**Tipik Takip Soruları**

1.  DLR testinin hangi spesifik modüllerinde kendinizi daha güçlü veya zayıf hissettiniz?
2.  Testin stresli ortamında motivasyonunuzu nasıl yüksek tuttunuz?
3.  DLR testinde elde ettiğiniz sonuçların, pilotluk kariyerinizde size nasıl yardımcı olacağını düşünüyorsunuz?`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soruyla insan kaynakları (HR) uzmanı, adayın şirkete, pozisyona ve kariyer hedeflerine ne kadar ilgi gösterdiğini ölçer. Adayın **araştırma becerisi**, **motivasyonu**, **şirket değerleriyle uyumu** ve **uzun vadeli bağlılığı** gibi nitelikler değerlendirilir. Bu, adayın sadece bir iş arayışında olmadığını, bilinçli bir tercih yaptığını gösterir.

**Bu Aşama Neden Sorulur**

Bu soru genellikle mülakatın erken veya orta aşamalarında, adayın temel motivasyonunu ve havayolu seçimine dair bilinç düzeyini anlamak için sorulur. Adayın, havayolunun sunduğu spesifik pilot yetiştirme programının detaylarını bilmesi, bu kariyere olan ciddiyetini ve istekliliğini ortaya koyar.

**3 Seviyeli Cevap Örneği**

*   **Zayıf**: "British Airways'in pilot yetiştirme programı olduğunu duydum. Sanırım pilot olmak için bir yol."
    *   Bu cevap çok geneldir ve adayın program hakkında hiçbir detay bilmediğini gösterir. Havayolunun yatırımını ve adayın bu yatırıma ne kadar değer verdiğini anlamadığını ima eder.
*   **Orta**: "Evet, British Airways'in kendi pilot yetiştirme programı var. Sanırım 18 ay sürüyor ve mezun olunca orada uçabiliyorsunuz."
    *   Bu cevap, adayın temel bilgilerden haberdar olduğunu gösterir (süre, iş garantisi). Ancak L3Harris gibi önemli bir iş ortağından veya programın rekabetçi doğasından bahsetmez.
*   **Güçlü**: "British Airways Pilot Cadetship programı hakkında bilgim var. Bu, havayolunun gelecekteki pilot ihtiyacını karşılamak için L3Harris ile yaptığı bir iş birliğiyle sunulan sponsorlu bir eğitim programı. Adaylar, 18 aylık yoğun bir eğitim sürecinden geçerek, mezuniyet sonrası British Airways'de First Officer olarak kariyerlerine başlama garantisi elde ediyorlar. Bu programın, havayolunun uzun vadeli stratejisi ve yüksek standartlarına bağlılığını gösterdiğine inanıyorum."
    *   Bu cevap, programın sponsorlu doğasını, anahtar iş ortağını (L3Harris), eğitim süresini ve en önemlisi mezuniyet sonrası iş garantisini detaylandırır. Havayolunun stratejik yaklaşımına dair bir yorum eklemesi de adayın derinlemesine araştırma yaptığını gösterir.

**STAR Formatı Uygulaması**

Bu soru doğrudan STAR formatına uygun bir hikaye anlatmayı gerektirmez. Ancak, adayın programa olan ilgisini ve bu programa nasıl *ulaştığını* anlatırken dolaylı olarak STAR'ın ilk adımı olan "Situation" (Durum) ve "Task" (Görev) unsurları hissedilebilir. Örneğin, "Pilotluk kariyeri hedeflediğim bu noktada, en iyi eğitim fırsatlarını araştırırken (Situation), British Airways'in sunduğu bu kapsamlı programı keşfettim (Task)." şeklinde bir giriş yapılabilir.

**Havayolu Uyarlama**

Her havayolunun kendi pilot yetiştirme programı ve kültürü vardır. Emirates'in "Ab-initio" programı veya Qatar Airways'in benzer girişimleri de detaylandırılabilir. Bu soru, adayın sadece BA'yı değil, genel olarak havayolu kariyerlerine dair bilgisini de gösterir. Örneğin, "Benzer şekilde, [Diğer Havayolu Adı]'nın da [Program Adı] gibi kendi yetiştirme programları olduğunu ve bu programların da o havayolunun büyüme stratejisiyle nasıl örtüştüğünü inceledim." gibi bir ekleme yapılabilir.

**Tipik Takip Soruları**

*   "Bu programın sizi neden diğer pilot okullarından veya programlarından daha çok çektiğini düşünüyorsunuz?"
*   "L3Harris ile olan iş birliği hakkında ne düşünüyorsunuz?"
*   "Eğitim sonrası British Airways'de kariyerinizle ilgili beklentileriniz nelerdir?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

HR uzmanı bu soruyla, adayın şirketin temel operasyonel süreçleri ve kariyer yolları hakkında ne kadar bilgi sahibi olduğunu ölçer. Adayın araştırma yapma yeteneği, detaylara verdiği önem, şirkete olan ilgisinin derinliği ve uzun vadeli bağlılığını değerlendirir. Ayrıca, adayın karmaşık bilgileri anlama ve özetleme becerisini de görmek ister.

**Bu Aşamada Neden Sorulur**

Bu soru genellikle mülakatın erken aşamalarında, adayın genel motivasyonunu ve şirkete olan ilgisini anlamak için sorulur. Havayolunun pilot yetiştirme programı gibi spesifik bir konuya hakimiyet, adayın bu kariyere ne kadar ciddi yaklaştığını ve şirketi ne kadar iyi araştırdığını gösterir. Bu, adayın "red flag" olarak kabul edilen bilgi eksikliğini ortaya çıkarabilir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Etihad'ın kendi pilot yetiştirme programı var sanırım. Sanırım bir akademiye gönderiyorlar ve sonra uçuşlara başlıyorsunuz."
    *   *Kötü çünkü:* Bilgi eksikliği bariz. Programın adı, süresi, içeriği hakkında hiçbir detay yok. Sadece varsayımlara dayanıyor.

*   **Orta:** "Etihad, Horizon International Flight Academy aracılığıyla bir cadet pilot programı sunuyor. Mezuniyet sonrası bir type rating ve line training sürecinden geçiliyor."
    *   *İyi ama eksik çünkü:* Temel bileşenleri belirtiyor ancak programın sıfırdan ATPL (Airline Transport Pilot Licence) seviyesinde olduğunu, toplam süresini veya bu süreçlerin detaylarını içermiyor.

*   **Güçlü:** "Etihad'ın Cadet Pilot Programı, sıfırdan başlayan adaylar için kapsamlı bir 'ab initio' ATPL eğitimi sunmaktadır. Bu eğitim, Abu Dabi'deki Horizon International Flight Academy'de gerçekleşir ve genellikle 18-24 ay sürer. Mezuniyetin ardından, havayolunun filosundaki belirli bir uçak tipine yönelik 'type rating' eğitimi ve sonrasında deneyim kazanmak için 'line training' süreci takip edilir. Toplamda bu süreç yaklaşık 3 yıl sürmektedir ve adayları havayolunun operasyonel standartlarına tam uyumlu hale getirmeyi hedefler."
    *   *Bu cevap işe yarar çünkü:* Programın adını, içeriğini (ab initio ATPL), eğitim yerini (Horizon International Flight Academy), temel aşamalarını (type rating, line training), yaklaşık süresini (18-24 ay eğitim + line training = ~3 yıl) ve amacını (operasyonel standartlara uyum) net bir şekilde belirtir.

**STAR Formatı Uygulaması**

Bu soru doğrudan STAR formatı gerektirmese de, adayın bu programı başarıyla tamamladığını varsayarak bir senaryo kurulabilir. Örneğin, "Situation" olarak programa kabul edilmek, "Task" olarak eğitimi başarıyla tamamlamak, "Action" olarak akademi ve line training süreçlerindeki çabası, "Result" olarak da havayolunun güvenilir bir pilotu olmak şeklinde yapılandırılabilir. Bu, adayın şirketin değerlerini ve beklentilerini anladığını gösterir.

**Havayolu Uyarlama**

Etihad'ın bu programı, havayolunun prestijli ve küresel bir marka olma vizyonunu yansıtır. Qatar Airways'in QCAP programı veya Emirates'in pilot yetiştirme programları gibi, Etihad da kendi standartlarında, yüksek kaliteli pilotlar yetiştirmeyi hedefler. Bu program, adayların sadece teknik becerilere değil, aynı zamanda Etihad'ın misafirperverlik ve mükemmellik kültürüne de uyum sağlamasını amaçlar.

**Tipik Takip Soruları**

*   Bu programı neden seçtiniz ve Etihad'a uzun vadeli bağlılığınız hakkında ne söyleyebilirsiniz?
*   Horizon International Flight Academy'nin eğitim müfredatı hakkında ne biliyorsunuz?
*   Type rating ve line training aşamalarında karşılaşabileceğiniz zorluklar nelerdir ve bunları nasıl aşmayı planlıyorsunuz?`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın stres altında problem çözme yeteneğini, analitik düşünme becerisini ve risk yönetimi yaklaşımını ölçmeyi hedefler. Adayın baskı altında sakin kalabilme, detaylara dikkat etme, planlama yapma ve ekip çalışmasına yatkınlığını değerlendiren 3-4 temel nitelik öne çıkar: **Durumsal Farkındalık (Situational Awareness), Analitik Beceriler, Proaktif Planlama ve İletişim/Takım Çalışması.**

**Bu Aşama Neden Sorulur?**

Genellikle mülakatın ortalarında, adayın temel teknik ve davranışsal yetkinliklerinin bir kısmının değerlendirildiği bir aşamada sorulur. Bu tür senaryo bazlı sorular, adayın teorik bilgisini pratik durumlara nasıl uygulayabildiğini görmek ve karmaşık operasyonel zorluklarla başa çıkma potansiyelini anlamak için kullanılır.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Sıcakta uçmak zor olurdu, dikkatli olurdum." → Bu cevap, sorunun gerektirdiği detayları ve proaktif adımları içermediği için zayıftır. Yüzeysel bir farkındalık gösterir.

*   **Orta:** "Performans hesaplamalarını yapardım, yeterli yakıt alırdım ve sıcaklığın etkisini bilirdim." → Bu cevap, temel önlemleri içerir ancak derate seçenekleri, yakıt sıcaklığı takibi, density altitude'un detaylı etkileri ve CRM'in rolü gibi kritik unsurları atlar.

*   **Güçlü:** "Öncelikle, **performance calculations** için hem 'derate' hem de 'full thrust' seçeneklerini değerlendirerek en güvenli ve ekonomik yaklaşımı belirlerdim. **Density altitude**'un 45°C üzerindeki havalarda ne kadar yükseleceğini ve bunun takeoff run'ı nasıl etkileyeceğini hesaplardım (ICAO Doc 9432'ye uygun olarak). **Fuel temperature**'ın kritik seviyelere düşmesini engellemek için gerekli önlemleri planlardım. **CRM** (Crew Resource Management) prensipleri çerçevesinde, özellikle hac sezonunun getireceği yorgunluk ve yüksek trafik baskısı altında ekip içi iletişimin ve farkındalığın önemini vurgular, olası aksaklıklara karşı yedek planlarımı gözden geçirirdim. Herhangi bir şüphe durumunda dispatch ile sürekli iletişimde kalırdım." → Bu cevap, sorulan tüm kritik noktaları (performance, fuel temp, density altitude, CRM, yorgunluk) detaylı ve somut adımlarla ele alır.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı, adayın geçmişte benzer bir durumla nasıl başa çıktığını anlatmasını sağlamak için idealdir:
*   **Situation:** Hac sezonunda, yüksek sıcaklık ve yoğun trafik gibi zorlu koşulların olduğu bir dönem.
*   **Task:** Güvenli ve verimli bir operasyon sağlamak.
*   **Action:** Yukarıdaki 'güçlü' cevapta belirtilen tüm proaktif ve reaktif adımları uygulamak.
*   **Result:** Güvenli bir kalkış ve uçuş gerçekleştirmek, olası riskleri minimize etmek.

**Havayolu Uyarlama**

Saudia gibi bir havayolunda, özellikle hac döneminde operasyonel mükemmellik ve yolcu güvenliği en üst düzeydedir. Bu nedenle, "derate" seçeneklerinin etkin kullanımı, yakıt verimliliği ve sıkı operasyonel prosedürlere uyum (EASA Part-145 standartları paralelinde) öne çıkar. Ekip içi uyum ve kültürel hassasiyetler de CRM'in bir parçası olarak vurgulanmalıdır.

**Tipik Takip Soruları**

1.  "Eğer kalkış sırasında bir motor arızası yaşansaydı, bu koşullar altında nasıl bir tepki verir-diniz?"
2.  "Bu tür zorlu koşullarda pilot yorgunluğuyla nasıl mücadele edersiniz?"
3.  "Dispatch ile iletişimde hangi bilgileri önceliklendirirdiniz?"`,
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
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soruyla HR uzmanı, adayın stres altındaki problem çözme yeteneğini, soğukkanlılığını ve kritik durumlarda karar verme becerisini ölçer. Soru, adayın havacılık bilgisi kadar, kriz yönetimi ve iletişim becerilerini de değerlendirmeyi hedefler. Ölçülen nitelikler: Analitik düşünme, acil durum prosedürlerine hakimiyet, ekip çalışması ve sorumluluk alma.

**Bu Aşamada Neden Sorulur**

Bu türden teknik ve durumsal sorular, mülakatın genellikle teknik bilgi aşamasında veya sonlarına doğru sorulur. Adayın hem teorik bilgisini hem de pratik uygulama becerisini, yoğun bir baskı altında nasıl sergilediğini görmek için idealdir. Bu, adayın gerçek operasyonel zorluklara ne kadar hazır olduğunu anlamak için önemlidir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Bilmiyorum, sanırım bir şeyler yapardım ama ne olduğunu tam hatırlamıyorum."
    → Kötü çünkü bu cevap, adayın temel acil durum prosedürlerinden habersiz olduğunu ve stres altında panikleyebileceğini gösterir. Havacılıkta bu tür belirsizlik kabul edilemez.

*   **Orta:** "CPDLC kesilirse, HF radyo kullanırız herhalde. Bir pozisyon raporu verirdim."
    → İyi ama eksik. HF radyo kullanımını doğru bilse de, standart pozisyon raporu formatını, ilgili frekansları (Shanwick/Gander) ve ADS-C kontrolünü belirtmemiş. Bu, prosedürlerin yüzeysel bilindiğini gösterir.

*   **Güçlü:** "CPDLC kesintisi durumunda öncelikli aksiyonum, HF radyo üzerinden derhal ilgili ATC birimi ile (bu durumda Shanwick veya Gander kontrol) iletişime geçmek olurdu. ICAO Doc 9432'de belirtildiği gibi, standart pozisyon raporu formatını kullanarak uçağın çağrı işareti, pozisyonu, irtifası, rotası ve ETA'sını iletirdim. Aynı zamanda, ADS-C (Automatic Dependent Surveillance-Contract) sisteminin de çalışıp çalışmadığını kontrol eder, herhangi bir aksaklık olup olmadığını teyit ederdim. Bu, hem hava trafik kontrolüne durumu bildirmek hem de uçuş emniyetini sağlamak için kritik bir adımdır."
    → Bu cevap, adayın hem prosedür bilgisine (HF, pozisyon raporu formatı, ADS-C) hem de ilgili dokümanlara (ICAO Doc 9432) hakim olduğunu gösterir. Shanwick/Gander gibi spesifik frekanslara değinmesi ve durumu sistematik bir şekilde ele alması, adayın soğukkanlı ve yetkin olduğunu kanıtlar.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı şu şekilde uygulanabilir:
*   **Situation (Durum):** IST-JFK uçuşunda North Atlantic Track'e girerken CPDLC bağlantısının kesilmesi.
*   **Task (Görev):** Uçuş emniyetini sağlamak ve hava trafik kontrolü ile iletişimi sürdürmek.
*   **Action (Aksiyon):** Yukarıda güçlü cevap örneğinde belirtilen adımları uygulamak (HF kullanımı, pozisyon raporu, ADS-C kontrolü).
*   **Result (Sonuç):** İletişimin yeniden kurulması, uçuşun güvenli bir şekilde devamının sağlanması ve olası bir sorunun önlenmesi.

**Havayolu Uyarlama**

Turkish Airlines (THY) gibi köklü bir havayolu için bu sorudaki cevap, THY'nin emniyet odaklı kültürünü yansıtmalıdır. THY'nin "Güvenli Uçuşlar, Mutlu Yolcular" misyonuyla uyumlu olarak, adayın prosedürlere titizlikle uyması ve her zaman emniyeti önceliklendirmesi vurgulanmalıdır. Emirates veya Qatar Airways gibi küresel oyuncularla karşılaştırıldığında, THY'nin operasyonel verimliliği ve uluslararası standartlara uyumu bu cevapta öne çıkarılabilir.

**Tipik Takip Soruları**

1.  Eğer HF radyo ile de iletişim kuramazsanız ne yapardınız?
2.  CPDLC'nin kesilmesine neden olabilecek olası teknik arızalar nelerdir?
3.  Bu tür bir durumla ilgili daha önce bir simülasyon veya eğitim aldınız mı?`,
  },
];

/**
 * Tüm soru bankası — core + extra dosyaları birleştir.
 */
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  ...CORE_QUESTIONS,
  ...CABIN_EXTRA_QUESTIONS,
  ...PILOT_EXTRA_QUESTIONS,
  ...ROLES_EXTRA_QUESTIONS,
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

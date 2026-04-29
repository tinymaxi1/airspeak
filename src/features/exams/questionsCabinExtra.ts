/**
 * Genişletilmiş Kabin Memuru Mülakat Soruları (40+).
 * Kategoriler: motivation, behavioral, situational, role-play, tricky, english.
 */
import type { InterviewQuestion } from './airlineTypes';

export const CABIN_EXTRA_QUESTIONS: InterviewQuestion[] = [
  // ═══════════ MOTIVATION & BACKGROUND ═══════════
  {
    id: 'qc_m1',
    category: 'motivation',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Tell me about yourself in 2 minutes.',
    difficulty: 2,
    goodAnswerPointsTr: [
      'Present-Past-Future yapısı (şu anda ne yapıyorsun, geçmişte ne, gelecek hedef)',
      'Kabin crew\'a uyan beceriler vurgu (servis, ekip, çoklu görev)',
      '90 saniye optimum',
      'Net açılış + kapanış',
    ],
    redFlagsTr: ['Tüm CV oku', 'Özel hayat detayı', '5 dakika sürdür', 'Negatif geçmiş anlat'],
    sampleAnswerTr: 'Ben Ayşe, 26 yaşında, 4 yıllık otelcilik deneyimine sahibim. Halen Marriott\'ta concierge supervisor olarak 8 kişilik ekip yönetiyorum — günde 200+ misafir çıkışı koordine ediyorum. Önceden Anadolu Üniversitesi Turizm İşletmeciliği mezunuyum, Erasmus\'la İspanya\'da 6 ay servis sektörü deneyimledim. İngilizce + İspanyolca + Türkçe rahat. Kabin crew rolüne geçmek istiyorum çünkü 5 yıldızlı servis felsefem havada da geçerli, ama daha global bir alan istiyorum.',
    modelAnswerEn: 'I\'m Ayşe, 26 years old, with 4 years in hospitality. Currently I\'m a concierge supervisor at Marriott Istanbul, leading an 8-person team and coordinating 200+ daily check-outs. I graduated from Anadolu University tourism program, studied 6 months in Spain via Erasmus, and I\'m fluent in Turkish, English, and Spanish. I want to transition to cabin crew because my 5-star service mindset translates directly to in-flight service, but I crave a more global environment.',
    tipsTr: ['90 saniye dene', 'Ayna karşısında pratik', 'STAR sona sakla'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın öz farkındalığını, iletişim becerilerini ve pozisyona olan motivasyonunu anlamak için kullanılır. İşe alım uzmanları, bu kısa sunum aracılığıyla adayın kendine güvenini, anahtar niteliklerini (örneğin, problem çözme, ekip çalışması, müşteri odaklılık) ne kadar etkili vurgulayabildiğini ve şirketin değerleriyle ne kadar örtüştüğünü değerlendirir. Ayrıca, adayın stres altında net ve özlü bir şekilde konuşabilme yeteneğini de ölçer.

**Bu Aşamada Neden Sorulur?**

Genellikle mülakatın başında sorulan bu soru, buzları eritmek ve adayın genel bir izlenimini oluşturmak için idealdir. Adayın kendini tanıtmasıyla birlikte, mülakatı yapan kişi adayın CV'sindeki bilgileri doğrulamış olur ve adayın sunduğu bilgilerin mülakatın ilerleyen kısımlarında derinlemesine incelenmesi için bir temel oluşturur. Bu aşama, adayın profesyonel kimliği ve pozisyona uygunluğu hakkında ilk değerlendirmenin yapıldığı kritik bir noktadır.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "Merhaba, ben Mehmet. 25 yaşındayım ve üniversiteden yeni mezun oldum. Havacılık sektöründe çalışmak istiyorum çünkü uçakları seviyorum ve seyahat etmek güzel."
    *   **Neden Zayıf:** Bu cevap son derece genel, motivasyon eksikliği barındırıyor ve adayın herhangi bir ilgili becerisini veya deneyimini vurgulamıyor. "Uçakları sevmek" veya "seyahat etmek" profesyonel bir motivasyon olarak kabul edilmez.

*   **Orta Cevap:** "Ben Ayşe, 26 yaşında, 4 yıllık otelcilik deneyimine sahibim. Şu anda bir otelde supervisor olarak çalışıyorum ve misafirlerle iletişim kurmayı seviyorum. Bu pozisyona başvuruyorum çünkü insanlarla çalışmayı seviyorum ve yeni bir kariyer hedefliyorum."
    *   **Neden Orta:** Aday, deneyiminden ve insanlarla iletişim kurma becerisinden bahsediyor. Ancak, bu becerilerin kabin ekibi rolüyle doğrudan nasıl örtüştüğü, çoklu görev yeteneği veya acil durum yönetimi gibi havacılığa özgü nitelikler yeterince vurgulanmamış. "Yeni bir kariyer hedefliyorum" ifadesi de biraz belirsiz kalıyor.

*   **Güçlü Cevap:** "Merhaba, ben Can. 28 yaşındayım ve son 5 yıldır uluslararası bir otelde misafir ilişkileri yöneticisi olarak görev yapmaktayım. Bu rolümde, günde ortalama 150 misafirin taleplerini karşılarken, 10 kişilik bir ekibin koordinasyonunu sağladım ve misafir memnuniyetini %95'in üzerinde tutmayı başardım. Anadolu Üniversitesi Turizm ve Otelcilik mezunuyum ve Erasmus programıyla İspanya'da aldığım 6 aylık servis deneyimimle iletişim becerilerimi pekiştirdim. Özellikle acil durumlarda sakin kalabilme ve hızlı karar alma yeteneğimi, otelde yaşanan bir yangın alarmı sırasında misafirlerin tahliyesini başarıyla yönettiğim bir olayda kanıtladım. Havayolunuzun 'güvenlik ve mükemmel misafir deneyimi' değerlerine olan bağlılığı, benim 5 yıldızlı servis anlayışımla birebir örtüşüyor. Kabin ekibi olarak, edindiğim bu operasyonel ve müşteri odaklı deneyimi küresel bir platformda, misafirlerinize güvenli ve konforlu bir uçuş deneyimi sunarak değerlendirmek istiyorum."
    *   **Neden Güçlü:** Bu cevap, Present-Past-Future yapısını kullanıyor, somut başarılar (misafir sayısı, memnuniyet oranı) sunuyor, kritik becerileri (ekip yönetimi, problem çözme, acil durum yönetimi) vurguluyor ve havayolunun değerleriyle uyumunu net bir şekilde belirtiyor. STAR formatına uygun bir mini örnek içeriyor ve profesyonel bir gelecek vizyonu çiziyor.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı, adayın geçmiş deneyimlerinden somut bir örnek sunarak becerilerini göstermesi için kullanılır. "Situation" (durum) ve "Task" (görev) genellikle adayın mevcut veya geçmiş rolünü tanımlarken, "Action" (eylem) adayın nasıl davrandığını ve "Result" (sonuç) ise bu eylemlerin olumlu neticelerini ifade eder. Örneğin, "Bir keresinde yolcu şikayetlerinin yoğunlaştığı bir zamanda..." (Situation), "...tüm ekibi motive ederek durumu kontrol altına almam gerekiyordu." (Task), "...her yolcuyla birebir ilgilendim ve sorunlarını çözmek için ekibimle koordineli çalıştım." (Action), "...sonuç olarak yolcu memnuniyeti arttı ve şikayetler azaldı." (Result).

**Havayolu Uyarlaması**

Her havayolunun kendine özgü bir kültürü ve değerleri vardır. Örneğin, Emirates'in "global bağlantı" ve "yenilikçilik" vurgusu, Qatar Airways'in "lüks" ve "mükemmeliyetçilik" anlayışı veya Türk Hava Yolları'nın "misafirperverlik" ve "güvenlik" odaklılığı dikkate alınmalıdır. Aday, kendi deneyimlerinden örnekler verirken bu spesifik değerlere atıfta bulunmalı ve bu değerlerin kendisiyle nasıl örtüştüğünü açıklamalıdır. Örneğin, "Emirates'in farklı kültürleri bir araya getirme vizyonu, benim uluslararası otelcilik deneyimimle örtüşüyor..." gibi.

**Tipik Takip Soruları**

*   "Bahsettiğiniz acil durum yönetimi becerinizi daha detaylı anlatır mısınız?"
*   "Ekibinizi motive etmek için kullandığınız spesifik yöntemler nelerdi?"
*   "Havacılık sektöründe çalışmak istemenizin arkasındaki temel motivasyonunuz nedir ve bu rolün kariyer hedeflerinizle nasıl örtüştüğünü düşünüyorsunuz?"`,
  },
  {
    id: 'qc_m2',
    category: 'motivation',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Where do you see yourself in 5 years?',
    difficulty: 3,
    goodAnswerPointsTr: [
      'Şirket içi gerçekçi kariyer (purser → cabin manager)',
      'Şirkete bağlı kal — başka kariyer istemiyorsun ima',
      'Skill gelişim hedefi (eğitmen, dil, sertifika)',
      'Şirket ile uzun dönem',
    ],
    redFlagsTr: ['"Pilot olacağım" — kabin sözü vermiyor demektir', '"Belki kendi işim" — flight risk', '"Bilmiyorum"'],
    sampleAnswerTr: 'İlk 2 yıl junior cabin crew olarak deneyim biriktirmek, sonra purser sertifikasyonuna girmek istiyorum. 5. yılda inflight trainer rolüne geçerek hem uçuş hem yeni nesil eğitiminde olmak hedefim. THY\'nin trainer akademisi içinde gelişim yolu çok uygun.',
    tipsTr: ['Şirket içi yol harita bil', 'Realistik sürede kal', 'Şirkete sadakat'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

HR uzmanları bu soruyu, adayın motivasyonunu, kariyer hedeflerinin gerçekçiliğini, şirkete bağlılığını ve uzun vadeli potansiyelini anlamak için sorar. Ölçülen temel nitelikler arasında proaktiflik, öğrenme isteği, liderlik potansiyeli ve şirketin değerleriyle uyumluluk yer alır. Bu, adayın sadece mevcut rolü değil, gelecekteki potansiyel katkısını da değerlendirme fırsatı sunar.

**Bu Aşamada Neden Sorulur?**

Bu soru genellikle mülakatın ortalarına doğru sorulur. Adayın temel beceri ve deneyimleri değerlendirildikten sonra, şirkete ne kadar uygun olduğu ve uzun vadede nasıl bir değer katabileceği anlaşılmaya çalışılır. Bu noktada sorulması, adayın önceki cevaplarının ışığında kariyer hedeflerini ne kadar iyi şekillendirdiğini görmeyi sağlar.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Bilmiyorum, belki başka bir şirkete geçerim ya da farklı bir sektörde çalışırım." Bu cevap, şirkete bağlılık eksikliğini ve belirsiz bir gelecek vizyonunu gösterdiği için olumsuzdur. Adayın motivasyonu ve şirkette kalma isteği sorgulanır.

*   **Orta:** "5 yıl içinde daha tecrübeli bir kabin memuru olmak ve belki bir purser pozisyonuna yükselmek istiyorum. Yeni diller öğrenerek kendimi geliştirmeyi de planlıyorum." Bu cevap, gelişim isteğini gösterse de, şirkete özel bir hedef ve somut bir gelişim planı sunmaktan uzaktır. Daha net bir vizyon eksikliği vardır.

*   **Güçlü:** "Önümüzdeki iki yıl boyunca temel kabin memuru görevlerimde mükemmellik göstermeyi ve ICAO Annex 1'de belirtilen standartlara uygun olarak operasyonel becerilerimi derinleştirmeyi hedefliyorum. Üçüncü yılımda, havayolumuzun sunduğu purser eğitim programına katılmayı ve bu rolde sorumluluk almayı arzu ediyorum. Beşinci yılımda ise, kabin ekibine mentorluk yapabileceğim ve özellikle yeni nesil kabin memurlarının eğitimine katkı sağlayabileceğim bir 'Lead Cabin Crew' veya 'Trainer' pozisyonuna ulaşmayı umuyorum. Bu, şirketin müşteri memnuniyeti ve operasyonel verimlilik hedeflerine doğrudan katkı sağlayacaktır." Bu cevap, somut hedefler, şirketin gelişim yollarıyla uyum ve uzun vadeli bağlılık gösterir.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı doğrudan uygulanmasa da, cevap yapılandırılırken STAR’ın temel mantığı kullanılır. "Durum (Situation)" adayın mevcut pozisyonu, "Görev (Task)" ise kariyer hedefleridir. "Eylem (Action)" bu hedeflere ulaşmak için atılacak adımları (eğitimler, sertifikalar) ve "Sonuç (Result)" ise bu hedeflere ulaşıldığında şirkete ve adaya sağlayacağı faydayı temsil eder.

**Havayolu Uyarlama**

Cevap, başvurulan havayolunun kültürüne ve kariyer gelişim olanaklarına göre uyarlanmalıdır. Örneğin, Emirates'in uluslararası ortamı ve çeşitliliği vurgulanabilirken, THY'nin "Milli Havayolu" kimliği ve iç eğitim akademileri öne çıkarılabilir. Qatar Airways'in "5-Star Airline" vizyonuna paralel olarak, müşteri deneyimini iyileştirmeye yönelik liderlik hedefleri belirtilebilir.

**Tipik Takip Soruları**

*   "Bu hedeflere ulaşmak için hangi adımları atmayı planlıyorsunuz?"
*   "Eğer bu pozisyonlar mevcut değilse, kariyer planınızı nasıl şekillendirirsiniz?"
*   "Şirketimizin değerlerinden hangileri, kariyer hedeflerinizle en çok örtüşüyor?"`,
  },
  {
    id: 'qc_m3',
    category: 'motivation',
    roles: ['cabin'],
    airlineIds: [],
    question: 'What would you do if you were not selected today?',
    difficulty: 3,
    goodAnswerPointsTr: [
      'Pozitif kal — hayal kırıklığı kabul et ama ümitle bitir',
      'Feedback iste, eksiği gör',
      'Tekrar başvurma niyeti (genelde 6 ay bekleme)',
      'O zamana kadar gelişim planı',
    ],
    redFlagsTr: ['"Başka şirkete giderim" — sadakatsiz', 'Saldırgan/üzgün ton', '"Bilmem"'],
    sampleAnswerTr: 'Kabul ederim, fırsat çoktan beklenir. Önce HR\'dan gelişim alanı feedback isterdim. Sonraki 6 ayda İngilizcemi C1\'e çıkarır, ek bir dil (Arapça pratik) eklerdim. 6 ay sonra başvurmayı planlardım — çünkü bu şirkette çalışmak benim için sadece bir iş değil hedef.',
    tipsTr: ['Olgunluk göster', 'Geri bildirim talep et', 'Yeniden başvurma planı'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

HR uzmanları bu soruyu adayların stres yönetimi, dayanıklılık (resilience), problem çözme becerisi ve şirkete olan bağlılıklarını ölçmek için sorar. Adayın olumsuz bir duruma nasıl tepki verdiğini görmek, geri bildirimlere ne kadar açık olduğunu ve gelişim için ne kadar motive olduğunu anlamak hedeflenir. Ayrıca, adayın kariyer hedeflerinin şirketinkilerle ne kadar örtüştüğünü de değerlendirirler.

**Bu Aşamada Neden Sorulur?**

Bu soru genellikle mülakatın sonlarına doğru, adayın teknik becerileri ve genel uygunluğu hakkında bir fikir edinildikten sonra sorulur. Bu aşamada sorulmasının nedeni, adayın baskı altında nasıl düşünebildiğini, duygusal zekasını ve şirketin değerleriyle uyumunu daha derinlemesine anlamaktır. Adayın olumsuz bir senaryoda bile profesyonel ve yapıcı kalabildiğini görmek önemlidir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Eğer seçilmezsem üzülürüm ama başka bir şirkete başvururum. Bu kadar."
    *   *Kötü çünkü:* Bu cevap hayal kırıklığını ifade etmekle birlikte, olumsuz bir duruma karşı pasif bir yaklaşım sergiliyor. Gelişim isteği ve şirkete bağlılık eksikliği göze çarpıyor. "Başka şirkete giderim" ifadesi sadakatsizlik olarak algılanabilir.

*   **Orta:** "Bugün seçilmezsem hayal kırıklığı yaşarım ama bunu anlarım. İK'dan neden seçilmediğime dair geri bildirim isterim ve kendimi geliştirmeye çalışırım. Birkaç ay sonra tekrar başvururum."
    *   *İyi ama eksik:* Adayın geri bildirim istemesi ve gelişim niyeti olumlu. Ancak gelişim planı yeterince spesifik değil ve şirkete olan bağlılık daha güçlü vurgulanabilir. "Birkaç ay sonra" belirsizliği de zayıf bir nokta.

*   **Güçlü:** "Bugün seçilmemeniz durumunda, öncelikle bu karara saygı duyarım. Elbette bir miktar hayal kırıklığı yaşardım ancak bu durumun beni yıldırmasına izin vermem. Hemen İK departmanından, hangi alanlarda eksiklerim olduğunu ve gelişimime katkı sağlayacak geri bildirimleri rica ederim. Bu geri bildirimleri temel alarak, önümüzdeki altı aylık süreçte kendimi geliştirmeye odaklanırım. Örneğin, havacılık İngilizcesi seviyemi C1'e çıkarmak için yoğun bir çalışma planı uygular, ICAO Doc 9432'deki iletişim protokollerini daha derinlemesine incelerim. Ayrıca, seyahat ettiğim bir ülkede pratik yapma fırsatı bulduğum Arapça gibi ek bir dil becerisi edinmeye çalışırım. Altı ay sonra, bu gelişimlerimle birlikte tekrar başvurmak isterim, çünkü [Havayolu Adı]'nın [Değer 1, örn: güvenlik kültürü] ve [Değer 2, örn: müşteri odaklı hizmet anlayışı] gibi değerlerine inanıyor ve bu ekibin bir parçası olmayı bir kariyer hedefi olarak görüyorum."
    *   *Bu cevap işe alır çünkü:* Adayın olumlu bir çerçeve çizdiğini, geri bildirim istediğini, somut ve ölçülebilir bir gelişim planı olduğunu ve şirkete güçlü bir bağlılık gösterdiğini kanıtlar. Belirli havacılık terminolojisi ve standartlarına atıfta bulunması, sektöre olan ilgisini ve bilgisini gösterir.

**STAR Formatı Uygulaması**

Bu soruya STAR formatı doğrudan uygulanmaz, çünkü bu bir davranışsal soru değil, hipotetik bir senaryodur. Ancak, STAR'ın ardındaki mantık – geçmiş deneyimlerden ders çıkarmak – kullanılabilir. Aday, geçmişte benzer bir hayal kırıklığı yaşadığında (Situation), ne yapması gerektiğini düşündüğünde (Task), nasıl bir gelişim planı oluşturduğunda (Action) ve bunun sonucunda ne elde ettiğinde (Result) odaklanabilir. Bu, adayın problem çözme ve gelişim yeteneğini gösterir.

**Havayolu Uyarlama**

Bu cevap, başvurulan havayolunun değerlerine göre uyarlanmalıdır. Örneğin, Emirates'in global çeşitliliğe ve kültürel uyuma vurgu yapmasına karşılık, güvenlik odaklı bir havayolu için "güvenlik kültürüne katkı sağlama" vurgusu yapılabilir. Qatar Airways'in "Five-Star" hizmet anlayışına atıfta bulunularak müşteri hizmetleri becerileri öne çıkarılabilir. THY'nin "dünyanın en çok ülkesine uçan havayolu" olma misyonuna değinerek küresel bağlantı ve çeşitlilik vurgusu yapılabilir.

**Tipik Takip Soruları**

*   "Bahsettiğiniz altı aylık gelişim planınızda, hangi spesifik havacılık kaynaklarını (örn. EASA Part-145, FAA AC) kullanacaksınız?"
*   "Daha önce aldığınız bir geri bildirimi nasıl uyguladığınıza dair bir örnek verebilir misiniz?"
*   "Eğer bu pozisyon yerine başka bir departmanda bir pozisyon açılırsa ilgilenir misiniz?"`,
  },
  {
    id: 'qc_m4',
    category: 'cv_based',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Why did you leave your last job?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Pozitif framework — sebep "büyüme/öğrenme" odaklı',
      'Eski işveren kötülenmez',
      'Yeni rolde ne kazanacağına odaklan',
      'Dürüstlük + diplomatik',
    ],
    redFlagsTr: ['Eski patron kötüleme', '"Para az" — kötü görünür', '"Sıkıldım"', 'Çatışma anlat'],
    sampleAnswerTr: 'Marriott\'ta 4 yıl sonra benim için yeni meydan okuma zamanı geldi. Otelcilikte servis becerilerimi geliştirdim, ama global ölçekte çalışmak — bir gün Tokyo\'da, ertesi gün Londra\'da yolcuyla buluşmak — bir sonraki adım. Marriott\'tan ayrılırken iyi ilişkiler korudum, üç ay önceden bilgi verdim.',
    tipsTr: ['"Pull factor" üzerinde dur, "push" değil', 'Profesyonel ayrılış vurgu'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

HR uzmanları bu soruyu adayların profesyonel olgunluğunu, problem çözme becerilerini ve kariyer hedeflerinin netliğini ölçmek için sorar. Adayın geçmişteki deneyimlerinden ders çıkarma yeteneğini, potansiyel çatışma veya memnuniyetsizlik durumlarında nasıl davrandığını ve yeni bir pozisyona ne kadar motive olduğunu anlamaya çalışırlar. Bu soruyla, adayların dürüstlük, sadakat, uyum sağlama yeteneği ve gelişim odaklılık gibi nitelikleri değerlendirilir.

**Bu Aşamada Neden Sorulur**

Bu soru genellikle mülakatın orta veya sonlarına doğru, adayın genel uygunluğu ve geçmiş deneyimleri hakkında fikir edindikten sonra sorulur. Adayın motivasyonunu, kariyer ilerlemesine bakışını ve şirkete olan uyumunu daha derinlemesine anlamak için kritik bir zamandır. Bu noktada, adayın önceki iş deneyimlerinin yeni rol için ne kadar uygun olduğunu ve şirketin değerleriyle ne kadar örtüştüğünü değerlendirmek hedeflenir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "Eski patronumla anlaşamıyordum ve iş yerinde sürekli bir gerginlik vardı. Bu yüzden ayrıldım, daha sakin bir yer arıyorum."
    *   **Kötü Çünkü:** Eski işveren veya patronu karalamak, adayın çatışma çözme becerilerinden yoksun olduğunu ve potansiyel olarak sorunlu bir çalışan olabileceğini düşündürür. Negatif bir izlenim bırakır.

*   **Orta Cevap:** "Eski işimde 4 yıl çalıştım ve birçok şey öğrendim. Ancak, kariyerimde ilerlemek ve daha fazla sorumluluk almak istiyordum. Bu yüzden daha iyi bir fırsat arayışına girdim."
    *   **İyi Ama Eksik:** Pozitif bir yaklaşım sergiliyor ve ilerleme isteğini belirtiyor. Ancak, "daha iyi bir fırsat" ifadesi belirsizdir ve adayın ne aradığını netleştirmez. Yeni rol için spesifik bir motivasyon içermiyor.

*   **Güçlü Cevap:** "Önceki rolümde [Önceki Şirket Adı]'nda [Süre] boyunca [Öğrendiğiniz veya Başardığınız Şeyler] konusunda değerli deneyimler kazandım. Ancak, özellikle [Havayolu Adı]'nın [Şirket Kültürü/Değeri Vurgusu, örn: yolcu odaklılığı, operasyonel mükemmelliği, küresel ağı] konusundaki yaklaşımı beni her zaman etkilemiştir. Bu şirkette, [Yeni Rolde Kazanmak İstediğiniz Şey, örn: küresel operasyonlarda yer alma, yenilikçi teknolojilerle çalışma, uluslararası ekiplerle etkileşim kurma] gibi alanlarda kendimi daha fazla geliştirme ve katkıda bulunma fırsatı bulacağıma inanıyorum. Bu nedenle, kariyerimde bir sonraki adımı atmak için bu pozisyona başvurdum."
    *   **İşe Alır Çünkü:** Pozitif, yapıcı ve geleceğe odaklıdır. Eski işveren hakkında olumsuz konuşmaz, öğrenme ve gelişim isteğini vurgular. Yeni şirketin değerlerine ve hedeflerine uygunluğunu somut örneklerle belirtir ve bu role neden başvurduğunu netleştirir.

**STAR Formatı Uygulaması**

Bu soruya doğrudan STAR formatı uygulanmaz çünkü geçmiş bir olayı anlatmaktan çok, bir durumu ve motivasyonu açıklamayı hedefler. Ancak, adayın ayrılma nedenini açıklarken STAR'ın "Sonuç" (Result) veya "Durum" (Situation) bölümlerinden ilham alabilir. Örneğin, "Önceki pozisyonumdaki gelişim alanlarımın sınırlandığını fark ettiğimde (Situation), şirket içinde yeni projeler üstlenmek istedim (Task). Ancak bu fırsatlar sınırlıydı (Action). Bu durum, kariyerimde daha fazla büyüme potansiyeli olan bir yola girmem gerektiği sonucuna varmamı sağladı (Result)." Bu yapı, ayrılma nedenini daha yapılandırılmış bir şekilde sunmaya yardımcı olabilir.

**Havayolu Uyarlama**

Bu cevap, başvurulan havayolunun spesifik değerleri ve hedefleri doğrultusunda uyarlanmalıdır. Örneğin, Emirates'in küresel ağı ve çeşitliliğe verdiği önemden, Qatar Airways'in "Beş Yıldızlı Havayolu" vizyonundan veya THY'nin Türkiye'nin bayrak taşıyıcısı olarak misyonundan bahsedilebilir. Aday, "Emirates'in farklı kültürlerden gelen yolculara sunduğu üstün hizmet deneyimini desteklemek ve bu küresel ekibin bir parçası olmak istiyorum" veya "Qatar Airways'in operasyonel verimliliğini ve yolcu memnuniyetini artıran projelere katkıda bulunarak kariyerimi ilerletmeyi hedefliyorum" gibi ifadelerle bu uyumu gösterebilir.

**Tipik Takip Soruları**

*   "Önceki işinizde sizi en çok ne tatmin ediyordu ve en çok ne zorluyordu?"
*   "Bu pozisyonda uzun vadeli kariyer hedefleriniz nelerdir?"
*   "Şirketimizin değerleri hakkında neler biliyorsunuz ve bu değerlere nasıl uyum sağlayacağınızı düşünüyorsunuz?"`,
  },

  // ═══════════ BEHAVIORAL (STAR) ═══════════
  {
    id: 'qc_b1',
    category: 'behavioral',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Tell me about a time you went above and beyond for a customer.',
    difficulty: 3,
    goodAnswerPointsTr: ['STAR formatı', 'Spesifik detay (sayı, isim olmasa da yer)', 'Kişisel inisiyatif', 'Ölçülebilir sonuç'],
    redFlagsTr: ['Genel "her zaman yapardım"', 'STAR yok', 'Övünme tonu'],
    sampleAnswerTr: 'Marriott\'ta (S) bir Japon misafirin uçuşu son anda iptal oldu — 3 saatte bir başkasını organize etmem gerekti. Görevim (T) oteli kontrol etmek değildi ama o gece extra rezervasyon ve transfer ayarlamak. (A) Otelin shuttle\'ını ücretsiz kullandırdım, partner havayolu acentemi aradım, alternatif uçuşu booking\'ini kendim yaptım. (R) Misafir 3 hafta sonra bana özel teşekkür mektubu yolladı, oteli "Booking 9.8" puanladı.',
    tipsTr: ['Spesifik sayı + tarih ver', 'Kendi inisiyatif vurgu', 'Sonuç ölçülebilir'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

HR uzmanları bu soruyla, adayın problem çözme yeteneğini, müşteri odaklılığını, inisiyatif alma becerisini ve zorlu durumlarda stres yönetimi kapasitesini ölçer. Adayın, standart prosedürlerin dışına çıkarak müşteri memnuniyetini sağlamadaki istekliliğini ve bu süreçte gösterdiği kişisel fedakarlığı anlamak hedeflenir. Bu, ekip çalışmasına yatkınlık ve şirket değerlerine uyum açısından da ipuçları verir.

**Bu Aşamada Neden Sorulur**

Bu soru genellikle mülakatın orta veya sonlarına doğru sorulur. Adayın temel becerileri ve deneyimleri hakkında bilgi alındıktan sonra, bu soru adayın karakterini, çalışma ahlakını ve gerçek dünya senaryolarında nasıl tepki vereceğini anlamak için kullanılır. Adayın "kültürel uyumunu" ve şirketin müşteri hizmetleri felsefesine ne kadar uygun olduğunu değerlendirmek için ideal bir noktadır.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "Her zaman müşterilerimin isteklerini yerine getirmeye çalışırım. Bir keresinde bir yolcu uçağın kalkmasını bekletmemi istedi ama yapamadım."
    *   *Neden Kötü:* Genel, spesifik değil, inisiyatif yok, sonuç yok. "Her zaman" genellemesi inandırıcı değil.

*   **Orta Cevap:** "Bir seferinde bir yolcunun bagajı kaybolmuştu. Ben de ona havayolunun iletişim bilgilerini verdim ve durumu takip etmesini söyledim."
    *   *Neden İyi Ama Eksik:* STAR formatına yakın ama inisiyatif ve "üstüne çıkma" unsuru zayıf. Standart bir prosedürün anlatımı gibi.

*   **Güçlü Cevap:** "Bir kere, yoğun bir uçuşta (S) bir yolcunun acil tıbbi durumu nedeniyle uçağın kalkışı ertelendi. Görevim (T) yolcunun tıbbi durumunu güvence altına almak ve diğer yolcuların konforunu sağlamaktı. Ancak, acil durumun yolcunun ailesini de etkilediğini fark ettim. Aile üyelerinin terminalde endişeyle beklediğini gördüm. Kişisel inisiyatif alarak (A) onlara durumu sakinleştirdim, tıbbi ekiple sürekli iletişimde kaldım, onlara özel bir bekleme alanı ayarladım ve uçuş ekibiyle koordine olarak, durumu aileye detaylıca anlattım. Uçuş sorunsuz kalktıktan sonra, aile bireylerinden biriyle özel olarak ilgilenerek, onların ihtiyaçlarını giderdim. Sonuç olarak (R) aileden büyük bir teşekkür aldım ve bu durum, yolcu ve aile arasındaki güveni pekiştirerek havayolumuzun olumlu imajını güçlendirdi."
    *   *Neden İşe Yarar:* Spesifik durum, kişisel inisiyatif, müşteri odaklılık, ölçülebilir sonuç (güven pekişmesi, olumlu imaj).

**STAR Formatı Uygulaması**

Bu soru için STAR formatı, adayın deneyimini yapılandırmada kilit rol oynar. **Situation (Durum)** ile spesifik bir olayı tanımlarsınız. **Task (Görev)** ile sorumluluğunuzu belirtirsiniz. **Action (Eylem)** kısmında, standart prosedürlerin ötesine geçen kişisel inisiyatiflerinizi ve attığınız adımları detaylandırırsınız. **Result (Sonuç)** ile eylemlerinizin olumlu etkilerini, müşteri memnuniyetini ve şirket için değerini ölçülebilir şekilde ortaya koyarsınız.

**Havayolu Uyarlama**

Bu tür bir cevabı, başvurduğunuz havayolunun değerleriyle ilişkilendirmek önemlidir. Örneğin, Emirates'in "Hello Tomorrow" vizyonuyla uyumlu olarak yenilikçi bir çözümden, Qatar Airways'in "Going Places Together" ruhuna uygun olarak işbirliği ve topluluk vurgusuyla, ya da THY'nin "Widest Network, Strongest Airline" imajına uygun olarak operasyonel mükemmellik ve geniş erişimle ilgili bir örnek verebilirsiniz.

**Tipik Takip Soruları**

*   Bu durumda başka ne yapabilirdiniz?
*   Bu durumdan ne öğrendiniz?
*   Eğer sonuç olumsuz olsaydı nasıl tepki verirdiniz?`,
  },
  {
    id: 'qc_b2',
    category: 'behavioral',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Describe a time you handled criticism poorly. What did you learn?',
    difficulty: 4,
    goodAnswerPointsTr: ['Dürüst — gerçek hata anlat', 'Tepkiyi sorumluluk olarak al', 'Ne öğrendiğin net', 'Davranış değişikliği örneği'],
    redFlagsTr: ['"Hiç kötü kullanmadım" — yalan görünür', 'Başkasını suçla', 'Öğrenme yok'],
    sampleAnswerTr: 'İlk yılım Marriott\'ta, supervisor\'ım sunum hızımı eleştirdi. Ben (yanlış) "Yeterli zaman vermedin" diye savunmaya geçtim. Eve giderken üzdüm, sonra fark ettim haklıydı — ben acele etmiştim. Ertesi gün özür diledim, "1 hafta detaylı pratik isterim" dedim. Sonraki sunumum mükemmeldi. Şimdi kritik geldiğinde önce dinlerim, savunmaya geçmem.',
    tipsTr: ['Olgun yansıt', 'Davranış değişimi göster', 'Spesifik dur'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

İK uzmanları bu soruyu adayların öz farkındalıklarını, öğrenme kapasitelerini, geri bildirimlere açıklıklarını ve zorluklarla başa çıkma becerilerini ölçmek için sorar. Temel olarak dürüstlük, olgunluk ve gelişim potansiyeli aranır. Bu nitelikler, takım çalışması, problem çözme ve uzun vadeli şirket uyumu için kritik öneme sahiptir. Adayın hatalarından ders çıkarıp kendini geliştirebilme yeteneği, kariyer gelişiminin temel göstergelerindendir.

**Bu Aşamada Neden Sorulur**

Bu tür davranışsal sorular genellikle mülakatın ortalarında veya sonlarına doğru sorulur. Adayın daha önceki cevaplarından ve genel tutumundan bir izlenim edindikten sonra, daha derinlemesine bir anlayış geliştirmek ve adayın gerçek karakterini ortaya çıkarmak amacıyla kullanılır. Özellikle takım çalışması ve liderlik potansiyeli değerlendirilirken, geri bildirimlere nasıl yaklaştığı anlaşılır.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "Hiç eleştiriyi kötü karşıladığımı hatırlamıyorum. Ben zaten her zaman işimi en iyi şekilde yapmaya çalışırım."
    *   *Kötü çünkü:* Bu cevap dürüstlükten uzak ve savunmacı bir tutum sergiliyor. Öz farkındalık eksikliğini ve gelişim isteksizliğini gösteriyor. Hiçbir profesyonel mükemmel değildir ve bu tür bir cevap, adayın gerçekçi olmadığını düşündürür.

*   **Orta Seviye Cevap:** "Geçenlerde bir proje sunumunda, ekip liderim sunumun fazla teknik olduğunu ve anlaşılmasının zor olduğunu söyledi. Başta biraz sinirlendim çünkü çok uğraşmıştım, ama sonra onun haklı olduğunu gördüm ve daha basit bir dil kullanmaya çalıştım."
    *   *İyi ama eksik çünkü:* Hata kabul ediliyor ve bir ders çıkarılmaya çalışılıyor. Ancak, eleştiriyi "kötü karşılama" anının detayları ve bu durumdan ne gibi somut dersler çıkarıldığı daha net ifade edilmeli. "Sinirlendim" ifadesi, eleştiriyi nasıl *işlediğini* tam olarak yansıtmıyor.

*   **Güçlü Cevap:** "Önceki görevimde, bir uçuş öncesi brifingde simülatör eğitmenim, acil durum prosedürlerini anlatırken kullandığım terminolojinin, deneyimi az olan pilotlar için kafa karıştırıcı olabileceğini belirtti. İlk tepkim, 'Ama bunlar standart terminoloji' şeklinde bir savunma oldu. Ancak brifing sonrası, eğitmenin haklı olduğunu fark ettim; özellikle yeni nesil uçaklarda kullanılan bazı spesifik terimler, tecrübesiz mürettebat için belirsizlik yaratabilirdi. Bu geri bildirimi kişisel bir saldırı olarak değil, profesyonel gelişimim için bir fırsat olarak görmem gerektiğini anladım. Ertesi brifingde, daha yaygın ve anlaşılır bir dil kullanmaya özen gösterdim, ayrıca zorunlu terimler için kısa açıklamalar ekledim. Bu deneyim, geri bildirimi ne kadar erken ve yapıcı kabul edersem, hem kendi performansımı hem de ekibin verimliliğini o kadar artırabileceğimi öğretti."
    *   *Bu cevap işe alır çünkü:* Dürüst bir hata ve ilk olumsuz tepki kabul ediliyor. Sorumluluk üstleniliyor, eleştiri kişisel alınmıyor. Somut bir öğrenme süreci ve ardından gelen davranış değişikliği örneği sunuluyor. Havacılık bağlamına uygun (simülatör, brifing, terminoloji).

**STAR Formatı Uygulaması**

Bu soruya STAR formatı oldukça uygundur. **Situation (Durum):** Eleştiriyi kötü karşıladığınız spesifik olayı tanımlayın (örn. simülatör eğitmeni geri bildirimi). **Task (Görev):** O durumdaki rolünüz veya sorumluluğunuz neydi? (örn. brifing vermek). **Action (Eylem):** Eleştiriye ilk tepkiniz ne oldu ve sonrasında ne yaptınız? (örn. savunma, sonra dil değişikliği). **Result (Sonuç):** Bu eylemlerin sonucu ne oldu ve ne öğrendiniz? (örn. daha iyi iletişim, gelişim fırsatı).

**Havayolu Uyarlama**

Bu cevap, herhangi bir havayolu için uyarlanabilir. Örneğin, Emirates'in "Excellence" değerine vurgu yaparak, bu tür geri bildirimlerin mükemmelliğe ulaşmada nasıl bir rol oynadığını belirtebilirsiniz. Qatar Airways'in "Five Star Service" anlayışı bağlamında, ekip içi iletişimin ve her üyenin anlayabileceği netliğin önemini vurgulayabilirsiniz. THY'nin "Global Havayolu" kimliğiyle, uluslararası standartlarda ve farklı kültürel geçmişlere sahip ekiplerle çalışırken açık iletişimin ve geri bildirimin kritik olduğunu belirtebilirsiniz.

**Tipik Takip Soruları**

*   "Bu durumla nasıl başa çıkmak için spesifik olarak ne gibi adımlar attınız?"
*   "Bu deneyimden sonra geri bildirimlere yaklaşımınızda kalıcı bir değişiklik oldu mu?"
*   "Benzer bir durumda, bir ekip arkadaşınızın eleştiriyi kötü karşıladığını görseniz ne yapardınız?"`,
  },
  {
    id: 'qc_b3',
    category: 'behavioral',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Tell me about a stressful situation and how you handled it.',
    difficulty: 3,
    goodAnswerPointsTr: ['STAR — yüksek baskı seçici', 'Sakin davranış', 'Probleme odak', 'Sonuç pozitif'],
    redFlagsTr: ['Stres altında kontrol kaybı', 'Çok dramatize'],
    sampleAnswerTr: 'New Year\'s Eve Marriott — restoran tam dolu, %30 ekip eksik (grip salgını). 4 saatlik shift\'te 200+ kuver. Ben supervisor\'dım. (A) Önce ekiple 30 saniye stand-up — kim ne masaya bakacak. Süreyi 8 dakikalık döngülere böldük. Yanımda her zaman su şişeleriyle dolaştım — masa arasında pratik su servisi. (R) 4 saat sonunda complaint sıfır, satış %12 yüksek. Misafirlerin 3\'ü yıldızlı yorum bıraktı.',
    tipsTr: ['Sakin lider örnek', 'Sayısal sonuç', 'Problemi parçala'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın stresli durumlarla başa çıkma yeteneğini, problem çözme becerilerini, baskı altında sakin kalma kapasitesini ve duygusal zekasını ölçmeyi amaçlar. İşe alım uzmanları, adayın kriz anlarında nasıl davrandığını anlayarak, iş performansını ve takım uyumunu tahmin etmeye çalışır. Ölçülen temel nitelikler; **dayanıklılık (resilience)**, **problem çözme**, **soğukkanlılık** ve **sorumluluk alma**dır.

**Bu Aşamada Neden Sorulur**

Bu tür davranışsal sorular genellikle mülakatın ortalarında veya sonlarına doğru sorulur. Adayın temel becerileri ve deneyimleri hakkında bilgi alındıktan sonra, bu soru adayın kişilik özelliklerini ve potansiyelini daha derinlemesine anlamak için kullanılır. Adayın geçmişte zorluklarla nasıl başa çıktığını görmek, gelecekteki potansiyel zorluklar için bir gösterge olabilir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Bir keresinde uçuşumda küçük bir sorun yaşandı, biraz gergindim ama idare ettim." → *Bu cevap, durumu, alınan aksiyonları ve sonucu belirtmediği için yüzeyseldir ve adayın stresle başa çıkma stratejisi hakkında bilgi vermez. ‘İdare ettim’ gibi belirsiz ifadeler, adayın problem çözme yeteneğini göstermez.*
*   **Orta:** "Bir keresinde bir yolcu biletini bulamadı ve çok panikledi. Ona sakin olmasını söyledim ve yardımcı olmaya çalıştım." → *Bu cevap, bir durum ve bir aksiyon içerir ancak 'yardımcı olmaya çalıştım' ifadesi belirsizdir ve sonucun ne olduğu belirtilmemiştir. Daha fazla detay ve proaktif adımlar eksiktir.*
*   **Güçlü:** "Geçtiğimiz yaz, yoğun bir iç hat uçuşunda, kokpitteki navigasyon sistemlerinden biri aniden devre dışı kaldı. **(S)** Bu durum, uçuş planımızı etkileyebilecek ciddi bir arızaydı ve hava trafiğinin yoğun olduğu bir bölgedeydik. **(T)** Benim görevim, durumu hızla değerlendirerek hem mürettebatın güvenliğini sağlamak hem de uçuşu güvenli bir şekilde tamamlamak için alternatif bir rota planlamaktı. **(A)** Hemen durumu kaptanla paylaştım, yedek navigasyon sistemlerini devreye soktuk ve ATC (Air Traffic Control) ile iletişime geçerek rotamızda bir değişiklik talep ettik. Bu sırada, kabin ekibini olası bir gecikme veya rota değişikliği hakkında bilgilendirdik. **(R)** ATC'nin onayıyla güvenli bir alternatif rota üzerinden uçuşumuzu sorunsuz tamamladık, tüm prosedürlere uyduk ve yolcularımızı planlanan süreden sadece 15 dakika gecikmeyle varış noktasına ulaştırdık. Bu olayda, soğukkanlılığımı koruyarak ve ekip çalışmasıyla problemi çözerek hem güvenliği sağladık hem de yolcu memnuniyetini ön planda tuttuk." → *Bu cevap, STAR formatını net bir şekilde uygulayarak, spesifik bir durumu, görevi, alınan somut aksiyonları ve elde edilen olumlu sonucu detaylandırır. Adayın soğukkanlılığını, problem çözme becerisini ve sorumluluk anlayışını vurgular.*

**STAR Formatı Uygulaması**

Bu soruda STAR (Situation, Task, Action, Result) formatı, adayın stresli bir durumu yapılandırılmış bir şekilde anlatmasını sağlar. **Situation (Durum)**, karşılaşılan stresli olayı tanımlar. **Task (Görev)**, adayın bu durumda üstlenmesi gereken sorumluluğu belirtir. **Action (Aksiyon)**, adayın sorunu çözmek için attığı adımları detaylandırır. **Result (Sonuç)**, bu aksiyonların ne gibi olumlu veya olumsuz sonuçlar doğurduğunu açıklar. Bu yapı, cevabı net, anlaşılır ve ikna edici kılar.

**Havayolu Uyarlama**

Havayolu şirketleri (örneğin, Emirates, Qatar Airways, THY) genellikle güvenlik, yolcu memnuniyeti ve takım çalışması gibi değerlere büyük önem verir. Bu nedenle, verilecek cevapta bu değerlere vurgu yapılmalıdır. Örneğin, "Güvenlik prosedürlerine sıkı sıkıya bağlı kalarak..." veya "Yolcu konforunu en üst düzeyde tutarak..." gibi ifadelerle şirketin değerleriyle uyum gösterilebilir. Cevap, şirketin misyonuyla örtüşen bir problem çözme yaklaşımını yansıtmalıdır.

**Tipik Takip Soruları**

*   Bu durumdan ne öğrendiniz ve bu bilgiyi gelecekteki benzer durumlarda nasıl kullanırsınız?
*   Eğer aynı durumu tekrar yaşasaydınız, farklı ne yapardınız?
*   Takımınızdaki başka biri bu stresli durumda size nasıl yardımcı oldu veya siz ona nasıl destek oldunuz?`,
  },
  {
    id: 'qc_b4',
    category: 'behavioral',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Have you ever made a mistake at work? What did you do?',
    difficulty: 4,
    goodAnswerPointsTr: ['Dürüst — gerçek hata', 'Hızlı sahiplen', 'Düzeltici aksiyon', 'Tekrar olmama önlem'],
    redFlagsTr: ['"Hiç hata yapmadım"', 'Saklamayı dene', 'Başkasını suçla'],
    sampleAnswerTr: 'Bir gün gece vardiyasında VIP rezervasyonu sisteme yanlış oda numarasıyla girmişim. Sabah misafir başka odaya yönlendirilince anladım. (A) Hemen müdüre bildirdim, misafire şahsen özür dileyip suite\'e ücretsiz upgrade verdik. (R) Sonra rezervasyon double-check protokolü önerisi yaptım — ekip uyguladı. Misafir ertesi rezervasyonunda da bizi tercih etti.',
    tipsTr: ['Hata + sahiplen + düzelt + öğren', 'Olgun yaklaşım'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

İK uzmanları bu soruyla adayın **dürüstlüğünü, sorumluluk alma eğilimini, problem çözme becerisini ve öğrenme kapasitesini** ölçer. Hata karşısında sergilenen tutum, adayın stres altındaki davranışını, öz farkındalığını ve gelişim isteğini ortaya koyar. Bir adayın hatasını kabul edip bundan ders çıkarabilmesi, şirketin güvenilirliğini ve sürekli iyileştirme kültürünü desteklemesi açısından kritik öneme sahiptir.

**Bu Aşamada Neden Sorulur**

Bu soru genellikle mülakatın ortalarında, adayın temel becerileri ve deneyimleri hakkında bilgi alındıktan sonra sorulur. Adayın özgün karakterini, baskı altındaki tepkisini ve dürüstlük seviyesini daha derinlemesine anlamak için ideal bir zamandır. Bu aşama, adayın teknik yeterliliğinin yanı sıra kişilik özelliklerinin pozisyona uygunluğunu değerlendirme fırsatı sunar.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Hiç büyük bir hata yapmadım. Belki bir keresinde bir yolcuya yanlış boarding pass vermiş olabilirim ama hemen düzelttik." → Bu cevap zayıftır çünkü adayın hatayı küçümsediğini, sorumluluktan kaçındığını ve dürüstlükten uzak olduğunu düşündürür. Somut bir çözüm ve öğrenme süreci sunmaz.

*   **Orta:** "Bir seferinde, uçuş öncesi kontrol listesini tamamlarken bir ekipman kontrolünü atlamışım. Uçuşta fark ettim ve hemen kaptana bildirdim. Kaptan durumu değerlendirdi ve bir sorun yaşanmadı. Bir daha böyle bir şey olmaması için daha dikkatli olmaya çalışıyorum." → Bu cevap daha iyidir çünkü bir hata kabul eder ve bir aksiyon alınmıştır. Ancak, "daha dikkatli olmaya çalışıyorum" ifadesi, sistematik bir önlem yerine kişisel bir çabaya işaret ettiği için daha güçlü bir gelişim noktası sunmaz.

*   **Güçlü:** "Bir keresinde, bir bakım teknisyeni olarak, bir uçuş öncesi kontrol sırasında bir hydraulic system'in basınç değerini yanlış kaydettiğimi fark ettim. Bu durum, ICAO Annex 6 ve EASA Part-M gereklilikleri uyarınca ciddi bir güvenlik riski oluşturabilirdi. Durumu derhal bakım amirime bildirdim. Amirimin yönlendirmesiyle ilgili hydraulic system'i tekrar kontrol ettik, doğru basınç değerini kaydettik ve ilgili formları güncelledik. Bu olayın tekrar yaşanmaması için, kontrol listelerindeki veri giriş alanlarının daha belirgin hale getirilmesi ve çift kontrol prosedürünün uygulanması yönünde bir öneride bulundum. Bu öneri kabul edildi ve bakım ekibimiz tarafından uygulanmaya başlandı. Bu deneyim bana, küçük görünen bir hatanın bile potansiyel sonuçlarını ve prosedürlere titizlikle uymanın önemini bir kez daha öğretti." → Bu cevap güçlüdür çünkü hatayı dürüstçe kabul eder, potansiyel riskleri (ICAO, EASA referansları ile) belirtir, net düzeltici aksiyonları (sistemi tekrar kontrol, form güncelleme) ve önleyici tedbirleri (kontrol listesi iyileştirme, çift kontrol) somut olarak açıklar.

**STAR Formatı Uygulaması**

Bu soruya STAR formatı ile cevap vermek, yapıyı netleştirir. **Situation:** Hatanın meydana geldiği spesifik durum (örneğin, bakım kontrolü). **Task:** Adayın o anki görevi (kontrolü doğru tamamlama). **Action:** Hatayı fark ettikten sonra alınan somut adımlar (bildirim, düzeltme, öneri). **Result:** Eylemlerin sonucu (hatanın giderilmesi, prosedür değişikliği, öğrenme). Bu yapı, cevabı organize ve anlaşılır kılar.

**Havayolu Uyarlama**

Bu cevap, havayolunun değerleriyle uyumlu hale getirilebilir. Örneğin, Emirates'in "Safety First" prensibi vurgulanarak, hatanın güvenlik boyutu öne çıkarılabilir. Qatar Airways'in "Global Excellence" anlayışına atıfta bulunarak, hatadan öğrenip küresel standartları yükseltme çabası belirtilebilir. THY'nin "Dünyaya Açılan Pencere" misyonuyla ilişkilendirilerek, küresel havacılık standartlarına uyumun önemi vurgulanabilir.

**Tipik Takip Soruları**

1.  "Bu hatanın sizin dışınızda başka kimleri etkileyebileceğini düşündünüz mü?"
2.  "Benzer bir durumla tekrar karşılaşsaydınız, farklı ne yapardınız?"
3.  "Ekibinizi bu tür hatalardan kaçınmaya nasıl teşvik edersiniz?"`,
  },
  {
    id: 'qc_b5',
    category: 'behavioral',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Describe a time when you had to adapt to a sudden change.',
    difficulty: 3,
    goodAnswerPointsTr: ['Esneklik', 'Hızlı adaptasyon', 'Pozitif tutum', 'Sonuç başarılı'],
    redFlagsTr: ['Şikayet tonu', 'Adaptasyon zayıf'],
    sampleAnswerTr: 'COVID döneminde Marriott %50 kapasitede çalıştı, herkes çapraz eğitim aldı. Ben concierge\'dan 2 hafta housekeeping\'e geçtim. İlk gün şok ama 2. günde ekiple sistem kurdum. Misafirden anlık feedback aldık, %15 daha hızlı oda hazırladık.',
    tipsTr: ['Adaptive mindset göster', 'Ekip içi destek vurgu'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın stres yönetimi becerilerini, belirsizlik karşısındaki duruşunu ve değişime ne kadar hızlı adapte olabildiğini ölçmeyi hedefler. HR uzmanı, adayın esnekliğini, problem çözme yeteneğini, pozitif tutumunu ve baskı altında sakin kalma becerisini değerlendirir. Bu nitelikler, dinamik ve öngörülemeyen durumların sık yaşandığı havacılık sektöründe kritik öneme sahiptir.

**Bu Aşamada Neden Sorulur**

Bu tür davranışsal sorular genellikle mülakatın orta aşamalarında sorulur. Adayın temel yetkinlikleri ve deneyimleri hakkında bilgi alındıktan sonra, gerçek dünya senaryolarında nasıl tepki vereceğini anlamak için kullanılır. Havacılık sektörü, hava koşulları, teknik arızalar veya operasyonel değişiklikler gibi ani değişimlere sürekli açıktır. Bu nedenle, adayın bu tür durumlara uyum sağlama kapasitesini erken aşamada görmek önemlidir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "Bir keresinde uçuş planımız son dakikada değiştiğinde biraz sinirlenmiştim çünkü hazırlıksız yakalanmıştım. Sonra mecbur kaldığım için yeni plana uydum."
    *   *Kötü Çünkü:* Şikayetçi bir ton var, adaptasyon zayıf ve pozitif bir sonuç yok. Adayın esnekliği ve problem çözme yeteneği sorgulanır.

*   **Orta Cevap:** "Bir seferinde, bir önceki uçuşun rötar yapması nedeniyle yeni bir uçağa atanmıştım. Uçak farklı bir tip olduğu için bazı sistemlere alışmam gerekti. Ekip arkadaşlarımla bilgi paylaştık ve uçuşu sorunsuz tamamladık."
    *   *İyi Ama Eksik:* Durum ve aksiyon belirtilmiş, ancak sonuç daha güçlü olabilirdi. "Sorunsuz tamamladık" yerine, bu adaptasyonun nasıl bir başarıya yol açtığına dair daha somut bir ifade olabilir.

*   **Güçlü Cevap:** "Bir THY A320 operasyonunda, kalkış öncesinde beklenmedik bir lastik basınç uyarı sistemi arızası tespit edildi. Bu durum, planlanmış kalkış süremizi 1 saat geciktirecek bir 'troubleshooting' süreci gerektiriyordu. Durumu hızla analiz edip, ilgili mühendislik ekibiyle koordinasyonu sağlayarak, yolculara durumu şeffaf bir şekilde aktardım ve onların da anlayışını kazandım. Alternatif bir rota planlaması için gerekli bilgileri hazırladım. Sonuç olarak, teknik ekip arızayı giderdi ve uçuşumuz sadece 45 dakika gecikmeyle, yolcu memnuniyetini yüksek tutarak planlanan rotasında gerçekleşti."
    *   *Bu Cevap İşe Alır:* Aday, durumu net bir şekilde tanımlıyor (Situation), görevinin ne olduğunu belirtiyor (Task), proaktif ve çözüm odaklı adımlarını detaylandırıyor (Action) ve somut, ölçülebilir bir başarıyla (Result) bitiriyor. Pozitif tutum ve hızlı adaptasyon açıkça görülüyor.

**STAR Formatı Uygulaması**

Bu soruya cevap verirken STAR formatı, adayın deneyimini yapılandırmak için idealdir. **Situation (Durum):** Ani değişimin ne olduğunu açıklayın. **Task (Görev):** Bu durumda sizin sorumluluğunuz neydi? **Action (Aksiyon):** Değişime uyum sağlamak için attığınız somut adımlar nelerdi? **Result (Sonuç):** Bu aksiyonlarınızın sonucu ne oldu? Bu yapı, cevabın anlaşılır ve ikna edici olmasını sağlar.

**Havayolu Uyarlama**

Bu soru, adayın başvurduğu havayolunun değerleriyle ilişkilendirilebilir. Örneğin, Emirates'in "Connecting Worlds" vizyonuyla uyumlu olarak, zorlu bir durumun nasıl başarıyla yönetildiği ve yolcu deneyimini nasıl olumlu etkilediği vurgulanabilir. Qatar Airways'in "Excellence" kültürü için, standartların üzerindeki bir performansla bu değişimin nasıl aşıldığına odaklanılabilir. THY'nin "Dünyaya Açılan Kapı" misyonuyla, global operasyonlardaki esnekliğin önemi dile getirilebilir.

**Tipik Takip Soruları**

*   "Bu süreçte karşılaştığınız en büyük zorluk neydi ve bunu nasıl aştınız?"
*   "Eğer sonuç farklı olsaydı, ne yapardınız?"
*   "Ekip üyeleriniz bu duruma nasıl tepki verdi ve siz bu tepkileri nasıl yönettiniz?"`,
  },

  // ═══════════ SITUATIONAL (uçak içi) ═══════════
  {
    id: 'qc_s1',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: [],
    question: 'A passenger is having a panic attack during turbulence. What do you do?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Yanına diz çök (göz seviyesinde)',
      'Sakin nefes egzersizi (4-7-8)',
      'Eline temas (uygun ise) — biraz gerilim azalt',
      'Tıbbi belirtiler kontrol — kalp çarpıntısı',
      'Pursar\'a bildir, gerekirse on-board doctor anonsu',
    ],
    redFlagsTr: ['Görmezden gel', 'Otur ve kemer bağla emir tonu', 'Diğer yolcuların önünde utandır'],
    sampleAnswerTr: 'Yanına diz çöküp göz seviyesine inerim, "Yanınızdayım, bu normal türbülans" dimensions sakin sesle. 4-7-8 nefes (4 saniye nefes al, 7 tut, 8 ver) önerirm. Su getirmem. Pursar\'a bildiririm. Belirtiler ciddi olursa (kalp çarpıntısı, göğüs ağrısı) on-board doctor anonsu yapılır.',
    tipsTr: ['Empati önce, prosedür sonra', 'Diğer yolcuyu rahatsız etme'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soruyla HR uzmanı, adayın kriz yönetimi becerilerini, empati yeteneğini ve problem çözme yaklaşımlarını ölçer. Özellikle baskı altında sakin kalma, yolcu güvenliğini önceliklendirme ve etkili iletişim kurma gibi temel kabin memuru niteliklerini değerlendirir. Ayrıca, takım çalışmasına yatkınlık ve prosedürlere uyum sağlama eğilimini de gözlemleyebilir.

**Bu Aşamada Neden Sorulur**

Bu tür durumsal sorular genellikle mülakatın ileri aşamalarında, adayın temel bilgilerini ve motivasyonunu değerlendirdikten sonra sorulur. Adayın gerçek dünya senaryolarına ne kadar hazırlıklı olduğunu, stresle nasıl başa çıktığını ve havacılık sektörünün gerektirdiği profesyonel tutumu sergileyip sergilemediğini görmek için kullanılır.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Yolcuya oturmasını ve kemerini bağlamasını söylerdim. Türbülans normal bir durumdur." → Bu cevap, adayın empati eksikliğini ve durumu görmezden gelme eğilimini gösterir. Yolcunun yaşadığı panik durumu hafife alınmış ve profesyonel bir müdahale önerilmemiştir.
*   **Orta:** "Yolcuya sakin olmasını söyler, su ikram eder ve durumu izlerdim. Gerekiyorsa purser'a bildirirdim." → Bu cevap, durumu fark ettiğini ve temel bir bildirim yapacağını gösterir, ancak panik atak yönetimi konusunda daha proaktif ve etkili adımlar içermiyor. Nefes egzersizi gibi somut bir müdahale eksik.
*   **Güçlü:** "Öncelikle yolcunun yanına diz çöker, göz seviyesine inerdim. Sakin bir ses tonuyla, 'Yanınızdayım, bu sadece türbülans, geçici bir durum' gibi ifadelerle güvence verirdim. Ardından, 'Derin bir nefes alın, 4 saniye burnunuzdan nefes alın, 7 saniye tutun ve 8 saniye ağzınızdan yavaşça verin' diyerek 4-7-8 nefes egzersizini nazikçe önerirdim. Eğer uygunsa ve yolcu kabul ederse, elini tutarak veya omzuna hafifçe dokunarak fiziksel temasla gerilimini azaltmaya çalışırdım. Kalp çarpıntısı gibi tıbbi belirtileri gözlemleyip, durumu derhal purser'a bildirirdim. Eğer belirtiler ciddileşirse (nefes darlığı, göğüs ağrısı gibi), durumu değerlendirmesi için uçakta doktor olup olmadığını anons etme prosedürünü başlatırdım." → Bu cevap, adayın empati, sakinlik, proaktif müdahale ve prosedür bilgisi gibi kritik niteliklerini sergiler.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı, adayın deneyimini yapılandırmak için kullanılabilir.
*   **Situation (Durum):** Türbülans sırasında bir yolcunun panik atak geçirmesi.
*   **Task (Görev):** Yolcunun sakinleşmesini sağlamak, güvenliğini temin etmek ve gerekli yardımı koordine etmek.
*   **Action (Eylem):** Yukarıdaki "Güçlü Cevap" bölümünde detaylandırılan adımları uygulamak (göz teması, sakinleştirme, nefes egzersizi, fiziksel temas, bildirim, doktor anonsu).
*   **Result (Sonuç):** Yolcunun sakinleşmesi, durumun kontrol altına alınması ve güvenli bir uçuşun devamının sağlanması.

**Havayolu Uyarlama**

Her havayolunun kendine özgü misyonu ve değerleri vardır. Örneğin, Emirates gibi premium hizmet odaklı bir havayolu, bu durumda daha fazla kişisel ilgi ve konfor sağlama üzerine odaklanacaktır. Qatar Airways'in "Orxy Yetkinlikleri" çerçevesinde problem çözme ve takım çalışması vurgusu öne çıkabilir. Türk Hava Yolları'nda ise "Yolcu Memnuniyeti" ve "Güvenlik Önceliği" değerleri doğrultusunda hareket edileceği belirtilebilir. Bu farklılıklar, cevabın detaylarında ve vurgularında kendini gösterebilir.

**Tipik Takip Soruları**

1.  "Eğer yolcu sizin önerdiğiniz nefes egzersizini yapmayı reddederse ne yapardınız?"
2.  "Diğer yolcuların rahatsız olmaması için bu durumu nasıl yönetirdiniz?"
3.  "Uçuş sonrası bu durumla ilgili bir raporlama yapmanız gerekirse, hangi bilgileri eklerdiniz?"`,
  },
  {
    id: 'qc_s2',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Two passengers are arguing loudly in row 14 over a reclining seat. Other passengers are getting upset. Action?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Hızlı müdahale — ses büyümeden',
      'İki yolcuyu ayrı ayrı dinle',
      'Empati + çözüm önerisi',
      'Gerekirse koltuk değişimi öner',
      'Israr ederse purser → captain decision',
    ],
    redFlagsTr: ['Birinin tarafını tut', 'Yüksek sesle azarla', 'Görmezden gel'],
    sampleAnswerTr: 'Önce ikisinin yanına aynı anda gider, "Yardımcı olabilirim?" derim. İkisini ayrı dinleme — biri arkaya yatırma talep ediyor, diğeri laptop için yer istiyor. Çözüm: laptop sahibinin koltuğunu boş bir koltuğa taşırım, diğerine "Şimdi rahatça yatırabilirsiniz" derim. İkisine de teşekkür ederim. Sorun büyürse purser çağırırım.',
    tipsTr: ['Ses tonu sakin', 'Diplomatik çözüm', 'Hiyerarşi kullan'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın problem çözme becerilerini, kriz yönetimi yeteneğini, iletişim becerilerini ve baskı altında sakin kalma kapasitesini ölçmeyi hedefler. Özellikle, adayın empati kurma, tarafsız kalma ve etkili iletişim kurarak çatışmayı çözme yeteneği incelenir. Ayrıca, ekip çalışmasına yatkınlığı ve gerektiğinde otoriteyi (purser/kaptan) devreye sokma becerisi de değerlendirilir.

**Bu Aşamada Neden Sorulur**

Bu tür durumsal sorular genellikle mülakatın orta veya ileri aşamalarında sorulur. Adayın temel teknik bilgileri ve motivasyonu hakkında fikir alındıktan sonra, gerçek dünya senaryolarına ne kadar hazırlıklı olduğu ve "havacılık zihniyetine" ne kadar uygun olduğu anlaşılmaya çalışılır. Bu noktada adayın stres yönetimi ve pratik çözüm üretme becerisi test edilir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "Yolcuların gürültü yapmasına izin vermem. Hemen gidip onları sustururum. Kimin haklı olduğuna bakmadan ikisini de uyarırım." Bu cevap zayıftır çünkü sorunun kökenine inmez, sadece bir bandaj uygular ve yolcu memnuniyetini göz ardı eder. Tartışmanın nedenini anlamaya çalışmaz ve potansiyel olarak durumu daha da kötüleştirebilir.

*   **Orta Cevap:** "Önce yanlarına gidip sakin olmalarını rica ederim. Sonra her ikisini ayrı ayrı dinlerim. Birinin koltuğunu geriye yatırmak istediğini, diğerinin ise daha fazla alan istediğini öğrenirim. Mümkünse, alan isteyen yolcuyu başka boş bir koltuğa almayı teklif ederim. Eğer bu mümkün değilse, ikisine de uzlaşma yolları sunarım." Bu cevap daha iyidir çünkü dinlemeyi ve çözüm önermeyi içerir. Ancak, durumun tırmanması halinde atılacak adımlar veya purser ile iletişimin nasıl kurulacağı konusunda eksiklikler barındırır.

*   **Güçlü Cevap:** "Derhal 14. sıraya gider, iki yolcuya da sakin bir ses tonuyla yaklaşıp 'Size nasıl yardımcı olabilirim?' diye sorarım. İlk olarak, durumu anlamak için her birini ayrı ayrı, nazikçe dinlerim. Bir yolcunun koltuğunu geri yatırmak istediğini, diğerinin ise özellikle dizüstü bilgisayarını kullanmak için daha fazla alan istediğini öğrenirim. Eğer kabinde uygun bir boş koltuk varsa, alan ihtiyacı olan yolcuya o koltuğa geçmeyi teklif ederim. Bu mümkün değilse, her iki yolcuya da geçici bir uzlaşma öneririm, örneğin yolculuğun belirli bir bölümünde koltuğu geri yatırmaması veya belirli bir açıyla sınırlı tutması gibi. Bu esnada, diğer yolcuların rahatsızlığını en aza indirmeye özen gösteririm. Eğer sorun çözülmezse veya gerginlik artarsa, durumu derhal purser'a (cabin service director) bildiririm. Purser'ın da çözemediği durumlarda, kaptanın yönlendirmesiyle hareket ederim. Bu yaklaşım, hem yolcu memnuniyetini hem de uçuş güvenliğini ön planda tutar." Bu cevap, durumu analiz etmeyi, empati kurmayı, somut çözümler sunmayı ve gerektiğinde prosedürlere uygun hareket ederek üst makamları bilgilendirmeyi içerir.

**STAR Formatı Uygulaması**

Bu soru, STAR formatını doğrudan uygulamak için idealdir. **Situation (Durum):** 14. sırada iki yolcu arasında koltuk reclining'i yüzünden çıkan tartışma. **Task (Görev):** Yolcuları sakinleştirmek, sorunu çözmek ve diğer yolcuların rahatını sağlamak. **Action (Eylem):** Adayın yukarıda belirtilen güçlü cevaptaki adımları izlemesi (dinleme, çözüm önerisi, purser'a bildirim vb.). **Result (Sonuç):** Sorunun başarıyla çözülmesi, yolcuların sakinleştirilmesi ve uçuşun sorunsuz devam etmesi.

**Havayolu Uyarlama**

Emirates gibi havayolları, mükemmel müşteri hizmetleri ve kültürel çeşitlilik yönetimi konusunda hassastır. Bu durumda, farklı kültürel arka planlardan gelen yolcuların olabileceği varsayımıyla, dil ve iletişimde ekstra hassasiyet gösterilir. Qatar Airways, misafirperverliği vurgular; bu da adayın yolcularla daha kişisel ve anlayışlı bir bağ kurmasını gerektirir. THY ise misafir odaklı hizmetiyle, adayın çözüm odaklı ve proaktif yaklaşımını ön plana çıkarmasını bekler. Hangi havayolu olursa olsun, yolcu güvenliği ve memnuniyeti en üst düzeyde tutulmalıdır.

**Tipik Takip Soruları**

*   "Eğer yolculardan biri fiziksel olarak agresifleşirse ne yapardınız?"
*   "Purser'ın müdahalesine rağmen sorun devam ederse, kaptanla iletişim kurma süreci nasıl işler?"
*   "Bu tür bir durumu önlemek için kalkış öncesinde veya yolculuk sırasında alabileceğiniz ek önlemler nelerdir?"`,
  },
  {
    id: 'qc_s3',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: [],
    question: 'A passenger asks for an alcoholic drink, but you can smell they\'re already drunk. What do you do?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Kibarca reddet — yasal sorumluluk',
      'Su veya non-alkol alternatif öner',
      'Pursar\'a bildir',
      'Davranış izle (saldırganlık riski)',
    ],
    redFlagsTr: ['Yargılayıcı ton', 'Yolcuyu utandır', 'Servis et zaten ödedi'],
    sampleAnswerTr: '"Beyefendi, bu uçuşta artık yasal sınırı aştığınızı düşünüyorum. Su veya kahve önerebilirim — bedava ve şu an daha iyi gelir." Eğer ısrar ederse pursar\'ı çağırırım. Yolcunun davranışını shift sonu raporuna yazarım.',
    tipsTr: ['"Aviation regulations" referans ver', 'Empati ile reddet', 'Hiyerarşi'],
      detailedExplanationTr: `**HR Psikolojisi Perspektifi**

Bu soru, adayın problem çözme yeteneğini, baskı altında sakin kalma becerisini ve müşteri hizmetleri prensiplerine bağlılığını ölçer. Özellikle, adayın empati kurma, profesyonel sınırlar belirleme ve kriz yönetimi becerileri değerlendirilir. Karar verme mekanizmasının mantıksal ve etik olup olmadığı, ayrıca kurumsal prosedürlere uyum sağlayıp sağlamadığı da önemli göstergelerdir.

**Bu Aşamada Neden Sorulur**

Bu tür durumsal sorular genellikle mülakatın orta veya ileri aşamalarında sorulur. Adayın temel bilgileri ve motivasyonu anlaşıldıktan sonra, gerçek iş senaryolarına nasıl tepki vereceğini görmek için kullanılır. Bu, adayın "kültürel uyumunu" ve zorlu durumlarla başa çıkma kapasitesini derinlemesine değerlendirme fırsatı sunar.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "Yolcuya 'Sarhoşsunuz, içki veremem' derdim. Zaten ödemiş olsa bile kurallara uymak zorundayız." Bu cevap, doğrudan ve yargılayıcıdır, yolcuyu utandırabilir ve durumu tırmandırabilir. Havayolunun misafirperverlik ve çözüm odaklı yaklaşımını yansıtmaz.

*   **Orta Cevap:** "Yolcuya kibarca içki servisi yapamayacağımı söylerdim ve su ikram ederdim. Eğer ısrar ederse kabin amirini çağırırdım." Bu cevap, temel prosedürü bilmeyi gösterir ancak yolcunun duygusal durumunu yönetme ve durumu daha profesyonelce ele alma konusunda eksiktir.

*   **Güçlü Cevap:** "Öncelikle yolcuya nazikçe ve alçak sesle, 'Beyefendi/Hanımefendi, uçuş güvenliği ve sağlığınız için maalesef bu uçuşta alkol servisi yapamıyorum. Bunun yerine size taze su, meyve suyu veya başka bir alkolsüz içecek ikram edebilirim. Uçuşunuzu daha rahat geçirmeniz için buradayım' derdim. Eğer yolcu sakin kalırsa durumu gözlemlerdim. Eğer agresifleşir veya ısrar ederse, derhal kabin amirini (Purser) bilgilendirir, durumu sakinleştirmek için destek isterdim. Yolcunun davranışını ve verdiğim kararı görev raporuma (flight report) detaylıca işlerdim." Bu cevap, kibarlığı, çözüm odaklılığı, güvenlik prosedürlerine bağlılığı ve kriz yönetimi adımlarını içerir.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı şu şekilde uygulanabilir:
*   **Situation (Durum):** Yolcu alkol talebinde bulunuyor ancak belirgin alkol kokusu var.
*   **Task (Görev):** Yolcu güvenliğini ve uçuş kurallarını ihlal etmeden durumu yönetmek.
*   **Action (Eylem):** Kibarca reddetmek, alternatif sunmak, Purser'ı bilgilendirmek, davranışı izlemek.
*   **Result (Sonuç):** Güvenli ve kontrollü bir uçuşun sürdürülmesi, yolcunun sakinleştirilmesi veya güvenli bir şekilde yönetilmesi.

**Havayolu Uyarlama**

Her havayolunun kendi kültürüne özgü yaklaşımları vardır. Örneğin, Emirates gibi premium havayolları, yolcu memnuniyetini ön planda tutarken, güvenlikten asla ödün vermez. Bu durumda, kibarlık ve çözüm odaklılık daha da vurgulanır. Qatar Airways'te ise "Qatari Hospitality" anlayışı gereği, yolcuyu utandırmadan, profesyonelce ve saygılı bir dille reddetmek esastır. THY'de ise "Güvenli ve Konforlu Uçuş" ilkesi çerçevesinde, prosedürlere uyum ve yolcu güvenliği önceliğiyle hareket edilir.

**Tipik Takip Soruları**

1.  Eğer yolcu daha da agresifleşirse ne yapardınız?
2.  Bu durumu raporlarken hangi spesifik bilgilere yer verirdiniz?
3.  Bu tür bir durumla daha önce karşılaştınız mı? Karşılaştıysanız nasıl yönettiniz?`,
  },
  {
    id: 'qc_s4',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: [],
    question: 'A child is alone (UM — Unaccompanied Minor) and is crying after takeoff. What\'s your protocol?',
    difficulty: 3,
    goodAnswerPointsTr: [
      'UM özel protokolü bil',
      'Yanına gider, sakinleştir',
      'Koltuğa entertainment (oyuncak, kitap, screen)',
      'Şeker/atıştırmalık (allergen check)',
      'Pursar\'a UM check-in raporu',
    ],
    redFlagsTr: ['Görmezden gel', 'Koridordan "ağlama" demek', 'Tek bırak'],
    sampleAnswerTr: 'Önce yanına diz çöküp göz teması — "Merhaba, ben Ayşe. Korkuyor musun?" Çocuğun adını sorar, anne-baba bilgisi tekrar okurum. UM kit (oyuncak ayı, çikolata, çocuk dergisi) getiririm. Allerjen yoksa bisküvi öneririm. 30 dakika boyunca her 5-10 dk uğrarım. Pursar\'a periyodik bildirim.',
    tipsTr: ['UM = priority pax', 'Düzenli check-in', 'Allergen mutlaka kontrol'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soruyla İK uzmanı, adayın empati, problem çözme becerisi, baskı altında sakin kalma yeteneği ve çocuklarla etkili iletişim kurma becerisini ölçer. Adayın, zorlu bir durum karşısında proaktif ve çözüm odaklı yaklaşıp yaklaşmadığını anlamak hedeflenir. Ayrıca, şirketin müşteri memnuniyeti ve güvenlik standartlarına ne kadar önem verdiğini gösteren bir tavır sergileyip sergilemediği de değerlendirilir.

**Bu Aşama Neden Sorulur?**

Bu tür durum bazlı sorular genellikle teknik becerilerin değerlendirildiği aşamalardan sonra, adayın kişilik özelliklerini ve pratik becerilerini anlamak için sorulur. Mülakatın ortalarında veya sonlarına doğru, adayın gerçek dünya senaryolarına nasıl tepki vereceğini görmek ve kültürel uyumunu değerlendirmek amacıyla kullanılır.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Çocuğun yanına giderim ve onu susturmaya çalışırım. Belki bir battaniye veririm." Bu cevap, durumu sadece yüzeysel ele alıyor, çocuğun duygusal ihtiyacını anlamaya çalışmıyor ve yetersiz bir çözüm sunuyor. UM protokolünü bilmiyor.
*   **Orta:** "Çocuğun yanına oturur, adını sorar ve sakinleştirmeye çalışırım. Ona bir oyuncak veya kitap verebilirim." Bu cevap, daha proaktif bir yaklaşım sergiliyor ancak UM protokolünün detaylarını ve potansiyel alerjenleri göz ardı ediyor. Sadece oyuncakla sınırlı kalıyor.
*   **Güçlü:** "Önce yanına diz çöker, göz teması kurar ve sakin bir ses tonuyla 'Merhaba, ben [Adınız]. Korkmuş görünüyorsun, sana nasıl yardımcı olabilirim?' derim. Çocuğun adını ve eğer uygunsa, ebeveyninin iletişim bilgilerini teyit ederim. UM protokolünü takip ederek, çocuğun yaşına uygun bir UM kit (oyuncak, boyama kitabı, çizgi film vb.) sunarım. Alerjen kontrolü yaptıktan sonra, uygunsa bir atıştırmalık (örn. bisküvi) ikram ederim. Yaklaşık 30 dakika boyunca her 5-10 dakikada bir durumunu kontrol ederim. Herhangi bir endişe veya ihtiyaç durumunda sorumlu kabin memurunu (Purser/CSM) bilgilendiririm." Bu cevap, empati, UM protokolü bilgisi, proaktiflik ve iletişim becerilerini birleştiriyor.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı, adayın deneyimini yapılandırmasına yardımcı olur: **Situation** (çocuğun ağlaması), **Task** (çocuğu sakinleştirmek ve refahını sağlamak), **Action** (yukarıda belirtilen güçlü cevap adımları: yaklaşım, iletişim, UM kiti, atıştırmalık, takip, raporlama), **Result** (çocuğun sakinleşmesi, güvenli ve konforlu bir yolculuk geçirmesi, ebeveynin memnuniyeti).

**Havayolu Uyarlama**

Her havayolunun kendi UM prosedürleri ve vurguları olabilir. Örneğin, Emirates, "Hello, I'm your Cabin Crew friend" gibi daha çocuk odaklı bir dil kullanabilirken, Qatar Airways'in "Q-Suite" gibi premium ürünlerinde UM hizmetleri daha da gelişmiş olabilir. THY'nin misafirperverlik anlayışı gereği, daha kişisel bir dokunuşla çocuğun ailesiyle de iletişim kurma eğilimi olabilir. Bu, adayın havayolunun değerlerine uygunluğunu gösterir.

**Tipik Takip Soruları**

1.  "Eğer çocuk hiçbir şekilde sakinleşmiyorsa ne yapardınız?"
2.  "Çocuğun alerjisi olduğunu öğrendiyseniz ve elinizde sadece alerjen içeren bir atıştırmalık varsa nasıl davranırdınız?"
3.  "UM çocuğun yanına yerleştirilmiş bir yetişkinin de olaya müdahil olmasını istemesi durumunda ne yapardınız?"`,
  },
  {
    id: 'qc_s5',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: [],
    question: 'A passenger requests special meal that wasn\'t pre-ordered. Galley has limited options. Action?',
    difficulty: 3,
    goodAnswerPointsTr: [
      'Empati ile başla',
      'Galley kontrol — meal swap mümkün mü?',
      'Vegan/vegetarian mevcudu öner',
      'Limit varsa snack box + meyve + yoğurt karışımı',
      'Sonraki uçuş için ön sipariş hatırlatması',
    ],
    redFlagsTr: ['"Önceden sipariş etmediniz" tonla', 'Hiçbir şey verme'],
    sampleAnswerTr: '"Anlıyorum efendim, bunu kontrol edeyim." Galley\'e gider, mevcut "vegetarian" varsa ona yönlendiririm. Yoksa: meyve tabağı + yoğurt + helal kek + sıcak su ile çay = aslında çoğu yolcu bunu yeterli bulur. Sonra kart üzerinde "Bir sonraki uçuşta MEAL.com ile 24 saat öncesinden sipariş edebilirsiniz" hatırlatırım.',
    tipsTr: ['Empati + yaratıcı çözüm', 'Önleyici bilgi ver'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın problem çözme becerisini, müşteri odaklılığını, baskı altında sakin kalma yeteneğini ve yaratıcılığını ölçer. Adayın kriz anlarında nasıl tepki verdiğini, mevcut kaynakları en iyi şekilde nasıl kullanabildiğini ve şirketin hizmet standartlarını koruyarak yolcu memnuniyetini nasıl sağlayabildiğini görmek amaçlanır. Empati kurma ve etkili iletişim kurma becerileri de bu senaryoda değerlendirilir.

**Bu Aşama Neden Sorulur**

Bu tür durumsal sorular genellikle mülakatın ortalarında veya sonunda sorulur. Adayın daha önceki cevaplarından elde edilen bilgilere dayanarak, spesifik bir senaryoda nasıl davranacağını test etmek için kullanılır. Bu noktada, adayın temel bilgilerini ve motivasyonunu anlamış olan mülakatçı, adayın pratik uygulama becerilerini ve zorluklarla başa çıkma kapasitesini daha derinlemesine değerlendirmek ister.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Önceden sipariş etmemişsiniz, maalesef özel menü veremeyiz." Bu cevap, yolcuya karşı empati eksikliği gösterir ve doğrudan reddetmek, müşteri memnuniyetini olumsuz etkiler. Havayolunun itibarını zedeleyebilir.

*   **Orta:** "Anlıyorum efendim, ancak özel menünüz önceden sipariş edilmemiş. Galley'de kontrol edeyim, belki başka bir seçenek bulabiliriz." Bu cevap, empatiyi gösterir ve çözüm arayışını ifade eder. Ancak, galley'deki sınırlı seçenekler göz önüne alındığında, net bir çözüm sunmadan umut vermek yetersiz kalabilir.

*   **Güçlü:** "Anlıyorum efendim, özel menünüzün sipariş edilmemiş olduğunu gördüm. Elimizdeki seçenekleri sizin için hemen kontrol ediyorum. Şu anda standart vejetaryen seçeneğimiz mevcut, bu sizin için uygun olur mu? Eğer değilse, size özel olarak hazırlayabileceğimiz bir snack box, taze meyve ve yoğurt gibi seçeneklerimizle ihtiyacınızı karşılamaya çalışabiliriz. Bu durumun bir sonraki seyahatinizde yaşanmaması için, özel menülerinizi uçuşunuzdan en az 24 saat önce web sitemiz üzerinden kolayca sipariş edebileceğinizi de belirtmek isterim." Bu cevap, empatiyi, proaktif çözüm arayışını, mevcut kaynakları yaratıcı kullanmayı ve geleceğe yönelik bilgilendirmeyi birleştirir.

**STAR Formatı Uygulaması**

*   **Situation (Durum):** Yolcunun önceden sipariş edilmemiş özel bir yemek talebi var.
*   **Task (Görev):** Yolcunun memnuniyetini sağlamak ve mevcut sınırlı imkanlarla en iyi çözümü sunmak.
*   **Action (Eylem):** Empati kurarak yolcuyu dinlemek, galley'deki seçenekleri kontrol etmek (vejetaryen/vegan gibi standart alternatifleri sunmak), yoksa snack box, meyve, yoğurt gibi tamamlayıcı unsurlarla alternatif bir çözüm oluşturmak ve gelecekteki siparişler için bilgilendirme yapmak.
*   **Result (Sonuç):** Yolcunun memnuniyetini en üst düzeyde tutmak, havayolunun hizmet kalitesini yansıtmak ve tekrarlayan sorunları önlemek.

**Havayolu Uyarlama**

*   **Emirates:** Lüks ve üstün hizmet anlayışıyla, "Müşteri memnuniyeti her şeyden önce gelir" prensibiyle, adayın daha yaratıcı ve kişiye özel çözümler sunmasını bekler.
*   **Qatar Airways:** "Going Places Together" misyonuyla, adayın ekip çalışması ve yolcuyla ortak bir çözüm bulma becerisini vurgular.
*   **THY:** "Vizyoner ve yenilikçi" kimliğiyle, adayın mevcut kısıtlamalar içinde bile en iyi hizmeti sunma becerisini ve çözüm odaklılığını ölçer. Her havayolunun kendi hizmet felsefesine uygun bir dil ve yaklaşım benimsenmelidir.

**Tipik Takip Soruları**

1.  Eğer yolcu sunulan alternatiflerden de memnun kalmazsa ne yapardınız?
2.  Bu tür bir durumla daha önce karşılaştınız mı? Nasıl bir çözüm üretmiştiniz?
3.  Bu deneyimden ne öğrendiniz ve gelecekteki hizmetinize nasıl yansıtırsınız?`,
  },
  {
    id: 'qc_s6',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Mid-flight, you spill hot coffee on a business class passenger\'s laptop. What do you do?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Hemen özür + havlu',
      'Yolcunun yanan tehlikesini önce kontrol',
      'Laptop\'a hızlı kuru havlu, açık ise kapat (su = elektrik tehlikesi)',
      'Pursar\'a bildir — şirket sigortası beyanı',
      'Yolcuya yazılı tazminat bilgisi (genelde havayolu öder)',
    ],
    redFlagsTr: ['Saklamaya çalış', 'Sorumluluk reddetme', 'Ödeme yapmamak için tartış'],
    sampleAnswerTr: '"Çok özür dilerim efendim!" Hemen havlu — önce yolcunun yanmaya karşı kontrol, sonra laptop. Pursar bildirim. Yazılı complaint formu doldurmasına yardım. THY\'nin damage policy hatırlat — laptop tamir/replacement kapsanır.',
    tipsTr: ['Hızlı sahiplen', 'Şirket policy bil', 'Sigorta süreci'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın problem çözme yeteneğini, stres yönetimi becerisini ve müşteri odaklılığını ölçer. HR, bir kriz anında adayın nasıl tepki vereceğini, sorumluluk alıp almayacağını ve şirket politikalarına ne kadar uyacağını anlamak ister. Öne çıkan nitelikler: sakinlik, sorumluluk alma, empati ve proaktif çözüm üretme.

**Bu Aşamada Neden Sorulur**

Genellikle mülakatın ortalarında, adayın temel becerileri ve deneyimi hakkında bilgi alındıktan sonra sorulur. Bu aşamada, adayın karmaşık ve beklenmedik durumlarla nasıl başa çıktığını görmek, potansiyel riskleri ve uyum sağlama yeteneğini değerlendirmek için idealdir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Özür dilerim, bir şey yapamam. Yolcu kendi eşyasından sorumlu."
    *   Bu cevap zayıftır çünkü sorumluluktan kaçar, müşteri memnuniyetini önemsemez ve havayolunun itibarını zedeler. Havacılıkta müşteri odaklılık esastır.

*   **Orta:** "Hemen özür dilerim ve bir bez isterim. Laptop'u silerim ve pursar'a bildiririm."
    *   Bu cevap iyi bir başlangıçtır ancak eksiktir. Yolcunun güvenliği (sıcak sıvı yanığı riski) ve şirketin resmi süreçleri (sigorta, tazminat formu) göz ardı edilmiştir.

*   **Güçlü:** "İlk olarak yolcudan sıcak kahve için derince özür dilerim ve hemen temiz bir havlu uzatırım. Yolcunun yanık olup olmadığını kontrol ederim. Eğer laptop açıksa, cihazı hemen kapatmasını rica ederim çünkü sıvı ve elektrik tehlikeli olabilir. Ardından, durumu derhal kabin şefine (Purser) bildiririm. Şirketin hasar bildirim ve sigorta süreçlerini başlatmak için gerekli formu doldurmasına yardımcı olurum ve yolcuya, hasarın havayolu tarafından karşılanacağına dair güvence veririm. Mümkünse, yolcuya yazılı bir şikayet formu doldurması için destek olurum ve iletişim bilgilerini alırım."
    *   Bu cevap, sorumluluk almayı, yolcunun güvenliğini önceliklendirmeyi, proaktif çözüm üretmeyi ve şirket prosedürlerine uymayı gösterir. Müşteri memnuniyetini ön planda tutar.

**STAR Formatı Uygulaması**

*   **Situation:** İş sınıfı yolcusunun dizüstü bilgisayarına sıcak kahve dökülmesi.
*   **Task:** Yolcunun güvenliğini sağlamak, hasarı en aza indirmek ve şirket prosedürlerine uygun hareket etmek.
*   **Action:** Yolcudan özür dilemek, yanık kontrolü yapmak, laptop'u kapatmasını istemek, Purser'a bildirmek, hasar formu doldurmasına yardımcı olmak.
*   **Result:** Yolcunun memnuniyetini sağlamak, maddi hasarın şirket tarafından karşılanmasını güvence altına almak ve olumlu bir müşteri deneyimi sunmak.

**Havayolu Uyarlama**

Her havayolunun müşteri hizmetleri ve tazminat politikaları farklılık gösterebilir. Örneğin, Emirates'in lüks odaklı hizmet anlayışı, daha proaktif ve kişiselleştirilmiş bir yaklaşım gerektirebilir. Qatar Airways'in "World's Best Airline" vizyonu, kusursuz bir çözüm sunmayı vurgulayacaktır. THY'de ise, hem misafirperverlik hem de kurumsal prosedürlere uyum dengesi önemlidir. Bu nedenle, öğrenilen şirket politikalarına uygun hareket etmek kritik önem taşır.

**Tipik Takip Soruları**

*   Eğer yolcu çok sinirlenirse nasıl tepki verirsiniz?
*   Şirket politikası bu tür hasarları karşılamıyorsa ne yaparsınız?
*   Bu durumu önlemek için gelecekte ne gibi önlemler alabilirsiniz?`,
  },
  {
    id: 'qc_s7',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: [],
    question: 'A pregnant woman feels unwell. What\'s your assessment?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Belirti sorgu — sancı, kanama, baş dönmesi',
      'Kaç haftalık? (28+ hafta = yüksek risk)',
      'Hemen pursar — gerekirse on-board doctor anonsu',
      'On-board first aid kit hazırla',
      'Captain\'a bilgi — gerekirse divert',
    ],
    redFlagsTr: ['"Geçer" deme', 'Tek başına bırakma', 'Panik göster'],
    sampleAnswerTr: 'Önce hızlı assessment: "Karnınızda ağrı var mı? Kaç haftalıksınız?" 32 haftada acil belirti = yüksek risk. Pursar bildirim, on-board doctor anonsu. Captain\'a iletilir, gerekirse closest suitable airport divert. First aid kit + oxygen hazırla. Yolcuyu sırtüstü değil sol-yan yatırırım (veterocaval syndrome önleme).',
    tipsTr: ['Tıbbi belirtileri bil', 'Hiyerarşi kullan', 'Pasaj pozisyonu önemli'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

HR uzmanı bu soruyla adayların **durumsal farkındalık (situational awareness)**, **problem çözme becerisi (problem-solving skills)**, **kriz yönetimi (crisis management)** ve **empati (empathy)** gibi temel yetkinliklerini ölçer. Yolcu sağlığı ve güvenliği söz konusu olduğunda, adayın stres altında sakin kalabilme, doğru önceliklendirme yapabilme ve etkili iletişim kurabilme becerisi kritik önem taşır.

**Bu Aşamada Neden Sorulur**

Bu tür durum bazlı sorular genellikle mülakatın ortalarında veya sonlarına doğru sorulur. Adayın temel bilgileri ve standart prosedürlere hakimiyeti test edildikten sonra, gerçek dünya senaryolarına nasıl yaklaşabildiğini görmek amaçlanır. Bu aşama, adayın sadece bilgi birikimini değil, aynı zamanda baskı altında nasıl performans gösterdiğini değerlendirme fırsatı sunar.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "Bir şey olmamıştır, herhalde midesi bulanmıştır. Biraz su verir geçer."
    *   *Neden Kötü:* Bu cevap, durumu hafife aldığını, yolcunun sağlığını önemsemediğini ve hiçbir değerlendirme yapmadığını gösterir. Havayolu güvenliği ve yolcu konforu açısından kabul edilemez bir yaklaşımdır.

*   **Orta Cevap:** "Yolcuya yaklaşıp nasıl olduğunu sorarım. Kaç haftalık olduğunu öğrenirim. Belirtileri varsa bilgilendiririm."
    *   *Neden İyi Ama Eksik:* Temel bir sorgulama ve bilgilendirme adımı içeriyor. Ancak aciliyet yönetimi, kaptana bilgi verme, tıbbi yardım çağırma gibi kritik adımlar eksik. Yeterli proaktivite yok.

*   **Güçlü Cevap:** "Öncelikle sakinliğimi koruyarak yolcuya yaklaşır, 'Nasılsınız, size nasıl yardımcı olabilirim?' diye sorarım. Belirtilerini (ağrı, kanama, baş dönmesi, mide bulantısı, kusma gibi) detaylıca sorgularım. Gebeliğin kaçıncı haftasında olduğunu öğrenmek hayati önem taşır; özellikle 28 haftanın üzerindeki gebelikler ek riskler taşır. Duruma göre (belirtilerin ciddiyeti ve gebelik haftası) durumu derhal Kaptan'a bildiririm. İhtiyaç halinde kabin ekibinden yardım ister, diğer yolcuları bilgilendirerek sakin bir ortam sağlarım. On-board medical kit'i ve gerekirse oksijeni hazırlarım. Eğer durum ciddiyse, Kaptan ile görüşerek en yakın uygun havalimanına divert (sapma) seçeneğini değerlendiririz. Yolcuyu asla yalnız bırakmam, sol yanına yatırmayı (veterocaval syndrome riskini azaltmak için) öneririm ve tıbbi durumunu takip ederim."
    *   *Neden İşe Yarar:* Bu cevap, durumu ciddiye aldığını, sistematik bir değerlendirme yaptığını, riskleri (hafta sayısı, veterocaval syndrome) bildiğini, proaktif olarak kaptanı bilgilendirdiğini, tıbbi kaynakları (kit, oksijen) devreye soktuğunu ve acil durum planını (divert) içerdiğini gösterir.

**STAR Formatı Uygulaması**

Bu soruya STAR formatında cevap vermek, adayın deneyimini yapılandırmasına yardımcı olur:
*   **Situation (Durum):** Hamile bir yolcunun rahatsızlanması.
*   **Task (Görev):** Yolcunun durumunu değerlendirmek, gerekli yardımı sağlamak ve güvenliğini temin etmek.
*   **Action (Eylem):** Yukarıdaki "Güçlü Cevap"ta belirtilen adımları (sorgulama, kaptana bildirim, tıbbi kit hazırlığı, pozisyon verme vb.) uygulamak.
*   **Result (Sonuç):** Yolcunun durumunun stabil hale gelmesi, güvenli bir şekilde varış noktasına ulaşılması veya gerekli tıbbi müdahale için uygun bir yere iniş yapılması.

**Havayolu Uyarlama**

Her havayolunun kendi acil durum prosedürleri ve yolcu bakımı standartları vardır. Örneğin, Emirates gibi uluslararası bir havayolu, çok kültürlü yolcu profili nedeniyle daha kapsamlı bir tıbbi yardım ağına ve acil durum yönetimi protokollerine sahip olabilir. Qatar Airways, yolcu deneyimine verdiği önemle, bu tür durumlarda ek konfor ve güvence sağlamaya odaklanabilir. THY ise, yerel sağlık otoriteleriyle olan ilişkileri ve acil durum ekipleriyle koordinasyonu vurgulayabilir. Cevap, bu spesifik havayolunun değerleri ve prosedürleriyle uyumlu hale getirilmelidir.

**Tipik Takip Soruları**

1.  "Eğer yolcu kusmaya başlarsa ne yapardınız?"
2.  "Kaptan'a durumu iletirken hangi bilgileri önceliklendirirsiniz?"
3.  "Diğer yolcuların paniğe kapılmasını nasıl engellerdiniz?"`,
  },
  {
    id: 'qc_s8',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: [],
    question: 'You suspect human trafficking — a young woman with an older man, she seems fearful and won\'t make eye contact. What do you do?',
    difficulty: 5,
    goodAnswerPointsTr: [
      'Doğrudan yolcuya soru sorma — adamın önünde tehlikeli',
      'Yolcuyu lavoboya tek davet etmek (özel sebep — meal preference)',
      'Lavoba\'da gizlice "Yardıma ihtiyacın var mı?" sor',
      'Pursar + Captain\'a hemen bildir',
      'Discreet işaretler ile pasifik IATA #IATAFlightsAgainstTrafficking',
    ],
    redFlagsTr: ['Doğrudan ele al', 'Adamla konuş', 'Görmezden gel'],
    sampleAnswerTr: 'Discreet observation — kadını "menü tercihi" için lavoba yakını alanında tek başına davet edirim. "Yardıma ihtiyacın var mı?" sessizce sorar — gözlerimi kullanırım. Pursar\'a hemen bildiririm. Captain\'a — varış noktasında police welcome talep eder. IATA #IATAFlightsAgainstTrafficking protokol uygulanır.',
    tipsTr: ['Bu dünya çapında ciddi sorun', 'IATA eğitimi var', 'Ele verme'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soruyla HR uzmanı, adayın **durumsal farkındalığını**, **empati yeteneğini**, **problem çözme becerisini** ve **risk yönetimini** ölçer. Adayın baskı altında soğukkanlılığını koruyarak, potansiyel bir acil durumu doğru bir şekilde değerlendirme ve uygun önlemleri alma kabiliyeti incelenir. Ayrıca, gizliliğe ve güvenliğe verdiği önemin de bir göstergesidir.

**Bu Aşamada Neden Sorulur**

Bu tür durumsal sorular genellikle mülakatın sonlarına doğru, adayın temel yetkinlikleri ve kişilik özellikleri hakkında yeterli bilgi edinildikten sonra sorulur. Adayın teorik bilgisini pratik senaryolara uygulama becerisini görmek, kritik düşünme yeteneğini ve etik değerlerini anlamak için bu aşama idealdir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Ben olsam direkt kadına sorardım, 'İyi misiniz?' diye. Sonra adamla konuşurdum, belki bir yanlış anlaşılma vardır." → Bu cevap kötü çünkü adayın durumun hassasiyetini anlamadığını, doğrudan çatışmaya girme eğiliminde olduğunu ve hem yolcunun hem de kendisinin güvenliğini riske attığını gösterir.

*   **Orta:** "Kadına sessizce yaklaşıp bir sorun olup olmadığını sorardım, belki tuvaletteyken. Sonra kabin amirine bildirirdim." → Bu cevap iyi bir başlangıç noktasıdır ancak eksiktir. Tuvaletteyken soru sormak doğru bir taktiktir ancak daha spesifik bir "neden" (örn. menü tercihi gibi) ve kabin amirine bildirmenin ötesinde kaptan ve ilgili protokollere (örn. IATA #IATAFlightsAgainstTrafficking) değinilmemesi eksikliktir.

*   **Güçlü:** "Öncelikle, kadını doğrudan sorgulamak yerine, durumu gizlice gözlemlemeye devam ederdim. Ardından, 'menü tercihi' gibi bir bahane ile kadını lavabo yakınına, adamdan ayrı bir şekilde davet ederdim. Yaklaştığımda, göz teması kurmadan, sessizce "Yardıma ihtiyacınız var mı?" diye sorarak ipucu arardım. Eğer olumsuz bir yanıt alır veya kadının korktuğunu hissedersem, hemen kabin amirini (purser) bilgilendirir, durumu detaylıca aktarırdım. Kabin amiriyle birlikte kaptana da bilgi verilir ve varış noktasında polis tarafından karşılanma (police welcome) talebinde bulunulması için kaptan bilgilendirilir. IATA #IATAFlightsAgainstTrafficking gibi ilgili protokoller devreye sokulur." → Bu cevap işe yarar çünkü adayın durumun hassasiyetini anladığını, yolcunun güvenliğini önceliklendirdiğini, gizli ve güvenli iletişim yöntemleri kullandığını, ilgili tüm personeli (purser, captain) bilgilendirdiğini ve uluslararası protokolleri bildiğini gösterir.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı şöyle uygulanır:
*   **Situation (Durum):** Genç bir kadının yaşça büyük bir erkekle seyahat etmesi, kadının korkmuş görünmesi ve göz temasından kaçınması.
*   **Task (Görev):** Yolcunun güvenliğini sağlamak, potansiyel bir insan ticareti durumunu tespit etmek ve yetkilileri bilgilendirmek.
*   **Action (Eylem):** Yukarıda belirtilen güçlü cevapta detaylandırıldığı gibi gizli gözlem, kontrollü iletişim, purser ve kaptana bildirim, police welcome talebi.
*   **Result (Sonuç):** Yolcunun güvenliğinin sağlanması, yetkililerin doğru zamanda bilgilendirilmesi ve olası bir suçun önlenmesi/soruşturulması.

**Havayolu Uyarlama**

Emirates, Qatar Airways veya THY gibi havayolları, yolcu güvenliği ve hizmet kalitesi konusunda yüksek standartlara sahiptir. Bu tür bir durumda, havayolunun kendi iç güvenlik prosedürleri ve IATA protokolleri (örneğin, #IATAFlightsAgainstTrafficking gibi kampanyalar) devreye girer. Adayın, havayolunun bu konudaki hassasiyetini ve eğitimlerini bildiğini göstermesi önemlidir. Örneğin, Emirates'in "Connected Passenger" gibi programları bu tür durumların erken tespitine yardımcı olabilir.

**Tipik Takip Soruları**

*   "Bu durumu purser'a nasıl açıklardınız? Hangi bilgileri öncelikli olarak paylaşırdınız?"
*   "Eğer kadın yardım istemediğini söylerse, ne yapardınız?"
*   "Bu tür bir durumu önceden tespit etmek için kabin ekibinin rolü hakkında ne düşünüyorsunuz?"`,
  },
  {
    id: 'qc_s9',
    category: 'situational',
    roles: ['cabin'],
    airlineIds: [],
    question: 'A passenger complains that crew is "flirting" with their partner. How do you respond?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Sakin ton — defansif olma',
      'İddia konusunda dinle',
      'Profesyonellik vurgu ama yargılama yok',
      'Pursar\'a bildir — değişikliği yap (başka crew servis et)',
      'Olay raporu',
    ],
    redFlagsTr: ['"Saçmalık" deme', 'Kavgaya gir', 'Görmezden gel'],
    sampleAnswerTr: '"Sizi anlıyorum efendim, profesyonelliğimiz hakkındaki endişe ciddi. Hemen pursar\'ım bilgilendireceğim ve servisinizi başka bir crew member üstlenecek." Ses tonu sakin. Pursar\'a bildirir, rotasyon yapılır. Olay sonrası incidence report.',
    tipsTr: ['Diplomatik dur', 'Şikayetin doğruluğu sorgulanmaz — profesyonellik düzelt'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın problem çözme becerisini, müşteri odaklılığını, profesyonelliğini ve kriz yönetimini ölçmeyi hedefler. Adayın stres altında sakin kalabilme, durumu nesnel değerlendirebilme, ekip içi iletişimi etkin kullanabilme ve havayolunun itibarını koruyabilme yetkinlikleri değerlendirilir. Özellikle, adayın empati kurma ve hassas durumları profesyonelce yönetme becerisi ön plana çıkar.

**Bu Aşamada Neden Sorulur**

Bu tür durumsal sorular genellikle mülakatın ortalarında veya sonlarına doğru sorulur. Adayın temel bilgileri ve motivasyonu anlaşıldıktan sonra, gerçek dünya senaryolarına nasıl tepki vereceği test edilir. Bu aşamada sorulması, adayın daha önceki cevaplarından edinen izlenimi derinleştirmek ve adayın pratik becerilerini ölçmek için idealdir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "Hiç böyle bir şey olmaz, mürettebatım profesyoneldir. Müşteriye 'Sorun yok' derim." Bu cevap, şikayeti ciddiye almadığı, savunmacı olduğu ve potansiyel bir sorunu görmezden geldiği için yetersizdir. Müşteri memnuniyetsizliğini artırır.

*   **Orta Cevap:** "Müşteriye durumu anladığımı söyler, mürettebatımın profesyonel olduğunu belirtir ve şikayeti görmezden gelirim." Bu cevap, biraz daha anlayışlı olsa da, sorunu çözmek için proaktif adımlar atmadığı ve durumu raporlamadığı için eksiktir. Profesyonellikten uzaklaşma riskini göz ardı eder.

*   **Güçlü Cevap:** "Sayın yolcumuz, endişenizi anlıyorum. Mürettebatımızın profesyonelliği bizim için esastır. Bu durumu hemen pursar'a bildireceğim ve sizin rahatınız için servis ekibinde bir düzenleme yapılmasını sağlayacağım. Üzerinize düşen bir durum olursa lütfen çekinmeden bana bildirin." Bu cevap, adayın durumu ciddiye aldığını, empati kurduğunu, profesyonel bir çözüm sunduğunu (pursar'a bildirme ve rotasyon) ve müşteri memnuniyetini önceliklendirdiğini gösterir.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı şu şekilde uygulanabilir:
*   **Situation (Durum):** Yolcu, kabin ekibinden birinin partneriyle "flört ettiğini" iddia ediyor.
*   **Task (Görev):** Yolcunun şikayetini profesyonelce yönetmek, durumu çözmek ve havayolu standartlarını korumak.
*   **Action (Eylem):** Sakin ve empatik bir tonla yolcuyu dinlemek, pursar'ı bilgilendirmek, servis rotasyonunu sağlamak ve durumu raporlamak.
*   **Result (Sonuç):** Yolcunun memnuniyetinin sağlanması, mürettebat arasındaki potansiyel profesyonellik dışı durumun giderilmesi ve gelecekte benzer olayların önlenmesi için kayıt tutulması.

**Havayolu Uyarlama**

Her havayolunun kendine özgü değerleri ve prosedürleri vardır. Örneğin, Emirates ve Qatar Airways gibi havayolları, uluslararası misafirperverlik ve üst düzey hizmet standartları vurgusu yaparlar. Bu durumda cevap, "Havayolumuzun yüksek hizmet standartlarına yakışır şekilde..." şeklinde başlanabilir. THY gibi köklü havayolları için ise "Türk misafirperverliği ve profesyonelliği çerçevesinde..." gibi ifadelerle cevap zenginleştirilebilir. Önemli olan, havayolunun misyon ve vizyonuyla uyumlu bir yaklaşım sergilemektir.

**Tipik Takip Soruları**

*   "Bu durumu pursar'a tam olarak nasıl raporlardınız?"
*   "Eğer yolcu şikayetinde ısrarcı olursa ne yapardınız?"
*   "Bu tür durumların yaşanmaması için kabin ekibine ne gibi tavsiyelerde bulunurdunuz?"`,
  },

  // ═══════════ ROLE-PLAY ═══════════
  {
    id: 'qc_r1',
    category: 'role_play',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Role-play: You\'re welcoming a famous actress in business class. She seems tired and irritable. What\'s your opening?',
    difficulty: 3,
    goodAnswerPointsTr: [
      'Tanıma ama overdose hayranlık değil',
      'Sessiz environment teklif',
      'Pre-takeoff drink önerisi',
      'Discreet privacy guarantee',
    ],
    redFlagsTr: ['Selfie iste', 'Çok konuş', 'Diğer yolcuya söyle'],
    sampleAnswerTr: '"İyi akşamlar Hanım, koltuğunuza buyrun. Pre-takeoff şampanya ister misiniz, yoksa sıcak çay daha iyi gelir? Battaniye + uyku takımı hazır. Beni çağırmak için butonu kullanın — özel bir şey ister misiniz?" Eye contact normal seviye, gülümseme rahatlatıcı.',
    tipsTr: ['Profesyonel mesafe', 'VIP yapma havası yok', 'Discreet servis'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu role-play sorusu, adayın **duygusal zeka**, **problem çözme yeteneği**, **iletişim becerileri** ve **profesyonel tutumunu** ölçmeyi hedefler. Özellikle stresli veya zorlu müşteri durumlarında nasıl tepki vereceğini, empati kurma becerisini ve havayolunun marka değerini koruyarak hizmet sunma yeteneğini değerlendirir. Adayın baskı altında sakin kalıp, duruma uygun çözümler üretebilmesi beklenir.

**Bu Aşamada Neden Sorulur**

Bu tür bir role-play sorusu genellikle mülakatın ortalarında veya sonlarına doğru sorulur. Adayın temel teknik ve davranışsal soruları yanıtladığı, artık daha karmaşık ve durumsal yeteneklerinin test edileceği bir aşamadır. Bu, adayın ilk izlenimlerinin ötesinde gerçekçi bir çalışma ortamında nasıl performans göstereceğini görmek için idealdir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Merhaba, hoş geldiniz. Buyurun oturun. Şampanya ister misiniz?"
    *   Bu cevap, yetersizdir çünkü sadece temel bir karşılama içerir. Yolcunun yorgun ve sinirli olduğu durumu göz ardı eder, hiçbir ek konfor teklifinde bulunmaz ve adayın proaktif olmadığını gösterir.

*   **Orta:** "İyi akşamlar Hanım, hoş geldiniz. Koltuğunuza buyurun lütfen. Uçuş öncesi bir içecek alır mıydınız? Belki bir bardak su veya çay?"
    *   Bu cevap daha iyidir çünkü yolcuyu karşılıyor ve basit bir içecek teklifinde bulunuyor. Ancak, yolcunun yorgunluğu ve sinirliliği göz önüne alındığında daha fazla empati ve özel hizmet teklifi eksiktir. Sessizlik veya mahremiyet gibi hassasiyetler belirtilmemiştir.

*   **Güçlü:** "İyi akşamlar Hanım, sizi ağırlamaktan mutluluk duyuyoruz. Lütfen koltuğunuza buyurun. Uzun bir yolculuktan sonra yorgun olabileceğinizi anlıyorum. Size daha sakin bir ortam yaratmak için ne yapabilirim? İsterseniz hemen bir battaniye ve uyku seti hazırlayabilirim. Ayrıca, kalkış öncesi hafif bir içecek, belki bir şampanya veya rahatlatıcı bir bitki çayı ikram edebilirim. Mahremiyetiniz bizim için önemli, bu yüzden herhangi bir özel isteğiniz olursa lütfen çekinmeden bana bildirin."
    *   Bu cevap, yolcunun durumunu anladığını gösteren empatik bir dil kullanır ("yorgun olabileceğinizi anlıyorum"). Sessiz bir ortam teklifi, uyku seti ve içecek önerisi gibi proaktif ve kişiselleştirilmiş hizmetler sunar. Mahremiyet vurgusu, yolcunun rahatsız edilmek istemeyebileceği gerçeğine duyarlıdır. Bu yaklaşım, yolcunun kendini değerli ve anlaşıldığını hissetmesini sağlar.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı şu şekilde uygulanabilir: **Situation (Durum):** Ünlü bir aktris business class'a biniyor, yorgun ve sinirli görünüyor. **Task (Görev):** Yolcuyu memnun edecek, profesyonel ve empatik bir karşılama yapmak. **Action (Eylem):** Yukarıdaki "Güçlü" cevapta belirtilen adımları izlemek: karşılama, empati, sakin ortam teklifi, konfor/içecek ikramı, mahremiyet güvencesi. **Result (Sonuç):** Yolcunun rahatlaması, kendini değerli hissetmesi ve uçuş deneyiminin olumlu başlaması.

**Havayolu Uyarlama**

*   **Emirates:** Lüks ve kişiye özel hizmet vurgusuyla, "Size özel bir deneyim sunmak için buradayız. Lütfen rahatınıza bakın." gibi ifadeler kullanılabilir.
*   **Qatar Airways:** "Qsuite" gibi ürünlerin vurgusuyla, "Business class'ın konforunu en üst düzeyde yaşamanız için buradayız. İsterseniz, uçuşunuzu daha da dinlendirici hale getirecek özel seçeneklerimizi de sunabiliriz." şeklinde bir yaklaşım benimsenebilir.
*   **THY (Turkish Airlines):** Misafirperverlik ve sıcak karşılama odaklı olarak, "Hoş geldiniz, sizi aramızda görmek ne güzel. Uçuşunuzun rahat ve keyifli geçmesi için elimizden geleni yapacağız. İhtiyaçlarınız için lütfen bana bildirin." gibi daha samimi ifadeler kullanılabilir.

**Tipik Takip Soruları**

*   Yolcu olumsuz tepki verseydi ne yapardınız?
*   Bu tür durumlarda havayolunun politikası hakkında bilginiz var mı?
*   Diğer yolcuların sizi izlediğini fark etseydiniz nasıl davranırdınız?`,
  },
  {
    id: 'qc_r2',
    category: 'role_play',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Role-play: A passenger lost their wallet during the flight. Walk me through how you handle.',
    difficulty: 3,
    goodAnswerPointsTr: [
      'Sakin bilgi al — son gördüğünüzde nerede?',
      'Yolcunun çevresini sistematik kontrol',
      'Lost & Found protokolü',
      'Indirme öncesi tüm crew bildirim',
      'Found olursa: ID kontrol + iade',
    ],
    redFlagsTr: ['Suç gibi davran', 'Diğer yolcudan şüphelen ima', 'Sorumlu değilim deme'],
    sampleAnswerTr: '"Anladım efendim, sakin olun. Son ne zaman gördünüz? Koltukta mı, lavabo mu?" Ben de yardım ederim — koltuk altı, kavalye cebi, battaniye altı kontrol. Bulamazsak: pursar\'a bildirim, post-flight tam temizlik aramaası yapılır. Vardığımız havaalanında Lost & Found bilgisi verilir.',
    tipsTr: ['Sakin profesyonel', 'Sistematik arama', 'Sonuç süreç bilgisi'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

HR uzmanı bu role-play sorusuyla adayın problem çözme becerilerini, stres yönetimi kapasitesini ve müşteri odaklılığını ölçer. Adayın sakin kalabilmesi, sistematik düşünmesi, iletişim becerileri ve prosedürlere uyum sağlama yeteneği gibi kritik nitelikler değerlendirilir. Ayrıca, empati kurabilme ve yolcu memnuniyetini önceliklendirme eğilimi de gözlemlenir.

**Bu Aşamada Neden Sorulur**

Bu tür bir role-play sorusu genellikle mülakatın ortalarında veya sonlarına doğru, adayın temel bilgilerinin alındığı ve daha derinlemesine yetkinliklerinin test edildiği aşamada sorulur. Bu noktada adayın gerçek bir senaryoya nasıl tepki vereceğini görmek, teorik bilgilerini pratiğe dökebilme kabiliyetini ve zorlu durumlarla başa çıkma potansiyelini anlamak hedeflenir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Cüzdanı bulamadıysanız yapacak bir şey yok. Uçuş bittikten sonra bakarız." → Bu cevap, sorumluluktan kaçma, yolcuya karşı ilgisizlik ve prosedürleri bilmeme anlamına gelir. Yolcu mağduriyetini artırır ve havayolunun itibarını zedeler.

*   **Orta:** "Tamam, koltuğunuzun etrafına bakalım. Belki düşürmüşsünüzdür. Bulamazsak görevli pilota bildiririz." → Bu cevap, temel bir çaba gösterildiğini ve prosedürün bir kısmının bilindiğini gösterir. Ancak sistematik bir yaklaşım, tam ekip bilgilendirmesi ve detaylı kayıp eşya süreci eksiktir.

*   **Güçlü:** "Anlıyorum efendim, endişelenmeyin. Sakin olup durumu yönetmenize yardımcı olayım. En son ne zaman cüzdanınızın farkındaydınız, hatırlıyor musunuz? Lütfen oturma alanınızı, yan cepleri, koltuk altını ve battaniyenizin altını birlikte kontrol edelim. Eğer bulamazsak, durumu derhal kabin amirine bildireceğim ve inişten sonra yapılacak detaylı arama için kayıp eşya (Lost & Found) prosedürünü başlatacağız. İniş yapacağımız havaalanındaki ilgili birimlere de bilgi verilecektir." → Bu cevap, empatiyi, sistematik yaklaşımı (yerinde kontrol), tam ekip bilgilendirmesini (kabin amiri) ve resmi prosedürleri (Lost & Found) kapsar.

**STAR Formatı Uygulaması**

Bu soruda STAR formatı şu şekilde uygulanabilir:
*   **Situation (Durum):** Bir yolcunun uçuş sırasında cüzdanını kaybettiği durumu.
*   **Task (Görev):** Yolcuya yardımcı olmak, cüzdanı bulmak (eğer mümkünse) ve havayolu prosedürlerine uygun olarak durumu yönetmek.
*   **Action (Eylem):** Yolcuyla nazikçe konuşmak, sakinleştirmek, yerinde sistematik arama yapmak, kabin ekibini bilgilendirmek, Lost & Found prosedürünü başlatmak.
*   **Result (Sonuç):** Yolcunun memnuniyetini sağlamak, kayıp eşyanın bulunma olasılığını artırmak ve havayolunun profesyonel imajını korumak.

**Havayolu Uyarlama**

Bu senaryo, havayolunun müşteri hizmetleri standartlarına göre uyarlanmalıdır. Örneğin, Emirates'in lüks hizmet anlayışı, yolcuya daha kişisel ve detaylı bir ilgi gösterilmesini gerektirebilir. Qatar Airways'in "Orxy One" programı gibi sadakat programları varsa, yolcunun durumu kaydedilirken bu da dikkate alınabilir. THY'de ise prosedürlerin netliği ve Türk misafirperverliği ile birleşen profesyonel yaklaşım ön planda olacaktır.

**Tipik Takip Soruları**

*   Eğer yolcu cüzdanının başka bir yolcu tarafından alındığından şüphelenirse nasıl davranırsınız?
*   Cüzdan içinde değerli eşyalar (örneğin kimlik, para, kartlar) olması durumu nasıl değiştirir?
*   Lost & Found prosedürleri hakkında daha fazla bilgi verebilir misiniz?`,
  },

  // ═══════════ ENGLISH (reading aloud / PA) ═══════════
  {
    id: 'qc_e1',
    category: 'english',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Read aloud this PA announcement: "Ladies and gentlemen, welcome on board flight TK 6. Our flight time today is approximately 12 hours and 30 minutes. We will be cruising at 38,000 feet. Please ensure your seatbelt is fastened and your seat is in the upright position."',
    difficulty: 3,
    goodAnswerPointsTr: [
      'Net telaffuz: "approximately", "cruising", "38,000"',
      'Ton: sıcak ama profesyonel',
      'Hız: orta — yolcunun anlayacağı tempo',
      'Vurgu: kritik bilgi (süre, yükseklik)',
      'Tek nefes ile mantıklı bölme',
    ],
    redFlagsTr: ['Hızlı oku', 'Monoton', 'Yanlış telaffuz', 'Aksanı saklamaya çalış'],
    tipsTr: ['Yüksek sesle pratik', 'Aynaya karşı tonlu pratik', 'Aksanı kabul et — net olsun'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu PA (Public Address) duyurusu okuma sorusu, temel iletişim becerilerini ve adayın profesyonel imajını değerlendirmek için kullanılır. HR uzmanı, adayın aşağıdaki niteliklerini ölçer: **Netlik ve Anlaşılırlık** (mesajın yolcular tarafından kolayca anlaşılması), **Profesyonellik ve Tonlama** (havayolunun marka imajına uygun bir dil kullanımı), **Dikkat Detayda** (sayıların ve kritik bilgilerin doğru okunması) ve **Sakince İletişim Kurma Yeteneği** (stres altında bile kontrollü bir sunum).

**Bu Aşama Neden Sorulur**

Bu soru genellikle mülakatın ilk aşamalarında, temel iletişim yetkinliklerini hızlıca değerlendirmek için sorulur. Adayın ilk izlenimini oluştururken, rolün gerektirdiği temel becerilere sahip olup olmadığını anlamak kritiktir. Bu noktada sorulması, adayın temel profesyonel duruşunu ve dil becerisini erkenden görmeyi sağlar.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** (Hızlı ve monoton bir okuma) "Ladies and gentlemen, welcome on board flight TK 6. Our flight time today is approximately 12 hours and 30 minutes. We will be cruising at 38,000 feet. Please ensure your seatbelt is fastened and your seat is in the upright position." (Bu okuma, yolcuların bilgiyi anlamasını zorlaştırır, profesyonellikten uzaktır ve monotonluğu nedeniyle ilgi çekmez.)

*   **Orta:** (Daha yavaş ama vurgusuz okuma) "Ladies and gentlemen, welcome on board flight TK 6. Our flight time today is approximately twelve hours and thirty minutes. We will be cruising at thirty-eight thousand feet. Please ensure your seatbelt is fastened and your seat is in the upright position." (Tempo daha iyi olsa da, kritik bilgilerde (süre, yükseklik) yeterli vurgu yok, "approximately" ve "cruising" kelimelerinde netlik eksik. Tonlama biraz daha gelişebilir.)

*   **Güçlü:** (Sıcak, net ve kontrollü bir tonla, uygun vurgularla) "**Ladies and gentlemen**, welcome on board flight TK 6. Our flight time today is approximately **twelve hours and thirty minutes**. We will be **cruising** at **thirty-eight thousand feet**. Please ensure your seatbelt is fastened and your seat is in the upright position." (Bu okuma, net telaffuz ("approximately", "cruising", "38,000"), uygun tempo, kritik bilgilerde doğru vurgu ve sıcak ama profesyonel bir tonlama ile yolcuların bilgiyi kolayca anlamasını sağlar. İletişim becerisi ve profesyonellik sergiler.)

**STAR Formatı Uygulaması**

Bu soruda STAR formatı doğrudan uygulanmaz, çünkü bu bir okuma görevidir. Ancak, adayın bu görevi yerine getirirken sergilediği **davranış**, görevin **kendisi** (Task), adayın okuma **metodu** (Action) ve bu metodun yolcular üzerindeki **etkisi/sonucu** (Result - anlaşılırlık, profesyonel imaj) şeklinde dolaylı bir yapı kurulabilir. Aday, "Situation" olarak yolcu bilgilendirme anını, "Task" olarak duyuruyu okumayı, "Action" olarak okuma tekniğini ve "Result" olarak yarattığı anlaşılır ve profesyonel etkiyi düşünerek bu göreve yaklaşmalıdır.

**Havayolu Uyarlama**

*   **THY (Turkish Airlines):** Duyuruda "Sayın Yolcularımız" gibi Türkçe ifadelerle başlama eğilimi olabilir, ancak İngilizce duyuruda standart "Ladies and gentlemen" kullanılır. Marka değeri olarak güvenilir ve misafirperver bir tonlama önemlidir.
*   **Emirates:** Lüks ve premium hizmet vurgusuyla daha akıcı, sofistike bir tonlama beklenebilir. Kelimelerdeki küçük nüanslara dikkat edilerek zengin bir dil kullanımı sergilenebilir.
*   **Qatar Airways:** "Excellence in everything we do" mottosuyla, kusursuz ve net bir telaffuz, profesyonel ve sakin bir sunum ön plandadır. Her kelimenin özenle seçildiği hissi verilmelidir.

**Tipik Takip Soruları**

1.  Okuma sırasında "approximately" kelimesini okurken nelere dikkat ettiniz?
2.  Yolcu anonslarını yaparken tonlamanın önemi hakkında ne düşünüyorsunuz?
3.  Beklenmedik bir durumda (örneğin, türbülans gibi) yolcu anonsu yapmanız gerekirse, bu durumu nasıl yönetirdiniz?`,
  },
  {
    id: 'qc_e2',
    category: 'english',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Read aloud: "In the unlikely event of a sudden loss of cabin pressure, oxygen masks will descend automatically from above your seat. Pull the mask towards you, place it firmly over your nose and mouth, secure with the elastic band, and breathe normally."',
    difficulty: 3,
    goodAnswerPointsTr: ['Sakin ama net — panik değil', 'Hareket fiilleri vurgu (pull, place, secure)', 'Yavaş + mantıklı'],
    redFlagsTr: ['Hızlı', 'Korkutucu ton', 'Net olmayan kelime'],
    tipsTr: ['Safety briefing standardı', 'Vücut dili eşliğinde'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soruyla İK uzmanı, adayın stres altında iletişim kurma becerisini, talimatları anlama ve uygulama yeteneğini ölçer. Temel nitelikler şunlardır: sakinlik, netlik, dinleme becerisi, problem çözme yeteneği ve prosedürlere uyum. Acil bir durumda panik yapmadan, verilen talimatları doğru ve eksiksiz bir şekilde yerine getirebileceğini göstermesi beklenir.

**Bu Aşamada Neden Sorulur**

Genellikle mülakatın ortalarında, adayın temel iletişim ve problem çözme becerileri test edildikten sonra sorulur. Bu noktada, adayın önceki cevaplarından elde edilen izlenimler pekiştirilir veya sorgulanır. Acil durum senaryoları, havayolunun güvenlik odaklı kültürüne ne kadar uyum sağlayabileceğini anlamak için kritik öneme sahiptir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "Tamam, anladım. Maskeyi takacağım."
    *   **Neden Kötü:** Bu cevap çok kısa, talimatların hiçbirini vurgulamıyor ve adayın konuyu tam olarak kavradığını göstermiyor. Hareket fiillerini içermiyor, bu da eksik bir anlama işaret edebilir.

*   **Orta Cevap:** "Anladım. Eğer kabin basıncı aniden düşerse, maskeler yukarıdan iner. Maskeyi çekip ağzıma ve burnuma takacağım."
    *   **Neden İyi Ama Eksik:** Temel talimatları tekrarlıyor ancak "place it firmly", "secure with the elastic band" ve "breathe normally" gibi kritik detayları atlıyor. Tonu nötr ancak panik anında yeterli olmayabilir.

*   **Güçlü Cevap:** "Anladım. *'In the unlikely event of a sudden loss of cabin pressure, oxygen masks will descend automatically from above your seat. Pull the mask towards you, place it firmly over your nose and mouth, secure with the elastic band, and breathe normally.'* Bu talimatları anladım. Sakin kalıp, maskeyi *'pull towards me'* ile kendime çekeceğim, *'place firmly over my nose and mouth'* diyerek burnuma ve ağzıma tam oturmasını sağlayacağım, ardından *'secure with the elastic band'* ile başıma sabitleyeceğim ve *'breathe normally'* talimatına uyarak normal nefes almaya devam edeceğim. Panik anında bile bu adımları net bir şekilde uygulayabilirim."
    *   **Neden İşe Yarar:** Aday, talimatları kelimesi kelimesine tekrarlayarak tam anladığını gösterir. Hareket fiillerini vurgulayarak ve İngilizce terimleri kullanarak hem dil becerisini hem de talimatları uygulama ciddiyetini sergiler. Sakinlik ve normal nefes alma vurgusu, acil durum yönetimi becerisini pekiştirir.

**STAR Formatı Uygulaması**

Bu soruda doğrudan STAR formatı uygulamak yerine, adayın "Action" ve "Result" kısımlarına odaklanması beklenir. "Situation" (kabin basıncı kaybı) ve "Task" (maskeyi doğru takma) zaten senaryoda verilmiştir. Adayın "Action" kısmı, talimatları doğru ve sırasıyla yerine getirmesini içermelidir. "Result" ise, maskenin doğru takılmasıyla kişinin hayatta kalma şansının artmasıdır.

**Havayolu Uyarlama**

Emirates, Qatar Airways veya THY gibi küresel havayolları, güvenlik ve müşteri hizmetleri standartlarını en üst düzeyde tutar. Bu tür bir soru, adayın uluslararası standartlara ne kadar hakim olduğunu ve bu standartları kendi hizmet anlayışına entegre edebileceğini gösterir. Örneğin, Emirates'in "Hello Tomorrow" vizyonuyla uyumlu olarak, adayın bu tür bir acil durumda bile profesyonel ve sakin kalması beklenir.

**Tipik Takip Soruları**

*   "Bu talimatları kendi kelimelerinizle tekrar açıklar mısınız?"
*   "Eğer yanınızdaki yolcu panik yaparsa ne yapardınız?"
*   "Havacılıkta 'MAYDAY' ve 'PAN-PAN' arasındaki fark nedir?"`,
  },
  {
    id: 'qc_e3',
    category: 'english',
    roles: ['cabin'],
    airlineIds: [],
    question: 'How do you say "Welcome aboard, please make yourself comfortable" in 3 different polite ways?',
    difficulty: 3,
    goodAnswerPointsTr: [
      '"Welcome on board, hope you enjoy your flight"',
      '"Good morning/evening, please take your seat and relax"',
      '"Welcome — let us know if there\'s anything we can do for you"',
    ],
    redFlagsTr: ['Sadece bir varyasyon', 'Robot benzeri tekrar'],
    tipsTr: ['Vary your greetings', 'Yolcunun durumuna göre seç (yorgun, neşeli)'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın iletişim becerilerini, empati yeteneğini ve misafirperverliğini ölçmeyi hedefler. HR uzmanı, adayın nazik ve profesyonel bir karşılama dilini ne kadar akıcı ve çeşitli kullanabildiğini görmek ister. Adayın stres altında bile pozitif bir tutum sergileyebilmesi, müşteri odaklılığı ve takım çalışmasına yatkınlığı da bu soru aracılığıyla değerlendirilebilir.

**Bu Aşama Neden Sorulur**

Bu soru genellikle mülakatın erken veya orta aşamalarında sorulur. Adayın temel iletişim ve hizmet yetkinliklerini hızlıca anlamak için kullanılır. Özellikle müşteriyle ilk teması kuracak kabin ekibi gibi rollerde, adayın ilk izlenim yaratma becerisini değerlendirmek açısından kritiktir.

**3 Seviyeli Cevap Örneği**

*   **Zayıf:** "Welcome aboard." Bu cevap çok kısa, kişisel olmayan ve eksiktir. Yolcuya rahatlama veya ihtiyaçlarını bildirme konusunda hiçbir yönlendirme yapmaz, bu da ilgisiz bir izlenim bırakır.

*   **Orta:** "Welcome on board, please take your seat." Bu cevap, yolcuyu karşılama ve oturma talimatını içerir. Ancak "make yourself comfortable" veya benzeri bir ifadeyle yolcunun rahatlığına yönelik bir ilave yapılmadığı için biraz eksik kalır.

*   **Güçlü:** "Good morning/afternoon, welcome aboard! Please make yourself comfortable. If you need anything at all during the flight, don't hesitate to ask." Bu cevap, hem yolcuyu sıcak bir şekilde karşılar hem de rahat etmesini teşvik eder. Ek olarak, "If you need anything at all..." ifadesiyle proaktif bir hizmet sunma isteği ve yolcunun ihtiyaçlarına duyarlılık gösterilir. Bu, hem profesyonel hem de samimi bir karşılama sunar.

**STAR Formatı Uygulaması**

Bu soruya STAR formatında doğrudan bir olay anlatmak yerine, adayın gelecekteki görevlerinde bu beceriyi nasıl kullanacağını yapılandırarak anlatması beklenir. Örneğin, **Situation** (Durum): Yoğun bir boarding süreci. **Task** (Görev): Her yolcuya nazik ve kişisel bir karşılama sunmak. **Action** (Eylem): Yukarıdaki "güçlü" cevap örneğindeki gibi, yolcunun göz temasını kurarak ve gülümseyerek karşılama. **Result** (Sonuç): Yolcunun kendini değerli ve rahat hissetmesi, pozitif bir uçuş deneyimi başlangıcı.

**Havayolu Uyarlama**

Bu karşılama ifadeleri, havayolunun marka kimliğine göre uyarlanabilir. Örneğin, Emirates'in "Hello Tomorrow" sloganıyla uyumlu olarak daha vizyoner bir karşılama yapılabilirken, Qatar Airways'in "Going Places Together" yaklaşımıyla daha samimi ve iş birlikçi bir ton benimsenebilir. THY'nin "Wider skies, brighter future" temasıyla daha kurumsal ama sıcak bir karşılama tercih edilebilir. Önemli olan, havayolunun değerlerini yansıtan bir dil kullanmaktır.

**Tipik Takip Soruları**

*   "Farklı kültürel geçmişlere sahip yolcuları karşılarken nelere dikkat edersiniz?"
*   "Yoğun veya stresli bir boarding sırasında bu nezaketi nasıl korursunuz?"
*   "Bir yolcu rahatsızlığını dile getirdiğinde ilk tepkiniz ne olur?"`,
  },
  {
    id: 'qc_e4',
    category: 'english',
    roles: ['cabin'],
    airlineIds: [],
    question: 'What is the difference between "could" and "would" in cabin service?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Could = ability/possibility ("Could I have water?" = mümkün mü)',
      'Would = polite preference ("Would you like water?" = ister misiniz)',
      'Cabin service: "Would you like..." daha uygun (servis sunma)',
      'Could you... = yolcudan istek (rica)',
    ],
    redFlagsTr: ['"Aynı şey" deme', 'Yanlış örnek'],
    sampleAnswerTr: '"Could" yetenek/olasılık ifade eder ("Could I have water?" = su alabilir miyim — mümkün mü). "Would" daha kibar/şart ifade eder ("Would you like water?" = su ister misiniz — sıralı tercih). Kabin servisinde "Would you like..." kullanırız (yolcuya servis sunarken). "Could you..." yolcudan ricaya kullanılır ("Could you fasten your seatbelt?" = kemerinizi bağlar mısınız).',
    tipsTr: ['Polite request gramer kritik', 'Yolcu segmentine göre uygun ton'],
      detailedExplanationTr: `**HR Psikoloji Perspektifi**

Bu soru, adayın iletişim becerilerini, dil hakimiyetini ve müşteri hizmetleri anlayışını ölçer. Adayın; nüansları kavrama yeteneği, kibarlık seviyesini ayarlama becerisi, duruma uygun dil kullanımı ve ince ayrıntılara dikkat etme gibi nitelikleri değerlendirilir. Özellikle misafirperverlik ve profesyonellik gerektiren bir rolde, doğru dilin doğru bağlamda kullanılması kritik önem taşır.

**Bu Aşama Neden Sorulur?**

Genellikle mülakatın ortalarında, adayın temel becerileri ve tutumu hakkında daha derinlemesine bilgi edinmek istendiğinde sorulur. Bu aşama, adayın hem dil bilgisi seviyesini hem de müşteriyle etkileşim kurma biçimini anlamak için idealdir. Havacılık sektöründe, yolcu deneyiminin her anı önemlidir ve bu tür ince dil farklılıkları, hizmet kalitesini doğrudan etkiler.

**3 Seviyeli Cevap Örneği**

*   **Zayıf Cevap:** "Could ve would aynı şey, ikisi de rica etmek için kullanılır. 'Could I have water?' veya 'Would you like water?' diyebilirsin."
    *   *Kötü çünkü:* Temel farkı göz ardı ediyor, "could" ve "would"un farklı anlamlarını ve kullanım alanlarını karıştırıyor. Kabin servisi bağlamındaki uygunluğu açıklanmıyor.

*   **Orta Cevap:** "'Could' bir şeyin mümkün olup olmadığını sorar, 'Would' ise bir tercihi kibarca sorar. Kabin servisinde 'Would you like a drink?' demek daha kibardır. 'Could you close the window?' gibi yolcudan bir ricada bulunurken de 'could' kullanılabilir."
    *   *İyi ama eksik çünkü:* Temel farkı doğru açıklıyor ve kabin servisi için uygun bir örnek veriyor. Ancak, "would"un kullanım alanları (örneğin, geçmişteki alışkanlıklar) ve "could"un farklı olasılıkları (izin isteme, yetenek) daha detaylı açıklanabilir.

*   **Güçlü Cevap:** "'Could' temel olarak yetenek veya olasılık ifade eder, aynı zamanda nazik bir izin isteme biçimidir. Örneğin, 'Could I have a blanket?' sorusu, bir battaniye alma *olasılığını* veya *mümkün olup olmadığını* sorgular. 'Would' ise daha çok kibar bir tercih sormak veya bir dileği ifade etmek için kullanılır. Kabin servisinde yolcuya bir ikram sunarken, 'Would you like a coffee or tea?' şeklinde sormak, kişinin *tercihini* nazikçe öğrenmek anlamına gelir. Bu, yolcuya seçenekler sunarken en uygun ve misafirperver yaklaşımdır. 'Could you please help me with my bag?' gibi bir durumda ise, yolcudan bir *yardım talebinde* bulunulur, bu da 'could'un başka bir kullanım alanıdır. Kısacası, 'Would you like...' ile yolcuya bir şey *sunulur*, 'Could you...' ile yolcudan bir şey *istenir*."
    *   *Bu cevap işe yarar çünkü:* Her iki kelimenin de temel anlamlarını (olasılık/yetenek vs. tercih/dilek) net bir şekilde açıklıyor, kabin servisi bağlamında "would you like"ın neden daha uygun olduğunu (ikram sunma, tercih sorma) somut örneklerle detaylandırıyor ve "could you"nun yolcudan rica anlamını da doğru bir şekilde vurguluyor.

**STAR Formatı Uygulaması**

Bu soruya STAR formatı uygulamak, adayın dil becerilerini pratik bir senaryoda nasıl kullandığını göstermesini sağlar. Örneğin, bir durum (Situation) belirtebilirsiniz: "Yoğun bir uçuşta, bir yolcu yanındaki koltukta duran el çantasını kaldırmamı istedi." Ardından görevinizi (Task) açıklarsınız: "Yolcuya kibarca ve etkili bir şekilde yardımcı olmak." Eyleminizi (Action) belirtirsiniz: "'Could you please move your bag slightly so I can place this here?' gibi bir ifade kullanmak." Son olarak, sonucunuzu (Result) özetlersiniz: "Yolcu yardımcı oldu ve sorun çözüldü." Bu, dilin pratikte nasıl işlediğini gösterir.

**Havayolu Uyarlama**

Farklı havayolları, misafirperverlik ve hizmet standartları konusunda kendi vurgularına sahiptir. Örneğin, Emirates, "Hello, welcome aboard. Would you like a drink?" gibi daha proaktif ve samimi bir karşılama dilini teşvik edebilir. Qatar Airways, "May I offer you a beverage?" gibi daha resmi ama yine de kibar bir dil kullanabilir. THY'de ise "Buyurun, ikramımız var. Kahve mi, çay mı alırsınız?" gibi daha doğrudan ama nazik bir sunum şekli yaygındır. Bu soru, adayın bu tür kültürel nüanslara ne kadar duyarlı olduğunu anlamak için bir fırsattır.

**Tipik Takip Soruları**

*   "Bir yolcu 'Can I have...' dediğinde nasıl yanıt verirsiniz? 'Could I have...' ile arasındaki fark nedir?"
*   "Bir yolcunun talebi mümkün değilse, bunu 'could' veya 'would' kullanarak nasıl kibarca reddedersiniz?"
*   "Acil bir durumda (örneğin, bir yolcu rahatsızlandığında), iletişim dilinde 'could' ve 'would' kullanımları nasıl değişir?"`,
  },

  // ═══════════ TRICKY ═══════════
  {
    id: 'qc_t1',
    category: 'tricky',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Why should we hire YOU and not the other 200 candidates?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Self-confidence + dürüstlük',
      '3 spesifik nokta (hizmet deneyimi, dil, kişilik)',
      'Şirkete ne katarsın somut',
      'Kendini diğerlerine üstün gösterme — kendine odaklan',
    ],
    redFlagsTr: ['"Hepsinden iyiyim"', 'Genelleme', 'Kibirli'],
    sampleAnswerTr: 'Diğer adayların hepsi muhtemelen iyi hazır, bunu kabul ediyorum. Benim 3 farkım: 1) 4 yıl 5-yıldız hospitality — VIP/ünlü servisinde direkt deneyim. 2) Türkçe/İngilizce/İspanyolca rahat konuşma — yolcu çeşitliliğinizde direkt fayda. 3) Bütün ekiplerimde "feedback champion"sım — kritik kabul + uygulamada güçlü. Bu üç nitelik ilk 6 ay içinde size somut katkı verir.',
    tipsTr: ['3 spesifik bullet', 'Şirkete kazanım vurgu', 'Diğerleri kötülenmez'],
  },
  {
    id: 'qc_t2',
    category: 'tricky',
    roles: ['cabin'],
    airlineIds: [],
    question: 'What\'s your biggest weakness?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Gerçek bir zayıflık (mükemmellik talep, perfeksiyonist gibi cliché değil)',
      'Üzerinde çalışma örneği',
      'Pozitif framework — gelişim',
      'İş için kritik olmayan zayıflık seç',
    ],
    redFlagsTr: ['"Çok perfeksiyonistim" — clichéd', '"Hiç zayıflık yok"', 'İş kritik bir zayıflık seç (ekip oyunu kötü, dakik değilim)'],
    sampleAnswerTr: 'Önceden public speaking — büyük gruplarda sunum gergin oluyordum. Marriott\'ta supervisor olduğumdan beri ekip toplantılarında haftada 3 kez sunum yapıyorum. Ek olarak 1 yıl Toastmasters üyesiyim. Şu an 30 kişiye sunum konforlu. Hala büyük grup öncesi 5 dk hazırlık ritüelim var — ama "stres" "fokus" oldu.',
    tipsTr: ['Üzerinde aktif çalıştığın bir nokta seç', 'Spesifik gelişim kanıtı'],
  },
  {
    id: 'qc_t3',
    category: 'tricky',
    roles: ['cabin'],
    airlineIds: [],
    question: 'If you saw a colleague stealing from the galley, what would you do?',
    difficulty: 5,
    goodAnswerPointsTr: [
      'Önce direct gözlem — emin ol',
      'Kişisel konuş (önce — pürüzsüz)',
      'Etik zorunluluk: pursar/HR bildirim',
      'Whistleblower hakları farkındalık',
      'Davranış ahlaki standart — uçak güvenliği üstün',
    ],
    redFlagsTr: ['"İlişki bozulmasın" görmezden gel', 'Direkt patrona koş', 'Asla raporlama'],
    sampleAnswerTr: 'Önce kesinlikle gördüğüme emin olmam gerek — yorgunum, yanlış görmüş olabilirim. 2 farklı uçuşta tekrarlanırsa: önce kişiyle özel konuşurum ("Senden şunu fark ettim, açıklar mısın?"). Açıklayamazsa veya devam ederse pursar\'a bildirim. Yasal: hırsızlık iş suçu + şirket sigortası etkilenir. Kendi etik zorunluluğum — ihbar etmemek beni de suç ortağı yapar.',
    tipsTr: ['Etik + due process', 'Hassas konu — diplomatik'],
  },
  {
    id: 'qc_t4',
    category: 'tricky',
    roles: ['cabin'],
    airlineIds: [],
    question: 'What if your purser asks you to do something you believe is wrong?',
    difficulty: 5,
    goodAnswerPointsTr: [
      'Önce: emin ol gerçekten yanlış mı yoksa procedure tanımıyor muyum',
      'Özel olarak konuş ("Şunu sorgulamak istedim")',
      'Israr ederse: chain of command takip',
      'Captain\'a bildirim (last resort)',
      'Olay raporu yaz',
    ],
    redFlagsTr: ['"Yapmam!" — direnme', 'Diğer crew\'a şikayet', 'Sessiz kal + sonra suçla'],
    sampleAnswerTr: 'Önce kendi emin olurum: pursar bilmediğim bir procedure mi takip ediyor? Sonra özel konuşurum: "Yardımcı olmak için soruyorum, bunu nasıl yapmamızı istiyorsunuz?" Açıklama mantıklıysa OK. Israr ederse + gerçekten yanlışsa: captain\'a bilgi vermek görevim (CRM gereği). Sonra olay raporu yazarım.',
    tipsTr: ['Hiyerarşi + etik denge', 'Diplomatik ama prensiplere bağlı'],
  },
  {
    id: 'qc_t5',
    category: 'tricky',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Are you willing to relocate to a city where you don\'t speak the language?',
    difficulty: 3,
    goodAnswerPointsTr: ['Açık kabul', 'Adaptasyon plan (dil kursu, kültür)', 'Önceden taşınma deneyimi varsa anlat', 'Long-term commitment'],
    redFlagsTr: ['"Sadece şu şehirde" — esnek değil', 'Tereddüt'],
    sampleAnswerTr: 'Tabi ki. Erasmus\'la İspanya\'da 6 ay yaşadım — başlangıçta ispanyolca yoktu, 6 ay sonra rahat konuştum. Kabin crew rolü beni Tokyo, Paris, Beijing\'e götürebilir — bu beni heyecanlandırıyor. Yeni şehirde önce 3 ay yoğun dil kursu + yerel ekiple network kurarım.',
    tipsTr: ['Past adaptation kanıtı', 'Plan göster'],
  },

  // ═══════════ COMPANY KNOWLEDGE — JENERIK ═══════════
  {
    id: 'qc_ck1',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: [],
    question: 'What 3 things do you know about our airline that excite you?',
    difficulty: 2,
    goodAnswerPointsTr: ['3 spesifik fact (filo, network, ödül)', 'Heyecan — somut sebep', 'Son gelişme bil', 'Felsefe + değer'],
    redFlagsTr: ['Genel "iyi şirket"', 'Yanlış fact'],
    tipsTr: ['Mülakat öncesi LinkedIn + websitesi', 'Son haberler tarama'],
  },
  {
    id: 'qc_ck2',
    category: 'company_knowledge',
    roles: ['cabin'],
    airlineIds: [],
    question: 'Who is our CEO and what do you think of their leadership?',
    difficulty: 3,
    goodAnswerPointsTr: ['CEO adı doğru', 'Stratejik vizyon bil (recent statement)', 'Pozitif ama dürüst görüş', 'Şirket trajektory'],
    redFlagsTr: ['Yanlış isim', '"Bilmiyorum"', 'Politik yorum'],
    tipsTr: ['Şirket yıllık raporu oku', 'CEO LinkedIn takip et'],
  },

  // ═══════════ GROUP EXERCISE ═══════════
  {
    id: 'qc_g1',
    category: 'group_exercise',
    roles: ['cabin'],
    airlineIds: ['emirates', 'qatar', 'etihad', 'lufthansa', 'british_airways'],
    question: 'GROUP TASK: A flight is overbooked. 3 passengers volunteered. As a team, decide which 3 to give the bumped seats to: a pregnant woman with no urgency, a family of 4 going to a wedding, a businessman with a critical meeting, an elderly couple, a backpacker with flexible plans.',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Grup etkin katıl — sıra sırası',
      'Mantıklı değerlendirme (urgency, vulnerability)',
      'Diğerlerini dinle — tek başına savunma yok',
      'Final consensus — özet',
      'Empati + ticari logic dengesi',
    ],
    redFlagsTr: ['Çok baskın (her şeyi sen söyle)', 'Sessiz kal', 'Diğerlerini kes'],
    sampleAnswerTr: 'Önce gruba "Listeyi prioritize edelim" derim. 1) Hamile + acil değil — kalmalı (sağlık riski + vulnerability). 2) Aile düğüne gidiyor — uzun vadeli plan, alternatif zor — kalmalı. 3) Yaşlı çift — vulnerability, kalmalı. Backpacker + businessman: backpacker esnek plan, çıkmaya hazır olabilir; businessman ticari önemli ama next flight 3 saat sonra varsa — businessman da çıkabilir. Ben grup tartışmasını özetleyip oylama önereirim.',
    tipsTr: ['Grup içi rol — moderatör/özet', 'Empati ile mantık', 'Konsensüs vurgu'],
  },
];

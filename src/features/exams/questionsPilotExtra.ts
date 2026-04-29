/**
 * Genişletilmiş Pilot Mülakat Soruları (35+).
 * Kategoriler: technical, situational, behavioral, motivation, tricky.
 */
import type { InterviewQuestion } from './airlineTypes';

export const PILOT_EXTRA_QUESTIONS: InterviewQuestion[] = [
  // ═══════════ TECHNICAL ═══════════
  {
    id: 'qp_te1',
    category: 'technical',
    roles: ['pilot'],
    airlineIds: [],
    question: 'Explain V1, VR, V2 in your own words.',
    difficulty: 4,
    goodAnswerPointsTr: [
      'V1 = decision speed (motor arızası: V1\'den önce abort, V1+1 takeoff)',
      'VR = rotation speed (yoke pull, nose up)',
      'V2 = takeoff safety speed (engine out climb)',
      'V1 ≤ VR ≤ V2 ilişkisi',
      'OEI ve weight etkisi',
    ],
    redFlagsTr: ['Karıştır', 'Aviation terim İngilizce zayıf'],
    sampleAnswerTr: 'V1 — karar hızı. V1\'in altında motor arızası: kalkışı iptal. V1\'i geçtikten sonra: kalkış zorunlu (mesafe yetmez). VR — rotasyon hızı, kontrol kolunu çekip burnu kaldırma. V2 — minimum güvenli tırmanış hızı, tek motor durumda bile uçak güvenle yükselir. Sıralama: V1 ≤ VR ≤ V2. OEI (One Engine Inoperative) durumda V2 minimum, weight + altitude ile değişir.',
    modelAnswerEn: 'V1 is the decision speed — below V1 you abort if engine fails; above V1 you must continue takeoff because there isn\'t enough runway to stop. VR is rotation speed — pull the yoke, nose up. V2 is takeoff safety speed, the minimum speed at which the aircraft can climb safely on one engine. Order is V1 ≤ VR ≤ V2. These speeds are calculated based on weight, altitude, temperature, and runway condition.',
    tipsTr: ['Frazeoloji ezbere', 'Pratik hesap örneği'],
      detailedExplanationTr: `**Mülakatçı değerlendirmesi**
Pilot için temel airspeed bilgisi — bilmemek anında "type rating'e hazır değil" damgası. Sınav uzmanları 4 niteliği ölçer: tanım kesinliği (V1/VR/V2 birbirinden ayırt etme), operasyonel anlayış (decision speed mantığı), İngilizce frazeoloji disiplini (tercüme değil ezbere İngilizce), ve practical awareness (weight + altitude değişkenleri). Karıştıran aday simülatörde 1. session'da yakalanır.

**Bu aşamada neden sorulur**
Mülakatın teknik bölümünde, çoğunlukla simülatör değerlendirmesinden önce. THY/Pegasus/Emirates pilot mülakatlarında V1/VR/V2 standart açılış sorusu — "fundamentals var mı" testi. Boeing 737/A320 type rating'inde günlük olarak kullanılan kavramlar; cevabı 30 saniyede vermek beklenir.

**3 seviyeli cevap örneği**
- **Zayıf**: "V1 hızlardan biri, kalkışla ilgili." → kötü çünkü operasyonel mantık yok; tanım eksik.
- **Orta**: "V1 decision speed, V2 takeoff safety speed, VR rotation." → iyi başlangıç ama mantık zinciri eksik.
- **Güçlü**: "V1 = decision speed. V1'in altında motor arızası olursa kalkışı abort ederim — pist mesafesi yeter. V1'i geçtiğim anda kalkışım zorunlu — durmaya pist yetmez. VR = rotation speed, yoke'u çekip burnu kaldırma anı, normalde V1+5 knot civarı. V2 = takeoff safety speed, OEI (One Engine Inoperative) durumda bile uçak güvenle tırmanır — minimum 1.13 × Vstall. Sıralama: V1 ≤ VR ≤ V2. Weight + altitude artarsa hepsi yükselir; örneğin A320'de MTOW yakın yükte FL hot/high pistinde V1 değerleri ~150-160 knot." → bu cevap işe alır çünkü operasyonel mantık + sıralama + değişken farkındalığı + spesifik aircraft örneği var.

**Yapısal yaklaşım (technical Q için)**
3-bullet teknik tanım: (1) Definition + birim, (2) Operational meaning (ne zaman/neden), (3) Sınır/relation (diğer V hızlarıyla ilişki). Sonra mini practical example. 60 saniye altı.

**Havayolu/sertifikasyon uyarlama**
THY/Pegasus için: A320 + 737NG aircraft-specific V hızlarını dakika hesaplayabilmek beklenir. Emirates/Qatar: A380 + 777 long-haul context (V1 değerleri farklı). Lufthansa: A350 + 320NEO modern fleet. Sertifikasyon: ICAO Annex 8 + EASA CS-25 referansları soruluyorsa "weight, density altitude, runway slope" etkenlerini bil.

**Tipik takip soruları**
- "V1'i geçtiğin anda motor patlarsa ne yaparsın?"
- "VR'dan sonra rüzgar kayması olsa nasıl tepki verirsin?"
- "Weight artınca V1 nasıl değişir, neden?"`,
  },
  {
    id: 'qp_te2',
    category: 'technical',
    roles: ['pilot'],
    airlineIds: [],
    question: 'What is the difference between IAS, TAS, GS, and Mach?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'IAS = Indicated Airspeed (pitot okur, density düzeltmesi yok)',
      'TAS = True Airspeed (yükseklik + sıcaklık düzeltmesi)',
      'GS = Ground Speed (TAS ± wind component)',
      'Mach = Hız ÷ ses hızı (yüksek altitude\'da ses hızı düşer)',
      'Climb-cruise: IAS sabit, TAS artar, Mach artar',
    ],
    redFlagsTr: ['Karıştır', 'Yüzde hata'],
    sampleAnswerTr: 'IAS = pitot tüpün okuduğu, dinamik basınç bazlı, density düzeltmesi yok. TAS = IAS + yükseklik + sıcaklık düzeltmesi (FL350\'de TAS IAS\'tan ~%50 yüksek). GS = TAS ± rüzgar (headwind GS\'i azaltır, tailwind artırır). Mach = hız ÷ local ses hızı. Cruise\'da Mach sabit tutulur (M.78), IAS azalır TAS sabit kalır.',
    tipsTr: ['Üç tane farklı durum hesapla pratik', 'FAA airspeed handbook'],
      detailedExplanationTr: `**Mülakatçı değerlendirmesi**
Pilot temel aviasyon teorisi sorusu. 4 hız tanımının arasındaki ilişki + pratik uygulama. Sınav uzmanları 4 niteliği ölçer: kavramsal netlik (her hız farklı şey ölçüyor), formül zinciri (IAS → TAS → GS), Mach sayısı anlayışı (yüksek altitude'da kritik), ve pratik bağlam (cruise'da hangi hız sabit tutulur). Karıştıran aday FMS/MCDU programlamada hata yapar.

**Bu aşamada neden sorulur**
Mülakatın teknik aviasyon teorisi bölümünde, V hızlarından sonra mantıklı geçiş. Pilot her uçuşta bu 4 hızı okur ve birbirine dönüştürür — cruise FL370'de IAS 250 görürken TAS 460 olabilir. Bilmemek "FMS'den sadece okuduğum sayıyı kullanıyorum" mesajı verir; pilot yargısı zayıf.

**3 seviyeli cevap örneği**
- **Zayıf**: "IAS gösterdiği hız, TAS gerçek hız, GS yer üzerindeki hız." → kötü çünkü ilişki + neden yok; formül anlayışı sıfır.
- **Orta**: "IAS pitot tüpten, TAS yükseklik düzeltmesi, GS rüzgâr eklenmiş, Mach ses oranı." → iyi tanım ama pratik bağlam yok.
- **Güçlü**: "IAS = Indicated Airspeed, pitot tube'un dinamik basınç okuduğu, density düzeltmesi yok — direkt cockpit göstergesi. TAS = True Airspeed, IAS'a yükseklik + sıcaklık (density) düzeltmesi. FL350'de TAS, IAS'tan ~%50 yüksek (ör. IAS 280 → TAS 460). GS = Ground Speed, TAS ± wind component. Headwind 50 knot olursa GS 410, tailwind 50 olursa 510. Mach = airspeed ÷ local speed of sound. Yüksek altitude'da ses hızı düşer; cruise'da Mach 0.78 sabit tutulur ama climb'da IAS 280 sabit tutulur (Mach artar) — bu yüzden 'climb on speed' vs 'cruise on Mach' geçişi var." → bu cevap işe alır çünkü 4 tanım + ilişki + climb/cruise pratik dönüşüm var.

**Yapısal yaklaşım (technical Q için)**
4 tanım için 4-bullet (her biri 15 saniye), sonra 'practical scenario' ile bağla — örneğin "FL350 cruise'da 4 hız değerlerimi okurum" gibi. Toplam 90 saniye.

**Havayolu/sertifikasyon uyarlama**
Geçiş mülakatlarında (THY → Emirates) Mach number önemi vurgulanır — long-haul pilotlar Mach felsefesi yaşar. Pegasus/Ryanair short-haul: IAS odaklı düşünme. Modern glass cockpit (PFD): tüm 4 hız aynı anda görünür — pilot hangisini takip edeceğini fazlarına göre bilmeli. Sertifikasyon: ATPL Theory exam Subject 022 (Instrumentation) referans.

**Tipik takip soruları**
- "Climb sırasında IAS sabit, TAS ne yapar?"
- "Crossover altitude nedir, nasıl hesaplanır?"
- "Vmo ve Mmo neden iki ayrı limit?"`,
  },
  {
    id: 'qp_te3',
    category: 'technical',
    roles: ['pilot'],
    airlineIds: [],
    question: 'What does "PNF" and "PF" mean in CRM?',
    difficulty: 3,
    goodAnswerPointsTr: [
      'PF = Pilot Flying — uçağı kontrol eden',
      'PNF/PM = Pilot Not Flying / Pilot Monitoring — diğer roller',
      'Görev paylaşımı: PF radio yapmaz, PNF radio + checklist',
      'Tekrar değişim: descend before approach',
    ],
    redFlagsTr: ['Karıştır'],
    sampleAnswerTr: 'PF (Pilot Flying) = uçağı aktif uçuran. PNF/PM (Pilot Monitoring) = diğer pilot — radio communications, checklist, monitoring instruments. Görev paylaşımı: PF\'in elleri tamamen uçakta — uçma + thrust + AP yönetimi. PNF/PM = ATC ile konuşma, ECAM/EICAS okuma, callout yapma. Approach öncesi rotasyon yapılabilir (örn captain landing yapacaksa F/O cruise PF olabilir).',
    tipsTr: ['CRM standart hierarchy', 'Multi-crew SOP'],
      detailedExplanationTr: `**Mülakatçı değerlendirmesi**
Multi-crew CRM'in temel kavram testi. Sınav uzmanları 4 niteliği ölçer: rol netliği (PF vs PM görev paylaşımı), iletişim disiplini (kim radyoyu kullanır), çift-pilot sinerjisi (workload management), ve modern terminoloji (PNF eski, PM yeni standart). Karıştıran aday simülatör 2-crew SOP'una hazır değil.

**Bu aşamada neden sorulur**
Mülakat teknik açılışında, V hızlardan sonra. CRM bilgi temeli — Boeing/Airbus tüm SOP'lar PF/PM rolü üzerine kurulu. Adayın "single pilot mentality"den "crew coordination"a geçişi test edilir.

**3 seviyeli cevap örneği**
- **Zayıf**: "PF uçuran, PNF diğer pilot." → kötü çünkü görev paylaşımı + neden yok.
- **Orta**: "PF kontrol ediyor, PM monitor + radio + checklist yapıyor." → iyi ama dynamic değişimden bahsetmedi.
- **Güçlü**: "PF (Pilot Flying) uçağı aktif kontrol eder — eller yoke + thrust + AP yönetimi. PM (Pilot Monitoring, eski adıyla PNF) destek görevleri: ATC radio, checklist, ECAM/EICAS okuma, cross-check (örn 'V1, rotate' callout), navigation monitoring. Görev rotasyonu sektörlere göre — captain ilk leg PF olabilir, F/O dönüşte PF. Approach öncesi rotasyon mümkün; landing yapan pilot inişten önce PF olur. Kritik: stress altında PF/PM rolleri sabit kalmalı — captain assertive müdahale kararını ayrı verir, rolden çıkmaz." → bu cevap işe alır çünkü görev detayı + dinamik rotasyon + stress yönetimi var.

**Yapısal yaklaşım (technical Q için)**
2-rol tanımı + görev listesi + rotasyon mantığı. Modern terminoloji (PM) önce, parantezde eski (PNF). 60 saniye altı.

**Havayolu uyarlama**
THY/Pegasus: A320/737 SOP terminolojisi (PM standart). Emirates/Qatar: PF/PM açık ayrım, pre-flight briefing'te kim hangi leg'de PF belirlenir. Lufthansa: çok sıkı CRM kültürü, "Speak Up" + "Two Challenge Rule" entegre. Türk havacılığında "co-pilot çekingenliği" sorunu var — mülakatta assertiveness vurgu iyi.

**Tipik takip soruları**
- "Stress altında PM rolünden geçici çıkıp PF'i monitör etme zorunluluğun olur mu?"
- "Two Challenge Rule nedir, ne zaman kullanılır?"
- "PF ve PM arasında çatışma çıkarsa nasıl çözülür?"`,
  },
  {
    id: 'qp_te4',
    category: 'technical',
    roles: ['pilot'],
    airlineIds: [],
    question: 'Explain TCAS Resolution Advisory (RA) — what do you do?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'RA = TCAS\'in çatışma önleme komutu',
      '"Climb!" or "Descend!" — DERHAL takip et',
      'ATC clearance\'i geçici override',
      'Standart calls: "TCAS climb, TCAS climb"',
      'AP disengage (manual flight)',
      'Conflict cleared: "Clear of conflict" callout, return to ATC instructions',
    ],
    redFlagsTr: ['ATC\'ye sor', 'Çift bakar', 'Yavaş tepki'],
    sampleAnswerTr: 'RA = TCAS\'in trafik çatışması önleme komutu. Komut "Climb climb" veya "Descend descend" net direktif. AP disengage, manual fly, target rate (~1500 fpm) takip. ATC\'ye "TCAS RA" callout. ATC clearance\'i geçici override edilir — TCAS önceliklidir. "Clear of conflict" gelince ATC direction\'a dön ve heading + altitude bildir.',
    tipsTr: ['Standart callouts ezbere', 'Reaction time < 5 seconds', 'AP off zorunlu'],
      detailedExplanationTr: `**Mülakatçı değerlendirmesi**
TCAS RA çatışma önleme — pilot emniyet kültürü litmus testi. Sınav uzmanları 4 niteliği ölçer: refleks (RA gelir gelmez 5 saniye içinde tepki), CRM netliği (ATC clearance vs TCAS önceliği), AP yönetimi (manual flying transition), ve fraseoloji (TCAS standart callout'ları). Karıştıran aday "tehlike anında ATC'ye danışır" mentaliteyle uçar — Überlingen 2002 (71 ölü) tipi facia riski.

**Bu aşamada neden sorulur**
Sınav teknik bölümünün "high-risk scenarios" parçasında. TCAS RA pilot kariyerinde nadir ama kritik — yanlış tepki kaza demek. Mülakat 5 saniyelik refleksin ezbere olup olmadığını test eder. Modern havacılığın TCAS önceliği kuralı 2002 Überlingen sonrası ICAO Doc 4444 değişikliği.

**3 seviyeli cevap örneği**
- **Zayıf**: "ATC'ye sorarım, ne yapacağımı söyler." → kötü çünkü ATC'ye danışma TCAS RA önceliğini ihlal eder; modern havacılıkta kabul edilemez.
- **Orta**: "RA komutuna uyarım, climb veya descend ederim." → iyi yön ama AP, callout, conflict cleared akışı eksik.
- **Güçlü**: "RA = Resolution Advisory, TCAS'in 'Climb climb' veya 'Descend descend' net direktifi. 5 saniyenin altında: AP disengage (auto-flight RA'ya uymaz), manual fly, target rate ~1500 fpm. PM ATC'ye 'TCAS RA' callout. ATC clearance geçici override edilir — TCAS önceliklidir (ICAO Doc 4444 §15.7.3). 'Clear of conflict' aural cue gelene kadar koruma. Sonra ATC direction'a dön, heading + altitude bildir. Önemli: aircraft systems (örn EGPWS, windshear) RA ile çakışırsa hierarchy bilinir — windshear > TCAS." → bu cevap işe alır çünkü reflex + AP off + callout + recovery + sistem hiyerarşisi var.

**Yapısal yaklaşım (technical Q için)**
4-fazlı: (1) Komut tanı, (2) AP off + manual, (3) Standart callout, (4) Recovery + ATC. Each faz 15 saniye. Toplam 60 saniye altı, simülatör tepkisi gibi.

**Havayolu uyarlama**
THY/Pegasus: A320/737 TCAS II versiyonu kullanıyor (RA + TA + climb/descend). Emirates/Qatar: A380/777 TCAS upgrade — Sense Reversal (RA değiştiğinde tepki testi). Lufthansa: Two Challenge entegre TCAS prosedüründe. Sertifikasyon: ICAO Annex 10 + EASA AMC1 SPA.NVIS.110 referansı.

**Tipik takip soruları**
- "RA esnasında ATC sana farklı talimat verirse ne yaparsın?"
- "TCAS Sense Reversal nedir, ne zaman olur?"
- "RA'dan sonra olay raporu zorunlu mu? Hangi sistem?"`,
  },
  {
    id: 'qp_te5',
    category: 'technical',
    roles: ['pilot'],
    airlineIds: [],
    question: 'Walk me through approach minima — what does "CAT II" mean?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'CAT I: DH 200 ft, RVR 550m',
      'CAT II: DH 100 ft, RVR 300m (dual ILS, autoland gerek)',
      'CAT III A/B/C: DH < 100 ft, RVR daha düşük',
      'Aircraft + airport + crew certification gerekli',
      'Decision height: aşağıda visual reference yoksa go-around',
    ],
    redFlagsTr: ['Karıştır', 'CAT III alt türlerini bilme'],
    sampleAnswerTr: 'ILS approach kategorileri görüş düşüklüğüne göre: CAT I = DH 200ft, RVR 550m (single ILS yeter). CAT II = DH 100ft, RVR 300m (dual ILS + autoland gerekli, both pilot CAT II yetkili olmalı, aircraft equipment listed). CAT IIIA/B/C = DH 50/0/0 ft (daha sıkı). Decision height: aşağı geldiğinde visual reference (runway, lights) yoksa go-around şart.',
    tipsTr: ['Şirket OPS spec bil', 'CAT III autoland prosedürü'],
      detailedExplanationTr: `**Mülakatçı değerlendirmesi**
ILS approach kategorileri — düşük görüş operasyonlarına yetkinlik testi. Sınav uzmanları 4 niteliği ölçer: kategori sınırları ezbere (DH + RVR rakamları), aircraft + crew sertifikasyonu farkı, autoland yönetimi, ve decision height ile visual reference ilişkisi. CAT II/III'ü bilmeyen aday düşük görüş hub'larında (LHR, FRA, IST kış) operasyonel risk.

**Bu aşamada neden sorulur**
Mülakat teknik orta-ileri seviyesinde. Long-haul + flagship pilotlar yıl içinde 5-15 kez CAT II/III approach yapar. Kategori bilmemek "Boeing/Airbus type rating eğitimine gitsin önce" sinyali. Pegasus/SunExpress gibi kısa-haul'larda nadir ama hub'da (IST, ESB) zorunlu.

**3 seviyeli cevap örneği**
- **Zayıf**: "CAT I, II, III var, görüş düşünce CAT II'ye geçiliyor." → kötü çünkü tanım eksik + rakamlar yok.
- **Orta**: "CAT I 200ft DH 550m RVR, CAT II 100ft DH 300m RVR, CAT III otomatik." → iyi rakamlar ama autoland + cert detayı eksik.
- **Güçlü**: "ILS yaklaşma kategorileri görüş bozulmasına göre: CAT I = DH 200ft AGL, RVR 550m (single ILS yeter, manual landing OK). CAT II = DH 100ft, RVR 300m — dual ILS + autoland zorunlu, both pilot CAT II yetkili olmalı + aircraft equipment listesinde olmalı. CAT III A = DH 50ft RVR 175m, B = DH 0ft RVR 75m, C = no DH no RVR (ground guidance şart, fakat rare). Decision height kritik: aşağıya geldiğimde visual reference (runway, lights, terrain feature) yoksa go-around — pilot judgement değil, kural. Aircraft + crew + airport üçü birden CAT II/III olmalı; eksiklerden biri varsa CAT I'e düşülür." → bu cevap işe alır çünkü 3 kategori detayı + cert şartları + DH karar mantığı var.

**Yapısal yaklaşım (technical Q için)**
3-kategori, her biri 4 kriter: DH, RVR, equipment, cert. Tabloyla anlatılabilir. Toplam 90 saniye altı.

**Havayolu uyarlama**
THY: IST hub kışın CAT III B yaygın. Emirates/Qatar: DXB/DOH sis nadir, ama LHR/CDG hub destinasyonlarda CAT III. Lufthansa: FRA + MUC kışın CAT III B standart, training intensive. SunExpress/Pegasus: kısa-haul ama AYT kışın occasional CAT II. Sertifikasyon: EASA AMC1 SPA.LVO + ICAO Annex 14 referansı.

**Tipik takip soruları**
- "CAT III B ile A arasındaki autoland farkı nedir?"
- "Düşük görüş onay zinciri (LVO procedures) nasıl başlar?"
- "Aircraft autoland fail olursa CAT III approach esnasında ne yaparsın?"`,
  },
  {
    id: 'qp_te6',
    category: 'technical',
    roles: ['pilot'],
    airlineIds: [],
    question: 'What\'s a stabilized approach? Why is it critical?',
    difficulty: 4,
    goodAnswerPointsTr: [
      '1000ft AGL\'da on path, on speed, on configuration',
      'Sink rate < 1000 fpm normal',
      'Engine spooled up (anti-spool delay)',
      'Speed Vref +5/-0 hedef',
      'Land or go-around — half-stable approach yok',
    ],
    redFlagsTr: ['Spesifik kriter bilmeme'],
    sampleAnswerTr: 'Stable approach = 1000 ft AGL\'da gerekli koşullar: localizer ± 1 dot, glide path ± 1 dot, speed Vref +5/-0, gear extended, flaps in landing config, sink rate < 1000 fpm, thrust at landing power. Tüm bu kriterler karşılanmazsa approach unstable — go-around şart. Çünkü unstable approach kazaların %66\'ında risk faktörü (FAA data).',
    tipsTr: ['Şirket "stable gates" kuralı bil (1000ft IMC, 500ft VMC)', 'No half measures'],
      detailedExplanationTr: `**Mülakatçı değerlendirmesi**
Stable approach — pilot emniyet felsefesinin merkezi. Sınav uzmanları 4 niteliği ölçer: kriter ezbere (1000ft AGL gates), no-half-measures kararlılığı (unstable = go-around şart), istatistik farkındalığı (FAA verileri), ve şirket SOP'una uyum. Half-stable yaklaşımı kabul eden aday ALPA "Continuous Descent Approach" kültürüne uymaz — modern havacılıkta dışlanır.

**Bu aşamada neden sorulur**
Mülakat teknik bölümünün "safety culture" kısmında. Stable approach kavramı pilot kazaların %66'sını önler — Asiana 214 (2013, SFO), Air France 296 (1988) gibi unstable approach kaza tarihçesi var. Adayın "go-around to safety" mentalitesi mi yoksa "press on" tehlikeli kültürü mü test edilir.

**3 seviyeli cevap örneği**
- **Zayıf**: "Stable approach yaklaşımın stabil olması, normal koşullarda iniş." → kötü çünkü kriter yok + kritik değer söylemedi.
- **Orta**: "1000ft'te konfigürasyon doğru, hız doğru olmalı, değilse go-around." → iyi ama kriter listesi eksik + neden açık değil.
- **Güçlü**: "Stable approach = 1000ft AGL'da (IMC) veya 500ft AGL'da (VMC) tüm kriterlerin sağlanması: localizer ± 1 dot, glide path ± 1 dot, speed Vref +5/-0 (10 knot eksik, 20 knot fazla red flag), gear extended + locked, flaps in landing config (TBO Boeing F30 veya A320 F3/Full), sink rate < 1000 fpm (>1000 fpm = unstable), thrust at landing power (idle değil — engine spool delay). Tüm kriterler karşılanmazsa go-around — half-stable yok. Çünkü FAA/Boeing FOQA verisi: pist üstü kazaların %66'sında unstable approach risk faktörü. Şirket SOP'ları 'no penalty for go-around' politikası ile destekler." → bu cevap işe alır çünkü kriter listesi + IMC/VMC ayrımı + istatistik + SOP felsefesi var.

**Yapısal yaklaşım (technical Q için)**
6-7 kriter listesi, sonra "tüm kriterler şart" felsefesi, sonra istatistik destek. Toplam 90 saniye altı.

**Havayolu uyarlama**
THY/Pegasus: 1000ft IMC, 500ft VMC standardı SOP. Emirates/Qatar: 1000ft IMC zorunlu (uzun-haul yorgunluk faktörü). Lufthansa: çok sıkı 1000ft IMC + ALL conditions check (rüzgar, runway state). LCC SunExpress: SOP aynı ama time pressure altında "stabilize gate" disiplini test edilir.

**Tipik takip soruları**
- "1000ft'te %50 unstable kriter varsa kararın nedir?"
- "Captain'ın 'land' demesine rağmen sen unstable görüyorsan ne yaparsın?"
- "Şirketinin 'no penalty go-around' politikası nasıl çalışır?"`,
  },
  {
    id: 'qp_te7',
    category: 'technical',
    roles: ['pilot'],
    airlineIds: [],
    question: 'Explain the difference between MEL and CDL.',
    difficulty: 5,
    goodAnswerPointsTr: [
      'MEL = Minimum Equipment List (system inoperative — operate olabilir mi?)',
      'CDL = Configuration Deviation List (missing/damaged external part)',
      'Hem dispatch + flight tarafından kontrol edilir',
      'Restrictions/limitations belirtilir',
      'AOG (Aircraft on Ground) önlemenin standart yolu',
    ],
    redFlagsTr: ['Karıştır'],
    sampleAnswerTr: 'MEL = Minimum Equipment List. Bir sistem inop ise (mesela one autopilot, GPS) operate edilebilir mi, koşullar ne — MEL gösterir. CDL = Configuration Deviation List. External part eksik/hasarlı (mesela static wick, bir flap track fairing) operate edilebilir mi — CDL belirler. İkisi de OEM (Boeing/Airbus) tarafından yayımlanır + havayolu tarafından regulator approval ile kullanılır. MEL/CDL penalti: speed limit, altitude limit, weight limit gibi restrictions.',
    tipsTr: ['MEL/CDL category bil', 'Dispatch + crew shared responsibility'],
      detailedExplanationTr: `**Mülakatçı değerlendirmesi**
MEL/CDL ayrımı — dispatch + airworthiness mantığı testi. Sınav uzmanları 4 niteliği ölçer: net tanım (system inop vs external part), dökümantasyon zinciri (OEM → operator → regulator), restriction farkındalığı (speed/altitude/weight limit), ve dispatch + crew shared responsibility. Karıştıran aday airworthiness'i yanlış yorumlar — "bir parça eksik, MEL'e bakayım" hatası.

**Bu aşamada neden sorulur**
Mülakat teknik üst seviye, dispatch + ground ops bilgisi test eden bölümde. Pilot her uçuş öncesi tech log + MEL/CDL kontrol eder; eksik bilgi gerçek operasyonda dispatch hatası demek. Boeing/Airbus type rating eğitiminde MEL/CDL ayrı modül.

**3 seviyeli cevap örneği**
- **Zayıf**: "MEL ekipmanlar, CDL deviation, ikisi de uçabilirim diyor." → kötü çünkü iç fark yok.
- **Orta**: "MEL system inop için, CDL eksik parça için — her ikisi de OEM'den." → iyi yön ama restriction + responsibility açık değil.
- **Güçlü**: "MEL = Minimum Equipment List. Bir aircraft sistemi inoperative ise (örn one autopilot, GPS unit, weather radar) operate edilebilir mi, hangi koşulla — MEL'de yazar. CDL = Configuration Deviation List. Aircraft external part eksik veya hasarlı (örn static wick, flap track fairing, tail cone) operate edilebilir mi, hangi limitle — CDL gösterir. Her ikisi OEM (Boeing/Airbus) tarafından yayımlanır, operator MEL'e dayanarak kendi 'Operator MEL' yapar (NAA approval gerekli). Penalti: speed limit (örn Mach 0.78 max), altitude limit (örn FL280), weight limit, range limit. Dispatch + crew shared: dispatch tech log + MEL check, crew flight planning'de uygulanabilir kategoriyi confirm. AOG (Aircraft On Ground) durumunu önlemenin standart yolu — minor item için uçağı yere indirmek yerine restriction ile uçur." → bu cevap işe alır çünkü 2 dökümandanın amacı + zinciri + cezası + sorumluluk paylaşımı var.

**Yapısal yaklaşım (technical Q için)**
2 paralel tanım (sistem vs parça), sonra şared elements (OEM, regulator, restriction), sonra business sebep (AOG önleme). 90 saniye altı.

**Havayolu uyarlama**
THY/Pegasus: A320/737 MEL'lerine aşina ol. Emirates/Qatar: A380/777 MEL kategorileri (A/B/C/D = repair days). Lufthansa: çok sıkı MEL discipline + ECAM cross-reference. Sertifikasyon: EASA AMC1 ORO.MLR.105 + FAA FAR 91.213.

**Tipik takip soruları**
- "MEL kategorisi A ile D arasındaki fark nedir?"
- "MEL'de 'operate with restriction' sınırları kim belirler?"
- "Tech log'ta unresolved MEL item gördün ne yaparsın?"`,
  },
  {
    id: 'qp_te8',
    category: 'technical',
    roles: ['pilot'],
    airlineIds: [],
    question: 'You have a "ENG 2 FAIL" message after takeoff. Walk me through the first 5 minutes.',
    difficulty: 5,
    goodAnswerPointsTr: [
      'Memory items first: pitch attitude, max thrust working engine, gear up, cleanup',
      'Flight path: positive rate of climb at V2',
      'PF aviates, PNF/PM communicates ATC',
      'ECAM: confirm + execute (or QRH)',
      'Mayday call when stable',
      'Climb to safe altitude',
      'Workload management: cabin brief, fuel check, divert plan',
      'Captain decides: return / divert',
    ],
    redFlagsTr: ['QRH önce — memory items kaçır', 'CRM unutulmuş'],
    sampleAnswerTr: 'Memory items: yawn rudder asymmetric thrust, set max thrust good engine, pitch ~10° (V2 hedefi), gear up positive rate, lateral cleanup. PF flies, PNF/PM ATC: "Mayday mayday mayday Turkish 1, engine failure, request return". 1500ft AGL minimum yükseklik > ECAM action complete. QRH oku — confirm thrust setting, fuel system, electrical. CRM: cabin secure call, captain decision (return vs alternate), fuel dump if needed. Stable climb to safe altitude (10K+).',
    tipsTr: ['Aviate-Navigate-Communicate', 'A.NIPS.D mnemonic', 'Stress under simulated reps'],
      detailedExplanationTr: `**Mülakatçı değerlendirmesi**
Engine failure after takeoff (V1 cut benzeri) — pilot kariyerinin en yüksek risk senaryosu. Sınav uzmanları 5 niteliği ölçer: memory items disiplini (kalıp ezbere), Aviate-Navigate-Communicate hiyerarşisi, CRM (PF/PM rol koruma), ECAM/QRH yönetimi, ve workload management (cabin + fuel + divert). Bu sorunun cevabı simülatör 1. session'da bizzat test edilir.

**Bu aşamada neden sorulur**
Type rating mülakatlarının zirvesi. Tüm Boeing/Airbus type rating sim sessions'ları "V1 cut" senaryosu ile başlar. Aday cevap veremezse simülatöre alınmaz. Bu senaryoyu yıllık recurrent training'de tekrar yaşar — kariyer boyu en kritik prosedür.

**3 seviyeli cevap örneği**
- **Zayıf**: "QRH'a bakarım, ATC'ye söylerim, geri dönerim." → kötü çünkü memory items yok + Aviate-Navigate-Communicate hiyerarşisi karıştı.
- **Orta**: "Memory items'ı uygularım, sonra QRH ile detay, ATC'ye mayday." → iyi başlangıç ama detay + CRM eksik.
- **Güçlü**: "Memory items derhal: pitch ~10° (V2 hedefi), max thrust working engine, rudder asymmetric thrust kompansasyon, gear up positive rate of climb, lateral cleanup. PF aviates — uçağı stabil tutmak öncelik. PM ATC: 'Mayday mayday mayday Turkish 1, engine failure runway 06, request return'. 1500ft AGL minimum yükseklik (acceleration altitude) sonra ECAM action — confirm + execute (or QRH). Cabin briefing: 'Cabin secure for landing'. CRM kararı: return vs alternate — fuel + weather + hospital. Stable climb 5000-10000ft safe altitude. Workload artar — fuel dump (787, 777), captain takeoff brief tekrar. Önemli: V2 + 10 knot acceleration için, sonra clean up; ezbere yapılan adımlar 5 saniyede başlar." → bu cevap işe alır çünkü memory items + Aviate-Navigate-Communicate + CRM + cabin koordinasyonu + zaman çizelgesi var.

**Yapısal yaklaşım (technical Q için)**
0-30 saniye memory items, 30 saniye - 2 dk ECAM/QRH + ATC, 2-5 dk CRM + cabin + divert kararı. Bu zaman çizelgesi simülatör performansını yansıtır.

**Havayolu uyarlama**
THY: A320 family + 737 — EASA + Boeing memory items farkı. Emirates/Qatar: 777/A380 long-haul, fuel dump + ETOPS implication. Lufthansa: A350 + A320NEO, EICAS/ECAM kapsamı geniş. Pegasus: 737-800/MAX, engine roll-back v engine failure ayrımı kritik. Sertifikasyon: EASA Part-FCL + Operator-specific QRH.

**Tipik takip soruları**
- "Memory items ezbere mi yoksa pencereden okur musun?"
- "Single engine taxi sonrası geri dönüşte ETOPS-significant?"
- "Cabin'de yangın varsa engine failure ile birleşirse priority hangisi?"`,
  },
  {
    id: 'qp_te9',
    category: 'technical',
    roles: ['pilot'],
    airlineIds: [],
    question: 'What is fuel planning — explain reserves.',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Trip fuel = origin to destination',
      'Contingency fuel = %5 of trip (or 5 min)',
      'Alternate fuel = destination to alternate airport',
      'Final reserve = 30 min holding at 1500ft',
      'Extra fuel (commander discretion)',
      'Total = trip + cont + alt + final + extra',
    ],
    redFlagsTr: ['Reserve kategori bilme'],
    sampleAnswerTr: 'Standart EU-OPS planlama: 1) Trip fuel (origin→destination). 2) Contingency = %5 trip (turbulence, vector). 3) Alternate fuel (destination→alternate). 4) Final reserve = 30 dakika holding at 1500ft (ICAO). 5) Extra (captain discretion — known weather, etc). Toplam yakıt = trip + cont + alt + final + extra. Min landing fuel = final reserve + alternate.',
    tipsTr: ['EASA Annex IV fuel rules', 'Decision point procedure'],
      detailedExplanationTr: `**Mülakatçı değerlendirmesi**
Yakıt planlama — pilot operasyonel matematiğinin temeli. Sınav uzmanları 4 niteliği ölçer: rezerv kategorileri ezbere (5 ayrı kategori), regülasyon farkındalığı (EU-OPS vs FAA), captain discretion mantığı, ve risk-based fuel decisions. Yakıt rezervlerini bilmemek "hesapsız uçar, fuel emergency yaratır" sinyali.

**Bu aşamada neden sorulur**
Mülakat teknik orta seviyede. Pilot her uçuşta yakıt formülü uygular; recurrent training'de "fuel emergency" senaryoları test edilir. Avianca 052 (1990, NYC) gibi yakıt yönetim hatası kazaları bu sorunun arkasındaki tarih. EASA Air-OPS regülasyonu rezerv kategorilerini zorunlu kıldı.

**3 seviyeli cevap örneği**
- **Zayıf**: "Trip fuel + reserve fuel, alternate eklenir." → kötü çünkü 5 kategoriden 2-3'ü eksik.
- **Orta**: "Trip + contingency + alternate + final reserve, captain extra ekleyebilir." → iyi liste ama yüzde + dakika değerleri eksik.
- **Güçlü**: "EU-OPS standart yakıt planlama 5 kategori: (1) Trip fuel = origin'den destination'a, route fuel + climb/descent. (2) Contingency = trip fuel'ün %5'i veya 5 dakika seyir, hangisi büyükse — turbulence, ATC vector, route change için. (3) Alternate fuel = destination'dan alternate airport'a. (4) Final reserve = 30 dakika holding at 1500ft AGL — ICAO Annex 6 zorunlu. (5) Extra fuel = captain discretion — known weather, operational concerns için. Toplam = trip + cont + alt + final + extra. Min landing fuel = final reserve + alternate. Yakıt < (final + alt) ise 'Minimum Fuel' deklarasyonu; < final ise 'Mayday Fuel' (Avianca 052 dersi). Decision point procedure long-haul'da: ETOPS sırasında alternate uçaklarına yetkin mi kontrol." → bu cevap işe alır çünkü 5 kategori + hesap formülü + emergency hierarchy + tarih dersleri var.

**Yapısal yaklaşım (technical Q için)**
5 kategori sırayla, her biri (a) tanım, (b) miktar, (c) amaç. Sonra emergency hierarchy. 90 saniye altı.

**Havayolu uyarlama**
THY/Pegasus: A320/737 short-haul, alternate fuel + final reserve standart. Emirates/Qatar: A380/777 long-haul, decision point procedure + 'isolated airport' EU-OPS exception. Lufthansa: A350 + 320NEO modern fleet, fuel optimization aggressive ama emergency margin sıkı. Sertifikasyon: EASA Air-OPS CAT.OP.MPA.150 + ICAO Annex 6 + FAA FAR 121.

**Tipik takip soruları**
- "Decision point procedure nedir, ne zaman kullanılır?"
- "'Minimum Fuel' deklare edersin sonra ne olur?"
- "Alternate fuel hesaplarken weather change'i nasıl yansıtırsın?"`,
  },
  {
    id: 'qp_te10',
    category: 'technical',
    roles: ['pilot'],
    airlineIds: [],
    question: 'Explain wake turbulence categories and separation requirements.',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Heavy/Medium/Light/Super (A380)',
      'Heavy behind Heavy: 4 NM',
      'Medium behind Heavy: 5 NM',
      'Light behind Heavy: 6 NM',
      'Time-based: 2-3 min behind heavy',
    ],
    redFlagsTr: ['Sayı bilmeme'],
    sampleAnswerTr: 'ICAO kategorileri: Light (<7 ton), Medium (7-136 ton), Heavy (>136 ton), Super (A380). Vortex strength weight + speed + wing span ilişkili. Min separation: heavy behind heavy 4NM, medium behind heavy 5NM, light behind heavy 6NM. Time-based take-off: 2 min behind heavy, 3 min behind super. Cross-runway: 3 min mandatory.',
    tipsTr: ['ICAO Doc 4444 separation', 'Wake encounter procedure'],
      detailedExplanationTr: `**Mülakatçı değerlendirmesi**
Wake turbulence kategorileri — separation güvenlik bilgisi. Sınav uzmanları 4 niteliği ölçer: ICAO sınıflandırması ezbere (Light/Medium/Heavy/Super), separasyon rakamları (NM ve dakika), encounter prosedürü (vortex'e girersen ne yaparsın), ve modern ICAO Wake Re-Categorization (RECAT) farkındalığı. Karıştıran aday ATC ile koordinasyonda hata yapar.

**Bu aşamada neden sorulur**
Mülakat teknik orta-ileri seviyede. Wake turbulence accidents (örn American 587, 2001) sonrası sektör büyük revizyon yaptı; ICAO standartları + RECAT (US, Eurocontrol) reform getirdi. Hub airports'ta (FRA, IST, CDG) wake separation kapasitenin %20-30'unu belirler — pilot bilmesi şart.

**3 seviyeli cevap örneği**
- **Zayıf**: "Heavy, medium, light var, mesafe bırakırsın." → kötü çünkü rakam yok + super eksik.
- **Orta**: "Heavy >136 ton, medium 7-136 ton, light <7 ton; behind heavy 4-6 NM." → iyi liste ama time-based + super eksik.
- **Güçlü**: "ICAO 4 kategori: Light (<7 ton MTOW), Medium (7-136 ton), Heavy (>136 ton), Super (sadece A380 + An-225 historical). Vortex strength weight + speed + wing span ile orantılı. Min separation: heavy behind heavy 4 NM, medium behind heavy 5 NM, light behind heavy 6 NM, super behind super 4 NM, light behind super 8 NM. Time-based take-off (intersection departure): 2 dakika behind heavy, 3 dakika behind super. Cross-runway: 3 dakika mandatory. Modern ICAO RECAT-EU (2016) 6 kategoriye genişledi (CAT-A super, CAT-B heavy, CAT-C upper medium, CAT-D lower medium, CAT-E light upper, CAT-F light) + dynamic spacing — Eurocontrol hub'larda kapasite %5-10 artışı. Encounter olursa: aileron rolünden çıkma, gentle recovery (forced inputs vortex'i amplify eder)." → bu cevap işe alır çünkü 4 kategori + rakam + RECAT + recovery prosedürü var.

**Yapısal yaklaşım (technical Q için)**
Tablo benzeri sunum: kategori → MTOW range → separation behind heavy. Sonra modernizasyon + recovery. 90 saniye altı.

**Havayolu uyarlama**
THY/Pegasus: IST hub'da wake separation kapasitenin sıkıştırıcı faktörü. Emirates/Qatar: A380 super kategori operatörü, departure timing kritik. Lufthansa: FRA wake re-cat agresif uygulanır. Sertifikasyon: ICAO Doc 4444 §5.8 + Eurocontrol RECAT-EU 2.0.

**Tipik takip soruları**
- "RECAT-EU ile classic ICAO arasındaki kapasite farkı?"
- "Wake encounter olursa kontrol stratejin nedir?"
- "Visual separation ile wake separation aynı anda uygulanabilir mi?"`,
  },

  // ═══════════ SITUATIONAL (DECISION) ═══════════
  {
    id: 'qp_s1',
    category: 'situational',
    roles: ['pilot'],
    airlineIds: [],
    question: 'You\'re cruising at FL370 and a passenger requires medical diversion. Closest airport is 200 NM behind, ahead is 350 NM. Both have poor weather. How do you decide?',
    difficulty: 5,
    goodAnswerPointsTr: [
      'On-board doctor consultation — durum acil mi?',
      'Medlink/Medaire (medical advisory)',
      'Two airport weather + facilities',
      'Behind: turn-back fuel, descend time',
      'Ahead: continue forward speed advantage',
      'Captain decision after data',
      'Cabin briefing + crew',
    ],
    redFlagsTr: ['Bilgi toplamadan karar', 'CRM atla'],
    sampleAnswerTr: 'Önce: cabin\'den medical situation detayı al, on-board doctor mı var. Medlink call (PFA-equipped airline\'larda standard) — physician advisory. Sonra weather check her iki havaalanı + medical facilities. Behind 200NM = turn back + descend ~25 min. Ahead 350NM = ~40 min ama önümde yön. Eğer kalp krizi/stroke = yakın olan kritik (golden hour). Eğer stable = ileri continue. Decision tree CRM ile co-pilot consult. Final captain command.',
    tipsTr: ['Medlink/Medaire bil', 'Golden hour concept', 'Captain authority + CRM'],
      detailedExplanationTr: `**Mülakatçı değerlendirmesi**
Medical diversion — pilot karar alma + CRM altın saati testi. Sınav uzmanları 5 niteliği ölçer: bilgi toplama disiplini (cabin → doctor → MedLink), iki-airport karşılaştırma çerçevesi (weather + facility + golden hour), captain authority + CRM dengesi, fuel hesabı (turn-back + descent), ve cabin koordinasyonu. Bilgi toplamadan karar veren aday "cowboy captain" damgası alır.

**Bu aşamada neden sorulur**
Mülakat situational üst seviye. Medical diversion gerçek hayatta yıllık 100+ kez olur (uluslararası havayolu için); kötü karar = ceza dava + can kaybı. Soru pilot'un "hızlı ama bilinçli" karar verme kapasitesini test eder. Asiana 214 (2013) gibi karar gecikmesi vakaları arkaplan.

**3 seviyeli cevap örneği**
- **Zayıf**: "En yakın havalimanına dönerim." → kötü çünkü weather + facility + hasta durumu hiç değerlendirilmedi; refleks karar.
- **Orta**: "Önce kabin'den durum öğrenirim, sonra havaalanı seçerim." → iyi yön ama MedLink + golden hour + CRM yok.
- **Güçlü**: "Önce bilgi toplarım: kabin'den medical situation detayı (yaş, semptomlar, bilinç), on-board doctor mı var. MedLink/Medaire call yapacak (PFA-equipped airline'larda zorunlu) — physician advisory. Bu 2-3 dakika alır ama paralel olarak: weather check her iki havaalanı (cloud, wind, RVR), medical facility (cardiac center mı, hangi mesafede), runway suitability. Behind 200NM = turn back + descent ~25 dk. Ahead 350NM = ~40 dk ama ileri yön avantajı. Karar matrisi: kalp krizi/stroke/anaphylaxis = golden hour kritik (60 dk eylem) → yakın olan tercih, kötü hava bile. Stable medical (mide bulantısı, dehydrasyon) = ileri devam, hava daha iyiyse. Co-pilot ile CRM consult: 'Bu durumda önerin nedir?' Final captain decision. Cabin briefing: 'Crew, expect diversion, prepare emergency landing'. ATC'ye 'PAN PAN PAN, medical diversion request'. Tüm akış 5 dakika içinde — bilgi + karar + iletişim." → bu cevap işe alır çünkü structured information gathering + golden hour + CRM + ATC dialect var.

**Yapısal yaklaşım**
4-fazlı: (1) Bilgi topla 2-3 dk, (2) Karar matrisi 1 dk, (3) CRM consult 1 dk, (4) Eylem + iletişim 1 dk. Toplam 5 dakika decision window.

**Havayolu uyarlama**
THY: Türk doktor STK ağı (TÜRKMED) on-board consult. Emirates/Qatar: MedAire 24/7 tıbbi danışmanlık zorunlu. Lufthansa: TempusIC + DRF Luftrettung yer tıbbi koordinasyon. Pegasus/SunExpress: kısa-haul nadir ama Yunan/İtalyan kıyı diversion senaryoları olası.

**Tipik takip soruları**
- "On-board doctor yoksa karar nasıl değişir?"
- "Yolcu ailesi 'devam edin' diye baskı yaparsa?"
- "Dispatch 'alternate'i kabul etmiyor' derse captain authority kullanır mısın?"`,
  },
  {
    id: 'qp_s2',
    category: 'situational',
    roles: ['pilot'],
    airlineIds: [],
    question: 'During preflight, you discover a previous crew\'s tech log has unusual entry: "minor turbulence, smoke briefly seen in galley". Maintenance signed off as "investigated, no defect found". You\'re uncomfortable. Action?',
    difficulty: 5,
    goodAnswerPointsTr: [
      'Tech log signature kontrol — engineer name + time',
      'Önce maintenance ile direct konuş — detay iste',
      'Şüphe sürerse: chief pilot / ops control bildirim',
      'Captain authority — uçmayı reddedebilirim eğer şüphe makul',
      'Uçtuğun anda tüm fire detection sistemler aktif kontrol',
    ],
    redFlagsTr: ['Sessiz kal — uç', 'Sadece kendi crew\'a şikayet'],
    sampleAnswerTr: 'Tech log entries\'i tekrar dikkatle okurum + engineer signature kontrol. Maintenance hangar\'a gider direkt sorarım: "ne araştırıldı, neden no defect found?" Mantıklı açıklama varsa OK. Şüphe sürerse: chief pilot duty officer\'a bildirim → ek inspection talep. Captain authority kullanırım: makul şüphe varsa uçmayı reddedebilirim, dispatch tarafından ücret cezası YOK (CAR/EASA captain authority).',
    tipsTr: ['Captain authority bil', 'Documentation chain', 'No-blame culture'],
      detailedExplanationTr: `**Mülakatçı değerlendirmesi**
Tech log "comfort gut feeling" senaryosu — captain authority + safety culture testi. Sınav uzmanları 5 niteliği ölçer: dökümantasyon disiplini (signature + time check), maintenance dialog (passive accept değil), eskaler zinciri (chief pilot + ops control), captain authority kullanımı (uçuşu reddetme hakkı), ve fire detection awareness (uçtuysan bile sistemler aktif kontrol). Sessiz kalıp uçan aday Swissair 111 (1998) tipi facia riski.

**Bu aşamada neden sorulur**
Mülakat situational üst seviye, captain authority + safety culture'in birleşim sorusu. Pilot kariyerinde 1-2 kez gerçekten yaşar — "düşük seviye anomali, maintenance OK demiş, ama içim rahat değil". Bu durumda ne yapar? "Press on" mu, "Speak up" mu? Soru maintenance signoff'a kör güven mi yoksa bağımsız kritik düşünme mi test eder.

**3 seviyeli cevap örneği**
- **Zayıf**: "Maintenance imzaladıysa OK, uçarım." → kötü çünkü bağımsız captain authority yok; "I just signed off" mentaliteyle uçuş tehlikeli.
- **Orta**: "Maintenance ile konuşurum, açıklayamazsa uçmam." → iyi yön ama eskaler zinciri + dokümantasyon eksik.
- **Güçlü**: "Önce tech log'u detaylı incelerim: imzalayan engineer kim (license number), ne zaman, hangi inspection yapılmış. 'No defect found' deyip detay vermeyen entry zayıf — minimum 2-3 satır neden incelendiği yazılmalı. Maintenance ile direct dialog: telefonla aram, 'Bu entry hakkında daha fazla detay verir misin? Hangi sistemler check edildi, smoke source'u test ettiniz mi?' Açıklama tatmin edici değilse: chief pilot / ops control'a bildirim — 'Bu uçuş için ek inspection talep ediyorum'. Captain authority: aircraft acceptance benim sorumluluğum, şüpheli olduğum sürece uçmayı reddedebilirim (EASA Part-CAT + Operator Manual). Decision: ek inspection + 30 dk delay vs uçuş — emniyet > zaman. Eğer uçtuğum kararı verirsem: tüm fire detection sistemleri aktif kontrol (cargo + cabin + lavatory), cabin crew'a 'ek vigilance' brief. Olay raporu (ASR) yazarım — bu tip belirsizlik kayıt altına alınmalı." → bu cevap işe alır çünkü dokümantasyon + dialog + eskaler + authority + post-flight reporting var.

**Yapısal yaklaşım**
5-step: (1) Tech log forensic, (2) Direct maintenance dialog, (3) Eskaler chief pilot, (4) Captain authority decision, (5) ASR reporting. Toplam 60 saniye altı sözel cevap, ama gerçekte 30+ dakika operasyonel adım.

**Havayolu uyarlama**
THY: Maintenance Quality assurance + ASR sistemine yatırım. Emirates/Qatar: 24/7 tech ops + chief pilot reachable. Lufthansa: Just Culture + EASA reporting kültürü güçlü, sessizlik istisna. Pegasus: hızlı turnaround pressure ama captain authority sıkı korunur. Sertifikasyon: ICAO Annex 6 Part I + EASA AMC1 ORO.MLR.105 (technical log requirements).

**Tipik takip soruları**
- "Chief pilot 'uç' diyor ama sen şüpheliysen ne yaparsın?"
- "ASR yazmak kariyerine zarar verir endişesi var mı?"
- "Maintenance imzasına nasıl 'kör güven' arasında sınır çizersin?"`,
  },
  {
    id: 'qp_s3',
    category: 'situational',
    roles: ['pilot'],
    airlineIds: [],
    question: 'You\'re short final to land. F/O calls "go around — runway not clear". You can\'t see anything wrong. What do you do?',
    difficulty: 5,
    goodAnswerPointsTr: [
      'F/O call = trust + execute go-around',
      'CRM: assertiveness saygı',
      '"Yes, going around" + standart procedure',
      'Stable climb-out + ATC notify',
      'Sonradan: F/O ne gördüyse debrief',
      'Reject "ego mode"',
    ],
    redFlagsTr: ['"Görmüyorum" deyip devam et', 'F/O\'yu sorgulа landing during', 'Geç tepki'],
    sampleAnswerTr: 'Hemen "Going around" call yapar, max thrust + pitch attitude pull-up, gear up positive rate, flap retract, ATC inform. F/O\'nun görüşüne saygı — multi-crew CRM\'in özü budur (her ikisi gözlüyor, bir tane yeterli karar). Sonra debrief: F/O ne gördüğü? Vehicle? Bird? Animal? Senin bakış açın blocked olabilir.',
    tipsTr: ['CRM "any pilot can call go-around"', 'Trust > ego', 'Debrief later'],
  },
  {
    id: 'qp_s4',
    category: 'situational',
    roles: ['pilot'],
    airlineIds: [],
    question: 'You\'re tired but commercial pressure says fly. How do you handle?',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Fatigue = real safety risk',
      '"Fit to fly" honest self-assessment',
      'Captain authority — refuse if not fit',
      'Crew scheduler bilgilendir',
      'No retaliation — protected by FRMS regulations',
      'Personal coffee/snack alternatif değil — yorgun = unsafe',
    ],
    redFlagsTr: ['Uç + kendine söyle "iyiyim"', 'Pressure altında karar'],
    sampleAnswerTr: 'Fatigue gerçek bir hazard — boring approach + mistake = kazaya yol. "Fit to fly" self-assessment dürüstçe yaparım: kaç saat uyku, son uçuş ne zaman, current alertness. Yetersizsem: schedulers\'i bilgilendirir, "I\'m not fit to fly" dururum. EASA/FAA/SHGM fatigue rules pilotları korur — ücret cezası YOK. Kahve quick fix değil — yorgun = unsafe.',
    tipsTr: ['FRMS bil', 'IM SAFE checklist (Illness, Medication, Stress, Alcohol, Fatigue, Eating)'],
  },

  // ═══════════ BEHAVIORAL ═══════════
  {
    id: 'qp_b1',
    category: 'behavioral',
    roles: ['pilot'],
    airlineIds: [],
    question: 'Tell me about a time when you disagreed with a captain\'s decision.',
    difficulty: 4,
    goodAnswerPointsTr: [
      'STAR formatı',
      'Anlaşmazlık olgun şekilde ifade',
      'Captain authority\'a respect',
      'Sonuç: hangi karar alındı, ne oldu',
      'CRM teknikleri: PACE (Probe, Alert, Challenge, Emergency override)',
    ],
    redFlagsTr: ['Captain kötüleme', '"Haklı çıktım" tonu', 'Çatışma genişletme'],
    sampleAnswerTr: 'F/O olarak (S) düşük tabanlı buluttan ILS yaklaşma yapacaktık, hava limit\'a yakındı. Captain "continue" dedi. (T) Ben advisory ile probe ettim: "Captain, RVR 550m sınırda, alternative\'mizi taze tutalım mı?" (A) Captain açıklama yaptı: "Wind shift 10 dk önce, RVR yükseldi, ATC report aldım." Mantıklıydı. (R) Indik. Ama post-flight debrief\'te, "İlk briefing\'de bilgi paylaşılsa daha iyi olurdu" feedback verdim. Captain takdir etti.',
    tipsTr: ['PACE technique', 'Authority + assertiveness denge'],
  },
  {
    id: 'qp_b2',
    category: 'behavioral',
    roles: ['pilot'],
    airlineIds: [],
    question: 'Describe a time when you handled a stressful in-flight situation.',
    difficulty: 4,
    goodAnswerPointsTr: ['STAR + spesifik', 'Aviate-Navigate-Communicate', 'CRM kullanımı', 'Sonuç pozitif + öğrenilen'],
    redFlagsTr: ['Genel cevap', 'Stres altında kontrol kayıp anlat'],
    sampleAnswerTr: '737 cruise FL370\'te (S) cabin altitude warning aktif oldu — 10K\'da bile kaçak basınç düşüyor. (T) F/O olarak monitor + CRM. (A) Captain memory items: oxygen masks, emergency descent. Ben ATC + cabin call. 10 dakikada FL100\'a indik. (R) Cabin pressurization sealed flight deck door seal failure çıktı. Closest airport\'a divert ettik. Tüm yolcular OK, hizmet geri kazanıldı 24 saat içinde.',
    tipsTr: ['Spesifik teknik detay', 'Multi-crew rolleri net'],
  },

  // ═══════════ MOTIVATION + TRICKY ═══════════
  {
    id: 'qp_m1',
    category: 'motivation',
    roles: ['pilot'],
    airlineIds: [],
    question: 'Why did you choose to be a pilot?',
    difficulty: 2,
    goodAnswerPointsTr: ['Kişisel + spesifik', 'İlk uçuş anısı', 'Profesyonel motivation', 'Lifelong learning'],
    redFlagsTr: ['"Gökyüzünü severim" yüzeysel', 'Para odaklı'],
    sampleAnswerTr: 'İlk uçuş — 8 yaşında babamla TK 1\'de, kaptan kabini ziyaret. O an bu mesleği seçtim. Çünkü uçmak hem teknik mükemmellik (fizik, matematik, mühendislik) hem insan factor (CRM, leadership) hem de coğrafyaya hakim olma — bu üçü bir mesleğin nadir kombinasyonu. Lifelong learning aspect (yeni tip ratings, regulations, sim) beni asla sıkmıyor.',
    tipsTr: ['Spesifik anekdot', 'Çok yönlü motivasyon'],
  },
  {
    id: 'qp_t1',
    category: 'tricky',
    roles: ['pilot'],
    airlineIds: [],
    question: 'If you fail this interview, what will you do?',
    difficulty: 4,
    goodAnswerPointsTr: ['Pozitif + olgun', 'Feedback iste', 'Tekrar başvurma planı', 'Beklerken gelişim'],
    redFlagsTr: ['"Başka şirkete giderim"', 'Olumsuz tepki'],
    tipsTr: ['Olgunluk + bağlılık'],
  },
  {
    id: 'qp_t2',
    category: 'tricky',
    roles: ['pilot'],
    airlineIds: [],
    question: 'You see a co-pilot drinking the night before a 0600 flight. What do you do?',
    difficulty: 5,
    goodAnswerPointsTr: [
      'IATA "8 hours bottle to throttle" rule',
      'Önce direct konuş — discreet',
      'Sabah fit-to-fly kontrol',
      'Şüphe varsa: chief pilot bildirim',
      'Etik zorunluluk + safety',
    ],
    redFlagsTr: ['Sessiz kal', 'Direkt patrona gitme without warning'],
    sampleAnswerTr: 'Bottle-to-throttle 8 saat (FAA 8h, EASA 8h) — limit. Eğer co-pilot 0600 flight\'a 2200\'de 5 bira içti = limit\'e çok yakın. Önce direkt konuşurum: "Yarınki uçuş için kaç saat var?" Eğer kabul ederse — break-in protocol, restrekas. Reddederse veya sabah fit görünmezse: chief pilot duty officer hemen bildirim. Etik zorunluluk + safety şart.',
    tipsTr: ['Industry standards bil', 'Discreet ama firm'],
  },
  {
    id: 'qp_t3',
    category: 'tricky',
    roles: ['pilot'],
    airlineIds: [],
    question: 'You\'ve been offered the same role at three different airlines. Why us?',
    difficulty: 4,
    goodAnswerPointsTr: ['Şirket için spesifik 3 sebep', 'Diğerlerini kötüleme', 'Long-term commitment', 'Şirket ile growth'],
    redFlagsTr: ['Sadece para', 'Diğerlerini kötüle'],
    tipsTr: ['Şirket cultural fit vurgu'],
  },
  {
    id: 'qp_t4',
    category: 'tricky',
    roles: ['pilot'],
    airlineIds: [],
    question: 'How do you handle financial pressure to "press on" against your judgment?',
    difficulty: 5,
    goodAnswerPointsTr: ['"Captain authority is final" — hayır deme yetki', 'Pilot Code of Ethics', 'Şirket safety culture', 'No pressure should override safety'],
    redFlagsTr: ['"Pressure altında uçarım" tonu', 'Etik bilinç eksik'],
    sampleAnswerTr: 'Hayır basit: captain authority final, hiçbir commercial pressure safety\'i geçemez. Şirket gerçekten safety-conscious ise bu cevap takdir görür. EASA + FAA captain authority koruyor. Pilot olarak ben, pasaj + crew güvenliğinden sorumlu. Schedule problem ise — şirket çözer. Safety problem ise — ben çözmem ama kabul etmem.',
    tipsTr: ['Etik prensip net', 'Endüstri ahlakı bil'],
  },

  // ═══════════ ENGLISH (ICAO 4 STYLE) ═══════════
  {
    id: 'qp_e1',
    category: 'english',
    roles: ['pilot'],
    airlineIds: [],
    question: 'You receive: "Turkish 1, vectors 270 to intercept localizer 24L, descend 4000". Read back.',
    difficulty: 4,
    goodAnswerPointsTr: [
      'Standart readback: vector + descent + altitude + intercept + runway',
      'Callsign sonda',
      'Tempo orta',
      'Frazeoloji ICAO Doc 9432 uyumlu',
    ],
    redFlagsTr: ['Eksik bilgi readback', 'Yanlış sıra'],
    sampleAnswerTr: '"Heading 270 to intercept localizer 24 left, descending 4000, Turkish 1."',
    modelAnswerEn: '"Heading 270 to intercept localizer 24 left, descending 4000 feet, Turkish 1."',
    tipsTr: ['Readback rules ezbere', 'Numbers fonetik (tree, fife, niner)'],
  },
  {
    id: 'qp_e2',
    category: 'english',
    roles: ['pilot'],
    airlineIds: [],
    question: 'Describe in plain English to ATC: you have a fuel pump failure but flight can continue.',
    difficulty: 4,
    goodAnswerPointsTr: [
      '"PAN PAN PAN PAN PAN PAN" — urgency level',
      'Flight ID + nature problem + assistance',
      'Plain English — phraseology yetmediğinde',
      'Sakin + net',
    ],
    redFlagsTr: ['Mayday declare et — yanlış level', 'Phraseology yok'],
    sampleAnswerTr: '"Pan Pan Pan Pan Pan Pan, Istanbul Approach, Turkish 6, we have a fuel pump failure on the right tank, but flight can continue normally. Request priority handling and a closer alternate if needed. We have 3 hours of fuel remaining."',
    modelAnswerEn: '"Pan Pan Pan Pan Pan Pan, Istanbul Approach, Turkish 6, we have a fuel pump failure on the right tank, flight able to continue. Request priority handling. Three hours fuel remaining."',
    tipsTr: ['Mayday vs Pan Pan farkı', 'Plain English net + brief'],
  },
];

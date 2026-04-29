/**
 * Manuel detailedExplanationTr doldurma — Claude (Opus 4.7) tarafından batch'lerde yazılır.
 *
 * Pipeline'ın resume mekanizmasıyla aynı output JSON'unu kullanır
 * (scripts/content/output/interview-detailed.json). Eklenen entry'ler sonradan
 * `npm run content:inject` ile kaynak dosyalara enjekte edilir.
 *
 * Yöntem:
 *   - BATCH array'ine yeni entry'ler ekle (id + text)
 *   - Çalıştırınca output JSON'a merge eder (id duplicate ise atlar)
 *   - Sonra `npm run content:inject` ile kaynak dosyalara yaz
 */
import fs from 'fs';
import path from 'path';

const OUTPUT = path.join(__dirname, 'output', 'interview-detailed.json');

interface Entry {
  id: string;
  text: string;
}

// ═══════════════════════════════════════════════════════════════════
//  BATCH — buraya manuel yazılan entry'ler eklenir (her seferinde değiştir)
// ═══════════════════════════════════════════════════════════════════

const BATCH: Entry[] = [
  {
    id: 'qp_te3',
    text: `**Mülakatçı değerlendirmesi**
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
    text: `**Mülakatçı değerlendirmesi**
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
    text: `**Mülakatçı değerlendirmesi**
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
    text: `**Mülakatçı değerlendirmesi**
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
    text: `**Mülakatçı değerlendirmesi**
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
    text: `**Mülakatçı değerlendirmesi**
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
    text: `**Mülakatçı değerlendirmesi**
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
    text: `**Mülakatçı değerlendirmesi**
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
  {
    id: 'qp_s1',
    text: `**Mülakatçı değerlendirmesi**
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
    text: `**Mülakatçı değerlendirmesi**
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
];

// ═══════════════════════════════════════════════════════════════════
//  MERGE LOGIC
// ═══════════════════════════════════════════════════════════════════

interface OutputJson {
  stats: {
    type: string;
    totalTargets: number;
    alreadyDone: number;
    generated: number;
    totalCostUsd: number;
    totalTokensIn: number;
    totalTokensOut: number;
    startedAt: string;
    finishedAt?: string;
  };
  items: Array<{
    id: string;
    generatedAt: string;
    text: string;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
  }>;
}

function main(): void {
  const data = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) as OutputJson;
  const existing = new Set(data.items.map((i) => i.id));
  const now = new Date().toISOString();

  let added = 0;
  let skipped = 0;

  for (const entry of BATCH) {
    if (existing.has(entry.id)) {
      console.log(`   skip ${entry.id} (already in output)`);
      skipped += 1;
      continue;
    }
    data.items.push({
      id: entry.id,
      generatedAt: now,
      text: entry.text,
      tokensIn: 0,
      tokensOut: 0,
      costUsd: 0,
    });
    existing.add(entry.id);
    added += 1;
  }

  data.stats.generated = (data.stats.generated ?? 0) + added;

  fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
  console.log(`✅ Manuel batch: ${added} eklendi, ${skipped} atlandı.`);
  console.log(`   Toplam item: ${data.items.length}`);
}

main();

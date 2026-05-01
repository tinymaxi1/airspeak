-- Sprint 10.D (revize) — Müfredat çatısı v2
-- 043'teki eski seed'i temizler, kullanıcının istediği naming/title'larla
-- yeniden ekler.
--
-- Eski 043: 14 modül + 200 unit + 800 lesson (slug: tech-m1-u01-aircraft-structure)
-- Yeni 044: 14 modül + 180 unit + 720 lesson (slug: tech-m1-u01)
--
-- Idempotent: modules CASCADE ile units+lessons silinir.
-- ============================================================================

BEGIN;

-- ─── 1) Eski seed temizle (modules silinince units+lessons CASCADE) ────
DELETE FROM public.modules
 WHERE slug IN (
   'tech-m1-a0','tech-m2-a1','tech-m3-a2','tech-m4-b1','tech-m5-b2','tech-m6-c1',
   'pilot-m1-a0','pilot-m2-a1',
   'cabin-m1-a0','cabin-m2-a1',
   'ground-m1-a0','ground-m2-a1',
   'student-m1-a0','student-m2-a1'
 );

-- ─── 2) MODULES (yeni başlıklar) ───────────────────────────────────────
INSERT INTO public.modules (slug, role, number, title, title_tr, status, sort)
VALUES
  ('tech-m1-a0', 'technician', 1, 'Aviation Basics',          'Havacılık Temelleri',     'draft', 1),
  ('tech-m2-a1', 'technician', 2, 'Core Systems',             'Temel Sistemler',         'draft', 2),
  ('tech-m3-a2', 'technician', 3, 'System Operations',        'Sistem Operasyonları',    'draft', 3),
  ('tech-m4-b1', 'technician', 4, 'Troubleshooting',          'Arıza Tespiti',           'draft', 4),
  ('tech-m5-b2', 'technician', 5, 'Advanced Maintenance',     'İleri Bakım',             'draft', 5),
  ('tech-m6-c1', 'technician', 6, 'Expert Level',             'Uzman Seviyesi',          'draft', 6),
  ('pilot-m1-a0', 'pilot', 1, 'Aviation Communication Basics','Havacılık İletişim Temelleri','draft', 1),
  ('pilot-m2-a1', 'pilot', 2, 'Basic ATC Procedures',         'Temel ATC Prosedürleri',  'draft', 2),
  ('cabin-m1-a0', 'cabin', 1, 'Cabin Communication Basics',   'Kabin İletişim Temelleri','draft', 1),
  ('cabin-m2-a1', 'cabin', 2, 'Passenger Service Language',   'Yolcu Hizmet Dili',       'draft', 2),
  ('ground-m1-a0', 'ground', 1, 'Ground Operations Basics',   'Yer Operasyonları Temelleri','draft', 1),
  ('ground-m2-a1', 'ground', 2, 'Ramp Procedures',            'Rampa Prosedürleri',      'draft', 2),
  ('student-m1-a0', 'student', 1, 'Aviation World Introduction','Havacılık Dünyasına Giriş','draft', 1),
  ('student-m2-a1', 'student', 2, 'Career Path Language',     'Kariyer Yolu Dili',       'draft', 2);

-- ─── 3) UNITS — 180 (Teknisyen 100, diğer 4 rol × 20) ─────────────────
WITH unit_seeds(module_slug, slug, number, title, title_tr) AS (
  VALUES
    -- Teknisyen A0 (10)
    ('tech-m1-a0','tech-m1-u01',1,'Aircraft Structure Basics','Uçak Yapı Temelleri'),
    ('tech-m1-a0','tech-m1-u02',2,'Aviation Vocabulary A-F','Havacılık Sözlüğü A-F'),
    ('tech-m1-a0','tech-m1-u03',3,'Aviation Vocabulary G-Z','Havacılık Sözlüğü G-Z'),
    ('tech-m1-a0','tech-m1-u04',4,'NATO Phonetic Alphabet','NATO Fonetik Alfabe'),
    ('tech-m1-a0','tech-m1-u05',5,'Numbers and Measurements','Sayılar ve Ölçüler'),
    ('tech-m1-a0','tech-m1-u06',6,'Colours and Positions','Renk ve Pozisyon'),
    ('tech-m1-a0','tech-m1-u07',7,'Tool Names','Alet İsimleri'),
    ('tech-m1-a0','tech-m1-u08',8,'Work Order Language','İş Emri Dili'),
    ('tech-m1-a0','tech-m1-u09',9,'Safety Symbols','Güvenlik Sembolleri'),
    ('tech-m1-a0','tech-m1-u10',10,'Emergency Communication','Acil İletişim'),

    -- Teknisyen A1 (15)
    ('tech-m2-a1','tech-m2-u01',1,'Engine Basic Components','Motor Temel Bileşenleri'),
    ('tech-m2-a1','tech-m2-u02',2,'Hydraulic System Introduction','Hidrolik Sistem Giriş'),
    ('tech-m2-a1','tech-m2-u03',3,'Electrical System Introduction','Elektrik Sistem Giriş'),
    ('tech-m2-a1','tech-m2-u04',4,'Landing Gear Introduction','İniş Takımı Giriş'),
    ('tech-m2-a1','tech-m2-u05',5,'Flight Control Surfaces','Uçuş Kontrol Yüzeyleri'),
    ('tech-m2-a1','tech-m2-u06',6,'Fuel System Introduction','Yakıt Sistemi Giriş'),
    ('tech-m2-a1','tech-m2-u07',7,'Air Conditioning Introduction','Klima Sistemi Giriş'),
    ('tech-m2-a1','tech-m2-u08',8,'Fire Protection Introduction','Yangın Koruma Giriş'),
    ('tech-m2-a1','tech-m2-u09',9,'Avionics Introduction','Aviyonik Giriş'),
    ('tech-m2-a1','tech-m2-u10',10,'Documentation Reading','Dokümantasyon Okuma'),
    ('tech-m2-a1','tech-m2-u11',11,'Workshop Report Language','Atölye Rapor Dili'),
    ('tech-m2-a1','tech-m2-u12',12,'Tooling and Equipment','Takım ve Ekipman'),
    ('tech-m2-a1','tech-m2-u13',13,'Torque and Adjustment','Tork ve Ayarlama'),
    ('tech-m2-a1','tech-m2-u14',14,'Inspection Terminology','İnspeksiyon Terminolojisi'),
    ('tech-m2-a1','tech-m2-u15',15,'Shift Handover Language','Vardiya Devir Dili'),

    -- Teknisyen A2 (18)
    ('tech-m3-a2','tech-m3-u01',1,'Turbine Engine Overhaul','Türbin Motor Revizyonu'),
    ('tech-m3-a2','tech-m3-u02',2,'Hydraulic Pump and Actuator','Hidrolik Pompa ve Aktüatör'),
    ('tech-m3-a2','tech-m3-u03',3,'AC and DC Electrical Systems','AC ve DC Elektrik Sistemleri'),
    ('tech-m3-a2','tech-m3-u04',4,'Retraction Systems','Geri Çekme Sistemleri'),
    ('tech-m3-a2','tech-m3-u05',5,'Primary and Secondary Controls','Birincil ve İkincil Kontroller'),
    ('tech-m3-a2','tech-m3-u06',6,'Fuel Feed and Transfer','Yakıt Besleme ve Transfer'),
    ('tech-m3-a2','tech-m3-u07',7,'Pressurisation Systems','Basınçlandırma Sistemleri'),
    ('tech-m3-a2','tech-m3-u08',8,'Fire Suppression Systems','Yangın Söndürme Sistemleri'),
    ('tech-m3-a2','tech-m3-u09',9,'Nav and Comm Systems','Seyrüsefer ve Haberleşme'),
    ('tech-m3-a2','tech-m3-u10',10,'Maintenance Manual AMM','Bakım El Kitabı AMM'),
    ('tech-m3-a2','tech-m3-u11',11,'Service Bulletin Compliance','Servis Bülteni Uyumu'),
    ('tech-m3-a2','tech-m3-u12',12,'Non-Destructive Testing','Tahribatsız Muayene'),
    ('tech-m3-a2','tech-m3-u13',13,'Composite Structure Repair','Kompozit Yapı Onarımı'),
    ('tech-m3-a2','tech-m3-u14',14,'Oxygen Systems','Oksijen Sistemleri'),
    ('tech-m3-a2','tech-m3-u15',15,'Ice and Rain Protection','Buz ve Yağmur Koruma'),
    ('tech-m3-a2','tech-m3-u16',16,'APU Operation','APU Operasyonu'),
    ('tech-m3-a2','tech-m3-u17',17,'Cargo Handling Systems','Kargo Elleçleme Sistemleri'),
    ('tech-m3-a2','tech-m3-u18',18,'Water and Waste Systems','Su ve Atık Sistemleri'),

    -- Teknisyen B1 (20)
    ('tech-m4-b1','tech-m4-u01',1,'Engine Run-Up Procedures','Motor Çalıştırma Prosedürleri'),
    ('tech-m4-b1','tech-m4-u02',2,'System Troubleshooting','Sistem Arıza Tespiti'),
    ('tech-m4-b1','tech-m4-u03',3,'Wire Harness and Connectors','Kablo Demeti ve Konnektörler'),
    ('tech-m4-b1','tech-m4-u04',4,'Gear Rigging and Adjustment','Takım Rigging ve Ayarlama'),
    ('tech-m4-b1','tech-m4-u05',5,'Autopilot Linkage','Otopilot Bağlantısı'),
    ('tech-m4-b1','tech-m4-u06',6,'Fuel Contamination Checks','Yakıt Kirlilik Kontrolleri'),
    ('tech-m4-b1','tech-m4-u07',7,'Pack Valve and ACM','Pack Valf ve ACM'),
    ('tech-m4-b1','tech-m4-u08',8,'Engine Fire Extinguishing','Motor Yangın Söndürme'),
    ('tech-m4-b1','tech-m4-u09',9,'ATC Communication Basics','ATC İletişim Temelleri'),
    ('tech-m4-b1','tech-m4-u10',10,'AAIB Report Language','AAIB Rapor Dili'),
    ('tech-m4-b1','tech-m4-u11',11,'Weight and Balance Reports','Ağırlık ve Denge Raporları'),
    ('tech-m4-b1','tech-m4-u12',12,'Engine Borescope Reporting','Motor Boreskopu Raporlama'),
    ('tech-m4-b1','tech-m4-u13',13,'ETOPS Maintenance','ETOPS Bakımı'),
    ('tech-m4-b1','tech-m4-u14',14,'Structural Repair Language','Yapısal Onarım Dili'),
    ('tech-m4-b1','tech-m4-u15',15,'Wheel and Brake Overhaul','Tekerlek ve Fren Revizyonu'),
    ('tech-m4-b1','tech-m4-u16',16,'Flight Data Monitoring','Uçuş Veri İzleme'),
    ('tech-m4-b1','tech-m4-u17',17,'Aircraft on Ground AOG','AOG Uçak Yerde'),
    ('tech-m4-b1','tech-m4-u18',18,'Technical Delay Reports','Teknik Gecikme Raporları'),
    ('tech-m4-b1','tech-m4-u19',19,'Training Record Language','Eğitim Kayıt Dili'),
    ('tech-m4-b1','tech-m4-u20',20,'CAMO Communication','CAMO İletişimi'),

    -- Teknisyen B2 (20)
    ('tech-m5-b2','tech-m5-u01',1,'Engine Performance Analysis','Motor Performans Analizi'),
    ('tech-m5-b2','tech-m5-u02',2,'Hydraulic Fault Isolation','Hidrolik Arıza İzolasyonu'),
    ('tech-m5-b2','tech-m5-u03',3,'Avionics LRU Replacement','Aviyonik LRU Değişimi'),
    ('tech-m5-b2','tech-m5-u04',4,'Shimmy Damper Overhaul','Shimmy Damper Revizyonu'),
    ('tech-m5-b2','tech-m5-u05',5,'Fly-by-Wire Basics','FBW Temelleri'),
    ('tech-m5-b2','tech-m5-u06',6,'Fuel Quantity Calibration','Yakıt Miktarı Kalibrasyonu'),
    ('tech-m5-b2','tech-m5-u07',7,'Cabin Pressure Scheduling','Kabin Basınç Programlama'),
    ('tech-m5-b2','tech-m5-u08',8,'Smoke Detection Systems','Duman Tespit Sistemleri'),
    ('tech-m5-b2','tech-m5-u09',9,'ACARS Message Decoding','ACARS Mesaj Çözme'),
    ('tech-m5-b2','tech-m5-u10',10,'Occurrence Reporting','Olay Raporlama'),
    ('tech-m5-b2','tech-m5-u11',11,'Structural Fatigue Language','Yapısal Yorulma Dili'),
    ('tech-m5-b2','tech-m5-u12',12,'Engine FADEC Systems','Motor FADEC Sistemleri'),
    ('tech-m5-b2','tech-m5-u13',13,'Cabin Crew Technical Brief','Kabin Ekibi Teknik Brief'),
    ('tech-m5-b2','tech-m5-u14',14,'Ground Power Unit Interface','GPU Arayüzü'),
    ('tech-m5-b2','tech-m5-u15',15,'Engine Test Cell Language','Motor Test Hücresi Dili'),
    ('tech-m5-b2','tech-m5-u16',16,'Advanced Composite Repair','İleri Kompozit Onarım'),
    ('tech-m5-b2','tech-m5-u17',17,'Software Configuration','Yazılım Konfigürasyonu'),
    ('tech-m5-b2','tech-m5-u18',18,'Fleet Management Language','Filo Yönetim Dili'),
    ('tech-m5-b2','tech-m5-u19',19,'Fuel System Engineering','Yakıt Sistemi Mühendisliği'),
    ('tech-m5-b2','tech-m5-u20',20,'Safety Management SMS','Güvenlik Yönetim SMS'),

    -- Teknisyen C1 (17)
    ('tech-m6-c1','tech-m6-u01',1,'Engine Trend Monitoring','Motor Trend İzleme'),
    ('tech-m6-c1','tech-m6-u02',2,'Complex Hydraulic Faults','Karmaşık Hidrolik Arızalar'),
    ('tech-m6-c1','tech-m6-u03',3,'Integrated Avionics Diagnosis','Entegre Aviyonik Teşhis'),
    ('tech-m6-c1','tech-m6-u04',4,'Composite Repair Engineering','Kompozit Onarım Mühendisliği'),
    ('tech-m6-c1','tech-m6-u05',5,'Advanced FBW Systems','İleri FBW Sistemleri'),
    ('tech-m6-c1','tech-m6-u06',6,'Environmental Control Eng','Çevre Kontrol Mühendisliği'),
    ('tech-m6-c1','tech-m6-u07',7,'Fire Protection Engineering','Yangın Koruma Mühendisliği'),
    ('tech-m6-c1','tech-m6-u08',8,'Communication Protocols','İletişim Protokolleri'),
    ('tech-m6-c1','tech-m6-u09',9,'Regulatory Compliance','Düzenleyici Uyum'),
    ('tech-m6-c1','tech-m6-u10',10,'Audit and Inspection Language','Denetim ve İnspeksiyon Dili'),
    ('tech-m6-c1','tech-m6-u11',11,'Instruction Language','Talimat Dili'),
    ('tech-m6-c1','tech-m6-u12',12,'Investigation Methodology','Soruşturma Metodolojisi'),
    ('tech-m6-c1','tech-m6-u13',13,'ICAO Annex References','ICAO Ek Referansları'),
    ('tech-m6-c1','tech-m6-u14',14,'ICAO English Level 5 Prep','ICAO İngilizce Seviye 5 Hazırlık'),
    ('tech-m6-c1','tech-m6-u15',15,'Advanced English Writing','İleri İngilizce Yazma'),
    ('tech-m6-c1','tech-m6-u16',16,'Certification Language','Sertifikasyon Dili'),
    ('tech-m6-c1','tech-m6-u17',17,'Expert Communication','Uzman İletişimi'),

    -- Pilot A0 (10)
    ('pilot-m1-a0','pilot-m1-u01',1,'ICAO Phonetic Alphabet','ICAO Fonetik Alfabe'),
    ('pilot-m1-a0','pilot-m1-u02',2,'Basic ATC Commands','Temel ATC Komutları'),
    ('pilot-m1-a0','pilot-m1-u03',3,'Number Reading Aviation','Havacılıkta Sayı Okuma'),
    ('pilot-m1-a0','pilot-m1-u04',4,'Callsign System','Callsign Sistemi'),
    ('pilot-m1-a0','pilot-m1-u05',5,'Frequency Changes','Frekans Değişimleri'),
    ('pilot-m1-a0','pilot-m1-u06',6,'Position Reporting','Konum Raporlama'),
    ('pilot-m1-a0','pilot-m1-u07',7,'Emergency Keywords','Acil Anahtar Kelimeler'),
    ('pilot-m1-a0','pilot-m1-u08',8,'Meteorology Terms','Meteoroloji Terimleri'),
    ('pilot-m1-a0','pilot-m1-u09',9,'Runway and Taxiway Language','Pist ve Taksi Yolu Dili'),
    ('pilot-m1-a0','pilot-m1-u10',10,'Basic Clearances','Temel İzinler'),

    -- Pilot A1 (10)
    ('pilot-m2-a1','pilot-m2-u01',1,'ATIS Reading','ATIS Okuma'),
    ('pilot-m2-a1','pilot-m2-u02',2,'Clearance Delivery','İzin Teslimi'),
    ('pilot-m2-a1','pilot-m2-u03',3,'Ground Movement','Yer Hareketi'),
    ('pilot-m2-a1','pilot-m2-u04',4,'Takeoff Clearance','Kalkış İzni'),
    ('pilot-m2-a1','pilot-m2-u05',5,'Initial Climb Communications','İlk Tırmanış İletişimi'),
    ('pilot-m2-a1','pilot-m2-u06',6,'Cruise Level Requests','Seyir İrtifa Talepleri'),
    ('pilot-m2-a1','pilot-m2-u07',7,'Descent Clearance','Alçalma İzni'),
    ('pilot-m2-a1','pilot-m2-u08',8,'Approach Briefing','Yaklaşma Brifing'),
    ('pilot-m2-a1','pilot-m2-u09',9,'Landing Clearance','İniş İzni'),
    ('pilot-m2-a1','pilot-m2-u10',10,'VFR Traffic Pattern','VFR Trafik Devresi'),

    -- Cabin A0 (10)
    ('cabin-m1-a0','cabin-m1-u01',1,'Greeting Expressions','Selamlama İfadeleri'),
    ('cabin-m1-a0','cabin-m1-u02',2,'Passenger Needs','Yolcu İhtiyaçları'),
    ('cabin-m1-a0','cabin-m1-u03',3,'Food and Beverage Language','Yiyecek İçecek Dili'),
    ('cabin-m1-a0','cabin-m1-u04',4,'Giving Directions','Yön Tarifi'),
    ('cabin-m1-a0','cabin-m1-u05',5,'Safety Commands','Güvenlik Komutları'),
    ('cabin-m1-a0','cabin-m1-u06',6,'Position and Movement','Pozisyon ve Hareket'),
    ('cabin-m1-a0','cabin-m1-u07',7,'Numbers and Times','Sayılar ve Saatler'),
    ('cabin-m1-a0','cabin-m1-u08',8,'Emotions and Reactions','Duygular ve Tepkiler'),
    ('cabin-m1-a0','cabin-m1-u09',9,'Weather Language','Hava Durumu Dili'),
    ('cabin-m1-a0','cabin-m1-u10',10,'Basic Countries and Flights','Temel Ülke ve Uçuş'),

    -- Cabin A1 (10)
    ('cabin-m2-a1','cabin-m2-u01',1,'Boarding Announcements','Biniş Anonsları'),
    ('cabin-m2-a1','cabin-m2-u02',2,'Safety Demonstration','Güvenlik Gösterimi'),
    ('cabin-m2-a1','cabin-m2-u03',3,'Seatbelt and Brace','Emniyet Kemeri ve Brace'),
    ('cabin-m2-a1','cabin-m2-u04',4,'Emergency Exits','Acil Çıkışlar'),
    ('cabin-m2-a1','cabin-m2-u05',5,'Meal Service Language','Yemek Servis Dili'),
    ('cabin-m2-a1','cabin-m2-u06',6,'Injury and Medical First Aid','Yaralanma ve İlk Yardım'),
    ('cabin-m2-a1','cabin-m2-u07',7,'Special Needs Passengers','Özel İhtiyaçlı Yolcular'),
    ('cabin-m2-a1','cabin-m2-u08',8,'Turbulence Communication','Türbülans İletişimi'),
    ('cabin-m2-a1','cabin-m2-u09',9,'PA System Usage','PA Sistemi Kullanımı'),
    ('cabin-m2-a1','cabin-m2-u10',10,'Crew Coordination','Ekip Koordinasyonu'),

    -- Ground A0 (10)
    ('ground-m1-a0','ground-m1-u01',1,'Aircraft Parking Commands','Uçak Park Komutları'),
    ('ground-m1-a0','ground-m1-u02',2,'Baggage Label Language','Bagaj Etiket Dili'),
    ('ground-m1-a0','ground-m1-u03',3,'Security Terms','Güvenlik Terimleri'),
    ('ground-m1-a0','ground-m1-u04',4,'Ramp Signs','Rampa İşaretleri'),
    ('ground-m1-a0','ground-m1-u05',5,'Equipment Names','Ekipman İsimleri'),
    ('ground-m1-a0','ground-m1-u06',6,'Basic Radio Commands','Temel Radyo Komutları'),
    ('ground-m1-a0','ground-m1-u07',7,'Weather and Ramp','Hava Durumu ve Rampa'),
    ('ground-m1-a0','ground-m1-u08',8,'Refuelling Basics','Yakıt İkmal Temelleri'),
    ('ground-m1-a0','ground-m1-u09',9,'Catering Terms','Catering Terimleri'),
    ('ground-m1-a0','ground-m1-u10',10,'Passenger Check-In','Yolcu Check-In Dili'),

    -- Ground A1 (10)
    ('ground-m2-a1','ground-m2-u01',1,'Pushback Procedures','Pushback Prosedürleri'),
    ('ground-m2-a1','ground-m2-u02',2,'De-icing Basic Comms','Buz Çözme Temel İletişim'),
    ('ground-m2-a1','ground-m2-u03',3,'Load Sheet Reading','Yük Listesi Okuma'),
    ('ground-m2-a1','ground-m2-u04',4,'Ramp Safety Protocols','Rampa Güvenlik Protokolleri'),
    ('ground-m2-a1','ground-m2-u05',5,'GPU and ASU Operation','GPU ve ASU Operasyonu'),
    ('ground-m2-a1','ground-m2-u06',6,'Cargo ULD Handling','Kargo ULD Elleçleme'),
    ('ground-m2-a1','ground-m2-u07',7,'Weight and Balance Intro','Ağırlık ve Denge Giriş'),
    ('ground-m2-a1','ground-m2-u08',8,'Passenger Special Assist','Yolcu Özel Yardım'),
    ('ground-m2-a1','ground-m2-u09',9,'Delay Communication','Gecikme İletişimi'),
    ('ground-m2-a1','ground-m2-u10',10,'FOD Prevention Language','FOD Önleme Dili'),

    -- Student A0 (10)
    ('student-m1-a0','student-m1-u01',1,'What is Aviation','Havacılık Nedir'),
    ('student-m1-a0','student-m1-u02',2,'Basic English A1','Temel İngilizce A1'),
    ('student-m1-a0','student-m1-u03',3,'Alphabet and Pronunciation','Alfabe ve Telaffuz'),
    ('student-m1-a0','student-m1-u04',4,'Numbers and Dates','Sayılar ve Tarihler'),
    ('student-m1-a0','student-m1-u05',5,'Job Titles','Meslek İsimleri'),
    ('student-m1-a0','student-m1-u06',6,'Airline World','Havayolu Dünyası'),
    ('student-m1-a0','student-m1-u07',7,'Airport Terms','Havalimanı Terimleri'),
    ('student-m1-a0','student-m1-u08',8,'Aircraft Parts','Uçak Parçaları'),
    ('student-m1-a0','student-m1-u09',9,'Weather and Seasons','Hava Durumu ve Mevsimler'),
    ('student-m1-a0','student-m1-u10',10,'Career Paths','Kariyer Yolları'),

    -- Student A1 (10)
    ('student-m2-a1','student-m2-u01',1,'Aviation Career Choice','Havacılık Kariyer Seçimi'),
    ('student-m2-a1','student-m2-u02',2,'Flight School Language','Uçuş Okulu Dili'),
    ('student-m2-a1','student-m2-u03',3,'ATPL Exam Language','ATPL Sınav Dili'),
    ('student-m2-a1','student-m2-u04',4,'Cabin Crew Exam Prep','Kabin Ekibi Sınav Hazırlığı'),
    ('student-m2-a1','student-m2-u05',5,'Ground Staff Training','Yer Personeli Eğitimi'),
    ('student-m2-a1','student-m2-u06',6,'AME Licence Language','AME Lisans Dili'),
    ('student-m2-a1','student-m2-u07',7,'Aviation Mathematics','Havacılık Matematiği'),
    ('student-m2-a1','student-m2-u08',8,'Physics Fundamentals','Fizik Temelleri'),
    ('student-m2-a1','student-m2-u09',9,'English B1 Target','İngilizce B1 Hedef'),
    ('student-m2-a1','student-m2-u10',10,'Online Resources','Online Kaynaklar')
)
INSERT INTO public.units (slug, module_id, number, title, title_tr, status, sort)
SELECT us.slug, m.id, us.number, us.title, us.title_tr, 'draft', us.number
FROM unit_seeds us
JOIN public.modules m ON m.slug = us.module_slug;

-- ─── 4) LESSONS — her unit × 4 (vocabulary, listening, speaking, quiz) ──
DO $seed_lessons$
DECLARE
  rec record;
  l_types lesson_type[]   := ARRAY['vocabulary','listening','speaking','quiz']::lesson_type[];
  l_titles_en text[]      := ARRAY['Vocabulary and Concepts','Listening Comprehension','Phraseology Practice','Scenario Assessment'];
  l_titles_tr text[]      := ARRAY['Kelime ve Kavramlar','Diyalog Dinleme','Phraseology Alıştırması','Senaryo Değerlendirme'];
  i int;
BEGIN
  FOR rec IN
    SELECT un.id, un.slug
    FROM public.units un
    JOIN public.modules mo ON mo.id = un.module_id
    WHERE mo.slug IN (
      'tech-m1-a0','tech-m2-a1','tech-m3-a2','tech-m4-b1','tech-m5-b2','tech-m6-c1',
      'pilot-m1-a0','pilot-m2-a1','cabin-m1-a0','cabin-m2-a1',
      'ground-m1-a0','ground-m2-a1','student-m1-a0','student-m2-a1'
    )
  LOOP
    FOR i IN 1..4 LOOP
      INSERT INTO public.lessons (slug, unit_id, number, title, title_tr, type, xp, estimated_minutes, status, sort)
      VALUES (
        rec.slug || '-l' || i,
        rec.id,
        i,
        l_titles_en[i],
        l_titles_tr[i],
        l_types[i],
        10,
        10,
        'draft',
        i
      );
    END LOOP;
  END LOOP;
END $seed_lessons$;

-- ─── 5) Doğrulama ──────────────────────────────────────────────────────
DO $verify$
DECLARE
  v_modules int;
  v_units int;
  v_lessons int;
BEGIN
  SELECT count(*) INTO v_modules FROM public.modules
   WHERE slug IN (
     'tech-m1-a0','tech-m2-a1','tech-m3-a2','tech-m4-b1','tech-m5-b2','tech-m6-c1',
     'pilot-m1-a0','pilot-m2-a1','cabin-m1-a0','cabin-m2-a1',
     'ground-m1-a0','ground-m2-a1','student-m1-a0','student-m2-a1'
   );
  SELECT count(*) INTO v_units FROM public.units un
   JOIN public.modules mo ON mo.id = un.module_id
   WHERE mo.slug LIKE ANY (ARRAY['tech-m%','pilot-m%','cabin-m%','ground-m%','student-m%']);
  SELECT count(*) INTO v_lessons FROM public.lessons le
   JOIN public.units un ON un.id = le.unit_id
   JOIN public.modules mo ON mo.id = un.module_id
   WHERE mo.slug LIKE ANY (ARRAY['tech-m%','pilot-m%','cabin-m%','ground-m%','student-m%']);

  RAISE NOTICE 'Müfredat v2 seed: % modül, % unit, % lesson', v_modules, v_units, v_lessons;
END $verify$;

COMMIT;

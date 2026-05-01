-- Sprint 10.D — Müfredat çatısı seed
-- 14 modül + ~200 unit + ~800 lesson (hepsi status='draft')
-- Idempotent: ON CONFLICT (slug) DO NOTHING
-- Kategori = role (modules.role); ayrı categories tablosu yok.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1) MODULES (14 = 6 teknisyen + 4 rol × 2 başlangıç)
-- ============================================================================
INSERT INTO public.modules (slug, role, number, title, title_tr, status, sort)
VALUES
  -- Teknisyen 6 modül (A0 → C1)
  ('tech-m1-a0', 'technician', 1, 'Foundations (A0)', 'Temeller (A0)', 'draft', 1),
  ('tech-m2-a1', 'technician', 2, 'Beginner Aviation Maintenance (A1)', 'Başlangıç Havacılık Bakımı (A1)', 'draft', 2),
  ('tech-m3-a2', 'technician', 3, 'Intermediate Maintenance (A2)', 'Orta Düzey Bakım (A2)', 'draft', 3),
  ('tech-m4-b1', 'technician', 4, 'Advanced Systems (B1)', 'İleri Sistemler (B1)', 'draft', 4),
  ('tech-m5-b2', 'technician', 5, 'Specialized Procedures (B2)', 'Uzman Prosedürler (B2)', 'draft', 5),
  ('tech-m6-c1', 'technician', 6, 'Expert Communication (C1)', 'İleri Düzey İletişim (C1)', 'draft', 6),
  -- Pilot 2 modül başlangıç
  ('pilot-m1-a0', 'pilot', 1, 'ATC Basics (A0)', 'ATC Temelleri (A0)', 'draft', 1),
  ('pilot-m2-a1', 'pilot', 2, 'Beginner Cockpit Comms (A1)', 'Başlangıç Kokpit İletişim (A1)', 'draft', 2),
  -- Cabin 2 modül başlangıç
  ('cabin-m1-a0', 'cabin', 1, 'Cabin Service Basics (A0)', 'Kabin Servisi Temelleri (A0)', 'draft', 1),
  ('cabin-m2-a1', 'cabin', 2, 'In-Flight Procedures (A1)', 'Uçuş İçi Prosedürler (A1)', 'draft', 2),
  -- Ground 2 modül başlangıç
  ('ground-m1-a0', 'ground', 1, 'Ramp Operations Basics (A0)', 'Apron Operasyon Temelleri (A0)', 'draft', 1),
  ('ground-m2-a1', 'ground', 2, 'Ground Equipment & Comms (A1)', 'Yer Ekipmanı ve İletişim (A1)', 'draft', 2),
  -- Student 2 modül başlangıç
  ('student-m1-a0', 'student', 1, 'Aviation English Foundations (A0)', 'Havacılık İngilizcesi Temelleri (A0)', 'draft', 1),
  ('student-m2-a1', 'student', 2, 'Aviation Vocabulary & Grammar (A1)', 'Havacılık Kelime & Gramer (A1)', 'draft', 2)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2) UNITS — toplam ~200
--    INSERT ... SELECT ile module_slug → module_id resolve
-- ============================================================================
WITH unit_seeds(module_slug, slug, number, title, title_tr) AS (
  VALUES
    -- ─── TEKNİSYEN A0 (10) ──────────────────────────────────────
    ('tech-m1-a0', 'tech-m1-u01-aircraft-structure', 1, 'Aircraft Structure', 'Uçak Yapısı'),
    ('tech-m1-a0', 'tech-m1-u02-basic-tools', 2, 'Basic Tools', 'Temel Aletler'),
    ('tech-m1-a0', 'tech-m1-u03-safety-vocab', 3, 'Safety Vocabulary', 'Güvenlik Terimleri'),
    ('tech-m1-a0', 'tech-m1-u04-ramp-vocab', 4, 'Ramp Vocabulary', 'Apron Terimleri'),
    ('tech-m1-a0', 'tech-m1-u05-fasteners', 5, 'Fasteners', 'Bağlantı Elemanları'),
    ('tech-m1-a0', 'tech-m1-u06-fluids', 6, 'Fluids', 'Akışkanlar'),
    ('tech-m1-a0', 'tech-m1-u07-gauges', 7, 'Gauges', 'Göstergeler'),
    ('tech-m1-a0', 'tech-m1-u08-materials', 8, 'Materials', 'Malzemeler'),
    ('tech-m1-a0', 'tech-m1-u09-units-measure', 9, 'Units of Measure', 'Ölçü Birimleri'),
    ('tech-m1-a0', 'tech-m1-u10-abbreviations', 10, 'Abbreviations', 'Kısaltmalar'),

    -- ─── TEKNİSYEN A1 (15) ──────────────────────────────────────
    ('tech-m2-a1', 'tech-m2-u01-hydraulic-systems', 1, 'Hydraulic Systems', 'Hidrolik Sistemler'),
    ('tech-m2-a1', 'tech-m2-u02-pneumatic-systems', 2, 'Pneumatic Systems', 'Pnömatik Sistemler'),
    ('tech-m2-a1', 'tech-m2-u03-electrical-basics', 3, 'Electrical Basics', 'Elektrik Temelleri'),
    ('tech-m2-a1', 'tech-m2-u04-fuel-systems', 4, 'Fuel Systems', 'Yakıt Sistemleri'),
    ('tech-m2-a1', 'tech-m2-u05-landing-gear', 5, 'Landing Gear', 'İniş Takımı'),
    ('tech-m2-a1', 'tech-m2-u06-brakes', 6, 'Brakes', 'Frenler'),
    ('tech-m2-a1', 'tech-m2-u07-control-surfaces', 7, 'Control Surfaces', 'Kontrol Yüzeyleri'),
    ('tech-m2-a1', 'tech-m2-u08-fuselage', 8, 'Fuselage', 'Gövde'),
    ('tech-m2-a1', 'tech-m2-u09-wings', 9, 'Wings', 'Kanatlar'),
    ('tech-m2-a1', 'tech-m2-u10-empennage', 10, 'Empennage', 'Kuyruk'),
    ('tech-m2-a1', 'tech-m2-u11-cockpit-instruments', 11, 'Cockpit Instruments', 'Kokpit Göstergeleri'),
    ('tech-m2-a1', 'tech-m2-u12-avionics-intro', 12, 'Avionics Introduction', 'Aviyonik Giriş'),
    ('tech-m2-a1', 'tech-m2-u13-engine-types', 13, 'Engine Types', 'Motor Tipleri'),
    ('tech-m2-a1', 'tech-m2-u14-apu', 14, 'APU', 'APU'),
    ('tech-m2-a1', 'tech-m2-u15-environmental', 15, 'Environmental Systems', 'Çevresel Sistemler'),

    -- ─── TEKNİSYEN A2 (18) ──────────────────────────────────────
    ('tech-m3-a2', 'tech-m3-u01-troubleshooting', 1, 'Troubleshooting', 'Arıza Tespiti'),
    ('tech-m3-a2', 'tech-m3-u02-fault-isolation', 2, 'Fault Isolation', 'Arıza İzolasyonu'),
    ('tech-m3-a2', 'tech-m3-u03-maintenance-manual', 3, 'Maintenance Manual', 'Bakım El Kitabı'),
    ('tech-m3-a2', 'tech-m3-u04-work-orders', 4, 'Work Orders', 'İş Emirleri'),
    ('tech-m3-a2', 'tech-m3-u05-scheduled-checks', 5, 'Scheduled Checks', 'Periyodik Kontroller'),
    ('tech-m3-a2', 'tech-m3-u06-a-checks', 6, 'A-Checks', 'A-Check'),
    ('tech-m3-a2', 'tech-m3-u07-c-checks', 7, 'C-Checks', 'C-Check'),
    ('tech-m3-a2', 'tech-m3-u08-line-maintenance', 8, 'Line Maintenance', 'Hat Bakımı'),
    ('tech-m3-a2', 'tech-m3-u09-base-maintenance', 9, 'Base Maintenance', 'Üs Bakımı'),
    ('tech-m3-a2', 'tech-m3-u10-mel', 10, 'Minimum Equipment List (MEL)', 'MEL'),
    ('tech-m3-a2', 'tech-m3-u11-deferred-defects', 11, 'Deferred Defects', 'Ertelenen Defektler'),
    ('tech-m3-a2', 'tech-m3-u12-log-entries', 12, 'Log Entries', 'Defter Kayıtları'),
    ('tech-m3-a2', 'tech-m3-u13-signature-procedures', 13, 'Signature Procedures', 'İmza Prosedürleri'),
    ('tech-m3-a2', 'tech-m3-u14-fod-prevention', 14, 'FOD Prevention', 'FOD Önleme'),
    ('tech-m3-a2', 'tech-m3-u15-hangar-safety', 15, 'Hangar Safety', 'Hangar Güvenliği'),
    ('tech-m3-a2', 'tech-m3-u16-ground-handling', 16, 'Ground Handling', 'Yer Hizmetleri'),
    ('tech-m3-a2', 'tech-m3-u17-towing-pushback', 17, 'Towing & Pushback', 'Çekme & İtme'),
    ('tech-m3-a2', 'tech-m3-u18-deicing', 18, 'De-icing', 'Buz Çözme'),

    -- ─── TEKNİSYEN B1 (20) ──────────────────────────────────────
    ('tech-m4-b1', 'tech-m4-u01-inspection-procedures', 1, 'Inspection Procedures', 'Muayene Prosedürleri'),
    ('tech-m4-b1', 'tech-m4-u02-ndt-methods', 2, 'NDT Methods', 'NDT Yöntemleri'),
    ('tech-m4-b1', 'tech-m4-u03-eddy-current', 3, 'Eddy Current', 'Eddy Current'),
    ('tech-m4-b1', 'tech-m4-u04-ultrasonic', 4, 'Ultrasonic', 'Ultrasonik'),
    ('tech-m4-b1', 'tech-m4-u05-radiographic', 5, 'Radiographic', 'Radyografik'),
    ('tech-m4-b1', 'tech-m4-u06-dye-penetrant', 6, 'Dye Penetrant', 'Penetrant'),
    ('tech-m4-b1', 'tech-m4-u07-magnetic-particle', 7, 'Magnetic Particle', 'Manyetik Partikül'),
    ('tech-m4-b1', 'tech-m4-u08-borescope', 8, 'Borescope', 'Borescope'),
    ('tech-m4-b1', 'tech-m4-u09-structural-repair', 9, 'Structural Repair', 'Yapısal Onarım'),
    ('tech-m4-b1', 'tech-m4-u10-riveting', 10, 'Riveting', 'Perçinleme'),
    ('tech-m4-b1', 'tech-m4-u11-sheet-metal', 11, 'Sheet Metal', 'Sac İşçiliği'),
    ('tech-m4-b1', 'tech-m4-u12-composite-repair', 12, 'Composite Repair', 'Kompozit Onarım'),
    ('tech-m4-b1', 'tech-m4-u13-painting-doping', 13, 'Painting & Doping', 'Boyama'),
    ('tech-m4-b1', 'tech-m4-u14-aircraft-jacking', 14, 'Aircraft Jacking', 'Uçak Krikolama'),
    ('tech-m4-b1', 'tech-m4-u15-weight-balance', 15, 'Weight & Balance', 'Ağırlık & Denge'),
    ('tech-m4-b1', 'tech-m4-u16-levelling', 16, 'Levelling', 'Seviyelendirme'),
    ('tech-m4-b1', 'tech-m4-u17-rigging-controls', 17, 'Rigging Flight Controls', 'Kontrol Ayarı'),
    ('tech-m4-b1', 'tech-m4-u18-balance-control-surfaces', 18, 'Balance Control Surfaces', 'Kontrol Yüzeyi Dengeleme'),
    ('tech-m4-b1', 'tech-m4-u19-engine-removal', 19, 'Engine Removal', 'Motor Söküm'),
    ('tech-m4-b1', 'tech-m4-u20-engine-installation', 20, 'Engine Installation', 'Motor Takım'),

    -- ─── TEKNİSYEN B2 (20) ──────────────────────────────────────
    ('tech-m5-b2', 'tech-m5-u01-engine-runs', 1, 'Engine Runs', 'Motor Testleri'),
    ('tech-m5-b2', 'tech-m5-u02-performance-checks', 2, 'Performance Checks', 'Performans Kontrol'),
    ('tech-m5-b2', 'tech-m5-u03-vibration-analysis', 3, 'Vibration Analysis', 'Titreşim Analizi'),
    ('tech-m5-b2', 'tech-m5-u04-oil-analysis', 4, 'Oil Analysis', 'Yağ Analizi'),
    ('tech-m5-b2', 'tech-m5-u05-life-limits', 5, 'Life Limits', 'Ömür Limitleri'),
    ('tech-m5-b2', 'tech-m5-u06-ad-compliance', 6, 'AD Compliance', 'AD Uyum'),
    ('tech-m5-b2', 'tech-m5-u07-sb-compliance', 7, 'SB Compliance', 'SB Uyum'),
    ('tech-m5-b2', 'tech-m5-u08-easa-part66', 8, 'EASA Part-66', 'EASA Part 66'),
    ('tech-m5-b2', 'tech-m5-u09-faa-certified', 9, 'FAA Certification', 'FAA Sertifikasyon'),
    ('tech-m5-b2', 'tech-m5-u10-type-rating-syllabus', 10, 'Type Rating Syllabus', 'Tip Eğitim Müfredatı'),
    ('tech-m5-b2', 'tech-m5-u11-ojt', 11, 'On-the-Job Training', 'OJT'),
    ('tech-m5-b2', 'tech-m5-u12-examiner-questions', 12, 'Examiner Questions', 'Sınav Soruları'),
    ('tech-m5-b2', 'tech-m5-u13-ata-100', 13, 'ATA 100 Chapters', 'ATA 100 Bölümleri'),
    ('tech-m5-b2', 'tech-m5-u14-amm-references', 14, 'AMM References', 'AMM Referans'),
    ('tech-m5-b2', 'tech-m5-u15-ipc-references', 15, 'IPC References', 'IPC Referans'),
    ('tech-m5-b2', 'tech-m5-u16-fim-references', 16, 'FIM References', 'FIM Referans'),
    ('tech-m5-b2', 'tech-m5-u17-wdm-references', 17, 'WDM References', 'WDM Referans'),
    ('tech-m5-b2', 'tech-m5-u18-srm-references', 18, 'SRM References', 'SRM Referans'),
    ('tech-m5-b2', 'tech-m5-u19-troubleshoot-cases', 19, 'Troubleshoot Cases', 'Arıza Vakaları'),
    ('tech-m5-b2', 'tech-m5-u20-repeated-defects', 20, 'Repeated Defects', 'Tekrarlayan Defektler'),

    -- ─── TEKNİSYEN C1 (17) ──────────────────────────────────────
    ('tech-m6-c1', 'tech-m6-u01-incident-reporting', 1, 'Incident Reporting', 'Olay Raporlama'),
    ('tech-m6-c1', 'tech-m6-u02-mor', 2, 'Mandatory Occurrence Report', 'MOR'),
    ('tech-m6-c1', 'tech-m6-u03-hazard-identification', 3, 'Hazard Identification', 'Tehlike Tespiti'),
    ('tech-m6-c1', 'tech-m6-u04-sms', 4, 'Safety Management System', 'SMS'),
    ('tech-m6-c1', 'tech-m6-u05-root-cause', 5, 'Root Cause Analysis', 'Kök Neden Analizi'),
    ('tech-m6-c1', 'tech-m6-u06-fracas', 6, 'FRACAS', 'FRACAS'),
    ('tech-m6-c1', 'tech-m6-u07-audit-prep', 7, 'Audit Preparation', 'Denetim Hazırlığı'),
    ('tech-m6-c1', 'tech-m6-u08-regulatory-inspections', 8, 'Regulatory Inspections', 'Otorite Denetimleri'),
    ('tech-m6-c1', 'tech-m6-u09-mro-management', 9, 'MRO Management', 'MRO Yönetimi'),
    ('tech-m6-c1', 'tech-m6-u10-fleet-reliability', 10, 'Fleet Reliability', 'Filo Güvenilirliği'),
    ('tech-m6-c1', 'tech-m6-u11-technical-publications', 11, 'Technical Publications', 'Teknik Yayınlar'),
    ('tech-m6-c1', 'tech-m6-u12-technical-writing', 12, 'Technical Writing', 'Teknik Yazım'),
    ('tech-m6-c1', 'tech-m6-u13-cross-cultural-comm', 13, 'Cross-Cultural Communication', 'Kültürlerarası İletişim'),
    ('tech-m6-c1', 'tech-m6-u14-mentoring', 14, 'Mentoring Trainees', 'Mentorluk'),
    ('tech-m6-c1', 'tech-m6-u15-sign-off-authority', 15, 'Sign-off Authority', 'İmza Yetkisi'),
    ('tech-m6-c1', 'tech-m6-u16-post-maint-flight', 16, 'Post-Maintenance Flight', 'Bakım Sonrası Uçuş'),
    ('tech-m6-c1', 'tech-m6-u17-return-to-service', 17, 'Return to Service', 'Hizmete İade'),

    -- ─── PİLOT A0 (10) ──────────────────────────────────────────
    ('pilot-m1-a0', 'pilot-m1-u01-basic-phraseology', 1, 'Basic Phraseology', 'Temel Frazeoloji'),
    ('pilot-m1-a0', 'pilot-m1-u02-callsigns', 2, 'Callsigns', 'Çağrı Adları'),
    ('pilot-m1-a0', 'pilot-m1-u03-numbers-letters', 3, 'Numbers & Letters', 'Sayılar ve Harfler'),
    ('pilot-m1-a0', 'pilot-m1-u04-runway-taxiway', 4, 'Runway & Taxiway', 'Pist ve Taksi Yolu'),
    ('pilot-m1-a0', 'pilot-m1-u05-weather-basics', 5, 'Weather Basics', 'Hava Durumu Temelleri'),
    ('pilot-m1-a0', 'pilot-m1-u06-altitude-flight-levels', 6, 'Altitude & Flight Levels', 'İrtifa ve Uçuş Seviyeleri'),
    ('pilot-m1-a0', 'pilot-m1-u07-vfr-ifr', 7, 'VFR / IFR', 'VFR / IFR'),
    ('pilot-m1-a0', 'pilot-m1-u08-atc-positions', 8, 'ATC Positions', 'ATC Pozisyonları'),
    ('pilot-m1-a0', 'pilot-m1-u09-basic-readback', 9, 'Basic Readback', 'Temel Geri Okuma'),
    ('pilot-m1-a0', 'pilot-m1-u10-emergency-keywords', 10, 'Emergency Keywords', 'Acil Durum Kelimeleri'),

    -- ─── PİLOT A1 (15) ──────────────────────────────────────────
    ('pilot-m2-a1', 'pilot-m2-u01-pre-flight-check', 1, 'Pre-flight Check', 'Uçuş Öncesi Kontrol'),
    ('pilot-m2-a1', 'pilot-m2-u02-taxi-clearance', 2, 'Taxi Clearance', 'Taksi İzni'),
    ('pilot-m2-a1', 'pilot-m2-u03-takeoff-clearance', 3, 'Takeoff Clearance', 'Kalkış İzni'),
    ('pilot-m2-a1', 'pilot-m2-u04-departure', 4, 'Departure', 'Kalkış'),
    ('pilot-m2-a1', 'pilot-m2-u05-climb', 5, 'Climb', 'Tırmanış'),
    ('pilot-m2-a1', 'pilot-m2-u06-cruise', 6, 'Cruise', 'Seyir'),
    ('pilot-m2-a1', 'pilot-m2-u07-descent', 7, 'Descent', 'Alçalma'),
    ('pilot-m2-a1', 'pilot-m2-u08-approach', 8, 'Approach', 'Yaklaşma'),
    ('pilot-m2-a1', 'pilot-m2-u09-landing-clearance', 9, 'Landing Clearance', 'İniş İzni'),
    ('pilot-m2-a1', 'pilot-m2-u10-ground-vacate', 10, 'Vacate Runway', 'Pist Boşaltma'),
    ('pilot-m2-a1', 'pilot-m2-u11-missed-approach', 11, 'Missed Approach', 'Pas Geçme'),
    ('pilot-m2-a1', 'pilot-m2-u12-holding', 12, 'Holding', 'Holding'),
    ('pilot-m2-a1', 'pilot-m2-u13-transition-altitude', 13, 'Transition Altitude', 'Geçiş İrtifası'),
    ('pilot-m2-a1', 'pilot-m2-u14-qnh-qfe', 14, 'QNH / QFE', 'QNH / QFE'),
    ('pilot-m2-a1', 'pilot-m2-u15-transponder', 15, 'Transponder', 'Transponder'),

    -- ─── KABİN A0 (10) ──────────────────────────────────────────
    ('cabin-m1-a0', 'cabin-m1-u01-boarding-greetings', 1, 'Boarding & Greetings', 'Karşılama'),
    ('cabin-m1-a0', 'cabin-m1-u02-safety-demo', 2, 'Safety Demonstration', 'Güvenlik Gösterisi'),
    ('cabin-m1-a0', 'cabin-m1-u03-seatbelt-instructions', 3, 'Seatbelt Instructions', 'Emniyet Kemeri'),
    ('cabin-m1-a0', 'cabin-m1-u04-emergency-equipment', 4, 'Emergency Equipment', 'Acil Donanım'),
    ('cabin-m1-a0', 'cabin-m1-u05-beverage-service', 5, 'Beverage Service', 'İçecek Servisi'),
    ('cabin-m1-a0', 'cabin-m1-u06-meal-service', 6, 'Meal Service', 'Yemek Servisi'),
    ('cabin-m1-a0', 'cabin-m1-u07-announcements', 7, 'In-flight Announcements', 'Uçuş İçi Anonslar'),
    ('cabin-m1-a0', 'cabin-m1-u08-cabin-baggage', 8, 'Cabin Baggage', 'Kabin Bagajı'),
    ('cabin-m1-a0', 'cabin-m1-u09-weather-info', 9, 'Weather Information', 'Hava Bilgisi'),
    ('cabin-m1-a0', 'cabin-m1-u10-landing-prep', 10, 'Landing Preparation', 'İniş Hazırlığı'),

    -- ─── KABİN A1 (15) ──────────────────────────────────────────
    ('cabin-m2-a1', 'cabin-m2-u01-pre-flight-briefing', 1, 'Pre-flight Briefing', 'Uçuş Öncesi Brifing'),
    ('cabin-m2-a1', 'cabin-m2-u02-passenger-types', 2, 'Passenger Types', 'Yolcu Tipleri'),
    ('cabin-m2-a1', 'cabin-m2-u03-special-needs', 3, 'Special Needs Passengers', 'Özel İhtiyaç Yolcular'),
    ('cabin-m2-a1', 'cabin-m2-u04-medical-incidents', 4, 'Medical Incidents', 'Tıbbi Olaylar'),
    ('cabin-m2-a1', 'cabin-m2-u05-unruly-passenger', 5, 'Unruly Passenger', 'Ajite Yolcu'),
    ('cabin-m2-a1', 'cabin-m2-u06-security-screening', 6, 'Security Screening', 'Güvenlik Tarama'),
    ('cabin-m2-a1', 'cabin-m2-u07-cabin-emergencies', 7, 'Cabin Emergencies', 'Kabin Aciller'),
    ('cabin-m2-a1', 'cabin-m2-u08-evacuation-commands', 8, 'Evacuation Commands', 'Tahliye Komutları'),
    ('cabin-m2-a1', 'cabin-m2-u09-life-jackets', 9, 'Life Jackets', 'Can Yelekleri'),
    ('cabin-m2-a1', 'cabin-m2-u10-oxygen-masks', 10, 'Oxygen Masks', 'Oksijen Maskeleri'),
    ('cabin-m2-a1', 'cabin-m2-u11-smoke-fire', 11, 'Smoke & Fire', 'Duman & Yangın'),
    ('cabin-m2-a1', 'cabin-m2-u12-decompression', 12, 'Decompression', 'Dekompresyon'),
    ('cabin-m2-a1', 'cabin-m2-u13-cargo-fire', 13, 'Cargo Fire', 'Kargo Yangını'),
    ('cabin-m2-a1', 'cabin-m2-u14-lavatory-fire', 14, 'Lavatory Fire', 'Tuvalet Yangını'),
    ('cabin-m2-a1', 'cabin-m2-u15-cabin-secure', 15, 'Cabin Secure', 'Kabin Güvenliği'),

    -- ─── YER HİZMETLERİ A0 (10) ─────────────────────────────────
    ('ground-m1-a0', 'ground-m1-u01-ramp-positions', 1, 'Ramp Positions', 'Apron Pozisyonları'),
    ('ground-m1-a0', 'ground-m1-u02-marshalling-signals', 2, 'Marshalling Signals', 'Marshall Sinyalleri'),
    ('ground-m1-a0', 'ground-m1-u03-ground-equipment', 3, 'Ground Equipment', 'Yer Ekipmanı'),
    ('ground-m1-a0', 'ground-m1-u04-tow-tractor', 4, 'Tow Tractor', 'Çekici Aracı'),
    ('ground-m1-a0', 'ground-m1-u05-gpu', 5, 'Ground Power Unit', 'GPU'),
    ('ground-m1-a0', 'ground-m1-u06-asu', 6, 'Air Start Unit', 'ASU'),
    ('ground-m1-a0', 'ground-m1-u07-lavatory-service', 7, 'Lavatory Service', 'Tuvalet Servisi'),
    ('ground-m1-a0', 'ground-m1-u08-water-service', 8, 'Water Service', 'Su Servisi'),
    ('ground-m1-a0', 'ground-m1-u09-cleaning', 9, 'Aircraft Cleaning', 'Uçak Temizliği'),
    ('ground-m1-a0', 'ground-m1-u10-baggage-loading', 10, 'Baggage Loading', 'Bagaj Yükleme'),

    -- ─── YER HİZMETLERİ A1 (15) ─────────────────────────────────
    ('ground-m2-a1', 'ground-m2-u01-catering-load', 1, 'Catering Load', 'Catering Yükleme'),
    ('ground-m2-a1', 'ground-m2-u02-fuel-coordinator', 2, 'Fuel Coordinator', 'Yakıt Koordinatör'),
    ('ground-m2-a1', 'ground-m2-u03-deicing-fluid', 3, 'De-icing Fluid', 'Buz Çözücü'),
    ('ground-m2-a1', 'ground-m2-u04-anti-icing', 4, 'Anti-icing', 'Anti-icing'),
    ('ground-m2-a1', 'ground-m2-u05-snow-removal', 5, 'Snow Removal', 'Kar Temizleme'),
    ('ground-m2-a1', 'ground-m2-u06-runway-condition', 6, 'Runway Condition', 'Pist Durumu'),
    ('ground-m2-a1', 'ground-m2-u07-friction-reports', 7, 'Friction Reports', 'Sürtünme Raporları'),
    ('ground-m2-a1', 'ground-m2-u08-vehicle-radio', 8, 'Vehicle Radio', 'Araç Telsizi'),
    ('ground-m2-a1', 'ground-m2-u09-ramp-safety', 9, 'Ramp Safety', 'Apron Güvenliği'),
    ('ground-m2-a1', 'ground-m2-u10-fod-walks', 10, 'FOD Walks', 'FOD Yürüyüşü'),
    ('ground-m2-a1', 'ground-m2-u11-towing-procedures', 11, 'Towing Procedures', 'Çekme Prosedürleri'),
    ('ground-m2-a1', 'ground-m2-u12-pushback-clearance', 12, 'Pushback Clearance', 'Pushback İzni'),
    ('ground-m2-a1', 'ground-m2-u13-marshalling-2', 13, 'Advanced Marshalling', 'İleri Marshall'),
    ('ground-m2-a1', 'ground-m2-u14-headset-comms', 14, 'Headset Communications', 'Headset İletişim'),
    ('ground-m2-a1', 'ground-m2-u15-gate-changes', 15, 'Gate Changes', 'Gate Değişimi'),

    -- ─── ÖĞRENCİ A0 (10) ────────────────────────────────────────
    ('student-m1-a0', 'student-m1-u01-aviation-vocabulary', 1, 'Aviation Vocabulary', 'Havacılık Kelimeleri'),
    ('student-m1-a0', 'student-m1-u02-alphabet-numbers', 2, 'Alphabet & Numbers', 'Alfabe ve Sayılar'),
    ('student-m1-a0', 'student-m1-u03-time-zones', 3, 'Time Zones', 'Zaman Dilimleri'),
    ('student-m1-a0', 'student-m1-u04-basic-grammar', 4, 'Basic Grammar', 'Temel Gramer'),
    ('student-m1-a0', 'student-m1-u05-present-simple', 5, 'Present Simple', 'Geniş Zaman'),
    ('student-m1-a0', 'student-m1-u06-present-continuous', 6, 'Present Continuous', 'Şimdiki Zaman'),
    ('student-m1-a0', 'student-m1-u07-past-simple', 7, 'Past Simple', 'Geçmiş Zaman'),
    ('student-m1-a0', 'student-m1-u08-future-will', 8, 'Future (Will)', 'Gelecek Zaman'),
    ('student-m1-a0', 'student-m1-u09-modal-verbs', 9, 'Modal Verbs', 'Modal Fiiller'),
    ('student-m1-a0', 'student-m1-u10-prepositions', 10, 'Prepositions', 'Edatlar'),

    -- ─── ÖĞRENCİ A1 (15) ────────────────────────────────────────
    ('student-m2-a1', 'student-m2-u01-airport-vocabulary', 1, 'Airport Vocabulary', 'Havalimanı Kelimeleri'),
    ('student-m2-a1', 'student-m2-u02-aircraft-types', 2, 'Aircraft Types', 'Uçak Tipleri'),
    ('student-m2-a1', 'student-m2-u03-weather-vocabulary', 3, 'Weather Vocabulary', 'Hava Kelimeleri'),
    ('student-m2-a1', 'student-m2-u04-navigation-vocabulary', 4, 'Navigation Vocabulary', 'Seyrüsefer Kelimeleri'),
    ('student-m2-a1', 'student-m2-u05-atc-basics', 5, 'ATC Basics', 'ATC Temelleri'),
    ('student-m2-a1', 'student-m2-u06-pilot-jargon', 6, 'Pilot Jargon', 'Pilot Jargonu'),
    ('student-m2-a1', 'student-m2-u07-cabin-jargon', 7, 'Cabin Jargon', 'Kabin Jargonu'),
    ('student-m2-a1', 'student-m2-u08-technical-jargon', 8, 'Technical Jargon', 'Teknik Jargon'),
    ('student-m2-a1', 'student-m2-u09-airline-business', 9, 'Airline Business', 'Havayolu İşletmeciliği'),
    ('student-m2-a1', 'student-m2-u10-aviation-careers', 10, 'Aviation Careers', 'Havacılık Kariyerleri'),
    ('student-m2-a1', 'student-m2-u11-training-pathways', 11, 'Training Pathways', 'Eğitim Yolları'),
    ('student-m2-a1', 'student-m2-u12-simulator-training', 12, 'Simulator Training', 'Simulator Eğitimi'),
    ('student-m2-a1', 'student-m2-u13-exam-preparation', 13, 'Exam Preparation', 'Sınav Hazırlık'),
    ('student-m2-a1', 'student-m2-u14-interview-skills', 14, 'Interview Skills', 'Mülakat Becerileri'),
    ('student-m2-a1', 'student-m2-u15-cv-letter', 15, 'CV & Cover Letter', 'CV ve Niyet Mektubu')
)
INSERT INTO public.units (slug, module_id, number, title, title_tr, status, sort)
SELECT us.slug, m.id, us.number, us.title, us.title_tr, 'draft', us.number
FROM unit_seeds us
JOIN public.modules m ON m.slug = us.module_slug
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 3) LESSONS — her unit için 4 lesson (vocabulary, dialogue, listening, quiz)
--    Sadece bu seed'in ürettiği unit'ler için (slug LIKE prefix filter).
-- ============================================================================
DO $seed_lessons$
DECLARE
  u record;
  lesson_types lesson_type[] := ARRAY['vocabulary', 'dialogue', 'listening', 'quiz']::lesson_type[];
  lesson_titles_en text[] := ARRAY['Vocabulary', 'Dialogue', 'Listening', 'Quiz'];
  lesson_titles_tr text[] := ARRAY['Kelime', 'Diyalog', 'Dinleme', 'Quiz'];
  i int;
  v_inserted int := 0;
BEGIN
  FOR u IN
    SELECT un.id, un.slug
    FROM public.units un
    JOIN public.modules mo ON mo.id = un.module_id
    WHERE mo.slug IN (
      'tech-m1-a0','tech-m2-a1','tech-m3-a2','tech-m4-b1','tech-m5-b2','tech-m6-c1',
      'pilot-m1-a0','pilot-m2-a1',
      'cabin-m1-a0','cabin-m2-a1',
      'ground-m1-a0','ground-m2-a1',
      'student-m1-a0','student-m2-a1'
    )
  LOOP
    FOR i IN 1..4 LOOP
      INSERT INTO public.lessons (slug, unit_id, number, title, title_tr, type, status, sort)
      VALUES (
        u.slug || '-l' || i || '-' || lesson_types[i]::text,
        u.id,
        i,
        'Lesson ' || i || ' — ' || lesson_titles_en[i],
        'Ders ' || i || ' — ' || lesson_titles_tr[i],
        lesson_types[i],
        'draft',
        i
      )
      ON CONFLICT (slug) DO NOTHING;
      GET DIAGNOSTICS v_inserted = ROW_COUNT;
    END LOOP;
  END LOOP;
END $seed_lessons$;

-- ============================================================================
-- 4) Doğrulama
-- ============================================================================
DO $verify$
DECLARE
  v_modules int;
  v_units int;
  v_lessons int;
BEGIN
  SELECT count(*) INTO v_modules FROM public.modules
   WHERE slug LIKE 'tech-m%' OR slug LIKE 'pilot-m%' OR slug LIKE 'cabin-m%'
      OR slug LIKE 'ground-m%' OR slug LIKE 'student-m%';
  SELECT count(*) INTO v_units FROM public.units
   WHERE slug LIKE 'tech-m%' OR slug LIKE 'pilot-m%' OR slug LIKE 'cabin-m%'
      OR slug LIKE 'ground-m%' OR slug LIKE 'student-m%';
  SELECT count(*) INTO v_lessons FROM public.lessons
   WHERE slug LIKE 'tech-m%' OR slug LIKE 'pilot-m%' OR slug LIKE 'cabin-m%'
      OR slug LIKE 'ground-m%' OR slug LIKE 'student-m%';

  RAISE NOTICE 'Müfredat çatısı seed: % modül, % unit, % lesson',
    v_modules, v_units, v_lessons;
END $verify$;

COMMIT;

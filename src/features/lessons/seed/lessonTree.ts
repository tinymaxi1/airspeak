/**
 * Lesson tree — her rol için 4 modül × 10 ünite × 5 ders = 200 ders yapısı.
 *
 * Bu yapı SLOT (boş ders kabukları) içerir; gerçek egzersizler
 * lessonGenerator tarafından runtime'da seed vocab'tan üretilir.
 *
 * Tekrarsızlık: kullanıcı her ders için yeni egzersizler görür
 * (60 terim × 8 egzersiz tipi = 480 unique egzersiz/rol).
 */
import type { UserRole } from '@/types/profile';

export interface LessonNode {
  id: string;
  title: string;
  type: 'vocabulary' | 'dialogue' | 'listening' | 'pronunciation' | 'quiz';
  xp: number;
  estimatedMinutes: number;
  isPremium: boolean;
}

export interface UnitNode {
  id: string;
  number: number;
  title: string;
  description: string;
  lessons: LessonNode[];
  badge?: string;
}

export interface ModuleNode {
  id: string;
  number: number;
  title: string;
  description: string;
  units: UnitNode[];
  badge: string;
  rewardXp: number;
}

interface ModuleTemplate {
  number: number;
  title: string;
  description: string;
  badge: string;
  rewardXp: number;
  unitTitles: string[];
}

const PILOT_MODULES: ModuleTemplate[] = [
  // ===== FAZ 1 (A1) — Modul 1-4 =====
  {
    number: 1,
    title: 'Cockpit & Aircraft Basics',
    description: 'Uçak temel parçaları ve kokpit bileşenleri',
    badge: '🛩️',
    rewardXp: 1000,
    unitTitles: [
      'Aircraft Anatomy',
      'Cockpit Components',
      'Engine Basics',
      'Landing Gear & Brakes',
      'Wings & Control Surfaces',
      'Mid-Module Quiz',
      'Fuel System Basics',
      'Electrical System Basics',
      'Hydraulic System Basics',
      'Cockpit Master Final',
    ],
  },
  {
    number: 2,
    title: 'Basic ATC Communication',
    description: 'NATO alfabe, sayılar, frazeoloji',
    badge: '📻',
    rewardXp: 1500,
    unitTitles: [
      'NATO Phonetic Alphabet',
      'Numbers Pronunciation',
      'Call Signs',
      'Roger / Wilco',
      'Frequency Reading',
      'ATC Quiz Checkpoint',
      'Time Reading',
      'Basic Greetings',
      'First Contact Phrases',
      'Radio Operator Final',
    ],
  },
  {
    number: 3,
    title: 'Pre-Flight Procedures',
    description: 'Uçuş öncesi tüm hazırlıklar',
    badge: '✈️',
    rewardXp: 2000,
    unitTitles: [
      'Flight Plan Basics',
      'Weather Briefing',
      'NOTAM Vocabulary',
      'Walk-around Inspection',
      'Cabin Briefing',
      'Pre-Flight Quiz',
      'Pushback Communication',
      'Engine Start',
      'Taxi Phrases',
      'Pre-Flight Pro Final',
    ],
  },
  {
    number: 4,
    title: 'Numbers & Time in Aviation',
    description: 'Heading, altitude, hız, mesafe',
    badge: '🎯',
    rewardXp: 2500,
    unitTitles: [
      'Heading',
      'Altitude',
      'Speed',
      'Distance',
      'Frequency Advanced',
      'Numbers Quiz',
      'Time Conversion',
      'Date Format',
      'Quantity & Volume',
      'A1 Graduate Final',
    ],
  },
  // ===== FAZ 2 (A2 Building) — Modul 5-9 =====
  {
    number: 5,
    title: 'Routine ATC Phraseology',
    description: 'Departure → cruise → arrival tam dialog',
    badge: '📡',
    rewardXp: 3000,
    unitTitles: [
      'Departure Phraseology',
      'Climb Phraseology',
      'Cruise & En-Route',
      'Descent Phraseology',
      'Approach Phraseology',
      'ATC Pro Quiz',
      'Landing Phraseology',
      'Vector Instructions',
      'Speed/Altitude Restrictions',
      'ATC Master Final',
    ],
  },
  {
    number: 6,
    title: 'Aircraft Systems Operational',
    description: 'APU, FMS, autopilot, ECAM',
    badge: '⚙️',
    rewardXp: 3500,
    unitTitles: [
      'APU Operations',
      'FMS Programming',
      'Autopilot Modes',
      'ECAM/EICAS',
      'Pressurization',
      'Systems Pro Quiz',
      'Anti-icing',
      'Hydraulic Failures',
      'Electrical Failures',
      'Systems Pro Final',
    ],
  },
  {
    number: 7,
    title: 'Approach & Landing Basics',
    description: 'ILS, VOR, GPS, RNAV',
    badge: '🛬',
    rewardXp: 4000,
    unitTitles: [
      'ILS Approach',
      'VOR Approach',
      'GPS/RNAV Approach',
      'Glide Slope',
      'Localizer Capture',
      'Approach Quiz',
      'Crosswind Landing',
      'Go-Around Procedures',
      'Missed Approach',
      'Approach Master Final',
    ],
  },
  {
    number: 8,
    title: 'Weather Vocabulary Advanced',
    description: 'METAR full decode, TAF, SIGMET',
    badge: '🌩️',
    rewardXp: 4500,
    unitTitles: [
      'METAR Full Decode',
      'TAF Reading',
      'SIGMET / AIRMET',
      'Wind Shear',
      'Volcanic Ash',
      'Weather Quiz',
      'Icing Conditions',
      'Thunderstorm Avoidance',
      'Fog & Visibility',
      'Weather Pro Final',
    ],
  },
  {
    number: 9,
    title: 'Cabin Coordination',
    description: 'Pilot↔kabin iletişimi',
    badge: '🤝',
    rewardXp: 5000,
    unitTitles: [
      'Pre-Flight Brief',
      'Cabin Crew Calls',
      'Cabin Secure',
      'Turbulence Coordination',
      'Medical Emergency',
      'Coordination Quiz',
      'Security Threats',
      'Disruptive Passengers',
      'Post-Flight Debrief',
      'A2 Graduate Final',
    ],
  },
  // ===== FAZ 3 (B1 Operational) — Modul 10-14 =====
  {
    number: 10,
    title: 'Non-Routine ATC',
    description: 'Standart-dışı durumlar',
    badge: '🚧',
    rewardXp: 6000,
    unitTitles: [
      'Vector Requests',
      'Speed/Altitude Restrictions',
      'Holding Patterns',
      'Re-routing',
      'Conflict Resolution',
      'Non-Routine Quiz',
      'Weather Deviation',
      'Equipment Failures',
      'Lost Communication',
      'Non-Routine Final',
    ],
  },
  {
    number: 11,
    title: 'Emergency Communication',
    description: 'MAYDAY, PAN-PAN, squawk codes',
    badge: '🚨',
    rewardXp: 7000,
    unitTitles: [
      'MAYDAY Procedure',
      'PAN-PAN Procedure',
      'Squawk 7700',
      'Squawk 7600',
      'Squawk 7500',
      'Emergency Quiz',
      'Engine Failure',
      'Fuel Emergency',
      'Medical Emergency Pilot',
      'Emergency Final',
    ],
  },
  {
    number: 12,
    title: 'NOTAM & Weather Advanced',
    description: 'Q-code, TAF probability, SIGMET',
    badge: '🌪️',
    rewardXp: 8000,
    unitTitles: [
      'NOTAM Q-Code Reading',
      'TAF Probability',
      'SIGMET Interpretation',
      'Windshear Advisory',
      'Volcanic Ash',
      'Advanced Weather Quiz',
      'Microburst',
      'Mountain Wave',
      'Decision Making',
      'Weather Master Final',
    ],
  },
  {
    number: 13,
    title: 'International Operations',
    description: 'Aksanlar, kültür, uluslararası ops',
    badge: '🌐',
    rewardXp: 9000,
    unitTitles: [
      'Different ATC Accents',
      'Standard Phraseology Variants',
      'Cultural Awareness Cockpit',
      'Foreign Country Procedures',
      'Datalink Operations',
      'International Quiz',
      'Time Zone Operations',
      'Customs Coordination',
      'Diversion to Foreign',
      'International Final',
    ],
  },
  {
    number: 14,
    title: 'Critical Thinking Aviation',
    description: 'Senaryo analizi, çoklu adım problem çözme',
    badge: '🧠',
    rewardXp: 10000,
    unitTitles: [
      'Scenario Analysis',
      'Multi-step Problem Solving',
      'CRM English Basics',
      'Threat Recognition',
      'Decision Frameworks',
      'CT Quiz',
      'Time-Critical Decisions',
      'Risk Mitigation',
      'Post-Event Reflection',
      'B1 Graduate Final',
    ],
  },
];

const CABIN_MODULES: ModuleTemplate[] = [
  {
    number: 1,
    title: 'Cabin Fundamentals',
    description: 'Kabin ekibi temelleri ve donanım',
    badge: '👨‍✈️',
    rewardXp: 1000,
    unitTitles: [
      'Cabin Crew Roles',
      'Cabin Equipment',
      'Seatbelt & Safety Signs',
      'Galley Basics',
      'Aisle & Seats',
      'Mid-Module Quiz',
      'Tray Tables & Bins',
      'Crew Rest Areas',
      'Jumpseat',
      'Cabin Specialist Final',
    ],
  },
  {
    number: 2,
    title: 'Passenger Communication',
    description: 'PA anonsları ve yolcu etkileşimi',
    badge: '🎙️',
    rewardXp: 1500,
    unitTitles: [
      'Welcome Aboard',
      'Boarding Announcements',
      'Safety Demonstration',
      'During Flight Service',
      'Arrival Announcements',
      'PA Quiz',
      'Special Passengers',
      'Unruly Passenger Handling',
      'Multilingual Service',
      'Communication Pro Final',
    ],
  },
  {
    number: 3,
    title: 'Emergency Procedures',
    description: 'Acil durum prosedürleri ve ekipman',
    badge: '🚨',
    rewardXp: 2000,
    unitTitles: [
      'Doors Armed & Cross Check',
      'Evacuation Slides',
      'Life Vests & Oxygen',
      'Fire Fighting',
      'AED & First Aid',
      'Emergency Quiz',
      'Brace Position',
      'Ditching',
      'Smoke Hood',
      'Safety Pro Final',
    ],
  },
  {
    number: 4,
    title: 'Service & Coordination',
    description: 'Servis akışı ve ekip koordinasyonu',
    badge: '🤝',
    rewardXp: 2500,
    unitTitles: [
      'Meal Service Flow',
      'Special Meals (SSR)',
      'Beverage Service',
      'Duty-Free',
      'Pilot-Cabin Coordination',
      'Service Quiz',
      'Cabin Manager Duties',
      'Pre-Flight Briefing',
      'Interview Preparation',
      'A1 Graduate Final',
    ],
  },
  // ===== FAZ 2 (A2 Building) — Modul 5-9 =====
  {
    number: 5,
    title: 'Advanced Service & Catering',
    description: 'Fine dining, premium hizmet',
    badge: '🍽️',
    rewardXp: 3000,
    unitTitles: [
      'Business Class Service',
      'First Class Standards',
      'Wine & Beverage Pairing',
      'Fine Dining Etiquette',
      'Galley Management',
      'Service Quiz',
      'Pre-order System',
      'Allergen Management',
      'Service Recovery',
      'Service Pro Final',
    ],
  },
  {
    number: 6,
    title: 'Special Situations',
    description: 'İhlal, tıbbi acil, güvenlik',
    badge: '🚨',
    rewardXp: 3500,
    unitTitles: [
      'Medical Emergency',
      'Doctor on Board',
      'Intoxicated Passenger',
      'De-escalation',
      'Restraint Procedures',
      'Special Quiz',
      'Air Marshal Coordination',
      'Bomb Threat',
      'Hijacking Procedures',
      'Special Pro Final',
    ],
  },
  {
    number: 7,
    title: 'Multi-cultural Service',
    description: 'Kültürel farkındalık ve hassasiyet',
    badge: '🌍',
    rewardXp: 4000,
    unitTitles: [
      'Cultural Awareness',
      'Religious Considerations',
      'Halal/Kosher Service',
      'Body Language Cross-culture',
      'Greeting Protocols',
      'Cultural Quiz',
      'VIP Handling',
      'Diplomatic Passengers',
      'Foreign Languages',
      'Cultural Pro Final',
    ],
  },
  {
    number: 8,
    title: 'Senior Crew Duties',
    description: 'Purser ve cabin manager rolleri',
    badge: '👔',
    rewardXp: 4500,
    unitTitles: [
      'Purser Briefing',
      'Crew Coordination',
      'Time Management',
      'Conflict Resolution',
      'Performance Review',
      'Senior Quiz',
      'Captain Reports',
      'Incident Reporting',
      'Mentoring Junior',
      'Senior Pro Final',
    ],
  },
  {
    number: 9,
    title: 'Wellness & Career',
    description: 'Yorgunluk, sağlık, kariyer',
    badge: '💼',
    rewardXp: 5000,
    unitTitles: [
      'Fatigue Management',
      'Jet Lag',
      'Healthy Eating Onboard',
      'Mental Health',
      'Roster Bidding',
      'Wellness Quiz',
      'Career Path',
      'Promotion Strategy',
      'Industry Trends',
      'A2 Graduate Final',
    ],
  },
  // ===== FAZ 3 (B1 Operational) — Modul 10-14 =====
  {
    number: 10,
    title: 'In-Flight Emergencies',
    description: 'Tıbbi, yangın, basınç kaybı',
    badge: '🚨',
    rewardXp: 6000,
    unitTitles: [
      'Medical Emergency Response',
      'Fire Fighting Cabin',
      'Smoke Detection',
      'Decompression Procedures',
      'Emergency Evacuation',
      'Emergency Quiz',
      'Ditching Preparation',
      'Brace Position Coaching',
      'Door Operation Emergency',
      'Emergency Master Final',
    ],
  },
  {
    number: 11,
    title: 'Customer Conflict Resolution',
    description: 'Şikayet, taciz, alkol sorunları',
    badge: '🤝',
    rewardXp: 7000,
    unitTitles: [
      'Active Listening',
      'Empathy Techniques',
      'Apology Strategy',
      'Compensation Authority',
      'Documentation',
      'Conflict Quiz',
      'Discrimination Cases',
      'Harassment Response',
      'Refusal of Service',
      'Resolution Pro Final',
    ],
  },
  {
    number: 12,
    title: 'Catering Crisis Management',
    description: 'Eksik catering, kalite, alerji',
    badge: '🍱',
    rewardXp: 8000,
    unitTitles: [
      'Missing Meals',
      'Quality Issues',
      'Allergy Incidents',
      'Religious Meal Errors',
      'Dietary Restrictions',
      'Catering Quiz',
      'VIP Catering Issues',
      'Beverage Shortages',
      'Hot Meal Cold Issues',
      'Catering Pro Final',
    ],
  },
  {
    number: 13,
    title: 'Long-haul Specialization',
    description: 'Uzun mesafe operasyonel beceriler',
    badge: '✈️',
    rewardXp: 9000,
    unitTitles: [
      'Long-haul Service Flow',
      'Crew Rest Management',
      'Sleep Cycle Coordination',
      'Light Management',
      'Mid-flight Service',
      'Long-haul Quiz',
      'Connection Information',
      'Time Zone Crossing',
      'Pre-arrival Service',
      'Long-haul Pro Final',
    ],
  },
  {
    number: 14,
    title: 'Cabin Manager Skills',
    description: 'Purser sorumlulukları',
    badge: '👨‍💼',
    rewardXp: 10000,
    unitTitles: [
      'Pre-flight Briefing Lead',
      'Crew Resource Allocation',
      'Performance Coaching',
      'Captain Liaison',
      'Inflight Decisions',
      'Manager Quiz',
      'Incident Reporting Detail',
      'Audit Compliance',
      'Crew Mentoring',
      'B1 Graduate Final',
    ],
  },
];

const TECHNICIAN_MODULES: ModuleTemplate[] = [
  {
    number: 1,
    title: 'Tools & Workshop Basics',
    description: 'Atelye aletleri ve FOD önlemi',
    badge: '🔧',
    rewardXp: 1000,
    unitTitles: [
      'Hand Tools',
      'Measuring Tools',
      'Power Tools',
      'Safety Equipment (PPE)',
      'Workshop Layout',
      'Tools Quiz',
      'Tool Storage & FOD',
      'Tool Calibration',
      'Tool Requisition',
      'Tools Specialist Final',
    ],
  },
  {
    number: 2,
    title: 'AMM & Documentation',
    description: 'Bakım el kitabı ve ATA chapter',
    badge: '📚',
    rewardXp: 1500,
    unitTitles: [
      'What is AMM',
      'ATA Chapter System',
      'Job Cards',
      'IPC',
      'WDM Basics',
      'Doc Quiz',
      'Service Bulletins',
      'Airworthiness Directives',
      'Document Revisions',
      'Documentation Pro Final',
    ],
  },
  {
    number: 3,
    title: 'Aircraft Systems Overview',
    description: 'Uçak sistemleri genel bakış',
    badge: '⚙️',
    rewardXp: 2000,
    unitTitles: [
      'Powerplant Basics',
      'Hydraulic System',
      'Electrical System',
      'Pneumatic / Bleed',
      'Fuel System',
      'Systems Quiz',
      'Flight Controls',
      'Landing Gear Systems',
      'Avionics Intro',
      'Systems Aware Final',
    ],
  },
  {
    number: 4,
    title: 'Inspection & Hardware',
    description: 'NDT, hardware ve kalite',
    badge: '🔍',
    rewardXp: 2500,
    unitTitles: [
      'Visual Inspection',
      'Common Defects',
      'Fasteners',
      'Lockwire & Torque Seal',
      'Cotter Pins',
      'Inspection Quiz',
      'NDT Introduction',
      'Quality Control',
      'Defect Reporting',
      'A1 Apprentice Final',
    ],
  },
  // ===== FAZ 2 (A2 Building) — Modul 5-9 =====
  {
    number: 5,
    title: 'Routine Maintenance Tasks',
    description: 'Hat bakımı ve günlük operasyonlar',
    badge: '🛠️',
    rewardXp: 3000,
    unitTitles: [
      'Daily Inspection',
      'Pre-Flight Checks',
      'Post-Flight Checks',
      'Tire Pressure',
      'Oil Service',
      'Maintenance Quiz',
      'Hydraulic Service',
      'Brake Wear Check',
      'Light Maintenance',
      'Routine Pro Final',
    ],
  },
  {
    number: 6,
    title: 'Defect Investigation',
    description: 'Arıza tespit ve troubleshoot',
    badge: '🔬',
    rewardXp: 3500,
    unitTitles: [
      'TSM Methodology',
      'Fault Codes',
      'BITE System',
      'Component Test',
      'Wiring Trace',
      'Defect Quiz',
      'Intermittent Faults',
      'Cabin Defects',
      'Customer Reports',
      'Defect Pro Final',
    ],
  },
  {
    number: 7,
    title: 'Component Removal/Install',
    description: 'Komponent değişimi prosedürleri',
    badge: '🔄',
    rewardXp: 4000,
    unitTitles: [
      'Removal Procedures',
      'Storage & Handling',
      'Installation Steps',
      'Torque Procedures',
      'Functional Test',
      'R&I Quiz',
      'Calibration Post-Install',
      'Sign-off Process',
      'Documentation',
      'R&I Pro Final',
    ],
  },
  {
    number: 8,
    title: 'Engine Maintenance',
    description: 'Motor bakım ve overhaul',
    badge: '🚀',
    rewardXp: 4500,
    unitTitles: [
      'Engine Inspection',
      'Borescope Inspection',
      'Hot Start Recovery',
      'EGT Trend Monitoring',
      'Compressor Wash',
      'Engine Quiz',
      'On-Wing Repair',
      'Module Change',
      'Engine Run-up',
      'Engine Pro Final',
    ],
  },
  {
    number: 9,
    title: 'Hydraulic Maintenance',
    description: 'Hidrolik sistem bakımı',
    badge: '💧',
    rewardXp: 5000,
    unitTitles: [
      'Hydraulic Fluid',
      'Pump Testing',
      'Leak Detection',
      'Pressure Testing',
      'Filter Change',
      'Hydraulic Quiz',
      'EDP Replacement',
      'Reservoir Service',
      'Accumulator Charge',
      'A2 Graduate Final',
    ],
  },
  // ===== FAZ 3 (B1 Operational) — Modul 10-14 =====
  {
    number: 10,
    title: 'Heavy Maintenance Procedures',
    description: 'C/D-check yoğun çalışmalar',
    badge: '🏗️',
    rewardXp: 6000,
    unitTitles: [
      'Heavy Check Planning',
      'Disassembly Procedures',
      'Deep Inspection',
      'Repair Schemes',
      'Re-assembly',
      'Heavy Quiz',
      'Modification Embodiment',
      'Test Flight Prep',
      'Return to Service',
      'Heavy Pro Final',
    ],
  },
  {
    number: 11,
    title: 'Avionics Troubleshooting',
    description: 'Avionik arıza tanı',
    badge: '🔌',
    rewardXp: 7000,
    unitTitles: [
      'BITE Diagnostics',
      'Connector Testing',
      'Wire Continuity',
      'LRU Replacement',
      'System Reconfiguration',
      'Avionics Quiz',
      'EFIS Issues',
      'FMS Reprogramming',
      'Datalink Faults',
      'Avionics Pro Final',
    ],
  },
  {
    number: 12,
    title: 'Composite Repair',
    description: 'Kompozit hasar tamiri',
    badge: '🧬',
    rewardXp: 8000,
    unitTitles: [
      'Composite Inspection',
      'Damage Categorization',
      'Repair Materials',
      'Wet Layup',
      'Curing Procedures',
      'Composite Quiz',
      'Surface Preparation',
      'Bonding Repair',
      'Quality Verification',
      'Composite Pro Final',
    ],
  },
  {
    number: 13,
    title: 'Engine Performance Analysis',
    description: 'Motor performansı izleme',
    badge: '📊',
    rewardXp: 9000,
    unitTitles: [
      'Trend Monitoring',
      'EGT Margin',
      'Vibration Analysis',
      'Oil Consumption',
      'Power Assurance',
      'Performance Quiz',
      'Hot Section Health',
      'Compressor Health',
      'Predictive Maintenance',
      'Performance Pro Final',
    ],
  },
  {
    number: 14,
    title: 'Maintenance Planning',
    description: 'Bakım planlaması ve yönetim',
    badge: '📅',
    rewardXp: 10000,
    unitTitles: [
      'MEL Application',
      'Deferred Items',
      'Scheduled Tasks',
      'AD/SB Tracking',
      'Resource Allocation',
      'Planning Quiz',
      'Tool Inventory',
      'Spare Parts Planning',
      'Continuing Airworthiness',
      'B1 Graduate Final',
    ],
  },
];

const GROUND_MODULES: ModuleTemplate[] = [
  {
    number: 1,
    title: 'Ramp & Marshalling',
    description: 'Apron operasyonları',
    badge: '🛬',
    rewardXp: 1000,
    unitTitles: [
      'Ramp Basics',
      'Marshalling Signals',
      'Wands & Chocks',
      'Tug & Towbar',
      'Jet Bridge & Stairs',
      'Ramp Quiz',
      'Parking Position',
      'Stand Types',
      'Gate Coordination',
      'Ramp Specialist Final',
    ],
  },
  {
    number: 2,
    title: 'Pushback & Taxi',
    description: 'Pushback ve taksi prosedürleri',
    badge: '⬅️',
    rewardXp: 1500,
    unitTitles: [
      'Pushback Procedure',
      'Brakes Set Communication',
      'Headset Operations',
      'Taxi Coordination',
      'Follow-me Car',
      'Pushback Quiz',
      'Aircraft Movement',
      'GSE Operation',
      'GPU Connection',
      'Pushback Pro Final',
    ],
  },
  {
    number: 3,
    title: 'Baggage & Fuel',
    description: 'Bagaj ve yakıt operasyonları',
    badge: '🧳',
    rewardXp: 2000,
    unitTitles: [
      'Baggage Handling',
      'Belt Loaders',
      'Cargo Hold & ULDs',
      'Baggage Tags',
      'Lost Baggage',
      'Baggage Quiz',
      'Fuel Operations',
      'Bonding Cable',
      'Spill Response',
      'Baggage & Fuel Final',
    ],
  },
  {
    number: 4,
    title: 'Safety & Operations',
    description: 'Emniyet ve operasyon',
    badge: '🦺',
    rewardXp: 2500,
    unitTitles: [
      'PPE Standards',
      'Hi-Vis & Ear Protection',
      'Jet Blast Hazards',
      'Engine Intake Safety',
      'FOD Prevention',
      'Safety Quiz',
      'De-icing / Anti-icing',
      'Shift Handover',
      'Incident Reporting',
      'A1 Graduate Final',
    ],
  },
  // ===== FAZ 2 (A2 Building) — Modul 5-9 =====
  {
    number: 5,
    title: 'Advanced Ramp Operations',
    description: 'Karmaşık ramp senaryoları',
    badge: '🛫',
    rewardXp: 3000,
    unitTitles: [
      'Multi-aircraft Coordination',
      'Wide-body Operations',
      'VIP Handling',
      'Charter Flights',
      'Diplomatic Cargo',
      'Ramp Quiz',
      'Night Operations',
      'Adverse Weather',
      'Tight Turnaround',
      'Ramp Pro Final',
    ],
  },
  {
    number: 6,
    title: 'Cargo Handling Specialized',
    description: 'Tehlikeli madde, canlı hayvan, perishable',
    badge: '📦',
    rewardXp: 3500,
    unitTitles: [
      'IATA DGR Compliance',
      'Lithium Battery Cargo',
      'Live Animal Transport',
      'Perishable Cool Chain',
      'Heavy Freight',
      'Cargo Quiz',
      'Pharma Logistics',
      'Diplomatic Pouches',
      'Customs Clearance',
      'Cargo Pro Final',
    ],
  },
  {
    number: 7,
    title: 'De-icing Procedures',
    description: 'Buz çözme detaylı',
    badge: '❄️',
    rewardXp: 4000,
    unitTitles: [
      'Type I/II/III/IV Fluids',
      'Holdover Time Charts',
      'CCAR Procedures',
      'Pre-deicing Checks',
      'Communication Protocols',
      'De-icing Quiz',
      'Anti-icing Application',
      'Recheck Procedures',
      'Environmental Concerns',
      'De-icing Pro Final',
    ],
  },
  {
    number: 8,
    title: 'Emergency Response',
    description: 'Yangın, sızıntı, tıbbi',
    badge: '🚒',
    rewardXp: 4500,
    unitTitles: [
      'Fuel Spill Response',
      'Aircraft Fire',
      'Medical Emergency',
      'Bomb Threat',
      'Security Breach',
      'Emergency Quiz',
      'Evacuation Support',
      'First Responders Coord',
      'Aftermath Investigation',
      'Emergency Pro Final',
    ],
  },
  {
    number: 9,
    title: 'Crew Leadership',
    description: 'Süpervizör ve yönetim',
    badge: '👷',
    rewardXp: 5000,
    unitTitles: [
      'Team Leadership',
      'Daily Briefing',
      'Performance Coaching',
      'Conflict Resolution',
      'KPI Monitoring',
      'Leadership Quiz',
      'Training New Crew',
      'Audit Preparation',
      'Customer Reporting',
      'A2 Graduate Final',
    ],
  },
  // ===== FAZ 3 (B1 Operational) — Modul 10-14 =====
  {
    number: 10,
    title: 'Disruption Management',
    description: 'Gecikme, iptal, kriz yönetimi',
    badge: '⚠️',
    rewardXp: 6000,
    unitTitles: [
      'Delay Codes',
      'Cancellation Procedures',
      'Diversion Operations',
      'Aircraft Swap',
      'Crew Reassignment',
      'Disruption Quiz',
      'Passenger Care',
      'Hotel Vouchers',
      'Recovery Operations',
      'Disruption Pro Final',
    ],
  },
  {
    number: 11,
    title: 'Special Cargo Operations',
    description: 'Tehlikeli, canlı, sıcaklık kontrollü',
    badge: '📦',
    rewardXp: 7000,
    unitTitles: [
      'IATA DGR Compliance',
      'Lithium Battery Loading',
      'Live Animal Cargo',
      'Pharma Logistics',
      'Diplomatic Pouches',
      'Cargo Quiz',
      'Heavy Freight',
      'Oversize Cargo',
      'Customs Coordination',
      'Special Cargo Final',
    ],
  },
  {
    number: 12,
    title: 'Multi-Carrier Coordination',
    description: 'Çok havayolu hub yönetimi',
    badge: '🌐',
    rewardXp: 8000,
    unitTitles: [
      'Hub Operations',
      'Inter-airline Communication',
      'Codeshare Operations',
      'Alliance Procedures',
      'Connection Management',
      'Multi-Carrier Quiz',
      'Resource Sharing',
      'Time Slot Coordination',
      'Mutual Support Agreements',
      'Multi-Carrier Final',
    ],
  },
  {
    number: 13,
    title: 'Operations Performance',
    description: 'KPI, OTP, verimlilik analizi',
    badge: '📈',
    rewardXp: 9000,
    unitTitles: [
      'KPI Definition',
      'OTP Measurement',
      'Turnaround Analytics',
      'Cost Control',
      'Productivity Metrics',
      'Performance Quiz',
      'Benchmarking',
      'Continuous Improvement',
      'Reporting to Customers',
      'Performance Pro Final',
    ],
  },
  {
    number: 14,
    title: 'Safety Auditing',
    description: 'IATA ISAGO, denetim hazırlığı',
    badge: '✅',
    rewardXp: 10000,
    unitTitles: [
      'ISAGO Standards',
      'IOSA Audit',
      'Internal Audits',
      'Audit Preparation',
      'Non-Conformance Handling',
      'Audit Quiz',
      'CAPA Process',
      'Safety Risk Assessment',
      'Continuous Compliance',
      'B1 Graduate Final',
    ],
  },
];

const STUDENT_MODULES: ModuleTemplate[] = [
  {
    number: 1,
    title: 'Aviation Fundamentals',
    description: 'Havacılık temelleri',
    badge: '🎓',
    rewardXp: 1000,
    unitTitles: [
      'What is Aviation',
      'Types of Aircraft',
      'Airlines & Hubs',
      'Airports',
      'Runways & Taxiways',
      'Fundamentals Quiz',
      'Pilot Career',
      'Cabin Crew Career',
      'Other Careers',
      'Fundamentals Final',
    ],
  },
  {
    number: 2,
    title: 'University & Education',
    description: 'Üniversite ve eğitim',
    badge: '📖',
    rewardXp: 1500,
    unitTitles: [
      'YKS Basics',
      'Aviation Faculty',
      'Pilotage Programs',
      'PPL / CPL / ATPL',
      'Flight Schools',
      'Education Quiz',
      'Simulator Training',
      'Theoretical Exams',
      'Practical Training',
      'Education Pro Final',
    ],
  },
  {
    number: 3,
    title: 'Exams & Certifications',
    description: 'Sınavlar ve sertifikalar',
    badge: '📝',
    rewardXp: 2000,
    unitTitles: [
      'ICAO Level 4',
      'ICAO Level 5+',
      'SHGM Authority',
      'EASA Standards',
      'TOEFL / IELTS',
      'Exam Quiz',
      'YDS Aviation',
      'Medical Certificate',
      'Background Check',
      'Cert Pro Final',
    ],
  },
  {
    number: 4,
    title: 'Career Preparation',
    description: 'Kariyer hazırlığı',
    badge: '🚀',
    rewardXp: 2500,
    unitTitles: [
      'CV & Cover Letter',
      'Internships',
      'Interview Basics',
      'STAR Method',
      'Behavioral Questions',
      'Career Quiz',
      'Group Exercises',
      'Salary Negotiation',
      'Industry Networking',
      'A1 Graduate Final',
    ],
  },
  // ===== FAZ 2 (A2 Building) — Modul 5-9 =====
  {
    number: 5,
    title: 'Aviation English Comprehension',
    description: 'Havacılık İngilizcesi anlama',
    badge: '👂',
    rewardXp: 3000,
    unitTitles: [
      'ATC Listening',
      'Cockpit Voice Recordings',
      'Pilot-ATC Dialogues',
      'Multi-accent Practice',
      'Background Noise Training',
      'Listening Quiz',
      'Speech Patterns',
      'Stressed Speech',
      'Emergency Calls',
      'Listening Pro Final',
    ],
  },
  {
    number: 6,
    title: 'Industry Vocabulary Deep',
    description: 'Sektör terminolojisi',
    badge: '📚',
    rewardXp: 3500,
    unitTitles: [
      'Airline Operations Lingo',
      'Maintenance Terms',
      'Manufacturing Terms',
      'Regulatory Terms',
      'Insurance & Legal',
      'Industry Quiz',
      'Finance Terms',
      'IT & Avionics Crossover',
      'Marketing & Sales',
      'Industry Pro Final',
    ],
  },
  {
    number: 7,
    title: 'Aviation Math & Physics',
    description: 'Hesaplama ve fizik',
    badge: '🧮',
    rewardXp: 4000,
    unitTitles: [
      'Speed Calculations',
      'Fuel Burn Math',
      'Weight & Balance Math',
      'Time-Distance-Speed',
      'Conversion Practice',
      'Math Quiz',
      'Trigonometry Basic',
      'Physics of Flight',
      'Performance Charts',
      'Math Pro Final',
    ],
  },
  {
    number: 8,
    title: 'Crisis Management Concepts',
    description: 'Kriz yönetimi kavramları',
    badge: '⚠️',
    rewardXp: 4500,
    unitTitles: [
      'Decision Making',
      'CRM Principles',
      'Threat Recognition',
      'Error Management',
      'Recovery Strategies',
      'Crisis Quiz',
      'Communication Under Stress',
      'Leadership in Crisis',
      'Post-Event Analysis',
      'Crisis Pro Final',
    ],
  },
  {
    number: 9,
    title: 'Career Advanced',
    description: 'İleri kariyer planlama',
    badge: '💼',
    rewardXp: 5000,
    unitTitles: [
      'Long-term Planning',
      'Specialization Paths',
      'International Career',
      'Network Building',
      'Mentorship',
      'Career Quiz',
      'Personal Branding',
      'LinkedIn Optimization',
      'Conference Networking',
      'A2 Graduate Final',
    ],
  },
  // ===== FAZ 3 (B1 Operational) — Modul 10-14 =====
  {
    number: 10,
    title: 'Aviation Documents Reading',
    description: 'Belge ve doküman okuma',
    badge: '📜',
    rewardXp: 6000,
    unitTitles: [
      'AIP Reading',
      'Charts Interpretation',
      'NOTAM Decoding',
      'Tech Log Reading',
      'Maintenance Records',
      'Documents Quiz',
      'AD/SB Reading',
      'Logbook Entries',
      'Audit Reports',
      'Documents Pro Final',
    ],
  },
  {
    number: 11,
    title: 'International Standards',
    description: 'ICAO, EASA, FAA standartları',
    badge: '🌐',
    rewardXp: 7000,
    unitTitles: [
      'ICAO Annexes Overview',
      'EASA Regulations',
      'FAA Regulations',
      'Country Variations',
      'SARPs Differences',
      'Standards Quiz',
      'Type Certification',
      'Operations Spec',
      'Compliance Reporting',
      'Standards Pro Final',
    ],
  },
  {
    number: 12,
    title: 'Aviation Law Basics',
    description: 'Hukuk ve düzenleyici çerçeve',
    badge: '⚖️',
    rewardXp: 8000,
    unitTitles: [
      'Chicago Convention',
      'Tokyo Convention',
      'Montreal Convention',
      'Liability Concepts',
      'Insurance Basics',
      'Law Quiz',
      'Passenger Rights (EU261)',
      'Privacy & Data',
      'Cyber Security Law',
      'Aviation Law Pro Final',
    ],
  },
  {
    number: 13,
    title: 'Sustainability & Future',
    description: 'SAF, elektrikli uçak, otonom',
    badge: '🌱',
    rewardXp: 9000,
    unitTitles: [
      'CORSIA Carbon Offset',
      'SAF Production',
      'Electric Aircraft',
      'eVTOL & UAM',
      'Autonomous Systems',
      'Sustainability Quiz',
      'Net Zero 2050',
      'Hydrogen Aviation',
      'Recycling Aircraft',
      'Future Pro Final',
    ],
  },
  {
    number: 14,
    title: 'Advanced Career Planning',
    description: 'Stratejik kariyer yönetimi',
    badge: '🎯',
    rewardXp: 10000,
    unitTitles: [
      'Career Strategy',
      'International Mobility',
      'Personal Branding',
      'Industry Conferences',
      'Thought Leadership',
      'Career Quiz',
      'Salary Negotiation Advanced',
      'Side Projects',
      'Aviation Influencer',
      'B1 Graduate Final',
    ],
  },
];

function buildModule(template: ModuleTemplate, rolePrefix: string): ModuleNode {
  const moduleId = `${rolePrefix}_m${template.number}`;
  const units: UnitNode[] = template.unitTitles.map((title, idx) => {
    const unitNum = (template.number - 1) * 10 + idx + 1;
    const unitId = `${moduleId}_u${idx + 1}`;
    const isCheckpoint = idx === 5; // 6th unit
    const isFinal = idx === 9; // 10th unit
    const allPremium = idx >= 5; // After unit 6 = premium gate

    const lessons: LessonNode[] = Array.from({ length: 5 }, (_, lIdx) => ({
      id: `${unitId}_l${lIdx + 1}`,
      title: lessonTitleForIdx(title, lIdx, isCheckpoint, isFinal),
      type: lessonTypeForIdx(lIdx, isCheckpoint, isFinal),
      xp: lessonXpForIdx(lIdx, isCheckpoint, isFinal),
      estimatedMinutes: 5 + lIdx,
      isPremium: allPremium,
    }));

    return {
      id: unitId,
      number: unitNum,
      title,
      description: `${template.title} — ${title}`,
      lessons,
      badge: isFinal ? '🏆' : isCheckpoint ? '🎯' : undefined,
    };
  });

  return {
    id: moduleId,
    number: template.number,
    title: template.title,
    description: template.description,
    units,
    badge: template.badge,
    rewardXp: template.rewardXp,
  };
}

function lessonTitleForIdx(unitTitle: string, idx: number, isCheckpoint: boolean, isFinal: boolean): string {
  if (isCheckpoint) {
    const titles = ['Recap Pt 1', 'Recap Pt 2', 'Recap Pt 3', 'Recap Pt 4', 'Big Quiz'];
    return titles[idx] ?? `Lesson ${idx + 1}`;
  }
  if (isFinal) {
    const titles = ['All Recap', 'Voice Roleplay', 'Story Comprehension', 'Pronunciation Master', 'Final Test'];
    return titles[idx] ?? `Lesson ${idx + 1}`;
  }
  return `${unitTitle} ${idx + 1}`;
}

function lessonTypeForIdx(idx: number, isCheckpoint: boolean, isFinal: boolean): LessonNode['type'] {
  if (isCheckpoint || isFinal) return idx === 4 ? 'quiz' : idx === 1 ? 'dialogue' : 'vocabulary';
  if (idx === 4) return 'quiz';
  if (idx === 3) return 'dialogue';
  return 'vocabulary';
}

function lessonXpForIdx(idx: number, isCheckpoint: boolean, isFinal: boolean): number {
  if (isFinal && idx === 4) return 500; // Faz 1 final test
  if (isFinal) return 200;
  if (isCheckpoint) return idx === 4 ? 200 : 100;
  if (idx === 4) return 100; // Quiz
  if (idx === 3) return 60; // Dialog
  return 50; // Standard vocab
}

function buildModulesForRole(templates: ModuleTemplate[], rolePrefix: string): ModuleNode[] {
  return templates.map((t) => buildModule(t, rolePrefix));
}

export const PILOT_MODULES_FAZ1 = buildModulesForRole(PILOT_MODULES, 'pilot');
export const CABIN_MODULES_FAZ1 = buildModulesForRole(CABIN_MODULES, 'cabin');
export const TECHNICIAN_MODULES_FAZ1 = buildModulesForRole(TECHNICIAN_MODULES, 'technician');
export const GROUND_MODULES_FAZ1 = buildModulesForRole(GROUND_MODULES, 'ground');
export const STUDENT_MODULES_FAZ1 = buildModulesForRole(STUDENT_MODULES, 'student');

export function getModulesForRole(role: UserRole | null | undefined): ModuleNode[] {
  switch (role) {
    case 'cabin':
      return CABIN_MODULES_FAZ1;
    case 'technician':
      return TECHNICIAN_MODULES_FAZ1;
    case 'ground':
      return GROUND_MODULES_FAZ1;
    case 'student':
      return STUDENT_MODULES_FAZ1;
    case 'pilot':
    default:
      return PILOT_MODULES_FAZ1;
  }
}

// Backwards compatibility — eski ekranlar PILOT_MODULE_1 expect ediyor
export const PILOT_MODULE_1 = PILOT_MODULES_FAZ1[0]!;

export function isUnitUnlocked(
  module: ModuleNode,
  unitIndex: number,
  completedLessons: Set<string>,
): boolean {
  if (unitIndex === 0) return true;
  const previousUnit = module.units[unitIndex - 1];
  if (!previousUnit) return true;
  return previousUnit.lessons.every((l) => completedLessons.has(l.id));
}

export function getUnitProgress(
  unit: UnitNode,
  completedLessons: Set<string>,
): { completed: number; total: number; percent: number } {
  const total = unit.lessons.length;
  const completed = unit.lessons.filter((l) => completedLessons.has(l.id)).length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function isModuleUnlocked(
  modules: ModuleNode[],
  moduleIdx: number,
  completedLessons: Set<string>,
): boolean {
  if (moduleIdx === 0) return true;
  const previous = modules[moduleIdx - 1];
  if (!previous) return true;
  // Önceki modülün ilk 5 ünitesi tamam mı? (premium dışı)
  return previous.units.slice(0, 5).every((u) =>
    u.lessons.every((l) => completedLessons.has(l.id)),
  );
}

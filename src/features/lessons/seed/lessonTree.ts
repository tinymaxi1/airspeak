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

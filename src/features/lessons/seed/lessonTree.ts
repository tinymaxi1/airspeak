/**
 * Pilot Faz 1 Modul 1 — "Cockpit & Aircraft Basics" ders ağacı.
 * Sprint 9'da tüm 26 modül üretilecek; bu MVP için.
 */

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
  badge?: string; // emoji
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

export const PILOT_MODULE_1: ModuleNode = {
  id: 'pilot_m1',
  number: 1,
  title: 'Cockpit & Aircraft Basics',
  description: 'Uçak temel parçaları ve kokpit bileşenleri',
  badge: '🛩️',
  rewardXp: 1000,
  units: [
    {
      id: 'pilot_m1_u1',
      number: 1,
      title: 'Aircraft Anatomy',
      description: 'Uçak temel parçaları',
      lessons: [
        { id: 'pilot_m1_u1_l1', title: 'Main Aircraft Parts', type: 'vocabulary', xp: 50, estimatedMinutes: 5, isPremium: false },
        { id: 'pilot_m1_u1_l2', title: 'Cockpit Position', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: false },
        { id: 'pilot_m1_u1_l3', title: 'Wings & Function', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: false },
        { id: 'pilot_m1_u1_l4', title: 'Tail & Empennage', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: false },
        { id: 'pilot_m1_u1_l5', title: 'Quiz: Anatomy Recap', type: 'quiz', xp: 100, estimatedMinutes: 5, isPremium: false },
      ],
    },
    {
      id: 'pilot_m1_u2',
      number: 2,
      title: 'Cockpit Components',
      description: 'Kontrol kolu, gaz, aletler',
      lessons: [
        { id: 'pilot_m1_u2_l1', title: 'Main Flight Controls', type: 'vocabulary', xp: 50, estimatedMinutes: 5, isPremium: false },
        { id: 'pilot_m1_u2_l2', title: 'Primary Instruments', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: false },
        { id: 'pilot_m1_u2_l3', title: 'Engine Instruments', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: false },
        { id: 'pilot_m1_u2_l4', title: 'Comm & Nav Panels', type: 'dialogue', xp: 60, estimatedMinutes: 7, isPremium: false },
        { id: 'pilot_m1_u2_l5', title: 'Quiz: Components', type: 'quiz', xp: 100, estimatedMinutes: 5, isPremium: false },
      ],
    },
    {
      id: 'pilot_m1_u3',
      number: 3,
      title: 'Engine Basics',
      description: 'Jet, turboprop, çalıştırma',
      lessons: [
        { id: 'pilot_m1_u3_l1', title: 'Engine Types', type: 'vocabulary', xp: 50, estimatedMinutes: 5, isPremium: false },
        { id: 'pilot_m1_u3_l2', title: 'Jet Engine Components', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: false },
        { id: 'pilot_m1_u3_l3', title: 'Engine Start Procedure', type: 'dialogue', xp: 60, estimatedMinutes: 7, isPremium: false },
        { id: 'pilot_m1_u3_l4', title: 'Engine Indications', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: false },
        { id: 'pilot_m1_u3_l5', title: 'Quiz: Engine', type: 'quiz', xp: 100, estimatedMinutes: 5, isPremium: false },
      ],
    },
    {
      id: 'pilot_m1_u4',
      number: 4,
      title: 'Landing Gear & Brakes',
      description: 'İniş takımı, frenler',
      lessons: [
        { id: 'pilot_m1_u4_l1', title: 'Gear Types', type: 'vocabulary', xp: 50, estimatedMinutes: 5, isPremium: false },
        { id: 'pilot_m1_u4_l2', title: 'Gear Operation', type: 'dialogue', xp: 60, estimatedMinutes: 7, isPremium: false },
        { id: 'pilot_m1_u4_l3', title: 'Brakes Basics', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: false },
        { id: 'pilot_m1_u4_l4', title: 'Tire & Wheel', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: false },
        { id: 'pilot_m1_u4_l5', title: 'Quiz: Gear', type: 'quiz', xp: 100, estimatedMinutes: 5, isPremium: false },
      ],
    },
    {
      id: 'pilot_m1_u5',
      number: 5,
      title: 'Wings & Control Surfaces',
      description: 'Kanat, flap, spoiler',
      lessons: [
        { id: 'pilot_m1_u5_l1', title: 'Lift Generation', type: 'vocabulary', xp: 50, estimatedMinutes: 5, isPremium: false },
        { id: 'pilot_m1_u5_l2', title: 'Flap Operation', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: false },
        { id: 'pilot_m1_u5_l3', title: 'Spoilers & Speedbrakes', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: false },
        { id: 'pilot_m1_u5_l4', title: 'Slats & Leading Edge', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: false },
        { id: 'pilot_m1_u5_l5', title: 'Quiz: Wings', type: 'quiz', xp: 100, estimatedMinutes: 5, isPremium: false },
      ],
      badge: '🌟',
    },
    {
      id: 'pilot_m1_u6',
      number: 6,
      title: 'Mid-Module Checkpoint',
      description: 'Tekrar quiz — premium duvarı',
      lessons: [
        { id: 'pilot_m1_u6_l1', title: 'Anatomy Recap', type: 'quiz', xp: 100, estimatedMinutes: 6, isPremium: true },
        { id: 'pilot_m1_u6_l2', title: 'Cockpit Recap', type: 'quiz', xp: 100, estimatedMinutes: 6, isPremium: true },
        { id: 'pilot_m1_u6_l3', title: 'Engine Recap', type: 'quiz', xp: 100, estimatedMinutes: 6, isPremium: true },
        { id: 'pilot_m1_u6_l4', title: 'Gear Recap', type: 'quiz', xp: 100, estimatedMinutes: 6, isPremium: true },
        { id: 'pilot_m1_u6_l5', title: 'Big Quiz Challenge', type: 'quiz', xp: 200, estimatedMinutes: 10, isPremium: true },
      ],
    },
    {
      id: 'pilot_m1_u7',
      number: 7,
      title: 'Fuel System Basics',
      description: 'Yakıt sistemi',
      lessons: [
        { id: 'pilot_m1_u7_l1', title: 'Fuel Types', type: 'vocabulary', xp: 50, estimatedMinutes: 5, isPremium: true },
        { id: 'pilot_m1_u7_l2', title: 'Fuel Tanks', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: true },
        { id: 'pilot_m1_u7_l3', title: 'Fuel Quantity', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: true },
        { id: 'pilot_m1_u7_l4', title: 'Refueling Procedure', type: 'dialogue', xp: 60, estimatedMinutes: 7, isPremium: true },
        { id: 'pilot_m1_u7_l5', title: 'Quiz: Fuel', type: 'quiz', xp: 100, estimatedMinutes: 5, isPremium: true },
      ],
    },
    {
      id: 'pilot_m1_u8',
      number: 8,
      title: 'Electrical System Basics',
      description: 'Elektrik sistemi',
      lessons: [
        { id: 'pilot_m1_u8_l1', title: 'Power Sources', type: 'vocabulary', xp: 50, estimatedMinutes: 5, isPremium: true },
        { id: 'pilot_m1_u8_l2', title: 'Buses & Distribution', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: true },
        { id: 'pilot_m1_u8_l3', title: 'Inverter & Transformer', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: true },
        { id: 'pilot_m1_u8_l4', title: 'Electrical Failures', type: 'dialogue', xp: 60, estimatedMinutes: 7, isPremium: true },
        { id: 'pilot_m1_u8_l5', title: 'Quiz: Electrical', type: 'quiz', xp: 100, estimatedMinutes: 5, isPremium: true },
      ],
    },
    {
      id: 'pilot_m1_u9',
      number: 9,
      title: 'Hydraulic System Basics',
      description: 'Hidrolik sistemi',
      lessons: [
        { id: 'pilot_m1_u9_l1', title: 'Hydraulic Function', type: 'vocabulary', xp: 50, estimatedMinutes: 5, isPremium: true },
        { id: 'pilot_m1_u9_l2', title: 'Pumps', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: true },
        { id: 'pilot_m1_u9_l3', title: 'Pressure & Reservoir', type: 'vocabulary', xp: 50, estimatedMinutes: 6, isPremium: true },
        { id: 'pilot_m1_u9_l4', title: 'Hydraulic Failures', type: 'dialogue', xp: 60, estimatedMinutes: 7, isPremium: true },
        { id: 'pilot_m1_u9_l5', title: 'Quiz: Hydraulic', type: 'quiz', xp: 100, estimatedMinutes: 5, isPremium: true },
      ],
    },
    {
      id: 'pilot_m1_u10',
      number: 10,
      title: 'Cockpit Master — Final Test',
      description: 'Modül recap + Cockpit Master rozeti',
      badge: '🏆',
      lessons: [
        { id: 'pilot_m1_u10_l1', title: 'All Systems Recap', type: 'quiz', xp: 100, estimatedMinutes: 8, isPremium: true },
        { id: 'pilot_m1_u10_l2', title: 'Cockpit Voice Roleplay', type: 'dialogue', xp: 200, estimatedMinutes: 10, isPremium: true },
        { id: 'pilot_m1_u10_l3', title: 'Aviation Story Comprehension', type: 'listening', xp: 100, estimatedMinutes: 8, isPremium: true },
        { id: 'pilot_m1_u10_l4', title: 'Pronunciation Master Drill', type: 'pronunciation', xp: 200, estimatedMinutes: 10, isPremium: true },
        { id: 'pilot_m1_u10_l5', title: 'Module 1 Final Test', type: 'quiz', xp: 500, estimatedMinutes: 30, isPremium: true },
      ],
    },
  ],
};

/**
 * Helper: bir ünitenin kilidi açık mı?
 * Önceki ünite tamamlanmadıysa kilitli.
 */
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

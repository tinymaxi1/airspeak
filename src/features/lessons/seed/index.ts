/**
 * Vocabulary seed exports — rol bazlı erişim için tek nokta.
 * 5 rol × 60 terim = 300 toplam vocab.
 */
import { PILOT_VOCAB_FAZ1 } from './pilotVocab';
import { CABIN_VOCAB_FAZ1 } from './cabinVocab';
import { TECHNICIAN_VOCAB_FAZ1 } from './technicianVocab';
import { GROUND_VOCAB_FAZ1 } from './groundVocab';
import { STUDENT_VOCAB_FAZ1 } from './studentVocab';
import type { VocabularyTerm } from './pilotVocab';
import type { UserRole } from '@/types/profile';

export {
  PILOT_VOCAB_FAZ1,
  CABIN_VOCAB_FAZ1,
  TECHNICIAN_VOCAB_FAZ1,
  GROUND_VOCAB_FAZ1,
  STUDENT_VOCAB_FAZ1,
};
export type { VocabularyTerm };

export function getVocabForRole(role: UserRole | null | undefined): VocabularyTerm[] {
  switch (role) {
    case 'cabin':
      return CABIN_VOCAB_FAZ1;
    case 'technician':
      return TECHNICIAN_VOCAB_FAZ1;
    case 'ground':
      return GROUND_VOCAB_FAZ1;
    case 'student':
      return STUDENT_VOCAB_FAZ1;
    case 'pilot':
    default:
      return PILOT_VOCAB_FAZ1;
  }
}

export const ALL_VOCAB: VocabularyTerm[] = [
  ...PILOT_VOCAB_FAZ1,
  ...CABIN_VOCAB_FAZ1,
  ...TECHNICIAN_VOCAB_FAZ1,
  ...GROUND_VOCAB_FAZ1,
  ...STUDENT_VOCAB_FAZ1,
];

export const VOCAB_STATS = {
  pilot: PILOT_VOCAB_FAZ1.length,
  cabin: CABIN_VOCAB_FAZ1.length,
  technician: TECHNICIAN_VOCAB_FAZ1.length,
  ground: GROUND_VOCAB_FAZ1.length,
  student: STUDENT_VOCAB_FAZ1.length,
  total: ALL_VOCAB.length,
};

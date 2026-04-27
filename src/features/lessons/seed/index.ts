/**
 * Vocabulary seed exports — rol bazlı erişim için tek nokta.
 */
import { PILOT_VOCAB_FAZ1 } from './pilotVocab';
import { CABIN_VOCAB_FAZ1 } from './cabinVocab';
import { TECHNICIAN_VOCAB_FAZ1 } from './technicianVocab';
import type { VocabularyTerm } from './pilotVocab';
import type { UserRole } from '@/types/profile';

export { PILOT_VOCAB_FAZ1, CABIN_VOCAB_FAZ1, TECHNICIAN_VOCAB_FAZ1 };
export type { VocabularyTerm };

export function getVocabForRole(role: UserRole | null | undefined): VocabularyTerm[] {
  switch (role) {
    case 'cabin':
      return CABIN_VOCAB_FAZ1;
    case 'technician':
      return TECHNICIAN_VOCAB_FAZ1;
    case 'pilot':
    case 'ground':
    case 'student':
    default:
      return PILOT_VOCAB_FAZ1;
  }
}

export const ALL_VOCAB: VocabularyTerm[] = [
  ...PILOT_VOCAB_FAZ1,
  ...CABIN_VOCAB_FAZ1,
  ...TECHNICIAN_VOCAB_FAZ1,
];

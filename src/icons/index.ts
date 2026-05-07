/**
 * AirSpeak Icon Registry — Phase 12
 *
 * Usage:
 *   import { AspIcon } from '@/icons';
 *   <AspIcon name="mic" size={24} color="#0E1116" />
 *   <AspIcon name="heart" filled color="#E63946" />
 *
 * Custom registry: 50+ aviation-flavored icons (1.75px stroke)
 * Lucide fallback: lucide-react-native'a düşer (custom'da yoksa)
 *
 * v1.1: Phase 1-11'deki emoji'ler toplu refactor edilecek (örn. <Text>🎙</Text>
 * → <AspIcon name="mic" />). Bu Phase 12 sadece registry shell sağlar.
 */
export { AspIcon } from './AspIcon';
export type { AspIconName, AspIconProps } from './AspIcon';

/**
 * Havayolu mülakat profili — bölge bazlı sektör bilgisi.
 *
 * Her havayolu: temel bilgi + rol bazlı mülakat süreci + sample sorular.
 * Kullanıcı havayolunu seçer → mülakat aşamalarını görür → soru bankasında pratik yapar.
 */
import type { UserRole, Level } from '@/types/profile';

export type AirlineRegion =
  | 'turkey'
  | 'middle-east'
  | 'europe-fsc' // Full Service Carrier
  | 'europe-lcc' // Low Cost Carrier
  | 'asia'
  | 'americas'
  | 'oceania'
  | 'africa';

export type AirlineTier =
  | 'flagship' // Bayrak taşıyıcı / büyük FSC
  | 'major' // Büyük operatör
  | 'lcc' // Düşük maliyet
  | 'regional' // Bölgesel
  | 'cargo'; // Kargo odaklı

export interface InterviewStage {
  id: string;
  titleTr: string;
  titleEn: string;
  durationMinutes: number;
  format: 'online_form' | 'video_interview' | 'group' | 'one_on_one' | 'panel' | 'sim_check' | 'psychometric' | 'medical' | 'assessment_day' | 'role_play' | 'reading_aloud' | 'english_test';
  descriptionTr: string;
  passingTipsTr: string[];
}

export interface RoleInterview {
  role: UserRole;
  /** Mülakat İngilizce ağırlığı (0-100) — ne kadar İngilizce eleyici? */
  englishWeight: number;
  /** Minimum gerekli seviye */
  requiredLevel: Level;
  /** Tipik süreç süresi (gün) */
  totalProcessDays: number;
  stages: InterviewStage[];
  /** Bu role özel sıkça sorulan soru ID'leri (bankada eşleşir) */
  commonQuestionIds: string[];
  /** Başarı oranı (~%) */
  successRatePercent: number;
  /** Aktif işe alıyor mu? */
  hiringStatus: 'open' | 'closed' | 'open_day_only' | 'experienced_only';
  applicationUrl?: string;
  averageSalaryTryK?: number; // bin TL
  perks?: string[];
}

export interface AirlineProfile {
  id: string;
  name: string;
  /** IATA 2-harf kodu */
  iataCode: string;
  /** ICAO 3-harf kodu */
  icaoCode: string;
  country: string;
  countryEmoji: string;
  region: AirlineRegion;
  tier: AirlineTier;
  hub: string; // ana hub şehir + havaalanı
  fleetSize: number;
  destinations: number;
  employeeCount: number;
  /** Şirket dili — mülakat tamamen bu dilde olabilir */
  primaryLanguage: 'English' | 'Turkish' | 'Arabic' | 'German' | 'French' | 'Italian' | 'Spanish' | 'Portuguese' | 'Dutch' | 'Polish' | 'Greek' | 'Swedish' | 'Finnish' | 'Hungarian';
  /** Genel prestij (1-5) */
  prestige: 1 | 2 | 3 | 4 | 5;
  /** Yurtdışı kabin için zorunlu mu (skin color, height, swim test vb.) */
  hasMedicalRequirements: boolean;
  swimTestRequired: boolean;
  heightRequirementCm?: { min: number; max: number };
  reachRequirementCm?: number;
  /** Rol bazlı mülakat detayı */
  interviews: RoleInterview[];
  /** Şirket özet açıklama */
  descriptionTr: string;
  /** Mülakat ipucu */
  insiderTipTr: string;
  websiteUrl: string;
}

export interface InterviewQuestion {
  id: string;
  category: 'icebreaker' | 'motivation' | 'technical' | 'behavioral' | 'situational' | 'english' | 'company_knowledge' | 'group_exercise' | 'role_play' | 'cv_based' | 'tricky';
  /** Hangi rolde sorulur */
  roles: UserRole[];
  /** Hangi havayolu tarzı (genel veya spesifik) */
  airlineIds: string[]; // boş = tüm havayolları
  /** Tier ipucu — bayrak vs LCC farkı */
  tier?: AirlineTier;
  question: string;
  context?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Beklenen iyi cevap özelliği */
  goodAnswerPointsTr: string[];
  /** Yapılmaması gerekenler */
  redFlagsTr: string[];
  /** Örnek STAR cevap (Situation-Task-Action-Result) */
  sampleAnswerTr?: string;
  /** İngilizce için: model cevap */
  modelAnswerEn?: string;
  /** Cevap için ipuçları */
  tipsTr: string[];
}

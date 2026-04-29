/**
 * ICAO Level 4 Sözlü Sınav — AI Examiner Prompt Bankası
 *
 * 4 görev tipi (ICAO Doc 9835 referans):
 *   1. picture_description (5 dk) — uçuş/havacılık görseli betimle + soru-cevap
 *   2. story_telling (7 dk) — geçmiş havacılık olayı/deneyim anlat
 *   3. problem_solving (7 dk) — abnormal/emergency senaryo, çözüm konuş
 *   4. common_topics (6 dk) — havacılık genel konularda sohbet
 *
 * Her prompt:
 *   - prompt: AI examiner'ın açılış sorusu
 *   - imageHint: picture_description için (placeholder; production'da CDN URL)
 *   - followUps: 2-3 olası takip sorusu
 *   - expectedTopics: cevapta beklenen anahtar konular (rubric için)
 *   - difficultyHint: B1 / B2 (ICAO 4 hedef minimum B2)
 *
 * Sprint 7 — toplam 30 prompt (8 + 8 + 8 + 6 dağılım).
 */
import type { Level } from '@/types/profile';

export type OralExamTaskType =
  | 'picture_description'
  | 'story_telling'
  | 'problem_solving'
  | 'common_topics';

export interface OralExamPrompt {
  id: string;
  taskType: OralExamTaskType;
  prompt: string;
  /** Picture task için resim betimi (gerçek görsel CDN'den gelecek) */
  imageHint?: string;
  /** AI examiner takip soruları — kullanıcı dururken sorulacak */
  followUps: string[];
  /** Rubric değerlendirmede beklenen konular */
  expectedTopics: string[];
  difficultyHint: Level;
  /** Hangi sektörü/bağlamı vurguluyor */
  context?: string;
}

export const ORAL_EXAM_PROMPTS: OralExamPrompt[] = [
  // ═══════════════════════════════════════════════════════════
  //  1. PICTURE DESCRIPTION (8) — 5 dakika her biri
  // ═══════════════════════════════════════════════════════════
  {
    id: 'oral_pic_01',
    taskType: 'picture_description',
    prompt: 'Look at this picture of a busy airport ramp. Describe what you see and what is happening. You have one minute to prepare, then please speak for two minutes.',
    imageHint: 'Wide-body aircraft at a gate, ground vehicles (catering truck, fuel truck, baggage tractor) around it, marshaller with paddles, cargo loaders. Day-time, clear weather.',
    followUps: [
      'Which ground operation appears most safety-critical here?',
      'What could go wrong during a turnaround like this?',
      'How does ground crew communicate during these operations?',
    ],
    expectedTopics: ['ramp safety', 'turnaround', 'GSE', 'marshalling', 'wing-tip clearance', 'FOD'],
    difficultyHint: 'B2',
    context: 'Ground operations',
  },
  {
    id: 'oral_pic_02',
    taskType: 'picture_description',
    prompt: 'This image shows a cockpit during cruise flight. Describe the scene and what the crew might be doing.',
    imageHint: 'Two pilots at controls, glass cockpit displays showing FL370, autopilot engaged, navigation display with route, sunny sky outside.',
    followUps: [
      'Which instrument would you check first if the autopilot disconnects?',
      'How do pilots stay alert during long cruise legs?',
      'What kind of communication happens during cruise?',
    ],
    expectedTopics: ['cruise phase', 'autopilot', 'PFD', 'ND', 'crew duties', 'monitoring'],
    difficultyHint: 'B2',
    context: 'Flight deck',
  },
  {
    id: 'oral_pic_03',
    taskType: 'picture_description',
    prompt: 'Describe what you see in this cabin emergency scenario. What are the cabin crew doing?',
    imageHint: 'Cabin crew assisting passenger with oxygen mask, dim cabin lighting, several passengers wearing masks, drop-down panels visible.',
    followUps: [
      'What would you say in the public address announcement?',
      'How does cabin crew prioritize during decompression?',
      'When can crew leave their seats?',
    ],
    expectedTopics: ['decompression', 'oxygen mask', 'PA announcement', 'passenger management', 'cabin crew duties'],
    difficultyHint: 'B2',
    context: 'Cabin emergency',
  },
  {
    id: 'oral_pic_04',
    taskType: 'picture_description',
    prompt: 'Look at this maintenance scene. Describe what the technicians are doing and the environment.',
    imageHint: 'Two technicians on a stand inspecting an open engine cowling, AMM open on a tablet, hangar setting, tools laid out on FOD-controlled mat.',
    followUps: [
      'Why is FOD control important during this work?',
      'What documentation must they complete after the inspection?',
      'How do mechanics ensure they reinstall every part correctly?',
    ],
    expectedTopics: ['maintenance', 'engine inspection', 'FOD prevention', 'AMM', 'documentation', 'tool control'],
    difficultyHint: 'B2',
    context: 'Maintenance',
  },
  {
    id: 'oral_pic_05',
    taskType: 'picture_description',
    prompt: 'The picture shows a runway during heavy weather. Describe the conditions and what an arriving pilot would consider.',
    imageHint: 'Wet runway, rain visible in air, low cloud base, lights on, an aircraft on short final with landing lights illuminated.',
    followUps: [
      'What weather phenomena could threaten this landing?',
      'When would the captain consider a go-around?',
      'How does crosswind affect landing decisions?',
    ],
    expectedTopics: ['adverse weather', 'wet runway', 'crosswind', 'visibility', 'go-around', 'braking action'],
    difficultyHint: 'B2',
    context: 'Weather operations',
  },
  {
    id: 'oral_pic_06',
    taskType: 'picture_description',
    prompt: 'Describe this passenger boarding scene. What different roles do you see and what are they doing?',
    imageHint: 'Gate area, passenger queue, gate agent at podium scanning boarding passes, jet bridge connected to aircraft, cabin crew greeting at door.',
    followUps: [
      'What problems can come up during boarding?',
      'How do gate agents and cabin crew coordinate?',
      'What documents do passengers need at this stage?',
    ],
    expectedTopics: ['boarding', 'gate operations', 'passenger handling', 'documentation', 'coordination'],
    difficultyHint: 'B1',
    context: 'Passenger services',
  },
  {
    id: 'oral_pic_07',
    taskType: 'picture_description',
    prompt: 'You see a control tower interior. Describe what the controllers are doing and the equipment they are using.',
    imageHint: 'ATC tower with two controllers, radar screens, strip board, headsets, large windows showing runway and aircraft on ground.',
    followUps: [
      'What is the difference between ground and tower controllers?',
      'How do controllers coordinate with pilots in poor visibility?',
      'What is a flight progress strip used for?',
    ],
    expectedTopics: ['ATC', 'radar', 'flight strips', 'tower / ground roles', 'visual separation', 'coordination'],
    difficultyHint: 'B2',
    context: 'Air Traffic Control',
  },
  {
    id: 'oral_pic_08',
    taskType: 'picture_description',
    prompt: 'Look at this de-icing operation. Describe what is happening and why it is critical.',
    imageHint: 'Aircraft at de-icing pad in winter, two cherry pickers spraying orange Type IV fluid on wings, snow on ground, aircraft engines running.',
    followUps: [
      'What is the difference between de-icing and anti-icing?',
      'How long does the holdover time last?',
      'Why must wings be clean before takeoff?',
    ],
    expectedTopics: ['de-icing', 'anti-icing', 'holdover time', 'Type I/II/IV fluid', 'contaminated wings', 'takeoff performance'],
    difficultyHint: 'B2',
    context: 'Winter operations',
  },

  // ═══════════════════════════════════════════════════════════
  //  2. STORY TELLING (8) — 7 dakika her biri
  // ═══════════════════════════════════════════════════════════
  {
    id: 'oral_sto_01',
    taskType: 'story_telling',
    prompt: 'Tell me about a flight or aviation experience that did not go as planned. What happened, how did the crew respond, and what was the outcome?',
    followUps: [
      'What lesson did you take from that experience?',
      'How would the crew prevent it next time?',
      'Did anyone speak up about a concern early on?',
    ],
    expectedTopics: ['narrative structure', 'past tenses', 'sequence connectors', 'crew action', 'outcome', 'lesson learned'],
    difficultyHint: 'B2',
  },
  {
    id: 'oral_sto_02',
    taskType: 'story_telling',
    prompt: 'Describe a time you witnessed or read about good crew resource management. What did the crew do well?',
    followUps: [
      'What CRM principles did you observe?',
      'How would you apply this in your own role?',
      'What happens when CRM breaks down?',
    ],
    expectedTopics: ['CRM', 'communication', 'leadership', 'decision making', 'situation awareness', 'workload management'],
    difficultyHint: 'B2',
  },
  {
    id: 'oral_sto_03',
    taskType: 'story_telling',
    prompt: 'Tell me about a difficult passenger situation in aviation that you have heard about or experienced. How was it handled?',
    followUps: [
      'What de-escalation techniques work best?',
      'When should the crew involve the captain?',
      'How does cabin crew protect other passengers?',
    ],
    expectedTopics: ['unruly passenger', 'de-escalation', 'cabin crew authority', 'captain notification', 'restraint procedures', 'reporting'],
    difficultyHint: 'B2',
  },
  {
    id: 'oral_sto_04',
    taskType: 'story_telling',
    prompt: 'Describe a famous aviation incident you know well. What were the contributing factors?',
    followUps: [
      'What technical and human factors were involved?',
      'What changes did the industry make as a result?',
      'How is this case taught today?',
    ],
    expectedTopics: ['accident analysis', 'contributing factors', 'human factors', 'safety improvements', 'investigation', 'industry response'],
    difficultyHint: 'B2',
  },
  {
    id: 'oral_sto_05',
    taskType: 'story_telling',
    prompt: 'Tell me about a flight where weather played a significant role. What decisions had to be made?',
    followUps: [
      'How did the crew gather weather information?',
      'What were the alternatives considered?',
      'What was the final decision and why?',
    ],
    expectedTopics: ['weather avoidance', 'METAR/TAF', 'diversion decision', 'fuel planning', 'alternate', 'pilot judgment'],
    difficultyHint: 'B2',
  },
  {
    id: 'oral_sto_06',
    taskType: 'story_telling',
    prompt: 'Describe a memorable training or check ride experience in aviation. What did you learn?',
    followUps: [
      'What was the most challenging part?',
      'How did you prepare?',
      'What feedback stuck with you?',
    ],
    expectedTopics: ['training narrative', 'simulator', 'debrief', 'self-assessment', 'continuous learning', 'check ride'],
    difficultyHint: 'B1',
  },
  {
    id: 'oral_sto_07',
    taskType: 'story_telling',
    prompt: 'Tell me about a safety report or hazard you read about that helped prevent an accident.',
    followUps: [
      'Why is reporting important?',
      'How does just culture support reporting?',
      'What action came from the report?',
    ],
    expectedTopics: ['safety reporting', 'just culture', 'ASR / MOR', 'hazard identification', 'preventive action', 'culture'],
    difficultyHint: 'B2',
  },
  {
    id: 'oral_sto_08',
    taskType: 'story_telling',
    prompt: 'Describe a challenging moment in your aviation career or studies. How did you handle pressure?',
    followUps: [
      'What kept you focused?',
      'Did you ask for help?',
      'What would you do differently now?',
    ],
    expectedTopics: ['stress management', 'help-seeking', 'reflection', 'resilience', 'self-development', 'lesson learned'],
    difficultyHint: 'B1',
  },

  // ═══════════════════════════════════════════════════════════
  //  3. PROBLEM SOLVING (8) — 7 dakika her biri
  // ═══════════════════════════════════════════════════════════
  {
    id: 'oral_pro_01',
    taskType: 'problem_solving',
    prompt: 'Imagine you are on approach when ATC informs you that the runway has just been closed because of disabled aircraft. You have 30 minutes of fuel remaining and one alternate 80 NM away. Walk me through your decision.',
    followUps: [
      'What do you communicate to ATC and your crew?',
      'How do you prioritize your actions?',
      'What if the alternate weather is also marginal?',
    ],
    expectedTopics: ['fuel emergency', 'alternate selection', 'ATC communication', 'CRM', 'decision making', 'PAN / MAYDAY'],
    difficultyHint: 'B2',
    context: 'In-flight emergency',
  },
  {
    id: 'oral_pro_02',
    taskType: 'problem_solving',
    prompt: 'You notice a small smoke smell in the cabin during cruise. As cabin crew, what do you do? What if the smoke increases?',
    followUps: [
      'How do you communicate with the flight deck?',
      'What equipment would you use?',
      'How do you manage passengers?',
    ],
    expectedTopics: ['smoke / fire procedure', 'PBE', 'communication with flight deck', 'extinguisher use', 'passenger calming', 'evacuation prep'],
    difficultyHint: 'B2',
    context: 'Cabin smoke',
  },
  {
    id: 'oral_pro_03',
    taskType: 'problem_solving',
    prompt: 'A passenger collapses during the flight and is unresponsive. You are the senior cabin crew. Walk me through your response.',
    followUps: [
      'When would you call for a medical professional from passengers?',
      'What information must you give to medical authorities on the ground?',
      'When is a diversion warranted?',
    ],
    expectedTopics: ['medical emergency', 'AED', 'CPR', 'medical link service', 'PAN PAN', 'diversion criteria', 'reporting'],
    difficultyHint: 'B2',
    context: 'Medical emergency',
  },
  {
    id: 'oral_pro_04',
    taskType: 'problem_solving',
    prompt: 'You are a technician releasing an aircraft for departure when the captain refuses, citing a concern about a system. How do you handle this?',
    followUps: [
      'What documents would you reference?',
      'When would you escalate?',
      'How do you preserve a professional relationship?',
    ],
    expectedTopics: ['captain authority', 'AMM / MEL reference', 'escalation', 'professional communication', 'documentation', 'just culture'],
    difficultyHint: 'B2',
    context: 'Pre-departure dispute',
  },
  {
    id: 'oral_pro_05',
    taskType: 'problem_solving',
    prompt: 'During pushback, the marshaller signals stop urgently. As ground crew, what is your immediate response?',
    followUps: [
      'How do you communicate with the cockpit?',
      'What might cause an emergency stop?',
      'How do you ensure no one is hit during a stop?',
    ],
    expectedTopics: ['emergency stop signal', 'headset communication', 'wing-tip / tail clearance', 'pedestrian safety', 'GSE coordination', 'reporting'],
    difficultyHint: 'B1',
    context: 'Ramp safety',
  },
  {
    id: 'oral_pro_06',
    taskType: 'problem_solving',
    prompt: 'A passenger arrives at the gate with expired travel documents 10 minutes before boarding closes. As gate agent, what do you do?',
    followUps: [
      'What policies must you follow?',
      'How do you explain a denial to the passenger?',
      'When would you involve a supervisor?',
    ],
    expectedTopics: ['document check', 'denied boarding', 'rebooking options', 'customer service', 'escalation', 'IATA rules'],
    difficultyHint: 'B1',
    context: 'Passenger handling',
  },
  {
    id: 'oral_pro_07',
    taskType: 'problem_solving',
    prompt: 'During cruise, you receive a TCAS Resolution Advisory. ATC has just given you a heading change. What do you do?',
    followUps: [
      'What does the standard phraseology say?',
      'How do you report afterwards?',
      'How does the rest of the crew support you?',
    ],
    expectedTopics: ['TCAS RA priority', 'autopilot disconnect', 'follow RA', 'TCAS phraseology', 'report to ATC', 'crew workload'],
    difficultyHint: 'B2',
    context: 'Traffic conflict',
  },
  {
    id: 'oral_pro_08',
    taskType: 'problem_solving',
    prompt: 'You arrive at the aircraft for pre-flight and notice fluid leaking from the wing area. As pilot or technician, walk me through your next steps.',
    followUps: [
      'How do you identify what kind of fluid it is?',
      'When does this become a no-go item?',
      'What documentation do you complete?',
    ],
    expectedTopics: ['fluid identification', 'fuel vs hydraulic vs water', 'AMM consultation', 'go / no-go', 'tech log', 'maintenance call'],
    difficultyHint: 'B2',
    context: 'Pre-flight discovery',
  },

  // ═══════════════════════════════════════════════════════════
  //  4. COMMON TOPICS (6) — 6 dakika her biri
  // ═══════════════════════════════════════════════════════════
  {
    id: 'oral_top_01',
    taskType: 'common_topics',
    prompt: 'How has aviation changed over the last 20 years, and what changes do you expect in the next 10?',
    followUps: [
      'What role does technology play?',
      'How is sustainability shaping the industry?',
      'What skills will be most important for new entrants?',
    ],
    expectedTopics: ['industry change', 'automation', 'sustainability / SAF', 'electric / hydrogen aircraft', 'workforce skills', 'AI in aviation'],
    difficultyHint: 'B2',
  },
  {
    id: 'oral_top_02',
    taskType: 'common_topics',
    prompt: 'What do you think is the most important factor in aviation safety?',
    followUps: [
      'How does culture influence safety?',
      'What is the role of training?',
      'How does technology contribute?',
    ],
    expectedTopics: ['safety culture', 'training', 'reporting systems', 'human factors', 'redundancy', 'just culture'],
    difficultyHint: 'B2',
  },
  {
    id: 'oral_top_03',
    taskType: 'common_topics',
    prompt: 'Compare flying for a flag carrier and a low-cost airline. What are the differences in your role?',
    followUps: [
      'What are the trade-offs for the crew?',
      'How does it affect passenger experience?',
      'Which would you prefer to work for, and why?',
    ],
    expectedTopics: ['flag carrier vs LCC', 'rotation patterns', 'service standards', 'turnaround time', 'employment terms', 'career path'],
    difficultyHint: 'B2',
  },
  {
    id: 'oral_top_04',
    taskType: 'common_topics',
    prompt: 'Why is English the international language of aviation, and what challenges does it create?',
    followUps: [
      'How do non-native speakers manage operationally?',
      'What standards exist for English proficiency?',
      'When does language cause safety issues?',
    ],
    expectedTopics: ['ICAO English', 'standardized phraseology', 'L4 requirement', 'language challenges', 'misunderstanding incidents', 'training'],
    difficultyHint: 'B2',
  },
  {
    id: 'oral_top_05',
    taskType: 'common_topics',
    prompt: 'What is your view on the work-life balance for aviation professionals?',
    followUps: [
      'How do you manage fatigue?',
      'What support do airlines provide?',
      'How does seniority change the picture?',
    ],
    expectedTopics: ['rostering', 'fatigue management', 'FTL', 'family life', 'health', 'seniority benefits'],
    difficultyHint: 'B1',
  },
  {
    id: 'oral_top_06',
    taskType: 'common_topics',
    prompt: 'Describe what you find most rewarding and most challenging about your role in aviation.',
    followUps: [
      'How has this evolved for you?',
      'What advice would you give a new entrant?',
      'What surprised you most?',
    ],
    expectedTopics: ['personal motivation', 'rewards / challenges', 'growth', 'advice giving', 'reflection', 'role identity'],
    difficultyHint: 'B1',
  },
];

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Belirli bir görev tipinden N adet rastgele prompt seç.
 * Sınav simülasyonunda her oturumda farklı seçim için kullanılır.
 */
export function getRandomOralPrompts(taskType: OralExamTaskType, count = 1): OralExamPrompt[] {
  const pool = ORAL_EXAM_PROMPTS.filter((p) => p.taskType === taskType);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Tek bir 4-task ICAO 4 sözlü oturumu üret (her görev tipinden 1 prompt).
 */
export function buildOralExamSession(): OralExamPrompt[] {
  return [
    ...getRandomOralPrompts('picture_description', 1),
    ...getRandomOralPrompts('story_telling', 1),
    ...getRandomOralPrompts('problem_solving', 1),
    ...getRandomOralPrompts('common_topics', 1),
  ];
}

export const ORAL_EXAM_TASK_LABELS: Record<OralExamTaskType, { tr: string; en: string; durationMin: number }> = {
  picture_description: { tr: 'Görsel betimleme', en: 'Picture description', durationMin: 5 },
  story_telling: { tr: 'Hikaye anlatımı', en: 'Story telling', durationMin: 7 },
  problem_solving: { tr: 'Problem çözümü', en: 'Problem solving', durationMin: 7 },
  common_topics: { tr: 'Genel konular', en: 'Common topics', durationMin: 6 },
};

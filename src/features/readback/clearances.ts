/**
 * ATC Read-back drill içeriği — gerçek havacılık frazeolojisi.
 *
 * Her clearance için:
 *   - ATC'nin söylediği talimat (TTS okur)
 *   - Beklenen read-back kalıbı
 *   - keyPhrases varyantları (matching için)
 *   - ICAO Doc 9432 standart referansı
 *
 * 30 hızlı clearance — 60 saniyelik rapid fire için.
 */

export interface AtcClearance {
  id: string;
  /** Zorluk seviyesi */
  level: 'B1' | 'B2' | 'L4';
  /** Kategori (gösterim için) */
  category: 'taxi' | 'departure' | 'cruise' | 'approach' | 'landing' | 'emergency' | 'frequency';
  /** ATC istasyon */
  station: string;
  /** ATC frekansı */
  freq?: string;
  /** ATC'nin söylediği — TTS okur, ekrana yazılır */
  atcUtterance: string;
  /** Beklenen standart read-back */
  expectedReadback: string;
  /** Match için key phrases (her grup → en az 1 varyant geçmeli) */
  keyPhrases: string[][];
  /** ICAO Doc referansı (gösterim) */
  icaoRef?: string;
  /** Hatalı cevap için Türkçe ipucu */
  hintTr: string;
}

export const CLEARANCES: AtcClearance[] = [
  {
    id: 'taxi-rwy-35l',
    level: 'B1',
    category: 'taxi',
    station: 'IST GROUND',
    freq: '129.6',
    atcUtterance: 'Turkish 1453, taxi to runway 35 left via Echo Six.',
    expectedReadback: 'Taxi to runway 35 left via Echo Six, Turkish 1453.',
    keyPhrases: [
      ['taxi'],
      ['runway 35 left', '35l', 'three five left'],
      ['echo six', 'e6', 'e 6'],
      ['turkish'],
      ['1453', 'one four five three'],
    ],
    icaoRef: 'ICAO Doc 4444',
    hintTr: 'Taxi clearance: TAXI + RUNWAY + via TAXIWAY + CALLSIGN sırayla.',
  },
  {
    id: 'climb-fl240',
    level: 'B1',
    category: 'departure',
    station: 'ANKARA APPROACH',
    freq: '125.3',
    atcUtterance: 'Turkish 1453, climb flight level two-four-zero.',
    expectedReadback: 'Climb flight level two-four-zero, Turkish 1453.',
    keyPhrases: [
      ['climb', 'climbing'],
      ['flight level', 'fl'],
      ['two four zero', '240', 'two-four-zero'],
      ['turkish'],
    ],
    icaoRef: 'ICAO Annex 10 Vol II',
    hintTr: 'Altitude/FL talimatları her zaman tekrarlanır + callsign sonda.',
  },
  {
    id: 'descend-fl180',
    level: 'B1',
    category: 'cruise',
    station: 'ANKARA APPROACH',
    freq: '125.3',
    atcUtterance: 'Turkish 1453, descend flight level one-eight-zero.',
    expectedReadback: 'Descend flight level one-eight-zero, Turkish 1453.',
    keyPhrases: [
      ['descend', 'descending'],
      ['flight level', 'fl'],
      ['one eight zero', '180', 'one-eight-zero'],
      ['turkish'],
    ],
    hintTr: 'Descend talimatı tekrar et, FL sayısını ICAO formatında oku.',
  },
  {
    id: 'turn-heading-270',
    level: 'B1',
    category: 'cruise',
    station: 'ANKARA RADAR',
    freq: '124.5',
    atcUtterance: 'Turkish 1453, turn left heading two-seven-zero.',
    expectedReadback: 'Turn left heading two-seven-zero, Turkish 1453.',
    keyPhrases: [
      ['turn left', 'left turn', 'left'],
      ['heading', 'hdg'],
      ['two seven zero', '270', 'two-seven-zero'],
      ['turkish'],
    ],
    hintTr: 'Yön talimatı: TURN + LEFT/RIGHT + HEADING + 3 hane.',
  },
  {
    id: 'cleared-to-land',
    level: 'B1',
    category: 'landing',
    station: 'TOWER',
    freq: '118.1',
    atcUtterance: 'Turkish 1453, runway 35 left, cleared to land. Wind 350 at 12.',
    expectedReadback: 'Runway 35 left, cleared to land, Turkish 1453.',
    keyPhrases: [
      ['runway 35 left', '35l', 'three five left'],
      ['cleared to land', 'cleared land'],
      ['turkish'],
    ],
    hintTr: 'Landing clearance MUTLAKA "cleared to land" + runway + callsign içerir. Rüzgar opsiyonel.',
  },
  {
    id: 'go-around',
    level: 'B2',
    category: 'landing',
    station: 'TOWER',
    freq: '118.1',
    atcUtterance: 'Turkish 1453, go around. Climb runway heading to three thousand feet.',
    expectedReadback: 'Going around, runway heading climb three thousand, Turkish 1453.',
    keyPhrases: [
      ['go around', 'going around', 'going-around'],
      ['runway heading', 'runway track'],
      ['three thousand', '3000', '3 thousand'],
      ['turkish'],
    ],
    hintTr: 'Go-around aciliyettir — "Going around" + tırmanış talimatı + callsign.',
  },
  {
    id: 'squawk-7421',
    level: 'B1',
    category: 'departure',
    station: 'ISTANBUL DEPARTURE',
    freq: '120.6',
    atcUtterance: 'Turkish 1453, squawk seven-four-two-one.',
    expectedReadback: 'Squawk seven-four-two-one, Turkish 1453.',
    keyPhrases: [
      ['squawk', 'squacking'],
      ['seven four two one', '7421', 'seven-four-two-one'],
      ['turkish'],
    ],
    hintTr: 'Transponder code 4 hanedir, her hane ayrı söylenir.',
  },
  {
    id: 'contact-approach',
    level: 'B1',
    category: 'frequency',
    station: 'TOWER',
    freq: '118.1',
    atcUtterance: 'Turkish 1453, contact approach 124 decimal 35.',
    expectedReadback: '124 decimal 35, Turkish 1453.',
    keyPhrases: [
      ['124', 'one two four', 'one twenty four'],
      ['decimal', 'point'],
      ['35', 'three five'],
      ['turkish'],
    ],
    hintTr: 'Frekans değişimi: sadece frekans + callsign. "Contact" tekrarlanmaz.',
  },
  {
    id: 'mayday-engine',
    level: 'L4',
    category: 'emergency',
    station: 'YOU',
    freq: '121.5',
    atcUtterance: '[ACİL: motor yangını — MAYDAY çağrısı yap]',
    expectedReadback:
      'Mayday Mayday Mayday, Istanbul approach, Turkish 1453, engine fire, descending, request immediate vectors.',
    keyPhrases: [
      ['mayday'],
      ['istanbul'],
      ['turkish'],
      ['1453', 'one four five three'],
      ['engine fire', 'fire engine', 'engine on fire'],
      ['descending', 'descend'],
      ['vectors', 'vector', 'heading'],
    ],
    icaoRef: 'ICAO Doc 9432 §5.3',
    hintTr: 'MAYDAY 3 kez tekrar, sonra istasyon, callsign, problem, niyet, istek.',
  },
  {
    id: 'hold-vecon',
    level: 'B2',
    category: 'cruise',
    station: 'ANKARA APPROACH',
    freq: '120.9',
    atcUtterance: 'Turkish 1453, hold at VECON, expect further clearance one-two-four-five Zulu.',
    expectedReadback: 'Hold at VECON, expect further clearance one-two-four-five Zulu, Turkish 1453.',
    keyPhrases: [
      ['hold', 'holding'],
      ['vecon'],
      ['expect further clearance', 'efc'],
      ['one two four five', '1245'],
      ['zulu', 'z'],
      ['turkish'],
    ],
    hintTr: 'EFC = Expect Further Clearance. Saati ICAO formatında oku.',
  },
  {
    id: 'pushback-approved',
    level: 'B1',
    category: 'taxi',
    station: 'IST GROUND',
    freq: '129.6',
    atcUtterance: 'Turkish 1453, pushback approved, face east.',
    expectedReadback: 'Pushback approved, face east, Turkish 1453.',
    keyPhrases: [
      ['pushback', 'push back'],
      ['approved', 'cleared'],
      ['face east', 'east', 'facing east'],
      ['turkish'],
    ],
    hintTr: 'Pushback clearance: APPROVED + facing direction + callsign.',
  },
  {
    id: 'maintain-flightlevel',
    level: 'B1',
    category: 'cruise',
    station: 'EUROCONTROL',
    freq: '128.3',
    atcUtterance: 'Turkish 1453, maintain flight level three-five-zero.',
    expectedReadback: 'Maintain flight level three-five-zero, Turkish 1453.',
    keyPhrases: [
      ['maintain'],
      ['flight level', 'fl'],
      ['three five zero', '350', 'three-five-zero'],
      ['turkish'],
    ],
    hintTr: 'Maintain talimatı: MAINTAIN + FL + sayı + callsign.',
  },
];

export function getClearancesByLevel(level: 'B1' | 'B2' | 'L4'): AtcClearance[] {
  return CLEARANCES.filter((c) => c.level === level);
}

export function getRandomClearances(count: number, level?: 'B1' | 'B2' | 'L4'): AtcClearance[] {
  const pool = level ? getClearancesByLevel(level) : CLEARANCES;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

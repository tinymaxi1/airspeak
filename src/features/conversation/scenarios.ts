/**
 * AI Co-pilot scripted scenarios — pre-yazılmış ATC roleplay dialog tree.
 *
 * Çalışma mantığı:
 *   1. Kullanıcı bir senaryo seçer (örn "Holding pattern at VECON")
 *   2. ATC açılış mesajı gösterilir + sesli okunur (expo-speech TTS)
 *   3. Kullanıcı mikrofona cevap verir → STT transcript
 *   4. Beklenen kalıplara karşı eşleştirme (varyantlar dahil)
 *   5. Eşleşme skoruna göre dal seç:
 *       - >= 80% → "Read-back correct" + sonraki turn
 *       - 50-80% → "Say again" + tekrar şans
 *       - < 50% → düzeltme verip ilerlet
 *   6. Tüm tur'lar bitince özet skor
 *
 * Hiçbir AI API'sı kullanılmıyor — tüm "zekâ" pattern matching + branching.
 *
 * İçerik manuel yazılır (veya Gemini Free ile bir kez üretilir, sonra static).
 */

export interface DialogTurn {
  /** Bu turun ID'si (sahne içinde) */
  id: string;
  /** ATC'nin söylediği (TTS okunur, ekranda gösterilir) */
  atcUtterance: string;
  /** ATC'yi konuşan istasyon (gösterim için) */
  atcStation: string;
  /** ATC frekansı (ekranda) */
  frequency?: string;
  /** Kullanıcının söylemesi gereken prototype cevap (read-back) */
  expectedReadback: string;
  /** Cevabı eşleştirmede aranacak kritik kelimeler/fragmanlar.
   *  Her biri için varyantlar (örn "two-seven" = "27") */
  keyPhrases: string[][];
  /** Eğer kullanıcı çok kötü cevaplarsa (<50%), gösterilecek düzeltme açıklaması */
  correctionTr: string;
  /** Çoğu doğruysa minor not */
  hintTr?: string;
  /** Bu turdan sonra senaryo biter mi? */
  isFinal?: boolean;
}

export interface ConversationScenario {
  id: string;
  /** Rol filtresi: profiles.role değerleri + 'all'.
   *  UserRole = 'pilot' | 'atc' | 'cabin' | 'technician' | 'ground' | 'student'.
   *  'all' = her rol için geçerli. */
  role: 'pilot' | 'atc' | 'cabin' | 'technician' | 'ground' | 'student' | 'all';
  /** ICAO seviye gerekliliği (B1/B2/L4) */
  level: 'B1' | 'B2' | 'L4';
  titleTr: string;
  contextTr: string;
  /** Cockpit gauges (gösterim) */
  gauges?: { alt?: string; hdg?: string; spd?: string; freq?: string };
  /** Sırasıyla dialog turn'leri */
  turns: DialogTurn[];
  /** Tahmini süre (saniye) */
  estimatedSeconds: number;
}

/**
 * 15 farklı ATC senaryosu — manuel yazıldı.
 * Sonradan Gemini Free ile 50+'a çıkarılabilir (bir kerelik üretim).
 */
export const SCENARIOS: ConversationScenario[] = [
  {
    id: 'holding-vecon',
    role: 'pilot',
    level: 'B2',
    titleTr: 'VECON üzerinde holding pattern',
    contextTr: 'Türk Hava Yolları 1453, Ankara yaklaşma kontrolü ile bekleme paterninde.',
    gauges: { alt: 'FL240', hdg: '270°', spd: '280kt', freq: '120.9' },
    estimatedSeconds: 180,
    turns: [
      {
        id: 'turn-1',
        atcStation: 'ANKARA APPROACH',
        frequency: '120.9',
        atcUtterance:
          "Turkish 1453, hold at VECON as published, expect further clearance one-two-four-five Zulu.",
        expectedReadback:
          "Hold at VECON as published, expect further clearance one-two-four-five Zulu, Turkish 1453.",
        keyPhrases: [
          ['hold', 'holding'],
          ['vecon'],
          ['as published'],
          ['expect further clearance', 'further clearance', 'efc'],
          ['one two four five', '1245', '12 45', 'twelve forty five'],
          ['zulu', 'z'],
          ['turkish', 'thy'],
          ['1453', 'one four five three'],
        ],
        correctionTr:
          "Standart read-back: 'Hold at VECON as published, expect further clearance one-two-four-five Zulu, Turkish 1453.' Çağrı kodunu cümle sonunda söyle, EFC zamanını her zaman tekrarla.",
        hintTr: 'EFC = Expect Further Clearance. Saati ICAO formatında oku: "one-two-four-five".',
      },
      {
        id: 'turn-2',
        atcStation: 'ANKARA APPROACH',
        frequency: '120.9',
        atcUtterance: 'Turkish 1453, read-back correct.',
        expectedReadback: 'Turkish 1453.',
        keyPhrases: [['turkish'], ['1453', 'one four five three']],
        correctionTr: 'Sadece çağrı kodunu söyle: "Turkish 1453".',
      },
      {
        id: 'turn-3',
        atcStation: 'ANKARA APPROACH',
        frequency: '120.9',
        atcUtterance:
          'Turkish 1453, weather building south. Suggest reverse direction in hold. Confirm if able.',
        expectedReadback: 'Affirm reversing hold direction, Turkish 1453.',
        keyPhrases: [
          ['affirm', 'affirmative', 'yes'],
          ['reverse', 'reversing', 'reverse direction'],
          ['hold', 'holding'],
          ['turkish'],
          ['1453', 'one four five three'],
        ],
        correctionTr:
          'Sapmayı "Affirm" ile onayla, sonra ne yapacağını tekrarla: "Affirm reversing hold direction".',
        isFinal: true,
      },
    ],
  },
  {
    id: 'taxi-clearance-ist',
    role: 'pilot',
    level: 'B1',
    titleTr: 'Istanbul taxi clearance',
    contextTr: 'IST gate A21\'den runway 35L\'a taxi clearance.',
    gauges: { freq: '129.6' },
    estimatedSeconds: 120,
    turns: [
      {
        id: 'turn-1',
        atcStation: 'ISTANBUL GROUND',
        frequency: '129.6',
        atcUtterance:
          'Turkish 1453, taxi to holding point runway 35 left, via Echo Six, Hotel.',
        expectedReadback:
          'Taxi to holding point runway 35 left via Echo Six Hotel, Turkish 1453.',
        keyPhrases: [
          ['taxi'],
          ['holding point', 'hold short'],
          ['runway 35 left', 'runway three five left', '35l', 'three five left'],
          ['echo six', 'e6', 'e 6'],
          ['hotel', 'h'],
          ['turkish'],
          ['1453', 'one four five three'],
        ],
        correctionTr:
          'Taxi clearance read-back şu sırayla: HOLDING POINT + RUNWAY + via TAXIWAYS + CALLSIGN.',
      },
      {
        id: 'turn-2',
        atcStation: 'ISTANBUL GROUND',
        frequency: '129.6',
        atcUtterance: 'Turkish 1453, give way to A320 from your right, then continue.',
        expectedReadback: 'Giving way to A320, then continuing, Turkish 1453.',
        keyPhrases: [
          ['give way', 'giving way', 'yield'],
          ['a320', 'airbus 320'],
          ['continue', 'continuing'],
          ['turkish'],
        ],
        correctionTr: '"Giving way" + ne için ("to A320") + "then continuing" şeklinde tekrarla.',
        isFinal: true,
      },
    ],
  },
  {
    id: 'go-around-final',
    role: 'pilot',
    level: 'L4',
    titleTr: 'Final approach\'ta go-around',
    contextTr: 'Final approach 27R, önündeki uçak henüz pisti boşaltmadı.',
    gauges: { alt: '500ft', hdg: '270°', spd: '140kt', freq: '118.1' },
    estimatedSeconds: 90,
    turns: [
      {
        id: 'turn-1',
        atcStation: 'TOWER',
        frequency: '118.1',
        atcUtterance: 'Turkish 1453, go around. Climb runway heading to 3000 feet.',
        expectedReadback: 'Going around, runway heading climb 3000 feet, Turkish 1453.',
        keyPhrases: [
          ['go around', 'going around', 'go-around'],
          ['runway heading', 'runway track'],
          ['3000', 'three thousand', '3 thousand'],
          ['feet', 'ft'],
          ['turkish'],
        ],
        correctionTr:
          'Go-around emrini hemen ve standart: "Going around" + tırmanış talimatı + callsign.',
        hintTr: 'Go-around aciliyettir — read-back hemen ve net olmalı.',
      },
      {
        id: 'turn-2',
        atcStation: 'TOWER',
        frequency: '118.1',
        atcUtterance:
          'Turkish 1453, contact approach 124 decimal 35 for re-sequencing.',
        expectedReadback: '124 decimal 35, Turkish 1453.',
        keyPhrases: [
          ['124', 'one two four', 'one twenty four'],
          ['decimal', 'point'],
          ['35', 'three five', 'thirty five'],
          ['turkish'],
        ],
        correctionTr:
          'Frekans değişiminde sadece frekansı + callsign söyle: "124 decimal 35, Turkish 1453".',
        isFinal: true,
      },
    ],
  },
  {
    id: 'pa-turbulence',
    role: 'cabin',
    level: 'B2',
    titleTr: 'PA: türbülans uyarısı',
    contextTr: 'Cruise sırasında ani türbülans, kabin için PA anonsu.',
    estimatedSeconds: 60,
    turns: [
      {
        id: 'turn-1',
        atcStation: 'CAPTAIN',
        atcUtterance:
          'Cabin, captain. Expect moderate turbulence in 3 minutes. Make a PA announcement and secure the cabin.',
        expectedReadback:
          'Ladies and gentlemen, the captain has switched on the seatbelt sign. Please return to your seats and fasten your seatbelts.',
        keyPhrases: [
          ['ladies and gentlemen', 'dear passengers'],
          ['captain', 'flight deck'],
          ['seatbelt', 'seat belt'],
          ['return', 'go back'],
          ['seats', 'your seat'],
          ['fasten', 'buckle'],
        ],
        correctionTr:
          'PA anonsu standart: "Ladies and gentlemen" hitabı + captain bilgisi + seatbelt sign + return to seats + fasten.',
        isFinal: true,
      },
    ],
  },
  {
    id: 'mayday-engine-fire',
    role: 'pilot',
    level: 'L4',
    titleTr: 'MAYDAY: engine fire',
    contextTr: 'Sol motorda yangın, derhal acil durum bildirimi gerekli.',
    gauges: { alt: 'FL080', hdg: '180°', spd: '230kt', freq: '121.5' },
    estimatedSeconds: 90,
    turns: [
      {
        id: 'turn-1',
        atcStation: 'YOU',
        frequency: '121.5',
        atcUtterance: '[Acil durum bildirimi yap — MAYDAY çağrısı]',
        expectedReadback:
          'Mayday, Mayday, Mayday, Istanbul approach, Turkish 1453, engine fire, descending, request immediate vectors to nearest airport.',
        keyPhrases: [
          ['mayday', 'may day'],
          ['istanbul', 'ist'],
          ['turkish'],
          ['1453', 'one four five three'],
          ['engine fire', 'fire engine', 'engine on fire'],
          ['descending', 'descend'],
          ['vectors', 'vector', 'heading'],
          ['nearest airport', 'nearest field', 'closest airport'],
        ],
        correctionTr:
          'MAYDAY çağrısı 3 kez tekrar edilir, sonra istasyon, callsign, problem, niyetin (descending/turning) ve istek (vectors/clearance).',
        hintTr: 'MAYDAY = en yüksek aciliyet. PAN-PAN ondan bir alt seviye.',
        isFinal: true,
      },
    ],
  },
];

/**
 * Kullanıcı transcript'ini beklenen key phrases'e karşı eşleştir.
 * Her keyPhrase grubu için: gruptan en az bir varyant geçti mi?
 *
 * @returns 0-100 eşleşme skoru ve hangi gruplar kaçırıldı.
 */
export function matchTranscript(
  transcript: string,
  keyPhrases: string[][],
): { score: number; matched: number; total: number; missed: string[][] } {
  const t = transcript.toLowerCase().replace(/[.,!?;:]/g, ' ').replace(/\s+/g, ' ');
  let matched = 0;
  const missed: string[][] = [];

  for (const variants of keyPhrases) {
    const found = variants.some((v) => t.includes(v.toLowerCase()));
    if (found) matched += 1;
    else missed.push(variants);
  }

  const score = keyPhrases.length === 0 ? 100 : Math.round((matched / keyPhrases.length) * 100);
  return { score, matched, total: keyPhrases.length, missed };
}

export function getScenariosForRole(role: string | undefined): ConversationScenario[] {
  if (!role) return SCENARIOS;
  return SCENARIOS.filter((s) => s.role === role || s.role === 'all');
}

export function getScenarioById(id: string): ConversationScenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

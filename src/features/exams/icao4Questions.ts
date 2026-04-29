/**
 * ICAO Level 4 Yazılı Sınav — 3 set × 50 soru = 150 soru
 *
 * Yapı (her set):
 * - Kelime (Pilot terminoloji) × 20
 * - ICAO Frazeoloji × 15
 * - ATC Dinleme (transcript) × 10
 * - NOTAM/METAR Okuma × 5
 *
 * Soru havuzu rotasyonu: kullanıcı set'ler arası geçişle çeşitlilik görür.
 * Section ID'leri catalog.ts ile uyumlu (icao_w_voc / icao_w_phr / icao_w_lis / icao_w_read).
 *
 * Kaynak referans: ICAO Doc 9835, ICAO Doc 4444, SHGM örnek soru havuzu.
 */
import type { ExamQuestion } from './types';

const EXAM_ID = 'icao4_written_pilot';

/* eslint-disable max-len */

// ═══════════════════════════════════════════════════════════════════
//  SET 1 — Foundational (Difficulty B1-B2)
// ═══════════════════════════════════════════════════════════════════

const SET_1: ExamQuestion[] = [
  // ─────────────────── Vocabulary (20) ───────────────────
  {
    id: 'icao4_s1_v01', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B1',
    question: 'The aircraft was diverted due to severe ___ at the destination airport.',
    options: [
      { id: 'a', text: 'turbulence' },
      { id: 'b', text: 'weather' },
      { id: 'c', text: 'noise' },
      { id: 'd', text: 'pressure' },
    ],
    correctId: 'b',
    explanationTr: 'Diversion (rota değiştirme) en sık severe weather (kötü hava) nedeniyle yapılır. Turbulence belirli bir hava olayıdır ama "severe ___" ifadesi geniş hava koşullarını kapsar.',
    reference: 'ICAO Doc 9835 §4.6',
  },
  {
    id: 'icao4_s1_v02', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B1',
    question: 'The first officer requested ___ from ATC to descend to flight level 280.',
    options: [
      { id: 'a', text: 'permission' },
      { id: 'b', text: 'authorization' },
      { id: 'c', text: 'clearance' },
      { id: 'd', text: 'order' },
    ],
    correctId: 'c',
    explanationTr: '"Clearance" ATC tarafından verilen resmi izindir; pilotun belirli bir manevrayı yapabilmesi için gerekli olan onay. "Permission" günlük dilde, "authorization" geniş kavram, "order" emir.',
  },
  {
    id: 'icao4_s1_v03', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B1',
    question: 'The cabin crew demonstrated the ___ before takeoff.',
    options: [
      { id: 'a', text: 'safety procedures' },
      { id: 'b', text: 'meal service' },
      { id: 'c', text: 'duty roster' },
      { id: 'd', text: 'flight plan' },
    ],
    correctId: 'a',
    explanationTr: 'Kalkış öncesi kabin ekibi safety procedures (oksijen maskesi, can yeleği, çıkışlar) gösterir. Bu zorunlu bir prosedürdür.',
  },
  {
    id: 'icao4_s1_v04', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B1',
    question: 'The runway was closed for ___ due to debris on the surface.',
    options: [
      { id: 'a', text: 'maintenance' },
      { id: 'b', text: 'inspection' },
      { id: 'c', text: 'cleaning' },
      { id: 'd', text: 'all of the above' },
    ],
    correctId: 'd',
    explanationTr: 'Pist yüzeyinde FOD (Foreign Object Debris) tespit edilirse pist hemen kapatılır; inspection, cleaning ve maintenance üçü de yapılır.',
  },
  {
    id: 'icao4_s1_v05', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2',
    question: 'The captain decided to ___ takeoff because of a warning light.',
    options: [
      { id: 'a', text: 'reject' },
      { id: 'b', text: 'cancel' },
      { id: 'c', text: 'delay' },
      { id: 'd', text: 'postpone' },
    ],
    correctId: 'a',
    explanationTr: '"Reject takeoff" (RTO — Rejected Take-Off) standart havacılık terimidir. V1 öncesinde kalkışı durdurma kararı.',
  },
  {
    id: 'icao4_s1_v06', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B1',
    question: 'The aircraft experienced ___ at flight level 350.',
    options: [
      { id: 'a', text: 'shaking' },
      { id: 'b', text: 'turbulence' },
      { id: 'c', text: 'movement' },
      { id: 'd', text: 'rocking' },
    ],
    correctId: 'b',
    explanationTr: 'Turbulence havacılık standart terimi. CAT (Clear Air Turbulence), light/moderate/severe seviyeleri ile sınıflandırılır.',
  },
  {
    id: 'icao4_s1_v07', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B1',
    question: 'The pilot reported a bird ___ shortly after takeoff.',
    options: [
      { id: 'a', text: 'attack' },
      { id: 'b', text: 'crash' },
      { id: 'c', text: 'strike' },
      { id: 'd', text: 'hit' },
    ],
    correctId: 'c',
    explanationTr: '"Bird strike" havacılık standart terimi. Engine ingestion, windshield damage potansiyeli olan ciddi olay.',
    reference: 'ICAO Annex 14',
  },
  {
    id: 'icao4_s1_v08', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2',
    question: 'Due to fuel ___, the flight was cancelled.',
    options: [
      { id: 'a', text: 'lack' },
      { id: 'b', text: 'shortage' },
      { id: 'c', text: 'absence' },
      { id: 'd', text: 'minimum' },
    ],
    correctId: 'b',
    explanationTr: '"Fuel shortage" (yakıt yetersizliği) doğru ifade. Daha kritik durum "fuel emergency" / "minimum fuel" deklarasyonudur.',
  },
  {
    id: 'icao4_s1_v09', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B1',
    question: 'The control tower instructed the aircraft to ___ to runway 24.',
    options: [
      { id: 'a', text: 'taxi' },
      { id: 'b', text: 'walk' },
      { id: 'c', text: 'roll' },
      { id: 'd', text: 'drive' },
    ],
    correctId: 'a',
    explanationTr: 'Taxi = uçağın kendi gücüyle yer üzerinde hareketi. Standart ATC talimatı: "Taxi to runway XX".',
  },
  {
    id: 'icao4_s1_v10', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2',
    question: 'The ___ system reduces lift after touchdown.',
    options: [
      { id: 'a', text: 'flaps' },
      { id: 'b', text: 'spoilers' },
      { id: 'c', text: 'slats' },
      { id: 'd', text: 'ailerons' },
    ],
    correctId: 'b',
    explanationTr: 'Spoilers (özellikle ground spoilers) iniş sonrası kanat üstündeki hava akışını bozar, lift\'i azaltır, ağırlığı tekerleklere aktarır → fren etkinliğini artırır.',
  },
  {
    id: 'icao4_s1_v11', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B1',
    question: 'The crew completed the ___ checklist before pushback.',
    options: [
      { id: 'a', text: 'departure' },
      { id: 'b', text: 'before-start' },
      { id: 'c', text: 'cruise' },
      { id: 'd', text: 'descent' },
    ],
    correctId: 'b',
    explanationTr: '"Before-start checklist" pushback öncesi tamamlanır; engine start öncesi tüm sistemler kontrol edilir.',
  },
  {
    id: 'icao4_s1_v12', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2',
    question: 'The aircraft was holding at ___ awaiting landing clearance.',
    options: [
      { id: 'a', text: 'a fix' },
      { id: 'b', text: 'a waypoint' },
      { id: 'c', text: 'a holding pattern' },
      { id: 'd', text: 'all of the above' },
    ],
    correctId: 'c',
    explanationTr: 'Holding pattern (bekleyiş paterni) belirli bir fix etrafında uçağın çember/oval şeklinde uçtuğu prosedür; ATC trafik nedeniyle gecikmeli iniş için kullanır.',
    reference: 'ICAO Doc 4444 §6.5',
  },
  {
    id: 'icao4_s1_v13', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B1',
    question: 'The aircraft\'s ___ recorder captures cockpit conversation.',
    options: [
      { id: 'a', text: 'voice' },
      { id: 'b', text: 'audio' },
      { id: 'c', text: 'sound' },
      { id: 'd', text: 'speaker' },
    ],
    correctId: 'a',
    explanationTr: 'CVR = Cockpit Voice Recorder. Son 2 saat kokpit ses kaydı; kaza incelemesi için kritik.',
  },
  {
    id: 'icao4_s1_v14', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2',
    question: 'The pilot declared ___ due to engine fire.',
    options: [
      { id: 'a', text: 'PAN PAN' },
      { id: 'b', text: 'MAYDAY' },
      { id: 'c', text: 'SOS' },
      { id: 'd', text: 'EMERGENCY' },
    ],
    correctId: 'b',
    explanationTr: 'MAYDAY × 3 = en yüksek seviye acil durum (life-threatening). PAN PAN × 3 = urgency (acil ama hayati değil). Engine fire MAYDAY seviyesidir.',
    reference: 'ICAO Annex 10 Vol II',
  },
  {
    id: 'icao4_s1_v15', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B1',
    question: 'Cabin pressure is regulated by the ___ valve.',
    options: [
      { id: 'a', text: 'outflow' },
      { id: 'b', text: 'pressure' },
      { id: 'c', text: 'release' },
      { id: 'd', text: 'control' },
    ],
    correctId: 'a',
    explanationTr: 'Outflow valve = kabin basınç kontrolü için açılıp kapanan valf; kabinden dışarı atılan havayı düzenler.',
  },
  {
    id: 'icao4_s1_v16', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2',
    question: 'The aircraft was ___ for ETOPS operations.',
    options: [
      { id: 'a', text: 'qualified' },
      { id: 'b', text: 'rated' },
      { id: 'c', text: 'certified' },
      { id: 'd', text: 'approved' },
    ],
    correctId: 'c',
    explanationTr: 'ETOPS sertifikalı uçaklar (twin-engine) belirli süre tek motorla uçabilir kapasiteye sahiptir. Boeing 777 ETOPS-330 dakika sertifikalıdır.',
  },
  {
    id: 'icao4_s1_v17', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B1',
    question: 'The runway has a slight ___ to the east.',
    options: [
      { id: 'a', text: 'angle' },
      { id: 'b', text: 'slope' },
      { id: 'c', text: 'lean' },
      { id: 'd', text: 'tilt' },
    ],
    correctId: 'b',
    explanationTr: 'Runway slope = pist eğimi. Kalkış/iniş performansı hesaplamasında kritik bir faktör.',
  },
  {
    id: 'icao4_s1_v18', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2',
    question: 'Wind shear can cause sudden loss of ___.',
    options: [
      { id: 'a', text: 'altitude' },
      { id: 'b', text: 'airspeed' },
      { id: 'c', text: 'lift' },
      { id: 'd', text: 'all of the above' },
    ],
    correctId: 'd',
    explanationTr: 'Wind shear (rüzgar kesmesi) hız, irtifa ve lift kaybına yol açar. Özellikle son yaklaşma fazında tehlikeli.',
  },
  {
    id: 'icao4_s1_v19', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B1',
    question: 'The passenger was ___ from boarding due to expired documents.',
    options: [
      { id: 'a', text: 'denied' },
      { id: 'b', text: 'rejected' },
      { id: 'c', text: 'refused' },
      { id: 'd', text: 'banned' },
    ],
    correctId: 'a',
    explanationTr: 'Standart ifade: "denied boarding". Vize, pasaport süresi, sağlık belgeleri uygunsuzsa.',
  },
  {
    id: 'icao4_s1_v20', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2',
    question: 'The autopilot was ___ at 1,000 feet during approach.',
    options: [
      { id: 'a', text: 'turned off' },
      { id: 'b', text: 'disengaged' },
      { id: 'c', text: 'switched off' },
      { id: 'd', text: 'stopped' },
    ],
    correctId: 'b',
    explanationTr: 'Standart havacılık terimi: "disengage autopilot". CAT III ILS yaklaşmaları hariç son yaklaşmada manuel kontrol.',
  },

  // ─────────────────── Phraseology (15) ───────────────────
  {
    id: 'icao4_s1_p01', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B1',
    question: 'ATC: "TK1234, climb to flight level 350." Pilot read-back?',
    options: [
      { id: 'a', text: 'Roger, climbing.' },
      { id: 'b', text: 'OK, going up.' },
      { id: 'c', text: 'Climb to flight level 350, TK1234.' },
      { id: 'd', text: 'Affirmative.' },
    ],
    correctId: 'c',
    explanationTr: 'Standart read-back: callsign + tüm kritik komut tekrarı. "Roger" yetersiz; clearance/heading/level mutlaka tekrar edilmeli.',
    reference: 'ICAO Doc 9432',
  },
  {
    id: 'icao4_s1_p02', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B1',
    question: 'The phrase "Squawk 7700" means:',
    options: [
      { id: 'a', text: 'Set transponder to emergency code.' },
      { id: 'b', text: 'Increase altitude.' },
      { id: 'c', text: 'Switch radio frequency.' },
      { id: 'd', text: 'Report position.' },
    ],
    correctId: 'a',
    explanationTr: '7700 = genel acil durum transponder kodu. 7600 = radio failure, 7500 = hijack.',
    reference: 'ICAO Annex 10',
  },
  {
    id: 'icao4_s1_p03', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B1',
    question: '"Wilco" stands for:',
    options: [
      { id: 'a', text: 'Will comply.' },
      { id: 'b', text: 'I understand.' },
      { id: 'c', text: 'Wait, please.' },
      { id: 'd', text: 'Without complications.' },
    ],
    correctId: 'a',
    explanationTr: 'WILCO = "Will Comply" (talimata uyacağım). "Roger" sadece "anladım" anlamında, uyacağım taahhüdü içermez.',
  },
  {
    id: 'icao4_s1_p04', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2',
    question: 'When a pilot says "Unable", it means:',
    options: [
      { id: 'a', text: 'Cannot comply with instruction.' },
      { id: 'b', text: 'Need clarification.' },
      { id: 'c', text: 'Will attempt.' },
      { id: 'd', text: 'Disconnect radio.' },
    ],
    correctId: 'a',
    explanationTr: '"Unable" = talimat yerine getirilemiyor (trafik, yakıt, performans nedeniyle). ATC alternatif sağlamalı.',
  },
  {
    id: 'icao4_s1_p05', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B1',
    question: 'ATC: "TK456, hold short of runway 24." This means:',
    options: [
      { id: 'a', text: 'Stop before runway 24.' },
      { id: 'b', text: 'Wait at runway 24.' },
      { id: 'c', text: 'Cross runway 24.' },
      { id: 'd', text: 'Backtrack runway 24.' },
    ],
    correctId: 'a',
    explanationTr: '"Hold short of" = pist eşiğinden önce dur, pist sınır çizgisini geçme. En yaygın taxiway-runway çakışma önleme talimatı.',
  },
  {
    id: 'icao4_s1_p06', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2',
    question: '"Cleared for the ILS approach runway 06" — bu komut sonrası pilot:',
    options: [
      { id: 'a', text: 'Yaklaşma frekansına geçer + ILS\'e bağlanır.' },
      { id: 'b', text: 'Hemen iniş yapar.' },
      { id: 'c', text: 'Tower\'ı arar.' },
      { id: 'd', text: 'Holding pattern\'a girer.' },
    ],
    correctId: 'a',
    explanationTr: 'Approach clearance verildikten sonra pilot ILS final yönünde stabilize olur. Iniş izni ayrıca tower\'dan "cleared to land" şeklinde gelir.',
  },
  {
    id: 'icao4_s1_p07', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B1',
    question: '"Negative" pilot tarafından şu durumda kullanılır:',
    options: [
      { id: 'a', text: 'Hayır cevabı.' },
      { id: 'b', text: 'Sayı söylerken.' },
      { id: 'c', text: 'Frekans değişirken.' },
      { id: 'd', text: 'Acil durum.' },
    ],
    correctId: 'a',
    explanationTr: '"Negative" = no. Yes için "affirm" (NOT "affirmative" — confused with negative). ICAO standardı bu iki kelime için belirgin.',
  },
  {
    id: 'icao4_s1_p08', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2',
    question: 'ATC: "TK789, expect vectors for runway 06." Bu ne anlama gelir?',
    options: [
      { id: 'a', text: 'ATC heading talimatları verecek.' },
      { id: 'b', text: 'Pilot kendi yönünü seçecek.' },
      { id: 'c', text: 'Pist 06 kapalı.' },
      { id: 'd', text: 'Holding pattern\'a girilecek.' },
    ],
    correctId: 'a',
    explanationTr: 'Vectors = ATC tarafından verilen radar başlık (heading) komutları. Pilot kendi nav rotasından çıkıp ATC\'nin verdiği heading\'i takip eder.',
  },
  {
    id: 'icao4_s1_p09', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B1',
    question: '"Maintain heading 270" — pilot ne yapmalı?',
    options: [
      { id: 'a', text: 'Heading 270 derecede uçmaya devam.' },
      { id: 'b', text: 'Yeni heading 270 al.' },
      { id: 'c', text: 'Heading bilgisini onayla.' },
      { id: 'd', text: 'ATC\'ye geri sor.' },
    ],
    correctId: 'a',
    explanationTr: '"Maintain" = mevcut değeri koru. "Turn left/right heading 270" yeni heading komutudur.',
  },
  {
    id: 'icao4_s1_p10', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2',
    question: 'PAN PAN deklarasyonu hangi durumda kullanılır?',
    options: [
      { id: 'a', text: 'Hayati tehlike yaratan acil durum.' },
      { id: 'b', text: 'Acil ama hayati tehlike olmayan durum.' },
      { id: 'c', text: 'Rutin operasyonel mesaj.' },
      { id: 'd', text: 'Sadece airline\'a bilgilendirme.' },
    ],
    correctId: 'b',
    explanationTr: 'PAN PAN × 3 = urgency (acil ama hayati değil). Örnek: yolcu rahatsızlık, minor system fault. MAYDAY × 3 = distress (hayati).',
    reference: 'ICAO Annex 10 Vol II',
  },
  {
    id: 'icao4_s1_p11', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B1',
    question: 'ATC: "Report passing flight level 200." Pilot ne zaman cevap verir?',
    options: [
      { id: 'a', text: 'Hemen.' },
      { id: 'b', text: 'FL200\'i geçtiğinde.' },
      { id: 'c', text: 'FL200\'e ulaştığında.' },
      { id: 'd', text: 'Asla.' },
    ],
    correctId: 'b',
    explanationTr: '"Report passing" = belirtilen seviyeyi geçince bildir. "Report reaching" = ulaştığında bildir. Bu fark kritiktir.',
  },
  {
    id: 'icao4_s1_p12', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2',
    question: '"Go around" komutu pilot tarafından nasıl uygulanır?',
    options: [
      { id: 'a', text: 'Iniş iptal, full thrust + climb.' },
      { id: 'b', text: 'Pist üzerinde dön.' },
      { id: 'c', text: 'Holding pattern\'a gir.' },
      { id: 'd', text: 'Diversion airport\'a git.' },
    ],
    correctId: 'a',
    explanationTr: 'Go-around = missed approach. Iniş iptal edilir, TOGA (Take-Off/Go-Around) thrust uygulanır, missed approach prosedürü takip edilir.',
  },
  {
    id: 'icao4_s1_p13', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B1',
    question: '"Standby" ATC tarafından söylendiğinde:',
    options: [
      { id: 'a', text: 'Bekle, ben sana döneceğim.' },
      { id: 'b', text: 'Yedekte ol.' },
      { id: 'c', text: 'Frekansı boşalt.' },
      { id: 'd', text: 'Acil durum.' },
    ],
    correctId: 'a',
    explanationTr: '"Standby" = bekle (ATC meşgul, sonra dönecek). Pilot frekansı dinlemeye devam eder.',
  },
  {
    id: 'icao4_s1_p14', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2',
    question: 'Number "9" havacılık fonetik alfabesinde nasıl söylenir?',
    options: [
      { id: 'a', text: 'Niner' },
      { id: 'b', text: 'Nine' },
      { id: 'c', text: 'November' },
      { id: 'd', text: 'Nano' },
    ],
    correctId: 'a',
    explanationTr: '"Niner" telaffuz tek heceli "nine"\'dan ayırt edilebilir. Almanca "nein" (no) ile karışmaması için.',
    reference: 'ICAO Annex 10 Vol II §5.2',
  },
  {
    id: 'icao4_s1_p15', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B1',
    question: 'Letter "P" ICAO fonetik alfabesinde:',
    options: [
      { id: 'a', text: 'Papa' },
      { id: 'b', text: 'Peter' },
      { id: 'c', text: 'Paris' },
      { id: 'd', text: 'Pete' },
    ],
    correctId: 'a',
    explanationTr: 'ICAO standart fonetik: P = Papa, T = Tango, K = Kilo, R = Romeo. NATO ile uyumlu.',
    reference: 'ICAO Annex 10 Vol II',
  },

  // ─────────────────── Listening (10) ───────────────────
  {
    id: 'icao4_s1_l01', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B1',
    question: 'TRANSCRIPT: "Istanbul Tower, TK1981, request taxi for runway 35L." Tower cevap: "TK1981, taxi via Alpha, Bravo, hold short of runway 35L." Pilot ne yapmalı?',
    context: 'Pilot taxi clearance istiyor.',
    options: [
      { id: 'a', text: 'Alpha-Bravo taxiway\'lerinden taxi, pist 35L\'den önce dur.' },
      { id: 'b', text: 'Direkt pist 35L\'e gir.' },
      { id: 'c', text: 'Apron\'da kal.' },
      { id: 'd', text: 'Tower\'ı tekrar ara.' },
    ],
    correctId: 'a',
    explanationTr: 'Taxi clearance: Alpha-Bravo route + hold short = pist eşiğinden önce dur. Read-back zorunlu.',
  },
  {
    id: 'icao4_s1_l02', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2',
    question: 'TRANSCRIPT: "TK202, descend to flight level 100, expedite." "Expedite" ne anlama gelir?',
    context: 'Cruise sonrası descent.',
    options: [
      { id: 'a', text: 'Hızlı in (yüksek descent rate).' },
      { id: 'b', text: 'Yavaş in.' },
      { id: 'c', text: 'Iniş iptal.' },
      { id: 'd', text: 'Holding pattern\'a gir.' },
    ],
    correctId: 'a',
    explanationTr: '"Expedite" = hızlandır. Trafik separation veya hava nedeniyle ATC pilottan max practical rate ister.',
  },
  {
    id: 'icao4_s1_l03', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B1',
    question: 'TRANSCRIPT: "TK505, contact approach 124.05." Pilot ne yapmalı?',
    options: [
      { id: 'a', text: 'Frekansı 124.05\'e değiştir + approach\'u ara.' },
      { id: 'b', text: 'Mevcut frekansta kal.' },
      { id: 'c', text: 'Tower\'a sor.' },
      { id: 'd', text: 'Iniş hazırlığı yap.' },
    ],
    correctId: 'a',
    explanationTr: '"Contact" = belirtilen frekansa geç + ilk çağrıda ara. "Monitor" ise dinle ama arama (frekans değişikliği bilgilendirme).',
  },
  {
    id: 'icao4_s1_l04', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2',
    question: 'TRANSCRIPT (METAR): "LTBA 121200Z 27015G25KT 9999 SCT025 BKN100 22/15 Q1015". Rüzgar hızı?',
    context: 'Atatürk Havalimanı METAR.',
    options: [
      { id: 'a', text: '15 knot, gust 25.' },
      { id: 'b', text: '25 knot.' },
      { id: 'c', text: '15 km/h.' },
      { id: 'd', text: '270 derece.' },
    ],
    correctId: 'a',
    explanationTr: '27015G25KT = rüzgar 270 derece, 15 knot sürekli, gust 25 knot. METAR formatı standartlı.',
    reference: 'ICAO Annex 3',
  },
  {
    id: 'icao4_s1_l05', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B1',
    question: 'TRANSCRIPT: "TK333, cleared to land runway 06, wind 070 at 8 knots." Iniş yapabilir mi?',
    options: [
      { id: 'a', text: 'Evet, iniş izni verildi.' },
      { id: 'b', text: 'Hayır, sadece approach izni.' },
      { id: 'c', text: 'Holding pattern devam.' },
      { id: 'd', text: 'Go-around.' },
    ],
    correctId: 'a',
    explanationTr: '"Cleared to land" = iniş izni verildi. Wind bilgisi ek info; pilot crosswind/headwind hesaplar.',
  },
  {
    id: 'icao4_s1_l06', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2',
    question: 'TRANSCRIPT: "TK101, traffic 12 o\'clock, 5 miles, opposite direction, 1000 feet above." Trafik nerede?',
    options: [
      { id: 'a', text: 'Direkt önde, 5 mil, ters yön, 1000 ft yukarı.' },
      { id: 'b', text: 'Sol arkada.' },
      { id: 'c', text: 'Sağ önde.' },
      { id: 'd', text: 'Aşağıda.' },
    ],
    correctId: 'a',
    explanationTr: 'Saat yönü pilot pozisyonunda referans (12 o\'clock = direkt ön). 5 mil mesafe, ters yön = collision risk önleme bilgisi.',
  },
  {
    id: 'icao4_s1_l07', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B1',
    question: 'TRANSCRIPT: "TK808, climb to flight level 280, report leveling off." "Report leveling off" ne demek?',
    options: [
      { id: 'a', text: 'FL280\'e ulaşıp seviye almışsan bildir.' },
      { id: 'b', text: 'Kalkış sırasında bildir.' },
      { id: 'c', text: 'Ground\'a bildir.' },
      { id: 'd', text: 'Bildirme.' },
    ],
    correctId: 'a',
    explanationTr: '"Level off" = climb/descent\'i bitir, level flight\'a geç. ATC altitude separation için bunu bilmek ister.',
  },
  {
    id: 'icao4_s1_l08', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2',
    question: 'TRANSCRIPT: "TK456, runway 35L, line up and wait." Pilot ne yapar?',
    options: [
      { id: 'a', text: 'Pist üstüne girer + bekler (kalkış izni yok).' },
      { id: 'b', text: 'Hemen kalkış yapar.' },
      { id: 'c', text: 'Pistten uzak durur.' },
      { id: 'd', text: 'Geri taxi.' },
    ],
    correctId: 'a',
    explanationTr: '"Line up and wait" = pistte hazır pozisyon al ama kalkma. Kalkış izni "cleared for takeoff" ile gelir. ABD\'de eskiden "position and hold" idi.',
  },
  {
    id: 'icao4_s1_l09', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B1',
    question: 'TRANSCRIPT: "TK999, after departure, fly runway heading until 3000 feet." Pilot ne yapar?',
    options: [
      { id: 'a', text: 'Kalkıştan sonra pist heading\'inde 3000 ft\'e kadar uçar.' },
      { id: 'b', text: 'Hemen sola döner.' },
      { id: 'c', text: 'Holding pattern.' },
      { id: 'd', text: 'Iniş.' },
    ],
    correctId: 'a',
    explanationTr: 'Departure SID prosedürü içinde "fly runway heading" sık kullanılan komut. ATC vectors verene kadar pist yönünde tırman.',
  },
  {
    id: 'icao4_s1_l10', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2',
    question: 'TRANSCRIPT: "TK747, you are number 3 for landing, follow A330 on 4-mile final." Pilot ne anlamalı?',
    options: [
      { id: 'a', text: '3. iniş sırası, önündeki A330 4 mil final\'da.' },
      { id: 'b', text: 'Iniş iptal.' },
      { id: 'c', text: 'Pist 3\'e iniş.' },
      { id: 'd', text: '4 mil yukarıya çık.' },
    ],
    correctId: 'a',
    explanationTr: 'ATC sequence bilgisi: pilot kendi pozisyonunu trafiğe göre ayarlar. Wake turbulence separation için A330\'a 6 mil bekler (heavy → medium).',
  },

  // ─────────────────── Reading (5) ───────────────────
  {
    id: 'icao4_s1_r01', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2',
    question: 'PASSAGE: "RWY 06/24 CLSD DUE WIP 1200-1800 DLY UFN". 06/24 pisti ne zaman kapalı?',
    context: 'NOTAM excerpt.',
    options: [
      { id: 'a', text: 'Her gün 12:00-18:00 arası, ileri bildirime kadar.' },
      { id: 'b', text: 'Sadece 1 gün.' },
      { id: 'c', text: 'Hafta sonu.' },
      { id: 'd', text: '24 saat kapalı.' },
    ],
    correctId: 'a',
    explanationTr: 'NOTAM kısaltmaları: CLSD = closed, WIP = work in progress, DLY = daily, UFN = until further notice. 1200-1800 UTC.',
  },
  {
    id: 'icao4_s1_r02', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2',
    question: 'METAR: "LTBA 121400Z VRB02KT CAVOK 28/12 Q1018 NOSIG". CAVOK ne demek?',
    context: 'METAR Atatürk havalimanı.',
    options: [
      { id: 'a', text: 'Görüş 10 km+, bulut yok 5000 ft altı, hava olayı yok.' },
      { id: 'b', text: 'Yoğun sis var.' },
      { id: 'c', text: 'Fırtına var.' },
      { id: 'd', text: 'Yağmur var.' },
    ],
    correctId: 'a',
    explanationTr: 'CAVOK = Ceiling And Visibility OK. Görüş ≥10 km, no significant cloud below 5000 ft, no significant weather, no precipitation.',
    reference: 'ICAO Annex 3',
  },
  {
    id: 'icao4_s1_r03', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B1',
    question: 'PASSAGE: "ATIS Information Charlie, time 1330 UTC, wind 240 at 10, visibility 8 km, broken clouds at 3000 feet, temperature 22, dew point 18, QNH 1013." QNH ne?',
    context: 'ATIS broadcast.',
    options: [
      { id: 'a', text: 'Sea level basıncı (altimeter setting).' },
      { id: 'b', text: 'Sıcaklık.' },
      { id: 'c', text: 'Rüzgar yönü.' },
      { id: 'd', text: 'Görüş.' },
    ],
    correctId: 'a',
    explanationTr: 'QNH = sea-level pressure (altimeter setting). Pilot QNH ile altimetreyi set eder, MSL altitude doğru okunur.',
  },
  {
    id: 'icao4_s1_r04', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2',
    question: 'NOTAM: "TWY B BTN A2 AND A4 CLSD". Hangi taxiway kapalı?',
    options: [
      { id: 'a', text: 'Taxiway B, A2 ve A4 arası.' },
      { id: 'b', text: 'Tüm Bravo taxiway.' },
      { id: 'c', text: 'A2 taxiway.' },
      { id: 'd', text: 'A4 taxiway.' },
    ],
    correctId: 'a',
    explanationTr: 'BTN = between. Taxiway Bravo\'nun A2 ve A4 taxiway\'leri arasındaki kısmı kapalı.',
  },
  {
    id: 'icao4_s1_r05', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2',
    question: 'TAF: "LTBA 121200Z 1212/1318 27015KT 9999 SCT030 TEMPO 1218/1222 4000 -RA BKN015". TEMPO ne anlama gelir?',
    context: 'Terminal Aerodrome Forecast.',
    options: [
      { id: 'a', text: 'Geçici (1 saatten az süren) hava değişikliği.' },
      { id: 'b', text: 'Sürekli koşul.' },
      { id: 'c', text: 'Sıcaklık.' },
      { id: 'd', text: 'Hız.' },
    ],
    correctId: 'a',
    explanationTr: 'TEMPO = temporary. Belirtilen periyotta < 1 saat süren geçici fluctuation. BECMG = becoming (kalıcı değişim).',
    reference: 'ICAO Annex 3',
  },
];

// ═══════════════════════════════════════════════════════════════════
//  SET 2 — Intermediate (Difficulty B2)
// ═══════════════════════════════════════════════════════════════════

const SET_2: ExamQuestion[] = [
  // Vocabulary 20
  { id: 'icao4_s2_v01', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The crew encountered ___ during the cruise phase, requiring an altitude change.', options: [{ id: 'a', text: 'severe icing' }, { id: 'b', text: 'cold air' }, { id: 'c', text: 'minor frost' }, { id: 'd', text: 'snow' }], correctId: 'a', explanationTr: 'Severe icing = ciddi buzlanma. Anti-ice/de-ice sistemleri yeterli olmuyorsa altitude/route değişikliği gerek.' },
  { id: 'icao4_s2_v02', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'A ___ landing requires zero visibility autoland capability.', options: [{ id: 'a', text: 'Category I' }, { id: 'b', text: 'Category II' }, { id: 'c', text: 'Category IIIc' }, { id: 'd', text: 'visual' }], correctId: 'c', explanationTr: 'CAT IIIc = decision height yok, RVR < 50 m bile mümkün. Autoland zorunlu. CAT IIIa/IIIb DH ve RVR seviyeleri yüksek.' },
  { id: 'icao4_s2_v03', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The pilot was ___ to FL310 by ATC.', options: [{ id: 'a', text: 'asked' }, { id: 'b', text: 'cleared' }, { id: 'c', text: 'told' }, { id: 'd', text: 'sent' }], correctId: 'b', explanationTr: 'ATC izni "cleared to" ifadesiyle verilir. Diğer alternatifler havacılık standardı dışı.' },
  { id: 'icao4_s2_v04', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The aircraft\'s ___ was 4,500 kg above limits.', options: [{ id: 'a', text: 'weight' }, { id: 'b', text: 'load' }, { id: 'c', text: 'gross weight' }, { id: 'd', text: 'mass' }], correctId: 'c', explanationTr: 'Gross weight = uçağın toplam ağırlığı (boş + yakıt + payload). MTOW (max takeoff) limiti aşılırsa kalkış yasak.' },
  { id: 'icao4_s2_v05', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The crew must complete a ___ briefing before departure.', options: [{ id: 'a', text: 'safety' }, { id: 'b', text: 'pre-flight' }, { id: 'c', text: 'departure' }, { id: 'd', text: 'all of the above' }], correctId: 'd', explanationTr: 'Pre-flight briefing safety + departure + threat & error management içerir. CRM standart parçası.' },
  { id: 'icao4_s2_v06', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The aircraft suffered ___ damage upon landing.', options: [{ id: 'a', text: 'fuselage' }, { id: 'b', text: 'tail strike' }, { id: 'c', text: 'wing tip' }, { id: 'd', text: 'gear collapse' }], correctId: 'b', explanationTr: 'Tail strike = iniş veya kalkışta kuyruğun pist ile teması. Yüksek pitch angle nedeniyle olur. Inspection zorunlu.' },
  { id: 'icao4_s2_v07', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The flight was diverted to the ___ airport.', options: [{ id: 'a', text: 'alternate' }, { id: 'b', text: 'spare' }, { id: 'c', text: 'second' }, { id: 'd', text: 'backup' }], correctId: 'a', explanationTr: 'Alternate airport = yedek havalimanı, flight plan\'da zorunlu. ETOPS uçuşlarda multiple alternates.' },
  { id: 'icao4_s2_v08', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'A ___ flight has at least one stopover.', options: [{ id: 'a', text: 'direct' }, { id: 'b', text: 'non-stop' }, { id: 'c', text: 'connecting' }, { id: 'd', text: 'point-to-point' }], correctId: 'c', explanationTr: 'Connecting flight = aktarmalı uçuş. Direct = aynı uçuş numarası ile (stopover olabilir). Non-stop = duraksız.' },
  { id: 'icao4_s2_v09', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The captain declared a ___ due to medical emergency on board.', options: [{ id: 'a', text: 'PAN PAN' }, { id: 'b', text: 'MAYDAY' }, { id: 'c', text: 'urgency' }, { id: 'd', text: 'a or c' }], correctId: 'd', explanationTr: 'Tıbbi acil durum genelde PAN PAN (urgency) seviyesindedir; hayati tehlike kesin değilse. Kalp krizi gibi durumda MAYDAY de uygun.' },
  { id: 'icao4_s2_v10', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The pilot reported a ___ on the captain\'s side.', options: [{ id: 'a', text: 'flap' }, { id: 'b', text: 'indication failure' }, { id: 'c', text: 'system fault' }, { id: 'd', text: 'all of the above could fit' }], correctId: 'b', explanationTr: 'Cockpit ekranlarında "indication failure" yaygın hata bildirimi. ECAM/EICAS warning system.' },
  { id: 'icao4_s2_v11', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The ___ light came on, indicating a hydraulic issue.', options: [{ id: 'a', text: 'master caution' }, { id: 'b', text: 'master warning' }, { id: 'c', text: 'fault' }, { id: 'd', text: 'check' }], correctId: 'a', explanationTr: 'Master caution (sarı) = abnormal ama immediate threat değil. Master warning (kırmızı) = immediate action gerek.' },
  { id: 'icao4_s2_v12', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The crew performed a ___ landing due to brake failure.', options: [{ id: 'a', text: 'soft' }, { id: 'b', text: 'long' }, { id: 'c', text: 'safe but long' }, { id: 'd', text: 'overweight' }], correctId: 'c', explanationTr: 'Brake failure → uzun pistte yapılır, ek braking aids (drag chute, reverse). MAYDAY veya PAN PAN deklarasyonu yapılır.' },
  { id: 'icao4_s2_v13', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The first officer was responsible for ___ during the flight.', options: [{ id: 'a', text: 'navigation' }, { id: 'b', text: 'communication' }, { id: 'c', text: 'monitoring' }, { id: 'd', text: 'pilot flying duties' }], correctId: 'd', explanationTr: 'Pilot Flying (PF) ve Pilot Monitoring (PM) görevleri rotation. Captain ve FO arasında her sektörde değişebilir.' },
  { id: 'icao4_s2_v14', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The ___ angle was too steep on final approach.', options: [{ id: 'a', text: 'glide path' }, { id: 'b', text: 'attack' }, { id: 'c', text: 'climb' }, { id: 'd', text: 'descent' }], correctId: 'a', explanationTr: 'Glide path angle = iniş açısı (standart 3°). Steep glide = unstable approach → go-around önerilir.' },
  { id: 'icao4_s2_v15', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The aircraft has a ___ emergency exit on each side.', options: [{ id: 'a', text: 'main' }, { id: 'b', text: 'over-wing' }, { id: 'c', text: 'rear' }, { id: 'd', text: 'all of these' }], correctId: 'd', explanationTr: 'Main door + over-wing emergency exit + rear exit kombinasyonu uçak modeline göre değişir. Evacuation 90-saniye kuralı.' },
  { id: 'icao4_s2_v16', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The pilot performed a ___ to verify the aircraft\'s response.', options: [{ id: 'a', text: 'systems check' }, { id: 'b', text: 'control check' }, { id: 'c', text: 'flight test' }, { id: 'd', text: 'walk-around' }], correctId: 'b', explanationTr: 'Control check = before-takeoff item; aileron, elevator, rudder hareket testi. "Free and correct" kontrolü.' },
  { id: 'icao4_s2_v17', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The aircraft ___ on the runway after a hard landing.', options: [{ id: 'a', text: 'bounced' }, { id: 'b', text: 'jumped' }, { id: 'c', text: 'hopped' }, { id: 'd', text: 'rocked' }], correctId: 'a', explanationTr: '"Bounced landing" = uçak ilk teması sonrası pistten zıplar. High vertical descent rate sonucudur. Go-around önerilir 2. bounce öncesi.' },
  { id: 'icao4_s2_v18', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The ___ system warned the crew of a possible terrain conflict.', options: [{ id: 'a', text: 'TCAS' }, { id: 'b', text: 'GPWS' }, { id: 'c', text: 'EGPWS' }, { id: 'd', text: 'b or c' }], correctId: 'd', explanationTr: 'GPWS / EGPWS = Ground Proximity Warning System / Enhanced. Terrain alert verir. TCAS trafik için.' },
  { id: 'icao4_s2_v19', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'A flight ___ contains route, altitude, and fuel data.', options: [{ id: 'a', text: 'plan' }, { id: 'b', text: 'log' }, { id: 'c', text: 'map' }, { id: 'd', text: 'sheet' }], correctId: 'a', explanationTr: 'Flight plan ATC\'ye verilen rota + altitude + ETD/ETA + alternate + fuel bilgisini içerir. ICAO format standart.' },
  { id: 'icao4_s2_v20', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The cabin ___ was activated during turbulence.', options: [{ id: 'a', text: 'seatbelt sign' }, { id: 'b', text: 'no smoking sign' }, { id: 'c', text: 'fasten seatbelt sign' }, { id: 'd', text: 'a or c' }], correctId: 'd', explanationTr: 'Seatbelt sign = fasten seatbelt sign aynıdır. Türbülansta zorunlu açma; kabin ekibi PA anonsu ile yolcu uyarır.' },

  // Phraseology 15
  { id: 'icao4_s2_p01', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: 'ATC: "TK500, climb FL280, when ready." Pilot ne yapar?', options: [{ id: 'a', text: 'Hazır olduğunda climb başlar.' }, { id: 'b', text: 'Hemen climb.' }, { id: 'c', text: 'Climb yapmaz.' }, { id: 'd', text: 'Holding.' }], correctId: 'a', explanationTr: '"When ready" = pilot kendi takdirine göre climb\'a başlar. Discretion based.' },
  { id: 'icao4_s2_p02', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Decimal" havacılık iletişiminde nasıl kullanılır?', options: [{ id: 'a', text: 'Frekans virgülü için (ör: 122 decimal 5).' }, { id: 'b', text: 'Sayı sayılırken.' }, { id: 'c', text: 'Acil durum.' }, { id: 'd', text: 'Selamlama.' }], correctId: 'a', explanationTr: 'Frekans 122.5 → "one two two decimal five". "Point" kullanılmaz havacılıkta.', reference: 'ICAO Doc 9432' },
  { id: 'icao4_s2_p03', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Affirm" yerine yanlışlıkla "affirmative" kullanılırsa risk nedir?', options: [{ id: 'a', text: '"Negative" ile karışır.' }, { id: 'b', text: 'Frekans bozulur.' }, { id: 'c', text: 'Anlam farkı yok.' }, { id: 'd', text: 'Acil durum.' }], correctId: 'a', explanationTr: 'ICAO standardı "affirm" tek heceli, "negative" üç heceli — karışıklık önlenir. "Affirmative" benzer ses.' },
  { id: 'icao4_s2_p04', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: 'ATC: "TK600, descend at pilot\'s discretion to FL250." Pilot:', options: [{ id: 'a', text: 'Kendi seçtiği rate ve zaman ile descent.' }, { id: 'b', text: 'Hemen ve hızlıca descent.' }, { id: 'c', text: 'Descent yapmaz.' }, { id: 'd', text: 'Holding pattern.' }], correctId: 'a', explanationTr: '"Pilot\'s discretion" = pilot ne zaman ne hızda yapacağına karar verir. Maks rate yok, min rate yok.' },
  { id: 'icao4_s2_p05', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Cleared direct to ALPHA" — pilot ne yapar?', options: [{ id: 'a', text: 'Mevcut rotayı bırak, ALPHA fix\'ine direkt git.' }, { id: 'b', text: 'ALPHA\'da bekle.' }, { id: 'c', text: 'ALPHA\'yı SID\'e ekle.' }, { id: 'd', text: 'ALPHA\'dan kaç.' }], correctId: 'a', explanationTr: 'Direct to = belirli waypoint\'e short-cut. Genelde ATC trafik için izin verir, fuel saving.' },
  { id: 'icao4_s2_p06', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Block FL280-300" izni nedir?', options: [{ id: 'a', text: 'FL280 ile FL300 arası serbest seyir.' }, { id: 'b', text: 'FL280\'de bekle.' }, { id: 'c', text: 'Holding.' }, { id: 'd', text: 'Climb yasak.' }], correctId: 'a', explanationTr: 'Block clearance = pilot belirli iki seviye arasında serbestçe değişebilir. Türbülans nedeniyle sık verilir.' },
  { id: 'icao4_s2_p07', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Reduce speed to 180 knots, indicated airspeed" pilot için:', options: [{ id: 'a', text: 'IAS 180 knot\'a düş.' }, { id: 'b', text: 'GS 180 knot.' }, { id: 'c', text: 'TAS 180 knot.' }, { id: 'd', text: 'Bilinmiyor.' }], correctId: 'a', explanationTr: 'IAS = Indicated Airspeed (cockpit göstergesi). ATC genelde IAS verir; pilot anemometre okur.' },
  { id: 'icao4_s2_p08', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Cancel speed restriction" ATC tarafından söylenirse:', options: [{ id: 'a', text: 'Önceki speed limit kaldırıldı, normal seyir.' }, { id: 'b', text: 'Hızı artır.' }, { id: 'c', text: 'Hızı azalt.' }, { id: 'd', text: 'Hıza dokunma.' }], correctId: 'a', explanationTr: 'Önceki speed restriction iptal edilir. Pilot kendi optimum cruise speed\'e döner.' },
  { id: 'icao4_s2_p09', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: 'ATC: "TK700, fly heading 090, vectors for sequencing." "Vectors for sequencing" ne?', options: [{ id: 'a', text: 'ATC trafik sıralaması için heading veriyor.' }, { id: 'b', text: 'Pilot kendi yön seçiyor.' }, { id: 'c', text: 'Acil durum.' }, { id: 'd', text: 'Iniş izni.' }], correctId: 'a', explanationTr: 'Sequencing = ATC inişe gelen trafiği sıralar. Pilot vectors\'a uyar, kendi nav\'a dönmez izinsiz.' },
  { id: 'icao4_s2_p10', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Hold for traffic" pilota ne emrediyor?', options: [{ id: 'a', text: 'Mevcut pozisyonda bekle (pist veya taxiway).' }, { id: 'b', text: 'Çıkış yap.' }, { id: 'c', text: 'Iniş yap.' }, { id: 'd', text: 'Apron\'a dön.' }], correctId: 'a', explanationTr: '"Hold" = mevcut yerde dur (taxiway veya runway). Trafik geçtikten sonra ATC release eder.' },
  { id: 'icao4_s2_p11', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Make short approach" izni:', options: [{ id: 'a', text: 'Kısa final\'a in (normal pattern\'dan kestir).' }, { id: 'b', text: 'Holding pattern\'a gir.' }, { id: 'c', text: 'Diversion yap.' }, { id: 'd', text: 'Go-around.' }], correctId: 'a', explanationTr: 'Short approach = downwind veya base\'den kısa final. Trafik aralıklarını sıkıştırma için verilir.' },
  { id: 'icao4_s2_p12', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Negative contact" pilot tarafından söylendiğinde:', options: [{ id: 'a', text: 'Trafik görünmüyor.' }, { id: 'b', text: 'Frekans çalışmıyor.' }, { id: 'c', text: 'Ground bağlantısı yok.' }, { id: 'd', text: 'Acil durum.' }], correctId: 'a', explanationTr: 'ATC "report traffic in sight" derse ve pilot göremezse "negative contact" cevap verir. Visual separation kurulamaz.' },
  { id: 'icao4_s2_p13', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Reduce minimum clean speed" pilot için:', options: [{ id: 'a', text: 'Flap olmadan min hız.' }, { id: 'b', text: 'Stall hızı.' }, { id: 'c', text: 'Approach hızı.' }, { id: 'd', text: 'Cruise hızı.' }], correctId: 'a', explanationTr: 'Clean configuration = flap retracted. Min clean speed = flap çıkmadan güvenli min hız (yaklaşık 1.3 × stall).' },
  { id: 'icao4_s2_p14', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: 'Pilot: "Request descent." ATC: "Standby." Pilot ne yapar?', options: [{ id: 'a', text: 'Bekler, mevcut FL korunur.' }, { id: 'b', text: 'Descent başlar.' }, { id: 'c', text: 'Climb yapar.' }, { id: 'd', text: 'Holding.' }], correctId: 'a', explanationTr: 'Standby = bekle, henüz onay yok. Pilot mevcut altitude/heading korur.' },
  { id: 'icao4_s2_p15', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Roger" sadece şu durumda kullanılır:', options: [{ id: 'a', text: 'Mesajı aldım, ek cevap gerekmiyor.' }, { id: 'b', text: 'Talimata uyacağım.' }, { id: 'c', text: 'Hayır.' }, { id: 'd', text: 'Acil durum.' }], correctId: 'a', explanationTr: 'Roger = "received, understood". Compliance vermez. Compliance için "wilco" ayrıca verilir.', reference: 'ICAO Doc 9432' },

  // Listening 10
  { id: 'icao4_s2_l01', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK801, traffic alert, climb climb climb." Pilot ne yapmalı?', context: 'TCAS RA.', options: [{ id: 'a', text: 'Hemen tırman, otopilot disable.' }, { id: 'b', text: 'ATC\'ye sor.' }, { id: 'c', text: 'Mevcut FL koru.' }, { id: 'd', text: 'Holding.' }], correctId: 'a', explanationTr: 'TCAS RA (Resolution Advisory) ATC clearance üzerine takip edilir. "Climb climb climb" = hemen yükselt komutu.', reference: 'ICAO Doc 4444' },
  { id: 'icao4_s2_l02', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT (METAR): "LTBA 121800Z 30025G40KT 4000 +TSRA SCT008 BKN025CB". Hava nasıl?', context: 'Atatürk METAR.', options: [{ id: 'a', text: 'Şiddetli yağmurlu fırtına, görüş 4 km, CB var.' }, { id: 'b', text: 'Sadece yağmur.' }, { id: 'c', text: 'Açık hava.' }, { id: 'd', text: 'Sis.' }], correctId: 'a', explanationTr: '+TSRA = heavy thunderstorm with rain. CB = cumulonimbus, fırtına bulutu. Sektör havadan tehlikeli.' },
  { id: 'icao4_s2_l03', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK505, hold north of GOLEM at FL250, expect further clearance at 1430." "Expect further clearance" ne?', options: [{ id: 'a', text: '14:30\'da yeni izin gelecek.' }, { id: 'b', text: 'Asla bekleme.' }, { id: 'c', text: 'İniş izni.' }, { id: 'd', text: 'Diversion.' }], correctId: 'a', explanationTr: 'EFC time = expect further clearance. Pilot bu zamanda yeni clearance bekleyebilir; gelmezse query.' },
  { id: 'icao4_s2_l04', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK333, runway 06 right, cleared for takeoff, wind 070 at 15." Wind component nasıl?', options: [{ id: 'a', text: 'Headwind ağırlıklı, hafif crosswind.' }, { id: 'b', text: 'Pure tailwind.' }, { id: 'c', text: 'Calm.' }, { id: 'd', text: 'Severe gust.' }], correctId: 'a', explanationTr: 'Pist 060°, rüzgar 070°/15kt. 10° fark = mostly headwind, küçük right crosswind component.' },
  { id: 'icao4_s2_l05', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK202, cabin pressure dropping, declaring PAN PAN." Pilot ne deklare etti?', options: [{ id: 'a', text: 'Urgency (acil ama hayati değil).' }, { id: 'b', text: 'MAYDAY.' }, { id: 'c', text: 'Routine.' }, { id: 'd', text: 'Iniş izni.' }], correctId: 'a', explanationTr: 'PAN PAN = urgency. Cabin pressure loss agresifleşirse MAYDAY\'e dönüşür.' },
  { id: 'icao4_s2_l06', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK808, you have vortex behind departing 777. Caution wake turbulence." Ne yapmalı?', options: [{ id: 'a', text: 'Wake turbulence separation\'ı dikkate al.' }, { id: 'b', text: 'Hızlı kalkış yap.' }, { id: 'c', text: 'Holding.' }, { id: 'd', text: 'Diversion.' }], correctId: 'a', explanationTr: 'Heavy aircraft (777) wake vortex bırakır. Light/medium uçaklar 5+ mil veya 2 dk separation gerek.' },
  { id: 'icao4_s2_l07', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK404, stop straight ahead, brace for impact" — kabin için ne ifade eder?', options: [{ id: 'a', text: 'Acil iniş, çarpışma pozisyonu hazırla.' }, { id: 'b', text: 'Normal iniş.' }, { id: 'c', text: 'Servis başla.' }, { id: 'd', text: 'Boarding.' }], correctId: 'a', explanationTr: '"Brace for impact" = kabin ekibi yolcuya çarpışma pozisyonu komutu verir. Ciddi acil durum.' },
  { id: 'icao4_s2_l08', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK111, cleared ILS approach runway 24 right, maintain 3000 until GLIDESLOPE intercept." Pilot 3000 ft\'i ne zaman bırakır?', options: [{ id: 'a', text: 'Glideslope intercept ettiğinde.' }, { id: 'b', text: 'Hemen.' }, { id: 'c', text: 'Iniş izninden sonra.' }, { id: 'd', text: 'Asla.' }], correctId: 'a', explanationTr: 'Glideslope intercept = ILS dikey kılavuz aktivasyonu. Pilot bu noktadan sonra azalan altitude ile iner.' },
  { id: 'icao4_s2_l09', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK999, taxi to gate via Charlie, follow Marshaller signals." Marshaller kim?', options: [{ id: 'a', text: 'Apron\'da uçağı park eden personel.' }, { id: 'b', text: 'Pilot.' }, { id: 'c', text: 'ATC.' }, { id: 'd', text: 'Ground supervisor.' }], correctId: 'a', explanationTr: 'Marshaller = ramp\'ta uçağı yöneten yer hizmetleri personeli. Standart sinyaller (paddles, ışıklar) ile pozisyon talimatı verir.' },
  { id: 'icao4_s2_l10', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK202, descend FL120, after KARGO 280 knots or less." Hangi sırayla?', options: [{ id: 'a', text: 'KARGO\'dan sonra speed kısıtlaması.' }, { id: 'b', text: 'Hemen 280 knot.' }, { id: 'c', text: 'KARGO\'dan önce 280.' }, { id: 'd', text: 'Speed yok.' }], correctId: 'a', explanationTr: '"After KARGO" = KARGO waypoint geçildikten sonra. ATC sequencing bilgisi.' },

  // Reading 5
  { id: 'icao4_s2_r01', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2', question: 'NOTAM: "RWY 35L OUT-OF-SERVICE 1500-1700 ALL DAILY EXC SAT SUN UFN". Cumartesi 1600 UTC pist 35L:', options: [{ id: 'a', text: 'Açık (Cumartesi muafiyet).' }, { id: 'b', text: 'Kapalı.' }, { id: 'c', text: 'Bilinmiyor.' }, { id: 'd', text: 'Sınırlı kullanım.' }], correctId: 'a', explanationTr: 'EXC SAT SUN = Cumartesi-Pazar hariç. Diğer günler 1500-1700 kapalı.' },
  { id: 'icao4_s2_r02', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2', question: 'METAR: "LTBA 121300Z 24010KT 1200 R35L/0800V1200U BR SCT005". RVR ne gösteriyor?', context: 'METAR detay.', options: [{ id: 'a', text: '35L pisti RVR 800-1200 m, artıyor.' }, { id: 'b', text: 'Hiç görüş yok.' }, { id: 'c', text: '1200 km görüş.' }, { id: 'd', text: 'Bilinmiyor.' }], correctId: 'a', explanationTr: 'R35L/0800V1200U = pist 35L için RVR 800m\'den 1200m\'ye değişken (V), upward trend (U).' },
  { id: 'icao4_s2_r03', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2', question: 'PASSAGE: "All non-revenue passengers must check in 90 minutes prior to departure." Bu kim için?', options: [{ id: 'a', text: 'Bilet ödemeyen yolcular (staff, family).' }, { id: 'b', text: 'Tüm yolcular.' }, { id: 'c', text: 'Sadece bebek.' }, { id: 'd', text: 'VIP.' }], correctId: 'a', explanationTr: 'Non-revenue = airline staff + their family (ID90 ticket). Standby boarding genelde 90 dk önce check-in.' },
  { id: 'icao4_s2_r04', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2', question: 'NOTAM: "GP/LOC RWY 06 U/S 1200-1500". ILS sistemi durumu?', options: [{ id: 'a', text: 'Glide path + Localizer kullanım dışı 1200-1500.' }, { id: 'b', text: 'ILS çalışıyor.' }, { id: 'c', text: 'Pist kapalı.' }, { id: 'd', text: 'Bilinmiyor.' }], correctId: 'a', explanationTr: 'GP = Glide Path, LOC = Localizer, U/S = unserviceable. Bu süre içinde ILS approach mümkün değil.' },
  { id: 'icao4_s2_r05', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2', question: 'TAF: "TAF AMD LTBA 121400Z 1214/1314 27015KT 9999 BKN025 BECMG 1218/1220 30025G40KT TSRA". Saat 19:00 UTC tahmini:', options: [{ id: 'a', text: 'Rüzgar 300/25 G40, fırtına başlıyor.' }, { id: 'b', text: 'Sakin hava.' }, { id: 'c', text: 'Sis.' }, { id: 'd', text: 'Kar.' }], correctId: 'a', explanationTr: 'BECMG 1218/1220 = 18-20 UTC arası kalıcı değişim. 19:00 = transition window içinde, fırtınalı hava bekleniyor.' },
];

// ═══════════════════════════════════════════════════════════════════
//  SET 3 — Advanced (Difficulty B2+, gerçek sınav simülasyonu)
// ═══════════════════════════════════════════════════════════════════

const SET_3: ExamQuestion[] = [
  // Vocabulary 20
  { id: 'icao4_s3_v01', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The aircraft was ___ on a non-precision approach.', options: [{ id: 'a', text: 'cleared' }, { id: 'b', text: 'sequenced' }, { id: 'c', text: 'vectored' }, { id: 'd', text: 'all of the above' }], correctId: 'd', explanationTr: 'Non-precision approach (VOR, NDB, RNAV LNAV) için pilot cleared, sequenced ve vectored olabilir; üçü de operasyonel akış parçası.' },
  { id: 'icao4_s3_v02', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The aircraft\'s ___ angle exceeded structural limits.', options: [{ id: 'a', text: 'pitch' }, { id: 'b', text: 'bank' }, { id: 'c', text: 'yaw' }, { id: 'd', text: 'a or b' }], correctId: 'd', explanationTr: 'Pitch ve bank açıları yapısal limitlere sahip. Aşırı pitch = stall risk, aşırı bank = load factor + stall.' },
  { id: 'icao4_s3_v03', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'A ___ was issued due to volcanic ash.', options: [{ id: 'a', text: 'NOTAM' }, { id: 'b', text: 'SIGMET' }, { id: 'c', text: 'AIRMET' }, { id: 'd', text: 'PIREP' }], correctId: 'b', explanationTr: 'SIGMET = Significant Meteorological Information. Volkanik kül, severe icing/turbulence için issue edilir.', reference: 'ICAO Annex 3' },
  { id: 'icao4_s3_v04', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The crew used ___ smoke goggles during the cabin fire.', options: [{ id: 'a', text: 'protective' }, { id: 'b', text: 'PBE' }, { id: 'c', text: 'oxygen' }, { id: 'd', text: 'a or b' }], correctId: 'd', explanationTr: 'PBE = Protective Breathing Equipment. Yangın durumunda kabin ekibi kullanır; smoke + oxygen filtration.' },
  { id: 'icao4_s3_v05', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The aircraft is ___ for a 4-hour extended overwater operation.', options: [{ id: 'a', text: 'rated' }, { id: 'b', text: 'certified' }, { id: 'c', text: 'ETOPS-approved' }, { id: 'd', text: 'all of the above' }], correctId: 'c', explanationTr: 'ETOPS-approved = uçak + airline + crew kombinasyonu sertifikalı. Twin-engine için ekstrem önemli.' },
  { id: 'icao4_s3_v06', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'Convective ___ are dangerous for aircraft.', options: [{ id: 'a', text: 'currents' }, { id: 'b', text: 'cells' }, { id: 'c', text: 'storms' }, { id: 'd', text: 'all of the above' }], correctId: 'd', explanationTr: 'Convective weather genel terim; cells, currents, storms tümü dahil. Severe turbulence + lightning + hail riski.' },
  { id: 'icao4_s3_v07', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The pilot performed an ___ landing on a single engine.', options: [{ id: 'a', text: 'asymmetric' }, { id: 'b', text: 'one-engine' }, { id: 'c', text: 'OEI' }, { id: 'd', text: 'a or c' }], correctId: 'd', explanationTr: 'OEI = One Engine Inoperative. Asymmetric thrust = motor arızası sonucu yan yan kuvvet, rudder kompansasyonu gerek.' },
  { id: 'icao4_s3_v08', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The crew followed the ___ checklist for engine fire.', options: [{ id: 'a', text: 'memory items' }, { id: 'b', text: 'QRH' }, { id: 'c', text: 'abnormal' }, { id: 'd', text: 'all could fit' }], correctId: 'd', explanationTr: 'Memory items = ezbere bilinen ilk adımlar. QRH = Quick Reference Handbook. Abnormal/Emergency procedures.' },
  { id: 'icao4_s3_v09', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The ___ failure caused gear retraction issues.', options: [{ id: 'a', text: 'hydraulic' }, { id: 'b', text: 'electrical' }, { id: 'c', text: 'pneumatic' }, { id: 'd', text: 'all of these are possible' }], correctId: 'd', explanationTr: 'Landing gear extend/retract için hydraulic primary, electrical/pneumatic backup. Üçünden birinin failure\'u sorun çıkarabilir.' },
  { id: 'icao4_s3_v10', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The captain made a ___ to the cabin crew.', options: [{ id: 'a', text: 'briefing' }, { id: 'b', text: 'call' }, { id: 'c', text: 'PA announcement' }, { id: 'd', text: 'a or c' }], correctId: 'd', explanationTr: 'Briefing pre-departure resmi toplantı. PA announcement uçuş içi yolcu/ekip duyurusu.' },
  { id: 'icao4_s3_v11', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The aircraft entered a ___ during the maneuver.', options: [{ id: 'a', text: 'spin' }, { id: 'b', text: 'spiral dive' }, { id: 'c', text: 'stall' }, { id: 'd', text: 'all of these are loss-of-control' }], correctId: 'd', explanationTr: 'Spin (rotation around vertical axis), spiral dive (rapid descending turn), stall (lift loss) = three loss-of-control modes.' },
  { id: 'icao4_s3_v12', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The ___ runway was used due to wind shift.', options: [{ id: 'a', text: 'reciprocal' }, { id: 'b', text: 'opposite' }, { id: 'c', text: 'reverse' }, { id: 'd', text: 'a or b' }], correctId: 'd', explanationTr: 'Reciprocal runway = aynı pist diğer yönden. RWY 06 ↔ RWY 24 (180° fark). Wind direction değişikliği başlıca sebep.' },
  { id: 'icao4_s3_v13', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The ___ phase covers takeoff to 1,500 feet AGL.', options: [{ id: 'a', text: 'departure' }, { id: 'b', text: 'initial climb' }, { id: 'c', text: 'after-takeoff' }, { id: 'd', text: 'all of these are similar' }], correctId: 'b', explanationTr: 'Initial climb = takeoff thrust reduction + flap retraction faz. 1500 ft AGL üstü "climb" begin.' },
  { id: 'icao4_s3_v14', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The aircraft was ___ above maximum operating altitude.', options: [{ id: 'a', text: 'climbing' }, { id: 'b', text: 'unable to climb' }, { id: 'c', text: 'at ceiling' }, { id: 'd', text: 'b or c' }], correctId: 'd', explanationTr: 'Service ceiling = uçağın çıkabileceği maks altitude. Mass + temperature + bahsi geçen koşullara göre değişir.' },
  { id: 'icao4_s3_v15', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The pilot encountered ___ during cruise.', options: [{ id: 'a', text: 'CAT (Clear Air Turbulence)' }, { id: 'b', text: 'wake turbulence' }, { id: 'c', text: 'thermal turbulence' }, { id: 'd', text: 'all are possible' }], correctId: 'd', explanationTr: 'CAT, wake turbulence, thermal turbulence — üçü de cruise fazında karşılaşılabilir; sebep ve önleme farklı.' },
  { id: 'icao4_s3_v16', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The flight attendants administered ___ to a passenger.', options: [{ id: 'a', text: 'first aid' }, { id: 'b', text: 'oxygen' }, { id: 'c', text: 'CPR' }, { id: 'd', text: 'all of these per training' }], correctId: 'd', explanationTr: 'Cabin crew first aid training: oxygen administration, CPR, AED kullanımı, basic injury management.' },
  { id: 'icao4_s3_v17', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'A ___ approach uses GPS-based navigation.', options: [{ id: 'a', text: 'RNAV' }, { id: 'b', text: 'RNP' }, { id: 'c', text: 'GLS' }, { id: 'd', text: 'all of the above' }], correctId: 'd', explanationTr: 'RNAV (Area Navigation), RNP (Required Navigation Performance), GLS (GBAS Landing System) — tümü GPS-based modern approach types.' },
  { id: 'icao4_s3_v18', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The ___ display shows attitude and flight path.', options: [{ id: 'a', text: 'PFD' }, { id: 'b', text: 'ND' }, { id: 'c', text: 'EICAS' }, { id: 'd', text: 'MCDU' }], correctId: 'a', explanationTr: 'PFD = Primary Flight Display. Attitude indicator + airspeed + altitude + heading + glideslope/localizer hepsi tek ekranda.' },
  { id: 'icao4_s3_v19', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The crew received a ___ alert from TCAS.', options: [{ id: 'a', text: 'TA' }, { id: 'b', text: 'RA' }, { id: 'c', text: 'a then b' }, { id: 'd', text: 'b only' }], correctId: 'c', explanationTr: 'TCAS önce TA (Traffic Advisory) verir — pilot alert. Sonra trafik yaklaşmaya devam ederse RA (Resolution Advisory) — climb/descend komutu.' },
  { id: 'icao4_s3_v20', examId: EXAM_ID, sectionId: 'icao_w_voc', level: 'B2', question: 'The ___ procedure was used to descend through icing conditions.', options: [{ id: 'a', text: 'continuous descent' }, { id: 'b', text: 'step descent' }, { id: 'c', text: 'rapid descent' }, { id: 'd', text: 'either could work' }], correctId: 'd', explanationTr: 'Icing penetrationda anti-ice systems aktif + appropriate descent. Step ya da continuous descent durumda göre seçilir.' },

  // Phraseology 15
  { id: 'icao4_s3_p01', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Cleared visual approach runway 24" izni:', options: [{ id: 'a', text: 'Pist görünüyorsa visual reference ile yaklaş.' }, { id: 'b', text: 'Sadece IFR ile.' }, { id: 'c', text: 'Holding pattern.' }, { id: 'd', text: 'Diversion.' }], correctId: 'a', explanationTr: 'Visual approach = pilot pisti görüyor + visual reference ile alçalır. ILS gibi precision aid kullanmaz, ama pilot kendi separation\'ını sağlar.' },
  { id: 'icao4_s3_p02', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Reduce to 220 knots, increase as feasible after MOLPI" pilot için:', options: [{ id: 'a', text: 'MOLPI öncesi 220 knot, sonrası uygun olduğunda artır.' }, { id: 'b', text: 'Hep 220 knot.' }, { id: 'c', text: 'MOLPI sonrası dur.' }, { id: 'd', text: 'Holding.' }], correctId: 'a', explanationTr: '"Increase as feasible" = pilot uygun bulduğunda hızlandır. ATC sequencing için flexibility veriyor.' },
  { id: 'icao4_s3_p03', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Read back correct" ATC tarafından söylendiğinde:', options: [{ id: 'a', text: 'Pilot read-back doğru, devam.' }, { id: 'b', text: 'Pilot read-back yanlış, tekrar et.' }, { id: 'c', text: 'Frekans değiştir.' }, { id: 'd', text: 'Acil durum.' }], correctId: 'a', explanationTr: 'Read-back/hear-back loop tamam: pilot tekrar eder, ATC doğru olduğunu onaylar. Yanlışsa "negative, I say again..."' },
  { id: 'icao4_s3_p04', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Squawk Mode Charlie" pilot için:', options: [{ id: 'a', text: 'Transponder altitude reporting aç.' }, { id: 'b', text: 'Acil durum kodu.' }, { id: 'c', text: 'Transponder kapat.' }, { id: 'd', text: 'Frekans değiştir.' }], correctId: 'a', explanationTr: 'Mode C = altitude encoding aktivasyonu. ATC hem trafiğin pozisyonunu hem altitude\'unu görür. Mode S = ek data link.' },
  { id: 'icao4_s3_p05', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Cleared low approach runway 35L" izni:', options: [{ id: 'a', text: 'Iniş yapmadan pist üzerinde alçal + go-around.' }, { id: 'b', text: 'Iniş yap.' }, { id: 'c', text: 'Holding pattern.' }, { id: 'd', text: 'Acil iniş.' }], correctId: 'a', explanationTr: 'Low approach = pratik amaçlı ama iniş yapmadan pist üzerinden geçiş. Sonrasında go-around (touch-and-go ile karıştırılmamalı).' },
  { id: 'icao4_s3_p06', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Position and hold" yerine modern ICAO tabiri:', options: [{ id: 'a', text: 'Line up and wait.' }, { id: 'b', text: 'Hold short.' }, { id: 'c', text: 'Cleared for takeoff.' }, { id: 'd', text: 'Stand by.' }], correctId: 'a', explanationTr: 'ABD eski "position and hold" → ICAO modern "line up and wait". Pist üstüne gir + bekle.' },
  { id: 'icao4_s3_p07', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Climb via SID" izni:', options: [{ id: 'a', text: 'SID rota + altitude restrictions takip ederek tırman.' }, { id: 'b', text: 'Direkt cruise altitude\'a tırman.' }, { id: 'c', text: 'Holding.' }, { id: 'd', text: 'Heading 360.' }], correctId: 'a', explanationTr: 'Climb via SID = Standard Instrument Departure prosedürü içindeki tüm altitude/speed restrictions korunur.' },
  { id: 'icao4_s3_p08', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Reduce 250 knots below 10,000" — bu kim için?', options: [{ id: 'a', text: 'ICAO standardı: FL100 altı maks 250 knot IAS.' }, { id: 'b', text: 'Sadece bu uçak.' }, { id: 'c', text: 'Sadece night.' }, { id: 'd', text: 'Sadece weekend.' }], correctId: 'a', explanationTr: 'ICAO/FAA: 10,000 ft (FL100) altı civil traffic için maks 250 knot IAS — bird strike, midair collision riski azaltır.' },
  { id: 'icao4_s3_p09', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Continue approach" pilot için:', options: [{ id: 'a', text: 'Iniz/pist henüz sahip değil ama final\'a devam.' }, { id: 'b', text: 'Iniş izni verildi.' }, { id: 'c', text: 'Go-around.' }, { id: 'd', text: 'Holding.' }], correctId: 'a', explanationTr: '"Continue approach" = approach yapmaya devam et ama "cleared to land" izni daha verilmedi. ATC trafik clearing.' },
  { id: 'icao4_s3_p10', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Land and hold short of taxiway A" izni (LAHSO):', options: [{ id: 'a', text: 'Iniş yap, taxiway A\'dan önce dur.' }, { id: 'b', text: 'Pist üzeri taxi.' }, { id: 'c', text: 'Iniş ret.' }, { id: 'd', text: 'Holding.' }], correctId: 'a', explanationTr: 'LAHSO = Land And Hold Short Operations. Pilot iniş sonrası belirtilen noktadan önce durmalı; intersection runway operations için.' },
  { id: 'icao4_s3_p11', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Stop transmitting MAYDAY" ATC tarafından söylendiğinde:', options: [{ id: 'a', text: 'Diğer trafiğe sessiz kal komutu (silence frequency).' }, { id: 'b', text: 'MAYDAY iptal.' }, { id: 'c', text: 'Acil durum yok.' }, { id: 'd', text: 'Frekans değiştir.' }], correctId: 'a', explanationTr: '"Stop transmitting MAYDAY" = MAYDAY uçağı dışında diğer trafik frekansı boşaltsın. Acil durum yönetimi için önemli.' },
  { id: 'icao4_s3_p12', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Distress traffic ended" ne demek?', options: [{ id: 'a', text: 'Acil durum bitti, normal frekans kullanımı.' }, { id: 'b', text: 'Yeni acil durum.' }, { id: 'c', text: 'Diversion.' }, { id: 'd', text: 'Holding.' }], correctId: 'a', explanationTr: 'MAYDAY/PAN PAN durumu sonrasında ATC veya pilot "distress traffic ended" deklare eder. Frekans normal trafiğe açılır.' },
  { id: 'icao4_s3_p13', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Direct routing" izni:', options: [{ id: 'a', text: 'Mevcut waypoints atla, direkt destinasyona git.' }, { id: 'b', text: 'Holding pattern.' }, { id: 'c', text: 'Climb.' }, { id: 'd', text: 'Descent.' }], correctId: 'a', explanationTr: 'Direct routing = ATC trafik durumu uygun ise pilota short-cut verir. Fuel saving + time saving.' },
  { id: 'icao4_s3_p14', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Caution wake turbulence" pilot için:', options: [{ id: 'a', text: 'Önce kalkan/inen heavy aircraft\'ın vortex\'inden kaçın.' }, { id: 'b', text: 'Hızlı kalkış.' }, { id: 'c', text: 'Diversion.' }, { id: 'd', text: 'Holding.' }], correctId: 'a', explanationTr: 'Wake turbulence = wingtip vortices, heavy aircraft arkasında 2-3 dakika tehlikeli. Light aircraft için fatal olabilir.' },
  { id: 'icao4_s3_p15', examId: EXAM_ID, sectionId: 'icao_w_phr', level: 'B2', question: '"Radar contact lost" pilot için ne ifade?', options: [{ id: 'a', text: 'ATC artık radarda göremiyor; position report istenecek.' }, { id: 'b', text: 'Acil durum.' }, { id: 'c', text: 'Iniş izni.' }, { id: 'd', text: 'Hız değiştir.' }], correctId: 'a', explanationTr: 'Radar coverage dışında veya transponder failure. ATC pilottan position report ve traffic advisory verir.' },

  // Listening 10
  { id: 'icao4_s3_l01', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK1, due weather, expect 30 minutes delay. Vectors for sequencing." Pilot ne yapar?', context: 'Approach\'ta hava durumu.', options: [{ id: 'a', text: 'Holding/extended vectors için 30 dk hazırlanır.' }, { id: 'b', text: 'Hemen iniş.' }, { id: 'c', text: 'Diversion.' }, { id: 'd', text: 'Climb.' }], correctId: 'a', explanationTr: '30 dk delay = pilot fuel hesabı yapar. Hold fuel yetersizse diversion düşünülür.' },
  { id: 'icao4_s3_l02', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK205, fuel state, please." Pilot cevap?', options: [{ id: 'a', text: 'Endurance + minimum fuel/emergency declaration durumu.' }, { id: 'b', text: 'Hızı.' }, { id: 'c', text: 'Yolcu sayısı.' }, { id: 'd', text: 'Iniş izni.' }], correctId: 'a', explanationTr: '"Fuel state" sorusu = ATC pilotun ne kadar uçabileceğini bilmek istiyor. Endurance + emergency status (e.g. "minimum fuel" — distress yok, ama sequencing priority).' },
  { id: 'icao4_s3_l03', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK808, declared minimum fuel" — ATC ne yapar?', options: [{ id: 'a', text: 'Sequencing priority verir, delay olmazsa diversion gerek.' }, { id: 'b', text: 'Iniş ret.' }, { id: 'c', text: 'Diversion zorunlu.' }, { id: 'd', text: 'Hızlı iniş.' }], correctId: 'a', explanationTr: 'Minimum fuel = pilot delay\'a dayanamaz; ATC priority verir. Distress (MAYDAY FUEL) olmadığı için emergency tedbiri yok ama özen var.' },
  { id: 'icao4_s3_l04', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK333, expect ILS approach runway 06 right, follow the heavy 777 on 5-mile final, caution wake turbulence." Pilot için kritik?', options: [{ id: 'a', text: '777 wake turbulence için 6+ mil separation gerek.' }, { id: 'b', text: 'Hızlı iniş.' }, { id: 'c', text: 'Diversion.' }, { id: 'd', text: 'Holding.' }], correctId: 'a', explanationTr: 'Heavy 777 (wake category H) arkasında medium uçak (M) için 5 nm separation min. Pilot ek tedbir alır.' },
  { id: 'icao4_s3_l05', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK101, you are number 1 for landing, runway 24 left, wind 240 at 12, gusting 22, runway condition wet." Pilot için?', options: [{ id: 'a', text: 'Crosswind component + ıslak pist için iniş hesaplaması.' }, { id: 'b', text: 'Hızlı iniş.' }, { id: 'c', text: 'Diversion.' }, { id: 'd', text: 'Hava değişene kadar bekle.' }], correctId: 'a', explanationTr: 'Wind 240/12G22 + RWY 24 (240°) = headwind tam. Wet runway → braking action azalır, landing distance artar.' },
  { id: 'icao4_s3_l06', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK505, traffic advisory, crossing your altitude one o\'clock, 6 miles." Pilot ne yapmalı?', options: [{ id: 'a', text: 'Görsel arama yapsın, TCAS RA gelirse hareket.' }, { id: 'b', text: 'Hemen tırman.' }, { id: 'c', text: 'Hemen alçal.' }, { id: 'd', text: 'Diversion.' }], correctId: 'a', explanationTr: 'TA (Traffic Advisory) = uyarı, henüz aksiyon değil. Pilot trafiği görmeye çalışır, RA gelirse otomatik takip eder.' },
  { id: 'icao4_s3_l07', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK999, emergency descent, descending, request lower altitude!" — Pilot ne deklare etti?', options: [{ id: 'a', text: 'Cabin pressure loss veya benzer urgency, hızlı descent.' }, { id: 'b', text: 'Routine descent.' }, { id: 'c', text: 'Climb.' }, { id: 'd', text: 'Iniş izni.' }], correctId: 'a', explanationTr: 'Emergency descent = cabin pressure loss en yaygın sebep. Pilot 10,000 ft\'e hızlı iner (oxygen breathing safe altitude).' },
  { id: 'icao4_s3_l08', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK202, runway 35L, cleared for takeoff, no delay." "No delay" ne demek?', options: [{ id: 'a', text: 'Hemen kalkış başlat (trafik yaklaşıyor).' }, { id: 'b', text: 'Bekle.' }, { id: 'c', text: 'Diversion.' }, { id: 'd', text: 'Hold short.' }], correctId: 'a', explanationTr: '"No delay" = kalkışı hemen başlat, hızlı pist boşalt. Genelde inişe gelen trafik nedeniyle.' },
  { id: 'icao4_s3_l09', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK111, vacate runway via taxiway Charlie, contact ground 121.9." Pilot ne yapar?', options: [{ id: 'a', text: 'Iniş sonrası Charlie\'den pist boşalt + ground frekans.' }, { id: 'b', text: 'Pist üzerinde dön.' }, { id: 'c', text: 'Holding.' }, { id: 'd', text: 'Tekrar kalkış.' }], correctId: 'a', explanationTr: 'Vacate runway = pisti boşalt. ATC tower → ground geçişi standart akış.' },
  { id: 'icao4_s3_l10', examId: EXAM_ID, sectionId: 'icao_w_lis', level: 'B2', question: 'TRANSCRIPT: "TK404, missed approach, climbing to 4000, vectors for another approach." Pilot ne yapar?', options: [{ id: 'a', text: 'Go-around prosedürü uygula + 4000 ft\'e tırman.' }, { id: 'b', text: 'Iniş.' }, { id: 'c', text: 'Diversion.' }, { id: 'd', text: 'Holding.' }], correctId: 'a', explanationTr: 'Missed approach = go-around. Pilot publish edilen MAP prosedürünü takip eder + ATC vectors.' },

  // Reading 5
  { id: 'icao4_s3_r01', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2', question: 'PASSAGE: "Crew duty time shall not exceed 14 hours in a 24-hour period for two-pilot operations." Bu kuralın amacı?', context: 'Operations Manual extract.', options: [{ id: 'a', text: 'Yorgunluk önleme (fatigue management).' }, { id: 'b', text: 'Maaş hesaplama.' }, { id: 'c', text: 'Sınav.' }, { id: 'd', text: 'Eğitim.' }], correctId: 'a', explanationTr: 'FTL (Flight Time Limitations) = yorgunluk yönetimi. EASA + FAA + ICAO Annex 6 standartlı.' },
  { id: 'icao4_s3_r02', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2', question: 'METAR: "LTBA 121500Z 21015KT 0800 R35L/0600D FG VV001 18/17 Q1010". Bu durumda iniş?', options: [{ id: 'a', text: 'Yoğun sis (FG), görüş 800 m, vertical visibility 100 ft, CAT III gerekli.' }, { id: 'b', text: 'Açık hava.' }, { id: 'c', text: 'Normal görüş.' }, { id: 'd', text: 'Yağmur.' }], correctId: 'a', explanationTr: 'FG = fog (sis). VV001 = vertical visibility 100 ft. CAT IIIa/b/c approach + autoland gerekir.' },
  { id: 'icao4_s3_r03', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2', question: 'NOTAM: "AERODROME LTAC CLSD DUE FLOODING 121800-141200". Esenboğa havalimanı:', options: [{ id: 'a', text: '12 Aralık 18:00 ile 14 Aralık 12:00 arası kapalı.' }, { id: 'b', text: 'Açık.' }, { id: 'c', text: 'Sadece kalkış.' }, { id: 'd', text: 'Sadece iniş.' }], correctId: 'a', explanationTr: 'NOTAM tarih formatı DDHHMM. 121800 = ayın 12\'si 18:00 UTC. CLSD = closed (sel nedeniyle).' },
  { id: 'icao4_s3_r04', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2', question: 'PASSAGE: "Pilots must declare a fuel emergency if remaining fuel will result in landing with less than the final reserve." Final reserve nedir?', context: 'Operations Manual fuel policy.', options: [{ id: 'a', text: 'En az 30 dk uçabilecek yakıt (1500 ft AGL holding).' }, { id: 'b', text: 'Tank dolusu.' }, { id: 'c', text: 'Tank boş.' }, { id: 'd', text: 'Sadece taxi yakıtı.' }], correctId: 'a', explanationTr: 'EU-OPS / EASA: Final reserve = 30 min holding fuel at 1500 ft AGL. Bu seviyenin altına düşmek emergency declarasyonu zorunlu.', reference: 'EASA Air-OPS' },
  { id: 'icao4_s3_r05', examId: EXAM_ID, sectionId: 'icao_w_read', level: 'B2', question: 'TAF: "LTAC 121200Z 1212/1318 VRB03KT CAVOK BECMG 1218/1220 21015G25KT 5000 SHRA SCT020CB". Saat 19 UTC bekleniyor:', options: [{ id: 'a', text: 'Rüzgar 210/15 G25, sağanak yağış, CB.' }, { id: 'b', text: 'CAVOK.' }, { id: 'c', text: 'Sis.' }, { id: 'd', text: 'Kar.' }], correctId: 'a', explanationTr: 'BECMG 1218/1220 = 18-20 UTC kalıcı geçiş. SHRA = shower rain. CB = cumulonimbus. 19:00 UTC tam transition zamanı.' },
];

// ═══════════════════════════════════════════════════════════════════
//  EXPORT
// ═══════════════════════════════════════════════════════════════════

export const ICAO4_QUESTION_SETS: Record<string, ExamQuestion[]> = {
  set1: SET_1,
  set2: SET_2,
  set3: SET_3,
};

export const ICAO4_ALL_QUESTIONS: ExamQuestion[] = [...SET_1, ...SET_2, ...SET_3];

/**
 * Belirli bir section + difficulty için soru havuzu döndür.
 * Sınav simülasyonunda set'ler arası random seçim için kullanılır.
 */
export function getICAO4Questions(sectionId: string, count?: number): ExamQuestion[] {
  const filtered = ICAO4_ALL_QUESTIONS.filter((q) => q.sectionId === sectionId);
  if (!count) return filtered;
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Belirli bir set'in toplam sorularını döndür.
 */
export function getICAO4Set(setId: 'set1' | 'set2' | 'set3'): ExamQuestion[] {
  return ICAO4_QUESTION_SETS[setId] ?? [];
}

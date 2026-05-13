#!/usr/bin/env node
/**
 * scripts/generate-readback-clearances.mjs
 *
 * Claude API (claude-sonnet-4-5) ile ATC readback clearance üret.
 *
 * Kullanım:
 *   node --env-file=.env.local scripts/generate-readback-clearances.mjs --preview
 *   node --env-file=.env.local scripts/generate-readback-clearances.mjs --batch
 *
 * Output:
 *   --preview → scripts/readback-preview.json (3 sample)
 *   --batch   → scripts/readback-generated.json (175 satır)
 *
 * NOT: --batch DB'ye yazmaz, sadece JSON üretir. DB import için ayrı script.
 */
import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY env yok. Çağrı: node --env-file=.env.local ...');
  process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-5';

// ═══════════════════════════════════════════════════════
// HEDEF KÜMELER
// ═══════════════════════════════════════════════════════
const PREVIEW_TARGETS = [
  { role: 'pilot',      level: 'B1', sub_role: 'a320',          category: 'approach',          theme: 'ILS approach clearance with descent' },
  { role: 'technician', level: 'B2', sub_role: 'tech_line',     category: 'maintenance_comm',  theme: 'Hydraulic snag report to maintenance control' },
  { role: 'cabin',      level: 'B1', sub_role: 'cabin_purser',  category: 'ground_ops',        theme: 'Cabin secure report to cockpit before pushback' },
];

// FULL_TARGETS: 175 satır — ADIM 2 (batch) için tanımlı
const FULL_TARGETS = [
  // ─── pilot: 30 (a320, b737, helicopter, atr varyantları) ───
  { role: 'pilot', level: 'A2', sub_role: 'a320',       category: 'taxi',       theme: 'Initial taxi clearance with runway hold short' },
  { role: 'pilot', level: 'A2', sub_role: 'a320',       category: 'taxi',       theme: 'Taxi via specific taxiways' },
  { role: 'pilot', level: 'B1', sub_role: 'a320',       category: 'departure',  theme: 'Initial climb clearance with heading' },
  { role: 'pilot', level: 'B1', sub_role: 'a320',       category: 'departure',  theme: 'SID assignment with transition' },
  { role: 'pilot', level: 'B1', sub_role: 'a320',       category: 'enroute',    theme: 'Cruise altitude change request' },
  { role: 'pilot', level: 'B2', sub_role: 'a320',       category: 'enroute',    theme: 'Direct routing to waypoint' },
  { role: 'pilot', level: 'B2', sub_role: 'a320',       category: 'approach',   theme: 'STAR transition clearance' },
  { role: 'pilot', level: 'B2', sub_role: 'a320',       category: 'approach',   theme: 'Vector for visual approach' },
  { role: 'pilot', level: 'B1', sub_role: 'a320',       category: 'landing',    theme: 'Land and hold short instruction (LAHSO)' },
  { role: 'pilot', level: 'B2', sub_role: 'a320',       category: 'emergency',  theme: 'Engine fire declared inbound' },
  { role: 'pilot', level: 'A2', sub_role: 'b737',       category: 'taxi',       theme: 'Ramp to runway taxi via Alpha' },
  { role: 'pilot', level: 'B1', sub_role: 'b737',       category: 'departure',  theme: 'Cleared for takeoff with wind check' },
  { role: 'pilot', level: 'B1', sub_role: 'b737',       category: 'departure',  theme: 'Crossing restriction during climb' },
  { role: 'pilot', level: 'B2', sub_role: 'b737',       category: 'enroute',    theme: 'Speed restriction enroute' },
  { role: 'pilot', level: 'B2', sub_role: 'b737',       category: 'approach',   theme: 'Holding pattern clearance' },
  { role: 'pilot', level: 'B1', sub_role: 'b737',       category: 'landing',    theme: 'Go-around due to traffic on runway' },
  { role: 'pilot', level: 'B1', sub_role: 'b737',       category: 'emergency',  theme: 'PAN-PAN medical emergency divert' },
  { role: 'pilot', level: 'B1', sub_role: 'helicopter', category: 'departure',  theme: 'Helicopter ramp departure clearance' },
  { role: 'pilot', level: 'B2', sub_role: 'helicopter', category: 'enroute',    theme: 'Low-level corridor flight following' },
  { role: 'pilot', level: 'B1', sub_role: 'helicopter', category: 'landing',    theme: 'Hospital helipad approach clearance' },
  { role: 'pilot', level: 'A2', sub_role: 'atr',        category: 'taxi',       theme: 'Regional turboprop taxi to runway 24' },
  { role: 'pilot', level: 'B1', sub_role: 'atr',        category: 'departure',  theme: 'Low altitude turboprop departure' },
  { role: 'pilot', level: 'B1', sub_role: 'atr',        category: 'enroute',    theme: 'VFR flight following enroute' },
  { role: 'pilot', level: 'B1', sub_role: 'atr',        category: 'approach',   theme: 'Circling approach to runway' },
  { role: 'pilot', level: 'A2', sub_role: 'atr',        category: 'landing',    theme: 'Short runway landing clearance' },
  { role: 'pilot', level: 'C1', sub_role: 'a320',       category: 'emergency',  theme: 'MAYDAY engine flameout fuel low' },
  { role: 'pilot', level: 'C1', sub_role: 'b737',       category: 'emergency',  theme: 'Pressurization failure rapid descent' },
  { role: 'pilot', level: 'C1', sub_role: 'a320',       category: 'emergency',  theme: 'Bird strike with engine vibration' },
  { role: 'pilot', level: 'B2', sub_role: 'a320',       category: 'enroute',    theme: 'Weather deviation request' },
  { role: 'pilot', level: 'B2', sub_role: 'b737',       category: 'approach',   theme: 'Missed approach with new vector' },

  // ─── atc: 25 (tower, approach, ground, en-route) ───
  { role: 'atc', level: 'B1', sub_role: 'tower',        category: 'departure',  theme: 'Issue takeoff clearance with wind' },
  { role: 'atc', level: 'B1', sub_role: 'tower',        category: 'landing',    theme: 'Cleared to land with traffic info' },
  { role: 'atc', level: 'B2', sub_role: 'tower',        category: 'emergency',  theme: 'Aircraft declares emergency on final' },
  { role: 'atc', level: 'B1', sub_role: 'tower',        category: 'landing',    theme: 'Runway change late on approach' },
  { role: 'atc', level: 'B2', sub_role: 'tower',        category: 'departure',  theme: 'Line up and wait clearance' },
  { role: 'atc', level: 'B1', sub_role: 'approach',     category: 'approach',   theme: 'Vector for ILS final' },
  { role: 'atc', level: 'B2', sub_role: 'approach',     category: 'approach',   theme: 'Sequence two aircraft for parallel runways' },
  { role: 'atc', level: 'B2', sub_role: 'approach',     category: 'approach',   theme: 'Speed control for sequencing' },
  { role: 'atc', level: 'C1', sub_role: 'approach',     category: 'emergency',  theme: 'Coordinate emergency landing priority' },
  { role: 'atc', level: 'B2', sub_role: 'approach',     category: 'enroute',    theme: 'Handoff to tower on final' },
  { role: 'atc', level: 'A2', sub_role: 'ground',       category: 'taxi',       theme: 'Pushback approval with facing direction' },
  { role: 'atc', level: 'B1', sub_role: 'ground',       category: 'taxi',       theme: 'Taxi clearance with hold short instruction' },
  { role: 'atc', level: 'B1', sub_role: 'ground',       category: 'ground_ops', theme: 'Engine start approval' },
  { role: 'atc', level: 'B2', sub_role: 'ground',       category: 'taxi',       theme: 'Complex taxi via multiple intersections' },
  { role: 'atc', level: 'B1', sub_role: 'ground',       category: 'ground_ops', theme: 'Frequency change to tower' },
  { role: 'atc', level: 'B2', sub_role: 'enroute',      category: 'enroute',    theme: 'Cruise altitude change approval' },
  { role: 'atc', level: 'B2', sub_role: 'enroute',      category: 'enroute',    theme: 'Direct routing approval' },
  { role: 'atc', level: 'B2', sub_role: 'enroute',      category: 'enroute',    theme: 'Traffic advisory for crossing aircraft' },
  { role: 'atc', level: 'C1', sub_role: 'enroute',      category: 'emergency',  theme: 'Weather diversion coordination' },
  { role: 'atc', level: 'B2', sub_role: 'enroute',      category: 'enroute',    theme: 'Handoff between FIR sectors' },
  { role: 'atc', level: 'B1', sub_role: 'tower',        category: 'taxi',       theme: 'Runway crossing clearance with traffic' },
  { role: 'atc', level: 'B2', sub_role: 'tower',        category: 'departure',  theme: 'Reduced separation departure' },
  { role: 'atc', level: 'C1', sub_role: 'tower',        category: 'emergency',  theme: 'Aborted takeoff coordination' },
  { role: 'atc', level: 'B1', sub_role: 'approach',     category: 'approach',   theme: 'Visual approach approval' },
  { role: 'atc', level: 'B2', sub_role: 'approach',     category: 'approach',   theme: 'Hold instruction with EFC time' },

  // ─── cabin: 25 (purser, ekonomi, business, first) ───
  { role: 'cabin', level: 'A2', sub_role: 'cabin_purser',   category: 'ground_ops',  theme: 'Cabin secure report to cockpit' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_purser',   category: 'ground_ops',  theme: 'Doors armed and cross-checked' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_purser',   category: 'ground_ops',  theme: 'PA boarding complete report' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_purser',   category: 'emergency',   theme: 'Medical emergency communication to captain' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_purser',   category: 'emergency',   theme: 'Unruly passenger captain notification' },
  { role: 'cabin', level: 'A2', sub_role: 'cabin_economy',  category: 'ground_ops',  theme: 'Passenger seat assignment query' },
  { role: 'cabin', level: 'A2', sub_role: 'cabin_economy',  category: 'ground_ops',  theme: 'Welcome announcement readback' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_economy',  category: 'ground_ops',  theme: 'Seatbelt fastened verification' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_economy',  category: 'enroute',     theme: 'Cabin service announcement timing' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_economy',  category: 'emergency',   theme: 'Turbulence brace position command' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_business', category: 'ground_ops',  theme: 'Premium passenger pre-boarding' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_business', category: 'enroute',     theme: 'Meal service confirmation' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_business', category: 'enroute',     theme: 'Special meal request handling' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_business', category: 'landing',     theme: 'Cabin prep for landing announcement' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_business', category: 'emergency',   theme: 'Equipment failure inflight' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_first',    category: 'ground_ops',  theme: 'First class boarding sequence' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_first',    category: 'enroute',     theme: 'Bedding setup for long-haul' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_first',    category: 'emergency',   theme: 'Premium passenger emergency assistance' },
  { role: 'cabin', level: 'C1', sub_role: 'cabin_first',    category: 'emergency',   theme: 'VIP medical event with priority comm' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_first',    category: 'landing',     theme: 'Disembark coordination with ground' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_purser',   category: 'landing',     theme: 'Final cabin check before landing' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_purser',   category: 'emergency',   theme: 'Smoke in cabin captain coordination' },
  { role: 'cabin', level: 'C1', sub_role: 'cabin_purser',   category: 'emergency',   theme: 'Evacuation command sequence' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_economy',  category: 'enroute',     theme: 'Wheelchair passenger update' },
  { role: 'cabin', level: 'A2', sub_role: 'cabin_economy',  category: 'landing',     theme: 'Disembark announcement' },

  // ─── technician: 25 (line, a_check, c_check, engine, landing_gear) ───
  { role: 'technician', level: 'B1', sub_role: 'tech_line',         category: 'maintenance_comm', theme: 'Pre-departure walk-around defect report' },
  { role: 'technician', level: 'B2', sub_role: 'tech_line',         category: 'maintenance_comm', theme: 'Hydraulic pressure drop report' },
  { role: 'technician', level: 'B1', sub_role: 'tech_line',         category: 'maintenance_comm', theme: 'APU start failure post-flight' },
  { role: 'technician', level: 'B2', sub_role: 'tech_line',         category: 'maintenance_comm', theme: 'MEL item dispatch decision' },
  { role: 'technician', level: 'B1', sub_role: 'tech_line',         category: 'maintenance_comm', theme: 'Tech log entry for snag closure' },
  { role: 'technician', level: 'B1', sub_role: 'tech_a_check',      category: 'maintenance_comm', theme: 'A-check scheduling coordination' },
  { role: 'technician', level: 'B2', sub_role: 'tech_a_check',      category: 'maintenance_comm', theme: 'Routine inspection findings report' },
  { role: 'technician', level: 'B1', sub_role: 'tech_a_check',      category: 'maintenance_comm', theme: 'Tire wear replacement decision' },
  { role: 'technician', level: 'B2', sub_role: 'tech_a_check',      category: 'maintenance_comm', theme: 'Brake assembly inspection report' },
  { role: 'technician', level: 'B2', sub_role: 'tech_a_check',      category: 'maintenance_comm', theme: 'Cabin pressure leak test report' },
  { role: 'technician', level: 'B2', sub_role: 'tech_c_check',      category: 'maintenance_comm', theme: 'Heavy maintenance findings escalation' },
  { role: 'technician', level: 'C1', sub_role: 'tech_c_check',      category: 'maintenance_comm', theme: 'Structural crack discovery coordination' },
  { role: 'technician', level: 'B2', sub_role: 'tech_c_check',      category: 'maintenance_comm', theme: 'Avionics upgrade certification' },
  { role: 'technician', level: 'C1', sub_role: 'tech_c_check',      category: 'maintenance_comm', theme: 'Aircraft return to service decision' },
  { role: 'technician', level: 'B2', sub_role: 'tech_c_check',      category: 'maintenance_comm', theme: 'Component replacement signoff' },
  { role: 'technician', level: 'B2', sub_role: 'tech_engine',       category: 'maintenance_comm', theme: 'Engine borescope inspection findings' },
  { role: 'technician', level: 'C1', sub_role: 'tech_engine',       category: 'maintenance_comm', theme: 'EGT trend monitoring escalation' },
  { role: 'technician', level: 'B2', sub_role: 'tech_engine',       category: 'maintenance_comm', theme: 'Engine oil consumption snag' },
  { role: 'technician', level: 'C1', sub_role: 'tech_engine',       category: 'maintenance_comm', theme: 'AOG engine replacement coordination' },
  { role: 'technician', level: 'B2', sub_role: 'tech_engine',       category: 'maintenance_comm', theme: 'Engine performance check after maintenance' },
  { role: 'technician', level: 'B2', sub_role: 'tech_landing_gear', category: 'maintenance_comm', theme: 'Landing gear retraction test' },
  { role: 'technician', level: 'B2', sub_role: 'tech_landing_gear', category: 'maintenance_comm', theme: 'Tire pressure check report' },
  { role: 'technician', level: 'C1', sub_role: 'tech_landing_gear', category: 'maintenance_comm', theme: 'Hydraulic actuator replacement' },
  { role: 'technician', level: 'B2', sub_role: 'tech_landing_gear', category: 'maintenance_comm', theme: 'Brake wear inspection signoff' },
  { role: 'technician', level: 'C1', sub_role: 'tech_landing_gear', category: 'maintenance_comm', theme: 'Landing gear collapse incident report' },

  // ─── ground: 25 (pushback, marshalling, refueling, deicing, baggage) ───
  { role: 'ground', level: 'A2', sub_role: 'ground_pushback',   category: 'ground_ops', theme: 'Pushback start confirmation with cockpit' },
  { role: 'ground', level: 'B1', sub_role: 'ground_pushback',   category: 'ground_ops', theme: 'Pushback complete and brake set' },
  { role: 'ground', level: 'B1', sub_role: 'ground_pushback',   category: 'ground_ops', theme: 'Towing release confirmation' },
  { role: 'ground', level: 'B2', sub_role: 'ground_pushback',   category: 'emergency',  theme: 'Pushback aborted due to obstacle' },
  { role: 'ground', level: 'A2', sub_role: 'ground_pushback',   category: 'ground_ops', theme: 'Bypass pin removal report' },
  { role: 'ground', level: 'A2', sub_role: 'ground_marshalling',category: 'ground_ops', theme: 'Aircraft taxi-in marshalling start' },
  { role: 'ground', level: 'B1', sub_role: 'ground_marshalling',category: 'ground_ops', theme: 'Stop signal and chocks in place' },
  { role: 'ground', level: 'B1', sub_role: 'ground_marshalling',category: 'ground_ops', theme: 'Turn left signal with wing clearance' },
  { role: 'ground', level: 'B2', sub_role: 'ground_marshalling',category: 'emergency',  theme: 'Wing clearance warning to cockpit' },
  { role: 'ground', level: 'A2', sub_role: 'ground_marshalling',category: 'ground_ops', theme: 'Engine shutdown signal confirmation' },
  { role: 'ground', level: 'B1', sub_role: 'ground_refueling',  category: 'ground_ops', theme: 'Fuel quantity request to cockpit' },
  { role: 'ground', level: 'B2', sub_role: 'ground_refueling',  category: 'ground_ops', theme: 'Refueling complete signoff' },
  { role: 'ground', level: 'B2', sub_role: 'ground_refueling',  category: 'emergency',  theme: 'Fuel spill emergency response' },
  { role: 'ground', level: 'B1', sub_role: 'ground_refueling',  category: 'ground_ops', theme: 'Refueling truck position confirmation' },
  { role: 'ground', level: 'B2', sub_role: 'ground_refueling',  category: 'ground_ops', theme: 'Hot refueling with passengers onboard' },
  { role: 'ground', level: 'B1', sub_role: 'ground_deicing',    category: 'ground_ops', theme: 'De-icing fluid type and HOT time' },
  { role: 'ground', level: 'B2', sub_role: 'ground_deicing',    category: 'ground_ops', theme: 'Anti-icing application after de-ice' },
  { role: 'ground', level: 'B2', sub_role: 'ground_deicing',    category: 'ground_ops', theme: 'De-icing complete cockpit notification' },
  { role: 'ground', level: 'B1', sub_role: 'ground_deicing',    category: 'ground_ops', theme: 'Holdover time advisory' },
  { role: 'ground', level: 'B2', sub_role: 'ground_deicing',    category: 'emergency',  theme: 'De-ice failure return to gate' },
  { role: 'ground', level: 'A2', sub_role: 'ground_baggage',    category: 'ground_ops', theme: 'Baggage loading complete report' },
  { role: 'ground', level: 'B1', sub_role: 'ground_baggage',    category: 'ground_ops', theme: 'Special baggage handling (fragile/animal)' },
  { role: 'ground', level: 'B1', sub_role: 'ground_baggage',    category: 'ground_ops', theme: 'Cargo loading weight confirmation' },
  { role: 'ground', level: 'B2', sub_role: 'ground_baggage',    category: 'emergency',  theme: 'Damaged baggage report to operations' },
  { role: 'ground', level: 'B1', sub_role: 'ground_baggage',    category: 'ground_ops', theme: 'Connecting bag transfer urgent' },

  // ─── student: 20 (basic ICAO, alfabe, sayı, callsign) ───
  { role: 'student', level: 'A0', sub_role: 'student',  category: 'taxi',       theme: 'Initial callsign exchange practice' },
  { role: 'student', level: 'A1', sub_role: 'student',  category: 'taxi',       theme: 'Frequency change to tower practice' },
  { role: 'student', level: 'A1', sub_role: 'student',  category: 'departure',  theme: 'Basic takeoff clearance readback' },
  { role: 'student', level: 'A2', sub_role: 'student',  category: 'departure',  theme: 'Climb to altitude readback' },
  { role: 'student', level: 'A2', sub_role: 'student',  category: 'enroute',    theme: 'Heading change readback' },
  { role: 'student', level: 'A2', sub_role: 'student',  category: 'enroute',    theme: 'Speed adjustment readback' },
  { role: 'student', level: 'A1', sub_role: 'student',  category: 'approach',   theme: 'Descend to altitude basic' },
  { role: 'student', level: 'A2', sub_role: 'student',  category: 'approach',   theme: 'Vector heading practice' },
  { role: 'student', level: 'A1', sub_role: 'student',  category: 'landing',    theme: 'Cleared to land basic readback' },
  { role: 'student', level: 'A2', sub_role: 'student',  category: 'landing',    theme: 'Runway exit instruction' },
  { role: 'student', level: 'A0', sub_role: 'student',  category: 'taxi',       theme: 'NATO phonetic alphabet drill' },
  { role: 'student', level: 'A0', sub_role: 'student',  category: 'taxi',       theme: 'Number transmission single digits' },
  { role: 'student', level: 'A1', sub_role: 'student',  category: 'enroute',    theme: 'Multi-digit number transmission' },
  { role: 'student', level: 'A1', sub_role: 'student',  category: 'enroute',    theme: 'Frequency readback practice' },
  { role: 'student', level: 'A2', sub_role: 'student',  category: 'taxi',       theme: 'Callsign rephrasing standard' },
  { role: 'student', level: 'A2', sub_role: 'student',  category: 'enroute',    theme: 'Time format reporting' },
  { role: 'student', level: 'A1', sub_role: 'student',  category: 'taxi',       theme: 'Hold short readback practice' },
  { role: 'student', level: 'A2', sub_role: 'student',  category: 'enroute',    theme: 'Altimeter setting (QNH) readback' },
  { role: 'student', level: 'A1', sub_role: 'student',  category: 'departure',  theme: 'Wind information readback' },
  { role: 'student', level: 'A2', sub_role: 'student',  category: 'emergency',  theme: 'Mayday call practice basic' },

  // ─── dispatcher: 25 (METAR, NOTAM, ETOPS, divert, fuel) ───
  { role: 'dispatcher', level: 'B1', sub_role: 'dispatcher', category: 'enroute',          theme: 'METAR weather brief to crew' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'TAF forecast for arrival airport' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'SIGMET advisory transmission' },
  { role: 'dispatcher', level: 'B1', sub_role: 'dispatcher', category: 'enroute',          theme: 'NOTAM runway closure brief' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'NOTAM ILS out of service notification' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'ETOPS planning communication' },
  { role: 'dispatcher', level: 'C1', sub_role: 'dispatcher', category: 'enroute',          theme: 'ETOPS alternate change' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'Flight plan filing confirmation' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'Route deviation due to weather' },
  { role: 'dispatcher', level: 'C1', sub_role: 'dispatcher', category: 'emergency',        theme: 'Divert decision coordination' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'Fuel uplift coordination' },
  { role: 'dispatcher', level: 'B1', sub_role: 'dispatcher', category: 'enroute',          theme: 'Block fuel calculation report' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'emergency',        theme: 'Fuel emergency declaration support' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'Holding fuel reserve advisory' },
  { role: 'dispatcher', level: 'C1', sub_role: 'dispatcher', category: 'emergency',        theme: 'Minimum fuel alternate planning' },
  { role: 'dispatcher', level: 'B1', sub_role: 'dispatcher', category: 'enroute',          theme: 'Slot time update communication' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'CTOT change notification' },
  { role: 'dispatcher', level: 'B1', sub_role: 'dispatcher', category: 'enroute',          theme: 'Diplomatic clearance status' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'Crew duty time check' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'maintenance_comm', theme: 'MEL deferral communication to crew' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'PIREP collection from crew' },
  { role: 'dispatcher', level: 'B1', sub_role: 'dispatcher', category: 'enroute',          theme: 'Weight and balance update' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'Performance limited dispatch' },
  { role: 'dispatcher', level: 'C1', sub_role: 'dispatcher', category: 'emergency',        theme: 'Volcanic ash advisory routing' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'enroute',          theme: 'HF position report relay' },
];

// ═══════════════════════════════════════════════════════
// PROMPT
// ═══════════════════════════════════════════════════════
const SYSTEM_PROMPT = `You are an aviation English content expert specializing in ICAO phraseology
(Doc 4444, Annex 10, Doc 9432). You generate realistic readback drill content for
aviation English training. You write authentic ATC/crew utterances — not
Hollywood-style. You preserve aviation jargon in English even within Turkish hints.
Output ONLY valid JSON, no markdown fences, no commentary.`;

function userPrompt({ role, sub_role, level, category, theme }) {
  return `Generate a single ATC/aviation readback drill as JSON.

Inputs:
  target_role: ${role}
  target_sub_roles: ${sub_role ? `["${sub_role}"]` : '[]'}
  level: ${level}      (A0/A1/A2 basic, B1/B2 intermediate, C1/C2 advanced)
  category: ${category}
  theme: ${theme}

Output schema (return ONLY this JSON object, no markdown):
{
  "slug": "lowercase-with-hyphens-max-50 unique identifier from theme",
  "level": "${level}",
  "target_role": "${role}",
  "target_sub_roles": ${sub_role ? `["${sub_role}"]` : '[]'},
  "category": "${category}",
  "station": "ATC station / counterpart label (e.g. 'IST TOWER', 'OPS CONTROL', 'MAINTENANCE LINE')",
  "freq": "realistic frequency in dot format (e.g. '118.1', '121.9') OR null if not radio",
  "atc_utterance": "Realistic ATC/counterpart utterance using ICAO phraseology. Real aviation jargon. 1-2 sentences.",
  "expected_readback": "Correct readback by the user. Must echo back required elements (altitude, heading, callsign, etc.).",
  "key_phrases": [
    ["primary key phrase or synonym group"],
    ["secondary required phrase, with abbreviations like 'rwy' or 'fl' as alternates"]
  ],
  "icao_ref": "ICAO document reference (e.g. 'ICAO Doc 4444 Ch.12', 'Annex 10 Vol II', 'Doc 9432')",
  "hint_tr": "Turkish learner hint (1 sentence). Aviation jargon stays English (e.g. 'Heading 270 readback'a callsign sonda eklenir').",
  "hint_en": "English learner hint (1 sentence)."
}

Requirements:
- Real ICAO phraseology (not Hollywood-style)
- Aviation jargon (runway, heading, flight level, callsign, etc.) stays in English even in Turkish hint
- key_phrases: array of arrays. Each inner array = 1 required element with synonyms. Min 3 groups.
- Slug must be unique and descriptive (theme-based, kebab-case, max 50 chars)
- For non-radio communication (maintenance, cabin internal), freq = null and station = role-appropriate label
- atc_utterance must match level: A0/A1 = short simple, B1/B2 = medium complex with conditions, C1/C2 = complex emergency or multi-step`;
}

// ═══════════════════════════════════════════════════════
// GENERATION
// ═══════════════════════════════════════════════════════
async function generateOne(target, idx, total) {
  const startMs = Date.now();
  process.stdout.write(`[${idx + 1}/${total}] ${target.role}/${target.level}/${target.category}/${target.theme.slice(0, 40)}... `);
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt(target) }],
    });
    const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
    const cleaned = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    const ms = Date.now() - startMs;
    console.log(`✓ (${ms}ms, ${msg.usage.input_tokens}→${msg.usage.output_tokens} tok)`);
    return { ok: true, clearance: parsed, usage: msg.usage };
  } catch (e) {
    console.log(`✗ ${e.message?.slice(0, 80)}`);
    return { ok: false, error: e.message };
  }
}

async function generateChunk(chunk, baseIdx, total) {
  return Promise.all(chunk.map((t, i) => generateOne(t, baseIdx + i, total)));
}

// ═══════════════════════════════════════════════════════
// VALIDATE
// ═══════════════════════════════════════════════════════
function validate(c, idx) {
  const issues = [];
  if (!c.slug) issues.push('slug missing');
  if (!c.atc_utterance) issues.push('atc_utterance missing');
  if (!c.expected_readback) issues.push('expected_readback missing');
  if (!Array.isArray(c.key_phrases)) issues.push('key_phrases not array');
  else if (!c.key_phrases.every((g) => Array.isArray(g))) issues.push('key_phrases inner not array');
  else if (c.key_phrases.length < 2) issues.push(`only ${c.key_phrases.length} key_phrases groups (need ≥2)`);
  if (!c.icao_ref) issues.push('icao_ref empty');
  if (!c.hint_tr) issues.push('hint_tr empty');
  if (!c.station) issues.push('station empty');
  return { idx, slug: c.slug, ok: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════
async function main() {
  const mode = process.argv[2] ?? '--preview';
  const targets = mode === '--preview' ? PREVIEW_TARGETS : FULL_TARGETS;

  console.log(`Model: ${MODEL}`);
  console.log(`Mode: ${mode} | ${targets.length} clearance üretilecek (paralel 5'er)\n`);

  const results = [];
  let totalIn = 0;
  let totalOut = 0;
  const CHUNK = 5;
  for (let i = 0; i < targets.length; i += CHUNK) {
    const chunk = targets.slice(i, i + CHUNK);
    const res = await generateChunk(chunk, i, targets.length);
    for (const r of res) {
      if (r.ok) {
        results.push(r.clearance);
        totalIn += r.usage.input_tokens;
        totalOut += r.usage.output_tokens;
      }
    }
  }

  // Validate
  console.log('\n— Validation —');
  const validations = results.map((c, i) => validate(c, i));
  const failed = validations.filter((v) => !v.ok);
  console.log(`Geçerli: ${validations.length - failed.length}/${validations.length}`);
  for (const v of failed) {
    console.log(`  ✗ #${v.idx} (${v.slug}): ${v.issues.join('; ')}`);
  }

  // Output JSON
  const outFile = mode === '--preview' ? 'readback-preview.json' : 'readback-generated.json';
  const out = resolve(ROOT, `scripts/${outFile}`);
  writeFileSync(out, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n✅ ${results.length}/${targets.length} clearance üretildi → scripts/${outFile}`);

  // Cost (Sonnet 4.5: $3/M in, $15/M out)
  const cost = (totalIn / 1_000_000) * 3 + (totalOut / 1_000_000) * 15;
  console.log(`   Token: ${totalIn} input + ${totalOut} output`);
  console.log(`   Maliyet: $${cost.toFixed(4)} (Sonnet 4.5)`);

  // Tahmini batch maliyet (preview için)
  if (mode === '--preview') {
    const avgIn = totalIn / results.length;
    const avgOut = totalOut / results.length;
    const batchCost = ((avgIn * 175) / 1_000_000) * 3 + ((avgOut * 175) / 1_000_000) * 15;
    console.log(`\n   Tahmini batch (175 satır) maliyet: $${batchCost.toFixed(2)}`);
  }
}

main().catch((e) => {
  console.error('FAIL:', e);
  process.exit(1);
});

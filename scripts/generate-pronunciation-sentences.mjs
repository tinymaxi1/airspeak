#!/usr/bin/env node
/**
 * scripts/generate-pronunciation-sentences.mjs
 *
 * Claude API ile aviation pronunciation training sentence üret.
 *
 * Çağrı:
 *   export ANTHROPIC_API_KEY=$(grep '^ANTHROPIC_API_KEY=' .env.local | cut -d= -f2-)
 *   node scripts/generate-pronunciation-sentences.mjs --preview
 *   node scripts/generate-pronunciation-sentences.mjs --batch
 */
import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY env yok.');
  process.exit(1);
}
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-5';

const PREVIEW_TARGETS = [
  { role: 'pilot',      level: 'B1', sub_role: 'a320',         category: 'phraseology', theme: 'Climb to flight level readback' },
  { role: 'technician', level: 'B2', sub_role: 'tech_line',    category: 'vocabulary',  theme: 'Hydraulic system terminology' },
  { role: 'cabin',      level: 'A2', sub_role: 'cabin_purser', category: 'phrase',      theme: 'Welcome aboard passenger greeting' },
];

const FULL_TARGETS = [
  // pilot: 30 (callouts, phraseology, briefings)
  { role: 'pilot', level: 'A2', sub_role: 'a320',      category: 'phraseology', theme: 'Cleared for takeoff readback' },
  { role: 'pilot', level: 'A2', sub_role: 'a320',      category: 'phraseology', theme: 'Climbing flight level callout' },
  { role: 'pilot', level: 'B1', sub_role: 'a320',      category: 'phraseology', theme: 'Heading vector readback' },
  { role: 'pilot', level: 'B1', sub_role: 'a320',      category: 'phraseology', theme: 'Speed adjustment readback' },
  { role: 'pilot', level: 'B1', sub_role: 'a320',      category: 'callsign',    theme: 'Turkish callsign with flight number' },
  { role: 'pilot', level: 'B2', sub_role: 'a320',      category: 'phraseology', theme: 'Approach clearance with QNH' },
  { role: 'pilot', level: 'B2', sub_role: 'a320',      category: 'command',     theme: 'Established on localizer report' },
  { role: 'pilot', level: 'A2', sub_role: 'b737',      category: 'phraseology', theme: 'Taxi to runway readback' },
  { role: 'pilot', level: 'B1', sub_role: 'b737',      category: 'phraseology', theme: 'Cleared to land with runway' },
  { role: 'pilot', level: 'B1', sub_role: 'b737',      category: 'command',     theme: 'Going around due to traffic' },
  { role: 'pilot', level: 'B2', sub_role: 'b737',      category: 'phrase',      theme: 'Pre-flight briefing crew callout' },
  { role: 'pilot', level: 'B2', sub_role: 'b737',      category: 'phrase',      theme: 'Top of descent briefing' },
  { role: 'pilot', level: 'B1', sub_role: 'helicopter',category: 'phraseology', theme: 'Helicopter departure clearance' },
  { role: 'pilot', level: 'B1', sub_role: 'helicopter',category: 'phraseology', theme: 'Hover taxi instruction' },
  { role: 'pilot', level: 'A2', sub_role: 'atr',       category: 'phraseology', theme: 'Cleared for approach readback' },
  { role: 'pilot', level: 'A2', sub_role: 'atr',       category: 'phraseology', theme: 'Reduce speed to 180 knots' },
  { role: 'pilot', level: 'B1', sub_role: 'atr',       category: 'callsign',    theme: 'Regional callsign exchange' },
  { role: 'pilot', level: 'C1', sub_role: 'a320',      category: 'command',     theme: 'Mayday engine failure declaration' },
  { role: 'pilot', level: 'C1', sub_role: 'b737',      category: 'command',     theme: 'PAN-PAN medical urgency call' },
  { role: 'pilot', level: 'C1', sub_role: 'a320',      category: 'phrase',      theme: 'Rapid descent emergency announcement' },
  { role: 'pilot', level: 'B2', sub_role: 'a320',      category: 'phrase',      theme: 'V1 V2 takeoff callouts' },
  { role: 'pilot', level: 'B2', sub_role: 'a320',      category: 'phrase',      theme: '1000 feet to go callout' },
  { role: 'pilot', level: 'B1', sub_role: 'a320',      category: 'phrase',      theme: 'Stable approach callout' },
  { role: 'pilot', level: 'B2', sub_role: 'b737',      category: 'phrase',      theme: 'Decision altitude callout' },
  { role: 'pilot', level: 'B1', sub_role: 'b737',      category: 'phrase',      theme: 'Gear down landing checklist' },
  { role: 'pilot', level: 'A2', sub_role: 'a320',      category: 'callsign',    theme: 'Frequency change acknowledgement' },
  { role: 'pilot', level: 'B2', sub_role: 'a320',      category: 'phraseology', theme: 'Holding pattern entry readback' },
  { role: 'pilot', level: 'B2', sub_role: 'b737',      category: 'phraseology', theme: 'Direct routing to waypoint' },
  { role: 'pilot', level: 'B1', sub_role: 'a320',      category: 'phraseology', theme: 'Squawk transponder code readback' },
  { role: 'pilot', level: 'B1', sub_role: 'atr',       category: 'phraseology', theme: 'Wind information acknowledgement' },

  // atc: 25
  { role: 'atc', level: 'B1', sub_role: 'tower',    category: 'command',     theme: 'Cleared for takeoff with wind' },
  { role: 'atc', level: 'B1', sub_role: 'tower',    category: 'command',     theme: 'Cleared to land traffic call' },
  { role: 'atc', level: 'B2', sub_role: 'tower',    category: 'command',     theme: 'Go around instruction with reason' },
  { role: 'atc', level: 'B1', sub_role: 'tower',    category: 'callsign',    theme: 'Airline callsign callout' },
  { role: 'atc', level: 'B2', sub_role: 'tower',    category: 'command',     theme: 'Line up and wait instruction' },
  { role: 'atc', level: 'B1', sub_role: 'approach', category: 'command',     theme: 'Turn right heading vector' },
  { role: 'atc', level: 'B2', sub_role: 'approach', category: 'command',     theme: 'Descend to altitude QNH' },
  { role: 'atc', level: 'B2', sub_role: 'approach', category: 'command',     theme: 'Reduce speed 210 knots' },
  { role: 'atc', level: 'C1', sub_role: 'approach', category: 'command',     theme: 'Vectored for emergency landing' },
  { role: 'atc', level: 'B2', sub_role: 'approach', category: 'phraseology', theme: 'Cleared ILS approach runway' },
  { role: 'atc', level: 'A2', sub_role: 'ground',   category: 'command',     theme: 'Pushback approved facing direction' },
  { role: 'atc', level: 'B1', sub_role: 'ground',   category: 'command',     theme: 'Taxi to runway via taxiway' },
  { role: 'atc', level: 'B1', sub_role: 'ground',   category: 'command',     theme: 'Hold short of runway instruction' },
  { role: 'atc', level: 'B2', sub_role: 'ground',   category: 'phraseology', theme: 'Contact tower on frequency' },
  { role: 'atc', level: 'B1', sub_role: 'ground',   category: 'callsign',    theme: 'Ground frequency identification' },
  { role: 'atc', level: 'B2', sub_role: 'enroute',  category: 'command',     theme: 'Climb to flight level' },
  { role: 'atc', level: 'B2', sub_role: 'enroute',  category: 'command',     theme: 'Direct routing to fix' },
  { role: 'atc', level: 'B2', sub_role: 'enroute',  category: 'phraseology', theme: 'Traffic advisory for crossing' },
  { role: 'atc', level: 'C1', sub_role: 'enroute',  category: 'command',     theme: 'Weather deviation approval' },
  { role: 'atc', level: 'B2', sub_role: 'enroute',  category: 'phraseology', theme: 'Sector handoff to next center' },
  { role: 'atc', level: 'B1', sub_role: 'tower',    category: 'phrase',      theme: 'Wind 270 at 15 knots gusts' },
  { role: 'atc', level: 'B1', sub_role: 'tower',    category: 'phrase',      theme: 'Runway in use information' },
  { role: 'atc', level: 'C1', sub_role: 'tower',    category: 'command',     theme: 'Abort takeoff emergency' },
  { role: 'atc', level: 'B1', sub_role: 'approach', category: 'phrase',      theme: 'Cleared visual approach' },
  { role: 'atc', level: 'B2', sub_role: 'approach', category: 'command',     theme: 'Hold instruction with EFC' },

  // cabin: 25 (PA scripts, safety, comm)
  { role: 'cabin', level: 'A2', sub_role: 'cabin_purser',   category: 'phrase',  theme: 'Welcome aboard passenger greeting' },
  { role: 'cabin', level: 'A2', sub_role: 'cabin_purser',   category: 'phrase',  theme: 'Boarding complete announcement' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_purser',   category: 'phrase',  theme: 'Doors armed and cross-checked' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_purser',   category: 'command', theme: 'Cabin secure for departure' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_purser',   category: 'command', theme: 'Emergency brace position command' },
  { role: 'cabin', level: 'A2', sub_role: 'cabin_economy',  category: 'phrase',  theme: 'Seatbelt sign on announcement' },
  { role: 'cabin', level: 'A2', sub_role: 'cabin_economy',  category: 'phrase',  theme: 'Cabin lights dimmed for landing' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_economy',  category: 'phrase',  theme: 'Drink service request response' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_economy',  category: 'phrase',  theme: 'Final descent announcement' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_economy',  category: 'command', theme: 'Turbulence brace passengers' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_business', category: 'phrase',  theme: 'Premium meal service script' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_business', category: 'phrase',  theme: 'Pre-departure beverage offer' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_business', category: 'phrase',  theme: 'Sleep configuration setup' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_business', category: 'phrase',  theme: 'Special meal coordination' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_business', category: 'command', theme: 'Emergency equipment briefing' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_first',    category: 'phrase',  theme: 'First class welcome script' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_first',    category: 'phrase',  theme: 'VIP service introduction' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_first',    category: 'phrase',  theme: 'Bedding service offer' },
  { role: 'cabin', level: 'C1', sub_role: 'cabin_first',    category: 'phrase',  theme: 'Diplomatic passenger handling' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_first',    category: 'phrase',  theme: 'Disembark announcement first class' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_purser',   category: 'phrase',  theme: 'Safety demonstration intro' },
  { role: 'cabin', level: 'B2', sub_role: 'cabin_purser',   category: 'command', theme: 'Smoke in cabin captain notify' },
  { role: 'cabin', level: 'C1', sub_role: 'cabin_purser',   category: 'command', theme: 'Evacuation alert command' },
  { role: 'cabin', level: 'B1', sub_role: 'cabin_economy',  category: 'phrase',  theme: 'Special needs passenger care' },
  { role: 'cabin', level: 'A2', sub_role: 'cabin_economy',  category: 'phrase',  theme: 'Thank you disembark farewell' },

  // technician: 25 (snag terms, MEL, AOG, parts)
  { role: 'technician', level: 'B1', sub_role: 'tech_line',         category: 'vocabulary', theme: 'Hydraulic system terminology' },
  { role: 'technician', level: 'B2', sub_role: 'tech_line',         category: 'phrase',     theme: 'Snag report to maintenance control' },
  { role: 'technician', level: 'B1', sub_role: 'tech_line',         category: 'vocabulary', theme: 'APU components and terms' },
  { role: 'technician', level: 'B2', sub_role: 'tech_line',         category: 'phrase',     theme: 'MEL deferral justification' },
  { role: 'technician', level: 'B1', sub_role: 'tech_line',         category: 'vocabulary', theme: 'Tech log entry standard terms' },
  { role: 'technician', level: 'B1', sub_role: 'tech_a_check',      category: 'vocabulary', theme: 'A-check inspection items' },
  { role: 'technician', level: 'B2', sub_role: 'tech_a_check',      category: 'phrase',     theme: 'Routine inspection report' },
  { role: 'technician', level: 'B1', sub_role: 'tech_a_check',      category: 'vocabulary', theme: 'Brake assembly parts' },
  { role: 'technician', level: 'B2', sub_role: 'tech_a_check',      category: 'phrase',     theme: 'Tire wear measurement report' },
  { role: 'technician', level: 'B2', sub_role: 'tech_a_check',      category: 'phrase',     theme: 'Pressure leak test result' },
  { role: 'technician', level: 'B2', sub_role: 'tech_c_check',      category: 'vocabulary', theme: 'Heavy maintenance terminology' },
  { role: 'technician', level: 'C1', sub_role: 'tech_c_check',      category: 'phrase',     theme: 'Structural crack inspection' },
  { role: 'technician', level: 'B2', sub_role: 'tech_c_check',      category: 'vocabulary', theme: 'Avionics upgrade terms' },
  { role: 'technician', level: 'C1', sub_role: 'tech_c_check',      category: 'phrase',     theme: 'Return to service declaration' },
  { role: 'technician', level: 'B2', sub_role: 'tech_c_check',      category: 'phrase',     theme: 'Component replacement signoff' },
  { role: 'technician', level: 'B2', sub_role: 'tech_engine',       category: 'vocabulary', theme: 'Engine component nomenclature' },
  { role: 'technician', level: 'C1', sub_role: 'tech_engine',       category: 'phrase',     theme: 'EGT trend escalation' },
  { role: 'technician', level: 'B2', sub_role: 'tech_engine',       category: 'phrase',     theme: 'Engine oil consumption snag' },
  { role: 'technician', level: 'C1', sub_role: 'tech_engine',       category: 'phrase',     theme: 'AOG engine replacement urgent' },
  { role: 'technician', level: 'B2', sub_role: 'tech_engine',       category: 'phrase',     theme: 'Performance check post-maintenance' },
  { role: 'technician', level: 'B2', sub_role: 'tech_landing_gear', category: 'vocabulary', theme: 'Landing gear components' },
  { role: 'technician', level: 'B2', sub_role: 'tech_landing_gear', category: 'phrase',     theme: 'Tire pressure check report' },
  { role: 'technician', level: 'C1', sub_role: 'tech_landing_gear', category: 'phrase',     theme: 'Actuator replacement signoff' },
  { role: 'technician', level: 'B2', sub_role: 'tech_landing_gear', category: 'vocabulary', theme: 'Brake wear measurement terms' },
  { role: 'technician', level: 'C1', sub_role: 'tech_landing_gear', category: 'phrase',     theme: 'Gear collapse incident report' },

  // ground: 25 (marshalling commands, pushback)
  { role: 'ground', level: 'A2', sub_role: 'ground_pushback',   category: 'command',    theme: 'Brakes released pushback start' },
  { role: 'ground', level: 'B1', sub_role: 'ground_pushback',   category: 'command',    theme: 'Set brakes pushback complete' },
  { role: 'ground', level: 'B1', sub_role: 'ground_pushback',   category: 'command',    theme: 'Towing release confirmation' },
  { role: 'ground', level: 'B2', sub_role: 'ground_pushback',   category: 'command',    theme: 'Stop pushback obstacle' },
  { role: 'ground', level: 'A2', sub_role: 'ground_pushback',   category: 'phrase',     theme: 'Bypass pin removed report' },
  { role: 'ground', level: 'A2', sub_role: 'ground_marshalling',category: 'command',    theme: 'Continue straight ahead signal' },
  { role: 'ground', level: 'B1', sub_role: 'ground_marshalling',category: 'command',    theme: 'Stop chocks in place' },
  { role: 'ground', level: 'B1', sub_role: 'ground_marshalling',category: 'command',    theme: 'Turn left wing clearance' },
  { role: 'ground', level: 'B2', sub_role: 'ground_marshalling',category: 'command',    theme: 'Wing clearance warning' },
  { role: 'ground', level: 'A2', sub_role: 'ground_marshalling',category: 'command',    theme: 'Engine shutdown signal' },
  { role: 'ground', level: 'B1', sub_role: 'ground_refueling',  category: 'phrase',     theme: 'Fuel quantity request' },
  { role: 'ground', level: 'B2', sub_role: 'ground_refueling',  category: 'phrase',     theme: 'Refueling complete signoff' },
  { role: 'ground', level: 'B2', sub_role: 'ground_refueling',  category: 'command',    theme: 'Fuel spill emergency' },
  { role: 'ground', level: 'B1', sub_role: 'ground_refueling',  category: 'vocabulary', theme: 'Refueling equipment terminology' },
  { role: 'ground', level: 'B2', sub_role: 'ground_refueling',  category: 'phrase',     theme: 'Hot refueling passengers onboard' },
  { role: 'ground', level: 'B1', sub_role: 'ground_deicing',    category: 'phrase',     theme: 'De-icing fluid type 1' },
  { role: 'ground', level: 'B2', sub_role: 'ground_deicing',    category: 'phrase',     theme: 'Anti-ice application' },
  { role: 'ground', level: 'B2', sub_role: 'ground_deicing',    category: 'phrase',     theme: 'De-ice complete HOT time' },
  { role: 'ground', level: 'B1', sub_role: 'ground_deicing',    category: 'phrase',     theme: 'Holdover time advisory' },
  { role: 'ground', level: 'B2', sub_role: 'ground_deicing',    category: 'command',    theme: 'Return to gate de-ice failure' },
  { role: 'ground', level: 'A2', sub_role: 'ground_baggage',    category: 'phrase',     theme: 'Baggage loading complete' },
  { role: 'ground', level: 'B1', sub_role: 'ground_baggage',    category: 'phrase',     theme: 'Fragile baggage handling' },
  { role: 'ground', level: 'B1', sub_role: 'ground_baggage',    category: 'phrase',     theme: 'Cargo weight confirmation' },
  { role: 'ground', level: 'B2', sub_role: 'ground_baggage',    category: 'phrase',     theme: 'Damaged baggage report' },
  { role: 'ground', level: 'B1', sub_role: 'ground_baggage',    category: 'phrase',     theme: 'Connecting bag urgent transfer' },

  // student: 20 (ICAO alphabet, numbers, basic)
  { role: 'student', level: 'A0', sub_role: 'student', category: 'callsign',    theme: 'NATO Alpha through Foxtrot' },
  { role: 'student', level: 'A0', sub_role: 'student', category: 'callsign',    theme: 'NATO Golf through Lima' },
  { role: 'student', level: 'A0', sub_role: 'student', category: 'callsign',    theme: 'NATO Mike through Romeo' },
  { role: 'student', level: 'A0', sub_role: 'student', category: 'callsign',    theme: 'NATO Sierra through Zulu' },
  { role: 'student', level: 'A1', sub_role: 'student', category: 'callsign',    theme: 'Number transmission zero to nine' },
  { role: 'student', level: 'A1', sub_role: 'student', category: 'phraseology', theme: 'Hundred and thousand pronunciation' },
  { role: 'student', level: 'A1', sub_role: 'student', category: 'phraseology', theme: 'Decimal point in frequency' },
  { role: 'student', level: 'A1', sub_role: 'student', category: 'callsign',    theme: 'Callsign letters and digits' },
  { role: 'student', level: 'A2', sub_role: 'student', category: 'phraseology', theme: 'Three nine zero hundred altitude' },
  { role: 'student', level: 'A2', sub_role: 'student', category: 'phraseology', theme: 'Heading two seven zero' },
  { role: 'student', level: 'A2', sub_role: 'student', category: 'phrase',      theme: 'Roger and wilco acknowledgement' },
  { role: 'student', level: 'A2', sub_role: 'student', category: 'phrase',      theme: 'Standby and affirm phrases' },
  { role: 'student', level: 'A1', sub_role: 'student', category: 'phrase',      theme: 'Say again request' },
  { role: 'student', level: 'A2', sub_role: 'student', category: 'phrase',      theme: 'Negative and unable phrases' },
  { role: 'student', level: 'A0', sub_role: 'student', category: 'phrase',      theme: 'Mayday three times pronunciation' },
  { role: 'student', level: 'A0', sub_role: 'student', category: 'phrase',      theme: 'PAN-PAN three times pronunciation' },
  { role: 'student', level: 'A1', sub_role: 'student', category: 'phrase',      theme: 'Squawk transponder code' },
  { role: 'student', level: 'A2', sub_role: 'student', category: 'phrase',      theme: 'Cleared takeoff phrase' },
  { role: 'student', level: 'A2', sub_role: 'student', category: 'phrase',      theme: 'Contact frequency phrase' },
  { role: 'student', level: 'A2', sub_role: 'student', category: 'phrase',      theme: 'Time format ICAO zulu' },

  // dispatcher: 25 (METAR, NOTAM, route terms)
  { role: 'dispatcher', level: 'B1', sub_role: 'dispatcher', category: 'vocabulary', theme: 'METAR weather code terms' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'vocabulary', theme: 'TAF forecast terminology' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'vocabulary', theme: 'SIGMET advisory terms' },
  { role: 'dispatcher', level: 'B1', sub_role: 'dispatcher', category: 'vocabulary', theme: 'NOTAM runway terminology' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'vocabulary', theme: 'NOTAM ILS service terms' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'vocabulary', theme: 'ETOPS planning vocabulary' },
  { role: 'dispatcher', level: 'C1', sub_role: 'dispatcher', category: 'phrase',     theme: 'ETOPS alternate update' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'phrase',     theme: 'Flight plan filing confirmation' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'phrase',     theme: 'Route deviation advisory' },
  { role: 'dispatcher', level: 'C1', sub_role: 'dispatcher', category: 'command',    theme: 'Divert decision communication' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'phrase',     theme: 'Fuel uplift quantity' },
  { role: 'dispatcher', level: 'B1', sub_role: 'dispatcher', category: 'phrase',     theme: 'Block fuel calculation' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'command',    theme: 'Fuel emergency declaration support' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'phrase',     theme: 'Holding fuel reserve' },
  { role: 'dispatcher', level: 'C1', sub_role: 'dispatcher', category: 'command',    theme: 'Minimum fuel alternate' },
  { role: 'dispatcher', level: 'B1', sub_role: 'dispatcher', category: 'phrase',     theme: 'Slot time update' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'phrase',     theme: 'CTOT change notification' },
  { role: 'dispatcher', level: 'B1', sub_role: 'dispatcher', category: 'vocabulary', theme: 'Diplomatic clearance terms' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'phrase',     theme: 'Crew duty time check' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'phrase',     theme: 'MEL deferral communication' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'phrase',     theme: 'PIREP collection request' },
  { role: 'dispatcher', level: 'B1', sub_role: 'dispatcher', category: 'phrase',     theme: 'Weight balance update' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'phrase',     theme: 'Performance limited dispatch' },
  { role: 'dispatcher', level: 'C1', sub_role: 'dispatcher', category: 'command',    theme: 'Volcanic ash advisory route' },
  { role: 'dispatcher', level: 'B2', sub_role: 'dispatcher', category: 'phrase',     theme: 'HF position report relay' },
];

const SYSTEM_PROMPT = `You are an aviation English content expert specializing in ICAO phraseology
and pronunciation training. You generate authentic aviation training sentences with
accurate IPA transcriptions. Real aviation context — not generic English.
Output ONLY valid JSON, no markdown fences.`;

function userPrompt({ role, sub_role, level, category, theme }) {
  return `Generate a single aviation pronunciation training sentence as JSON.

Inputs:
  target_role: ${role}
  target_sub_roles: ${sub_role ? `["${sub_role}"]` : '[]'}
  level: ${level}
  category: ${category}
  theme: ${theme}

Length per level: A0-A1 = 3-5 words, A2 = 5-8, B1-B2 = 6-10, C1-C2 = 10-15.

Output schema (return ONLY this JSON object):
{
  "slug": "lowercase-kebab-from-theme max 50 chars",
  "text_en": "the target sentence in English (aviation-specific)",
  "text_tr": "Turkish translation (natural Turkish, aviation jargon stays English)",
  "ipa": "Full IPA transcription with /slashes/ around it",
  "phonemes": ["array", "of", "key", "phoneme", "groups", "syllable-based"],
  "level": "${level}",
  "target_role": "${role}",
  "target_sub_roles": ${sub_role ? `["${sub_role}"]` : '[]'},
  "category": "${category}",
  "hint_tr": "1-sentence Turkish pronunciation tip. Aviation terms in English.",
  "hint_en": "1-sentence English pronunciation tip."
}

Requirements:
- Real aviation context (callouts, phraseology, role-specific)
- IPA accurate (real IPA characters: /ˈ/ /ə/ /ɑ/ /ɪ/ etc.)
- phonemes: 4-8 syllable-level chunks
- Aviation jargon (runway, callsign, flight level, etc.) preserved EN in TR hint
- Match level complexity`;
}

async function generateOne(target, idx, total) {
  const startMs = Date.now();
  process.stdout.write(`[${idx + 1}/${total}] ${target.role}/${target.level}/${target.category}/${target.theme.slice(0, 35)}... `);
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt(target) }],
    });
    const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
    const cleaned = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    const ms = Date.now() - startMs;
    console.log(`✓ (${ms}ms, ${msg.usage.input_tokens}→${msg.usage.output_tokens} tok)`);
    return { ok: true, sentence: parsed, usage: msg.usage };
  } catch (e) {
    console.log(`✗ ${e.message?.slice(0, 80)}`);
    return { ok: false, error: e.message };
  }
}

async function generateChunk(chunk, baseIdx, total) {
  return Promise.all(chunk.map((t, i) => generateOne(t, baseIdx + i, total)));
}

function validate(s, idx) {
  const issues = [];
  if (!s.slug) issues.push('slug missing');
  if (!s.text_en) issues.push('text_en missing');
  if (!s.text_tr) issues.push('text_tr missing');
  if (!s.ipa || !s.ipa.startsWith('/')) issues.push('ipa missing or malformed');
  if (!Array.isArray(s.phonemes) || s.phonemes.length < 3) issues.push('phonemes < 3');
  if (!s.hint_tr) issues.push('hint_tr empty');
  return { idx, slug: s.slug, ok: issues.length === 0, issues };
}

async function main() {
  const mode = process.argv[2] ?? '--preview';
  const targets = mode === '--preview' ? PREVIEW_TARGETS : FULL_TARGETS;

  console.log(`Model: ${MODEL}`);
  console.log(`Mode: ${mode} | ${targets.length} sentence (paralel 5'er)\n`);

  const results = [];
  let totalIn = 0;
  let totalOut = 0;
  const CHUNK = 5;
  for (let i = 0; i < targets.length; i += CHUNK) {
    const chunk = targets.slice(i, i + CHUNK);
    const res = await generateChunk(chunk, i, targets.length);
    for (const r of res) {
      if (r.ok) {
        results.push(r.sentence);
        totalIn += r.usage.input_tokens;
        totalOut += r.usage.output_tokens;
      }
    }
  }

  console.log('\n— Validation —');
  const validations = results.map((s, i) => validate(s, i));
  const failed = validations.filter((v) => !v.ok);
  console.log(`Geçerli: ${validations.length - failed.length}/${validations.length}`);
  for (const v of failed) console.log(`  ✗ #${v.idx} (${v.slug}): ${v.issues.join('; ')}`);

  const outFile = mode === '--preview' ? 'pronunciation-preview.json' : 'pronunciation-generated.json';
  const out = resolve(ROOT, `scripts/${outFile}`);
  writeFileSync(out, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n✅ ${results.length}/${targets.length} sentence üretildi → scripts/${outFile}`);

  const cost = (totalIn / 1_000_000) * 3 + (totalOut / 1_000_000) * 15;
  console.log(`   Token: ${totalIn} input + ${totalOut} output`);
  console.log(`   Maliyet: $${cost.toFixed(4)} (Sonnet 4.5)`);

  if (mode === '--preview') {
    const avgIn = totalIn / results.length;
    const avgOut = totalOut / results.length;
    const batchCost = ((avgIn * 175) / 1_000_000) * 3 + ((avgOut * 175) / 1_000_000) * 15;
    console.log(`\n   Tahmini batch (175): $${batchCost.toFixed(2)}`);
  }
}

main().catch((e) => {
  console.error('FAIL:', e);
  process.exit(1);
});

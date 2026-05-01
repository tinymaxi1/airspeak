/**
 * Generic CRUD form'ları için tablo şemaları.
 * Her tablo için fields + slug stratejisi tanımlı.
 */
import type { TableSchema } from '@/components/forms/GenericTableForm';

export const ORAL_SCHEMA: TableSchema = {
  table: 'oral_prompts',
  title: 'Sözlü Sınav Prompt',
  description: 'ICAO sözlü sınav için 4 görev tipi prompt',
  slugFromKey: 'prompt',
  slugPrefix: 'oral_{task_type}',
  revalidate: '/oral',
  fields: [
    {
      key: 'task_type',
      label: 'Görev tipi',
      type: 'select',
      required: true,
      defaultValue: 'picture_description',
      options: [
        { id: 'picture_description', label: 'Resim tasviri' },
        { id: 'story_telling', label: 'Hikâye anlatma' },
        { id: 'problem_solving', label: 'Problem çözme' },
        { id: 'common_topics', label: 'Genel konular' },
      ],
    },
    {
      key: 'level',
      label: 'Seviye',
      type: 'select',
      required: true,
      defaultValue: 'B2',
      options: [
        { id: 'B1', label: 'B1' },
        { id: 'B2', label: 'B2' },
        { id: 'B2+', label: 'B2+' },
        { id: 'C1', label: 'C1' },
      ],
    },
    {
      key: 'prompt',
      label: 'Prompt (EN)',
      type: 'textarea',
      required: true,
      rows: 3,
    },
    {
      key: 'prompt_tr',
      label: 'Prompt (TR)',
      type: 'textarea',
      rows: 3,
    },
    {
      key: 'cues_tr',
      label: 'İpuçları (TR)',
      type: 'list',
      hint: 'Her satıra bir bullet ipucu',
      rows: 4,
    },
    {
      key: 'vocabulary_tr',
      label: 'Önerilen kelimeler',
      type: 'list',
      rows: 3,
    },
    {
      key: 'image_url',
      label: 'Görsel URL',
      type: 'text',
    },
    {
      key: 'preparation_seconds',
      label: 'Hazırlık (sn)',
      type: 'number',
      defaultValue: 30,
    },
    {
      key: 'speaking_seconds',
      label: 'Konuşma (sn)',
      type: 'number',
      defaultValue: 90,
    },
  ],
};

export const AIRLINE_SCHEMA: TableSchema = {
  table: 'airlines',
  title: 'Havayolu',
  description: 'Havayolu profili + role bazlı interview pipeline',
  slugFromKey: 'name',
  slugPrefix: 'airline',
  revalidate: '/airlines',
  fields: [
    {
      key: 'name',
      label: 'Ad',
      type: 'text',
      required: true,
    },
    {
      key: 'iata_code',
      label: 'IATA',
      type: 'text',
      placeholder: 'TK',
    },
    {
      key: 'country_emoji',
      label: 'Bayrak',
      type: 'text',
      placeholder: '🇹🇷',
    },
    {
      key: 'hub',
      label: 'Hub',
      type: 'text',
    },
    {
      key: 'region',
      label: 'Bölge',
      type: 'select',
      defaultValue: 'turkey',
      options: [
        { id: 'turkey', label: 'Türkiye' },
        { id: 'middle-east', label: 'Orta Doğu' },
        { id: 'europe-fsc', label: 'Avrupa FSC' },
        { id: 'europe-lcc', label: 'Avrupa LCC' },
        { id: 'asia', label: 'Asya' },
        { id: 'americas', label: 'Amerika' },
        { id: 'oceania', label: 'Okyanusya' },
        { id: 'africa', label: 'Afrika' },
      ],
    },
    {
      key: 'tier',
      label: 'Tier',
      type: 'select',
      defaultValue: 'flagship',
      options: [
        { id: 'flagship', label: 'Bayrak taşıyıcı' },
        { id: 'major', label: 'Büyük' },
        { id: 'lcc', label: 'LCC' },
        { id: 'regional', label: 'Bölgesel' },
        { id: 'cargo', label: 'Kargo' },
        { id: 'charter', label: 'Charter' },
      ],
    },
    {
      key: 'fleet_size',
      label: 'Filo sayısı',
      type: 'number',
    },
    {
      key: 'destinations',
      label: 'Destinasyon',
      type: 'number',
    },
    {
      key: 'prestige',
      label: 'Prestij (1-5)',
      type: 'number',
      defaultValue: 3,
    },
    {
      key: 'hiring_status',
      label: 'Alım durumu',
      type: 'select',
      defaultValue: 'open',
      options: [
        { id: 'open', label: 'Aktif alım' },
        { id: 'closed', label: 'Kapalı' },
        { id: 'open_day_only', label: 'Sadece Open Day' },
        { id: 'experienced_only', label: 'Sadece tecrübeli' },
      ],
    },
    {
      key: 'insider_tip_tr',
      label: 'İçeriden ipucu (TR)',
      type: 'textarea',
      rows: 3,
    },
    {
      key: 'pilot_interview',
      label: 'Pilot interview (JSON)',
      type: 'json',
      hint: '{ stages: [...], requiredLevel: "B2", englishWeight: 70 }',
      rows: 5,
    },
    {
      key: 'cabin_interview',
      label: 'Kabin interview (JSON)',
      type: 'json',
      rows: 5,
    },
  ],
};

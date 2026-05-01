/**
 * Profile View — detay bölümleri (timeline / liste / grid).
 *
 * 6 bölüm: Bio uzun, Deneyim, Eğitim, Sertifika, Type Rating, Aviation level, Sosyal grid.
 * Boş bölümler "Ekle" CTA'ya tıklanır → /settings/profile-edit?tab=N.
 */
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Body, Eyebrow, FONTS, Mono } from '@/components/airspeak';
import {
  Briefcase,
  GraduationCap,
  Award,
  Plane,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Globe,
} from 'lucide-react-native';
import type {
  CertificationRow,
  EducationRow,
  ExperienceRow,
  TypeRatingRow,
} from '@/features/profile/api';

function gotoEdit(tab: 'basic' | 'career' | 'aviation' | 'social' | 'privacy') {
  router.push({ pathname: '/settings/profile-edit', params: { tab } });
}

function fmtDateRange(start: string | null, end: string | null, isCurrent: boolean): string {
  const s = start ? start.slice(0, 7) : '?';
  const e = isCurrent ? 'devam' : end ? end.slice(0, 7) : '?';
  return `${s} → ${e}`;
}

// ─── Empty CTA ─────────────────────────────────────────────────────────────
function EmptySection({
  emoji,
  text,
  cta,
  onPress,
}: {
  emoji: string;
  text: string;
  cta: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        padding: 18,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#DCE0E8',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <Body color="#5A6478" style={{ fontSize: 12, textAlign: 'center' }}>
        {text}
      </Body>
      <Mono style={{ fontSize: 10, color: '#E63946', letterSpacing: 1.2, marginTop: 2 }}>
        + {cta}
      </Mono>
    </TouchableOpacity>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Eyebrow>{label}</Eyebrow>
    </View>
  );
}

// ─── Uzun bio bölümü ───────────────────────────────────────────────────────
export function BioSection({ bioLong }: { bioLong: string | null }) {
  if (!bioLong) return null;
  return (
    <View>
      <SectionHeader label="Hakkında" />
      <Animated.View
        entering={FadeInUp.duration(280)}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#EDEFF3',
          padding: 14,
        }}
      >
        <Body color="#0E1116" style={{ fontSize: 14, lineHeight: 21 }}>
          {bioLong}
        </Body>
      </Animated.View>
    </View>
  );
}

// ─── Deneyim timeline ──────────────────────────────────────────────────────
export function ExperienceTimeline({ items }: { items: ExperienceRow[] }) {
  if (items.length === 0) {
    return (
      <View>
        <SectionHeader label="Deneyim" />
        <EmptySection
          emoji="💼"
          text="Henüz deneyim eklenmedi."
          cta="DENEYİM EKLE"
          onPress={() => gotoEdit('career')}
        />
      </View>
    );
  }
  return (
    <View>
      <SectionHeader label="Deneyim" />
      <View style={{ gap: 10 }}>
        {items.map((it, idx) => (
          <Animated.View
            key={it.id}
            entering={FadeInUp.delay(idx * 50).duration(280)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#EDEFF3',
              padding: 14,
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#F4F2EC',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={18} color="#5A6478" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                {it.position}
              </Text>
              <Body color="#5A6478" style={{ fontSize: 13, marginTop: 1 }}>
                {it.company}
              </Body>
              <Mono
                style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8, marginTop: 4 }}
              >
                {fmtDateRange(it.start_date, it.end_date, it.is_current)}
              </Mono>
              {it.description ? (
                <Body color="#3A4255" style={{ fontSize: 12, marginTop: 6, lineHeight: 18 }}>
                  {it.description}
                </Body>
              ) : null}
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

// ─── Eğitim listesi ────────────────────────────────────────────────────────
export function EducationSection({ items }: { items: EducationRow[] }) {
  if (items.length === 0) {
    return (
      <View>
        <SectionHeader label="Eğitim" />
        <EmptySection
          emoji="🎓"
          text="Henüz eğitim eklenmedi."
          cta="EĞİTİM EKLE"
          onPress={() => gotoEdit('career')}
        />
      </View>
    );
  }
  return (
    <View>
      <SectionHeader label="Eğitim" />
      <View style={{ gap: 10 }}>
        {items.map((it, idx) => (
          <Animated.View
            key={it.id}
            entering={FadeInUp.delay(idx * 50).duration(280)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#EDEFF3',
              padding: 14,
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#FFF1F2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GraduationCap size={18} color="#E63946" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                {it.school}
              </Text>
              {(it.degree || it.field) && (
                <Body color="#5A6478" style={{ fontSize: 13, marginTop: 1 }}>
                  {[it.degree, it.field].filter(Boolean).join(' · ')}
                </Body>
              )}
              {it.graduation_year ? (
                <Mono
                  style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8, marginTop: 4 }}
                >
                  {it.graduation_year}
                </Mono>
              ) : null}
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

// ─── Sertifika kartları ───────────────────────────────────────────────────
const CERT_ICON_BG: Record<string, { bg: string; fg: string }> = {
  ICAO: { bg: '#DDF7E6', fg: '#118040' },
  EASA: { bg: '#E6E9FF', fg: '#3D4FCC' },
  FAA: { bg: '#FFF1F2', fg: '#E63946' },
  Cabin: { bg: '#FFFAEC', fg: '#8B6E2E' },
  Other: { bg: '#F4F2EC', fg: '#5A6478' },
};
function certColor(type: string): { bg: string; fg: string } {
  if (type.toUpperCase().includes('ICAO')) return CERT_ICON_BG.ICAO!;
  if (type.toUpperCase().includes('EASA')) return CERT_ICON_BG.EASA!;
  if (type.toUpperCase().includes('FAA')) return CERT_ICON_BG.FAA!;
  if (type.toLowerCase().includes('cabin')) return CERT_ICON_BG.Cabin!;
  return CERT_ICON_BG.Other!;
}

export function CertificationsSection({ items }: { items: CertificationRow[] }) {
  if (items.length === 0) {
    return (
      <View>
        <SectionHeader label="Sertifikalar" />
        <EmptySection
          emoji="🏅"
          text="Henüz sertifika eklenmedi."
          cta="SERTİFİKA EKLE"
          onPress={() => gotoEdit('career')}
        />
      </View>
    );
  }
  return (
    <View>
      <SectionHeader label="Sertifikalar" />
      <View style={{ gap: 10 }}>
        {items.map((it, idx) => {
          const c = certColor(it.type);
          return (
            <Animated.View
              key={it.id}
              entering={FadeInUp.delay(idx * 50).duration(280)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#EDEFF3',
                padding: 14,
                flexDirection: 'row',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: c.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={18} color={c.fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                  {it.type}
                </Text>
                {it.issuing_authority ? (
                  <Body color="#5A6478" style={{ fontSize: 13, marginTop: 1 }}>
                    {it.issuing_authority}
                  </Body>
                ) : null}
                <Mono
                  style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8, marginTop: 4 }}
                >
                  {[
                    it.number ? `№ ${it.number}` : null,
                    it.issue_date,
                    it.expiry_date ? `bitiş ${it.expiry_date}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Mono>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Type Rating kartları ─────────────────────────────────────────────────
export function TypeRatingsSection({ items }: { items: TypeRatingRow[] }) {
  if (items.length === 0) {
    return (
      <View>
        <SectionHeader label="Type Ratings" />
        <EmptySection
          emoji="🛩️"
          text="Henüz type rating eklenmedi."
          cta="TYPE RATING EKLE"
          onPress={() => gotoEdit('career')}
        />
      </View>
    );
  }
  return (
    <View>
      <SectionHeader label="Type Ratings" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {items.map((it, idx) => (
          <Animated.View
            key={it.id}
            entering={FadeInUp.delay(idx * 50).duration(280)}
            style={{
              flexBasis: '47%',
              flexGrow: 1,
              backgroundColor: '#0F1E47',
              borderRadius: 14,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Plane size={16} color="#F2C14E" />
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  color: '#FFFFFF',
                  fontWeight: '700',
                }}
              >
                {it.aircraft_type}
              </Text>
            </View>
            {it.hours != null ? (
              <Mono style={{ fontSize: 12, color: '#F2C14E', letterSpacing: 1, marginTop: 6 }}>
                {it.hours.toLocaleString()} SAAT
              </Mono>
            ) : null}
            {it.certified_date ? (
              <Mono
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: 0.8,
                  marginTop: 2,
                }}
              >
                {it.certified_date}
              </Mono>
            ) : null}
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

// ─── Aviation seviye badge ─────────────────────────────────────────────────
export function AviationLevelSection({
  icaoLevel,
  experienceYears,
}: {
  icaoLevel: '4' | '5' | '6' | null;
  experienceYears: number | null;
}) {
  if (icaoLevel == null && experienceYears == null) {
    return (
      <View>
        <SectionHeader label="Aviation" />
        <EmptySection
          emoji="✈️"
          text="ICAO English seviyeni ve deneyim yılını ekle."
          cta="AVIATION BİLGİSİ EKLE"
          onPress={() => gotoEdit('aviation')}
        />
      </View>
    );
  }
  return (
    <View>
      <SectionHeader label="Aviation" />
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
        }}
      >
        {icaoLevel != null && (
          <Animated.View
            entering={FadeInUp.duration(280)}
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              borderWidth: 2,
              borderColor: '#0F1E47',
              padding: 14,
            }}
          >
            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.2 }}>
              ICAO ENGLISH
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 32,
                fontWeight: '700',
                color: '#0F1E47',
                marginTop: 4,
                letterSpacing: -0.6,
              }}
            >
              L{icaoLevel}
            </Text>
            <Body color="#5A6478" style={{ fontSize: 11, marginTop: 2 }}>
              {icaoLevel === '4'
                ? 'Operational'
                : icaoLevel === '5'
                  ? 'Extended'
                  : 'Expert'}
            </Body>
          </Animated.View>
        )}
        {experienceYears != null && (
          <Animated.View
            entering={FadeInUp.delay(60).duration(280)}
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#EDEFF3',
              padding: 14,
            }}
          >
            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.2 }}>
              DENEYİM
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 32,
                fontWeight: '700',
                color: '#0F1E47',
                marginTop: 4,
                letterSpacing: -0.6,
              }}
            >
              {experienceYears}
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#5A6478' }}>
                {' '}yıl
              </Text>
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

// ─── Sosyal medya grid ─────────────────────────────────────────────────────
function buildLink(kind: string, val: string): string | null {
  const v = val.trim();
  if (!v) return null;
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  switch (kind) {
    case 'instagram':
      return `https://instagram.com/${v.replace(/^@/, '')}`;
    case 'twitter':
      return `https://x.com/${v.replace(/^@/, '')}`;
    case 'youtube':
      return v.startsWith('@') ? `https://youtube.com/${v}` : `https://youtube.com/@${v}`;
    default:
      return null;
  }
}

export function SocialGrid({
  linkedinUrl,
  instagram,
  twitter,
  youtube,
  facebook,
  website,
}: {
  linkedinUrl: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  facebook: string | null;
  website: string | null;
}) {
  const links = [
    { key: 'linkedin', icon: Linkedin, color: '#0A66C2', url: buildLink('linkedin', linkedinUrl ?? '') },
    { key: 'instagram', icon: Instagram, color: '#E4405F', url: buildLink('instagram', instagram ?? '') },
    { key: 'twitter', icon: Twitter, color: '#000000', url: buildLink('twitter', twitter ?? '') },
    { key: 'youtube', icon: Youtube, color: '#FF0000', url: buildLink('youtube', youtube ?? '') },
    { key: 'facebook', icon: Facebook, color: '#1877F2', url: buildLink('facebook', facebook ?? '') },
    { key: 'website', icon: Globe, color: '#5A6478', url: buildLink('website', website ?? '') },
  ].filter((l) => l.url);

  if (links.length === 0) {
    return (
      <View>
        <SectionHeader label="Sosyal" />
        <EmptySection
          emoji="🌐"
          text="Sosyal medya bağlantın yok."
          cta="LİNK EKLE"
          onPress={() => gotoEdit('social')}
        />
      </View>
    );
  }

  return (
    <View>
      <SectionHeader label="Sosyal" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <TouchableOpacity
              key={l.key}
              activeOpacity={0.85}
              onPress={() => {
                if (l.url) Linking.openURL(l.url).catch(() => {});
              }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#EDEFF3',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={22} color={l.color} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

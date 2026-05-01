/**
 * SummaryCard — profesyonel özet (position · company · location) + bio + completion CTA.
 *
 * Hero altında, StatStrip'in üstünde gösterilir.
 * Eksik bilgilerde "Profilini tamamla" CTA → /settings/profile-edit.
 */
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Briefcase, MapPin, ArrowRight } from 'lucide-react-native';
import { FONTS, Mono, Body } from '@/components/airspeak';

export interface SummaryCardProps {
  position: string | null;
  company: string | null;
  baseAirport: string | null;
  city: string | null;
  country: string | null;
  bioShort: string | null;
  completionPercent: number;
}

export function SummaryCard({
  position,
  company,
  baseAirport,
  city,
  country,
  bioShort,
  completionPercent,
}: SummaryCardProps) {
  const careerParts = [position, company].filter(Boolean) as string[];
  const careerLine = careerParts.join(' · ');

  const locationParts = [baseAirport, city, country].filter(Boolean) as string[];
  const locationLine = locationParts.join(' · ');

  const hasAnyDetail = careerLine || locationLine || bioShort;
  const isComplete = completionPercent >= 80;

  return (
    <Animated.View
      entering={FadeIn.duration(360)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EDEFF3',
        padding: 16,
        gap: 12,
      }}
    >
      {hasAnyDetail ? (
        <View style={{ gap: 8 }}>
          {careerLine ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Briefcase size={14} color="#5A6478" />
              <Text
                style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116', flex: 1 }}
                numberOfLines={1}
              >
                {careerLine}
              </Text>
            </View>
          ) : null}
          {locationLine ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MapPin size={14} color="#5A6478" />
              <Body color="#5A6478" style={{ fontSize: 13, flex: 1 }} numberOfLines={1}>
                {locationLine}
              </Body>
            </View>
          ) : null}
          {bioShort ? (
            <Body color="#3A4255" style={{ fontSize: 13, lineHeight: 19, marginTop: 2 }}>
              {bioShort}
            </Body>
          ) : null}
        </View>
      ) : null}

      {/* Completion bar */}
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1.2 }}>
            PROFİL TAMAMLAMA
          </Mono>
          <Mono
            style={{
              fontSize: 11,
              color: isComplete ? '#118040' : '#E63946',
              letterSpacing: 0.9,
              fontFamily: FONTS.mono700,
            }}
          >
            %{completionPercent}
          </Mono>
        </View>
        <View
          style={{
            height: 6,
            backgroundColor: '#EDEFF3',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, completionPercent))}%`,
              backgroundColor: isComplete ? '#2DBE6C' : '#E63946',
            }}
          />
        </View>
        {!isComplete && (
          <TouchableOpacity
            onPress={() => router.push('/settings/profile-edit')}
            activeOpacity={0.85}
            style={{
              marginTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: '#FFF1F2',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(230,57,70,0.2)',
            }}
          >
            <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#E63946' }}>
              Profilini tamamla
            </Text>
            <ArrowRight size={16} color="#E63946" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

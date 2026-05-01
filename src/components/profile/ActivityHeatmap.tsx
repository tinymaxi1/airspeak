/**
 * ActivityHeatmap — 7×12 grid, 84 günlük aktivite görselleştirme.
 *
 * Reanimated stagger entry: hafta hafta soldan sağa görünür.
 * Renk paleti: gri (boş) → açık yeşil → orta → koyu yeşil.
 */
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Body, Card3D, Eyebrow, FONTS, Mono } from '@/components/airspeak';

export interface HeatmapBucket {
  date: string;
  count: number;
}

const COLORS = ['#EDEFF3', '#DDF7E6', '#4FD487', '#2DBE6C'] as const;

function countToColor(count: number): string {
  if (count <= 0) return COLORS[0];
  if (count === 1) return COLORS[1];
  if (count <= 3) return COLORS[2];
  return COLORS[3];
}

export function ActivityHeatmap({
  buckets,
  activeDayCount,
  flightLogLabel,
  activeDaysLabel,
  emptyLabel,
  lessLabel,
  moreLabel,
}: {
  buckets: HeatmapBucket[];
  activeDayCount: number;
  flightLogLabel: string;
  activeDaysLabel: string;
  emptyLabel: string;
  lessLabel: string;
  moreLabel: string;
}) {
  const isEmpty = activeDayCount === 0;

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <Eyebrow>{flightLogLabel}</Eyebrow>
        {!isEmpty && (
          <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.9 }}>
            {activeDaysLabel}
          </Mono>
        )}
      </View>
      <Card3D style={{ marginTop: 8, padding: 14 }}>
        {isEmpty ? (
          <View style={{ alignItems: 'center', paddingVertical: 18, gap: 8 }}>
            <Text style={{ fontSize: 32 }}>📅</Text>
            <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center', maxWidth: 240 }}>
              {emptyLabel}
            </Body>
          </View>
        ) : (
          <>
            <View style={{ gap: 4 }}>
              {Array.from({ length: 7 }).map((_, dayIdx) => (
                <View key={dayIdx} style={{ flexDirection: 'row', gap: 4 }}>
                  {Array.from({ length: 12 }).map((_, weekIdx) => {
                    const bucketIdx = weekIdx * 7 + dayIdx;
                    const bucket = buckets[bucketIdx];
                    const count = bucket?.count ?? 0;
                    return (
                      <Animated.View
                        key={weekIdx}
                        entering={FadeIn.delay(weekIdx * 25).duration(220)}
                        style={{
                          flex: 1,
                          height: 14,
                          borderRadius: 3,
                          backgroundColor: countToColor(count),
                        }}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
                alignItems: 'center',
              }}
            >
              <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.9 }}>
                {lessLabel}
              </Mono>
              <View style={{ flexDirection: 'row', gap: 3 }}>
                {COLORS.map((c) => (
                  <View
                    key={c}
                    style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: c }}
                  />
                ))}
              </View>
              <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.9 }}>
                {moreLabel}
              </Mono>
            </View>
          </>
        )}
      </Card3D>
    </View>
  );
}

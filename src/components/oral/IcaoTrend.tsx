/**
 * IcaoTrend — son N hafta band score ortalama line chart.
 *
 * SVG mini chart: x ekseni hafta, y ekseni 1-6 band.
 * Operational threshold (4) yatay yeşil çizgi.
 */
import { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import type { OralExamAttempt } from '@/features/oral/api';
import { FONTS, Mono } from '@/components/airspeak';

interface Props {
  attempts: OralExamAttempt[];
  weeks?: number;
  width?: number;
  height?: number;
}

interface WeekBucket {
  weekStart: Date;
  weekLabel: string;
  avgBand: number | null;
  count: number;
}

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1; // Pazartesi başlangıç
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function IcaoTrend({
  attempts,
  weeks = 8,
  width = 280,
  height = 120,
}: Props) {
  const buckets = useMemo<WeekBucket[]>(() => {
    const list: WeekBucket[] = [];
    const today = new Date();
    const thisMon = startOfWeek(today);
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(thisMon);
      weekStart.setDate(thisMon.getDate() - i * 7);
      list.push({
        weekStart,
        weekLabel: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        avgBand: null,
        count: 0,
      });
    }
    // Attempts'i bucket'lara dağıt
    for (const a of attempts) {
      if (!a.evaluated_at || !a.band_score) continue;
      const at = new Date(a.evaluated_at);
      const aStart = startOfWeek(at);
      const idx = list.findIndex((b) => b.weekStart.getTime() === aStart.getTime());
      if (idx === -1) continue;
      const bucket = list[idx]!;
      const newCount = bucket.count + 1;
      const newAvg = (((bucket.avgBand ?? 0) * bucket.count) + a.band_score) / newCount;
      list[idx] = { ...bucket, avgBand: newAvg, count: newCount };
    }
    return list;
  }, [attempts, weeks]);

  const padding = { top: 16, right: 12, bottom: 24, left: 24 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Y scale 1-6
  function yFor(band: number): number {
    return padding.top + innerH - ((band - 1) / 5) * innerH;
  }
  function xFor(i: number): number {
    if (buckets.length === 1) return padding.left + innerW / 2;
    return padding.left + (i / (buckets.length - 1)) * innerW;
  }

  const points = buckets
    .map((b, i) => (b.avgBand !== null ? `${xFor(i)},${yFor(b.avgBand)}` : null))
    .filter(Boolean)
    .join(' ');

  const filled = buckets.filter((b) => b.avgBand !== null).length;

  return (
    <View style={{ width, height: height + 22, alignItems: 'center' }}>
      <Svg width={width} height={height}>
        {/* Grid bands (1-6 yatay) */}
        {[1, 2, 3, 4, 5, 6].map((b) => (
          <Line
            key={b}
            x1={padding.left}
            y1={yFor(b)}
            x2={width - padding.right}
            y2={yFor(b)}
            stroke={b === 4 ? '#2DBE6C' : '#EDEFF3'}
            strokeWidth={b === 4 ? 1.5 : 0.5}
            strokeOpacity={b === 4 ? 0.5 : 0.7}
            strokeDasharray={b === 4 ? '4,3' : undefined}
          />
        ))}
        {/* Y labels */}
        {[1, 4, 6].map((b) => (
          <SvgText
            key={`yl_${b}`}
            x={padding.left - 6}
            y={yFor(b) + 3}
            fontSize={9}
            fontFamily={FONTS.mono700}
            fill="#8A93A6"
            textAnchor="end"
          >
            L{b}
          </SvgText>
        ))}
        {/* Line */}
        {filled > 1 && (
          <Polyline
            points={points}
            fill="none"
            stroke="#E63946"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {/* Dots */}
        {buckets.map((b, i) => {
          if (b.avgBand === null) return null;
          return (
            <Circle
              key={`pt_${i}`}
              cx={xFor(i)}
              cy={yFor(b.avgBand)}
              r={4}
              fill="#E63946"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          );
        })}
        {/* X labels (her 2 haftada bir) */}
        {buckets.map((b, i) => {
          if (i % 2 !== 0 && i !== buckets.length - 1) return null;
          return (
            <SvgText
              key={`xl_${i}`}
              x={xFor(i)}
              y={height - 6}
              fontSize={9}
              fontFamily={FONTS.mono700}
              fill="#8A93A6"
              textAnchor="middle"
            >
              {b.weekLabel}
            </SvgText>
          );
        })}
      </Svg>
      {filled === 0 ? (
        <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 0.9, marginTop: 4 }}>
          Henüz veri yok — deneme yap
        </Mono>
      ) : (
        <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 0.9, marginTop: 4 }}>
          HAFTALIK ORTALAMA · YEŞİL ÇİZGİ L4 OPERATIONAL
        </Mono>
      )}
    </View>
  );
}

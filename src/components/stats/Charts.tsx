/**
 * Detaylı istatistik chart primitives.
 *
 * Hepsi raw SVG (react-native-svg). Yeni dep yok.
 * - LineChart: XP / accuracy gibi zaman serisi
 * - BarChart: çalışma dakikası / DOW dağılımı
 * - HourlyHeatmap: 24h grid (saat-bazlı yoğunluk)
 */
import { View, Text } from 'react-native';
import Svg, {
  Polyline,
  Circle,
  Line,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import { FONTS, Mono } from '@/components/airspeak';

// ═══════════════════════════════════════════════════════════════════════
// LineChart — generic time series
// ═══════════════════════════════════════════════════════════════════════
interface LineChartProps {
  data: { label: string; value: number | null }[];
  width?: number;
  height?: number;
  yMax?: number;
  yMin?: number;
  yLabels?: number[];
  threshold?: number;
  thresholdLabel?: string;
  color?: string;
  yFormatter?: (n: number) => string;
}

export function LineChart({
  data,
  width = 320,
  height = 140,
  yMax,
  yMin = 0,
  yLabels,
  threshold,
  thresholdLabel,
  color = '#E63946',
  yFormatter = (n) => String(Math.round(n)),
}: LineChartProps) {
  const padding = { top: 14, right: 12, bottom: 22, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value).filter((v): v is number => typeof v === 'number');
  const computedMax = yMax ?? Math.max(...(values.length ? values : [10]), 10);
  const range = Math.max(1, computedMax - yMin);

  function yFor(v: number): number {
    return padding.top + innerH - ((v - yMin) / range) * innerH;
  }
  function xFor(i: number): number {
    if (data.length === 1) return padding.left + innerW / 2;
    return padding.left + (i / (data.length - 1)) * innerW;
  }

  const points = data
    .map((d, i) => (d.value !== null ? `${xFor(i)},${yFor(d.value)}` : null))
    .filter(Boolean)
    .join(' ');

  const filled = values.length;
  const ticks = yLabels ?? [yMin, Math.round((yMin + computedMax) / 2), computedMax];

  return (
    <View style={{ width, alignItems: 'center' }}>
      <Svg width={width} height={height}>
        {/* Grid Y lines + labels */}
        {ticks.map((v) => (
          <Line
            key={`g_${v}`}
            x1={padding.left}
            y1={yFor(v)}
            x2={width - padding.right}
            y2={yFor(v)}
            stroke="#EDEFF3"
            strokeWidth={0.7}
          />
        ))}
        {ticks.map((v) => (
          <SvgText
            key={`yl_${v}`}
            x={padding.left - 6}
            y={yFor(v) + 3}
            fontSize={9}
            fontFamily={FONTS.mono700}
            fill="#8A93A6"
            textAnchor="end"
          >
            {yFormatter(v)}
          </SvgText>
        ))}
        {/* Threshold line */}
        {threshold !== undefined && (
          <>
            <Line
              x1={padding.left}
              y1={yFor(threshold)}
              x2={width - padding.right}
              y2={yFor(threshold)}
              stroke="#2DBE6C"
              strokeWidth={1.2}
              strokeOpacity={0.5}
              strokeDasharray="4,3"
            />
            {thresholdLabel && (
              <SvgText
                x={width - padding.right - 4}
                y={yFor(threshold) - 4}
                fontSize={8}
                fontFamily={FONTS.mono700}
                fill="#2DBE6C"
                textAnchor="end"
              >
                {thresholdLabel}
              </SvgText>
            )}
          </>
        )}
        {/* Line */}
        {filled > 1 && (
          <Polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {/* Dots */}
        {data.map((d, i) =>
          d.value === null ? null : (
            <Circle
              key={`pt_${i}`}
              cx={xFor(i)}
              cy={yFor(d.value)}
              r={3.5}
              fill={color}
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          ),
        )}
        {/* X labels (her N tane) */}
        {data.map((d, i) => {
          const step = Math.max(1, Math.floor(data.length / 6));
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <SvgText
              key={`xl_${i}`}
              x={xFor(i)}
              y={height - 4}
              fontSize={9}
              fontFamily={FONTS.mono700}
              fill="#8A93A6"
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// BarChart — vertical bars
// ═══════════════════════════════════════════════════════════════════════
interface BarChartProps {
  data: { label: string; value: number; highlight?: boolean }[];
  width?: number;
  height?: number;
  yMax?: number;
  color?: string;
  highlightColor?: string;
  yFormatter?: (n: number) => string;
}

export function BarChart({
  data,
  width = 320,
  height = 140,
  yMax,
  color = '#1F4FB6',
  highlightColor = '#E63946',
  yFormatter = (n) => String(Math.round(n)),
}: BarChartProps) {
  const padding = { top: 14, right: 12, bottom: 22, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const computedMax = yMax ?? Math.max(...data.map((d) => d.value), 1);
  const barCount = data.length;
  const gap = 4;
  const barW = (innerW - gap * (barCount - 1)) / barCount;

  const ticks = [0, Math.round(computedMax / 2), computedMax];

  return (
    <View style={{ width, alignItems: 'center' }}>
      <Svg width={width} height={height}>
        {/* Grid Y */}
        {ticks.map((v) => {
          const y = padding.top + innerH - (v / computedMax) * innerH;
          return (
            <Line
              key={`g_${v}`}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#EDEFF3"
              strokeWidth={0.7}
            />
          );
        })}
        {ticks.map((v) => {
          const y = padding.top + innerH - (v / computedMax) * innerH;
          return (
            <SvgText
              key={`yl_${v}`}
              x={padding.left - 6}
              y={y + 3}
              fontSize={9}
              fontFamily={FONTS.mono700}
              fill="#8A93A6"
              textAnchor="end"
            >
              {yFormatter(v)}
            </SvgText>
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const x = padding.left + i * (barW + gap);
          const h = (d.value / computedMax) * innerH;
          const y = padding.top + innerH - h;
          const fill = d.highlight ? highlightColor : color;
          return (
            <Rect
              key={`bar_${i}`}
              x={x}
              y={y}
              width={barW}
              height={Math.max(2, h)}
              rx={3}
              fill={fill}
              fillOpacity={d.value === 0 ? 0.15 : 0.85}
            />
          );
        })}
        {/* X labels */}
        {data.map((d, i) => {
          const x = padding.left + i * (barW + gap) + barW / 2;
          return (
            <SvgText
              key={`xl_${i}`}
              x={x}
              y={height - 4}
              fontSize={9}
              fontFamily={FONTS.mono700}
              fill="#8A93A6"
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// HourlyHeatmap — 24 saat grid
// ═══════════════════════════════════════════════════════════════════════
interface HourlyHeatmapProps {
  buckets: { hour: number; lessons_count: number }[];
  width?: number;
  cellHeight?: number;
}

const HEAT_COLORS = ['#EDEFF3', '#DDF7E6', '#A5E5C0', '#4FD487', '#2DBE6C'] as const;

function heatColor(count: number, max: number): string {
  if (count <= 0) return HEAT_COLORS[0];
  const ratio = max > 0 ? count / max : 0;
  if (ratio < 0.25) return HEAT_COLORS[1];
  if (ratio < 0.5) return HEAT_COLORS[2];
  if (ratio < 0.75) return HEAT_COLORS[3];
  return HEAT_COLORS[4];
}

export function HourlyHeatmap({
  buckets,
  width = 320,
  cellHeight = 24,
}: HourlyHeatmapProps) {
  const padding = { top: 8, right: 0, bottom: 22, left: 0 };
  const innerW = width - padding.left - padding.right;
  const cellW = innerW / 24;
  const max = Math.max(...buckets.map((b) => b.lessons_count), 1);

  // Buckets'i 0-23 sıralı garanti et
  const ordered = Array.from({ length: 24 }, (_, h) => {
    const found = buckets.find((b) => b.hour === h);
    return { hour: h, count: found?.lessons_count ?? 0 };
  });

  const total = ordered.reduce((s, b) => s + b.count, 0);
  const peakHour = ordered.reduce((p, c) => (c.count > p.count ? c : p), ordered[0]!);

  return (
    <View style={{ width, alignItems: 'center' }}>
      <Svg width={width} height={padding.top + cellHeight + padding.bottom}>
        {ordered.map((b, i) => (
          <Rect
            key={`h_${i}`}
            x={padding.left + i * cellW}
            y={padding.top}
            width={cellW - 1}
            height={cellHeight}
            rx={2}
            fill={heatColor(b.count, max)}
          />
        ))}
        {/* Saat etiketleri (0, 6, 12, 18) */}
        {[0, 6, 12, 18].map((h) => (
          <SvgText
            key={`hl_${h}`}
            x={padding.left + h * cellW + cellW / 2}
            y={padding.top + cellHeight + 14}
            fontSize={9}
            fontFamily={FONTS.mono700}
            fill="#8A93A6"
            textAnchor="middle"
          >
            {String(h).padStart(2, '0')}
          </SvgText>
        ))}
      </Svg>
      <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 0.9, marginTop: 4 }}>
        {total === 0
          ? 'Henüz veri yok'
          : `EN AKTİF SAAT: ${String(peakHour.hour).padStart(2, '0')}:00 · ${total} ders`}
      </Mono>
    </View>
  );
}

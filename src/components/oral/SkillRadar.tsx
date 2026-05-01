/**
 * SkillRadar — 6 ICAO descriptor hexagonal radar chart.
 *
 * - SVG hexagon (6 vertex), her vertex bir descriptor
 * - 6 ring (1-6 ICAO band)
 * - Filled polygon: kullanıcı skoru
 * - Vertex labels: descriptor short code
 *
 * Pattern profil sayfasında ya da history ekranında embed edilir.
 */
import { View, Text } from 'react-native';
import Svg, { Polygon, Polyline, Circle, Text as SvgText, Line } from 'react-native-svg';
import type { OralRubric } from '@/features/oral/api';
import { FONTS } from '@/components/airspeak';

interface Props {
  rubric: OralRubric;
  size?: number;
  fillColor?: string;
  strokeColor?: string;
  showLabels?: boolean;
}

const DESCRIPTORS: { key: keyof OralRubric; code: string }[] = [
  { key: 'pronunciation', code: 'PRO' },
  { key: 'structure',     code: 'STR' },
  { key: 'vocabulary',    code: 'VOC' },
  { key: 'fluency',       code: 'FLU' },
  { key: 'comprehension', code: 'CMP' },
  { key: 'interactions',  code: 'INT' },
];

export function SkillRadar({
  rubric,
  size = 220,
  fillColor = '#E63946',
  strokeColor = '#E63946',
  showLabels = true,
}: Props) {
  const padding = 32;
  const radius = (size - padding * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // 6 köşe için açılar (üstte başla)
  const angles = DESCRIPTORS.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / 6);

  // Ring'ler (1-6)
  const ringPolygons: string[] = [];
  for (let band = 1; band <= 6; band++) {
    const r = (radius * band) / 6;
    const points = angles.map((a) => {
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      return `${x},${y}`;
    });
    ringPolygons.push(points.join(' '));
  }

  // User score polygon
  const userPoints = DESCRIPTORS.map((d, i) => {
    const score = Math.max(0, Math.min(6, rubric[d.key] ?? 0));
    const r = (radius * score) / 6;
    const a = angles[i]!;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    return `${x},${y}`;
  });

  return (
    <View style={{ width: size, height: size + (showLabels ? 0 : 0), alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Ring'ler */}
        {ringPolygons.map((points, i) => (
          <Polygon
            key={i}
            points={points}
            fill="none"
            stroke={i === 3 ? '#2DBE6C' : '#DCE0E8'}
            strokeWidth={i === 3 ? 1.5 : 1}
            strokeOpacity={i === 3 ? 0.7 : 0.5}
          />
        ))}
        {/* Axes */}
        {angles.map((a, i) => {
          const x = cx + Math.cos(a) * radius;
          const y = cy + Math.sin(a) * radius;
          return (
            <Line
              key={`ax_${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#DCE0E8"
              strokeWidth={0.5}
              strokeOpacity={0.5}
            />
          );
        })}
        {/* User polygon (filled + stroked) */}
        <Polygon
          points={userPoints.join(' ')}
          fill={fillColor}
          fillOpacity={0.18}
          stroke={strokeColor}
          strokeWidth={2}
        />
        {/* Vertex circles + values */}
        {DESCRIPTORS.map((d, i) => {
          const score = rubric[d.key] ?? 0;
          const r = (radius * score) / 6;
          const a = angles[i]!;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          return <Circle key={d.code} cx={x} cy={y} r={3.5} fill={strokeColor} />;
        })}
        {/* Labels */}
        {showLabels &&
          DESCRIPTORS.map((d, i) => {
            const a = angles[i]!;
            const labelR = radius + 14;
            const x = cx + Math.cos(a) * labelR;
            const y = cy + Math.sin(a) * labelR + 3;
            return (
              <SvgText
                key={`lbl_${d.code}`}
                x={x}
                y={y}
                fontSize={10}
                fontFamily={FONTS.mono700}
                fill="#5A6478"
                textAnchor="middle"
              >
                {d.code}
              </SvgText>
            );
          })}
        {/* Center band number */}
        <SvgText
          x={cx}
          y={cy + 4}
          fontSize={11}
          fontFamily={FONTS.mono700}
          fill="#8A93A6"
          textAnchor="middle"
        >
          1—6
        </SvgText>
      </Svg>
    </View>
  );
}

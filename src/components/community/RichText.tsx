/**
 * RichText — post/yorum içeriğini @mention + #hashtag link'lerine parse ederek render eder.
 *
 * - @username → /community/profile/[username] (profile screen 6.E'de)
 * - #tag → /community/hashtag/[tag]
 * - Diğer text aynen gösterilir.
 *
 * Pattern backend extract_mentions / extract_hashtags ile aynı:
 *   /@([a-zA-Z0-9_]{3,30})/g
 *   /#([a-zA-Z0-9_]{2,50})/g
 */
import { Text, type TextStyle } from 'react-native';
import { router } from 'expo-router';
import { FONTS } from '@/components/airspeak';

interface Segment {
  type: 'text' | 'mention' | 'hashtag';
  raw: string;
  value: string; // username veya tag (lowercase) — link target
}

const RE = /@[a-zA-Z0-9_]{3,30}|#[a-zA-Z0-9_]{2,50}/g;

export function parseRichText(content: string): Segment[] {
  const segs: Segment[] = [];
  let last = 0;
  for (const m of content.matchAll(RE)) {
    const idx = m.index ?? 0;
    if (idx > last) {
      segs.push({ type: 'text', raw: content.slice(last, idx), value: '' });
    }
    const raw = m[0];
    const isMention = raw.startsWith('@');
    segs.push({
      type: isMention ? 'mention' : 'hashtag',
      raw,
      value: raw.slice(1).toLowerCase(),
    });
    last = idx + raw.length;
  }
  if (last < content.length) {
    segs.push({ type: 'text', raw: content.slice(last), value: '' });
  }
  return segs;
}

interface Props {
  content: string;
  baseStyle?: TextStyle;
  linkColor?: string;
  /** Profile sayfası 6.E'de — şimdilik no-op opsiyonel */
  onMentionPress?: (username: string) => void;
}

export function RichText({
  content,
  baseStyle,
  linkColor = '#1F4FB6',
  onMentionPress,
}: Props) {
  const segments = parseRichText(content);
  return (
    <Text style={[{ fontFamily: FONTS.body, fontSize: 14, color: '#0E1116', lineHeight: 21 }, baseStyle]}>
      {segments.map((s, i) => {
        if (s.type === 'text') {
          return (
            <Text key={i}>
              {s.raw}
            </Text>
          );
        }
        if (s.type === 'hashtag') {
          return (
            <Text
              key={i}
              style={{ color: linkColor, fontFamily: FONTS.body700 }}
              onPress={() => router.push(`/community/hashtag/${s.value}` as any)}
            >
              {s.raw}
            </Text>
          );
        }
        // mention
        return (
          <Text
            key={i}
            style={{ color: linkColor, fontFamily: FONTS.body700 }}
            onPress={() => {
              if (onMentionPress) onMentionPress(s.value);
              // 6.E profile screen yok ise sessiz no-op
            }}
          >
            {s.raw}
          </Text>
        );
      })}
    </Text>
  );
}

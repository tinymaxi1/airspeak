/**
 * AirSpeak Lesson Components
 *
 * - LessonChrome: in-lesson top bar (X + progress + hearts)
 * - LessonATCBubble: navy chat bubble with tower/captain header
 * - LessonHintBanner: gold-paper banner with lightning icon
 * - LessonOptionCard: lesson seçeneği (a/b/c/d) — pressable, selected state
 * - LessonFeedbackSheet: bottom sheet correct/wrong feedback
 */
import { View, Text, TouchableOpacity, type ViewProps } from 'react-native';
import type { ReactNode } from 'react';
import { Eyebrow, Mono, Body, FONTS } from './typography';

// ═══════════════════════════════════════════════
// LESSON CHROME — top progress + close + hearts
// ═══════════════════════════════════════════════

export function LessonChrome({
  progress = 0,
  hearts = 5,
  onClose,
}: {
  progress: number;
  hearts: number;
  onClose?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 6,
      }}
    >
      <TouchableOpacity onPress={onClose} hitSlop={8}>
        <Text style={{ fontSize: 24, color: '#0E1116', fontWeight: '300' }}>✕</Text>
      </TouchableOpacity>

      <View
        style={{
          flex: 1,
          height: 12,
          backgroundColor: '#EDEFF3',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height: '100%',
            backgroundColor: '#E63946',
            borderRadius: 999,
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 18 }}>❤</Text>
        <Text
          style={{
            fontFamily: FONTS.body800,
            fontSize: 15,
            color: '#E63946',
          }}
        >
          {hearts}
        </Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════
// LESSON ATC BUBBLE — navy chat bubble
// ═══════════════════════════════════════════════

export function LessonATCBubble({
  source = 'ISTANBUL TOWER',
  message,
  highlightedText,
}: {
  source?: string;
  message: string;
  highlightedText?: string[];
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: '#0F1E47',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 20 }}>📡</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Mono style={{ fontSize: 11, color: '#8A93A6', letterSpacing: 1 }}>{source}</Mono>
        <View
          style={{
            backgroundColor: '#0F1E47',
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 4,
            borderTopRightRadius: 18,
            borderBottomRightRadius: 18,
            borderBottomLeftRadius: 18,
            marginTop: 4,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.body500,
              fontSize: 16,
              color: '#FFFFFF',
              lineHeight: 23,
            }}
          >
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════
// LESSON HINT BANNER — gold paper hint
// ═══════════════════════════════════════════════

export function LessonHintBanner({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: '#FFF3D1',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Text style={{ fontSize: 18 }}>⚡</Text>
      <Body style={{ fontSize: 13, color: '#0A1430', flex: 1 }}>{children}</Body>
    </View>
  );
}

// ═══════════════════════════════════════════════
// LESSON OPTION CARD — a/b/c/d pressable card
// ═══════════════════════════════════════════════

export function LessonOptionCard({
  letter,
  text,
  selected = false,
  state = 'idle',
  onPress,
}: {
  letter: string;
  text: string;
  selected?: boolean;
  state?: 'idle' | 'correct' | 'wrong';
  onPress?: () => void;
}) {
  const config = {
    idle: {
      borderColor: selected ? '#E63946' : '#DCE0E8',
      borderWidth: selected ? 2.5 : 1.5,
      shadowColor: selected ? '#E63946' : '#B8BFCC',
      letterBg: selected ? '#E63946' : '#E9E6DD',
      letterFg: selected ? '#FFFFFF' : '#5A6478',
    },
    correct: {
      borderColor: '#2DBE6C',
      borderWidth: 2.5,
      shadowColor: '#1FA35A',
      letterBg: '#2DBE6C',
      letterFg: '#FFFFFF',
    },
    wrong: {
      borderColor: '#E63946',
      borderWidth: 2.5,
      shadowColor: '#C8202E',
      letterBg: '#E63946',
      letterFg: '#FFFFFF',
    },
  }[state];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: config.borderWidth,
        borderColor: config.borderColor,
        borderBottomWidth: 4,
        borderBottomColor: config.shadowColor,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 14,
        paddingVertical: 14,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: config.letterBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.mono700,
            fontSize: 14,
            color: config.letterFg,
          }}
        >
          {letter.toUpperCase()}
        </Text>
      </View>
      <Text
        style={{
          flex: 1,
          fontFamily: FONTS.body500,
          fontSize: 15,
          color: '#0E1116',
          lineHeight: 22,
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════
// LESSON FEEDBACK BLOCK — correct/wrong inline
// ═══════════════════════════════════════════════

export function LessonFeedbackInline({
  state,
  message,
}: {
  state: 'correct' | 'wrong';
  message: string;
}) {
  const config =
    state === 'correct'
      ? { bg: '#DDF7E6', fg: '#1FA35A', icon: '✓', label: 'Doğru!' }
      : { bg: '#FFE4E7', fg: '#C8202E', icon: '✗', label: 'Yanlış' };

  return (
    <View
      style={{
        backgroundColor: config.bg,
        borderRadius: 14,
        padding: 14,
        gap: 6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            fontFamily: FONTS.body800,
            fontSize: 18,
            color: config.fg,
          }}
        >
          {config.icon} {config.label}
        </Text>
      </View>
      <Body color="#0E1116" style={{ fontSize: 13 }}>
        {message}
      </Body>
    </View>
  );
}

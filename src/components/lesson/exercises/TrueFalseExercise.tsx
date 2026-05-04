/**
 * TrueFalseExercise — doğru/yanlış
 *
 * Format:
 * - exercise.prompt / prompt_tr: ifade
 * - exercise.is_true: true | false (Sprint 10.A — DB kolonu)
 * - 2 buton: ✓ Doğru / ✗ Yanlış
 * - Tıklayınca direkt feedback (Cevapla butonu yok)
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FONTS, LessonFeedbackInline } from '@/components/airspeak';
import type { ExerciseProps } from './types';

export function TrueFalseExercise({ exercise, showFeedback, onSubmit }: ExerciseProps) {
  const [picked, setPicked] = useState<boolean | null>(null);
  const correctAnswer = exercise.is_true ?? false;

  function pick(value: boolean) {
    if (showFeedback) return;
    setPicked(value);
    onSubmit(value === correctAnswer);
  }

  return (
    <View>
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 22,
          fontWeight: '700',
          color: '#0E1116',
          marginBottom: 28,
          lineHeight: 30,
          letterSpacing: -0.44,
        }}
      >
        {exercise.prompt_tr ?? exercise.prompt ?? ''}
      </Text>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* TRUE */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={showFeedback}
          onPress={() => pick(true)}
          style={{
            flex: 1,
            paddingVertical: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              picked === true
                ? showFeedback
                  ? correctAnswer === true
                    ? '#DDF7E6'
                    : '#FFE4E7'
                  : '#E0F0FF'
                : showFeedback && correctAnswer === true
                  ? '#DDF7E6'
                  : '#FFFFFF',
            borderWidth: 2.5,
            borderColor:
              picked === true
                ? showFeedback
                  ? correctAnswer === true
                    ? '#2DBE6C'
                    : '#E63946'
                  : '#2EA8FF'
                : showFeedback && correctAnswer === true
                  ? '#2DBE6C'
                  : '#DCE0E8',
            borderBottomWidth: 4,
            borderBottomColor:
              picked === true
                ? showFeedback
                  ? correctAnswer === true
                    ? '#1FA35A'
                    : '#C8202E'
                  : '#1F86CC'
                : showFeedback && correctAnswer === true
                  ? '#1FA35A'
                  : '#B8BFCC',
          }}
        >
          <Text style={{ fontSize: 36 }}>✓</Text>
          <Text
            style={{
              fontFamily: FONTS.body700,
              fontSize: 15,
              color: '#0E1116',
              marginTop: 6,
              letterSpacing: 0.3,
            }}
          >
            Doğru
          </Text>
        </TouchableOpacity>

        {/* FALSE */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={showFeedback}
          onPress={() => pick(false)}
          style={{
            flex: 1,
            paddingVertical: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              picked === false
                ? showFeedback
                  ? correctAnswer === false
                    ? '#DDF7E6'
                    : '#FFE4E7'
                  : '#E0F0FF'
                : showFeedback && correctAnswer === false
                  ? '#DDF7E6'
                  : '#FFFFFF',
            borderWidth: 2.5,
            borderColor:
              picked === false
                ? showFeedback
                  ? correctAnswer === false
                    ? '#2DBE6C'
                    : '#E63946'
                  : '#2EA8FF'
                : showFeedback && correctAnswer === false
                  ? '#2DBE6C'
                  : '#DCE0E8',
            borderBottomWidth: 4,
            borderBottomColor:
              picked === false
                ? showFeedback
                  ? correctAnswer === false
                    ? '#1FA35A'
                    : '#C8202E'
                  : '#1F86CC'
                : showFeedback && correctAnswer === false
                  ? '#1FA35A'
                  : '#B8BFCC',
          }}
        >
          <Text style={{ fontSize: 36 }}>✗</Text>
          <Text
            style={{
              fontFamily: FONTS.body700,
              fontSize: 15,
              color: '#0E1116',
              marginTop: 6,
              letterSpacing: 0.3,
            }}
          >
            Yanlış
          </Text>
        </TouchableOpacity>
      </View>

      {showFeedback && picked !== null && (
        <View style={{ marginTop: 20 }}>
          <LessonFeedbackInline
            state={picked === correctAnswer ? 'correct' : 'wrong'}
            message={exercise.explanation_tr ?? exercise.explanation ?? ''}
          />
        </View>
      )}
    </View>
  );
}

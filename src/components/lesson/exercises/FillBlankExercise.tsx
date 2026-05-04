/**
 * FillBlankExercise — boşluk doldurma
 *
 * Format:
 * - exercise.prompt_tr içinde "___" placeholder
 * - exercise.options 4 şık
 * - Şık seçilince placeholder dolar (önizleme)
 * - "Cevapla" butonu seçim varsa aktif
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button3D, FONTS, LessonFeedbackInline } from '@/components/airspeak';
import type { ExerciseProps } from './types';

export function FillBlankExercise({ exercise, showFeedback, onSubmit }: ExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = (exercise.options ?? []) as { id: string; text: string }[];
  const correctText = options.find((o) => o.id === exercise.correct_id)?.text ?? '';
  const selectedText = options.find((o) => o.id === selected)?.text ?? '';
  const isCorrect = selected === exercise.correct_id;

  const promptRaw = exercise.prompt_tr ?? exercise.prompt ?? '';
  const promptParts = promptRaw.split(/_{3,}/);
  const fillText = showFeedback ? correctText : selectedText;

  return (
    <View>
      {/* Prompt with blank */}
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 22,
          fontWeight: '700',
          color: '#0E1116',
          lineHeight: 30,
          letterSpacing: -0.44,
          marginTop: 8,
        }}
      >
        {promptParts[0]}
        <Text
          style={{
            backgroundColor: showFeedback
              ? isCorrect
                ? '#DDF7E6'
                : '#FFE4E7'
              : selected
                ? '#FFF3CC'
                : '#EEEFF3',
            color: showFeedback && !isCorrect ? '#C8202E' : '#0E1116',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          {fillText || '_____'}
        </Text>
        {promptParts.slice(1).join('___')}
      </Text>

      {/* Options */}
      <View style={{ gap: 10, marginTop: 24 }}>
        {options.map((opt) => {
          const isSel = selected === opt.id;
          const isCorr = showFeedback && opt.id === exercise.correct_id;
          const isWrong = showFeedback && isSel && !isCorr;
          return (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.85}
              disabled={showFeedback}
              onPress={() => setSelected(opt.id)}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
                borderWidth: isSel || isCorr || isWrong ? 2.5 : 1.5,
                borderColor: isCorr
                  ? '#2DBE6C'
                  : isWrong
                    ? '#E63946'
                    : isSel
                      ? '#E63946'
                      : '#DCE0E8',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: FONTS.body700, fontSize: 15, color: '#0E1116' }}>
                {opt.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showFeedback && (
        <View style={{ marginTop: 16 }}>
          <LessonFeedbackInline
            state={isCorrect ? 'correct' : 'wrong'}
            message={exercise.explanation_tr ?? exercise.explanation ?? ''}
          />
        </View>
      )}

      {!showFeedback && (
        <View style={{ marginTop: 24 }}>
          <Button3D
            variant="primary"
            fullWidth
            disabled={!selected}
            onPress={() => onSubmit(isCorrect)}
          >
            Cevapla
          </Button3D>
        </View>
      )}
    </View>
  );
}

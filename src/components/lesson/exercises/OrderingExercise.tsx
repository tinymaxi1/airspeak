/**
 * OrderingExercise — sıralama
 *
 * Format:
 * - exercise.options: chip pool
 * - exercise.correct_order: ['id1','id2',...] doğru sıra
 * - Chip'e tıklayınca alta sıraya eklenir
 * - Sıradaki chip'e tıklayınca çıkar (geri pool'a döner)
 * - Tüm chip'ler sıralanınca "Cevapla" aktif → onSubmit(isCorrect)
 */
import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button3D, FONTS, LessonFeedbackInline } from '@/components/airspeak';
import type { ExerciseProps } from './types';

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function OrderingExercise({ exercise, showFeedback, onSubmit }: ExerciseProps) {
  const options = (exercise.options ?? []) as { id: string; text: string }[];
  const correctOrder = exercise.correct_order ?? [];
  const shuffled = useMemo(() => shuffle(options, exercise.id.charCodeAt(0)), [options, exercise.id]);

  const [order, setOrder] = useState<string[]>([]);
  const isComplete = order.length === options.length;
  const isCorrect = useMemo(
    () => isComplete && order.every((id, i) => id === correctOrder[i]),
    [order, correctOrder, isComplete],
  );

  const remaining = shuffled.filter((o) => !order.includes(o.id));

  function pickFromPool(id: string) {
    if (showFeedback) return;
    setOrder((prev) => [...prev, id]);
  }
  function removeFromOrder(id: string) {
    if (showFeedback) return;
    setOrder((prev) => prev.filter((x) => x !== id));
  }

  return (
    <View>
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 20,
          fontWeight: '700',
          color: '#0E1116',
          marginBottom: 16,
          letterSpacing: -0.4,
        }}
      >
        {exercise.prompt_tr ?? exercise.prompt ?? 'Doğru sıraya koy'}
      </Text>

      {/* Order line — kullanıcının diziminin oluşacağı yer */}
      <View
        style={{
          minHeight: 60,
          padding: 12,
          borderRadius: 10,
          backgroundColor: '#F4F5F7',
          borderWidth: 1.5,
          borderColor: '#DCE0E8',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 6,
          alignItems: 'flex-start',
        }}
      >
        {order.length === 0 && (
          <Text style={{ fontFamily: FONTS.body, fontSize: 13, color: '#8A93A6', fontStyle: 'italic' }}>
            Aşağıdaki kelimeleri doğru sıraya koy
          </Text>
        )}
        {order.map((id, idx) => {
          const opt = options.find((o) => o.id === id);
          if (!opt) return null;
          const isWrongPos = showFeedback && correctOrder[idx] !== id;
          const isRightPos = showFeedback && correctOrder[idx] === id;
          return (
            <TouchableOpacity
              key={`order-${id}`}
              onPress={() => removeFromOrder(id)}
              disabled={showFeedback}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: isWrongPos ? '#FFE4E7' : isRightPos ? '#DDF7E6' : '#FFFFFF',
                borderWidth: 1.5,
                borderColor: isWrongPos ? '#E63946' : isRightPos ? '#2DBE6C' : '#0F1E47',
              }}
            >
              <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0E1116' }}>
                {idx + 1}. {opt.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pool — kalan chip'ler */}
      <Text
        style={{
          marginTop: 16,
          marginBottom: 8,
          fontFamily: FONTS.mono,
          fontSize: 10,
          color: '#5A6478',
          letterSpacing: 1.4,
        }}
      >
        KELİME HAVUZU
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {remaining.map((opt) => (
          <TouchableOpacity
            key={`pool-${opt.id}`}
            onPress={() => pickFromPool(opt.id)}
            disabled={showFeedback}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
            }}
          >
            <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0E1116' }}>
              {opt.text}
            </Text>
          </TouchableOpacity>
        ))}
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
            disabled={!isComplete}
            onPress={() => onSubmit(isCorrect)}
          >
            Cevapla
          </Button3D>
        </View>
      )}
    </View>
  );
}

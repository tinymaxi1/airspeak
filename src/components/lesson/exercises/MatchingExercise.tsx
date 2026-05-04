/**
 * MatchingExercise — eşleştirme
 *
 * Format:
 * - exercise.pairs: [{id, left, right}] (Sprint 10.A — DB kolonu)
 * - Sol kolon: left (sıralı)
 * - Sağ kolon: right (karışık)
 * - Sol seç → mavi; sağ seç → eşleşme dene
 *   - Doğru → yeşil sabit, ikisi disable
 *   - Yanlış → kısa kırmızı flash, seçim sıfırla
 * - Tüm pair eşleşince otomatik onSubmit(true)
 */
import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FONTS } from '@/components/airspeak';
import type { ExerciseProps } from './types';

type Status = 'idle' | 'matched' | 'wrong';

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function MatchingExercise({ exercise, showFeedback, onSubmit }: ExerciseProps) {
  const pairs = exercise.pairs ?? [];
  const lefts = useMemo(() => pairs, [pairs]);
  const rights = useMemo(() => shuffle(pairs, exercise.id.charCodeAt(0)), [pairs, exercise.id]);

  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState<{ left: string; right: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function tryMatch(rightId: string) {
    if (!selectedLeft) return;
    if (selectedLeft === rightId) {
      // Doğru eşleşme
      setMatchedIds((prev) => new Set([...prev, rightId]));
      setSelectedLeft(null);
    } else {
      // Yanlış — kısa flash
      setWrongFlash({ left: selectedLeft, right: rightId });
      setTimeout(() => {
        setWrongFlash(null);
        setSelectedLeft(null);
      }, 600);
    }
  }

  useEffect(() => {
    if (matchedIds.size === pairs.length && pairs.length > 0 && !submitted && !showFeedback) {
      setSubmitted(true);
      // Tüm eşleşmeler doğru zaten — pairs kontrolü id eşitliği üzerine
      onSubmit(true);
    }
  }, [matchedIds, pairs.length, submitted, showFeedback, onSubmit]);

  function leftStatus(id: string): Status {
    if (matchedIds.has(id)) return 'matched';
    if (wrongFlash?.left === id) return 'wrong';
    return 'idle';
  }
  function rightStatus(id: string): Status {
    if (matchedIds.has(id)) return 'matched';
    if (wrongFlash?.right === id) return 'wrong';
    return 'idle';
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
        {exercise.prompt_tr ?? exercise.prompt ?? 'Eşleştir'}
      </Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {/* Sol kolon */}
        <View style={{ flex: 1, gap: 8 }}>
          {lefts.map((p) => {
            const st = leftStatus(p.id);
            const isSel = selectedLeft === p.id;
            return (
              <TouchableOpacity
                key={`L-${p.id}`}
                disabled={st === 'matched' || showFeedback}
                onPress={() => setSelectedLeft(p.id)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor:
                    st === 'matched'
                      ? '#2DBE6C'
                      : st === 'wrong'
                        ? '#E63946'
                        : isSel
                          ? '#2EA8FF'
                          : '#DCE0E8',
                  backgroundColor:
                    st === 'matched'
                      ? '#DDF7E6'
                      : st === 'wrong'
                        ? '#FFE4E7'
                        : isSel
                          ? '#E0F0FF'
                          : '#FFFFFF',
                  opacity: st === 'matched' ? 0.7 : 1,
                }}
              >
                <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                  {p.left}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sağ kolon */}
        <View style={{ flex: 1, gap: 8 }}>
          {rights.map((p) => {
            const st = rightStatus(p.id);
            return (
              <TouchableOpacity
                key={`R-${p.id}`}
                disabled={st === 'matched' || showFeedback || !selectedLeft}
                onPress={() => tryMatch(p.id)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor:
                    st === 'matched' ? '#2DBE6C' : st === 'wrong' ? '#E63946' : '#DCE0E8',
                  backgroundColor:
                    st === 'matched' ? '#DDF7E6' : st === 'wrong' ? '#FFE4E7' : '#FFFFFF',
                  opacity: st === 'matched' ? 0.7 : 1,
                }}
              >
                <Text style={{ fontFamily: FONTS.body, fontSize: 14, color: '#0E1116' }}>
                  {p.right}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text
        style={{
          marginTop: 16,
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: 11,
          color: '#5A6478',
          letterSpacing: 1,
        }}
      >
        {matchedIds.size} / {pairs.length} EŞLEŞTİ
      </Text>
    </View>
  );
}

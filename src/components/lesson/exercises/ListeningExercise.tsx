/**
 * ListeningExercise — dinleme sorusu (audio + MCQ)
 *
 * Format:
 * - exercise.audio_url: ses dosyası
 * - exercise.context / context_tr: opsiyonel transcript
 * - exercise.options: 4 şık (MCQ)
 * - Audio yoksa "Ses dosyası yakında" placeholder
 * - Transcript varsa toggle ile göster/gizle
 */
import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Button3D, FONTS, LessonFeedbackInline } from '@/components/airspeak';
import type { ExerciseProps } from './types';

export function ListeningExercise({ exercise, showFeedback, onSubmit }: ExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const options = (exercise.options ?? []) as { id: string; text: string }[];
  const isCorrect = selected === exercise.correct_id;
  const audioUrl = exercise.audio_url;
  const transcript = exercise.context_tr ?? exercise.context;

  useEffect(() => {
    return () => {
      void soundRef.current?.unloadAsync();
    };
  }, []);

  async function togglePlay() {
    if (!audioUrl) return;
    if (playing) {
      await soundRef.current?.pauseAsync();
      setPlaying(false);
      return;
    }
    setLoading(true);
    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true },
        );
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((s) => {
          if (s.isLoaded && s.didJustFinish) setPlaying(false);
        });
      } else {
        await soundRef.current.replayAsync();
      }
      setPlaying(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      {/* Audio player */}
      <View
        style={{
          backgroundColor: '#0F1E47',
          borderRadius: 14,
          padding: 18,
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        {audioUrl ? (
          <>
            <TouchableOpacity
              onPress={togglePlay}
              disabled={loading}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {loading ? (
                <ActivityIndicator color="#0F1E47" />
              ) : (
                <Text style={{ fontSize: 30 }}>{playing ? '⏸' : '▶'}</Text>
              )}
            </TouchableOpacity>
            <Text
              style={{
                marginTop: 10,
                fontFamily: FONTS.mono,
                fontSize: 11,
                color: 'rgba(255,255,255,0.7)',
                letterSpacing: 1.4,
              }}
            >
              {playing ? 'OYNATILIYOR' : 'OYNAT'}
            </Text>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 36 }}>🎧</Text>
            <Text
              style={{
                marginTop: 8,
                fontFamily: FONTS.body,
                fontSize: 13,
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              Ses dosyası yakında
            </Text>
          </>
        )}
      </View>

      {transcript && (
        <View style={{ marginBottom: 12 }}>
          <TouchableOpacity onPress={() => setShowTranscript((v) => !v)}>
            <Text
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                color: '#2EA8FF',
                letterSpacing: 1.4,
              }}
            >
              {showTranscript ? '▲ METNİ GİZLE' : '▼ METNİ GÖSTER'}
            </Text>
          </TouchableOpacity>
          {showTranscript && (
            <Text
              style={{
                marginTop: 8,
                padding: 10,
                backgroundColor: '#F4F5F7',
                borderRadius: 8,
                fontFamily: FONTS.body,
                fontSize: 13,
                color: '#0E1116',
                fontStyle: 'italic',
              }}
            >
              {transcript}
            </Text>
          )}
        </View>
      )}

      {/* Prompt */}
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 18,
          fontWeight: '700',
          color: '#0E1116',
          marginBottom: 14,
          letterSpacing: -0.36,
        }}
      >
        {exercise.prompt_tr ?? exercise.prompt ?? ''}
      </Text>

      {/* Options */}
      <View style={{ gap: 10 }}>
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
                paddingVertical: 12,
                paddingHorizontal: 14,
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
              }}
            >
              <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
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

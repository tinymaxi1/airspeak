/**
 * Audio recording wrapper — expo-av.
 *
 * - createRecorder: izin + Audio.Recording instance, m4a/aac high quality.
 * - startRecording / stopRecording: lifecycle.
 * - getDuration / getMeteringDb: realtime feedback.
 * - prepareForRecording: audio mode set (iOS playsInSilent).
 *
 * Permission: Audio.requestPermissionsAsync (mevcut Info.plist + AndroidManifest
 *   gereksinimleri zaten projede tanımlı — pronunciation/scorer.ts pattern).
 */
import { Audio } from 'expo-av';

let activeRecording: Audio.Recording | null = null;

export type RecordingState = 'idle' | 'preparing' | 'recording' | 'stopping';

export interface RecordingResult {
  ok: boolean;
  uri?: string;
  durationMs?: number;
  error?: string;
}

const RECORDING_OPTIONS = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.MEDIUM,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 64000,
  },
} as const;

export async function ensureAudioPermission(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

export async function prepareForRecording(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });
}

export async function startRecording(
  onStatus?: (status: { durationMs: number; meteringDb: number | null }) => void,
): Promise<{ ok: boolean; error?: string }> {
  // Eski kayıt varsa temizle
  if (activeRecording) {
    try {
      await activeRecording.stopAndUnloadAsync();
    } catch {
      /* ignore */
    }
    activeRecording = null;
  }

  const granted = await ensureAudioPermission();
  if (!granted) return { ok: false, error: 'permission_denied' };

  await prepareForRecording();

  try {
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(RECORDING_OPTIONS as any);
    if (onStatus) {
      recording.setOnRecordingStatusUpdate((s) => {
        if (!s.canRecord) return;
        onStatus({
          durationMs: s.durationMillis ?? 0,
          meteringDb: typeof s.metering === 'number' ? s.metering : null,
        });
      });
      recording.setProgressUpdateInterval(100);
    }
    await recording.startAsync();
    activeRecording = recording;
    return { ok: true };
  } catch (e) {
    activeRecording = null;
    return { ok: false, error: String(e) };
  }
}

export async function stopRecording(): Promise<RecordingResult> {
  const rec = activeRecording;
  activeRecording = null;
  if (!rec) return { ok: false, error: 'no_active_recording' };

  try {
    await rec.stopAndUnloadAsync();
    const status = (await rec.getStatusAsync()) as { durationMillis?: number };
    const uri = rec.getURI();
    if (!uri) return { ok: false, error: 'no_uri' };
    // Audio mode'u eski haline döndür
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
    return {
      ok: true,
      uri,
      durationMs: status.durationMillis ?? 0,
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function cancelRecording(): Promise<void> {
  const rec = activeRecording;
  activeRecording = null;
  if (!rec) return;
  try {
    await rec.stopAndUnloadAsync();
  } catch {
    /* ignore */
  }
  try {
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
  } catch {
    /* ignore */
  }
}

export function isRecording(): boolean {
  return activeRecording !== null;
}

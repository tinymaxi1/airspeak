/**
 * Local push notifications (cihaz, ücretsiz).
 *
 * 3 hatırlatıcı:
 *   1. Sabah 08:30 — "Günlük uçuş planın hazır"
 *   2. Akşam 21:00 — "Streak'ini koru, 1 ders kaldı"
 *   3. Streak danger 22:30 — son 90 dk uyarı (sadece o gün ders yapmadıysa)
 *
 * Tüm scheduling cihaz tarafında, sunucu yok.
 * Permission istemediği sürece bildirim gelmez.
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Foreground'da gelen bildirim banner görünür olsun
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const CHANNEL_ID = 'airspeak-default';
const ID_MORNING = 'morning-reminder';
const ID_EVENING = 'evening-reminder';
const ID_STREAK_DANGER = 'streak-danger';

export async function requestPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'AirSpeak',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#E63946',
  });
}

interface DailyTimes {
  morningHour: number;
  morningMinute: number;
  eveningHour: number;
  eveningMinute: number;
}

const DEFAULT_TIMES: DailyTimes = {
  morningHour: 8,
  morningMinute: 30,
  eveningHour: 21,
  eveningMinute: 0,
};

export async function scheduleDailyReminders(
  times: DailyTimes = DEFAULT_TIMES,
  texts: {
    morningTitle: string;
    morningBody: string;
    eveningTitle: string;
    eveningBody: string;
  },
): Promise<void> {
  await ensureChannel();

  // Var olan AirSpeak bildirimlerini iptal et (yeniden zamanla)
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if (n.identifier.startsWith('airspeak-') || n.content.data?.app === 'airspeak') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => undefined);
    }
  }

  // Sabah hatırlatıcı
  await Notifications.scheduleNotificationAsync({
    identifier: `airspeak-${ID_MORNING}`,
    content: {
      title: texts.morningTitle,
      body: texts.morningBody,
      sound: true,
      data: { app: 'airspeak', kind: 'morning' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: times.morningHour,
      minute: times.morningMinute,
      repeats: true,
      channelId: CHANNEL_ID,
    },
  });

  // Akşam hatırlatıcı
  await Notifications.scheduleNotificationAsync({
    identifier: `airspeak-${ID_EVENING}`,
    content: {
      title: texts.eveningTitle,
      body: texts.eveningBody,
      sound: true,
      data: { app: 'airspeak', kind: 'evening' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: times.eveningHour,
      minute: times.eveningMinute,
      repeats: true,
      channelId: CHANNEL_ID,
    },
  });
}

/**
 * Streak danger: 22:30'da kontrol — bugün ders yapmadıysa son uyarı.
 * Bu fonksiyon her uygulama açılışında çağrılır.
 * Eğer kullanıcı bugün aktivite kaydetmişse danger bildirimini iptal eder.
 */
export async function updateStreakDangerNotification(
  lastActivityDate: string | null,
  texts: { title: string; body: string },
): Promise<void> {
  await ensureChannel();
  const today = new Date().toISOString().slice(0, 10);
  const id = `airspeak-${ID_STREAK_DANGER}`;

  // Bugün aktivite varsa → cancel
  if (lastActivityDate === today) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
    return;
  }

  // Yoksa → 22:30'da uyarı zamanla (eğer şu an 22:30'dan önce ise)
  const now = new Date();
  const target = new Date();
  target.setHours(22, 30, 0, 0);

  if (now.getTime() >= target.getTime()) {
    // Saat geçmiş, ertesi güne sarkıt
    target.setDate(target.getDate() + 1);
  }

  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: texts.title,
      body: texts.body,
      sound: true,
      data: { app: 'airspeak', kind: 'streak-danger' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
      channelId: CHANNEL_ID,
    },
  });
}

export async function cancelAllAirspeakNotifications(): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if (n.identifier.startsWith('airspeak-') || n.content.data?.app === 'airspeak') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => undefined);
    }
  }
}

export async function getScheduledAirspeakNotifications(): Promise<Notifications.NotificationRequest[]> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.filter((n) => n.identifier.startsWith('airspeak-') || n.content.data?.app === 'airspeak');
}

// ═══════════════════════════════════════════════════════════════════
//  PUSH TOKEN REGISTRATION (Server push için)
//
//  Expo Push Service kullanır (FCM/APNs proxy). Token Supabase'e kayıt edilir,
//  sonradan Edge Function'lar bu token'a push gönderir (streak danger, lig
//  ödülü, AI senaryo vb. — bkz. SPRINTS Sprint 7 "11 bildirim trigger").
// ═══════════════════════════════════════════════════════════════════

/**
 * Cihaza özel Expo push token al. Simulator/web'de null döner.
 * Permission yoksa null döner (caller request edebilir).
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;
  if (Platform.OS === 'web') return null;

  await ensureChannel();

  const granted = await requestPermission();
  if (!granted) return null;

  // EAS Build için projectId şart (eas.json içinde tanımlı)
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenResponse.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Push token'ı Supabase push_tokens tablosuna upsert eder.
 * Auth zorunlu — userId yoksa skip.
 *
 * Aynı cihaz aynı kullanıcıyla tekrar açılırsa updated_at yenilenir,
 * cihaz değişirse yeni satır eklenir (token unique).
 */
export async function syncPushTokenToSupabase(): Promise<{ ok: boolean; reason?: string }> {
  const token = await getExpoPushToken();
  if (!token) return { ok: false, reason: 'no-token' };

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, reason: 'no-auth' };

  const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'other';
  const deviceName = Device.modelName ?? Device.deviceName ?? null;

  const { error } = await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      token,
      platform,
      device_name: deviceName,
      app_version: Constants.expoConfig?.version ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'token' },
  );

  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

/**
 * Logout sırasında çağrılır — bu cihazın token'ını DB'den sil.
 * Push'ları geri çağırır, başka bir hesap login olunca yeni token alınır.
 */
export async function unregisterPushToken(): Promise<void> {
  const token = await getExpoPushToken();
  if (!token) return;
  await supabase.from('push_tokens').delete().eq('token', token);
}

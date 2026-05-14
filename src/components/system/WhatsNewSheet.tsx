/**
 * WhatsNewSheet — yenilikler bottom sheet (Faz 4)
 *
 * Auth gate'ten SONRA render edilir. App açılışta:
 * 1. supabase.rpc('get_latest_release', { p_user_id })
 * 2. seen === false ise sheet aç
 * 3. UI: header + change list (emoji + title + description)
 * 4. mandatory=true → sadece "Devam" buton (kapatılamaz)
 *    mandatory=false → X buton + "Daha sonra"
 * 5. "Tamam, başla" → mark_release_seen(version) RPC + sheet kapat
 */
import { useEffect, useState } from 'react';
import { Modal, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { FONTS, Mono, Body, Button3D } from '@/components/airspeak';
import { track } from '@/lib/posthog';

interface ChangeItem {
  emoji: string;
  title: string;
  description: string;
}

interface ReleaseData {
  version: string;
  changes_tr: ChangeItem[];
  changes_en: ChangeItem[];
  mandatory: boolean;
  released_at: string;
}

export function WhatsNewSheet() {
  const { i18n, t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const [release, setRelease] = useState<ReleaseData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await (supabase as any).rpc('get_latest_release', {
          p_user_id: userId,
        });
        if (cancelled) return;
        if (data?.ok && data.has_release && data.seen === false) {
          setRelease({
            version: String(data.version),
            changes_tr: (data.changes_tr ?? []) as ChangeItem[],
            changes_en: (data.changes_en ?? []) as ChangeItem[],
            mandatory: !!data.mandatory,
            released_at: String(data.released_at ?? ''),
          });
          setVisible(true);
          track('whats_new_shown', { version: data.version, mandatory: data.mandatory });
        }
      } catch (e) {
        if (__DEV__) console.warn('[WhatsNew] fetch failed:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  if (!release || !visible) return null;

  const changes = i18n.language?.startsWith('tr') ? release.changes_tr : release.changes_en;

  async function handleDone() {
    if (!release) return;
    try {
      await (supabase as any).rpc('mark_release_seen', { p_version: release.version });
      track('whats_new_acknowledged', { version: release.version });
    } catch {
      // best-effort
    }
    setVisible(false);
  }

  function handleLater() {
    track('whats_new_dismissed', { version: release?.version ?? 'unknown' });
    setVisible(false);
    // mark_release_seen ÇAĞIRMAZ → sonraki açılışta yine görür
  }

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={release.mandatory ? undefined : handleLater}
    >
      <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
        <SafeAreaView edges={['top']}>
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1.8 }}>
                {t('whatsNew.eyebrow', 'YENİ SÜRÜM').toString()}
              </Mono>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 26,
                  fontWeight: '700',
                  color: '#0E1116',
                  marginTop: 2,
                  letterSpacing: -0.52,
                }}
              >
                v{release.version} {t('whatsNew.titleSuffix', 'Yenilikler')}
              </Text>
            </View>
            {!release.mandatory && (
              <TouchableOpacity onPress={handleLater} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ fontSize: 24, color: '#8A93A6' }}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        >
          {changes.length === 0 ? (
            <Body color="#5A6478" style={{ fontSize: 14, textAlign: 'center', marginTop: 40 }}>
              {t('whatsNew.empty', 'Bu sürüm için detay bulunamadı.').toString()}
            </Body>
          ) : (
            changes.map((c, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  gap: 14,
                  paddingVertical: 14,
                  borderBottomWidth: idx === changes.length - 1 ? 0 : 1,
                  borderBottomColor: '#EDEFF3',
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1.5,
                    borderColor: '#DCE0E8',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.body800,
                      fontSize: 15,
                      color: '#0E1116',
                      marginBottom: 4,
                      lineHeight: 19,
                    }}
                  >
                    {c.title}
                  </Text>
                  <Body color="#5A6478" style={{ fontSize: 13, lineHeight: 19 }}>
                    {c.description}
                  </Body>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#EDEFF3' }}>
          <View style={{ padding: 16, gap: 8 }}>
            <Button3D variant="primary" fullWidth onPress={handleDone}>
              {t('whatsNew.done', 'Tamam, başla').toString()}
            </Button3D>
            {!release.mandatory && (
              <TouchableOpacity onPress={handleLater} style={{ alignItems: 'center', paddingVertical: 8 }}>
                <Mono style={{ fontSize: 11, color: '#8A93A6', letterSpacing: 1.2 }}>
                  {t('whatsNew.later', 'DAHA SONRA').toString()}
                </Mono>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

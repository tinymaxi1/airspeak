/**
 * UpdateGate — OTA güncelleme zorunlu sheet (Faz 4)
 *
 * App açılışta:
 * 1. NetInfo kontrol — bağlantı yoksa pass through
 * 2. checkForUpdate — yeni OTA var mı
 * 3. Available varsa full screen modal:
 *    - "🚀 Yeni sürüm hazır"
 *    - "ŞİMDİ GÜNCELLE" buton (kapatılamaz)
 *    - Tıkla → applyUpdate (15s timeout)
 *    - Progress bar 0-100
 *    - Timeout olursa "İnternet yavaş, daha sonra" dismiss
 *    - Başarılı → reloadAsync (app restart)
 *
 * _layout.tsx EN ÜSTÜNDE render — auth bile yapmadan önce.
 */
import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { checkForUpdate, applyUpdate } from '@/lib/updates';
import { FONTS, Mono, Body, Button3D } from '@/components/airspeak';
import { track } from '@/lib/posthog';

interface Props {
  children: React.ReactNode;
}

export function UpdateGate({ children }: Props) {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1) NetInfo — bağlantı yoksa skip (offline kullanıcıyı kilitlemiyoruz)
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        track('update_gate_skipped', { reason: 'offline' });
        return;
      }
      // 2) Check for update
      const status = await checkForUpdate();
      if (cancelled) return;
      if (status.available) {
        setHasUpdate(true);
        setVersion(status.newUpdateId);
        track('update_gate_shown', { update_id: status.newUpdateId });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Update yok → çocukları normal render et
  if (!hasUpdate) return <>{children}</>;

  async function handleUpdate() {
    setDownloading(true);
    setError(null);
    setProgress(5);
    try {
      await applyUpdate((pct) => setProgress(pct), { timeoutMs: 15_000 });
      // reloadAsync app'i restart eder, bu satıra ulaşmamalı
    } catch (e) {
      setDownloading(false);
      setProgress(0);
      const msg = (e as Error).message;
      if (msg === 'update_download_timeout') {
        setError('İnternet yavaş görünüyor. Lütfen sonra tekrar dene.');
      } else {
        setError('Güncelleme indirilemedi: ' + msg.slice(0, 60));
      }
      track('update_gate_failed', { error: msg });
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {children}
      <Modal visible animationType="fade" transparent={false} statusBarTranslucent>
        <View
          style={{
            flex: 1,
            backgroundColor: '#06091A',
            justifyContent: 'center',
            paddingHorizontal: 28,
          }}
        >
          <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 18 }}>🚀</Text>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 28,
              fontWeight: '700',
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Yeni sürüm hazır
          </Text>
          <Body
            color="rgba(255,255,255,0.75)"
            style={{ fontSize: 15, textAlign: 'center', marginBottom: 28, lineHeight: 22 }}
          >
            Yeni özellikler ve hata düzeltmeleri içeriyor. Devam etmek için güncellemen gerekiyor.
          </Body>

          {downloading ? (
            <View style={{ alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: '100%',
                  height: 8,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    backgroundColor: '#FFD56B',
                  }}
                />
              </View>
              <Mono style={{ fontSize: 11, color: 'rgba(255,213,107,0.85)', letterSpacing: 1.4 }}>
                {progress >= 100
                  ? 'YENİDEN BAŞLATILIYOR...'
                  : `İNDİRİLİYOR · %${Math.round(progress)}`}
              </Mono>
              {progress < 100 && <ActivityIndicator color="#FFD56B" />}
            </View>
          ) : (
            <>
              <Button3D variant="primary" fullWidth onPress={handleUpdate}>
                ŞİMDİ GÜNCELLE
              </Button3D>
              {error && (
                <View style={{ marginTop: 18, alignItems: 'center' }}>
                  <Body color="#FB6D78" style={{ fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
                    {error}
                  </Body>
                  <TouchableOpacity onPress={() => setHasUpdate(false)} hitSlop={8}>
                    <Mono style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.4, textDecorationLine: 'underline' }}>
                      DAHA SONRA →
                    </Mono>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {version && (
            <Mono
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: 1.4,
                textAlign: 'center',
                marginTop: 32,
              }}
            >
              UPDATE ID · {version.slice(0, 8)}
            </Mono>
          )}
        </View>
      </Modal>
    </View>
  );
}

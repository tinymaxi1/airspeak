/**
 * Offline lesson cache state.
 *
 * Vocab + lesson data zaten JS bundle'a dahil — yani teknik olarak
 * uygulama indirildiği anda tüm dersler "indirilmiş" durumda.
 *
 * Bu store kullanıcının "indir" toggle'larını ve network durumunu tutar.
 * NetInfo subscribe ile online/offline değişimi izlenir.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

interface OfflineState {
  /** Kullanıcı tarafından "indirildi" işaretli unit ID'leri */
  downloadedUnits: string[];
  /** Network bağlantısı var mı */
  isOnline: boolean;
  /** Son kontrol zamanı */
  lastCheckedAt: number;

  toggleDownload: (unitId: string) => void;
  isDownloaded: (unitId: string) => boolean;
  setOnlineStatus: (online: boolean) => void;
  /** İlk açılışta/component mount'ta NetInfo subscribe */
  startNetInfoMonitoring: () => () => void;
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      downloadedUnits: [],
      isOnline: true,
      lastCheckedAt: Date.now(),

      toggleDownload: (unitId) => {
        const current = get().downloadedUnits;
        if (current.includes(unitId)) {
          set({ downloadedUnits: current.filter((id) => id !== unitId) });
        } else {
          set({ downloadedUnits: [...current, unitId] });
        }
      },

      isDownloaded: (unitId) => get().downloadedUnits.includes(unitId),

      setOnlineStatus: (online) => set({ isOnline: online, lastCheckedAt: Date.now() }),

      startNetInfoMonitoring: () => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
          const online = state.isConnected === true && state.isInternetReachable !== false;
          if (get().isOnline !== online) {
            set({ isOnline: online, lastCheckedAt: Date.now() });
          }
        });
        return unsubscribe;
      },
    }),
    {
      name: 'airspeak-offline',
      storage: createJSONStorage(() => zustandStorage),
      // isOnline ve lastCheckedAt persist etmek anlamsız — runtime
      partialize: (state) => ({ downloadedUnits: state.downloadedUnits }),
    },
  ),
);

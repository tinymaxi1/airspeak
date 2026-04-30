/**
 * useWalletMigration — first launch'ta MMKV → DB one-way migration.
 *
 * gamificationStore'daki local coins/streakFreezes/hints DB'ye taşınır
 * (kullanıcı kaybetmesin), idempotent (RPC'de source='one_way_migration'
 * kaydı varsa skip).
 *
 * Sonraki etkileşimler DB authoritative olur, MMKV sadece cache.
 */
import { useEffect } from 'react';
import { storage, getItem, setItem } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { migrateLocalCoins } from './api';

const MIGRATION_FLAG_KEY = 'airspeak.wallet.migrated';

interface MigrationFlag {
  userId: string;
  migratedAt: number;
}

export function useWalletMigration() {
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!userId) return;

    const flag = getItem<MigrationFlag>(MIGRATION_FLAG_KEY);
    if (flag?.userId === userId) return; // Bu cihazda bu user için zaten yapıldı

    const { coins, streakFreezes, hints } = useGamificationStore.getState();

    // Hiç local coin yoksa migration gerek yok ama flag yine de set et
    void migrateLocalCoins({
      coins: coins ?? 0,
      freezes: streakFreezes ?? 0,
      hints: hints ?? 0,
    }).then((r) => {
      if (r.ok) {
        setItem(MIGRATION_FLAG_KEY, { userId, migratedAt: Date.now() });
        // Local'i sıfırla — DB authoritative artık
        if (!r.already_migrated) {
          useGamificationStore.setState({
            coins: 0,
            streakFreezes: 0,
            hints: 0,
          });
        }
      }
    });
  }, [userId]);
}

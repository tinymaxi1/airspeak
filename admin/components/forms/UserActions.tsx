'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/Dialog';
import {
  setPremium,
  banUser,
  unbanUser,
  setAdminRole,
} from '@/lib/content/actions';
import { toast } from 'sonner';
import { Crown, Ban, ShieldCheck, MoreVertical } from 'lucide-react';

export function UserRowActions({
  user,
}: {
  user: {
    id: string;
    full_name?: string | null;
    username?: string | null;
    is_admin: boolean;
    admin_role: string | null;
    premium_until: string | null;
    banned_at: string | null;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const [premiumDays, setPremiumDays] = useState(30);
  const [banReason, setBanReason] = useState('');
  const [adminRole, setAdminRoleSel] = useState<string>(user.admin_role ?? 'reviewer');

  const isPremium = user.premium_until && new Date(user.premium_until) > new Date();
  const isBanned = !!user.banned_at;

  function doPremium() {
    startTransition(async () => {
      const r = await setPremium(user.id, premiumDays === 0 ? null : premiumDays);
      if (r.ok) {
        toast.success(premiumDays === 0 ? 'Premium kaldırıldı' : `${premiumDays} gün premium verildi`);
        setPremiumOpen(false);
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function doBan() {
    if (!banReason) {
      toast.error('Sebep zorunlu');
      return;
    }
    startTransition(async () => {
      const r = await banUser(user.id, banReason);
      if (r.ok) {
        toast.success('Kullanıcı yasaklandı');
        setBanOpen(false);
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function doUnban() {
    startTransition(async () => {
      const r = await unbanUser(user.id);
      if (r.ok) {
        toast.success('Yasak kaldırıldı');
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function doAdminRole() {
    startTransition(async () => {
      const r = await setAdminRole(user.id, adminRole as any);
      if (r.ok) {
        toast.success('Admin rolü güncellendi');
        setAdminOpen(false);
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function doRemoveAdmin() {
    startTransition(async () => {
      const r = await setAdminRole(user.id, null);
      if (r.ok) {
        toast.success('Admin rolü kaldırıldı');
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="flex items-center gap-1">
      {/* Premium */}
      <Button size="sm" variant={isPremium ? 'gold' : 'outline'} onClick={() => setPremiumOpen(true)}>
        <Crown className="w-3.5 h-3.5" />
      </Button>
      <Dialog open={premiumOpen} onOpenChange={setPremiumOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Premium yönetimi</DialogTitle>
            <DialogDescription>
              {user.full_name ?? user.username ?? user.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Süre (gün)</Label>
              <div className="flex gap-2 mt-1">
                {[7, 30, 90, 365].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    size="sm"
                    variant={premiumDays === d ? 'primary' : 'outline'}
                    onClick={() => setPremiumDays(d)}
                  >
                    {d}g
                  </Button>
                ))}
                <Input
                  type="number"
                  min={0}
                  className="w-24"
                  value={premiumDays}
                  onChange={(e) => setPremiumDays(Number(e.target.value))}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                0 gün = premium kaldır
              </p>
            </div>
            {isPremium && (
              <p className="text-xs text-amber-700">
                Şu an aktif:{' '}
                {new Date(user.premium_until!).toLocaleDateString('tr-TR')}'a kadar
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPremiumOpen(false)}>Vazgeç</Button>
            <Button variant="gold" disabled={isPending} onClick={doPremium}>
              {premiumDays === 0 ? 'Kaldır' : 'Ver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban */}
      {isBanned ? (
        <Button size="sm" variant="outline" onClick={doUnban} disabled={isPending}>
          <Ban className="w-3.5 h-3.5" /> Kaldır
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setBanOpen(true)}>
          <Ban className="w-3.5 h-3.5" />
        </Button>
      )}
      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Kullanıcıyı yasakla</DialogTitle>
            <DialogDescription>Hesap hemen askıya alınır. Geri açabilirsin.</DialogDescription>
          </DialogHeader>
          <div>
            <Label required>Sebep</Label>
            <Textarea
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Spam içerik · 3+ flag"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanOpen(false)}>Vazgeç</Button>
            <Button variant="destructive" disabled={isPending} onClick={doBan}>
              Yasakla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin role */}
      {user.is_admin ? (
        <Button size="sm" variant="ghost" onClick={() => setAdminOpen(true)}>
          <ShieldCheck className="w-3.5 h-3.5 text-airspeak-red" />
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setAdminOpen(true)}>
          <ShieldCheck className="w-3.5 h-3.5" />
        </Button>
      )}
      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Admin yönetimi</DialogTitle>
            <DialogDescription>Sadece super_admin değiştirebilir.</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Rol</Label>
            <Select value={adminRole} onChange={(e) => setAdminRoleSel(e.target.value)}>
              <option value="reviewer">Reviewer (publish onayı)</option>
              <option value="editor">Editor (içerik CRUD)</option>
              <option value="super_admin">Super Admin (tam yetki)</option>
            </Select>
          </div>
          <DialogFooter>
            {user.is_admin && (
              <Button variant="destructive" disabled={isPending} onClick={doRemoveAdmin}>
                Admin'liği kaldır
              </Button>
            )}
            <Button variant="outline" onClick={() => setAdminOpen(false)}>Vazgeç</Button>
            <Button disabled={isPending} onClick={doAdminRole}>
              {user.is_admin ? 'Güncelle' : 'Admin yap'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

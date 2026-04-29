'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicMode, setMagicMode] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error('E-posta gerekli');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    if (magicMode) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Magic link e-postana gönderildi.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        router.replace('/');
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-airspeak-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-airspeak-navy tracking-tight">
            AirSpeak Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">İçerik yönetim paneli</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-border rounded-2xl shadow-sm p-8 space-y-5"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-b-2 border-border focus:border-airspeak-red outline-none py-2 text-base"
              placeholder="admin@airspeak.io"
            />
          </div>

          {!magicMode && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!magicMode}
                className="w-full border-b-2 border-border focus:border-airspeak-red outline-none py-2 text-base"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-airspeak-red text-white font-bold rounded-xl py-3 hover:opacity-95 disabled:opacity-50 transition"
          >
            {loading ? 'Yükleniyor...' : magicMode ? 'Magic link gönder' : 'Giriş yap'}
          </button>

          <button
            type="button"
            onClick={() => setMagicMode(!magicMode)}
            className="block w-full text-sm text-muted-foreground hover:text-foreground"
          >
            {magicMode ? '← Şifre ile giriş yap' : 'Şifresiz giriş (magic link)'}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Sadece is_admin = true kullanıcılar erişebilir.
        </p>
      </div>
    </div>
  );
}

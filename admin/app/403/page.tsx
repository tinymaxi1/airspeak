import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-airspeak-background px-4">
      <div className="max-w-md w-full text-center">
        <ShieldAlert className="w-16 h-16 text-airspeak-red mx-auto" />
        <h1 className="mt-6 text-3xl font-bold text-airspeak-navy">Erişim engellendi</h1>
        <p className="mt-2 text-muted-foreground">
          Bu sayfaya erişmek için yeterli yetkin yok. Admin değilsen bu sayfayı göremezsin.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block bg-airspeak-red text-white font-bold rounded-xl px-5 py-2.5"
        >
          Giriş yap
        </Link>
      </div>
    </div>
  );
}

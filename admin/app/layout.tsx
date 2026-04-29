import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'AirSpeak Admin',
  description: 'AirSpeak içerik yönetim paneli',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-airspeak-background text-foreground antialiased">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

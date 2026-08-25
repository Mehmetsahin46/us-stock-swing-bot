import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'US Stock Swing Bot | 1-14 Gün Kağıt İşlem Simülatörü',
  description: 'ABD Borsası otomatik teknik tarama, swing trading ve analiz doğrulama platformu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-background text-slate-100 antialiased selection:bg-primary-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0B0F19'
};

export const metadata: Metadata = {
  title: 'Global & BIST Swing Bot | Profesyonel Ticaret Portalı',
  description: 'Borsa İstanbul ve ABD Borsaları yapay zeka destekli otonom swing ticaret botu',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SwingBot'
  }
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

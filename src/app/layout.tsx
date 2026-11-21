import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthPromptProvider } from '@/components/auth/AuthPromptModal';
import { ThemeProvider } from '@/components/ThemeProvider';
import ShopAdBanner from '@/components/ShopAdBanner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lapmatch - Smart Laptop Matching & Recommendation',
  description: 'Lapmatch: Platform Rekomendasi Laptop Cerdas Mahasiswa Berbasis AI & Algoritma Multi-Kriteria Presisi',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`light h-full ${plusJakartaSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-900 dark:bg-[#0a0f1d] dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white relative font-sans transition-colors duration-200">
        <ThemeProvider>
          {/* Subtle ambient lighting - calm navy, indigo, and soft blue tones */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-[120px] pointer-events-none z-0 opacity-40 dark:opacity-70 transition-opacity" />
          <div className="fixed top-32 right-0 w-[450px] h-[300px] bg-gradient-to-bl from-indigo-500/10 via-blue-500/5 to-transparent blur-[100px] pointer-events-none z-0 opacity-30 dark:opacity-60 transition-opacity" />
          <div className="fixed top-64 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-slate-500/5 via-blue-600/5 to-transparent blur-[100px] pointer-events-none z-0 opacity-20 dark:opacity-50 transition-opacity" />

          <div className="relative z-10 flex flex-col min-h-screen">
            <ShopAdBanner />
            <AuthPromptProvider>
              {children}
            </AuthPromptProvider>
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '13px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4), 0 4px 6px -2px rgba(15, 23, 42, 0.2)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

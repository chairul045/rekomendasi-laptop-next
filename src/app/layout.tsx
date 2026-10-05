import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Sistem Rekomendasi Laptop - SPK TOPSIS',
  description: 'Sistem Pendukung Keputusan Pemilihan Laptop Mahasiswa Berbasis AI & Algoritme TOPSIS - ROC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#09090d] text-zinc-100 antialiased selection:bg-violet-500 selection:text-white relative">
        {/* Ambient 21st.dev colorful glow backdrops */}
        <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-80 z-0" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-violet-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none z-0" />
        <div className="fixed top-20 right-0 w-[500px] h-[350px] bg-gradient-to-bl from-cyan-500/15 via-blue-600/10 to-transparent blur-[110px] pointer-events-none z-0" />
        <div className="fixed top-60 left-0 w-[450px] h-[350px] bg-gradient-to-tr from-pink-500/10 via-purple-600/10 to-transparent blur-[110px] pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0e0e15',
              color: '#f4f4f5',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              fontSize: '13px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            },
          }}
        />
      </body>
    </html>
  );
}

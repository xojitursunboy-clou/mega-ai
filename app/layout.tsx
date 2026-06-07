import type { Metadata } from 'next';
import './globals.css';
import { LangProvider } from '@/hooks/useLang';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'MegaAI — AI Image Generator & Editor',
  description: 'Create and edit stunning images with the power of AI. Generate, transform, and enhance your photos instantly.',
  keywords: 'AI image generator, image editor, artificial intelligence, photo editing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="antialiased">
        <LangProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#F9FAFB',
                border: '1px solid #1F2937',
              },
              success: { iconTheme: { primary: '#2563EB', secondary: '#fff' } },
            }}
          />
        </LangProvider>
      </body>
    </html>
  );
}

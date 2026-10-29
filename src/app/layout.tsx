import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/app/header';
import { FirebaseProvider } from '@/components/firebase-provider';

export const metadata: Metadata = {
  title: 'PropScrapeAI',
  description: 'Scrape property listings and enhance content with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseProvider>
          <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 transition-colors duration-500">
            <Header />
            <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </main>
            <footer className="text-center p-6 text-sm text-muted-foreground/60 border-t border-border/40 backdrop-blur-sm">
              PropScrapeAI &copy; {new Date().getFullYear()}
            </footer>
          </div>
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}

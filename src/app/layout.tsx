import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import './globals.css';

export const metadata: Metadata = {
  title: 'Pirillo Roriz',
  description: 'Plataforma de gestão para academia de jiu-jitsu',
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang='pt-BR'>
      <body>
        {children}

        <Toaster
          position='bottom-center'
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                'flex items-center gap-3 rounded-xl border border-sky-500/20 bg-sky-600 px-4 py-3 text-sm font-medium text-white shadow-lg',
              title: 'text-sm font-medium text-white',
              description: 'text-sm text-white/90',
              actionButton:
                'rounded-md bg-white/15 px-3 py-1.5 text-sm text-white hover:bg-white/20',
              cancelButton:
                'rounded-md bg-black/20 px-3 py-1.5 text-sm text-white hover:bg-black/30',
              error:
                'flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg',
              success:
                'flex items-center gap-3 rounded-xl border border-sky-500/20 bg-sky-600 px-4 py-3 text-sm font-medium text-white shadow-lg',
            },
          }}
        />
      </body>
    </html>
  );
}

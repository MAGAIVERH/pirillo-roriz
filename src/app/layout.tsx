import type { Metadata } from 'next';
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
      <body>{children}</body>
    </html>
  );
}

import type { ReactNode } from 'react';

type ProfessorRootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function ProfessorRootLayout({
  children,
}: ProfessorRootLayoutProps) {
  return children;
}

import type { ReactNode } from 'react';

import { AdminHeader } from '@/components/layout/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className='min-h-screen bg-black text-white'>
      <div className='grid min-h-screen lg:grid-cols-[280px_1fr]'>
        <AdminSidebar />

        <div className='flex min-h-screen flex-col'>
          <AdminHeader />

          <main className='flex-1 bg-zinc-950/70 px-4 py-6 sm:px-6 lg:px-8'>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

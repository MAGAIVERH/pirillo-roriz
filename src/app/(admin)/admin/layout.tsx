import type { ReactNode } from 'react';

import { AdminHeader } from '@/components/layout/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <SidebarProvider defaultOpen>
        <AdminSidebar />

        <SidebarInset className='min-h-screen bg-black text-white'>
          <div className='flex min-h-screen flex-col'>
            <AdminHeader />

            <main className='flex-1 bg-zinc-950/70 px-4 py-6 sm:px-6 lg:px-8'>
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

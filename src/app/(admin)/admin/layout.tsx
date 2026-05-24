import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { AdminHeader } from '@/components/layout/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { auth } from '@/lib/auth';

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/login');
  }

  const sessionUser = {
    name: session.user.name,
    email: session.user.email,
  };

  return (
    <TooltipProvider delayDuration={150}>
      <SidebarProvider defaultOpen className='min-w-0 overflow-x-hidden'>
        <AdminSidebar user={sessionUser} />

        <SidebarInset className='min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-black text-white'>
          <div className='flex min-h-screen min-w-0 max-w-full flex-col overflow-x-hidden'>
            <AdminHeader />

            <main className='min-w-0 max-w-full flex-1 overflow-x-hidden bg-zinc-950/70 px-4 py-6 sm:px-6 lg:px-8'>
              <div className='mx-auto w-full min-w-0 max-w-[1600px]'>
                {children}
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

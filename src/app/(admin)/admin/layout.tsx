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
      <SidebarProvider defaultOpen>
        <AdminSidebar user={sessionUser} />

        <SidebarInset className='min-h-screen bg-black text-white'>
          <div className='flex min-h-screen flex-col'>
            <AdminHeader userName={sessionUser.name} />

            <main className='flex-1 bg-zinc-950/70 px-4 py-6 sm:px-6 lg:px-8'>
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

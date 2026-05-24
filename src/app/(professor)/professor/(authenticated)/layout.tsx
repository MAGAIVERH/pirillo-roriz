import type { ReactNode } from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { requireInstructorContext, getPortalAccessForUser } from '@/lib/session-context';
import { InstructorHeader } from '@/modules/instructor-portal/components/instructor-header';
import { InstructorSidebar } from '@/modules/instructor-portal/components/instructor-sidebar';

type ProfessorAuthenticatedLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function ProfessorAuthenticatedLayout({
  children,
}: ProfessorAuthenticatedLayoutProps) {
  const { user } = await requireInstructorContext();
  const portalAccess = await getPortalAccessForUser(user.id, user.email);

  const sessionUser = {
    name: user.name,
    email: user.email,
    image: user.image,
  };

  return (
    <TooltipProvider delayDuration={150}>
      <SidebarProvider defaultOpen className="min-w-0 overflow-x-hidden">
        <InstructorSidebar
          user={sessionUser}
          showStudentPortalLink={portalAccess.hasStudentAccess}
        />

        <SidebarInset className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-black text-white">
          <div className="flex min-h-screen min-w-0 max-w-full flex-col overflow-x-hidden">
            <InstructorHeader />

            <main className="min-w-0 max-w-full flex-1 overflow-x-hidden bg-zinc-950/70 px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto w-full min-w-0 max-w-[1600px]">
                {children}
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

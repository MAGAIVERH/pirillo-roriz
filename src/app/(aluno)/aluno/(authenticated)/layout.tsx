import type { ReactNode } from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ensureStudentQrToken } from '@/modules/attendance/lib/ensure-student-qr-token';
import { requireStudentContext } from '@/lib/session-context';
import { StudentHeader } from '@/modules/student-portal/components/student-header';
import { StudentSidebar } from '@/modules/student-portal/components/student-sidebar';
import { getStudentPortalNavCounts } from '@/modules/student-portal/queries/get-student-portal-nav-counts';

type AlunoAuthenticatedLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AlunoAuthenticatedLayout({
  children,
}: AlunoAuthenticatedLayoutProps) {
  const { user, student, academyId } = await requireStudentContext();

  const [{ unreadWarnings }] = await Promise.all([
    getStudentPortalNavCounts(user.id, student.id),
    ensureStudentQrToken(student.id, academyId),
  ]);

  const sessionUser = {
    name: student.preferredName?.trim() || student.fullName,
    email: user.email,
    image: user.image,
  };

  return (
    <TooltipProvider delayDuration={150}>
      <SidebarProvider defaultOpen className="min-w-0 overflow-x-hidden">
        <StudentSidebar user={sessionUser} unreadWarnings={unreadWarnings} />

        <SidebarInset className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-black text-white">
          <div className="flex min-h-screen min-w-0 max-w-full flex-col overflow-x-hidden">
            <StudentHeader />

            <main className="min-w-0 max-w-full flex-1 overflow-x-hidden bg-zinc-950/70 px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto w-full min-w-0 max-w-[1200px]">
                {children}
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

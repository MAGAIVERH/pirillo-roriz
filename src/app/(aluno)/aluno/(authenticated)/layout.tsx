import type { ReactNode } from 'react';
import { Users } from 'lucide-react';

import { requireStudentContext } from '@/lib/session-context';
import { StudentSignOutButton } from '@/modules/student-portal/components/student-sign-out-button';

type AlunoAuthenticatedLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AlunoAuthenticatedLayout({
  children,
}: AlunoAuthenticatedLayoutProps) {
  const { student, user } = await requireStudentContext();
  const displayName = student.preferredName?.trim() || student.fullName;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-zinc-950/90">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500">
                Portal do aluno
              </p>
              <p className="text-sm font-medium text-white">{displayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-zinc-500 sm:inline">
              {user.email}
            </span>
            <StudentSignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

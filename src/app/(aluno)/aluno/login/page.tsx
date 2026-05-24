import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';

import { AppRole } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/session-context';
import { PortalLoginForm } from '@/modules/auth/components/portal-login-form';

export default async function AlunoLoginPage() {
  const session = await getAuthSession();

  if (session) {
    const academy = await getOrCreateDefaultAcademy();

    const [studentRole, student] = await Promise.all([
      db.userRoleAssignment.findFirst({
        where: {
          userId: session.id,
          academyId: academy.id,
          role: AppRole.STUDENT,
        },
        select: { id: true },
      }),
      db.student.findFirst({
        where: {
          userId: session.id,
          academyId: academy.id,
        },
        select: { id: true },
      }),
    ]);

    if (studentRole && student) {
      redirect('/aluno');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/15 text-red-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
              Pirillo Roriz
            </p>
            <h1 className="text-2xl font-bold text-white">Portal do aluno</h1>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Entre com seu email e senha para exibir seu QR Code de presença e
          acompanhar seu histórico.
        </p>

        {session ? (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
            Sua conta não possui acesso de aluno. Use outro login ou peça ao
            admin para liberar seu acesso.
          </div>
        ) : null}

        <div className="mt-6">
          <PortalLoginForm redirectTo="/aluno" portalLabel="portal do aluno" />
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à tela inicial
        </Link>
      </div>
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, GraduationCap } from 'lucide-react';

import { getAuthSession, getPortalAccessForUser } from '@/lib/session-context';
import { PortalLoginForm } from '@/modules/auth/components/portal-login-form';
import { PortalLoginSessionAlert } from '@/modules/auth/components/portal-login-session-alert';

type ProfessorLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ProfessorLoginPage({
  searchParams,
}: ProfessorLoginPageProps) {
  const { error } = await searchParams;
  const session = await getAuthSession();

  if (session) {
    const access = await getPortalAccessForUser(session.id, session.email);

    if (access.hasInstructorAccess) {
      redirect('/professor');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/15 text-red-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
              Pirillo Roriz
            </p>
            <h1 className="text-2xl font-bold text-white">Portal do professor</h1>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Entre com o email do cadastro de professor. Se você também é aluno com
          o mesmo email, um único login libera os dois portais.
        </p>

        {error === 'no-access' ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
            Sua sessão não tem acesso de professor. Saia da conta atual e entre
            com o email vinculado ao cadastro de professor.
          </div>
        ) : null}

        {session ? (
          <PortalLoginSessionAlert
            message="A conta logada agora não tem acesso de professor. Saia da sessão atual e entre com o email do professor."
            sessionEmail={session.email}
          />
        ) : null}

        <div className="mt-6">
          <PortalLoginForm
            redirectTo="/professor"
            portalLabel="portal do professor"
          />
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

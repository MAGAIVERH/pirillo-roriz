import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import { auth } from '@/lib/auth';
import { ensureAdminUser } from '@/lib/ensure-admin-user';
import { LoginForm } from '@/modules/auth/components/login-form';

export default async function LoginPage() {
  // Garante que o admin master existe no banco. Roda em todo carregamento da
  // tela de login — é barato (uma leitura por email único) e à prova de seed
  // perdido em ambientes novos.
  try {
    await ensureAdminUser();
  } catch (error) {
    console.error('ensureAdminUser falhou', error);
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect('/admin');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/15 text-red-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
              Pirillo Roriz
            </p>
            <h1 className="text-2xl font-bold text-white">
              Acesso administrativo
            </h1>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Entre com seu email e senha para acessar o painel da academia.
        </p>

        <div className="mt-6">
          <LoginForm />
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

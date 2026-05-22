import Link from 'next/link';
import { ArrowLeft, Construction, Users } from 'lucide-react';

export default function AlunoPortalPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/15 text-red-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">
              Área do aluno
            </p>
            <h1 className="text-2xl font-bold text-white">Em breve</h1>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
          <div className="flex items-start gap-3">
            <Construction className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium text-amber-100">
                Plataforma em construção
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-200/80">
                Aqui o aluno vai acompanhar mensalidades, progresso de
                graduação, histórico de presença e avisos da academia. Quando
                seu cadastro for feito, você receberá um email com login e
                senha provisória.
              </p>
            </div>
          </div>
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

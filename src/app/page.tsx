import Link from 'next/link';
import {
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react';

type PortalLink = {
  href: string;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
  variant: 'primary' | 'secondary' | 'tertiary';
};

const PORTALS: PortalLink[] = [
  {
    href: '/login',
    title: 'Área administrativa',
    description: 'Gestão completa da academia, financeiro e operação.',
    icon: ShieldCheck,
    variant: 'primary',
  },
  {
    href: '/professor/login',
    title: 'Portal do professor',
    description: 'Lançar presenças, acompanhar turmas e graduações.',
    icon: GraduationCap,
    variant: 'secondary',
  },
  {
    href: '/aluno',
    title: 'Área do aluno',
    description: 'Acompanhar treinos, mensalidades e progresso.',
    icon: Users,
    variant: 'tertiary',
  },
];

const VARIANT_CLASSES: Record<PortalLink['variant'], string> = {
  primary:
    'border-red-500/40 bg-red-600 text-white shadow-[0_0_40px_-15px_rgba(239,68,68,0.6)] hover:bg-red-500',
  secondary:
    'border-white/10 bg-zinc-900/80 text-white hover:border-red-500/40 hover:bg-zinc-800',
  tertiary:
    'border-white/10 bg-zinc-900/80 text-white hover:border-red-500/40 hover:bg-zinc-800',
};

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-zinc-950 p-8 text-white shadow-2xl sm:p-10">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-red-500">
            Pirillo Roriz
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Jiu Jitsu
          </h1>
          <p className="text-sm leading-6 text-zinc-400">
            Selecione abaixo o portal correspondente ao seu acesso.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {PORTALS.map((portal) => {
            const Icon = portal.icon;

            return (
              <Link
                key={portal.href}
                href={portal.href}
                className={`group flex items-center justify-between gap-4 rounded-xl border px-5 py-4 transition ${VARIANT_CLASSES[portal.variant]}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      portal.variant === 'primary'
                        ? 'bg-white/10 text-white'
                        : 'bg-red-600/15 text-red-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold">{portal.title}</p>
                    <p
                      className={`text-xs ${
                        portal.variant === 'primary'
                          ? 'text-red-100/80'
                          : 'text-zinc-400'
                      }`}
                    >
                      {portal.description}
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[11px] uppercase tracking-[0.3em] text-zinc-600">
          Academia · Niterói / RJ
        </p>
      </div>
    </main>
  );
}

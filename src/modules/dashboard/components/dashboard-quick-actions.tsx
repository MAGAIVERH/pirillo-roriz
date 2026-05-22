import Link from 'next/link';
import {
  Bell,
  CalendarPlus,
  type LucideIcon,
  Plus,
  ShoppingBag,
  Users,
} from 'lucide-react';

const QUICK_ACTIONS: {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    label: 'Novo aluno',
    description: 'Cadastre um aluno ou converta um lead.',
    href: '/admin/alunos/novo',
    icon: Users,
  },
  {
    label: 'Nova turma',
    description: 'Crie uma turma com horários e capacidade.',
    href: '/admin/turmas/nova',
    icon: CalendarPlus,
  },
  {
    label: 'Novo aviso',
    description: 'Publique um comunicado para alunos ou professores.',
    href: '/admin/avisos',
    icon: Bell,
  },
  {
    label: 'Novo produto',
    description: 'Adicione um item à loja interna.',
    href: '/admin/loja',
    icon: ShoppingBag,
  },
];

export function DashboardQuickActions() {
  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <header className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Atalhos rápidos</h2>
          <p className="text-xs text-zinc-400">
            Operações mais frequentes a um clique.
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-3 rounded-xl border border-white/10 bg-zinc-900/60 p-4 transition hover:border-red-500/40 hover:bg-zinc-900"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/15 text-red-500 transition group-hover:bg-red-500 group-hover:text-white">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{action.label}</p>
                <p className="text-xs leading-5 text-zinc-400">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  GraduationCap,
  Home,
  Megaphone,
  ShoppingBag,
  Users,
  Wallet,
} from 'lucide-react';

const navigation = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Alunos', href: '/admin/alunos', icon: Users },
  { label: 'Professores', href: '/admin/professores', icon: GraduationCap },
  { label: 'Turmas', href: '/admin/turmas', icon: CalendarDays },
  { label: 'Financeiro', href: '/admin/financeiro', icon: Wallet },
  { label: 'Loja', href: '/admin/loja', icon: ShoppingBag },
  { label: 'Avisos', href: '/admin/avisos', icon: Megaphone },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className='hidden border-r border-white/10 bg-zinc-950 lg:flex lg:flex-col'>
      <div className='border-b border-white/10 px-6 py-6'>
        <div className='space-y-1'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-red-500'>
            Academia
          </p>
          <h2 className='text-2xl font-bold text-white'>Gracie Barra</h2>
          <p className='text-sm text-zinc-400'>Painel administrativo</p>
        </div>
      </div>

      <nav className='flex-1 space-y-2 px-4 py-6'>
        {navigation.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-red-600/15 text-white'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Icon className='h-4 w-4' />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className='border-t border-white/10 px-4 py-4'>
        <div className='rounded-xl border border-white/10 bg-zinc-900 p-4'>
          <p className='text-sm font-medium text-white'>Base inicial pronta</p>
          <p className='mt-1 text-xs leading-5 text-zinc-400'>
            Agora vamos transformar essa estrutura em uma plataforma completa.
          </p>
        </div>
      </div>
    </aside>
  );
};

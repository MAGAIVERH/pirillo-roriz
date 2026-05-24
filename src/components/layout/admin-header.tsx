'use client';

import { Bell, Search } from 'lucide-react';

import { shellHeaderHeightClass } from '@/components/layout/shell-header';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const AdminHeader = () => {
  return (
    <header className='sticky top-0 z-20 border-b border-white/10 bg-zinc-950'>
      <div
        className={`flex ${shellHeaderHeightClass} max-w-full items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8`}
      >
        <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
          <SidebarTrigger className='h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-zinc-950 text-zinc-300 transition hover:bg-zinc-900 hover:text-white sm:h-11 sm:w-11' />

          <div className='min-w-0'>
            <p className='hidden truncate text-sm text-zinc-400 sm:block'>
              Pirillo Roriz
            </p>
            <h1 className='truncate text-base font-semibold text-white sm:text-xl'>
              Gestão da academia
            </h1>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-2 sm:gap-3'>
          <button
            type='button'
            aria-label='Buscar'
            className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 text-zinc-300 transition hover:bg-zinc-900 hover:text-white xl:hidden sm:h-11 sm:w-11'
          >
            <Search className='h-4 w-4' />
          </button>

          <div className='hidden h-11 items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 text-zinc-400 xl:flex xl:w-[320px]'>
            <Search className='h-4 w-4 shrink-0' />
            <span className='truncate text-sm'>
              Buscar alunos, turmas ou pedidos...
            </span>
          </div>

          <button
            type='button'
            aria-label='Notificações'
            className='hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 text-zinc-300 transition hover:bg-zinc-900 hover:text-white sm:flex sm:h-11 sm:w-11'
          >
            <Bell className='h-4 w-4' />
          </button>
        </div>
      </div>
    </header>
  );
};

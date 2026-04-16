'use client';

import { Bell, Search } from 'lucide-react';

import { SidebarTrigger } from '@/components/ui/sidebar';

export const AdminHeader = () => {
  return (
    <header className='border-b border-white/10 bg-black/70 backdrop-blur'>
      <div className='flex h-23 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-3'>
          <SidebarTrigger className='h-11 w-11 rounded-xl border border-white/10 bg-zinc-950 text-zinc-300 transition hover:bg-zinc-900 hover:text-white' />

          <div>
            <p className='text-sm text-zinc-400'>Área administrativa</p>
            <h1 className='text-xl font-semibold text-white'>
              Gestão da academia
            </h1>
          </div>
        </div>

        <div className='hidden items-center gap-3 sm:flex'>
          <div className='flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 text-zinc-400 lg:w-[320px]'>
            <Search className='h-4 w-4' />
            <span className='text-sm'>Buscar alunos, turmas ou pedidos...</span>
          </div>

          <button
            type='button'
            className='flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 text-zinc-300 transition hover:bg-zinc-900 hover:text-white'
          >
            <Bell className='h-4 w-4' />
          </button>

          <div className='flex h-11 items-center rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm text-zinc-300'>
            Admin Master
          </div>
        </div>
      </div>
    </header>
  );
};

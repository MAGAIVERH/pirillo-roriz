import { Bell, Search } from 'lucide-react';

export const AdminHeader = () => {
  return (
    <header className='border-b border-white/10 bg-black/70 backdrop-blur'>
      <div className='flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8'>
        <div>
          <p className='text-sm text-zinc-400'>Área administrativa</p>
          <h1 className='text-xl font-semibold text-white'>
            Gestão da academia
          </h1>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
          <div className='flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 text-zinc-400 sm:w-[320px]'>
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

'use client';

import { shellHeaderHeightClass } from '@/components/layout/shell-header';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const InstructorHeader = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950">
      <div
        className={`flex ${shellHeaderHeightClass} max-w-full items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8`}
      >
        <SidebarTrigger className="h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-zinc-950 text-zinc-300 transition hover:bg-zinc-900 hover:text-white sm:h-11 sm:w-11" />

        <div className="min-w-0">
          <p className="hidden truncate text-sm text-zinc-400 sm:block">
            Portal do professor
          </p>
          <h1 className="truncate text-base font-semibold text-white sm:text-xl">
            Gestão das turmas
          </h1>
        </div>
      </div>
    </header>
  );
};

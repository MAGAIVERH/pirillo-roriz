'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { GraduationRuleListItem } from '@/modules/graduation-rules/queries/get-graduation-rules-list';

type GraduationRulesTableProps = {
  rules: GraduationRuleListItem[];
};

export const GraduationRulesTable = ({ rules }: GraduationRulesTableProps) => {
  const [search, setSearch] = useState('');

  const filteredRules = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return rules;
    }

    return rules.filter((item) => {
      return (
        item.currentStep.toLowerCase().includes(normalizedSearch) ||
        item.nextStep.toLowerCase().includes(normalizedSearch) ||
        item.minimumAge.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [search, rules]);

  return (
    <div className='space-y-4'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold text-white'>
              Lista de regras
            </h2>
            <p className='text-sm text-zinc-400'>
              Regras reais usadas para elegibilidade e progressão.
            </p>
          </div>

          <div className='flex h-11 w-full items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-3 text-zinc-400 lg:max-w-sm'>
            <Search className='h-4 w-4' />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Buscar por faixa ou idade...'
              className='w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500'
            />
          </div>
        </div>
      </section>

      <section className='overflow-hidden rounded-2xl border border-white/10 bg-zinc-950'>
        <div className='overflow-x-auto'>
          <table className='min-w-full border-collapse'>
            <thead className='bg-zinc-900/70'>
              <tr className='border-b border-white/10 text-left'>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Programa
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Faixa atual
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Próxima faixa
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Tempo mínimo
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Idade mínima
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRules.length > 0 ? (
                filteredRules.map((item) => (
                  <tr
                    key={item.id}
                    className='border-b border-white/10 transition hover:bg-zinc-900/40'
                  >
                    <td className='px-5 py-4 text-sm text-zinc-300'>
                      <Link
                        href={`/admin/graduacao/regras/${item.id}`}
                        className='transition hover:text-red-400'
                      >
                        {item.program === 'KIDS' ? 'Kids' : 'Adulto'}
                      </Link>
                    </td>

                    <td className='px-5 py-4 text-sm text-zinc-300'>
                      <Link
                        href={`/admin/graduacao/regras/${item.id}`}
                        className='transition hover:text-red-400'
                      >
                        {item.currentStep}
                      </Link>
                    </td>

                    <td className='px-5 py-4 text-sm text-zinc-300'>
                      {item.nextStep}
                    </td>

                    <td className='px-5 py-4 text-sm text-zinc-300'>
                      {item.minimumMonths} meses
                    </td>

                    <td className='px-5 py-4 text-sm text-zinc-300'>
                      {item.minimumAge}
                    </td>

                    <td className='px-5 py-4'>
                      <Badge
                        className={`w-24 justify-center rounded-full border px-3 py-1 text-xs font-medium ${
                          item.active
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10'
                            : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-300 hover:bg-zinc-500/10'
                        }`}
                      >
                        {item.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className='px-5 py-10 text-center text-sm text-zinc-400'
                  >
                    Nenhuma regra encontrada para a busca informada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

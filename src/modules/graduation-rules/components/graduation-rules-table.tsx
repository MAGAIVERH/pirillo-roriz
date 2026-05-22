'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';

import type { GraduationRuleListItem } from '@/modules/graduation-rules/queries/get-graduation-rules-list';

type GraduationRulesTableProps = {
  rules: GraduationRuleListItem[];
};

type GraduationRuleMobileCardProps = {
  rule: GraduationRuleListItem;
};

const GraduationRuleStatusBadge = ({ active }: { active: boolean }) => (
  <span
    className={`inline-flex w-fit shrink-0 justify-center rounded-full border px-3 py-1 text-xs font-medium ${
      active
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
        : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-300'
    }`}
  >
    {active ? 'Ativa' : 'Inativa'}
  </span>
);

const getProgramLabel = (program: GraduationRuleListItem['program']) =>
  program === 'KIDS' ? 'Kids' : 'Adulto';

const GraduationRuleMobileCard = ({ rule }: GraduationRuleMobileCardProps) => {
  return (
    <Link
      href={`/admin/graduacao/regras/${rule.id}`}
      className='block rounded-xl border border-white/10 bg-zinc-950 p-4 transition hover:border-red-500/30 hover:bg-zinc-900/60'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <p className='truncate font-semibold text-white'>{rule.currentStep}</p>
          <p className='mt-0.5 truncate text-sm text-zinc-400'>
            Próxima: {rule.nextStep}
          </p>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <GraduationRuleStatusBadge active={rule.active} />
          <ChevronRight className='h-4 w-4 text-zinc-500' />
        </div>
      </div>

      <p className='mt-2 truncate text-xs text-zinc-400'>
        {getProgramLabel(rule.program)}
      </p>

      <dl className='mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-xs'>
        <div className='min-w-0'>
          <dt className='text-zinc-500'>Tempo mín.</dt>
          <dd className='mt-0.5 truncate font-medium text-zinc-300'>
            {rule.minimumMonths} meses
          </dd>
        </div>

        <div className='min-w-0 text-center'>
          <dt className='text-zinc-500'>Idade mín.</dt>
          <dd className='mt-0.5 truncate font-medium text-zinc-300'>
            {rule.minimumAge}
          </dd>
        </div>

        <div className='min-w-0 text-right'>
          <dt className='text-zinc-500'>Programa</dt>
          <dd className='mt-0.5 truncate font-medium text-zinc-300'>
            {getProgramLabel(rule.program)}
          </dd>
        </div>
      </dl>
    </Link>
  );
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
        item.minimumAge.toLowerCase().includes(normalizedSearch) ||
        getProgramLabel(item.program).toLowerCase().includes(normalizedSearch)
      );
    });
  }, [search, rules]);

  const emptyMessage = (
    <p className='py-10 text-center text-sm text-zinc-400'>
      Nenhuma regra encontrada para a busca informada.
    </p>
  );

  return (
    <div className='min-w-0 space-y-4'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'>
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
            <Search className='h-4 w-4 shrink-0' />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Buscar por faixa ou idade...'
              className='w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500'
            />
          </div>
        </div>
      </section>

      {/* Mobile: cards clicáveis → página de detalhes */}
      <section className='space-y-3 md:hidden'>
        {filteredRules.length > 0
          ? filteredRules.map((item) => (
              <GraduationRuleMobileCard key={item.id} rule={item} />
            ))
          : emptyMessage}
      </section>

      {/* Desktop: tabela completa */}
      <section className='hidden overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 md:block'>
        <table className='w-full border-collapse'>
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
                      {getProgramLabel(item.program)}
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
                    <GraduationRuleStatusBadge active={item.active} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

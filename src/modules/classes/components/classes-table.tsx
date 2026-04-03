'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Search } from 'lucide-react';

import type { ClassListItem } from '@/modules/classes/queries/get-classes-list';

type ClassesTableProps = {
  classes: ClassListItem[];
};

export const ClassesTable = ({ classes }: ClassesTableProps) => {
  const [search, setSearch] = useState('');
  const [openSchedulesClassId, setOpenSchedulesClassId] = useState<
    string | null
  >(null);

  const filteredClasses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return classes;
    }

    return classes.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.type.toLowerCase().includes(normalizedSearch) ||
        item.instructor.toLowerCase().includes(normalizedSearch) ||
        item.schedules.some((schedule) =>
          schedule.toLowerCase().includes(normalizedSearch),
        )
      );
    });
  }, [search, classes]);

  return (
    <div className='space-y-4'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold text-white'>
              Lista de turmas
            </h2>
            <p className='text-sm text-zinc-400'>
              Turmas reais cadastradas na academia.
            </p>
          </div>

          <div className='flex h-11 w-full items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-3 text-zinc-400 lg:max-w-sm'>
            <Search className='h-4 w-4' />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Buscar por turma, tipo, professor ou horário...'
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
                  Turma
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Tipo
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Professor
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Horários
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Alunos
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Capacidade
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredClasses.length > 0 ? (
                filteredClasses.map((item) => {
                  const hasManySchedules = item.schedulesCount > 1;
                  const isOpen = openSchedulesClassId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className='border-b border-white/10 transition hover:bg-zinc-900/40'
                    >
                      <td className='px-5 py-4 align-top'>
                        <Link
                          href={`/admin/turmas/${item.id}`}
                          className='font-medium text-white transition hover:text-red-400'
                        >
                          {item.name}
                        </Link>
                      </td>

                      <td className='px-5 py-4 text-sm text-zinc-300'>
                        {item.type}
                      </td>

                      <td className='px-5 py-4 text-sm text-zinc-300'>
                        {item.instructor}
                      </td>

                      <td className='relative px-5 py-4 text-sm text-zinc-300'>
                        {!hasManySchedules ? (
                          <p>{item.schedules[0]}</p>
                        ) : (
                          <div className='relative inline-block'>
                            <button
                              type='button'
                              onClick={() =>
                                setOpenSchedulesClassId((prev) =>
                                  prev === item.id ? null : item.id,
                                )
                              }
                              className='inline-flex items-center gap-1 text-sm text-red-400 transition hover:text-red-300'
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                              {isOpen ? 'Ocultar horários' : 'Ver horários'}
                            </button>

                            {isOpen ? (
                              <div className='absolute left-0 top-full z-20 mt-2 w-max max-w-65 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 shadow-2xl'>
                                <div className='space-y-2'>
                                  {item.schedules.map((schedule) => (
                                    <p
                                      key={schedule}
                                      className='whitespace-nowrap text-xs text-zinc-300'
                                    >
                                      {schedule}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </td>

                      <td className='px-5 py-4 text-sm text-zinc-300'>
                        {item.enrollmentsCount}
                      </td>

                      <td className='px-5 py-4 text-sm text-zinc-300'>
                        {item.capacity}
                      </td>

                      <td className='px-5 py-4'>
                        <span
                          className={`inline-flex w-24 justify-center rounded-full border px-3 py-1 text-xs font-medium ${
                            item.active
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                              : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-300'
                          }`}
                        >
                          {item.active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className='px-5 py-10 text-center text-sm text-zinc-400'
                  >
                    Nenhuma turma encontrada para a busca informada.
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

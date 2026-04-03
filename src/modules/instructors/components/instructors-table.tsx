'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { InstructorStatusBadge } from '@/modules/instructors/components/instructor-status-badge';
import type { InstructorListItem } from '@/modules/instructors/queries/get-instructors-list';

type InstructorsTableProps = {
  instructors: InstructorListItem[];
};

export const InstructorsTable = ({ instructors }: InstructorsTableProps) => {
  const [search, setSearch] = useState('');

  const filteredInstructors = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return instructors;
    }

    return instructors.filter((item) => {
      return (
        item.fullName.toLowerCase().includes(normalizedSearch) ||
        item.email.toLowerCase().includes(normalizedSearch) ||
        item.phone.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [search, instructors]);

  return (
    <div className='space-y-4'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold text-white'>
              Lista de professores
            </h2>
            <p className='text-sm text-zinc-400'>
              Professores reais cadastrados na academia.
            </p>
          </div>

          <div className='flex h-11 w-full items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-3 text-zinc-400 lg:max-w-sm'>
            <Search className='h-4 w-4' />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Buscar por nome, email ou telefone...'
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
                  Professor
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Telefone
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Qtd. de turmas
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Cadastro
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredInstructors.length > 0 ? (
                filteredInstructors.map((item) => (
                  <tr
                    key={item.id}
                    className='border-b border-white/10 transition hover:bg-zinc-900/40'
                  >
                    <td className='px-5 py-4 align-top'>
                      <div className='space-y-1'>
                        <Link
                          href={`/admin/professores/${item.id}`}
                          className='font-medium text-white transition hover:text-red-400'
                        >
                          {item.fullName}
                        </Link>
                        <p className='text-sm text-zinc-400'>{item.email}</p>
                      </div>
                    </td>

                    <td className='px-5 py-4 text-sm text-zinc-300'>
                      {item.phone}
                    </td>

                    <td className='px-5 py-4 text-sm text-zinc-300'>
                      {item.classesCount}
                    </td>

                    <td className='px-5 py-4 text-sm text-zinc-300'>
                      {item.createdAt}
                    </td>

                    <td className='px-5 py-4'>
                      <InstructorStatusBadge status={item.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className='px-5 py-10 text-center text-sm text-zinc-400'
                  >
                    Nenhum professor encontrado para a busca informada.
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

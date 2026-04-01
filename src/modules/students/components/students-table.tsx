'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { StudentStatusBadge } from '@/modules/students/components/student-status-badge';
import { studentsMock } from '@/modules/students/mock/students';

export const StudentsTable = () => {
  const [search, setSearch] = useState('');

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return studentsMock;
    }

    return studentsMock.filter((student) => {
      return (
        student.fullName.toLowerCase().includes(normalizedSearch) ||
        student.email.toLowerCase().includes(normalizedSearch) ||
        student.phone.toLowerCase().includes(normalizedSearch) ||
        student.className.toLowerCase().includes(normalizedSearch) ||
        student.belt.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [search]);

  return (
    <div className='space-y-4'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold text-white'>
              Lista de alunos
            </h2>
            <p className='text-sm text-zinc-400'>
              Estrutura inicial da listagem de alunos da academia.
            </p>
          </div>

          <div className='flex h-11 w-full items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-3 text-zinc-400 lg:max-w-sm'>
            <Search className='h-4 w-4' />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Buscar por nome, turma, faixa ou contato...'
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
                  Aluno
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Faixa
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Idade
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Turma
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Entrada
                </th>
                <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className='border-b border-white/10 transition hover:bg-zinc-900/40'
                  >
                    <td className='px-5 py-4 align-top'>
                      <div className='space-y-1'>
                        <p className='font-medium text-white'>
                          {student.fullName}
                        </p>
                        <p className='text-sm text-zinc-400'>{student.email}</p>
                        <p className='text-sm text-zinc-500'>{student.phone}</p>
                      </div>
                    </td>

                    <td className='px-5 py-4 text-sm text-zinc-300'>
                      {student.belt}
                    </td>

                    <td className='px-5 py-4 text-sm text-zinc-300'>
                      {student.age} anos
                    </td>

                    <td className='px-5 py-4 text-sm text-zinc-300'>
                      {student.className}
                    </td>

                    <td className='px-5 py-4 text-sm text-zinc-300'>
                      {new Date(student.joinDate).toLocaleDateString('pt-BR')}
                    </td>

                    <td className='px-5 py-4'>
                      <StudentStatusBadge status={student.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className='px-5 py-10 text-center text-sm text-zinc-400'
                  >
                    Nenhum aluno encontrado para a busca informada.
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

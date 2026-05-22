'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { formatNumber, formatPercent } from '../lib/analytics-helpers';
import type { InstructorPerformance } from '../types/analytics';

type SortKey = 'studentsCount' | 'monthlyClasses' | 'attendanceRate' | 'retentionRate';
type SortDirection = 'asc' | 'desc';

type InstructorsTableProps = {
  instructors: InstructorPerformance[];
};

type InstructorMobileCardProps = {
  instructor: InstructorPerformance;
  highlighted: boolean;
};

const columns: { id: SortKey; label: string; shortLabel: string }[] = [
  { id: 'studentsCount', label: 'Alunos', shortLabel: 'Alunos' },
  { id: 'monthlyClasses', label: 'Aulas/mês', shortLabel: 'Aulas' },
  { id: 'attendanceRate', label: 'Frequência', shortLabel: 'Freq.' },
  { id: 'retentionRate', label: 'Retenção', shortLabel: 'Ret.' },
];

function performanceTone(value: number): string {
  if (value >= 80) return 'text-emerald-400';
  if (value >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function formatMetricValue(
  instructor: InstructorPerformance,
  key: SortKey,
): string {
  if (key === 'studentsCount' || key === 'monthlyClasses') {
    return formatNumber(instructor[key]);
  }

  return formatPercent(instructor[key], 0);
}

const InstructorMobileCard = ({
  instructor,
  highlighted,
}: InstructorMobileCardProps) => {
  return (
    <article
      className={`rounded-xl border p-4 ${
        highlighted
          ? 'border-red-500/20 bg-red-500/5'
          : 'border-white/10 bg-zinc-950'
      }`}
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-white">
          {instructor.fullName}
        </p>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {instructor.beltLabel}
        </p>
      </div>

      <dl className="mt-3 grid grid-cols-4 gap-1 border-t border-white/5 pt-3 text-[11px]">
        {columns.map((column, index) => (
          <div
            key={column.id}
            className={`min-w-0 ${
              index === 0
                ? 'text-left'
                : index === columns.length - 1
                  ? 'text-right'
                  : 'text-center'
            }`}
          >
            <dt className="truncate text-zinc-500">{column.shortLabel}</dt>
            <dd
              className={`mt-0.5 font-semibold ${
                column.id === 'studentsCount' || column.id === 'monthlyClasses'
                  ? 'text-white'
                  : performanceTone(instructor[column.id])
              }`}
            >
              {formatMetricValue(instructor, column.id)}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
};

export function InstructorsTable({ instructors }: InstructorsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('studentsCount');
  const [direction, setDirection] = useState<SortDirection>('desc');

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setDirection('desc');
  }

  const sorted = [...instructors].sort((a, b) => {
    const factor = direction === 'asc' ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * factor;
  });

  const emptyMessage = (
    <p className="py-10 text-center text-sm text-zinc-500">
      Nenhum instrutor ativo cadastrado.
    </p>
  );

  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">
          Performance dos professores
        </h3>
        <p className="text-xs text-zinc-500">
          Ranking com base no mês selecionado.
        </p>
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {sorted.length > 0
          ? sorted.map((instructor, index) => (
              <InstructorMobileCard
                key={instructor.id}
                instructor={instructor}
                highlighted={index === 0}
              />
            ))
          : emptyMessage}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
        <table className="w-full border-collapse">
          <thead className="bg-zinc-900/70">
            <tr className="border-b border-white/10 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Professor
              </th>
              {columns.map((column) => {
                const isActive = sortKey === column.id;
                const Icon = !isActive
                  ? ArrowUpDown
                  : direction === 'asc'
                    ? ArrowUp
                    : ArrowDown;

                return (
                  <th key={column.id} className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort(column.id)}
                      className={`inline-flex items-center justify-end gap-1 text-xs font-semibold uppercase tracking-[0.14em] transition hover:text-white ${
                        isActive ? 'text-white' : 'text-zinc-400'
                      }`}
                    >
                      {column.label}
                      <Icon className="h-3 w-3 shrink-0" />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sorted.length > 0 ? (
              sorted.map((instructor, index) => (
                <tr
                  key={instructor.id}
                  className={`border-b border-white/10 text-sm ${
                    index === 0
                      ? 'bg-red-500/5 ring-1 ring-inset ring-red-500/15'
                      : ''
                  }`}
                >
                  <td className="px-5 py-4 align-top">
                    <p className="font-medium text-white">
                      {instructor.fullName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {instructor.beltLabel}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-white">
                    {formatNumber(instructor.studentsCount)}
                  </td>
                  <td className="px-5 py-4 text-right text-zinc-300">
                    {formatNumber(instructor.monthlyClasses)}
                  </td>
                  <td
                    className={`px-5 py-4 text-right font-semibold ${performanceTone(instructor.attendanceRate)}`}
                  >
                    {formatPercent(instructor.attendanceRate, 0)}
                  </td>
                  <td
                    className={`px-5 py-4 text-right font-semibold ${performanceTone(instructor.retentionRate)}`}
                  >
                    {formatPercent(instructor.retentionRate, 0)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

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

const columns: { id: SortKey; label: string }[] = [
  { id: 'studentsCount', label: 'Alunos' },
  { id: 'monthlyClasses', label: 'Aulas/mês' },
  { id: 'attendanceRate', label: 'Frequência' },
  { id: 'retentionRate', label: 'Retenção' },
];

function performanceTone(value: number): string {
  if (value >= 80) return 'text-emerald-400';
  if (value >= 60) return 'text-amber-400';
  return 'text-red-400';
}

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

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Performance dos professores
          </h3>
          <p className="text-xs text-zinc-500">
            Ranking com base no mês selecionado.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] border-b border-white/10 bg-zinc-900 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          <span>Professor</span>
          {columns.map((column) => {
            const isActive = sortKey === column.id;
            const Icon = !isActive
              ? ArrowUpDown
              : direction === 'asc'
                ? ArrowUp
                : ArrowDown;
            return (
              <button
                key={column.id}
                type="button"
                onClick={() => handleSort(column.id)}
                className={`flex items-center justify-end gap-1 text-right transition hover:text-white ${
                  isActive ? 'text-white' : 'text-zinc-400'
                }`}
              >
                {column.label}
                <Icon className="h-3 w-3" />
              </button>
            );
          })}
        </div>

        <div className="divide-y divide-white/10">
          {sorted.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-zinc-500">
              Nenhum instrutor ativo cadastrado.
            </p>
          ) : (
            sorted.map((instructor, index) => (
              <div
                key={instructor.id}
                className={`grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] items-center px-6 py-4 text-sm ${
                  index === 0
                    ? 'bg-red-500/5 ring-1 ring-inset ring-red-500/15'
                    : ''
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">
                    {instructor.fullName}
                  </p>
                  <p className="text-xs text-zinc-500">{instructor.beltLabel}</p>
                </div>
                <span className="text-right font-semibold text-white">
                  {formatNumber(instructor.studentsCount)}
                </span>
                <span className="text-right text-zinc-300">
                  {formatNumber(instructor.monthlyClasses)}
                </span>
                <span
                  className={`text-right font-semibold ${performanceTone(instructor.attendanceRate)}`}
                >
                  {formatPercent(instructor.attendanceRate, 0)}
                </span>
                <span
                  className={`text-right font-semibold ${performanceTone(instructor.retentionRate)}`}
                >
                  {formatPercent(instructor.retentionRate, 0)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

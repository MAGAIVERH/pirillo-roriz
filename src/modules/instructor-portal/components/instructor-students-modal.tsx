'use client';

import Link from 'next/link';
import { GraduationCap, TriangleAlert } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { InstructorAttentionStudent } from '@/modules/instructor-portal/queries/get-instructor-dashboard-overview';

type InstructorStudentsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: 'eligible' | 'delinquent';
  students: InstructorAttentionStudent[];
};

const variantMeta = {
  eligible: {
    title: 'Alunos aptos a graduar',
    description:
      'Alunos que atingiram os critérios de graduação nas suas turmas.',
    emptyMessage: 'Nenhum aluno apto a graduar no momento.',
    icon: GraduationCap,
    accent: 'text-emerald-400',
  },
  delinquent: {
    title: 'Alunos inadimplentes',
    description:
      'Alunos com mensalidade em atraso. Podem treinar, mas não recebem presença.',
    emptyMessage: 'Nenhum aluno inadimplente nas suas turmas.',
    icon: TriangleAlert,
    accent: 'text-amber-400',
  },
} as const;

export function InstructorStudentsModal({
  open,
  onOpenChange,
  variant,
  students,
}: InstructorStudentsModalProps) {
  const meta = variantMeta[variant];
  const Icon = meta.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden border border-white/10 bg-zinc-950 p-0 text-white sm:max-w-lg">
        <DialogHeader className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                {meta.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                {meta.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {students.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-zinc-900/40 p-6 text-center">
              <Icon className={`mx-auto h-6 w-6 ${meta.accent}`} />
              <p className="mt-2 text-sm text-zinc-400">{meta.emptyMessage}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10">
              <div className="grid grid-cols-[1fr_auto] border-b border-white/10 bg-zinc-900 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                <span>Aluno</span>
                <span>Turma</span>
              </div>
              <div className="divide-y divide-white/10">
                {students.map((student) => (
                  <Link
                    key={student.id}
                    href={`/professor/alunos/${student.id}?turma=${student.classId}`}
                    onClick={() => onOpenChange(false)}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition hover:bg-zinc-900/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {student.fullName}
                      </p>
                      <p className="truncate text-xs text-zinc-400">
                        {student.belt}
                      </p>
                    </div>
                    <p className="truncate text-xs text-zinc-500">
                      {student.className}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

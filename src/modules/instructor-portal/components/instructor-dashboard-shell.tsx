'use client';

import { useState, type ReactNode } from 'react';
import {
  CalendarDays,
  GraduationCap,
  TriangleAlert,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { InstructorStudentsModal } from '@/modules/instructor-portal/components/instructor-students-modal';
import { InstructorSummaryCard } from '@/modules/instructor-portal/components/instructor-summary-card';
import type { InstructorAttentionStudent } from '@/modules/instructor-portal/queries/get-instructor-dashboard-overview';

type DashboardSummaryIconKey = 'classes' | 'students' | 'eligible' | 'delinquent';

const dashboardSummaryIconMap: Record<DashboardSummaryIconKey, LucideIcon> = {
  classes: CalendarDays,
  students: Users,
  eligible: GraduationCap,
  delinquent: TriangleAlert,
};

type DashboardSummaryCardConfig = {
  title: string;
  value: number;
  description: string;
  iconKey: DashboardSummaryIconKey;
  highlight: 'default' | 'success' | 'warning' | 'danger';
  action: 'link' | 'modal';
  href?: string;
  modal?: 'eligible' | 'delinquent';
};

type InstructorDashboardShellProps = {
  summaryCards: DashboardSummaryCardConfig[];
  eligibleStudents: InstructorAttentionStudent[];
  delinquentStudents: InstructorAttentionStudent[];
  children: ReactNode;
};

export function InstructorDashboardShell({
  summaryCards,
  eligibleStudents,
  delinquentStudents,
  children,
}: InstructorDashboardShellProps) {
  const [eligibleModalOpen, setEligibleModalOpen] = useState(false);
  const [delinquentModalOpen, setDelinquentModalOpen] = useState(false);

  return (
    <>
      <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const icon = dashboardSummaryIconMap[card.iconKey];

          if (card.action === 'link' && card.href) {
            return (
              <InstructorSummaryCard
                key={card.title}
                title={card.title}
                value={card.value}
                description={card.description}
                icon={icon}
                highlight={card.highlight}
                href={card.href}
              />
            );
          }

          const openModal = () => {
            if (card.modal === 'eligible') {
              setEligibleModalOpen(true);
              return;
            }

            setDelinquentModalOpen(true);
          };

          return (
            <InstructorSummaryCard
              key={card.title}
              title={card.title}
              value={card.value}
              description={card.description}
              icon={icon}
              highlight={card.highlight}
              onClick={openModal}
            />
          );
        })}
      </section>

      {children}

      <InstructorStudentsModal
        open={eligibleModalOpen}
        onOpenChange={setEligibleModalOpen}
        variant="eligible"
        students={eligibleStudents}
      />

      <InstructorStudentsModal
        open={delinquentModalOpen}
        onOpenChange={setDelinquentModalOpen}
        variant="delinquent"
        students={delinquentStudents}
      />
    </>
  );
}

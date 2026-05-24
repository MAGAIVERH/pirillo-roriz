import type { WarningType } from '@/modules/warnings/types/warnings';

export type InstructorWarningAudience = 'all_my_students' | 'class';

export type InstructorWarningListItem = {
  id: string;
  title: string;
  content: string;
  type: WarningType;
  source: 'academy' | 'mine';
  audienceLabel: string;
  publishedAt: Date;
  expiresAt: Date | null;
  createdByName: string;
  canDelete: boolean;
};

export type InstructorClassOption = {
  id: string;
  name: string;
};

export type InstructorWarningsPageData = {
  academyWarnings: InstructorWarningListItem[];
  myWarnings: InstructorWarningListItem[];
  classes: InstructorClassOption[];
  stats: {
    academyCount: number;
    myCount: number;
  };
};

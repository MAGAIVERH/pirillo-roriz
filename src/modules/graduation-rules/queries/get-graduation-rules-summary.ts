import { GraduationProgram } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type GraduationRulesSummary = {
  totalRules: number;
  activeRules: number;
  kidsRules: number;
  adultRules: number;
};

export const getGraduationRulesSummary =
  async (): Promise<GraduationRulesSummary> => {
    const academy = await getOrCreateDefaultAcademy();

    const [totalRules, activeRules, kidsRules, adultRules] = await Promise.all([
      db.graduationRule.count({
        where: {
          academyId: academy.id,
        },
      }),
      db.graduationRule.count({
        where: {
          academyId: academy.id,
          active: true,
        },
      }),
      db.graduationRule.count({
        where: {
          academyId: academy.id,
          program: GraduationProgram.KIDS,
        },
      }),
      db.graduationRule.count({
        where: {
          academyId: academy.id,
          program: GraduationProgram.ADULT,
        },
      }),
    ]);

    return {
      totalRules,
      activeRules,
      kidsRules,
      adultRules,
    };
  };

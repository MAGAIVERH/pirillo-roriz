import { ClassLevel } from '@/generated/prisma/client';
import { db } from '@/lib/db';

const DEFAULT_ACADEMY_SLUG = 'gracie-barra';

const defaultLeadSources = [
  'Instagram',
  'Indicação',
  'WhatsApp',
  'Passagem em frente',
];

const defaultBelts = [
  { name: 'Branca', color: 'white', sortOrder: 1 },
  { name: 'Azul', color: 'blue', sortOrder: 2 },
  { name: 'Roxa', color: 'purple', sortOrder: 3 },
  { name: 'Marrom', color: 'brown', sortOrder: 4 },
  { name: 'Preta', color: 'black', sortOrder: 5 },
];

const defaultClassTypes = [
  {
    name: 'Jiu-Jitsu Adulto',
    description: 'Turmas adultas regulares da academia.',
    minAge: 13,
    level: ClassLevel.ALL_LEVELS,
  },
  {
    name: 'Jiu-Jitsu Kids',
    description: 'Turmas infantis da academia.',
    minAge: 4,
    maxAge: 12,
    level: ClassLevel.ALL_LEVELS,
  },
  {
    name: 'Jiu-Jitsu No-Gi',
    description: 'Turmas sem kimono.',
    minAge: 13,
    level: ClassLevel.ALL_LEVELS,
  },
  {
    name: 'Jiu-Jitsu Competição',
    description: 'Turmas com foco competitivo.',
    minAge: 13,
    level: ClassLevel.COMPETITION,
  },
];

const defaultClasses = [
  {
    typeName: 'Jiu-Jitsu Adulto',
    name: 'Jiu-Jitsu Adulto Iniciante',
    description: 'Turma introdutória para novos alunos.',
  },
  {
    typeName: 'Jiu-Jitsu Kids',
    name: 'Jiu-Jitsu Kids',
    description: 'Turma infantil da academia.',
  },
  {
    typeName: 'Jiu-Jitsu No-Gi',
    name: 'Jiu-Jitsu No-Gi',
    description: 'Treinos sem kimono.',
  },
  {
    typeName: 'Jiu-Jitsu Competição',
    name: 'Jiu-Jitsu Competição',
    description: 'Treinos voltados para competição.',
  },
];

const ensureDefaultAcademyData = async (academyId: string) => {
  await db.leadSource.createMany({
    data: defaultLeadSources.map((name) => ({
      academyId,
      name,
    })),
    skipDuplicates: true,
  });

  await db.belt.createMany({
    data: defaultBelts.map((belt) => ({
      academyId,
      name: belt.name,
      color: belt.color,
      sortOrder: belt.sortOrder,
    })),
    skipDuplicates: true,
  });

  await db.classType.createMany({
    data: defaultClassTypes.map((classType) => ({
      academyId,
      name: classType.name,
      description: classType.description,
      minAge: classType.minAge,
      maxAge: classType.maxAge,
      level: classType.level,
    })),
    skipDuplicates: true,
  });

  const classTypes = await db.classType.findMany({
    where: { academyId },
    select: {
      id: true,
      name: true,
    },
  });

  const classTypeIdByName = new Map(
    classTypes.map((item) => [item.name, item.id]),
  );

  const existingClasses = await db.class.findMany({
    where: { academyId },
    select: {
      name: true,
    },
  });

  const existingClassNames = new Set(existingClasses.map((item) => item.name));

  const missingClasses = defaultClasses
    .filter((item) => !existingClassNames.has(item.name))
    .map((item) => ({
      academyId,
      classTypeId: classTypeIdByName.get(item.typeName)!,
      name: item.name,
      description: item.description,
      active: true,
    }));

  if (missingClasses.length > 0) {
    await db.class.createMany({
      data: missingClasses,
    });
  }
};

export const getOrCreateDefaultAcademy = async () => {
  let academy = await db.academy.findUnique({
    where: {
      slug: DEFAULT_ACADEMY_SLUG,
    },
  });

  if (!academy) {
    academy = await db.academy.create({
      data: {
        name: 'Gracie Barra',
        tradeName: 'Gracie Barra',
        slug: DEFAULT_ACADEMY_SLUG,
        settings: {
          create: {},
        },
      },
    });
  }

  await ensureDefaultAcademyData(academy.id);

  return academy;
};

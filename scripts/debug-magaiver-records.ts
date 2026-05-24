import 'dotenv/config';

import { db } from '../src/lib/db';

async function main() {
  const rows = await db.user.findMany({
    where: {
      email: {
        contains: 'magaiver',
        mode: 'insensitive',
      },
    },
    select: { id: true, email: true, name: true },
  });

  const instructors = await db.instructor.findMany({
    where: {
      OR: [
        { email: { contains: 'magaiver', mode: 'insensitive' } },
        { fullName: { contains: 'magaiver', mode: 'insensitive' } },
      ],
    },
    select: { id: true, email: true, fullName: true, userId: true, active: true },
  });

  const students = await db.student.findMany({
    where: {
      email: { contains: 'magaiver', mode: 'insensitive' },
    },
    select: { id: true, email: true, fullName: true, userId: true, status: true },
  });

  console.log(JSON.stringify({ users: rows, instructors, students }, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
  });

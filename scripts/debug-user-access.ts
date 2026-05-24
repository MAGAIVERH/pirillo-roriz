import 'dotenv/config';

import { db } from '../src/lib/db';

async function main() {
  const email = 'magaivermagalhaes.mm@gmail.com';

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      accounts: {
        select: { id: true, providerId: true },
      },
    },
  });

  const roles = user
    ? await db.userRoleAssignment.findMany({
        where: { userId: user.id },
        select: { role: true, academyId: true },
      })
    : [];

  const [instructors, students] = await Promise.all([
    db.instructor.findMany({
      where: {
        OR: [{ email }, ...(user ? [{ userId: user.id }] : [])],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        userId: true,
        active: true,
      },
    }),
    db.student.findMany({
      where: {
        OR: [{ email }, ...(user ? [{ userId: user.id }] : [])],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        userId: true,
        status: true,
      },
    }),
  ]);

  console.log(
    JSON.stringify({ user, roles, instructors, students }, null, 2),
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
  });

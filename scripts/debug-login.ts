import 'dotenv/config';

import { auth } from '../src/lib/auth';
import { db } from '../src/lib/db';

async function main() {
  const email = 'magaivermagalhaes.mm@gmail.com';
  const passwordFromEmail = 'uF3vc4SP2$';

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      accounts: {
        select: {
          id: true,
          providerId: true,
          accountId: true,
          password: true,
        },
      },
    },
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('User:', JSON.stringify({ id: user.id, email: user.email, name: user.name }, null, 2));
  console.log('Accounts:', JSON.stringify(user.accounts.map(a => ({ ...a, password: a.password ? `${a.password.slice(0, 20)}...` : null })), null, 2));

  const ctx = await auth.$context;
  for (const account of user.accounts) {
    if (account.password) {
      const valid = await ctx.password.verify({
        password: passwordFromEmail,
        hash: account.password,
      });
      console.log(`Password verify for ${account.providerId}:`, valid);
    }
  }

  const instructor = await db.instructor.findFirst({
    where: { userId: user.id },
    select: { id: true, email: true, active: true, fullName: true },
  });

  const roles = await db.userRoleAssignment.findMany({
    where: { userId: user.id },
    select: { role: true },
  });

  console.log('Instructor:', instructor);
  console.log('Roles:', roles);

  // Try sign in via API simulation
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password: passwordFromEmail,
      },
    });
    console.log('signInEmail result:', result ? 'SUCCESS' : 'FAILED', result);
  } catch (error) {
    console.log('signInEmail error:', error);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
  });

import 'dotenv/config';

import { auth } from '../src/lib/auth';
import { db } from '../src/lib/db';

async function main() {
  const email = process.argv[2]?.trim().toLowerCase() ?? 'magaivermagalhaes.mm@gmail.com';
  const password = process.argv[3] ?? 'ns!Fp%7&Yb';

  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
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

  console.log('User:', user.id, user.email);
  console.log(
    'Accounts:',
    user.accounts.map((account) => ({
      providerId: account.providerId,
      accountId: account.accountId,
      hasPassword: Boolean(account.password),
    })),
  );

  const ctx = await auth.$context;
  const credential = user.accounts.find(
    (account) => account.providerId === 'credential',
  );

  if (!credential?.password) {
    console.log('No credential password found');
    return;
  }

  const verify = await ctx.password.verify({
    password,
    hash: credential.password,
  });

  console.log('Password verify:', verify);

  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    console.log('signInEmail: SUCCESS');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('signInEmail: FAILED');
    console.error(error);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
  });

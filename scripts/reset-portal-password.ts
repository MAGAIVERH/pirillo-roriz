import 'dotenv/config';

import { auth } from '../src/lib/auth';
import { db } from '../src/lib/db';
import { generateTemporaryPassword } from '../src/lib/generate-temporary-password';
import { sendMail } from '../src/lib/mail';

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error('Uso: npx tsx scripts/reset-portal-password.ts email@exemplo.com');
    process.exit(1);
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, name: true },
  });

  if (!user) {
    console.error(`Nenhuma conta encontrada para ${email}`);
    process.exit(1);
  }

  const account = await db.account.findFirst({
    where: {
      userId: user.id,
      providerId: 'credential',
    },
    select: { id: true },
  });

  if (!account) {
    console.error(`Conta sem login por senha para ${email}`);
    process.exit(1);
  }

  const ctx = await auth.$context;
  const password = generateTemporaryPassword();
  const hashedPassword = await ctx.password.hash(password);

  await db.account.update({
    where: { id: account.id },
    data: {
      password: hashedPassword,
      updatedAt: new Date(),
    },
  });

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    'http://localhost:3000';

  const mailResult = await sendMail({
    to: email,
    subject: 'Nova senha provisória — Pirillo Roriz',
    html: `
      <p>Olá, ${user.name}.</p>
      <p>Sua senha provisória foi redefinida:</p>
      <p><strong>${password}</strong></p>
      <p>Use o mesmo email (<strong>${email}</strong>) para entrar no portal do aluno e do professor.</p>
      <p><a href="${appUrl}/aluno/login">Portal do aluno</a> · <a href="${appUrl}/professor/login">Portal do professor</a></p>
    `,
    text: [
      `Olá, ${user.name}.`,
      `Sua senha provisória foi redefinida: ${password}`,
      `Email: ${email}`,
      `Portal do aluno: ${appUrl}/aluno/login`,
      `Portal do professor: ${appUrl}/professor/login`,
    ].join('\n'),
  });

  console.log(`Senha provisória redefinida para ${email}: ${password}`);
  console.log(
    mailResult.sent
      ? 'Email enviado com sucesso.'
      : `Email não enviado: ${mailResult.reason ?? 'motivo desconhecido'}`,
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
  });

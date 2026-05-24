import type { WelcomeEmailRole } from './welcome-email';

type BuildRoleAddedEmailInput = {
  fullName: string;
  email: string;
  role: WelcomeEmailRole;
  loginUrl: string;
};

type RoleAddedEmail = {
  subject: string;
  html: string;
  text: string;
};

const ROLE_LABELS: Record<WelcomeEmailRole, string> = {
  INSTRUCTOR: 'Professor',
  STUDENT: 'Aluno',
};

const ROLE_DESCRIPTION: Record<WelcomeEmailRole, string> = {
  INSTRUCTOR:
    'Você poderá lançar presenças, acompanhar turmas, registrar graduações e usar o leitor de QR Code dos alunos.',
  STUDENT:
    'Você poderá acompanhar suas mensalidades, ver seu histórico de treino, progresso de faixa e os avisos da academia.',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildRoleAddedEmail(
  input: BuildRoleAddedEmailInput,
): RoleAddedEmail {
  const roleLabel = ROLE_LABELS[input.role];
  const description = ROLE_DESCRIPTION[input.role];
  const subject = `Pirillo Roriz · Seu acesso de ${roleLabel.toLowerCase()} foi liberado`;

  const safeName = escapeHtml(input.fullName);
  const safeEmail = escapeHtml(input.email);
  const safeLogin = escapeHtml(input.loginUrl);

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#09090b;font-family:'Inter',Arial,Helvetica,sans-serif;color:#fafafa;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#18181b;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 16px 32px;">
                <p style="margin:0;color:#ef4444;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;">
                  Pirillo Roriz · Jiu-Jitsu
                </p>
                <h1 style="margin:8px 0 0 0;font-size:24px;color:#ffffff;font-weight:700;">
                  Olá, ${safeName}!
                </h1>
                <p style="margin:12px 0 0 0;font-size:14px;line-height:22px;color:#a1a1aa;">
                  Seu acesso de <strong style="color:#fff;">${escapeHtml(roleLabel)}</strong> na academia foi liberado.
                  ${escapeHtml(description)}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px;">
                <div style="border:1px solid rgba(255,255,255,0.08);background:#0a0a0a;border-radius:12px;padding:20px;">
                  <p style="margin:0;color:#a1a1aa;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;">
                    Use o mesmo login de sempre
                  </p>
                  <p style="margin:12px 0 0 0;font-size:14px;line-height:22px;color:#d4d4d8;">
                    Você já possui uma conta na plataforma. Entre com o mesmo email
                    (<strong style="color:#fff;">${safeEmail}</strong>) e a mesma senha que já utiliza.
                    Não é necessário criar uma nova conta.
                  </p>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px;">
                <a href="${safeLogin}"
                   style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">
                  Acessar a plataforma de ${escapeHtml(roleLabel.toLowerCase())}
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 24px 32px;">
                <p style="margin:0;font-size:12px;line-height:20px;color:#71717a;">
                  Se você esqueceu sua senha, solicite a redefinição dentro da plataforma
                  ou fale com a administração da academia.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px;background:#0a0a0a;border-top:1px solid rgba(255,255,255,0.06);">
                <p style="margin:0;font-size:11px;color:#52525b;text-align:center;letter-spacing:0.16em;text-transform:uppercase;">
                  Pirillo Roriz Jiu-Jitsu
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Pirillo Roriz - Acesso de ${roleLabel} liberado`,
    '',
    `Olá ${input.fullName},`,
    '',
    `Seu acesso de ${roleLabel.toLowerCase()} na academia foi liberado.`,
    description,
    '',
    'Use o mesmo login e senha que você já possui na plataforma.',
    `Login (email): ${input.email}`,
    '',
    `Acesse: ${input.loginUrl}`,
  ].join('\n');

  return { subject, html, text };
}

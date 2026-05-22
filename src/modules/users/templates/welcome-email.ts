export type WelcomeEmailRole = 'INSTRUCTOR' | 'STUDENT';

type BuildWelcomeEmailInput = {
  fullName: string;
  email: string;
  password: string;
  role: WelcomeEmailRole;
  loginUrl: string;
};

type WelcomeEmail = {
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

export function buildWelcomeEmail(input: BuildWelcomeEmailInput): WelcomeEmail {
  const roleLabel = ROLE_LABELS[input.role];
  const description = ROLE_DESCRIPTION[input.role];
  const subject = `Pirillo Roriz · Seu acesso de ${roleLabel.toLowerCase()} foi criado`;

  const safeName = escapeHtml(input.fullName);
  const safeEmail = escapeHtml(input.email);
  const safePassword = escapeHtml(input.password);
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
                  Bem-vindo, ${safeName}!
                </h1>
                <p style="margin:12px 0 0 0;font-size:14px;line-height:22px;color:#a1a1aa;">
                  Seu acesso de <strong style="color:#fff;">${escapeHtml(roleLabel)}</strong> na academia foi criado.
                  ${escapeHtml(description)}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px;">
                <div style="border:1px solid rgba(239,68,68,0.25);background:rgba(239,68,68,0.06);border-radius:12px;padding:20px;">
                  <p style="margin:0;color:#fca5a5;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;">
                    Dados de acesso provisórios
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px;width:100%;">
                    <tr>
                      <td style="padding:6px 0;color:#a1a1aa;font-size:13px;width:120px;">Login (email):</td>
                      <td style="padding:6px 0;color:#ffffff;font-size:14px;font-weight:600;">${safeEmail}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#a1a1aa;font-size:13px;">Senha provisória:</td>
                      <td style="padding:6px 0;color:#ffffff;font-size:14px;font-weight:600;font-family:'Courier New',monospace;">${safePassword}</td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px;">
                <a href="${safeLogin}"
                   style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">
                  Acessar a plataforma
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 24px 32px;">
                <p style="margin:0;font-size:12px;line-height:20px;color:#71717a;">
                  Por segurança, recomendamos trocar a senha no primeiro acesso. Se você
                  não esperava este email, por favor ignore — nenhuma conta é criada sem
                  cadastro pela administração da academia.
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
    `Pirillo Roriz - Acesso de ${roleLabel}`,
    '',
    `Olá ${input.fullName},`,
    '',
    'Seu acesso à plataforma foi criado.',
    '',
    `Login (email): ${input.email}`,
    `Senha provisória: ${input.password}`,
    '',
    `Acesse: ${input.loginUrl}`,
    '',
    'Recomendamos trocar a senha no primeiro acesso.',
  ].join('\n');

  return { subject, html, text };
}

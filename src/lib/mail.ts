type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendMailResult = {
  sent: boolean;
  reason?: string;
};

function parseResendError(body: string): string {
  try {
    const parsed = JSON.parse(body) as { message?: string };
    return parsed.message?.trim() || body;
  } catch {
    return body.trim();
  }
}

/**
 * Wrapper minimalista de envio de email.
 *
 * Em produção: usa Resend (https://resend.com) se `RESEND_API_KEY` estiver
 * configurada. Não adiciona SDK — chama a HTTP API diretamente.
 *
 * Em dev/local: se a key não estiver presente, apenas registra o email no
 * console (assunto + destinatário + senha provisória). Isso permite testar
 * o fluxo de provisionamento sem provider configurado.
 */
export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM ?? 'Pirillo Roriz <onboarding@resend.dev>';

  if (!apiKey) {
    console.info('[mail] RESEND_API_KEY ausente — email não enviado.');
    console.info(`[mail] To: ${input.to}`);
    console.info(`[mail] Subject: ${input.subject}`);
    console.info(`[mail] Plain text fallback:\n${input.text ?? '(html only)'}`);
    return { sent: false, reason: 'RESEND_API_KEY não configurada na Vercel.' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      const resendMessage = parseResendError(body);
      console.error('[mail] envio falhou', response.status, resendMessage);
      return {
        sent: false,
        reason: `Resend (${response.status}): ${resendMessage}`,
      };
    }

    return { sent: true };
  } catch (error) {
    console.error('[mail] erro inesperado', error);
    return { sent: false, reason: 'Falha de rede ao chamar a Resend.' };
  }
}

export function formatMailFailureSuffix(reason?: string): string {
  if (!reason) {
    return ' Acesso criado, mas o email de boas-vindas não pôde ser enviado.';
  }

  return ` Acesso criado, mas o email não foi enviado: ${reason}`;
}

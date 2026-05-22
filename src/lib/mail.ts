type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type SendMailResult = {
  sent: boolean;
  reason?: string;
};

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
    return { sent: false, reason: 'RESEND_API_KEY ausente.' };
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
      console.error('[mail] envio falhou', response.status, body);
      return { sent: false, reason: `HTTP ${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error('[mail] erro inesperado', error);
    return { sent: false, reason: 'Exceção ao chamar provider.' };
  }
}

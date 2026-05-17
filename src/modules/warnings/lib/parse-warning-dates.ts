import type { WarningInput } from '../schemas/warning-schema';

export function parseWarningDates(input: WarningInput) {
  const now = new Date();

  let publishedAt: Date | null = null;

  if (input.publishNow) {
    publishedAt = now;
  } else if (input.publishedAt?.trim()) {
    const parsed = new Date(input.publishedAt);
    if (!Number.isNaN(parsed.getTime())) {
      publishedAt = parsed;
    }
  }

  let expiresAt: Date | null = null;

  if (input.expiresAt?.trim()) {
    const parsed = new Date(input.expiresAt);
    if (!Number.isNaN(parsed.getTime())) {
      expiresAt = parsed;
    }
  }

  return { publishedAt, expiresAt };
}

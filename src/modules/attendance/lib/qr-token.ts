import { createHash, createHmac } from 'crypto';

const QR_TOKEN_PREFIX = 'pirillo:1:';

function getQrSecret(): string {
  return process.env.QR_TOKEN_SECRET ?? 'pirillo-roriz-dev-qr-secret';
}

export function hashQrToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

export function buildStudentQrRawToken(
  studentId: string,
  academyId: string,
): string {
  return createHmac('sha256', getQrSecret())
    .update(`${academyId}:${studentId}`)
    .digest('hex');
}

export function buildStudentQrPayload(
  studentId: string,
  academyId: string,
): string {
  const rawToken = buildStudentQrRawToken(studentId, academyId);
  return `${QR_TOKEN_PREFIX}${rawToken}`;
}

export function parseQrPayload(scannedValue: string): string | null {
  const trimmed = scannedValue.trim();

  if (trimmed.startsWith(QR_TOKEN_PREFIX)) {
    const rawToken = trimmed.slice(QR_TOKEN_PREFIX.length).trim();
    return rawToken.length >= 32 ? rawToken : null;
  }

  return trimmed.length >= 32 ? trimmed : null;
}

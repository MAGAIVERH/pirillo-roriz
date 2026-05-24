import { db } from '@/lib/db';

import { buildStudentQrRawToken, hashQrToken } from './qr-token';

export async function ensureStudentQrToken(
  studentId: string,
  academyId: string,
): Promise<{ id: string; rawToken: string }> {
  const rawToken = buildStudentQrRawToken(studentId, academyId);
  const codeHash = hashQrToken(rawToken);

  const existingToken = await db.studentQrToken.findFirst({
    where: {
      studentId,
      isActive: true,
    },
    select: {
      id: true,
      codeHash: true,
    },
  });

  if (existingToken?.codeHash === codeHash) {
    return {
      id: existingToken.id,
      rawToken,
    };
  }

  if (existingToken) {
    await db.studentQrToken.update({
      where: {
        id: existingToken.id,
      },
      data: {
        isActive: false,
      },
    });
  }

  const createdToken = await db.studentQrToken.create({
    data: {
      studentId,
      codeHash,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  return {
    id: createdToken.id,
    rawToken,
  };
}

export async function findStudentByQrRawToken(rawToken: string): Promise<{
  tokenId: string;
  studentId: string;
  academyId: string;
} | null> {
  const codeHash = hashQrToken(rawToken);

  const token = await db.studentQrToken.findFirst({
    where: {
      codeHash,
      isActive: true,
    },
    select: {
      id: true,
      student: {
        select: {
          id: true,
          academyId: true,
          status: true,
        },
      },
    },
  });

  if (!token) {
    return null;
  }

  return {
    tokenId: token.id,
    studentId: token.student.id,
    academyId: token.student.academyId,
  };
}

'use server';

import {
  AttendanceSource,
  AttendanceStatus,
  CheckInMethod,
  CheckInStatus,
  ClassSessionStatus,
  StudentStatus,
} from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { requireInstructorContext } from '@/lib/session-context';
import { isWithinCheckInWindow } from '@/modules/attendance/lib/check-in-window';
import { findStudentByQrRawToken } from '@/modules/attendance/lib/ensure-student-qr-token';
import { parseQrPayload } from '@/modules/attendance/lib/qr-token';
import { recordSessionAttendance } from '@/modules/attendance/lib/record-session-attendance';
import { revalidateAttendancePaths } from '@/modules/attendance/lib/revalidate-attendance-paths';
import {
  processQrCheckInSchema,
  type ProcessQrCheckInInput,
} from '@/modules/attendance/schemas/process-qr-check-in-schema';
import { validateStudentCanReceiveAttendance } from '@/modules/students/lib/validate-student-attendance';

type ActionResult = {
  success: boolean;
  message: string;
  studentName?: string;
};

async function writeCheckInLog(input: {
  academyId: string;
  studentId: string;
  classSessionId: string | null;
  tokenId: string | null;
  scannedByUserId: string;
  status: CheckInStatus;
  failureReason?: string;
}): Promise<void> {
  await db.checkInLog.create({
    data: {
      academyId: input.academyId,
      studentId: input.studentId,
      classSessionId: input.classSessionId,
      tokenId: input.tokenId,
      method: CheckInMethod.QR_CODE,
      scannedByUserId: input.scannedByUserId,
      status: input.status,
      failureReason: input.failureReason ?? null,
    },
  });
}

export async function processQrCheckInAction(
  input: ProcessQrCheckInInput,
): Promise<ActionResult> {
  const parsed = processQrCheckInSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const { user, instructor } = await requireInstructorContext();
    const academy = await getOrCreateDefaultAcademy();

    const rawToken = parseQrPayload(parsed.data.qrPayload);

    if (!rawToken) {
      return {
        success: false,
        message: 'QR Code inválido ou não reconhecido.',
      };
    }

    const tokenMatch = await findStudentByQrRawToken(rawToken);

    if (!tokenMatch || tokenMatch.academyId !== academy.id) {
      return {
        success: false,
        message: 'QR Code não encontrado nesta academia.',
      };
    }

    const session = await db.classSession.findFirst({
      where: {
        id: parsed.data.sessionId,
        instructorId: instructor.id,
        class: {
          academyId: academy.id,
        },
      },
      select: {
        id: true,
        status: true,
        classId: true,
        startsAt: true,
        endsAt: true,
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!session) {
      await writeCheckInLog({
        academyId: academy.id,
        studentId: tokenMatch.studentId,
        classSessionId: null,
        tokenId: tokenMatch.tokenId,
        scannedByUserId: user.id,
        status: CheckInStatus.FAILED,
        failureReason: 'Sessão não encontrada ou sem permissão.',
      });

      return {
        success: false,
        message: 'Aula selecionada não encontrada ou sem permissão.',
      };
    }

    if (session.status === ClassSessionStatus.CLOSED) {
      await writeCheckInLog({
        academyId: academy.id,
        studentId: tokenMatch.studentId,
        classSessionId: session.id,
        tokenId: tokenMatch.tokenId,
        scannedByUserId: user.id,
        status: CheckInStatus.FAILED,
        failureReason: 'Sessão encerrada.',
      });

      return {
        success: false,
        message: 'Esta aula já foi encerrada.',
      };
    }

    const student = await db.student.findFirst({
      where: {
        id: tokenMatch.studentId,
        academyId: academy.id,
      },
      select: {
        id: true,
        fullName: true,
        status: true,
      },
    });

    if (!student || student.status !== StudentStatus.ACTIVE) {
      await writeCheckInLog({
        academyId: academy.id,
        studentId: tokenMatch.studentId,
        classSessionId: session.id,
        tokenId: tokenMatch.tokenId,
        scannedByUserId: user.id,
        status: CheckInStatus.FAILED,
        failureReason: 'Aluno inativo ou não encontrado.',
      });

      return {
        success: false,
        message: 'Aluno inativo ou não encontrado.',
      };
    }

    const enrollment = await db.enrollment.findFirst({
      where: {
        classId: session.classId,
        studentId: student.id,
        status: 'ACTIVE',
      },
      select: {
        id: true,
      },
    });

    if (!enrollment) {
      await writeCheckInLog({
        academyId: academy.id,
        studentId: student.id,
        classSessionId: session.id,
        tokenId: tokenMatch.tokenId,
        scannedByUserId: user.id,
        status: CheckInStatus.FAILED,
        failureReason: 'Aluno não matriculado na turma.',
      });

      return {
        success: false,
        message: `${student.fullName} não está matriculado nesta turma.`,
        studentName: student.fullName,
      };
    }

    const settings = await db.academySettings.findFirst({
      where: {
        academyId: academy.id,
      },
      select: {
        allowQrCheckIn: true,
        checkInWindowMinutesBeforeClass: true,
        checkInWindowMinutesAfterClass: true,
      },
    });

    const checkInSettings = {
      allowQrCheckIn: settings?.allowQrCheckIn ?? true,
      checkInWindowMinutesBeforeClass:
        settings?.checkInWindowMinutesBeforeClass ?? 30,
      checkInWindowMinutesAfterClass:
        settings?.checkInWindowMinutesAfterClass ?? 30,
    };

    if (!checkInSettings.allowQrCheckIn) {
      await writeCheckInLog({
        academyId: academy.id,
        studentId: student.id,
        classSessionId: session.id,
        tokenId: tokenMatch.tokenId,
        scannedByUserId: user.id,
        status: CheckInStatus.FAILED,
        failureReason: 'Check-in por QR desabilitado.',
      });

      return {
        success: false,
        message: 'Check-in por QR Code está desabilitado na academia.',
        studentName: student.fullName,
      };
    }

    if (
      !isWithinCheckInWindow(
        {
          startsAt: session.startsAt,
          endsAt: session.endsAt,
        },
        checkInSettings,
      )
    ) {
      await writeCheckInLog({
        academyId: academy.id,
        studentId: student.id,
        classSessionId: session.id,
        tokenId: tokenMatch.tokenId,
        scannedByUserId: user.id,
        status: CheckInStatus.FAILED,
        failureReason: 'Fora da janela de check-in.',
      });

      return {
        success: false,
        message: 'Fora do horário permitido para check-in nesta aula.',
        studentName: student.fullName,
      };
    }

    const validation = await validateStudentCanReceiveAttendance(student.id, {
      blockDelinquent: true,
    });

    if (!validation.allowed) {
      await writeCheckInLog({
        academyId: academy.id,
        studentId: student.id,
        classSessionId: session.id,
        tokenId: tokenMatch.tokenId,
        scannedByUserId: user.id,
        status: CheckInStatus.FAILED,
        failureReason: validation.message,
      });

      return {
        success: false,
        message: validation.message,
        studentName: student.fullName,
      };
    }

    await recordSessionAttendance({
      sessionId: session.id,
      studentId: student.id,
      status: AttendanceStatus.PRESENT,
      source: AttendanceSource.QR_CODE,
      recordedByUserId: user.id,
      openSessionIfScheduled: true,
    });

    await db.studentQrToken.update({
      where: {
        id: tokenMatch.tokenId,
      },
      data: {
        lastUsedAt: new Date(),
      },
    });

    await writeCheckInLog({
      academyId: academy.id,
      studentId: student.id,
      classSessionId: session.id,
      tokenId: tokenMatch.tokenId,
      scannedByUserId: user.id,
      status: CheckInStatus.SUCCESS,
    });

    revalidateAttendancePaths(student.id);

    return {
      success: true,
      message: `Presença registrada para ${student.fullName} em ${session.class.name}.`,
      studentName: student.fullName,
    };
  } catch (error) {
    console.error('processQrCheckInAction error', error);

    return {
      success: false,
      message: 'Não foi possível registrar a presença via QR Code.',
    };
  }
}

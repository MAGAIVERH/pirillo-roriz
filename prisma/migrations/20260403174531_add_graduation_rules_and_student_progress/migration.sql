-- CreateEnum
CREATE TYPE "GraduationProgram" AS ENUM ('KIDS', 'ADULT');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('ON_TRACK', 'ELIGIBLE', 'POSTPONED');

-- CreateTable
CREATE TABLE "GraduationRule" (
    "id" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "program" "GraduationProgram" NOT NULL,
    "currentBeltId" TEXT NOT NULL,
    "currentDegreeId" TEXT,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "minimumMonths" INTEGER NOT NULL,
    "minimumAttendances" INTEGER NOT NULL,
    "nextBeltId" TEXT NOT NULL,
    "nextDegreeId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT DEFAULT 'GRACIE_BARRA_BASE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraduationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgress" (
    "id" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "program" "GraduationProgram" NOT NULL,
    "projectedEligibilityDate" TIMESTAMP(3),
    "status" "ProgressStatus" NOT NULL DEFAULT 'ON_TRACK',
    "attendancesSincePromotion" INTEGER NOT NULL DEFAULT 0,
    "absencesSincePromotion" INTEGER NOT NULL DEFAULT 0,
    "lastAttendanceAt" TIMESTAMP(3),
    "lastRecalculatedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GraduationRule_academyId_active_idx" ON "GraduationRule"("academyId", "active");

-- CreateIndex
CREATE INDEX "GraduationRule_academyId_program_idx" ON "GraduationRule"("academyId", "program");

-- CreateIndex
CREATE INDEX "GraduationRule_currentBeltId_currentDegreeId_idx" ON "GraduationRule"("currentBeltId", "currentDegreeId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProgress_studentId_key" ON "StudentProgress"("studentId");

-- CreateIndex
CREATE INDEX "StudentProgress_academyId_status_idx" ON "StudentProgress"("academyId", "status");

-- CreateIndex
CREATE INDEX "StudentProgress_academyId_program_idx" ON "StudentProgress"("academyId", "program");

-- AddForeignKey
ALTER TABLE "GraduationRule" ADD CONSTRAINT "GraduationRule_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationRule" ADD CONSTRAINT "GraduationRule_currentBeltId_fkey" FOREIGN KEY ("currentBeltId") REFERENCES "Belt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationRule" ADD CONSTRAINT "GraduationRule_currentDegreeId_fkey" FOREIGN KEY ("currentDegreeId") REFERENCES "BeltDegree"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationRule" ADD CONSTRAINT "GraduationRule_nextBeltId_fkey" FOREIGN KEY ("nextBeltId") REFERENCES "Belt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraduationRule" ADD CONSTRAINT "GraduationRule_nextDegreeId_fkey" FOREIGN KEY ("nextDegreeId") REFERENCES "BeltDegree"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

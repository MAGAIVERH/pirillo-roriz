-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "belt" TEXT,
ADD COLUMN     "beltDegree" INTEGER DEFAULT 0,
ADD COLUMN     "birthDate" TIMESTAMP(3);

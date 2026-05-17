-- CreateEnum
CREATE TYPE "ProductAudience" AS ENUM ('ALL', 'STUDENTS', 'INSTRUCTORS');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "instructorId" TEXT,
ALTER COLUMN "studentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "audience" "ProductAudience" NOT NULL DEFAULT 'ALL';

-- CreateIndex
CREATE INDEX "Order_instructorId_createdAt_idx" ON "Order"("instructorId", "createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

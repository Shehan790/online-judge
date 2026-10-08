/*
  Warnings:

  - The `status` column on the `Submission` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "memoryKb" INTEGER,
ADD COLUMN     "runtimeMs" INTEGER,
ADD COLUMN     "verdictMessage" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING';

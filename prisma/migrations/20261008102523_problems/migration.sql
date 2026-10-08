/*
  Warnings:

  - The `difficulty` column on the `Problem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[slug]` on the table `Problem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "memoryLimitMb" INTEGER NOT NULL DEFAULT 256,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "timeLimitMs" INTEGER NOT NULL DEFAULT 2000,
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'EASY';

-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "isSample" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");

/*
  Warnings:

  - You are about to drop the column `score` on the `UserOnEvaluation` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "StudentAnswerStatus" ADD VALUE 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "UserOnEvaluation" DROP COLUMN "score";

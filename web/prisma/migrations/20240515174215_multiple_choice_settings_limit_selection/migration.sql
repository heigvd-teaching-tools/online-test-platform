/*
  Warnings:

  - You are about to drop the column `allowStudentComment` on the `MultipleChoice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MultipleChoice" DROP COLUMN "allowStudentComment",
ADD COLUMN     "activateStudentComment" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "selectionLimit" DROP NOT NULL,
ALTER COLUMN "selectionLimit" SET DEFAULT 0;

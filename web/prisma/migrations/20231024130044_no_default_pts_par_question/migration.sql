/*
  Warnings:

  - You are about to drop the column `defaultPoints` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "defaultPoints",
ALTER COLUMN "content" DROP NOT NULL;

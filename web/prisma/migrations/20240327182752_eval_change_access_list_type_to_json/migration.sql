/*
  Warnings:

  - The `accessList` column on the `Evaluation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "accessList",
ADD COLUMN     "accessList" JSONB;

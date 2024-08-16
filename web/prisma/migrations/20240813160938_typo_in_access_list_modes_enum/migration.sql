/*
  Warnings:

  - The `accessMode` column on the `Evaluation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserOnEvaluationAccessMode" AS ENUM ('LINK_ONLY', 'LINK_AND_ACCESS_LIST');

-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "accessMode",
ADD COLUMN     "accessMode" "UserOnEvaluationAccessMode" NOT NULL DEFAULT 'LINK_ONLY';

-- DropEnum
DROP TYPE "UserOnEvaluatioAccessMode";

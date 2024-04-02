/*
  Warnings:

  - The values [LINK_AND_EMAIL_VERIFICATION] on the enum `UserOnEvaluatioAccessMode` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `allowedEmails` on the `Evaluation` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserOnEvaluatioAccessMode_new" AS ENUM ('LINK_ONLY', 'LINK_AND_ACCESS_LIST');
ALTER TABLE "Evaluation" ALTER COLUMN "accessMode" DROP DEFAULT;
ALTER TABLE "Evaluation" ALTER COLUMN "accessMode" TYPE "UserOnEvaluatioAccessMode_new" USING ("accessMode"::text::"UserOnEvaluatioAccessMode_new");
ALTER TYPE "UserOnEvaluatioAccessMode" RENAME TO "UserOnEvaluatioAccessMode_old";
ALTER TYPE "UserOnEvaluatioAccessMode_new" RENAME TO "UserOnEvaluatioAccessMode";
DROP TYPE "UserOnEvaluatioAccessMode_old";
ALTER TABLE "Evaluation" ALTER COLUMN "accessMode" SET DEFAULT 'LINK_ONLY';
COMMIT;

-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "allowedEmails",
ADD COLUMN     "accessList" TEXT[];

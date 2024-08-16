/*
  Warnings:

  - The values [LINK_AND_EMAIL_VERIFICATION] on the enum `UserOnEvaluationAccessMode` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `allowedEmails` on the `Evaluation` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserOnEvaluationAccessMode_new" AS ENUM ('LINK_ONLY', 'LINK_AND_ACCESS_LIST');
ALTER TABLE "Evaluation" ALTER COLUMN "accessMode" DROP DEFAULT;
ALTER TABLE "Evaluation" ALTER COLUMN "accessMode" TYPE "UserOnEvaluationAccessMode_new" USING ("accessMode"::text::"UserOnEvaluationAccessMode_new");
ALTER TYPE "UserOnEvaluationAccessMode" RENAME TO "UserOnEvaluationAccessMode_old";
ALTER TYPE "UserOnEvaluationAccessMode_new" RENAME TO "UserOnEvaluationAccessMode";
DROP TYPE "UserOnEvaluationAccessMode_old";
ALTER TABLE "Evaluation" ALTER COLUMN "accessMode" SET DEFAULT 'LINK_ONLY';
COMMIT;

-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "allowedEmails",
ADD COLUMN     "accessList" TEXT[];

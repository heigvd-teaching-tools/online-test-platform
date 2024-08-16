-- CreateEnum
CREATE TYPE "UserOnEvaluationAccessMode" AS ENUM ('LINK_ONLY', 'LINK_AND_EMAIL_VERIFICATION');

-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN     "accessMode" "UserOnEvaluationAccessMode" NOT NULL DEFAULT 'LINK_ONLY',
ADD COLUMN     "allowedEmails" TEXT[];

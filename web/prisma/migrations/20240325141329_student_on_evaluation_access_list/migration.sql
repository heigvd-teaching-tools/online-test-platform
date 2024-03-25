-- CreateEnum
CREATE TYPE "UserOnEvaluatioAccessMode" AS ENUM ('LINK_ONLY', 'LINK_AND_EMAIL_VERIFICATION');

-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN     "accessMode" "UserOnEvaluatioAccessMode" NOT NULL DEFAULT 'LINK_ONLY',
ADD COLUMN     "allowedEmails" TEXT[];

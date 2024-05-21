-- CreateEnum
CREATE TYPE "MultipleChoiceGradingPolicyType" AS ENUM ('ALL_OR_NOTHING', 'GRADUAL_CREDIT');

-- AlterTable
ALTER TABLE "MultipleChoice" ADD COLUMN     "activateSelectionLimit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowStudentComment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gradingPolicy" "MultipleChoiceGradingPolicyType" NOT NULL DEFAULT 'ALL_OR_NOTHING',
ADD COLUMN     "selectionLimit" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "studentCommentLabel" TEXT;

-- CreateTable
CREATE TABLE "MultipleChoiceGradualCreditConfig" (
    "questionId" TEXT NOT NULL,
    "negativeMarking" BOOLEAN NOT NULL DEFAULT false,
    "threshold" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "MultipleChoiceGradualCreditConfig_questionId_key" ON "MultipleChoiceGradualCreditConfig"("questionId");

-- AddForeignKey
ALTER TABLE "MultipleChoiceGradualCreditConfig" ADD CONSTRAINT "MultipleChoiceGradualCreditConfig_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MultipleChoice"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

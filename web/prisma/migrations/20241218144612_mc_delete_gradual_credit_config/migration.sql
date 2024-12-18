/*
  Warnings:

  - You are about to drop the `MultipleChoiceGradualCreditConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MultipleChoiceGradualCreditConfig" DROP CONSTRAINT "MultipleChoiceGradualCreditConfig_questionId_fkey";

-- DropTable
DROP TABLE "MultipleChoiceGradualCreditConfig";

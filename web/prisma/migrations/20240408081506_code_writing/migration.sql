-- CreateEnum
CREATE TYPE "CodeQuestionType" AS ENUM ('CODE_WRITING', 'CODE_READING');

-- DropForeignKey
ALTER TABLE "CodeToSolutionFile" DROP CONSTRAINT "CodeToSolutionFile_questionId_fkey";

-- DropForeignKey
ALTER TABLE "CodeToTemplateFile" DROP CONSTRAINT "CodeToTemplateFile_questionId_fkey";

-- DropForeignKey
ALTER TABLE "TestCase" DROP CONSTRAINT "TestCase_questionId_fkey";

-- AlterTable
ALTER TABLE "Code" ADD COLUMN     "codeType" "CodeQuestionType" NOT NULL DEFAULT 'CODE_WRITING';

-- CreateTable
CREATE TABLE "CodeWriting" (
    "questionId" TEXT NOT NULL,

    CONSTRAINT "CodeWriting_pkey" PRIMARY KEY ("questionId")
);

-- Populate CodeWriting from existing Code entries.
INSERT INTO "CodeWriting" ("questionId")
SELECT "questionId" FROM "Code";


-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CodeWriting"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeWriting" ADD CONSTRAINT "CodeWriting_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Code"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeToSolutionFile" ADD CONSTRAINT "CodeToSolutionFile_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CodeWriting"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeToTemplateFile" ADD CONSTRAINT "CodeToTemplateFile_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CodeWriting"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;

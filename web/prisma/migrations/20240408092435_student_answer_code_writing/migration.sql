-- Step 1: Create the new table without dropping data yet
ALTER TABLE "StudentAnswerCode"
ADD COLUMN "codeType" "CodeQuestionType" NOT NULL DEFAULT 'CODE_WRITING';

CREATE TABLE "StudentAnswerCodeWriting" (
    "userEmail" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "allTestCasesPassed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "StudentAnswerCodeWriting_pkey" PRIMARY KEY ("userEmail", "questionId")
);

-- Step 2: Migrate existing data to StudentAnswerCodeWriting
INSERT INTO "StudentAnswerCodeWriting" ("userEmail", "questionId", "allTestCasesPassed")
SELECT "userEmail", "questionId", "allTestCasesPassed" FROM "StudentAnswerCode";

-- Now proceed with the rest of the auto-generated changes
-- Drop old foreign keys
ALTER TABLE "StudentAnswerCodeToFile" DROP CONSTRAINT "StudentAnswerCodeToFile_userEmail_questionId_fkey";
ALTER TABLE "TestCaseResult" DROP CONSTRAINT "TestCaseResult_userEmail_questionId_fkey";

-- Drop the now-migrated column
ALTER TABLE "StudentAnswerCode" DROP COLUMN "allTestCasesPassed";

-- Re-establish foreign keys
ALTER TABLE "StudentAnswerCodeWriting" ADD CONSTRAINT "StudentAnswerCodeWriting_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswerCode"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudentAnswerCodeToFile" ADD CONSTRAINT "StudentAnswerCodeToFile_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswerCodeWriting"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TestCaseResult" ADD CONSTRAINT "TestCaseResult_userEmail_questionId_fkey" FOREIGN KEY ("userEmail", "questionId") REFERENCES "StudentAnswerCodeWriting"("userEmail", "questionId") ON DELETE CASCADE ON UPDATE CASCADE;
